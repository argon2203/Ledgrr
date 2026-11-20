'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  Paperclip, 
  Sparkles, 
  Bot, 
  User, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  FileText, 
  Image as ImageIcon,
  Clock,
  RotateCcw,
  Play,
  Pause,
  ShoppingCart
} from 'lucide-react';
import { ChatMessage, DraftTransaction, Party, SKU, Transaction } from '@/types/accounting';
import { DraftApprovalCard } from './DraftApprovalCard';
import { QuickTriggers } from './QuickTriggers';
import { VoiceRecorderModal } from './VoiceRecorderModal';
import { BillUploadModal } from './BillUploadModal';
import { SamplePreset } from '@/data/seedData';

interface ChatPaneProps {
  messages: ChatMessage[];
  parties: Party[];
  skus: SKU[];
  transactions: Transaction[];
  onSendMessage: (text: string, source?: 'Chat' | 'Voice' | 'Bill OCR' | 'Supplier PDF' | 'Daily Cart', attachment?: any) => void;
  onApproveDraft: (draft: DraftTransaction, messageId: string) => void;
  onDiscardDraft: (draftId: string, messageId: string) => void;
  onViewInvoice: (invoiceNo: string) => void;
  onClearChat: () => void;
}

export function ChatPane({
  messages,
  parties,
  skus,
  transactions,
  onSendMessage,
  onApproveDraft,
  onDiscardDraft,
  onViewInvoice,
  onClearChat
}: ChatPaneProps) {
  const [inputText, setInputText] = useState('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playingAudioMsgId, setPlayingAudioMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), 'Chat');
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTriggerSelect = (preset: SamplePreset) => {
    onSendMessage(
      preset.prompt,
      preset.category === 'Voice' ? 'Voice' :
      preset.category === 'Handwritten Bill' ? 'Bill OCR' :
      preset.category === 'Supplier PDF' ? 'Supplier PDF' : 'Chat',
      preset.attachment
    );
  };

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*_#`•]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-IN';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const toggleAudioPlayback = (msgId: string) => {
    if (playingAudioMsgId === msgId) {
      setPlayingAudioMsgId(null);
    } else {
      setPlayingAudioMsgId(msgId);
      setTimeout(() => {
        setPlayingAudioMsgId(null);
      }, 3500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Chat Pane Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="text-sm font-bold text-slate-900">Conversational AI Assistant</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-slate-500">
              Multimodal GST & MSME Copilot • Audio, OCR & Hinglish
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClearChat}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
          title="Restart conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isPlayingThisAudio = playingAudioMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[95%] sm:max-w-[85%] ${
                  isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-2xs ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Message Content */}
                <div className="space-y-1.5 w-full">
                  <div
                    className={`p-3 rounded-2xl text-xs sm:text-sm shadow-2xs ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-slate-100 text-slate-900 rounded-tl-xs border border-slate-200'
                    }`}
                  >
                    {/* Audio note player card if user sent voice */}
                    {msg.attachment?.type === 'audio' && (
                      <div
                        className={`mb-2.5 p-2 rounded-xl flex items-center space-x-2.5 text-xs font-medium border ${
                          isUser
                            ? 'bg-indigo-700/80 border-indigo-400 text-white'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleAudioPlayback(msg.id)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                            isUser ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white'
                          }`}
                        >
                          {isPlayingThisAudio ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 ml-0.5" />
                          )}
                        </button>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold truncate">
                              {msg.attachment.name || 'Voice Note'}
                            </span>
                            <span className="font-mono text-[10px] opacity-80">
                              {msg.attachment.size || '0:04'}
                            </span>
                          </div>

                          {/* Animated soundwave bars */}
                          <div className="flex items-center space-x-1 h-3">
                            {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95].map((h, i) => (
                              <div
                                key={i}
                                className={`w-1 rounded-full transition-all duration-100 ${
                                  isPlayingThisAudio
                                    ? isUser
                                      ? 'bg-white'
                                      : 'bg-indigo-600'
                                    : isUser
                                    ? 'bg-indigo-300'
                                    : 'bg-slate-300'
                                }`}
                                style={{
                                  height: isPlayingThisAudio ? `${(h * 1.2) % 100}%` : '30%'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Image / PDF attachment badge */}
                    {msg.attachment && msg.attachment.type !== 'audio' && (
                      <div
                        className={`mb-2 p-2 rounded-lg flex items-center space-x-2 text-xs font-medium border ${
                          isUser
                            ? 'bg-indigo-700/60 border-indigo-500 text-indigo-100'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {msg.attachment.type === 'pdf' ? (
                          <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-blue-400 shrink-0" />
                        )}
                        <span className="truncate flex-1">{msg.attachment.name}</span>
                        {msg.attachment.size && (
                          <span className="text-[10px] opacity-75">{msg.attachment.size}</span>
                        )}
                      </div>
                    )}

                    {/* Formatted Text Message */}
                    <div className="whitespace-pre-line leading-relaxed">
                      {msg.text}
                    </div>

                    {/* Speech / Audio button for assistant */}
                    {!isUser && msg.text && (
                      <div className="mt-1.5 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{msg.timestamp}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSpeak(msg.text)}
                          className="hover:text-indigo-600 flex items-center space-x-1"
                          title="Listen to response"
                        >
                          {isSpeaking ? (
                            <VolumeX className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                          <span>Read aloud</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Interactive Draft Approval Card */}
                  {msg.draft && (
                    <DraftApprovalCard
                      draft={msg.draft}
                      parties={parties}
                      status={msg.status}
                      approvedInvoiceNo={msg.approvedInvoiceNo}
                      onApprove={(updatedDraft) => onApproveDraft(updatedDraft, msg.id)}
                      onDiscard={(draftId) => onDiscardDraft(draftId, msg.id)}
                      onViewInvoice={onViewInvoice}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Triggers Carousel */}
      <QuickTriggers
        onSelectTrigger={handleTriggerSelect}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenBillModal={() => setIsBillModalOpen(true)}
      />

      {/* Input Bar with Voice Recording System Button */}
      <div className="p-3 bg-white border-t border-slate-200">
        <div className="flex items-end space-x-2 bg-slate-50 border border-slate-300 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500 transition-all">
          {/* Action Buttons: Voice Record & Document Upload */}
          <div className="flex items-center space-x-1 pb-1 pl-1">
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors relative"
              title="Record or Simulate Voice Note"
            >
              <Mic className="w-4 h-4 text-indigo-600" />
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-1 right-1 animate-ping"></span>
            </button>

            <button
              type="button"
              onClick={() => setIsBillModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Upload Handwritten Bill or Supplier PDF"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          {/* Auto-expanding Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type in English or Hinglish (e.g. Ramesh Traders ko 12 bags cement becha 420 pe UPI)..."
            className="flex-1 bg-transparent border-0 focus:ring-0 text-xs sm:text-sm text-slate-900 placeholder-slate-400 py-1.5 px-2 resize-none max-h-24 overflow-y-auto leading-relaxed"
          />

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shrink-0 shadow-xs transition-all disabled:pointer-events-none"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[10px] text-slate-400 text-center mt-1.5">
          Press <strong>Enter</strong> to send • <strong>Shift+Enter</strong> for newline • Voice notes transcribed via Web Speech & Audio API
        </p>
      </div>

      {/* Advanced Voice Recording Modal */}
      <VoiceRecorderModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSubmitVoice={(transcript, audioMeta) => {
          onSendMessage(transcript, 'Voice', {
            name: audioMeta?.name || 'voice_recording.mp3',
            type: 'audio',
            size: audioMeta?.duration || '0:04'
          });
        }}
      />

      {/* Bill OCR & PDF Upload Modal */}
      <BillUploadModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        onSubmitUpload={(text, attachment) => {
          onSendMessage(
            text,
            attachment.type === 'pdf' ? 'Supplier PDF' : 'Bill OCR',
            attachment
          );
        }}
      />
    </div>
  );
}
