import { describe, expect, it } from "vitest";
import { defaultConfig, type GameConfig } from "./config";
import type { GameState, InputAction, ObstacleKind } from "./types";
import { createState, update } from "./world";

const c: GameConfig = { ...defaultConfig };
const DT = 1 / 60;

function empty(): GameState {
  const s = createState(c);
  s.obstacles = [];
  s.collectibles = [];
  s.spawnedUntil = 1e9; // suppress spawning
  return s;
}

function runFor(s: GameState, seconds: number, actions: InputAction[] = []) {
  const n = Math.round(seconds / DT);
  for (let i = 0; i < n; i++) update(s, DT, i === 0 ? actions : [], c);
}

describe("world", () => {
  it("is deterministic", () => {
    const a = createState(c);
    const b = createState(c);
    for (let i = 0; i < 600; i++) {
      const act: InputAction[] = i % 50 === 0 ? ["left"] : i % 70 === 0 ? ["right"] : [];
      update(a, DT, act, c);
      update(b, DT, act, c);
    }
    expect(a).toEqual(b);
  });

  it("clamps lanes", () => {
    const s = empty();
    update(s, DT, ["left", "left", "left"], c);
    expect(s.player.lane).toBe(0);
    update(s, DT, ["right", "right", "right", "right"], c);
    expect(s.player.lane).toBe(2);
    runFor(s, 0.3);
    expect(s.player.laneX).toBe(2);
  });

  function obstacleTest(kind: ObstacleKind, actions: InputAction[], delay: number) {
    const s = empty();
    s.obstacles.push({ id: 1, kind, lane: 1, z: s.speed * delay });
    runFor(s, delay - 0.3 > 0 ? 0 : 0);
    // Perform action so the pose is active when reaching the obstacle.
    update(s, DT, actions, c);
    runFor(s, delay + 0.3);
    return s;
  }

  it("jump clears a gumdrop", () => {
    // jump peak at 0.3s; obstacle at 0.3s of travel
    const s = obstacleTest("gumdrop", ["jump"], 0.3);
    expect(s.phase).not.toBe("dead");
  });

  it("gumdrop kills without a jump", () => {
    expect(obstacleTest("gumdrop", [], 0.3).phase).toBe("dead");
  });

  it("slide clears an arch", () => {
    const s = obstacleTest("licorice-arch", ["slide"], 0.2);
    expect(s.phase).not.toBe("dead");
  });

  it("candy cane in lane kills, even when jumping", () => {
    expect(obstacleTest("candy-cane", ["jump"], 0.3).phase).toBe("dead");
  });

  it("changing lanes avoids a candy cane", () => {
    const s = empty();
    s.obstacles.push({ id: 1, kind: "candy-cane", lane: 1, z: 30 });
    runFor(s, 1.5, ["left"]);
    expect(s.phase).not.toBe("dead");
  });

  it("picks up gems", () => {
    const s = empty();
    s.collectibles.push({ id: 1, kind: "bubblegum-tiara", value: 1, lane: 1, z: 15 });
    runFor(s, 1);
    expect(s.gems).toBe(1);
    expect(s.collectibles).toHaveLength(0);
  });

  it("an Ice King's Crown is worth three gems", () => {
    const s = empty();
    s.collectibles.push({ id: 1, kind: "ice-king-crown", value: 3, lane: 1, z: 15 });
    runFor(s, 1);
    expect(s.gems).toBe(3);
  });

  it("the default goal is nine gems", () => {
    expect(defaultConfig.gemGoal).toBe(9);
  });

  it("never blocks a whole slice and gems avoid obstacles", () => {
    const s = createState(c);
    s.phase = "running";
    let seen = 0;
    for (let i = 0; i < 60 * 60; i++) {
      const dead = (s.phase as string) === "dead";
      // Keep alive for the soak: cheat by pushing obstacles away is not needed; just revive.
      if (dead) s.phase = "running";
      update(s, DT, [], c);
      s.phase = "running";
      const byZ = new Map<number, Set<number>>();
      for (const o of s.obstacles) {
        const k = Math.round(o.z);
        const set = byZ.get(k) ?? new Set();
        set.add(o.lane);
        byZ.set(k, set);
        for (const g of s.collectibles) {
          if (g.lane === o.lane) expect(Math.abs(g.z - o.z)).toBeGreaterThanOrEqual(2);
        }
      }
      for (const set of byZ.values()) expect(set.size).toBeLessThan(3);
      seen += s.obstacles.length;
      if (i % 600 === 0) s.gems = c.gemGoal; // force tier progression
    }
    expect(seen).toBeGreaterThan(0);
    expect(s.tier).toBeGreaterThan(1);
  });

  it("gem goal opens portal; reaching it advances tier and raises speed", () => {
    const s = empty();
    const speed1 = s.speed;
    s.gems = c.gemGoal - 1;
    s.collectibles.push({ id: 1, kind: "bubblegum-tiara", value: 1, lane: 1, z: 5 });
    runFor(s, 0.5);
    expect(s.portalZ).not.toBeNull();
    expect(s.phase).toBe("portal");
    for (let i = 0; i < 600 && s.tier === 1; i++) update(s, DT, [], c);
    expect(s.tier).toBe(2);
    expect(s.bestTier).toBe(2);
    expect(s.gems).toBe(0);
    expect(s.portalZ).toBeNull();
    expect(s.phase).toBe("running");
    expect(s.speed).toBeGreaterThan(speed1);
  });

  it("huge dt cannot skip the portal flow", () => {
    const s = empty();
    s.gems = c.gemGoal;
    update(s, 100, [], c);
    expect(s.portalZ).not.toBeNull();
    expect(s.tier).toBe(1);
  });

  it("death then start resets to tier 1, keeps bestTier", () => {
    const s = empty();
    s.tier = 3;
    s.bestTier = 3;
    s.obstacles.push({ id: 1, kind: "candy-cane", lane: 1, z: 5 });
    runFor(s, 0.5);
    expect(s.phase).toBe("dead");
    const d = s.distance;
    update(s, DT, ["left"], c);
    expect(s.distance).toBe(d);
    update(s, DT, ["start"], c);
    expect(s.phase).toBe("running");
    expect(s.tier).toBe(1);
    expect(s.bestTier).toBe(3);
    expect(s.distance).toBe(0);
  });
});
