'use client';

import React, { useState } from 'react';
import { Plus, X, PackagePlus, AlertCircle } from 'lucide-react';
import { GstSlab, SKU } from '@/types/accounting';

interface AddSkuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSku: (sku: SKU) => void;
}

export function AddSkuModal({
  isOpen,
  onClose,
  onAddSku
}: AddSkuModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hardware & Building');
  const [hsn, setHsn] = useState('721420');
  const [unit, setUnit] = useState('Pcs');
  const [purchasePrice, setPurchasePrice] = useState<number>(100);
  const [sellingPrice, setSellingPrice] = useState<number>(130);
  const [gstRate, setGstRate] = useState<GstSlab>(18);
  const [currentStock, setCurrentStock] = useState<number>(50);
  const [minReorderLevel, setMinReorderLevel] = useState<number>(15);
  const [location, setLocation] = useState('Godown Bay-B');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSku: SKU = {
      id: `sku-${Date.now()}`,
      name: name.trim(),
      category,
      hsn: hsn.trim(),
      unit,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      gstRate,
      currentStock: Number(currentStock),
      minReorderLevel: Number(minReorderLevel),
      location
    };

    onAddSku(newSku);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <PackagePlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add New Inventory SKU</h3>
              <p className="text-xs text-slate-500">Track stock, HSN, purchase rate & GST slabs</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Item / SKU Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. UltraTech Super Cement or Supreme CPVC Pipe 1 inch"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
              >
                <option value="Cement & Binding">Cement & Binding</option>
                <option value="Steel & Metals">Steel & Metals</option>
                <option value="Plumbing & Pipes">Plumbing & Pipes</option>
                <option value="Paints & Coatings">Paints & Coatings</option>
                <option value="Hardware & Fittings">Hardware & Fittings</option>
                <option value="Sanitaryware">Sanitaryware</option>
                <option value="Aggregates">Aggregates</option>
                <option value="Masonry">Masonry</option>
                <option value="Electrical">Electrical</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">HSN / SAC Code</label>
              <input
                type="text"
                required
                value={hsn}
                onChange={(e) => setHsn(e.target.value)}
                placeholder="e.g. 721420"
                className="w-full font-mono bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
              >
                <option value="Bags">Bags</option>
                <option value="Kg">Kg</option>
                <option value="Pcs">Pcs</option>
                <option value="Buckets">Buckets</option>
                <option value="Tons">Tons</option>
                <option value="Bundles">Bundles</option>
                <option value="Meters">Meters</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Cost Rate (₹)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Selling Rate (₹)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block font-medium text-slate-700 mb-1">GST Slab</label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(parseInt(e.target.value, 10) as GstSlab)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
                <option value={28}>28%</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Initial Stock</label>
              <input
                type="number"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Min Reorder</label>
              <input
                type="number"
                min="1"
                value={minReorderLevel}
                onChange={(e) => setMinReorderLevel(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Godown Storage Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Godown Bay-A, Rack 3"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Catalog</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
