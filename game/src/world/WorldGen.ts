import * as THREE from 'three';
import { Engine } from '../core/Engine';
import { Terrain } from './Terrain';
import { InteractionSystem } from './Interactables';
import { BIOMES } from '../data/biomes';
import { ITEMS } from '../data/items';
import { WRECK_SITES } from '../data/wrecks';
import { gameState } from '../core/GameState';
import { mulberry32 } from '../core/Noise';
import { bus } from '../core/EventBus';
import { audio } from '../core/AudioManager';
import { ScanningSystem } from '../systems/ScanningSystem';
import { blueprintByScanTarget } from '../data/blueprints';
import { bearingAndDistance } from '../core/Bearing';
import { buildOreMesh } from './OreMeshes';

const HARD_ORES = new Set(['diamond', 'kyanite', 'uraninite']);
const RESPAWN_SECONDS = 90;
const WRECK_TRACK_RANGE = 220;

interface NodeVisual {
  mesh: THREE.Object3D;
  depletedUntil: number;
}

interface WreckInstance {
  scanTargetId: string;
  isFragment: boolean;
  object3d: THREE.Object3D;
}

export class WorldGen {
  private wreckInstances: WreckInstance[] = [];

  constructor(
    private engine: Engine,
    private terrain: Terrain,
    private interactions: InteractionSystem,
    private scanning: ScanningSystem,
  ) {}

  generate(): void {
    const rng = mulberry32(42);
    for (const biome of BIOMES) {
      this.spawnResourceNodes(biome, rng);
      this.spawnFlora(biome, rng);
    }
    this.spawnWrecks();
  }

  private randomPointInBiome(biome: (typeof BIOMES)[number], rng: () => number): THREE.Vector3 {
    const r = THREE.MathUtils.lerp(biome.radiusRange[0], Math.min(biome.radiusRange[1], biome.radiusRange[0] + 140), rng());
    const angle = rng() * Math.PI * 2;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = this.terrain.heightAt(x, z);
    return new THREE.Vector3(x, y, z);
  }

  private spawnResourceNodes(biome: (typeof BIOMES)[number], rng: () => number): void {
    const count = 14;
    for (let i = 0; i < count; i++) {
      const itemId = biome.resourceTable[Math.floor(rng() * biome.resourceTable.length)];
      if (!itemId) continue;
      const pos = this.randomPointInBiome(biome, rng);
      const mesh = buildOreMesh(itemId, rng);
      mesh.position.copy(pos);
      mesh.rotation.y = rng() * Math.PI * 2;
      const scale = 0.8 + rng() * 0.5;
      mesh.scale.setScalar(scale);
      this.engine.scene.add(mesh);

      const visual: NodeVisual = { mesh, depletedUntil: 0 };
      const id = `ore_${biome.id}_${i}`;
      const requiresLaser = HARD_ORES.has(itemId);

      this.interactions.register({
        id,
        object3d: mesh,
        kind: 'resource',
        radius: 3.5,
        getPrompt: () => {
          if (performance.now() < visual.depletedUntil) return null;
          if (requiresLaser && gameState.activeTool !== 'laser_cutter') {
            return `${ITEMS[itemId].name} deposit — requires Laser Cutter`;
          }
          return `Mine ${ITEMS[itemId].name} [F]`;
        },
        onInteract: () => {
          if (requiresLaser && gameState.activeTool !== 'laser_cutter') return;
          if (gameState.addItem(itemId, 1)) {
            audio.pickupItem();
            bus.emit('notify', { text: `+1 ${ITEMS[itemId].name}`, kind: 'info' });
            mesh.visible = false;
            visual.depletedUntil = performance.now() + RESPAWN_SECONDS * 1000;
            setTimeout(() => {
              mesh.visible = true;
            }, RESPAWN_SECONDS * 1000);
          } else {
            bus.emit('notify', { text: 'Inventory full', kind: 'warning' });
          }
        },
      });
    }
  }

