'use client';

import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  Search, 
  Check, 
  CreditCard, 
  Sparkles, 
  Receipt,
  User,
  ArrowRight
} from 'lucide-react';
import { CartItem, GstSlab, Party, PaymentMode, SKU } from '@/types/accounting';
import { formatINR } from '@/lib/formatters';

interface DailySalesCartProps {
  skus: SKU[];
  parties: Party[];
  isOpen: boolean;
  onClose: () => void;
  onCheckoutToChat: (items: CartItem[], party: Party, paymentMode: PaymentMode) => void;
  onDirectCheckout: (items: CartItem[], party: Party, paymentMode: PaymentMode) => void;
}

export function DailySalesCart({
  skus,
  parties,
  isOpen,
  onClose,
  onCheckoutToChat,
  onDirectCheckout
}: DailySalesCartProps) {
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 'cart-1',
      skuId: 'sku-cement-01',
      name: 'UltraTech Super Cement (50kg Bag)',
      hsn: '252329',
      quantity: 5,
      unit: 'Bags',
      unitPrice: 420,
      gstRate: 28
    },
    {
      id: 'cart-2',
      skuId: 'sku-cpvc-03',
      name: 'Supreme CPVC Pipe 1 inch (3m length)',
      hsn: '391723',
      quantity: 4,
      unit: 'Pcs',
      unitPrice: 240,
      gstRate: 18
    }
  ]);

  const [searchItem, setSearchItem] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState<string>(parties[0]?.id || '');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');

  if (!isOpen) return null;

  const selectedParty = parties.find(p => p.id === selectedPartyId) || parties[0];

  const handleAddToCart = (sku: SKU) => {
    const existingIndex = cart.findIndex(c => c.skuId === sku.id);
    if (existingIndex > -1) {
      const next = [...cart];
      next[existingIndex].quantity += 1;
      setCart(next);
    } else {
      setCart([
        ...cart,
        {
          id: `cart-${Date.now()}`,
          skuId: sku.id,
          name: sku.name,
          hsn: sku.hsn,
          quantity: 1,
          unit: sku.unit,
          unitPrice: sku.sellingPrice,
          gstRate: sku.gstRate
        }
      ]);
    }
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemove = (id: string) => {
    setCart(prev => prev.filter(c => c.id !== id));
  };

  // Tax calculations
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;

  cart.forEach(item => {
    const taxable = item.quantity * item.unitPrice;
    subtotal += taxable;
    totalCgst += taxable * (item.gstRate / 200);
    totalSgst += taxable * (item.gstRate / 200);
  });

  const grandTotal = Math.round(subtotal + totalCgst + totalSgst);

  const filteredSkus = skus.filter(s => {
    if (!searchItem.trim()) return true;
    const q = searchItem.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.hsn.includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Sales Counter Cart</h3>
              <p className="text-[11px] text-slate-500">Quick POS & walk-in counter retail checkout</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Party & Customer Selector */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 shrink-0 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Bill To Customer:</span>
            </span>
            <select
              value={selectedPartyId}
              onChange={(e) => setSelectedPartyId(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-indigo-500 max-w-[240px]"
            >
              {parties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.gstin ? `(${p.gstin.slice(0, 8)}...)` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Cart Items ({cart.length})</span>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCart([])}
                className="text-[11px] text-rose-600 hover:underline"
              >
                Clear Cart
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              Your daily sales cart is empty. Pick items below to add.
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs"
                >
                  <div className="flex-1 pr-2">
                    <div className="font-semibold text-slate-900 truncate max-w-[200px]">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Rate: {formatINR(item.unitPrice, false)} • GST: {item.gstRate}% • HSN: {item.hsn}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.id, -1)}
                      className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-slate-900 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.id, 1)}
                      className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right w-20 shrink-0 ml-2">
                    <div className="font-bold text-slate-900 tabular-nums">
                      {formatINR(item.quantity * item.unitPrice * (1 + item.gstRate / 100))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="text-slate-400 hover:text-rose-500 text-[10px] mt-0.5"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick SKU Picker Accordion */}
          <div className="pt-3 border-t border-slate-200 mt-4">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Quick Add From Inventory
            </span>
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search catalog to add..."
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
              {filteredSkus.slice(0, 6).map((sku) => (
                <button
                  key={sku.id}
                  type="button"
                  onClick={() => handleAddToCart(sku)}
                  className="p-2 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition-all flex items-center justify-between"
                >
                  <div className="truncate mr-1">
                    <div className="font-semibold text-[11px] text-slate-800 truncate">{sku.name}</div>
                    <div className="text-[10px] text-slate-500">{formatINR(sku.sellingPrice, false)}/{sku.unit}</div>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Summary & Checkout */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-3 text-xs">
          {/* Payment Mode Selector */}
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Payment Mode:</span>
            <div className="flex space-x-1">
              {(['UPI', 'Cash', 'Udhaar', 'Card'] as PaymentMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                    paymentMode === mode
                      ? mode === 'Udhaar'
                        ? 'bg-amber-600 text-white'
                        : 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="space-y-1 pt-1 border-t border-slate-200 text-slate-600">
            <div className="flex justify-between">
              <span>Taxable Subtotal:</span>
              <span className="font-semibold tabular-nums">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>GST Tax (CGST + SGST):</span>
              <span className="font-semibold tabular-nums">{formatINR(totalCgst + totalSgst)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>Grand Total:</span>
              <span className="text-emerald-700 text-base tabular-nums">{formatINR(grandTotal)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => {
                onCheckoutToChat(cart, selectedParty, paymentMode);
                onClose();
              }}
              className="py-2 px-3 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Verify in AI Chat</span>
            </button>

            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => {
                onDirectCheckout(cart, selectedParty, paymentMode);
                onClose();
              }}
              className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-40"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Direct Bill & Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
