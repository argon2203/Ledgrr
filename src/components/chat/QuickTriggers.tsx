'use client';

import React from 'react';
import { 
  Mic, 
  Receipt, 
  FileText, 
  TrendingUp, 
  Landmark, 
  Users, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { SAMPLE_PRESETS, SamplePreset } from '@/data/seedData';

interface QuickTriggersProps {
  onSelectTrigger: (preset: SamplePreset) => void;
  onOpenVoiceModal: () => void;
  onOpenBillModal: () => void;
}

export function QuickTriggers({
  onSelectTrigger,
  onOpenVoiceModal,
  onOpenBillModal
}: QuickTriggersProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case 'sample-voice-1':
        return <Mic className="w-3.5 h-3.5 text-indigo-500" />;
      case 'sample-ocr-bill-2':
        return <Receipt className="w-3.5 h-3.5 text-blue-500" />;
      case 'sample-pdf-invoice-3':
        return <FileText className="w-3.5 h-3.5 text-rose-500" />;
      case 'sample-qa-sales':
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
      case 'sample-qa-gst':
        return <Landmark className="w-3.5 h-3.5 text-amber-500" />;
      case 'sample-qa-udhaar':
        return <Users className="w-3.5 h-3.5 text-purple-500" />;
      case 'sample-qa-stock':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="py-2 px-3 border-t border-slate-100 bg-slate-50/70">
      <div className="flex items-center space-x-1.5 mb-1.5">
        <Sparkles className="w-3 h-3 text-indigo-600" />
        <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
          Quick-Test Triggers
        </span>
      </div>

      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
        {/* Multimodal Quick Triggers */}
        <button
          type="button"
          onClick={onOpenVoiceModal}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-medium shrink-0 shadow-2xs transition-all hover:scale-102"
        >
          <Mic className="w-3.5 h-3.5 text-indigo-600" />
          <span>Record Voice</span>
        </button>

        <button
          type="button"
          onClick={onOpenBillModal}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-medium shrink-0 shadow-2xs transition-all hover:scale-102"
        >
          <Receipt className="w-3.5 h-3.5 text-blue-600" />
          <span>Upload Bill / PDF</span>
        </button>

        {/* Preset Query / Transaction Chips */}
        {SAMPLE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectTrigger(preset)}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-900 text-xs font-medium shrink-0 shadow-2xs transition-all hover:bg-slate-50"
            title={preset.description}
          >
            {getIcon(preset.id)}
            <span>{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
