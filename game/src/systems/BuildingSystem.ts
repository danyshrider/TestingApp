import * as THREE from 'three';
import { Engine } from '../core/Engine';
import { Player } from '../entities/Player';
import { InputManager } from '../core/InputManager';
import { gameState } from '../core/GameState';
import type { PlacedBasePart } from '../core/GameState';
import { World } from '../world/World';
import { bus } from '../core/EventBus';
import { audio } from '../core/AudioManager';

const HULL_SAFE_DEPTH = 320;
const PART_GEOMETRY: Record<string, () => THREE.BufferGeometry> = {
  base_corridor: () => new THREE.CylinderGeometry(1.1, 1.1, 3, 12),
  base_room: () => new THREE.SphereGeometry(2.2, 16, 12),
  base_hatch: () => new THREE.CylinderGeometry(0.9, 0.9, 0.4, 12),
  base_window: () => new THREE.TorusGeometry(1, 0.2, 8, 16),
  base_solar: () => new THREE.BoxGeometry(2, 0.15, 2),
  base_thermal: () => new THREE.ConeGeometry(1.2, 2, 8),
  base_bioreactor: () => new THREE.CylinderGeometry(0.8, 0.8, 1.6, 10),
  base_nuclear: () => new THREE.CylinderGeometry(1.3, 1.3, 2.2, 12),
  base_fabricator: () => new THREE.BoxGeometry(1, 1.4, 1),
  base_storage: () => new THREE.BoxGeometry(1.2, 1.4, 1),
  base_growbed: () => new THREE.BoxGeometry(1.6, 0.4, 1.6),
  base_moonpool: () => new THREE.TorusGeometry(2.5, 0.4, 8, 20),
  base_filtration: () => new THREE.CylinderGeometry(0.7, 0.9, 1.8, 10),
};
const PART_COLOR: Record<string, number> = {
  base_corridor: 0xd6dee2, base_room: 0xd6dee2, base_hatch: 0xffb400, base_window: 0x8fd8e8,
  base_solar: 0x2a5aa0, base_thermal: 0xe0662a, base_bioreactor: 0x5a8a3a, base_nuclear: 0x9fe05a,
  base_fabricator: 0x606a72, base_storage: 0x8a6a3a, base_growbed: 0x3a8a4a, base_moonpool: 0x3a6a8a,
  base_filtration: 0x4a9ad0,
};

const POWER_GEN_TIER: Record<string, number> = { base_solar: 8, base_thermal: 10, base_bioreactor: 4, base_nuclear: 25 };
const POWER_CONSUMPTION_PER_PART = 0.6;

export class BuildingSystem {
  private ghost: THREE.Mesh | null = null;
  private ghostType: string | null = null;
  private ghostRotation = 0;
  buildModeActive = false;
  totalPower = 0;
  powerCapacity = 0;
  hullIntegrity = 100;
  private growTimer = 0;
  private filtrationTimer = 0;
  private parts: Map<string, THREE.Object3D> = new Map();

  constructor(private engine: Engine, private player: Player, private input: InputManager, private world: World) {
    engine.addUpdater((dt) => this.update(dt));
    this.restoreFromSave();
  }

  private restoreFromSave(): void {
    for (const part of gameState.basePieces) this.spawnMesh(part);
  }

