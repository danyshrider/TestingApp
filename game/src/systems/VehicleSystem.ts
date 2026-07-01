import * as THREE from 'three';
import { Engine } from '../core/Engine';
import { Player } from '../entities/Player';
import { InputManager } from '../core/InputManager';
import { World } from '../world/World';
import { InteractionSystem } from '../world/Interactables';
import { gameState } from '../core/GameState';
import type { PlacedVehicle } from '../core/GameState';
import { VEHICLE_TYPES } from '../entities/Vehicle';
import { bus } from '../core/EventBus';
import { audio } from '../core/AudioManager';

const MOONPOOL_DOCK_RANGE = 6;

interface VehicleInstance {
  data: PlacedVehicle;
  mesh: THREE.Mesh;
}

export class VehicleSystem {
  private vehicles = new Map<string, VehicleInstance>();
  private pilotYaw = 0;
  private pilotPitch = 0;
  private velocity = new THREE.Vector3();

  constructor(
    private engine: Engine,
    private player: Player,
    private input: InputManager,
    private world: World,
    private interactions: InteractionSystem,
  ) {
    bus.on<string>('spawn-vehicle', (vehicleType) => this.spawnVehicle(vehicleType));
    for (const v of gameState.vehicles) this.createInstance(v);
    engine.addUpdater((dt) => this.update(dt));
  }

  private spawnVehicle(vehicleType: string): void {
    const def = VEHICLE_TYPES[vehicleType];
    if (!def) return;
    const spawnPos = this.player.position.clone().add(new THREE.Vector3(4, 0, 0));
    const data: PlacedVehicle = {
      id: `veh_${Date.now()}`,
      vehicleType,
      position: [spawnPos.x, spawnPos.y, spawnPos.z],
      rotationY: 0,
      health: def.maxHealth,
      power: def.maxPower,
    };
    gameState.vehicles.push(data);
    this.createInstance(data);
    bus.emit('notify', { text: `${def.name} constructed nearby`, kind: 'success' });
  }

  private createInstance(data: PlacedVehicle): void {
    const def = VEHICLE_TYPES[data.vehicleType];
    if (!def) return;
    const geo = new THREE.CapsuleGeometry(def.size[0] * 0.5, def.size[2] * 0.6, 4, 10);
    const mat = new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.35, metalness: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.z = Math.PI / 2;
    mesh.position.set(...data.position);
    mesh.rotation.y = data.rotationY;
    this.engine.scene.add(mesh);
    const instance: VehicleInstance = { data, mesh };
    this.vehicles.set(data.id, instance);

    this.interactions.register({
      id: data.id,
      object3d: mesh,
      kind: 'vehicle',
      radius: 5,
      getPrompt: () => {
        if (gameState.activeVehicleId === data.id) return 'Exit vehicle [F]';
        if (gameState.activeVehicleId) return null;
        return `Enter ${def.name} [F]`;
      },
      onInteract: () => this.toggleEnter(data.id),
    });
  }

  private toggleEnter(id: string): void {
    if (gameState.activeVehicleId === id) {
      this.exitVehicle();
    } else if (!gameState.activeVehicleId) {
      this.enterVehicle(id);
    }
  }

  private enterVehicle(id: string): void {
    const inst = this.vehicles.get(id);
    if (!inst) return;
    gameState.activeVehicleId = id;
    this.player.controlsLocked = true;
    this.pilotYaw = inst.mesh.rotation.y;
    this.pilotPitch = 0;
    this.velocity.set(0, 0, 0);
    bus.emit('notify', { text: `Piloting ${VEHICLE_TYPES[inst.data.vehicleType].name}`, kind: 'info' });
  }

