import "./style.css";
import { config, defaultConfig } from "./config";
import { mountDebugPanel } from "./debug-panel";
import { createInput } from "./input";
import { render } from "./render";
import { createState, update } from "./world";

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
const state = createState(config);

let last = performance.now();
const start = last;

function frame(now: number): void {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  update(state, dt, input.drain(), config);
  render(ctx, state, config, width, height, (now - start) / 1000);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
