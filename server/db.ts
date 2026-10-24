import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { SERVERS_LIST, ServerDefinition } from './data/serverNames.ts';
import { generateAllClubs } from './data/clubSeed.ts';
import { generateClubLogoSvg } from '../src/utils/clubLogo.ts';

export type PlayerRank = 'Weak' | 'Average' | 'Strong' | 'Worldclass' | 'Top Tier';
export type StaminaCondition = 'Great' | 'Tired' | 'Exhausted';
export type PlayerPosition = 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LM' | 'RM' | 'LW' | 'RW' | 'ST';
export type PositionCategory = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Attacker';

export interface Player {
  id: string;
  number: number;
  name: string;
  position: PlayerPosition;
  positionCategory: PositionCategory;
  rank: PlayerRank;
  age: number;
  nationality: string;
  preferredFoot: 'Right' | 'Left' | 'Both';
  stamina: number;
  condition: StaminaCondition;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  wage?: number;
  contractYears?: number;
  teamRole?: string;
  isTransferListed?: boolean;
  askingPrice?: number;
}

export interface LineupConfig {
  formation: string;
  teamEffort: 'Medium' | 'High' | 'Extreme';
  startingPlayers: { playerId: string; position: string }[];
}

export interface ClubRecord {
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
  transferBudget: number;
  claimedAt: string | null;
  squad: Player[];
  lineup: LineupConfig | null;
  logoSvg?: string;
}

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  activeServerId: string | null;
  activeClubId: string | null;
}

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface TransferListingRecord {
  id: string;
  serverId: string;
  sellerClubId: string;
  sellerClubName: string;
  sellerUserId: string;
  sellerUsername: string;
  player: Player;
  askingPrice: number;
  marketValuation: number;
  status: 'Active' | 'UnderOffer' | 'Completed' | 'Withdrawn';
  createdAt: string;
  updatedAt?: string;
}

export interface TransferOfferRecord {
  id: string;
  listingId: string;
  serverId: string;
  playerId: string;
  playerName: string;
  playerOvr: number;
  playerPosition: string;
  sellerClubId: string;
  sellerClubName: string;
  sellerUserId: string;
  buyerClubId: string;
  buyerClubName: string;
  buyerUserId: string;
  buyerUsername: string;
  offerAmount: number;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Expired' | 'Completed';
  createdAt: string;
  resolvedAt?: string;
  rejectionReason?: string;
  contractId?: string;
}

export interface ContractProposalRecord {
  id: string;
  offerId: string;
  listingId: string;
  serverId: string;
  buyerUserId: string;
  buyerClubId: string;
  sellerUserId: string;
  sellerClubId: string;
  playerId: string;
  player: Player;
  transferFee: number;
  suggestedWage: number;
  weeklyWage: number;
  contractYears: number;
  teamRole: string;
  status: 'PendingAgreed' | 'Completed' | 'Cancelled';
  createdAt: string;
  completedAt?: string;
}

export type NewsCategory =
  | 'Match Reports'
  | 'Upcoming Fixtures'
  | 'Transfer News'
  | 'Incoming Transfer Offers'
  | 'Contract Negotiations'
  | 'Completed Transfers'
  | 'Club Announcements';

export interface ServerNewsRecord {
  id: string;
  serverId: string;
  category: NewsCategory;
  title: string;
  description: string;
  details?: string;
  timestamp: string;
  homeClubId?: string;
  homeClubName?: string;
  awayClubId?: string;
  awayClubName?: string;
  score?: string;
  matchStats?: {
    homePossession: number;
    awayPossession: number;
    homeShots: number;
    awayShots: number;
    homeCorners: number;
    awayCorners: number;
    goalScorers: string[];
    yellowCards: string[];
    attendance: number;
    stadium: string;
  };
  playerId?: string;
  playerName?: string;
  transferFee?: number;
  teamRole?: string;
  contractYears?: number;
}

export interface InboxMessageRecord {
  id: string;
  userId: string;
  serverId: string;
  type:
    | 'incoming_offer'
    | 'offer_rejected'
    | 'offer_accepted'
    | 'contract_pending'
    | 'transfer_completed'
    | 'transfer_cancelled'
    | 'club_announcement';
  title: string;
  summary: string;
  details: string;
  timestamp: string;
  read: boolean;
  relatedListingId?: string;
  relatedOfferId?: string;
  relatedContractId?: string;
  actionType?: 'view_offer' | 'negotiate_contract' | 'view_transfer' | 'none';
}

export interface FixtureRecord {
  id: string;
  serverId: string;
  homeClubId: string;
  homeClubName: string;
  awayClubId: string;
  awayClubName: string;
  scheduledTime: string;
  matchday: number;
  played: boolean;
  score?: string;
  reportNewsId?: string;
}