  private spawnFlora(biome: (typeof BIOMES)[number], rng: () => number): void {
    const count = 10;
    for (let i = 0; i < count; i++) {
      const itemId = biome.floraTable[Math.floor(rng() * biome.floraTable.length)];
      if (!itemId) continue;
      const pos = this.randomPointInBiome(biome, rng);
      const height = 1 + rng() * 1.5;
      const geo = new THREE.ConeGeometry(0.4, height, 6);
      const isDanger = itemId === 'poison_berry';
      const mat = new THREE.MeshStandardMaterial({ color: isDanger ? 0xaa2244 : 0x3fae5a, roughness: 0.8, flatShading: true });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos).add(new THREE.Vector3(0, height / 2, 0));
      this.engine.scene.add(mesh);

      const visual: NodeVisual = { mesh, depletedUntil: 0 };
      const id = `flora_${biome.id}_${i}`;

      this.interactions.register({
        id,
        object3d: mesh,
        kind: 'flora',
        radius: 3,
        getPrompt: () => {
          if (performance.now() < visual.depletedUntil) return null;
          return `Harvest ${ITEMS[itemId].name} [F]`;
        },
        onInteract: () => {
          if (gameState.addItem(itemId, 1)) {
            audio.pickupItem();
            bus.emit('notify', { text: `+1 ${ITEMS[itemId].name}`, kind: 'info' });
            mesh.visible = false;
            visual.depletedUntil = performance.now() + RESPAWN_SECONDS * 1000;
            setTimeout(() => {
              mesh.visible = true;
            }, RESPAWN_SECONDS * 1000);
          } else {
            bus.emit('notify', { text: 'Inventory full', kind: 'warning' });
          }
        },
      });
    }
  }

  private spawnWrecks(): void {
    for (const site of WRECK_SITES) {
      const group = new THREE.Group();
      const isFragment = site.kind === 'fragment';
      // Rest on the actual generated seafloor rather than the site's stored Y -
      // terrain height is procedural and can drift from the hand-authored data,
      // which otherwise leaves wrecks floating out of interaction range.
      const restHeight = isFragment ? 0.6 : 1.4;
      const floorY = this.terrain.heightAt(site.position[0], site.position[2]);
      group.position.set(site.position[0], floorY + restHeight, site.position[2]);
      const bodyGeo = isFragment
        ? new THREE.BoxGeometry(1.2, 1, 1.4)
        : new THREE.BoxGeometry(5 + Math.random() * 3, 2.5, 3 + Math.random() * 2);
      const bodyMat = new THREE.MeshStandardMaterial({ color: isFragment ? 0x555f66 : 0x3a4048, roughness: 0.9, metalness: 0.3, flatShading: true });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.rotation.y = Math.random() * Math.PI;
      body.rotation.z = (Math.random() - 0.5) * 0.4;
      group.add(body);

      // faint emissive scan-glow ring so wrecks read as points of interest
      const glowGeo = new THREE.RingGeometry(1.6, 1.9, 24);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0x5fd0e8, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = 1.6;
      group.add(glow);

      this.engine.scene.add(group);
      this.wreckInstances.push({ scanTargetId: site.scanTargetId, isFragment, object3d: group });

      this.interactions.register({
        id: site.scanTargetId,
        object3d: group,
        kind: isFragment ? 'fragment' : 'wreck',
        radius: isFragment ? 4 : 7,
        holdDuration: this.scanTimeFor(site.scanTargetId),
        getPrompt: () => {
          if (this.scanning.isScanned(site.scanTargetId)) return null;
          if (gameState.activeTool !== 'scanner') return 'Equip Scanner to analyze [1-9 to switch tools]';
          return `Scanning ${isFragment ? 'fragment' : 'wreck'}... hold [F]`;
        },
        onHoldProgress: (frac) => this.scanning.onProgress(site.scanTargetId, frac),
        onHoldCancel: () => this.scanning.onCancel(),
        onInteract: () => {
          this.scanning.completeScan(site.scanTargetId);
          gameState.addItem('data_fragment', 1);
          gameState.addItem('scrap_metal', isFragment ? 1 : 3);
        },
      });
    }
  }

  private scanTimeFor(scanTargetId: string): number {
    return blueprintByScanTarget(scanTargetId)?.scanTimeSec ?? 5;
  }

  // Wrecks are visible landmarks even before they're scanned, so unlike radio
  // signals (which require a log to unlock) any wreck within range shows up
  // on the compass once you're close enough to have plausibly spotted it.
  nearbyWrecks(playerPos: THREE.Vector3, playerYaw: number): { id: string; label: string; distance: number; bearing: number; scanned: boolean }[] {
    const results: { id: string; label: string; distance: number; bearing: number; scanned: boolean }[] = [];
    for (const wreck of this.wreckInstances) {
      const { distance, bearing } = bearingAndDistance(playerPos, playerYaw, wreck.object3d.position);
      if (distance > WRECK_TRACK_RANGE) continue;
      results.push({
        id: wreck.scanTargetId,
        label: wreck.isFragment ? 'Fragment' : 'Wreck',
        distance,
        bearing,
        scanned: this.scanning.isScanned(wreck.scanTargetId),
      });
    }
    return results;
  }
}

