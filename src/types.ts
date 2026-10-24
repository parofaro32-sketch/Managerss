export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  activeServerId: string | null;
  activeClubId: string | null;
}

export interface ServerItem {
  id: string;
  code: string;
  name: string;
  region: string;
  continent: 'Europe' | 'Americas' | 'Asia-Pacific' | 'International';
  basePing: number;
  claimedClubs: number;
  totalClubs: number;
}

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

export interface ClubItem {
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
  transferBudget: number; // strictly 100,000,000
  claimedAt: string | null;
  squad: Player[];
  lineup: LineupConfig | null;
  logoSvg?: string;
}

export interface TransferListingItem {
  id: string;
  serverId: string;
  sellerClubId: string;
  sellerClubName: string;
  sellerUserId: string;
  sellerUsername: string;
  sellerClubLogo?: string;
  player: Player;
  askingPrice: number;
  marketValuation: number;
  status: 'Active' | 'UnderOffer' | 'Completed' | 'Withdrawn';
  createdAt: string;
}

export interface TransferOfferItem {
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

export interface ContractProposalItem {
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
}

export type NewsCategory =
  | 'Match Reports'
  | 'Upcoming Fixtures'
  | 'Transfer News'
  | 'Incoming Transfer Offers'
  | 'Contract Negotiations'
  | 'Completed Transfers'
  | 'Club Announcements';

export interface ServerNewsItem {
  id: string;
  serverId: string;
  category: NewsCategory;
  title: string;
  description: string;
  details?: string;
  timestamp: string;
  homeClubId?: string;
  homeClubName?: string;
  homeClubLogo?: string;
  awayClubId?: string;
  awayClubName?: string;
  awayClubLogo?: string;
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

export interface InboxMessageItem {
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

export interface FixtureItem {
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

export type ViewState = 'landing' | 'servers' | 'clubs' | 'dashboard';
export type DashboardTab =
  | 'tactics'
  | 'squad'
  | 'stamina'
  | 'conditioning'
  | 'transfers'
  | 'news'
  | 'inbox'
  | 'overview'
  | 'finances'
  | 'server';

export interface TeamRoleDefinition {
  role: string;
  label: string;
  commitment: string;
  minPlayingTime: string;
  colorKey: 'amber' | 'solar' | 'emerald' | 'cyan' | 'electric-blue' | 'violet' | 'magenta' | 'lime' | 'mint' | 'orange';
}

export const TEAM_ROLES: TeamRoleDefinition[] = [
  {
    role: 'Key Player',
    label: 'Key Player',
    commitment: 'Undisputed starter in all competitions and high-stake matchdays.',
    minPlayingTime: '90%+ of starting lineups',
    colorKey: 'amber',
  },
  {
    role: 'Important Player',
    label: 'Important Player',
    commitment: 'Integral first-team pillar expected to start 80%+ of fixtures.',
    minPlayingTime: '80%+ of starting lineups',
    colorKey: 'solar',
  },
  {
    role: 'Regular Starter',
    label: 'Regular Starter',
    commitment: 'Consistent first-choice starter when match conditioning permits.',
    minPlayingTime: '70%+ of starting lineups',
    colorKey: 'emerald',
  },
  {
    role: 'First-Team Player',
    label: 'First-Team Player',
    commitment: 'Active squad member rotating between first-choice XI and dugout.',
    minPlayingTime: '55%+ of starting lineups',
    colorKey: 'cyan',
  },
  {
    role: 'Rotation Player',
    label: 'Rotation Player',
    commitment: 'Reliable tactical rotation option sharing minutes across fixture congestion.',
    minPlayingTime: '40%+ of match minutes',
    colorKey: 'electric-blue',
  },
  {
    role: 'Impact Substitute',
    label: 'Impact Substitute',
    commitment: 'High-pace tactical weapon introduced from dugout to change match momentum.',
    minPlayingTime: 'Frequent substitute appearances',
    colorKey: 'violet',
  },
  {
    role: 'Backup Player',
    label: 'Backup Player',
    commitment: 'Secondary cover, called upon during squad fatigue, rotations, or injuries.',
    minPlayingTime: 'Squad depth & cup matches',
    colorKey: 'magenta',
  },
  {
    role: 'Prospect',
    label: 'Prospect',
    commitment: 'High-potential emerging talent receiving tailored first-team development.',
    minPlayingTime: 'Controlled first-team minutes',
    colorKey: 'lime',
  },
  {
    role: 'Youth Prospect',
    label: 'Youth Prospect',
    commitment: 'Academy graduate learning club system through cup fixtures & training.',
    minPlayingTime: 'Developmental roster',
    colorKey: 'mint',
  },
  {
    role: 'Emergency Cover',
    label: 'Emergency Cover',
    commitment: 'Registration insurance providing emergency squad depth when required.',
    minPlayingTime: 'Contingency cover only',
    colorKey: 'orange',
  },
];

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

