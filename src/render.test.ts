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

    describe("the Lich", () => {
      const sheetAssets = (names: string[]) => ({
        image: () => undefined,
        sheet: (n: string) =>
          names.includes(n) ? { src: "", frames: 8, fps: 10, image: { width: 800, height: 100 } as unknown as Sprite } : undefined,
        missing: [],
      });
      const sheetDraws = (s: GameState, names: string[]) => {
        let n = 0;
        render(fakeCtx({ drawImage: () => n++ }), s, c, W, H, 1, sheetAssets(names));
        return n;
      };

      // The shared state() fixture starts mid-slide; these tests want a plain run pose.
      const standing = (phase: GameState["phase"]): GameState => {
        const s = state(phase);
        s.player.pose = "run";
        s.player.jumpHeight = 0;
        return s;
      };

      it("plays the idle loop while running and jumping", () => {
        expect(sheetDraws(standing("running"), ["lich.idle"])).toBe(1);
        const jumping = standing("running");
        jumping.player.pose = "jump";
        expect(sheetDraws(jumping, ["lich.idle"])).toBe(1);
      });

      it("does not use the idle loop for a slide (too tall for the arch)", () => {
        const sliding = standing("running");
        sliding.player.pose = "slide";
        expect(sheetDraws(sliding, ["lich.idle"])).toBe(0);
        expect(sheetDraws(sliding, ["lich.idle", "lich.slide"])).toBe(1);
      });

      it("prefers lich.dead once dead, then falls back to the idle loop", () => {
        const lookups = (have: string[]) => {
          const asked: string[] = [];
          const assets = {
            image: () => undefined,
            sheet: (n: string) => {
              asked.push(n);
              return sheetAssets(have).sheet(n);
            },
            missing: [],
          };
          render(fakeCtx(), standing("dead"), c, W, H, 1, assets);
          return asked.filter((n) => n.startsWith("lich."));
        };
        expect(lookups(["lich.dead", "lich.idle"])[0]).toBe("lich.dead");
        expect(lookups(["lich.dead", "lich.idle"])).not.toContain("lich.idle");
        const fallback = lookups(["lich.idle"]);
        expect(fallback.indexOf("lich.dead")).toBeLessThan(fallback.indexOf("lich.idle"));
      });

      it("uses lich.wish in the cutscene and the shape otherwise", () => {
        const cut = { ...state("cutscene"), cutsceneTime: 2.5 };
        expect(sheetDraws(cut, ["lich.wish"])).toBe(1);
        expect(sheetDraws(cut, [])).toBe(0);
      });
    });

    it("animates the portal sheet with time", () => {
      const frameAt = (time: number): number => {
        let sx = -1;
        const ctx = fakeCtx({ drawImage: (...a) => (sx = a[1] as number) });
        const assets = {
          image: () => undefined,
          sheet: (n: string) =>
            n === "portal"
              ? { src: "", frames: 8, fps: 10, image: { width: 800, height: 100 } as unknown as Sprite }
              : undefined,
          missing: [],
        };
        render(ctx, { ...state("portal"), portalZ: 150 }, c, W, H, time, assets);
        return sx;
      };
      expect(frameAt(0)).toBe(0);
      expect(frameAt(0.3)).toBe(300);
      expect(frameAt(0.8)).toBe(0); // loops
    });
  });
});
