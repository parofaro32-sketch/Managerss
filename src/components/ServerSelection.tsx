import React, { useState } from 'react';
import { 
  Wifi, 
  Search, 
  ChevronRight, 
  Shield, 
  LogOut, 
  Users, 
  Radio, 
  Activity,
  Globe
} from 'lucide-react';
import { ServerItem, User } from '../types.ts';
import { AnimatedStadiumBackground } from './AnimatedStadiumBackground.tsx';
import { AnimatedLighting, getRandomLightingColor } from './AnimatedLighting.tsx';
import { ManagerNolLogo } from './ManagerNolLogo.tsx';

interface ServerSelectionProps {
  servers: ServerItem[];
  user: User;
  onSelectServer: (server: ServerItem) => void;
  onLogout: () => void;
  onOpenDownloadModal?: () => void;
  activeServerId?: string | null;
  onViewLanding?: () => void;
}

export const ServerSelection: React.FC<ServerSelectionProps> = ({
  servers,
  user,
  onSelectServer,
  onLogout,
  activeServerId,
  onViewLanding,
}) => {
  const [search, setSearch] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('All');

  // Filter servers
  const filteredServers = servers.filter((srv) => {
    const matchesSearch =
      srv.code.toLowerCase().includes(search.toLowerCase()) ||
      srv.name.toLowerCase().includes(search.toLowerCase()) ||
      srv.region.toLowerCase().includes(search.toLowerCase());

    const matchesContinent =
      selectedContinent === 'All' || srv.continent === selectedContinent;

    return matchesSearch && matchesContinent;
  });

  const continents = ['All', 'Europe', 'Americas', 'Asia-Pacific', 'International'];

  const getPingColor = (ping: number) => {
    if (ping < 35) return 'text-emerald-400';
    if (ping < 75) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="relative min-h-screen bg-[#040806] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* REQUIRED: One consistent animated background across all screens */}
      <AnimatedStadiumBackground opacityBoost={true} />

      {/* Top Header Bar */}
      <header className="relative z-30 stadium-panel sticky top-0 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3.5 shrink-0">
            <ManagerNolLogo size={44} rounded="xl" withLighting lightingColor="amber" />
            <div>
              <div className="font-title text-2xl sm:text-3xl font-black uppercase tracking-wider text-animated-gold leading-none">
                MANAGER NOL
              </div>
              <div className="text-[11px] font-mono text-emerald-300 uppercase tracking-widest mt-0.5">
                30 Dedicated Match Servers
              </div>
            </div>
          </div>

          {/* Manager Identity Strip */}
          <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-300 border-x border-white/10 px-6">
            <span className="text-slate-400">Accredited Manager:</span>
            <span className="text-white font-bold">@{user.username}</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-bold">Select Club Destination</span>
          </div>

          {/* Action Controls - ZIP download removed */}
          <div className="flex items-center gap-3 shrink-0">
            {onViewLanding && (
              <button
                onClick={onViewLanding}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-xs font-mono text-emerald-300 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                title="View the public opening page without logging out"
              >
                <span>Opening Page</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-rose-950/60 border border-white/10 hover:border-rose-500/40 text-xs font-mono text-slate-300 hover:text-rose-300 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Banner Section with Animated Lighting */}
        <AnimatedLighting color="emerald" borderWidth={2.5} rounded="3xl" speed={4} glowIntensity="high">
          <div className="stadium-panel-glow rounded-[1.6rem] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/30">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>30 Match Servers Cluster</span>
              </div>
              <h1 className="font-title text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white leading-none text-animated-silver">
                Select Your Match Server
              </h1>
              <p className="text-slate-300 text-sm max-w-xl">
                Each server hosts exactly 30 unique competitive clubs with a strict €100,000,000 warchest. Choose a low-latency gateway to claim your seat.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <AnimatedLighting color="emerald" borderWidth={1.5} rounded="2xl">
                <div className="bg-black/80 rounded-2xl p-4 text-center min-w-[100px]">
                  <div className="font-title text-4xl font-black text-emerald-400 tabular-nums leading-none">
                    {servers.length}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase mt-1">
                    Active Worlds
                  </div>
                </div>
              </AnimatedLighting>
              <AnimatedLighting color="amber" borderWidth={1.5} rounded="2xl">
                <div className="bg-black/80 rounded-2xl p-4 text-center min-w-[100px]">
                  <div className="font-title text-4xl font-black text-amber-300 tabular-nums leading-none">
                    900
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase mt-1">
                    Total Clubs
                  </div>
                </div>
              </AnimatedLighting>
            </div>
          </div>
        </AnimatedLighting>

        {/* Filter & Search Bar with Animated Lighting on Active Tab */}
        <div className="stadium-panel rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {continents.map((continent) => {
              const isActive = selectedContinent === continent;
              if (isActive) {
                return (
                  <AnimatedLighting key={continent} color="emerald" borderWidth={1.8} rounded="xl" speed={2.5}>
                    <button
                      type="button"
                      onClick={() => setSelectedContinent(continent)}
                      className="px-3.5 py-1.5 text-xs font-title font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-md whitespace-nowrap"
                    >
                      {continent}
                    </button>
                  </AnimatedLighting>
                );
              }
              return (
                <button
                  key={continent}
                  type="button"
                  onClick={() => setSelectedContinent(continent)}
                  className="px-3 py-1.5 text-xs font-title font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap bg-black/50 text-slate-400 hover:text-white border border-white/10"
                >
                  {continent}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search server code or region..."
              className="stadium-input w-full pl-9 text-xs"
            />
          </div>
        </div>

        {/* Servers Grid: EVERY SERVER CARD HAS ANIMATED PERIMETER LIGHTING */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServers.map((server, idx) => {
            const isConnected = activeServerId === server.id;
            const claimedPct = Math.round(((server.claimedClubs || 0) / 30) * 100);
            const cardColor = isConnected ? 'emerald' : idx % 3 === 0 ? 'cyan' : idx % 3 === 1 ? 'azure' : 'violet';

            return (
              <AnimatedLighting
                key={server.id}
                color={cardColor as any}
                borderWidth={isConnected ? 2.5 : 1.5}
                rounded="2xl"
                speed={isConnected ? 2.8 : 4.2}
                glowIntensity={isConnected ? 'high' : 'subtle'}
                className="cursor-pointer transition-transform hover:-translate-y-1"
                onClick={() => onSelectServer(server)}
              >
                <div
                  className={`group stadium-card rounded-[1.2rem] p-5 flex flex-col justify-between h-full transition-colors ${
                    isConnected
                      ? 'bg-[#091f14]'
                      : 'bg-[#070e0a] hover:bg-[#0c1811]'
                  }`}
                >
                  <div>
                    {/* Header with Server Name in Animated Typography */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-black/85 border border-white/15 flex items-center justify-center font-title font-black text-lg text-emerald-400 group-hover:text-emerald-300">
                          {server.code}
                        </div>
                        <div>
                          <h3 className="font-title text-xl font-black uppercase text-white tracking-wide text-animated-silver group-hover:text-emerald-300 transition-colors">
                            {server.name}
                          </h3>
                          <div className="text-xs font-mono text-slate-400">
                            {server.region} · {server.continent}
                          </div>
                        </div>
                      </div>

                      {/* Ping Metric */}
                      <div className="flex items-center gap-1.5 text-xs font-mono bg-black/70 px-2 py-1 rounded-md border border-white/10 shrink-0">
                        <Wifi className={`w-3.5 h-3.5 ${getPingColor(server.basePing)}`} />
                        <span className={`font-bold tabular-nums ${getPingColor(server.basePing)}`}>
                          {server.basePing}ms
                        </span>
                      </div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="space-y-1.5 pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Claimed Hot Seats</span>
                        <span className="text-white font-bold tabular-nums">
                          {server.claimedClubs || 0} / {server.totalClubs || 30}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-black/70 rounded-full overflow-hidden border border-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"
                          style={{ width: `${Math.max(8, claimedPct)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold uppercase">
                      {isConnected ? 'Active Server' : '30 Unique Clubs Available'}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 group-hover:text-white transition-colors">
                      <span>Connect</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </AnimatedLighting>
            );
          })}
        </div>
      </main>
    </div>
  );
};
