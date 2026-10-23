// Tunable game values. The debug panel mutates the exported `config` object live.
export interface GameConfig {
  /** World units per second at tier 1. */
  startSpeed: number;
  /** Added to speed for each tier above 1. */
  speedPerTier: number;
  /** Gems (not crowns) needed to open the portal. Same every tier. */
  gemGoal: number;
  /** Expected obstacles per 100 world units at tier 1. */
  obstacleDensity: number;
  /** Added to obstacle density for each tier above 1. */
  densityPerTier: number;
  /** Expected crowns per 100 world units. */
  gemDensity: number;
  /** Minimum world distance between any two crowns, whatever lane they are in. */
  crownSpacing: number;
  /** Chance in [0, 1] that a crown is the Ice King's Crown (3 gems) instead of a tiara (1). */
  iceCrownChance: number;
  laneChangeSeconds: number;
  jumpSeconds: number;
  slideSeconds: number;
  /** How far ahead (world units) the road is drawn and content is spawned. */
  viewDistance: number;
  /** Distance past the final gem at which the portal appears. */
  portalLead: number;
  /** Length of the Prismo wish cutscene. */
  cutsceneSeconds: number;
}

export const defaultConfig: GameConfig = {
  startSpeed: 30,
  speedPerTier: 6,
  gemGoal: 9, // the Enchiridion takes nine gems to summon Prismo
  obstacleDensity: 6,
  densityPerTier: 1,
  gemDensity: 1.5,
  crownSpacing: 30,
  iceCrownChance: 0.2,
  laneChangeSeconds: 0.12,
  jumpSeconds: 0.6,
  slideSeconds: 0.5,
  viewDistance: 120,
  portalLead: 40,
  cutsceneSeconds: 6,
};

export const config: GameConfig = { ...defaultConfig };

export function tierSpeed(c: GameConfig, tier: number): number {
  return c.startSpeed + c.speedPerTier * (tier - 1);
}

export function tierDensity(c: GameConfig, tier: number): number {
  return c.obstacleDensity + c.densityPerTier * (tier - 1);
}
