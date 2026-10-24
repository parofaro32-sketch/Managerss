import React, { useState } from 'react';
import { Player } from '../types.ts';
import { 
  Zap, 
  Activity, 
  Target, 
  SlidersHorizontal, 
  CheckCircle2, 
  Sparkles, 
  Dumbbell, 
  Gauge, 
  Clock,
  Flame,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AnimatedLighting } from './AnimatedLighting.tsx';

interface TacticalConditioningTabProps {
  squad: Player[];
  activeFormation?: string;
}

export const TacticalConditioningTab: React.FC<TacticalConditioningTabProps> = ({
  squad,
  activeFormation = '4-3-3',
}) => {
  const [selectedFocus, setSelectedFocus] = useState<'Pressing' | 'Transition' | 'Endurance' | 'Agility'>('Pressing');
  const [drillSuccess, setDrillSuccess] = useState<string | null>(null);
  const [runningSession, setRunningSession] = useState(false);

  const handleExecuteSession = (focusName: string) => {
    setRunningSession(true);
    setTimeout(() => {
      setRunningSession(false);
      setDrillSuccess(
        `Tactical Conditioning focus [${focusName}] calibrated! Squad tactical discipline and pitch coverage enhanced.`
      );
      setTimeout(() => setDrillSuccess(null), 4000);
    }, 1000);
  };

  const focusData = {
    Pressing: {
      title: 'High-Block Pressing Conditioning',
      desc: 'Synchronized pressing triggers, defensive trapping zones, and sprint recovery between 35-yard transitions.',
      staminaImpact: 'Controlled Load',
      tempo: 'Dynamic Sprint Intervals',
      cohesionBenefit: '+14% Defensive Turnovers',
      color: 'amber' as const,
    },
    Transition: {
      title: 'Rapid Counter-Attack Conditioning',
      desc: 'Explosive wing-back overlapping runs, vertical direct passing channels, and rapid recovery box-to-box sprints.',
      staminaImpact: 'Balanced Load',
      tempo: 'High Velocity Transitions',
      cohesionBenefit: '+18% Breakaway Speed',
      color: 'cyan' as const,
    },
    Endurance: {
      title: 'Aerobic Base & Match Pacing',
      desc: 'Long-phase possession circulation, low-friction positional play, and reduced fatigue attrition over 90 minutes.',
      staminaImpact: 'Minimal Drain',
      tempo: 'Sustained Match Rhythm',
      cohesionBenefit: '-20% 2nd Half Fatigue',
      color: 'emerald' as const,
    },
    Agility: {
      title: 'Agility & Tight-Space Movement',
      desc: 'Rondo drills in 10x10 grids, rapid deceleration, spatial orientation, and quick body shape readjustment.',
      staminaImpact: 'Targeted Load',
      tempo: 'High Frequency Footwork',
      cohesionBenefit: '+16% Dribble Success',
      color: 'violet' as const,
    },
  };

  const currentFocus = focusData[selectedFocus];

  return (
    // REQUIRED: Make the Tactical Conditioning tab animated, with lighting traveling around its complete border
    <AnimatedLighting
      color="solar"
      borderWidth={3}
      rounded="3xl"
      speed={3.8}
      glowIntensity="high"
      className="w-full shadow-2xl"
    >
      <div className="relative z-10 p-6 sm:p-8 rounded-[1.6rem] bg-[#0c0d06] border border-amber-500/30 space-y-6">
        
        {/* Header Strip with Animated Lighting on Badges */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-amber-500/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-amber-400 font-extrabold tracking-wider">
              <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Elite Sports Science & Match Pacing Engine</span>
            </div>
            <h3 className="font-title text-3xl sm:text-4xl font-black uppercase text-white tracking-wide text-animated-gold">
              Tactical Conditioning
            </h3>
            <p className="text-xs font-mono text-slate-300 max-w-xl">
              Calibrate your squad's tactical conditioning protocols to match your formation ({activeFormation}) without excessive muscular exhaustion.
            </p>
          </div>

          <AnimatedLighting color="amber" borderWidth={2} rounded="2xl" speed={2.8}>
            <div className="p-4 rounded-2xl bg-black/80 text-right min-w-[200px] font-mono">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Tactical Adaptation</div>
              <div className="font-title text-4xl font-black text-amber-300 tabular-nums">
                98%
              </div>
              <div className="text-[10px] text-amber-400 font-semibold mt-0.5">
                Optimized for {activeFormation} Shape
              </div>
            </div>
          </AnimatedLighting>
        </div>

        {drillSuccess && (
          <AnimatedLighting color="emerald" borderWidth={1.8} rounded="xl">
            <div className="p-4 rounded-xl bg-emerald-950/90 text-emerald-200 text-xs font-mono flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{drillSuccess}</span>
            </div>
          </AnimatedLighting>
        )}

        {/* 4 Conditioning Focus Mode Selector Cards with Animated Lighting */}
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase text-slate-300 font-bold tracking-wider">
            Select Active Tactical Conditioning Module
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['Pressing', 'Transition', 'Endurance', 'Agility'] as const).map((mode) => {
              const isSelected = selectedFocus === mode;
              const data = focusData[mode];

              return (
                <AnimatedLighting
                  key={mode}
                  color={data.color}
                  borderWidth={isSelected ? 2.5 : 1.2}
                  rounded="2xl"
                  speed={isSelected ? 2.5 : 4.5}
                  glowIntensity={isSelected ? 'high' : 'subtle'}
                  className="cursor-pointer transition-transform hover:-translate-y-1"
                  onClick={() => setSelectedFocus(mode)}
                >
                  <div
                    className={`p-5 rounded-2xl flex flex-col justify-between space-y-3 h-full transition-colors ${
                      isSelected
                        ? 'bg-black/90'
                        : 'bg-black/60 hover:bg-black/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-white/10 text-white">
                          {data.staminaImpact}
                        </span>
                        {isSelected && (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                        )}
                      </div>

                      <h4 className="font-title text-xl font-bold uppercase text-white">
                        {mode}
                      </h4>
                      <p className="text-xs font-mono text-slate-300 mt-1 leading-relaxed">
                        {data.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-400 font-bold">{data.cohesionBenefit}</span>
                      <span className="text-slate-400 uppercase text-[10px]">
                        {isSelected ? 'Active Focus' : 'Select'}
                      </span>
                    </div>
                  </div>
                </AnimatedLighting>
              );
            })}
          </div>
        </div>

        {/* Active Focus Deep Calibration Console with Animated Lighting */}
        <AnimatedLighting color={currentFocus.color} borderWidth={2.5} rounded="3xl" speed={3.2} glowIntensity="high">
          <div className="p-6 sm:p-7 rounded-[1.5rem] bg-black/90 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase text-amber-300 font-bold bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-500/40">
                  <span>Current Conditioning Protocol</span>
                </div>
                <h4 className="font-title text-2xl sm:text-3xl font-black uppercase text-white">
                  {currentFocus.title}
                </h4>
                <p className="text-xs font-mono text-slate-300 max-w-xl">
                  {currentFocus.desc}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleExecuteSession(selectedFocus)}
                disabled={runningSession}
                className="btn-broadcast-primary text-xs py-3 px-6 whitespace-nowrap shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Dumbbell className="w-4 h-4 text-black" />
                <span>{runningSession ? 'Calibrating Squad...' : 'Execute Conditioning Drill'}</span>
              </button>
            </div>

            {/* Protocol Metrics Grid with Animated Lighting */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-1">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Match Load Profile</div>
                <div className="font-title text-2xl font-black text-white">{currentFocus.staminaImpact}</div>
                <div className="text-[10px] font-mono text-emerald-400">Scientifically calibrated</div>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-1">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Velocity Tempo</div>
                <div className="font-title text-2xl font-black text-amber-300">{currentFocus.tempo}</div>
                <div className="text-[10px] font-mono text-slate-400">Paced for 90-minute dominance</div>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-1">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Key Benefit</div>
                <div className="font-title text-2xl font-black text-emerald-400">{currentFocus.cohesionBenefit}</div>
                <div className="text-[10px] font-mono text-slate-400">Matchday tactical multiplier</div>
              </div>
            </div>
          </div>
        </AnimatedLighting>
      </div>
    </AnimatedLighting>
  );
};
