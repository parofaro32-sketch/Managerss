import { 
  initDatabase, 
  registerUser, 
  loginUser, 
  claimClub, 
  getServersWithStats, 
  getServerClubs,
  saveDatabaseSync,
  updateLineup,
  resignClub,
  Player
} from './db.ts';
import { buildProjectZip } from './zipService.ts';
import fs from 'node:fs';

async function runTests() {
  console.log('--- 🧪 STARTING MANAGER NOL INTEGRATION TESTS ---');

  // Test 1: Exactly 30 servers exist
  const db = initDatabase();
  console.log(`[Test 1] Server count: ${db.servers.length}`);
  if (db.servers.length !== 30) {
    throw new Error(`Expected exactly 30 servers, found ${db.servers.length}`);
  }
  console.log('✅ Test 1 Passed: Exactly 30 servers exist.');

  // Test 2: Exactly 30 clubs per server (900 total)
  const totalClubs = Object.keys(db.clubs).length;
  console.log(`[Test 2] Total clubs: ${totalClubs}`);
  if (totalClubs !== 900) {
    throw new Error(`Expected exactly 900 clubs, found ${totalClubs}`);
  }

  for (const s of db.servers) {
    const clubsForServer = Object.values(db.clubs).filter((c) => c.serverId === s.id);
    if (clubsForServer.length !== 30) {
      throw new Error(`Server ${s.code} has ${clubsForServer.length} clubs instead of 30.`);
    }
  }
  console.log('✅ Test 2 Passed: Exactly 30 clubs exist for every server (900 total).');

  // Test 3: Clubs have valid positive budgets (starts at €100,000,000)
  for (const club of Object.values(db.clubs)) {
    if (club.transferBudget <= 0) {
      throw new Error(`Club ${club.name} has invalid budget ${club.transferBudget}`);
    }
  }
  console.log('✅ Test 3 Passed: All clubs strictly initialized to valid starting warchest budgets.');

  // Test 4: Register two different users
  const ts = Date.now();
  const userA = registerUser('coach_pep_' + ts, 'Tactics2026!', `pep_${ts}@test.com`);
  const userB = registerUser('coach_klopp_' + ts, 'Gegenpress2026!', `klopp_${ts}@test.com`);
  console.log(`✅ Test 4 Passed: Registered Manager A (@${userA.user.username}) and Manager B (@${userB.user.username}).`);

  // Test 5: Manager A claims an available club on EU01
  const serverEu01 = db.servers[0];
  const { clubs: eu01Clubs } = getServerClubs(serverEu01.id);
  const targetClub1 = eu01Clubs.find((c) => !c.managerId)!;

  const claim1 = claimClub(userA.user.id, serverEu01.id, targetClub1.id);
  if (claim1.club.managerId !== userA.user.id || claim1.club.transferBudget !== 100000000) {
    throw new Error('Club claim 1 validation failed.');
  }
  console.log(`✅ Test 5 Passed: Manager A claimed "${claim1.club.name}" with €100,000,000 budget.`);

  // Test 6: Manager B attempts to claim the same club (must fail)
  let failedAsExpected = false;
  try {
    claimClub(userB.user.id, serverEu01.id, targetClub1.id);
  } catch (err: any) {
    failedAsExpected = true;
    console.log(`   (Rejection message confirmed: "${err.message}")`);
  }
  if (!failedAsExpected) {
    throw new Error('Expected claim collision to throw an error, but it succeeded!');
  }
  console.log('✅ Test 6 Passed: Prevented duplicate claim of occupied club.');

  // Test 7: Manager B claims a different club on EU01
  const targetClub2 = eu01Clubs.find((c) => !c.managerId && c.id !== targetClub1.id)!;
  const claim2 = claimClub(userB.user.id, serverEu01.id, targetClub2.id);
  if (claim2.club.managerId !== userB.user.id || claim2.club.transferBudget !== 100000000) {
    throw new Error('Club claim 2 validation failed.');
  }
  console.log(`✅ Test 7 Passed: Manager B claimed "${claim2.club.name}" with independent €100,000,000 budget.`);

  // Test 8: Login restores club and budget
  const loginRes = loginUser(userA.user.username, 'Tactics2026!');
  if (!loginRes.activeClub || loginRes.activeClub.id !== targetClub1.id) {
    throw new Error('Login failed to restore active club.');
  }
  if (loginRes.activeClub.transferBudget !== 100000000) {
    throw new Error('Budget was not preserved after login.');
  }
  console.log(`✅ Test 8 Passed: Re-login restored club "${loginRes.activeClub.name}" and €${loginRes.activeClub.transferBudget.toLocaleString()} budget.`);

  // Test 9: Update Lineup with single Team-Wide Effort ('High')
  const squad = claim1.club.squad;
  const starting11 = squad.slice(0, 11).map((p: Player, idx: number) => ({
    playerId: p.id,
    position: idx === 0 ? 'GK' : idx <= 4 ? 'DEF' : idx <= 8 ? 'MID' : 'ATT',
  }));

  const updatedClub = updateLineup(userA.user.id, {
    formation: '4-3-3',
    teamEffort: 'High',
    startingPlayers: starting11,
  });

  if (!updatedClub.lineup || updatedClub.lineup.teamEffort !== 'High' || updatedClub.lineup.formation !== '4-3-3') {
    throw new Error('Failed to save team-wide effort or formation.');
  }
  if (updatedClub.lineup.startingPlayers.length !== 11) {
    throw new Error('Lineup did not preserve 11 players.');
  }
  console.log(`✅ Test 9 Passed: Successfully updated lineup to 4-3-3 with teamEffort="High" and 11 starting players.`);

  // Test 10: Resignation flow
  const resignedClub = resignClub(userA.user.id);
  if (resignedClub.managerId !== null) {
    throw new Error('Resigned club still has managerId assigned.');
  }
  console.log(`✅ Test 10 Passed: Manager A successfully resigned from "${resignedClub.name}". Club is now open to claim.`);

  // Test 11: ZIP Archive Generation
  const zipFile = await buildProjectZip();
  const stats = fs.statSync(zipFile);
  console.log(`✅ Test 11 Passed: ZIP archive successfully built at "${zipFile}" (${(stats.size / 1024).toFixed(1)} KB).`);

  console.log('--- 🏆 ALL 11 VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
