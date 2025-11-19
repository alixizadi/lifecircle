
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 800;
export const MAX_CONTAINER_RADIUS = 350; // Target size
export const INITIAL_CONTAINER_RADIUS = 120; // Starting size
export const CONTAINER_GROWTH_RATE = 0.15; // Pixels per frame

export const BALL_RADIUS = 8; // Reference standard size
export const MIN_BALL_RADIUS = 4;
export const MAX_BALL_RADIUS = 20;

export const MALE_COLOR = '#3b82f6'; // Blue-500
export const FEMALE_COLOR = '#22c55e'; // Green-500
export const NEWBORN_COLOR = '#d8b4fe'; // Purple-300 (briefly)
export const BACKGROUND_COLOR = '#1e293b'; // Slate-800
export const CONTAINER_BORDER_COLOR = '#64748b'; // Slate-500

export const DEFAULT_CONFIG = {
  breedChance: 0.3,
  initialPopulation: 20,
  ballSpeed: 2,
  maxPopulation: 200,
  breedCooldown: 2000, // 2 seconds
};
