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
  images: { "obstacle.gumdrop": assetUrl("assets/images/gumdrop.png") },
  sheets: { "lich.run": { src: assetUrl("assets/images/lich-run.png"), frames: 8, fps: 12 } },
  audio: { "music.candy": assetUrl("assets/audio/candy.ogg") },
};
```

(`assetUrl` comes from `src/assets.ts` and is already imported in the manifest.)

Animated sprites are **sheets**: one PNG with N equal-width frames side by side, registered under
`sheets` with a frame count and fps. The game loops them by time (see "Sprite sheets" below).

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
| `lich.idle`               | 17u    | bottom | **Sheet, in the game.** Stands in for run and jump until they have their own. |
| `lich.run` / `lich.jump`  | 17u    | bottom | Sheets or images. Jump height is applied by the game. |
| `lich.slide`              | 7u     | bottom | Must stay low enough to pass under the arch. The idle sheet is never used for a slide. |
| `lich.dead`               | 17u    | bottom | Shown once the Lich has hit something.         |
| `lich.wish`               | 42% of screen height | bottom | Cutscene Lich, on the left of the screen. |
| `lich`                    | 17u    | bottom | Last resort for any pose without its own sprite. |

The Lich tries, in order: `lich.dead` (when dead), `lich.<pose>`, `lich.idle` (not for slide), `lich`,
and finally the built-in shape. The backdrop, road and scenery are still drawn with shapes.

## Sprite sheets

A sheet is a horizontal strip of equal-width frames. Frames are drawn at the same height as a plain
image, so keep every frame's head at the same height and the body centered in its cell; only the
cape or limbs should move.

- Playback is a **loop driven by wall-clock time**, not tied to the pose. A jump is not synchronized
  to frame 0, so write jump, slide and dead sheets as seamless loops. One-shot playback is not
  supported yet.
- `tools/slice_sheet.py` turns a generated sheet into a strip. It finds frames from the alpha
  channel, so frames only need empty space between them, not a clean grid. Anchor modes and flags
  are documented at the top of the script.
- `public/assets/images/lich-idle.png` was made with:
  `python tools/slice_sheet.py <sheet.png> --frames 8 --out public/assets/images/lich-idle.png --anchor left-edge --align top`
- Prompts for the remaining Lich poses are in [`lich-sprite-prompts.md`](lich-sprite-prompts.md).

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
| `public/assets/images/lich-idle.png` | Generated with Adobe Firefly, supplied by the project owner. Original kept locally in `raw-assets/`. | Output terms: Adobe Firefly (confirm before any release). **Depicts the Lich from Adventure Time, which is not ours.** | Fan prototype, private repo only. Not cleared for a public release. 8-frame idle/cape loop, back view. |
