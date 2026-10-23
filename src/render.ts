// Canvas 2D pseudo-3D renderer. Pure drawing: never mutates game state.
import type { GameConfig } from "./config";
import type { GameState, Gem, Obstacle } from "./types";

export interface Projection {
  x: number;
  y: number;
  scale: number;
}

const HORIZON = 0.36; // fraction of height
const GROUND = 0.86; // fraction of height where relDepth 0 sits
const ROAD_HALF = 0.4; // road half-width as fraction of width at scale 1
const PERSP_K = 8; // perspective strength (relative to viewDistance)
const MIN_DEPTH = -2;

export function project(
  relDepth: number,
  laneX: number,
  c: GameConfig,
  width: number,
  height: number,
): Projection {
  const vd = Math.max(1, c.viewDistance);
  const k = PERSP_K / vd;
  const d = Math.min(vd, Math.max(MIN_DEPTH, relDepth));
  const p = 1 / (1 + d * k);
  const pH = 1 / (1 + vd * k);
  const f = (p - pH) / (1 - pH); // 1 at depth 0, 0 at horizon
  const horizonY = height * HORIZON;
  const groundY = height * GROUND;
  const y = horizonY + (groundY - horizonY) * f;
  const laneW = (width * ROAD_HALF * 2) / 3;
  const x = width / 2 + (laneX - 1) * laneW * p;
  return { x, y, scale: p };
}

const TAU = Math.PI * 2;

function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function drawBackdrop(ctx: CanvasRenderingContext2D, w: number, h: number, time: number): void {
  const hy = h * HORIZON;
  const sky = ctx.createLinearGradient(0, 0, 0, hy);
  sky.addColorStop(0, "#ff9ccf");
  sky.addColorStop(1, "#ffd9b8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, hy + 1);

  // distant candy hills
  const hillColors = ["#f7a8d8", "#c9a7f2", "#ffb3a7"];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = hillColors[i];
    ctx.beginPath();
    ctx.moveTo(0, hy);
    const amp = h * (0.05 - i * 0.01);
    for (let x = 0; x <= w; x += w / 12) {
      ctx.lineTo(x, hy - amp * (1 + Math.sin(x * 0.006 + i * 2.1)) - i * 6);
    }
    ctx.lineTo(w, hy);
    ctx.closePath();
    ctx.fill();
  }

  // cotton-candy clouds
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  for (let i = 0; i < 5; i++) {
    const cx = (((i * 0.23 + time * 0.004) % 1.2) - 0.1) * w;
    const cy = h * (0.06 + 0.05 * hash(i + 1));
    const r = h * (0.025 + 0.015 * hash(i + 7));
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.arc(cx + r * 1.2, cy + r * 0.2, r * 0.8, 0, TAU);
    ctx.arc(cx - r * 1.1, cy + r * 0.3, r * 0.7, 0, TAU);
    ctx.fill();
  }

  // ground beside road
  ctx.fillStyle = "#ffc2e2";
  ctx.fillRect(0, hy, w, h - hy);
}

