import { DraftTransaction, GstSlab, Party, SKU, Transaction } from '@/types/accounting';
import { computeDashboardKPIs, verifyDraftMath } from './gstEngine';
import { formatINR } from './formatters';

export interface ParseResult {
  isBusinessQuery: boolean;
  queryAnswer?: string;
  draft?: DraftTransaction;
  assistantMessage: string;
}

/**
 * Intelligent parser for Indian MSME natural language queries & transaction entries
 */
export function parseUserMessage(
  input: string,
  parties: Party[],
  skus: SKU[],
  transactions: Transaction[],
  source: 'Chat' | 'Voice' | 'Bill OCR' | 'Supplier PDF' | 'Daily Cart' = 'Chat',
  attachmentInfo?: { name: string; type: 'image' | 'pdf' | 'audio' }
): ParseResult {
  const clean = input.trim();
  const lower = clean.toLowerCase();

  // --- 1. CHECK FOR BUSINESS Q&A QUERIES FIRST ---

  // Sales / Profit / Margin query
  if (
    lower.includes('sales') ||
    lower.includes('profit') ||
    lower.includes('margin') ||
    lower.includes('munafa') ||
    lower.includes('bikri') ||
    lower.includes('turnover') ||
    lower.includes('kamayi')
  ) {
    const kpis = computeDashboardKPIs(transactions, skus);
    const text = `📊 **Sales & Profit Summary**\n\n` +
      `• **Total Sales Turnover:** ${formatINR(kpis.totalSales)}\n` +
      `• **Gross Profit:** ${formatINR(kpis.grossProfit)} *(Estimated Margin: ${kpis.grossMarginPercent.toFixed(1)}%)*\n` +
      `• **Total Purchases:** ${formatINR(kpis.totalPurchases)}\n` +
      `• **Operating Expenses:** ${formatINR(kpis.totalExpenses)}\n\n` +
      `*All figures are computed live from your ${transactions.length} recorded vouchers in the Daybook.*`;
    return {
      isBusinessQuery: true,
      queryAnswer: text,
      assistantMessage: text
    };
  }

  // GST / Tax liability query
  if (
    lower.includes('gst') ||
    lower.includes('tax') ||
    lower.includes('itc') ||
    lower.includes('input tax') ||
    lower.includes('liability') ||
    lower.includes('gstr')
  ) {
    const kpis = computeDashboardKPIs(transactions, skus);
    const text = `🏛️ **GST Liability & ITC Breakdown (GSTR-3B)**\n\n` +
      `• **Output GST (on Sales):** ${formatINR(kpis.outputGst.total)}\n` +
      `  - CGST (9%/14%): ${formatINR(kpis.outputGst.cgst)}\n` +
      `  - SGST (9%/14%): ${formatINR(kpis.outputGst.sgst)}\n` +
      `  - IGST (Interstate): ${formatINR(kpis.outputGst.igst)}\n\n` +
      `• **Eligible Input Tax Credit (ITC on Purchases):** ${formatINR(kpis.itc.total)}\n` +
      `  - CGST ITC: ${formatINR(kpis.itc.cgst)}\n` +
      `  - SGST ITC: ${formatINR(kpis.itc.sgst)}\n` +
      `  - IGST ITC: ${formatINR(kpis.itc.igst)}\n\n` +
      `💰 **Net GST Payable to Govt:** **${formatINR(kpis.netGstPayable)}**\n` +
      (kpis.itcBalanceRemaining > 0 ? `*(Remaining ITC carried forward: ${formatINR(kpis.itcBalanceRemaining)})*` : '');
    return {
      isBusinessQuery: true,
      queryAnswer: text,
      assistantMessage: text
    };
  }

  // Udhaar / Pending balance query
  if (
    lower.includes('udhaar') ||
    lower.includes('pending') ||
    lower.includes('khata') ||
    lower.includes('baaki') ||
    lower.includes('lene') ||
    lower.includes('dene') ||
    lower.includes('receivable') ||
    lower.includes('payable')
  ) {
    let totalReceivable = 0;
    let totalPayable = 0;
    const receivablesList: string[] = [];
    const payablesList: string[] = [];

    parties.forEach(p => {
      if (p.balance > 0) {
        totalReceivable += p.balance;
        receivablesList.push(`• **${p.name}:** ${formatINR(p.balance)} *(${p.phone})*`);
      } else if (p.balance < 0) {
        totalPayable += Math.abs(p.balance);
        payablesList.push(`• **${p.name}:** ${formatINR(Math.abs(p.balance))} *(${p.state})*`);
      }
    });

    const text = `🤝 **Pending Udhaar & Party Ledger Summary**\n\n` +
      `📥 **Total Lene Hain (Receivable):** **${formatINR(totalReceivable)}**\n` +
      (receivablesList.length > 0 ? receivablesList.join('\n') : '• No pending receivables.') +
      `\n\n📤 **Total Dene Hain (Payable):** **${formatINR(totalPayable)}**\n` +
      (payablesList.length > 0 ? payablesList.join('\n') : '• No pending payables.') +
      `\n\n*Tip: You can generate automated WhatsApp payment reminders from the "Parties" tab.*`;
    return {
      isBusinessQuery: true,
      queryAnswer: text,
      assistantMessage: text
    };
  }

  // Stock / Inventory query
  if (
    lower.includes('stock') ||
    lower.includes('reorder') ||
    lower.includes('inventory') ||
    lower.includes('maal') ||
    lower.includes('khatam') ||
    lower.includes('kam hai')
  ) {
    const lowStockItems = skus.filter(s => s.currentStock <= s.minReorderLevel);
    let text = `📦 **Inventory & Stock Health Report**\n\n`;
    if (lowStockItems.length > 0) {
      text += `⚠️ **${lowStockItems.length} items below minimum reorder level:**\n` +
        lowStockItems.map(s => `• **${s.name}:** Current: ${s.currentStock} ${s.unit} (Min Reorder: ${s.minReorderLevel} ${s.unit})`).join('\n') +
        `\n\n*Would you like to draft a purchase order to replenish stock?*`;
    } else {
      text += `✅ All items are currently above their safety stock levels. Total SKUs: ${skus.length}.`;
    }
    return {
      isBusinessQuery: true,
      queryAnswer: text,
      assistantMessage: text
    };
  }

  // --- 2. TRANSACTION PARSING & DRAFT GENERATION ---
  
  // Determine transaction type
  let type: 'Sale' | 'Purchase' | 'Expense' | 'Payment' = 'Sale';
  if (lower.includes('purchase') || lower.includes('kharid') || lower.includes('mangaaya') || lower.includes('vendor bill') || lower.includes('supplier')) {
    type = 'Purchase';
  } else if (lower.includes('kharcha') || lower.includes('expense') || lower.includes('diesel') || lower.includes('petrol') || lower.includes('bijli') || lower.includes('electricity') || lower.includes('chai')) {
    type = 'Expense';
  } else if (lower.includes('payment mila') || lower.includes('payment diya') || lower.includes('jama kiya') || lower.includes('received payment')) {
    type = 'Payment';
  } else {
    type = 'Sale'; // Default to Sale
  }

  // Match Party
  let matchedParty = parties.find(p => lower.includes(p.name.toLowerCase()));
  if (!matchedParty) {
    if (lower.includes('ramesh')) matchedParty = parties.find(p => p.id === 'party-ramesh-01');
    else if (lower.includes('patel')) matchedParty = parties.find(p => p.id === 'party-patel-02');
    else if (lower.includes('krupa')) matchedParty = parties.find(p => p.id === 'party-krupa-03');
    else if (lower.includes('ultratech') || lower.includes('ultra')) matchedParty = parties.find(p => p.id === 'party-ultratech-04');
    else if (lower.includes('rajasthan') || lower.includes('jaipur')) matchedParty = parties.find(p => p.id === 'party-rajasthan-05');
  }

  // Fallback party
  const defaultParty = matchedParty || {
    id: `party-custom-${Date.now()}`,
    name: extractPartyNameFromText(clean) || (type === 'Sale' ? 'Counter Cash Customer' : 'Local Vendor'),
    state: 'Gujarat',
    stateCode: '24',
    gstin: type === 'Sale' ? '' : '24AAACU0147B1ZT',
    phone: '+91 98000 00000',
    type: type === 'Sale' ? 'Customer' : 'Vendor',
    balance: 0,
    address: 'Ahmedabad, Gujarat',
    city: 'Ahmedabad'
  };

  // Determine Payment Mode
  let paymentMode: 'UPI' | 'Cash' | 'Bank Transfer' | 'Udhaar' = 'Cash';
  if (lower.includes('upi') || lower.includes('gpay') || lower.includes('phonepe') || lower.includes('paytm')) {
    paymentMode = 'UPI';
  } else if (lower.includes('udhaar') || lower.includes('credit') || lower.includes('khata') || lower.includes('baaki')) {
    paymentMode = 'Udhaar';
  } else if (lower.includes('bank') || lower.includes('neft') || lower.includes('rtgs') || lower.includes('cheque') || lower.includes('transfer')) {
    paymentMode = 'Bank Transfer';
  } else if (lower.includes('cash') || lower.includes('rokad') || lower.includes('nakad')) {
    paymentMode = 'Cash';
  } else {
    paymentMode = type === 'Expense' ? 'Cash' : (type === 'Sale' ? 'UPI' : 'Bank Transfer');
  }

  // Extract items
  const draftItems: Array<{
    id: string;
    skuId?: string;
    description: string;
    hsn: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    gstRate: GstSlab;
  }> = [];

  // Match SKUs against text
  for (const sku of skus) {
    const skuKeywords = getSkuKeywords(sku);
    const matched = skuKeywords.some(kw => lower.includes(kw));

    if (matched) {
      // Extract quantity near keyword
      const qty = extractQuantity(lower, skuKeywords) || 1;
      const rate = extractRate(lower, skuKeywords) || (type === 'Purchase' ? sku.purchasePrice : sku.sellingPrice);

      draftItems.push({
        id: `draft-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        skuId: sku.id,
        description: sku.name,
        hsn: sku.hsn,
        quantity: qty,
        unit: sku.unit,
        unitPrice: rate,
        gstRate: sku.gstRate
      });
    }
  }

  // Fallback if no specific SKU was detected
  if (draftItems.length === 0) {
    // Attempt generic parse (e.g. for expenses or unlisted items)
    const amountMatch = clean.match(/(\d+(?:\.\d+)?)/);
    const detectedAmount = amountMatch ? parseFloat(amountMatch[1]) : 1000;
    
    if (type === 'Expense') {
      draftItems.push({
        id: `draft-item-${Date.now()}-exp`,
        description: clean.length > 40 ? 'General Business & Operational Expense' : clean,
        hsn: '996511',
        quantity: 1,
        unit: 'Trip/Service',
        unitPrice: detectedAmount > 50 ? detectedAmount : 3450,
        gstRate: 18
      });
    } else {
      // Default sample item
      draftItems.push({
        id: `draft-item-${Date.now()}-default`,
        skuId: 'sku-cement-01',
        description: 'UltraTech Super Cement (50kg Bag)',
        hsn: '252329',
        quantity: 12,
        unit: 'Bags',
        unitPrice: 420,
        gstRate: 28
      });
    }
  }

  // Run math verification
  const verification = verifyDraftMath(draftItems, defaultParty.stateCode);

  const draft: DraftTransaction = {
    id: `draft-${Date.now()}`,
    type,
    partyId: defaultParty.id,
    partyName: defaultParty.name,
    partyGstin: defaultParty.gstin,
    partyPhone: defaultParty.phone,
    partyState: defaultParty.state,
    partyStateCode: defaultParty.stateCode,
    items: draftItems,
    paymentMode,
    notes: clean,
    source,
    warnings: verification.messages,
    rawTranscript: clean,
    attachmentName: attachmentInfo?.name,
    attachmentType: attachmentInfo?.type
  };

  const intro = `I parsed your ${source === 'Voice' ? 'voice note' : source === 'Bill OCR' ? 'handwritten bill' : source === 'Supplier PDF' ? 'supplier invoice' : source === 'Daily Cart' ? 'daily sales cart' : 'request'}. ` +
    `Per your accounting rules, this entry **will not be recorded** until you review and approve it below.`;

  return {
    isBusinessQuery: false,
    draft,
    assistantMessage: intro
  };
}

// Helpers
function getSkuKeywords(sku: SKU): string[] {
  const kws = [sku.name.toLowerCase()];
  if (sku.name.toLowerCase().includes('cement')) kws.push('cement', 'ultratech');
  if (sku.name.toLowerCase().includes('tmt') || sku.name.toLowerCase().includes('rebar')) kws.push('tmt', 'saria', 'rebars', 'steel');
  if (sku.name.toLowerCase().includes('cpvc') || sku.name.toLowerCase().includes('pipe')) kws.push('cpvc', 'pipes', 'pipe');
  if (sku.name.toLowerCase().includes('paint')) kws.push('paint', 'asian paints', 'apex');
  if (sku.name.toLowerCase().includes('lock')) kws.push('lock', 'godrej lock', 'mortise');
  if (sku.name.toLowerCase().includes('bib cock')) kws.push('cock', 'tap', 'bib cock', 'jaquar');
  if (sku.name.toLowerCase().includes('sand')) kws.push('sand', 'reti', 'river sand');
  if (sku.name.toLowerCase().includes('brick')) kws.push('brick', 'eent', 'bricks');
  return kws;
}

function extractQuantity(text: string, keywords: string[]): number | null {
  for (const kw of keywords) {
    // Pattern: "12 bags cement" or "500 kg tmt" or "20 pipes"
    const regexBefore = new RegExp(`(\\d+)\\s*(?:bags|bag|kg|kgs|pcs|pc|pipes|buckets|tons|ton|bori)?\\s*${kw}`);
    const matchBefore = text.match(regexBefore);
    if (matchBefore && matchBefore[1]) return parseInt(matchBefore[1], 10);

    // Pattern: "cement 12 bags" or "saria 500 kg"
    const regexAfter = new RegExp(`${kw}\\s*(\\d+)`);
    const matchAfter = text.match(regexAfter);
    if (matchAfter && matchAfter[1]) return parseInt(matchAfter[1], 10);
  }
  return null;
}

function extractRate(text: string, keywords: string[]): number | null {
  // Pattern: "420 ke rate se" or "@ 74" or "rate 420" or "bhav 340"
  const rateMatch = text.match(/(?:@|rate|bhav|ke bhav se|ke rate se)\s*[:=]?\s*(\d+(?:\.\d+)?)/);
  if (rateMatch && rateMatch[1]) return parseFloat(rateMatch[1]);
  return null;
}

function extractPartyNameFromText(text: string): string | null {
  const match = text.match(/([A-Z][a-zA-Z0-9\s&]+?)(?:\s+ko|\s+se|\s+ne|\s+account)/);
  if (match && match[1]) {
    const trimmed = match[1].trim();
    if (trimmed.length > 2 && !['Aj', 'Aaj', 'Maine', 'Hamne'].includes(trimmed)) {
      return trimmed;
    }
  }
  return null;
}
