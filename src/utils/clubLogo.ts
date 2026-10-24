/**
 * Procedural SVG Football Crest Generator for Manager Nol
 * Generates distinct, high-fidelity, authentic football club crests for all 900 clubs.
 * Deterministic based on club ID, name, shortCode, founded year, and official colors.
 */

export interface ClubLogoOptions {
  id: string;
  name: string;
  shortCode: string;
  foundedYear?: number;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  city?: string;
}

// Simple deterministic string hash
function strHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

export function generateClubLogoSvg(club: ClubLogoOptions): string {
  const seed = strHash(club.id + club.name);
  const primary = club.primaryColor || '#10b981';
  const secondary = club.secondaryColor || '#0f172a';
  const accent = club.accentColor || '#f59e0b';
  const short = (club.shortCode || club.name.slice(0, 3)).toUpperCase();
  const year = club.foundedYear || 1900 + (seed % 120);

  // 6 Crest Silhouette Shapes
  const shapeIndex = seed % 6;
  // 6 Pattern styles
  const patternIndex = (seed >> 3) % 6;
  // 8 Heraldic Emblems
  const emblemIndex = (seed >> 6) % 8;

  const clipId = `crest_clip_${club.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const gradId = `crest_grad_${club.id.replace(/[^a-zA-Z0-9]/g, '_')}`;

  // Paths for 6 shield silhouettes in 120x140 viewport
  let shieldPath = '';
  switch (shapeIndex) {
    case 0: // Traditional pointed English shield
      shieldPath = 'M 10 16 C 10 16, 60 10, 110 16 C 110 55, 110 95, 60 134 C 10 95, 10 55, 10 16 Z';
      break;
    case 1: // Modern European Roundel
      shieldPath = 'M 60 10 A 52 52 0 1 1 59.9 10 Z';
      break;
    case 2: // Medieval Spanish Heater Shield
      shieldPath = 'M 14 12 L 106 12 L 106 68 C 106 104, 60 134, 60 134 C 60 134, 14 104, 14 68 Z';
      break;
    case 3: // Italian Scudetto / Barrel Shield
      shieldPath = 'M 20 14 Q 60 6 100 14 Q 112 55 102 96 Q 60 136 60 136 Q 18 96 18 55 Z';
      break;
    case 4: // Crowned Citadel / Fortress Shield
      shieldPath = 'M 14 26 L 36 12 L 60 22 L 84 12 L 106 26 L 106 75 C 106 106, 60 136, 60 136 C 60 136, 14 106, 14 75 Z';
      break;
    default: // Diamond Lozenge / Modern Angular Shield
      shieldPath = 'M 60 8 L 112 36 L 96 110 L 60 136 L 24 110 L 8 36 Z';
      break;
  }

  // Inner decorative patterns
  let patternContent = '';
  switch (patternIndex) {
    case 0: // Vertical Stripes (3 stripes)
      patternContent = `
        <rect x="0" y="0" width="120" height="140" fill="${primary}" />
        <rect x="24" y="0" width="24" height="140" fill="${secondary}" />
        <rect x="72" y="0" width="24" height="140" fill="${secondary}" />
      `;
      break;
    case 1: // Diagonal Sash / Sash of Honor
      patternContent = `
        <rect x="0" y="0" width="120" height="140" fill="${secondary}" />
        <polygon points="-20,140 0,140 140,-20 120,-20" fill="${primary}" />
        <polygon points="5,140 25,140 140,25 140,5" fill="${accent}" opacity="0.85" />
      `;
      break;
    case 2: // Halved Dual Tone
      patternContent = `
        <rect x="0" y="0" width="60" height="140" fill="${primary}" />
        <rect x="60" y="0" width="60" height="140" fill="${secondary}" />
      `;
      break;
    case 3: // Quartered Cross
      patternContent = `
        <rect x="0" y="0" width="60" height="70" fill="${primary}" />
        <rect x="60" y="0" width="60" height="70" fill="${secondary}" />
        <rect x="0" y="70" width="60" height="70" fill="${secondary}" />
        <rect x="60" y="70" width="60" height="70" fill="${primary}" />
      `;
      break;
    case 4: // Chevron of Triumph
      patternContent = `
        <rect x="0" y="0" width="120" height="140" fill="${secondary}" />
        <polygon points="0,50 60,85 120,50 120,72 60,107 0,72" fill="${primary}" />
        <polygon points="0,25 60,60 120,25 120,38 60,73 0,38" fill="${accent}" />
      `;
      break;
    default: // Radial Gradient Core with Gold Accent Ring
      patternContent = `
        <rect x="0" y="0" width="120" height="140" fill="url(#${gradId})" />
        <circle cx="60" cy="65" r="32" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.65" stroke-dasharray="6 3" />
      `;
      break;
  }

  // 8 Central Heraldic Emblems
  let emblemContent = '';
  switch (emblemIndex) {
    case 0: // Classic 32-panel Soccer Ball
      emblemContent = `
        <g transform="translate(60, 58)">
          <circle cx="0" cy="0" r="16" fill="#f8fafc" stroke="${secondary}" stroke-width="2" />
          <polygon points="0,-7 6,-3 4,5 -4,5 -6,-3" fill="${secondary}" />
          <line x1="0" y1="-7" x2="0" y2="-16" stroke="${secondary}" stroke-width="1.5" />
          <line x1="6" y1="-3" x2="15" y2="-6" stroke="${secondary}" stroke-width="1.5" />
          <line x1="4" y1="5" x2="10" y2="13" stroke="${secondary}" stroke-width="1.5" />
          <line x1="-4" y1="5" x2="-10" y2="13" stroke="${secondary}" stroke-width="1.5" />
          <line x1="-6" y1="-3" x2="-15" y2="-6" stroke="${secondary}" stroke-width="1.5" />
        </g>
      `;
      break;
    case 1: // Crowned Imperial Lion / Beast
      emblemContent = `
        <g transform="translate(60, 57)">
          <path d="M -6 -14 L -3 -11 L 0 -15 L 3 -11 L 6 -14 L 5 -7 L -5 -7 Z" fill="${accent}" stroke="#000" stroke-width="0.8" />
          <circle cx="0" cy="-2" r="6" fill="${accent}" />
          <path d="M -7 4 Q 0 -1 7 4 Q 9 12 5 17 Q 0 14 -5 17 Q -9 12 -7 4 Z" fill="${accent}" stroke="#000" stroke-width="0.8" />
          <circle cx="-2" cy="-3" r="1" fill="#000" />
          <circle cx="2" cy="-3" r="1" fill="#000" />
        </g>
      `;
      break;
    case 2: // Eagle of Victory with Spread Wings
      emblemContent = `
        <g transform="translate(60, 58)">
          <path d="M 0 -14 L 3 -7 L 16 -12 L 18 -1 L 11 8 L 3 14 L 0 16 L -3 14 L -11 8 L -18 -1 L -16 -12 L -3 -7 Z" fill="${accent}" stroke="#000" stroke-width="1" />
          <circle cx="0" cy="-6" r="3.5" fill="#ffffff" />
          <circle cx="0" cy="-6" r="1.5" fill="#000" />
        </g>
      `;
      break;
    case 3: // Maritime Nautical Anchor
      emblemContent = `
        <g transform="translate(60, 58)">
          <circle cx="0" cy="-12" r="3.5" fill="none" stroke="${accent}" stroke-width="2" />
          <line x1="0" y1="-8" x2="0" y2="15" stroke="${accent}" stroke-width="3" />
          <line x1="-8" y1="-4" x2="8" y2="-4" stroke="${accent}" stroke-width="2.5" />
          <path d="M -14 6 C -14 16, 14 16, 14 6" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round" />
          <polygon points="-16,7 -12,4 -10,9" fill="${accent}" />
          <polygon points="16,7 12,4 10,9" fill="${accent}" />
        </g>
      `;
      break;
    case 4: // Fortress Bastion / Castle Tower
      emblemContent = `
        <g transform="translate(60, 59)">
          <rect x="-12" y="-12" width="24" height="26" fill="${accent}" stroke="#000" stroke-width="1" />
          <rect x="-14" y="-16" width="28" height="6" fill="${accent}" stroke="#000" stroke-width="1" />
          <rect x="-10" y="-16" width="4" height="4" fill="#000" />
          <rect x="-2" y="-16" width="4" height="4" fill="#000" />
          <rect x="6" y="-16" width="4" height="4" fill="#000" />
          <path d="M -4 14 A 4 4 0 0 1 4 14 Z" fill="#000" />
        </g>
      `;
      break;
    case 5: // Triple Championship Stars
      emblemContent = `
        <g transform="translate(60, 58)">
          <polygon points="0,-16 2.5,-9 10,-9 4,-5 6.5,2 0,-2 -6.5,2 -4,-5 -10,-9 -2.5,-9" fill="${accent}" stroke="#000" stroke-width="0.8" />
          <polygon points="-16,-4 -14,1 -9,1 -13,4 -11,9 -16,6 -21,9 -19,4 -23,1 -18,1" fill="${accent}" stroke="#000" stroke-width="0.8" />
          <polygon points="16,-4 18,1 23,1 19,4 21,9 16,6 11,9 13,4 9,1 14,1" fill="${accent}" stroke="#000" stroke-width="0.8" />
        </g>
      `;
      break;
    case 6: // Maltese / St. George Cross of Valor
      emblemContent = `
        <g transform="translate(60, 58)">
          <polygon points="-14,-14 0,-7 14,-14 7,0 14,14 0,7 -14,14 -7,0" fill="${accent}" stroke="#000" stroke-width="1" />
          <circle cx="0" cy="0" r="3.5" fill="#ffffff" />
        </g>
      `;
      break;
    default: // Twin Crossed Swords / Gladius
      emblemContent = `
        <g transform="translate(60, 58)">
          <line x1="-14" y1="-14" x2="14" y2="14" stroke="${accent}" stroke-width="3" stroke-linecap="round" />
          <line x1="14" y1="-14" x2="-14" y2="14" stroke="${accent}" stroke-width="3" stroke-linecap="round" />
          <circle cx="0" cy="0" r="4.5" fill="#ffffff" stroke="#000" stroke-width="1" />
        </g>
      `;
      break;
  }

  // Monogram & Banner typography
  const textY = shapeIndex === 1 ? 95 : 100;
  const bannerY = shapeIndex === 1 ? 114 : 118;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" class="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
      <defs>
        <clipPath id="${clipId}">
          <path d="${shieldPath}" />
        </clipPath>
        <radialGradient id="${gradId}" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="100%" stop-color="${secondary}" />
        </radialGradient>
        <filter id="shadow_${clipId}" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.8" />
        </filter>
      </defs>

      <!-- Outer Shadow Silhouette -->
      <path d="${shieldPath}" fill="#000000" opacity="0.4" transform="translate(0, 3)" />

      <!-- Clipped Pattern & Emblems -->
      <g clip-path="url(#${clipId})">
        ${patternContent}
        
        <!-- Subtle Top Vignette -->
        <rect x="0" y="0" width="120" height="25" fill="#ffffff" opacity="0.12" />
        <rect x="0" y="100" width="120" height="40" fill="#000000" opacity="0.25" />

        <!-- Central Emblem -->
        ${emblemContent}

        <!-- Club Short Monogram Plaque -->
        <g transform="translate(60, ${textY})">
          <rect x="-26" y="-10" width="52" height="20" rx="4" fill="#040806" opacity="0.92" stroke="${accent}" stroke-width="1.2" />
          <text x="0" y="4.5" font-family="'Barlow Condensed', 'Outfit', sans-serif" font-weight="900" font-size="14" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">
            ${short}
          </text>
        </g>

        <!-- Foundation Year Tag -->
        <g transform="translate(60, ${bannerY})">
          <text x="0" y="0" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="8" fill="${accent}" text-anchor="middle" letter-spacing="1.2" opacity="0.9">
            ${year}
          </text>
        </g>
      </g>

      <!-- Outer Metallic Trim Border -->
      <path d="${shieldPath}" fill="none" stroke="${accent}" stroke-width="3" stroke-linejoin="round" />
      <path d="${shieldPath}" fill="none" stroke="#ffffff" stroke-width="0.8" stroke-linejoin="round" opacity="0.6" />
    </svg>
  `.trim();
}
