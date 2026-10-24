import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Download, 
  ChevronRight, 
  SlidersHorizontal, 
  Compass, 
  Layers, 
  Sparkles, 
  Trophy, 
  Activity, 
  Users, 
  Coins, 
  CheckCircle2, 
  Lock, 
  User as UserIcon, 
  Mail, 
  Loader2, 
  AlertCircle, 
  Zap, 
  ArrowRight,
  Globe,
  Radio,
  Building2,
  Flame,
  Award,
  Play,
  Eye,
  EyeOff,
  KeyRound,
  BadgeCheck,
  Briefcase,
  RotateCcw,
  Crosshair,
  Target,
  Gauge,
  HelpCircle,
  Clock
} from 'lucide-react';
import { api } from '../api.ts';
import { User, ClubItem, ServerItem, Player, PositionCategory } from '../types.ts';
import { ALL_FORMATIONS, FormationPosition } from '../data/formations.ts';
import { MiniPitchFormation } from './MiniPitchFormation.tsx';
import { AnimatedStadiumBackground } from './AnimatedStadiumBackground.tsx';
import { ClubLogo } from './ClubLogo.tsx';
import { ManagerNolLogo } from './ManagerNolLogo.tsx';
import { AnimatedLighting } from './AnimatedLighting.tsx';
import stadiumNightImg from '../assets/images/stadium_night_floodlights_1792753840155.jpg';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  serverCount?: number;
  onAuthSuccess?: (data: { user: User; activeClub: ClubItem | null; activeServer: ServerItem | null }) => void;
  currentUser?: User | null;
  activeClub?: ClubItem | null;
  onGoToDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  serverCount = 30,
  onAuthSuccess,
  currentUser,
  activeClub,
  onGoToDashboard,
}) => {
  // Direct In-Hero Manager Access Terminal State (Username + Password only)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Introductory "Cooking Up Matchday Engine" Animated Screen State
  const [isCookingUp, setIsCookingUp] = useState<boolean>(true);
  const [cookingProgress, setCookingProgress] = useState<number>(14);
  const [cookingStageIndex, setCookingStageIndex] = useState<number>(0);

  const cookingStages = [
    { title: 'Cooking up Matchday Engine...', subtitle: 'Bootstrapping real-time tactical simulation matrix & pitch physics', badge: 'TACTICAL CORE' },
    { title: 'Spinning up 30 Global Servers...', subtitle: 'Europe Central, UK Premier, Americas & APAC clusters synchronized', badge: '30 REGIONS' },
    { title: 'Allocating €100,000,000 Warchests...', subtitle: 'Securing starting treasury grants & strict 1-club-per-gaffer mutexes', badge: '€100M GRANT' },
    { title: 'Calibrating 900 Football Clubs...', subtitle: 'Verifying 22-player squads, stamina rates & tactical formations', badge: '900 CLUBS' },
    { title: 'Matchday Ready for Kickoff!', subtitle: 'Opening Pro Manager Accreditation Terminal...', badge: 'ENGINE READY' }
  ];

  // Animated cooking up sequence timer (runs smoothly on initial load)
  useEffect(() => {
    if (!isCookingUp) return;
    
    const interval = setInterval(() => {
      setCookingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsCookingUp(false);
          }, 350);
          return 100;
        }
        const step = Math.floor(Math.random() * 12) + 8;
        const next = Math.min(prev + step, 100);
        if (next >= 92) setCookingStageIndex(4);
        else if (next >= 70) setCookingStageIndex(3);
        else if (next >= 45) setCookingStageIndex(2);
        else if (next >= 22) setCookingStageIndex(1);
        else setCookingStageIndex(0);
        return next;
      });
    }, 190);

    return () => clearInterval(interval);
  }, [isCookingUp]);

  const handleSkipCooking = () => {
    setCookingProgress(100);
    setIsCookingUp(false);
  };

  const handleReplayCooking = () => {
    setCookingProgress(12);
    setCookingStageIndex(0);
    setIsCookingUp(true);
  };

  // Quick fill helper for instantaneous testing
  const handleQuickFillGaffer = () => {
    if (authMode === 'login') {
      setUsername('gaffer_champion');
      setPassword('Manager2026!');
    } else {
      const randNum = Math.floor(100 + Math.random() * 900);
      setUsername(`Gaffer_${randNum}`);
      setPassword('Manager2026!');
    }
    setAuthError(null);
  };

  // Instant 1-Click Guest Coach Test Drive
  const handleInstantTestDrive = async () => {
    setLoading(true);
    setAuthError(null);
    setAuthSuccess('Authorizing Instant Guest Coach License...');
    try {
      // First try logging into default demo gaffer
      try {
        const res = await api.login('gaffer_champion', 'Manager2026!');
        setAuthSuccess('Welcome Gaffer! Entering tactical matchday universe...');
        if (onAuthSuccess) {
          setTimeout(() => {
            onAuthSuccess({
              user: res.user,
              activeClub: res.activeClub,
              activeServer: res.activeServer,
            });
          }, 400);
        }
        return;
      } catch {
        // If demo account doesn't exist yet, register a unique guest coach
        const randNum = Math.floor(1000 + Math.random() * 9000);
        const guestName = `Gaffer_${randNum}`;
        const res = await api.register(guestName, 'Manager2026!');
        setAuthSuccess('UEFA Pro License Granted! Initializing €100,000,000 warchest...');
        if (onAuthSuccess) {
          setTimeout(() => {
            onAuthSuccess({
              user: res.user,
              activeClub: null,
              activeServer: null,
            });
          }, 400);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Instant Test Drive failed. Please try standard sign in.');
    } finally {
      setLoading(false);
    }
  };

  // Hero Interactive Formation Previewer State
  const [previewFormation, setPreviewFormation] = useState<string>('4-3-3');
  const [previewEffort, setPreviewEffort] = useState<'Medium' | 'High' | 'Extreme'>('High');

  // Interactive Live Attack Simulation on Pitch
  const [drillRunning, setDrillRunning] = useState(false);
  const [drillStep, setDrillStep] = useState<number>(0);
  const [drillCommentary, setDrillCommentary] = useState<string>(
    'Pitch ready: select formation or run live attack drill'
  );
  const [selectedPlayerRole, setSelectedPlayerRole] = useState<{
    role: string;
    label: string;
    duty: string;
    keyStats: string;
  } | null>(null);

  // Active Server Region Tab
  const [activeServerRegion, setActiveServerRegion] = useState<'all' | 'eu' | 'uk' | 'americas' | 'apac'>('all');

  // Interactive Tactical Scenario Lab State
  const [activeScenario, setActiveScenario] = useState<'counter' | 'possession' | 'gegenpress'>('gegenpress');
  const [scenarioSimulating, setScenarioSimulating] = useState(false);
  const [scenarioResult, setScenarioResult] = useState<string | null>(null);

  // Handle direct in-page login/register (Username + Password only)
  const handleDirectAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (authMode === 'login') {
      if (!username.trim() || !password) {
        setAuthError('Please enter username and password.');
        return;
      }
    } else {
      if (!username.trim() || username.length < 3) {
        setAuthError('Manager username must be at least 3 characters.');
        return;
      }
      if (!password || password.length < 6) {
        setAuthError('Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      if (authMode === 'login') {
        const res = await api.login(username.trim(), password);
        setAuthSuccess('Credentials verified. Entering match universe...');
        if (onAuthSuccess) {
          setTimeout(() => {
            onAuthSuccess({
              user: res.user,
              activeClub: res.activeClub,
              activeServer: res.activeServer,
            });
          }, 350);
        }
      } else {
        const res = await api.register(username.trim(), password);
        setAuthSuccess('Manager License issued! Welcome to the League.');
        if (onAuthSuccess) {
          setTimeout(() => {
            onAuthSuccess({
              user: res.user,
              activeClub: null,
              activeServer: null,
            });
          }, 350);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Run live interactive attack drill on the pitch
  const handleRunAttackDrill = () => {
    if (drillRunning) return;
    setDrillRunning(true);
    setDrillStep(1);
    setDrillCommentary('Phase 1: Center-back steps up, initiating tempo via pivot midfielder...');

    setTimeout(() => {
      setDrillStep(2);
      setDrillCommentary('Phase 2: Playmaker turns in space, threading diagonal pass to overlapping winger!');
    }, 1100);

    setTimeout(() => {
      setDrillStep(3);
      setDrillCommentary('Phase 3: Winger beats his marker, whipping low driven cross into the 6-yard box!');
    }, 2200);

    setTimeout(() => {
      setDrillStep(4);
      setDrillCommentary('GOAL! Striker makes a darting near-post run and buries it into the top corner!');
      setTimeout(() => {
        setDrillRunning(false);
      }, 1500);
    }, 3400);
  };

  // Mock squad for the interactive pitch
  const previewPositions = ALL_FORMATIONS[previewFormation] || ALL_FORMATIONS['4-3-3'];
  const previewStartingMap: Record<string, string> = {};
  const mockSquad: Player[] = previewPositions.map((p, idx) => {
    const cat: PositionCategory =
      p.role === 'GK' ? 'Goalkeeper' : p.role === 'DEF' ? 'Defender' : p.role === 'MID' ? 'Midfielder' : 'Attacker';
    const pos = (p.label || (p.role === 'GK' ? 'GK' : p.role === 'DEF' ? 'CB' : p.role === 'MID' ? 'CM' : 'ST')) as any;
    return {
      id: `prev_${idx}`,
      number: idx === 0 ? 1 : idx + 1,
      name: p.label || p.role,
      position: pos,
      positionCategory: cat,
      rank: (idx === 9 ? 'Top Tier' : idx > 6 ? 'Worldclass' : 'Strong') as any,
      age: 25,
      nationality: 'International',
      preferredFoot: 'Right' as const,
      stamina: previewEffort === 'Extreme' ? 68 : previewEffort === 'High' ? 78 : 88,
      condition: 'Great' as const,
      pace: 82,
      shooting: 79,
      passing: 84,
      dribbling: 81,
      defending: 76,
      physical: 80,
    };
  });
  previewPositions.forEach((p, idx) => {
    previewStartingMap[p.id] = mockSquad[idx].id;
  });

  // Calculate tactical attributes for preview formation
  const formationStats: Record<string, { att: number; mid: number; def: number; label: string }> = {
    '4-3-3': { att: 89, mid: 84, def: 80, label: 'High Press Overload' },
    '4-2-3-1': { att: 86, mid: 91, def: 83, label: 'Playmaker Double Pivot' },
    '3-5-2': { att: 85, mid: 92, def: 79, label: 'Wing-Back Dominance' },
    '4-4-2': { att: 83, mid: 82, def: 86, label: 'Direct Classical Shape' },
    '5-3-2': { att: 78, mid: 80, def: 94, label: 'Fortress Low Block' },
    '4-1-4-1': { att: 80, mid: 89, def: 85, label: 'Anchored Transition' },
    '4-3-2-1': { att: 88, mid: 88, def: 81, label: 'Christmas Tree Narrow' },
    '3-4-3': { att: 92, mid: 83, def: 76, label: 'Total Attack Blitz' },
  };

  const currentStats = formationStats[previewFormation] || { att: 85, mid: 85, def: 85, label: 'Tactical Fluidity' };

  // Tactical Scenarios List
  const scenarios = [
    {
      id: 'gegenpress',
      title: 'Gegenpress Swarm',
      formation: '4-3-3',
      pace: 'Extreme',
      description: 'High-intensity collective pressing in the opponent half to force turnovers within 6 seconds.',
      odds: '74% Turnover Rate · 32% Stamina Drain',
      benefit: '+18% Goal Chances on High Block',
    },
    {
      id: 'possession',
      title: 'Tiki-Taka Control',
      formation: '4-2-3-1',
      pace: 'Medium',
      description: 'Fluid triangles, tempo retention, and overload through dual attacking pivots.',
      odds: '68% Possession · 14% Stamina Drain',
      benefit: 'Opponent Fatigue Rate Accelerated',
    },
    {
      id: 'counter',
      title: 'Direct Rapid Counter',
      formation: '5-3-2',
      pace: 'High',
      description: 'Disciplined deep block that absorbs heavy waves, springing vertical long balls into space.',
      odds: '82% Defensive Clears · 22% Stamina Drain',
      benefit: 'Critical Breakaway Threat',
    },
  ];

  // Run a quick match simulation in the Scenario Lab
  const handleSimulateScenario = (scenId: 'counter' | 'possession' | 'gegenpress') => {
    setActiveScenario(scenId);
    setScenarioSimulating(true);
    setScenarioResult(null);

    const s = scenarios.find((sc) => sc.id === scenId)!;
    setPreviewFormation(s.formation);
    setPreviewEffort(s.pace as any);

    setTimeout(() => {
      setScenarioSimulating(false);
      if (scenId === 'gegenpress') {
        setScenarioResult('GOAL! Turnover won at 35 yards. Striker slotted into bottom left corner.');
      } else if (scenId === 'possession') {
        setScenarioResult('CONTROLLED! 24 consecutive passes executed. Opponent defense disorganized.');
      } else {
        setScenarioResult('COUNTER-STRIKE! Cross-field ball caught the high line. 1v1 chance created.');
      }
    }, 600);
  };

  // 30 Match Servers Cluster Telemetry (NEW +30% Feature)
  const serverClusters = [
    { id: 'EU01-EU10', name: 'Europe Central', region: 'eu', servers: 10, ping: '12ms', status: 'Optimal', load: '84%', availableClubs: 28 },
    { id: 'ENG01-ENG06', name: 'UK & British Isles', region: 'uk', servers: 6, ping: '11ms', status: 'Optimal', load: '91%', availableClubs: 14 },
    { id: 'AM01-AM08', name: 'Americas Continental', region: 'americas', servers: 8, ping: '28ms', status: 'Stable', load: '76%', availableClubs: 36 },
    { id: 'APAC01-APAC06', name: 'Asia-Pacific Prime', region: 'apac', servers: 6, ping: '42ms', status: 'Stable', load: '68%', availableClubs: 42 },
  ];

  const filteredClusters = activeServerRegion === 'all' 
    ? serverClusters 
    : serverClusters.filter(c => c.region === activeServerRegion);

  // Featured Iconic Clubs
  const featuredClubs = [
    {
      name: 'Royal Vesterholm',
      code: 'RVH',
      city: 'Frankfurt, DE',
      server: 'EU01 - Europe Central',
      stadium: 'Kaiserpark Arena',
      capacity: '68,500',
      founded: 1899,
      colors: { primary: '#1e3a8a', secondary: '#f59e0b' },
      reputation: 'Continental Title Contender',
    },
    {
      name: 'Ironvale Athletic',
      code: 'IVA',
      city: 'Manchester, UK',
      server: 'ENG02 - Premier North',
      stadium: 'Foundry Ground',
      capacity: '56,200',
      founded: 1904,
      colors: { primary: '#dc2626', secondary: '#18181b' },
      reputation: 'Fierce Working-Class Heavyweight',
    },
    {
      name: 'Solhaven City',
      code: 'SHC',
      city: 'Madrid, ES',
      server: 'IBE05 - Iberia League',
      stadium: 'Estadio del Sol',
      capacity: '63,000',
      founded: 1921,
      colors: { primary: '#059669', secondary: '#fef08a' },
      reputation: 'Elite Tactical Academy',
    },
    {
      name: 'Vanguard Pacific',
      code: 'VGP',
      city: 'Tokyo, JP',
      server: 'APAC17 - Pacific Prime',
      stadium: 'Neo-Dome Megaplex',
      capacity: '72,400',
      founded: 1938,
      colors: { primary: '#0891b2', secondary: '#ffffff' },
      reputation: 'High-Tech Modern Dynasty',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#030705] text-slate-100 flex flex-col overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      {/* =====================================================================
          INTRO ANIMATED LOADING SCREEN: "COOKING UP MATCHDAY ENGINE"
          ===================================================================== */}
      {isCookingUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020604] overflow-hidden select-none transition-all duration-500">
          {/* Animated Stadium Atmosphere & Floodlight Beams */}
          <div className="absolute inset-0 pointer-events-none">
            <img 
              src={stadiumNightImg || '/assets/images/stadium_night_floodlights_1792753840155.jpg'} 
              alt="Stadium Night Floodlights" 
              className="w-full h-full object-cover opacity-25 filter contrast-150 scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#020604] via-transparent to-[#020604]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none animate-stadium-lights" />
            <div className="absolute top-1/4 -right-20 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
          </div>

          {/* Animated "MANAGER NOL" Text Background Traveling Behind Loading Card */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 flex flex-col justify-between py-8">
            <div className="transform -rotate-6 scale-110">
              <div className="animate-marquee-left flex items-center gap-8 whitespace-nowrap text-5xl md:text-7xl font-display font-black uppercase text-emerald-400">
                <span className="stroke-text-emerald">MANAGER NOL</span>
                <span>✦</span>
                <span>COOKING UP MATCHDAY ENGINE</span>
                <span>✦</span>
                <span className="stroke-text-gold">SEASON 2026</span>
                <span>✦</span>
                <span>30 SERVERS SYNCING</span>
                <span>✦</span>
                <span className="stroke-text-white">MANAGER NOL</span>
                <span>✦</span>
                <span>€100,000,000 WARCHEST</span>
              </div>
            </div>
            <div className="transform rotate-4 scale-110">
              <div className="animate-marquee-right flex items-center gap-8 whitespace-nowrap text-4xl md:text-6xl font-display font-black uppercase text-amber-300">
                <span className="stroke-text-gold">900 CLUBS CALIBRATING</span>
                <span>★</span>
                <span>MANAGER NOL FOOTBALL</span>
                <span>★</span>
                <span className="stroke-text-emerald">REALISTIC STAMINA DYNAMICS</span>
                <span>★</span>
                <span>PREMIER SOCCER SIMULATION</span>
                <span>★</span>
                <span className="stroke-text-white">MANAGER NOL</span>
              </div>
            </div>
            <div className="transform -rotate-2 scale-110">
              <div className="animate-marquee-fast flex items-center gap-8 whitespace-nowrap text-5xl md:text-7xl font-display font-black uppercase text-emerald-300">
                <span>TACTICAL FORMATIONS READY</span>
                <span>◆</span>
                <span className="stroke-text-emerald">MANAGER NOL</span>
                <span>◆</span>
                <span>PRO LICENSE ACCREDITATION</span>
                <span>◆</span>
                <span className="stroke-text-gold">ENTER THE DUG-OUT</span>
              </div>
            </div>
          </div>

          {/* Central Cooking Up Holographic HUD Card */}
          <div className="relative z-10 max-w-lg w-full mx-4 stadium-panel-glow rounded-3xl p-7 sm:p-9 border border-emerald-500/50 shadow-2xl text-center overflow-hidden">
            {/* Orbiting lighting laser beam on the modal too */}
            <div className="terminal-laser-beam" />
            <div className="terminal-laser-beam-fast" />

            <div className="relative z-10 space-y-6">
              {/* Rotating Radar & Pulsing Crest */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                {/* Outer spinning radar ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400/40 animate-orbit-spin" />
                <div className="absolute inset-2 rounded-full border border-teal-400/30 animate-orbit-spin-reverse" />
                
                {/* Glowing center badge */}
                <div className="animate-cooking-pulse">
                  <ManagerNolLogo size={64} rounded="2xl" withLighting lightingColor="amber" />
                </div>

                {/* Orbiting ball dot */}
                <div className="absolute inset-0 animate-orbit-spin pointer-events-none">
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-white shadow-lg shadow-amber-400/80 -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Title & Stage */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{cookingStages[cookingStageIndex].badge}</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-none">
                  {cookingStages[cookingStageIndex].title}
                </h2>
                <p className="text-xs font-mono text-slate-300 max-w-sm mx-auto min-h-[32px] leading-relaxed">
                  {cookingStages[cookingStageIndex].subtitle}
                </p>
              </div>

              {/* High-Precision Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>SYSTEM CALIBRATION</span>
                  </span>
                  <span className="text-amber-300 font-bold font-mono text-sm">
                    {cookingProgress}%
                  </span>
                </div>
                <div className="w-full h-3 bg-black/80 rounded-full p-0.5 border border-white/15 overflow-hidden relative shadow-inner">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-200 ease-out shadow-lg shadow-emerald-500/50 relative"
                    style={{ width: `${cookingProgress}%` }}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/70 rounded-full blur-[2px] animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Stage Progress Bullets */}
              <div className="grid grid-cols-5 gap-1.5 text-[9px] font-mono uppercase tracking-wider">
                {cookingStages.map((s, idx) => {
                  const isDone = cookingStageIndex > idx || cookingProgress === 100;
                  const isCurrent = cookingStageIndex === idx && cookingProgress < 100;
                  return (
                    <div 
                      key={idx}
                      className={`p-1.5 rounded-lg border text-center transition-all ${
                        isDone 
                          ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300' 
                          : isCurrent 
                            ? 'bg-amber-950/70 border-amber-500/60 text-amber-300 ring-1 ring-amber-400/40' 
                            : 'bg-black/40 border-white/10 text-slate-500'
                      }`}
                    >
                      <div className="font-bold truncate">{s.badge.split(' ')[0]}</div>
                      <div>{isDone ? '✓' : isCurrent ? '...' : '○'}</div>
                    </div>
                  );
                })}
              </div>

              {/* Skip / Enter Action */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 text-left">
                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Matchday Season 2026</span>
                </div>
                <button
                  type="button"
                  onClick={handleSkipCooking}
                  className="btn-broadcast-primary text-xs py-2 px-4 shadow-md shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Enter Dug-Out</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stadium Night Atmosphere & Dynamic Fast Marquee Background */}
      <AnimatedStadiumBackground opacityBoost={true} />

      {/* Broadcast Header Navigation (Top Bar Contract: 3 Zones) */}
      <header className="relative z-30 stadium-panel sticky top-0 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          
          {/* Zone 1: Single Brand Wordmark Element with Golden Crest & Small Gold Animated Lighting */}
          <div className="flex items-center gap-3.5 shrink-0">
            <ManagerNolLogo size={46} rounded="xl" withLighting lightingColor="amber" />
            <div>
              <div className="font-title text-2xl sm:text-3xl font-black uppercase tracking-wider text-animated-gold leading-none flex items-center gap-2">
                MANAGER NOL
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/40">
                  SEASON 2026
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                Competitive Club Ownership
              </div>
            </div>
          </div>

          {/* Zone 2: Clean single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            <a href="#manager-terminal" className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0">
              Accreditation
            </a>
            <a href="#tactical-engine" className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0">
              Tactical Pitch
            </a>
            <a href="#servers-cluster" className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0">
              30 Servers Radar
            </a>
            <a href="#featured-clubs" className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0">
              Club Registry
            </a>
            <a href="#ownership-pillars" className="hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0">
              €100M Warchest
            </a>
          </nav>

          {/* Zone 3: Header Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onGoToDashboard}
                  className="btn-broadcast-primary text-xs py-2 px-4 whitespace-nowrap shrink-0 shadow-md shadow-emerald-500/25 flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Resume as @{currentUser.username}</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleReplayCooking}
                  className="hidden md:inline-flex btn-broadcast-secondary text-xs py-2 px-3 whitespace-nowrap shrink-0 text-amber-300 hover:text-amber-200 border-amber-500/30"
                  title="Replay animated matchday cooking-up intro"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Replay Intro</span>
                </button>

                <button
                  onClick={() => onOpenAuth('login')}
                  className="btn-broadcast-secondary text-xs py-2 px-3.5 whitespace-nowrap shrink-0"
                >
                  Sign In
                </button>

                <button
                  onClick={() => onOpenAuth('register')}
                  className="btn-broadcast-primary text-xs py-2 px-4 whitespace-nowrap shrink-0 shadow-md shadow-emerald-500/25"
                >
                  <span>Get License</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Broadcast Matchday Transmission Ticker */}
      <div className="relative z-20 bg-emerald-950/70 border-b border-emerald-500/30 px-4 py-2 text-xs font-mono text-slate-300 overflow-x-auto whitespace-nowrap shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider">LIVE LEAGUE WIRE:</span>
            <span className="text-white font-semibold">Season 2026 Matchday Online Across 30 Servers</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-300 font-bold">€100,000,000 Starting Grants Wired</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">900 Claimable Clubs with 22-Player Rosters</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-400 shrink-0 text-[11px]">
            <span className="text-emerald-400 font-bold">1 Club Per Manager Strict Mutex</span>
            <span>·</span>
            <span>Realistic Stamina Physics</span>
          </div>
        </div>
      </div>

      {/* Hero Section: Direct Terminal + Live Tactical Pitch */}
      <section className="relative z-10 pt-8 pb-16 lg:pt-12 lg:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1" id="manager-terminal">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Hero Left: Headline + REBRANDED MANAGER ACCREDITATION TERMINAL */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-emerald-400 uppercase bg-emerald-950/80 border border-emerald-500/30 px-3 py-1.5 rounded-md shadow-sm">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Premier Football Management Platform · Matchday 2026</span>
              </div>

              <h1 className="font-title text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-[0.92]">
                THE DUG-OUT AWAITS. <br />
                <span className="text-animated-emerald">
                  RULE THE LEAGUE.
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Compete across 30 persistent global servers with 900 unique football clubs. Deploy 15 tactical formations, 
                calibrate team stamina and work rate, and manage your 22-player roster backed by an exact €100,000,000 transfer warchest.
              </p>
            </div>

            {/* REBRANDED PRO MANAGER ACCREDITATION TERMINAL WITH ANIMATED ORBITING LIGHTING BEAM */}
            <div className="terminal-laser-frame shadow-2xl relative group">
              {/* Rotating primary neon emerald & white laser beam going around perimeter */}
              <div className="terminal-laser-beam" />
              {/* Counter-rotating amber secondary laser beam */}
              <div className="terminal-laser-beam-fast" />

              {/* Dynamic corner laser light pulses */}
              <div className="absolute -top-2 -left-2 w-16 h-16 bg-emerald-400/25 rounded-full blur-xl pointer-events-none animate-pulse" />
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-amber-400/25 rounded-full blur-xl pointer-events-none animate-pulse" />
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-teal-400/20 rounded-full blur-lg pointer-events-none" />
              <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-emerald-500/20 rounded-full blur-lg pointer-events-none" />

              {/* Inner terminal container */}
              <div className="terminal-laser-inner p-5 sm:p-7 border border-emerald-500/40 relative">
              
              {/* Terminal Command Status Strip */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                    {authMode === 'register' ? 'Official Manager Accreditation' : 'Head Coach Access Terminal'}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                    30 SERVERS SYNCED
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/40">
                    €100M GRANT
                  </span>
                </div>
              </div>

              {/* Mode Selector & Quick Fill Demo Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-1.5 p-1 bg-black/80 rounded-xl border border-white/15">
                  {authMode === 'register' ? (
                    <div className="laser-tab-pill laser-tab-pill-emerald">
                      <div className="laser-tab-beam" />
                      <button
                        type="button"
                        onClick={() => { setAuthMode('register'); setAuthError(null); }}
                        className="relative z-10 px-3.5 py-1.5 text-xs font-display font-black uppercase rounded-[0.75rem] transition-all cursor-pointer bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-md"
                      >
                        New License
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setAuthMode('register'); setAuthError(null); }}
                      className="px-3.5 py-1.5 text-xs font-display font-bold uppercase rounded-lg transition-all cursor-pointer text-slate-400 hover:text-white"
                    >
                      New License
                    </button>
                  )}

                  {authMode === 'login' ? (
                    <div className="laser-tab-pill laser-tab-pill-solar">
                      <div className="laser-tab-beam" />
                      <button
                        type="button"
                        onClick={() => { setAuthMode('login'); setAuthError(null); }}
                        className="relative z-10 px-3.5 py-1.5 text-xs font-display font-black uppercase rounded-[0.75rem] transition-all cursor-pointer bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-md"
                      >
                        Sign In
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setAuthError(null); }}
                      className="px-3.5 py-1.5 text-xs font-display font-bold uppercase rounded-lg transition-all cursor-pointer text-slate-400 hover:text-white"
                    >
                      Sign In
                    </button>
                  )}
                </div>

                {/* Quick Action Helpers */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleQuickFillGaffer}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all cursor-pointer"
                    title="Auto-fill sample credentials for instant testing"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Quick-fill</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleInstantTestDrive}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono text-emerald-300 hover:text-emerald-200 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 rounded-lg transition-all cursor-pointer font-bold shadow-sm"
                    title="1-click instant test drive without typing"
                  >
                    <Zap className="w-3 h-3 text-emerald-400" />
                    <span>Instant Test Drive</span>
                  </button>
                </div>
              </div>

              {/* Feedback Notifications */}
              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Direct Form */}
              <form onSubmit={handleDirectAuth} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                      Manager Username
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={authMode === 'login' ? 'e.g. gaffer_champion' : 'e.g. PepGuardiola'}
                        className="stadium-input w-full pl-10 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5 font-bold">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="stadium-input w-full pl-10 pr-10 text-xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs font-mono text-slate-400">
                    {authMode === 'register' ? (
                      <span className="text-amber-400 font-bold">€100,000,000 starting club grant wired instantly</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">Instant session restore & roster synchronization</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-broadcast-primary text-sm py-2.5 px-6 shrink-0 shadow-lg shadow-emerald-500/25"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : authMode === 'register' ? (
                      <>
                        <span>Claim License & Enter</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Enter League</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Invariant Trust Markers */}
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
                <span className="text-emerald-400">✓ 1 Club per Manager</span>
                <span className="text-slate-600">·</span>
                <span className="text-amber-400">✓ €100M Strict Warchest</span>
                <span className="text-slate-600">·</span>
                <span className="text-teal-400">✓ 30 Persistent Servers</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-300">✓ Zero Pay-to-Win</span>
              </div>
            </div>
          </div>
        </div>

          {/* Hero Right: Live Interactive Tactical Formation Board & Attack Simulator */}
          <div className="lg:col-span-6 space-y-4" id="tactical-engine">
            <div className="laser-frame-pitch">
              <div className="laser-beam-pitch" />
              <div className="relative z-10 stadium-panel rounded-[1.5rem] p-5 sm:p-6 border border-cyan-400/40 shadow-2xl">
                {/* Pitch Visualizer Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold uppercase text-white leading-none">
                        Tactical Formation Board
                      </h2>
                      <div className="text-xs font-mono text-cyan-300 mt-0.5">
                        {currentStats.label} · Real-time Pitch Passing Lanes
                      </div>
                    </div>
                  </div>

                  {/* Formation Quick Switcher with Animated Laser Pill on Active Tab */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                    {['4-3-3', '4-2-3-1', '3-5-2', '4-4-2', '5-3-2'].map((f) => {
                      const isActive = previewFormation === f;
                      if (isActive) {
                        return (
                          <div key={f} className="laser-tab-pill laser-tab-pill-azure shrink-0">
                            <div className="laser-tab-beam" />
                            <button
                              type="button"
                              onClick={() => setPreviewFormation(f)}
                              className="relative z-10 px-3.5 py-1 text-xs font-display font-black uppercase rounded-[0.75rem] transition-all cursor-pointer bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-md"
                            >
                              {f}
                            </button>
                          </div>
                        );
                      }
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setPreviewFormation(f)}
                          className="px-3 py-1 text-xs font-display font-bold uppercase rounded-lg transition-all cursor-pointer bg-black/60 text-slate-300 hover:text-white border border-white/10 shrink-0"
                        >
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </div>

              {/* The Live Pitch */}
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-[#06140c] p-3 shadow-inner">
                {/* Grass stripes background */}
                <div className="absolute inset-0 pitch-stripes opacity-70 pointer-events-none" />
                
                {/* Interactive Mini Pitch Component */}
                <MiniPitchFormation
                  formation={previewFormation}
                  startingMap={previewStartingMap}
                  squad={mockSquad}
                  onSlotClick={(pos) => {
                    setSelectedPlayerRole({
                      role: pos.role,
                      label: pos.label || pos.role,
                      duty: pos.role === 'GK' ? 'Sweeper Keeper - Rushes out to sweep through-balls & distributes fast' :
                            pos.role === 'DEF' ? 'Ball-Playing Defender - Steps out from backline to ping penetrative passes' :
                            pos.role === 'MID' ? 'Box-to-Box Engine - High stamina work-rate covering both 18-yard boxes' :
                            'Inverted Goalscorer - Drifts wide then cuts inside on strong foot',
                      keyStats: pos.role === 'GK' ? 'Reflexes 92 · Distribution 88' :
                                pos.role === 'DEF' ? 'Tackling 90 · Composure 86' :
                                pos.role === 'MID' ? 'Passing 91 · Stamina 94' :
                                'Finishing 92 · Pace 93',
                    });
                  }}
                  showPassingLanes={true}
                />

                {/* Live Animated Football during Attack Drill */}
                {drillRunning && (
                  <div 
                    className="absolute z-20 w-4 h-4 rounded-full bg-amber-300 border-2 border-white pitch-ball-glow shadow-lg transition-all duration-700 ease-in-out pointer-events-none"
                    style={{
                      left: drillStep === 1 ? '50%' : drillStep === 2 ? '35%' : drillStep === 3 ? '20%' : '50%',
                      top: drillStep === 1 ? '75%' : drillStep === 2 ? '50%' : drillStep === 3 ? '32%' : '14%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}

                {/* Broadcast Pitch Telemetry & Interactive Attack Drill Runner */}
                <div className="relative mt-3 pt-3 border-t border-white/10 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-300 bg-black/80 px-4 py-2.5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-bold">Shape: {previewFormation}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-rose-400 font-bold">ATT: {currentStats.att}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-blue-400 font-bold">DEF: {currentStats.def}</span>
                    </div>

                    {/* Interactive Attack Simulation Trigger */}
                    <button
                      type="button"
                      onClick={handleRunAttackDrill}
                      disabled={drillRunning}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-display font-extrabold uppercase text-xs shadow-md cursor-pointer hover:brightness-110 active:scale-95 transition-all"
                    >
                      <Play className={`w-3.5 h-3.5 ${drillRunning ? 'animate-spin' : 'fill-current'}`} />
                      <span>{drillRunning ? 'Executing Drill...' : 'Simulate Attack'}</span>
                    </button>
                  </div>

                  {/* Live Match Commentary Broadcast Strip */}
                  <div className="bg-[#020b05] border border-emerald-500/30 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2 text-slate-300 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                      <span className="text-slate-400 uppercase font-bold shrink-0">Matchday Engine:</span>
                      <span className="text-white font-medium truncate">{drillCommentary}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold shrink-0">60 FPS Physics</span>
                  </div>
                </div>

                {/* Selected Player Role Popup Inspector */}
                {selectedPlayerRole && (
                  <div className="mt-3 p-3 rounded-xl bg-black/95 border border-emerald-500/50 flex items-start justify-between gap-3 text-xs font-mono animate-in fade-in">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold font-display text-sm uppercase">{selectedPlayerRole.label} Position Duty:</span>
                        <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300 border border-emerald-500/30 font-bold">
                          {selectedPlayerRole.keyStats}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">
                        {selectedPlayerRole.duty}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPlayerRole(null)}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer px-1.5 py-0.5"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Tactical Advantage Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="stadium-card rounded-2xl p-4 text-center">
                <div className="font-display text-4xl font-black text-white tabular-nums leading-none">
                  30
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1 uppercase">
                  Global Servers
                </div>
              </div>
              <div className="stadium-card rounded-2xl p-4 text-center">
                <div className="font-display text-4xl font-black text-emerald-400 tabular-nums leading-none">
                  900
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1 uppercase">
                  Unique Clubs
                </div>
              </div>
              <div className="stadium-card rounded-2xl p-4 text-center">
                <div className="font-display text-4xl font-black text-amber-300 tabular-nums leading-none">
                  €100M
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1 uppercase">
                  Warchest Initial
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* NEW FEATURE: 30-SERVER MATCHDAY CLUSTER RADAR WITH ACID LIME ANIMATED LASER LIGHTING */}
      <section className="relative z-10 py-16 border-t border-white/10 bg-black/40" id="servers-cluster">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="laser-frame-lime">
            <div className="laser-beam-lime" />
            <div className="relative z-10 p-6 sm:p-8 rounded-[1.4rem] bg-[#061009] border border-lime-500/40 space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-lime-400 bg-lime-950/80 px-2.5 py-1 rounded border border-lime-500/40 mb-2">
                    <Radio className="w-3.5 h-3.5 text-lime-400" />
                    <span>30 Persistent Global Servers · Live Mutex Telemetry</span>
                  </div>
                  <h2 className="font-display text-4xl sm:text-5xl font-black uppercase text-white">
                    Global Server Infrastructure
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Distributed European, UK, American, and Asian nodes with sub-50ms tick rates and atomic club locking.
                  </p>
                </div>

                {/* Region Filters with Animated Laser Pill on Active Tab */}
                <div className="flex items-center gap-1.5 bg-black/70 p-1.5 rounded-xl border border-white/10 self-start md:self-auto overflow-x-auto">
                  {[
                    { id: 'all', label: 'All 30' },
                    { id: 'eu', label: 'Europe' },
                    { id: 'uk', label: 'UK' },
                    { id: 'americas', label: 'Americas' },
                    { id: 'apac', label: 'Asia' },
                  ].map((reg) => {
                    const isActive = activeServerRegion === reg.id;
                    if (isActive) {
                      return (
                        <div key={reg.id} className="laser-tab-pill laser-tab-pill-lime shrink-0">
                          <div className="laser-tab-beam" />
                          <button
                            type="button"
                            onClick={() => setActiveServerRegion(reg.id as any)}
                            className="relative z-10 px-3.5 py-1.5 text-xs font-mono font-black uppercase rounded-[0.75rem] transition-all cursor-pointer bg-gradient-to-r from-lime-400 to-emerald-400 text-black shadow-md"
                          >
                            {reg.label}
                          </button>
                        </div>
                      );
                    }
                    return (
                      <button
                        key={reg.id}
                        type="button"
                        onClick={() => setActiveServerRegion(reg.id as any)}
                        className="px-3 py-1.5 text-xs font-mono uppercase rounded-lg transition-all cursor-pointer text-slate-400 hover:text-white shrink-0"
                      >
                        {reg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredClusters.map((cluster, clIdx) => {
              const clColors = ['emerald', 'cyan', 'amber', 'lime'] as const;
              return (
                <AnimatedLighting
                  key={cluster.id}
                  color={clColors[clIdx % clColors.length]}
                  randomizeOnClick={true}
                  rounded="2xl"
                  className="h-full"
                >
                  <div className="bg-[#050c08]/95 rounded-[1.4rem] p-5 space-y-4 h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                          {cluster.id}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{cluster.ping}</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-display text-2xl font-black uppercase text-white">
                          {cluster.name}
                        </h3>
                        <div className="text-xs font-mono text-slate-400 mt-0.5">
                          {cluster.servers} Dedicated Match Servers
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Server Load:</span>
                          <span className="text-white font-bold">{cluster.load}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Available Clubs:</span>
                          <span className="text-emerald-400 font-bold">{cluster.availableClubs} Unclaimed</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Tick Status:</span>
                          <span className="text-teal-400 font-bold">60Hz Synchronized</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenAuth('register')}
                      className="btn-broadcast-secondary w-full text-xs py-2 cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                    >
                      <span>Select in {cluster.name}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </AnimatedLighting>
              );
            })}
          </div>
            </div>
          </div>
        </div>
      </section>

      {/* TACTICAL SCENARIO LAB */}
      <section className="relative z-10 py-16 border-t border-white/10 bg-black/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Interactive Match Engine Simulation</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-black uppercase text-white">
              Tactical Scenario Simulator
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Choose a strategic philosophy below to simulate match execution and see tactical probabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scenarios.map((scen) => {
              const laserConfig = 
                scen.id === 'gegenpress' ? { frame: 'laser-frame-crimson', beam: 'laser-beam-crimson', accent: 'text-rose-400' } :
                scen.id === 'possession' ? { frame: 'laser-frame-mint', beam: 'laser-beam-mint', accent: 'text-emerald-400' } :
                { frame: 'laser-frame-solar', beam: 'laser-beam-solar', accent: 'text-amber-400' };

              return (
                <div key={scen.id} className={`${laserConfig.frame} cursor-pointer transition-all`}>
                  <div className={laserConfig.beam} />
                  <div
                    onClick={() => handleSimulateScenario(scen.id as any)}
                    className="relative z-10 stadium-panel rounded-[1.4rem] p-6 border border-white/10 flex flex-col justify-between h-full hover:bg-black/60 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-2xl font-black uppercase text-white">
                          {scen.title}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded bg-black/60 border border-white/10 font-mono ${laserConfig.accent} font-bold`}>
                          {scen.formation}
                        </span>
                      </div>

                      <p className="text-xs font-mono text-slate-300 leading-relaxed">
                        {scen.description}
                      </p>

                      <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Tactical Advantage:</span>
                          <span className={`${laserConfig.accent} font-bold`}>{scen.benefit}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Match Execution:</span>
                          <span className="text-amber-300 font-bold">{scen.odds}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">
                        Intensity: <strong className="text-white">{scen.pace}</strong>
                      </span>
                      <div className="btn-broadcast-primary text-xs py-1.5 px-3 flex items-center gap-1">
                        <Play className="w-3 h-3 text-black fill-current" />
                        <span>Test Scenario</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Simulation Output Banner */}
          {(scenarioSimulating || scenarioResult) && (
            <div className="mt-6 p-4 rounded-2xl stadium-panel-glow border border-emerald-500/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  {scenarioSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="text-xs font-mono">
                  <span className="text-slate-400 uppercase font-bold">Simulation Output: </span>
                  <span className="text-white font-bold">{scenarioSimulating ? 'Executing tactical pass matrix...' : scenarioResult}</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 hidden sm:inline">Engine: Manager Nol Physics 2026</span>
            </div>
          )}
        </div>
      </section>

      {/* FEATURED CLUBS SPOTLIGHT SHOWCASE WITH NEON VIOLET ANIMATED LASER LIGHTING */}
      <section className="relative z-10 py-16 border-t border-white/10 bg-black/40" id="featured-clubs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="laser-frame-purple">
            <div className="laser-beam-purple" />
            <div className="relative z-10 p-6 sm:p-8 rounded-[1.4rem] bg-[#0c0714] border border-purple-500/40 space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded border border-purple-500/40 mb-2">
                    <Building2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Club Ownership Showcase</span>
                  </div>
                  <h2 className="font-display text-4xl sm:text-5xl font-black uppercase text-white">
                    Featured Clubs Awaiting Managers
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Preview elite clubs available across servers with full €100,000,000 budgets.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAuth('register')}
                    className="btn-broadcast-gold text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Browse All 900 Clubs</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredClubs.map((club, cIdx) => {
                  const colors = ['violet', 'cyan', 'emerald', 'electric-blue'] as const;
                  return (
                    <AnimatedLighting
                      key={club.code}
                      color={colors[cIdx % colors.length]}
                      randomizeOnClick={true}
                      rounded="2xl"
                      className="h-full"
                    >
                      <div className="rounded-[1.2rem] p-5 flex flex-col justify-between group bg-[#0a0612]/95 h-full">
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <ClubLogo
                              club={{
                                id: club.code,
                                name: club.name,
                                shortCode: club.code,
                                primaryColor: club.colors.primary,
                                secondaryColor: club.colors.secondary,
                                foundedYear: club.founded,
                              }}
                              size={52}
                            />

                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                              €100M Grant
                            </span>
                          </div>

                          <h3 className="font-display text-2xl font-black uppercase text-white group-hover:text-purple-300 transition-colors">
                            {club.name}
                          </h3>

                          <div className="text-xs font-mono text-slate-400 mt-1">
                            {club.city} · {club.server}
                          </div>

                          <div className="mt-3.5 p-3 rounded-xl bg-black/80 border border-white/10 space-y-1.5 text-xs font-mono">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Ground:</span>
                              <span className="text-white font-bold truncate max-w-[120px]">{club.stadium}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Capacity:</span>
                              <span className="text-emerald-400 font-bold">{club.capacity}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Reputation:</span>
                              <span className="text-slate-300 text-[11px] truncate">{club.reputation}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-2">
                          <button
                            onClick={() => onOpenAuth('register')}
                            className="btn-broadcast-primary w-full py-2 text-xs cursor-pointer"
                          >
                            Claim This Club
                          </button>
                        </div>
                      </div>
                    </AnimatedLighting>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 PILLARS OF CLUB OWNERSHIP WITH GOLDEN VAULT ANIMATED LASER LIGHTING */}
      <section className="relative z-10 py-16 border-t border-white/10 bg-black/50" id="ownership-pillars">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="laser-frame-gold-vault">
            <div className="laser-beam-gold-vault" />
            <div className="relative z-10 p-6 sm:p-8 rounded-[1.4rem] bg-[#140f06] border border-amber-500/40 space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-2 font-bold">
                  Competitive Engine
                </div>
                <h2 className="font-display text-4xl sm:text-5xl font-black uppercase text-white">
                  Professional Club Ownership Pillars
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  Every system is engineered to provide deep managerial autonomy and authentic tactical decision-making.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="stadium-panel rounded-2xl p-6 space-y-3.5 bg-black/70 border border-amber-500/20">
                  <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
                    <SlidersHorizontal className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-2xl font-bold uppercase text-white">
                    Team Work-Rate Engine
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Control squad pressing intensity with three calibrated modes: Balanced (~14% decay), High Press (~22% decay), or Heavy Metal (~32% decay).
                  </p>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Stamina Physics</span>
                    <span className="text-emerald-400 font-bold">Real-time Decay</span>
                  </div>
                </div>

                <div className="stadium-panel rounded-2xl p-6 space-y-3.5 bg-black/70 border border-amber-500/20">
                  <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-2xl font-bold uppercase text-white">
                    15 Tactical Blueprints
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Seamlessly swap formations from classical 4-4-2 flat to modern 4-2-3-1 Gegenpress and 3-5-2 wing-back overloads with real-time coordinate math.
                  </p>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Formations Available</span>
                    <span className="text-emerald-400 font-bold">15 Master Shapes</span>
                  </div>
                </div>

                <div className="stadium-panel rounded-2xl p-6 space-y-3.5 bg-black/70 border border-amber-500/20">
                  <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-2xl font-bold uppercase text-white">
                    30 Dedicated Match Servers
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Distributed European, American, and Asian game servers. Each server hosts exactly 30 unique clubs with live latency meters and atomic locking.
                  </p>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Total Managed Clubs</span>
                    <span className="text-emerald-400 font-bold">900 Worldwide</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pro Broadcast Footer */}
      <footer className="relative z-10 py-10 border-t border-white/10 bg-[#020503]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2.5 text-slate-400">
            <span className="font-display font-black text-base text-white tracking-wider">MANAGER NOL</span>
            <span>·</span>
            <span>Pro Football Simulation</span>
            <span>·</span>
            <span>Season 2026</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onOpenAuth('login')}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="text-emerald-400 hover:text-emerald-300 transition-colors font-bold cursor-pointer"
            >
              Get License
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
