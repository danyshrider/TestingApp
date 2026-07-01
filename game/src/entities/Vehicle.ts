export interface VehicleTypeDef {
  id: 'vehicle_scout' | 'vehicle_cyclops';
  name: string;
  speed: number;
  maxHealth: number;
  maxPower: number;
  depthRating: number;
  powerDrainPerSec: number;
  color: number;
  size: [number, number, number];
}

export const VEHICLE_TYPES: Record<string, VehicleTypeDef> = {
  vehicle_scout: {
    id: 'vehicle_scout',
    name: 'Scout Sub',
    speed: 9,
    maxHealth: 150,
    maxPower: 100,
    depthRating: 300,
    powerDrainPerSec: 1.2,
    color: 0xf2a53e,
    size: [2.2, 2, 3.2],
  },
  vehicle_cyclops: {
    id: 'vehicle_cyclops',
    name: 'Abyss-Class Submarine',
    speed: 6,
    maxHealth: 400,
    maxPower: 250,
    depthRating: 600,
    powerDrainPerSec: 2,
    color: 0x445566,
    size: [4, 3.6, 8],
  },
};
