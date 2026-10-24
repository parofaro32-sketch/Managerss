import React, { useState } from 'react';
import stadiumNightImg from '../assets/images/stadium_night_floodlights_1792753840155.jpg';

interface AnimatedStadiumBackgroundProps {
  opacityBoost?: boolean;
}

export const AnimatedStadiumBackground: React.FC<AnimatedStadiumBackgroundProps> = ({
  opacityBoost = true,
}) => {
  const [bgSrc, setBgSrc] = useState<string>(stadiumNightImg);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Stadium Night Floodlights Photo Backdrop */}
      <img
        src={bgSrc}
        onError={() => {
          if (bgSrc !== '/assets/images/stadium_night_floodlights_1792753840155.jpg') {
            setBgSrc('/assets/images/stadium_night_floodlights_1792753840155.jpg');
          }
        }}
        alt="Stadium Atmosphere"
        className="w-full h-full object-cover object-center opacity-30 mix-blend-screen scale-105 filter contrast-125 brightness-90"
        referrerPolicy="no-referrer"
      />

      {/* Atmospheric Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030705]/85 via-[#030705]/70 to-[#030705]" />

      {/* Sweeping Dynamic Ambient Floodlights */}
      <div className="absolute -top-48 left-1/4 w-[850px] h-[650px] bg-emerald-500/20 blur-[170px] rounded-full animate-stadium-lights" />
      <div className="absolute top-1/3 -right-36 w-[700px] h-[700px] bg-teal-500/18 blur-[180px] rounded-full" />
      <div className="absolute -bottom-40 left-1/3 w-[800px] h-[600px] bg-amber-500/15 blur-[190px] rounded-full" />

      {/* Tactical Dot Matrix Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-25" />

      {/* =====================================================================
          HIGH-SPEED HIGH-VISIBILITY DYNAMIC MARQUEE TEXT BACKGROUND
          ===================================================================== */}
      <div className={`absolute inset-0 overflow-hidden flex flex-col justify-around py-12 pointer-events-none ${
        opacityBoost ? 'opacity-40' : 'opacity-30'
      }`}>
        {/* Stream 1: Diagonal Top Stream moving left (Way Faster - 12s) */}
        <div className="transform -rotate-3 -translate-y-4 scale-110">
          <div className="animate-marquee-left flex items-center gap-10 whitespace-nowrap text-5xl sm:text-6xl md:text-8xl font-display font-black uppercase tracking-wider">
            <span className="stroke-text-emerald">MANAGER NOL</span>
            <span className="text-emerald-400 font-extrabold drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">✦</span>
            <span className="text-emerald-300 font-black drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]">SEASON 2026</span>
            <span className="text-amber-400 font-extrabold drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">✦</span>
            <span className="stroke-text-gold">TACTICAL MATCH ENGINE</span>
            <span className="text-emerald-400 font-extrabold drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">✦</span>
            <span className="text-white font-black drop-shadow-[0_0_16px_rgba(255,255,255,0.7)]">900 CLUBS WORLDWIDE</span>
            <span className="text-amber-400 font-extrabold drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">✦</span>
            <span className="stroke-text-emerald">€100,000,000 WARCHEST</span>
            <span className="text-emerald-400 font-extrabold drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">✦</span>
            <span className="stroke-text-white">MANAGER NOL</span>
            <span className="text-cyan-400 font-extrabold drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">✦</span>
            <span className="stroke-text-cyan">30 DEDICATED SERVERS</span>
            <span className="text-emerald-400 font-extrabold drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">✦</span>
            {/* Repeat for seamless infinite scroll */}
            <span className="stroke-text-emerald">MANAGER NOL</span>
            <span className="text-emerald-400 font-extrabold drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">✦</span>
            <span className="text-emerald-300 font-black drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]">SEASON 2026</span>
            <span className="text-amber-400 font-extrabold drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">✦</span>
            <span className="stroke-text-gold">TACTICAL MATCH ENGINE</span>
            <span className="text-emerald-400 font-extrabold drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">✦</span>
            <span className="text-white font-black drop-shadow-[0_0_16px_rgba(255,255,255,0.7)]">900 CLUBS WORLDWIDE</span>
            <span className="text-amber-400 font-extrabold drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">✦</span>
            <span className="stroke-text-emerald">€100,000,000 WARCHEST</span>
            <span className="text-emerald-400 font-extrabold drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">✦</span>
            <span className="stroke-text-white">MANAGER NOL</span>
          </div>
        </div>

        {/* Stream 2: Diagonal Middle Stream moving in reverse (Way Faster - 11s) */}
        <div className="transform rotate-3 translate-y-8 scale-110">
          <div className="animate-marquee-right flex items-center gap-10 whitespace-nowrap text-4xl sm:text-5xl md:text-7xl font-display font-black uppercase tracking-wide">
            <span className="stroke-text-gold">MANAGER NOL FOOTBALL</span>
            <span className="text-amber-400 font-bold drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">★</span>
            <span className="text-amber-300 font-extrabold drop-shadow-[0_0_16px_rgba(251,191,36,0.7)]">30 GLOBAL SERVERS</span>
            <span className="text-emerald-400 font-bold drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">★</span>
            <span className="stroke-text-cyan">REALISTIC STAMINA PHYSICS</span>
            <span className="text-amber-400 font-bold drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">★</span>
            <span className="text-white font-black drop-shadow-[0_0_16px_rgba(255,255,255,0.7)]">15 TACTICAL FORMATIONS</span>
            <span className="text-purple-400 font-bold drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]">★</span>
            <span className="stroke-text-purple">MANAGER NOL DUG-OUT</span>
            <span className="text-amber-400 font-bold drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">★</span>
            <span className="text-emerald-300 font-extrabold drop-shadow-[0_0_16px_rgba(52,211,153,0.7)]">CLAIM YOUR CLUB</span>
            <span className="text-emerald-400 font-bold drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">★</span>
            {/* Repeat for seamless infinite scroll */}
            <span className="stroke-text-gold">MANAGER NOL FOOTBALL</span>
            <span className="text-amber-400 font-bold drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">★</span>
            <span className="text-amber-300 font-extrabold drop-shadow-[0_0_16px_rgba(251,191,36,0.7)]">30 GLOBAL SERVERS</span>
            <span className="text-emerald-400 font-bold drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">★</span>
            <span className="stroke-text-cyan">REALISTIC STAMINA PHYSICS</span>
            <span className="text-amber-400 font-bold drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">★</span>
            <span className="text-white font-black drop-shadow-[0_0_16px_rgba(255,255,255,0.7)]">15 TACTICAL FORMATIONS</span>
            <span className="text-purple-400 font-bold drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]">★</span>
            <span className="stroke-text-purple">MANAGER NOL DUG-OUT</span>
          </div>
        </div>

        {/* Stream 3: Diagonal Lower Stream moving blitz (Way Faster - 8.5s) */}
        <div className="transform -rotate-2 translate-y-24 scale-110">
          <div className="animate-marquee-fast flex items-center gap-10 whitespace-nowrap text-4xl sm:text-6xl md:text-8xl font-display font-black uppercase tracking-widest">
            <span className="text-cyan-300 font-black drop-shadow-[0_0_20px_rgba(6,182,212,0.7)]">MANAGER NOL</span>
            <span className="text-cyan-400 font-bold drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">◆</span>
            <span className="stroke-text-cyan">EUROPE · UK · AMERICAS · APAC</span>
            <span className="text-amber-400 font-bold drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">◆</span>
            <span className="text-emerald-300 font-black drop-shadow-[0_0_20px_rgba(52,211,153,0.7)]">ZERO PAY TO WIN</span>
            <span className="text-emerald-400 font-bold drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">◆</span>
            <span className="stroke-text-gold">22-PLAYER SQUAD ROSTERS</span>
            <span className="text-amber-400 font-bold drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">◆</span>
            <span className="stroke-text-white">PRO FOOTBALL SIMULATOR</span>
            <span className="text-purple-400 font-bold drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]">◆</span>
            {/* Repeat for seamless infinite scroll */}
            <span className="text-cyan-300 font-black drop-shadow-[0_0_20px_rgba(6,182,212,0.7)]">MANAGER NOL</span>
            <span className="text-cyan-400 font-bold drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">◆</span>
            <span className="stroke-text-cyan">EUROPE · UK · AMERICAS · APAC</span>
            <span className="text-amber-400 font-bold drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">◆</span>
            <span className="text-emerald-300 font-black drop-shadow-[0_0_20px_rgba(52,211,153,0.7)]">ZERO PAY TO WIN</span>
            <span className="text-emerald-400 font-bold drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">◆</span>
            <span className="stroke-text-gold">22-PLAYER SQUAD ROSTERS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
