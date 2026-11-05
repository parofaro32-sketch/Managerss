import type { Server as HttpServer } from 'node:http';
import { Server as IOServer, type Socket } from 'socket.io';

// ----------------------------------------------------------------
// Match constants (mirrors client MatchEngine)
// ----------------------------------------------------------------
const PITCH_LENGTH = 105;
const PITCH_WIDTH = 68;
const GOAL_WIDTH = 7.32;
const GOAL_HEIGHT = 2.44;
const TEAM_HOME = 0;
const TEAM_AWAY = 1;
const TICK_RATE = 30;
const DT = 1 / TICK_RATE;
const MATCH_DURATION_SECONDS = 90 * 60;

const FORMATION_442: { label: string; x: number; y: number }[] = [
  { label: 'GK', x: 50, y: 90 },
  { label: 'LB', x: 15, y: 70 },
  { label: 'CB', x: 38, y: 72 },
  { label: 'CB', x: 62, y: 72 },
  { label: 'RB', x: 85, y: 70 },
  { label: 'LM', x: 15, y: 45 },
  { label: 'CM', x: 38, y: 48 },
  { label: 'CM', x: 62, y: 48 },
  { label: 'RM', x: 85, y: 45 },
  { label: 'ST', x: 40, y: 20 },
  { label: 'ST', x: 60, y: 20 }
];

function posToWorldX(p: number) {
  return (p / 100 - 0.5) * PITCH_LENGTH;
}
function posToWorldZ(p: number) {
  return (p / 100 - 0.5) * PITCH_WIDTH;
}

export interface MatchPlayer {
  id: string;
  team: number;
  number: number;
  label: string;
  position: { x: number; z: number };
  velocity: { x: number; z: number };
  facing: { x: number; z: number };
  stamina: number;
  controlledByHuman: boolean;
  isActive: boolean;
}

export interface MatchBall {
  position: { x: number; z: number; y: number };
  velocity: { x: number; z: number; y: number };
  possession: number | null;
  closestPlayerId: string | null;
}

export interface MatchState {
  mode: 'bots' | 'multiplayer';
  homeScore: number;
  awayScore: number;
  clockSeconds: number;
  period: 1 | 2;
  state: 'kickoff' | 'playing' | 'goal' | 'halt' | 'fulltime';
  ball: MatchBall;
  players: MatchPlayer[];
  activePlayerId: string | null;
}

export interface MatchInput {
  moveX: number;
  moveZ: number;
  shoot: boolean;
  pass: boolean;
  switchPlayer: boolean;
}

export class Match {
  public id: string;
  public mode: 'bots' | 'multiplayer';
  public state: MatchState;
  private inputs = new Map<string, MatchInput>();
  private lastGoalTime = 0;

  constructor(id: string, mode: 'bots' | 'multiplayer', userTeam: number) {
    this.id = id;
    this.mode = mode;
    this.state = buildInitialState(mode, userTeam);
  }

  setInput(clientId: string, input: MatchInput) {
    this.inputs.set(clientId, input);
  }

  removeClient(clientId: string) {
    this.inputs.delete(clientId);
  }

