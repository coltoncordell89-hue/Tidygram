import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar, Gift, CheckCircle, Mail, RotateCw } from 'lucide-react';
import { OccasionType, OCCASION_THEMES, CleaningPackage, AddOn, CLEANING_PACKAGES, ADD_ONS } from '../types';

interface GiftCardPreviewProps {
  occasion: OccasionType;
  recipientName: string;
  senderName: string;
  personalMessage: string;
  packageId: string;
  addOnIds: string[];
  code?: string;
  showStatus?: boolean;
  status?: string;
}

export default function GiftCardPreview({
  occasion,
  recipientName,
  senderName,
  personalMessage,
  packageId,
  addOnIds,
  code = 'GIFT-XXXX-XXXX',
  showStatus = false,
  status = 'unredeemed'
}: GiftCardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const theme = OCCASION_THEMES[occasion] || OCCASION_THEMES.just_because;
  const pkg = CLEANING_PACKAGES.find(p => p.id === packageId) || CLEANING_PACKAGES[0];
  const selectedAddOns = ADD_ONS.filter(a => addOnIds.includes(a.id));

  // Determine an icon based on occasion
  const getOccasionIcon = () => {
    switch (occasion) {
      case 'housewarming': return '🏠';
      case 'new_baby': return '🍼';
      case 'birthday': return '🎂';
      case 'thank_you': return '🤍';
      case 'anniversary': return '✨';
      case 'holiday': return '🎄';
      default: return '🌸';
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Interaction Hint */}
      <button 
        id="toggle-card-flip"
        onClick={() => setIsFlipped(!isFlipped)}
        className="mb-3 flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#8C8273] hover:text-[#7C8D7C] transition-colors cursor-pointer bg-white px-3 py-1 rounded-full shadow-sm border border-[#EBE3D5]"
      >
        <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
        Click to flip & read
      </button>

      {/* The 3D Flip Container */}
      <div className="w-full aspect-[1.6/1] perspective-1000">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="w-full h-full relative preserve-3d cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Card FRONT: Artwork & Occasion */}
          <div 
            className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl border-2 p-6 flex flex-col justify-between shadow-lg overflow-hidden ${theme.bg} ${theme.border}`}
          >
            {/* Elegant Background Accents */}
            <div className="absolute top-[-20%] right-[-10%] w-44 h-44 rounded-full bg-white/20 blur-2xl pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 rounded-full bg-white/15 blur-xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-2xl leading-none">{getOccasionIcon()}</span>
                <span className="font-mono text-[10px] tracking-widest uppercase opacity-75 text-[#1C1917]">
                  Sanctuary Cleaning Gift
                </span>
              </div>
              <div className="px-2 py-0.5 rounded-full border border-[#1C1917]/10 bg-white/30 backdrop-blur-xs font-mono text-[9px] tracking-wider text-[#1C1917]/80">
                {code}
              </div>
            </div>

            {/* Middle: Theme Greeting */}
            <div className="text-center my-auto px-4">
              <h3 className={`text-2xl sm:text-3xl tracking-tight leading-tight ${theme.font} ${theme.text} font-semibold font-serif`}>
                {theme.title}
              </h3>
              <p className={`text-xs mt-1 font-sans opacity-90 ${theme.text} italic`}>
                "{theme.subtitle}"
              </p>
            </div>

            {/* Footer: For & From */}
            <div className="flex justify-between items-end pt-2 border-t border-[#1C1917]/10">
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-wider opacity-60 text-[#1C1917]">For</span>
                <span className="font-semibold text-sm text-[#1C1917]">{recipientName || 'Someone Special'}</span>
              </div>
              <div className="text-right">
                <span className="block font-mono text-[9px] uppercase tracking-wider opacity-60 text-[#1C1917]">With Love From</span>
                <span className="font-semibold text-sm text-[#1C1917]">{senderName || 'A Thoughtful Friend'}</span>
              </div>
            </div>
          </div>

          {/* Card BACK: Message & Package details */}
          <div 
            className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl border-2 p-6 flex flex-col justify-between shadow-lg overflow-hidden bg-[#FAF8F5] border-[#EBE3D5]`}
            style={{ transform: 'rotateY(180deg)' }}
          >
            {/* Inner background pattern */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#7C8D7C]" />
            
            <div className="flex justify-between items-start pt-1.5">
              <span className="font-serif italic text-[#7C8D7C] text-sm font-semibold">A Sanctuary Awaits</span>
              <span className="font-mono text-[9px] tracking-widest text-[#8C8273] uppercase bg-[#E9EDEA] px-2 py-0.5 rounded-sm">
                Redeemable E-Card
              </span>
            </div>

            {/* Scrollable Personal Message */}
            <div className="my-2 flex-1 flex flex-col justify-center overflow-y-auto pr-1">
              <p className="text-xs text-[#4A4A4A] leading-relaxed font-serif italic text-center">
                {personalMessage || '"Please enjoy this gift of absolute home relaxation. No vacuuming, no scrubbing, just extra hours for you to spend exactly how you wish!"'}
              </p>
            </div>

            {/* Bottom: Package Summary */}
            <div className="bg-[#E9EDEA]/50 rounded-xl p-3 border border-[#F2EDE4] flex justify-between items-center text-left">
              <div>
                <span className="block font-mono text-[8px] uppercase tracking-wider text-[#8C8273]">Selected Package</span>
                <span className="font-serif text-xs font-semibold text-[#5D6B5D] truncate max-w-[200px] block">
                  {pkg.name}
                </span>
                {selectedAddOns.length > 0 && (
                  <span className="block text-[9px] text-[#7C8D7C] font-sans truncate max-w-[200px]">
                    + {selectedAddOns.length} Premium Add-On{selectedAddOns.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="block font-mono text-[8px] uppercase tracking-wider text-[#8C8273]">Value</span>
                <span className="font-mono text-sm font-bold text-[#7C8D7C]">
                  ${pkg.price + selectedAddOns.reduce((acc, curr) => acc + curr.price, 0)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Booking Status Indicator */}
      {showStatus && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs font-mono text-[#8C8273]">Status:</span>
          {status === 'unredeemed' && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#E9EDEA] text-[#7C8D7C] border border-[#7C8D7C]/20">
              ● Unredeemed (Ready to Schedule)
            </span>
          )}
          {status === 'scheduled' && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-50 text-blue-800 border border-blue-200">
              📅 Cleaning Scheduled
            </span>
          )}
          {status === 'completed' && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              ✓ Service Completed
            </span>
          )}
        </div>
      )}
    </div>
  );
}
