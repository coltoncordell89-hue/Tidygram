import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Check, ChevronRight, ChevronLeft, CreditCard, Gift, Mail, 
  Printer, ArrowRight, Calendar, Info, Clock, Loader2, Copy 
} from 'lucide-react';
import { OccasionType, CLEANING_PACKAGES, ADD_ONS, OCCASION_THEMES, GiftCard } from '../types';
import GiftCardPreview from './GiftCardPreview';
import InteractiveCalendar from './InteractiveCalendar';

interface GiftCardFormProps {
  onSuccess: (card: GiftCard) => void;
}

export default function GiftCardForm({ onSuccess }: GiftCardFormProps) {
  const [step, setStep] = useState(1);
  
  // State for card construction
  const [occasion, setOccasion] = useState<OccasionType>('housewarming');
  const [packageId, setPackageId] = useState('golden_touch');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  
  // AI message drafting state
  const [aiPromptHint, setAiPromptHint] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Delivery & Scheduling
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'print'>('email');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [shouldPreSchedule, setShouldPreSchedule] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Checkout loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPkg = CLEANING_PACKAGES.find(p => p.id === packageId) || CLEANING_PACKAGES[0];
  const activeTheme = OCCASION_THEMES[occasion];

  // Price calculations
  const packagePrice = selectedPkg.price;
  const addOnsPrice = ADD_ONS
    .filter(addon => selectedAddOns.includes(addon.id))
    .reduce((total, addon) => total + addon.price, 0);
  const totalPrice = packagePrice + addOnsPrice;

  // Toggle add-on helper
  const handleAddOnToggle = (id: string) => {
    if (selectedAddOns.includes(id)) {
      setSelectedAddOns(selectedAddOns.filter(item => item !== id));
    } else {
      setSelectedAddOns([...selectedAddOns, id]);
    }
  };

  // Draft greeting using Gemini AI endpoint
  const handleAiDraft = async () => {
    if (!senderName || !recipientName) {
      setAiError('Please enter Sender and Recipient names first so Gemini can personalize your note!');
      return;
    }
    
    setIsAiLoading(true);
    setAiError(null);
    
    try {
      const res = await fetch('/api/giftcards/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion,
          senderName,
          recipientName,
          promptHint: aiPromptHint
        })
      });
      
      const data = await res.json();
      if (res.ok && data.message) {
        setPersonalMessage(data.message);
      } else {
        throw new Error(data.error || 'Server returned empty response');
      }
    } catch (err: any) {
      console.error(err);
      setAiError('Failed to generate. Using high-quality default. Type your own or retry.');
      // set high quality default fallback
      setPersonalMessage(`Dear ${recipientName},\n\nI wanted to gift you some extra peace of mind and clean comfort. Please enjoy this professional cleaning service on me—you deserve to relax and let someone else do the dusting for once!\n\nWith warm wishes,\n${senderName}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Validate form steps
  const canGoNext = () => {
    if (step === 1) return !!occasion;
    if (step === 2) return !!packageId;
    if (step === 3) {
      return recipientName.trim() !== '' && senderName.trim() !== '' && personalMessage.trim() !== '';
    }
    if (step === 4) {
      if (deliveryMethod === 'email' && !recipientEmail) return false;
      if (shouldPreSchedule) {
        return !!scheduledDate && !!scheduledTime && !!addressLine1 && !!city && !!state && !!zipCode;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (canGoNext() && step < 5) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Submit flow - Create Card on backend
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        occasion,
        recipientName,
        recipientEmail,
        senderName,
        senderEmail,
        personalMessage,
        packageId,
        addOns: selectedAddOns,
        deliveryDate,
        deliveryMethod
      };

      if (shouldPreSchedule && scheduledDate && scheduledTime) {
        payload.scheduledDate = scheduledDate;
        payload.scheduledTime = scheduledTime;
        payload.addressLine1 = addressLine1;
        payload.addressLine2 = addressLine2;
        payload.city = city;
        payload.state = state;
        payload.zipCode = zipCode;
        payload.specialInstructions = specialInstructions;
        payload.status = 'scheduled';
      }

      const res = await fetch('/api/giftcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to book gift card');
      }

      const createdCard = await res.json();
      
      // If we immediately scheduled it, redeem it!
      if (shouldPreSchedule && scheduledDate && scheduledTime) {
        const redeemRes = await fetch(`/api/giftcards/${createdCard.id}/redeem`, {
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
        const redeemedCard = await redeemRes.json();
        onSuccess(redeemedCard);
      } else {
        onSuccess(createdCard);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render different wizard sections
  const renderWizardStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-left"
          >
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#1C1917] tracking-tight">
                For which occasion is this gift?
              </h3>
              <p className="text-xs text-[#8C7A5C] mt-1 font-sans">
                Each occasion includes a bespoke artwork template, typography, and card presentation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(OCCASION_THEMES) as OccasionType[]).map((key) => {
                const theme = OCCASION_THEMES[key];
                const isSelected = occasion === key;
                return (
                  <button
                    key={key}
                    type="button"
                    id={`occasion-btn-${key}`}
                    onClick={() => {
                      setOccasion(key);
                      // Clear prompt hint on switch to provide context
                      setAiPromptHint('');
                    }}
                    className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between h-28 relative overflow-hidden
                      ${theme.bg} ${theme.border}
                      ${isSelected ? 'ring-2 ring-[#7C8D7C] scale-102 shadow-md' : 'opacity-85 hover:opacity-100'}
                    `}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[#1C1917]/70">
                        {key.replace('_', ' ')}
                      </span>
                      {isSelected && (
                        <span className="bg-[#7C8D7C] text-white rounded-full p-0.5 shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className={`text-lg font-semibold tracking-tight ${theme.font} ${theme.text}`}>
                        {theme.title}
                      </h4>
                      <p className="text-[10px] text-[#1C1917]/75 font-sans italic mt-0.5">
                        {theme.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5 text-left"
          >
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#5D6B5D] tracking-tight">
                Choose a professional cleaning package
              </h3>
              <p className="text-xs text-[#8C8273] mt-1">
                Select from our meticulous service options. Prices are flat-rate and fully inclusive.
              </p>
            </div>

            {/* Packages Grid */}
            <div className="space-y-3">
              {CLEANING_PACKAGES.map((pkg) => {
                const isSelected = packageId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    id={`package-card-${pkg.id}`}
                    onClick={() => setPackageId(pkg.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col md:flex-row justify-between gap-4 bg-white
                      ${isSelected 
                        ? 'border-[#7C8D7C] bg-[#F7F9F7] shadow-sm ring-1 ring-[#7C8D7C]' 
                        : 'border-[#EBE3D5] hover:border-[#D1C5B0] hover:bg-neutral-50/50'
                      }
                    `}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#7C8D7C]' : 'bg-neutral-300'}`} />
                        <h4 className="font-serif text-sm font-bold text-[#5D6B5D]">{pkg.name}</h4>
                      </div>
                      <p className="text-[11px] text-[#4A4A4A] leading-relaxed">
                        {pkg.description}
                      </p>
                      
                      <div className="pt-2">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-[#8C8273] block mb-1">Includes</span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                          {pkg.features.map((feat, fIdx) => (
                            <li key={fIdx} className="text-[10px] text-[#4A4A4A] flex items-start gap-1">
                              <span className="text-[#7C8D7C] mt-0.5 shrink-0">✓</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="md:w-28 shrink-0 flex flex-row md:flex-col justify-between md:justify-center items-center border-t md:border-t-0 md:border-l border-[#EBE3D5] pt-3 md:pt-0 md:pl-4">
                      <div className="text-left md:text-center">
                        <span className="block text-[9px] font-mono uppercase tracking-widest text-[#8C8273]">Value</span>
                        <span className="font-serif text-lg font-semibold text-[#5D6B5D]">${pkg.price}</span>
                      </div>
                      <button
                        type="button"
                        className={`text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-md mt-2 cursor-pointer
                          ${isSelected 
                            ? 'bg-[#7C8D7C] text-white font-bold' 
                            : 'bg-[#FAF8F5] text-[#8C8273] border border-[#EBE3D5] hover:bg-[#F2EDE4]'
                          }
                        `}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Premium Add-Ons */}
            <div className="border-t border-[#EBE3D5] pt-4 mt-6">
              <h4 className="font-serif text-sm font-semibold text-[#5D6B5D] mb-1">
                Customize with Premium Add-ons (Optional)
              </h4>
              <p className="text-[11px] text-[#8C8273] mb-3">
                Extra touches to show your recipient some supplementary care.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ADD_ONS.map((addon) => {
                  const isChecked = selectedAddOns.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      id={`addon-card-${addon.id}`}
                      onClick={() => handleAddOnToggle(addon.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all bg-white
                        ${isChecked 
                          ? 'border-[#7C8D7C] bg-[#F7F9F7]' 
                          : 'border-[#EBE3D5] hover:border-[#D1C5B0]'
                        }
                      `}
                    >
                      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0
                        ${isChecked ? 'bg-[#7C8D7C] border-[#7C8D7C] text-white' : 'border-[#C1B7A3]'}
                      `}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-serif font-semibold text-[#5D6B5D] truncate">
                          {addon.name}
                        </span>
                        <span className="block text-[9px] text-[#8C8273] truncate">
                          {addon.description}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-serif text-sm font-semibold text-[#5D6B5D]">+${addon.price}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 text-left"
          >
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#5D6B5D] tracking-tight">
                Personalize your e-gift card
              </h3>
              <p className="text-xs text-[#8C8273] mt-1 font-sans">
                Let's customize who the card goes to, and draft a beautiful note inside.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#8C8273] font-semibold">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  id="recipient-name-input"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#EBE3D5] bg-white text-xs text-[#4A4A4A] focus:outline-none focus:border-[#7C8D7C]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#8C8273] font-semibold">
                  Sender Name (Your Name) *
                </label>
                <input
                  type="text"
                  id="sender-name-input"
                  required
                  placeholder="e.g. David & Clara"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#EBE3D5] bg-white text-xs text-[#4A4A4A] focus:outline-none focus:border-[#7C8D7C]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#8C8273] font-semibold">
                Personalized Message *
              </label>
              <textarea
                id="personal-message-textarea"
                rows={4}
                required
                placeholder="Type your thoughtful message here, or use the Gemini AI Greeting Assistant below to draft a polished letter!"
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                className="w-full p-3.5 rounded-lg border border-[#EBE3D5] bg-white text-xs text-[#4A4A4A] leading-relaxed focus:outline-none focus:border-[#7C8D7C] font-serif"
              />
            </div>

            {/* AI Assistant Drawer */}
            <div className="bg-[#FAF8F5] border border-[#EBE3D5] rounded-2xl p-4 mt-2">
              <div className="flex items-center gap-2 text-[#5D6B5D] font-serif font-semibold text-xs mb-1.5">
                <Sparkles className="w-4 h-4 text-[#7C8D7C] animate-pulse" />
                <span>Gemini AI Greeting Assistant</span>
              </div>
              <p className="text-[10px] text-[#8C8273] mb-3 leading-normal">
                Want the perfect message? Provide a tiny detail about your family or friend, and Gemini will custom craft a high-end card message for you.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  id="ai-prompt-hint"
                  placeholder="e.g. Mention Sarah just bought her first home and is super busy settling in"
                  value={aiPromptHint}
                  onChange={(e) => setAiPromptHint(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-[#EBE3D5] bg-white text-[11px] text-[#4A4A4A] focus:outline-none focus:border-[#7C8D7C]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAiDraft();
                    }
                  }}
                />
                <button
                  type="button"
                  id="ai-draft-btn"
                  disabled={isAiLoading}
                  onClick={handleAiDraft}
                  className="px-3.5 py-1.5 bg-[#7C8D7C] text-white text-[11px] font-mono tracking-wider uppercase rounded-lg hover:bg-[#5D6B5D] disabled:bg-[#7C8D7C]/50 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Drafting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>Draft Note</span>
                    </>
                  )}
                </button>
              </div>

              {aiError && (
                <p className="text-[10px] text-red-700 mt-2 flex items-center gap-1 font-mono">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-700 animate-ping" />
                  {aiError}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5 text-left"
          >
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#5D6B5D] tracking-tight">
                Delivery & Scheduling Options
              </h3>
              <p className="text-xs text-[#8C8273] mt-1 font-sans">
                Configure how the recipient receives the card and if you want to book the service immediately.
              </p>
            </div>

            {/* Delivery Method Choice */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="deliver-email-btn"
                onClick={() => setDeliveryMethod('email')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer bg-white
                  ${deliveryMethod === 'email' 
                    ? 'border-[#7C8D7C] bg-[#F7F9F7] text-[#5D6B5D] font-semibold' 
                    : 'border-[#EBE3D5] hover:border-[#D1C5B0] text-[#8C8273]'
                  }
                `}
              >
                <Mail className="w-5 h-5 stroke-1.5 text-[#7C8D7C]" />
                <div className="text-xs">
                  <span className="block font-medium">Deliver via Email</span>
                  <span className="text-[9px] opacity-75">Automated delivery schedule</span>
                </div>
              </button>

              <button
                type="button"
                id="deliver-print-btn"
                onClick={() => {
                  setDeliveryMethod('print');
                  setRecipientEmail('');
                }}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer bg-white
                  ${deliveryMethod === 'print' 
                    ? 'border-[#7C8D7C] bg-[#F7F9F7] text-[#5D6B5D] font-semibold' 
                    : 'border-[#EBE3D5] hover:border-[#D1C5B0] text-[#8C8273]'
                  }
                `}
              >
                <Printer className="w-5 h-5 stroke-1.5 text-[#7C8D7C]" />
                <div className="text-xs">
                  <span className="block font-medium">Print or Hand-Deliver</span>
                  <span className="text-[9px] opacity-75">Retrieve a physical code/link</span>
                </div>
              </button>
            </div>

            {/* Sub-panels for delivery options */}
            <div className="bg-[#FAF8F5] border border-[#EBE3D5] p-4 rounded-xl space-y-3">
              {deliveryMethod === 'email' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#8C8273] font-semibold">
                      Recipient Email Address *
                    </label>
                    <input
                      type="email"
                      id="recipient-email-input"
                      required
                      placeholder="sarah.j@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-[#EBE3D5] bg-white text-xs text-[#4A4A4A] focus:outline-none focus:border-[#7C8D7C]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#8C8273] font-semibold">
                      Digital Delivery Date
                    </label>
                    <input
                      type="date"
                      id="delivery-date-input"
                      value={deliveryDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-3.5 py-1.5 rounded-lg border border-[#EBE3D5] bg-white text-xs text-[#4A4A4A] focus:outline-none focus:border-[#7C8D7C]"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 p-1 text-[#8C8273]">
                  <Info className="w-4 h-4 text-[#7C8D7C] shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed font-sans">
                    Excellent! Upon completing booking, we will generate a lovely presentation receipt page with a **Redemption Code** that you can write down, copy, print, or hand-deliver. The recipient can redeem it online any time.
                  </p>
                </div>
              )}

              <div className="border-t border-[#EBE3D5] pt-3 mt-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#8C8273] font-semibold">
                    Sender Email Address
                  </label>
                  <input
                    type="email"
                    id="sender-email-input"
                    placeholder="clara.d@example.com (for receipts)"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#EBE3D5] bg-white text-xs text-[#4A4A4A] focus:outline-none focus:border-[#7C8D7C]"
                  />
                </div>
              </div>
            </div>

            {/* Interactive Scheduling Trigger */}
            <div className="border-t border-[#EBE3D5] pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-semibold text-[#5D6B5D]">
                    Do you want to pre-schedule the cleaning date now?
                  </h4>
                  <p className="text-[10px] text-[#8C8273] mt-0.5 font-sans">
                    If you know their schedule (or are buying for your household), book their date immediately.
                  </p>
                </div>
                <div 
                  id="should-preschedule-toggle"
                  onClick={() => setShouldPreSchedule(!shouldPreSchedule)}
                  className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors duration-200 ease-in-out shrink-0
                    ${shouldPreSchedule ? 'bg-[#7C8D7C]' : 'bg-[#E5DEC9]'}
                  `}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out transform
                    ${shouldPreSchedule ? 'translate-x-5' : 'translate-x-0'}
                  `} />
                </div>
              </div>

              {shouldPreSchedule && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 space-y-4 border-t border-dashed border-[#EBE3D5] pt-4 overflow-hidden"
                >
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#8C8273] font-semibold">
                      Pick a Cleaning Appointment Slot *
                    </label>
                    <InteractiveCalendar
                      selectedDate={scheduledDate}
                      selectedTime={scheduledTime}
                      onChange={(date, time) => {
                        setScheduledDate(date);
                        setScheduledTime(time);
                      }}
                    />
                  </div>

                  {/* Service Address */}
                  <div className="space-y-3 bg-[#FAF8F5] border border-[#EBE3D5] p-4 rounded-xl">
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-[#8C8273] font-bold">
                      Recipient Service Address
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[9px] text-[#8C8273] font-mono uppercase">Street Address *</label>
                        <input
                          type="text"
                          id="address-line1-input"
                          required
                          placeholder="e.g. 104 Linen Way"
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#EBE3D5] bg-white text-xs text-[#4A4A4A] focus:outline-none focus:border-[#7C8D7C]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-[#8C8273] font-mono uppercase">Apt/Suite</label>
                        <input
                          type="text"
                          id="address-line2-input"
                          placeholder="Apt 2B"
                          value={addressLine2}
                          onChange={(e) => setAddressLine2(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#EBE3D5] bg-white text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-[#8C8273] font-mono uppercase">City *</label>
                        <input
                          type="text"
                          id="city-input"
                          required
                          placeholder="Portland"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#EBE3D5] bg-white text-xs text-[#4A4A4A] focus:outline-none focus:border-[#7C8D7C]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-[#8C8273] font-mono uppercase">State *</label>
                        <input
                          type="text"
                          id="state-input"
                          required
                          placeholder="OR"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#EBE3D5] bg-white text-xs text-[#4A4A4A] focus:outline-none focus:border-[#7C8D7C]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-[#8C8273] font-mono uppercase">Zip Code *</label>
                        <input
                          type="text"
                          id="zipcode-input"
                          required
                          placeholder="97201"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#EBE3D5] bg-white text-xs text-[#4A4A4A] focus:outline-none focus:border-[#7C8D7C]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-[#8C8273] font-mono uppercase">Special Access or Crew Instructions</label>
                      <textarea
                        id="special-instructions-textarea"
                        rows={2}
                        placeholder="e.g. Key is in the lockbox (code 4429). Please ignore the friendly retriever."
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        className="w-full p-3 rounded-lg border border-[#EBE3D5] bg-white text-xs text-[#4A4A4A] focus:outline-none focus:border-[#7C8D7C]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5 text-left"
          >
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#5D6B5D] tracking-tight">
                Review & Confirm Booking
              </h3>
              <p className="text-xs text-[#8C8273] mt-1 font-sans">
                Review your luxury cleaning e-gift card summary. Verify recipient details before payment.
              </p>
            </div>

            {/* Invoice Table Receipt */}
            <div className="bg-[#FAF8F5] border border-[#EBE3D5] rounded-2xl overflow-hidden p-5 space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-[#EBE3D5]">
                <div>
                  <span className="font-serif font-bold text-sm text-[#5D6B5D]">Sanctuary Care Invoice</span>
                  <p className="text-[9px] font-mono text-[#8C8273] mt-0.5">Order No: booking_itemized_id</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-[#E9EDEA] text-[#7C8D7C] border border-[#7C8D7C]/20 rounded-md font-mono text-[9px] font-medium tracking-wider uppercase">
                    Checkout Receipt
                  </span>
                </div>
              </div>

              {/* Booking breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#4A4A4A]">{selectedPkg.name}</span>
                  <span className="font-mono text-[#4A4A4A] font-medium">${selectedPkg.price}.00</span>
                </div>
                
                {ADD_ONS.filter(addon => selectedAddOns.includes(addon.id)).map((addon) => (
                  <div key={addon.id} className="flex justify-between pl-3 text-neutral-600">
                    <span className="italic">+ {addon.name}</span>
                    <span className="font-mono text-[#4A4A4A]">${addon.price}.00</span>
                  </div>
                ))}
                
                <div className="border-t border-[#EBE3D5] pt-2 mt-2 flex justify-between font-bold text-[#4A4A4A]">
                  <span className="font-serif">Total Flat Rate</span>
                  <span className="font-mono text-[#7C8D7C] text-sm">${totalPrice}.00</span>
                </div>
              </div>

              {/* Delivery info summary */}
              <div className="border-t border-[#EBE3D5] pt-3 text-[11px] space-y-2 leading-relaxed text-[#4A4A4A]">
                <div>
                  <span className="font-mono font-bold text-[8px] uppercase tracking-wider text-[#8C8273] block">Recipient Delivery</span>
                  <p className="font-medium mt-0.5">
                    {recipientName} ({deliveryMethod === 'email' ? recipientEmail : 'Printed Hand-Delivery'})
                  </p>
                  <p className="text-[10px] text-[#8C8273]">
                    Scheduled delivery on {new Date(deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {shouldPreSchedule && scheduledDate && (
                  <div>
                    <span className="font-mono font-bold text-[8px] uppercase tracking-wider text-[#8C8273] block">Pre-Scheduled Appointment</span>
                    <p className="font-medium mt-0.5 text-[#7C8D7C]">
                      📅 {new Date(scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {scheduledTime}
                    </p>
                    <p className="text-[10px] text-[#8C8273] italic truncate">
                      Address: {addressLine1}, {city}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Virtual payment info card */}
            <div className="bg-[#E9EDEA]/40 border border-[#7C8D7C]/20 p-4 rounded-xl flex items-center gap-3">
              <div className="bg-[#E9EDEA] p-2.5 rounded-lg border border-[#7C8D7C]/20">
                <CreditCard className="w-5 h-5 text-[#7C8D7C]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block font-serif font-semibold text-xs text-[#5D6B5D]">Complimentary Checkout Mode</span>
                <span className="block text-[10px] text-[#8C8273] leading-normal font-sans">
                  This demo is pre-approved. Click below to verify and issue your redeemable e-card!
                </span>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left Column: Form Steps (7 columns on large screens) */}
      <div className="lg:col-span-7 flex flex-col justify-between h-full bg-white border border-[#F2EDE4] rounded-[32px] p-6 md:p-8 shadow-sm">
        
        {/* Wizard Progress Meter */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-[#8C8273] mb-2 font-bold">
            <span>Step {step} of 5</span>
            <span className="text-[#7C8D7C]">
              {step === 1 && 'Occasion Theme'}
              {step === 2 && 'Clean Details'}
              {step === 3 && 'Personal Note'}
              {step === 4 && 'Delivery & Schedule'}
              {step === 5 && 'Confirm & Checkout'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#EBE3D5] rounded-full overflow-hidden flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-full flex-1 transition-all duration-300 border-r border-white last:border-0
                  ${s <= step ? 'bg-[#7C8D7C]' : 'bg-[#EBE3D5]'}`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Active Page */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {renderWizardStep()}
          </AnimatePresence>
        </div>

        {/* Actions buttons */}
        <div className="flex justify-between border-t border-[#EBE3D5] pt-6 mt-8">
          <button
            type="button"
            id="prev-step-btn"
            disabled={step === 1 || isSubmitting}
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono tracking-wider uppercase text-[#8C8273] hover:text-[#5D6B5D] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step < 5 ? (
            <button
              type="button"
              id="next-step-btn"
              disabled={!canGoNext()}
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-[#7C8D7C] hover:bg-[#5D6B5D] text-white px-5 py-2 rounded-2xl text-xs font-mono tracking-wider uppercase font-bold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              id="checkout-confirm-btn"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-[#7C8D7C] hover:bg-[#5D6B5D] text-white px-6 py-2.5 rounded-2xl text-xs font-mono tracking-wider uppercase font-bold shadow-sm transition-all shrink-0 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  Issue Cleaning Gift Card (${totalPrice})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Right Column: Dynamic Gift Card Visualizer (5 columns on large screens) */}
      <div className="lg:col-span-5 flex flex-col gap-6 sticky top-6">
        <div className="bg-white border border-[#F2EDE4] rounded-[32px] p-6 shadow-sm text-center">
          <h4 className="font-serif text-sm font-semibold text-[#5D6B5D] mb-4 text-left border-b border-[#EBE3D5] pb-2">
            Live Gift Card Design
          </h4>
          
          <GiftCardPreview
            occasion={occasion}
            recipientName={recipientName}
            senderName={senderName}
            personalMessage={personalMessage}
            packageId={packageId}
            addOnIds={selectedAddOns}
          />

          <div className="mt-4 p-3.5 bg-[#FAF8F5] border border-[#EBE3D5] rounded-2xl text-left space-y-1">
            <span className="block text-[8px] font-mono uppercase tracking-widest text-[#8C8273]">Product Configuration</span>
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#5D6B5D] truncate max-w-[150px]">{selectedPkg.name}</span>
              <span className="font-mono text-[#7C8D7C] font-bold">${totalPrice}</span>
            </div>
            {selectedAddOns.length > 0 && (
              <span className="block text-[9px] text-[#8C8273] truncate">
                Includes: {ADD_ONS.filter(a => selectedAddOns.includes(a.id)).map(a => a.name).join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
