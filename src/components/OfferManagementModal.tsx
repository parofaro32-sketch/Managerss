import React, { useState } from 'react';
import { TransferOfferItem, ClubItem } from '../types.ts';
import { api } from '../api.ts';
import { 
  X, 
  Coins, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Building2, 
  User, 
  Clock, 
  FileText 
} from 'lucide-react';
import { AnimatedLighting } from './AnimatedLighting.tsx';

interface OfferManagementModalProps {
  offer: TransferOfferItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOfferResolved: (updatedOffer: TransferOfferItem, message: string) => void;
}

export const OfferManagementModal: React.FC<OfferManagementModalProps> = ({
  offer,
  isOpen,
  onClose,
  onOfferResolved,
}) => {
  if (!isOpen || !offer) return null;

  const [decision, setDecision] = useState<'accept' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState(
    'Offer does not meet our board valuation or tactical squad requirements.'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleRespond = async (chosenDecision: 'accept' | 'reject') => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.respondToTransferOffer(
        offer.id,
        chosenDecision,
        chosenDecision === 'reject' ? rejectReason : undefined
      );

      onOfferResolved(
        data.offer,
        chosenDecision === 'accept'
          ? `Offer accepted! Personal contract negotiation unlocked for ${offer.buyerClubName}.`
          : `Offer rejected. ${offer.buyerClubName} has been notified in their mailbox.`
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error processing response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto animate-in fade-in zoom-in-95 duration-200">
        <AnimatedLighting
          color={offer.status === 'Accepted' ? 'emerald' : offer.status === 'Rejected' ? 'rose' : 'amber'}
          borderWidth={2.5}
          rounded="3xl"
          speed={3.2}
          glowIntensity="high"
        >
          <div className="p-6 sm:p-7 rounded-[1.6rem] bg-gradient-to-b from-[#141208] via-[#0d0b04] to-[#050402] text-slate-100 shadow-2xl space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-title text-2xl font-black uppercase text-white tracking-wide text-animated-gold">
                    Review Transfer Bid
                  </h3>
                  <div className="text-xs font-mono text-slate-400">
                    Status: <strong className="text-amber-400 font-bold uppercase">{offer.status}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Offer Information Card */}
            <AnimatedLighting color="solar" borderWidth={1.5} rounded="2xl" speed={3.5}>
              <div className="p-4 rounded-2xl bg-black/85 space-y-3.5">
                
                {/* Player summary */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Target Player:
                    </span>
                    <span className="font-title text-xl font-black uppercase text-white break-words leading-tight">
                      {offer.playerName}
                    </span>
                    <div className="text-xs font-mono text-emerald-400 mt-0.5">
                      {offer.playerPosition} · OVR {offer.playerOvr}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Agreed Asking Fee:
                    </span>
                    <span className="font-title text-lg font-black text-amber-300">
                      {formatCurrency(offer.offerAmount)}
                    </span>
                  </div>
                </div>

                {/* Bidding Club & Manager */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Offering Club:</span>
                    </div>
                    <div className="font-title font-bold text-base text-white break-words leading-tight">
                      {offer.buyerClubName}
                    </div>
                    <div className="text-[11px] text-emerald-400">
                      Manager: @{offer.buyerUsername}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Bid Timestamp:</span>
                    </div>
                    <div className="text-white font-mono font-bold text-xs mt-1">
                      {new Date(offer.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(offer.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Exact Bid Amount Highlight with Animated Lighting */}
                <AnimatedLighting color="emerald" borderWidth={2} rounded="xl" speed={2.8}>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#081a10] to-[#040e08] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-emerald-400 font-extrabold tracking-wider">
                        Official Bid Received
                      </div>
                      <div className="font-title text-3xl font-black text-white tabular-nums">
                        {formatCurrency(offer.offerAmount)}
                      </div>
                    </div>

                    <div className="text-right text-[11px] font-mono text-slate-400">
                      <span>Treasury Impact:</span>
                      <div className="text-emerald-400 font-bold">
                        +{formatCurrency(offer.offerAmount)} to Warchest
                      </div>
                    </div>
                  </div>
                </AnimatedLighting>
              </div>
            </AnimatedLighting>

            {/* Rejection reason box if rejecting */}
            {decision === 'reject' && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <label className="text-xs font-mono uppercase text-rose-300 font-bold tracking-wider">
                  Rejection Reason for Buyer Mailbox:
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={2}
                  className="stadium-input w-full font-mono text-xs text-rose-200 border-rose-500/40 focus:border-rose-400"
                />
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              {offer.status === 'Pending' ? (
                decision === 'reject' ? (
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setDecision(null)}
                      disabled={loading}
                      className="btn-broadcast-secondary text-xs py-2.5 px-4 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespond('reject')}
                      disabled={loading}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-title font-black uppercase tracking-wider transition-colors shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Rejecting...' : 'Confirm Rejection'}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDecision('reject')}
                      disabled={loading}
                      className="p-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 text-xs font-title font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Offer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRespond('accept')}
                      disabled={loading}
                      className="btn-broadcast-primary text-xs py-3 font-title font-black uppercase flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
                      <span>Accept ({formatCurrency(offer.offerAmount)})</span>
                    </button>
                  </div>
                )
              ) : (
                <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-slate-400 text-center">
                  This offer was resolved as <strong className="text-white uppercase font-bold">{offer.status}</strong> on{' '}
                  {offer.resolvedAt ? new Date(offer.resolvedAt).toLocaleDateString() : 'earlier date'}.
                </div>
              )}
            </div>
          </div>
        </AnimatedLighting>
      </div>
    </div>
  );
};
