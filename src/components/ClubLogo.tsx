import React, { useMemo } from 'react';
import { generateClubLogoSvg, ClubLogoOptions } from '../utils/clubLogo.ts';

interface ClubLogoProps {
  club: {
    id: string;
    name: string;
    shortCode: string;
    foundedYear?: number;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    logoSvg?: string;
  };
  size?: number | string;
  className?: string;
  showLighting?: boolean;
}

export const ClubLogo: React.FC<ClubLogoProps> = ({
  club,
  size = 48,
  className = '',
  showLighting = false,
}) => {
  const svgContent = useMemo(() => {
    if (club.logoSvg && club.logoSvg.startsWith('<svg')) {
      return club.logoSvg;
    }
    return generateClubLogoSvg(club);
  }, [club]);

  const dimension = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: dimension, height: dimension }}
      title={`${club.name} Official Crest`}
    >
      <div
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] flex items-center justify-center transition-transform hover:scale-105"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};
