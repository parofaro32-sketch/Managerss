import React, { useMemo } from 'react';
import { ALL_FORMATIONS, FormationPosition } from '../data/formations.ts';
import { Player } from '../types.ts';
import { Zap } from 'lucide-react';
import { AnimatedLighting, getRandomLightingColor, LIGHTING_PALETTES } from './AnimatedLighting.tsx';

interface MiniPitchFormationProps {
  formation: string;
  className?: string;
  active?: boolean;
  startingMap?: Record<string, string>;
  squad?: Player[];
  onSlotClick?: (pos: FormationPosition) => void;
  interactive?: boolean;
  showPassingLanes?: boolean;
}

const TOKEN_COLORS = [
  'amber',
  'electric-blue',
  'cyan',
  'violet',
  'lime',
  'emerald',
  'magenta',
  'orange',
  'rose',
  'solar',
  'mint',
];

export const MiniPitchFormation: React.FC<MiniPitchFormationProps> = ({
  formation,
  className = '',
  active = false,
  startingMap,
  squad,
  onSlotClick,
  interactive = false,
  showPassingLanes = true,
}) => {
  const positions: FormationPosition[] = ALL_FORMATIONS[formation] || ALL_FORMATIONS['4-4-2'];
  const isFullPitch = Boolean(startingMap && squad);

  // Thumbnail mode (for quick shape selector cards)
  if (!isFullPitch) {
    return (
      <div
        className={`relative w-20 h-28 rounded-xl overflow-hidden border transition-all ${
          active
            ? 'border-emerald-400 bg-[#0d2a1c] shadow-[0_0_18px_rgba(16,185,129,0.45)] ring-2 ring-emerald-400'
            : 'border-white/10 bg-[#06120b] hover:border-emerald-500/50 hover:bg-[#091a10]'
        } ${className}`}
      >
        {/* Grass mowing stripes */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[repeating-linear-gradient(180deg,#ffffff,#ffffff_14px,transparent_14px,transparent_28px)]" />

        {/* Pitch markings */}
        <div className="absolute inset-1.5 border border-white/20 rounded pointer-events-none" />
        <div className="absolute inset-x-1.5 top-1/2 -translate-y-1/2 h-[1px] bg-white/20 pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border border-white/20 rounded-full pointer-events-none" />
        
        {/* 11 position dots */}
        {positions.map((pos, idx) => (
          <div
            key={pos.id}
            className={`absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border shadow-sm ${
              pos.role === 'GK'
                ? 'bg-amber-400 border-amber-200'
                : pos.role === 'DEF'
                ? 'bg-blue-400 border-blue-200'
                : pos.role === 'MID'
                ? 'bg-emerald-400 border-emerald-200'
                : 'bg-rose-400 border-rose-200'
            }`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          />
        ))}

        {/* Formation label overlay */}
        <div className="absolute bottom-0 inset-x-0 text-center text-[10px] font-display font-black uppercase tracking-tight text-white bg-black/90 py-0.5 border-t border-white/10">
          {formation}
        </div>
      </div>
    );
  }

  // Full Interactive Broadcast Pitch Mode
  const playerLookup = new Map<string, Player>();
  squad?.forEach((p) => playerLookup.set(p.id, p));

  // Determine tactical passing links between adjacent lines
  const gks = positions.filter((p) => p.role === 'GK');
  const defs = positions.filter((p) => p.role === 'DEF');
  const mids = positions.filter((p) => p.role === 'MID');
  const atts = positions.filter((p) => p.role === 'ATT');

  return (
    <AnimatedLighting
      color="cyan"
      borderWidth={3}
      rounded="3xl"
      speed={4.2}
      glowIntensity="high"
      className="w-full shadow-2xl"
    >
      <div className={`relative w-full aspect-[4/5] sm:aspect-[4/5] rounded-[1.6rem] overflow-hidden bg-[#051a11] ${className}`}>
        {/* Stadium Grass Striping with Contrast Match Cut Pattern */}
        <div className="absolute inset-0 pitch-stripes pointer-events-none opacity-90" />

        {/* 3D Matchday Stadium Floodlights from 4 corners */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_50%,rgba(6,182,212,0.18)_0%,transparent_75%)]" />
        <div className="absolute top-0 left-0 w-44 h-44 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-44 h-44 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Outer Stadium Touchline Chalk */}
        <div className="absolute inset-3.5 border-2 border-white/45 rounded-xl pointer-events-none shadow-[0_0_8px_rgba(255,255,255,0.2)]" />

        {/* Halfway Line & Center Circle */}
        <div className="absolute inset-x-3.5 top-1/2 -translate-y-1/2 h-[2px] bg-white/45 pointer-events-none shadow-[0_0_6px_rgba(255,255,255,0.25)]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 border-2 border-white/45 rounded-full pointer-events-none shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white/90 rounded-full pointer-events-none shadow-[0_0_8px_rgba(255,255,255,0.8)]" />

        {/* Top Goal Net & 18-Yard Penalty Box */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-3.5 border-b border-x border-white/30 bg-white/5 pointer-events-none" />
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-52 sm:w-64 h-22 sm:h-26 border-b-2 border-x-2 border-white/45 pointer-events-none" />
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-9 sm:h-11 border-b-2 border-x-2 border-white/45 pointer-events-none" />
        <div className="absolute top-[96px] sm:top-[112px] left-1/2 -translate-x-1/2 w-20 h-10 border-b-2 border-white/40 rounded-b-full pointer-events-none" />
        
        {/* Bottom Goal Net & 18-Yard Penalty Box (Home Goalkeeper End) */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-3.5 border-t border-x border-white/30 bg-white/5 pointer-events-none" />
        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 w-52 sm:w-64 h-22 sm:h-26 border-t-2 border-x-2 border-white/45 pointer-events-none" />
        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-9 sm:h-11 border-t-2 border-x-2 border-white/45 pointer-events-none" />
        <div className="absolute bottom-[96px] sm:bottom-[112px] left-1/2 -translate-x-1/2 w-20 h-10 border-t-2 border-white/40 rounded-t-full pointer-events-none" />
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white/90 rounded-full pointer-events-none shadow-[0_0_8px_rgba(255,255,255,0.8)]" />

        {/* 4 Corner Kick Arcs */}
        <div className="absolute top-3.5 left-3.5 w-5 h-5 border-b-2 border-r-2 border-white/45 rounded-br-full pointer-events-none" />
        <div className="absolute top-3.5 right-3.5 w-5 h-5 border-b-2 border-l-2 border-white/45 rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-3.5 left-3.5 w-5 h-5 border-t-2 border-r-2 border-white/45 rounded-tr-full pointer-events-none" />
        <div className="absolute bottom-3.5 right-3.5 w-5 h-5 border-t-2 border-l-2 border-white/45 rounded-tl-full pointer-events-none" />

        {/* Passing Lanes Layer */}
        {showPassingLanes && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-40">
            {gks.map((gk) =>
              defs.map((def) => (
                <line
                  key={`lane_${gk.id}_${def.id}`}
                  x1={`${gk.x}%`}
                  y1={`${gk.y}%`}
                  x2={`${def.x}%`}
                  y2={`${def.y}%`}
                  stroke="#4ade80"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                />
              ))
            )}
            {defs.map((def) =>
              mids.map((mid) => {
                if (Math.abs(def.x - mid.x) < 35) {
                  return (
                    <line
                      key={`lane_${def.id}_${mid.id}`}
                      x1={`${def.x}%`}
                      y1={`${def.y}%`}
                      x2={`${mid.x}%`}
                      y2={`${mid.y}%`}
                      stroke="#4ade80"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />
                  );
                }
                return null;
              })
            )}
            {mids.map((mid) =>
              atts.map((att) => {
                if (Math.abs(mid.x - att.x) < 35) {
                  return (
                    <line
                      key={`lane_${mid.id}_${att.id}`}
                      x1={`${mid.x}%`}
                      y1={`${mid.y}%`}
                      x2={`${att.x}%`}
                      y2={`${att.y}%`}
                      stroke="#4ade80"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />
                  );
                }
                return null;
              })
            )}
          </svg>
        )}

        {/* REQUIRED: ALL 11 STARTING PLAYERS INDIVIDUALLY DISPLAY INDEPENDENT ANIMATED LIGHTING */}
        {positions.map((pos, idx) => {
          const assignedPlayerId = startingMap ? startingMap[pos.id] : undefined;
          const player = assignedPlayerId ? playerLookup.get(assignedPlayerId) : undefined;
          
          // Each player's lighting color is independently selected from the premium palette
          const playerColor = TOKEN_COLORS[idx % TOKEN_COLORS.length];

          return (
            <div
              key={pos.id}
              onClick={() => onSlotClick && onSlotClick(pos)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group ${
                onSlotClick ? 'cursor-pointer' : ''
              }`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {/* Individual Animated Perimeter Lighting around each player token */}
              <AnimatedLighting
                color={playerColor as any}
                borderWidth={2}
                rounded="full"
                speed={2.2 + (idx % 4) * 0.4}
                glowIntensity="standard"
                className="transition-transform duration-200 group-hover:scale-115 active:scale-95"
              >
                <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/90 flex items-center justify-center font-title font-black text-sm sm:text-base text-white shadow-xl">
                  <span>{player ? player.number : pos.role}</span>

                  {/* Live Match Day Stamina Indicator Dot */}
                  {player && (
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-black flex items-center justify-center shadow-md ${
                        player.stamina > 70
                          ? 'bg-emerald-400'
                          : player.stamina > 40
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      title={`Match Day Stamina: ${player.stamina}%`}
                    >
                      <Zap className="w-2.5 h-2.5 text-black stroke-[3]" />
                    </div>
                  )}
                </div>
              </AnimatedLighting>

              {/* Role & Name Tag Plaque with Full Player Name Visibility */}
              <div className="mt-1 flex flex-col items-center pointer-events-none max-w-[120px] sm:max-w-[140px]">
                <span className="bg-black/95 text-white font-mono font-bold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md border border-white/20 uppercase tracking-tight shadow-md">
                  {pos.label || pos.role}
                </span>
                <span className="font-title font-bold text-[10px] sm:text-xs text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] text-center mt-0.5 leading-tight break-words px-1 py-0.5 rounded bg-black/80 border border-white/10">
                  {player ? player.name : 'Empty'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AnimatedLighting>
  );
};
