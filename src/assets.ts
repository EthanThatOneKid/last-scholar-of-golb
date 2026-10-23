// Image loading and sprite drawing. Every sprite is optional: if an image is missing or failed to
// load, drawSprite returns false and the caller draws its built-in shape instead, so real art can
// be swapped in one asset at a time. See docs/assets.md for names, sizes and anchors.

export type Sprite = CanvasImageSource & { width: number; height: number };

/**
 * An animated sprite: one PNG holding `frames` equal-width frames side by side, left to right.
 * Frames play in a loop at `fps`.
 */
export interface SheetDef {
  src: string;
  frames: number;
  fps: number;
}

export interface Sheet extends SheetDef {
  image: Sprite;
}

export interface AssetManifest {
  /** Sprite name -> URL. */
  images: Record<string, string>;
  /** Animated sprite name -> sheet. */
  sheets: Record<string, SheetDef>;
  /** Sound name -> URL. Loaded by the AudioManager, not by loadImages. */
  audio: Record<string, string>;
}

export interface Assets {
  image(name: string): Sprite | undefined;
  sheet?(name: string): Sheet | undefined;
  /** Names whose files failed to load. They fall back to shapes. */
  readonly missing: readonly string[];
}

export interface LoadImagesOptions {
  /** Animated sprites to load along with the plain images. */
  sheets?: Record<string, SheetDef>;
  loadImage?: (url: string) => Promise<Sprite>;
  onProgress?: (done: number, total: number) => void;
}

export const noAssets: Assets = { image: () => undefined, missing: [] };

/** Resolves a path under public/ against Vite's base URL, so assets work on a sub-path deploy. */
export function assetUrl(path: string): string {
  const base = import.meta.env?.BASE_URL ?? "/";
  return base + path.replace(/^\/+/, "");
}

function defaultLoadImage(url: string): Promise<Sprite> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${url}`));
    img.src = url;
  });
}

/**
 * Loads every image and sheet in the manifest. Never rejects: failures are recorded in `missing`.
 * A sheet with a non-positive frame count or fps is rejected the same way.
 */
export async function loadImages(
  images: Record<string, string>,
  opts: LoadImagesOptions = {},
): Promise<Assets> {
  const load = opts.loadImage ?? defaultLoadImage;
  const sheetDefs = Object.entries(opts.sheets ?? {});
  const entries = [
    ...Object.entries(images).map(([name, url]) => ({ name, url, sheet: null as SheetDef | null })),
    ...sheetDefs.map(([name, def]) => ({ name, url: def.src, sheet: def as SheetDef | null })),
  ];
  const loaded = new Map<string, Sprite>();
  const sheets = new Map<string, Sheet>();
  const missing: string[] = [];
  let done = 0;
  await Promise.all(
    entries.map(async ({ name, url, sheet }) => {
      try {
        const image = await load(url);
        if (sheet) {
          if (!(sheet.frames >= 1) || !(sheet.fps > 0)) throw new Error(`bad sheet ${name}`);
          sheets.set(name, { ...sheet, image });
        } else {
          loaded.set(name, image);
        }
      } catch {
        missing.push(name);
      }
      opts.onProgress?.(++done, entries.length);
    }),
  );
  return { image: (name) => loaded.get(name), sheet: (name) => sheets.get(name), missing };
}

export type SpriteAnchor = "bottom" | "center";

/**
 * Draws the named sprite horizontally centered on x, scaled to `height` px tall (aspect ratio
 * kept). "bottom" puts the sprite's bottom edge at y, "center" its middle. A sheet of that name
 * plays its frames as a loop driven by `time` (seconds); otherwise the plain image is drawn.
 * Returns false, drawing nothing, when the sprite is not loaded.
 */
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  assets: Assets | undefined,
  name: string,
  x: number,
  y: number,
  height: number,
  anchor: SpriteAnchor = "bottom",
  time = 0,
): boolean {
  if (height <= 0) return false;
  const top = anchor === "bottom" ? y - height : y - height / 2;
  const sheet = assets?.sheet?.(name);
  if (sheet) {
    const fw = Math.floor(sheet.image.width / sheet.frames);
    const fh = sheet.image.height;
    if (fw <= 0 || fh <= 0) return false;
    const frame = Math.floor(Math.max(0, time) * sheet.fps) % sheet.frames;
    const w = (fw / fh) * height;
    ctx.drawImage(sheet.image, frame * fw, 0, fw, fh, x - w / 2, top, w, height);
    return true;
  }
  const img = assets?.image(name);
  if (!img || img.width <= 0 || img.height <= 0) return false;
  const w = (img.width / img.height) * height;
  ctx.drawImage(img, x - w / 2, top, w, height);
  return true;
}
