'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Plus, 
  Trash2, 
  ArrowRight,
  ShieldAlert,
  Percent,
  Check,
  Building,
  CreditCard
} from 'lucide-react';
import { DraftTransaction, GstSlab, Party, PaymentMode, TransactionType } from '@/types/accounting';
import { formatINR } from '@/lib/formatters';
import { BUSINESS_STATE_CODE } from '@/lib/gstEngine';

interface DraftApprovalCardProps {
  draft: DraftTransaction;
  parties: Party[];
  status?: 'pending_approval' | 'approved' | 'discarded';
  approvedInvoiceNo?: string;
  onApprove: (updatedDraft: DraftTransaction) => void;
  onDiscard: (draftId: string) => void;
  onViewInvoice?: (invoiceNo: string) => void;
}

export function DraftApprovalCard({
  draft,
  parties,
  status = 'pending_approval',
  approvedInvoiceNo,
  onApprove,
  onDiscard,
  onViewInvoice
}: DraftApprovalCardProps) {
  // Local state for inline editing before approval
  const [type, setType] = useState<TransactionType>(draft.type);
  const [partyId, setPartyId] = useState<string>(draft.partyId);
  const [partyName, setPartyName] = useState<string>(draft.partyName);
  const [partyGstin, setPartyGstin] = useState<string>(draft.partyGstin || '');
  const [partyStateCode, setPartyStateCode] = useState<string>(draft.partyStateCode || '24');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(draft.paymentMode);
  const [items, setItems] = useState(draft.items);

  const isPending = status === 'pending_approval';
  const isApproved = status === 'approved';
  const isDiscarded = status === 'discarded';

  const isInterstate = partyStateCode !== '' && partyStateCode !== BUSINESS_STATE_CODE;

  // Handle party change from dropdown
  const handlePartyChange = (selectedId: string) => {
    setPartyId(selectedId);
    const found = parties.find(p => p.id === selectedId);
    if (found) {
      setPartyName(found.name);
      setPartyGstin(found.gstin || '');
      setPartyStateCode(found.stateCode);
    }
  };

  // Line item handlers
  const handleUpdateItem = (index: number, field: string, value: any) => {
    if (!isPending) return;
    const next = [...items];
    next[index] = {
      ...next[index],
      [field]: value
    };
    setItems(next);
  };

  const handleAddItem = () => {
    if (!isPending) return;
    setItems([
      ...items,
      {
        id: `draft-item-${Date.now()}`,
        description: 'New Line Item',
        hsn: '998800',
        quantity: 1,
        unit: 'Pcs',
        unitPrice: 100,
        gstRate: 18
      }
    ]);
  };

  const handleDeleteItem = (index: number) => {
    if (!isPending || items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Recalculate totals dynamically
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  items.forEach(item => {
    const itemTaxable = (item.quantity || 0) * (item.unitPrice || 0);
    subtotal += itemTaxable;
    if (isInterstate) {
      totalIgst += itemTaxable * (item.gstRate / 100);
    } else {
      const halfRate = item.gstRate / 2;
      totalCgst += itemTaxable * (halfRate / 100);
      totalSgst += itemTaxable * (halfRate / 100);
    }
  });

  const totalTax = totalCgst + totalSgst + totalIgst;
  const rawGrandTotal = subtotal + totalTax;
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = Math.round((grandTotal - rawGrandTotal) * 100) / 100;

  // Handle Final Submission
  const handleConfirmApproval = () => {
    const updatedDraft: DraftTransaction = {
      ...draft,
      type,
      partyId,
      partyName,
      partyGstin,
      partyStateCode,
      partyState: partyStateCode === '24' ? 'Gujarat' : (partyStateCode === '08' ? 'Rajasthan' : 'Other State'),
      paymentMode,
      items
    };
    onApprove(updatedDraft);
  };

  return (
    <div
      className={`rounded-xl border transition-all my-3 text-xs sm:text-sm overflow-hidden shadow-xs ${
        isApproved
          ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200'
          : isDiscarded
          ? 'bg-slate-50 border-slate-200 opacity-60'
          : 'bg-white border-amber-300 ring-2 ring-amber-100 shadow-md'
      }`}
    >
      {/* Card Header & Status */}
      <div
        className={`px-3.5 py-2.5 flex items-center justify-between border-b ${
          isApproved
            ? 'bg-emerald-100/60 border-emerald-200 text-emerald-900'
            : isDiscarded
            ? 'bg-slate-100 border-slate-200 text-slate-600'
            : 'bg-amber-100/70 border-amber-200 text-amber-950'
        }`}
      >
        <div className="flex items-center space-x-2">
          {isApproved ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : isDiscarded ? (
            <XCircle className="w-4 h-4 text-slate-500 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span className="font-semibold uppercase tracking-wider text-xs">
            {isApproved
              ? `Approved & Recorded ${approvedInvoiceNo ? `(#${approvedInvoiceNo})` : ''}`
              : isDiscarded
              ? 'Draft Discarded'
              : 'Human Approval Required (Draft Voucher)'}
          </span>
        </div>

        {draft.source && (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-white/70 border border-slate-200 text-slate-700">
            via {draft.source}
          </span>
        )}
      </div>

      <div className="p-3.5 space-y-3">
        {/* Top Controls: Transaction Type & Party */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Type Selector */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Transaction Type
            </label>
            {isPending ? (
              <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                {(['Sale', 'Purchase', 'Expense', 'Payment'] as TransactionType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-1 text-center rounded text-xs font-medium transition-colors ${
                      type === t
                        ? t === 'Sale'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : t === 'Purchase'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : t === 'Expense'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <span className={`inline-block font-semibold px-2 py-0.5 rounded text-xs ${
                type === 'Sale' ? 'bg-emerald-100 text-emerald-800' :
                type === 'Purchase' ? 'bg-blue-100 text-blue-800' :
                type === 'Expense' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {type}
              </span>
            )}
          </div>

          {/* Party Selector */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Party / Account
            </label>
            {isPending ? (
              <div className="flex space-x-1">
                <select
                  value={partyId}
                  onChange={(e) => handlePartyChange(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={partyId}>{partyName} (Detected)</option>
                  {parties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.gstin ? `(${p.gstin})` : '(No GSTIN)'}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-xs font-semibold text-slate-800">
                {partyName}
                {partyGstin && <span className="font-mono text-[11px] text-slate-500 ml-1.5 font-normal">[{partyGstin}]</span>}
              </div>
            )}
          </div>
        </div>

        {/* Place of Supply & Tax Split Indicator */}
        <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center space-x-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600">Place of Supply:</span>
            <span className="font-semibold text-slate-800">
              {partyStateCode === '24' ? 'Gujarat (24) - Intra-State' : `State Code ${partyStateCode} - Inter-State`}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
            isInterstate
              ? 'bg-purple-100 text-purple-800 border border-purple-200'
              : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
          }`}>
            {isInterstate ? '100% IGST' : 'CGST + SGST (50/50)'}
          </span>
        </div>

        {/* Editable Line Items Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-1.5 px-2 font-medium">Item Description</th>
                <th className="py-1.5 px-1.5 font-medium w-16">HSN</th>
                <th className="py-1.5 px-1.5 font-medium w-16 text-right">Qty</th>
                <th className="py-1.5 px-1.5 font-medium w-20 text-right">Rate (₹)</th>
                <th className="py-1.5 px-1.5 font-medium w-16 text-center">GST %</th>
                <th className="py-1.5 px-2 font-medium w-24 text-right">Total (₹)</th>
                {isPending && <th className="py-1.5 px-1 w-6"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => {
                const lineTaxable = (item.quantity || 0) * (item.unitPrice || 0);
                const lineTotal = lineTaxable * (1 + item.gstRate / 100);

                return (
                  <tr key={item.id || idx} className="hover:bg-slate-50/50">
                    <td className="py-1.5 px-2">
                      {isPending ? (
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      ) : (
                        <span className="font-medium text-slate-800">{item.description}</span>
                      )}
                    </td>

                    <td className="py-1.5 px-1.5">
                      {isPending ? (
                        <input
                          type="text"
                          value={item.hsn}
                          onChange={(e) => handleUpdateItem(idx, 'hsn', e.target.value)}
                          className="w-16 font-mono bg-white border border-slate-200 rounded px-1 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      ) : (
                        <span className="font-mono text-slate-600">{item.hsn}</span>
                      )}
                    </td>

                    <td className="py-1.5 px-1.5 text-right">
                      {isPending ? (
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-16 text-right bg-white border border-slate-200 rounded px-1 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      ) : (
                        <span className="font-semibold text-slate-800">{item.quantity} {item.unit}</span>
                      )}
                    </td>

                    <td className="py-1.5 px-1.5 text-right">
                      {isPending ? (
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-20 text-right bg-white border border-slate-200 rounded px-1 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      ) : (
                        <span className="text-slate-800">{formatINR(item.unitPrice, false)}</span>
                      )}
                    </td>

                    <td className="py-1.5 px-1.5 text-center">
                      {isPending ? (
                        <select
                          value={item.gstRate}
                          onChange={(e) => handleUpdateItem(idx, 'gstRate', parseInt(e.target.value, 10))}
                          className="bg-white border border-slate-200 rounded px-1 py-1 text-xs"
                        >
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-700">
                          {item.gstRate}%
                        </span>
                      )}
                    </td>

                    <td className="py-1.5 px-2 text-right font-semibold text-slate-900 tabular-nums">
                      {formatINR(lineTotal)}
                    </td>

                    {isPending && (
                      <td className="py-1.5 px-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(idx)}
                          disabled={items.length <= 1}
                          className="text-slate-400 hover:text-red-500 disabled:opacity-30"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {isPending && (
            <div className="p-1.5 bg-slate-50 border-t border-slate-200">
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Line Item</span>
              </button>
            </div>
          )}
        </div>

        {/* Calculation & Tax Split Summary */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Taxable Amount (Subtotal):</span>
            <span className="font-semibold text-slate-800 tabular-nums">{formatINR(subtotal)}</span>
          </div>

          {isInterstate ? (
            <div className="flex justify-between text-slate-600">
              <span>Integrated GST (IGST):</span>
              <span className="font-semibold text-slate-800 tabular-nums">{formatINR(totalIgst)}</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between text-slate-600">
                <span>Central GST (CGST):</span>
                <span className="font-semibold text-slate-800 tabular-nums">{formatINR(totalCgst)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>State GST (SGST):</span>
                <span className="font-semibold text-slate-800 tabular-nums">{formatINR(totalSgst)}</span>
              </div>
            </>
          )}

          {roundOff !== 0 && (
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Round Off:</span>
              <span>{roundOff > 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}</span>
            </div>
          )}

          <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-sm">
            <span className="font-bold text-slate-900">Grand Total:</span>
            <span className="font-bold text-slate-900 text-base text-indigo-700 tabular-nums">
              {formatINR(grandTotal)}
            </span>
          </div>
        </div>

        {/* Payment Mode Selector */}
        {isPending ? (
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-600 font-medium flex items-center space-x-1">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span>Payment Mode:</span>
            </span>
            <div className="flex space-x-1.5">
              {(['UPI', 'Cash', 'Bank Transfer', 'Udhaar'] as PaymentMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                    paymentMode === mode
                      ? mode === 'Udhaar'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-600">
            Payment Mode:{' '}
            <span className="font-semibold text-slate-900">
              {paymentMode}
            </span>
          </div>
        )}

        {/* Math & Compliance Warnings */}
        {draft.warnings && draft.warnings.length > 0 && isPending && (
          <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-800 space-y-0.5">
            {draft.warnings.map((w, idx) => (
              <div key={idx} className="flex items-start space-x-1.5">
                <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {isPending && (
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onDiscard(draft.id)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors"
            >
              Discard Draft
            </button>

            <button
              type="button"
              onClick={handleConfirmApproval}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all hover:shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve & Record Entry</span>
            </button>
          </div>
        )}

        {isApproved && onViewInvoice && approvedInvoiceNo && (
          <div className="pt-1 flex items-center justify-between border-t border-emerald-100">
            <span className="text-xs text-emerald-800 font-medium">
              Voucher #{approvedInvoiceNo} is live in the Daybook.
            </span>
            <button
              type="button"
              onClick={() => onViewInvoice(approvedInvoiceNo)}
              className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              <span>View Tax Invoice</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
