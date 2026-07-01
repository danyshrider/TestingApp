import * as THREE from 'three';
import { Engine } from '../core/Engine';
import { Player } from '../entities/Player';
import { World } from '../world/World';
import { gameState, DIFFICULTY_SETTINGS } from '../core/GameState';
import { bus } from '../core/EventBus';
import { audio } from '../core/AudioManager';

const TANK_CAPACITY: Record<string, number> = {
  none: 45,
  air_tank_1: 90,
  air_tank_2: 180,
};

const TANK_MAX_SAFE_DEPTH: Record<string, number> = {
  none: 100,
  air_tank_1: 250,
  air_tank_2: 500,
};

export class SurvivalSystem {
  private poisonTickTimer = 0;
  private lastNotifiedO2Warning = false;

  constructor(engine: Engine, private player: Player, private world: World) {
    gameState.maxOxygen = TANK_CAPACITY[gameState.equippedTank];
    engine.addUpdater((dt) => this.update(dt));
  }

  refillOxygenFull(): void {
    gameState.oxygen = gameState.maxOxygen;
  }

  private update(dt: number): void {
    if (!gameState.isAlive) return;
    const diff = DIFFICULTY_SETTINGS[gameState.difficulty];
    gameState.elapsedSeconds += dt;

    gameState.maxOxygen = TANK_CAPACITY[gameState.equippedTank];

    // Oxygen
    if (this.player.isAboveSurface || this.player.controlsLocked) {
      gameState.oxygen = Math.min(gameState.maxOxygen, gameState.oxygen + dt * 30);
    } else {
      gameState.oxygen = Math.max(0, gameState.oxygen - dt * (diff.survivalOff ? 0 : 1));
    }

    if (gameState.oxygen <= 0 && !diff.survivalOff) {
      this.damage(dt * 6, 'drowning');
    }

    if (gameState.oxygen < gameState.maxOxygen * 0.15 && !this.lastNotifiedO2Warning && !this.player.isAboveSurface) {
      this.lastNotifiedO2Warning = true;
      bus.emit('notify', { text: 'Oxygen critical!', kind: 'warning' });
      audio.alert();
    }
    if (gameState.oxygen > gameState.maxOxygen * 0.3) this.lastNotifiedO2Warning = false;

    // Hunger & thirst
    if (!diff.survivalOff) {
      gameState.hunger = Math.max(0, gameState.hunger - dt * 0.12 * diff.drainMultiplier);
      gameState.thirst = Math.max(0, gameState.thirst - dt * 0.18 * diff.drainMultiplier);
      if (gameState.hunger <= 0) this.damage(dt * 1.2, 'starvation');
      if (gameState.thirst <= 0) this.damage(dt * 1.6, 'dehydration');
    }

    // Poison decay + damage
    if (gameState.poison > 0) {
      this.poisonTickTimer += dt;
      if (this.poisonTickTimer >= 1) {
        this.poisonTickTimer = 0;
        this.damage(3, 'poison');
        gameState.poison = Math.max(0, gameState.poison - 8);
      }
    }

    // Temperature / radiation hazards based on biome
    const biome = this.world.currentBiome();
    const targetTemp = biome.ambientTemp;
    gameState.temperature += (targetTemp - gameState.temperature) * Math.min(1, dt * 0.5);
    const extremeHeat = gameState.temperature > 35 && !gameState.equippedThermalSuit;
    const extremeCold = gameState.temperature < 6 && !gameState.equippedThermalSuit;
    if ((extremeHeat || extremeCold) && !diff.survivalOff) {
      this.damage(dt * 4, extremeHeat ? 'heat' : 'cold');
    }

    if (biome.hazardRadiation && !gameState.equippedRadSuit) {
      gameState.radiation = Math.min(100, gameState.radiation + dt * 8);
    } else {
      gameState.radiation = Math.max(0, gameState.radiation - dt * 10);
    }
    if (gameState.radiation > 40 && !diff.survivalOff) {
      this.damage(dt * (gameState.radiation / 40) * 2, 'radiation');
    }

    // Pressure / depth limit
    const maxSafe = TANK_MAX_SAFE_DEPTH[gameState.equippedTank];
    if (this.player.depth > maxSafe && !diff.survivalOff) {
      this.damage(dt * 8, 'pressure');
    }

    if (gameState.health <= 0 && gameState.isAlive) {
      this.die();
    }
  }

  damage(amount: number, source: string): void {
    const diff = DIFFICULTY_SETTINGS[gameState.difficulty];
    if (diff.survivalOff && diff.damageMultiplier === 0) return;
    gameState.health = Math.max(0, gameState.health - amount * diff.damageMultiplier);
    bus.emit('player-damaged', { amount, source });
  }

  eat(food: number, water: number, poison = 0): void {
    gameState.hunger = Math.min(100, gameState.hunger + food);
    gameState.thirst = Math.min(100, gameState.thirst + water);
    if (poison > 0) gameState.poison = Math.min(100, gameState.poison + poison);
  }

  heal(amount: number): void {
    gameState.health = Math.min(gameState.maxHealth, gameState.health + amount);
  }

  private die(): void {
    gameState.isAlive = false;
    bus.emit('player-died');
    const diff = DIFFICULTY_SETTINGS[gameState.difficulty];
    if (!diff.permaDeath) {
      // Respawn near surface at spawn point with penalties, like Subnautica's no-permadeath default.
      setTimeout(() => {
        gameState.isAlive = true;
        gameState.health = gameState.maxHealth * 0.5;
        gameState.hunger = Math.max(20, gameState.hunger * 0.5);
        gameState.thirst = Math.max(20, gameState.thirst * 0.5);
        gameState.position = [0, 0.5, 8];
        this.player.teleport(new THREE.Vector3(0, 0.5, 8));
        bus.emit('player-respawned');
      }, 2000);
    }
  }
}
