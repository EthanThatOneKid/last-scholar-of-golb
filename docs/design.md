# Design

Fan prototype of an Adventure Time game. Private repo: no ripped audio or art
is ever committed.

## Premise

You play the Lich, the "last scholar" of entropy (the title is ironic), running
through the Land of Ooo to end all life.

## Core loop

The game is a Temple Run-style runner. The rhythm layer is cut (see "Cut" below).


- Endless 3-lane runner, Temple Run / Subway Surfers style.
- Camera: 2.5D pseudo-3D. Canvas/WebGL sprites scaled along a road.
- Swap lanes (and later jump/slide) to avoid obstacles.
- One hit and you're dead. Death resets to tier 1. Nothing carries over.
- Collect crowns, each worth gems: tiaras are 1, the Ice King's Crown is 3. Nine gems (the Enchiridion) open the portal to Prismo. Crowns are rare.
- Each tier keeps the same gem goal but raises speed and obstacle density.
- Tier reached is the score.
- Entering the portal plays a short cutscene (about 6 seconds, skippable with
  Space or Enter after 1 second): Prismo's chamber, the Enchiridion glowing with
  its nine gems, and the Lich wishing for the extinction of all life. It flashes back
  into the run at the next tier. Wish line: "I wish for the extinction of all life."

## Cut

- **Rhythm layer** (cut 2026-10-24): inputs timed to the Lich's monologues,
  spellcasting, and Finn and Jake as attackers. The game stays a Temple
  Run-style runner. Finn and Jake are no longer planned, and nothing needs a
  rhythm clock.

## Deferred

- Audio plan. Prototype with original or placeholder sound only.

## Tech decisions

- Renderer: plain Canvas 2D, no game framework. Pseudo-3D by scaling sprites
  with depth.
- Controls (v1): keyboard only. Left/Right or A/D change lanes, Up/Space jump,
  Down/S slide.
- First playable: Candy Kingdom only. Three obstacle types, gems, and a portal
  at the gem goal.
- Tuning: in-game debug panel with live controls for speed, gem goal and
  obstacle density. Defaults live in one config file.

## Monologue source text

Saved while the rhythm layer was planned. That layer is cut, so this is reference
text only and nothing in the game uses it. It could be reused as cutscene dialogue.

> Fall. You are alone, child. There is only darkness for you, and only death for
> your people. These ancients are just the beginning. I will command a great and
> terrible army, and we will sail to a billion worlds. We will sail until every
> light has been extinguished. You are strong, child, but I am beyond strength. I
> am the end, and I have come for you, Finn.

> Before there was time. Before there was anything. There was nothing. And
> before there was nothing. There were monsters.

## Open questions

- Starting gem goal and speed growth per tier (tune with the debug panel)
- The three Candy Kingdom obstacle types
- Touch controls (after v1)
