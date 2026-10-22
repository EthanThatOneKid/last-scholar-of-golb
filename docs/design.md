# Design

Fan prototype of an Adventure Time game. Private repo: no ripped audio or art
is ever committed.

## Premise

You play the Lich, the "last scholar" of entropy (the title is ironic), running
through the Land of Ooo to end all life.

## Core loop (v1: runner only)

- Endless 3-lane runner, Temple Run / Subway Surfers style.
- Camera: 2.5D pseudo-3D. Canvas/WebGL sprites scaled along a road.
- Swap lanes (and later jump/slide) to avoid obstacles.
- One hit and you're dead. Death resets to tier 1. Nothing carries over.
- Collect gems. A fixed gem count opens the portal to Prismo.
- Each tier keeps the same gem goal but raises speed and obstacle density.
- Tier reached is the score.

## Deferred

- Rhythm layer: inputs timed to the Lich's monologues, spellcasting, heroes
  (Finn and Jake) as attackers. Needs its own session.
- Prismo's chamber: climax and the final wish. Design after the runner feels
  good.
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

## Open questions

- Starting gem goal and speed growth per tier (tune with the debug panel)
- The three Candy Kingdom obstacle types
- Touch controls (after v1)
