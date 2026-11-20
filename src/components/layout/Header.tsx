'use client';

import React from 'react';
import { 
  Building2, 
  Sparkles, 
  RefreshCw, 
  LayoutPanelLeft, 
  Layers, 
  MessageSquare,
  ShoppingCart,
  User,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { BusinessProfile } from '@/types/accounting';
import { formatINR } from '@/lib/formatters';

interface HeaderProps {
  business: BusinessProfile;
  cartItemCount: number;
  cartTotal: number;
  viewMode: 'split' | 'chat' | 'dashboard';
  onViewModeChange: (mode: 'split' | 'chat' | 'dashboard') => void;
  onOpenProfile: () => void;
  onOpenCart: () => void;
  onOpenAiHub: () => void;
  onResetData: () => void;
}

export function Header({
  business,
  cartItemCount,
  cartTotal,
  viewMode,
  onViewModeChange,
  onOpenProfile,
  onOpenCart,
  onOpenAiHub,
  onResetData
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Business Identity - Clickable to open Profile */}
          <div 
            onClick={onOpenProfile}
            className="flex items-center space-x-3 cursor-pointer group"
            title="Click to view & edit Business & GST Profile"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-100 group-hover:ring-indigo-300 transition-all">
              <span className="font-bold text-xl tracking-tighter">L</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                  Ledgr
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  GST AI Copilot
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                {business.name} • <span className="font-mono text-slate-600">GSTIN: {business.gstin}</span>
              </p>
            </div>
          </div>

          {/* Action Center: AI Capabilities, Daily Sales Cart & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* AI Capabilities Hub Button */}
            <button
              type="button"
              onClick={onOpenAiHub}
              className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-all shadow-2xs hover:scale-102"
              title="Open AI Capabilities & Audit Hub"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">AI Capabilities</span>
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                96%
              </span>
            </button>

            {/* Daily Sales Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-all shadow-2xs hover:scale-102 relative"
              title="Open Daily Sales Counter Cart"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden md:inline">Daily Cart</span>
              {cartItemCount > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Profile Section Button */}
            <button
              type="button"
              onClick={onOpenProfile}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
              title="View & Edit Business Profile"
            >
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden lg:inline">Profile</span>
            </button>

            {/* Split Screen View Mode Toggles */}
            <div className="bg-slate-100 p-0.5 sm:p-1 rounded-lg flex items-center border border-slate-200">
              <button
                type="button"
                onClick={() => onViewModeChange('chat')}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'chat'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Focus on Conversational Assistant"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Chat</span>
              </button>

              <button
                type="button"
                onClick={() => onViewModeChange('split')}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'split'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Split Screen View"
              >
                <LayoutPanelLeft className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Split</span>
              </button>

              <button
                type="button"
                onClick={() => onViewModeChange('dashboard')}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'dashboard'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Focus on Back-Office Dashboard"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Dashboard</span>
              </button>
            </div>

            {/* Reset Data Button */}
            <button
              type="button"
              onClick={onResetData}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Reset to default seed data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
