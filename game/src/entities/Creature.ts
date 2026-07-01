import * as THREE from 'three';
import type { CreatureDef } from '../data/types';

export type CreatureState = 'patrol' | 'flee' | 'hunt' | 'attack';

export class Creature {
  mesh: THREE.Mesh;
  state: CreatureState = 'patrol';
  health: number;
  homePoint: THREE.Vector3;
  wanderTarget: THREE.Vector3;
  attackCooldown = 0;
  private wanderTimer = 0;

  constructor(public def: CreatureDef, position: THREE.Vector3) {
    this.health = def.health;
    this.homePoint = position.clone();
    this.wanderTarget = position.clone();
    const geo = new THREE.CapsuleGeometry(def.size * 0.4, def.size * 0.9, 4, 8);
    const mat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.55, flatShading: true });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.rotation.z = Math.PI / 2;
    this.mesh.position.copy(position);
  }

  get isDead(): boolean {
    return this.health <= 0;
  }

  private pickWanderTarget(): void {
    const range = this.def.behavior === 'leviathan' ? 60 : 15;
    const offset = new THREE.Vector3((Math.random() - 0.5) * range, (Math.random() - 0.5) * range * 0.3, (Math.random() - 0.5) * range);
    this.wanderTarget = this.homePoint.clone().add(offset);
  }

  update(dt: number, playerPos: THREE.Vector3, floorY: number, onAttack: (dmg: number) => void): void {
    if (this.isDead) return;
    const toPlayer = playerPos.clone().sub(this.mesh.position);
    const dist = toPlayer.length();

    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    if (this.def.behavior === 'predator' || this.def.behavior === 'leviathan') {
      if (dist < this.def.detectionRadius) this.state = 'hunt';
      else if (this.state === 'hunt' && dist > this.def.detectionRadius * 1.6) this.state = 'patrol';
    } else if (this.def.behavior === 'edible' && this.def.fleeRadius) {
      this.state = dist < this.def.fleeRadius ? 'flee' : 'patrol';
    }

    let target: THREE.Vector3;
    let speed = this.def.speed;

    if (this.state === 'hunt') {
      target = playerPos;
      if (dist < this.def.size + 1.2) {
        this.state = 'attack';
      }
    } else if (this.state === 'attack') {
      target = playerPos;
      if (dist > this.def.size + 1.6) {
        this.state = 'hunt';
      } else if (this.attackCooldown <= 0) {
        onAttack(this.def.damage);
        this.attackCooldown = 1.5;
      }
    } else if (this.state === 'flee') {
      target = this.mesh.position.clone().add(this.mesh.position.clone().sub(playerPos).normalize().multiplyScalar(10));
      speed *= 1.4;
    } else {
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        this.pickWanderTarget();
        this.wanderTimer = 4 + Math.random() * 4;
      }
      target = this.wanderTarget;
      speed *= 0.5;
    }

    const dir = target.clone().sub(this.mesh.position);
    if (dir.lengthSq() > 0.04) {
      dir.normalize();
      this.mesh.position.addScaledVector(dir, speed * dt);
      const angle = Math.atan2(dir.x, dir.z);
      this.mesh.rotation.y = angle;
    }

    if (this.mesh.position.y < floorY + this.def.size * 0.4) {
      this.mesh.position.y = floorY + this.def.size * 0.4;
    }
  }
}
