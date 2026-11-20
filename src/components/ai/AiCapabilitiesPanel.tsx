'use client';

import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Landmark, 
  Percent, 
  Clock, 
  X,
  Zap,
  BarChart3,
  Cpu
} from 'lucide-react';
import { AiInsight, SKU, Transaction } from '@/types/accounting';
import { formatINR } from '@/lib/formatters';

interface AiCapabilitiesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  skus: SKU[];
  onTriggerAiAction: (prompt: string) => void;
}

export function AiCapabilitiesPanel({
  isOpen,
  onClose,
  transactions,
  skus,
  onTriggerAiAction
}: AiCapabilitiesPanelProps) {
  if (!isOpen) return null;

  const insights: AiInsight[] = [
    {
      id: 'ai-1',
      title: 'GSTR-2B vs GSTR-3B ITC Mismatch Detector',
      category: 'tax_audit',
      severity: 'success',
      metric: '100% Matched',
      description: 'AI reconciled all 4 purchase vouchers against supplier filings. All suppliers (UltraTech Cements & Rajasthan TMT Depot) have uploaded valid GSTR-1s. Zero blocked credit detected under Section 17(5).',
      actionLabel: 'Audit ITC Records',
      actionPrompt: 'GSTR-2B aur 3B ka detailed ITC reconciliation dikhao'
    },
    {
      id: 'ai-2',
      title: 'Tax Reserve Forecast for 20th of the Month',
      category: 'cash_flow',
      severity: 'info',
      metric: '₹0.00 Net Cash Liability',
      description: 'Your Input Tax Credit (₹11,916) currently exceeds your Output GST liability (₹10,273). Remaining credit of ₹1,643 will carry forward to next month without any cash outflow needed.',
      actionLabel: 'Forecast Cash Flow',
      actionPrompt: 'Agli 20 tarikh ko GST bharne ke liye kitna cash reserve rakhna padega?'
    },
    {
      id: 'ai-3',
      title: 'Gross Margin Optimization on Steel & Paints',
      category: 'margin',
      severity: 'warning',
      metric: 'Potential +₹14,500/mo',
      description: 'Asian Paints Apex margin is currently 17.2% (₹800/bucket). Local market benchmarks in Ahmedabad indicate prevailing retail price of ₹4,750, which would expand margins to 23.3%.',
      actionLabel: 'Review Pricing Suggestions',
      actionPrompt: 'Asian paints aur steel ke rate me margin optimize karne ka suggestion do'
    },
    {
      id: 'ai-4',
      title: 'Stock Velocity & Fast-Depletion Warning',
      category: 'inventory_aging',
      severity: 'warning',
      metric: 'Runout in ~3 Days',
      description: 'Supreme CPVC Pipes 1-inch (42 pcs remaining) has 3x weekly run-rate. Without a replenishment purchase order within 72 hours, stockout will disrupt site contractors.',
      actionLabel: 'Draft Reorder in Chat',
      actionPrompt: 'Supreme CPVC pipe 1 inch ke 50 pieces ka supplier purchase order draft karo'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-indigo-200 border border-white/10">
              <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Ledgr AI Intelligence & Audit Hub
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Engine v2.4 Active
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Continuous compliance check, margin expansion & cash flow foresight
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Health Score Overview */}
        <div className="p-5 bg-indigo-50/50 border-b border-indigo-100 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center sm:text-left">
            {/* Score Card */}
            <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs sm:col-span-1 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold uppercase text-slate-500">MSME Health Score</span>
              <div className="text-3xl font-black text-indigo-900 mt-1">96<span className="text-sm font-semibold text-slate-400">/100</span></div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                Grade A (Prime)
              </span>
            </div>

            {/* Metrics Breakdown */}
            <div className="sm:col-span-3 grid grid-cols-3 gap-2">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs text-center">
                <span className="text-[10px] text-slate-500 block">GST Compliance</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">98% Clean</span>
                <span className="text-[9px] text-emerald-600 font-medium">Zero penalties</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs text-center">
                <span className="text-[10px] text-slate-500 block">Udhaar Recovery</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">88% Timely</span>
                <span className="text-[9px] text-slate-500">Avg 14 days cycle</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs text-center">
                <span className="text-[10px] text-slate-500 block">Gross Margin</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">21.4% Avg</span>
                <span className="text-[9px] text-indigo-600 font-medium">Above Gujarat avg</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Actionable Insights Stream */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
            <span className="flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>Real-Time Diagnostic Insights</span>
            </span>
            <span className="text-[11px] text-slate-400">4 active recommendations</span>
          </div>

          <div className="space-y-2.5">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 shadow-2xs transition-all flex flex-col justify-between space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {insight.severity === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : insight.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <Landmark className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                    <h4 className="font-bold text-slate-900 text-xs">{insight.title}</h4>
                  </div>
                  {insight.metric && (
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 ${
                      insight.severity === 'success'
                        ? 'bg-emerald-100 text-emerald-800'
                        : insight.severity === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {insight.metric}
                    </span>
                  )}
                </div>

                <p className="text-slate-600 leading-relaxed text-xs">
                  {insight.description}
                </p>

                {insight.actionPrompt && (
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerAiAction(insight.actionPrompt!);
                        onClose();
                      }}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                    >
                      <span>{insight.actionLabel || 'Ask AI Copilot'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>AI models trained on CGST Rules & Indian MSME Trade Lexicon</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
