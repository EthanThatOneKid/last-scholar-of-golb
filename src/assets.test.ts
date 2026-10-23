import { describe, expect, it } from "vitest";
import { assetUrl, drawSprite, loadImages, noAssets, type Sprite } from "./assets";
import { fakeCtx } from "./test-ctx";

const sprite = (width: number, height: number): Sprite => ({ width, height }) as unknown as Sprite;

describe("loadImages", () => {
  it("loads every image and reports progress", async () => {
    const progress: [number, number][] = [];
    const assets = await loadImages(
      { a: "/a.png", b: "/b.png" },
      { loadImage: async () => sprite(4, 4), onProgress: (d, t) => progress.push([d, t]) },
    );
    expect(assets.image("a")).toBeDefined();
    expect(assets.image("b")).toBeDefined();
    expect(assets.missing).toEqual([]);
    expect(progress).toEqual([
      [1, 2],
      [2, 2],
    ]);
  });

  it("never rejects: failed images are recorded as missing", async () => {
    const assets = await loadImages(
      { good: "/good.png", bad: "/bad.png" },
      {
        loadImage: async (url) => {
          if (url.includes("bad")) throw new Error("404");
          return sprite(4, 4);
        },
      },
    );
    expect(assets.image("good")).toBeDefined();
    expect(assets.image("bad")).toBeUndefined();
    expect(assets.missing).toEqual(["bad"]);
  });

  it("handles an empty manifest", async () => {
    const assets = await loadImages({}, { loadImage: async () => sprite(1, 1) });
    expect(assets.image("x")).toBeUndefined();
    expect(assets.missing).toEqual([]);
  });
});

describe("drawSprite", () => {
  function draw(name: string, anchor?: "bottom" | "center") {
    const calls: unknown[][] = [];
    const ctx = fakeCtx({ drawImage: (...a) => calls.push(a) });
    const assets = { image: (n: string) => (n === "s" ? sprite(10, 20) : undefined), missing: [] };
    const ok = drawSprite(ctx, assets, name, 100, 200, 40, anchor);
    return { ok, calls };
  }

  it("anchors the bottom edge at y, centered on x, keeping aspect ratio", () => {
    const { ok, calls } = draw("s");
    expect(ok).toBe(true);
    // 10x20 sprite scaled to 40px tall -> 20px wide
    expect(calls[0].slice(1)).toEqual([90, 160, 20, 40]);
  });

  it("can anchor on the center", () => {
    const { calls } = draw("s", "center");
    expect(calls[0].slice(1)).toEqual([90, 180, 20, 40]);
  });

  it("returns false and draws nothing for a missing sprite or no assets", () => {
    expect(draw("nope")).toEqual({ ok: false, calls: [] });
    const ctx = fakeCtx({ drawImage: () => {
      throw new Error("should not draw");
    } });
    expect(drawSprite(ctx, undefined, "s", 0, 0, 10)).toBe(false);
    expect(drawSprite(ctx, noAssets, "s", 0, 0, 10)).toBe(false);
  });

  it("ignores zero-size sprites and zero height", () => {
    const ctx = fakeCtx();
    const zero = { image: () => sprite(0, 0), missing: [] };
    expect(drawSprite(ctx, zero, "z", 0, 0, 10)).toBe(false);
    const ok = { image: () => sprite(4, 4), missing: [] };
    expect(drawSprite(ctx, ok, "z", 0, 0, 0)).toBe(false);
  });
});

describe("assetUrl", () => {
  it("joins a public/ path onto the base URL without doubling slashes", () => {
    expect(assetUrl("assets/images/a.png")).toMatch(/\/assets\/images\/a\.png$/);
    expect(assetUrl("/assets/a.png")).not.toContain("//assets");
  });
});

describe("sprite sheets", () => {
  const sheetSprite = () => sprite(80, 20); // 4 frames of 20x20

  it("loads sheets alongside plain images and counts them in progress", async () => {
    const progress: [number, number][] = [];
    const assets = await loadImages(
      { plain: "/plain.png" },
      {
        sheets: { anim: { src: "/anim.png", frames: 4, fps: 8 } },
        loadImage: async (url) => (url.includes("anim") ? sheetSprite() : sprite(4, 4)),
        onProgress: (d, t) => progress.push([d, t]),
      },
    );
    expect(assets.image("plain")).toBeDefined();
    expect(assets.sheet?.("anim")).toMatchObject({ frames: 4, fps: 8 });
    expect(assets.image("anim")).toBeUndefined();
    expect(progress.at(-1)).toEqual([2, 2]);
  });

  it("rejects a sheet with a bad frame count or fps as missing", async () => {
    const assets = await loadImages(
      {},
      {
        sheets: {
          zero: { src: "/a.png", frames: 0, fps: 8 },
          still: { src: "/b.png", frames: 4, fps: 0 },
        },
        loadImage: async () => sheetSprite(),
      },
    );
    expect(assets.sheet?.("zero")).toBeUndefined();
    expect(assets.sheet?.("still")).toBeUndefined();
    expect([...assets.missing].sort()).toEqual(["still", "zero"]);
  });

  async function drawAt(time: number) {
    const calls: unknown[][] = [];
    const ctx = fakeCtx({ drawImage: (...a) => calls.push(a) });
    const assets = await loadImages(
      {},
      {
        sheets: { anim: { src: "/anim.png", frames: 4, fps: 10 } },
        loadImage: async () => sheetSprite(),
      },
    );
    const ok = drawSprite(ctx, assets, "anim", 100, 200, 40, "bottom", time);
    return { ok, call: calls[0]?.slice(1) };
  }

  it("draws the frame for the time, keeping the frame's aspect ratio", async () => {
    // frame 0 of an 80x20 sheet is 20x20, drawn 40 tall -> 40 wide, centered on x=100
    expect(await drawAt(0)).toEqual({ ok: true, call: [0, 0, 20, 20, 80, 160, 40, 40] });
    expect((await drawAt(0.1)).call?.[0]).toBe(20); // 10 fps: frame 1
    expect((await drawAt(0.35)).call?.[0]).toBe(60); // frame 3
  });

  it("loops back to the first frame", async () => {
    expect((await drawAt(0.4)).call?.[0]).toBe(0);
    expect((await drawAt(1.35)).call?.[0]).toBe(20); // 13 % 4 = frame 1
  });

  it("treats negative time as the first frame", async () => {
    expect((await drawAt(-3)).call?.[0]).toBe(0);
  });
});

