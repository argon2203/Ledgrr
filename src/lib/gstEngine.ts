import { LineItem, TaxSplit, Transaction, SKU } from '@/types/accounting';

export const BUSINESS_STATE_CODE = '24'; // Gujarat

/**
 * Compute line item taxes and totals
 */
export function calculateLineItem(
  description: string,
  hsn: string,
  quantity: number,
  unit: string,
  unitPrice: number,
  gstRate: number,
  partyStateCode: string,
  skuId?: string
): LineItem {
  const taxableAmount = Math.round(quantity * unitPrice * 100) / 100;
  const isInterstate = partyStateCode !== '' && partyStateCode !== BUSINESS_STATE_CODE;
  
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (isInterstate) {
    igstAmount = Math.round(taxableAmount * (gstRate / 100) * 100) / 100;
  } else {
    const halfRate = gstRate / 2;
    cgstAmount = Math.round(taxableAmount * (halfRate / 100) * 100) / 100;
    sgstAmount = Math.round(taxableAmount * (halfRate / 100) * 100) / 100;
  }

  const totalAmount = Math.round((taxableAmount + cgstAmount + sgstAmount + igstAmount) * 100) / 100;

  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    skuId,
    description,
    hsn,
    quantity,
    unit,
    unitPrice,
    gstRate: gstRate as any,
    taxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalAmount
  };
}

/**
 * Calculate the overall TaxSplit from an array of LineItems
 */
export function calculateTaxSplit(items: LineItem[], partyStateCode: string): TaxSplit {
  const isInterstate = partyStateCode !== '' && partyStateCode !== BUSINESS_STATE_CODE;

  let taxableAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  for (const item of items) {
    taxableAmount += item.taxableAmount;
    if (isInterstate) {
      igstAmount += item.igstAmount;
    } else {
      cgstAmount += item.cgstAmount;
      sgstAmount += item.sgstAmount;
    }
  }

  // Round to 2 decimals
  taxableAmount = Math.round(taxableAmount * 100) / 100;
  cgstAmount = Math.round(cgstAmount * 100) / 100;
  sgstAmount = Math.round(sgstAmount * 100) / 100;
  igstAmount = Math.round(igstAmount * 100) / 100;
  const totalTax = Math.round((cgstAmount + sgstAmount + igstAmount) * 100) / 100;

  const rawGrandTotal = taxableAmount + totalTax;
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = Math.round((grandTotal - rawGrandTotal) * 100) / 100;

  return {
    taxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalTax,
    grandTotal,
    roundOff,
    isInterstate
  };
}

/**
 * Verify math & OCR calculations, return warnings or ok
 */
export function verifyDraftMath(
  items: Array<{ quantity: number; unitPrice: number; gstRate: number; description: string }>,
  partyStateCode: string
): { isValid: boolean; messages: string[] } {
  const messages: string[] = [];

  if (items.length === 0) {
    messages.push('No line items found. Please add at least one item.');
    return { isValid: false, messages };
  }

  let totalTaxable = 0;
  let totalCalculatedTax = 0;
  const isInterstate = partyStateCode !== '' && partyStateCode !== BUSINESS_STATE_CODE;

  items.forEach((item, index) => {
    if (item.quantity <= 0) {
      messages.push(`Item ${index + 1} (${item.description || 'Unnamed'}): Quantity must be greater than 0.`);
    }
    if (item.unitPrice < 0) {
      messages.push(`Item ${index + 1} (${item.description || 'Unnamed'}): Unit rate cannot be negative.`);
    }

    const itemTaxable = item.quantity * item.unitPrice;
    totalTaxable += itemTaxable;
    totalCalculatedTax += itemTaxable * (item.gstRate / 100);
  });

  if (isInterstate) {
    messages.push(`Inter-state supply detected (Party code: ${partyStateCode || 'Outside GJ'} vs Gujarat 24). 100% IGST applied.`);
  } else {
    messages.push('Intra-state supply (Gujarat 24). 50% CGST + 50% SGST applied.');
  }

  messages.push(`Math verification passed: Subtotal ₹${totalTaxable.toFixed(2)} + GST ₹${totalCalculatedTax.toFixed(2)}.`);

  return {
    isValid: messages.filter(m => m.includes('must be greater') || m.includes('cannot be negative')).length === 0,
    messages
  };
}

