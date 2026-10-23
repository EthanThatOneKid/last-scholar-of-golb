import { tierDensity, tierSpeed, type GameConfig } from "./config";
import type { GameState, InputAction, Lane, ObstacleKind } from "./types";

const MAX_DT = 0.1;
const SLICE = 8;
const START_GRACE = 20;
const KINDS: ObstacleKind[] = ["gumdrop", "candy-cane", "licorice-arch"];

/** mulberry32 stepping over state.rngState. Returns [0, 1). */
function rand(state: GameState): number {
  state.rngState = (state.rngState + 0x6d2b79f5) >>> 0;
  let t = state.rngState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function randLane(state: GameState): Lane {
  return Math.min(2, Math.floor(rand(state) * 3)) as Lane;
}

export function createState(c: GameConfig, tier = 1, bestTier = 1): GameState {
  const state: GameState = {
    phase: "running",
    tier,
    speed: tierSpeed(c, tier),
    distance: 0,
    gems: 0,
    gemGoal: c.gemGoal,
    obstacles: [],
    collectibles: [],
    portalZ: null,
    cutsceneTime: 0,
    player: { lane: 1, laneX: 1, pose: "run", poseTimeLeft: 0, jumpHeight: 0 },
    bestTier: Math.max(bestTier, tier),
    nextId: 1,
    lastCrownZ: -1e9,
    spawnedUntil: START_GRACE,
    rngState: 0x9e3779b9,
  };
  spawn(state, c);
  return state;
}

function spawn(state: GameState, c: GameConfig): void {
  const horizon = state.distance + c.viewDistance;
  const limit = state.portalZ === null ? horizon : Math.min(horizon, state.portalZ);
  const pObstacle = Math.min(1, (tierDensity(c, state.tier) * SLICE) / 100);
  const pGem = Math.min(1, (c.gemDensity * SLICE) / 100);
  while (state.spawnedUntil + SLICE <= limit) {
    const start = state.spawnedUntil;
    let obstacleLane: Lane | -1 = -1;
    let obstacleZ = 0;
    if (rand(state) < pObstacle) {
      obstacleLane = randLane(state);
      obstacleZ = start + SLICE / 2;
      const kind = KINDS[Math.min(2, Math.floor(rand(state) * 3))];
      state.obstacles.push({ id: state.nextId++, kind, lane: obstacleLane, z: obstacleZ });
    }
    if (rand(state) < pGem) {
      const lane = randLane(state);
      const z = start + rand(state) * SLICE;
      const clear = !(lane === obstacleLane && Math.abs(z - obstacleZ) < 2);
      if (clear && z - state.lastCrownZ >= c.crownSpacing) {
        state.lastCrownZ = z;
        const ice = rand(state) < c.iceCrownChance;
        state.collectibles.push({
          id: state.nextId++,
          kind: ice ? "ice-king-crown" : "bubblegum-tiara",
          value: ice ? 3 : 1,
          lane,
          z,
        });
      }
    }
    state.spawnedUntil = start + SLICE;
  }
}

function applyAction(state: GameState, a: InputAction, c: GameConfig): void {
  const p = state.player;
  if (a === "left") p.lane = Math.max(0, p.lane - 1) as Lane;
  else if (a === "right") p.lane = Math.min(2, p.lane + 1) as Lane;
  else if (a === "jump" && p.pose === "run") {
    p.pose = "jump";
    p.poseTimeLeft = c.jumpSeconds;
  } else if (a === "slide" && p.pose === "run" && p.jumpHeight === 0) {
    p.pose = "slide";
    p.poseTimeLeft = c.slideSeconds;
  }
}

/** Skipping the cutscene is allowed once this many seconds have played. */
const CUTSCENE_SKIP_AFTER = 1;

function advanceTier(state: GameState, c: GameConfig): void {
  state.tier++;
  state.bestTier = Math.max(state.bestTier, state.tier);
  state.gems = 0;
  state.portalZ = null;
  state.cutsceneTime = 0;
  state.phase = "running";
  state.obstacles = [];
  state.collectibles = [];
  state.spawnedUntil = state.distance + START_GRACE;
  state.speed = tierSpeed(c, state.tier);
}

export function update(state: GameState, dt: number, actions: InputAction[], c: GameConfig): void {
  if (state.phase === "cutscene") {
    state.cutsceneTime += Math.min(Math.max(dt, 0), MAX_DT);
    const skip = actions.includes("start") && state.cutsceneTime >= CUTSCENE_SKIP_AFTER;
    if (skip || state.cutsceneTime >= c.cutsceneSeconds) advanceTier(state, c);
    return;
  }
  if (state.phase === "dead") {
    if (actions.includes("start")) {
      Object.assign(state, createState(c, 1, state.bestTier));
    }
    return;
  }
  dt = Math.min(Math.max(dt, 0), MAX_DT);
  const p = state.player;

  for (const a of actions) applyAction(state, a, c);

  // Pose timers.
  if (p.pose !== "run") {
    p.poseTimeLeft = Math.max(0, p.poseTimeLeft - dt);
    if (p.poseTimeLeft <= 0) {
      p.pose = "run";
      p.jumpHeight = 0;
    } else if (p.pose === "jump") {
      const t = 1 - p.poseTimeLeft / c.jumpSeconds;
      p.jumpHeight = Math.max(0, 4 * t * (1 - t));
    }
  }

  // Lane easing.
  const step = dt / Math.max(c.laneChangeSeconds, 1e-6);
  if (p.laneX < p.lane) p.laneX = Math.min(p.lane, p.laneX + step);
  else if (p.laneX > p.lane) p.laneX = Math.max(p.lane, p.laneX - step);

  // Movement.
  state.speed = tierSpeed(c, state.tier);
  state.gemGoal = c.gemGoal;
  const prev = state.distance;
  state.distance += state.speed * dt;
  const now = state.distance;

  // Collisions (swept over the distance travelled this tick).
  const laneNow = Math.round(p.laneX);
  for (const o of state.obstacles) {
    if (o.lane !== laneNow || o.z < prev - 1 || o.z > now + 1) continue;
    const avoided =
      (o.kind === "gumdrop" && p.jumpHeight >= 0.4) ||
      (o.kind === "licorice-arch" && p.pose === "slide");
    if (!avoided) {
      state.phase = "dead";
      return;
    }
  }
  const kept = [];
  for (const g of state.collectibles) {
    if (g.lane === laneNow && g.z >= prev - 1 && g.z <= now + 1) state.gems += g.value;
    else kept.push(g);
  }
  state.collectibles = kept;

  // Cleanup behind the player.
  state.obstacles = state.obstacles.filter((o) => o.z >= now - 5);
  state.collectibles = state.collectibles.filter((g) => g.z >= now - 5);

  // Portal.
  if (state.gems >= c.gemGoal && state.portalZ === null) {
    state.portalZ = now + c.viewDistance * 0.5 + c.portalLead;
    state.phase = "portal";
    const pz = state.portalZ;
    state.obstacles = state.obstacles.filter((o) => o.z <= pz);
    state.collectibles = state.collectibles.filter((g) => g.z <= pz);
    state.spawnedUntil = Math.min(state.spawnedUntil, pz);
  }
  if (state.portalZ !== null && now >= state.portalZ) {
    // Through the portal: the tier advances when the cutscene ends.
    state.phase = "cutscene";
    state.cutsceneTime = 0;
    state.obstacles = [];
    state.collectibles = [];
    return;
  }
  spawn(state, c);
}
