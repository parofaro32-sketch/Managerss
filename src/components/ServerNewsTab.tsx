import React, { useState, useEffect } from 'react';
import { ServerNewsItem, FixtureItem, ServerItem, ClubItem } from '../types.ts';
import { api } from '../api.ts';
import { 
  Newspaper, 
  Calendar, 
  Trophy, 
  Coins, 
  Activity, 
  RefreshCw, 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  Building2, 
  Clock, 
  Users, 
  X, 
  Award,
  Sparkles,
  Flame,
  Zap,
  Target
} from 'lucide-react';
import { AnimatedLighting, LightingColorName } from './AnimatedLighting.tsx';

interface ServerNewsTabProps {
  server: ServerItem;
  club: ClubItem;
  onOpenArticleId?: string | null;
}

export const ServerNewsTab: React.FC<ServerNewsTabProps> = ({
  server,
  club,
  onOpenArticleId,
}) => {
  const [news, setNews] = useState<ServerNewsItem[]>([]);
  const [fixtures, setFixtures] = useState<FixtureItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<ServerNewsItem | null>(null);

  const categories = [
    'All',
    'Match Reports',
    'Upcoming Fixtures',
    'Transfer News',
    'Incoming Transfer Offers',
    'Contract Negotiations',
    'Completed Transfers',
    'Club Announcements',
  ];

  const fetchNewsAndFixtures = async () => {
    try {
      setLoading(true);
      const [newsRes, fixturesRes] = await Promise.all([
        api.getServerNews(server.id, selectedCategory !== 'All' ? selectedCategory : undefined),
        api.getServerFixtures(server.id),
      ]);

      if (newsRes && newsRes.news) {
        setNews(newsRes.news);
      }
      if (fixturesRes && fixturesRes.fixtures) {
        setFixtures(fixturesRes.fixtures);
      }
    } catch (err) {
      console.error('Failed to load server news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsAndFixtures();
  }, [server.id, selectedCategory]);

  useEffect(() => {
    if (onOpenArticleId && news.length > 0) {
      const art = news.find((n) => n.id === onOpenArticleId);
      if (art) setActiveArticle(art);
    }
  }, [onOpenArticleId, news]);

  // Simulate a scheduled match from fixtures
  const handleSimulateNextMatch = async () => {
    setSimulating(true);
    setSimMessage(null);
    try {
      const res = await api.simulateFixtureMatch(server.id);
      setSimMessage(res.message);
      setTimeout(() => setSimMessage(null), 5000);
      await fetchNewsAndFixtures();
      if (res.matchReport) {
        setActiveArticle(res.matchReport);
      }
    } catch (err: any) {
      setSimMessage(err.message || 'Error simulating matchday fixture.');
      setTimeout(() => setSimMessage(null), 4000);
    } finally {
      setSimulating(false);
    }
  };

  const getCategoryColor = (cat: string): LightingColorName => {
    switch (cat) {
      case 'Match Reports':
        return 'emerald';
      case 'Upcoming Fixtures':
        return 'cyan';
      case 'Transfer News':
        return 'amber';
      case 'Incoming Transfer Offers':
        return 'solar';
      case 'Contract Negotiations':
        return 'violet';
      case 'Completed Transfers':
        return 'lime';
      default:
        return 'azure';
    }
  };

  return (
    <AnimatedLighting color="azure" borderWidth={3} rounded="3xl" speed={4} glowIntensity="high" className="w-full shadow-2xl">
      <div className="relative z-10 p-6 sm:p-8 rounded-[1.6rem] bg-gradient-to-b from-[#060e1c] via-[#040812] to-[#02050a] text-slate-100 border border-blue-500/30 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-blue-500/20">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/40">
              <Newspaper className="w-4 h-4 text-cyan-400" />
              <span>Dedicated Server Press & Match Broadcast</span>
            </div>
            <h2 className="font-title text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-wide text-animated-cyan">
              {server.name} News Feed
            </h2>
            <p className="text-xs sm:text-sm font-mono text-slate-300 max-w-2xl">
              Authentic match reports, upcoming scheduled fixtures, transfer notifications, and board announcements isolated exclusively to <strong className="text-white">{server.code}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Button to simulate fixture and generate real match report */}
            <button
              type="button"
              onClick={handleSimulateNextMatch}
              disabled={simulating}
              className="btn-broadcast-primary text-xs py-3.5 px-5 font-title font-black uppercase flex items-center gap-2 cursor-pointer shadow-xl disabled:opacity-50"
            >
              <Play className="w-4 h-4 text-black fill-black" />
              <span>{simulating ? 'Simulating Matchday...' : 'Simulate Matchday Fixture'}</span>
            </button>

            <button
              type="button"
              onClick={fetchNewsAndFixtures}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh News Feed"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {simMessage && (
          <AnimatedLighting color="emerald" borderWidth={1.8} rounded="xl">
            <div className="p-4 rounded-xl bg-emerald-950/90 text-emerald-200 text-xs font-mono flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{simMessage}</span>
            </div>
          </AnimatedLighting>
        )}

        {/* Category Navigation Pills with Animated Lighting on Active */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const col = getCategoryColor(cat);
            return (
              <AnimatedLighting
                key={cat}
                color={col}
                active={isActive}
                borderWidth={isActive ? 2 : 1}
                rounded="xl"
                speed={isActive ? 2.5 : 5}
                glowIntensity={isActive ? 'standard' : 'subtle'}
                className="shrink-0"
              >
                <button
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-[0.7rem] text-xs font-title font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-black/90 text-white font-black shadow-lg ring-1 ring-white/30'
                      : 'bg-black/50 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              </AnimatedLighting>
            );
          })}
        </div>

        {/* Upcoming Fixtures Quick Carousel with Animated Lighting */}
        {(selectedCategory === 'All' || selectedCategory === 'Upcoming Fixtures') && fixtures.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-title text-lg font-bold uppercase text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Scheduled Matchday Fixtures ({server.code})</span>
              </span>
              <span className="text-slate-400">Matchday 1 Scheduling</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {fixtures.slice(0, 6).map((fix) => (
                <AnimatedLighting
                  key={fix.id}
                  color={fix.played ? 'emerald' : 'cyan'}
                  borderWidth={1.8}
                  rounded="2xl"
                  speed={3.5}
                  glowIntensity={fix.played ? 'standard' : 'subtle'}
                >
                  <div
                    className={`p-3.5 rounded-[1.125rem] transition-colors ${
                      fix.played
                        ? 'bg-gradient-to-br from-[#051a0d] to-[#020b06]'
                        : 'bg-gradient-to-br from-[#061424] to-[#020810]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2">
                      <span>Matchday {fix.matchday}</span>
                      <span className={fix.played ? 'text-emerald-400 font-bold uppercase' : 'text-cyan-400 font-bold'}>
                        {fix.played ? `Full Time (${fix.score})` : 'Scheduled Tomorrow'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-xs font-mono font-bold">
                      <span className="text-white truncate max-w-[120px]">{fix.homeClubName}</span>
                      <span className="text-amber-400 font-title text-base font-black px-2 py-0.5 rounded bg-black/80 border border-white/10 shrink-0">
                        {fix.played ? fix.score : 'VS'}
                      </span>
                      <span className="text-white truncate max-w-[120px] text-right">{fix.awayClubName}</span>
                    </div>
                  </div>
                </AnimatedLighting>
              ))}
            </div>
          </div>
        )}

        {/* Articles Feed */}
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <span>Retrieving {server.name} Press Feed...</span>
          </div>
        ) : news.length === 0 ? (
          <div className="py-16 text-center text-xs font-mono text-slate-400 p-8 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <Newspaper className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="font-title text-xl font-bold uppercase text-white">No News Dispatches Found</div>
            <p>No articles found under "{selectedCategory}" on {server.name}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item) => {
              const col = getCategoryColor(item.category);
              const isMatchReport = item.category === 'Match Reports';
              const isTransfer = item.category === 'Completed Transfers' || item.category === 'Transfer News';

              return (
                <AnimatedLighting
                  key={item.id}
                  color={col}
                  borderWidth={1.8}
                  rounded="2xl"
                  speed={4}
                  className="cursor-pointer transition-transform hover:-translate-y-0.5"
                  onClick={() => setActiveArticle(item)}
                >
                  <div className="p-5 sm:p-6 rounded-[1.2rem] bg-gradient-to-r from-[#091522] via-[#060e18] to-[#040810] space-y-3">
                    
                    {/* Category & Timestamp Row */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                            isMatchReport
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : isTransfer
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          {item.category}
                        </span>

                        {item.score && (
                          <span className="font-title text-base font-black px-2.5 py-0.5 rounded bg-black text-amber-300 border border-amber-400/40">
                            FT: {item.score}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(item.timestamp).toLocaleDateString()} · {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Headline - fully readable without clipping */}
                    <h3 className="font-title text-xl sm:text-2xl font-black uppercase text-white tracking-wide break-words leading-snug hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h3>

                    {/* Match Clubs Crest Logos if Match Report */}
                    {isMatchReport && (item.homeClubLogo || item.awayClubLogo) && (
                      <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between max-w-md">
                        <div className="flex items-center gap-2">
                          {item.homeClubLogo && (
                            <div
                              className="w-8 h-8 rounded-lg bg-black flex items-center justify-center p-0.5"
                              dangerouslySetInnerHTML={{ __html: item.homeClubLogo }}
                            />
                          )}
                          <span className="font-title font-bold text-sm text-white">{item.homeClubName}</span>
                        </div>

                        <span className="font-title font-black text-xl text-amber-300 px-3">{item.score}</span>

                        <div className="flex items-center gap-2">
                          <span className="font-title font-bold text-sm text-white">{item.awayClubName}</span>
                          {item.awayClubLogo && (
                            <div
                              className="w-8 h-8 rounded-lg bg-black flex items-center justify-center p-0.5"
                              dangerouslySetInnerHTML={{ __html: item.awayClubLogo }}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Description - fully readable */}
                    <p className="text-xs sm:text-sm font-mono text-slate-300 leading-relaxed break-words">
                      {item.description}
                    </p>

                    {item.details && (
                      <div className="text-xs font-mono text-cyan-300/90 pt-2 border-t border-white/10">
                        {item.details}
                      </div>
                    )}
                  </div>
                </AnimatedLighting>
              );
            })}
          </div>
        )}

        {/* OPENED ARTICLE DETAILS MODAL */}
        {activeArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/92 backdrop-blur-2xl overflow-y-auto">
            <div className="relative w-full max-w-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
              <AnimatedLighting
                color={getCategoryColor(activeArticle.category)}
                borderWidth={2.5}
                rounded="3xl"
                speed={3}
                glowIntensity="high"
              >
                <div className="p-6 sm:p-8 rounded-[1.6rem] bg-gradient-to-b from-[#0a1829] via-[#050e18] to-[#02060b] text-slate-100 shadow-2xl space-y-6">
                  
                  {/* Article Header */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold uppercase tracking-wider border border-cyan-500/40">
                        {activeArticle.category}
                      </span>
                      <div className="text-xs font-mono text-slate-400 mt-1">
                        Dispatched {new Date(activeArticle.timestamp).toLocaleString()} · Server {server.code}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveArticle(null)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Headline */}
                  <h2 className="font-title text-2xl sm:text-3xl font-black uppercase text-white tracking-wide break-words leading-snug">
                    {activeArticle.title}
                  </h2>

                  {/* If Match Report, Show Detailed Match Center Statistics */}
                  {activeArticle.matchStats && (
                    <AnimatedLighting color="emerald" borderWidth={1.8} rounded="2xl" speed={3.2}>
                      <div className="p-5 rounded-2xl bg-black/85 space-y-4 font-mono text-xs">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <span className="font-title text-base font-bold text-emerald-400 uppercase">
                            Official Match Center Telemetry
                          </span>
                          <span className="text-slate-400">{activeArticle.matchStats.stadium}</span>
                        </div>

                        {/* Possession bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-emerald-400">{activeArticle.homeClubName}: {activeArticle.matchStats.homePossession}%</span>
                            <span className="text-slate-400">Possession</span>
                            <span className="text-cyan-400">{activeArticle.awayClubName}: {activeArticle.matchStats.awayPossession}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-black rounded-full overflow-hidden flex border border-white/10">
                            <div className="bg-emerald-400 h-full" style={{ width: `${activeArticle.matchStats.homePossession}%` }} />
                            <div className="bg-cyan-400 h-full" style={{ width: `${activeArticle.matchStats.awayPossession}%` }} />
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                          <div className="p-2.5 rounded-xl bg-black/60 border border-white/10">
                            <span className="text-[10px] text-slate-400 uppercase block">Shots:</span>
                            <span className="font-bold text-white text-sm">
                              {activeArticle.matchStats.homeShots} - {activeArticle.matchStats.awayShots}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-black/60 border border-white/10">
                            <span className="text-[10px] text-slate-400 uppercase block">Corners:</span>
                            <span className="font-bold text-white text-sm">
                              {activeArticle.matchStats.homeCorners} - {activeArticle.matchStats.awayCorners}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-black/60 border border-white/10">
                            <span className="text-[10px] text-slate-400 uppercase block">Attendance:</span>
                            <span className="font-bold text-amber-300 text-sm">
                              {activeArticle.matchStats.attendance.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Goalscorers */}
                        {activeArticle.matchStats.goalScorers && activeArticle.matchStats.goalScorers.length > 0 && (
                          <div className="pt-2 border-t border-white/10 space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Goalscorers:</span>
                            <div className="flex flex-wrap gap-2">
                              {activeArticle.matchStats.goalScorers.map((scorer, sIdx) => (
                                <span key={sIdx} className="px-2.5 py-1 rounded-lg bg-black text-amber-300 border border-amber-400/30 text-xs font-bold">
                                  ⚽ {scorer}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AnimatedLighting>
                  )}

                  {/* Description */}
                  <div className="p-4 rounded-2xl bg-black/75 border border-white/10 space-y-3 font-mono text-sm leading-relaxed text-slate-200">
                    <p className="break-words">{activeArticle.description}</p>
                    {activeArticle.details && (
                      <p className="pt-2 border-t border-white/10 text-cyan-300/90 text-xs break-words">
                        {activeArticle.details}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setActiveArticle(null)}
                      className="btn-broadcast-secondary text-xs py-2.5 px-6 cursor-pointer"
                    >
                      Close Report
                    </button>
                  </div>
                </div>
              </AnimatedLighting>
            </div>
          </div>
        )}
      </div>
    </AnimatedLighting>
  );
};
