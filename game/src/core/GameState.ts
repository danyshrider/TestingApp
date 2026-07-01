import type { Difficulty, ItemStack } from '../data/types';
import { bus } from './EventBus';

export interface InventorySlot {
  stack: ItemStack | null;
}

export interface BeaconMarker {
  id: string;
  label: string;
  color: string;
  position: [number, number, number];
}

export interface PlacedBasePart {
  id: string;
  partType: string;
  position: [number, number, number];
  rotationY: number;
}

export interface PlacedVehicle {
  id: string;
  vehicleType: string;
  position: [number, number, number];
  rotationY: number;
  health: number;
  power: number;
}

export const DIFFICULTY_SETTINGS: Record<Difficulty, { drainMultiplier: number; damageMultiplier: number; permaDeath: boolean; survivalOff: boolean }> = {
  survival: { drainMultiplier: 1, damageMultiplier: 1, permaDeath: false, survivalOff: false },
  freedom: { drainMultiplier: 0, damageMultiplier: 1, permaDeath: false, survivalOff: true },
  hardcore: { drainMultiplier: 1.4, damageMultiplier: 1.5, permaDeath: true, survivalOff: false },
  creative: { drainMultiplier: 0, damageMultiplier: 0, permaDeath: false, survivalOff: true },
};

export class GameState {
  difficulty: Difficulty = 'survival';

  // Player transform (authoritative copy kept here for save/load; Player syncs each frame)
  position: [number, number, number] = [0, 0.5, 8];
  rotationY = 0;

  // Survival stats (0-100 unless noted)
  health = 100;
  maxHealth = 100;
  oxygen = 45;
  maxOxygen = 45;
  hunger = 100;
  thirst = 100;
  temperature = 22;
  radiation = 0;
  poison = 0;
  isAlive = true;

  // Equipment upgrades affecting stats
  equippedTank: 'none' | 'air_tank_1' | 'air_tank_2' = 'none';
  equippedFins = false;
  equippedRadSuit = false;
  equippedThermalSuit = false;

  // Inventory: fixed grid capacity, expandable slightly with storage additions
  inventoryCols = 6;
  inventoryRows = 5;
  inventory: (ItemStack | null)[] = new Array(30).fill(null);

  // Tools currently carried (bool unlocks, crafted once, kept forever like Subnautica tools)
  toolsOwned = new Set<string>(['knife', 'scanner']);
  activeTool: string | null = 'scanner';

  // Progression
  unlockedBlueprints = new Set<string>();
  discoveredLogs = new Set<string>();
  discoveredSignals = new Set<string>();
  scanProgress: Record<string, number> = {};

  // World state
  basePieces: PlacedBasePart[] = [];
  vehicles: PlacedVehicle[] = [];
  beacons: BeaconMarker[] = [];
  activeVehicleId: string | null = null;
  dockedVehicleIds = new Set<string>();

  // Story
  cureSynthesized = false;
  gameWon = false;

  // Time
  timeOfDay = 0.3; // 0-1 fraction of day cycle
  elapsedSeconds = 0;

  addItem(id: string, qty: number): boolean {
    // try stacking
    for (const slot of this.inventory) {
      if (slot && slot.id === id) {
        slot.qty += qty;
        bus.emit('inventory-changed');
        return true;
      }
    }
    const idx = this.inventory.findIndex((s) => s === null);
    if (idx === -1) return false;
    this.inventory[idx] = { id, qty };
    bus.emit('inventory-changed');
    return true;
  }

  removeItem(id: string, qty: number): boolean {
    let remaining = qty;
    for (let i = 0; i < this.inventory.length; i++) {
      const slot = this.inventory[i];
      if (slot && slot.id === id) {
        const take = Math.min(slot.qty, remaining);
        slot.qty -= take;
        remaining -= take;
        if (slot.qty <= 0) this.inventory[i] = null;
        if (remaining <= 0) break;
      }
    }
    bus.emit('inventory-changed');
    return remaining <= 0;
  }

  countItem(id: string): number {
    return this.inventory.reduce((sum, s) => sum + (s && s.id === id ? s.qty : 0), 0);
  }

  hasItems(items: ItemStack[]): boolean {
    return items.every((i) => this.countItem(i.id) >= i.qty);
  }

  consumeItems(items: ItemStack[]): void {
    for (const i of items) this.removeItem(i.id, i.qty);
  }
}

export const gameState = new GameState();