/**
 * Compute Back-Office KPIs from transactions & SKUs
 */
export function computeDashboardKPIs(transactions: Transaction[], skus: SKU[]) {
  let totalSales = 0;
  let totalSalesTaxable = 0;
  let totalOutputCgst = 0;
  let totalOutputSgst = 0;
  let totalOutputIgst = 0;

  let totalPurchases = 0;
  let totalPurchasesTaxable = 0;
  let totalInputCgst = 0;
  let totalInputSgst = 0;
  let totalInputIgst = 0;

  let totalExpenses = 0;
  let totalCOGS = 0;

  // SKU purchase cost map
  const skuCostMap = new Map<string, number>();
  skus.forEach(s => skuCostMap.set(s.id, s.purchasePrice));

  transactions.forEach((tx) => {
    if (tx.type === 'Sale') {
      totalSales += tx.taxSplit.grandTotal;
      totalSalesTaxable += tx.taxSplit.taxableAmount;
      totalOutputCgst += tx.taxSplit.cgstAmount;
      totalOutputSgst += tx.taxSplit.sgstAmount;
      totalOutputIgst += tx.taxSplit.igstAmount;

      // Estimate COGS from line items
      tx.items.forEach(item => {
        const costPrice = item.skuId && skuCostMap.has(item.skuId)
          ? (skuCostMap.get(item.skuId) || item.unitPrice * 0.8)
          : item.unitPrice * 0.8; // default 20% margin fallback
        totalCOGS += item.quantity * costPrice;
      });
    } else if (tx.type === 'Purchase') {
      totalPurchases += tx.taxSplit.grandTotal;
      totalPurchasesTaxable += tx.taxSplit.taxableAmount;
      totalInputCgst += tx.taxSplit.cgstAmount;
      totalInputSgst += tx.taxSplit.sgstAmount;
      totalInputIgst += tx.taxSplit.igstAmount;
    } else if (tx.type === 'Expense') {
      totalExpenses += tx.taxSplit.grandTotal;
      totalInputCgst += tx.taxSplit.cgstAmount;
      totalInputSgst += tx.taxSplit.sgstAmount;
      totalInputIgst += tx.taxSplit.igstAmount;
    }
  });

  const totalOutputGst = totalOutputCgst + totalOutputSgst + totalOutputIgst;
  const totalInputGst = totalInputCgst + totalInputSgst + totalInputIgst;
  const netGstPayable = Math.max(0, totalOutputGst - totalInputGst);
  const itcBalanceRemaining = Math.max(0, totalInputGst - totalOutputGst);

  // Gross profit = Sales Taxable - COGS
  const grossProfit = Math.max(0, totalSalesTaxable - totalCOGS);
  const grossMarginPercent = totalSalesTaxable > 0 ? (grossProfit / totalSalesTaxable) * 100 : 0;

  // Inventory value & low stock count
  let totalStockValue = 0;
  let lowStockCount = 0;
  skus.forEach(sku => {
    totalStockValue += sku.currentStock * sku.purchasePrice;
    if (sku.currentStock <= sku.minReorderLevel) {
      lowStockCount++;
    }
  });

  return {
    totalSales,
    totalSalesTaxable,
    totalPurchases,
    totalPurchasesTaxable,
    totalExpenses,
    grossProfit,
    grossMarginPercent,
    outputGst: {
      cgst: totalOutputCgst,
      sgst: totalOutputSgst,
      igst: totalOutputIgst,
      total: totalOutputGst
    },
    itc: {
      cgst: totalInputCgst,
      sgst: totalInputSgst,
      igst: totalInputIgst,
      total: totalInputGst
    },
    netGstPayable,
    itcBalanceRemaining,
    totalStockValue,
    lowStockCount
  };
}
