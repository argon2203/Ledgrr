import { Transaction } from '@/types/accounting';

export const STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '19': 'West Bengal',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
};

/**
 * Format a number as Indian Currency (₹)
 * Example: 125400.5 -> "₹1,25,400.50"
 */
export function formatINR(amount: number, showDecimals: boolean = true): string {
  if (isNaN(amount)) return '₹0.00';
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const parts = absAmount.toFixed(showDecimals ? 2 : 0).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian number system comma logic: last 3 digits, then groups of 2 digits
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  
  const result = showDecimals && decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  return `${isNegative ? '-' : ''}₹${result}`;
}

/**
 * Convert number to words in Indian numbering system
 * Example: 5947.20 -> "Rupees Five Thousand Nine Hundred Forty-Seven and Twenty Paise Only"
 */
export function numberToWordsINR(amount: number): string {
  if (amount === 0) return 'Rupees Zero Only';

  const units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(num: number): string {
    if (num === 0) return '';
    if (num < 20) return units[num];
    const digit1 = Math.floor(num / 10);
    const digit2 = num % 10;
    return `${tens[digit1]}${digit2 > 0 ? '-' + units[digit2] : ''}`;
  }

  function convertThreeDigits(num: number): string {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    let str = '';
    if (hundred > 0) {
      str += `${units[hundred]} Hundred`;
      if (rest > 0) str += ' and ';
    }
    if (rest > 0) {
      str += convertTwoDigits(rest);
    }
    return str;
  }

  const absAmount = Math.abs(amount);
  const rupees = Math.floor(absAmount);
  const paise = Math.round((absAmount - rupees) * 100);

  let rupeesStr = '';

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const remainder = rupees % 1000;

  if (crore > 0) {
    rupeesStr += `${convertThreeDigits(crore)} Crore `;
  }
  if (lakh > 0) {
    rupeesStr += `${convertThreeDigits(lakh)} Lakh `;
  }
  if (thousand > 0) {
    rupeesStr += `${convertThreeDigits(thousand)} Thousand `;
  }
  if (remainder > 0) {
    rupeesStr += `${convertThreeDigits(remainder)} `;
  }

  rupeesStr = rupeesStr.trim();
  if (rupeesStr === '') rupeesStr = 'Zero';

  let result = `Rupees ${rupeesStr}`;
  if (paise > 0) {
    result += ` and ${convertTwoDigits(paise)} Paise`;
  }
  result += ' Only';

  return result;
}

/**
 * Format ISO date or date string to Indian format DD/MM/YYYY
 */
export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Export Daybook transactions to CSV
 */
export function exportDaybookToCSV(transactions: Transaction[], businessName: string): void {
  const headers = [
    'Date',
    'Voucher/Invoice No',
    'Type',
    'Party Name',
    'Party GSTIN',
    'Place of Supply',
    'Items Summary',
    'Taxable Amount (Rs)',
    'CGST (Rs)',
    'SGST (Rs)',
    'IGST (Rs)',
    'Total Tax (Rs)',
    'Grand Total (Rs)',
    'Payment Mode',
    'Payment Status'
  ];

  const rows = transactions.map((tx) => [
    `"${tx.date}"`,
    `"${tx.invoiceNo}"`,
    `"${tx.type}"`,
    `"${tx.partyName.replace(/"/g, '""')}"`,
    `"${tx.partyGstin || 'Unregistered'}"`,
    `"${tx.placeOfSupply}"`,
    `"${tx.items.map(i => `${i.description} (x${i.quantity})`).join('; ').replace(/"/g, '""')}"`,
    tx.taxSplit.taxableAmount.toFixed(2),
    tx.taxSplit.cgstAmount.toFixed(2),
    tx.taxSplit.sgstAmount.toFixed(2),
    tx.taxSplit.igstAmount.toFixed(2),
    tx.taxSplit.totalTax.toFixed(2),
    tx.taxSplit.grandTotal.toFixed(2),
    `"${tx.paymentMode}"`,
    `"${tx.paymentStatus}"`
  ]);

  const csvContent = [
    `# ${businessName} - Daybook & GST Register`,
    `# Exported on: ${new Date().toLocaleString('en-IN')}`,
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Ledgr_Daybook_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
