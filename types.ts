export enum Gender {
  Male = 'MALE',
  Female = 'FEMALE'
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Ball {
  id: string;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  gender: Gender;
  color: string;
  lastBreedTime: number; // Timestamp to prevent instant re-breeding
  age: number; // Frames alive
}

export interface SimulationStats {
  population: number;
  males: number;
  females: number;
  maxPopulationReached: number;
}

export interface SimulationConfig {
  breedChance: number; // 0.0 to 1.0
  initialPopulation: number;
  ballSpeed: number;
  maxPopulation: number;
  breedCooldown: number; // in ms
}