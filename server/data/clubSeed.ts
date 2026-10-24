import { SERVERS_LIST } from './serverNames.ts';

export interface SeedClubRecord {
  id: string;
  serverId: string;
  serverCode: string;
  name: string;
  shortCode: string;
  city: string;
  stadiumName: string;
  stadiumCapacity: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  foundedYear: number;
  managerId: string | null;
  managerUsername: string | null;
  transferBudget: number; // Strictly 100,000,000
  claimedAt: string | null;
}

// Prefixes, roots, and suffixes for realistic AI-created clubs
const REGIONAL_CLUB_PRESETS: Record<string, Array<{ name: string; short: string; city: string; stadium: string }>> = {
  srv_eu01: [
    { name: 'Northbridge FC', short: 'NBF', city: 'Northbridge', stadium: 'Northbridge Park' },
    { name: 'Royal Vesterholm', short: 'RVH', city: 'Vesterholm', stadium: 'Vesterholm Arena' },
    { name: 'Eastford United', short: 'EFU', city: 'Eastford', stadium: 'Eastford Ground' },
    { name: 'Ironvale Athletic', short: 'IVA', city: 'Ironvale', stadium: 'The Foundry' },
    { name: 'Kingsport Rovers', short: 'KPR', city: 'Kingsport', stadium: 'Kingsport Meadows' },
    { name: 'Solhaven City', short: 'SHC', city: 'Solhaven', stadium: 'Solhaven Stadium' },
    { name: 'Valenhurst Albion', short: 'VHA', city: 'Valenhurst', stadium: 'Albion Park' },
    { name: 'Highmont Sporting', short: 'HMS', city: 'Highmont', stadium: 'Highmont Colosseum' },
    { name: 'Blackthorn Wanderers', short: 'BTW', city: 'Blackthorn', stadium: 'Blackthorn Lane' },
    { name: 'Oakhaven Olympic', short: 'OHO', city: 'Oakhaven', stadium: 'Olympic Valley' },
    { name: 'Crestfall Town', short: 'CFT', city: 'Crestfall', stadium: 'Crestfall Park' },
    { name: 'Silverlake Celtic', short: 'SLC', city: 'Silverlake', stadium: 'Celtic Wharf' },
    { name: 'Amberley Rangers', short: 'ABR', city: 'Amberley', stadium: 'Amberley Gardens' },
    { name: 'Stormgate FC', short: 'STG', city: 'Stormgate', stadium: 'The Bastion' },
    { name: 'Halcyon Dynamos', short: 'HCD', city: 'Halcyon', stadium: 'Dynamo Dome' },
    { name: 'Redstone County', short: 'RSC', city: 'Redstone', stadium: 'Redstone Valley' },
    { name: 'Windmere Athletic', short: 'WMA', city: 'Windmere', stadium: 'Windmere Road' },
    { name: 'Bayside Union', short: 'BSU', city: 'Bayside', stadium: 'The Marina Arena' },
    { name: 'Dunraven Athletic', short: 'DRA', city: 'Dunraven', stadium: 'Dunraven Keep' },
    { name: 'Thornwood Rovers', short: 'TWR', city: 'Thornwood', stadium: 'Thornwood Grove' },
    { name: 'Goldcrest SC', short: 'GCS', city: 'Goldcrest', stadium: 'Goldcrest Arena' },
    { name: 'Highwater Town', short: 'HWT', city: 'Highwater', stadium: 'Canalside Park' },
    { name: 'Ravenscar United', short: 'RCU', city: 'Ravenscar', stadium: 'The Crows Nest' },
    { name: 'Calderdale Stars', short: 'CDS', city: 'Calderdale', stadium: 'Calder Stadium' },
    { name: 'Sunbury Mariners', short: 'SBM', city: 'Sunbury', stadium: 'Mariners Quay' },
    { name: 'Everglade FC', short: 'EGF', city: 'Everglade', stadium: 'Everglade Bowl' },
    { name: 'Ironforge Rovers', short: 'IFR', city: 'Ironforge', stadium: 'Hammer Park' },
    { name: 'Foxglove Sporting', short: 'FGS', city: 'Foxglove', stadium: 'Foxglove Meadow' },
    { name: 'Stonebridge City', short: 'SBC', city: 'Stonebridge', stadium: 'Viaduct Park' },
    { name: 'Westerfield FC', short: 'WFF', city: 'Westerfield', stadium: 'Westerfield Lane' }
  ],
  srv_eng02: [
    { name: 'Alderley Harriers', short: 'ALH', city: 'Alderley', stadium: 'Alderley Heath' },
    { name: 'Bromfield Albion', short: 'BFA', city: 'Bromfield', stadium: 'Bromfield Common' },
    { name: 'Chelsham United', short: 'CHU', city: 'Chelsham', stadium: 'Chelsham Mill' },
    { name: 'Davenport Athletic', short: 'DVA', city: 'Davenport', stadium: 'St. Judes Park' },
    { name: 'Edgemoor FC', short: 'EGM', city: 'Edgemoor', stadium: 'The Ridge Ground' },
    { name: 'Finchley Rovers', short: 'FNR', city: 'Finchley', stadium: 'Finchley Park' },
    { name: 'Grosvenor Park', short: 'GVP', city: 'Grosvenor', stadium: 'Grosvenor Road' },
    { name: 'Hartwood City', short: 'HWC', city: 'Hartwood', stadium: 'Hartwood Oaks' },
    { name: 'Inglewood Wanderers', short: 'IGW', city: 'Inglewood', stadium: 'Inglewood Arena' },
    { name: 'Kennington Athletic', short: 'KNA', city: 'Kennington', stadium: 'Kennington Oval' },
    { name: 'Langdon United', short: 'LDU', city: 'Langdon', stadium: 'Langdon Field' },
    { name: 'Mayfield Town', short: 'MFT', city: 'Mayfield', stadium: 'Mayfield Green' },
    { name: 'Newbury Corinthians', short: 'NBC', city: 'Newbury', stadium: 'Corinthian Walk' },
    { name: 'Overton Rovers', short: 'OTR', city: 'Overton', stadium: 'Overton Bank' },
    { name: 'Pendleton Albion', short: 'PDA', city: 'Pendleton', stadium: 'Pendleton Moor' },
    { name: 'Queensway FC', short: 'QNW', city: 'Queensway', stadium: 'Victoria Gate' },
    { name: 'Rookwood Athletic', short: 'RWA', city: 'Rookwood', stadium: 'The Rookery' },
    { name: 'Sedbergh United', short: 'SBU', city: 'Sedbergh', stadium: 'Sedbergh Dale' },
    { name: 'Talbot Town', short: 'TBT', city: 'Talbot', stadium: 'Talbot Cross' },
    { name: 'Upton Rangers', short: 'UTR', city: 'Upton', stadium: 'Upton Marsh' },
    { name: 'Vauxhall Mariners', short: 'VXM', city: 'Vauxhall', stadium: 'The Estuary' },
    { name: 'Wentworth Albion', short: 'WWA', city: 'Wentworth', stadium: 'Wentworth Hill' },
    { name: 'Yardley Athletic', short: 'YDA', city: 'Yardley', stadium: 'Yardley Green' },
    { name: 'Ashford Borough', short: 'AFB', city: 'Ashford', stadium: 'Borough Way' },
    { name: 'Beacon Hill FC', short: 'BHF', city: 'Beacon', stadium: 'Beacon Summit' },
    { name: 'Cliftonville Rovers', short: 'CVR', city: 'Cliftonville', stadium: 'Clifton Downs' },
    { name: 'Dartmoor United', short: 'DMU', city: 'Dartmoor', stadium: 'Dartmoor Park' },
    { name: 'Ellerby City', short: 'EBC', city: 'Ellerby', stadium: 'Ellerby Basin' },
    { name: 'Fulford Town', short: 'FFT', city: 'Fulford', stadium: 'Fulford Common' },
    { name: 'Gallowgate Athletic', short: 'GGA', city: 'Gallowgate', stadium: 'Gallowgate End' }
  ]
};