  step() {
    const s = this.state;
    const dt = DT;
    const { ball, players } = s;

    if (s.state === 'playing' || s.state === 'kickoff') {
      s.clockSeconds += dt * (MATCH_DURATION_SECONDS / 90);
      if (s.clockSeconds >= MATCH_DURATION_SECONDS / 2 && s.period === 1) {
        s.period = 2;
        s.state = 'halt';
      } else if (s.clockSeconds >= MATCH_DURATION_SECONDS) {
        s.state = 'fulltime';
      }
    }

    // closest player to ball
    let closest: MatchPlayer | null = null;
    let closestDist = 1e9;
    for (const p of players) {
      const d = Math.hypot(p.position.x - ball.position.x, p.position.z - ball.position.z);
      if (d < closestDist) { closestDist = d; closest = p; }
    }
    ball.closestPlayerId = closest?.id ?? null;
    if (closestDist < 2.5) ball.possession = closest!.team;
    else if (closestDist > 5) ball.possession = null;

    // ball physics
    ball.velocity.x *= 0.96;
    ball.velocity.z *= 0.96;
    ball.velocity.y *= 0.92;
    ball.velocity.y -= 9.81 * dt;
    ball.position.x += ball.velocity.x * dt;
    ball.position.z += ball.velocity.z * dt;
    ball.position.y += ball.velocity.y * dt;

    if (ball.position.y < 0.22) {
      ball.position.y = 0.22;
      ball.velocity.y *= -0.5;
      ball.velocity.x *= 0.9;
      ball.velocity.z *= 0.9;
      if (Math.abs(ball.velocity.y) < 0.05) ball.velocity.y = 0;
    }

    const halfL = PITCH_LENGTH / 2;
    const halfW = PITCH_WIDTH / 2;
    if (ball.position.x > halfL - 0.5) {
      ball.position.x = halfL - 0.5;
      ball.velocity.x *= -0.6;
      if (Math.abs(ball.position.z) < GOAL_WIDTH / 2 + 0.6 && ball.position.y < GOAL_HEIGHT + 0.6) {
        scoreGoal(s, TEAM_HOME);
        return;
      }
    }
    if (ball.position.x < -halfL + 0.5) {
      ball.position.x = -halfL + 0.5;
      ball.velocity.x *= -0.6;
      if (Math.abs(ball.position.z) < GOAL_WIDTH / 2 + 0.6 && ball.position.y < GOAL_HEIGHT + 0.6) {
        scoreGoal(s, TEAM_AWAY);
        return;
      }
    }
    if (ball.position.z > halfW - 0.5) {
      ball.position.z = halfW - 0.5;
      ball.velocity.z *= -0.6;
    }
    if (ball.position.z < -halfW + 0.5) {
      ball.position.z = -halfW + 0.5;
      ball.velocity.z *= -0.6;
    }

    const activeId = s.activePlayerId;
    for (const p of players) {
      const input = this.inputs.get(p.id);
      const controlled = p.controlledByHuman && p.id === activeId && !!input;
      let ax = 0;
      let az = 0;

      if (controlled) {
        const facingSign = p.team === TEAM_HOME ? 1 : -1;
        ax = input.moveX;
        az = input.moveZ * facingSign;
        if (input.shoot) kickBall(s, p, ball, 'shoot');
        if (input.pass) kickBall(s, p, ball, 'pass');
        if (input.switchPlayer) switchActivePlayer(s, p.team);
      } else {
        botAI(p, ball, players, s, dt);
      }

      const accel = 14;
      const maxSpeed = controlled ? 7 : 6;
      p.velocity.x += ax * accel * dt;
      p.velocity.z += az * accel * dt;
      const speed = Math.hypot(p.velocity.x, p.velocity.z);
      if (speed > maxSpeed) {
        const sc = maxSpeed / speed;
        p.velocity.x *= sc;
        p.velocity.z *= sc;
      }
      p.velocity.x *= 0.88;
      p.velocity.z *= 0.88;
      p.position.x += p.velocity.x * dt;
      p.position.z += p.velocity.z * dt;

      p.position.x = Math.max(-halfL + 2, Math.min(halfL - 2, p.position.x));
      p.position.z = Math.max(-halfW + 2, Math.min(halfW - 2, p.position.z));

      if (Math.hypot(p.velocity.x, p.velocity.z) > 0.1) {
        p.facing.x = p.velocity.x;
        p.facing.z = p.velocity.z;
      } else if (ball.possession === p.team || !controlled) {
        const bx = ball.position.x - p.position.x;
        const bz = ball.position.z - p.position.z;
        const d = Math.hypot(bx, bz);
        if (d > 0.1) { p.facing.x = bx / d; p.facing.z = bz / d; }
      }

      p.isActive = p.id === activeId;
      if (speed > 0.5) p.stamina = Math.max(0, p.stamina - dt * 4);
      else p.stamina = Math.min(100, p.stamina + dt * 2);
    }

    if (ball.possession !== null) {
      const carrier = players.find((p) => p.team === ball.possession && Math.hypot(p.position.x - ball.position.x, p.position.z - ball.position.z) < 1.8);
      if (carrier) {
        ball.position.x = carrier.position.x + carrier.facing.x * 1.1;
        ball.position.z = carrier.position.z + carrier.facing.z * 1.1;
        ball.velocity.x = carrier.velocity.x * 0.5;
        ball.velocity.z = carrier.velocity.z * 0.5;
        ball.position.y = 0.22;
      }
    }

    // clear one-shot inputs after step
    for (const [cid, inp] of this.inputs) {
      inp.shoot = false;
      inp.pass = false;
      inp.switchPlayer = false;
    }
  }

  getState(): MatchState {
    return this.state;
  }
}

