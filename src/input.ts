import type { InputAction } from "./types";

const KEY_ACTIONS: Record<string, InputAction[]> = {
  ArrowLeft: ["left"],
  a: ["left"],
  A: ["left"],
  ArrowRight: ["right"],
  d: ["right"],
  D: ["right"],
  ArrowUp: ["jump"],
  w: ["jump"],
  W: ["jump"],
  " ": ["jump", "start"],
  ArrowDown: ["slide"],
  s: ["slide"],
  S: ["slide"],
  Enter: ["start"],
};

export function actionsForKey(key: string): InputAction[] {
  const a = Object.prototype.hasOwnProperty.call(KEY_ACTIONS, key)
    ? KEY_ACTIONS[key]
    : undefined;
  return a ? [...a] : [];
}

export function actionForKey(key: string): InputAction | null {
  return actionsForKey(key)[0] ?? null;
}

export interface InputHandle {
  drain(): InputAction[];
  dispose(): void;
}

export function createInput(
  target: Pick<Window, "addEventListener" | "removeEventListener">,
): InputHandle {
  let queue: InputAction[] = [];
  const onKeyDown = (ev: Event) => {
    const e = ev as KeyboardEvent;
    if (e.repeat) return;
    const t = e.target as { tagName?: string } | null;
    const tag = t?.tagName?.toUpperCase();
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    const actions = actionsForKey(e.key);
    if (actions.length === 0) return;
    e.preventDefault();
    queue.push(...actions);
  };
  target.addEventListener("keydown", onKeyDown);
  return {
    drain() {
      const out = queue;
      queue = [];
      return out;
    },
    dispose() {
      target.removeEventListener("keydown", onKeyDown);
    },
  };
}
