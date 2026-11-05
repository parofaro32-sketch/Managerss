import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { io, type Socket } from 'socket.io-client';
import { ArrowRight, Loader2, X, Play, BatteryCharging, Activity } from 'lucide-react';

// ----------------------------------------------------------------
// Constants & pitch geometry (metres, 1 unit = 1 metre)
// Goals on X axis; Home (left, -X) attacks +X; Away (right, +X) attacks -X.
// ----------------------------------------------------------------
const PITCH_LENGTH = 105;
const PITCH_WIDTH = 68;
const GOAL_WIDTH = 7.32;
const GOAL_HEIGHT = 2.44;
const GOAL_DEPTH = 2.44;
const PENALTY_SPOT_X = 11;
const BOX_EDGE_Z = PITCH_WIDTH / 2;
const SIX_YARD_Z = 5.5;
const CIRCLE_R = 9.15;
const TEAM_HOME = 0;
const TEAM_AWAY = 1;
const TICK_RATE = 30;
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

export type MatchMode = 'bots' | 'multiplayer';

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
  mode: MatchMode;
  homeScore: number;
  awayScore: number;
  clockSeconds: number;
  period: 1 | 2;
  state: 'kickoff' | 'playing' | 'goal' | 'halt' | 'fulltime';
  ball: MatchBall;
  players: MatchPlayer[];
  activePlayerId: string | null;
}

const PLAYER_COLOR_HOME = 0x1e3a8a;
const PLAYER_COLOR_AWAY = 0xdc2626;
const BALL_COLOR = 0xffffff;
const PITCH_GRASS = 0x14532d;
const PITCH_STRIPE = 0x166534;
const LINE_COLOR = 0xffffff;

interface ServerToClientEvents {
  matchState: (state: MatchState) => void;
  matchJoined: (data: { room: string; team: number; you: string }) => void;
  matchError: (msg: string) => void;
}

interface ClientToServerEvents {
  joinMatch: (data: { room: string; team: number; username: string }, cb: (res: { ok: boolean; team?: number; you?: string; reason?: string }) => void) => void;
  input: (data: { room: string; clientId: string; moveX: number; moveZ: number; shoot: boolean; pass: boolean; switchPlayer: boolean }) => void;
}

type MatchSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// ----------------------------------------------------------------
// MatchLobby
// ----------------------------------------------------------------
interface MatchLobbyProps {
  mode: MatchMode;
  setMode: (m: MatchMode) => void;
  team: number;
  setTeam: (t: number) => void;
  roomCode: string;
  setRoomCode: (c: string) => void;
  username: string;
  setUsername: (u: string) => void;
  connecting: boolean;
  setConnecting: (c: boolean) => void;
  error: string | null;
  setError: (e: string | null) => void;
  startMatch: () => void;
}

export function MatchLobby({
  mode, setMode, team, setTeam, roomCode, setRoomCode, username, setUsername,
  connecting, setConnecting, error, setError, startMatch,
}: MatchLobbyProps) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-emerald-500 to-teal-700 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.35)]">
          <Activity size={44} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tighter text-white uppercase">Match Day</h1>
        <p className="text-slate-400 text-sm max-w-md text-center">
          Play realistic 11v11 football. Choose single-player against bots or real-time multiplayer.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode('bots')}
            className={`px-5 py-3 rounded-xl font-semibold transition-all ${
              mode === 'bots'
                ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Play size={16} className="text-emerald-400" /> vs Bots
            </span>
          </button>
          <button
            onClick={() => setMode('multiplayer')}
            className={`px-5 py-3 rounded-xl font-semibold transition-all ${
              mode === 'multiplayer'
                ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowRight size={16} className="text-blue-400" /> Multiplayer
            </span>
          </button>
        </div>

        {mode === 'multiplayer' && (
          <div className="space-y-3">
            <input
              autoFocus
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ROOM CODE"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center tracking-widest outline-none focus:ring-2 focus:ring-emerald-500"
              maxLength={6}
            />
            <div className="flex gap-2">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                disabled={connecting || !roomCode || !username}
                onClick={startMatch}
                className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-50 transition"
              >
                {connecting ? <Loader2 size={16} className="animate-spin" /> : 'Join'}
              </button>
            </div>
            {error && (
              <div className="text-xs text-rose-400 bg-rose-900/30 px-3 py-2 rounded border border-rose-900/50">{error}</div>
            )}
          </div>
        )}

        {mode === 'bots' && (
          <div className="flex gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input
                type="radio"
                name="botTeam"
                checked={team === TEAM_HOME}
                onChange={() => setTeam(TEAM_HOME)}
                className="accent-emerald-500"
              />
              <span className="text-sm text-slate-300 group-hover:text-white transition">Home (Blue)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input
                type="radio"
                name="botTeam"
                checked={team === TEAM_AWAY}
                onChange={() => setTeam(TEAM_AWAY)}
                className="accent-rose-500"
              />
              <span className="text-sm text-slate-300 group-hover:text-white transition">Away (Red)</span>
            </label>
          </div>
        )}

        <button
          onClick={startMatch}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-700 text-white font-extrabold tracking-wider uppercase shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:from-emerald-400 transition active:scale-95"
        >
          Start Match
        </button>
      </div>
    </main>
  );
}

