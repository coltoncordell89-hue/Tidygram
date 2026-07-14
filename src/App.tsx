import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Gift, Calendar, Database, CheckCircle2, ChevronRight, Copy, RefreshCw, Star, ShieldCheck } from 'lucide-react';
import { GiftCard } from './types';
import GiftCardForm from './components/GiftCardForm';
import RedemptionPortal from './components/RedemptionPortal';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<'buy' | 'redeem' | 'admin'>('buy');
  
  // Simulated redemption routing state
  const [redeemCode, setRedeemCode] = useState('');
  
  // Successful checkout celebration state
  const [recentPurchase, setRecentPurchase] = useState<GiftCard | null>(null);

  // Synchronization trigger to prompt Admin Dashboard to re-fetch
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePurchaseSuccess = (card: GiftCard) => {
    setRecentPurchase(card);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSimulateRedeem = (code: string) => {
    setRedeemCode(code);
    setActiveTab('redeem');
    // Ensure checkout celebration is closed so they see the portal
    setRecentPurchase(null);
  };

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Copied gift code: ${code}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#4A4A4A] font-sans antialiased flex flex-col">
      
      {/* Decorative Top Accent Bar */}
      <div className="h-1.5 w-full bg-[#7C8D7C]" />

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto p-4 md:p-8 flex-1 flex flex-col gap-6">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#EBE3D5] pb-6 gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 bg-[#7C8D7C] rounded-full flex items-center justify-center text-white shrink-0 shadow-xs">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-serif italic text-[#5D6B5D] block leading-none font-semibold">Nest & Nurture</span>
              <span className="text-[10px] uppercase tracking-widest text-[#8C8273] font-mono mt-1 block font-medium">Sanctuary Gifting Co.</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-6 text-sm font-medium uppercase tracking-widest text-[#8C8273] w-full md:w-auto pb-2 md:pb-0 justify-start md:justify-end border-b md:border-b-0 border-[#EBE3D5]">
            <button
              id="tab-buy-btn"
              onClick={() => {
                setActiveTab('buy');
                setRecentPurchase(null);
              }}
              className={`pb-2 px-1 transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-widest font-bold text-xs sm:text-sm border-b-2
                ${activeTab === 'buy' && !recentPurchase
                  ? 'text-[#7C8D7C] border-[#7C8D7C]'
                  : 'text-[#8C8273] border-transparent hover:text-[#5D6B5D]'
                }
              `}
            >
              <Gift className="w-3.5 h-3.5" />
              Gift Studio
            </button>
            <button
              id="tab-redeem-btn"
              onClick={() => {
                setActiveTab('redeem');
                setRecentPurchase(null);
              }}
              className={`pb-2 px-1 transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-widest font-bold text-xs sm:text-sm border-b-2
                ${activeTab === 'redeem'
                  ? 'text-[#7C8D7C] border-[#7C8D7C]'
                  : 'text-[#8C8273] border-transparent hover:text-[#5D6B5D]'
                }
              `}
            >
              <Calendar className="w-3.5 h-3.5" />
              Redeem Code
            </button>
            <button
              id="tab-admin-btn"
              onClick={() => {
                setActiveTab('admin');
                setRecentPurchase(null);
              }}
              className={`pb-2 px-1 transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-widest font-bold text-xs sm:text-sm border-b-2
                ${activeTab === 'admin'
                  ? 'text-[#7C8D7C] border-[#7C8D7C]'
                  : 'text-[#8C8273] border-transparent hover:text-[#5D6B5D]'
                }
              `}
            >
              <Database className="w-3.5 h-3.5" />
              Gifts Registry
            </button>
          </div>
        </header>

        {/* Core Workspace Frame */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            
            {/* Purchase Confirmation Celebration Overrides Current View */}
            {recentPurchase ? (
              <motion.div
                key="purchase-celebration"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-xl mx-auto bg-white border border-[#F2EDE4] rounded-[32px] p-6 md:p-8 text-center space-y-6 shadow-sm"
              >
                <div className="mx-auto w-14 h-14 rounded-full bg-[#E9EDEA] border border-[#7C8D7C]/20 flex items-center justify-center text-[#7C8D7C]">
                  <CheckCircle2 className="w-8 h-8 stroke-1.5 animate-pulse" />
                </div>

                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#5D6B5D] font-bold bg-[#E9EDEA] px-2.5 py-1 rounded-md border border-[#7C8D7C]/20">
                    Order Confirmed & Paid
                  </span>
                  <h2 className="font-serif text-2xl font-bold mt-4 text-[#5D6B5D]">
                    Your Cleaning Gift is Ready!
                  </h2>
                  <p className="text-xs text-[#8C8273] mt-2 px-4 leading-relaxed">
                    Splendid! We have recorded your cleaning service package. A customized e-gift card has been generated with your personalized message.
                  </p>
                </div>

                {/* Redeemable code display */}
                <div className="bg-[#FAF8F5] border border-[#F2EDE4] rounded-2xl p-4 max-w-sm mx-auto text-center space-y-2">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-[#8C8273] block">Unique Redemption Code</span>
                  <div className="flex items-center justify-center gap-2">
                    <strong className="font-mono text-xl text-[#7C8D7C] tracking-wider font-bold bg-[#E9EDEA]/50 border border-[#7C8D7C]/20 py-1.5 px-4 rounded-xl shadow-xs">
                      {recentPurchase.id}
                    </strong>
                    <button
                      type="button"
                      id="copy-purchase-code-btn"
                      onClick={() => copyCodeToClipboard(recentPurchase.id)}
                      className="p-2 border border-[#EBE3D5] bg-white rounded-lg hover:bg-neutral-50 hover:text-[#7C8D7C] cursor-pointer"
                      title="Copy Code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-[#8C8273] px-2 leading-tight">
                    {recentPurchase.deliveryMethod === 'email' 
                      ? `We will send this card directly to ${recentPurchase.recipientName} on delivery schedule.` 
                      : 'Write down or copy this code to deliver physically!'
                    }
                  </p>
                </div>

                {/* Sub routing advice */}
                <div className="pt-2 border-t border-[#EBE3D5] grid grid-cols-2 gap-3 max-w-sm mx-auto">
                  <button
                    type="button"
                    id="celebration-schedule-now-btn"
                    onClick={() => handleSimulateRedeem(recentPurchase.id)}
                    className="p-3 bg-[#7C8D7C] hover:bg-[#5D6B5D] text-white rounded-2xl text-xs font-mono uppercase tracking-wide font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Schedule Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    id="celebration-registry-btn"
                    onClick={() => {
                      setRecentPurchase(null);
                      setActiveTab('admin');
                    }}
                    className="p-3 bg-[#FAF8F5] border border-[#EBE3D5] hover:bg-[#F2EDE4] text-[#8C8273] rounded-2xl text-xs font-mono uppercase tracking-wide font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Gifts Log</span>
                  </button>
                </div>

                <div className="p-3 bg-[#FAF8F5] border border-[#F2EDE4] rounded-xl max-w-sm mx-auto flex items-start gap-2 text-left text-[10px] text-[#8C8273] leading-relaxed">
                  <ShieldCheck className="w-5 h-5 stroke-1.5 text-[#7C8D7C] shrink-0 mt-0.5" />
                  <span>
                    Our professional, background-checked cleaning technicians bring non-toxic eco-friendly detergents, premium lavender essential mists, and HEPA micro-allergen filtration tools.
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'buy' && (
                  <GiftCardForm onSuccess={handlePurchaseSuccess} />
                )}
                {activeTab === 'redeem' && (
                  <RedemptionPortal initialCode={redeemCode} />
                )}
                {activeTab === 'admin' && (
                  <AdminDashboard onSimulateRedeem={handleSimulateRedeem} refreshTrigger={refreshTrigger} />
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Footer info line */}
        <footer className="border-t border-[#E7E0D2] pt-6 pb-2 text-center text-[10px] font-mono tracking-wider text-[#8C7A5C] flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            © 2026 Sanctuary Inc. • Flat-Rate Meticulous Home Cleaning
          </div>
          <div className="flex gap-4">
            <span className="hover:text-[#1C1917] cursor-pointer">Service Guidelines</span>
            <span className="hover:text-[#1C1917] cursor-pointer">Redemption Policy</span>
            <span className="hover:text-[#1C1917] cursor-pointer">Support Helpdesk</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
