import React, { useState } from 'react';
import { Player } from '../types.ts';
import { 
  Zap, 
  Activity, 
  HeartPulse, 
  Coffee, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  BatteryCharging,
  Users
} from 'lucide-react';
import { AnimatedLighting, getRandomLightingColor } from './AnimatedLighting.tsx';

interface MatchDayStaminaTabProps {
  squad: Player[];
  onRefreshSquad?: () => void;
}

export const MatchDayStaminaTab: React.FC<MatchDayStaminaTabProps> = ({ squad }) => {
  const [boostSuccess, setBoostSuccess] = useState<string | null>(null);
  const [recoverySessionActive, setRecoverySessionActive] = useState<string | null>(null);

  const readyPlayers = squad.filter((p) => p.stamina >= 70);
  const fatiguedPlayers = squad.filter((p) => p.stamina < 70 && p.stamina >= 50);
  const exhaustedPlayers = squad.filter((p) => p.stamina < 50);

  const avgSquadStamina = Math.round(
    squad.reduce((sum, p) => sum + p.stamina, 0) / (squad.length || 1)
  );

  const handleRunRecoveryDrill = (drillName: string, boostAmount: number) => {
    setRecoverySessionActive(drillName);
    setTimeout(() => {
      setRecoverySessionActive(null);
      setBoostSuccess(
        `${drillName} successfully completed! Medical team restored +${boostAmount}% conditioning across fatigued squad members.`
      );
      setTimeout(() => setBoostSuccess(null), 4000);
    }, 1200);
  };

  return (
    // REQUIRED: Make the Match Day Stamina tab animated, with lighting traveling around its complete border
    <AnimatedLighting
      color="emerald"
      borderWidth={3}
      rounded="3xl"
      speed={3.8}
      glowIntensity="high"
      className="w-full shadow-2xl"
    >
      <div className="relative z-10 p-6 sm:p-8 rounded-[1.6rem] bg-[#05140d] border border-emerald-500/30 space-y-6">
        
        {/* Header Strip with Animated Lighting on Badges */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-emerald-500/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 font-extrabold tracking-wider">
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Bio-Tactical Match Readiness & Energy Matrix</span>
            </div>
            <h3 className="font-title text-3xl sm:text-4xl font-black uppercase text-white tracking-wide text-animated-emerald">
              Match Day Stamina
            </h3>
            <p className="text-xs font-mono text-slate-300 max-w-xl">
              Monitor individual player muscular load, physiological recovery cycles, and matchday stamina reserves across the 22-man roster.
            </p>
          </div>

          <AnimatedLighting color="emerald" borderWidth={2} rounded="2xl" speed={2.8}>
            <div className="p-4 rounded-2xl bg-black/80 text-right min-w-[200px] font-mono">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Squad Conditioning Index</div>
              <div className="font-title text-4xl font-black text-emerald-400 tabular-nums">
                {avgSquadStamina}%
              </div>
              <div className="text-[10px] text-emerald-300 font-semibold mt-0.5">
                {readyPlayers.length} / 22 Fully Match Fit
              </div>
            </div>
          </AnimatedLighting>
        </div>

        {boostSuccess && (
          <AnimatedLighting color="emerald" borderWidth={1.8} rounded="xl">
            <div className="p-4 rounded-xl bg-emerald-950/90 text-emerald-200 text-xs font-mono flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{boostSuccess}</span>
            </div>
          </AnimatedLighting>
        )}

        {/* 4 Highlighted Metric Cards with Animated Lighting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedLighting color="emerald" borderWidth={1.8} rounded="2xl" speed={3.5}>
            <div className="p-5 rounded-2xl stadium-panel bg-[#071910] space-y-2 h-full">
              <div className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center justify-between">
                <span>Match-Ready Starters</span>
                <HeartPulse className="w-4 h-4" />
              </div>
              <div className="font-title text-4xl font-black text-white tabular-nums">
                {readyPlayers.length}
              </div>
              <div className="text-[11px] font-mono text-emerald-300">
                Stamina at or above 70% threshold
              </div>
            </div>
          </AnimatedLighting>

          <AnimatedLighting color="amber" borderWidth={1.8} rounded="2xl" speed={3.8}>
            <div className="p-5 rounded-2xl stadium-panel bg-[#191507] space-y-2 h-full">
              <div className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center justify-between">
                <span>Mild Fatigue Warning</span>
                <Activity className="w-4 h-4" />
              </div>
              <div className="font-title text-4xl font-black text-amber-300 tabular-nums">
                {fatiguedPlayers.length}
              </div>
              <div className="text-[11px] font-mono text-slate-300">
                Stamina 50% - 69% (Rotation advised)
              </div>
            </div>
          </AnimatedLighting>

          <AnimatedLighting color="rose" borderWidth={1.8} rounded="2xl" speed={3}>
            <div className="p-5 rounded-2xl stadium-panel bg-[#1a070e] space-y-2 h-full">
              <div className="text-xs font-mono uppercase text-rose-400 font-bold flex items-center justify-between">
                <span>Exhaustion Critical</span>
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="font-title text-4xl font-black text-rose-400 tabular-nums">
                {exhaustedPlayers.length}
              </div>
              <div className="text-[11px] font-mono text-rose-300">
                Below 50% (High fatigue risk)
              </div>
            </div>
          </AnimatedLighting>

          <AnimatedLighting color="cyan" borderWidth={1.8} rounded="2xl" speed={3.2}>
            <div className="p-5 rounded-2xl stadium-panel bg-[#051821] space-y-2 h-full">
              <div className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center justify-between">
                <span>Recovery Speed</span>
                <BatteryCharging className="w-4 h-4" />
              </div>
              <div className="font-title text-4xl font-black text-cyan-300 tabular-nums">
                +10%
              </div>
              <div className="text-[11px] font-mono text-slate-300">
                Automatic regeneration per match rest
              </div>
            </div>
          </AnimatedLighting>
        </div>

        {/* Interactive Physiotherapy & Conditioning Recovery Actions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-title text-lg font-black uppercase text-white tracking-wide">
              Medical & Physiotherapy Interventions
            </span>
            <span className="text-emerald-400 font-mono">High-Tech Recovery Suite</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Cryotherapy Chamber', boost: 8, time: 'Immediate', desc: 'Sub-zero cryo-flush to flush lactic acid and accelerate muscular repair.', color: 'cyan' },
              { title: 'Hydration & Nutrition Protocol', boost: 6, time: 'Immediate', desc: 'Electrolyte rebalancing and optimal glycogen replenishment for midfielders.', color: 'emerald' },
              { title: 'Deep Tissue Massage & Hydrotherapy', boost: 10, time: 'Immediate', desc: 'Specialized sports physiotherapy relieving acute hamstring and calf tightness.', color: 'amber' },
            ].map((action, idx) => (
              <AnimatedLighting key={idx} color={action.color as any} borderWidth={1.8} rounded="2xl" speed={3.4}>
                <div className="p-5 rounded-2xl bg-black/80 flex flex-col justify-between space-y-4 h-full">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-title text-xl font-bold uppercase text-white">
                        {action.title}
                      </h4>
                      <span className="text-xs font-mono font-bold text-emerald-400">+{action.boost}%</span>
                    </div>
                    <p className="text-xs font-mono text-slate-300 leading-relaxed">
                      {action.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRunRecoveryDrill(action.title, action.boost)}
                    disabled={Boolean(recoverySessionActive)}
                    className="btn-broadcast-primary w-full text-xs py-2.5 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Coffee className="w-3.5 h-3.5 text-black" />
                    <span>{recoverySessionActive === action.title ? 'Conducting Session...' : `Administer (${action.time})`}</span>
                  </button>
                </div>
              </AnimatedLighting>
            ))}
          </div>
        </div>

        {/* 22-Player Match Day Stamina Monitoring Table with Animated Lighting */}
        <AnimatedLighting color="emerald" borderWidth={2} rounded="2xl" speed={4}>
          <div className="p-5 rounded-2xl bg-black/85 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h4 className="font-title text-xl font-bold uppercase text-white">
                  Squad Match Day Stamina Roster (22 Players)
                </h4>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Live Conditioning Telemetry
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {squad.map((player) => (
                <div
                  key={player.id}
                  className="p-3.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-black border border-white/20 flex items-center justify-center font-display font-black text-emerald-400 text-sm">
                      {player.number}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-title font-bold text-sm text-white break-words leading-tight">
                        {player.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {player.position} · {player.positionCategory}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-xs font-mono font-black tabular-nums ${player.stamina < 50 ? 'text-rose-400' : player.stamina < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {player.stamina}%
                    </div>
                    <div className="w-16 h-1.5 bg-black rounded-full overflow-hidden mt-1 border border-white/10">
                      <div
                        className={`h-full ${player.stamina > 70 ? 'bg-emerald-400' : player.stamina > 40 ? 'bg-amber-400' : 'bg-rose-500'}`}
                        style={{ width: `${player.stamina}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedLighting>
      </div>
    </AnimatedLighting>
  );
};
