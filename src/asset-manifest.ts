import { assetUrl, type AssetManifest } from "./assets";

// Real art and audio register here. Files live under public/assets/ and every file needs a row in
// the credits table in docs/assets.md. Names are fixed by the renderer; see docs/assets.md.
export const manifest: AssetManifest = {
  images: {},
  sheets: {
    // 8-frame cape-flutter loop, back view. Cell 292x271, heads level, body centered in the cell.
    "lich.idle": { src: assetUrl("assets/images/lich-idle.png"), frames: 8, fps: 10 },
  },
  audio: {},
};
