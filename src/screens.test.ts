import { describe, expect, it } from "vitest";
import { drawMuted, drawPaused, drawTitle } from "./screens";
import { fakeCtx } from "./test-ctx";

describe("screens", () => {
  it("shows the loading state until ready, then the start prompt", () => {
    const texts: string[] = [];
    const ctx = fakeCtx({ fillText: (t) => texts.push(String(t)) });
    drawTitle(ctx, 800, 600, 1, { done: 1, total: 3, ready: false });
    expect(texts).toContain("Loading 1/3");
    expect(texts.some((t) => t.includes("to begin"))).toBe(false);
    texts.length = 0;
    drawTitle(ctx, 800, 600, 1, { done: 3, total: 3, ready: true });
    expect(texts.some((t) => t.includes("to begin"))).toBe(true);
  });

  it("draws the pause and muted overlays", () => {
    const texts: string[] = [];
    const ctx = fakeCtx({ fillText: (t) => texts.push(String(t)) });
    drawPaused(ctx, 800, 600);
    drawMuted(ctx, 800, 600);
    expect(texts).toContain("Paused");
    expect(texts).toContain("Muted (M)");
  });

  it("copes with a tiny canvas", () => {
    const ctx = fakeCtx();
    expect(() => drawTitle(ctx, 1, 1, 0, { done: 0, total: 0, ready: true })).not.toThrow();
  });
});
