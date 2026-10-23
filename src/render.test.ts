import { describe, expect, it } from "vitest";
import { defaultConfig } from "./config";
import type { Sprite } from "./assets";
import { project, render } from "./render";
import { fakeCtx } from "./test-ctx";
import type { GameState } from "./types";

const c = defaultConfig;
const W = 800;
const H = 600;

describe("project", () => {
  it("scale shrinks monotonically with depth", () => {
    let prev = Infinity;
    for (let d = 0; d <= c.viewDistance; d += 5) {
      const p = project(d, 1, c, W, H);
      expect(p.scale).toBeLessThanOrEqual(prev);
      prev = p.scale;
    }
    expect(project(0, 1, c, W, H).scale).toBeCloseTo(1);
  });

  it("is symmetric around the center lane", () => {
    for (const d of [0, 20, 80]) {
      const l = project(d, 0, c, W, H);
      const m = project(d, 1, c, W, H);
      const r = project(d, 2, c, W, H);
      expect(m.x).toBeCloseTo(W / 2);
      expect(m.x - l.x).toBeCloseTo(r.x - m.x);
    }
  });

  it("reaches the horizon at viewDistance and clamps beyond", () => {
    const far = project(c.viewDistance, 1, c, W, H);
    const farther = project(c.viewDistance * 3, 1, c, W, H);
    expect(far.y).toBeCloseTo(H * 0.36);
    expect(farther.y).toBeCloseTo(far.y);
    expect(project(0, 1, c, W, H).y).toBeGreaterThan(far.y);
    expect(project(50, 1, c, W, H).y).toBeLessThan(project(10, 1, c, W, H).y);
  });

  it("returns finite values", () => {
    for (const d of [-5, 0, 1, 60, 120, 1e6]) {
      for (const lx of [-1, 0, 1, 2, 3]) {
        const p = project(d, lx, c, W, H);
        expect(Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.scale)).toBe(true);
      }
    }
  });
});

function state(phase: GameState["phase"]): GameState {
  return {
    phase,
    tier: 2,
    speed: 36,
    distance: 123.4,
    gems: 3,
    gemGoal: 10,
    obstacles: [
      { id: 1, kind: "gumdrop", lane: 0, z: 150 },
      { id: 2, kind: "candy-cane", lane: 1, z: 180 },
      { id: 3, kind: "licorice-arch", lane: 2, z: 124 },
    ],
    collectibles: [{ id: 4, kind: "bubblegum-tiara", value: 1, lane: 1, z: 160 }],
    portalZ: phase === "portal" ? 200 : null,
    cutsceneTime: phase === "cutscene" ? 2.5 : 0,
    player: { lane: 1, laneX: 1, pose: "slide", poseTimeLeft: 0.2, jumpHeight: 0.4 },
    bestTier: 3,
    nextId: 5,
    lastCrownZ: 160,
    spawnedUntil: 250,
    rngState: 1,
  };
}

describe("render", () => {
  it("draws every phase without throwing or mutating state", () => {
    for (const phase of ["running", "dead", "portal", "cutscene"] as const) {
      const s = state(phase);
      const before = JSON.stringify(s);
      expect(() => render(fakeCtx(), s, c, W, H, 1.5)).not.toThrow();
      expect(JSON.stringify(s)).toBe(before);
    }
  });

  it("draws the cutscene at every moment without throwing", () => {
    for (const cutsceneTime of [0, 0.4, 1, 2, 3.5, 5.5, c.cutsceneSeconds]) {
      const s = { ...state("cutscene"), cutsceneTime };
      expect(() => render(fakeCtx(), s, c, W, H, 1.5)).not.toThrow();
    }
  });

  it("projects the near road edge below the bottom of the canvas", () => {
    for (const viewDistance of [60, 120, 300]) {
      expect(project(-1000, 1, { ...c, viewDistance }, W, H).y).toBeGreaterThan(H);
    }
  });

  describe("sprites", () => {
    const sprite = (): Sprite => ({ width: 10, height: 20 }) as unknown as Sprite;
    const withSprites = (names: string[]) => ({
      image: (n: string) => (names.includes(n) ? sprite() : undefined),
      missing: [],
    });

    it("draws loaded sprites instead of shapes", () => {
      const drawn: string[] = [];
      const ctx = fakeCtx({ drawImage: () => drawn.push("img") });
      const s = { ...state("portal"), portalZ: 150 };
      render(
        ctx,
        s,
        c,
        W,
        H,
        1,
        withSprites([
          "obstacle.gumdrop",
          "obstacle.candy-cane",
          "obstacle.licorice-arch",
          "crown.bubblegum-tiara",
          "portal",
          "lich.slide",
        ]),
      );
      // 3 obstacles + 1 crown + portal + lich
      expect(drawn).toHaveLength(6);
    });

    it("falls back to shapes when no assets, or when a sprite is missing", () => {
      let images = 0;
      const ctx = fakeCtx({ drawImage: () => images++ });
      render(ctx, state("running"), c, W, H, 1);
      render(ctx, state("running"), c, W, H, 1, withSprites([]));
      expect(images).toBe(0);
    });

    it("falls back to the plain lich sprite when the pose sprite is missing", () => {
      let images = 0;
      const ctx = fakeCtx({ drawImage: () => images++ });
      render(ctx, state("running"), c, W, H, 1, withSprites(["lich"]));
      expect(images).toBe(1);
    });
  });
});
