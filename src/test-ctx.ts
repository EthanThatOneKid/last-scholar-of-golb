// Test helper: a CanvasRenderingContext2D whose methods are no-ops and whose gradients are stubs.
// Pass `methods` to replace or spy on specific methods (e.g. drawImage).
export function fakeCtx(
  methods: Record<string, (...args: unknown[]) => unknown> = {},
): CanvasRenderingContext2D {
  const grad = { addColorStop() {} };
  const target: Record<string | symbol, unknown> = {};
  return new Proxy(target, {
    get(t, key) {
      if (typeof key === "string" && key in methods) return methods[key];
      if (key === "createLinearGradient" || key === "createRadialGradient") return () => grad;
      if (key in t) return t[key];
      return () => {};
    },
    set(t, key, value) {
      t[key] = value;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
}
