import React, { useState } from 'react';
import { Player, LineupConfig, PlayerRank, PositionCategory } from '../types.ts';
import { ALL_FORMATIONS, FormationPosition } from '../data/formations.ts';
import { MiniPitchFormation } from './MiniPitchFormation.tsx';
import { PlayerCardModal } from './PlayerCardModal.tsx';
import { PlayerCard } from './PlayerCard.tsx';
import { 
  Shield, 
  Save, 
  Users, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ChevronDown,
  Sparkles,
  Zap,
  Wand2,
  GitBranch,
  Layers,
  Activity
} from 'lucide-react';
import { AnimatedLighting } from './AnimatedLighting.tsx';

interface LineupTabProps {
  squad: Player[];
  currentLineup: LineupConfig | null;
  onUpdateLineup: (lineup: LineupConfig) => Promise<void>;
}

export const LineupTab: React.FC<LineupTabProps> = ({ squad, currentLineup, onUpdateLineup }) => {
  const safeSquad = squad || [];
  const [selectedFormation, setSelectedFormation] = useState<string>(currentLineup?.formation || '4-3-3');
  const [showPassingLanes, setShowPassingLanes] = useState(true);

  // Starting players map: positionId -> playerId
  const [startingMap, setStartingMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    if (currentLineup && currentLineup.startingPlayers && currentLineup.startingPlayers.length > 0) {
      const formPositions = ALL_FORMATIONS[currentLineup.formation || '4-3-3'] || ALL_FORMATIONS['4-3-3'];
      currentLineup.startingPlayers.forEach((sp, idx) => {
        if (formPositions[idx]) {
          map[formPositions[idx].id] = sp.playerId;
        }
      });
    } else {
      const formPositions = ALL_FORMATIONS['4-3-3'];
      safeSquad.slice(0, 11).forEach((p, idx) => {
        if (formPositions[idx]) {
          map[formPositions[idx].id] = p.id;
        }
      });
    }
    return map;
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals & Drawers
  const [formationModalOpen, setFormationModalOpen] = useState(false);
  const [activeSlotForAssign, setActiveSlotForAssign] = useState<FormationPosition | null>(null);
  const [inspectingPlayer, setInspectingPlayer] = useState<Player | null>(null);
  const [benchFilter, setBenchFilter] = useState<'ALL' | PositionCategory>('ALL');

  const formationPositions: FormationPosition[] = ALL_FORMATIONS[selectedFormation] || ALL_FORMATIONS['4-3-3'];
  const assignedPlayerIds = new Set(Object.values(startingMap));

  const benchPlayers = safeSquad.filter((p) => !assignedPlayerIds.has(p.id));
  const filteredBench = benchFilter === 'ALL' 
    ? benchPlayers 
    : benchPlayers.filter((p) => p.positionCategory === benchFilter);

  // Swap / Assign player into position slot
  const handleAssignPlayerToSlot = (slotId: string, playerId: string) => {
    setStartingMap((prev) => {
      const next = { ...prev };
      let existingSlotOfPlayer: string | null = null;
      for (const [k, v] of Object.entries(next)) {
        if (v === playerId) {
          existingSlotOfPlayer = k;
          break;
        }
      }

      const currentPlayerInTargetSlot = next[slotId];

      if (existingSlotOfPlayer) {
        if (currentPlayerInTargetSlot) {
          next[existingSlotOfPlayer] = currentPlayerInTargetSlot;
        } else {
          delete next[existingSlotOfPlayer];
        }
      }

      next[slotId] = playerId;
      return next;
    });
    setActiveSlotForAssign(null);
  };

  // Auto-Pick Best XI (Algorithm: highest ranked player per needed position category)
  const handleAutoPickBest11 = () => {
    const nextMap: Record<string, string> = {};
    const usedIds = new Set<string>();

    const rankWeights: Record<PlayerRank, number> = {
      'Top Tier': 5,
      'Worldclass': 4,
      'Strong': 3,
      'Average': 2,
      'Weak': 1,
    };

    const sortedBySkill = [...safeSquad].sort((a, b) => {
      const scoreA = rankWeights[a.rank] * 100 + a.stamina;
      const scoreB = rankWeights[b.rank] * 100 + b.stamina;
      return scoreB - scoreA;
    });

    formationPositions.forEach((pos) => {
      const targetCategory: PositionCategory =
        pos.role === 'GK' ? 'Goalkeeper' : pos.role === 'DEF' ? 'Defender' : pos.role === 'MID' ? 'Midfielder' : 'Attacker';

      const match = sortedBySkill.find((p) => !usedIds.has(p.id) && p.positionCategory === targetCategory);
      if (match) {
        nextMap[pos.id] = match.id;
        usedIds.add(match.id);
      } else {
        const fallback = sortedBySkill.find((p) => !usedIds.has(p.id));
        if (fallback) {
          nextMap[pos.id] = fallback.id;
          usedIds.add(fallback.id);
        }
      }
    });

    setStartingMap(nextMap);
    setSuccessMsg('Tactical AI auto-selected the optimal 11 starters by match stamina and form!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Switch formation with auto-mapping
  const handleSelectFormation = (formKey: string) => {
    setSelectedFormation(formKey);
    const newPositions = ALL_FORMATIONS[formKey] || ALL_FORMATIONS['4-3-3'];
    const currentStarters = Object.values(startingMap);
    const nextMap: Record<string, string> = {};

    newPositions.forEach((pos, idx) => {
      if (currentStarters[idx]) {
        nextMap[pos.id] = currentStarters[idx];
      } else if (safeSquad[idx]) {
        nextMap[pos.id] = safeSquad[idx].id;
      }
    });

    setStartingMap(nextMap);
    setFormationModalOpen(false);
  };

  // Save tactical lineup to backend
  const handleSaveLineup = async () => {
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const startingPlayers = formationPositions.map((pos) => {
        const pId = startingMap[pos.id];
        return {
          playerId: pId || '',
          position: pos.role,
        };
      });

      const lineupConfig: LineupConfig = {
        formation: selectedFormation,
        teamEffort: 'High',
        startingPlayers,
      };

      await onUpdateLineup(lineupConfig);
      setSuccessMsg('Tactical master sheet saved and synchronized with match server!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save lineup configuration.');
    } finally {
      setSaving(false);
    }
  };

  const startingPlayersList = Object.values(startingMap)
    .map((id) => safeSquad.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const avgStamina = startingPlayersList.length
    ? Math.round(startingPlayersList.reduce((acc, p) => acc + p.stamina, 0) / startingPlayersList.length)
    : 100;

  return (
    // REQUIRED: Add animated lighting traveling around the entire lineup-tab boundary
    <AnimatedLighting
      color="solar"
      borderWidth={3}
      rounded="3xl"
      speed={4}
      glowIntensity="high"
      className="w-full shadow-2xl"
    >
      <div className="relative z-10 p-5 sm:p-7 rounded-[1.6rem] bg-[#060c09] border border-amber-500/30 space-y-6">
        
        {/* Top Tactical Command Strip with Animated Lighting on Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <AnimatedLighting color="amber" borderWidth={2} rounded="2xl" speed={2.8}>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 flex items-center justify-center text-black font-title font-black text-2xl shadow-lg">
                {selectedFormation.split('-')[0]}
              </div>
            </AnimatedLighting>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-title text-2xl sm:text-3xl font-black uppercase text-white tracking-wide text-animated-gold">
                  Tactical Pitch & Lineup
                </h2>
                <AnimatedLighting color="amber" borderWidth={1.5} rounded="md" speed={2.6}>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-mono font-bold">
                    {selectedFormation}
                  </span>
                </AnimatedLighting>
              </div>
              <div className="text-xs font-mono text-amber-200/70 mt-1 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>3D Pitch physics, individual starter lighting & tactical formations</span>
              </div>
            </div>
          </div>

          {/* Action Buttons with Animated Lighting */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <AnimatedLighting color="amber" borderWidth={1.8} rounded="xl" speed={2.8}>
              <button
                type="button"
                onClick={handleAutoPickBest11}
                className="btn-broadcast-gold text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-md"
                title="Auto-select optimal starting XI"
              >
                <Wand2 className="w-3.5 h-3.5 text-black" />
                <span className="font-bold">Auto Best 11</span>
              </button>
            </AnimatedLighting>

            <AnimatedLighting color="cyan" borderWidth={1.8} rounded="xl" speed={3.2}>
              <button
                type="button"
                onClick={() => setFormationModalOpen(true)}
                className="btn-broadcast-secondary text-xs py-2 px-3.5 border-cyan-500/40 hover:border-cyan-400"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Formations ({Object.keys(ALL_FORMATIONS).length})</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </AnimatedLighting>

            <AnimatedLighting color="emerald" borderWidth={2} rounded="xl" speed={2.6}>
              <button
                type="button"
                onClick={handleSaveLineup}
                disabled={saving}
                className="btn-broadcast-primary text-sm py-2 px-5 shadow-lg shadow-emerald-500/35"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <Save className="w-4 h-4 text-black" />
                )}
                <span>{saving ? 'Transmitting...' : 'Save Tactics'}</span>
              </button>
            </AnimatedLighting>
          </div>
        </div>

        {/* Quick Formation Tabs Bar with Animated Lighting on Active Tab */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-slate-400 uppercase font-bold mr-1 text-[11px]">Tactical Shapes:</span>
            {['4-3-3', '4-2-3-1', '3-5-2', '4-4-2', '5-3-2', '3-4-3', '4-1-4-1'].map((f) => {
              const isActive = selectedFormation === f;
              if (isActive) {
                return (
                  <AnimatedLighting key={f} color="solar" borderWidth={2} rounded="lg" speed={2.2}>
                    <button
                      type="button"
                      onClick={() => handleSelectFormation(f)}
                      className="px-3 py-1 rounded-lg font-title uppercase tracking-wider font-black transition-all cursor-pointer bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-md"
                    >
                      {f}
                    </button>
                  </AnimatedLighting>
                );
              }
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleSelectFormation(f)}
                  className="px-3 py-1 rounded-lg font-title uppercase tracking-wider font-bold transition-all cursor-pointer bg-black/60 text-slate-300 hover:text-white border border-white/10 shrink-0"
                >
                  {f}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">Avg Starter Stamina:</span>
            <AnimatedLighting color={avgStamina < 60 ? 'rose' : 'emerald'} borderWidth={1.5} rounded="md">
              <span className={`px-2 py-0.5 rounded font-bold font-mono ${avgStamina < 60 ? 'text-rose-400' : 'text-emerald-300'}`}>
                {avgStamina}%
              </span>
            </AnimatedLighting>
          </div>
        </div>

        {/* Status alerts */}
        {successMsg && (
          <AnimatedLighting color="emerald" borderWidth={1.5} rounded="xl">
            <div className="p-3.5 rounded-xl bg-emerald-950/90 text-emerald-300 text-xs flex items-center gap-2.5 font-medium shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          </AnimatedLighting>
        )}
        {errorMsg && (
          <AnimatedLighting color="rose" borderWidth={1.5} rounded="xl">
            <div className="p-3.5 rounded-xl bg-rose-950/90 text-rose-300 text-xs flex items-center gap-2.5 font-medium shadow-lg">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          </AnimatedLighting>
        )}

        {/* Main Tactical Pitch & Reserves Shelf (NO SQUAD WORK / RATE INTENSITY) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Col (7 cols): Stadium Tactical Pitch Canvas with individual lighting for all 11 starters */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Active Tactical Surface</span>
              </span>

              <button
                type="button"
                onClick={() => setShowPassingLanes(!showPassingLanes)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1.5 ${
                  showPassingLanes
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                    : 'bg-black/40 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                <GitBranch className="w-3 h-3 text-cyan-400" />
                <span>Passing Vectors</span>
              </button>
            </div>

            {/* Pitch with individual animated lighting on all 11 markers */}
            <MiniPitchFormation
              formation={selectedFormation}
              startingMap={startingMap}
              squad={safeSquad}
              onSlotClick={(pos) => setActiveSlotForAssign(pos)}
              showPassingLanes={showPassingLanes}
            />

            <div className="text-center text-xs font-mono text-cyan-200/80">
              Click any starter token on the pitch to substitute or open player profile
            </div>
          </div>

          {/* Right Col (5 cols): Bench & Reserve Options Shelf */}
          <div className="lg:col-span-5 space-y-4">
            <AnimatedLighting color="violet" borderWidth={2} rounded="3xl" speed={3.8}>
              <div className="p-5 rounded-[1.4rem] bg-[#090714] border border-purple-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <h3 className="font-title text-xl font-bold uppercase text-white">
                      Bench & Reserves ({benchPlayers.length})
                    </h3>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10 text-[10px] font-mono">
                    {[
                      { label: 'ALL', value: 'ALL' },
                      { label: 'GK', value: 'Goalkeeper' },
                      { label: 'DEF', value: 'Defender' },
                      { label: 'MID', value: 'Midfielder' },
                      { label: 'FWD', value: 'Attacker' },
                    ].map((cat) => (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => setBenchFilter(cat.value as any)}
                        className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                          benchFilter === cat.value
                            ? 'bg-purple-500 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reserves List with PlayerCard animated perimeter lighting */}
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {filteredBench.length === 0 ? (
                    <div className="text-center py-8 text-xs font-mono text-slate-500">
                      No reserve players in this category
                    </div>
                  ) : (
                    filteredBench.map((player) => (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        onInspect={() => setInspectingPlayer(player)}
                        onClick={
                          activeSlotForAssign
                            ? () => handleAssignPlayerToSlot(activeSlotForAssign.id, player.id)
                            : undefined
                        }
                      />
                    ))
                  )}
                </div>
              </div>
            </AnimatedLighting>
          </div>
        </div>

        {/* Slot Substitution Modal */}
        {activeSlotForAssign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
            <div className="relative w-full max-w-lg my-auto">
              <AnimatedLighting color="emerald" borderWidth={2.5} rounded="3xl" speed={3}>
                <div className="p-6 rounded-[1.5rem] bg-[#06120b] border border-emerald-500/40 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <h3 className="font-title text-2xl font-black uppercase text-white">
                        Substitute: {activeSlotForAssign.label || activeSlotForAssign.role}
                      </h3>
                      <div className="text-xs font-mono text-slate-400">
                        Select replacement starter from your 22-man roster
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSlotForAssign(null)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {safeSquad.map((player) => {
                      const isCurrentInSlot = startingMap[activeSlotForAssign.id] === player.id;
                      const isAssignedElsewhere = !isCurrentInSlot && assignedPlayerIds.has(player.id);

                      return (
                        <div
                          key={player.id}
                          onClick={() => handleAssignPlayerToSlot(activeSlotForAssign.id, player.id)}
                          className={`p-3 rounded-2xl stadium-card border flex items-center justify-between cursor-pointer transition-all ${
                            isCurrentInSlot
                              ? 'border-emerald-500 bg-emerald-950/50 ring-1 ring-emerald-400'
                              : 'border-white/10 hover:border-emerald-500/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-black/70 border border-white/15 flex items-center justify-center font-display font-black text-emerald-400">
                              {player.number}
                            </div>
                            <div>
                              <div className="font-title font-bold text-base text-white">
                                {player.name}
                              </div>
                              <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                                <span className="font-bold text-emerald-400">{player.position}</span>
                                <span>·</span>
                                <span>{player.rank}</span>
                                {isAssignedElsewhere && (
                                  <span className="text-amber-400 font-bold">(In Starting 11)</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-emerald-400">{player.stamina}% Stamina</div>
                            {isCurrentInSlot ? (
                              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Current Starter</span>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-400 uppercase hover:text-white">Click to Select</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </AnimatedLighting>
            </div>
          </div>
        )}

        {/* Formations Master Modal */}
        {formationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
            <div className="relative w-full max-w-4xl my-auto">
              <AnimatedLighting color="cyan" borderWidth={2.5} rounded="3xl" speed={3.5}>
                <div className="p-6 rounded-[1.5rem] bg-[#040e14] border border-cyan-500/40 space-y-5 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <h3 className="font-title text-3xl font-black uppercase text-white">
                        15 Tactical Master Blueprints
                      </h3>
                      <div className="text-xs font-mono text-slate-400">
                        Select a tactical shape to instantly re-calculate player pitch coordinates
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormationModalOpen(false)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto p-1">
                    {Object.keys(ALL_FORMATIONS).map((formKey) => (
                      <div
                        key={formKey}
                        onClick={() => handleSelectFormation(formKey)}
                        className={`p-3 rounded-2xl stadium-card border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                          selectedFormation === formKey
                            ? 'border-emerald-400 bg-emerald-950/60 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400'
                            : 'border-white/10 hover:border-emerald-500/40 hover:bg-white/5'
                        }`}
                      >
                        <MiniPitchFormation formation={formKey} active={selectedFormation === formKey} />
                        <div className="text-center">
                          <div className="font-title font-black text-lg text-white">
                            {formKey}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 uppercase">
                            {selectedFormation === formKey ? 'Active Shape' : 'Deploy'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedLighting>
            </div>
          </div>
        )}

        {/* Player Profile Dossier Modal */}
        {inspectingPlayer && (
          <PlayerCardModal
            player={inspectingPlayer}
            onClose={() => setInspectingPlayer(null)}
          />
        )}
      </div>
    </AnimatedLighting>
  );
};
