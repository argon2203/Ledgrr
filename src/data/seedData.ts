import { BusinessProfile, Party, SKU, Transaction } from '@/types/accounting';
import { calculateLineItem, calculateTaxSplit } from '@/lib/gstEngine';

export const SEED_BUSINESS_PROFILE: BusinessProfile = {
  name: 'Shree Ambica Building Materials & Hardware',
  tradeName: 'Shree Ambica Hardware & Sanitary Mart',
  tagline: 'Wholesale & Retail Building Supplies, TMT Steel, Cement & CPVC Fittings',
  gstin: '24AABCS1429B1Z2',
  pan: 'AABCS1429B',
  phone: '+91 98250 84721',
  email: 'billing@ambicahardware.in',
  address: 'Shed No. 42-45, Phase-2 GIDC Industrial Area, Odhav Ring Road',
  city: 'Ahmedabad',
  state: 'Gujarat',
  stateCode: '24',
  pincode: '382415',
  bankName: 'State Bank of India',
  accountNo: '38472910482',
  ifscCode: 'SBIN0001248',
  branch: 'Odhav Industrial Branch, Ahmedabad',
  upiId: 'ambicahardware@oksbi'
};

export const SEED_SKUS: SKU[] = [
  {
    id: 'sku-cement-01',
    name: 'UltraTech Super Cement (50kg Bag)',
    category: 'Cement & Binding',
    hsn: '252329',
    unit: 'Bags',
    purchasePrice: 340,
    sellingPrice: 420,
    gstRate: 28,
    currentStock: 140,
    minReorderLevel: 50,
    location: 'Godown Bay-A'
  },
  {
    id: 'sku-tmt-02',
    name: 'Tata Tiscon 500D TMT Rebars 12mm',
    category: 'Steel & Metals',
    hsn: '721420',
    unit: 'Kg',
    purchasePrice: 62,
    sellingPrice: 74,
    gstRate: 18,
    currentStock: 1250,
    minReorderLevel: 300,
    location: 'Open Yard Rack-1'
  },
  {
    id: 'sku-cpvc-03',
    name: 'Supreme CPVC Pipe 1 inch (3m length)',
    category: 'Plumbing & Pipes',
    hsn: '391723',
    unit: 'Pcs',
    purchasePrice: 185,
    sellingPrice: 240,
    gstRate: 18,
    currentStock: 42,
    minReorderLevel: 50, // ⚠️ LOW STOCK
    location: 'Plumbing Racks B3'
  },
  {
    id: 'sku-paint-04',
    name: 'Asian Paints Apex WeatherProof (20L Bucket)',
    category: 'Paints & Coatings',
    hsn: '320890',
    unit: 'Buckets',
    purchasePrice: 3850,
    sellingPrice: 4650,
    gstRate: 18,
    currentStock: 8,
    minReorderLevel: 10, // ⚠️ LOW STOCK
    location: 'Paint Depot Shelf-2'
  },
  {
    id: 'sku-lock-05',
    name: 'Godrej Brass Mortise Lock 6-Lever',
    category: 'Hardware & Fittings',
    hsn: '830140',
    unit: 'Pcs',
    purchasePrice: 780,
    sellingPrice: 1150,
    gstRate: 18,
    currentStock: 28,
    minReorderLevel: 15,
    location: 'Front Glass Showcase'
  },
  {
    id: 'sku-cock-06',
    name: 'Jaquar Continental Brass Bib Cock',
    category: 'Sanitaryware',
    hsn: '848180',
    unit: 'Pcs',
    purchasePrice: 610,
    sellingPrice: 850,
    gstRate: 18,
    currentStock: 35,
    minReorderLevel: 20,
    location: 'Sanitary Display Shelf'
  },
  {
    id: 'sku-sand-07',
    name: 'Washed River Sand (Fine Grade)',
    category: 'Aggregates',
    hsn: '250510',
    unit: 'Tons',
    purchasePrice: 2100,
    sellingPrice: 2700,
    gstRate: 5,
    currentStock: 18,
    minReorderLevel: 5,
    location: 'Yard Bunker 2'
  },
  {
    id: 'sku-brick-08',
    name: 'Red Clay Kiln Bricks (Class-1)',
    category: 'Masonry',
    hsn: '690100',
    unit: 'Pcs',
    purchasePrice: 7.5,
    sellingPrice: 9.5,
    gstRate: 12,
    currentStock: 4800,
    minReorderLevel: 1000,
    location: 'Outdoor Depot Lot'
  }
];

