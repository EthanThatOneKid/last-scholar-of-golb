# Lich sprite prompts

Prompts for the Lich poses the game still needs, written to match the first sheet
(`lich-idle.png`). Paste the **style block** first, then one **pose block**. Attach the existing
sheet as a reference image if your generator supports one, and say "same character, same style".

The shipped idle sheet is the model: 8 frames in a 4x2 grid on a transparent background, clear
empty space between frames, the figure the same size in every frame, only the cloak moving. Note
that the idle art **hovers** (its feet dangle above the ground), which is why running looked like
hovering. The game now draws a contact shadow under it, but the run sheet should have real
ground contact (see below).
`tools/slice_sheet.py` relies on that.

## Style block (use with every pose)

> Character animation sheet of the same character as the reference image: a tall figure seen in the
> pose described below. Black hood with a thin spiked crown ring and two curled tan ram horns, a
> tattered grey-olive cloak over a dark short-sleeved shirt, pale skeletal forearms and hands, bare
> skeletal feet. 2D cartoon style: thick black outlines, flat cel-shaded colors, simple fold
> lines, no gradients, no texture, no background scenery, no shadows, no text.
>
> Layout: a grid of equal cells on a plain flat white background. The character is the same size in
> every cell. The head is at exactly the same height and horizontal position in every cell, and the feet (or
> hem) rest on the same baseline in every cell. Leave a
> wide empty gap between cells so that nothing, including cloak tips, crosses into the next cell.
> Consistent design, proportions and colors in every frame.

Then run **Remove Background** (as with the first sheet) so the PNG is transparent.

## Why the poses are written as loops

The game plays every sheet as a loop on a clock, so a jump does not start on frame 0. Ask for
**seamless loops** where the last frame flows into the first. Do not ask for a crouch-launch-land
sequence for the jump. One-shot playback would need a small engine change, which can be added if you
want it.

## Pose blocks

### `lich.run` (the main pose, so spend the most effort here)

> Pose: viewed from behind, as if the camera follows the character. A looping run cycle of 8 frames
> in a 4x2 grid. The figure glides and strides forward, leaning slightly forward, skeletal feet
> alternating beneath the hem, arms swinging a little. **The feet visibly plant on the ground with
> each stride: a foot touches the floor in every frame, and the figure never hovers.** The cloak streams behind and to the sides
> with a strong whip, alternating left and right through the loop, and the last frame flows
> seamlessly into the first.

### `lich.jump`

> Pose: viewed from behind. A looping airborne cycle of 6 frames in a 3x2 grid. The figure is
> mid-air and never touches the ground: no crouch, no landing. Cloak flared wide and lifting,
> skeletal hands raised slightly, feet tucked and dangling. The cloak ripples through the loop so
> that the last frame flows into the first.

### `lich.slide`

> Pose: viewed from behind. A looping glide cycle of 4 frames in a 2x2 grid. The figure is crouched
> very low, body pitched sharply forward, hood and horns ducked down, about **40 percent of the
> height of a standing figure**. The cloak lies flat behind and ripples slightly. Keep the whole
> figure low and wide so that it could pass under a bar.

### `lich.dead`

> Pose: viewed from behind. A looping cycle of 4 frames in a 2x2 grid. The figure has been struck
> and is slumped on its knees, head bowed, one skeletal hand on the ground. The cloak settles and
> sways slightly, as if breathing. The last frame flows into the first.

### `lich.wish` (cutscene)

> Pose: **seen from the front**, facing the viewer. A looping cycle of 6 frames in a 3x2 grid. The
> figure stands with both skeletal arms raised high, hood tilted up so the face is a black void
> with two glowing green eyes. The cloak billows upward and outward as if lifted by a dark wind. The
> last frame flows into the first. Draw at larger scale: this sprite is shown at about 40 percent of
> the screen height.

## Tips

- **Generate each pose as one grid, not frame by frame.** One generation keeps the design
  consistent, whereas separate generations drift.
- **Check the frames before slicing.** Look for a stray cape tip touching the next cell, a head that
  moves between frames, and any frame that is a different size from the rest.
- **Slice with the tool, which tells you if frames touch:**
  `python tools/slice_sheet.py sheet.png --frames 6 --out public/assets/images/lich-jump.png --preview preview.png`
  Use `--anchor left-edge` if a cape tip flares into the head area (as in the idle sheet).
  `--align bottom` (feet level, the default to use for grounded poses) puts the sprite's bottom
  edge on the ground line; `--align top` keeps heads level instead. Open the preview and check that the
  red center line passes through the same point on the body in every frame.
- **Registering:** add the strip to `sheets` in `src/asset-manifest.ts` with the frame count, and add
  a credits row in [`assets.md`](assets.md).
- **Not yet wired:** left and right lane-lean sprites. The Lich changes lanes by sliding sideways.
  Lean frames could be added later.
