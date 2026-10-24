import React, { useState, useEffect, useMemo } from 'react';

export type LightingColorName =
  | 'emerald'
  | 'electric-blue'
  | 'violet'
  | 'cyan'
  | 'magenta'
  | 'amber'
  | 'lime'
  | 'rose'
  | 'orange'
  | 'solar'
  | 'mint'
  | 'crimson'
  | 'azure'
  | 'purple'
  | 'random';

export interface LightingPaletteEntry {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  shadow: string;
}

export const LIGHTING_PALETTES: Record<string, LightingPaletteEntry> = {
  emerald: {
    name: 'Emerald Green',
    primary: '#10b981',
    secondary: '#34d399',
    accent: '#6ee7b7',
    glow: 'rgba(16, 185, 129, 0.45)',
    shadow: '0 0 24px -2px rgba(16, 185, 129, 0.35)',
  },
  'electric-blue': {
    name: 'Electric Blue',
    primary: '#2563eb',
    secondary: '#60a5fa',
    accent: '#93c5fd',
    glow: 'rgba(37, 99, 235, 0.45)',
    shadow: '0 0 24px -2px rgba(37, 99, 235, 0.35)',
  },
  violet: {
    name: 'Neon Violet',
    primary: '#8b5cf6',
    secondary: '#c084fc',
    accent: '#e9d5ff',
    glow: 'rgba(139, 92, 246, 0.45)',
    shadow: '0 0 24px -2px rgba(139, 92, 246, 0.35)',
  },
  cyan: {
    name: 'Electric Cyan',
    primary: '#06b6d4',
    secondary: '#22d3ee',
    accent: '#a5f3fc',
    glow: 'rgba(6, 182, 212, 0.45)',
    shadow: '0 0 24px -2px rgba(6, 182, 212, 0.35)',
  },
  magenta: {
    name: 'Neon Magenta',
    primary: '#d946ef',
    secondary: '#f0abfc',
    accent: '#fae8ff',
    glow: 'rgba(217, 70, 239, 0.45)',
    shadow: '0 0 24px -2px rgba(217, 70, 239, 0.35)',
  },
  amber: {
    name: 'Golden Amber',
    primary: '#f59e0b',
    secondary: '#fbbf24',
    accent: '#fef08a',
    glow: 'rgba(245, 158, 11, 0.45)',
    shadow: '0 0 24px -2px rgba(245, 158, 11, 0.35)',
  },
  lime: {
    name: 'Acid Lime',
    primary: '#84cc16',
    secondary: '#a3e635',
    accent: '#d9f99d',
    glow: 'rgba(132, 204, 22, 0.45)',
    shadow: '0 0 24px -2px rgba(132, 204, 22, 0.35)',
  },
  rose: {
    name: 'Crimson Rose',
    primary: '#f43f5e',
    secondary: '#fb7185',
    accent: '#fecdd3',
    glow: 'rgba(244, 63, 94, 0.45)',
    shadow: '0 0 24px -2px rgba(244, 63, 94, 0.35)',
  },
  orange: {
    name: 'Sunset Orange',
    primary: '#f97316',
    secondary: '#fb923c',
    accent: '#fed7aa',
    glow: 'rgba(249, 115, 22, 0.45)',
    shadow: '0 0 24px -2px rgba(249, 115, 22, 0.35)',
  },
  solar: {
    name: 'Solar Yellow',
    primary: '#eab308',
    secondary: '#facc15',
    accent: '#fef08a',
    glow: 'rgba(234, 179, 8, 0.45)',
    shadow: '0 0 24px -2px rgba(234, 179, 8, 0.35)',
  },
  mint: {
    name: 'Mint Teal',
    primary: '#14b8a6',
    secondary: '#2dd4bf',
    accent: '#99f6e4',
    glow: 'rgba(20, 184, 166, 0.45)',
    shadow: '0 0 24px -2px rgba(20, 184, 166, 0.35)',
  },
  purple: {
    name: 'Royal Purple',
    primary: '#7c3aed',
    secondary: '#a78bfa',
    accent: '#ddd6fe',
    glow: 'rgba(124, 58, 237, 0.45)',
    shadow: '0 0 24px -2px rgba(124, 58, 237, 0.35)',
  },
  azure: {
    name: 'Sky Azure',
    primary: '#0284c7',
    secondary: '#38bdf8',
    accent: '#bae6fd',
    glow: 'rgba(2, 132, 199, 0.45)',
    shadow: '0 0 24px -2px rgba(2, 132, 199, 0.35)',
  },
  crimson: {
    name: 'Deep Crimson',
    primary: '#e11d48',
    secondary: '#f43f5e',
    accent: '#fda4af',
    glow: 'rgba(225, 29, 72, 0.45)',
    shadow: '0 0 24px -2px rgba(225, 29, 72, 0.35)',
  },
};