  enterBuildMode(partType: string): void {
    this.exitBuildMode();
    this.buildModeActive = true;
    this.ghostType = partType;
    const geo = PART_GEOMETRY[partType]?.() ?? new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: PART_COLOR[partType] ?? 0xffffff, transparent: true, opacity: 0.5 });
    this.ghost = new THREE.Mesh(geo, mat);
    this.engine.scene.add(this.ghost);
  }

  exitBuildMode(): void {
    this.buildModeActive = false;
    this.ghostType = null;
    if (this.ghost) {
      this.engine.scene.remove(this.ghost);
      this.ghost = null;
    }
  }

  private update(dt: number): void {
    if (this.buildModeActive && this.ghost && this.ghostType) {
      const camDir = new THREE.Vector3();
      this.engine.camera.getWorldDirection(camDir);
      const placePos = this.engine.camera.position.clone().addScaledVector(camDir, 5);
      this.ghost.position.copy(placePos);
      if (this.input.wasJustPressed('KeyQ')) this.ghostRotation -= Math.PI / 8;
      if (this.input.wasJustPressed('KeyE')) this.ghostRotation += Math.PI / 8;
      this.ghost.rotation.y = this.ghostRotation;

      if (this.input.mouseDown) {
        this.confirmPlacement();
      }
      if (this.input.rightMouseDown) {
        this.exitBuildMode();
      }
    }

    this.recomputePower();
    this.recomputeHullIntegrity(dt);

    this.growTimer -= dt;
    if (this.growTimer <= 0) {
      this.growTimer = 60;
      const growBedCount = gameState.basePieces.filter((p) => p.partType === 'base_growbed').length;
      if (growBedCount > 0 && this.totalPower >= 0) {
        gameState.addItem('bulbo_tree_seed', growBedCount);
      }
    }
    this.filtrationTimer -= dt;
    if (this.filtrationTimer <= 0) {
      this.filtrationTimer = 45;
      const filtrationCount = gameState.basePieces.filter((p) => p.partType === 'base_filtration').length;
      if (filtrationCount > 0 && this.totalPower >= 0) {
        gameState.addItem('purified_water', filtrationCount);
      }
    }
  }

  private confirmPlacement(): void {
    if (!this.ghost || !this.ghostType) return;
    if (gameState.countItem(this.ghostType) <= 0) {
      bus.emit('notify', { text: 'No parts of this type remaining', kind: 'warning' });
      return;
    }
    gameState.removeItem(this.ghostType, 1);
    const part: PlacedBasePart = {
      id: `part_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      partType: this.ghostType,
      position: [this.ghost.position.x, this.ghost.position.y, this.ghost.position.z],
      rotationY: this.ghostRotation,
    };
    gameState.basePieces.push(part);
    this.spawnMesh(part);
    audio.craft();
    bus.emit('notify', { text: 'Placed', kind: 'success' });
  }

  private spawnMesh(part: PlacedBasePart): void {
    const geo = PART_GEOMETRY[part.partType]?.() ?? new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: PART_COLOR[part.partType] ?? 0xffffff, roughness: 0.5, metalness: 0.2 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...part.position);
    mesh.rotation.y = part.rotationY;
    this.engine.scene.add(mesh);
    this.parts.set(part.id, mesh);
  }

  private recomputePower(): void {
    const dayFactor = THREE.MathUtils.clamp(Math.sin(gameState.timeOfDay * Math.PI * 2) * 0.5 + 0.5, 0, 1);
    let gen = 0;
    for (const part of gameState.basePieces) {
      const base = POWER_GEN_TIER[part.partType];
      if (!base) continue;
      if (part.partType === 'base_solar') {
        const depth = Math.max(0, -part.position[1]);
        gen += base * dayFactor * THREE.MathUtils.clamp(1 - depth / 60, 0, 1);
      } else if (part.partType === 'base_thermal') {
        const biome = this.world.currentBiome();
        gen += biome.ambientTemp > 30 ? base : base * 0.15;
      } else {
        gen += base;
      }
    }
    this.powerCapacity = gen;
    this.totalPower = gen - gameState.basePieces.length * POWER_CONSUMPTION_PER_PART;
  }

  private recomputeHullIntegrity(dt: number): void {
    if (gameState.basePieces.length === 0) {
      this.hullIntegrity = 100;
      return;
    }
    const maxDepth = Math.max(...gameState.basePieces.map((p) => -p.position[1]));
    if (maxDepth > HULL_SAFE_DEPTH) {
      this.hullIntegrity = Math.max(0, this.hullIntegrity - dt * 2);
      const nearBase = gameState.basePieces.some(
        (p) => this.player.position.distanceTo(new THREE.Vector3(...p.position)) < 6,
      );
      if (this.hullIntegrity <= 0 && nearBase) {
        bus.emit('player-damaged', { amount: dt * 5, source: 'hull breach' });
      }
    } else {
      this.hullIntegrity = Math.min(100, this.hullIntegrity + dt * 3);
    }
  }

  nearestFabricatorInRange(range = 8): boolean {
    return gameState.basePieces.some(
      (p) => p.partType === 'base_fabricator' && this.player.position.distanceTo(new THREE.Vector3(...p.position)) < range,
    );
  }

  storageCapacityBonus(): number {
    return gameState.basePieces.filter((p) => p.partType === 'base_storage').length * 6;
  }
}
