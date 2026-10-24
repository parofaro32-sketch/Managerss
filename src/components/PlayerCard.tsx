import React, { useMemo } from 'react';
import { Player, PlayerRank } from '../types.ts';
import { Eye, Zap, Activity, Coins } from 'lucide-react';
import { AnimatedLighting, getRandomLightingColor } from './AnimatedLighting.tsx';

interface PlayerCardProps {
  player: Player;
  isStarting?: boolean;
  assignedPosition?: string;
  onClick?: () => void;
  onInspect?: () => void;
  lightingColor?: string;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isStarting = false,
  assignedPosition,
  onClick,
  onInspect,
  lightingColor,
}) => {
  const getRankBadge = (rank: PlayerRank) => {
    switch (rank) {
      case 'Top Tier':
        return { color: 'text-amber-400', stars: '★★★★★', label: 'Top Tier' };
      case 'Worldclass':
        return { color: 'text-purple-400', stars: '★★★★', label: 'Worldclass' };
      case 'Strong':
        return { color: 'text-blue-400', stars: '★★★', label: 'Strong' };
      case 'Average':
        return { color: 'text-emerald-400', stars: '★★', label: 'Average' };
      default:
        return { color: 'text-slate-400', stars: '★', label: 'Academy Prodigy' };
    }
  };

  const getPositionCategoryColor = (category: string) => {
    switch (category) {
      case 'Goalkeeper':
        return 'text-amber-400 bg-amber-400/15 border-amber-400/40';
      case 'Defender':
        return 'text-blue-400 bg-blue-400/15 border-blue-400/40';
      case 'Midfielder':
        return 'text-emerald-400 bg-emerald-400/15 border-emerald-400/40';
      default:
        return 'text-rose-400 bg-rose-400/15 border-rose-400/40';
    }
  };

  const rankInfo = getRankBadge(player.rank);
  const ovr = Math.round(
    (player.pace + player.shooting + player.passing + player.dribbling + player.defending + player.physical) / 6
  );

  // Market Valuation calculation
  const marketValuation = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.max(12, Math.round(ovr * ovr * 7500 - player.age * 220000)));

  const cardLightingColor = useMemo(() => {
    if (lightingColor) return lightingColor;
    return isStarting ? 'emerald' : getRandomLightingColor();
  }, [lightingColor, isStarting, player.id]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (onInspect) {
      onInspect();
    }
  };

  return (
    <AnimatedLighting
      color={cardLightingColor as any}
      seedId={player.id}
      randomizeOnClick={true}
      active={true}
      borderWidth={1.8}
      rounded="2xl"
      speed={isStarting ? 3.2 : 4.5}
      glowIntensity={isStarting ? 'standard' : 'subtle'}
      className="w-full transition-transform hover:-translate-y-0.5"
    >
      <div
        onClick={handleClick}
        className={`group relative p-3 sm:p-3.5 stadium-card cursor-pointer transition-colors ${
          isStarting
            ? 'bg-[#091b12]'
            : 'bg-[#070e0a] hover:bg-[#0c1912]'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Kit Number, OVR & Name */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="relative shrink-0 mt-0.5">
              <div className="w-11 h-11 rounded-xl bg-black/85 border border-white/20 flex items-center justify-center font-display font-black text-xl text-emerald-400 shrink-0 shadow-inner group-hover:border-emerald-500/60 transition-colors">
                {player.number}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-black/95 text-[9px] font-mono font-bold text-amber-300 px-1 rounded border border-white/20 shadow">
                {ovr}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-title font-bold text-base sm:text-[17px] text-white tracking-wide break-words group-hover:text-emerald-300 transition-colors leading-tight">
                  {player.name}
                </span>
                <span className={`text-[11px] ${rankInfo.color} shrink-0`} title={player.rank}>
                  {rankInfo.stars}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mt-1 flex-wrap">
                <span
                  className={`px-1.5 py-0.5 rounded border font-bold text-[10px] shrink-0 ${getPositionCategoryColor(
                    player.positionCategory
                  )}`}
                >
                  {assignedPosition || player.position}
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-300 whitespace-nowrap">{player.nationality}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">{player.preferredFoot} Foot</span>
              </div>
            </div>
          </div>

          {/* Right Side: Market Valuation Badge with Animated Lighting & Inspect */}
          <div className="flex items-center gap-2.5 shrink-0">
            <AnimatedLighting color="amber" borderWidth={1} rounded="lg" speed={3}>
              <div className="px-2 py-1 bg-black/80 rounded-lg text-right font-mono">
                <div className="text-[8px] uppercase text-slate-400 font-bold leading-none">Valuation</div>
                <div className="text-xs font-black text-amber-300 tabular-nums">
                  {marketValuation}
                </div>
              </div>
            </AnimatedLighting>

            {onInspect && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onInspect();
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
                title="Inspect Full Player Dossier"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* REQUIRED: Underneath every player card, show MATCH DAY STAMINA */}
        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-400 uppercase">Match Day Stamina:</span>
            <span className={`font-black tabular-nums ${player.stamina < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {player.stamina}%
            </span>
            <span className="text-[10px] text-slate-500 font-normal">({player.condition})</span>
          </div>

          <div className="w-24 sm:w-28 h-2 bg-black/85 rounded-full overflow-hidden border border-white/15 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                player.stamina > 70
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : player.stamina > 40
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400'
                  : 'bg-gradient-to-r from-rose-500 to-red-500 animate-pulse'
              }`}
              style={{ width: `${player.stamina}%` }}
            />
          </div>
        </div>
      </div>
    </AnimatedLighting>
  );
};
