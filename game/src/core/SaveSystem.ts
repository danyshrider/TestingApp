import { gameState } from './GameState';
import type { ItemStack } from '../data/types';

const SAVE_KEY = 'abyssal-descent-save-v1';

interface SaveData {
  difficulty: string;
  position: [number, number, number];
  rotationY: number;
  health: number;
  oxygen: number;
  maxOxygen: number;
  hunger: number;
  thirst: number;
  temperature: number;
  radiation: number;
  poison: number;
  equippedTank: string;
  equippedFins: boolean;
  equippedRadSuit: boolean;
  equippedThermalSuit: boolean;
  inventory: (ItemStack | null)[];
  toolsOwned: string[];
  activeTool: string | null;
  unlockedBlueprints: string[];
  discoveredLogs: string[];
  discoveredSignals: string[];
  basePieces: typeof gameState.basePieces;
  vehicles: typeof gameState.vehicles;
  beacons: typeof gameState.beacons;
  cureSynthesized: boolean;
  gameWon: boolean;
  timeOfDay: number;
  elapsedSeconds: number;
}

export const SaveSystem = {
  hasSave(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  },

  save(): void {
    const data: SaveData = {
      difficulty: gameState.difficulty,
      position: gameState.position,
      rotationY: gameState.rotationY,
      health: gameState.health,
      oxygen: gameState.oxygen,
      maxOxygen: gameState.maxOxygen,
      hunger: gameState.hunger,
      thirst: gameState.thirst,
      temperature: gameState.temperature,
      radiation: gameState.radiation,
      poison: gameState.poison,
      equippedTank: gameState.equippedTank,
      equippedFins: gameState.equippedFins,
      equippedRadSuit: gameState.equippedRadSuit,
      equippedThermalSuit: gameState.equippedThermalSuit,
      inventory: gameState.inventory,
      toolsOwned: [...gameState.toolsOwned],
      activeTool: gameState.activeTool,
      unlockedBlueprints: [...gameState.unlockedBlueprints],
      discoveredLogs: [...gameState.discoveredLogs],
      discoveredSignals: [...gameState.discoveredSignals],
      basePieces: gameState.basePieces,
      vehicles: gameState.vehicles,
      beacons: gameState.beacons,
      cureSynthesized: gameState.cureSynthesized,
      gameWon: gameState.gameWon,
      timeOfDay: gameState.timeOfDay,
      elapsedSeconds: gameState.elapsedSeconds,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  },

  load(): boolean {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    try {
      const data: SaveData = JSON.parse(raw);
      gameState.difficulty = data.difficulty as typeof gameState.difficulty;
      gameState.position = data.position;
      gameState.rotationY = data.rotationY;
      gameState.health = data.health;
      gameState.oxygen = data.oxygen;
      gameState.maxOxygen = data.maxOxygen;
      gameState.hunger = data.hunger;
      gameState.thirst = data.thirst;
      gameState.temperature = data.temperature;
      gameState.radiation = data.radiation;
      gameState.poison = data.poison;
      gameState.equippedTank = data.equippedTank as typeof gameState.equippedTank;
      gameState.equippedFins = data.equippedFins;
      gameState.equippedRadSuit = data.equippedRadSuit;
      gameState.equippedThermalSuit = data.equippedThermalSuit;
      gameState.inventory = data.inventory;
      gameState.toolsOwned = new Set(data.toolsOwned);
      gameState.activeTool = data.activeTool;
      gameState.unlockedBlueprints = new Set(data.unlockedBlueprints);
      gameState.discoveredLogs = new Set(data.discoveredLogs);
      gameState.discoveredSignals = new Set(data.discoveredSignals);
      gameState.basePieces = data.basePieces ?? [];
      gameState.vehicles = data.vehicles ?? [];
      gameState.beacons = data.beacons ?? [];
      gameState.cureSynthesized = data.cureSynthesized;
      gameState.gameWon = data.gameWon;
      gameState.timeOfDay = data.timeOfDay ?? 0.3;
      gameState.elapsedSeconds = data.elapsedSeconds ?? 0;
      return true;
    } catch {
      return false;
    }
  },

  clear(): void {
    localStorage.removeItem(SAVE_KEY);
  },
};
