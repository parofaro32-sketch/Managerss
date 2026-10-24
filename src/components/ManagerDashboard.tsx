import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Shield, 
  Coins, 
  Server, 
  LogOut, 
  Building2, 
  Users, 
  Activity, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  Award,
  Sparkles,
  Zap,
  TrendingUp,
  Landmark,
  UserPlus,
  HeartPulse,
  SlidersHorizontal,
  Flame,
  Newspaper,
  Mail,
  Bell,
  ChevronRight
} from 'lucide-react';
import { ClubItem, ServerItem, User, LineupConfig } from '../types.ts';
import { api } from '../api.ts';
import { TacticalPitchCanvas } from './TacticalPitchCanvas.tsx';
import { LineupTab } from './LineupTab.tsx';
import { SquadTab } from './SquadTab.tsx';
import { MatchDayStaminaTab } from './MatchDayStaminaTab.tsx';
import { TacticalConditioningTab } from './TacticalConditioningTab.tsx';
import { TransferMarketTab } from './TransferMarketTab.tsx';
import { ServerNewsTab } from './ServerNewsTab.tsx';
import { InboxTab } from './InboxTab.tsx';
import { AnimatedStadiumBackground } from './AnimatedStadiumBackground.tsx';
import { AnimatedLighting, getRandomLightingColor, LightingColorName } from './AnimatedLighting.tsx';
import { ClubLogo } from './ClubLogo.tsx';
import { ManagerNolLogo } from './ManagerNolLogo.tsx';

