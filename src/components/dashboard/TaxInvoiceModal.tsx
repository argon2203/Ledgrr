'use client';

import React from 'react';
import { 
  Printer, 
  Download, 
  X, 
  Building2, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';
import { BusinessProfile, Transaction } from '@/types/accounting';
import { formatINR, numberToWordsINR, formatDate } from '@/lib/formatters';

interface TaxInvoiceModalProps {
  transaction: Transaction | null;
  business: BusinessProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function TaxInvoiceModal({
  transaction,
  business,
  isOpen,
  onClose
}: TaxInvoiceModalProps) {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const isInterstate = transaction.taxSplit.isInterstate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[96vh] flex flex-col">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm">GST Tax Invoice Viewer</span>
            <span className="text-xs text-slate-400 font-mono">[{transaction.invoiceNo}]</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-6 sm:p-8 overflow-y-auto print:p-0 print:overflow-visible text-slate-900 font-sans text-xs">
          <div className="border border-slate-300 rounded-lg p-5 sm:p-6 print:border-0 print:p-0 space-y-4">
            {/* Header: Title & Copy Type */}
            <div className="text-center border-b border-slate-300 pb-3">
              <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
                TAX INVOICE
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">
                (Issued under Rule 46 of CGST / SGST / IGST Rules, 2017) • Original for Recipient
              </p>
            </div>

            {/* Supplier Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-slate-300">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase">
                  {business.name}
                </h3>
                <p className="text-[11px] text-slate-600 font-medium">{business.tradeName}</p>
                <p className="text-slate-600 text-[11px] mt-1">{business.address}</p>
                <p className="text-slate-600 text-[11px]">{business.city}, {business.state} - {business.pincode}</p>
                <div className="mt-1.5 space-y-0.5 text-[11px]">
                  <p>
                    <strong className="text-slate-800">GSTIN:</strong>{' '}
                    <span className="font-mono font-bold text-indigo-900">{business.gstin}</span>
                  </p>
                  <p>
                    <strong className="text-slate-800">PAN:</strong>{' '}
                    <span className="font-mono">{business.pan}</span> •{' '}
                    <strong className="text-slate-800">State Code:</strong> {business.stateCode} ({business.state})
                  </p>
                  <p>
                    <strong className="text-slate-800">Phone:</strong> {business.phone} •{' '}
                    <strong className="text-slate-800">Email:</strong> {business.email}
                  </p>
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="sm:text-right bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded border sm:border-0 border-slate-200">
                <div className="space-y-1">
                  <p className="text-xs">
                    <strong className="text-slate-700">Invoice No:</strong>{' '}
                    <span className="font-mono font-bold text-sm text-indigo-900">
                      {transaction.invoiceNo}
                    </span>
                  </p>
                  <p className="text-xs">
                    <strong className="text-slate-700">Invoice Date:</strong>{' '}
                    <span className="font-medium">{formatDate(transaction.date)}</span>
                  </p>
                  <p className="text-xs">
                    <strong className="text-slate-700">Place of Supply:</strong>{' '}
                    <span className="font-medium">{transaction.placeOfSupply}</span>
                  </p>
                  <p className="text-xs">
                    <strong className="text-slate-700">Reverse Charge Applicable:</strong>{' '}
                    <span className="font-medium">No</span>
                  </p>
                  <p className="text-xs">
                    <strong className="text-slate-700">Payment Status:</strong>{' '}
                    <span className="font-bold text-emerald-800 uppercase">
                      {transaction.paymentMode} ({transaction.paymentStatus})
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Buyer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-slate-300">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Details of Receiver (Billed To)
                </span>
                <h4 className="font-bold text-xs text-slate-900">{transaction.partyName}</h4>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  State: {transaction.partyState} (Code: {transaction.partyStateCode})
                </p>
                <p className="text-slate-600 text-[11px]">
                  <strong className="text-slate-700">GSTIN / UIN:</strong>{' '}
                  <span className="font-mono font-semibold">
                    {transaction.partyGstin || 'Unregistered / Retail Consumer'}
                  </span>
                </p>
                {transaction.partyPhone && (
                  <p className="text-slate-600 text-[11px]">
                    <strong className="text-slate-700">Contact:</strong> {transaction.partyPhone}
                  </p>
                )}
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Details of Consignee (Shipped To)
                </span>
                <h4 className="font-bold text-xs text-slate-900">{transaction.partyName}</h4>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Delivery Site / Warehouse Location: {transaction.partyState}
                </p>
                <p className="text-slate-600 text-[11px]">
                  <strong className="text-slate-700">Place of Supply:</strong> {transaction.placeOfSupply}
                </p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 font-semibold">
                  <tr>
                    <th className="py-2 px-2 border-r border-slate-300 w-8 text-center">#</th>
                    <th className="py-2 px-3 border-r border-slate-300">Description of Goods</th>
                    <th className="py-2 px-2 border-r border-slate-300 font-mono text-center w-16">HSN/SAC</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-right w-16">Qty</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-right w-20">Rate (₹)</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-right w-24">Taxable Value</th>
                    {isInterstate ? (
                      <th className="py-2 px-2 border-r border-slate-300 text-right w-24">IGST</th>
                    ) : (
                      <>
                        <th className="py-2 px-2 border-r border-slate-300 text-right w-20">CGST</th>
                        <th className="py-2 px-2 border-r border-slate-300 text-right w-20">SGST</th>
                      </>
                    )}
                    <th className="py-2 px-3 text-right w-28">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {transaction.items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-2 px-2 border-r border-slate-300 text-center text-slate-500 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 font-medium text-slate-900">
                        {item.description}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-300 font-mono text-center text-slate-700">
                        {item.hsn}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-300 text-right font-semibold">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-300 text-right tabular-nums">
                        {formatINR(item.unitPrice, false)}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-300 text-right tabular-nums font-medium">
                        {formatINR(item.taxableAmount)}
                      </td>
                      {isInterstate ? (
                        <td className="py-2 px-2 border-r border-slate-300 text-right tabular-nums text-slate-700">
                          <div>{formatINR(item.igstAmount)}</div>
                          <span className="text-[10px] text-slate-400 font-mono">({item.gstRate}%)</span>
                        </td>
                      ) : (
                        <>
                          <td className="py-2 px-2 border-r border-slate-300 text-right tabular-nums text-slate-700">
                            <div>{formatINR(item.cgstAmount)}</div>
                            <span className="text-[10px] text-slate-400 font-mono">({item.gstRate / 2}%)</span>
                          </td>
                          <td className="py-2 px-2 border-r border-slate-300 text-right tabular-nums text-slate-700">
                            <div>{formatINR(item.sgstAmount)}</div>
                            <span className="text-[10px] text-slate-400 font-mono">({item.gstRate / 2}%)</span>
                          </td>
                        </>
                      )}
                      <td className="py-2 px-3 text-right font-bold text-slate-900 tabular-nums">
                        {formatINR(item.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Amount in words & Bank Info */}
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Total Amount in Words
                  </span>
                  <p className="font-semibold text-slate-900 text-xs mt-0.5">
                    {numberToWordsINR(transaction.taxSplit.grandTotal)}
                  </p>
                </div>

                {/* Bank Account & UPI Details */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div className="space-y-0.5 text-[11px]">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                      Bank Payment Details
                    </span>
                    <p><strong className="text-slate-700">Bank:</strong> {business.bankName}</p>
                    <p><strong className="text-slate-700">A/C No:</strong> <span className="font-mono font-bold">{business.accountNo}</span></p>
                    <p><strong className="text-slate-700">IFSC:</strong> <span className="font-mono">{business.ifscCode}</span></p>
                    <p><strong className="text-slate-700">UPI ID:</strong> <span className="font-mono font-bold text-indigo-700">{business.upiId}</span></p>
                  </div>
                  <div className="text-center shrink-0 pl-3">
                    <div className="w-16 h-16 bg-white border border-slate-300 rounded flex items-center justify-center p-1">
                      <QrCode className="w-12 h-12 text-slate-800" />
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Scan to Pay UPI</span>
                  </div>
                </div>
              </div>

              {/* Tax Breakup Table */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total Taxable Value:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatINR(transaction.taxSplit.taxableAmount)}
                  </span>
                </div>

                {isInterstate ? (
                  <div className="flex justify-between text-slate-600">
                    <span>Integrated GST (IGST):</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {formatINR(transaction.taxSplit.igstAmount)}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-slate-600">
                      <span>Central GST (CGST):</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {formatINR(transaction.taxSplit.cgstAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>State GST (SGST):</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {formatINR(transaction.taxSplit.sgstAmount)}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Total GST Amount:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatINR(transaction.taxSplit.totalTax)}
                  </span>
                </div>

                {transaction.taxSplit.roundOff !== 0 && (
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Round Off:</span>
                    <span>{transaction.taxSplit.roundOff.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-sm">
                  <span className="font-black text-slate-900 uppercase">Grand Total (₹):</span>
                  <span className="font-black text-indigo-900 text-base tabular-nums">
                    {formatINR(transaction.taxSplit.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms & Authorized Signatory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-300">
              <div className="text-[10px] text-slate-500 space-y-0.5">
                <p className="font-bold text-slate-700 uppercase">Terms & Conditions:</p>
                <p>1. Goods once sold will not be taken back without original invoice.</p>
                <p>2. Interest @ 18% p.a. will be charged if payment is delayed beyond credit limit.</p>
                <p>3. Subject to Ahmedabad, Gujarat jurisdiction only.</p>
              </div>

              <div className="text-right flex flex-col justify-between items-end min-h-[70px]">
                <span className="font-bold text-[11px] text-slate-800 uppercase">
                  For {business.name}
                </span>
                <div className="text-[10px] text-slate-500">
                  <div className="border-t border-slate-400 w-44 pt-1 mt-6 text-center">
                    Authorized Signatory
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
