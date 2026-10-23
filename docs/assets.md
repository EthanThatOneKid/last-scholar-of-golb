# Assets and audio

Real art and sound are optional. Every sprite falls back to the built-in shape, and a missing
sound stays silent, so assets can land one at a time.

## Rules

- **Never commit ripped, copyrighted or unlicensed audio or art.** This repo is a private fan
  prototype, but git history is permanent and the repo may go public.
- Work files you can't ship (ripped references, unlicensed samples, raw PSDs) go in
  `raw-assets/`, which is gitignored.
- Anything you ship lives under `public/assets/` and gets a row in the credits table below
  _in the same commit_: where it came from and under what license.
- Files over about 5 MB (music, sprite sheets) need Git LFS. It is **not configured yet**: set
  it up (`git lfs track`) before the first large file is committed.

## Registering assets

Put the file under `public/assets/` and add it to [`src/asset-manifest.ts`](../src/asset-manifest.ts):

```ts
export const manifest: AssetManifest = {
  images: { lich: assetUrl("assets/images/lich.png") },
  audio: { "music.candy": assetUrl("assets/audio/candy.ogg") },
};
```

(`assetUrl` comes from `src/assets.ts`; import it in the manifest when you add the first entry.)

Images load behind the title screen, which shows `Loading n/m`. A file that fails to load is
skipped and the shape is drawn instead.

## Sprite names

The renderer looks sprites up by these exact names. `u` is 1% of the screen height at the
sprite's depth, so sizes shrink with perspective. Sprites keep their aspect ratio and are
centered on the lane.

| Name                      | Height | Anchor | Notes                                          |
| ------------------------- | ------ | ------ | ---------------------------------------------- |
| `obstacle.gumdrop`        | 9u     | bottom | Low block you jump over.                       |
| `obstacle.candy-cane`     | 18u    | bottom | Full block, change lanes.                      |
| `obstacle.licorice-arch`  | 14u    | bottom | Must leave clearance to slide under (below ~7u). |
| `crown.bubblegum-tiara`   | 6u     | center | One blue gem, worth 1.                         |
| `crown.ice-king-crown`    | 6u     | center | Three rubies, worth 3. Drawn 1.3x larger in play. |
| `portal`                  | ~2.2x portal radius | center | Prismo's portal.                |
| `lich.run` / `lich.jump`  | 17u    | bottom | Falls back to `lich`. Jump height is applied by the game. |
| `lich.slide`              | 7u     | bottom | Falls back to `lich`.                          |
| `lich`                    | 17u    | bottom | Used for any pose without its own sprite.      |

The cutscene, backdrop, road and scenery are still drawn with shapes.

## Audio

`AudioManager` (`src/audio.ts`) handles volume, mute (M), pause (P / Esc), sound effects, looping
music and a master clock. Browsers lock audio until a click or key press, so it starts when the
player leaves the title screen.

- **Sound names are not wired to game events yet.** Registering `sfx.*` or `music.*` files in the
  manifest loads them, but nothing calls `playSfx` or `playMusic` until the events are hooked up.
- **The master clock is `audio.time`** (`AudioContext.currentTime`). The rhythm layer should chart
  against it, not against `requestAnimationFrame` time. It freezes while paused.

## Credits

| File | Source | License | Notes |
| ---- | ------ | ------- | ----- |
|      |        |         |       |
