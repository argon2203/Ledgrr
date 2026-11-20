'use client';

import React from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  Landmark, 
  Users, 
  AlertCircle, 
  Percent, 
  Scale,
  Sparkles
} from 'lucide-react';
import { formatINR } from '@/lib/formatters';

interface KpiBarProps {
  totalSales: number;
  grossProfit: number;
  grossMarginPercent: number;
  netGstPayable: number;
  outputGstTotal: number;
  itcTotal: number;
  totalReceivables: number;
  totalPayables: number;
  lowStockCount: number;
}

export function KpiBar({
  totalSales,
  grossProfit,
  grossMarginPercent,
  netGstPayable,
  outputGstTotal,
  itcTotal,
  totalReceivables,
  totalPayables,
  lowStockCount
}: KpiBarProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-50/70 border-b border-slate-200">
      {/* 1. Total Sales / Turnover */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Total Sales (Turnover)</span>
          <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight tabular-nums">
          {formatINR(totalSales)}
        </div>
        <div className="flex items-center space-x-1 text-[11px] text-emerald-600 font-medium mt-1">
          <ArrowUpRight className="w-3 h-3" />
          <span>Active Inward & Outward Register</span>
        </div>
      </div>

      {/* 2. Gross Profit & Margin */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Gross Profit (Margin)</span>
          <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Percent className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-lg sm:text-xl font-bold text-indigo-900 tracking-tight tabular-nums">
          {formatINR(grossProfit)}
        </div>
        <div className="text-[11px] text-indigo-600 font-medium mt-1">
          {grossMarginPercent.toFixed(1)}% Estimated Margin
        </div>
      </div>

      {/* 3. Net GST Payable (GSTR-3B) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Net GST Payable</span>
          <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
            <Landmark className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-lg sm:text-xl font-bold text-amber-900 tracking-tight tabular-nums">
          {formatINR(netGstPayable)}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 truncate" title={`Output ${formatINR(outputGstTotal)} - ITC ${formatINR(itcTotal)}`}>
          Output {formatINR(outputGstTotal, false)} − ITC {formatINR(itcTotal, false)}
        </div>
      </div>

      {/* 4. Pending Udhaar (Receivables / Payables) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Udhaar (Khata)</span>
          <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight tabular-nums">
          {formatINR(totalReceivables)}
        </div>
        <div className="flex items-center justify-between text-[11px] mt-1">
          <span className="text-emerald-700 font-medium">Lene: {formatINR(totalReceivables, false)}</span>
          <span className="text-rose-600 font-medium">Dene: {formatINR(totalPayables, false)}</span>
        </div>
      </div>
    </div>
  );
}