// ----------------------------------------------------------------
// MatchView
// ----------------------------------------------------------------
interface MatchViewProps {
  mode: MatchMode;
  team: number;
  roomCode: string;
  username: string;
  onExit: () => void;
}

export function MatchView({ mode, team, roomCode, username, onExit }: MatchViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const ballMeshRef = useRef<THREE.Mesh | null>(null);
  const playerMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const lineMeshRef = useRef<THREE.Mesh[]>([]);

  const [state, setState] = useState<MatchState | null>(null);
  const [connected, setConnected] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Entering pitch...');
  const socketRef = useRef<MatchSocket | null>(null);
  const clientIdRef = useRef(crypto.randomUUID());
  const inputRef = useRef({ moveX: 0, moveZ: 0, shoot: false, pass: false, switchPlayer: false });
  const prevInputRef = useRef({ shoot: false, pass: false, switchPlayer: false });
  const lastInputTime = useRef(0);
  const animFrameRef = useRef(0);
  const inputIntervalRef = useRef(0);

  // ------------------------------------------------------------
  // Socket (multiplayer only, server-authoritative)
  // ------------------------------------------------------------
  useEffect(() => {
    if (mode !== 'multiplayer') return;
    setStatusMsg('Connecting to match server...');
    const socket = io(import.meta.env.VITE_WS_URL || window.location.origin, {
      transports: ['websocket'],
      auth: { username: clientIdRef.current },
    }) as MatchSocket;
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => {
      setConnected(false);
      setStatusMsg('Disconnected from server.');
    });

    socket.on('matchJoined', (data) => {
      setStatusMsg(`Joined &mdash; you are ${data.team === TEAM_HOME ? 'Home' : 'Away'}`);
    });

    socket.on('matchState', (s) => {
      setState(s);
    });

    socket.on('matchError', (msg) => {
      setStatusMsg(msg);
    });

    socket.emit('joinMatch', { room: roomCode, team, username }, (res: any) => {
      if (!res.ok) setStatusMsg('Join failed: ' + (res.reason || 'unknown'));
    });

    // Stream inputs to the authoritative server at ~20 Hz
    inputIntervalRef.current = window.setInterval(() => {
      if (!socketRef.current?.connected) return;
      const now = Date.now();
      if (now - lastInputTime.current > 50) {
        socketRef.current.emit('input', {
          room: roomCode,
          clientId: clientIdRef.current,
          moveX: inputRef.current.moveX,
          moveZ: inputRef.current.moveZ,
          shoot: Boolean(inputRef.current.shoot && !prevInputRef.current.shoot),
          pass: Boolean(inputRef.current.pass && !prevInputRef.current.pass),
          switchPlayer: Boolean(inputRef.current.switchPlayer && !prevInputRef.current.switchPlayer),
        });
        lastInputTime.current = now;
      }
    }, 50);

    return () => {
      window.clearInterval(inputIntervalRef.current);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [mode, team, roomCode, username]);

  // ------------------------------------------------------------
  // Bots: build initial local state
  // ------------------------------------------------------------
  useEffect(() => {
    if (mode !== 'bots') return;
    setState(buildInitialState(mode, team));
    setStatusMsg('Kick off &mdash; you control the blue team');
  }, [mode, team]);

  // ------------------------------------------------------------
  // Three.js init + loop
  // ------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070c09);
    scene.fog = new THREE.FogExp2(0x070c09, 0.035);
    sceneRef.current = scene;

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(40, 90, 30);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 2048;
    dir.shadow.mapSize.height = 2048;
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 160;
    dir.shadow.camera.left = -75;
    dir.shadow.camera.right = 75;
    dir.shadow.camera.top = 75;
    dir.shadow.camera.bottom = -75;
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0x6fa8ff, 0.5);
    fill.position.set(-40, 40, -30);
    scene.add(fill);

    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 200);
    camera.position.set(0, 30, 60);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    buildPitch(scene, lineMeshRef);
    buildGoals(scene);

    const onResize = () => {
      if (!camera || !renderer || !container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    const keys = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => keys.add(e.code);
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    let lastTime = performance.now();
    const fixedDt = 1000 / TICK_RATE;
    let accumulator = 0;

    function loop(now: number) {
      const frameTime = now - lastTime;
      lastTime = now;
      accumulator += frameTime;

      readInput(keys, inputRef.current);

      // Bots: local simulation. Multiplayer: state comes from server.
      if (mode === 'bots' && state) {
        while (accumulator >= fixedDt) {
          simulateTick(state, mode, team, inputRef.current, prevInputRef.current);
          accumulator -= fixedDt;
        }
      }

      if (state) {
        updateSceneFromState(state);
        updateCamera(camera, state, team);
        renderer.render(scene, camera);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    }

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        container.removeChild(rendererRef.current.domElement);
      }
    };
  }, [mode, team]);

  // ------------------------------------------------------------
  // Input reading
  // ------------------------------------------------------------
  function readInput(keys: Set<string>, input: { moveX: number; moveZ: number; shoot: boolean; pass: boolean; switchPlayer: boolean }) {
    prevInputRef.current = { shoot: input.shoot, pass: input.pass, switchPlayer: input.switchPlayer };
    const mx = (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0);
    const mz = (keys.has('ArrowUp') || keys.has('KeyW') ? 1 : 0) - (keys.has('ArrowDown') || keys.has('KeyS') ? 1 : 0);
    input.moveX = mx;
    input.moveZ = mz;
    input.shoot = keys.has('Space');
    input.pass = (keys.has('ControlLeft') || keys.has('ControlRight')) && keys.has('KeyS');
    input.switchPlayer = keys.has('KeyQ') || keys.has('KeyE');
  }

  // ------------------------------------------------------------
  // Scene builders
  // ------------------------------------------------------------
  function buildPitch(scene: THREE.Scene, linesRef: { current: THREE.Mesh[] }) {
    const pitchGeo = new THREE.PlaneGeometry(PITCH_LENGTH, PITCH_WIDTH, 64, 64);
    const pitchMat = new THREE.MeshStandardMaterial({ color: PITCH_GRASS, roughness: 0.8, metalness: 0.1 });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    pitch.receiveShadow = true;
    scene.add(pitch);

    const stripeCount = 14;
    for (let i = 0; i < stripeCount; i++) {
      const geo = new THREE.PlaneGeometry(PITCH_LENGTH, PITCH_WIDTH / stripeCount);
      const mat = new THREE.MeshStandardMaterial({ color: PITCH_STRIPE, roughness: 0.85, metalness: 0.05 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.z = -PITCH_WIDTH / 2 + (i + 0.5) * (PITCH_WIDTH / stripeCount);
      mesh.position.y = 0.01;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }

    const lineMat = new THREE.MeshBasicMaterial({ color: LINE_COLOR });
    const L = PITCH_LENGTH / 2;
    const W = PITCH_WIDTH / 2;
    const lines: THREE.Mesh[] = [];
    function addLine(x1: number, z1: number, x2: number, z2: number, w = 0.12) {
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.sqrt(dx * dx + dz * dz);
      const geo = new THREE.PlaneGeometry(len, w);
      const mesh = new THREE.Mesh(geo, lineMat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set((x1 + x2) / 2, 0.02, (z1 + z2) / 2);
      mesh.lookAt(x2, 0.02, z2);
      mesh.rotateX(Math.PI / 2);
      mesh.receiveShadow = true;
      scene.add(mesh);
      lines.push(mesh);
    }
    addLine(-L, -W, L, -W);
    addLine(-L, W, L, W);
    addLine(-L, -W, -L, W);
    addLine(L, -W, L, W);
    addLine(0, -W, 0, W);
    addCircleLine(scene, 0, 0, CIRCLE_R, linesRef);
    addDot(scene, 0, 0);
    addLine(L - PENALTY_SPOT_X, -BOX_EDGE_Z, L - PENALTY_SPOT_X, BOX_EDGE_Z);
    addLine(L - PENALTY_SPOT_X, -BOX_EDGE_Z, L, -BOX_EDGE_Z);
    addLine(L - PENALTY_SPOT_X, BOX_EDGE_Z, L, BOX_EDGE_Z);
    addLine(-L + PENALTY_SPOT_X, -BOX_EDGE_Z, -L + PENALTY_SPOT_X, BOX_EDGE_Z);
    addLine(-L + PENALTY_SPOT_X, -BOX_EDGE_Z, -L, -BOX_EDGE_Z);
    addLine(-L + PENALTY_SPOT_X, BOX_EDGE_Z, -L, BOX_EDGE_Z);
    addLine(L - SIX_YARD_Z, -SIX_YARD_Z, L - SIX_YARD_Z, SIX_YARD_Z);
    addLine(L - SIX_YARD_Z, -SIX_YARD_Z, L, -SIX_YARD_Z);
    addLine(L - SIX_YARD_Z, SIX_YARD_Z, L, SIX_YARD_Z);
    addLine(-L + SIX_YARD_Z, -SIX_YARD_Z, -L + SIX_YARD_Z, SIX_YARD_Z);
    addLine(-L + SIX_YARD_Z, -SIX_YARD_Z, -L, -SIX_YARD_Z);
    addLine(-L + SIX_YARD_Z, SIX_YARD_Z, -L, SIX_YARD_Z);
    addDot(scene, L - PENALTY_SPOT_X, 0);
    addDot(scene, -L + PENALTY_SPOT_X, 0);
    addArc(scene, L - PENALTY_SPOT_X, 0, CIRCLE_R, -Math.PI / 2, Math.PI / 2, linesRef);
    addArc(scene, -L + PENALTY_SPOT_X, 0, CIRCLE_R, Math.PI / 2, 3 * Math.PI / 2, linesRef);
    addLine(L, -GOAL_WIDTH / 2, L, GOAL_WIDTH / 2, 0.15);
    addLine(-L, -GOAL_WIDTH / 2, -L, GOAL_WIDTH / 2, 0.15);
    linesRef.current = lines;
  }

  function addCircleLine(scene: THREE.Scene, cx: number, cz: number, r: number, linesRef: { current: THREE.Mesh[] }, segs = 64) {
    const pts: number[] = [];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * 2 * Math.PI;
      pts.push(cx + r * Math.cos(a), 0.02, cz + r * Math.sin(a));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const mesh = new THREE.Line(geo, new THREE.MeshBasicMaterial({ color: LINE_COLOR }));
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);
    linesRef.current.push(mesh as unknown as THREE.Mesh);
  }

  function addDot(scene: THREE.Scene, x: number, z: number, r = 0.22) {
    const geo = new THREE.CircleGeometry(r, 16);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: LINE_COLOR }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.022, z);
    scene.add(mesh);
  }

  function addArc(scene: THREE.Scene, cx: number, cz: number, r: number, a1: number, a2: number, linesRef: { current: THREE.Mesh[] }, segs = 24) {
    const pts: number[] = [];
    for (let i = 0; i <= segs; i++) {
      const a = a1 + ((i / segs) * (a2 - a1));
      pts.push(cx + r * Math.cos(a), 0.02, cz + r * Math.sin(a));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const mesh = new THREE.Line(geo, new THREE.MeshBasicMaterial({ color: LINE_COLOR }));
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);
    linesRef.current.push(mesh as unknown as THREE.Mesh);
  }

  function buildGoals(scene: THREE.Scene) {
    const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.6 });
    const netMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    function makeGoal(x: number) {
      const group = new THREE.Group();
      group.position.set(x, 0, 0);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.16, GOAL_HEIGHT, GOAL_WIDTH), postMat);
      bar.position.set(0, GOAL_HEIGHT / 2, 0);
      bar.castShadow = true;
      bar.receiveShadow = true;
      group.add(bar);
      for (const z of [-GOAL_WIDTH / 2, GOAL_WIDTH / 2]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, GOAL_HEIGHT, 0.16), postMat);
        post.position.set(0, GOAL_HEIGHT / 2, z);
        post.castShadow = true;
        post.receiveShadow = true;
        group.add(post);
      }
      const back = new THREE.Mesh(new THREE.PlaneGeometry(GOAL_WIDTH, GOAL_HEIGHT), netMat);
      back.position.set(x, GOAL_HEIGHT / 2, 0);
      group.add(back);
      for (const z of [-GOAL_WIDTH / 2, GOAL_WIDTH / 2]) {
        const side = new THREE.Mesh(new THREE.PlaneGeometry(GOAL_DEPTH, GOAL_HEIGHT), netMat);
        side.position.set(x, GOAL_HEIGHT / 2, z);
        side.rotation.y = Math.PI / 2;
        group.add(side);
      }
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(GOAL_WIDTH, GOAL_DEPTH), netMat);
      floor.position.set(x, 0.02, 0);
      floor.rotation.x = -Math.PI / 2;
      group.add(floor);
      scene.add(group);
    }
    makeGoal(-PITCH_LENGTH / 2);
    makeGoal(PITCH_LENGTH / 2);
  }

  // ------------------------------------------------------------
  // Meshes
  // ------------------------------------------------------------
  function createPlayerMesh(player: MatchPlayer): THREE.Mesh {
    const group = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.5, 1.4, 4, 8),
      new THREE.MeshStandardMaterial({ color: player.team === TEAM_HOME ? PLAYER_COLOR_HOME : PLAYER_COLOR_AWAY })
    );
    body.rotation.x = Math.PI / 2;
    body.position.y = 1.35;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xe0ac69 })
    );
    head.position.y = 2.45;
    head.castShadow = true;
    group.add(head);
    const face = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.9, 8),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    face.rotation.x = -Math.PI / 2;
    face.position.set(0, 1.6, 0.95);
    group.add(face);
    const shadowGeo = new THREE.CircleGeometry(0.5, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.05;
    group.add(shadow);
    const mesh = group as unknown as THREE.Mesh;
    (mesh as any).userData = { playerId: player.id, shadow };
    return mesh;
  }

  function updatePlayerMesh(mesh: any, player: MatchPlayer) {
    mesh.position.set(player.position.x, 0, player.position.z);
    const targetAngle = Math.atan2(player.facing.z, player.facing.x);
    mesh.rotation.y = targetAngle;
    const speed = Math.hypot(player.velocity.x, player.velocity.z);
    const bob = speed > 0.05 ? Math.sin(Date.now() / 120) * 0.06 : 0;
    mesh.children[0].position.y = 1.35 + bob;
    mesh.children[1].position.y = 2.45 + bob;
    const bodyMat = mesh.children[0] as THREE.Mesh;
    (bodyMat.material as THREE.MeshStandardMaterial).color.setHex(player.isActive ? 0x22c55e : player.team === TEAM_HOME ? PLAYER_COLOR_HOME : PLAYER_COLOR_AWAY);
  }

  function createBallMesh(): THREE.Mesh {
    const geo = new THREE.SphereGeometry(0.22, 24, 24);
    const mat = new THREE.MeshStandardMaterial({ color: BALL_COLOR, roughness: 0.2, metalness: 0.1, flatShading: true });
    const ball = new THREE.Mesh(geo, mat);
    ball.castShadow = true;
    ball.receiveShadow = true;
    const shadowGeo = new THREE.CircleGeometry(0.22, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.04;
    ball.add(shadow);
    return ball;
  }

  function updateBallMesh(ball: THREE.Mesh, b: MatchBall) {
    ball.position.set(b.position.x, Math.max(0.22, b.position.y), b.position.z);
    ball.rotation.x += 0.15;
    ball.rotation.z += 0.15;
    const shadow = ball.children[0] as THREE.Mesh;
    const scale = Math.max(0.3, 1 - b.position.y / 6);
    shadow.scale.set(scale, scale, 1);
    (shadow.material as THREE.MeshBasicMaterial).opacity = Math.max(0.15, 0.4 - b.position.y / 12);
  }

  // ------------------------------------------------------------
  // Initial state
  // ------------------------------------------------------------
  function buildInitialState(mode: MatchMode, userTeam: number): MatchState {
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

  // ------------------------------------------------------------
  // Simulation (bots only)
  // ------------------------------------------------------------
  function simulateTick(
    s: MatchState,
    mode: MatchMode,
    userTeam: number,
    input: { moveX: number; moveZ: number; shoot: boolean; pass: boolean; switchPlayer: boolean },
    prevInput: { shoot: boolean; pass: boolean; switchPlayer: boolean }
  ) {
    const dt = 1 / TICK_RATE;
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

    let closest: MatchPlayer | null = null;
    let closestDist = 1e9;
    for (const p of players) {
      const d = Math.hypot(p.position.x - ball.position.x, p.position.z - ball.position.z);
      if (d < closestDist) { closestDist = d; closest = p; }
    }
    ball.closestPlayerId = closest?.id ?? null;
    if (closestDist < 2.5) ball.possession = closest!.team;
    else if (closestDist > 5) ball.possession = null;

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
      const isHumanTeam = p.controlledByHuman;
      const isActive = p.id === activeId;
      const controlled = isHumanTeam && isActive;
      let ax = 0;
      let az = 0;

      if (controlled) {
        const facingSign = p.team === TEAM_HOME ? 1 : -1;
        ax = input.moveX;
        az = input.moveZ * facingSign;
        if (input.shoot && !prevInput.shoot) kickBall(s, p, ball, 'shoot');
        if (input.pass && !prevInput.pass) kickBall(s, p, ball, 'pass');
        if (input.switchPlayer && !prevInput.switchPlayer) switchActivePlayer(s, p.team);
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

  // ------------------------------------------------------------
  // Render updates
  // ------------------------------------------------------------
  function updateSceneFromState(s: MatchState) {
    if (ballMeshRef.current) updateBallMesh(ballMeshRef.current, s.ball);
    for (const p of s.players) {
      let mesh = playerMeshesRef.current.get(p.id);
      if (!mesh) {
        mesh = createPlayerMesh(p);
        sceneRef.current!.add(mesh);
        playerMeshesRef.current.set(p.id, mesh);
      }
      updatePlayerMesh(mesh, p);
    }
    for (const [id, mesh] of playerMeshesRef.current) {
      if (!s.players.find((p) => p.id === id)) {
        sceneRef.current!.remove(mesh);
        playerMeshesRef.current.delete(id);
      }
    }
  }

  function updateCamera(camera: THREE.Camera, s: MatchState, userTeam: number) {
    const attackingDir = userTeam === TEAM_HOME ? 1 : -1;
    const targetX = s.ball.position.x - attackingDir * 22;
    const targetZ = s.ball.position.z + 26;
    const lerp = 0.08;
    camera.position.x += (targetX - camera.position.x) * lerp;
    camera.position.z += (targetZ - camera.position.z) * lerp;
    camera.position.y = 30;
    camera.lookAt(s.ball.position.x, 0, s.ball.position.z);
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  const activePlayer = state?.players.find((p) => p.id === state?.activePlayerId);

  return (
    <div className="flex flex-col h-full">
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 ring ring-white/40"></div>
              <span className="text-xs font-mono text-blue-300 uppercase tracking-wider">HOME</span>
            </div>
            <span className="text-5xl font-extrabold text-white tabular-nums">{state?.homeScore ?? 0}</span>
          </div>
          <div className="flex items-center gap-6 text-white">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-slate-400 font-mono uppercase">Clock</span>
              <span className="text-lg font-mono text-white">{formatClock(state?.clockSeconds ?? 0)}</span>
              <span className="text-xs text-slate-500 font-mono uppercase">P{state?.period ?? 1}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-slate-400 font-mono uppercase">Possession</span>
              <div className="w-24 h-3 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${
                  state?.ball.possession === TEAM_HOME ? 'bg-blue-500 w-12' : state?.ball.possession === TEAM_AWAY ? 'bg-rose-500 w-12' : 'bg-white/20 w-full'
                }`}></div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-rose-500 ring ring-white/40"></div>
              <span className="text-xs font-mono text-rose-300 uppercase tracking-wider">AWAY</span>
              <span className="text-5xl font-extrabold text-white tabular-nums">{state?.awayScore ?? 0}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{mode === 'bots' ? 'Bots' : 'Opponent'}</span>
          </div>
        </div>

        <div className="flex justify-center items-end gap-3 pb-4">
          {state?.state === 'goal' && (
            <div className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse">GOAL!</div>
          )}
          {state?.state === 'fulltime' && (
            <div className="text-2xl font-bold text-white bg-white/10 px-6 py-2 rounded-xl border border-white/20">Full Time</div>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <BatteryCharging size={14} className="text-emerald-400" />
            <span>Active: {activePlayer ? activePlayer.number : '-'}</span>
            <span className="text-slate-500">|</span>
            <span>WASD/Arrows Move &nbsp; Space Shoot &nbsp; Ctrl+S Pass &nbsp; Q/E Switch</span>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 w-full h-full bg-[#040806]" />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none">
        <span className="text-white font-mono text-sm px-3 py-1.5 rounded-full bg-black/40 backdrop-blur border border-white/10 whitespace-nowrap">
          {statusMsg}
        </span>
        {connected === false && mode === 'multiplayer' && <span className="text-sm text-rose-400 font-mono">Connecting to match server...</span>}
      </div>

      <button
        onClick={onExit}
        className="absolute top-6 right-6 z-30 px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-sm font-semibold border border-white/10 hover:bg-white/10 hover:text-white transition"
      >
        Leave Match
      </button>
    </div>
  );

  function formatClock(s: number) {
    const total = Math.floor(s);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

// ----------------------------------------------------------------
// MatchEngine (container)
// ----------------------------------------------------------------
interface MatchEngineProps {
  onExit: () => void;
}

export default function MatchEngine({ onExit }: MatchEngineProps) {
  const [mode, setMode] = useState<MatchMode>('bots');
  const [team, setTeam] = useState<number>(TEAM_HOME);
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('Manager');
  const [joined, setJoined] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startMatch() {
    if (mode === 'multiplayer') {
      setConnecting(true);
      setError(null);
    }
    setJoined(true);
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#070c09] flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-[#040806]/90 backdrop-blur border-b border-white/10 z-10">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition"
        >
          <X size={18} /> <span className="text-sm font-semibold tracking-wide uppercase">Return to Manager</span>
        </button>
        <div className="flex items-center gap-2 text-emerald-400 font-bold tracking-wider text-sm uppercase">
          <Activity size={16} /> Manager Nol &mdash; 3D Match
        </div>
        <div className="text-xs text-slate-500 font-mono">11v11 &middot; Realistic Engine</div>
      </header>

      {!joined ? (
        <MatchLobby
          mode={mode}
          setMode={setMode}
          team={team}
          setTeam={setTeam}
          roomCode={roomCode}
          setRoomCode={setRoomCode}
          username={username}
          setUsername={setUsername}
          connecting={connecting}
          setConnecting={setConnecting}
          error={error}
          setError={setError}
          startMatch={startMatch}
        />
      ) : (
        <MatchView mode={mode} team={team} roomCode={roomCode} username={username} onExit={onExit} />
      )}
    </div>
  );
}
