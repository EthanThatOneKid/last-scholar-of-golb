import { describe, expect, it } from "vitest";
import { actionForKey, actionsForKey, createInput } from "./input";

describe("key mapping", () => {
  const table: [string, string[]][] = [
    ["ArrowLeft", ["left"]],
    ["a", ["left"]],
    ["A", ["left"]],
    ["ArrowRight", ["right"]],
    ["d", ["right"]],
    ["D", ["right"]],
    ["ArrowUp", ["jump"]],
    ["w", ["jump"]],
    ["W", ["jump"]],
    [" ", ["jump", "start"]],
    ["ArrowDown", ["slide"]],
    ["s", ["slide"]],
    ["S", ["slide"]],
    ["Enter", ["start"]],
    ["p", ["pause"]],
    ["P", ["pause"]],
    ["Escape", ["pause"]],
    ["m", ["mute"]],
    ["M", ["mute"]],
    ["x", []],
    ["toString", []],
  ];
  for (const [key, expected] of table) {
    it(`maps ${JSON.stringify(key)}`, () => {
      expect(actionsForKey(key)).toEqual(expected);
      expect(actionForKey(key)).toBe(expected[0] ?? null);
    });
  }
});

function fakeTarget() {
  let listener: ((e: Event) => void) | null = null;
  return {
    addEventListener: (_t: string, l: unknown) => {
      listener = l as (e: Event) => void;
    },
    removeEventListener: (_t: string, l: unknown) => {
      if (listener === l) listener = null;
    },
    fire(key: string, extra: Record<string, unknown> = {}) {
      const ev = { key, repeat: false, prevented: false, preventDefault() { this.prevented = true; }, ...extra };
      listener?.(ev as unknown as Event);
      return ev;
    },
    has: () => listener !== null,
  };
}

describe("createInput", () => {
  it("queues in order and drain clears", () => {
    const t = fakeTarget();
    const h = createInput(t as never);
    t.fire("a");
    t.fire(" ");
    t.fire("ArrowDown");
    expect(h.drain()).toEqual(["left", "jump", "start", "slide"]);
    expect(h.drain()).toEqual([]);
  });

  it("prevents default only for mapped keys", () => {
    const t = fakeTarget();
    createInput(t as never);
    expect(t.fire("a").prevented).toBe(true);
    expect(t.fire("x").prevented).toBe(false);
  });

  it("ignores repeats and form fields", () => {
    const t = fakeTarget();
    const h = createInput(t as never);
    t.fire("a", { repeat: true });
    t.fire("d", { target: { tagName: "INPUT" } });
    expect(h.drain()).toEqual([]);
  });

  it("dispose removes the listener", () => {
    const t = fakeTarget();
    const h = createInput(t as never);
    expect(t.has()).toBe(true);
    h.dispose();
    expect(t.has()).toBe(false);
    t.fire("a");
    expect(h.drain()).toEqual([]);
  });
});
