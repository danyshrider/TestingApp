import * as THREE from 'three';

// Procedural ore node meshes styled after Subnautica's designs:
//   quartz   - cluster of pale, translucent crystal shards
//   copper   - tall orange crystal spikes with teal oxidation at the base
//   titanium - ball of dark blue-green nodules
//   lithium  - rounded grey boulder streaked white
//   silver   - chunky faceted pale blue-grey nugget
//   diamond  - sharp icy-cyan crystal pair
//   kyanite  - deep blue blade crystals
//   uraninite- lumpy green mass with a radioactive glow

function crystal(
  height: number,
  radius: number,
  color: number,
  opts: { opacity?: number; emissive?: number; emissiveIntensity?: number } = {},
): THREE.Mesh {
  // Tapered hexagonal column with a pointed tip, like a natural crystal.
  const geo = new THREE.CylinderGeometry(radius * 0.25, radius, height, 6);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.25,
    metalness: 0.05,
    flatShading: true,
    transparent: opts.opacity !== undefined,
    opacity: opts.opacity ?? 1,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = height / 2;
  return mesh;
}

function crystalCluster(
  rng: () => number,
  count: number,
  baseHeight: number,
  color: number,
  opts: { opacity?: number; emissive?: number; emissiveIntensity?: number; baseColor?: number } = {},
): THREE.Group {
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const h = baseHeight * (0.45 + rng() * 0.9);
    const c = crystal(h, 0.16 + rng() * 0.12, color, opts);
    const holder = new THREE.Group();
    holder.add(c);
    holder.position.set((rng() - 0.5) * 0.7, 0, (rng() - 0.5) * 0.7);
    holder.rotation.set((rng() - 0.5) * 0.7, rng() * Math.PI * 2, (rng() - 0.5) * 0.7);
    group.add(holder);
  }
  if (opts.baseColor !== undefined) {
    const base = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.45, 0),
      new THREE.MeshStandardMaterial({ color: opts.baseColor, roughness: 0.9, flatShading: true }),
    );
    base.scale.y = 0.5;
    group.add(base);
  }
  return group;
}

function lumpCluster(
  rng: () => number,
  count: number,
  color: number,
  altColor: number,
  opts: { emissive?: number; emissiveIntensity?: number } = {},
): THREE.Group {
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const r = 0.18 + rng() * 0.2;
    const mat = new THREE.MeshStandardMaterial({
      color: rng() > 0.5 ? color : altColor,
      roughness: 0.55,
      flatShading: true,
      emissive: opts.emissive ?? 0x000000,
      emissiveIntensity: opts.emissiveIntensity ?? 0,
    });
    const lump = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), mat);
    const theta = rng() * Math.PI * 2;
    const phi = rng() * Math.PI;
    const dist = 0.3 + rng() * 0.15;
    lump.position.set(
      Math.sin(phi) * Math.cos(theta) * dist,
      Math.abs(Math.cos(phi)) * dist + 0.15,
      Math.sin(phi) * Math.sin(theta) * dist,
    );
    lump.rotation.set(rng() * Math.PI, rng() * Math.PI, 0);
    group.add(lump);
  }
  return group;
}

export function buildOreMesh(itemId: string, rng: () => number): THREE.Group {
  switch (itemId) {
    case 'quartz':
      return crystalCluster(rng, 5, 1.1, 0xf2ecf6, { opacity: 0.9, emissive: 0xc8bfd4, emissiveIntensity: 0.25 });
    case 'copper_ore':
      return crystalCluster(rng, 4, 1.2, 0xc86f38, { baseColor: 0x3f8a7a });
    case 'titanium':
      return lumpCluster(rng, 9, 0x2e5a70, 0x3a7a66);
    case 'lithium': {
      const group = new THREE.Group();
      const boulder = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.55, 1),
        new THREE.MeshStandardMaterial({ color: 0xb8bcc0, roughness: 0.8, flatShading: true }),
      );
      boulder.position.y = 0.4;
      boulder.scale.set(1, 0.85, 0.9);
      group.add(boulder);
      const streak = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.32, 0),
        new THREE.MeshStandardMaterial({ color: 0xf0f2f4, roughness: 0.5, flatShading: true }),
      );
      streak.position.set(0.2, 0.6, 0.1);
      group.add(streak);
      return group;
    }
    case 'silver_ore': {
      const group = new THREE.Group();
      const nugget = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.5, 0),
        new THREE.MeshStandardMaterial({ color: 0x9fc0d8, roughness: 0.35, metalness: 0.6, flatShading: true }),
      );
      nugget.position.y = 0.45;
      nugget.scale.set(0.9, 1.15, 0.85);
      nugget.rotation.set(rng() * Math.PI, rng() * Math.PI, 0);
      group.add(nugget);
      return group;
    }
    case 'diamond':
      return crystalCluster(rng, 3, 0.8, 0xbef2f6, { opacity: 0.8, emissive: 0x9fe8ee, emissiveIntensity: 0.15 });
    case 'kyanite':
      return crystalCluster(rng, 4, 1.3, 0x2a4fd0, { emissive: 0x1a2f90, emissiveIntensity: 0.2 });
    case 'uraninite':
      return lumpCluster(rng, 7, 0x5a8a2a, 0x7ab83a, { emissive: 0x8de05a, emissiveIntensity: 0.35 });
    default: {
      const group = new THREE.Group();
      const rock = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.6, 0),
        new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.7, flatShading: true }),
      );
      rock.position.y = 0.4;
      group.add(rock);
      return group;
    }
  }
}

// Flat swatch colors for the inventory UI, matched to the mesh designs.
export const ORE_SWATCH_COLORS: Record<string, string> = {
  quartz: '#e9e2ee',
  copper_ore: '#c86f38',
  titanium: '#2e5a70',
  lithium: '#b8bcc0',
  silver_ore: '#9fc0d8',
  diamond: '#bef2f6',
  kyanite: '#2a4fd0',
  uraninite: '#7ab83a',
  scrap_metal: '#7a8890',
};
