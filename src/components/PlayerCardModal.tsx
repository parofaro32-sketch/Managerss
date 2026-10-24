import React, { useState, useEffect, useMemo } from 'react';
import { Player, PlayerRank } from '../types.ts';
import { 
  X, 
  Zap, 
  Award, 
  Globe, 
  Shield, 
  Activity, 
  CheckCircle2, 
  Sparkles,
  Flame,
  TrendingUp,
  User,
  Star
} from 'lucide-react';
import { AnimatedLighting, getRandomLightingColor } from './AnimatedLighting.tsx';
import { AnimatedStadiumBackground } from './AnimatedStadiumBackground.tsx';

interface PlayerCardModalProps {
  player: Player | null;
  onClose: () => void;
  isStarter?: boolean;
  onToggleStarter?: (player: Player) => void;
}

export const PlayerCardModal: React.FC<PlayerCardModalProps> = ({
  player,
  onClose,
  isStarter = false,
  onToggleStarter,
}) => {
  if (!player) return null;

  // Whenever a player is opened or switched, generate a new randomly selected lighting color
  const [profileLightingColor, setProfileLightingColor] = useState<string>(() => getRandomLightingColor());

  useEffect(() => {
    setProfileLightingColor(getRandomLightingColor());
  }, [player.id]);

  // Calculate Overall Rating (OVR)
  const ovr = Math.round(
    (player.pace + player.shooting + player.passing + player.dribbling + player.defending + player.physical) / 6
  );

  const getRankBadge = (rank: PlayerRank) => {
    switch (rank) {
      case 'Top Tier':
        return { 
          label: 'TOP TIER ICON', 
          border: 'border-amber-400/60', 
          bg: 'bg-amber-500/20 text-amber-300', 
          colorKey: 'amber' as const
        };
      case 'Worldclass':
        return { 
          label: 'WORLDCLASS ELITE', 
          border: 'border-purple-400/60', 
          bg: 'bg-purple-500/20 text-purple-300', 
          colorKey: 'violet' as const
        };
      case 'Strong':
        return { 
          label: 'FIRST TEAM REGULAR', 
          border: 'border-blue-400/60', 
          bg: 'bg-blue-500/20 text-blue-300', 
          colorKey: 'electric-blue' as const
        };
      case 'Average':
        return { 
          label: 'SQUAD CONTENDER', 
          border: 'border-emerald-400/60', 
          bg: 'bg-emerald-500/20 text-emerald-300', 
          colorKey: 'emerald' as const
        };
      default:
        return { 
          label: 'ACADEMY PRODIGY', 
          border: 'border-cyan-400/60', 
          bg: 'bg-cyan-500/20 text-cyan-300', 
          colorKey: 'cyan' as const
        };
    }
  };

  const rankBadge = getRankBadge(player.rank);

  // Position Category Colors
  const getCategoryStyles = () => {
    switch (player.positionCategory) {
      case 'Goalkeeper':
        return { tag: 'GK · GOALKEEPER', badge: 'bg-amber-400 text-black border-amber-300' };
      case 'Defender':
        return { tag: 'DEF · DEFENDER', badge: 'bg-blue-500 text-white border-blue-300' };
      case 'Midfielder':
        return { tag: 'MID · MIDFIELDER', badge: 'bg-emerald-500 text-black border-emerald-300' };
      default:
        return { tag: 'FWD · ATTACKER', badge: 'bg-rose-500 text-white border-rose-300' };
    }
  };

  const categoryStyles = getCategoryStyles();

  // Valuation model estimate based on rating & age
  const estimatedValuation = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.max(12, Math.round(ovr * ovr * 7500 - player.age * 220000)));

  const estimatedWage = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.max(15000, Math.round(ovr * 1850)));

  const attributesList = [
    { label: 'Pace (PAC)', value: player.pace, colorName: 'cyan', textCol: 'text-cyan-400', barCol: 'bg-cyan-400', desc: 'Sprint speed & acceleration' },
    { label: 'Shooting (SHO)', value: player.shooting, colorName: 'amber', textCol: 'text-amber-400', barCol: 'bg-amber-400', desc: 'Finishing & shot power' },
    { label: 'Passing (PAS)', value: player.passing, colorName: 'emerald', textCol: 'text-emerald-400', barCol: 'bg-emerald-400', desc: 'Vision & through-ball delivery' },
    { label: 'Dribbling (DRI)', value: player.dribbling, colorName: 'violet', textCol: 'text-purple-400', barCol: 'bg-purple-400', desc: 'Agility, balance & control' },
    { label: 'Defending (DEF)', value: player.defending, colorName: 'electric-blue', textCol: 'text-blue-400', barCol: 'bg-blue-400', desc: 'Tackling & interception IQ' },
    { label: 'Physicality (PHY)', value: player.physical, colorName: 'rose', textCol: 'text-rose-400', barCol: 'bg-rose-400', desc: 'Stamina, strength & duel rate' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/92 backdrop-blur-2xl overflow-y-auto">
      {/* Shared animated stadium background */}
      <AnimatedStadiumBackground opacityBoost={false} />

      {/* Main Profile Card with Randomly Selected Animated Lighting Border */}
      <div className="relative w-full max-w-2xl my-auto animate-in fade-in zoom-in-95 duration-300">
        <AnimatedLighting
          color={profileLightingColor as any}
          randomizeOnSelect={true}
          active={true}
          borderWidth={3}
          rounded="3xl"
          glowIntensity="high"
          className="w-full shadow-2xl"
        >
          <div className="relative z-10 w-full rounded-[1.6rem] bg-gradient-to-b from-[#131f18] via-[#09130e] to-[#040806] p-5 sm:p-7 text-slate-100 shadow-2xl space-y-6">
            
            {/* Top Navigation Bar with Animated Badges */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 gap-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-title font-black text-sm tracking-wide text-animated-silver">
                  Official Player Dossier
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {/* REQUIRED: Animated lighting around Academy Prodigy / Rank badge */}
                <AnimatedLighting
                  color={rankBadge.colorKey}
                  borderWidth={1.5}
                  rounded="full"
                  speed={2.6}
                >
                  <span className={`text-[10px] font-mono px-3 py-1 rounded-full font-black uppercase flex items-center gap-1.5 bg-black/90 ${rankBadge.bg}`}>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{rankBadge.label}</span>
                  </span>
                </AnimatedLighting>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* APEX HEADER: OVR, PORTRAIT AREA, PLAYER DETAILS, MARKET VALUATION */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              
              {/* OVR Rating Badge with Animated Lighting */}
              <div className="sm:col-span-3 flex justify-center sm:justify-start">
                <AnimatedLighting
                  color="amber"
                  borderWidth={2.5}
                  rounded="2xl"
                  speed={2.8}
                  glowIntensity="high"
                >
                  <div className="flex flex-col items-center justify-center w-24 h-28 rounded-2xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 text-black p-2 shadow-xl">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider">OVR</span>
                    <span className="font-title text-5xl font-black leading-none tracking-tight text-black">
                      {ovr}
                    </span>
                    <span className="text-xs font-mono font-black uppercase mt-1 px-2 py-0.5 rounded bg-black text-amber-300">
                      {player.position}
                    </span>
                  </div>
                </AnimatedLighting>
              </div>

              {/* Player Portrait & Details Area with Animated Lighting */}
              <div className="sm:col-span-5">
                <AnimatedLighting
                  color="emerald"
                  borderWidth={1.8}
                  rounded="2xl"
                  speed={3.5}
                >
                  <div className="p-3.5 rounded-2xl bg-black/75 border border-white/10 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded shadow-sm ${categoryStyles.badge}`}>
                        {categoryStyles.tag}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Kit #{player.number}
                      </span>
                    </div>

                    <h2 className="font-title text-2xl sm:text-3xl font-black uppercase text-white tracking-wide break-words leading-tight">
                      {player.name}
                    </h2>

                    <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                      <div>Nationality: <strong className="text-white">{player.nationality}</strong></div>
                      <div>Age: <strong className="text-white">{player.age} yrs</strong> · Foot: <strong className="text-amber-300">{player.preferredFoot}</strong></div>
                      <div className="text-emerald-400 font-bold">
                        {isStarter ? '★ First-Team Starting XI' : 'Bench Reserve Option'}
                      </div>
                    </div>
                  </div>
                </AnimatedLighting>
              </div>

              {/* REQUIRED: Market Valuation with Animated Lighting */}
              <div className="sm:col-span-4">
                <AnimatedLighting
                  color="amber"
                  borderWidth={2}
                  rounded="2xl"
                  speed={3}
                  glowIntensity="high"
                >
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/70 to-black/90 text-right space-y-1 font-mono">
                    <div className="text-[10px] uppercase text-amber-300 font-black tracking-wider flex items-center justify-end gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>MARKET VALUATION</span>
                    </div>
                    <div className="font-title text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tabular-nums">
                      {estimatedValuation}
                    </div>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-amber-500/20">
                      Wage: <strong className="text-emerald-400">{estimatedWage}</strong> / wk
                    </div>
                  </div>
                </AnimatedLighting>
              </div>
            </div>

            {/* REQUIRED: MATCH DAY STAMINA (REPLACED MATCH THRESHOLD) WITH ANIMATED LIGHTING */}
            <AnimatedLighting
              color="emerald"
              borderWidth={2}
              rounded="2xl"
              speed={3.2}
              glowIntensity="standard"
            >
              <div className="p-4 rounded-2xl bg-black/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold flex items-center gap-2 uppercase text-slate-200">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Match Day Stamina & Conditioning ({player.condition})</span>
                  </span>
                  <span className={`font-title text-2xl font-black tabular-nums ${player.stamina < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {player.stamina}%
                  </span>
                </div>

                {/* High-Performance Stamina Bar */}
                <div className="w-full h-3.5 bg-black/90 rounded-full overflow-hidden p-0.5 border border-white/20 relative shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      player.stamina > 70
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                        : player.stamina > 40
                        ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.7)]'
                        : 'bg-gradient-to-r from-rose-600 via-red-500 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.7)]'
                    }`}
                    style={{ width: `${player.stamina}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                  <span>Match Day Stamina: <strong className="text-emerald-400 font-bold">Optimal Condition</strong></span>
                  <span>Conditioning Pace: <strong className="text-amber-300 font-bold">Standard Match Load</strong></span>
                  <span>Post-Match Recovery: <strong className="text-emerald-400 font-bold">+10% Refresh</strong></span>
                </div>
              </div>
            </AnimatedLighting>

            {/* REQUIRED: ANIMATED LIGHTING AROUND EVERY INDIVIDUAL ATTRIBUTE PANEL */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                <span className="font-title text-sm tracking-wide text-white">Performance Attributes Radar</span>
                <span className="text-emerald-400 font-mono text-xs">Individually Calibrated</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {attributesList.map((stat) => (
                  <AnimatedLighting
                    key={stat.label}
                    color={stat.colorName as any}
                    borderWidth={1.5}
                    rounded="xl"
                    speed={3.8}
                    className="w-full"
                  >
                    <div className="p-3.5 rounded-xl bg-black/85 flex flex-col justify-between space-y-2 h-full">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                          {stat.label.split(' ')[0]}
                        </span>
                        <span className={`font-title text-2xl font-black tabular-nums ${stat.textCol}`}>
                          {stat.value}
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/10">
                        <div className={`h-full rounded-full ${stat.barCol}`} style={{ width: `${stat.value}%` }} />
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 leading-tight">
                        {stat.desc}
                      </div>
                    </div>
                  </AnimatedLighting>
                ))}
              </div>
            </div>

            {/* Action Footer with Animated Lighting on Buttons */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              {onToggleStarter ? (
                <AnimatedLighting color={isStarter ? 'rose' : 'emerald'} borderWidth={2} rounded="xl">
                  <button
                    type="button"
                    onClick={() => {
                      onToggleStarter(player);
                      onClose();
                    }}
                    className={`text-xs py-2.5 px-4 rounded-xl font-display uppercase tracking-wider font-black transition-all cursor-pointer flex items-center gap-2 ${
                      isStarter
                        ? 'bg-rose-950/90 text-rose-300 hover:bg-rose-900'
                        : 'btn-broadcast-primary'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isStarter ? 'Move to Bench Reserves' : 'Assign to Starting XI'}</span>
                  </button>
                </AnimatedLighting>
              ) : (
                <div className="text-xs font-mono text-slate-400">
                  Position: <strong className="text-white">{player.position}</strong> ({player.positionCategory})
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="btn-broadcast-secondary text-xs py-2.5 px-5 cursor-pointer ml-auto"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </AnimatedLighting>
      </div>
    </div>
  );
};
