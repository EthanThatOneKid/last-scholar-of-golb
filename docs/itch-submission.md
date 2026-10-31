# itch.io submission for Karni's October Game Jam 2026

Everything needed to put this on itch.io and submit it to
[the jam](https://itch.io/jam/karni-october-game-jam-2026). The copy blocks are
ready to paste; the build, cover and screenshots are in `docs/itch/` and
`raw-assets/itch/`.

- **Deadline:** 2026-11-01 06:59 UTC, which is Saturday 2026-10-31 at 11:59 PM
  PDT.
- **Theme:** FALL. The jam takes it as a season, an action or an idea, and allows
  AI use, but asks for a written AI disclosure.
- **Judging:** one judge, on effort.

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

> You are the Lich, running the Candy Kingdom for the nine gems that open
> Prismo's portal. One hit ends the run.

## Description

```markdown
Everyone else is gone. The books remain.

You are the Lich, the last scholar of Golb. You run through the Candy Kingdom
collecting the nine gems of the Enchiridion. Nine gems open Prismo's portal. Step
through it and the Lich makes his wish. Then the next tier starts, faster and
more crowded than the last.

One hit ends the run. The tier you reached is the score.

## Controls

- A / D or left / right: change lanes
- W / up / space: jump
- S / down: slide
- P or Esc: pause
- M: mute
- Space or Enter: start, restart, skip the cutscene after the first second

The game needs a keyboard. Click it once so it has focus.

## What is in the demo

- Three lanes and three obstacles
- Two crown types, worth one and three gems
- A cutscene at the portal, then a harder tier
- The portal is a minute or two in if you play well

## Theme: fall

The Lich, in "Escape from the Citadel":

> Fall. You are alone, child. There is only darkness for you, and only death for
> your people. These ancients are just the beginning. I will command a great and
> terrible army, and we will sail to a billion worlds. We will sail until every
> light has been extinguished. You are strong, child, but I am beyond strength. I
> am the end, and I have come for you, Finn.

Ooo has already fallen. The title is ironic, and the Lich is what is left of its
scholarship. The run is a fall you keep correcting, and it stops when you miss.

## Credits

Design, code and tuning: Ethan That One Kid.

The Lich sprite sheets were generated with Adobe Firefly and sliced with a
script. The Candy Kingdom backdrop, Prismo's Time Room and the Prismo cutout were
generated in an Adventure Time style and cleaned up for the project. The
obstacles, crowns and portal are drawn by code. Fonts are system UI.

## AI disclosure

Art is AI-generated: the Lich sheets came from Adobe Firefly, and the Candy
Kingdom backdrop, Prismo's Time Room and Prismo cutout were generated in an
Adventure Time style and cleaned up. The obstacles, crowns and portal are drawn
by code, not AI. The code was written with AI coding assistants under my
direction and review. The wish line is quoted from Adventure Time, and the title
screen subtitle is mine.

## Known issues

The build is silent. The audio system is wired but there are no sound files. The
game needs a keyboard, and the death pose falls back to another sprite.

This is an unofficial, non-commercial fan work. Adventure Time belongs to Cartoon
Network / Warner Bros. Discovery. No affiliation, and I will take it down on
request.
```

## Submit

1. itch.io → **Dashboard → Create new project**. Fill the fields above.
2. Upload the zip, tick **This file will be played in the browser**, then
   **Save & view page**.
3. **Test the page's own player** after upload: click once for keyboard focus,
   watch for console errors, confirm sprites resolve from the zip root.
4. Open [the jam page](https://itch.io/jam/karni-october-game-jam-2026) →
   **Submit your project** → pick the game → submit.
5. Confirm the game appears in the jam's submission list before the deadline.
   Submitting is editable until then; you can fix the page afterwards.

## Checklist

- [ ] Build is from the commit you mean to ship (`npm run build`, then re-zip)
- [ ] Zip has `index.html` at the root and plays from the itch player
- [ ] Cover, 5 screenshots and the description are uploaded
- [ ] AI disclosure is on the page itself
- [ ] Fan-work disclaimer is on the page
- [ ] Theme tie-in is in the description
- [ ] Project submitted to the jam (publishing alone does not enter it)
- [ ] Page loads on a phone enough to show the "keyboard required" line

## The one open decision

The repo's asset rules call the art a **private fan prototype, not cleared for a
public release**. The Lich, the Candy Kingdom, Prismo and the title are Adventure
Time IP, and a jam entry is a public release. Options, cheapest first:

1. **Ship as an unofficial fan work** with the disclaimer above. Common in jams,
   still a takedown risk, and it contradicts `docs/assets.md`.
2. **Ship the same build but keep the page unlisted** until the jam ends, then
   decide. The jam only needs the link to work; it does not need to be indexed.
3. **Re-skin first.** Replace the AT-specific art with original characters and
   backdrops. A day of work at minimum, and it changes the premise.

If you pick 1 or 2, also update the credits table in `docs/assets.md` so the
repo stops saying "not cleared for a public release" while a public page exists.
