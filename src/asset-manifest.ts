import { assetUrl, type AssetManifest } from "./assets";

// Real art and audio register here. Files live under public/assets/ and every file needs a row in
// the credits table in docs/assets.md. Names are fixed by the renderer; see docs/assets.md.
export const manifest: AssetManifest = {
  images: {
    "cutscene.prismo": assetUrl("assets/images/prismo.png"),
    "cutscene.room": assetUrl("assets/images/prismo-time-room.png"),
    "backdrop.candy-kingdom": assetUrl("assets/images/candy-kingdom-bg.png"),
  },
  sheets: {
    // 8-frame cape-flutter loop, back view. Cell 292x271, feet on the cell bottom, body centered in the cell.
    "lich.idle": { src: assetUrl("assets/images/lich-idle.png"), frames: 8, fps: 10 },
    // 8-frame grounded run cycle, back view. Cell 360x402, feet on bottom, body centered.
    "lich.run": { src: assetUrl("assets/images/lich-run.png"), frames: 8, fps: 12 },
    // 6-frame airborne leap cycle, back view. Cell 622x369.
    "lich.jump": { src: assetUrl("assets/images/lich-jump.png"), frames: 6, fps: 8 },
    // 6-frame cutscene spellcasting loop, front view. Cell 430x394.
    "lich.wish": { src: assetUrl("assets/images/lich-wish.png"), frames: 6, fps: 6 },
  },
  audio: {},
};