export interface DatabaseSchema {
  version: number;
  servers: ServerDefinition[];
  clubs: Record<string, ClubRecord>; 
  users: Record<string, UserRecord>;
  sessions: Record<string, SessionRecord>;
  listings: Record<string, TransferListingRecord>;
  offers: Record<string, TransferOfferRecord>;
  contracts: Record<string, ContractProposalRecord>;
  news: Record<string, ServerNewsRecord>;
  inbox: Record<string, InboxMessageRecord>;
  fixtures: Record<string, FixtureRecord>;
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const DB_DIR = isServerless ? path.join('/tmp', 'manager_nol_data') : path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');
const ROOT_DB_FILE = path.resolve(process.cwd(), 'data', 'database.json');

let db: DatabaseSchema | null = null;

function ensureDirectoryExists(dirPath: string) {
  try {
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  } catch (e) {
    // ignore directory creation error in read-only setups
  }
}

export function calculatePlayerValuation(player: Player): number {
  const ovr = Math.round(
    (player.pace + player.shooting + player.passing + player.dribbling + player.defending + player.physical) / 6
  );
  const base = Math.max(12, Math.round(ovr * ovr * 7500 - player.age * 220000));
  return Math.round(base / 10000) * 10000;
}

export function calculateSuggestedWeeklyWage(player: Player): number {
  const ovr = Math.round(
    (player.pace + player.shooting + player.passing + player.dribbling + player.defending + player.physical) / 6
  );
  let wage = 0;
  if (ovr < 70) {
    wage = 5000 + (ovr - 50) * 500;
  } else if (ovr < 80) {
    wage = 18000 + (ovr - 70) * 4200;
  } else if (ovr < 85) {
    wage = 65000 + (ovr - 80) * 15000;
  } else if (ovr < 90) {
    wage = 150000 + (ovr - 85) * 20000;
  } else {
    wage = 260000 + (ovr - 90) * 25000;
  }
  return Math.max(5000, Math.round(wage / 500) * 500);
}

export const TEAM_ROLES = [
  {
    role: 'Key Player',
    label: 'Key Player',
    commitment: 'Undisputed starter in all competitions and high-stake matchdays.',
    minPlayingTime: '90%+ of starting lineups',
    colorKey: 'amber' as const,
  },
  {
    role: 'Important Player',
    label: 'Important Player',
    commitment: 'Integral first-team pillar expected to start 80%+ of fixtures.',
    minPlayingTime: '80%+ of starting lineups',
    colorKey: 'solar' as const,
  },
  {
    role: 'Regular Starter',
    label: 'Regular Starter',
    commitment: 'Consistent first-choice starter when match conditioning permits.',
    minPlayingTime: '70%+ of starting lineups',
    colorKey: 'emerald' as const,
  },
  {
    role: 'First-Team Player',
    label: 'First-Team Player',
    commitment: 'Active squad member rotating between first-choice XI and dugout.',
    minPlayingTime: '55%+ of starting lineups',
    colorKey: 'cyan' as const,
  },
  {
    role: 'Rotation Player',
    label: 'Rotation Player',
    commitment: 'Reliable tactical rotation option sharing minutes across fixture congestion.',
    minPlayingTime: '40%+ of match minutes',
    colorKey: 'electric-blue' as const,
  },
  {
    role: 'Impact Substitute',
    label: 'Impact Substitute',
    commitment: 'High-pace tactical weapon introduced from dugout to change match momentum.',
    minPlayingTime: 'Frequent substitute appearances',
    colorKey: 'violet' as const,
  },
  {
    role: 'Backup Player',
    label: 'Backup Player',
    commitment: 'Secondary cover, called upon during squad fatigue, rotations, or injuries.',
    minPlayingTime: 'Squad depth & cup matches',
    colorKey: 'magenta' as const,
  },
  {
    role: 'Prospect',
    label: 'Prospect',
    commitment: 'High-potential emerging talent receiving tailored first-team development.',
    minPlayingTime: 'Controlled first-team minutes',
    colorKey: 'lime' as const,
  },
  {
    role: 'Youth Prospect',
    label: 'Youth Prospect',
    commitment: 'Academy graduate learning club system through cup fixtures & training.',
    minPlayingTime: 'Developmental roster',
    colorKey: 'mint' as const,
  },
  {
    role: 'Emergency Cover',
    label: 'Emergency Cover',
    commitment: 'Registration insurance providing emergency squad depth when required.',
    minPlayingTime: 'Contingency cover only',
    colorKey: 'orange' as const,
  },
];

function seedServerDataIfEmpty(database: DatabaseSchema): boolean {
  let modified = false;

  if (!database.listings) database.listings = {};
  if (!database.offers) database.offers = {};
  if (!database.contracts) database.contracts = {};
  if (!database.news) database.news = {};
  if (!database.inbox) database.inbox = {};
  if (!database.fixtures) database.fixtures = {};

  const now = new Date();

  // 1. Seed Fixtures for all servers if empty
  if (Object.keys(database.fixtures).length === 0) {
    for (const server of database.servers) {
      const serverClubs = Object.values(database.clubs).filter((c) => c.serverId === server.id);
      if (serverClubs.length >= 2) {
        for (let i = 0; i < serverClubs.length - 1; i += 2) {
          const home = serverClubs[i];
          const away = serverClubs[i + 1];
          const fixtureId = `fix_${server.id}_m1_${i / 2 + 1}`;
          
          const matchDate = new Date(now.getTime() + 86400000 + (i / 2) * 7200000); // Tomorrow
          database.fixtures[fixtureId] = {
            id: fixtureId,
            serverId: server.id,
            homeClubId: home.id,
            homeClubName: home.name,
            awayClubId: away.id,
            awayClubName: away.name,
            scheduledTime: matchDate.toISOString(),
            matchday: 1,
            played: false,
          };
        }
      }
    }
    modified = true;
  }

  // 2. Seed News for all servers if empty
  if (Object.keys(database.news).length === 0) {
    for (const server of database.servers) {
      const serverClubs = Object.values(database.clubs).filter((c) => c.serverId === server.id);
      const c1 = serverClubs[0];
      const c2 = serverClubs[1];

      // Article 1: League Opening
      const newsId1 = `news_${server.id}_open`;
      database.news[newsId1] = {
        id: newsId1,
        serverId: server.id,
        category: 'Club Announcements',
        title: `Season 2026 Pro League Officially Launched on ${server.name}`,
        description: `All 30 professional clubs in the ${server.name} (${server.code}) sector have finalized registration with €100,000,000 transfer budgets locked into escrow.`,
        details: 'The Competition Committee has authorized 22-man senior registrations and approved tactical conditioning protocols.',
        timestamp: new Date(now.getTime() - 7200000).toISOString(),
      };

      // Article 2: Upcoming Fixtures
      const newsId2 = `news_${server.id}_fixtures`;
      database.news[newsId2] = {
        id: newsId2,
        serverId: server.id,
        category: 'Upcoming Fixtures',
        title: `Matchday 1 Schedule Announced for ${server.code}`,
        description: `Opening fixtures have been scheduled for tomorrow at 19:45 CET, headlined by ${c1 ? c1.name : 'Challengers'} hosting ${c2 ? c2.name : 'Rivals'}.`,
        details: 'Full stadium security and television broadcasting channels have been reserved across all match grounds.',
        timestamp: new Date(now.getTime() - 3600000).toISOString(),
        homeClubId: c1?.id,
        homeClubName: c1?.name,
        awayClubId: c2?.id,
        awayClubName: c2?.name,
      };

      // Article 3: Transfer Market Open
      const newsId3 = `news_${server.id}_transfers`;
      database.news[newsId3] = {
        id: newsId3,
        serverId: server.id,
        category: 'Transfer News',
        title: `Official Transfer Market Window Activated on ${server.code}`,
        description: `Managers may now submit bids, list senior players for sale, and initiate personal contract negotiations across the server network.`,
        timestamp: new Date(now.getTime() - 1800000).toISOString(),
      };
    }
    modified = true;
  }

  // 3. Seed initial transfer market listings (3 scouted listings per server from unmanaged clubs)
  if (Object.keys(database.listings).length === 0) {
    for (const server of database.servers) {
      const serverClubs = Object.values(database.clubs).filter((c) => c.serverId === server.id && !c.managerId);
      const chosenClubs = serverClubs.slice(0, 3);
      
      chosenClubs.forEach((club, cIdx) => {
        const playerIndex = 8 + cIdx * 3;
        const player = club.squad[playerIndex] || club.squad[cIdx + 1];
        if (player) {
          player.isTransferListed = true;
          const val = calculatePlayerValuation(player);
          player.askingPrice = val;

          const listingId = `list_${server.id}_seed_${cIdx + 1}`;
          database.listings[listingId] = {
            id: listingId,
            serverId: server.id,
            sellerClubId: club.id,
            sellerClubName: club.name,
            sellerUserId: `ai_board_${club.id}`,
            sellerUsername: `${club.shortCode} Board of Directors`,
            player: { ...player },
            askingPrice: val,
            marketValuation: val,
            status: 'Active',
            createdAt: new Date(now.getTime() - (cIdx + 1) * 600000).toISOString(),
          };
        }
      });
    }
    modified = true;
  }

  return modified;
}

export function initDatabase(): DatabaseSchema {
  if (db) return db;
  ensureDirectoryExists(DB_DIR);

  // In serverless/Vercel, if /tmp has no db yet, copy pre-seeded database.json from repository
  if (isServerless && !fs.existsSync(DB_FILE) && fs.existsSync(ROOT_DB_FILE)) {
    try {
      fs.copyFileSync(ROOT_DB_FILE, DB_FILE);
    } catch (copyErr) {
      console.warn('Notice: copying root DB to /tmp failed, will read root DB directly:', copyErr);
    }
  }

  const fileToRead = fs.existsSync(DB_FILE)
    ? DB_FILE
    : fs.existsSync(ROOT_DB_FILE)
    ? ROOT_DB_FILE
    : null;

  if (fileToRead) {
    try {
      const raw = fs.readFileSync(fileToRead, 'utf-8');
      db = JSON.parse(raw);
      if (db && db.servers && db.servers.length === 30 && Object.keys(db.clubs).length === 900) {
        let needsSave = false;

        if (!db.listings) { db.listings = {}; needsSave = true; }
        if (!db.offers) { db.offers = {}; needsSave = true; }
        if (!db.contracts) { db.contracts = {}; needsSave = true; }
        if (!db.news) { db.news = {}; needsSave = true; }
        if (!db.inbox) { db.inbox = {}; needsSave = true; }
        if (!db.fixtures) { db.fixtures = {}; needsSave = true; }

        // Migration: ensure squad, lineup, and unique persistent logoSvg exist for all 900 clubs
        for (const clubId in db.clubs) {
          const club = db.clubs[clubId];
          if (!club.squad || !club.squad[0]?.number) {
            club.squad = generateSquad();
            club.lineup = null;
            needsSave = true;
          }
          if (!club.logoSvg || !club.logoSvg.startsWith('<svg')) {
            club.logoSvg = generateClubLogoSvg(club);
            needsSave = true;
          }
        }

        const seeded = seedServerDataIfEmpty(db);
        if (seeded) needsSave = true;

        if (needsSave) {
          saveDatabaseSync();
        }
        return db;
      }
    } catch (err) {
      console.warn('Error reading existing database, regenerating:', err);
    }
  }

  console.log('Seeding initial database with 900 clubs and unique logos...');
  const clubsList = generateAllClubs();
  const clubsMap: Record<string, ClubRecord> = {};
  for (const c of clubsList) {
    const squad = generateSquad();
    const logoSvg = generateClubLogoSvg(c);
    clubsMap[c.id] = { ...c, squad, lineup: null, logoSvg };
  }

  db = { 
    version: 4, 
    servers: SERVERS_LIST, 
    clubs: clubsMap, 
    users: {}, 
    sessions: {},
    listings: {},
    offers: {},
    contracts: {},
    news: {},
    inbox: {},
    fixtures: {}
  };
  seedServerDataIfEmpty(db);
  saveDatabaseSync();
  return db;
}

export function saveDatabaseSync(): void {
  if (!db) return;
  try {
    ensureDirectoryExists(DB_DIR);
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err: any) {
    console.warn('Database write notice (in-memory state preserved):', err.message);
  }

  // Also sync to root DB file if running in local or when root data dir is writable
  if (DB_FILE !== ROOT_DB_FILE) {
    try {
      ensureDirectoryExists(path.dirname(ROOT_DB_FILE));
      const tempRoot = `${ROOT_DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempRoot, JSON.stringify(db, null, 2), 'utf-8');
      fs.renameSync(tempRoot, ROOT_DB_FILE);
    } catch {
      // Ignore in read-only serverless file systems
    }
  }
}


const FIRST_NAMES = [
  'Lucas', 'Matteo', 'Alexander', 'Marcus', 'Julian', 'Gabriel', 'Kasper', 'Hugo', 'Liam', 'Darius',
  'Viktor', 'Leon', 'Florian', 'Adrian', 'Stefan', 'Oscar', 'Felix', 'Nico', 'Dominik', 'Erik',
  'Tobias', 'Lars', 'Rafael', 'Marco', 'Soren', 'Christian', 'Jonas', 'Emil', 'Milan', 'Dante'
];

const LAST_NAMES = [
  'Lindqvist', 'Vandenberg', 'Moretti', 'Schneider', 'Thornton', 'Vestergaard', 'Kovalev', 'Althaus', 'Navarro', 'Svensson',
  'Castiglione', 'Holt', 'Bellingham', 'Kruger', 'Fontana', 'Lefebvre', 'Hadjuk', 'Birkeland', 'Vargas', 'Nowak',
  'Mercer', 'Caldwell', 'De Jong', 'Rostova', 'Larsson', 'Zimmerman', 'Brandt', 'Kovacic', 'Salas', 'Garrido'
];

const NATIONALITIES = ['Germany', 'England', 'Spain', 'France', 'Italy', 'Netherlands', 'Portugal', 'Brazil', 'Argentina', 'Sweden', 'Denmark', 'Norway', 'Belgium', 'Austria', 'Switzerland'];

const SQUAD_POSITION_TEMPLATE: { pos: PlayerPosition; cat: PositionCategory }[] = [
  { pos: 'GK', cat: 'Goalkeeper' },
  { pos: 'RB', cat: 'Defender' },
  { pos: 'CB', cat: 'Defender' },
  { pos: 'CB', cat: 'Defender' },
  { pos: 'LB', cat: 'Defender' },
  { pos: 'CDM', cat: 'Midfielder' },
  { pos: 'RM', cat: 'Midfielder' },
  { pos: 'CM', cat: 'Midfielder' },
  { pos: 'ST', cat: 'Attacker' },
  { pos: 'CAM', cat: 'Midfielder' },
  { pos: 'LM', cat: 'Midfielder' },
  { pos: 'GK', cat: 'Goalkeeper' },
  { pos: 'CB', cat: 'Defender' },
  { pos: 'LB', cat: 'Defender' },
  { pos: 'RB', cat: 'Defender' },
  { pos: 'CDM', cat: 'Midfielder' },
  { pos: 'CM', cat: 'Midfielder' },
  { pos: 'CAM', cat: 'Midfielder' },
  { pos: 'RW', cat: 'Attacker' },
  { pos: 'LW', cat: 'Attacker' },
  { pos: 'ST', cat: 'Attacker' },
  { pos: 'ST', cat: 'Attacker' }
];

function generateSquad(): Player[] {
  const squad: Player[] = [];
  
  for (let i = 0; i < 22; i++) {
    const template = SQUAD_POSITION_TEMPLATE[i];
    const firstName = FIRST_NAMES[(i * 3 + Math.floor(Math.random() * 5)) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 7 + Math.floor(Math.random() * 5)) % LAST_NAMES.length];
    const rank = getRandomRank();

    // Base attributes determined by player rank
    let baseStat = 65;
    if (rank === 'Top Tier') baseStat = 88;
    else if (rank === 'Worldclass') baseStat = 82;
    else if (rank === 'Strong') baseStat = 75;
    else if (rank === 'Average') baseStat = 67;
    else if (rank === 'Weak') baseStat = 58;

    const jitter = () => Math.round((Math.random() - 0.5) * 8);

    squad.push({
      id: crypto.randomUUID(),
      number: i + 1,
      name: `${firstName} ${lastName}`,
      position: template.pos,
      positionCategory: template.cat,
      rank,
      age: 19 + ((i * 3 + Math.floor(Math.random() * 4)) % 15), // 19 to 33
      nationality: NATIONALITIES[(i * 2) % NATIONALITIES.length],
      preferredFoot: i % 4 === 0 ? 'Left' : i % 5 === 0 ? 'Both' : 'Right',
      stamina: 100,
      condition: 'Great',
      pace: Math.min(99, Math.max(45, baseStat + jitter())),
      shooting: Math.min(99, Math.max(45, baseStat + jitter())),
      passing: Math.min(99, Math.max(45, baseStat + jitter())),
      dribbling: Math.min(99, Math.max(45, baseStat + jitter())),
      defending: Math.min(99, Math.max(45, baseStat + jitter())),
      physical: Math.min(99, Math.max(45, baseStat + jitter()))
    });
  }
  return squad;
}

function getRandomRank(): PlayerRank {
  const rand = Math.random() * 100;
  if (rand < 25) return 'Weak';       // 25%
  if (rand < 60) return 'Average';    // 35% (25-60)
  if (rand < 85) return 'Strong';     // 25% (60-85)
  if (rand < 97) return 'Worldclass'; // 12% (85-97)
  return 'Top Tier';                  // 3% (97-100)
}

// Auth & Operations
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function registerUser(username: string, password: string, email?: string) {
  const database = initDatabase();
  const cleanUsername = (username || '').trim();

  if (!cleanUsername || cleanUsername.length < 3) {
    throw new Error('Manager username must be at least 3 characters long.');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  for (const u of Object.values(database.users)) {
    if (u.username.toLowerCase() === cleanUsername.toLowerCase()) {
      throw new Error('Username is already taken. Please choose another username.');
    }
  }

  const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : `${cleanUsername.toLowerCase()}@managernol.club`;

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const userId = `usr_${crypto.randomUUID()}`;

  const newUser: UserRecord = {
    id: userId,
    username: cleanUsername,
    email: cleanEmail,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
    activeServerId: null,
    activeClubId: null,
  };
  database.users[userId] = newUser;

  const token = crypto.randomBytes(32).toString('hex');
  database.sessions[token] = {
    token,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  saveDatabaseSync();
  const { passwordHash: _, salt: __, ...safeUser } = newUser;
  return { user: safeUser, token };
}

export function loginUser(identifier: string, password: string) {
  const database = initDatabase();
  const cleanId = (identifier || '').trim().toLowerCase();

  const user = Object.values(database.users).find(
    (u) => u.username.toLowerCase() === cleanId || (u.email && u.email.toLowerCase() === cleanId)
  );
  if (!user || hashPassword(password, user.salt) !== user.passwordHash) {
    throw new Error('Invalid username or password. Please verify your credentials.');
  }

  const token = crypto.randomBytes(32).toString('hex');
  database.sessions[token] = {
    token,
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  // Restore active club state with bidirectional verification
  let activeClub = user.activeClubId ? database.clubs[user.activeClubId] || null : null;
  if (!activeClub) {
    const managedClub = Object.values(database.clubs).find((c) => c.managerId === user.id);
    if (managedClub) {
      user.activeClubId = managedClub.id;
      user.activeServerId = managedClub.serverId;
      activeClub = managedClub;
    }
  } else if (activeClub.managerId !== user.id) {
    // Active club is no longer assigned to user
    user.activeClubId = null;
    user.activeServerId = null;
    activeClub = null;
  }

  const activeServer = user.activeServerId ? database.servers.find((s) => s.id === user.activeServerId) || null : null;

  saveDatabaseSync();

  const { passwordHash: _, salt: __, ...safeUser } = user;
  return { user: safeUser, token, activeClub, activeServer };
}

export function getSessionUser(token: string) {
  const database = initDatabase();
  const session = database.sessions[token];
  if (!session || new Date(session.expiresAt).getTime() < Date.now()) return null;

  const user = database.users[session.userId];
  if (!user) return null;

  // Restore active club state with bidirectional verification
  let activeClub = user.activeClubId ? database.clubs[user.activeClubId] || null : null;
  if (!activeClub) {
    const managedClub = Object.values(database.clubs).find((c) => c.managerId === user.id);
    if (managedClub) {
      user.activeClubId = managedClub.id;
      user.activeServerId = managedClub.serverId;
      activeClub = managedClub;
      saveDatabaseSync();
    }
  } else if (activeClub.managerId !== user.id) {
    user.activeClubId = null;
    user.activeServerId = null;
    activeClub = null;
    saveDatabaseSync();
  }

  const activeServer = user.activeServerId ? database.servers.find((s) => s.id === user.activeServerId) || null : null;

  const { passwordHash: _, salt: __, ...safeUser } = user;
  return { user: safeUser, activeClub, activeServer };
}

export function logoutSession(token: string): void {
  const database = initDatabase();
  if (database.sessions[token]) {
    delete database.sessions[token];
    saveDatabaseSync();
  }
}

export function getServersWithStats() {
  const database = initDatabase();
  const countsByServer: Record<string, number> = {};
  for (const club of Object.values(database.clubs)) {
    if (club.managerId) countsByServer[club.serverId] = (countsByServer[club.serverId] || 0) + 1;
  }
  return database.servers.map((s) => ({ ...s, claimedClubs: countsByServer[s.id] || 0, totalClubs: 30 }));
}

export function getServerClubs(serverId: string) {
  const database = initDatabase();
  const server = database.servers.find((s) => s.id === serverId);
  if (!server) throw new Error(`Server '${serverId}' not found.`);
  const clubs = Object.values(database.clubs).filter((c) => c.serverId === serverId);
  return { server, clubs };
}

export function claimClub(userId: string, serverId: string, clubId: string): { club: ClubRecord; server: ServerDefinition } {
  const database = initDatabase();
  const user = database.users[userId];
  if (!user) {
    throw new Error('User account not found. Please log in again.');
  }

  const server = database.servers.find((s) => s.id === serverId);
  if (!server) {
    throw new Error(`Server '${serverId}' not found in registry.`);
  }

  const club = database.clubs[clubId];
  if (!club) {
    throw new Error(`Football club '${clubId}' not found.`);
  }

  if (club.serverId !== serverId) {
    throw new Error(`Club '${club.name}' does not belong to server '${server.name}'.`);
  }

  // Idempotent success if user already manages this exact club
  if (club.managerId === userId) {
    user.activeClubId = club.id;
    user.activeServerId = server.id;
    saveDatabaseSync();
    return { club, server };
  }

  // Prevent multiple managers claiming the same club
  if (club.managerId && club.managerId !== userId) {
    throw new Error(`Club '${club.name}' is already managed by @${club.managerUsername || 'another manager'}. Please select a vacant club.`);
  }

  // Prevent a user from claiming multiple clubs across the game
  const currentClub = Object.values(database.clubs).find((c) => c.managerId === userId && c.id !== clubId);
  if (currentClub) {
    throw new Error(`You already manage ${currentClub.name} on server ${currentClub.serverId}. Manager Nol permits only one active club per manager. Resign first to take a new appointment.`);
  }

  // Assign club to user atomically
  club.managerId = userId;
  club.managerUsername = user.username;
  if (!club.transferBudget || club.transferBudget <= 0) {
    club.transferBudget = 100000000;
  }
  club.claimedAt = new Date().toISOString();

  user.activeClubId = club.id;
  user.activeServerId = server.id;

  // Publish Server News announcement of the appointment
  const newsId = `news_${crypto.randomUUID()}`;
  database.news[newsId] = {
    id: newsId,
    serverId: server.id,
    category: 'Club Announcements',
    title: `${club.name} Appoints @${user.username} as Manager`,
    description: `${club.name} has officially appointed manager @${user.username}. The board has provided an immediate €100,000,000 Warchest to build a championship roster!`,
    timestamp: new Date().toISOString(),
    homeClubId: club.id,
    homeClubName: club.name,
  };

  saveDatabaseSync();
  return { club, server };
}


export function resignClub(userId: string): ClubRecord {
  const database = initDatabase();
  const user = database.users[userId];
  if (!user || !user.activeClubId) throw new Error('No club to resign from');

  const club = database.clubs[user.activeClubId];
  if (!club) throw new Error('Club not found');

  club.managerId = null;
  club.managerUsername = null;
  club.lineup = null; // Clear lineup on resign

  user.activeClubId = null;
  user.activeServerId = null;

  saveDatabaseSync();
  return club;
}

export function updateLineup(userId: string, lineup: LineupConfig): ClubRecord {
  const database = initDatabase();
  const user = database.users[userId];
  if (!user || !user.activeClubId) throw new Error('No active club');

  const club = database.clubs[user.activeClubId];
  if (!club || club.managerId !== userId) throw new Error('Unauthorized');

  if (!['Medium', 'High', 'Extreme'].includes(lineup.teamEffort)) {
    throw new Error('Invalid team effort setting');
  }

  // Validate Lineup: 11 unique players belonging to club
  if (lineup.startingPlayers.length !== 11) throw new Error('Lineup must have 11 players');
  const playerIds = new Set(lineup.startingPlayers.map(p => p.playerId));
  if (playerIds.size !== 11) throw new Error('Duplicate players in lineup');
  
  const squadIds = new Set(club.squad.map(p => p.id));
  for (const pid of playerIds) {
    if (!squadIds.has(pid)) throw new Error('Player not in squad');
  }

  club.lineup = lineup;
  saveDatabaseSync();
  return club;
}

// ----------------------------------------------------
// 3. TRANSFER MARKET CORE FUNCTIONS
// ----------------------------------------------------

export function listPlayerForSale(userId: string, playerId: string, askingPrice: number): TransferListingRecord {
  const database = initDatabase();
  const user = database.users[userId];
  if (!user || !user.activeClubId || !user.activeServerId) {
    throw new Error('You must be managing an active club to list players for sale.');
  }

  const club = database.clubs[user.activeClubId];
  if (!club || club.managerId !== userId) {
    throw new Error('Unauthorized: You do not manage this club.');
  }

  const player = club.squad.find((p) => p.id === playerId);
  if (!player) {
    throw new Error('Player not found in your club roster.');
  }

  // Prevent duplicate active listings for the same player
  for (const l of Object.values(database.listings)) {
    if (l.player.id === playerId && (l.status === 'Active' || l.status === 'UnderOffer')) {
      throw new Error(`Player ${player.name} is already actively listed on the Transfer Market.`);
    }
  }

  if (askingPrice <= 0 || !Number.isFinite(askingPrice)) {
    throw new Error('Asking price must be a valid positive amount.');
  }

  const marketValuation = calculatePlayerValuation(player);
  player.isTransferListed = true;
  player.askingPrice = askingPrice;

  const listingId = `list_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  const listing: TransferListingRecord = {
    id: listingId,
    serverId: user.activeServerId,
    sellerClubId: club.id,
    sellerClubName: club.name,
    sellerUserId: user.id,
    sellerUsername: user.username,
    player: { ...player },
    askingPrice: Math.round(askingPrice),
    marketValuation,
    status: 'Active',
    createdAt: now,
  };

  database.listings[listingId] = listing;

  // Publish Server News Article (isolated to this server)
  const ovr = Math.round(
    (player.pace + player.shooting + player.passing + player.dribbling + player.defending + player.physical) / 6
  );
  const newsId = `news_${crypto.randomUUID()}`;
  database.news[newsId] = {
    id: newsId,
    serverId: user.activeServerId,
    category: 'Transfer News',
    title: `${player.name} Listed for Transfer by ${club.name}`,
    description: `${club.name} manager @${user.username} has made ${player.position} ${player.name} (OVR ${ovr}) available for transfer at an asking price of €${Math.round(askingPrice).toLocaleString()}.`,
    timestamp: now,
    playerId: player.id,
    playerName: player.name,
    transferFee: Math.round(askingPrice),
    homeClubId: club.id,
    homeClubName: club.name,
  };

  saveDatabaseSync();
  return listing;
}

export function withdrawTransferListing(userId: string, listingId: string): TransferListingRecord {
  const database = initDatabase();
  const listing = database.listings[listingId];
  if (!listing) throw new Error('Listing not found.');

  if (listing.sellerUserId !== userId) {
    throw new Error('Unauthorized: You can only withdraw your own listings.');
  }

  if (listing.status === 'UnderOffer') {
    throw new Error('Cannot withdraw listing: A transfer offer has been accepted and contract terms are under active negotiation.');
  }

  if (listing.status === 'Completed') {
    throw new Error('Cannot withdraw listing: Transfer has already been completed.');
  }

  listing.status = 'Withdrawn';
  listing.updatedAt = new Date().toISOString();

  // Update club squad player record
  const club = database.clubs[listing.sellerClubId];
  if (club) {
    const player = club.squad.find((p) => p.id === listing.player.id);
    if (player) {
      player.isTransferListed = false;
      delete player.askingPrice;
    }
  }

  saveDatabaseSync();
  return listing;
}

export function getServerListings(
  serverId: string,
  filters?: { position?: string; minOvr?: number; maxPrice?: number; search?: string }
): TransferListingRecord[] {
  const database = initDatabase();
  
  // STRICT SERVER ISOLATION: Only listings for this server!
  let serverListings = Object.values(database.listings).filter(
    (l) => l.serverId === serverId && (l.status === 'Active' || l.status === 'UnderOffer')
  );

  if (filters?.position && filters.position !== 'All') {
    serverListings = serverListings.filter(
      (l) => l.player.position === filters.position || l.player.positionCategory === filters.position
    );
  }

  if (filters?.minOvr) {
    serverListings = serverListings.filter((l) => {
      const ovr = Math.round(
        (l.player.pace + l.player.shooting + l.player.passing + l.player.dribbling + l.player.defending + l.player.physical) / 6
      );
      return ovr >= filters.minOvr!;
    });
  }

  if (filters?.maxPrice) {
    serverListings = serverListings.filter((l) => l.askingPrice <= filters.maxPrice!);
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    serverListings = serverListings.filter(
      (l) =>
        l.player.name.toLowerCase().includes(q) ||
        l.sellerClubName.toLowerCase().includes(q) ||
        l.player.nationality.toLowerCase().includes(q)
    );
  }

  // Attach sellerClubLogo for instant rendering
  const enrichedListings = serverListings.map((l) => ({
    ...l,
    sellerClubLogo: database.clubs[l.sellerClubId]?.logoSvg,
  }));

  // Sort newest first
  return enrichedListings.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getUserActiveListings(userId: string): (TransferListingRecord & { sellerClubLogo?: string })[] {
  const database = initDatabase();
  const listings = Object.values(database.listings).filter(
    (l) => l.sellerUserId === userId && (l.status === 'Active' || l.status === 'UnderOffer')
  );
  return listings.map((l) => ({
    ...l,
    sellerClubLogo: database.clubs[l.sellerClubId]?.logoSvg,
  }));
}

export function makeTransferOffer(
  userId: string,
  listingId: string,
  offerAmount: number
): TransferOfferRecord {
  const database = initDatabase();
  const buyerUser = database.users[userId];
  if (!buyerUser || !buyerUser.activeClubId || !buyerUser.activeServerId) {
    throw new Error('You must be managing an active club on this server to submit transfer offers.');
  }

  const buyerClub = database.clubs[buyerUser.activeClubId];
  if (!buyerClub || buyerClub.managerId !== userId) {
    throw new Error('Unauthorized: Could not verify buyer club ownership.');
  }

  const listing = database.listings[listingId];
  if (!listing) {
    throw new Error('Transfer listing not found.');
  }

  // Server isolation check
  if (listing.serverId !== buyerUser.activeServerId) {
    throw new Error('Cross-server transfers are prohibited. You can only trade with clubs on your assigned server.');
  }

  // Prevent self-purchase
  if (listing.sellerUserId === userId || listing.sellerClubId === buyerClub.id) {
    throw new Error('Self-purchase prohibited: You cannot bid on your own player.');
  }

  if (listing.status !== 'Active') {
    throw new Error(`This player is currently ${listing.status.toLowerCase()} and cannot accept new bids.`);
  }

  if (!offerAmount || offerAmount <= 0 || !Number.isFinite(offerAmount)) {
    throw new Error('Please specify a valid numeric transfer offer amount.');
  }

  // Re-verify buyer has sufficient funds
  if (buyerClub.transferBudget < offerAmount) {
    throw new Error(
      `Insufficient warchest: Your club has €${buyerClub.transferBudget.toLocaleString()} available, but the bid is €${offerAmount.toLocaleString()}.`
    );
  }

  // Prevent duplicate pending offers for the same listing by the same buyer
  for (const off of Object.values(database.offers)) {
    if (off.listingId === listingId && off.buyerUserId === userId && off.status === 'Pending') {
      throw new Error('You already have an active pending offer for this player. Await seller review.');
    }
  }

  const now = new Date().toISOString();
  const offerId = `off_${crypto.randomUUID()}`;
  const ovr = Math.round(
    (listing.player.pace + listing.player.shooting + listing.player.passing + listing.player.dribbling + listing.player.defending + listing.player.physical) / 6
  );

  const offer: TransferOfferRecord = {
    id: offerId,
    listingId,
    serverId: listing.serverId,
    playerId: listing.player.id,
    playerName: listing.player.name,
    playerOvr: ovr,
    playerPosition: listing.player.position,
    sellerClubId: listing.sellerClubId,
    sellerClubName: listing.sellerClubName,
    sellerUserId: listing.sellerUserId,
    buyerClubId: buyerClub.id,
    buyerClubName: buyerClub.name,
    buyerUserId: buyerUser.id,
    buyerUsername: buyerUser.username,
    offerAmount: Math.round(offerAmount),
    status: 'Pending',
    createdAt: now,
  };

  database.offers[offerId] = offer;

  // 1. Notify Seller in Persistent Inbox (if human manager)
  if (!listing.sellerUserId.startsWith('ai_board_')) {
    const msgId = `msg_${crypto.randomUUID()}`;
    database.inbox[msgId] = {
      id: msgId,
      userId: listing.sellerUserId,
      serverId: listing.serverId,
      type: 'incoming_offer',
      title: `Transfer Bid: €${offer.offerAmount.toLocaleString()} for ${listing.player.name}`,
      summary: `${buyerClub.name} manager @${buyerUser.username} has submitted an official transfer offer of €${offer.offerAmount.toLocaleString()} for ${listing.player.position} ${listing.player.name} (OVR ${ovr}).`,
      details: `Offer Amount: €${offer.offerAmount.toLocaleString()} · Asking Price: €${listing.askingPrice.toLocaleString()} · Market Valuation: €${listing.marketValuation.toLocaleString()}`,
      timestamp: now,
      read: false,
      relatedListingId: listingId,
      relatedOfferId: offerId,
      actionType: 'view_offer',
    };
  }

  // 2. Publish Server News
  const newsId = `news_${crypto.randomUUID()}`;
  database.news[newsId] = {
    id: newsId,
    serverId: listing.serverId,
    category: 'Incoming Transfer Offers',
    title: `Official Bid Submitted for ${listing.player.name}`,
    description: `${buyerClub.name} have submitted an official bid of €${offer.offerAmount.toLocaleString()} to ${listing.sellerClubName} for ${listing.player.position} ${listing.player.name}.`,
    timestamp: now,
    homeClubId: listing.sellerClubId,
    homeClubName: listing.sellerClubName,
    awayClubId: buyerClub.id,
    awayClubName: buyerClub.name,
    playerId: listing.player.id,
    playerName: listing.player.name,
    transferFee: offer.offerAmount,
  };

  // 3. Computer AI Club Board Auto-Evaluation (if unmanaged club)
  if (listing.sellerUserId.startsWith('ai_board_')) {
    const acceptableThreshold = Math.min(listing.askingPrice, listing.marketValuation) * 0.9;
    if (offer.offerAmount >= acceptableThreshold) {
      // Board accepts the offer!
      offer.status = 'Accepted';
      offer.resolvedAt = now;
      listing.status = 'UnderOffer';

      // Create Contract Proposal for the buyer
      const contractId = `con_${crypto.randomUUID()}`;
      const suggestedWage = calculateSuggestedWeeklyWage(listing.player);
      const contract: ContractProposalRecord = {
        id: contractId,
        offerId: offer.id,
        listingId: listing.id,
        serverId: listing.serverId,
        buyerUserId: buyerUser.id,
        buyerClubId: buyerClub.id,
        sellerUserId: listing.sellerUserId,
        sellerClubId: listing.sellerClubId,
        playerId: listing.player.id,
        player: { ...listing.player },
        transferFee: offer.offerAmount,
        suggestedWage,
        weeklyWage: suggestedWage,
        contractYears: 3,
        teamRole: 'Regular Starter',
        status: 'PendingAgreed',
        createdAt: now,
      };

      offer.contractId = contractId;
      database.contracts[contractId] = contract;

      // Notify Buyer in Inbox
      const buyerMsgId = `msg_${crypto.randomUUID()}`;
      database.inbox[buyerMsgId] = {
        id: buyerMsgId,
        userId: buyerUser.id,
        serverId: listing.serverId,
        type: 'offer_accepted',
        title: `Bid Accepted: ${listing.player.name} - Negotiate Terms`,
        summary: `${listing.sellerClubName} have accepted your €${offer.offerAmount.toLocaleString()} transfer offer for ${listing.player.name}! Please finalize personal contract terms.`,
        details: `Transfer Fee: €${offer.offerAmount.toLocaleString()} · Suggested Weekly Wage: €${suggestedWage.toLocaleString()}/wk.`,
        timestamp: now,
        read: false,
        relatedListingId: listing.id,
        relatedOfferId: offer.id,
        relatedContractId: contractId,
        actionType: 'negotiate_contract',
      };

      // Server News for Accepted Fee
      const acceptedNewsId = `news_${crypto.randomUUID()}`;
      database.news[acceptedNewsId] = {
        id: acceptedNewsId,
        serverId: listing.serverId,
        category: 'Contract Negotiations',
        title: `Transfer Fee Agreed: ${listing.sellerClubName} & ${buyerClub.name} for ${listing.player.name}`,
        description: `${listing.sellerClubName} have accepted a €${offer.offerAmount.toLocaleString()} bid from ${buyerClub.name} for ${listing.player.name}. The player has been granted permission to open personal contract negotiations.`,
        timestamp: now,
        homeClubId: listing.sellerClubId,
        homeClubName: listing.sellerClubName,
        awayClubId: buyerClub.id,
        awayClubName: buyerClub.name,
        playerId: listing.player.id,
        playerName: listing.player.name,
        transferFee: offer.offerAmount,
      };
    }
  }

  saveDatabaseSync();
  return offer;
}

export function getUserOffers(userId: string): {
  incoming: TransferOfferRecord[];
  outgoing: TransferOfferRecord[];
} {
  const database = initDatabase();
  const incoming = Object.values(database.offers).filter((o) => o.sellerUserId === userId);
  const outgoing = Object.values(database.offers).filter((o) => o.buyerUserId === userId);

  const sortByDate = (a: TransferOfferRecord, b: TransferOfferRecord) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

  return {
    incoming: incoming.sort(sortByDate),
    outgoing: outgoing.sort(sortByDate),
  };
}

export function respondToTransferOffer(
  userId: string,
  offerId: string,
  decision: 'accept' | 'reject',
  reason?: string
): { offer: TransferOfferRecord; contract?: ContractProposalRecord } {
  const database = initDatabase();
  const offer = database.offers[offerId];
  if (!offer) throw new Error('Transfer offer not found.');

  if (offer.sellerUserId !== userId) {
    throw new Error('Unauthorized: Only the selling club manager can accept or reject this offer.');
  }

  if (offer.status !== 'Pending') {
    throw new Error(`This offer has already been marked as ${offer.status}.`);
  }

  const listing = database.listings[offer.listingId];
  if (!listing) throw new Error('Associated listing not found.');

  const now = new Date().toISOString();

  if (decision === 'reject') {
    offer.status = 'Rejected';
    offer.resolvedAt = now;
    offer.rejectionReason = reason || 'Offer did not meet club valuation or tactical squad requirements.';

    // Notify Buyer in Persistent Inbox
    const msgId = `msg_${crypto.randomUUID()}`;
    database.inbox[msgId] = {
      id: msgId,
      userId: offer.buyerUserId,
      serverId: offer.serverId,
      type: 'offer_rejected',
      title: `Offer Rejected: ${offer.playerName}`,
      summary: `${offer.sellerClubName} rejected your €${offer.offerAmount.toLocaleString()} transfer offer for ${offer.playerName}. Reason: ${offer.rejectionReason}`,
      details: `Your transfer budget remains untouched at €${database.clubs[offer.buyerClubId]?.transferBudget.toLocaleString()}.`,
      timestamp: now,
      read: false,
      relatedListingId: offer.listingId,
      relatedOfferId: offer.id,
      actionType: 'none',
    };

    saveDatabaseSync();
    return { offer };
  }

  // ACCEPT FLOW
  // 1. Confirm listing and player availability
  if (listing.status !== 'Active') {
    throw new Error(`Listing is no longer active (current status: ${listing.status}).`);
  }

  const sellerClub = database.clubs[offer.sellerClubId];
  if (!sellerClub) throw new Error('Seller club not found.');

  const playerExists = sellerClub.squad.some((p) => p.id === offer.playerId);
  if (!playerExists) throw new Error('Player is no longer registered in your club squad.');

  // 2. Revalidate buyer's funds
  const buyerClub = database.clubs[offer.buyerClubId];
  if (!buyerClub || buyerClub.transferBudget < offer.offerAmount) {
    throw new Error('Transaction cancelled: Buyer no longer has sufficient transfer funds.');
  }

  // 3. Lock listing to 'UnderOffer' and mark offer 'Accepted'
  offer.status = 'Accepted';
  offer.resolvedAt = now;
  listing.status = 'UnderOffer';
  listing.updatedAt = now;

  // 4. Reject competing pending offers on this listing
  for (const otherOffer of Object.values(database.offers)) {
    if (otherOffer.listingId === listing.id && otherOffer.id !== offer.id && otherOffer.status === 'Pending') {
      otherOffer.status = 'Rejected';
      otherOffer.resolvedAt = now;
      otherOffer.rejectionReason = 'Seller accepted a competing transfer bid from another club.';

      const compMsgId = `msg_${crypto.randomUUID()}`;
      database.inbox[compMsgId] = {
        id: compMsgId,
        userId: otherOffer.buyerUserId,
        serverId: otherOffer.serverId,
        type: 'offer_rejected',
        title: `Offer Closed: ${offer.playerName}`,
        summary: `Your bid of €${otherOffer.offerAmount.toLocaleString()} for ${offer.playerName} was rejected because ${offer.sellerClubName} accepted a competing transfer offer.`,
        details: 'You may browse other players on the transfer market.',
        timestamp: now,
        read: false,
        actionType: 'none',
      };
    }
  }

  // 5. Create Contract Negotiation Proposal for buyer
  const contractId = `con_${crypto.randomUUID()}`;
  const suggestedWage = calculateSuggestedWeeklyWage(listing.player);
  const contract: ContractProposalRecord = {
    id: contractId,
    offerId: offer.id,
    listingId: listing.id,
    serverId: listing.serverId,
    buyerUserId: offer.buyerUserId,
    buyerClubId: offer.buyerClubId,
    sellerUserId: offer.sellerUserId,
    sellerClubId: offer.sellerClubId,
    playerId: listing.player.id,
    player: { ...listing.player },
    transferFee: offer.offerAmount,
    suggestedWage,
    weeklyWage: suggestedWage,
    contractYears: 3,
    teamRole: 'Regular Starter',
    status: 'PendingAgreed',
    createdAt: now,
  };

  offer.contractId = contractId;
  database.contracts[contractId] = contract;

  // 6. Notify Buyer in Inbox to open Contract Negotiation
  const buyerMsgId = `msg_${crypto.randomUUID()}`;
  database.inbox[buyerMsgId] = {
    id: buyerMsgId,
    userId: offer.buyerUserId,
    serverId: offer.serverId,
    type: 'offer_accepted',
    title: `Offer Accepted: ${offer.playerName} - Negotiate Terms`,
    summary: `${offer.sellerClubName} accepted your €${offer.offerAmount.toLocaleString()} transfer fee! Please open personal contract negotiations to complete the signing.`,
    details: `Transfer Fee: €${offer.offerAmount.toLocaleString()} · Suggested Weekly Wage: €${suggestedWage.toLocaleString()}/wk.`,
    timestamp: now,
    read: false,
    relatedListingId: listing.id,
    relatedOfferId: offer.id,
    relatedContractId: contractId,
    actionType: 'negotiate_contract',
  };

  // 7. Publish Server News
  const newsId = `news_${crypto.randomUUID()}`;
  database.news[newsId] = {
    id: newsId,
    serverId: listing.serverId,
    category: 'Contract Negotiations',
    title: `Transfer Fee Agreed: ${offer.sellerClubName} & ${offer.buyerClubName} for ${offer.playerName}`,
    description: `${offer.sellerClubName} have accepted a €${offer.offerAmount.toLocaleString()} bid from ${offer.buyerClubName} for ${offer.playerName}. Personal terms are now under active negotiation.`,
    timestamp: now,
    homeClubId: offer.sellerClubId,
    homeClubName: offer.sellerClubName,
    awayClubId: offer.buyerClubId,
    awayClubName: offer.buyerClubName,
    playerId: listing.player.id,
    playerName: listing.player.name,
    transferFee: offer.offerAmount,
  };

  saveDatabaseSync();
  return { offer, contract };
}

export function getContractProposal(userId: string, contractId: string): ContractProposalRecord {
  const database = initDatabase();
  const contract = database.contracts[contractId];
  if (!contract) throw new Error('Contract negotiation record not found.');

  if (contract.buyerUserId !== userId) {
    throw new Error('Unauthorized: You can only negotiate contracts for your own accepted offers.');
  }

  return contract;
}

// ----------------------------------------------------
// 7. ATOMIC TRANSFER COMPLETION TRANSACTION
// ----------------------------------------------------

export function completeContractNegotiation(
  userId: string,
  contractId: string,
  terms: { weeklyWage: number; contractYears: number; teamRole: string }
): {
  buyerClub: ClubRecord;
  sellerClub: ClubRecord;
  player: Player;
  transferredPlayer: Player;
  contract: ContractProposalRecord;
  transferDetails: {
    player: Player;
    playerName: string;
    transferFee: number;
    weeklyWage: number;
    contractYears: number;
    teamRole: string;
  };
} {
  const database = initDatabase();
  const contract = database.contracts[contractId];
  if (!contract) throw new Error('Contract record not found.');

  if (contract.buyerUserId !== userId) {
    throw new Error('Unauthorized: Only the acquiring manager can complete this contract.');
  }

  if (contract.status !== 'PendingAgreed') {
    throw new Error(`Contract cannot be signed: status is already ${contract.status}.`);
  }

  const listing = database.listings[contract.listingId];
  if (!listing) throw new Error('Associated listing not found.');

  const offer = database.offers[contract.offerId];
  if (!offer) throw new Error('Associated offer not found.');

  const sellerClub = database.clubs[contract.sellerClubId];
  const buyerClub = database.clubs[contract.buyerClubId];
  if (!sellerClub || !buyerClub) throw new Error('Clubs participating in transfer not found.');

  // Validate Seller Still Owns Player
  const playerIndex = sellerClub.squad.findIndex((p) => p.id === contract.playerId);
  if (playerIndex === -1) {
    throw new Error('Transfer aborted: Player is no longer registered in the seller club squad.');
  }

  // Validate Buyer Has Sufficient Funds
  if (buyerClub.transferBudget < contract.transferFee) {
    throw new Error(
      `Insufficient funds: Buyer club has €${buyerClub.transferBudget.toLocaleString()}, but transfer fee is €${contract.transferFee.toLocaleString()}.`
    );
  }

  // Validate terms
  if (!terms.weeklyWage || terms.weeklyWage < 5000 || terms.weeklyWage > 1000000) {
    throw new Error('Weekly wage must be between €5,000 and €1,000,000.');
  }

  if (!terms.contractYears || terms.contractYears < 1 || terms.contractYears > 5) {
    throw new Error('Contract length must be between 1 and 5 years.');
  }

  const validRole = TEAM_ROLES.some((r) => r.role === terms.teamRole);
  if (!validRole) {
    throw new Error('Invalid squad team role selected.');
  }

  const now = new Date().toISOString();

  // ATOMIC STEP 1: FINANCIAL TRANSFER
  buyerClub.transferBudget -= contract.transferFee;
  sellerClub.transferBudget += contract.transferFee;

  // ATOMIC STEP 2: REMOVE PLAYER FROM SELLER
  const [transferredPlayer] = sellerClub.squad.splice(playerIndex, 1);

  // If player was in seller's active starting lineup, remove them
  if (sellerClub.lineup && sellerClub.lineup.startingPlayers) {
    sellerClub.lineup.startingPlayers = sellerClub.lineup.startingPlayers.filter(
      (sp) => sp.playerId !== transferredPlayer.id
    );
  }

  // ATOMIC STEP 3: CONFIGURE NEW TERMS ON PLAYER AND ADD TO BUYER
  transferredPlayer.wage = terms.weeklyWage;
  transferredPlayer.contractYears = terms.contractYears;
  transferredPlayer.teamRole = terms.teamRole;
  transferredPlayer.isTransferListed = false;
  delete transferredPlayer.askingPrice;

  // Re-number player if needed in new club
  const existingNumbers = new Set(buyerClub.squad.map((p) => p.number));
  if (existingNumbers.has(transferredPlayer.number)) {
    let nextNum = 1;
    while (existingNumbers.has(nextNum)) nextNum++;
    transferredPlayer.number = nextNum;
  }

  buyerClub.squad.push(transferredPlayer);

  // ATOMIC STEP 4: UPDATE TRANSACTION RECORDS
  contract.weeklyWage = terms.weeklyWage;
  contract.contractYears = terms.contractYears;
  contract.teamRole = terms.teamRole;
  contract.status = 'Completed';
  contract.completedAt = now;

  offer.status = 'Completed';
  listing.status = 'Completed';
  listing.updatedAt = now;

  // ATOMIC STEP 5: PUBLISH SERVER COMPLETED-TRANSFER NEWS
  const newsId = `news_${crypto.randomUUID()}`;
  database.news[newsId] = {
    id: newsId,
    serverId: contract.serverId,
    category: 'Completed Transfers',
    title: `OFFICIAL: ${transferredPlayer.name} Signs for ${buyerClub.name}!`,
    description: `${buyerClub.name} have officially completed the blockbuster signing of ${transferredPlayer.position} ${transferredPlayer.name} from ${sellerClub.name} for an agreed fee of €${contract.transferFee.toLocaleString()}. The player penned a ${terms.contractYears}-year contract earning €${terms.weeklyWage.toLocaleString()}/wk under the ${terms.teamRole} tactical profile.`,
    timestamp: now,
    homeClubId: sellerClub.id,
    homeClubName: sellerClub.name,
    awayClubId: buyerClub.id,
    awayClubName: buyerClub.name,
    playerId: transferredPlayer.id,
    playerName: transferredPlayer.name,
    transferFee: contract.transferFee,
    teamRole: terms.teamRole,
    contractYears: terms.contractYears,
  };

  // ATOMIC STEP 6: NOTIFY BOTH BUYER & SELLER IN PERSISTENT INBOX
  // Buyer notification
  const buyerMsgId = `msg_${crypto.randomUUID()}`;
  database.inbox[buyerMsgId] = {
    id: buyerMsgId,
    userId: contract.buyerUserId,
    serverId: contract.serverId,
    type: 'transfer_completed',
    title: `Transfer Finalized: ${transferredPlayer.name} Joined!`,
    summary: `Transfer complete! ${transferredPlayer.name} has signed terms and joined ${buyerClub.name}. Fee: €${contract.transferFee.toLocaleString()} · Wage: €${terms.weeklyWage.toLocaleString()}/wk.`,
    details: `Role: ${terms.teamRole} · Contract Duration: ${terms.contractYears} Years · Kit #${transferredPlayer.number}. Player is ready for match selection in the Tactics & Lineup tab.`,
    timestamp: now,
    read: false,
    relatedListingId: listing.id,
    relatedOfferId: offer.id,
    relatedContractId: contract.id,
    actionType: 'none',
  };

  // Seller notification (if managed by human)
  if (!contract.sellerUserId.startsWith('ai_board_')) {
    const sellerMsgId = `msg_${crypto.randomUUID()}`;
    database.inbox[sellerMsgId] = {
      id: sellerMsgId,
      userId: contract.sellerUserId,
      serverId: contract.serverId,
      type: 'transfer_completed',
      title: `Player Sold: ${transferredPlayer.name}`,
      summary: `${transferredPlayer.name} has completed their transfer to ${buyerClub.name}. Exactly €${contract.transferFee.toLocaleString()} has been added to your transfer warchest!`,
      details: `Updated club budget: €${sellerClub.transferBudget.toLocaleString()}.`,
      timestamp: now,
      read: false,
      relatedListingId: listing.id,
      relatedOfferId: offer.id,
      actionType: 'none',
    };
  }

  saveDatabaseSync();

  return {
    buyerClub,
    sellerClub,
    player: transferredPlayer,
    transferredPlayer,
    contract,
    transferDetails: {
      player: transferredPlayer,
      playerName: transferredPlayer.name,
      transferFee: contract.transferFee,
      weeklyWage: terms.weeklyWage,
      contractYears: terms.contractYears,
      teamRole: terms.teamRole,
    },
  };
}

// ----------------------------------------------------
// 4. SERVER NEWS & FIXTURES CORE FUNCTIONS
// ----------------------------------------------------

export function getServerNews(serverId: string, category?: string): (ServerNewsRecord & { homeClubLogo?: string; awayClubLogo?: string })[] {
  const database = initDatabase();
  
  // STRICT SERVER ISOLATION: Only news for this server!
  let newsList = Object.values(database.news).filter((n) => n.serverId === serverId);

  if (category && category !== 'All') {
    newsList = newsList.filter((n) => n.category === category);
  }

  return newsList
    .map((n) => ({
      ...n,
      homeClubLogo: n.homeClubId ? database.clubs[n.homeClubId]?.logoSvg : undefined,
      awayClubLogo: n.awayClubId ? database.clubs[n.awayClubId]?.logoSvg : undefined,
    }))
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

export function getServerFixtures(serverId: string): (FixtureRecord & { homeClubLogo?: string; awayClubLogo?: string })[] {
  const database = initDatabase();
  return Object.values(database.fixtures)
    .filter((f) => f.serverId === serverId)
    .map((f) => ({
      ...f,
      homeClubLogo: database.clubs[f.homeClubId]?.logoSvg,
      awayClubLogo: database.clubs[f.awayClubId]?.logoSvg,
    }))
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
}

export function simulateServerMatch(
  serverId: string,
  fixtureId?: string
): { matchReport: ServerNewsRecord; fixture: FixtureRecord } {
  const database = initDatabase();
  const serverClubs = Object.values(database.clubs).filter((c) => c.serverId === serverId);
  if (serverClubs.length < 2) throw new Error('Not enough clubs on server to simulate match.');

  let targetFixture: FixtureRecord | undefined;
  if (fixtureId) {
    targetFixture = database.fixtures[fixtureId];
  } else {
    // Find first unplayed fixture on this server
    targetFixture = Object.values(database.fixtures).find(
      (f) => f.serverId === serverId && !f.played
    );
  }

  let homeClub: ClubRecord;
  let awayClub: ClubRecord;

  if (targetFixture) {
    homeClub = database.clubs[targetFixture.homeClubId] || serverClubs[0];
    awayClub = database.clubs[targetFixture.awayClubId] || serverClubs[1];
  } else {
    // Pick two random clubs
    homeClub = serverClubs[0];
    awayClub = serverClubs[1];
    const newFixId = `fix_${serverId}_sim_${Date.now()}`;
    targetFixture = {
      id: newFixId,
      serverId,
      homeClubId: homeClub.id,
      homeClubName: homeClub.name,
      awayClubId: awayClub.id,
      awayClubName: awayClub.name,
      scheduledTime: new Date().toISOString(),
      matchday: 1,
      played: false,
    };
    database.fixtures[newFixId] = targetFixture;
  }

  // Calculate realistic match score based on squad attacking & defending ratings
  const calcTeamPower = (club: ClubRecord) => {
    const squad = club.squad || [];
    const att = Math.round(squad.filter((p) => p.positionCategory === 'Attacker').reduce((s, p) => s + p.shooting, 0) / 4 || 78);
    const mid = Math.round(squad.filter((p) => p.positionCategory === 'Midfielder').reduce((s, p) => s + p.passing, 0) / 6 || 78);
    const def = Math.round(squad.filter((p) => p.positionCategory === 'Defender').reduce((s, p) => s + p.defending, 0) / 6 || 78);
    return { att, mid, def };
  };

  const homeP = calcTeamPower(homeClub);
  const awayP = calcTeamPower(awayClub);

  // Goal probabilities based on attack vs opponent defense
  const homeChances = Math.max(0, Math.round((homeP.att + homeP.mid - awayP.def) / 18 + (Math.random() * 3 - 0.5)));
  const awayChances = Math.max(0, Math.round((awayP.att + awayP.mid - homeP.def) / 18 + (Math.random() * 3 - 0.7)));

  const homeGoals = Math.min(6, Math.max(0, Math.floor(homeChances * (0.35 + Math.random() * 0.4))));
  const awayGoals = Math.min(6, Math.max(0, Math.floor(awayChances * (0.35 + Math.random() * 0.4))));

  // Pick actual goalscorers from squads
  const homeAttackers = homeClub.squad.filter((p) => p.positionCategory === 'Attacker' || p.positionCategory === 'Midfielder');
  const awayAttackers = awayClub.squad.filter((p) => p.positionCategory === 'Attacker' || p.positionCategory === 'Midfielder');

  const goalScorers: string[] = [];
  for (let i = 0; i < homeGoals; i++) {
    const scorer = homeAttackers[i % homeAttackers.length] || homeClub.squad[8];
    const min = Math.floor(10 + Math.random() * 78);
    goalScorers.push(`${scorer.name} (${homeClub.shortCode} ${min}')`);
  }
  for (let i = 0; i < awayGoals; i++) {
    const scorer = awayAttackers[i % awayAttackers.length] || awayClub.squad[8];
    const min = Math.floor(12 + Math.random() * 76);
    goalScorers.push(`${scorer.name} (${awayClub.shortCode} ${min}')`);
  }

  // Possession calculation
  const totalMid = homeP.mid + awayP.mid;
  const homePoss = Math.round((homeP.mid / totalMid) * 100 + (Math.random() * 6 - 3));
  const awayPoss = 100 - homePoss;

  const scoreString = `${homeGoals} - ${awayGoals}`;
  const now = new Date().toISOString();

  // Accurate winner/draw description
  let title = '';
  let description = '';
  if (homeGoals === awayGoals) {
    title = `MATCH REPORT: ${homeClub.name} ${scoreString} ${awayClub.name} - Points Shared in Thrilling Draw`;
    description = `An intense tactical duel finished all square at ${homeClub.stadiumName} as ${homeClub.name} and ${awayClub.name} played out a hard-fought ${scoreString} draw.`;
  } else if (homeGoals > awayGoals) {
    title = `MATCH REPORT: ${homeClub.name} Overcome ${awayClub.name} ${scoreString}`;
    description = `${homeClub.name} secured all three points with a decisive ${scoreString} home triumph over ${awayClub.name} at ${homeClub.stadiumName}.`;
  } else {
    title = `MATCH REPORT: ${awayClub.name} Take Away Victory ${scoreString} at ${homeClub.name}`;
    description = `${awayClub.name} silenced the home crowd at ${homeClub.stadiumName} with a disciplined ${scoreString} away masterclass over ${homeClub.name}.`;
  }

  const newsId = `news_${crypto.randomUUID()}`;
  const matchReport: ServerNewsRecord = {
    id: newsId,
    serverId,
    category: 'Match Reports',
    title,
    description,
    details: goalScorers.length > 0 ? `Goalscorers: ${goalScorers.join(', ')}` : 'Clean defensive sheets on both sides.',
    timestamp: now,
    homeClubId: homeClub.id,
    homeClubName: homeClub.name,
    awayClubId: awayClub.id,
    awayClubName: awayClub.name,
    score: scoreString,
    matchStats: {
      homePossession: homePoss,
      awayPossession: awayPoss,
      homeShots: homeGoals * 2 + 5,
      awayShots: awayGoals * 2 + 4,
      homeCorners: Math.floor(Math.random() * 5) + 3,
      awayCorners: Math.floor(Math.random() * 5) + 2,
      goalScorers,
      yellowCards: [`${homeClub.shortCode} #4 (34')`, `${awayClub.shortCode} #6 (61')`],
      attendance: Math.round(homeClub.stadiumCapacity * 0.92),
      stadium: homeClub.stadiumName,
    },
  };

  database.news[newsId] = matchReport;

  targetFixture.played = true;
  targetFixture.score = scoreString;
  targetFixture.reportNewsId = newsId;

  saveDatabaseSync();
  return { matchReport, fixture: targetFixture };
}

// ----------------------------------------------------
// 8. INBOX & NOTIFICATION CENTRE FUNCTIONS
// ----------------------------------------------------

export function getUserInbox(userId: string): {
  messages: InboxMessageRecord[];
  unreadCount: number;
} {
  const database = initDatabase();
  const userMessages = Object.values(database.inbox)
    .filter((m) => m.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const unreadCount = userMessages.filter((m) => !m.read).length;
  return { messages: userMessages, unreadCount };
}

export function markInboxMessageRead(userId: string, messageId: string): void {
  const database = initDatabase();
  const message = database.inbox[messageId];
  if (message && message.userId === userId) {
    message.read = true;
    saveDatabaseSync();
  }
}

