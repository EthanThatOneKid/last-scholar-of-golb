import { assetUrl, type AssetManifest } from "./assets";

// Real art and audio register here. Files live under public/assets/ and every file needs a row in
// the credits table in docs/assets.md. Names are fixed by the renderer; see docs/assets.md.
export const manifest: AssetManifest = {
  images: {
    // Original art drawn by tools/gen_art.py. Obstacles are bottom-anchored, crowns centered.
    "obstacle.gumdrop": assetUrl("assets/images/gumdrop.png"),
    "obstacle.candy-cane": assetUrl("assets/images/candy-cane.png"),
    "obstacle.licorice-arch": assetUrl("assets/images/licorice-arch.png"),
    "crown.bubblegum-tiara": assetUrl("assets/images/tiara-bubblegum.png"),
    "crown.ice-king-crown": assetUrl("assets/images/crown-ice-king.png"),
  },
  sheets: {
    // 24-frame swirl, seamless loop of 3 seconds. Frames are 256x256, the glow fills ~91% of each.
    portal: { src: assetUrl("assets/images/portal.png"), frames: 24, fps: 8 },
    // 8-frame cape-flutter loop, back view. Cell 292x271, feet on the cell bottom, body centered in the cell.
    "lich.idle": { src: assetUrl("assets/images/lich-idle.png"), frames: 8, fps: 10 },
  },
  audio: {},
};
