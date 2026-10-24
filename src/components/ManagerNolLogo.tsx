import React, { useState } from 'react';
import managerShieldImg from '../assets/images/pro_manager_shield_gold_1792753855102.jpg';
import { AnimatedLighting } from './AnimatedLighting.tsx';

interface ManagerNolLogoProps {
  size?: number | string;
  className?: string;
  withLighting?: boolean;
  lightingColor?: 'amber' | 'emerald' | 'solar';
  rounded?: 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const ManagerNolLogo: React.FC<ManagerNolLogoProps> = ({
  size = 44,
  className = '',
  withLighting = false,
  lightingColor = 'amber',
  rounded = 'xl',
}) => {
  const FALLBACK_SOURCES: string[] = [
    managerShieldImg,
    '/manager-nol-logo.jpg',
    '/assets/images/pro_manager_shield_gold_1792753855102.jpg',
  ].filter(Boolean);

  const [srcIndex, setSrcIndex] = useState<number>(0);
  const [failed, setFailed] = useState<boolean>(false);

  const roundedClasses = {
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  }[rounded];

  const dim = typeof size === 'number' ? `${size}px` : size;

  const handleImgError = () => {
    if (srcIndex < FALLBACK_SOURCES.length - 1) {
      setSrcIndex((prev) => prev + 1);
    } else {
      setFailed(true);
    }
  };

  const currentSrc = FALLBACK_SOURCES[srcIndex] || '/manager-nol-logo.jpg';

  const logoElement = (
    <div
      className={`overflow-hidden bg-black shrink-0 relative flex items-center justify-center border border-amber-500/40 shadow-inner ${roundedClasses} ${className}`}
      style={{
        width: dim,
        height: dim,
        minWidth: dim,
        minHeight: dim,
      }}
    >
      {!failed ? (
        <img
          src={currentSrc}
          alt="Manager Nol Logo"
          onError={handleImgError}
          className="w-full h-full object-cover block select-none pointer-events-none"
          loading="eager"
          decoding="sync"
          referrerPolicy="no-referrer"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        /* Guaranteed vector fallback replicating the gold champions crest */
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fef08a" />
              <stop offset="0.4" stopColor="#f59e0b" />
              <stop offset="0.8" stopColor="#d97706" />
              <stop offset="1" stopColor="#92400e" />
            </linearGradient>
            <linearGradient id="emeraldShield" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#047857" />
              <stop offset="0.6" stopColor="#064e3b" />
              <stop offset="1" stopColor="#022c22" />
            </linearGradient>
          </defs>
          {/* Shield Outline */}
          <path
            d="M50 8 C68 8 82 12 86 28 C86 58 66 78 50 92 C34 78 14 58 14 28 C18 12 32 8 50 8 Z"
            fill="url(#emeraldShield)"
            stroke="url(#goldGrad)"
            strokeWidth="3.5"
          />
          {/* Golden Crown on Top */}
          <path
            d="M38 24 L42 30 L50 20 L58 30 L62 24 L60 34 L40 34 Z"
            fill="url(#goldGrad)"
          />
          {/* Central FC Monogram */}
          <circle cx="50" cy="54" r="18" stroke="url(#goldGrad)" strokeWidth="2" fill="#022c22" />
          <text
            x="50"
            y="61"
            textAnchor="middle"
            fill="url(#goldGrad)"
            fontSize="18"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            MN
          </text>
        </svg>
      )}
    </div>
  );

  if (withLighting) {
    return (
      <AnimatedLighting
        color={lightingColor}
        borderWidth={2}
        rounded={rounded}
        speed={2.8}
        className={`shrink-0 inline-flex items-center justify-center ${className}`}
      >
        {logoElement}
      </AnimatedLighting>
    );
  }

  return logoElement;
};
