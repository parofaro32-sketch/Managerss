import React, { useState } from 'react';
import { 
  Player, 
  ClubItem, 
  ContractProposalItem, 
  TEAM_ROLES, 
  TeamRoleDefinition,
  calculateSuggestedWeeklyWage,
  calculatePlayerValuation 
} from '../types.ts';
import { 
  X, 
  Coins, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Sparkles, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  Check, 
  Trophy, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';
import { AnimatedLighting, LightingColorName } from './AnimatedLighting.tsx';
import { ClubLogo } from './ClubLogo.tsx';
import { api } from '../api.ts';

interface ContractNegotiationModalProps {
  contract: ContractProposalItem | null;
  buyerClub: ClubItem;
  isOpen: boolean;
  onClose: () => void;
  onTransferCompleted: (data: {
    buyerClub: ClubItem;
    transferDetails: {
      playerName: string;
      transferFee: number;
      weeklyWage: number;
      contractYears: number;
      teamRole: string;
    };
    message: string;
  }) => void;
}

export const ContractNegotiationModal: React.FC<ContractNegotiationModalProps> = ({
  contract,
  buyerClub,
  isOpen,
  onClose,
  onTransferCompleted,
}) => {
  if (!isOpen || !contract) return null;

  const player = contract.player;
  const suggestedWage = contract.suggestedWage || calculateSuggestedWeeklyWage(player);

  const [weeklyWage, setWeeklyWage] = useState<number>(suggestedWage);
  const [contractYears, setContractYears] = useState<number>(contract.contractYears || 3);
  const [teamRole, setTeamRole] = useState<string>(contract.teamRole || 'Regular Starter');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedSuccess, setCompletedSuccess] = useState<any | null>(null);

  const ovr = Math.round(
    (player.pace + player.shooting + player.passing + player.dribbling + player.defending + player.physical) / 6
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const selectedRoleDef = TEAM_ROLES.find((r) => r.role === teamRole) || TEAM_ROLES[2];

  const yearlyWage = weeklyWage * 52;
  const totalContractInvestment = yearlyWage * contractYears + contract.transferFee;

  const handleCompleteContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (weeklyWage < 5000 || weeklyWage > 1000000) {
      setError('Weekly wage must be between €5,000 and €1,000,000.');
      return;
    }

    if (buyerClub.transferBudget < contract.transferFee) {
      setError(
        `Insufficient funds: Club warchest has ${formatCurrency(buyerClub.transferBudget)}, but transfer fee is ${formatCurrency(contract.transferFee)}.`
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const data = await api.completeContractNegotiation(contract.id, {
        weeklyWage,
        contractYears,
        teamRole,
      });

      setCompletedSuccess(data);
      onTransferCompleted({
        buyerClub: (data as any).club || data.buyerClub,
        transferDetails: data.transferDetails,
        message: data.message,
      });
    } catch (err: any) {
      setError(err.message || 'Error signing contract.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/92 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Success Splash */}
        {completedSuccess ? (
          <AnimatedLighting color="emerald" borderWidth={3} rounded="3xl" speed={2.5} glowIntensity="high">
            <div className="p-8 sm:p-10 rounded-[1.6rem] bg-gradient-to-b from-[#092415] via-[#04150c] to-[#020a05] text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                <Trophy className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider border border-emerald-500/40">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Atomic Transfer Complete</span>
                </div>
                <h3 className="font-title text-3xl sm:text-4xl font-black uppercase text-white tracking-wide text-animated-emerald">
                  Welcome to {buyerClub.name}!
                </h3>
                <p className="text-slate-300 text-sm font-mono max-w-lg mx-auto">
                  {player.name} has officially put pen to paper on a {contractYears}-year contract earning {formatCurrency(weeklyWage)}/wk as our new {teamRole}.
                </p>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto text-xs font-mono">
                <div className="p-4 rounded-xl bg-black/70 border border-emerald-500/30">
                  <span className="text-slate-400 uppercase text-[10px] block">Transfer Fee:</span>
                  <span className="font-title text-xl font-bold text-amber-300">
                    {formatCurrency(contract.transferFee)}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-black/70 border border-emerald-500/30">
                  <span className="text-slate-400 uppercase text-[10px] block">Weekly Wage:</span>
                  <span className="font-title text-xl font-bold text-emerald-300">
                    {formatCurrency(weeklyWage)}/wk
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-black/70 border border-emerald-500/30">
                  <span className="text-slate-400 uppercase text-[10px] block">New Warchest:</span>
                  <span className="font-title text-xl font-bold text-white">
                    {formatCurrency(completedSuccess.club?.transferBudget || 0)}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-broadcast-primary py-3 px-8 text-sm font-title font-black uppercase cursor-pointer"
                >
                  Enter Tactical Dugout & Inspect Squad
                </button>
              </div>
            </div>
          </AnimatedLighting>
        ) : (
          <AnimatedLighting color="solar" borderWidth={2.5} rounded="3xl" speed={3.5} glowIntensity="high">
            <div className="p-6 sm:p-8 rounded-[1.6rem] bg-gradient-to-b from-[#161208] via-[#0d0a04] to-[#050402] text-slate-100 shadow-2xl space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-title text-2xl sm:text-3xl font-black uppercase text-white tracking-wide text-animated-gold">
                      Personal Contract Negotiations
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      Finalize Senior Terms for {player.name} · {buyerClub.name}
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

              {/* Player & Agreed Transfer Fee Apex Banner */}
              <AnimatedLighting color="emerald" borderWidth={1.8} rounded="2xl" speed={3.8}>
                <div className="p-4 sm:p-5 rounded-2xl bg-black/85 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 text-black flex flex-col items-center justify-center font-display font-black shadow-lg shrink-0">
                      <span className="text-[9px] font-mono leading-none">OVR</span>
                      <span className="text-2xl leading-none">{ovr}</span>
                      <span className="text-[10px] font-mono leading-none mt-0.5">{player.position}</span>
                    </div>

                    <div>
                      <h4 className="font-title text-2xl font-black uppercase text-white break-words leading-tight">
                        {player.name}
                      </h4>
                      <div className="text-xs font-mono text-slate-300 mt-0.5">
                        {player.nationality} · {player.age} yrs · {player.preferredFoot} Foot · Val: {formatCurrency(calculatePlayerValuation(player))}
                      </div>
                    </div>
                  </div>

                  {/* Transfer Fee Pill */}
                  <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-right min-w-[180px]">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                      Agreed Transfer Fee:
                    </span>
                    <span className="font-title text-2xl font-black text-white tabular-nums">
                      {formatCurrency(contract.transferFee)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      Warchest: {formatCurrency(buyerClub.transferBudget)}
                    </span>
                  </div>
                </div>
              </AnimatedLighting>

              <form onSubmit={handleCompleteContract} className="space-y-6">
                
                {/* 1. WEEKLY WAGES SECTION */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono">
                    <label className="uppercase text-amber-300 font-bold tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-amber-400" />
                      <span>1. Negotiate Weekly Wage (€/wk)</span>
                    </label>
                    <span className="text-slate-400">
                      Formula Benchmark: <strong className="text-emerald-400">{formatCurrency(suggestedWage)}/wk</strong> (Allowed: €5,000 - €1,000,000)
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/75 border border-white/10 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-emerald-400 font-black text-xl">€</span>
                      <input
                        type="number"
                        min={5000}
                        max={1000000}
                        step={1000}
                        value={weeklyWage}
                        onChange={(e) => setWeeklyWage(Math.max(0, Number(e.target.value)))}
                        className="stadium-input w-full font-mono text-xl font-black text-amber-300"
                      />
                      <span className="text-xs font-mono text-slate-400 font-bold shrink-0">/ week</span>
                    </div>

                    {/* Quick Wage Preset Steppers */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setWeeklyWage(suggestedWage)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold cursor-pointer"
                      >
                        Match Suggested ({formatCurrency(suggestedWage)}/wk)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeeklyWage(Math.round(suggestedWage * 1.15))}
                        className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
                      >
                        +15% Incentive
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeeklyWage(Math.round(suggestedWage * 1.3))}
                        className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
                      >
                        +30% Star Bonus
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-white/10 flex items-center justify-between">
                      <span>Annual Payroll Cost: <strong className="text-white">{formatCurrency(yearlyWage)}/year</strong></span>
                      <span className="text-emerald-400 font-bold">Guaranteed within club payroll ceiling</span>
                    </div>
                  </div>
                </div>

                {/* 2. CONTRACT LENGTH (1 - 5 YEARS) */}
                <div className="space-y-3">
                  <label className="text-xs font-mono uppercase text-amber-300 font-bold tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>2. Contract Length (Years)</span>
                  </label>

                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 5].map((years) => {
                      const isSelected = contractYears === years;
                      return (
                        <button
                          key={years}
                          type="button"
                          onClick={() => setContractYears(years)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-mono ${
                            isSelected
                              ? 'bg-amber-500/25 border-amber-400 text-amber-300 font-black ring-2 ring-amber-400/50 shadow-lg'
                              : 'bg-black/60 border-white/10 text-slate-400 hover:text-white hover:bg-black/80 font-bold'
                          }`}
                        >
                          <div className="font-title text-2xl font-black">{years}</div>
                          <div className="text-[10px] uppercase font-bold mt-0.5">
                            {years === 1 ? 'Year' : 'Years'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. TEAM ROLE (ALL 10 SELECTABLE ROLES WITH CLEAR DESCRIPTIONS & ANIMATED LIGHTING) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <label className="uppercase text-amber-300 font-bold tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>3. Squad Team Role (10 Options)</span>
                    </label>
                    <span className="text-slate-400 text-[11px]">
                      Expected Playing-Time Commitment
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {TEAM_ROLES.map((rDef, idx) => {
                      const isSelected = teamRole === rDef.role;
                      return (
                        <AnimatedLighting
                          key={rDef.role}
                          color={rDef.colorKey}
                          borderWidth={isSelected ? 2.5 : 1}
                          rounded="xl"
                          speed={isSelected ? 2.6 : 5}
                          glowIntensity={isSelected ? 'high' : 'subtle'}
                          className="cursor-pointer"
                          onClick={() => setTeamRole(rDef.role)}
                        >
                          <div
                            className={`p-3.5 rounded-xl flex items-start gap-3 transition-colors h-full ${
                              isSelected
                                ? 'bg-black/95 text-white'
                                : 'bg-black/60 text-slate-300 hover:bg-black/80'
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-black border ${
                                isSelected
                                  ? 'bg-amber-400 text-black border-amber-300'
                                  : 'bg-black/80 text-slate-500 border-white/10'
                              }`}
                            >
                              {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-title font-bold text-sm uppercase text-white tracking-wide break-words">
                                  {rDef.label}
                                </span>
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 shrink-0 font-bold">
                                  {rDef.minPlayingTime}
                                </span>
                              </div>

                              <p className="text-[11px] font-mono text-slate-400 mt-1 leading-snug">
                                {rDef.commitment}
                              </p>
                            </div>
                          </div>
                        </AnimatedLighting>
                      );
                    })}
                  </div>
                </div>

                {/* 4. TOTAL CONTRACT INVESTMENT SUMMARY CARD */}
                <AnimatedLighting color="emerald" borderWidth={2} rounded="2xl" speed={3}>
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#071b11] to-[#041009] space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                      <span className="font-title font-bold text-sm text-emerald-300 uppercase">
                        Contract & Transfer Execution Summary
                      </span>
                      <span className="text-[10px] text-slate-400">Atomic Backend Verification</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Transfer Fee:</span>
                        <span className="font-bold text-white text-sm">{formatCurrency(contract.transferFee)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Weekly Wage:</span>
                        <span className="font-bold text-amber-300 text-sm">{formatCurrency(weeklyWage)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Duration:</span>
                        <span className="font-bold text-white text-sm">{contractYears} Years</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Squad Role:</span>
                        <span className="font-bold text-emerald-300 text-sm">{teamRole}</span>
                      </div>
                    </div>
                  </div>
                </AnimatedLighting>

                {/* Action Controls */}
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
                    disabled={submitting}
                    className="btn-broadcast-primary text-xs py-3 px-6 font-title font-black uppercase flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4 text-black stroke-[2.5]" />
                    <span>{submitting ? 'Executing Atomic Transfer...' : 'Sign Player & Finalize Transfer'}</span>
                  </button>
                </div>
              </form>
            </div>
          </AnimatedLighting>
        )}
      </div>
    </div>
  );
};
