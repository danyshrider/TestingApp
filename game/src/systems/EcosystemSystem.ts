import * as THREE from 'three';
import { Engine } from '../core/Engine';
import { Player } from '../entities/Player';
import { World } from '../world/World';
import { Creature } from '../entities/Creature';
import { CREATURES } from '../data/creatures';
import { BIOMES } from '../data/biomes';
import { mulberry32 } from '../core/Noise';
import { gameState } from '../core/GameState';
import { bus } from '../core/EventBus';
import { InputManager } from '../core/InputManager';
import { SurvivalSystem } from './SurvivalSystem';
import { audio } from '../core/AudioManager';

const KNIFE_DAMAGE = 15;
const KNIFE_RANGE = 3;
const ATTACK_COOLDOWN = 0.5;

export class EcosystemSystem {
  creatures: Creature[] = [];
  private attackCd = 0;
  private roarTimer = 8;

  constructor(
    private engine: Engine,
    private player: Player,
    private world: World,
    private input: InputManager,
    private survival: SurvivalSystem,
  ) {
    this.populate();
    engine.addUpdater((dt) => this.update(dt));
  }

  private populate(): void {
    const rng = mulberry32(99);
    for (const biome of BIOMES) {
      const countPerSpecies = biome.hasLeviathan ? 6 : 8;
      for (const speciesId of biome.faunaTable) {
        const def = CREATURES[speciesId];
        if (!def) continue;
        const spawnCount = def.behavior === 'leviathan' ? 1 : countPerSpecies;
        for (let i = 0; i < spawnCount; i++) {
          const r = THREE.MathUtils.lerp(biome.radiusRange[0] + 20, Math.min(biome.radiusRange[1], biome.radiusRange[0] + 160), rng());
          const angle = rng() * Math.PI * 2;
          const x = Math.cos(angle) * r;
          const z = Math.sin(angle) * r;
          const floorY = this.world.terrain.heightAt(x, z);
          const y = floorY + 2 + rng() * (def.behavior === 'leviathan' ? 20 : 6);
          const creature = new Creature(def, new THREE.Vector3(x, y, z));
          this.creatures.push(creature);
          this.engine.scene.add(creature.mesh);
        }
      }
    }
  }

  private update(dt: number): void {
    if (this.attackCd > 0) this.attackCd -= dt;
    this.roarTimer -= dt;

    const playerPos = this.player.position;
    let nearestLeviathanDist = Infinity;

    for (const creature of this.creatures) {
      if (creature.isDead) continue;
      const floorY = this.world.terrain.heightAt(creature.mesh.position.x, creature.mesh.position.z);
      creature.update(dt, playerPos, floorY, (dmg) => {
        this.survival.damage(dmg, creature.def.name);
        audio.hurt();
      });
      if (creature.def.behavior === 'leviathan') {
        nearestLeviathanDist = Math.min(nearestLeviathanDist, creature.mesh.position.distanceTo(playerPos));
      }
    }

    if (this.roarTimer <= 0 && nearestLeviathanDist < 150) {
      this.roarTimer = 10 + Math.random() * 10;
      audio.distantRoar(THREE.MathUtils.clamp(1 - nearestLeviathanDist / 150, 0.15, 1));
    }

    if (this.input.mouseDown && this.attackCd <= 0 && gameState.activeTool === 'knife') {
      this.attackCd = ATTACK_COOLDOWN;
      this.tryAttack();
    }

    for (const creature of this.creatures) {
      if (creature.isDead && creature.mesh.parent) {
        this.engine.scene.remove(creature.mesh);
      }
    }
  }

  private tryAttack(): void {
    const camDir = new THREE.Vector3();
    this.engine.camera.getWorldDirection(camDir);
    const camPos = this.engine.camera.position;
    let target: Creature | null = null;
    let bestDot = 0.7;
    for (const creature of this.creatures) {
      if (creature.isDead) continue;
      const toCreature = creature.mesh.position.clone().sub(camPos);
      const dist = toCreature.length();
      if (dist > KNIFE_RANGE) continue;
      const dot = toCreature.normalize().dot(camDir);
      if (dot > bestDot) {
        bestDot = dot;
        target = creature;
      }
    }
    if (target) {
      target.health -= KNIFE_DAMAGE;
      audio.hurt();
      if (target.isDead) {
        for (const loot of target.def.loot ?? []) gameState.addItem(loot.id, loot.qty);
        bus.emit('notify', { text: `${target.def.name} defeated`, kind: 'info' });
      }
    }
  }
}
