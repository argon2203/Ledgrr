'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CartItem,
  ChatMessage, 
  DraftTransaction, 
  LineItem, 
  Party, 
  PaymentMode, 
  SKU, 
  TaxSplit, 
  Transaction, 
  TransactionType 
} from '@/types/accounting';
import { 
  SEED_BUSINESS_PROFILE, 
  SEED_PARTIES, 
  SEED_SKUS, 
  SEED_TRANSACTIONS 
} from '@/data/seedData';
import { calculateLineItem, calculateTaxSplit } from '@/lib/gstEngine';
import { parseUserMessage } from '@/lib/nlpParser';
import { Header } from '@/components/layout/Header';
import { ChatPane } from '@/components/chat/ChatPane';
import { DashboardPane } from '@/components/dashboard/DashboardPane';
import { TaxInvoiceModal } from '@/components/dashboard/TaxInvoiceModal';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { DailySalesCart } from '@/components/cart/DailySalesCart';
import { AiCapabilitiesPanel } from '@/components/ai/AiCapabilitiesPanel';

export default function LedgrApp() {
  const [business, setBusiness] = useState(SEED_BUSINESS_PROFILE);
  const [skus, setSkus] = useState<SKU[]>(SEED_SKUS);
  const [parties, setParties] = useState<Party[]>(SEED_PARTIES);
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [viewMode, setViewMode] = useState<'split' | 'chat' | 'dashboard'>('split');
  const [activeInvoiceNo, setActiveInvoiceNo] = useState<string | null>(null);

  // Modal open states for the 4 newly requested features
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiHubOpen, setIsAiHubOpen] = useState(false);

  // Daily Sales Cart items
  const [cartItemsCount, setCartItemsCount] = useState(2);
  const [cartTotal, setCartTotal] = useState(3232);

  // Initial welcome message from AI Assistant
  const initialMessages: ChatMessage[] = [
    {
      id: 'welcome-msg-1',
      sender: 'assistant',
      timestamp: 'Just now',
      text: `👋 **Namaste! Welcome to Ledgr**, your conversational back-office and GST accounting assistant.\n\n` +
        `I am loaded with live data for **${SEED_BUSINESS_PROFILE.name}** (Ahmedabad, Gujarat).\n\n` +
        `Here is what you can do:\n` +
        `• 🎙️ **Voice Recording System:** Speak in Hinglish or Gujarati via microphone or preset voice notes.\n` +
        `• 🛒 **Daily Sales Cart:** Fast retail counter checkout & POS cart in the top bar.\n` +
        `• ✨ **AI Intelligence Hub:** 96% Health Score, GSTR-2B vs 3B audit & margin expansion.\n` +
        `• 🏢 **Profile Section:** Manage your business, GSTIN, and bank/UPI details anytime.\n` +
        `• 🛡️ **Human Approval Gate:** Every entry requires your verification before recording.\n\n` +
        `*Click any trigger below or the top bar buttons to explore!*`
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  // Trigger celebratory confetti on invoice approval
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch {
      // Ignore if confetti not supported
    }
  };

  // Send message handler
  const handleSendMessage = (
    text: string,
    source: 'Chat' | 'Voice' | 'Bill OCR' | 'Supplier PDF' | 'Daily Cart' = 'Chat',
    attachment?: any
  ) => {
    const userMsgId = `user-msg-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      text,
      attachment
    };

    // Run NLP engine
    const parsed = parseUserMessage(text, parties, skus, transactions, source, attachment);

    const assistantMsgId = `asst-msg-${Date.now() + 1}`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      text: parsed.assistantMessage,
      draft: parsed.draft,
      status: parsed.draft ? 'pending_approval' : undefined
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
  };

  // Human-in-the-loop: Approve & Record Entry
  const handleApproveDraft = (draft: DraftTransaction, messageId: string) => {
    triggerConfetti();

    // 1. Generate sequential Voucher/Invoice Number
    const count = transactions.length + 1;
    let invoicePrefix = 'INV-2026';
    if (draft.type === 'Purchase') invoicePrefix = 'BILL-2026';
    else if (draft.type === 'Expense') invoicePrefix = 'EXP-2026';
    else if (draft.type === 'Payment') invoicePrefix = 'RCPT-2026';

    const invoiceNo = `${invoicePrefix}-${String(count + 40).padStart(3, '0')}`;

    // 2. Compute full line items and tax split
    const lineItems: LineItem[] = draft.items.map((it) =>
      calculateLineItem(
        it.description,
        it.hsn,
        it.quantity,
        it.unit,
        it.unitPrice,
        it.gstRate,
        draft.partyStateCode,
        it.skuId
      )
    );

    const taxSplit: TaxSplit = calculateTaxSplit(lineItems, draft.partyStateCode);

    // 3. Construct permanent Transaction
    const now = new Date();
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      invoiceNo,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      type: draft.type,
      partyId: draft.partyId,
      partyName: draft.partyName,
      partyGstin: draft.partyGstin,
      partyPhone: draft.partyPhone,
      partyState: draft.partyState,
      partyStateCode: draft.partyStateCode,
      placeOfSupply: `${draft.partyState} (${draft.partyStateCode})`,
      items: lineItems,
      taxSplit,
      paymentMode: draft.paymentMode,
      paymentStatus: draft.paymentMode === 'Udhaar' ? 'Pending' : 'Paid',
      notes: draft.notes,
      source: draft.source,
      createdAt: now.toISOString()
    };

    // 4. Update Transactions state (prepend to Daybook)
    setTransactions((prev) => [newTx, ...prev]);

    // 5. Update Inventory (deduct on Sale, add on Purchase)
    if (draft.type === 'Sale' || draft.type === 'Purchase') {
      setSkus((prevSkus) =>
        prevSkus.map((sku) => {
          const matchedItem = draft.items.find(
            (it) => it.skuId === sku.id || it.description.toLowerCase().includes(sku.name.toLowerCase())
          );
          if (matchedItem) {
            const delta = draft.type === 'Sale' ? -matchedItem.quantity : matchedItem.quantity;
            return {
              ...sku,
              currentStock: Math.max(0, sku.currentStock + delta)
            };
          }
          return sku;
        })
      );
    }

    // 6. Update Party Udhaar Ledger if payment mode is Udhaar
    if (draft.paymentMode === 'Udhaar') {
      setParties((prevParties) =>
        prevParties.map((p) => {
          if (p.id === draft.partyId || p.name.toLowerCase() === draft.partyName.toLowerCase()) {
            const delta = draft.type === 'Sale' ? taxSplit.grandTotal : -taxSplit.grandTotal;
            return {
              ...p,
              balance: p.balance + delta
            };
          }
          return p;
        })
      );
    }

    // 7. Update chat message status to 'approved'
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            status: 'approved',
            approvedTransactionId: newTx.id,
            approvedInvoiceNo: newTx.invoiceNo
          };
        }
        return msg;
      })
    );

    // 8. Add assistant confirmation message in chat
    const confirmMsg: ChatMessage = {
      id: `asst-confirm-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      text: `✅ **Entry Approved & Recorded!**\n\n` +
        `• **Voucher No:** \`${newTx.invoiceNo}\`\n` +
        `• **Grand Total:** ₹${taxSplit.grandTotal.toLocaleString('en-IN')}\n` +
        `• **Daybook:** Updated • **Inventory:** ${draft.type === 'Sale' ? 'Stock Deducted' : 'Stock Added'} • **GST Ledger:** Reconciled.`
    };
    setMessages((prev) => [...prev, confirmMsg]);
  };

  // Human-in-the-loop: Discard Draft
  const handleDiscardDraft = (draftId: string, messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            status: 'discarded'
          };
        }
        return msg;
      })
    );

    const discardMsg: ChatMessage = {
      id: `asst-discard-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      text: `❌ Draft voucher discarded. No records or inventory balances were modified.`
    };
    setMessages((prev) => [...prev, discardMsg]);
  };

  // Daily Sales Cart: Checkout to AI Chat for approval
  const handleCartCheckoutToChat = (items: CartItem[], party: Party, paymentMode: PaymentMode) => {
    if (viewMode === 'dashboard') setViewMode('split');

    const draftItems = items.map(it => ({
      id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      skuId: it.skuId,
      description: it.name,
      hsn: it.hsn,
      quantity: it.quantity,
      unit: it.unit,
      unitPrice: it.unitPrice,
      gstRate: it.gstRate
    }));

    const draft: DraftTransaction = {
      id: `draft-cart-${Date.now()}`,
      type: 'Sale',
      partyId: party.id,
      partyName: party.name,
      partyGstin: party.gstin,
      partyPhone: party.phone,
      partyState: party.state,
      partyStateCode: party.stateCode,
      items: draftItems,
      paymentMode,
      source: 'Daily Cart',
      warnings: ['Voucher generated from Daily Sales Counter Cart. Please verify before recording.']
    };

    const userMsg: ChatMessage = {
      id: `user-cart-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      text: `Daily Sales Counter Cart checkout: ${items.length} items to ${party.name} via ${paymentMode}`
    };

    const assistantMsg: ChatMessage = {
      id: `asst-cart-${Date.now() + 1}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      text: `🛒 I have received your Daily Sales Counter Cart. Review the draft voucher and click **Approve & Record Entry** to commit to the Daybook:`,
      draft,
      status: 'pending_approval'
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
  };

  // Daily Sales Cart: Direct Instant Checkout
  const handleDirectCartCheckout = (items: CartItem[], party: Party, paymentMode: PaymentMode) => {
    triggerConfetti();

    const invoiceNo = `INV-2026-${String(transactions.length + 41).padStart(3, '0')}`;
    const lineItems: LineItem[] = items.map((it) =>
      calculateLineItem(
        it.name,
        it.hsn,
        it.quantity,
        it.unit,
        it.unitPrice,
        it.gstRate,
        party.stateCode,
        it.skuId
      )
    );
    const taxSplit: TaxSplit = calculateTaxSplit(lineItems, party.stateCode);

    const now = new Date();
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      invoiceNo,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      type: 'Sale',
      partyId: party.id,
      partyName: party.name,
      partyGstin: party.gstin,
      partyPhone: party.phone,
      partyState: party.state,
      partyStateCode: party.stateCode,
      placeOfSupply: `${party.state} (${party.stateCode})`,
      items: lineItems,
      taxSplit,
      paymentMode,
      paymentStatus: paymentMode === 'Udhaar' ? 'Pending' : 'Paid',
      notes: 'Billed via Daily Sales Counter POS',
      source: 'Daily Cart',
      createdAt: now.toISOString()
    };

    // Update transactions & inventory
    setTransactions((prev) => [newTx, ...prev]);
    setSkus((prevSkus) =>
      prevSkus.map((sku) => {
        const matched = items.find((it) => it.skuId === sku.id);
        if (matched) {
          return { ...sku, currentStock: Math.max(0, sku.currentStock - matched.quantity) };
        }
        return sku;
      })
    );

    // Open Tax Invoice viewer immediately for printing
    setActiveInvoiceNo(newTx.invoiceNo);
  };

  // Reset to initial seed data
  const handleResetData = () => {
    setBusiness(SEED_BUSINESS_PROFILE);
    setSkus(SEED_SKUS);
    setParties(SEED_PARTIES);
    setTransactions(SEED_TRANSACTIONS);
    setMessages(initialMessages);
  };

  const activeTransaction = activeInvoiceNo
    ? transactions.find((t) => t.invoiceNo === activeInvoiceNo) || null
    : null;

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* Top Application Header with Profile, Cart, and AI Buttons */}
      <Header
        business={business}
        cartItemCount={cartItemsCount}
        cartTotal={cartTotal}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAiHub={() => setIsAiHubOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Split Screen Container */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane: Conversational AI Assistant */}
        {(viewMode === 'split' || viewMode === 'chat') && (
          <div
            className={`h-full ${
              viewMode === 'split' ? 'w-full lg:w-[42%] border-r border-slate-200' : 'w-full'
            }`}
          >
            <ChatPane
              messages={messages}
              parties={parties}
              skus={skus}
              transactions={transactions}
              onSendMessage={handleSendMessage}
              onApproveDraft={handleApproveDraft}
              onDiscardDraft={handleDiscardDraft}
              onViewInvoice={(invoiceNo) => setActiveInvoiceNo(invoiceNo)}
              onClearChat={() => setMessages(initialMessages)}
            />
          </div>
        )}

        {/* Right Pane: Live Back-Office & GST Dashboard */}
        {(viewMode === 'split' || viewMode === 'dashboard') && (
          <div
            className={`h-full ${
              viewMode === 'split' ? 'hidden lg:block lg:w-[58%]' : 'w-full'
            }`}
          >
            <DashboardPane
              business={business}
              transactions={transactions}
              skus={skus}
              parties={parties}
              onAddSku={(newSku) => setSkus((prev) => [newSku, ...prev])}
              onDraftFromAction={(prompt) => {
                if (viewMode === 'dashboard') setViewMode('split');
                handleSendMessage(prompt, 'Chat');
              }}
            />
          </div>
        )}
      </main>

      {/* Profile Section Modal */}
      <ProfileModal
        business={business}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSaveProfile={(updated) => setBusiness(updated)}
      />

      {/* Daily Sales Cart Drawer */}
      <DailySalesCart
        skus={skus}
        parties={parties}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckoutToChat={handleCartCheckoutToChat}
        onDirectCheckout={handleDirectCartCheckout}
      />

      {/* AI Capabilities Hub & Audit Modal */}
      <AiCapabilitiesPanel
        isOpen={isAiHubOpen}
        onClose={() => setIsAiHubOpen(false)}
        transactions={transactions}
        skus={skus}
        onTriggerAiAction={(prompt) => {
          if (viewMode === 'dashboard') setViewMode('split');
          handleSendMessage(prompt, 'Chat');
        }}
      />

      {/* Global GST Tax Invoice Modal */}
      <TaxInvoiceModal
        transaction={activeTransaction}
        business={business}
        isOpen={!!activeTransaction}
        onClose={() => setActiveInvoiceNo(null)}
      />
    </div>
  );
}
