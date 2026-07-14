import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Calendar, Key, CheckCircle, Info, MapPin, 
  Search, ArrowRight, Loader2, Gift, Clock, ShieldCheck 
} from 'lucide-react';
import { GiftCard, CLEANING_PACKAGES, OCCASION_THEMES, ADD_ONS } from '../types';
import GiftCardPreview from './GiftCardPreview';
import InteractiveCalendar from './InteractiveCalendar';

interface RedemptionPortalProps {
  initialCode?: string;
}

export default function RedemptionPortal({ initialCode = '' }: RedemptionPortalProps) {
  const [code, setCode] = useState(initialCode);
  const [card, setCard] = useState<GiftCard | null>(null);
  
  // Loading & error handling
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Scheduling details
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Sync with initial code if provided from admin simulations
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      handleLookup(initialCode);
    }
  }, [initialCode]);

  const handleLookup = async (lookupCode: string) => {
    if (!lookupCode.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setCard(null);
    setBookingSuccess(false);

    try {
      const res = await fetch(`/api/giftcards/${lookupCode.toUpperCase().trim()}`);
      if (!res.ok) {
        throw new Error('Gift Card not found. Please verify your code and try again.');
      }
      const data = await res.json();
      setCard(data);
      
      // If card is already scheduled, prefill the values to show booking details
      if (data.status === 'scheduled') {
        setScheduledDate(data.scheduledDate);
        setScheduledTime(data.scheduledTime);
        setAddressLine1(data.addressLine1 || '');
        setAddressLine2(data.addressLine2 || '');
        setCity(data.city || '');
        setState(data.state || '');
        setZipCode(data.zipCode || '');
        setSpecialInstructions(data.specialInstructions || '');
      }
    } catch (err: any) {
      console.error(err);
      setSearchError(err.message || 'Verification failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card || !scheduledDate || !scheduledTime || !addressLine1 || !city || !state || !zipCode) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/giftcards/${card.id}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledDate,
          scheduledTime,
          addressLine1,
          addressLine2,
          city,
          state,
          zipCode,
          specialInstructions
        })
      });

      if (!res.ok) {
        throw new Error('Failed to redeem gift card');
      }

      const updatedCard = await res.json();
      setCard(updatedCard);
      setBookingSuccess(true);
    } catch (err) {
      console.error(err);
      alert('An error occurred while booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPkg = card ? CLEANING_PACKAGES.find(p => p.id === card.packageId) : null;
  const cardAddOns = card ? ADD_ONS.filter(addon => card.addOns.includes(addon.id)) : [];

  return (
    <div className="w-full max-w-5xl mx-auto bg-white border border-[#F2EDE4] rounded-[32px] p-6 md:p-8 shadow-sm">
      
      {/* Code Input Lookup Stage */}
      {!card && (
        <div className="max-w-md mx-auto text-center py-12 space-y-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#E9EDEA] flex items-center justify-center border border-[#7C8D7C]/20">
            <Gift className="w-6 h-6 text-[#7C8D7C]" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-[#5D6B5D] tracking-tight">
              Redeem Your Professional Cleaning Gift Card
            </h3>
            <p className="text-xs text-[#8C8273] mt-1 px-4 leading-relaxed font-sans">
              Congratulations! Someone who cares about you has gifted you a meticulous professional home cleaning. Enter your gift code to get started.
            </p>
          </div>

          <div className="flex gap-2 p-1 bg-white border border-[#EBE3D5] rounded-2xl shadow-xs">
            <input
              type="text"
              id="gift-code-lookup-input"
              placeholder="e.g. GIFT-HOUS-R9T2"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-transparent text-xs text-[#5D6B5D] tracking-wider uppercase font-mono focus:outline-none placeholder:text-[#8C8273]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleLookup(code);
                }
              }}
            />
            <button
              type="button"
              id="gift-lookup-btn"
              disabled={isSearching || !code.trim()}
              onClick={() => handleLookup(code)}
              className="bg-[#7C8D7C] hover:bg-[#5D6B5D] disabled:opacity-50 text-white font-mono uppercase tracking-wider text-[10px] px-4 py-2.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  Verify Code
                </>
              )}
            </button>
          </div>

          {searchError && (
            <p className="text-xs font-mono text-red-700 bg-red-50 border border-red-200/50 rounded-lg py-2 px-3 text-left flex items-start gap-1.5 leading-relaxed">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-700 shrink-0 mt-1.5 animate-ping" />
              <span>{searchError}</span>
            </p>
          )}

          <div className="text-left pt-4 border-t border-[#EBE3D5] text-[10px] text-[#8C8273] leading-normal px-2">
            <span className="font-semibold block text-[#5D6B5D] mb-1 font-mono uppercase tracking-widest text-[8px]">Simulating Recipient Experience?</span>
            You can use the **Gifts Database Tracker** below to copy sample codes (e.g. <code className="font-mono bg-[#FAF8F5] border border-[#EBE3D5] px-1.5 py-0.5 rounded text-[#5D6B5D]">GIFT-WELCOME5</code>) or hit the "Simulate Receiving Email" button for instant redemption loading!
          </div>
        </div>
      )}

      {/* Gift Details & Redemption Layout */}
      {card && (
        <div className="space-y-8">
          
          {/* Top Info Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#EBE3D5] pb-5 gap-3">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#8C8273] block">Redemption Portal</span>
              <h3 className="font-serif text-lg font-bold text-[#5D6B5D] mt-0.5">
                Gift Card {card.id} Verified
              </h3>
            </div>
            
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-[#E9EDEA] text-[#7C8D7C] border border-[#7C8D7C]/20 rounded-full text-xs font-mono">
                🎁 Gift from {card.senderName}
              </span>
              <button
                type="button"
                id="reset-lookup-btn"
                onClick={() => {
                  setCard(null);
                  setCode('');
                  setBookingSuccess(false);
                }}
                className="text-xs text-[#8C8273] hover:text-[#5D6B5D] underline font-mono cursor-pointer"
              >
                Change Code
              </button>
            </div>
          </div>

          {/* Core Portal Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Gift presentation card artwork & messages */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#FAF8F5] border border-[#EBE3D5] rounded-[24px] p-6 shadow-xs text-center">
                <h4 className="font-serif text-sm font-semibold text-[#5D6B5D] mb-4 text-left border-b border-[#EBE3D5] pb-2">
                  Your Personalized E-Gift Card
                </h4>
                
                <GiftCardPreview
                  occasion={card.occasion}
                  recipientName={card.recipientName}
                  senderName={card.senderName}
                  personalMessage={card.personalMessage}
                  packageId={card.packageId}
                  addOnIds={card.addOns}
                  code={card.id}
                  showStatus={true}
                  status={card.status}
                />
              </div>

              {/* Package Summary */}
              {selectedPkg && (
                <div className="bg-white border border-[#F2EDE4] rounded-[24px] p-5 space-y-3">
                  <h4 className="font-serif text-sm font-semibold text-[#5D6B5D] border-b border-[#EBE3D5] pb-2">
                    Gifted Services
                  </h4>
                  <div className="space-y-1.5">
                    <span className="text-xs font-serif font-semibold text-[#5D6B5D] block">
                      {selectedPkg.name}
                    </span>
                    <p className="text-[11px] text-[#8C8273] leading-relaxed font-sans">
                      {selectedPkg.description}
                    </p>
                  </div>

                  {cardAddOns.length > 0 && (
                    <div className="pt-2.5 border-t border-dashed border-[#EBE3D5] space-y-1.5">
                      <span className="block text-[9px] font-mono uppercase tracking-widest text-[#8C8273]">Includes Premium Add-Ons</span>
                      <ul className="space-y-1">
                        {cardAddOns.map((addon) => (
                          <li key={addon.id} className="text-[10px] text-[#7C8D7C] font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7C8D7C] shrink-0" />
                            {addon.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Booking Calendar and Address form */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {bookingSuccess || card.status === 'scheduled' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-[#EBE3D5] p-6 md:p-8 rounded-[24px] text-center space-y-6"
                  >
                    <div className="mx-auto w-12 h-12 rounded-full bg-[#E9EDEA] flex items-center justify-center border border-[#7C8D7C]/20 text-[#7C8D7C]">
                      <CheckCircle className="w-6 h-6 stroke-2" />
                    </div>
                    
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[#7C8D7C] font-bold bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#EBE3D5]">
                        Appointment Confirmed
                      </span>
                      <h4 className="font-serif text-xl font-bold text-[#5D6B5D] mt-3">
                        Your Professional Clean is Scheduled!
                      </h4>
                      <p className="text-xs text-[#8C8273] mt-2 px-6 leading-relaxed font-sans">
                        Excellent choices! Our vetted professional team is preparing your organic essential oils and HEPA equipment. We will arrive promptly.
                      </p>
                    </div>

                    <div className="bg-[#FAF8F5] border border-[#EBE3D5] rounded-2xl p-4 max-w-md mx-auto text-left space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-[#EBE3D5] text-xs">
                        <span className="font-mono text-[8px] uppercase tracking-wider text-[#8C8273]">Scheduled Time</span>
                        <span className="font-mono font-bold text-[#7C8D7C]">{card.scheduledTime}</span>
                      </div>
                      <div className="flex justify-between items-start text-xs">
                        <span className="font-mono text-[8px] uppercase tracking-wider text-[#8C8273] pt-0.5 shrink-0">Date</span>
                        <span className="font-serif font-semibold text-[#5D6B5D] text-right">
                          {new Date(card.scheduledDate || '').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex justify-between items-start text-xs border-t border-[#EBE3D5] pt-2">
                        <span className="font-mono text-[8px] uppercase tracking-wider text-[#8C8273] pt-0.5 shrink-0">Service Address</span>
                        <span className="font-sans text-[#5D6B5D] text-right">
                          {card.addressLine1} {card.addressLine2 && `, ${card.addressLine2}`} <br />
                          {card.city}, {card.state} {card.zipCode}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EBE3D5] max-w-md mx-auto flex items-center gap-2.5 text-left text-[11px] text-[#8C8273] leading-normal">
                      <ShieldCheck className="w-5 h-5 stroke-1.5 shrink-0 text-[#7C8D7C]" />
                      <span>
                        Need to reschedule? Call our concierge service at **(800) 555-0199** with code <code className="font-mono bg-white px-1.5 py-0.5 border border-[#EBE3D5] rounded text-[#7C8D7C]">{card.id}</code> up to 24 hours prior.
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleBookService}
                    className="space-y-6"
                  >
                    <div className="space-y-1.5 text-left">
                      <h4 className="font-serif text-base font-semibold text-[#5D6B5D] tracking-tight">
                        Choose your preferred service date & time
                      </h4>
                      <p className="text-xs text-[#8C8273] leading-normal font-sans">
                        Our integrated calendar shows guaranteed service crew slots. Select one below.
                      </p>
                    </div>

                    <InteractiveCalendar
                      selectedDate={scheduledDate}
                      selectedTime={scheduledTime}
                      onChange={(date, time) => {
                        setScheduledDate(date);
                        setScheduledTime(time);
                      }}
                    />

                    {/* Address entry */}
                    <div className="bg-white border border-[#F2EDE4] p-5 rounded-[24px] text-left space-y-4">
                      <div className="flex items-center gap-1.5 text-[#5D6B5D] font-serif font-bold text-sm border-b border-[#EBE3D5] pb-2">
                        <MapPin className="w-4 h-4 text-[#7C8D7C]" />
                        <span>Where should we clean?</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[9px] text-[#8C8273] font-mono uppercase">Street Address *</label>
                          <input
                            type="text"
                            id="redeem-address1-input"
                            required
                            placeholder="e.g. 248 Maple Street"
                            value={addressLine1}
                            onChange={(e) => setAddressLine1(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#EBE3D5] bg-[#FAF8F5] text-xs focus:outline-none focus:border-[#7C8D7C]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-[#8C8273] font-mono uppercase">Apt/Suite</label>
                          <input
                            type="text"
                            id="redeem-address2-input"
                            placeholder="Apt 4"
                            value={addressLine2}
                            onChange={(e) => setAddressLine2(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#EBE3D5] bg-[#FAF8F5] text-xs focus:outline-none focus:border-[#7C8D7C]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] text-[#8C8273] font-mono uppercase">City *</label>
                          <input
                            type="text"
                            id="redeem-city-input"
                            required
                            placeholder="Portland"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#EBE3D5] bg-[#FAF8F5] text-xs focus:outline-none focus:border-[#7C8D7C]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-[#8C8273] font-mono uppercase">State *</label>
                          <input
                            type="text"
                            id="redeem-state-input"
                            required
                            placeholder="OR"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#EBE3D5] bg-[#FAF8F5] text-xs focus:outline-none focus:border-[#7C8D7C]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-[#8C8273] font-mono uppercase">Zip Code *</label>
                          <input
                            type="text"
                            id="redeem-zip-input"
                            required
                            placeholder="97201"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#EBE3D5] bg-[#FAF8F5] text-xs focus:outline-none focus:border-[#7C8D7C]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-[#8C8273] font-mono uppercase">Special Access or Crew Instructions</label>
                        <textarea
                          id="redeem-instructions-textarea"
                          rows={3}
                          placeholder="e.g. Call my cell upon arrival to get buzzed in. Please focus on wiping inside the kitchen drawers."
                          value={specialInstructions}
                          onChange={(e) => setSpecialInstructions(e.target.value)}
                          className="w-full p-3 rounded-lg border border-[#EBE3D5] bg-[#FAF8F5] text-xs focus:outline-none focus:border-[#7C8D7C]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      id="redeem-submit-booking-btn"
                      disabled={isSubmitting || !scheduledDate || !scheduledTime || !addressLine1 || !city || !state || !zipCode}
                      className="w-full bg-[#7C8D7C] hover:bg-[#5D6B5D] text-white font-mono tracking-wider uppercase font-bold text-xs py-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Scheduling Your Appointment...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4" />
                          Confirm Cleaning Appointment
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
