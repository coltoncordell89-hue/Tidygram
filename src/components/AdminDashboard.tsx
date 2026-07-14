import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Calendar, CheckCircle2, Mail, ExternalLink, RefreshCw, 
  Trash2, Search, Clock, DollarSign, Gift, Loader2, Copy, AlertCircle, Inbox, Smartphone,
  ArrowRight
} from 'lucide-react';
import { GiftCard, CLEANING_PACKAGES } from '../types';

interface AdminDashboardProps {
  onSimulateRedeem: (code: string) => void;
  refreshTrigger: number;
}

export default function AdminDashboard({ onSimulateRedeem, refreshTrigger }: AdminDashboardProps) {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Simulation Email modal
  const [simulatedEmailCard, setSimulatedEmailCard] = useState<GiftCard | null>(null);

  // Fetch cards from backend
  const fetchCards = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/giftcards');
      if (!res.ok) {
        throw new Error('Failed to load tracking data from server');
      }
      const data = await res.json();
      setCards(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch gift database.');
    } finally {
      setIsLoading(false);
    }
  };

  // Complete clean trigger
  const handleMarkComplete = async (code: string) => {
    try {
      const res = await fetch(`/api/giftcards/${code}/complete`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchCards();
      }
    } catch (error) {
      console.error('Failed to complete clean:', error);
    }
  };

  // Refresh upon triggers (like booking completed)
  useEffect(() => {
    fetchCards();
  }, [refreshTrigger]);

  // Statistics calculation
  const totalSent = cards.length;
  const activeUnredeemed = cards.filter(c => c.status === 'unredeemed').length;
  const activeScheduled = cards.filter(c => c.status === 'scheduled').length;
  const completedJobs = cards.filter(c => c.status === 'completed').length;
  
  // Total economic value generated
  const totalValue = cards.reduce((acc, card) => {
    const pkg = CLEANING_PACKAGES.find(p => p.id === card.packageId);
    return acc + (pkg ? pkg.price : 0);
  }, 0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied gift code: ${text}`);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Overview Statistics Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#F2EDE4] p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-[#E9EDEA] text-[#7C8D7C] border border-[#7C8D7C]/10 shrink-0">
            <Gift className="w-5 h-5 stroke-1.5" />
          </div>
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-wider text-[#8C8273]">Total Gifts Issued</span>
            <span className="font-mono text-lg font-bold text-[#5D6B5D]">{totalSent}</span>
          </div>
        </div>

        <div className="bg-white border border-[#F2EDE4] p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-100/50 shrink-0">
            <Calendar className="w-5 h-5 stroke-1.5" />
          </div>
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-wider text-[#8C8273]">Scheduled Cleans</span>
            <span className="font-mono text-lg font-bold text-[#5D6B5D]">{activeScheduled}</span>
          </div>
        </div>

        <div className="bg-white border border-[#F2EDE4] p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100/50 shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-1.5" />
          </div>
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-wider text-[#8C8273]">Cleans Completed</span>
            <span className="font-mono text-lg font-bold text-[#5D6B5D]">{completedJobs}</span>
          </div>
        </div>

        <div className="bg-white border border-[#F2EDE4] p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-[#FAF8F5] text-[#7C8D7C] border border-[#EBE3D5] shrink-0">
            <DollarSign className="w-5 h-5 stroke-1.5" />
          </div>
          <div>
            <span className="block text-[9px] font-mono uppercase tracking-wider text-[#8C8273]">Total Bookings Volume</span>
            <span className="font-mono text-lg font-bold text-[#5D6B5D]">${totalValue}</span>
          </div>
        </div>
      </div>

      {/* Main Database Table Container */}
      <div className="bg-white border border-[#F2EDE4] rounded-[32px] overflow-hidden p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#EBE3D5] gap-3 mb-4">
          <div>
            <h3 className="font-serif text-base font-semibold text-[#5D6B5D]">
              Gift registry & Booking Database
            </h3>
            <p className="text-xs text-[#8C8273] mt-0.5">
              Live tracking log of all cleaning e-gift cards and automated schedule bookings.
            </p>
          </div>

          <button
            type="button"
            id="refresh-db-btn"
            onClick={fetchCards}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-[#EBE3D5] rounded-xl text-xs font-mono tracking-wider text-[#8C8273] hover:bg-[#F2EDE4] hover:text-[#5D6B5D] disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Refresh Registry
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Database List */}
        {cards.length === 0 && !isLoading ? (
          <div className="text-center py-12 border border-dashed border-[#EBE3D5] rounded-2xl bg-[#FAF8F5]">
            <Inbox className="w-8 h-8 text-[#8C8273] stroke-1.5 mx-auto mb-2" />
            <p className="font-serif text-sm text-[#8C8273] italic">No active gift bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card) => {
              const pkgName = CLEANING_PACKAGES.find(p => p.id === card.packageId)?.name || card.packageId;
              
              return (
                <div
                  key={card.id}
                  id={`admin-card-row-${card.id}`}
                  className="bg-white border border-[#F2EDE4] rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-[#7C8D7C]/30 hover:shadow-sm"
                >
                  <div className="space-y-2 flex-1 min-w-0 w-full">
                    
                    {/* Badge and Code row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#5D6B5D] bg-[#E9EDEA]/50 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 border border-[#EBE3D5]">
                        <code>{card.id}</code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(card.id)}
                          className="hover:text-[#7C8D7C] text-[#8C8273] shrink-0"
                          title="Copy Code"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </span>

                      <span className="font-mono text-[9px] uppercase bg-[#FAF8F5] text-[#8C8273] border border-[#EBE3D5] px-2 py-0.5 rounded-md">
                        Occasion: {card.occasion.replace('_', ' ')}
                      </span>

                      {card.status === 'unredeemed' && (
                        <span className="px-2 py-0.5 text-[9px] font-mono font-medium rounded-md bg-[#E9EDEA] text-[#7C8D7C] border border-[#7C8D7C]/20">
                          ● Unredeemed (Ready)
                        </span>
                      )}
                      {card.status === 'scheduled' && (
                        <span className="px-2 py-0.5 text-[9px] font-mono font-medium rounded-md bg-blue-50 text-blue-800 border border-blue-200 animate-pulse">
                          📅 Scheduled
                        </span>
                      )}
                      {card.status === 'completed' && (
                        <span className="px-2 py-0.5 text-[9px] font-mono font-medium rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ✓ Completed
                        </span>
                      )}
                    </div>

                    {/* People & Package Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                      <div>
                        <span className="text-[#8C8273] font-mono text-[9px] uppercase block">Sender & Recipient</span>
                        <p className="text-[#4A4A4A] font-medium leading-tight">
                          From <strong className="text-[#5D6B5D]">{card.senderName}</strong> to <strong className="text-[#5D6B5D]">{card.recipientName}</strong>
                        </p>
                        {card.recipientEmail && (
                          <span className="text-[10px] text-[#8C8273] font-mono">{card.recipientEmail}</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[#8C8273] font-mono text-[9px] uppercase block">Cleaning Package</span>
                        <p className="text-[#5D6B5D] font-serif font-semibold truncate leading-tight">
                          {pkgName}
                        </p>
                        {card.addOns.length > 0 && (
                          <span className="text-[9px] text-[#7C8D7C] block font-semibold">+ {card.addOns.length} customization add-ons</span>
                        )}
                      </div>
                    </div>

                    {/* Scheduling Details */}
                    {card.status === 'scheduled' && (
                      <div className="bg-[#FAF8F5] border border-[#EBE3D5] p-2.5 rounded-xl text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 leading-tight">
                        <div>
                          <span className="text-[8px] font-mono text-[#8C8273] uppercase block">Appointment</span>
                          <span className="font-serif font-bold text-[#5D6B5D]">
                            📅 {new Date(card.scheduledDate || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="font-mono text-[#7C8D7C] font-semibold ml-2">({card.scheduledTime})</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-mono text-[#8C8273] uppercase block">Service Location</span>
                          <span className="text-[#5D6B5D] truncate block max-w-[250px]">
                            📍 {card.addressLine1}, {card.city}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions / Interactive Simulator Columns */}
                  <div className="flex flex-wrap md:flex-col justify-end gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-neutral-100">
                    
                    {/* 1. Simulate Recipient Receiving Email */}
                    {card.deliveryMethod === 'email' && (
                      <button
                        type="button"
                        id={`sim-email-btn-${card.id}`}
                        onClick={() => setSimulatedEmailCard(card)}
                        className="flex-1 md:flex-initial px-3 py-2 bg-white border border-[#EBE3D5] hover:bg-[#F7F9F7] hover:text-[#7C8D7C] hover:border-[#7C8D7C] rounded-xl text-[10px] font-mono tracking-wide uppercase text-[#8C8273] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Simulate Email
                      </button>
                    )}

                    {/* 2. Redeem / Schedule */}
                    {card.status === 'unredeemed' && (
                      <button
                        type="button"
                        id={`sim-redeem-btn-${card.id}`}
                        onClick={() => onSimulateRedeem(card.id)}
                        className="flex-1 md:flex-initial px-3 py-2 bg-[#7C8D7C] hover:bg-[#5D6B5D] text-white rounded-xl text-[10px] font-mono tracking-wide uppercase font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Redeem / Schedule
                      </button>
                    )}

                    {/* 3. Mark Complete */}
                    {card.status === 'scheduled' && (
                      <button
                        type="button"
                        id={`sim-complete-btn-${card.id}`}
                        onClick={() => handleMarkComplete(card.id)}
                        className="flex-1 md:flex-initial px-3 py-2 bg-[#7C8D7C] hover:bg-[#5D6B5D] text-white rounded-xl text-[10px] font-mono tracking-wide uppercase font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Complete Job
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Simulated Email Receiver inbox */}
      <AnimatePresence>
        {simulatedEmailCard && (
          <div className="fixed inset-0 bg-[#5D6B5D]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#EBE3D5] rounded-[32px] max-w-lg w-full overflow-hidden shadow-2xl flex flex-col"
            >
              
              {/* Header mimicking an email inbox shell */}
              <div className="bg-[#FAF8F5] border-b border-[#EBE3D5] p-4 flex justify-between items-center text-xs text-[#8C8273] font-mono leading-relaxed">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="ml-2 font-semibold text-[#5D6B5D]">Recipient Inbox Simulation</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSimulatedEmailCard(null)}
                  className="font-bold hover:text-[#5D6B5D] cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {/* Email Envelope details */}
              <div className="p-4 border-b border-dashed border-[#EBE3D5] text-xs space-y-1.5 bg-[#FAF8F5]/40 text-left">
                <div>
                  <span className="text-[#8C8273] font-mono">From:</span> concierge@sanctuaryclean.com
                </div>
                <div>
                  <span className="text-[#8C8273] font-mono">To:</span> {simulatedEmailCard.recipientEmail || simulatedEmailCard.recipientName.replace(' ', '.').toLowerCase() + '@example.com'}
                </div>
                <div>
                  <span className="text-[#8C8273] font-mono">Subject:</span> 🎁 A gorgeous gift of home sanctuary from {simulatedEmailCard.senderName}!
                </div>
              </div>

              {/* Email body (renders actual gift card presentation) */}
              <div className="p-6 overflow-y-auto max-h-[400px] bg-neutral-50/50 space-y-6">
                
                <div className="max-w-xs mx-auto text-center space-y-2">
                  <span className="text-3xl">🌸</span>
                  <h4 className="font-serif text-lg font-bold text-[#5D6B5D]">A Gift of Pristine Sanctuary</h4>
                  <p className="text-[10px] text-[#8C8273] font-mono uppercase tracking-widest leading-none">Professional Cleaning service E-Card</p>
                </div>

                <div className="p-4 bg-white border border-[#EBE3D5] rounded-3xl shadow-sm space-y-4">
                  <div className="text-center p-3 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-white border border-[#EBE3D5] text-[#5D6B5D] font-serif">
                    <span className="block text-[9px] font-mono uppercase tracking-widest opacity-85">GREETING</span>
                    <h5 className="font-bold text-base leading-snug mt-1">Hello, {simulatedEmailCard.recipientName}!</h5>
                    <p className="text-[11px] leading-relaxed italic px-2 mt-2 font-serif text-[#4A4A4A]">
                      "{simulatedEmailCard.personalMessage}"
                    </p>
                    <span className="block text-[9px] text-right mt-3 font-semibold">— {simulatedEmailCard.senderName}</span>
                  </div>

                  <div className="p-3.5 bg-[#FAF8F5] border border-[#EBE3D5] rounded-2xl text-left space-y-2 text-xs">
                    <div>
                      <span className="text-[8px] font-mono uppercase tracking-widest text-[#8C8273] block">Gifted Package Details</span>
                      <strong className="text-[#5D6B5D] font-serif">
                        {CLEANING_PACKAGES.find(p => p.id === simulatedEmailCard.packageId)?.name || simulatedEmailCard.packageId}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center text-xs border-t border-[#EBE3D5] pt-2 font-mono">
                      <span className="text-[#8C8273]">REDEEM CODE</span>
                      <strong className="text-[#7C8D7C] text-sm font-bold bg-white border border-[#EBE3D5] px-2 py-0.5 rounded-md">
                        {simulatedEmailCard.id}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Simulated Email Button */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      onSimulateRedeem(simulatedEmailCard.id);
                      setSimulatedEmailCard(null);
                    }}
                    className="inline-flex items-center gap-1.5 bg-[#7C8D7C] hover:bg-[#5D6B5D] text-white text-[11px] font-mono tracking-wider uppercase font-bold px-5 py-2.5 rounded-2xl shadow-sm cursor-pointer transition-colors"
                  >
                    <span>Click to Redeem & Schedule Your Clean</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[9px] text-[#8C8273] mt-2 font-sans">
                    Clicking this mimics clicking the link in the recipient's email inbox, opening the scheduling scheduler immediately.
                  </p>
                </div>

              </div>

              {/* Inbox footer */}
              <div className="p-3 bg-[#FAF8F5] border-t border-[#EBE3D5] text-center text-[10px] font-mono text-[#8C8273]">
                Demo Mailer Agent v1.2 — Safe sandbox container
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