function drawRoad(
  ctx: CanvasRenderingContext2D,
  s: GameState,
  c: GameConfig,
  w: number,
  h: number,
): void {
  const vd = c.viewDistance;
  const band = 8;
  const phase = s.distance % band;
  const base = Math.floor(s.distance / band);
  const n = Math.ceil(vd / band) + 1;
  for (let i = n; i >= 0; i--) {
    const d0 = Math.min(vd, Math.max(0, i * band - phase));
    const d1 = Math.min(vd, Math.max(0, (i + 1) * band - phase));
    if (d1 <= d0) continue;
    const a = project(d0, 0, c, w, h);
    const b = project(d1, 0, c, w, h);
    const a2 = project(d0, 2, c, w, h);
    const b2 = project(d1, 2, c, w, h);
    const alt = (base + i) % 2 === 0;
    const half = (a2.x - a.x) / 6; // half a lane in px at near edge
    const halfF = (b2.x - b.x) / 6;
    // grass stripe
    ctx.fillStyle = alt ? "#ffb6dc" : "#ffc9e6";
    ctx.fillRect(0, b.y, w, a.y - b.y + 1);
    // road
    ctx.fillStyle = alt ? "#8d6fb3" : "#9b7cc2";
    ctx.beginPath();
    ctx.moveTo(a.x - half, a.y);
    ctx.lineTo(a2.x + half, a.y);
    ctx.lineTo(b2.x + halfF, b.y);
    ctx.lineTo(b.x - halfF, b.y);
    ctx.closePath();
    ctx.fill();
    // edge rumble
    ctx.fillStyle = alt ? "#ffffff" : "#ff5d8f";
    const e = 0.22;
    ctx.beginPath();
    ctx.moveTo(a.x - half, a.y);
    ctx.lineTo(a.x - half * (1 + e), a.y);
    ctx.lineTo(b.x - halfF * (1 + e), b.y);
    ctx.lineTo(b.x - halfF, b.y);
    ctx.closePath();
    ctx.moveTo(a2.x + half, a.y);
    ctx.lineTo(a2.x + half * (1 + e), a.y);
    ctx.lineTo(b2.x + halfF * (1 + e), b.y);
    ctx.lineTo(b2.x + halfF, b.y);
    ctx.closePath();
    ctx.fill();
    // lane dividers (dashed by alt)
    if (alt) {
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      for (let l = 1; l <= 2; l++) {
        // divider between lanes sits at laneX = l - 0.5
        const p0 = project(d0, l - 0.5, c, w, h);
        const p1 = project(d1, l - 0.5, c, w, h);
        const t0 = Math.max(1, 3 * p0.scale);
        const t1 = Math.max(1, 3 * p1.scale);
        ctx.beginPath();
        ctx.moveTo(p0.x - t0, p0.y);
        ctx.lineTo(p0.x + t0, p0.y);
        ctx.lineTo(p1.x + t1, p1.y);
        ctx.lineTo(p1.x - t1, p1.y);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
}

function drawScenery(
  ctx: CanvasRenderingContext2D,
  s: GameState,
  c: GameConfig,
  w: number,
  h: number,
): void {
  const spacing = 14;
  const base = Math.floor(s.distance / spacing);
  const n = Math.ceil(c.viewDistance / spacing) + 1;
  for (let i = n; i >= 0; i--) {
    const idx = base + i;
    const d = idx * spacing - s.distance;
    if (d < 0 || d > c.viewDistance) continue;
    for (let side = 0; side < 2; side++) {
      const r = hash(idx * 2 + side);
      const laneX = side === 0 ? -0.9 - r * 1.6 : 2.9 + r * 1.6;
      const p = project(d, laneX, c, w, h);
      const kind = Math.floor(r * 1000) % 3;
      const sc = p.scale * h * 0.0018;
      if (kind === 0) {
        // lollipop tree
        ctx.fillStyle = "#fff0f6";
        ctx.fillRect(p.x - 3 * sc * 10, p.y - 70 * sc * 10, 6 * sc * 10, 70 * sc * 10);
        const cr = 28 * sc * 10;
        ctx.fillStyle = r > 0.5 ? "#ff6fae" : "#7be0c3";
        ctx.beginPath();
        ctx.arc(p.x, p.y - 80 * sc * 10, cr, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(1, 4 * sc * 10);
        ctx.beginPath();
        ctx.arc(p.x, p.y - 80 * sc * 10, cr * 0.55, 0, TAU);
        ctx.stroke();
      } else {
        // gumdrop bush
        const br = 22 * sc * 10;
        ctx.fillStyle = kind === 1 ? "#ffd23f" : "#8be16b";
        ctx.beginPath();
        ctx.ellipse(p.x, p.y - br * 0.6, br, br * 0.8, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.arc(p.x - br * 0.3, p.y - br * 0.9, br * 0.15, 0, TAU);
        ctx.fill();
      }
    }
  }
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  o: Obstacle,
  rel: number,
  c: GameConfig,
  w: number,
  h: number,
): void {
  const p = project(rel, o.lane, c, w, h);
  const u = p.scale * h * 0.01; // unit: ~1% of screen height at scale 1
  const laneW = (w * ROAD_HALF * 2) / 3 * p.scale;
  if (o.kind === "gumdrop") {
    const r = Math.min(laneW * 0.4, 6 * u);
    ctx.fillStyle = "#3fd16a";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y - r * 0.4, r, r * 0.8, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.arc(p.x - r * 0.35, p.y - r * 0.9, r * 0.18, 0, TAU);
    ctx.fill();
  } else if (o.kind === "candy-cane") {
    const pw = Math.max(2, 2.2 * u);
    const ph = 16 * u;
    const stripes = 6;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#e8213f" : "#ffffff";
      ctx.fillRect(p.x - pw, p.y - ph + (ph / stripes) * i, pw * 2, ph / stripes + 0.5);
    }
    ctx.strokeStyle = "#e8213f";
    ctx.lineWidth = pw * 1.6;
    ctx.beginPath();
    ctx.arc(p.x + pw * 1.5, p.y - ph, pw * 1.6, Math.PI, TAU);
    ctx.stroke();
  } else {
    // licorice arch: high black bar across the lane, posts at the sides
    const half = laneW * 0.46;
    const barY = p.y - 11 * u;
    const bt = Math.max(2, 2.2 * u);
    ctx.fillStyle = "#1b1020";
    ctx.fillRect(p.x - half, p.y - 12 * u, bt, 12 * u);
    ctx.fillRect(p.x + half - bt, p.y - 12 * u, bt, 12 * u);
    ctx.fillRect(p.x - half, barY - bt * 0.5, half * 2, bt * 1.6);
    ctx.fillStyle = "#ff5d8f";
    ctx.fillRect(p.x - half, barY - bt * 0.5, half * 2, Math.max(1, bt * 0.25));
  }
}

function drawCrown(
  ctx: CanvasRenderingContext2D,
  g: Gem,
  rel: number,
  time: number,
  c: GameConfig,
  w: number,
  h: number,
): void {
  const p = project(rel, g.lane, c, w, h);
  const ice = g.kind === "ice-king-crown";
  const u = p.scale * h * 0.01 * (ice ? 1.3 : 1);
  const bob = Math.sin(time * 3 + g.id) * 1.2 * u;
  const cy = p.y - 5 * u + bob;
  const hw = 3.2 * u;
  const hh = 2.4 * u;
  const base = cy + hh * 0.6;
  ctx.save();
  ctx.shadowColor = ice ? "#ff4d6d" : "#7df9ff";
  ctx.shadowBlur = 12 * p.scale + 2;
  ctx.fillStyle = ice ? "#e8e4ff" : "#ffd6f0";
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = Math.max(1, u * 0.25);
  ctx.beginPath();
  ctx.moveTo(p.x - hw, base);
  if (ice) {
    // three-pointed crown
    ctx.lineTo(p.x - hw, cy - hh * 0.4);
    ctx.lineTo(p.x - hw * 0.5, cy + hh * 0.1);
    ctx.lineTo(p.x, cy - hh);
    ctx.lineTo(p.x + hw * 0.5, cy + hh * 0.1);
    ctx.lineTo(p.x + hw, cy - hh * 0.4);
  } else {
    // tiara with a centre peak
    ctx.lineTo(p.x - hw, cy);
    ctx.lineTo(p.x - hw * 0.45, cy + hh * 0.2);
    ctx.lineTo(p.x, cy - hh * 0.8);
    ctx.lineTo(p.x + hw * 0.45, cy + hh * 0.2);
    ctx.lineTo(p.x + hw, cy);
  }
  ctx.lineTo(p.x + hw, base);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  // gems: three rubies for the Ice King's Crown, one blue gem for a tiara
  const gemR = Math.max(1, u * (ice ? 0.75 : 1.0));
  const gems: [number, string][] = ice
    ? [[-hw * 0.55, "#ff2d55"], [0, "#ff2d55"], [hw * 0.55, "#ff2d55"]]
    : [[0, "#3aa0ff"]];
  for (const [dx, color] of gems) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x + dx, base - hh * 0.55, gemR, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPortal(
  ctx: CanvasRenderingContext2D,
  s: GameState,
  c: GameConfig,
  w: number,
  h: number,
  time: number,
): void {
  if (s.portalZ == null) return;
  const rel = s.portalZ - s.distance;
  if (rel < -2 || rel > c.viewDistance) return;
  const p = project(rel, 1, c, w, h);
  const r = Math.max(4, p.scale * h * 0.16);
  const cy = p.y - r * 1.05;
  ctx.save();
  ctx.shadowColor = "#b388ff";
  ctx.shadowBlur = 24 * Math.min(1, p.scale * 2) + 6;
  const g = ctx.createRadialGradient(p.x, cy, r * 0.1, p.x, cy, r);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.6, "rgba(179,136,255,0.7)");
  g.addColorStop(1, "rgba(120,60,220,0.1)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p.x, cy, r, 0, TAU);
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.12);
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = i === 1 ? "#ffe66d" : "#d1b3ff";
    const a = time * (1.5 + i * 0.5) * (i % 2 ? -1 : 1) + i * 2;
    ctx.beginPath();
    ctx.arc(p.x, cy, r * (1 - i * 0.2), a, a + Math.PI * 1.2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  s: GameState,
  c: GameConfig,
  w: number,
  h: number,
  time: number,
): void {
  const pl = s.player;
  const p = project(0, pl.laneX, c, w, h);
  const u = h * 0.01;
  const lift = pl.jumpHeight * 12 * u;
  const slide = pl.pose === "slide";
  const bodyH = (slide ? 6 : 14) * u;
  const bodyW = (slide ? 9 : 6) * u;
  const stride = s.phase === "dead" ? 0 : Math.sin(time * 14) * 0.6 * u;
  const gy = p.y - lift;
  // shadow
  ctx.fillStyle = "rgba(40,10,60,0.35)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, bodyW * (1 - pl.jumpHeight * 0.3), u * 1.2, 0, 0, TAU);
  ctx.fill();
  // robe
  ctx.fillStyle = "#1d1630";
  ctx.beginPath();
  ctx.moveTo(p.x - bodyW * 0.5 + stride, gy);
  ctx.lineTo(p.x + bodyW * 0.5 + stride, gy);
  ctx.lineTo(p.x + bodyW * 0.28, gy - bodyH);
  ctx.lineTo(p.x - bodyW * 0.28, gy - bodyH);
  ctx.closePath();
  ctx.fill();
  // hood
  const hr = (slide ? 3 : 3.4) * u;
  const hy = gy - bodyH - hr * 0.5;
  ctx.fillStyle = "#2c2147";
  ctx.beginPath();
  ctx.arc(slide ? p.x + bodyW * 0.35 : p.x, hy + (slide ? hr * 0.6 : 0), hr, 0, TAU);
  ctx.fill();
  // glowing eyes
  ctx.fillStyle = "#9dff6a";
  const ex = slide ? p.x + bodyW * 0.35 : p.x;
  ctx.fillRect(ex - hr * 0.5, hy + (slide ? hr * 0.6 : 0) - hr * 0.1, hr * 0.3, hr * 0.25);
  ctx.fillRect(ex + hr * 0.2, hy + (slide ? hr * 0.6 : 0) - hr * 0.1, hr * 0.3, hr * 0.25);
}

function centered(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  fill: string,
): void {
  ctx.font = `bold ${Math.round(size)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.lineWidth = Math.max(2, size * 0.12);
  ctx.strokeStyle = "rgba(40,10,60,0.8)";
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

export function render(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  c: GameConfig,
  width: number,
  height: number,
  time: number,
): void {
  drawBackdrop(ctx, width, height, time);
  drawRoad(ctx, state, c, width, height);
  drawScenery(ctx, state, c, width, height);

  // obstacles and gems, far to near (both lists are roughly z-sorted; merge by index)
  const obs = state.obstacles;
  const gems = state.collectibles;
  const vd = c.viewDistance;
  const items: Array<{ rel: number; o?: Obstacle; g?: Gem }> = [];
  for (let i = 0; i < obs.length; i++) {
    const rel = obs[i].z - state.distance;
    if (rel < -2 || rel > vd) continue;
    items.push({ rel, o: obs[i] });
  }
  for (let i = 0; i < gems.length; i++) {
    const rel = gems[i].z - state.distance;
    if (rel < -2 || rel > vd) continue;
    items.push({ rel, g: gems[i] });
  }
  items.sort((a, b) => b.rel - a.rel);
  for (const it of items) {
    if (it.o) drawObstacle(ctx, it.o, it.rel, c, width, height);
    else if (it.g) drawCrown(ctx, it.g, it.rel, time, c, width, height);
  }

  drawPortal(ctx, state, c, width, height, time);
  drawPlayer(ctx, state, c, width, height, time);

  // HUD
  const fs = Math.max(14, height * 0.032);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.font = `bold ${Math.round(fs)}px system-ui, sans-serif`;
  const hud = (t: string, x: number, y: number): void => {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(40,10,60,0.8)";
    ctx.strokeText(t, x, y);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(t, x, y);
  };
  hud(`Tier ${state.tier}`, fs * 0.6, fs * 1.4);
  hud(`Gems ${state.gems}/${state.gemGoal}`, fs * 0.6, fs * 2.7);
  hud(`Best tier ${state.bestTier}`, fs * 0.6, fs * 4.0);

  if (state.phase === "portal") {
    ctx.globalAlpha = 0.85 + 0.15 * Math.sin(time * 4);
    centered(ctx, "Portal to Prismo ahead!", width / 2, height * 0.16, fs * 1.2, "#e0ccff");
    ctx.globalAlpha = 1;
  } else if (state.phase === "dead") {
    ctx.fillStyle = "rgba(30,10,50,0.55)";
    ctx.fillRect(0, 0, width, height);
    centered(ctx, "You fell in Ooo - press Space to restart", width / 2, height * 0.45, fs * 1.5, "#ffffff");
    centered(ctx, `Tier reached: ${state.tier}`, width / 2, height * 0.45 + fs * 2.2, fs * 1.2, "#ffe66d");
  }
}
