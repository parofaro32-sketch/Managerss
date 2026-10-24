import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Coins, 
  Landmark, 
  CheckCircle2, 
  Lock, 
  Users, 
  Loader2, 
  AlertCircle,
  Shield,
  LogOut,
  Building2,
  Sparkles
} from 'lucide-react';
import { ClubItem, ServerItem, User } from '../types.ts';
import { AnimatedStadiumBackground } from './AnimatedStadiumBackground.tsx';
import { AnimatedLighting } from './AnimatedLighting.tsx';
import { ClubLogo } from './ClubLogo.tsx';

interface ClubSelectionProps {
  server: ServerItem;
  clubs: ClubItem[];
  user: User;
  onBackToServers: () => void;
  onClaimClub: (club: ClubItem) => Promise<void>;
  onLogout: () => void;
  onOpenDownloadModal?: () => void;
  activeClubId?: string | null;
}

export const ClubSelection: React.FC<ClubSelectionProps> = ({
  server,
  clubs,
  user,
  onBackToServers,
  onClaimClub,
  onLogout,
  activeClubId,
}) => {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'available' | 'claimed'>('all');
  const [claimingClubId, setClaimingClubId] = useState<string | null>(null);
  const [confirmModalClub, setConfirmModalClub] = useState<ClubItem | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      club.city.toLowerCase().includes(search.toLowerCase()) ||
      club.stadiumName.toLowerCase().includes(search.toLowerCase()) ||
      club.shortCode.toLowerCase().includes(search.toLowerCase());

    const isClaimed = Boolean(club.managerId);
    if (filterMode === 'available') return matchesSearch && !isClaimed;
    if (filterMode === 'claimed') return matchesSearch && isClaimed;
    return matchesSearch;
  });

  const handleClaimInitiate = (club: ClubItem) => {
    setClaimError(null);
    setConfirmModalClub(club);
  };

  const handleConfirmClaim = async () => {
    if (!confirmModalClub) return;
    const club = confirmModalClub;
    setClaimingClubId(club.id);
    setClaimError(null);

    try {
      await onClaimClub(club);
      setConfirmModalClub(null);
    } catch (err: any) {
      setClaimError(err.message || 'Failed to claim club.');
    } finally {
      setClaimingClubId(null);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="relative min-h-screen bg-[#040806] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* REQUIRED: One consistent animated background across all screens */}
      <AnimatedStadiumBackground opacityBoost={true} />

      {/* Top Header Bar */}
      <header className="relative z-30 stadium-panel sticky top-0 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToServers}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Return to 30 Servers"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <AnimatedLighting color="emerald" borderWidth={1.8} rounded="xl">
                <div className="w-10 h-10 rounded-xl bg-black border border-white/15 flex items-center justify-center font-title font-black text-emerald-400">
                  {server.code}
                </div>
              </AnimatedLighting>
              <div>
                <h1 className="font-title text-2xl font-black uppercase text-white leading-none text-animated-silver">
                  {server.name}
                </h1>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  {server.region} · 30 Registered Football Clubs
                </div>
              </div>
            </div>
          </div>

          {/* Action Controls - ZIP download removed */}
          <div className="flex items-center gap-3 shrink-0">
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

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Banner Section with Animated Lighting */}
        <AnimatedLighting color="emerald" borderWidth={2.5} rounded="3xl" speed={4} glowIntensity="high">
          <div className="stadium-panel-glow rounded-[1.6rem] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/30">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Club Ownership Registry</span>
              </div>
              <h2 className="font-title text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white leading-none text-animated-gold">
                Claim Your Football Club
              </h2>
              <p className="text-slate-300 text-sm max-w-xl">
                Each club receives an instant, verified <strong className="text-amber-300">€100,000,000</strong> transfer budget and a full 22-player roster ready for matchday competition.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <AnimatedLighting color="amber" borderWidth={1.5} rounded="2xl">
                <div className="bg-black/80 rounded-2xl p-4 text-center min-w-[110px]">
                  <div className="font-title text-3xl font-black text-amber-300 leading-none">
                    €100M
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase mt-1">
                    Starting Warchest
                  </div>
                </div>
              </AnimatedLighting>
              <AnimatedLighting color="emerald" borderWidth={1.5} rounded="2xl">
                <div className="bg-black/80 rounded-2xl p-4 text-center min-w-[110px]">
                  <div className="font-title text-3xl font-black text-emerald-400 leading-none">
                    22
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase mt-1">
                    Players / Roster
                  </div>
                </div>
              </AnimatedLighting>
            </div>
          </div>
        </AnimatedLighting>

        {/* Filter & Search Bar with Animated Lighting on Active Filter */}
        <div className="stadium-panel rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {(['all', 'available', 'claimed'] as const).map((mode) => {
              const isActive = filterMode === mode;
              const label = mode === 'all' ? 'All 30 Clubs' : mode === 'available' ? 'Vacant Seats' : 'Claimed';
              if (isActive) {
                return (
                  <AnimatedLighting key={mode} color="emerald" borderWidth={1.8} rounded="xl" speed={2.5}>
                    <button
                      type="button"
                      onClick={() => setFilterMode(mode)}
                      className="px-3.5 py-1.5 text-xs font-title font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-md"
                    >
                      {label}
                    </button>
                  </AnimatedLighting>
                );
              }
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilterMode(mode)}
                  className="px-3.5 py-1.5 text-xs font-title font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer bg-black/50 text-slate-400 hover:text-white border border-white/10"
                >
                  {label}
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
              placeholder="Search club or city..."
              className="stadium-input w-full pl-9 text-xs"
            />
          </div>
        </div>

        {/* Clubs Grid: EVERY CLUB CARD HAS ANIMATED PERIMETER LIGHTING & PERSISTENT GENERATED LOGO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClubs.map((club, idx) => {
            const isClaimed = Boolean(club.managerId);
            const isUserClub = activeClubId === club.id;
            const cardColor = isUserClub ? 'emerald' : isClaimed ? 'violet' : idx % 2 === 0 ? 'cyan' : 'lime';

            return (
              <AnimatedLighting
                key={club.id}
                color={cardColor as any}
                borderWidth={isUserClub ? 2.5 : 1.5}
                rounded="2xl"
                speed={isUserClub ? 2.6 : 4}
                glowIntensity={isUserClub ? 'high' : 'subtle'}
                className="transition-transform hover:-translate-y-1"
              >
                <div
                  className={`group stadium-card rounded-[1.2rem] p-5 flex flex-col justify-between h-full transition-colors ${
                    isUserClub
                      ? 'bg-[#091f14]'
                      : isClaimed
                      ? 'bg-[#090812] opacity-85'
                      : 'bg-[#070e0a] hover:bg-[#0c1811]'
                  }`}
                >
                  <div>
                    {/* Top Header: Persistent Club Logo & Team Name */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <AnimatedLighting color="amber" borderWidth={1.5} rounded="xl" speed={3}>
                          <div className="w-12 h-12 rounded-xl bg-black/85 flex items-center justify-center p-1 shadow-md">
                            <ClubLogo club={club} size={44} />
                          </div>
                        </AnimatedLighting>
                        <div>
                          <h3 className="font-title text-2xl font-black uppercase text-white leading-tight text-animated-silver">
                            {club.name}
                          </h3>
                          <div className="text-xs font-mono text-slate-400">
                            {club.city} · Est. {club.foundedYear}
                          </div>
                        </div>
                      </div>

                      <AnimatedLighting color="amber" borderWidth={1} rounded="md">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black text-amber-300 font-bold">
                          €100M
                        </span>
                      </AnimatedLighting>
                    </div>

                    {/* Stadium & Manager Info */}
                    <div className="space-y-1.5 py-3 border-y border-white/10 text-xs font-mono text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          Stadium:
                        </span>
                        <span className="font-semibold text-white text-right leading-tight break-words">
                          {club.stadiumName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          Capacity:
                        </span>
                        <span className="tabular-nums">{club.stadiumCapacity.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Manager:</span>
                        {isClaimed ? (
                          <span className="text-amber-400 font-bold">@{club.managerUsername}</span>
                        ) : (
                          <span className="text-emerald-400 font-bold uppercase">Vacant Hot Seat</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Button with Animated Lighting */}
                  <div className="mt-4 pt-1">
                    {isUserClub ? (
                      <div className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-title font-black text-center text-sm uppercase">
                        Your Active Club
                      </div>
                    ) : isClaimed ? (
                      <div className="w-full py-2 rounded-xl bg-black/60 border border-white/5 text-slate-500 font-title font-bold text-center text-sm uppercase flex items-center justify-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Contract Signed</span>
                      </div>
                    ) : (
                      <AnimatedLighting color="emerald" borderWidth={1.8} rounded="xl" speed={2.8}>
                        <button
                          type="button"
                          onClick={() => handleClaimInitiate(club)}
                          className="btn-broadcast-primary w-full py-2.5 text-sm cursor-pointer"
                        >
                          <span>Take Manager Hot Seat</span>
                        </button>
                      </AnimatedLighting>
                    )}
                  </div>
                </div>
              </AnimatedLighting>
            );
          })}
        </div>
      </main>

      {/* Claim Confirmation Modal with Persistent Club Logo and Animated Lighting */}
      {confirmModalClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
          <div className="relative w-full max-w-md my-auto">
            <AnimatedLighting color="emerald" borderWidth={2.5} rounded="3xl" speed={3}>
              <div className="stadium-panel-glow p-6 rounded-[1.5rem] border border-emerald-500/40 text-slate-100 shadow-2xl space-y-5">
                <div className="flex items-center gap-3.5 pb-3 border-b border-white/10">
                  <AnimatedLighting color="amber" borderWidth={1.5} rounded="xl">
                    <div className="w-14 h-14 rounded-xl bg-black/90 flex items-center justify-center p-1 shadow-md">
                      <ClubLogo club={confirmModalClub} size={50} />
                    </div>
                  </AnimatedLighting>
                  <div>
                    <h3 className="font-title text-2xl font-black uppercase text-white">
                      Contract Agreement
                    </h3>
                    <div className="text-xs font-mono text-slate-400">
                      {confirmModalClub.name} · {server.code}
                    </div>
                  </div>
                </div>

                {claimError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{claimError}</span>
                  </div>
                )}

                <div className="space-y-3 bg-black/60 p-4 rounded-xl border border-white/10 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Appointed Manager:</span>
                    <span className="text-white font-bold">@{user.username}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Starting Warchest:</span>
                    <span className="text-amber-400 font-bold">€100,000,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Home Ground:</span>
                    <span className="text-white font-bold">{confirmModalClub.stadiumName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Roster Assignment:</span>
                    <span className="text-emerald-400 font-bold">22 Active Contracts</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmModalClub(null)}
                    className="btn-broadcast-secondary flex-1 py-2.5 text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <AnimatedLighting color="emerald" borderWidth={1.8} rounded="xl" className="flex-1">
                    <button
                      type="button"
                      disabled={Boolean(claimingClubId)}
                      onClick={handleConfirmClaim}
                      className="btn-broadcast-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {claimingClubId ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
                          <span>Signing...</span>
                        </>
                      ) : (
                        <span>Sign Contract</span>
                      )}
                    </button>
                  </AnimatedLighting>
                </div>
              </div>
            </AnimatedLighting>
          </div>
        </div>
      )}
    </div>
  );
};
