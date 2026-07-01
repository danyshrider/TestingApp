import * as THREE from 'three';
import { Noise2D } from '../core/Noise';
import { biomeAt } from '../data/biomes';

const WORLD_RADIUS = 760;
const SEGMENTS = 220;

export interface TerrainSample {
  height: number;
  biomeId: string;
}

export class Terrain {
  mesh: THREE.Mesh;
  private noise = new Noise2D(1337);
  private detailNoise = new Noise2D(77);

  constructor() {
    const geo = new THREE.PlaneGeometry(WORLD_RADIUS * 2, WORLD_RADIUS * 2, SEGMENTS, SEGMENTS);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const sample = this.sampleHeight(x, z);
      pos.setY(i, sample.height);
      const biome = biomeAt(Math.hypot(x, z), -sample.height);
      color.setHex(biome.floorColor);
      // subtle shading variance
      const shade = 0.85 + this.detailNoise.value(x * 0.05, z * 0.05) * 0.3;
      color.multiplyScalar(shade);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.receiveShadow = false;
  }

  // Height falls off with radial distance from spawn, producing a basin that
  // deepens outward (verticality-as-difficulty). Detail noise adds texture.
  sampleHeight(x: number, z: number): TerrainSample {
    const r = Math.hypot(x, z);
    const basinDepth = 6 + Math.pow(r / WORLD_RADIUS, 1.6) * 480;
    // Detail amplitude scales with basin depth so shallow spawn waters stay
    // gently rolling while deep trenches get dramatic relief - and, critically,
    // the seafloor can never poke above sea level near the surface.
    const detailAmplitude = Math.min(18, basinDepth * 0.35);
    const raw = this.noise.fbm(x * 0.01, z * 0.01, 5); // ~[0,1]
    const detail = (raw - 0.5) * 2 * detailAmplitude;
    const height = Math.min(-basinDepth + detail, -1.5);
    const biome = biomeAt(r, -height);
    return { height, biomeId: biome.id };
  }

  heightAt(x: number, z: number): number {
    return this.sampleHeight(x, z).height;
  }
}
