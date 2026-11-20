'use client';

import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Check, 
  X, 
  Sparkles, 
  ScanLine, 
  ArrowRight,
  FileCheck2
} from 'lucide-react';

interface BillUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitUpload: (text: string, attachment: { name: string; type: 'image' | 'pdf'; size?: string }) => void;
}

export function BillUploadModal({
  isOpen,
  onClose,
  onSubmitUpload
}: BillUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    type: 'image' | 'pdf';
    size: string;
    prompt: string;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: {
    name: string;
    type: 'image' | 'pdf';
    size: string;
    prompt: string;
  }) => {
    setSelectedFile(preset);
  };

  const handleProcessScan = () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setScanStep('Scanning document layout and tables...');

    setTimeout(() => {
      setScanStep('Extracting party GSTIN & line items...');
    }, 800);

    setTimeout(() => {
      setScanStep('Verifying HSN codes & GST tax rates...');
    }, 1500);

    setTimeout(() => {
      setIsScanning(false);
      onSubmitUpload(selectedFile.prompt, {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
      });
      onClose();
      setSelectedFile(null);
    }, 2200);
  };

  const sampleBills = [
    {
      title: 'Handwritten Site Slip (Kachha Parchi)',
      type: 'image' as const,
      name: 'patel_site_kachha_slip_4.jpg',
      size: '640 KB',
      description: 'Handwritten slip: Patel & Sons Infra • 500kg TMT @ 74 + 20 CPVC Pipes @ 240 (Udhaar)',
      prompt: 'Patel & Sons Infrastructure ko 500 kg TMT saria @ 74 aur 20 CPVC pipes @ 240 becha, Udhaar account pe daalo'
    },
    {
      title: 'Supplier PDF Tax Invoice',
      type: 'pdf' as const,
      name: 'UltraTech_Cement_Depot_UT8842.pdf',
      size: '1.2 MB',
      description: 'Vendor Invoice: UltraTech Cements Depot • 50 Bags @ 340 (GSTIN 24AAACU0147B1ZT)',
      prompt: 'UltraTech Cements Depot se 50 bags cement purchase kiye @ 340 rate se, Bill no UT-8842'
    },
    {
      title: 'Local Retail Hardware Cash Memo',
      type: 'image' as const,
      name: 'godrej_hardware_cash_memo.png',
      size: '480 KB',
      description: 'Retail Cash Memo: 10 Pcs Godrej Brass Locks @ 1150 Cash Sale',
      prompt: 'Counter Cash Customer ko 10 pcs Godrej brass locks beche 1150 ke rate se Cash mein'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ScanLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Upload Bill Image or Supplier PDF</h3>
              <p className="text-xs text-slate-500">Multimodal OCR extracts party, HSN, rates & tax split</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Drag & Drop Simulation Dropzone */}
          <div
            onClick={() => handleSelectPreset(sampleBills[0])}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              selectedFile
                ? 'border-indigo-500 bg-indigo-50/40'
                : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-2">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-800">
              {selectedFile ? selectedFile.name : 'Click to select bill or drag document here'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports JPEG, PNG, or PDF up to 10MB
            </p>
          </div>

          {/* OCR Scanning Progress Animation */}
          {isScanning && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>{scanStep}</span>
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-1.5 rounded-full w-3/4 animate-pulse" />
              </div>
            </div>
          )}

          {/* Quick-Test Sample Documents */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Or pick a sample bill for instant testing:
            </span>
            <div className="space-y-1.5">
              {sampleBills.map((bill, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectPreset(bill)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    selectedFile?.name === bill.name
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                      {bill.type === 'pdf' ? (
                        <FileText className="w-4 h-4 text-red-500" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                        <span>{bill.title}</span>
                        <span className="text-[10px] text-slate-500 font-normal">({bill.size})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{bill.description}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {selectedFile?.name === bill.name ? (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      <span className="text-[11px] text-indigo-600 font-medium">Select</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isScanning}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProcessScan}
            disabled={!selectedFile || isScanning}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>{isScanning ? 'Extracting via OCR...' : 'Run OCR & Extract Voucher'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