export const SEED_PARTIES: Party[] = [
  {
    id: 'party-ramesh-01',
    name: 'Ramesh Traders',
    tradeName: 'Ramesh Building Contractors',
    type: 'Customer',
    phone: '+91 98980 11223',
    email: 'ramesh.traders.ahmedabad@gmail.com',
    gstin: '24AAACR1234F1Z8',
    pan: 'AAACR1234F',
    address: '14, Shanti Commercial Center, Naroda',
    city: 'Ahmedabad',
    state: 'Gujarat',
    stateCode: '24',
    balance: 42500, // Receivable
    creditLimit: 100000
  },
  {
    id: 'party-patel-02',
    name: 'Patel & Sons Infrastructure',
    tradeName: 'Patel Infra Projects LLP',
    type: 'Customer',
    phone: '+91 94260 44556',
    email: 'accounts@patelinfra.in',
    gstin: '24BBBP8765K1Z3',
    pan: 'BBBP8765K',
    address: 'Plot 108, Infocity Sector-21',
    city: 'Gandhinagar',
    state: 'Gujarat',
    stateCode: '24',
    balance: 88200, // Receivable
    creditLimit: 200000
  },
  {
    id: 'party-krupa-03',
    name: 'Maa Krupa Hardware & Electricals',
    tradeName: 'Maa Krupa Stores',
    type: 'Customer',
    phone: '+91 97123 66778',
    email: 'maakrupa.sanand@yahoo.com',
    gstin: '24AACCM9988G1ZQ',
    pan: 'AACCM9988G',
    address: 'Station Road, Opp. Bus Stand',
    city: 'Sanand',
    state: 'Gujarat',
    stateCode: '24',
    balance: 18450, // Receivable
    creditLimit: 50000
  },
  {
    id: 'party-ultratech-04',
    name: 'UltraTech Cements Depot',
    tradeName: 'UltraTech Cement Ltd (Gujarat Depot)',
    type: 'Vendor',
    phone: '+91 265 2445500',
    email: 'vadodara.depot@adityabirla.com',
    gstin: '24AAACU0147B1ZT',
    pan: 'AAACU0147B',
    address: 'Depot Yard 3, Makarpura Industrial Area',
    city: 'Vadodara',
    state: 'Gujarat',
    stateCode: '24',
    balance: -65000, // Payable
    creditLimit: 500000
  },
  {
    id: 'party-rajasthan-05',
    name: 'Rajasthan TMT Rebars Depot',
    tradeName: 'Jaipur Steel Rolling Mills Ltd',
    type: 'Vendor',
    phone: '+91 141 2899001',
    email: 'sales@jaipursteel.co.in',
    gstin: '08AAAFR5544P1Z1', // Inter-state Rajasthan (08)
    pan: 'AAAFR5544P',
    address: 'VKIA Industrial Area, Sikar Road',
    city: 'Jaipur',
    state: 'Rajasthan',
    stateCode: '08',
    balance: -120000, // Payable
    creditLimit: 500000
  },
  {
    id: 'party-cash-06',
    name: 'Counter Cash Customer',
    tradeName: 'Retail Walk-in Customer',
    type: 'Customer',
    phone: '+91 99999 00000',
    address: 'Ahmedabad Local Walk-in',
    city: 'Ahmedabad',
    state: 'Gujarat',
    stateCode: '24',
    balance: 0
  }
];