function buildInitialState(mode: 'bots' | 'multiplayer', userTeam: number): MatchState {
  const players: MatchPlayer[] = [];
  for (let i = 0; i < 11; i++) {
    const f = FORMATION_442[i];
    players.push({
      id: `h_${i}`,
      team: TEAM_HOME,
      number: i + 1,
      label: f.label,
      position: { x: -Math.abs(posToWorldX(f.x)) - 6, z: posToWorldZ(f.y) },
      velocity: { x: 0, z: 0 },
      facing: { x: 1, z: 0 },
      stamina: 100,
      controlledByHuman: false,
      isActive: i === 0,
    });
    players.push({
      id: `a_${i}`,
      team: TEAM_AWAY,
      number: i + 1,
      label: f.label,
      position: { x: Math.abs(posToWorldX(f.x)) + 6, z: posToWorldZ(f.y) },
      velocity: { x: 0, z: 0 },
      facing: { x: -1, z: 0 },
      stamina: 100,
      controlledByHuman: false,
      isActive: false,
    });
  }
  for (const p of players) p.controlledByHuman = p.team === userTeam;
  const ball: MatchBall = {
    position: { x: 0, z: 0, y: 0 },
    velocity: { x: 0, z: 0, y: 0 },
    possession: null,
    closestPlayerId: null,
  };
  return {
    mode,
    homeScore: 0,
    awayScore: 0,
    clockSeconds: 0,
    period: 1,
    state: 'kickoff',
    ball,
    players,
    activePlayerId: players.find((p) => p.team === userTeam && p.number === 1)?.id ?? null,
  };
}

function scoreGoal(s: MatchState, scoringTeam: number) {
  if (scoringTeam === TEAM_HOME) s.homeScore += 1;
  else s.awayScore += 1;
  s.state = 'goal';
  setTimeout(() => resetKickoff(s, scoringTeam === TEAM_HOME ? TEAM_AWAY : TEAM_HOME), 2200);
}

function resetKickoff(s: MatchState, kickingTeam: number) {
  s.state = 'kickoff';
  s.ball.position = { x: 0, z: 0, y: 0 };
  s.ball.velocity = { x: 0, z: 0, y: 0 };
  s.ball.possession = null;
  for (let i = 0; i < 11; i++) {
    const f = FORMATION_442[i];
    const hp = s.players.find((p) => p.id === `h_${i}`);
    const ap = s.players.find((p) => p.id === `a_${i}`);
    if (hp) { hp.position = { x: -Math.abs(posToWorldX(f.x)) - 6, z: posToWorldZ(f.y) }; hp.velocity = { x: 0, z: 0 }; hp.facing = { x: 1, z: 0 }; }
    if (ap) { ap.position = { x: Math.abs(posToWorldX(f.x)) + 6, z: posToWorldZ(f.y) }; ap.velocity = { x: 0, z: 0 }; ap.facing = { x: -1, z: 0 }; }
  }
  setTimeout(() => { s.state = 'playing'; }, 1000);
}

function switchActivePlayer(s: MatchState, teamId: number) {
  const ballX = s.ball.position.x;
  const ballZ = s.ball.position.z;
  let best: MatchPlayer | null = null;
  let bestD = 1e9;
  for (const p of s.players) {
    if (p.team !== teamId || !p.controlledByHuman) continue;
    const d = Math.hypot(p.position.x - ballX, p.position.z - ballZ);
    if (d < bestD) { bestD = d; best = p; }
  }
  if (best) s.activePlayerId = best.id;
}

function botAI(p: MatchPlayer, ball: MatchBall, all: MatchPlayer[], s: MatchState, dt: number) {
  const opponents = all.filter((x) => x.team !== p.team);
  const bx = ball.position.x;
  const bz = ball.position.z;
  const dToBall = Math.hypot(p.position.x - bx, p.position.z - bz);
  const hasPossession = ball.possession === p.team;
  const amClosest = p.id === ball.closestPlayerId;

  const idx = Number(p.id.split('_')[1]);
  const f = FORMATION_442[idx];
  const homeX = p.team === TEAM_HOME ? -Math.abs(posToWorldX(f.x)) - 6 : Math.abs(posToWorldX(f.x)) + 6;
  const homeZ = posToWorldZ(f.y);

  if (dToBall > 14 && !hasPossession) {
    moveToward(p, homeX, homeZ, 3.5, dt);
    return;
  }

  if (hasPossession && amClosest && dToBall < 2) {
    const attackingGoalX = p.team === TEAM_HOME ? PITCH_LENGTH / 2 : -PITCH_LENGTH / 2;
    const toGoalX = attackingGoalX - p.position.x;
    const toGoalZ = -p.position.z;
    const distToGoal = Math.hypot(toGoalX, toGoalZ);
    const nearestOpponent = Math.min(...opponents.map((o) => Math.hypot(o.position.x - p.position.x, o.position.z - p.position.z)));
    if (distToGoal < 24 && nearestOpponent > 4) {
      kickBall(s, p, ball, 'shoot');
    } else {
      const dx = toGoalX / Math.max(0.1, distToGoal);
      const dz = toGoalZ / Math.max(0.1, distToGoal);
      p.velocity.x += dx * 9 * dt;
      p.velocity.z += dz * 9 * dt;
      p.facing.x = dx;
      p.facing.z = dz;
    }
    return;
  }

  const blend = amClosest ? 1 : 0.4;
  const tx = homeX + (bx - homeX) * blend;
  const tz = homeZ + (bz - homeZ) * blend;
  moveToward(p, tx, tz, amClosest ? 6 : 4.5, dt);
}