interface ManagerDashboardProps {
  user: User;
  club: ClubItem;
  server: ServerItem;
  onLogout: () => void;
  onChangeServer: () => void;
  onOpenDownloadModal?: () => void;
  onViewLanding?: () => void;
  onResignSuccess?: () => void;
  onClubUpdated?: (club: ClubItem) => void;
  initialTab?: 'tactics' | 'squad' | 'stamina' | 'conditioning' | 'transfers' | 'news' | 'inbox' | 'overview' | 'finances' | 'server';
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  user,
  club: initialClub,
  server,
  onLogout,
  onChangeServer,
  onViewLanding,
  onResignSuccess,
  onClubUpdated,
  initialTab = 'tactics',
}) => {
  const [club, setClub] = useState<ClubItem>(initialClub);
  const tabContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setClub(initialClub);
  }, [initialClub]);

  const handleUpdateClubState = (updatedClub: ClubItem) => {
    setClub(updatedClub);
    if (onClubUpdated) {
      onClubUpdated(updatedClub);
    }
  };

  const [activeTab, setActiveTab] = useState<
    'tactics' | 'squad' | 'stamina' | 'conditioning' | 'transfers' | 'news' | 'inbox' | 'overview' | 'finances' | 'server'
  >(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Random color generated each time a tab is selected
  const [tabColors, setTabColors] = useState<Record<string, LightingColorName>>({
    tactics: 'solar',
    squad: 'violet',
    stamina: 'emerald',
    conditioning: 'amber',
    transfers: 'lime',
    news: 'azure',
    inbox: 'amber',
    overview: 'orange',
    finances: 'rose',
    server: 'cyan',
  });

  const handleSelectTab = (tabId: typeof activeTab, shouldScroll: boolean = true) => {
    setActiveTab(tabId);
    setTabColors((prev) => ({
      ...prev,
      [tabId]: getRandomLightingColor() as LightingColorName,
    }));
    if (shouldScroll && tabContentRef.current) {
      setTimeout(() => {
        tabContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  // Inbox & unread counts
  const [unreadInboxCount, setUnreadInboxCount] = useState<number>(0);
  const [targetedContractId, setTargetedContractId] = useState<string | null>(null);
  const [targetedOfferId, setTargetedOfferId] = useState<string | null>(null);

  const fetchInboxUnread = async () => {
    try {
      const res = await api.getInbox();
      if (res) {
        setUnreadInboxCount(res.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchInboxUnread();
    const interval = setInterval(fetchInboxUnread, 15000);
    return () => clearInterval(interval);
  }, [server.id]);

  const [copiedLink, setCopiedLink] = useState(false);
  const [resignModalOpen, setResignModalOpen] = useState(false);
  const [resigning, setResigning] = useState(false);
  const [resignError, setResignError] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleShareManagerCard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Manager @${user.username} is leading ${club.name} on server ${server.code} with a warchest of €100,000,000 in Manager Nol!`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleUpdateLineup = async (lineup: LineupConfig) => {
    const res = await api.updateLineup(lineup);
    if (res && res.club) {
      handleUpdateClubState(res.club);
    }
  };

  const handleConfirmResign = async () => {
    setResigning(true);
    setResignError(null);
    try {
      await api.resignClub();
      setResignModalOpen(false);
      if (onResignSuccess) {
        onResignSuccess();
      } else {
        onChangeServer();
      }
    } catch (err: any) {
      setResignError(err.message || 'Error executing contract resignation.');
      setResigning(false);
    }
  };

  const startingPlayerIds = useMemo(
    () => new Set<string>(club.lineup?.startingPlayers ? club.lineup.startingPlayers.map((p) => p.playerId) : []),
    [club.lineup]
  );

  const squadList = club.squad || [];
  const readyPlayers = squadList.filter((p) => p.stamina >= 70).length;
  const tiredPlayers = squadList.filter((p) => p.stamina < 50).length;

  return (
    <div className="relative min-h-screen bg-[#030705] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Dynamic Stadium Night Atmosphere Background (Consistent across whole app) */}
      <AnimatedStadiumBackground opacityBoost={true} />

      {/* Top Header Bar */}
      <header className="relative z-30 stadium-panel sticky top-0 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 shrink-0">
            {/* Manager Nol Official Shield Logo */}
            <ManagerNolLogo size={44} rounded="xl" withLighting lightingColor="amber" />

            {/* Club Crest Logo */}
            <AnimatedLighting color="emerald" borderWidth={1.8} rounded="xl" speed={2.8}>
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-black shrink-0 flex items-center justify-center p-1" title={`${club.name} Official Crest`}>
                <ClubLogo club={club} size={36} />
              </div>
            </AnimatedLighting>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-title text-2xl sm:text-3xl font-black uppercase tracking-wider text-animated-gold leading-none">
                  MANAGER NOL
                </span>
                <AnimatedLighting color="emerald" borderWidth={1.2} rounded="md">
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    {server.code}
                  </span>
                </AnimatedLighting>
              </div>
              <div className="text-[11px] font-mono text-emerald-300 uppercase tracking-widest mt-0.5">
                Tactical Dugout & Club Headquarters
              </div>
            </div>
          </div>

          {/* Manager Identity Context */}
          <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-slate-300 border-x border-white/10 px-6">
            <span className="text-slate-400">Club:</span>
            <span className="text-white font-title font-bold text-sm tracking-wide text-animated-silver">{club.name}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Manager:</span>
            <span className="text-emerald-400 font-bold">@{user.username}</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-bold">{readyPlayers} Match Ready</span>
            {tiredPlayers > 0 && (
              <span className="text-rose-400 font-bold">({tiredPlayers} Fatigued)</span>
            )}
          </div>

          {/* Action Controls - Prominent Operational Hub Shortcuts */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* 1. Quick Transfer Market Shortcut Button */}
            <button
              type="button"
              onClick={() => handleSelectTab('transfers')}
              className={`relative px-3 sm:px-3.5 py-2 rounded-xl border text-xs font-title uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 ${
                activeTab === 'transfers'
                  ? 'bg-lime-400 text-black border-lime-300 shadow-md shadow-lime-400/20 font-black'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white font-bold'
              }`}
              title="Open Transfer Market"
            >
              <Coins className={`w-4 h-4 ${activeTab === 'transfers' ? 'text-black' : 'text-lime-400'}`} />
              <span className="hidden sm:inline">Transfers</span>
            </button>

            {/* 2. Quick Server News Shortcut Button */}
            <button
              type="button"
              onClick={() => handleSelectTab('news')}
              className={`relative px-3 sm:px-3.5 py-2 rounded-xl border text-xs font-title uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 ${
                activeTab === 'news'
                  ? 'bg-cyan-400 text-black border-cyan-300 shadow-md shadow-cyan-400/20 font-black'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white font-bold'
              }`}
              title="Open Server News Feed"
            >
              <Newspaper className={`w-4 h-4 ${activeTab === 'news' ? 'text-black' : 'text-cyan-400'}`} />
              <span className="hidden sm:inline">News</span>
            </button>

            {/* 3. Quick Mailbox Shortcut Button */}
            <button
              type="button"
              onClick={() => handleSelectTab('inbox')}
              className={`relative px-3 sm:px-3.5 py-2 rounded-xl border text-xs font-title uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 ${
                activeTab === 'inbox'
                  ? 'bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-400/20 font-black'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white font-bold'
              }`}
              title="Open Manager Mailbox"
            >
              <Mail className={`w-4 h-4 ${activeTab === 'inbox' ? 'text-black' : 'text-amber-400'}`} />
              <span className="hidden sm:inline">Mailbox</span>
              {unreadInboxCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-mono text-[10px] flex items-center justify-center font-black animate-pulse shadow">
                  {unreadInboxCount}
                </span>
              )}
            </button>

            {onViewLanding && (
              <button
                onClick={onViewLanding}
                className="hidden sm:inline-flex px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-xs font-mono text-emerald-300 font-bold transition-all cursor-pointer items-center gap-1.5"
                title="View the public opening page without logging out"
              >
                <span>Opening Page</span>
              </button>
            )}

            <button
              onClick={onChangeServer}
              className="hidden sm:inline-flex px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer items-center gap-1.5"
            >
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>Servers</span>
            </button>

            <button
              onClick={() => setResignModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-xs font-mono text-rose-300 transition-colors cursor-pointer font-bold"
            >
              Resign
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 sm:pb-12 flex-1 w-full space-y-6">
        
        {/* Executive Club Banner with Persistent Club Crest Logo & Animated Transfer Budget */}
        <AnimatedLighting
          color="emerald"
          borderWidth={2.5}
          rounded="3xl"
          speed={4}
          glowIntensity="standard"
          className="w-full shadow-2xl"
        >
          <div className="stadium-panel-glow p-6 sm:p-7">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              
              {/* Persistent Club Crest Logo & Animated Title */}
              <div className="flex items-center gap-5">
                <AnimatedLighting color="amber" borderWidth={2} rounded="2xl" speed={3}>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black/85 flex items-center justify-center p-1.5 shadow-2xl">
                    <ClubLogo club={club} size={84} />
                  </div>
                </AnimatedLighting>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider">
                    <span className="font-bold">Appointed Head Coach</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-white font-bold">Season 2026</span>
                  </div>

                  {/* Team Name with Animated Typography */}
                  <h1 className="font-title text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-wide text-animated-silver leading-tight break-words">
                    {club.name}
                  </h1>

                  <div className="text-slate-300 text-xs sm:text-sm font-mono flex items-center gap-3 flex-wrap mt-1">
                    <span>Manager: <strong className="text-white">@{user.username}</strong></span>
                    <span className="text-slate-600">·</span>
                    <span>Server: <strong className="text-emerald-400 font-bold">{server.name} ({server.code})</strong></span>
                    <span className="text-slate-600">·</span>
                    <span>Est. {club.foundedYear}</span>
                  </div>
                </div>
              </div>

              {/* Transfer Budget with Animated Lighting */}
              <div className="flex flex-wrap items-center gap-4">
                <AnimatedLighting
                  color="emerald"
                  borderWidth={2.5}
                  rounded="2xl"
                  speed={2.8}
                  glowIntensity="high"
                >
                  <div className="px-6 py-4 rounded-[1.125rem] bg-gradient-to-b from-[#091f15] via-[#05140d] to-[#030d08] min-w-[270px]">
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <div className="text-[10px] font-mono uppercase text-emerald-400 font-extrabold tracking-widest flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <span>TRANSFER BUDGET</span>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase">
                        WARCHEST
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-400">€</span>
                      <span className="text-4xl sm:text-5xl font-black tracking-tight text-animated-emerald drop-shadow-[0_0_24px_rgba(16,185,129,0.7)] tabular-nums font-mono animate-pulse">
                        {new Intl.NumberFormat('en-IE', { maximumFractionDigits: 0 }).format(club.transferBudget).replace('€', '').trim()}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        TREASURY MUTEX LOCKED
                      </span>
                      <span className="text-emerald-300 font-bold">€100M GRANT</span>
                    </div>
                  </div>
                </AnimatedLighting>

                <button
                  type="button"
                  onClick={handleShareManagerCard}
                  className="btn-broadcast-secondary text-sm py-3 px-4"
                >
                  {copiedLink ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">License Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-slate-300" />
                      <span>Share License</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </AnimatedLighting>

        {/* PROMINENT PRIME OPERATIONS COMMAND HUB (Transfer Market, Mailbox, Server News) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          
          {/* 1. TRANSFER MARKET CARD */}
          <AnimatedLighting
            color={activeTab === 'transfers' ? 'lime' : 'emerald'}
            borderWidth={activeTab === 'transfers' ? 2.8 : 1.5}
            rounded="2xl"
            speed={3}
            glowIntensity={activeTab === 'transfers' ? 'high' : 'subtle'}
            className="transition-transform hover:-translate-y-0.5"
          >
            <button
              type="button"
              onClick={() => handleSelectTab('transfers')}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                activeTab === 'transfers'
                  ? 'bg-gradient-to-br from-[#0c2411] via-[#07170b] to-[#040e06] ring-1 ring-lime-400/40'
                  : 'bg-black/80 hover:bg-black/90'
              }`}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-lime-500/20 border border-lime-500/40 flex items-center justify-center text-lime-400 shrink-0">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-lime-400 font-extrabold tracking-widest block">
                      SERVER {server.code} MARKET
                    </span>
                    <h3 className="font-title text-lg sm:text-xl font-black uppercase text-white leading-tight truncate">
                      Transfer Market
                    </h3>
                  </div>
                </div>
                <p className="text-xs font-mono text-slate-300 leading-snug truncate">
                  Scout listings, submit bids & negotiate personal terms
                </p>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  activeTab === 'transfers'
                    ? 'bg-lime-400 text-black font-black'
                    : 'bg-white/10 text-lime-300'
                }`}>
                  Live Trading
                </span>
                <span className="text-xs font-title uppercase tracking-wider text-lime-400 font-bold flex items-center gap-1">
                  <span>Enter</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          </AnimatedLighting>

          {/* 2. MANAGER MAILBOX CARD */}
          <AnimatedLighting
            color={activeTab === 'inbox' ? 'amber' : 'solar'}
            borderWidth={activeTab === 'inbox' ? 2.8 : 1.5}
            rounded="2xl"
            speed={3}
            glowIntensity={activeTab === 'inbox' || unreadInboxCount > 0 ? 'high' : 'subtle'}
            className="transition-transform hover:-translate-y-0.5"
          >
            <button
              type="button"
              onClick={() => handleSelectTab('inbox')}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                activeTab === 'inbox'
                  ? 'bg-gradient-to-br from-[#241705] via-[#170e03] to-[#0d0701] ring-1 ring-amber-400/40'
                  : 'bg-black/80 hover:bg-black/90'
              }`}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 relative">
                    <Mail className="w-4 h-4" />
                    {unreadInboxCount > 0 && (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute -top-1 -right-1 animate-ping" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-extrabold tracking-widest block">
                      CONFIDENTIAL WIRE
                    </span>
                    <h3 className="font-title text-lg sm:text-xl font-black uppercase text-white leading-tight truncate">
                      Manager Mailbox
                    </h3>
                  </div>
                </div>
                <p className="text-xs font-mono text-slate-300 leading-snug truncate">
                  Incoming bids, counter-offers & contract approvals
                </p>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  unreadInboxCount > 0
                    ? 'bg-rose-500 text-white font-black animate-pulse'
                    : activeTab === 'inbox'
                    ? 'bg-amber-400 text-black font-black'
                    : 'bg-white/10 text-amber-300'
                }`}>
                  {unreadInboxCount > 0 ? `${unreadInboxCount} New` : 'Inbox Clean'}
                </span>
                <span className="text-xs font-title uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                  <span>Open</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          </AnimatedLighting>

          {/* 3. SERVER NEWS CARD */}
          <AnimatedLighting
            color={activeTab === 'news' ? 'cyan' : 'azure'}
            borderWidth={activeTab === 'news' ? 2.8 : 1.5}
            rounded="2xl"
            speed={3}
            glowIntensity={activeTab === 'news' ? 'high' : 'subtle'}
            className="transition-transform hover:-translate-y-0.5"
          >
            <button
              type="button"
              onClick={() => handleSelectTab('news')}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                activeTab === 'news'
                  ? 'bg-gradient-to-br from-[#051829] via-[#030e1a] to-[#01070d] ring-1 ring-cyan-400/40'
                  : 'bg-black/80 hover:bg-black/90'
              }`}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-extrabold tracking-widest block">
                      OFFICIAL PRESS
                    </span>
                    <h3 className="font-title text-lg sm:text-xl font-black uppercase text-white leading-tight truncate">
                      Server News Feed
                    </h3>
                  </div>
                </div>
                <p className="text-xs font-mono text-slate-300 leading-snug truncate">
                  Matchday journalism, goalscorers & scheduled fixtures
                </p>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  activeTab === 'news'
                    ? 'bg-cyan-400 text-black font-black'
                    : 'bg-white/10 text-cyan-300'
                }`}>
                  {server.code} Press
                </span>
                <span className="text-xs font-title uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1">
                  <span>Read</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          </AnimatedLighting>
        </div>

        {/* SUB-NAVIGATION TABS: ALL 10 TABS WITH ANIMATED PERIMETER LIGHTING */}
        <div ref={tabContentRef} className="scroll-mt-24 p-2 stadium-panel rounded-2xl border border-white/10 flex items-center gap-2.5 overflow-x-auto">
          {[
            { id: 'tactics', label: 'Tactics & Lineup', icon: Shield, badge: club.lineup?.formation || '4-3-3' },
            { id: 'squad', label: 'Squad Roster', icon: Users, badge: `${club.squad?.length || 22} Players` },
            { id: 'stamina', label: 'Match Day Stamina', icon: HeartPulse, badge: `${readyPlayers} Fit` },
            { id: 'conditioning', label: 'Tactical Conditioning', icon: SlidersHorizontal, badge: 'Calibrated' },
            { id: 'transfers', label: 'Transfer Market', icon: Coins, badge: 'Live Trading' },
            { id: 'news', label: 'Server News', icon: Newspaper, badge: `${server.code} Press` },
            { id: 'inbox', label: 'Manager Mailbox', icon: Mail, badge: unreadInboxCount > 0 ? `${unreadInboxCount} New` : 'Inbox' },
            { id: 'overview', label: 'Club Facilities & Stadium', icon: Building2, badge: club.stadiumName },
            { id: 'finances', label: 'Treasury & Ledger', icon: Landmark, badge: '€100M Capital' },
            { id: 'server', label: 'Server Universe', icon: Server, badge: `${server.code} · 30 Clubs` },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const currentColor = tabColors[tab.id] || 'emerald';

            return (
              <AnimatedLighting
                key={tab.id}
                color={currentColor}
                active={isActive}
                borderWidth={isActive ? 2.5 : 1}
                rounded="xl"
                speed={isActive ? 2.6 : 5}
                glowIntensity={isActive ? 'standard' : 'subtle'}
                className="shrink-0"
              >
                <button
                  type="button"
                  onClick={() => handleSelectTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-[0.65rem] text-xs font-title uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-black/90 text-white font-black shadow-md'
                      : 'bg-black/40 text-slate-400 hover:text-white hover:bg-black/60 font-bold'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isActive 
                      ? 'bg-white/15 text-white' 
                      : tab.id === 'inbox' && unreadInboxCount > 0
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-black/40 text-slate-500'
                  }`}>
                    {tab.badge}
                  </span>
                </button>
              </AnimatedLighting>
            );
          })}
        </div>

        {/* TAB 1: TACTICS & LINEUP */}
        {activeTab === 'tactics' && (
          <LineupTab
            squad={club.squad}
            currentLineup={club.lineup}
            onUpdateLineup={handleUpdateLineup}
          />
        )}

        {/* TAB 2: SQUAD ROSTER */}
        {activeTab === 'squad' && (
          <SquadTab
            squad={club.squad}
            startingPlayerIds={startingPlayerIds}
          />
        )}

        {/* TAB 3: MATCH DAY STAMINA TAB */}
        {activeTab === 'stamina' && (
          <MatchDayStaminaTab squad={club.squad} />
        )}

        {/* TAB 4: TACTICAL CONDITIONING TAB */}
        {activeTab === 'conditioning' && (
          <TacticalConditioningTab
            squad={club.squad}
            activeFormation={club.lineup?.formation || '4-3-3'}
          />
        )}

        {/* TAB 5: DEDICATED PRO TRANSFER MARKET */}
        {activeTab === 'transfers' && (
          <TransferMarketTab
            user={user}
            club={club}
            server={server}
            onUpdateClub={handleUpdateClubState}
            onOpenContractFromInbox={targetedContractId}
            onOpenOfferFromInbox={targetedOfferId}
          />
        )}

        {/* TAB 6: SERVER NEWS TAB */}
        {activeTab === 'news' && (
          <ServerNewsTab
            server={server}
            club={club}
          />
        )}

        {/* TAB 7: MANAGER INBOX / MAILBOX TAB */}
        {activeTab === 'inbox' && (
          <InboxTab
            server={server}
            club={club}
            onOpenOffer={(offerId) => {
              setTargetedOfferId(offerId);
              setActiveTab('transfers');
            }}
            onOpenContract={(contractId) => {
              setTargetedContractId(contractId);
              setActiveTab('transfers');
            }}
          />
        )}

        {/* TAB 8: CLUB OVERVIEW & GROUND */}
        {activeTab === 'overview' && (
          <AnimatedLighting color="orange" borderWidth={3} rounded="3xl" speed={4} glowIntensity="high">
            <div className="p-6 sm:p-8 rounded-[1.6rem] bg-[#120803] border border-orange-500/30 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AnimatedLighting color="amber" borderWidth={1.8} rounded="2xl">
                  <div className="p-5 rounded-2xl stadium-panel bg-black/80 space-y-1">
                    <div className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center justify-between">
                      <span>Transfer Warchest</span>
                      <Coins className="w-4 h-4" />
                    </div>
                    <div className="font-title text-3xl font-black text-amber-300 tabular-nums">
                      {formatCurrency(club.transferBudget)}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Guaranteed starting balance
                    </div>
                  </div>
                </AnimatedLighting>

                <AnimatedLighting color="cyan" borderWidth={1.8} rounded="2xl">
                  <div className="p-5 rounded-2xl stadium-panel bg-black/80 space-y-1">
                    <div className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center justify-between">
                      <span>Home Ground</span>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="font-title text-2xl font-black text-white break-words leading-tight" title={club.stadiumName}>
                      {club.stadiumName}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Capacity: <strong className="text-white tabular-nums">{club.stadiumCapacity.toLocaleString()}</strong> fans
                    </div>
                  </div>
                </AnimatedLighting>

                <AnimatedLighting color="emerald" borderWidth={1.8} rounded="2xl">
                  <div className="p-5 rounded-2xl stadium-panel bg-black/80 space-y-1">
                    <div className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center justify-between">
                      <span>Squad Size</span>
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="font-title text-3xl font-black text-white tabular-nums">
                      {club.squad?.length || 22} Players
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Full professional squad registry
                    </div>
                  </div>
                </AnimatedLighting>

                <AnimatedLighting color="violet" borderWidth={1.8} rounded="2xl">
                  <div className="p-5 rounded-2xl stadium-panel bg-black/80 space-y-1">
                    <div className="text-xs font-mono uppercase text-purple-400 font-bold flex items-center justify-between">
                      <span>Contract Status</span>
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="font-title text-2xl font-black text-white">
                      Active
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      Claimed: {club.claimedAt ? new Date(club.claimedAt).toLocaleDateString() : 'Today'}
                    </div>
                  </div>
                </AnimatedLighting>
              </div>

              {/* Pitch Training Ground */}
              <div className="rounded-3xl stadium-panel-glow border border-orange-500/40 overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/60">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-400" />
                    <h3 className="font-title text-2xl font-bold uppercase text-white">
                      Club Training Ground & Matchday Pitch
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                    Interactive simulation (Click pitch to strike ball)
                  </span>
                </div>
                <div className="relative h-[420px] w-full bg-[#06170f]">
                  <TacticalPitchCanvas className="w-full h-full cursor-crosshair" interactive={true} />
                </div>
              </div>
            </div>
          </AnimatedLighting>
        )}

        {/* TAB 9: FINANCIAL LEDGER & TREASURY */}
        {activeTab === 'finances' && (
          <AnimatedLighting color="rose" borderWidth={3} rounded="3xl" speed={4} glowIntensity="high">
            <div className="p-6 sm:p-8 rounded-[1.6rem] bg-[#14060d] border border-pink-500/30 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-pink-500/20">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-pink-400 font-extrabold tracking-wider">
                    <Landmark className="w-4 h-4 text-pink-400" />
                    <span>Executive Boardroom Treasury & Audit</span>
                  </div>
                  <h3 className="font-title text-3xl sm:text-4xl font-black uppercase text-white text-animated-silver">
                    Financial Balance Sheet
                  </h3>
                  <p className="text-xs font-mono text-slate-300">
                    Transparent fiscal auditing and warchest accounting guaranteed by Manager Nol protocol.
                  </p>
                </div>

                <AnimatedLighting color="rose" borderWidth={2} rounded="2xl" speed={2.8}>
                  <div className="p-4 rounded-2xl bg-black/80 border border-pink-500/40 text-right font-mono">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total Club Valuation</div>
                    <div className="font-title text-3xl font-black text-pink-300 font-mono">
                      €245,000,000
                    </div>
                  </div>
                </AnimatedLighting>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <AnimatedLighting color="emerald" borderWidth={1.8} rounded="2xl">
                  <div className="p-5 rounded-2xl stadium-panel bg-black/80 space-y-2 h-full">
                    <div className="text-xs font-mono uppercase text-slate-400">Liquid Warchest Balance</div>
                    <div className="font-title text-4xl font-black text-emerald-400 font-mono">
                      {formatCurrency(club.transferBudget)}
                    </div>
                    <div className="text-xs font-mono text-slate-400">100% available for player signings</div>
                  </div>
                </AnimatedLighting>

                <AnimatedLighting color="amber" borderWidth={1.8} rounded="2xl">
                  <div className="p-5 rounded-2xl stadium-panel bg-black/80 space-y-2 h-full">
                    <div className="text-xs font-mono uppercase text-slate-400">Estimated Matchday Revenue</div>
                    <div className="font-title text-4xl font-black text-amber-300 font-mono">
                      €3,250,000 / Match
                    </div>
                    <div className="text-xs font-mono text-slate-400">Based on {club.stadiumCapacity.toLocaleString()} seat sell-outs</div>
                  </div>
                </AnimatedLighting>

                <AnimatedLighting color="cyan" borderWidth={1.8} rounded="2xl">
                  <div className="p-5 rounded-2xl stadium-panel bg-black/80 space-y-2 h-full">
                    <div className="text-xs font-mono uppercase text-slate-400">Weekly Payroll Total</div>
                    <div className="font-title text-4xl font-black text-white font-mono">
                      €1,820,000 / Wk
                    </div>
                    <div className="text-xs font-mono text-emerald-400">Fully covered by sponsorship revenue</div>
                  </div>
                </AnimatedLighting>
              </div>
            </div>
          </AnimatedLighting>
        )}

        {/* TAB 10: SERVER UNIVERSE */}
        {activeTab === 'server' && (
          <AnimatedLighting color="azure" borderWidth={3} rounded="3xl" speed={4} glowIntensity="high">
            <div className="p-6 sm:p-8 rounded-[1.6rem] bg-[#050c19] border border-blue-500/30 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-blue-500/20">
                <div>
                  <h3 className="font-title text-3xl font-black uppercase text-white text-animated-cyan">
                    Server {server.code} · {server.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    Region: {server.region} · Continent: {server.continent} · Base Latency: ~{server.basePing}ms
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onChangeServer}
                  className="btn-broadcast-primary text-xs py-2.5 px-4 cursor-pointer"
                >
                  Browse All 30 Servers
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl stadium-panel bg-black/80 border border-white/10">
                  <div className="text-xs font-mono uppercase text-slate-400">Total Clubs in Server</div>
                  <div className="font-title text-4xl font-black text-white mt-1 tabular-nums">
                    30 Clubs
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 mt-1">
                    1 claimed by you (@{user.username})
                  </div>
                </div>

                <div className="p-5 rounded-2xl stadium-panel bg-black/80 border border-white/10">
                  <div className="text-xs font-mono uppercase text-slate-400">Global Server Network</div>
                  <div className="font-title text-4xl font-black text-white mt-1 tabular-nums">
                    30 Servers
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    900 total persistent clubs worldwide
                  </div>
                </div>

                <div className="p-5 rounded-2xl stadium-panel bg-black/80 border border-white/10">
                  <div className="text-xs font-mono uppercase text-slate-400">Database Engine</div>
                  <div className="font-title text-4xl font-black text-emerald-400 mt-1">
                    Online
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    Atomic JSON Persistence (data/database.json)
                  </div>
                </div>
              </div>
            </div>
          </AnimatedLighting>
        )}
      </main>

      {/* Resignation Confirmation Modal */}
      {resignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
          <div className="relative w-full max-w-md my-auto">
            <AnimatedLighting color="rose" borderWidth={2.5} rounded="3xl" speed={3}>
              <div className="stadium-panel-glow p-6 sm:p-7 rounded-[1.5rem] shadow-2xl text-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <h3 className="font-title text-2xl font-black uppercase text-white">
                  Confirm Resignation
                </h3>

                <p className="text-xs font-mono text-slate-300 mt-2 leading-relaxed">
                  Are you sure you want to resign as manager of <strong className="text-white">{club.name}</strong>?
                </p>

                <div className="mt-3 p-3 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-slate-400 space-y-1">
                  <div>· {club.name} will become open for other managers to claim.</div>
                  <div>· Your manager account (@{user.username}) remains fully intact.</div>
                  <div>· You will be able to claim any available club with a fresh €100,000,000 budget!</div>
                </div>

                {resignError && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs font-mono">
                    {resignError}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={resigning}
                    onClick={() => setResignModalOpen(false)}
                    className="btn-broadcast-secondary text-xs"
                  >
                    Keep Contract
                  </button>

                  <button
                    type="button"
                    disabled={resigning}
                    onClick={handleConfirmResign}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-title font-black uppercase tracking-wider transition-colors shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
                  >
                    {resigning ? 'Resigning...' : 'Confirm Resignation'}
                  </button>
                </div>
              </div>
            </AnimatedLighting>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Navigation Bar for Instant 1-Thumb Access to Key Operations */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060c08]/95 backdrop-blur-xl border-t border-white/15 px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          type="button"
          onClick={() => handleSelectTab('tactics')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'tactics' ? 'text-emerald-400 font-bold bg-white/5' : 'text-slate-400'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span className="text-[10px] font-title uppercase tracking-wider">Tactics</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab('squad')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'squad' ? 'text-violet-400 font-bold bg-white/5' : 'text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px] font-title uppercase tracking-wider">Squad</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab('transfers')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'transfers' ? 'text-lime-400 font-black bg-lime-950/50 border border-lime-500/40' : 'text-slate-400'
          }`}
        >
          <Coins className="w-4 h-4 text-lime-400" />
          <span className="text-[10px] font-title uppercase tracking-wider">Market</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab('news')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'news' ? 'text-cyan-400 font-bold bg-cyan-950/50 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          <Newspaper className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-title uppercase tracking-wider">News</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab('inbox')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'inbox' ? 'text-amber-400 font-black bg-amber-950/50 border border-amber-500/40' : 'text-slate-400'
          }`}
        >
          <Mail className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-title uppercase tracking-wider">Mailbox</span>
          {unreadInboxCount > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-1 right-2 animate-ping" />
          )}
        </button>
      </nav>
    </div>
  );
};
