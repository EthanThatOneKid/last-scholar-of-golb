import type { GameConfig } from "./config";

export interface DebugField {
  key: keyof GameConfig;
  label: string;
  min: number;
  max: number;
  step: number;
}

export const DEBUG_FIELDS: readonly DebugField[] = [
  { key: "startSpeed", label: "start speed", min: 10, max: 120, step: 1 },
  { key: "speedPerTier", label: "speed / tier", min: 0, max: 30, step: 0.5 },
  { key: "cutsceneSeconds", label: "cutscene seconds", min: 1, max: 15, step: 0.5 },
  { key: "gemGoal", label: "gem goal", min: 1, max: 50, step: 1 },
  { key: "obstacleDensity", label: "obstacle density", min: 0, max: 20, step: 0.1 },
  { key: "densityPerTier", label: "density / tier", min: 0, max: 5, step: 0.1 },
  { key: "gemDensity", label: "crown density", min: 0, max: 20, step: 0.1 },
  { key: "crownSpacing", label: "crown spacing", min: 0, max: 100, step: 1 },
  { key: "iceCrownChance", label: "ice crown chance", min: 0, max: 1, step: 0.05 },
  { key: "laneChangeSeconds", label: "lane change s", min: 0.04, max: 0.5, step: 0.01 },
  { key: "jumpSeconds", label: "jump s", min: 0.2, max: 1.5, step: 0.01 },
  { key: "slideSeconds", label: "slide s", min: 0.2, max: 1.5, step: 0.01 },
  { key: "viewDistance", label: "view distance", min: 60, max: 300, step: 5 },
  { key: "portalLead", label: "portal lead", min: 10, max: 100, step: 1 },
];

const CSS = `
.dbg-panel{position:fixed;top:8px;right:8px;z-index:1000;font:11px/1.4 monospace;color:#e8e8f0}
.dbg-toggle{display:block;margin-left:auto;background:rgba(15,10,30,.75);color:#e8e8f0;border:1px solid #555;border-radius:4px;font:inherit;padding:2px 8px;cursor:pointer}
.dbg-body{margin-top:4px;padding:8px;background:rgba(15,10,30,.85);border:1px solid #555;border-radius:6px;width:260px}
.dbg-body[hidden]{display:none}
.dbg-row{display:grid;grid-template-columns:100px 1fr 44px;gap:6px;align-items:center;margin-bottom:3px}
.dbg-row input{width:100%;min-width:0}
.dbg-val{text-align:right}
.dbg-reset{margin-top:6px;width:100%;font:inherit;cursor:pointer}
`;

export function mountDebugPanel(
  container: HTMLElement,
  c: GameConfig,
  defaults: GameConfig,
): { dispose(): void; toggle(): void } {
  const doc = container.ownerDocument;
  const style = doc.createElement("style");
  style.textContent = CSS;
  doc.head.appendChild(style);

  const root = doc.createElement("div");
  root.className = "dbg-panel";
  const button = doc.createElement("button");
  button.className = "dbg-toggle";
  button.type = "button";
  button.textContent = "debug";
  const body = doc.createElement("div");
  body.className = "dbg-body";
  body.hidden = true;
  root.append(button, body);

  const refreshers: (() => void)[] = [];
  for (const f of DEBUG_FIELDS) {
    const row = doc.createElement("label");
    row.className = "dbg-row";
    const name = doc.createElement("span");
    name.textContent = f.label;
    const slider = doc.createElement("input");
    slider.type = "range";
    slider.min = String(f.min);
    slider.max = String(f.max);
    slider.step = String(f.step);
    const val = doc.createElement("span");
    val.className = "dbg-val";
    const refresh = () => {
      slider.value = String(c[f.key]);
      val.textContent = String(c[f.key]);
    };
    slider.addEventListener("input", () => {
      let v = Number(slider.value);
      if (f.key === "gemGoal") v = Math.round(v);
      c[f.key] = v;
      val.textContent = String(v);
      slider.blur();
    });
    refreshers.push(refresh);
    refresh();
    row.append(name, slider, val);
    body.appendChild(row);
  }

  const reset = doc.createElement("button");
  reset.className = "dbg-reset";
  reset.type = "button";
  reset.textContent = "Reset to defaults";
  reset.addEventListener("click", () => {
    Object.assign(c, defaults);
    refreshers.forEach((r) => r());
    reset.blur();
  });
  body.appendChild(reset);

  const toggle = () => {
    body.hidden = !body.hidden;
  };
  button.addEventListener("click", () => {
    toggle();
    button.blur();
  });
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "`") toggle();
  };
  window.addEventListener("keydown", onKey);

  container.appendChild(root);

  return {
    toggle,
    dispose() {
      window.removeEventListener("keydown", onKey);
      root.remove();
      style.remove();
    },
  };
}
