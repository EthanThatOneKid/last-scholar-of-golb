// Full-screen overlays drawn over a frozen game frame: the title screen and the pause screen.
// Pure drawing, no state.

export interface LoadProgress {
  done: number;
  total: number;
  ready: boolean;
}

function text(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  size: number,
  fill: string,
): void {
  ctx.font = `bold ${Math.round(size)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.lineWidth = Math.max(2, size * 0.12);
  ctx.strokeStyle = "rgba(40,10,60,0.8)";
  ctx.strokeText(s, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(s, x, y);
}

export function drawTitle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  progress: LoadProgress,
): void {
  const fs = Math.max(14, Math.min(w, h) * 0.04);
  ctx.fillStyle = "rgba(20,8,36,0.7)";
  ctx.fillRect(0, 0, w, h);
  text(ctx, "The Last Scholar of Golb", w / 2, h * 0.38, fs * 2.2, "#e0ccff");
  text(ctx, "Everyone else is gone. The books remain.", w / 2, h * 0.38 + fs * 2, fs * 0.9, "#ffd9b8");
  if (progress.ready) {
    ctx.globalAlpha = 0.65 + 0.35 * Math.sin(time * 4);
    text(ctx, "Press Space or click to begin", w / 2, h * 0.62, fs * 1.2, "#ffffff");
    ctx.globalAlpha = 1;
  } else {
    text(ctx, `Loading ${progress.done}/${progress.total}`, w / 2, h * 0.62, fs * 1.2, "#ffffff");
  }
  text(
    ctx,
    "A/D or arrows: lanes   W/Space: jump   S: slide   P: pause   M: mute",
    w / 2,
    h * 0.9,
    fs * 0.65,
    "#e0ccff",
  );
}

export function drawPaused(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const fs = Math.max(14, Math.min(w, h) * 0.04);
  ctx.fillStyle = "rgba(20,8,36,0.6)";
  ctx.fillRect(0, 0, w, h);
  text(ctx, "Paused", w / 2, h * 0.46, fs * 2, "#ffffff");
  text(ctx, "Press P or Esc to resume", w / 2, h * 0.46 + fs * 1.8, fs, "#e0ccff");
}

/** Small corner badge shown while muted. */
export function drawMuted(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const fs = Math.max(12, Math.min(w, h) * 0.025);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `bold ${Math.round(fs)}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText("Muted (M)", fs * 0.8, h - fs * 0.8);
}
