// Shared contract between world, render, input and debug-panel modules.
export type Lane = 0 | 1 | 2;

// gumdrop: low block, jump over it or change lanes.
// candy-cane: full block, change lanes only.
// licorice-arch: high bar, slide under it or change lanes.
export type ObstacleKind = "gumdrop" | "candy-cane" | "licorice-arch";

export type PlayerPose = "run" | "jump" | "slide";

export interface Obstacle {
  id: number;
  kind: ObstacleKind;
  lane: Lane;
  /** Absolute world position along the road. Relative depth is z - state.distance. */
  z: number;
}

export interface Gem {
  id: number;
  lane: Lane;
  z: number;
}

export interface Player {
  /** Lane the player is moving toward / standing in. */
  lane: Lane;
  /** Smoothed lane position in [0, 2] for rendering. */
  laneX: number;
  pose: PlayerPose;
  /** Seconds left in the current jump or slide. */
  poseTimeLeft: number;
  /** Jump height in [0, 1]. 0 when grounded. */
  jumpHeight: number;
}

/** running: playing. dead: hit an obstacle, waiting for restart. portal: gem goal met, portal open ahead. */
export type Phase = "running" | "dead" | "portal";

export interface GameState {
  phase: Phase;
  /** 1-based. Death resets to 1. Tier reached is the score. */
  tier: number;
  speed: number;
  /** Distance the player has travelled, in world units. */
  distance: number;
  gems: number;
  gemGoal: number;
  obstacles: Obstacle[];
  collectibles: Gem[];
  /** World z of the Prismo portal, or null until the gem goal is met. */
  portalZ: number | null;
  player: Player;
  /** Highest tier reached in this session, for display. */
  bestTier: number;
  nextId: number;
  /** Furthest world z that has been populated with obstacles and gems. */
  spawnedUntil: number;
  rngState: number;
}

export type InputAction = "left" | "right" | "jump" | "slide" | "start";
