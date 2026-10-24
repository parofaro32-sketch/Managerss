import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Loader2, 
  X, 
  AlertCircle, 
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { api } from '../api.ts';
import { User, ClubItem, ServerItem } from '../types.ts';
import { AnimatedLighting } from './AnimatedLighting.tsx';
import { AnimatedStadiumBackground } from './AnimatedStadiumBackground.tsx';
import { ManagerNolLogo } from './ManagerNolLogo.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onAuthSuccess: (data: { user: User; activeClub: ClubItem | null; activeServer: ServerItem | null }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'login') {
      if (!username.trim() || !password) {
        setError('Please enter your username and password.');
        return;
      }
    } else {
      if (!username.trim() || username.length < 3) {
        setError('Manager username must be at least 3 characters long.');
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await api.login(username.trim(), password);
        setSuccessMsg('Authentication confirmed. Welcome, Manager!');
        setTimeout(() => {
          onAuthSuccess({
            user: res.user,
            activeClub: res.activeClub,
            activeServer: res.activeServer,
          });
          onClose();
        }, 350);
      } else {
        const res = await api.register(username.trim(), password);
        setSuccessMsg('Manager License approved! Accessing 30 server cluster...');
        setTimeout(() => {
          onAuthSuccess({
            user: res.user,
            activeClub: null,
            activeServer: null,
          });
          onClose();
        }, 350);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
      {/* Shared animated stadium background */}
      <AnimatedStadiumBackground opacityBoost={false} />

      <div className="relative w-full max-w-md my-auto">
        <AnimatedLighting
          color="random"
          randomizeOnSelect={true}
          active={true}
          borderWidth={2.5}
          rounded="3xl"
          glowIntensity="high"
          className="w-full shadow-2xl"
        >
          <div 
            className="relative w-full stadium-panel-glow p-6 sm:p-8 text-slate-100"
            role="dialog"
            aria-modal="true"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Branding */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3.5">
                <ManagerNolLogo size={48} rounded="xl" withLighting lightingColor="amber" />
                <div>
                  <h3 className="font-title text-2xl sm:text-3xl font-black uppercase tracking-wide text-white leading-none text-animated-gold">
                    {mode === 'login' ? 'Manager Sign In' : 'Manager License'}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    Official League Access Terminal
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (mode === 'login') {
                    setUsername('gaffer_champion');
                    setPassword('Manager2026!');
                  } else {
                    const rnd = Math.floor(100 + Math.random() * 900);
                    setUsername(`Coach_${rnd}`);
                    setPassword('Manager2026!');
                    setConfirmPassword('Manager2026!');
                  }
                  setError(null);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all cursor-pointer"
                title="Auto-fill sample credentials for instant testing"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Quick Demo</span>
              </button>
            </div>

            {/* Tab Selector with Animated Lighting on Active Tab */}
            <div className="grid grid-cols-2 p-1.5 bg-black/80 rounded-2xl border border-white/15 mb-6 gap-1.5">
              {mode === 'login' ? (
                <AnimatedLighting color="emerald" borderWidth={2} rounded="xl" speed={2.5}>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className="w-full py-2.5 text-xs font-display font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-md"
                  >
                    Manager Sign In
                  </button>
                </AnimatedLighting>
              ) : (
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="py-2.5 text-xs font-display font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-slate-400 hover:text-white"
                >
                  Manager Sign In
                </button>
              )}

              {mode === 'register' ? (
                <AnimatedLighting color="amber" borderWidth={2} rounded="xl" speed={2.5}>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(null); }}
                    className="w-full py-2.5 text-xs font-display font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-md"
                  >
                    New License
                  </button>
                </AnimatedLighting>
              ) : (
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className="py-2.5 text-xs font-display font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-slate-400 hover:text-white"
                >
                  New License
                </button>
              )}
            </div>

            {/* Feedback messages */}
            {error && (
              <AnimatedLighting color="rose" borderWidth={1.5} rounded="xl" className="mb-4">
                <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              </AnimatedLighting>
            )}

            {successMsg && (
              <AnimatedLighting color="emerald" borderWidth={1.5} rounded="xl" className="mb-4">
                <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              </AnimatedLighting>
            )}

            {/* Auth Form - Requires ONLY Username and Password! */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-mono">
                  Manager Username
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. AlexFerguson or PepGuardiola"
                    className="stadium-input w-full pl-10 pr-4 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-mono">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="stadium-input w-full pl-10 pr-10 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-mono">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="stadium-input w-full pl-10 pr-4 text-sm"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <AnimatedLighting color={mode === 'login' ? 'emerald' : 'amber'} borderWidth={2} rounded="xl" speed={2.8}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-broadcast-primary w-full py-3 text-base flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>{mode === 'login' ? 'Confirm Credentials & Enter' : 'Issue License & Join'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </AnimatedLighting>
              </div>
            </form>

            <div className="mt-5 text-center text-xs font-mono text-slate-400">
              Strict €100,000,000 Starting Warchest Allocated Automatically
            </div>
          </div>
        </AnimatedLighting>
      </div>
    </div>
  );
};
