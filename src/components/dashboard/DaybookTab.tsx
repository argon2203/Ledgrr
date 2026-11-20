'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  FileText, 
  Filter, 
  Eye, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  CreditCard 
} from 'lucide-react';
import { BusinessProfile, PaymentMode, Transaction, TransactionType } from '@/types/accounting';
import { formatINR, formatDate, exportDaybookToCSV } from '@/lib/formatters';

interface DaybookTabProps {
  transactions: Transaction[];
  business: BusinessProfile;
  onViewInvoice: (invoiceNo: string) => void;
}

export function DaybookTab({
  transactions,
  business,
  onViewInvoice
}: DaybookTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>('ALL');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (selectedType !== 'ALL' && tx.type !== selectedType) {
        return false;
      }
      // Payment mode filter
      if (selectedPaymentMode !== 'ALL' && tx.paymentMode !== selectedPaymentMode) {
        return false;
      }
      // Search term
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchesParty = tx.partyName.toLowerCase().includes(q);
        const matchesInvoice = tx.invoiceNo.toLowerCase().includes(q);
        const matchesGstin = tx.partyGstin ? tx.partyGstin.toLowerCase().includes(q) : false;
        const matchesItem = tx.items.some(i => i.description.toLowerCase().includes(q));
        if (!matchesParty && !matchesInvoice && !matchesGstin && !matchesItem) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, searchTerm, selectedType, selectedPaymentMode]);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by party, invoice no, GSTIN, or item..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Export to CSV Button */}
          <button
            type="button"
            onClick={() => exportDaybookToCSV(filteredTransactions, business.name)}
            className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shrink-0 shadow-2xs"
            title="Download Daybook CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter Type:</span>
          </span>

          {['ALL', 'Sale', 'Purchase', 'Expense', 'Payment'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedType(t)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedType === t
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}

          <span className="text-slate-300 mx-1">|</span>

          <span className="text-slate-500 font-medium">Payment:</span>
          {['ALL', 'UPI', 'Cash', 'Bank Transfer', 'Udhaar'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedPaymentMode(m)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedPaymentMode === m
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 font-semibold">Date & Voucher</th>
                <th className="py-3 px-3 font-semibold">Party & GSTIN</th>
                <th className="py-3 px-2 font-semibold">Type</th>
                <th className="py-3 px-3 font-semibold">Items Summary</th>
                <th className="py-3 px-3 font-semibold text-right">Taxable</th>
                <th className="py-3 px-3 font-semibold text-right">Tax Split</th>
                <th className="py-3 px-3.5 font-semibold text-right">Grand Total</th>
                <th className="py-3 px-3 font-semibold text-center">Payment</th>
                <th className="py-3 px-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Date & Voucher */}
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900">{formatDate(tx.date)}</div>
                      <div className="font-mono text-[11px] text-indigo-600 font-medium">
                        {tx.invoiceNo}
                      </div>
                    </td>

                    {/* Party & GSTIN */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 max-w-[140px] truncate" title={tx.partyName}>
                        {tx.partyName}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        {tx.partyGstin || tx.placeOfSupply}
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        tx.type === 'Sale' ? 'bg-emerald-100 text-emerald-800' :
                        tx.type === 'Purchase' ? 'bg-blue-100 text-blue-800' :
                        tx.type === 'Expense' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {tx.type}
                      </span>
                    </td>

                    {/* Items Summary */}
                    <td className="py-3 px-3">
                      <div className="text-slate-600 max-w-[180px] truncate" title={tx.items.map(i => `${i.description} (${i.quantity} ${i.unit})`).join(', ')}>
                        {tx.items.map(i => `${i.description} (${i.quantity})`).join(', ')}
                      </div>
                    </td>

                    {/* Taxable Amount */}
                    <td className="py-3 px-3 text-right font-medium text-slate-700 tabular-nums">
                      {formatINR(tx.taxSplit.taxableAmount)}
                    </td>

                    {/* Tax Split */}
                    <td className="py-3 px-3 text-right text-slate-500 tabular-nums">
                      <div>{formatINR(tx.taxSplit.totalTax)}</div>
                      <div className="text-[10px]">
                        {tx.taxSplit.isInterstate ? 'IGST' : 'CGST+SGST'}
                      </div>
                    </td>

                    {/* Grand Total */}
                    <td className="py-3 px-3.5 text-right font-bold text-slate-900 text-xs sm:text-sm tabular-nums">
                      {formatINR(tx.taxSplit.grandTotal)}
                    </td>

                    {/* Payment Mode */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        tx.paymentMode === 'Udhaar'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tx.paymentMode}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onViewInvoice(tx.invoiceNo)}
                        className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                        title="View GST Tax Invoice"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredTransactions.length} of {transactions.length} vouchers</span>
          <span>Indian Financial Year 2026-27</span>
        </div>
      </div>
    </div>
  );
}