// Helper to construct seed transactions
function createSeedTransactions(): Transaction[] {
  const t1Items = [
    calculateLineItem(
      'Tata Tiscon 500D TMT Rebars 12mm',
      '721420',
      350,
      'Kg',
      74,
      18,
      '24',
      'sku-tmt-02'
    ),
    calculateLineItem(
      'UltraTech Super Cement (50kg Bag)',
      '252329',
      25,
      'Bags',
      420,
      28,
      '24',
      'sku-cement-01'
    )
  ];
  const t1Tax = calculateTaxSplit(t1Items, '24');

  const t2Items = [
    calculateLineItem(
      'Tata Tiscon 500D TMT Rebars 12mm',
      '721420',
      1000,
      'Kg',
      62,
      18,
      '08', // Inter-state purchase from Rajasthan
      'sku-tmt-02'
    )
  ];
  const t2Tax = calculateTaxSplit(t2Items, '08');

  const t3Items = [
    calculateLineItem(
      'Supreme CPVC Pipe 1 inch (3m length)',
      '391723',
      15,
      'Pcs',
      240,
      18,
      '24',
      'sku-cpvc-03'
    ),
    calculateLineItem(
      'Jaquar Continental Brass Bib Cock',
      '848180',
      4,
      'Pcs',
      850,
      18,
      '24',
      'sku-cock-06'
    )
  ];
  const t3Tax = calculateTaxSplit(t3Items, '24');

  const t4Items = [
    calculateLineItem(
      'Godown Diesel Generator Fuel & Transport Charges',
      '996511',
      1,
      'Trip',
      4200,
      18,
      '24'
    )
  ];
  const t4Tax = calculateTaxSplit(t4Items, '24');

  return [
    {
      id: 'tx-2026-001',
      invoiceNo: 'INV-2026-039',
      date: '2026-11-18',
      time: '11:15 AM',
      type: 'Sale',
      partyId: 'party-ramesh-01',
      partyName: 'Ramesh Traders',
      partyGstin: '24AAACR1234F1Z8',
      partyPhone: '+91 98980 11223',
      partyState: 'Gujarat',
      partyStateCode: '24',
      placeOfSupply: 'Gujarat (24)',
      items: t1Items,
      taxSplit: t1Tax,
      paymentMode: 'Udhaar',
      paymentStatus: 'Pending',
      notes: 'Billed for Naroda Site Project',
      source: 'Manual',
      createdAt: '2026-11-18T11:15:00.000Z'
    },
    {
      id: 'tx-2026-002',
      invoiceNo: 'BILL-RJ-4491',
      date: '2026-11-18',
      time: '02:40 PM',
      type: 'Purchase',
      partyId: 'party-rajasthan-05',
      partyName: 'Rajasthan TMT Rebars Depot',
      partyGstin: '08AAAFR5544P1Z1',
      partyPhone: '+91 141 2899001',
      partyState: 'Rajasthan',
      partyStateCode: '08',
      placeOfSupply: 'Gujarat (24)',
      items: t2Items,
      taxSplit: t2Tax,
      paymentMode: 'Bank Transfer',
      paymentStatus: 'Paid',
      notes: 'Truck unload received at Godown Yard-1',
      source: 'Supplier PDF',
      createdAt: '2026-11-18T14:40:00.000Z'
    },
    {
      id: 'tx-2026-003',
      invoiceNo: 'INV-2026-040',
      date: '2026-11-19',
      time: '10:30 AM',
      type: 'Sale',
      partyId: 'party-krupa-03',
      partyName: 'Maa Krupa Hardware & Electricals',
      partyGstin: '24AACCM9988G1ZQ',
      partyPhone: '+91 97123 66778',
      partyState: 'Gujarat',
      partyStateCode: '24',
      placeOfSupply: 'Gujarat (24)',
      items: t3Items,
      taxSplit: t3Tax,
      paymentMode: 'UPI',
      paymentStatus: 'Paid',
      notes: 'Received payment via UPI ID: maakrupa@axisbank',
      source: 'Voice',
      createdAt: '2026-11-19T10:30:00.000Z'
    },
    {
      id: 'tx-2026-004',
      invoiceNo: 'EXP-2026-012',
      date: '2026-11-19',
      time: '04:15 PM',
      type: 'Expense',
      partyId: 'party-cash-06',
      partyName: 'Sardar Logistics & Transporters',
      partyState: 'Gujarat',
      partyStateCode: '24',
      placeOfSupply: 'Gujarat (24)',
      items: t4Items,
      taxSplit: t4Tax,
      paymentMode: 'Cash',
      paymentStatus: 'Paid',
      notes: 'Diesel generator and transport loading charges',
      source: 'Manual',
      createdAt: '2026-11-19T16:15:00.000Z'
    }
  ];
}

