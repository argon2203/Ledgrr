export type TransactionType = 'Sale' | 'Purchase' | 'Expense' | 'Payment';

export type PaymentMode = 'UPI' | 'Cash' | 'Bank Transfer' | 'Udhaar' | 'Card';

export type PaymentStatus = 'Paid' | 'Pending' | 'Partial';

export type GstSlab = 0 | 5 | 12 | 18 | 28;

export interface LineItem {
  id: string;
  skuId?: string;
  description: string;
  hsn: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  gstRate: GstSlab;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface TaxSplit {
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  grandTotal: number;
  roundOff: number;
  isInterstate: boolean;
}

export interface Transaction {
  id: string;
  invoiceNo: string;
  date: string; // ISO date string YYYY-MM-DD
  time: string;
  type: TransactionType;
  partyId: string;
  partyName: string;
  partyGstin?: string;
  partyPhone?: string;
  partyState: string;
  partyStateCode: string;
  placeOfSupply: string;
  items: LineItem[];
  taxSplit: TaxSplit;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  notes?: string;
  source: 'Chat' | 'Manual' | 'Voice' | 'Bill OCR' | 'Supplier PDF' | 'Daily Cart';
  createdAt: string;
}

export interface SKU {
  id: string;
  name: string;
  category: string;
  hsn: string;
  unit: string; // Bags, Pcs, Kg, Bundles, Tons, Buckets
  purchasePrice: number;
  sellingPrice: number;
  gstRate: GstSlab;
  currentStock: number;
  minReorderLevel: number;
  location?: string;
}

export interface Party {
  id: string;
  name: string;
  tradeName?: string;
  type: 'Customer' | 'Vendor' | 'Both';
  phone: string;
  email?: string;
  gstin?: string;
  pan?: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  balance: number; // Positive = Receivable (Lene hain), Negative = Payable (Dene hain)
  creditLimit?: number;
}

export interface BusinessProfile {
  name: string;
  tradeName: string;
  tagline: string;
  gstin: string;
  pan: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  branch: string;
  upiId: string;
  gstScheme?: 'Regular' | 'Composition';
  filingCycle?: 'Monthly (GSTR-1/3B)' | 'Quarterly (QRMP)';
  ownerName?: string;
}

export interface CartItem {
  id: string;
  skuId: string;
  name: string;
  hsn: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  gstRate: GstSlab;
}

export interface AiInsight {
  id: string;
  title: string;
  category: 'tax_audit' | 'cash_flow' | 'margin' | 'inventory_aging';
  severity: 'info' | 'warning' | 'success';
  description: string;
  actionLabel?: string;
  actionPrompt?: string;
  metric?: string;
}

export interface DraftTransaction {
  id: string;
  type: TransactionType;
  partyId: string;
  partyName: string;
  partyGstin?: string;
  partyPhone?: string;
  partyState: string;
  partyStateCode: string;
  items: Array<{
    id: string;
    skuId?: string;
    description: string;
    hsn: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    gstRate: GstSlab;
  }>;
  paymentMode: PaymentMode;
  notes?: string;
  source: 'Chat' | 'Voice' | 'Bill OCR' | 'Supplier PDF' | 'Daily Cart';
  warnings: string[];
  rawTranscript?: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'pdf' | 'audio';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  text: string;
  audioUrl?: string;
  audioDuration?: string;
  attachment?: {
    name: string;
    type: 'image' | 'pdf' | 'audio';
    previewUrl?: string;
    size?: string;
  };
  draft?: DraftTransaction;
  status?: 'pending_approval' | 'approved' | 'discarded';
  approvedTransactionId?: string;
  approvedInvoiceNo?: string;
}
