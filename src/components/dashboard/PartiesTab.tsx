'use client';

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  MessageSquare, 
  Phone, 
  Building, 
  MapPin, 
  ArrowUpRight, 
  ArrowDownLeft,
  Filter,
  Plus
} from 'lucide-react';
import { BusinessProfile, Party } from '@/types/accounting';
import { formatINR } from '@/lib/formatters';
import { WhatsAppReminderModal } from './WhatsAppReminderModal';

interface PartiesTabProps {
  parties: Party[];
  business: BusinessProfile;
  onDraftForParty: (partyName: string) => void;
}

export function PartiesTab({
  parties,
  business,
  onDraftForParty
}: PartiesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [partyTypeFilter, setPartyTypeFilter] = useState<'ALL' | 'Customer' | 'Vendor'>('ALL');
  const [selectedPartyForReminder, setSelectedPartyForReminder] = useState<Party | null>(null);

  // Compute total receivables and payables
  const { totalReceivable, totalPayable } = useMemo(() => {
    let rec = 0;
    let pay = 0;
    parties.forEach(p => {
      if (p.balance > 0) rec += p.balance;
      else if (p.balance < 0) pay += Math.abs(p.balance);
    });
    return { totalReceivable: rec, totalPayable: pay };
  }, [parties]);

  const filteredParties = useMemo(() => {
    return parties.filter((p) => {
      if (partyTypeFilter !== 'ALL' && p.type !== partyTypeFilter && p.type !== 'Both') {
        return false;
      }
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesPhone = p.phone.includes(q);
        const matchesGstin = p.gstin ? p.gstin.toLowerCase().includes(q) : false;
        const matchesCity = p.city.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesGstin && !matchesCity) {
          return false;
        }
      }
      return true;
    });
  }, [parties, searchTerm, partyTypeFilter]);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Udhaar Khata Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              <span>Total Receivables (Lene Hain)</span>
            </div>
            <div className="text-2xl font-black text-emerald-950 mt-1 tabular-nums">
              {formatINR(totalReceivable)}
            </div>
            <span className="text-[11px] text-emerald-700">From customers and site contractors</span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            {parties.filter(p => p.balance > 0).length} Parties
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-rose-800 text-xs font-semibold uppercase tracking-wider">
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              <span>Total Payables (Dene Hain)</span>
            </div>
            <div className="text-2xl font-black text-rose-950 mt-1 tabular-nums">
              {formatINR(totalPayable)}
            </div>
            <span className="text-[11px] text-rose-700">To manufacturers and depot vendors</span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            {parties.filter(p => p.balance < 0).length} Vendors
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search party by business name, phone, GSTIN, or city..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5">
            {(['ALL', 'Customer', 'Vendor'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setPartyTypeFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  partyTypeFilter === filter
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter === 'ALL' ? 'All Parties' : filter === 'Customer' ? 'Customers (Denewale)' : 'Vendors (Lenewale)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Parties Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredParties.map((party) => {
          const isReceivable = party.balance > 0;
          const isPayable = party.balance < 0;
          const isSettled = party.balance === 0;

          return (
            <div
              key={party.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Party Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{party.name}</h4>
                    {party.tradeName && (
                      <p className="text-xs text-slate-500 truncate">{party.tradeName}</p>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    party.type === 'Customer'
                      ? 'bg-emerald-100 text-emerald-800'
                      : party.type === 'Vendor'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {party.type}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{party.phone}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[11px]">
                      GSTIN: {party.gstin || 'Unregistered'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{party.city}, {party.state} (Code: {party.stateCode})</span>
                  </div>
                </div>
              </div>

              {/* Balance & Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Outstanding Balance
                  </span>
                  <div className={`text-base font-bold tabular-nums ${
                    isReceivable ? 'text-emerald-700' : isPayable ? 'text-rose-700' : 'text-slate-500'
                  }`}>
                    {formatINR(Math.abs(party.balance))}
                    <span className="text-[11px] font-medium ml-1">
                      {isReceivable ? '(Lene hain)' : isPayable ? '(Dene hain)' : '(Nill)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {/* WhatsApp Reminder Button (for receivables) */}
                  {isReceivable && (
                    <button
                      type="button"
                      onClick={() => setSelectedPartyForReminder(party)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors"
                      title="Generate WhatsApp Payment Reminder"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>
                  )}

                  {/* Create voucher in chat */}
                  <button
                    type="button"
                    onClick={() => onDraftForParty(party.name)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors"
                    title="Draft invoice for this party in chat"
                  >
                    <span>Bill</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* WhatsApp Reminder Modal */}
      <WhatsAppReminderModal
        party={selectedPartyForReminder}
        business={business}
        isOpen={!!selectedPartyForReminder}
        onClose={() => setSelectedPartyForReminder(null)}
      />
    </div>
  );
}
