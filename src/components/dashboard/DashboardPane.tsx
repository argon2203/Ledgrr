'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Package, 
  Users, 
  FileText 
} from 'lucide-react';
import { BusinessProfile, Party, SKU, Transaction } from '@/types/accounting';
import { computeDashboardKPIs } from '@/lib/gstEngine';
import { KpiBar } from './KpiBar';
import { OverviewTab } from './OverviewTab';
import { DaybookTab } from './DaybookTab';
import { InventoryTab } from './InventoryTab';
import { PartiesTab } from './PartiesTab';
import { TaxInvoiceModal } from './TaxInvoiceModal';

interface DashboardPaneProps {
  business: BusinessProfile;
  transactions: Transaction[];
  skus: SKU[];
  parties: Party[];
  onAddSku: (sku: SKU) => void;
  onDraftFromAction: (prompt: string) => void;
}

export function DashboardPane({
  business,
  transactions,
  skus,
  parties,
  onAddSku,
  onDraftFromAction
}: DashboardPaneProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'daybook' | 'inventory' | 'parties'>('overview');
  const [selectedInvoiceNo, setSelectedInvoiceNo] = useState<string | null>(null);

  // Compute live financial metrics
  const kpis = computeDashboardKPIs(transactions, skus);

  // Udhaar receivables / payables
  let totalReceivables = 0;
  let totalPayables = 0;
  parties.forEach(p => {
    if (p.balance > 0) totalReceivables += p.balance;
    else if (p.balance < 0) totalPayables += Math.abs(p.balance);
  });

  // Selected transaction for invoice modal
  const selectedTransaction = selectedInvoiceNo
    ? transactions.find(t => t.invoiceNo === selectedInvoiceNo) || null
    : null;

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* Top 4 KPI Summary Cards */}
      <KpiBar
        totalSales={kpis.totalSales}
        grossProfit={kpis.grossProfit}
        grossMarginPercent={kpis.grossMarginPercent}
        netGstPayable={kpis.netGstPayable}
        outputGstTotal={kpis.outputGst.total}
        itcTotal={kpis.itc.total}
        totalReceivables={totalReceivables}
        totalPayables={totalPayables}
        lowStockCount={kpis.lowStockCount}
      />

      {/* Tabs Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview & GST', icon: LayoutDashboard },
            { id: 'daybook', label: `Daybook & Ledger (${transactions.length})`, icon: BookOpen },
            { id: 'inventory', label: `Inventory (${skus.length})`, icon: Package },
            { id: 'parties', label: `Parties & Udhaar (${parties.length})`, icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 py-3 px-3 border-b-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Body */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <OverviewTab
            transactions={transactions}
            skus={skus}
            outputGst={kpis.outputGst}
            itc={kpis.itc}
            netGstPayable={kpis.netGstPayable}
            itcBalanceRemaining={kpis.itcBalanceRemaining}
            onSelectTransaction={(invoiceNo) => setSelectedInvoiceNo(invoiceNo)}
            onDraftReorder={(skuName, quantity) => {
              onDraftFromAction(`Supplier se ${quantity} units ${skuName} purchase order draft karo`);
            }}
            onSwitchTab={(tabId) => setActiveTab(tabId)}
          />
        )}

        {activeTab === 'daybook' && (
          <DaybookTab
            transactions={transactions}
            business={business}
            onViewInvoice={(invoiceNo) => setSelectedInvoiceNo(invoiceNo)}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            skus={skus}
            onAddSku={onAddSku}
            onQuickAction={(actionType, skuName) => {
              if (actionType === 'sale') {
                onDraftFromAction(`Counter cash customer ko 1 unit ${skuName} sale kiya`);
              } else {
                onDraftFromAction(`Supplier se ${skuName} purchase order reorder draft karo`);
              }
            }}
          />
        )}

        {activeTab === 'parties' && (
          <PartiesTab
            parties={parties}
            business={business}
            onDraftForParty={(partyName) => {
              onDraftFromAction(`${partyName} ko 10 bags cement sale kiya`);
            }}
          />
        )}
      </div>

      {/* GST Tax Invoice Modal */}
      <TaxInvoiceModal
        transaction={selectedTransaction}
        business={business}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedInvoiceNo(null)}
      />
    </div>
  );
}
