import express, { Request, Response, NextFunction } from 'express';
import {
  initDatabase,
  registerUser,
  loginUser,
  getSessionUser,
  logoutSession,
  getServersWithStats,
  getServerClubs,
  claimClub,
  resignClub,
  updateLineup,
  listPlayerForSale,
  withdrawTransferListing,
  getServerListings,
  getUserActiveListings,
  makeTransferOffer,
  getUserOffers,
  respondToTransferOffer,
  getContractProposal,
  completeContractNegotiation,
  getServerNews,
  getServerFixtures,
  simulateServerMatch,
  getUserInbox,
  markInboxMessageRead,
} from './db.ts';
import { buildProjectZip, ensureDownloadsDir } from './zipService.ts';

const app = express();

// Enable JSON body parsing
app.use(express.json());

// Enable CORS for all origins (vital when frontend is deployed on Vercel and backend is on separate domain)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Initialize database (ensures 30 servers and 900 clubs exist)
initDatabase();
ensureDownloadsDir();

// Helper to extract session token from Authorization header
function getAuthToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.substring(7).trim();
}

// Router for all API routes (mounted at both /api and / to ensure Vercel rewrites work seamlessly)
const apiRouter = express.Router();

// ----------------------------------------------------
// Authentication API Endpoints
// ----------------------------------------------------

