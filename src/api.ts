import { User, ServerItem, ClubItem } from './types.ts';

const TOKEN_KEY = 'manager_nol_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.error('Failed to store token', err);
  }
}

export function removeStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.error('Failed to remove token', err);
  }
}

// Base URL for production backend (supports external backend deployment or same-domain serverless)
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  async register(username: string, password: string, email?: string) {
    const data = await request<{ success: boolean; user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email }),
    });
    setStoredToken(data.token);
    return data;
  },

  async login(identifier: string, password: string) {
    const data = await request<{
      success: boolean;
      user: User;
      token: string;
      activeClub: ClubItem | null;
      activeServer: ServerItem | null;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    setStoredToken(data.token);
    return data;
  },

  async getMe() {
    return request<{
      success: boolean;
      user: User;
      activeClub: ClubItem | null;
      activeServer: ServerItem | null;
    }>('/api/auth/me');
  },

  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      removeStoredToken();
    }
  },

  async getServers() {
    return request<{ success: boolean; totalCount: number; servers: ServerItem[] }>('/api/servers');
  },

  async getServerClubs(serverId: string) {
    return request<{
      success: boolean;
      server: ServerItem;
      totalClubs: number;
      clubs: ClubItem[];
    }>(`/api/servers/${serverId}/clubs`);
  },

  async claimClub(serverId: string, clubId: string) {
    return request<{
      success: boolean;
      message: string;
      club: ClubItem;
      server: ServerItem;
    }>('/api/clubs/claim', {
      method: 'POST',
      body: JSON.stringify({ serverId, clubId }),
    });
  },

  async getDashboard() {
    return request<{
      success: boolean;
      user: User;
      club: ClubItem | null;
      server: ServerItem | null;
      transferBudget: number;
    }>('/api/manager/dashboard');
  },

  async updateLineup(lineup: any) {
    return request<{
      success: boolean;
      club: ClubItem;
    }>('/api/clubs/lineup', {
      method: 'POST',
      body: JSON.stringify({ lineup }),
    });
  },

  async resignClub() {
    return request<{
      success: boolean;
      message: string;
    }>('/api/clubs/resign', {
      method: 'POST',
    });
  },

  async getStats() {
    return request<{
      app: string;
      status: string;
      serverCount: number;
      totalClubsWorldwide: number;
      startingBudgetEur: number;
    }>('/api/stats');
  },

  // Transfer Market API
  async getTransferListings(serverId: string, params?: { position?: string; minOvr?: number; maxPrice?: number; search?: string }) {
    const query = new URLSearchParams();
    if (params?.position) query.append('position', params.position);
    if (params?.minOvr) query.append('minOvr', String(params.minOvr));
    if (params?.maxPrice) query.append('maxPrice', String(params.maxPrice));
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return request<{ success: boolean; listings: any[] }>(`/api/transfers/${serverId}/listings${qs ? `?${qs}` : ''}`);
  },

  async listPlayerForSale(playerId: string, askingPrice: number) {
    return request<{ success: boolean; listing: any; message: string }>('/api/transfers/list', {
      method: 'POST',
      body: JSON.stringify({ playerId, askingPrice }),
    });
  },

  async withdrawTransferListing(listingId: string) {
    return request<{ success: boolean; message: string }>('/api/transfers/withdraw', {
      method: 'POST',
      body: JSON.stringify({ listingId }),
    });
  },

  async makeTransferOffer(listingId: string, offerAmount: number) {
    return request<{ success: boolean; offer: any; message: string }>('/api/transfers/offer', {
      method: 'POST',
      body: JSON.stringify({ listingId, offerAmount }),
    });
  },

  async getUserOffers() {
    return request<{
      success: boolean;
      incoming: any[];
      outgoing: any[];
      myListings?: any[];
    }>('/api/transfers/my-offers');
  },

  async respondToTransferOffer(offerId: string, decision: 'accept' | 'reject', reason?: string) {
    return request<{ success: boolean; offer: any; contract?: any; message: string }>('/api/transfers/offer/respond', {
      method: 'POST',
      body: JSON.stringify({ offerId, decision, reason }),
    });
  },

  async getContractProposal(contractId: string) {
    return request<{ success: boolean; contract: any }>('/api/transfers/contract/' + contractId);
  },

  async completeContractNegotiation(contractId: string, terms: { weeklyWage: number; contractYears: number; teamRole: string }) {
    return request<{
      success: boolean;
      message: string;
      buyerClub: any;
      sellerClub: any;
      transferDetails: any;
    }>('/api/transfers/contract/complete', {
      method: 'POST',
      body: JSON.stringify({ contractId, ...terms }),
    });
  },

  // Server News API
  async getServerNews(serverId: string, category?: string) {
    const qs = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return request<{ success: boolean; news: any[]; totalCount: number }>(`/api/servers/${serverId}/news${qs}`);
  },

  async getServerFixtures(serverId: string) {
    return request<{ success: boolean; fixtures: any[] }>(`/api/servers/${serverId}/fixtures`);
  },

  async simulateFixtureMatch(serverId: string, fixtureId?: string) {
    return request<{ success: boolean; matchReport: any; fixture: any; message: string }>(`/api/servers/${serverId}/simulate-match`, {
      method: 'POST',
      body: JSON.stringify({ fixtureId }),
    });
  },

  // Inbox & Notification Centre API
  async getInbox() {
    return request<{ success: boolean; messages: any[]; unreadCount: number }>('/api/inbox');
  },

  async markInboxRead(messageId: string) {
    return request<{ success: boolean }>('/api/inbox/read', {
      method: 'POST',
      body: JSON.stringify({ messageId }),
    });
  },
};