  private exitVehicle(): void {
    const inst = this.activeInstance();
    if (inst) {
      const exitPos = inst.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 2));
      this.player.teleport(exitPos);
      gameState.position = [exitPos.x, exitPos.y, exitPos.z];
    }
    gameState.activeVehicleId = null;
    this.player.controlsLocked = false;
  }

  private activeInstance(): VehicleInstance | null {
    if (!gameState.activeVehicleId) return null;
    return this.vehicles.get(gameState.activeVehicleId) ?? null;
  }

  private isDockedNearMoonpool(pos: THREE.Vector3): boolean {
    return gameState.basePieces.some(
      (p) => p.partType === 'base_moonpool' && pos.distanceTo(new THREE.Vector3(...p.position)) < MOONPOOL_DOCK_RANGE,
    );
  }

  private update(dt: number): void {
    const inst = this.activeInstance();
    if (!inst) return;
    const def = VEHICLE_TYPES[inst.data.vehicleType];

    const { dx, dy } = this.input.consumeMouseDelta();
    this.pilotYaw -= dx * 0.0022;
    this.pilotPitch = THREE.MathUtils.clamp(this.pilotPitch - dy * 0.0022, -1.2, 1.2);

    const euler = new THREE.Euler(this.pilotPitch, this.pilotYaw, 0, 'YXZ');
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(euler);
    const right = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, this.pilotYaw, 0));
    const up = new THREE.Vector3(0, 1, 0);

    const docked = this.isDockedNearMoonpool(inst.mesh.position);
    const thrust = new THREE.Vector3();
    const hasPower = inst.data.power > 0;
    if (hasPower) {
      if (this.input.isDown('KeyW')) thrust.add(forward);
      if (this.input.isDown('KeyS')) thrust.sub(forward);
      if (this.input.isDown('KeyD')) thrust.add(right);
      if (this.input.isDown('KeyA')) thrust.sub(right);
      if (this.input.isDown('Space')) thrust.add(up);
      if (this.input.isDown('ControlLeft')) thrust.sub(up);
    }

    if (thrust.lengthSq() > 0) {
      thrust.normalize().multiplyScalar(def.speed);
      inst.data.power = Math.max(0, inst.data.power - def.powerDrainPerSec * dt);
    }
    this.velocity.lerp(thrust, Math.min(1, dt * 3));

    const nextPos = inst.mesh.position.clone().addScaledVector(this.velocity, dt);
    const floorY = this.world.terrain.heightAt(nextPos.x, nextPos.z) + 1.2;
    if (nextPos.y < floorY) nextPos.y = floorY;
    if (nextPos.y > 2) nextPos.y = 2;
    inst.mesh.position.copy(nextPos);
    inst.mesh.rotation.y = this.pilotYaw;
    inst.data.position = [nextPos.x, nextPos.y, nextPos.z];
    inst.data.rotationY = this.pilotYaw;

    const depth = Math.max(0, -nextPos.y);
    if (depth > def.depthRating) {
      inst.data.health = Math.max(0, inst.data.health - dt * 10);
      if (Math.random() < dt * 2) audio.hurt();
    }

    if (docked) {
      inst.data.power = Math.min(def.maxPower, inst.data.power + dt * 20);
      inst.data.health = Math.min(def.maxHealth, inst.data.health + dt * 15);
    }

    this.engine.camera.position.copy(nextPos).add(new THREE.Vector3(0, 0.6, 0));
    this.engine.camera.quaternion.setFromEuler(euler);
    gameState.position = [nextPos.x, nextPos.y + 0.6, nextPos.z];
    gameState.rotationY = this.pilotYaw;
    // Player.position is frozen while controlsLocked, but InteractionSystem
    // still keys off it for "exit vehicle" proximity - keep it in sync.
    this.player.position.set(nextPos.x, nextPos.y + 0.6, nextPos.z);
    this.player.yaw = this.pilotYaw;

    if (inst.data.health <= 0) {
      bus.emit('notify', { text: `${def.name} destroyed!`, kind: 'warning' });
      this.exitVehicle();
      this.engine.scene.remove(inst.mesh);
      this.vehicles.delete(inst.data.id);
      this.interactions.unregister(inst.data.id);
      gameState.vehicles = gameState.vehicles.filter((v) => v.id !== inst.data.id);
    }
  }
}
