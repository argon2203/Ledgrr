'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Send,
  Building,
  QrCode
} from 'lucide-react';
import { BusinessProfile, Party } from '@/types/accounting';
import { formatINR } from '@/lib/formatters';

interface WhatsAppReminderModalProps {
  party: Party | null;
  business: BusinessProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppReminderModal({
  party,
  business,
  isOpen,
  onClose
}: WhatsAppReminderModalProps) {
  const [language, setLanguage] = useState<'hinglish' | 'english' | 'gujarati'>('hinglish');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!party) return;

    const formattedAmount = formatINR(Math.abs(party.balance));

    if (language === 'hinglish') {
      setCustomMessage(
        `Namaste ${party.name} ji,\n\n` +
        `Shree Ambica Building Materials & Hardware se namaskar. Aapka account balance check kiya, jismein total pending amount ${formattedAmount} baaki hai.\n\n` +
        `Kripya shubh avsar par iska payment neeche diye hamare official UPI par transfer kar dein:\n` +
        `• UPI ID: ${business.upiId}\n` +
        `• A/C No: ${business.accountNo} (SBI)\n` +
        `• IFSC: ${business.ifscCode}\n\n` +
        `Payment ke baad receipt/screenshot isi number par WhatsApp kar dein. Dhanyawad!`
      );
    } else if (language === 'english') {
      setCustomMessage(
        `Dear ${party.name},\n\n` +
        `Greetings from ${business.name}.\n\n` +
        `This is a gentle payment reminder regarding the outstanding balance of ${formattedAmount} on your account.\n\n` +
        `Kindly settle this balance via UPI or Direct Bank Transfer:\n` +
        `• UPI ID: ${business.upiId}\n` +
        `• Bank: ${business.bankName}\n` +
        `• Account No: ${business.accountNo}\n` +
        `• IFSC Code: ${business.ifscCode}\n\n` +
        `Thank you for your valued business!`
      );
    } else {
      // Gujarati
      setCustomMessage(
        `નમસ્તે ${party.name} જી,\n\n` +
        `શ્રી અંબિકા બિલ્ડીંગ મટીરીયલ્સ તરફથી જય શ્રી કૃષ્ણ. આપના ખાતામાં બાકી રકમ ${formattedAmount} ચૂકવવાની બાકી છે.\n\n` +
        `કૃપા કરીને નીચે આપેલ UPI ID પર રકમ જમા કરાવી દેશો:\n` +
        `• UPI ID: ${business.upiId}\n` +
        `• બેંક: ${business.bankName} (IFSC: ${business.ifscCode})\n\n` +
        `પેમેન્ટ કર્યા બાદ સ્ક્રીનશોટ મોકલી આપશો. આભાર!`
      );
    }
  }, [party, language, business]);

  if (!isOpen || !party) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = party.phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(customMessage);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">WhatsApp Payment Reminder</h3>
              <p className="text-xs text-slate-500">
                To: <span className="font-semibold text-slate-700">{party.name}</span> ({party.phone})
              </p>
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

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Outstanding Balance Banner */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-emerald-800 uppercase">
                Pending Receivable (Lene Hain)
              </span>
              <div className="text-lg font-bold text-emerald-950 tabular-nums">
                {formatINR(Math.abs(party.balance))}
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-white text-emerald-800 border border-emerald-200 text-xs font-semibold">
              GSTIN: {party.gstin || 'Unregistered'}
            </span>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-medium">Language:</span>
            <div className="flex space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setLanguage('hinglish')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  language === 'hinglish' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Hinglish / Hindi
              </button>
              <button
                type="button"
                onClick={() => setLanguage('english')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  language === 'english' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('gujarati')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  language === 'gujarati' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Gujarati
              </button>
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Preview & Edit Message:
            </label>
            <textarea
              rows={8}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-600 text-xs font-medium hover:bg-slate-200"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