const PALETTE_KEYS = Object.keys(LIGHTING_PALETTES);

export function getRandomLightingColor(exclude?: string): string {
  const available = exclude ? PALETTE_KEYS.filter((k) => k !== exclude) : PALETTE_KEYS;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

interface AnimatedLightingProps {
  children?: React.ReactNode;
  color?: LightingColorName;
  active?: boolean;
  borderWidth?: number;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  speed?: number; // In seconds
  className?: string;
  innerClassName?: string;
  onClick?: (e: React.MouseEvent) => void;
  randomizeOnClick?: boolean;
  randomizeOnSelect?: boolean;
  seedId?: string; // If provided, maps deterministically to a color unless randomized
  glowIntensity?: 'subtle' | 'standard' | 'high';
}

export const AnimatedLighting: React.FC<AnimatedLightingProps> = ({
  children,
  color = 'random',
  active = true,
  borderWidth = 2,
  rounded = '2xl',
  speed = 3.6,
  className = '',
  innerClassName = '',
  onClick,
  randomizeOnClick = false,
  randomizeOnSelect = false,
  seedId,
  glowIntensity = 'standard',
}) => {
  // Determine initial color
  const initialColor = useMemo(() => {
    if (color && color !== 'random') return color;
    if (seedId) {
      let hash = 0;
      for (let i = 0; i < seedId.length; i++) {
        hash = (hash << 5) - hash + seedId.charCodeAt(i);
        hash |= 0;
      }
      return PALETTE_KEYS[Math.abs(hash) % PALETTE_KEYS.length];
    }
    return getRandomLightingColor();
  }, [color, seedId]);

  const [currentColor, setCurrentColor] = useState<string>(initialColor);

  // If color prop changes explicitly, update
  useEffect(() => {
    if (color && color !== 'random') {
      setCurrentColor(color);
    }
  }, [color]);

  // When active changes to true and randomizeOnSelect is true, pick a fresh color
  useEffect(() => {
    if (active && randomizeOnSelect) {
      setCurrentColor(getRandomLightingColor(currentColor));
    }
  }, [active, randomizeOnSelect]);

  const handleClick = (e: React.MouseEvent) => {
    if (randomizeOnClick) {
      setCurrentColor(getRandomLightingColor(currentColor));
    }
    if (onClick) {
      onClick(e);
    }
  };

  const palette = LIGHTING_PALETTES[currentColor] || LIGHTING_PALETTES.emerald;

  const roundedClass = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  }[rounded];

  const innerRoundedClass = {
    sm: 'rounded-[calc(0.125rem-1px)]',
    md: 'rounded-[calc(0.375rem-1.5px)]',
    lg: 'rounded-[calc(0.5rem-2px)]',
    xl: 'rounded-[calc(0.75rem-2px)]',
    '2xl': 'rounded-[calc(1rem-2.5px)]',
    '3xl': 'rounded-[calc(1.5rem-3px)]',
    full: 'rounded-full',
  }[rounded];

  if (!active) {
    return (
      <div onClick={handleClick} className={`relative ${className}`}>
        {children}
      </div>
    );
  }

  // Pure GPU CSS animation via Conic Gradient
  const conicGradient = `conic-gradient(from 0deg, transparent 0deg, transparent 75deg, ${palette.glow} 95deg, ${palette.primary} 115deg, #ffffff 125deg, ${palette.secondary} 135deg, ${palette.accent} 145deg, transparent 165deg, transparent 255deg, ${palette.glow} 275deg, ${palette.primary} 295deg, #ffffff 305deg, ${palette.secondary} 315deg, transparent 335deg, transparent 360deg)`;

  return (
    <div
      onClick={handleClick}
      className={`relative overflow-hidden ${roundedClass} transition-shadow duration-300 ${className}`}
      style={{
        padding: `${borderWidth}px`,
        boxShadow:
          glowIntensity === 'high'
            ? `0 0 32px -2px ${palette.glow}, ${palette.shadow}`
            : glowIntensity === 'subtle'
            ? `0 0 14px -2px ${palette.glow}`
            : palette.shadow,
      }}
    >
      {/* Smoothly revolving beam of light around perimeter */}
      <div
        className="absolute inset-[-180%] pointer-events-none will-change-transform"
        style={{
          background: conicGradient,
          animation: `laserSpin ${speed}s linear infinite`,
        }}
      />

      {/* Inner Content Container - avoid clipping descenders or nested elements */}
      <div
        className={`relative z-10 w-full h-full ${innerRoundedClass} ${innerClassName}`}
      >
        {children}
      </div>
    </div>
  );
};