function moveToward(p: MatchPlayer, tx: number, tz: number, speed: number, dt: number) {
  const dx = tx - p.position.x;
  const dz = tz - p.position.z;
  const d = Math.hypot(dx, dz);
  if (d > 0.5) {
    p.velocity.x += (dx / d) * speed * 1.4 * dt;
    p.velocity.z += (dz / d) * speed * 1.4 * dt;
    p.facing.x = dx / d;
    p.facing.z = dz / d;
  }
}

function kickBall(s: MatchState, kicker: MatchPlayer, ball: MatchBall, type: 'shoot' | 'pass') {
  if (ball.possession !== kicker.team) return;
  const power = type === 'shoot' ? 22 : 11;
  const accuracy = 0.92;
  const rx = (Math.random() - 0.5) * 0.15;
  const rz = (Math.random() - 0.5) * 0.15;
  ball.velocity.x = (kicker.facing.x + rx) * power * accuracy;
  ball.velocity.z = (kicker.facing.z + rz) * power * accuracy;
  ball.velocity.y = type === 'shoot' ? 3 : 1;
  ball.possession = null;
}

// ----------------------------------------------------------------
// Server wiring
// ----------------------------------------------------------------
const rooms = new Map<string, { match: Match; players: Map<string, { team: number; username: string }> }>();

export function attachMatchIo(httpServer: HttpServer) {
  const io = new IOServer(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    socket.on('joinMatch', (data: { room: string; team: number; username: string }, cb: (res: any) => void) => {
      const { room, team, username } = data;
      let roomData = rooms.get(room);
      if (!roomData) {
        roomData = { match: new Match(room, 'multiplayer', team), players: new Map() };
        rooms.set(room, roomData);
      }
      if (roomData.players.size >= 2) {
        cb({ ok: false, reason: 'Room is full.' });
        return;
      }
      const assignedTeam = roomData.players.size === 0 ? TEAM_HOME : TEAM_AWAY;
      // Sync match initial userTeam to the first joiner's team; keep as-is
      roomData.players.set(socket.id, { team: assignedTeam, username });
      socket.join(room);
      cb({ ok: true, team: assignedTeam, you: socket.id, room });
      socket.to(room).emit('matchJoined', { room, team: assignedTeam, you: socket.id });
      socket.emit('matchJoined', { room, team: assignedTeam, you: socket.id });
    });

    socket.on('input', (data: { room: string; clientId: string; moveX: number; moveZ: number; shoot: boolean; pass: boolean; switchPlayer: boolean }) => {
      const roomData = rooms.get(data.room);
      if (!roomData) return;
      const match = roomData.match;
      match.setInput(data.clientId, {
        moveX: data.moveX,
        moveZ: data.moveZ,
        shoot: Boolean(data.shoot),
        pass: Boolean(data.pass),
        switchPlayer: Boolean(data.switchPlayer),
      });
    });

    socket.on('leaveMatch', (data: { room: string }) => {
      const roomData = rooms.get(data.room);
      if (roomData) {
        roomData.players.delete(socket.id);
        socket.leave(data.room);
        if (roomData.players.size === 0) {
          rooms.delete(data.room);
        } else {
          socket.to(data.room).emit('matchError', 'Opponent left the match.');
        }
      }
    });

    socket.on('disconnect', () => {
      for (const [room, roomData] of rooms) {
        if (roomData.players.has(socket.id)) {
          roomData.players.delete(socket.id);
          if (roomData.players.size === 0) {
            rooms.delete(room);
          } else {
            socket.to(room).emit('matchError', 'Opponent left the match.');
          }
          break;
        }
      }
    });
  });

  // Simulation loop (authoritative)
  setInterval(() => {
    for (const [room, roomData] of rooms) {
      const match = roomData.match;
      match.step();
      const state = match.getState();
      io.to(room).emit('matchState', state);
    }
  }, 1000 / TICK_RATE);

  return io;
}
