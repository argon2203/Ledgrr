'use client';

import React from 'react';
import { 
  Landmark, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  FileSpreadsheet, 
  Calendar,
  CheckCircle2,
  Clock,
  PackageCheck,
  ShoppingBag
} from 'lucide-react';
import { SKU, Transaction } from '@/types/accounting';
import { formatINR, formatDate } from '@/lib/formatters';

interface OverviewTabProps {
  transactions: Transaction[];
  skus: SKU[];
  outputGst: { cgst: number; sgst: number; igst: number; total: number };
  itc: { cgst: number; sgst: number; igst: number; total: number };
  netGstPayable: number;
  itcBalanceRemaining: number;
  onSelectTransaction: (invoiceNo: string) => void;
  onDraftReorder: (skuName: string, quantity: number) => void;
  onSwitchTab: (tabId: 'overview' | 'daybook' | 'inventory' | 'parties') => void;
}

export function OverviewTab({
  transactions,
  skus,
  outputGst,
  itc,
  netGstPayable,
  itcBalanceRemaining,
  onSelectTransaction,
  onDraftReorder,
  onSwitchTab
}: OverviewTabProps) {
  const lowStockItems = skus.filter(s => s.currentStock <= s.minReorderLevel);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* 1. GSTR-3B Tax Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                GSTR-3B Tax Liability & Input Tax Credit (ITC) Summary
              </h3>
              <p className="text-[11px] text-slate-500">
                Rule 46 & Section 38 CGST Act • Output Tax Offset against Inward ITC
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Audit Ready
          </span>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Outward Tax Liability */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">1. Output GST (Sales)</span>
                <span className="text-xs font-bold text-slate-900 tabular-nums">
                  {formatINR(outputGst.total)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 space-y-1 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>CGST (Intra-state):</span>
                  <span className="tabular-nums font-medium text-slate-700">{formatINR(outputGst.cgst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (Intra-state):</span>
                  <span className="tabular-nums font-medium text-slate-700">{formatINR(outputGst.sgst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IGST (Inter-state):</span>
                  <span className="tabular-nums font-medium text-slate-700">{formatINR(outputGst.igst)}</span>
                </div>
              </div>
            </div>

            {/* Inward ITC */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">2. Input Tax Credit (ITC)</span>
                <span className="text-xs font-bold text-emerald-700 tabular-nums">
                  {formatINR(itc.total)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 space-y-1 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>CGST ITC:</span>
                  <span className="tabular-nums font-medium text-slate-700">{formatINR(itc.cgst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST ITC:</span>
                  <span className="tabular-nums font-medium text-slate-700">{formatINR(itc.sgst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IGST ITC (Inter-state):</span>
                  <span className="tabular-nums font-medium text-slate-700">{formatINR(itc.igst)}</span>
                </div>
              </div>
            </div>

            {/* Net Tax Payable */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950">3. Net Cash Tax Payable</span>
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-indigo-900 mt-2 tabular-nums">
                  {formatINR(netGstPayable)}
                </div>
                <p className="text-[11px] text-indigo-700 mt-1">
                  Net liability after 100% ITC utilization.
                </p>
              </div>

              {itcBalanceRemaining > 0 && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-medium">
                  Remaining ITC Credit: {formatINR(itcBalanceRemaining)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Low-Stock Reorder Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-950">
                Low Stock Reorder Alert ({lowStockItems.length} items below safety limit)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onSwitchTab('inventory')}
              className="text-xs font-semibold text-amber-900 hover:text-amber-950 inline-flex items-center space-x-1"
            >
              <span>View Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-800">{item.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Stock: <span className="font-bold text-amber-700">{item.currentStock} {item.unit}</span> (Min: {item.minReorderLevel})
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDraftReorder(item.name, item.minReorderLevel * 2)}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors shrink-0"
                >
                  Draft PO in Chat
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Recent Transactions Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab('daybook')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1"
          >
            <span>View Full Daybook ({transactions.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentTransactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => onSelectTransaction(tx.invoiceNo)}
              className="p-4 hover:bg-slate-50/70 transition-colors cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  tx.type === 'Sale' ? 'bg-emerald-100 text-emerald-800' :
                  tx.type === 'Purchase' ? 'bg-blue-100 text-blue-800' :
                  tx.type === 'Expense' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {tx.type[0]}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs text-slate-900">{tx.partyName}</span>
                    <span className="font-mono text-[10px] text-slate-500 font-medium">{tx.invoiceNo}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {formatDate(tx.date)} • {tx.items.length} items • {tx.paymentMode} ({tx.paymentStatus})
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-sm text-slate-900 tabular-nums">
                  {formatINR(tx.taxSplit.grandTotal)}
                </div>
                <div className="text-[10px] text-slate-500">
                  Tax: {formatINR(tx.taxSplit.totalTax, false)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
