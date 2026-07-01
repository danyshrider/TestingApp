import * as THREE from 'three';
import { Engine } from '../core/Engine';
import { Player } from '../entities/Player';
import { gameState } from '../core/GameState';
import type { BeaconMarker } from '../core/GameState';
import { bus } from '../core/EventBus';

const COLORS = ['#ff5555', '#55ff88', '#55aaff', '#ffdd55', '#ff55dd'];

// Subnautica has no map: beacons are the only persistent, player-placed
// spatial reference, read via bearing + distance rather than a top-down view.
export class BeaconSystem {
  constructor(private engine: Engine, private player: Player) {
    for (const b of gameState.beacons) this.spawnMesh(b);
  }

  placeBeacon(): void {
    const marker: BeaconMarker = {
      id: `beacon_${Date.now()}`,
      label: `Beacon ${gameState.beacons.length + 1}`,
      color: COLORS[gameState.beacons.length % COLORS.length],
      position: [this.player.position.x, this.player.position.y, this.player.position.z],
    };
    gameState.beacons.push(marker);
    this.spawnMesh(marker);
    bus.emit('notify', { text: `${marker.label} placed`, kind: 'success' });
  }

  removeBeacon(id: string): void {
    gameState.beacons = gameState.beacons.filter((b) => b.id !== id);
  }

  private spawnMesh(marker: BeaconMarker): void {
    const group = new THREE.Group();
    group.position.set(...marker.position);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 6, 8),
      new THREE.MeshStandardMaterial({ color: marker.color, emissive: new THREE.Color(marker.color), emissiveIntensity: 0.6 }),
    );
    pole.position.y = 3;
    group.add(pole);
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 12),
      new THREE.MeshStandardMaterial({ color: marker.color, emissive: new THREE.Color(marker.color), emissiveIntensity: 1 }),
    );
    orb.position.y = 6.2;
    group.add(orb);
    const light = new THREE.PointLight(new THREE.Color(marker.color).getHex(), 1.2, 20);
    light.position.y = 6.2;
    group.add(light);
    this.engine.scene.add(group);
  }

  bearingsAndDistances(): { id: string; label: string; color: string; distance: number; bearing: number }[] {
    const p = this.player.position;
    return gameState.beacons.map((b) => {
      const target = new THREE.Vector3(...b.position);
      const flat = target.clone().sub(p);
      const distance = flat.length();
      flat.y = 0;
      flat.normalize();
      const worldAngle = Math.atan2(flat.x, flat.z);
      let bearing = worldAngle - this.player.yaw + Math.PI;
      bearing = ((bearing % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      bearing -= Math.PI;
      return { id: b.id, label: b.label, color: b.color, distance, bearing };
    });
  }
}
