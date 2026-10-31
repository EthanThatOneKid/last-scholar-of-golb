# itch.io submission — Karni's October Game Jam 2026

Everything needed to put this on itch.io and submit it to
[the jam](https://itch.io/jam/karni-october-game-jam-2026). The copy blocks are
ready to paste; the build, cover and screenshots are in `docs/itch/` and
`raw-assets/itch/`.

- **Deadline:** 2026-11-01 06:59 UTC — Saturday 2026-10-31, 11:59 PM PDT.
- **Theme:** FALL. The jam accepts any interpretation (season, action, idea) and
  allows AI use, but asks for a written AI disclosure.
- **Judging:** one judge, on effort. A finished, playable demo beats a polished
  unfinished one.

## What ships

| File | What it is |
| ---- | ---------- |
| `raw-assets/itch/last-scholar-of-golb-html5.zip` | HTML5 build, 6.4 MB, `index.html` at the zip root |
| `docs/itch/cover.png` | 630 × 500 cover |
| `docs/itch/screenshot-1-title.jpg` … `-5-cutscene.jpg` | 1280 × 720, title / run / slide / portal / cutscene |

The zip and the screenshots are not committed: the zip is a build artifact and
lives in the gitignored `raw-assets/`. Rebuild the zip with:

```sh
npm run build
# zip the *contents* of dist/, so index.html is at the root
```

The screenshots were captured from `npm run dev` at 1280 × 720 with the debug
panel hidden. `screenshot-2-run.jpg` is a normal-density run; the slide, portal
and cutscene shots were staged with obstacles off so nothing died mid-capture.

## Project fields

| Field | Value |
| ----- | ----- |
| Title | `The Last Scholar of Golb` |
| Project URL | `the-last-scholar-of-golb` |
| Classification | Game |
| Kind of project | HTML (playable in browser) |
| Genre | Action |
| Inputs | Keyboard |
| Pricing | No payments (free) |
| Upload | `last-scholar-of-golb-html5.zip`, **This file will be played in the browser** |
| Embed | Fullscreen button on; mobile friendly off (keyboard only) |
| Content | No adult content; cartoon peril only |

Tags: `endless-runner`, `runner`, `arcade`, `one-hit-kill`, `fan-game`,
`adventure-time`, `fall`, `halloween`, `keyboard`, `short`, `html5`.

## Short description

> You are the Lich. Collect the nine gems, reach Prismo, and wish for the end of
> all life. One hit ends the run.

## Description

```markdown
**Everyone else is gone. The books remain.**

You are the Lich — the last scholar of Golb — running through the Candy Kingdom
to gather the nine gems of the Enchiridion. Nine gems open Prismo's portal. On
the other side is a wish, a six-second cutscene, and then the next tier: faster,
denser, same goal.

One hit ends the run. Nothing carries over but the tier you reached.

## Controls

| Key | Action |
| --- | ------ |
| A / D or ← / → | change lanes |
| W / ↑ / Space | jump |
| S / ↓ | slide |
| P / Esc | pause |
| M | mute |
| Space / Enter | start · restart · skip the cutscene (after 1s) |

Keyboard required. Click the game once so it has focus.

## The demo

- Three lanes, three obstacles, two crown types
- Nine gems to the portal, one hit to die
- A cutscene at the portal, then a harder tier
- Tier reached is the score
- The portal is a minute or two in if you play well

## Theme: FALL

The game is a fall in all three senses the jam lists. A civilization has already
fallen — the title is ironic, and the Lich is the last scholar of an ending. The
monologue the character is known for starts with the word. And the run itself is
a controlled fall through the Candy Kingdom that ends the moment you stop
dodging.

## Credits

- Design, code, tuning: Ethan That One Kid
- Lich sprite sheets: AI-generated with Adobe Firefly, sliced with
  `tools/slice_sheet.py`
- Candy Kingdom backdrop, Prismo's Time Room, Prismo cutout: AI-generated in an
  Adventure Time style, refined for the project
- Obstacles, crowns and portal: original, drawn by code (`tools/gen_art.py`)
- Fonts: system UI

## AI disclosure

The jam asks for detail, so here is the whole of it.

- **Art** — AI-generated. The Lich sprite sheets (idle, run, jump, slide, wish)
  were generated with Adobe Firefly and sliced with a script. The Candy Kingdom
  backdrop, Prismo's Time Room and the Prismo cutout were AI-generated in an
  Adventure Time style and refined for the project. The obstacles, crowns and
  portal are not AI: they are drawn by code.
- **Code** — written with AI coding assistants under human direction and review.
  Architecture, tuning and the calls on what to cut were mine; large parts of
  the implementation were drafted by assistants and reviewed by me.
- **Writing** — the wish line ("I wish for the extinction of all life.") is
  quoted from Adventure Time. The title-screen subtitle is original. The longer
  Lich monologue is quoted in the design notes but does not appear in the game.
- **Audio** — none. No music or sound effects ship.

## Known issues

- **Silent.** The audio system is wired (volume, mute, pause, a master clock) but
  no sound files ship yet.
- **Keyboard only.** No touch controls.
- **No death sprite.** `lich.dead` has no sheet; the death pose falls back to
  another Lich sheet.
- **Fan work.** Unofficial and non-commercial. Adventure Time and its characters
  belong to Cartoon Network / Warner Bros. Discovery. No affiliation, no money
  changes hands. Made for a free community jam and taken down on request.
```

## Submit

1. itch.io → **Dashboard → Create new project**. Fill the fields above.
2. Upload the zip, tick **This file will be played in the browser**, then
   **Save & view page**.
3. **Test the page's own player**, not just the local build: keyboard focus
   after a click, no console errors, sprites resolve from the zip root.
4. Open [the jam page](https://itch.io/jam/karni-october-game-jam-2026) →
   **Submit your project** → pick the game → submit.
5. Confirm the game appears in the jam's submission list before the deadline.
   Submitting is editable until then; you can fix the page afterwards.

## Checklist

- [ ] Build is from the commit you mean to ship (`npm run build`, then re-zip)
- [ ] Zip has `index.html` at the root and plays from the itch player
- [ ] Cover, 5 screenshots and the description are uploaded
- [ ] AI disclosure is on the page, not just in the repo
- [ ] Fan-work disclaimer is on the page
- [ ] Theme tie-in is in the description
- [ ] Project submitted to the jam, not just published
- [ ] Page loads on a phone enough to show the "keyboard required" line

## The one open decision

The repo's asset rules say the art is a **private fan prototype, not cleared for
a public release** — the Lich, the Candy Kingdom, Prismo and the title are
Adventure Time IP. A jam entry is a public release. Options, cheapest first:

1. **Ship as an unofficial fan work** with the disclaimer above. Common in jams,
   still a takedown risk, and it contradicts `docs/assets.md`.
2. **Ship the same build but keep the page unlisted** until the jam ends, then
   decide. The jam only needs the link to work; it does not need to be indexed.
3. **Re-skin first.** Replace the AT-specific art with original characters and
   backdrops. A day of work at minimum, and it changes the premise.

If you pick 1 or 2, also update the credits table in `docs/assets.md` so the
repo stops saying "not cleared for a public release" while a public page exists.
