// Tunable game values. The debug panel mutates the exported `config` object live.
export interface GameConfig {
  /** World units per second at tier 1. */
  startSpeed: number;
  /** Added to speed for each tier above 1. */
  speedPerTier: number;
  /** Gems needed to open the portal. Same every tier. */
  gemGoal: number;
  /** Expected obstacles per 100 world units at tier 1. */
  obstacleDensity: number;
  /** Added to obstacle density for each tier above 1. */
  densityPerTier: number;
  /** Expected gems per 100 world units. */
  gemDensity: number;
  laneChangeSeconds: number;
  jumpSeconds: number;
  slideSeconds: number;
  /** How far ahead (world units) the road is drawn and content is spawned. */
  viewDistance: number;
  /** Distance past the final gem at which the portal appears. */
  portalLead: number;
}

export const defaultConfig: GameConfig = {
  startSpeed: 30,
  speedPerTier: 6,
  gemGoal: 10,
  obstacleDensity: 6,
  densityPerTier: 1,
  gemDensity: 8,
  laneChangeSeconds: 0.12,
  jumpSeconds: 0.6,
  slideSeconds: 0.5,
  viewDistance: 120,
  portalLead: 40,
};

export const config: GameConfig = { ...defaultConfig };

export function tierSpeed(c: GameConfig, tier: number): number {
  return c.startSpeed + c.speedPerTier * (tier - 1);
}

export function tierDensity(c: GameConfig, tier: number): number {
  return c.obstacleDensity + c.densityPerTier * (tier - 1);
}
