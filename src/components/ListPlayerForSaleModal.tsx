import React, { useState } from 'react';
import { Player, ClubItem } from '../types.ts';
import { calculatePlayerValuation, calculateSuggestedWeeklyWage } from '../types.ts';
import { 
  X, 
  Coins, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  TrendingUp, 
  UserCheck, 
  DollarSign 
} from 'lucide-react';
import { AnimatedLighting } from './AnimatedLighting.tsx';
import { ClubLogo } from './ClubLogo.tsx';
import { api } from '../api.ts';

interface ListPlayerForSaleModalProps {
  club: ClubItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ListPlayerForSaleModal: React.FC<ListPlayerForSaleModalProps> = ({
  club,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const availableSquad = club.squad.filter((p) => !p.isTransferListed);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    availableSquad[0]?.id || ''
  );

  const selectedPlayer = club.squad.find((p) => p.id === selectedPlayerId) || availableSquad[0];

  const defaultValuation = selectedPlayer ? calculatePlayerValuation(selectedPlayer) : 10000000;
  const [askingPrice, setAskingPrice] = useState<number>(defaultValuation);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When selected player changes, pre-fill with their calculated market valuation
  const handleSelectPlayer = (pId: string) => {
    setSelectedPlayerId(pId);
    setError(null);
    const p = club.squad.find((item) => item.id === pId);
    if (p) {
      setAskingPrice(calculatePlayerValuation(p));
    }
  };

  const handleListPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) {
      setError('Please select a player to list for sale.');
      return;
    }

    if (!askingPrice || askingPrice <= 0) {
      setError('Please specify a valid asking price greater than €0.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const data = await api.listPlayerForSale(selectedPlayer.id, askingPrice);

      onSuccess(data.message || `${selectedPlayer.name} is now listed on the transfer market.`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error listing player for sale.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const ovr = selectedPlayer
    ? Math.round(
        (selectedPlayer.pace +
          selectedPlayer.shooting +
          selectedPlayer.passing +
          selectedPlayer.dribbling +
          selectedPlayer.defending +
          selectedPlayer.physical) /
          6
      )
    : 75;

  const currentValuation = selectedPlayer ? calculatePlayerValuation(selectedPlayer) : 10000000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-xl my-auto animate-in fade-in zoom-in-95 duration-200">
        <AnimatedLighting color="amber" borderWidth={2.5} rounded="3xl" speed={3.2} glowIntensity="high">
          <div className="p-6 sm:p-8 rounded-[1.6rem] bg-gradient-to-b from-[#181309] via-[#0f0c05] to-[#070502] text-slate-100 shadow-2xl space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-title text-2xl font-black uppercase text-white tracking-wide text-animated-gold">
                    List Squad Player for Sale
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    {club.name} Senior Squad Transfer Registry
                  </p>
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

            <form onSubmit={handleListPlayer} className="space-y-5">
              {/* Select Player from Senior Squad */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-slate-300 font-bold tracking-wider flex items-center justify-between">
                  <span>1. Select Player to List</span>
                  <span className="text-amber-400 font-normal">
                    {availableSquad.length} Available to List
                  </span>
                </label>

                {availableSquad.length === 0 ? (
                  <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-slate-400 text-center">
                    All players in your squad are currently transfer-listed.
                  </div>
                ) : (
                  <select
                    value={selectedPlayerId}
                    onChange={(e) => handleSelectPlayer(e.target.value)}
                    className="stadium-input w-full font-mono text-sm bg-black/85 border-amber-500/30 focus:border-amber-400"
                  >
                    {availableSquad.map((p) => {
                      const pOvr = Math.round(
                        (p.pace + p.shooting + p.passing + p.dribbling + p.defending + p.physical) / 6
                      );
                      const pVal = calculatePlayerValuation(p);
                      return (
                        <option key={p.id} value={p.id}>
                          #{p.number} {p.name} ({p.position} · OVR {pOvr}) · Val: €{(pVal / 1000000).toFixed(1)}M
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* Selected Player Dossier Card with Animated Lighting */}
              {selectedPlayer && (
                <AnimatedLighting color="emerald" borderWidth={1.8} rounded="2xl" speed={3.5}>
                  <div className="p-4 rounded-2xl bg-black/80 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-black border border-white/20 flex items-center justify-center font-display font-black text-2xl text-emerald-400 shrink-0">
                          {selectedPlayer.number}
                        </div>
                        <div>
                          <div className="font-title text-xl font-bold uppercase text-white break-words leading-tight">
                            {selectedPlayer.name}
                          </div>
                          <div className="text-xs font-mono text-slate-400 mt-0.5">
                            {selectedPlayer.position} · {selectedPlayer.positionCategory} · {selectedPlayer.nationality} · {selectedPlayer.age} yrs
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">OVR Rating</div>
                        <div className="text-2xl font-title font-black text-amber-300 tabular-nums">
                          {ovr}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-black/60 border border-white/10">
                        <span className="text-slate-400 text-[10px] uppercase block">Market Valuation:</span>
                        <span className="text-amber-300 font-bold text-sm tabular-nums">
                          {formatCurrency(currentValuation)}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/60 border border-white/10">
                        <span className="text-slate-400 text-[10px] uppercase block">Match Day Stamina:</span>
                        <span className="text-emerald-400 font-bold text-sm tabular-nums">
                          {selectedPlayer.stamina}% ({selectedPlayer.condition})
                        </span>
                      </div>
                    </div>
                  </div>
                </AnimatedLighting>
              )}

              {/* Asking Price Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <label className="uppercase text-slate-300 font-bold tracking-wider">
                    2. Set Your Asking Price (€)
                  </label>
                  <span className="text-slate-400 text-[11px]">
                    Buyer clubs on {club.serverCode} will pay this fee
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-emerald-400 font-bold text-base">
                    €
                  </span>
                  <input
                    type="number"
                    min={500000}
                    step={100000}
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(Number(e.target.value))}
                    className="stadium-input w-full pl-9 font-mono text-base font-bold text-amber-300"
                    placeholder="e.g. 25000000"
                  />
                </div>

                {/* Quick price helpers */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setAskingPrice(currentValuation)}
                    className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 text-[11px] font-mono text-amber-300 cursor-pointer"
                  >
                    Match Valuation ({formatCurrency(currentValuation)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAskingPrice(Math.round(currentValuation * 1.15))}
                    className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 text-[11px] font-mono text-slate-300 hover:text-white cursor-pointer"
                  >
                    +15% Premium
                  </button>
                  <button
                    type="button"
                    onClick={() => setAskingPrice(Math.round(currentValuation * 0.9))}
                    className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 text-[11px] font-mono text-slate-300 hover:text-white cursor-pointer"
                  >
                    -10% Quick Sale
                  </button>
                </div>
              </div>

              {/* Notice */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-slate-300 space-y-1">
                <div className="text-emerald-400 font-bold uppercase">Transfer Market Rules:</div>
                <div>· Player will be listed on server <strong className="text-white">{club.serverCode}</strong> only.</div>
                <div>· You will receive a persistent notification when another manager submits an offer.</div>
                <div>· You can withdraw the listing anytime before personal contract terms are agreed.</div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="btn-broadcast-secondary text-xs py-2.5 px-4 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || availableSquad.length === 0}
                  className="btn-broadcast-gold text-xs py-2.5 px-6 font-title font-black uppercase cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Registering Listing...' : `Publish Listing (${formatCurrency(askingPrice)})`}
                </button>
              </div>
            </form>
          </div>
        </AnimatedLighting>
      </div>
    </div>
  );
};
