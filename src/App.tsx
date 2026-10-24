import React, { useState, useEffect } from 'react';
import { api, getStoredToken } from './api.ts';
import { User, ServerItem, ClubItem, ViewState } from './types.ts';
import { LandingPage } from './components/LandingPage.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ServerSelection } from './components/ServerSelection.tsx';
import { ClubSelection } from './components/ClubSelection.tsx';
import { ManagerDashboard } from './components/ManagerDashboard.tsx';
import { Loader2 } from 'lucide-react';
import { AnimatedLighting } from './components/AnimatedLighting.tsx';
import { ManagerNolLogo } from './components/ManagerNolLogo.tsx';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeClub, setActiveClub] = useState<ClubItem | null>(null);
  const [activeServer, setActiveServer] = useState<ServerItem | null>(null);

  // Navigation state
  const [viewState, setViewState] = useState<ViewState>('landing');
  
  // Data lists
  const [servers, setServers] = useState<ServerItem[]>([]);
  const [selectedServer, setSelectedServer] = useState<ServerItem | null>(null);
  const [serverClubs, setServerClubs] = useState<ClubItem[]>([]);
  const [clubsLoading, setClubsLoading] = useState(false);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  // 1. Initial Load: Check session and load 30 servers
  useEffect(() => {
    async function init() {
      try {
        // Load servers
        const srvRes = await api.getServers().catch(() => null);
        if (srvRes && srvRes.servers) {
          setServers(srvRes.servers);
        }

        // Check active session
        const token = getStoredToken();
        if (token) {
          const authRes = await api.getMe().catch(() => null);
          if (authRes && authRes.user) {
            setUser(authRes.user);
            setActiveClub(authRes.activeClub);
            setActiveServer(authRes.activeServer);

            if (authRes.activeClub && authRes.activeServer) {
              setSelectedServer(authRes.activeServer);
              setViewState('dashboard');
            } else {
              setViewState('servers');
            }
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  // Handle successful login or registration
  const handleAuthSuccess = (data: {
    user: User;
    activeClub: ClubItem | null;
    activeServer: ServerItem | null;
  }) => {
    setUser(data.user);
    setActiveClub(data.activeClub);
    setActiveServer(data.activeServer);

    // Refresh server list to get updated claim counts
    api.getServers().then((res) => {
      if (res && res.servers) setServers(res.servers);
    }).catch(() => {});

    if (data.activeClub && data.activeServer) {
      setSelectedServer(data.activeServer);
      setViewState('dashboard');
    } else {
      setViewState('servers');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setActiveClub(null);
    setActiveServer(null);
    setSelectedServer(null);
    setServerClubs([]);
    setViewState('landing');
  };

  // Step 4: Handle Server Selection
  const handleSelectServer = async (server: ServerItem) => {
    setSelectedServer(server);
    setClubsLoading(true);
    setViewState('clubs');

    try {
      const res = await api.getServerClubs(server.id);
      setServerClubs(res.clubs);
    } catch (err) {
      console.error('Failed to load server clubs:', err);
    } finally {
      setClubsLoading(false);
    }
  };

  // Step 6-8: Handle Club Claiming (Atomic & €100,000,000 initialization)
  const handleClaimClub = async (club: ClubItem) => {
    if (!user || !selectedServer) return;

    // Call backend claim endpoint
    const res = await api.claimClub(selectedServer.id, club.id);
    
    // Update local states with confirmed club & warchest
    setActiveClub(res.club);
    setActiveServer(res.server);
    setUser((prev) => (prev ? { ...prev, activeClubId: res.club.id, activeServerId: res.server.id } : null));

    // Update clubs list
    setServerClubs((prev) =>
      prev.map((c) => (c.id === res.club.id ? res.club : c))
    );

    // Enter Dashboard
    setViewState('dashboard');
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070c09] text-emerald-400 flex flex-col items-center justify-center p-4">
        <div className="mb-4">
          <ManagerNolLogo size={72} rounded="2xl" withLighting lightingColor="amber" />
        </div>
        <div className="flex items-center gap-2 mb-1">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
          <span className="font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase text-white tracking-wider">
            MANAGER NOL
          </span>
        </div>
        <p className="text-xs font-mono text-slate-400 mt-1">
          Loading 30 Dedicated Servers & Tactical Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040806] text-slate-100 flex flex-col font-sans">
      {/* 1. Landing Page View (The Opening Screen) */}
      {viewState === 'landing' && (
        <LandingPage
          onOpenAuth={(mode) => {
            setAuthInitialMode(mode);
            setAuthModalOpen(true);
          }}
          serverCount={servers.length || 30}
          onAuthSuccess={handleAuthSuccess}
          currentUser={user}
          activeClub={activeClub}
          onGoToDashboard={() => {
            if (activeClub && activeServer) {
              setViewState('dashboard');
            } else {
              setViewState('servers');
            }
          }}
        />
      )}

      {/* 2. 30 Servers Selection View */}
      {viewState === 'servers' && user && (
        <ServerSelection
          servers={servers}
          user={user}
          onSelectServer={handleSelectServer}
          onLogout={handleLogout}
          activeServerId={activeServer?.id}
          onViewLanding={() => setViewState('landing')}
        />
      )}

      {/* 3. Server's 30 Clubs Selection View */}
      {viewState === 'clubs' && user && selectedServer && (
        clubsLoading ? (
          <div className="min-h-screen bg-[#070c09] flex flex-col items-center justify-center p-4">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
            <div className="text-lg font-bold font-display uppercase text-white">
              Connecting to {selectedServer.name} ({selectedServer.code})...
            </div>
            <p className="text-xs font-mono text-slate-400">Loading 30 Registered Clubs</p>
          </div>
        ) : (
          <ClubSelection
            server={selectedServer}
            clubs={serverClubs}
            user={user}
            onBackToServers={() => setViewState('servers')}
            onClaimClub={handleClaimClub}
            onLogout={handleLogout}
            activeClubId={activeClub?.id}
          />
        )
      )}

      {/* 4. Manager Dashboard View */}
      {viewState === 'dashboard' && user && activeClub && activeServer && (
        <ManagerDashboard
          user={user}
          club={activeClub}
          server={activeServer}
          onLogout={handleLogout}
          onChangeServer={() => {
            setViewState('servers');
          }}
          onViewLanding={() => setViewState('landing')}
          onClubUpdated={(newClub) => {
            setActiveClub(newClub);
          }}
          onResignSuccess={() => {
            setActiveClub(null);
            setUser((prev) => (prev ? { ...prev, activeClubId: null, activeServerId: null } : null));
            setViewState('servers');
            api.getServers().then((res) => {
              if (res && res.servers) setServers(res.servers);
            }).catch(() => {});
          }}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authInitialMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