// Rich palette for dynamic, distinctive kit & badge visuals
const COLOR_PALETTES = [
  { primary: '#0ea5e9', secondary: '#0f172a', accent: '#38bdf8' },
  { primary: '#dc2626', secondary: '#18181b', accent: '#fca5a5' },
  { primary: '#16a34a', secondary: '#052e16', accent: '#86efac' },
  { primary: '#ca8a04', secondary: '#422006', accent: '#fde047' },
  { primary: '#7c3aed', secondary: '#2e1065', accent: '#c4b5fd' },
  { primary: '#0284c7', secondary: '#ffffff', accent: '#38bdf8' },
  { primary: '#be123c', secondary: '#ffe4e6', accent: '#fb7185' },
  { primary: '#0d9488', secondary: '#134e4a', accent: '#5eead4' },
  { primary: '#ea580c', secondary: '#1c1917', accent: '#fdba74' },
  { primary: '#4f46e5', secondary: '#312e81', accent: '#a5b4fc' },
  { primary: '#059669', secondary: '#ecfdf5', accent: '#34d399' },
  { primary: '#b91c1c', secondary: '#fef2f2', accent: '#ef4444' },
  { primary: '#1e293b', secondary: '#38bdf8', accent: '#94a3b8' },
  { primary: '#9333ea', secondary: '#faf5ff', accent: '#d8b4fe' },
  { primary: '#0891b2', secondary: '#164e63', accent: '#67e8f9' },
];

