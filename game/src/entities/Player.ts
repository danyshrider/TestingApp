import * as THREE from 'three';
import { Engine } from '../core/Engine';
import { InputManager } from '../core/InputManager';
import { gameState } from '../core/GameState';
import { World } from '../world/World';

const BASE_SPEED = 4.5;
const FINS_SPEED_MULT = 1.45;
const SPRINT_MULT = 1.6;
const LOOK_SENSITIVITY = 0.0022;

export class Player {
  yaw = 0;
  pitch = 0;
  velocity = new THREE.Vector3();
  position = new THREE.Vector3(...gameState.position);
  controlsLocked = false; // true while piloting a vehicle
  inVehicle: string | null = null;

  constructor(private engine: Engine, private input: InputManager, private world: World) {
    engine.camera.position.copy(this.position);
    engine.addUpdater((dt) => this.update(dt));
  }

  get depth(): number {
    return Math.max(0, -this.position.y);
  }

  get isAboveSurface(): boolean {
    return this.position.y >= -0.3;
  }

  private applyLook(): void {
    const { dx, dy } = this.input.consumeMouseDelta();
    this.yaw -= dx * LOOK_SENSITIVITY;
    this.pitch -= dy * LOOK_SENSITIVITY;
    this.pitch = THREE.MathUtils.clamp(this.pitch, -Math.PI / 2 + 0.05, Math.PI / 2 - 0.05);
  }

  private update(dt: number): void {
    if (this.controlsLocked) {
      // While in a vehicle, Vehicle.ts drives camera + gameState.position directly.
      return;
    }

    this.applyLook();

    const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(euler);
    const right = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, this.yaw, 0));
    const up = new THREE.Vector3(0, 1, 0);

    const thrust = new THREE.Vector3();
    if (this.input.isDown('KeyW')) thrust.add(forward);
    if (this.input.isDown('KeyS')) thrust.sub(forward);
    if (this.input.isDown('KeyD')) thrust.add(right);
    if (this.input.isDown('KeyA')) thrust.sub(right);
    if (this.input.isDown('Space')) thrust.add(up);
    if (this.input.isDown('ControlLeft')) thrust.sub(up);

    let speed = BASE_SPEED;
    if (gameState.equippedFins) speed *= FINS_SPEED_MULT;
    if (this.input.isDown('ShiftLeft')) speed *= SPRINT_MULT;
    if (gameState.oxygen <= 0) speed *= 0.6;

    if (thrust.lengthSq() > 0) {
      thrust.normalize().multiplyScalar(speed);
    }

    // Water drag toward target velocity (smooth accel/decel feel)
    this.velocity.lerp(thrust, Math.min(1, dt * 4));

    const nextPos = this.position.clone().addScaledVector(this.velocity, dt);

    // Sea floor collision
    const floorY = this.world.terrain.heightAt(nextPos.x, nextPos.z) + 0.6;
    if (nextPos.y < floorY) nextPos.y = floorY;

    // Surface ceiling: allow breaching a bit above y=0 but gently push back down
    if (nextPos.y > 3) nextPos.y = 3;

    this.position.copy(nextPos);

    this.engine.camera.position.copy(this.position);
    this.engine.camera.quaternion.setFromEuler(euler);

    gameState.position = [this.position.x, this.position.y, this.position.z];
    gameState.rotationY = this.yaw;
  }

  teleport(pos: THREE.Vector3): void {
    this.position.copy(pos);
    this.engine.camera.position.copy(pos);
  }
}
