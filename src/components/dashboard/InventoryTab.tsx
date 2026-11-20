'use client';

import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  ArrowUpDown,
  ShoppingBag,
  TrendingDown
} from 'lucide-react';
import { SKU } from '@/types/accounting';
import { formatINR } from '@/lib/formatters';
import { AddSkuModal } from './AddSkuModal';

interface InventoryTabProps {
  skus: SKU[];
  onAddSku: (sku: SKU) => void;
  onQuickAction: (actionType: 'sale' | 'restock', skuName: string) => void;
}

export function InventoryTab({
  skus,
  onAddSku,
  onQuickAction
}: InventoryTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    skus.forEach(s => set.add(s.category));
    return Array.from(set);
  }, [skus]);

  // Filtered SKUs
  const filteredSkus = useMemo(() => {
    return skus.filter(s => {
      if (onlyLowStock && s.currentStock > s.minReorderLevel) return false;
      if (selectedCategory !== 'ALL' && s.category !== selectedCategory) return false;
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesHsn = s.hsn.includes(q);
        const matchesCategory = s.category.toLowerCase().includes(q);
        if (!matchesName && !matchesHsn && !matchesCategory) return false;
      }
      return true;
    });
  }, [skus, searchTerm, selectedCategory, onlyLowStock]);

  // Overall Inventory Value calculation
  const totalStockValue = useMemo(() => {
    return skus.reduce((sum, s) => sum + s.currentStock * s.purchasePrice, 0);
  }, [skus]);

  const lowStockCount = useMemo(() => {
    return skus.filter(s => s.currentStock <= s.minReorderLevel).length;
  }, [skus]);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Inventory KPI & Valuation Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-slate-500">Total Catalog Items</span>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{skus.length} Active SKUs</div>
          <span className="text-[11px] text-slate-500">Auto-updated on approved bills</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-slate-500">Total Stock Value</span>
          <div className="text-xl font-bold text-indigo-900 mt-0.5 tabular-nums">
            {formatINR(totalStockValue)}
          </div>
          <span className="text-[11px] text-indigo-600 font-medium">At weighted cost price</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-slate-500">Low Stock Alerts</span>
            <div className={`text-xl font-bold mt-0.5 ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {lowStockCount} Items
            </div>
            <span className="text-[11px] text-slate-500">Below safety reorder level</span>
          </div>
          <button
            type="button"
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              onlyLowStock
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {onlyLowStock ? 'Showing Low' : 'Filter Low'}
          </button>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by SKU name, HSN code, or category..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New SKU</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium mr-1">Category:</span>
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 font-semibold">SKU Name & Category</th>
                <th className="py-3 px-2 font-semibold font-mono">HSN</th>
                <th className="py-3 px-3 font-semibold text-right">Current Stock</th>
                <th className="py-3 px-2 font-semibold text-center">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Cost Rate</th>
                <th className="py-3 px-3 font-semibold text-right">Selling Rate</th>
                <th className="py-3 px-2 font-semibold text-center">GST Slab</th>
                <th className="py-3 px-3 font-semibold text-right">Stock Value</th>
                <th className="py-3 px-3 font-semibold text-center">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSkus.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No SKU items found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredSkus.map((sku) => {
                  const isLow = sku.currentStock <= sku.minReorderLevel;
                  const itemStockValue = sku.currentStock * sku.purchasePrice;

                  return (
                    <tr key={sku.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Category */}
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-900">{sku.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {sku.category} {sku.location ? `• ${sku.location}` : ''}
                        </div>
                      </td>

                      {/* HSN */}
                      <td className="py-3 px-2 font-mono text-[11px] text-slate-600 font-medium">
                        {sku.hsn}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-slate-900 tabular-nums">
                          {sku.currentStock}
                        </span>{' '}
                        <span className="text-slate-500 text-[11px]">{sku.unit}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-2 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            Low Stock (≤{sku.minReorderLevel})
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Adequate
                          </span>
                        )}
                      </td>

                      {/* Purchase Rate */}
                      <td className="py-3 px-3 text-right text-slate-600 tabular-nums">
                        {formatINR(sku.purchasePrice, false)}
                      </td>

                      {/* Selling Rate */}
                      <td className="py-3 px-3 text-right font-semibold text-slate-900 tabular-nums">
                        {formatINR(sku.sellingPrice, false)}
                      </td>

                      {/* GST Slab */}
                      <td className="py-3 px-2 text-center">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-[11px] font-mono text-slate-700">
                          {sku.gstRate}%
                        </span>
                      </td>

                      {/* Stock Value */}
                      <td className="py-3 px-3 text-right font-semibold text-slate-900 tabular-nums">
                        {formatINR(itemStockValue, false)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            type="button"
                            onClick={() => onQuickAction('sale', sku.name)}
                            className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold transition-colors"
                            title="Draft sale for this item"
                          >
                            Sell
                          </button>
                          <button
                            type="button"
                            onClick={() => onQuickAction('restock', sku.name)}
                            className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold transition-colors"
                            title="Draft purchase / reorder"
                          >
                            Restock
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add SKU Modal */}
      <AddSkuModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSku={onAddSku}
      />
    </div>
  );
}
