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
| `raw-assets/itch/upload/` | the same six files under upload names, ready to drag in |

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
| Release status | Released |
| Genre | Action |
| Inputs | Keyboard |
| Multiplayer | No |
| Pricing | No payments (free) |
| Upload | `the-last-scholar-of-golb.zip`, **This file will be played in the browser** |
| Embed | Fullscreen button on; mobile friendly off (keyboard only) |
| Content | No adult content; cartoon peril only |
| Visibility | Public |
| AI disclosure | Yes, set under the edit page's AI Disclosure control |

Tags (itch allows 10): `endless-runner`, `runner`, `arcade`, `one-hit-kill`,
`fangame`, `adventure-time`, `fall`, `halloween`, `keyboard`, `short`.

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

The Candy Kingdom is still standing. The Lich gathers the nine gems that open
Prismo's portal, because Prismo grants one wish and his is the extinction of all
life. Every run is the fall he is working toward, and one hit ends the run.

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

1. Create from <https://itch.io/game/new?add_to_jam=420475>, which files the
   project into the jam from the start. Fill the fields above.
2. Upload the zip, tick **This file will be played in the browser**, then
   **Save & view page**.
3. On the project's edit page, open the **AI Disclosure** section and mark the
   project as containing generative AI. itch's quality guidelines ask for that
   on any project with generative content, and the control is separate from the
   description text.
4. **Test the page's own player** after upload: click once for keyboard focus,
   watch for console errors, confirm sprites resolve from the zip root.
5. Confirm the game is in the jam's submission list. If it is not, open
   [the jam page](https://itch.io/jam/karni-october-game-jam-2026) and use
   **Submit your project**.
6. Submitting is editable until the deadline; you can fix the page afterwards.

## Checklist

- [ ] Build is from the commit you mean to ship (`npm run build`, then re-zip)
- [ ] Zip has `index.html` at the root and plays from the itch player
- [ ] Cover, 5 screenshots and the description are uploaded
- [ ] AI Disclosure control is set on the edit page, and the disclosure text is
      in the description
- [ ] Tags are the ten from the list above
- [ ] Fan-work disclaimer is on the page
- [ ] Theme tie-in is in the description
- [ ] Project submitted to the jam (publishing alone does not enter it)
- [ ] Page loads on a phone enough to show the "keyboard required" line

## Fan-work decision

The game ships as an unofficial, non-commercial fan work. The disclaimer at the
end of the description settles it.

1. **Shipped:** the public fan-work framing. Common in jams, and still a takedown
   risk.
2. **Not taken:** an unlisted page. The jam only needs the link to work, so
   unlisting would not change the exposure much.
3. **Not taken:** re-skinning first. A day of work at minimum, and it changes the
   premise.

`docs/assets.md` still calls the art a "private fan prototype, not cleared for a
public release" while a public page exists. That line needs the owner's call:
either point it at the published fan work or keep it and accept the
contradiction.
