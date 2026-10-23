// Image loading and sprite drawing. Every sprite is optional: if an image is missing or failed to
// load, drawSprite returns false and the caller draws its built-in shape instead, so real art can
// be swapped in one asset at a time. See docs/assets.md for names, sizes and anchors.

export type Sprite = CanvasImageSource & { width: number; height: number };

export interface AssetManifest {
  /** Sprite name -> URL. */
  images: Record<string, string>;
  /** Sound name -> URL. Loaded by the AudioManager, not by loadImages. */
  audio: Record<string, string>;
}

export interface Assets {
  image(name: string): Sprite | undefined;
  /** Names whose files failed to load. They fall back to shapes. */
  readonly missing: readonly string[];
}

export interface LoadImagesOptions {
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

/** Loads every image in the manifest. Never rejects: failures are recorded in `missing`. */
export async function loadImages(
  images: Record<string, string>,
  opts: LoadImagesOptions = {},
): Promise<Assets> {
  const load = opts.loadImage ?? defaultLoadImage;
  const entries = Object.entries(images);
  const loaded = new Map<string, Sprite>();
  const missing: string[] = [];
  let done = 0;
  await Promise.all(
    entries.map(async ([name, url]) => {
      try {
        loaded.set(name, await load(url));
      } catch {
        missing.push(name);
      }
      opts.onProgress?.(++done, entries.length);
    }),
  );
  return { image: (name) => loaded.get(name), missing };
}

export type SpriteAnchor = "bottom" | "center";

/**
 * Draws the named sprite horizontally centered on x, scaled to `height` px tall (aspect ratio
 * kept). "bottom" puts the sprite's bottom edge at y, "center" its middle. Returns false, drawing
 * nothing, when the sprite is not loaded.
 */
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  assets: Assets | undefined,
  name: string,
  x: number,
  y: number,
  height: number,
  anchor: SpriteAnchor = "bottom",
): boolean {
  const img = assets?.image(name);
  if (!img || img.width <= 0 || img.height <= 0 || height <= 0) return false;
  const w = (img.width / img.height) * height;
  const top = anchor === "bottom" ? y - height : y - height / 2;
  ctx.drawImage(img, x - w / 2, top, w, height);
  return true;
}
