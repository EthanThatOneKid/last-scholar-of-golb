import "./style.css";
import { manifest } from "./asset-manifest";
import { type Assets, loadImages, noAssets } from "./assets";
import { createAudioManager } from "./audio";
import { config, defaultConfig } from "./config";
import { mountDebugPanel } from "./debug-panel";
import { createInput } from "./input";
import { render } from "./render";
import { drawMuted, drawPaused, drawTitle, type LoadProgress } from "./screens";
import { createState, update } from "./world";

type Mode = "title" | "playing" | "paused";

const app = document.querySelector<HTMLDivElement>("#app")!;
const canvas = document.createElement("canvas");
app.appendChild(canvas);
const ctx = canvas.getContext("2d")!;

let width = 0;
let height = 0;

function resize(): void {
  const dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener("resize", resize);

mountDebugPanel(document.body, config, defaultConfig);
const input = createInput(window);
const audio = createAudioManager();
const state = createState(config);

let mode: Mode = "title";
let assets: Assets = noAssets;

// Assets load while the title screen shows. Missing files never block the game: they fall back to
// the built-in shapes (images) or stay silent (audio).
const progress: LoadProgress = {
  done: 0,
  total: Object.keys(manifest.images).length + Object.keys(manifest.audio).length,
  ready: false,
};
const bump = (): void => {
  progress.done++;
};
void Promise.all([
  loadImages(manifest.images, { onProgress: bump }).then((a) => {
    assets = a;
  }),
  ...Object.entries(manifest.audio).map(([name, url]) => audio.load(name, url).then(bump)),
]).then(() => {
  progress.ready = true;
});

function begin(): void {
  if (mode !== "title" || !progress.ready) return;
  audio.unlock(); // must happen inside a user gesture
  mode = "playing";
}

function pause(): void {
  if (mode !== "playing") return;
  mode = "paused";
  audio.pause();
}

function unpause(): void {
  if (mode !== "paused") return;
  mode = "playing";
  audio.resume();
}

canvas.addEventListener("pointerdown", begin);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
});

let last = performance.now();
const start = last;

function frame(now: number): void {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  const time = (now - start) / 1000;
  const actions = input.drain();

  if (actions.includes("mute")) audio.toggleMute();

  if (mode === "title") {
    if (actions.includes("start")) begin();
    render(ctx, state, config, width, height, time, assets);
    if (mode === "title") drawTitle(ctx, width, height, time, progress);
  } else if (mode === "paused") {
    if (actions.includes("pause")) unpause();
    render(ctx, state, config, width, height, time, assets);
    if (mode === "paused") drawPaused(ctx, width, height);
  } else if (actions.includes("pause")) {
    pause();
    render(ctx, state, config, width, height, time, assets);
    drawPaused(ctx, width, height);
  } else {
    update(state, dt, actions, config);
    render(ctx, state, config, width, height, time, assets);
  }

  if (audio.muted) drawMuted(ctx, width, height);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