export const SEED_TRANSACTIONS: Transaction[] = createSeedTransactions();

export interface SamplePreset {
  id: string;
  category: 'Voice' | 'Handwritten Bill' | 'Supplier PDF' | 'Business Q&A' | 'Text Query';
  label: string;
  icon: string;
  description: string;
  prompt: string;
  attachment?: {
    name: string;
    type: 'audio' | 'image' | 'pdf';
    previewUrl?: string;
    size?: string;
  };
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'sample-voice-1',
    category: 'Voice',
    label: '🎙️ Voice: 12 Bags Cement to Ramesh (UPI)',
    icon: 'Mic',
    description: 'Hinglish audio voice note for a retail cement sale',
    prompt: 'Ramesh Traders ko 12 bags cement becha 420 ke rate se UPI pe',
    attachment: {
      name: 'voice_note_ramesh_cement.mp3',
      type: 'audio',
      size: '124 KB'
    }
  },
  {
    id: 'sample-ocr-bill-2',
    category: 'Handwritten Bill',
    label: '🧾 Handwritten Slip: Patel Infra (TMT & Pipes)',
    icon: 'Receipt',
    description: 'Scanned kachha slip from site supervisor with 2 items',
    prompt: 'Patel & Sons Infrastructure ko 500 kg TMT saria @ 74 aur 20 CPVC pipes @ 240 becha, Udhaar account pe daalo',
    attachment: {
      name: 'kachha_slip_site4_patel.jpg',
      type: 'image',
      size: '840 KB'
    }
  },
  {
    id: 'sample-pdf-invoice-3',
    category: 'Supplier PDF',
    label: '📄 Supplier PDF: UltraTech Cement 50 Bags',
    icon: 'FileText',
    description: 'Supplier tax invoice from UltraTech Cements depot',
    prompt: 'UltraTech Cements Depot se 50 bags cement purchase kiye @ 340 rate se, Bill no UT-8842',
    attachment: {
      name: 'UltraTech_Tax_Invoice_UT8842.pdf',
      type: 'pdf',
      size: '1.2 MB'
    }
  },
  {
    id: 'sample-qa-sales',
    category: 'Business Q&A',
    label: '📊 Q&A: Sales & Profit Summary',
    icon: 'TrendingUp',
    description: 'Check today’s revenue, gross profit, and margin',
    prompt: 'Aaj ka total sales aur profit margin kitna chal raha hai?'
  },
  {
    id: 'sample-qa-gst',
    category: 'Business Q&A',
    label: '🏛️ Q&A: GST Liability & ITC',
    icon: 'Landmark',
    description: 'Check Net GST payable after deducting Input Tax Credit',
    prompt: 'Mera Net GST payable kitna banta hai? Output GST aur ITC ka split batao'
  },
  {
    id: 'sample-qa-udhaar',
    category: 'Business Q&A',
    label: '🤝 Q&A: Pending Udhaar Khata',
    icon: 'Users',
    description: 'View party-wise receivables and payables balance',
    prompt: 'Pending Udhaar kitna lena hai aur kis kis se kitna baaki hai?'
  },
  {
    id: 'sample-qa-stock',
    category: 'Business Q&A',
    label: '⚠️ Q&A: Low Stock Reorder List',
    icon: 'AlertTriangle',
    description: 'List items that have fallen below safety reorder levels',
    prompt: 'Kaun kaun se items low stock pe hain aur reorder karne padenge?'
  }
];
