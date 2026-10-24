import React, { useState } from 'react';
import { Player, PositionCategory, PlayerRank } from '../types.ts';
import { ArrowUpDown, Users, Zap, Eye, Trophy, Activity, Filter } from 'lucide-react';
import { PlayerCardModal } from './PlayerCardModal.tsx';
import { PlayerCard } from './PlayerCard.tsx';

interface SquadTabProps {
  squad: Player[];
  startingPlayerIds: Set<string>;
  onToggleStarter?: (player: Player) => void;
}

export const SquadTab: React.FC<SquadTabProps> = ({
  squad,
  startingPlayerIds,
  onToggleStarter,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'All' | PositionCategory>('All');
  const [sortBy, setSortBy] = useState<'number' | 'name' | 'rank' | 'stamina'>('number');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const categories: Array<'All' | PositionCategory> = ['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];

  const filteredSquad = squad.filter((player) => {
    if (categoryFilter === 'All') return true;
    return player.positionCategory === categoryFilter;
  });

  const rankWeights: Record<PlayerRank, number> = {
    'Top Tier': 5,
    'Worldclass': 4,
    'Strong': 3,
    'Average': 2,
    'Weak': 1,
  };

  const sortedSquad = [...filteredSquad].sort((a, b) => {
    if (sortBy === 'number') return a.number - b.number;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'rank') return rankWeights[b.rank] - rankWeights[a.rank];
    if (sortBy === 'stamina') return b.stamina - a.stamina;
    return 0;
  });

  const avgStamina = Math.round(squad.reduce((sum, p) => sum + p.stamina, 0) / (squad.length || 1));
  const avgAge = (squad.reduce((sum, p) => sum + p.age, 0) / (squad.length || 1)).toFixed(1);
  const avgOvr = Math.round(
    squad.reduce((sum, p) => sum + (p.pace + p.shooting + p.passing + p.dribbling + p.defending + p.physical) / 6, 0) /
      (squad.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Squad Overview Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stadium-panel rounded-2xl p-4 border border-white/10">
          <div className="text-xs font-mono uppercase text-slate-400">Total Roster</div>
          <div className="text-3xl font-display font-black text-white mt-1 tabular-nums">
            {squad.length} / 22
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-0.5">Full 22-man Registration</div>
        </div>

        <div className="stadium-panel rounded-2xl p-4 border border-white/10">
          <div className="text-xs font-mono uppercase text-slate-400">Starting XI</div>
          <div className="text-3xl font-display font-black text-emerald-400 mt-1 tabular-nums">
            11 <span className="text-base text-slate-400 font-normal">Active</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">11 Substitutes Ready</div>
        </div>

        <div className="stadium-panel rounded-2xl p-4 border border-white/10">
          <div className="text-xs font-mono uppercase text-slate-400">Roster Stamina</div>
          <div className={`text-3xl font-display font-black mt-1 tabular-nums ${avgStamina < 50 ? 'text-rose-400' : 'text-amber-400'}`}>
            {avgStamina}%
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">Avg Matchday Conditioning</div>
        </div>

        <div className="stadium-panel rounded-2xl p-4 border border-white/10">
          <div className="text-xs font-mono uppercase text-slate-400">Team Overall Rating</div>
          <div className="text-3xl font-display font-black text-amber-300 mt-1 tabular-nums">
            {avgOvr} <span className="text-base font-normal text-emerald-400">OVR</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">Avg Age: {avgAge} Yrs</div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="stadium-panel rounded-2xl p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        {/* Category Tabs with Animated Purple Laser on Active */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => {
            const isActive = categoryFilter === cat;
            if (isActive) {
              return (
                <div key={cat} className="laser-tab-pill laser-tab-pill-purple shrink-0">
                  <div className="laser-tab-beam" />
                  <button
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className="relative z-10 px-3.5 py-1.5 rounded-[0.75rem] text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-md"
                  >
                    {cat}
                  </button>
                </div>
              );
            }
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all cursor-pointer bg-black/50 text-slate-400 hover:text-white border border-white/10 shrink-0"
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
          <span>Sort by:</span>
          {(['number', 'rank', 'stamina', 'name'] as const).map((s) => {
            const isActive = sortBy === s;
            if (isActive) {
              return (
                <div key={s} className="laser-tab-pill laser-tab-pill-azure shrink-0">
                  <div className="laser-tab-beam" />
                  <button
                    type="button"
                    onClick={() => setSortBy(s)}
                    className="relative z-10 px-2.5 py-1 rounded-[0.6rem] transition-colors uppercase font-mono font-black text-[11px] bg-gradient-to-r from-blue-500 to-cyan-400 text-black shadow-sm"
                  >
                    {s}
                  </button>
                </div>
              );
            }
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSortBy(s)}
                className="px-2.5 py-1 rounded-md transition-colors uppercase font-bold text-[11px] text-slate-400 hover:text-white"
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedSquad.map((player) => {
          const isStarter = startingPlayerIds.has(player.id);
          return (
            <PlayerCard
              key={player.id}
              player={player}
              isStarting={isStarter}
              assignedPosition={isStarter ? 'Starter' : 'Reserve'}
              onInspect={() => setSelectedPlayer(player)}
            />
          );
        })}
      </div>

      {/* Player Card Modal */}
      {selectedPlayer && (
        <PlayerCardModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          isStarter={startingPlayerIds.has(selectedPlayer.id)}
          onToggleStarter={onToggleStarter}
        />
      )}
    </div>
  );
};
