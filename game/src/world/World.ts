import * as THREE from 'three';
import { Engine } from '../core/Engine';
import { Terrain } from './Terrain';
import { gameState } from '../core/GameState';
import { biomeAt } from '../data/biomes';
import { audio } from '../core/AudioManager';

const DAY_LENGTH_SECONDS = 480; // 8 minutes per full day/night cycle

export class World {
  terrain = new Terrain();
  sun: THREE.DirectionalLight;
  ambient: THREE.HemisphereLight;
  waterSurface: THREE.Mesh;
  fog: THREE.FogExp2;
  private particles: THREE.Points;
  private particlePositions: Float32Array;

  constructor(private engine: Engine) {
    engine.scene.add(this.terrain.mesh);

    this.sun = new THREE.DirectionalLight(0xffffff, 1.2);
    this.sun.position.set(100, 200, 50);
    engine.scene.add(this.sun);
    engine.scene.add(this.sun.target);

    this.ambient = new THREE.HemisphereLight(0x3a8fae, 0x0a1a20, 0.6);
    engine.scene.add(this.ambient);

    const waterGeo = new THREE.PlaneGeometry(3000, 3000, 1, 1);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e6b83,
      transparent: true,
      opacity: 0.55,
      roughness: 0.15,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    this.waterSurface = new THREE.Mesh(waterGeo, waterMat);
    this.waterSurface.position.y = 0;
    engine.scene.add(this.waterSurface);

    this.fog = new THREE.FogExp2(0x2e93a8, 0.008);
    engine.scene.fog = this.fog;
    engine.scene.background = new THREE.Color(0x2e93a8);

    // ambient floating particulate for underwater dust/plankton feel
    const count = 800;
    this.particlePositions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      this.particlePositions[i * 3] = (Math.random() - 0.5) * 200;
      this.particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      this.particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xbfe8ea, size: 0.15, transparent: true, opacity: 0.5 });
    this.particles = new THREE.Points(pGeo, pMat);
    engine.scene.add(this.particles);

    engine.addUpdater((dt) => this.update(dt));
  }

  private update(dt: number): void {
    gameState.timeOfDay = (gameState.timeOfDay + dt / DAY_LENGTH_SECONDS) % 1;
    const angle = gameState.timeOfDay * Math.PI * 2;
    const sunHeight = Math.sin(angle);
    this.sun.position.set(Math.cos(angle) * 200, Math.max(sunHeight, -0.2) * 200 + 20, 80);
    const dayFactor = THREE.MathUtils.clamp(sunHeight * 0.5 + 0.5, 0.05, 1);
    this.sun.intensity = 0.2 + dayFactor * 1.2;
    this.ambient.intensity = 0.15 + dayFactor * 0.55;

    const px = gameState.position[0];
    const py = gameState.position[1];
    const pz = gameState.position[2];
    const dist = Math.hypot(px, pz);
    const depth = Math.max(0, -py);
    const biome = biomeAt(dist, depth);

    const depthDarken = THREE.MathUtils.clamp(1 - depth / 500, 0.08, 1);
    const targetFogColor = new THREE.Color(biome.fogColor).multiplyScalar(0.3 + depthDarken * dayFactor * 0.9);
    this.fog.color.lerp(targetFogColor, Math.min(1, dt * 0.8));
    (this.engine.scene.background as THREE.Color).lerp(targetFogColor, Math.min(1, dt * 0.8));
    this.fog.density = THREE.MathUtils.lerp(this.fog.density, biome.fogDensity + (1 - depthDarken) * 0.02, Math.min(1, dt));

    audio.setAmbientDepthIntensity(1 - depthDarken);

    this.particles.position.set(px, py, pz);

    this.waterSurface.position.x = px;
    this.waterSurface.position.z = pz;
  }

  currentBiome() {
    const dist = Math.hypot(gameState.position[0], gameState.position[2]);
    const depth = Math.max(0, -gameState.position[1]);
    return biomeAt(dist, depth);
  }
}