const NAMING_MODIFIERS: Record<string, { roots: string[]; suffixes: string[]; cities: string[]; stadiumSuffixes: string[] }> = {
  default: {
    roots: [
      'Alpen', 'Bavaria', 'Nordic', 'Castile', 'Lombardy', 'Aquitaine', 'Flanders', 'Lusitania',
      'Highland', 'Lowland', 'Riviera', 'Eldorado', 'Danube', 'Baltic', 'Balkan', 'Adriatic',
      'Pyrenees', 'Rhine', 'Carpathian', 'Iberian', 'Helvetia', 'Gaelic', 'Bohemian', 'Silesian',
      'Vistula', 'Aegean', 'Ionian', 'Scania', 'Fiord', 'Tundra', 'Savanna', 'Pampa', 'Andean',
      'Valparaíso', 'Sahara', 'Levant', 'Caledonia', 'Saxony', 'Catalan', 'Basque', 'Aragon',
      'Tyrol', 'Piedmont', 'Tuscany', 'Lazio', 'Galicia', 'Algarve', 'Wallonia', 'Brabant', 'Zeeland'
    ],
    suffixes: [
      'FC', 'United', 'Athletic', 'Rovers', 'City', 'Town', 'Albion', 'Sporting', 'Wanderers',
      'Olympic', 'Rangers', 'Dynamos', 'Celtic', 'Union', 'Stars', 'Mariners', 'Harriers', 'Locomotive'
    ],
    cities: [
      'Valence', 'Kresimir', 'Sonderborg', 'Torrente', 'Brescia', 'Viborg', 'Aalborg', 'Graz',
      'Innsbruck', 'Sint-Truiden', 'Hasselt', 'Aberdeen', 'St. Gallen', 'Neuchatel', 'Uppsala',
      'Tromso', 'Bergen', 'Odense', 'Gdynia', 'Torun', 'Patras', 'Larissa', 'Rijeka', 'Split',
      'Olomouc', 'Puebla', 'Toluca', 'Suwon', 'Ulsan', 'Adelaide', 'Perth', 'Dammam', 'Durban'
    ],
    stadiumSuffixes: [
      'Arena', 'Park', 'Stadium', 'Grounds', 'Field', 'Meadows', 'Colosseum', 'Bowl', 'Keep', 'Quay'
    ]
  }
};

export function generateAllClubs(): SeedClubRecord[] {
  const allClubs: SeedClubRecord[] = [];

  for (const server of SERVERS_LIST) {
    const preset = REGIONAL_CLUB_PRESETS[server.id];

    for (let i = 0; i < 30; i++) {
      let name = '';
      let shortCode = '';
      let city = '';
      let stadium = '';

      if (preset && preset[i]) {
        name = preset[i].name;
        shortCode = preset[i].short;
        city = preset[i].city;
        stadium = preset[i].stadium;
      } else {
        const root = NAMING_MODIFIERS.default.roots[(i * 7 + server.basePing) % NAMING_MODIFIERS.default.roots.length];
        const suffix = NAMING_MODIFIERS.default.suffixes[(i * 3 + server.code.length) % NAMING_MODIFIERS.default.suffixes.length];
        const cityName = NAMING_MODIFIERS.default.cities[(i * 5 + server.basePing) % NAMING_MODIFIERS.default.cities.length];
        const stadiumType = NAMING_MODIFIERS.default.stadiumSuffixes[(i + 2) % NAMING_MODIFIERS.default.stadiumSuffixes.length];

        name = `${root} ${suffix}`;
        shortCode = `${root.slice(0, 2).toUpperCase()}${suffix.slice(0, 1).toUpperCase()}`;
        city = cityName;
        stadium = `${root} ${stadiumType}`;
      }

      const palette = COLOR_PALETTES[(i + server.basePing) % COLOR_PALETTES.length];
      const capacity = 28000 + ((i * 1450 + server.basePing * 320) % 45000);
      const foundedYear = 1880 + ((i * 11 + server.basePing * 3) % 85);

      allClubs.push({
        id: `${server.id}_c${(i + 1).toString().padStart(2, '0')}`,
        serverId: server.id,
        serverCode: server.code,
        name,
        shortCode,
        city,
        stadiumName: stadium,
        stadiumCapacity: capacity,
        primaryColor: palette.primary,
        secondaryColor: palette.secondary,
        accentColor: palette.accent,
        foundedYear,
        managerId: null,
        managerUsername: null,
        transferBudget: 100000000, // STRICT: Exactly €100,000,000 for every club
        claimedAt: null
      });
    }
  }

  return allClubs;
}
