import { describe, expect, it } from "vitest";
import { defaultConfig } from "./config";
import { DEBUG_FIELDS } from "./debug-panel";

describe("DEBUG_FIELDS", () => {
  it("covers exactly the GameConfig keys", () => {
    const keys = DEBUG_FIELDS.map((f) => f.key).sort();
    expect(keys).toEqual(Object.keys(defaultConfig).sort());
  });

  it("has sane ranges and defaults inside them", () => {
    for (const f of DEBUG_FIELDS) {
      expect(f.min).toBeLessThan(f.max);
      expect(f.step).toBeGreaterThan(0);
      expect(defaultConfig[f.key]).toBeGreaterThanOrEqual(f.min);
      expect(defaultConfig[f.key]).toBeLessThanOrEqual(f.max);
    }
  });
});
