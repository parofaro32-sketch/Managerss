import { 
  initDatabase, 
  registerUser, 
  claimClub, 
  listPlayerForSale,
  getServerListings,
  makeTransferOffer,
  respondToTransferOffer,
  completeContractNegotiation,
  getServerNews,
  simulateServerMatch,
  getUserInbox,
  TEAM_ROLES,
  calculateSuggestedWeeklyWage,
  calculatePlayerValuation
} from './db.ts';

async function runTransferAndNewsTests() {
  console.log('--- 🚀 RUNNING TRANSFER MARKET, SERVER NEWS & ATOMIC TRANSACTION TEST SUITE ---');

  const db = initDatabase();
  const server1 = db.servers[0]; // e.g. EU01
  const server2 = db.servers[1]; // e.g. EU02

  const ts = Date.now();
  // 1. Create Seller Manager & Buyer Manager on Server 1
  const seller = registerUser(`seller_${ts}`, 'Manager2026!');
  const buyer = registerUser(`buyer_${ts}`, 'Manager2026!');

  // Create another manager on Server 2 to test server isolation
  const rivalServerMgr = registerUser(`rival_${ts}`, 'Manager2026!');

  // Claim clubs on Server 1
  const s1Clubs = Object.values(db.clubs).filter((c) => c.serverId === server1.id && !c.managerId);
  const sellerClub = claimClub(seller.user.id, server1.id, s1Clubs[0].id).club;
  const buyerClub = claimClub(buyer.user.id, server1.id, s1Clubs[1].id).club;

  // Claim club on Server 2
  const s2Clubs = Object.values(db.clubs).filter((c) => c.serverId === server2.id && !c.managerId);
  const rivalClub = claimClub(rivalServerMgr.user.id, server2.id, s2Clubs[0].id).club;

  console.log(`✅ [Step 1] Initialized Clubs on Server ${server1.code}: Seller "${sellerClub.name}", Buyer "${buyerClub.name}" (Budgets: €${sellerClub.transferBudget.toLocaleString()} & €${buyerClub.transferBudget.toLocaleString()})`);

  // 2. Seller lists a player for sale
  const playerToList = sellerClub.squad[5];
  const askingPrice = 24000000;
  const listing = listPlayerForSale(seller.user.id, playerToList.id, askingPrice);

  console.log(`✅ [Step 2] Listed player "${listing.player.name}" for €${askingPrice.toLocaleString()}`);

  // 3. Test SERVER ISOLATION: Listing must be visible on Server 1, but NOT on Server 2
  const server1Listings = getServerListings(server1.id);
  const server2Listings = getServerListings(server2.id);

  const foundOnS1 = server1Listings.some((l) => l.id === listing.id);
  const foundOnS2 = server2Listings.some((l) => l.id === listing.id);

  if (!foundOnS1 || foundOnS2) {
    throw new Error(`Server isolation failed: FoundOnS1=${foundOnS1}, FoundOnS2=${foundOnS2}`);
  }
  console.log(`✅ [Step 3] Server Isolation Verified: Listing appears in Server 1 (${server1.code}) and NOT in Server 2 (${server2.code})`);

  // 4. Test Self-Purchase Prevention (Seller cannot buy their own player)
  let selfPurchaseBlocked = false;
  try {
    makeTransferOffer(seller.user.id, listing.id, askingPrice);
  } catch (err: any) {
    selfPurchaseBlocked = true;
    console.log(`   (Confirmed self-purchase rejection: "${err.message}")`);
  }
  if (!selfPurchaseBlocked) throw new Error('Self purchase was not blocked!');
  console.log('✅ [Step 4] Self-purchase protection passed.');

  // 5. Test Insufficient Funds Prevention
  let overBudgetBlocked = false;
  try {
    makeTransferOffer(buyer.user.id, listing.id, 150000000); // Buyer only has 100M
  } catch (err: any) {
    overBudgetBlocked = true;
    console.log(`   (Confirmed insufficient funds rejection: "${err.message}")`);
  }
  if (!overBudgetBlocked) throw new Error('Over-budget offer was not blocked!');
  console.log('✅ [Step 5] Insufficient funds validation passed.');

  // 6. Test Cross-Server Offer Prevention (Rival manager on Server 2 cannot bid on Server 1 listing)
  let crossServerBlocked = false;
  try {
    makeTransferOffer(rivalServerMgr.user.id, listing.id, askingPrice);
  } catch (err: any) {
    crossServerBlocked = true;
    console.log(`   (Confirmed cross-server rejection: "${err.message}")`);
  }
  if (!crossServerBlocked) throw new Error('Cross-server bid was not blocked!');
  console.log('✅ [Step 6] Cross-server trading protection passed.');

  // 7. Legitimate Offer Submission
  const validOfferAmount = 22000000;
  const offer = makeTransferOffer(buyer.user.id, listing.id, validOfferAmount);
  console.log(`✅ [Step 7] Submitted valid transfer bid of €${validOfferAmount.toLocaleString()} from ${buyerClub.name}`);

  // Verify Seller received persistent notification in Inbox
  const sellerInbox = getUserInbox(seller.user.id);
  const incomingMsg = sellerInbox.messages.find((m) => m.relatedOfferId === offer.id);
  if (!incomingMsg) throw new Error('Seller did not receive inbox message for incoming bid!');
  console.log(`✅ [Step 8] Seller Inbox received notification: "${incomingMsg.title}"`);

  // 8. Test Offer Acceptance Flow
  const acceptRes = respondToTransferOffer(seller.user.id, offer.id, 'accept');
  if (acceptRes.offer.status !== 'Accepted' || !acceptRes.contract) {
    throw new Error('Accepting offer did not update status or generate contract proposal.');
  }
  console.log(`✅ [Step 9] Seller accepted offer. Listing status locked to "${db.listings[listing.id].status}"`);

  // Verify Buyer received Inbox notification to negotiate terms
  const buyerInbox = getUserInbox(buyer.user.id);
  const buyerContractMsg = buyerInbox.messages.find((m) => m.type === 'offer_accepted');
  if (!buyerContractMsg) throw new Error('Buyer did not receive contract negotiation message in Inbox!');
  console.log(`✅ [Step 10] Buyer received inbox dispatch to negotiate contract: "${buyerContractMsg.title}"`);

  // 9. Verify all 10 Team Roles exist
  if (TEAM_ROLES.length !== 10) {
    throw new Error(`Expected exactly 10 team roles, found ${TEAM_ROLES.length}`);
  }
  console.log(`✅ [Step 11] Verified all 10 Team Roles are available: ${TEAM_ROLES.map(r => r.role).join(', ')}`);

  // 10. Execute Contract Negotiation & Atomic Transfer Completion
  const chosenWeeklyWage = 85000;
  const chosenContractYears = 4;
  const chosenRole = 'Important Player';

  const initialBuyerBudget = buyerClub.transferBudget;
  const initialSellerBudget = sellerClub.transferBudget;

  const transferResult = completeContractNegotiation(buyer.user.id, acceptRes.contract.id, {
    weeklyWage: chosenWeeklyWage,
    contractYears: chosenContractYears,
    teamRole: chosenRole,
  });

  // Verify financial atomic accuracy
  if (transferResult.buyerClub.transferBudget !== initialBuyerBudget - validOfferAmount) {
    throw new Error('Buyer balance deduction did not match agreed transfer fee.');
  }
  if (transferResult.sellerClub.transferBudget !== initialSellerBudget + validOfferAmount) {
    throw new Error('Seller balance credit did not match agreed transfer fee.');
  }
  console.log(`✅ [Step 12] Financial atomic balance verification passed: Buyer new balance €${transferResult.buyerClub.transferBudget.toLocaleString()}, Seller new balance €${transferResult.sellerClub.transferBudget.toLocaleString()}`);

  // Verify player ownership moved
  const playerInBuyerSquad = transferResult.buyerClub.squad.find((p) => p.id === playerToList.id);
  const playerInSellerSquad = transferResult.sellerClub.squad.find((p) => p.id === playerToList.id);

  if (!playerInBuyerSquad || playerInSellerSquad) {
    throw new Error('Player ownership transfer failed: Player was not moved from seller squad to buyer squad.');
  }

  // Verify player terms saved
  if (
    playerInBuyerSquad.wage !== chosenWeeklyWage ||
    playerInBuyerSquad.contractYears !== chosenContractYears ||
    playerInBuyerSquad.teamRole !== chosenRole ||
    playerInBuyerSquad.isTransferListed === true
  ) {
    throw new Error('Negotiated contract terms were not saved onto the player record.');
  }
  console.log(`✅ [Step 13] Player "${playerInBuyerSquad.name}" successfully transferred to ${transferResult.buyerClub.name} with wage €${playerInBuyerSquad.wage.toLocaleString()}/wk, ${playerInBuyerSquad.contractYears} yrs, Role: ${playerInBuyerSquad.teamRole}`);

  // Verify Server News publication for completed transfer
  const s1News = getServerNews(server1.id);
  const completedTransferNews = s1News.find((n) => n.category === 'Completed Transfers' && n.playerId === playerToList.id);
  if (!completedTransferNews) {
    throw new Error('Completed transfer news was not published to Server News feed!');
  }
  console.log(`✅ [Step 14] Server News published completed transfer headline: "${completedTransferNews.title}"`);

  // Verify Server News is isolated (does NOT appear on Server 2)
  const s2News = getServerNews(server2.id);
  if (s2News.some((n) => n.id === completedTransferNews.id)) {
    throw new Error('News server isolation failed: completed transfer news appeared on Server 2!');
  }
  console.log(`✅ [Step 15] Server News isolation confirmed: Article exists on Server 1 and NOT on Server 2.`);

  // 11. Test Real Match Simulation & News Integration
  const matchResult = simulateServerMatch(server1.id);
  if (!matchResult.matchReport || !matchResult.matchReport.score) {
    throw new Error('Match simulation failed to produce match report.');
  }
  console.log(`✅ [Step 16] Real Match Simulated on Server 1: "${matchResult.matchReport.title}" (Score: ${matchResult.matchReport.score})`);
  console.log(`   Stadium: ${matchResult.matchReport.matchStats?.stadium}, Attendance: ${matchResult.matchReport.matchStats?.attendance.toLocaleString()}, Goalscorers: ${matchResult.matchReport.matchStats?.goalScorers?.join(', ') || 'None'}`);

  console.log('--- 🏆 ALL TRANSFER MARKET, SERVER NEWS & ATOMIC TRANSACTION TESTS PASSED! ---');
}

runTransferAndNewsTests().catch((err) => {
  console.error('❌ Transfer test error:', err);
  process.exit(1);
});