apiRouter.post('/auth/register', (req: Request, res: Response): void => {
  try {
    const { username, password } = req.body;
    if (!username || !username.trim()) {
      res.status(400).json({ error: 'Username is required.' });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const { user, token } = registerUser(username, password);
    res.status(201).json({
      success: true,
      user,
      token,
      message: 'Account registered successfully.'
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

apiRouter.post('/auth/login', (req: Request, res: Response): void => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      res.status(400).json({ error: 'Username/Email and password are required.' });
      return;
    }

    const { user, token, activeClub, activeServer } = loginUser(identifier, password);
    res.json({
      success: true,
      user,
      token,
      activeClub,
      activeServer,
      message: 'Logged in successfully.'
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Login failed.' });
  }
});

apiRouter.get('/auth/me', (req: Request, res: Response): void => {
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ error: 'No session token provided.' });
    return;
  }

  const session = getSessionUser(token);
  if (!session) {
    res.status(401).json({ error: 'Session expired or invalid.' });
    return;
  }

  res.json({
    success: true,
    user: session.user,
    activeClub: session.activeClub,
    activeServer: session.activeServer,
  });
});

apiRouter.post('/auth/logout', (req: Request, res: Response): void => {
  const token = getAuthToken(req);
  if (token) {
    logoutSession(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ----------------------------------------------------
// Servers & Clubs API Endpoints
// ----------------------------------------------------

apiRouter.get('/servers', (req: Request, res: Response): void => {
  try {
    const servers = getServersWithStats();
    res.json({
      success: true,
      totalCount: servers.length, // Verified: Exactly 30
      servers,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/servers/:serverId/clubs', (req: Request, res: Response): void => {
  try {
    const { serverId } = req.params;
    const { server, clubs } = getServerClubs(serverId);
    res.json({
      success: true,
      server,
      totalClubs: clubs.length, // Exactly 30
      clubs,
    });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

const handleClubClaim = (req: Request, res: Response): void => {
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const session = getSessionUser(token);
  if (!session) {
    res.status(401).json({ error: 'Session invalid or expired. Please log in again.' });
    return;
  }

  try {
    const serverId = (req.params.serverId || req.body?.serverId || req.query?.serverId || '').toString().trim();
    const clubId = (req.params.clubId || req.body?.clubId || req.query?.clubId || '').toString().trim();

    if (!serverId) {
      res.status(400).json({ error: 'serverId is required.' });
      return;
    }
    if (!clubId) {
      res.status(400).json({ error: 'clubId is required.' });
      return;
    }

    const { club, server } = claimClub(session.user.id, serverId, clubId);
    res.json({
      success: true,
      club,
      server,
      message: `Successfully appointed as manager of ${club.name} with €100,000,000 Warchest!`,
    });
  } catch (err: any) {
    const msg = err.message || 'Club claim failed.';
    if (msg.includes('not found') || msg.includes('does not exist')) {
      res.status(404).json({ error: msg });
    } else if (msg.includes('already claimed') || msg.includes('already signed') || msg.includes('already manage')) {
      res.status(409).json({ error: msg });
    } else {
      res.status(400).json({ error: msg });
    }
  }
};

// Support all standard REST and client URL variations for club claim/selection
apiRouter.post('/clubs/claim', handleClubClaim);
apiRouter.post('/clubs/:clubId/claim', handleClubClaim);
apiRouter.post('/clubs/select', handleClubClaim);
apiRouter.post('/clubs/:clubId/select', handleClubClaim);
apiRouter.post('/servers/:serverId/clubs/:clubId/claim', handleClubClaim);
apiRouter.post('/servers/:serverId/clubs/:clubId/select', handleClubClaim);
apiRouter.post('/servers/:serverId/claim-club', handleClubClaim);

apiRouter.post('/clubs/resign', (req: Request, res: Response): void => {
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const session = getSessionUser(token);
  if (!session) {
    res.status(401).json({ error: 'Session invalid or expired.' });
    return;
  }

  try {
    const club = resignClub(session.user.id);
    session.user.activeClubId = null;
    session.user.activeServerId = null;
    res.json({
      success: true,
      club,
      user: session.user,
      message: 'Contract formally terminated. You may now seek appointment on any of the 30 servers.',
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/clubs/lineup', (req: Request, res: Response): void => {
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const session = getSessionUser(token);
  if (!session) {
    res.status(401).json({ error: 'Session invalid or expired.' });
    return;
  }

  if (!session.activeClub) {
    res.status(400).json({ error: 'You do not currently manage an active club.' });
    return;
  }

  try {
    const { formation, teamEffort, startingPlayers } = req.body;
    if (!formation || !teamEffort || !startingPlayers) {
      res.status(400).json({ error: 'Invalid lineup payload.' });
      return;
    }

    const updatedClub = updateLineup(session.activeClub.id, {
      formation,
      teamEffort,
      startingPlayers,
    });

    res.json({
      success: true,
      club: updatedClub,
      message: 'Tactical lineup, positions, and conditioning effort confirmed.',
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Transfer Market API Endpoints
// ----------------------------------------------------

apiRouter.post('/transfers/list', (req: Request, res: Response): void => {
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const session = getSessionUser(token);
  if (!session || !session.activeClub || !session.activeServer) {
    res.status(400).json({ error: 'You must manage an active club to list players.' });
    return;
  }

  try {
    const { playerId, askingPrice } = req.body;
    if (!playerId) {
      res.status(400).json({ error: 'playerId is required.' });
      return;
    }

    const listing = listPlayerForSale(
      session.user.id,
      playerId,
      Number(askingPrice)
    );

    res.status(201).json({
      success: true,
      listing,
      message: `${listing.player.name} listed on the ${session.activeServer.code} Transfer Market for €${listing.askingPrice.toLocaleString()}.`,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/transfers/withdraw', (req: Request, res: Response): void => {
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const session = getSessionUser(token);
  if (!session || !session.activeClub) {
    res.status(400).json({ error: 'Active club ownership required.' });
    return;
  }

  try {
    const { listingId } = req.body;
    if (!listingId) {
      res.status(400).json({ error: 'listingId is required.' });
      return;
    }

    const listing = withdrawTransferListing(session.user.id, listingId);
    res.json({
      success: true,
      listing,
      message: `${listing.player.name} has been withdrawn from the transfer market.`,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/transfers/:serverId/listings', (req: Request, res: Response): void => {
  try {
    const { serverId } = req.params;
    const { position, search, minOvr, maxPrice } = req.query;

    const listings = getServerListings(serverId, {
      position: position as string,
      search: search as string,
      minOvr: minOvr ? Number(minOvr) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });

    res.json({
      success: true,
      serverId,
      count: listings.length,
      listings,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/transfers/:serverId/user-active', (req: Request, res: Response): void => {
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const session = getSessionUser(token);
  if (!session) {
    res.status(401).json({ error: 'Session invalid.' });
    return;
  }

  try {
    const myListings = getUserActiveListings(session.user.id);
    res.json({
      success: true,
      myListings,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/transfers/offer', (req: Request, res: Response): void => {
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const session = getSessionUser(token);
  if (!session || !session.activeClub || !session.activeServer) {
    res.status(400).json({ error: 'Active club ownership required to make bids.' });
    return;
  }

  try {
    const { listingId, offerAmount } = req.body;
    if (!listingId || !offerAmount) {
      res.status(400).json({ error: 'listingId and offerAmount are required.' });
      return;
    }

    const offer = makeTransferOffer(
      session.user.id,
      listingId,
      Number(offerAmount)
    );

    res.status(201).json({
      success: true,
      offer,
      message: `Formal offer of €${offer.offerAmount.toLocaleString()} submitted to ${offer.sellerClubName} for ${offer.playerName}.`,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

const handleGetUserOffers = (req: Request, res: Response): void => {
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const session = getSessionUser(token);
  if (!session || !session.activeClub) {
    res.status(400).json({ error: 'Active club ownership required.' });
    return;
  }

  try {
    const { incoming, outgoing } = getUserOffers(session.user.id);
    const myListings = getUserActiveListings(session.user.id);

    res.json({
      success: true,
      incoming,
      outgoing,
      myListings,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

apiRouter.get('/transfers/offers/my', handleGetUserOffers);
apiRouter.get('/transfers/my-offers', handleGetUserOffers);

const handleRespondOffer = (req: Request, res: Response): void => {
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const session = getSessionUser(token);
  if (!session) {
    res.status(401).json({ error: 'Session invalid.' });
    return;
  }

  try {
    const offerId = req.params.offerId || req.body.offerId;
    const action = req.body.action || req.body.decision;
    const reason = req.body.reason;

    if (!offerId) {
      res.status(400).json({ error: 'offerId is required.' });
      return;
    }

    if (action !== 'accept' && action !== 'reject') {
      res.status(400).json({ error: 'Action must be "accept" or "reject".' });
      return;
    }

    const result = respondToTransferOffer(session.user.id, offerId, action, reason);

    res.json({
      success: true,
      offer: result.offer,
      contract: result.contract || null,
      message:
        action === 'accept'
          ? `Offer accepted! Personal contract terms unlocked for the acquiring manager.`
          : `Offer rejected. Notice dispatched to buyer's inbox.`,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

apiRouter.post('/transfers/offers/:offerId/respond', handleRespondOffer);
apiRouter.post('/transfers/offer/respond', handleRespondOffer);

const handleGetContract = (req: Request, res: Response): void => {
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const session = getSessionUser(token);
  if (!session) {
    res.status(401).json({ error: 'Session invalid.' });
    return;
  }

  try {
    const contractId = req.params.contractId || req.params.id;
    const contract = getContractProposal(session.user.id, contractId);
    res.json({
      success: true,
      contract,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

apiRouter.get('/transfers/contracts/:contractId', handleGetContract);
apiRouter.get('/transfers/contract/:contractId', handleGetContract);

const handleSignContract = (req: Request, res: Response): void => {
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const session = getSessionUser(token);
  if (!session || !session.activeClub) {
    res.status(400).json({ error: 'Active club ownership required.' });
    return;
  }

  try {
    const contractId = req.params.contractId || req.body.contractId;
    const { weeklyWage, contractYears, teamRole } = req.body;

    if (!contractId) {
      res.status(400).json({ error: 'contractId is required.' });
      return;
    }

    if (!weeklyWage || !contractYears || !teamRole) {
      res.status(400).json({ error: 'weeklyWage, contractYears, and teamRole are required.' });
      return;
    }

    const result = completeContractNegotiation(session.user.id, contractId, {
      weeklyWage: Number(weeklyWage),
      contractYears: Number(contractYears),
      teamRole: String(teamRole),
    });

    res.json({
      success: true,
      buyerClub: result.buyerClub,
      sellerClub: result.sellerClub,
      club: result.buyerClub,
      player: result.player,
      contract: result.contract,
      transferDetails: {
        player: result.player,
        transferFee: result.contract.transferFee,
        weeklyWage: result.contract.weeklyWage,
        contractYears: result.contract.contractYears,
      },
      message: `TRANSFER COMPLETE: ${result.player.name} signed for ${result.buyerClub.name}! Balance & roster updated atomically.`,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

apiRouter.post('/transfers/contracts/:contractId/sign', handleSignContract);
apiRouter.post('/transfers/contract/complete', handleSignContract);

// ----------------------------------------------------
// Server News & Fixtures API Endpoints
// ----------------------------------------------------

apiRouter.get('/servers/:serverId/news', (req: Request, res: Response): void => {
  try {
    const { serverId } = req.params;
    const { category } = req.query;
    const news = getServerNews(serverId, category as any);

    res.json({
      success: true,
      serverId,
      count: news.length,
      news,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/servers/:serverId/fixtures', (req: Request, res: Response): void => {
  try {
    const { serverId } = req.params;
    const fixtures = getServerFixtures(serverId);

    res.json({
      success: true,
      serverId,
      count: fixtures.length,
      fixtures,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/servers/:serverId/simulate-fixture', (req: Request, res: Response): void => {
  try {
    const { serverId } = req.params;
    const { fixtureId } = req.body || {};

    const { fixture, matchReport } = simulateServerMatch(serverId, fixtureId);

    res.json({
      success: true,
      fixture,
      matchReport,
      message: `Matchday fixture completed: ${matchReport.title}. Official journalism report published to server feed!`,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Manager Inbox & Mailbox API Endpoints
// ----------------------------------------------------

apiRouter.get('/inbox', (req: Request, res: Response): void => {
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const session = getSessionUser(token);
  if (!session) {
    res.status(401).json({ error: 'Session invalid.' });
    return;
  }

  try {
    const { messages, unreadCount } = getUserInbox(session.user.id);
    res.json({
      success: true,
      unreadCount,
      messages,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

const handleMarkInboxRead = (req: Request, res: Response): void => {
  const token = getAuthToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const session = getSessionUser(token);
  if (!session) {
    res.status(401).json({ error: 'Session invalid.' });
    return;
  }

  const messageId = req.params.messageId || req.body.messageId;
  if (!messageId) {
    res.status(400).json({ error: 'messageId is required.' });
    return;
  }

  try {
    markInboxMessageRead(session.user.id, messageId);
    res.json({ success: true, messageId });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

apiRouter.post('/inbox/:messageId/read', handleMarkInboxRead);
apiRouter.post('/inbox/read', handleMarkInboxRead);

// ----------------------------------------------------
// Project ZIP Download Endpoint
// ----------------------------------------------------

apiRouter.get('/download-zip', async (req: Request, res: Response): Promise<void> => {
  try {
    const zipFile = await buildProjectZip();
    res.download(zipFile, 'manager-nol-project.zip', (err) => {
      if (err) {
        console.error('Error sending zip download:', err);
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate project ZIP: ' + err.message });
  }
});

// Health & System Info
apiRouter.get('/stats', (req: Request, res: Response): void => {
  const servers = getServersWithStats();
  res.json({
    app: 'Manager Nol',
    status: 'online',
    serverCount: servers.length,
    totalClubsWorldwide: 900,
    startingBudgetEur: 100000000,
  });
});

// Catch-all 404 handler for API routes (always returns JSON error message)
apiRouter.use((req: Request, res: Response) => {
  res.status(404).json({
    error: `API route '${req.method} ${req.originalUrl || req.url}' not found.`
  });
});

// If a request hits the backend with a stripped '/api' prefix (e.g. from some serverless rewrite rules),
// rewrite it to '/api/...' so it matches apiRouter, but leave frontend paths untouched.
app.use((req: Request, res: Response, next: NextFunction) => {
  const apiPrefixes = ['/clubs', '/servers', '/auth', '/leagues', '/stats', '/download-zip'];
  if (apiPrefixes.some(prefix => req.path.startsWith(prefix))) {
    req.url = `/api${req.url}`;
  }
  next();
});

// Mount router on '/api' ONLY so non-API routes (GET /, Vite scripts, etc.) proceed to Vite or static middleware
app.use('/api', apiRouter);

// Global unhandled error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error.' });
});

export default app;
