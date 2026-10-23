import type { AssetManifest } from "./assets";

// Real art and audio register here. Files live under public/assets/ and every file needs a row in
// the credits table in docs/assets.md. Names are fixed by the renderer; see docs/assets.md.
//
//   images: { "lich": assetUrl("assets/images/lich.png") },
//   audio:  { "music.candy": assetUrl("assets/audio/candy.ogg") },
export const manifest: AssetManifest = {
  images: {},
  audio: {},
};
