import * as THREE from 'three';

// Procedural low-poly creature bodies styled after Subnautica's fauna.
// All models are built nose-forward along +Z at roughly unit length and
// scaled by the creature's size; a `tail` child is registered in
// group.userData for the swim-wag animation. A touch of emissive keeps
// them readable through underwater fog instead of fading to silhouettes.

function mat(color: number, opts: { opacity?: number; emissiveScale?: number; roughness?: number } = {}): THREE.MeshStandardMaterial {
  const emissive = new THREE.Color(color).multiplyScalar(opts.emissiveScale ?? 0.12);
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.55,
    flatShading: true,
    transparent: opts.opacity !== undefined,
    opacity: opts.opacity ?? 1,
    emissive,
    emissiveIntensity: 1,
  });
}

function finTriangle(w: number, h: number, color: number, opacity?: number): THREE.Mesh {
  // A flattened cone reads as a fin/sail at low poly counts.
  const fin = new THREE.Mesh(new THREE.ConeGeometry(w, h, 4), mat(color, { opacity }));
  fin.scale.z = 0.18;
  return fin;
}

function eye(radius: number, irisColor: number): THREE.Group {
  const g = new THREE.Group();
  const iris = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 10, 10),
    new THREE.MeshStandardMaterial({ color: irisColor, emissive: irisColor, emissiveIntensity: 0.5, roughness: 0.3 }),
  );
  const pupil = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.45, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.2 }),
  );
  pupil.position.z = radius * 0.65;
  g.add(iris);
  g.add(pupil);
  return g;
}

function buildPeeper(): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 10), mat(0x243a66));
  body.scale.set(0.55, 0.7, 1);
  g.add(body);

  // The peeper is basically a swimming eyeball: huge orange iris on each side.
  for (const side of [-1, 1]) {
    const e = eye(0.24, 0xe8901e);
    e.position.set(side * 0.28, 0.05, 0.18);
    e.rotation.y = side * Math.PI / 2;
    g.add(e);
  }

  const tail = new THREE.Group();
  const tailFin = finTriangle(0.3, 0.55, 0x3a5a9a);
  tailFin.rotation.x = Math.PI / 2;
  tailFin.position.z = -0.25;
  tail.add(tailFin);
  tail.position.z = -0.45;
  g.add(tail);
  g.userData.tail = tail;

  const topFin = finTriangle(0.16, 0.4, 0x3a5a9a);
  topFin.position.set(0, 0.42, -0.05);
  topFin.rotation.z = -0.25;
  g.add(topFin);
  const botFin = finTriangle(0.12, 0.3, 0x3a5a9a);
  botFin.position.set(0, -0.38, -0.1);
  botFin.rotation.x = Math.PI;
  g.add(botFin);
  return g;
}

function buildBladderfish(): THREE.Group {
  const g = new THREE.Group();
  // Translucent bell membrane.
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), mat(0x9a8fc8, { opacity: 0.55, emissiveScale: 0.2 }));
  bell.scale.set(0.85, 0.6, 1);
  g.add(bell);

  // Central spine running nose to tail, mottled maroon.
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 1.25, 6), mat(0x8a4a5a));
  spine.rotation.x = Math.PI / 2;
  g.add(spine);

  // Single large eye on the nose tip.
  const e = eye(0.13, 0xdfe8f0);
  e.position.z = 0.68;
  g.add(e);

  const tail = new THREE.Group();
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.35, 6), mat(0x8a4a5a));
  tip.rotation.x = -Math.PI / 2;
  tail.add(tip);
  tail.position.z = -0.75;
  g.add(tail);
  g.userData.tail = tail;
  return g;
}

function buildStalker(): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.1, 4, 10), mat(0x9ab8ac));
  body.rotation.x = Math.PI / 2;
  g.add(body);

  // Long toothy snout.
  const snout = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.7, 6), mat(0x8aa89c));
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, -0.05, 0.95);
  g.add(snout);
  for (const side of [-1, 1]) {
    const e = eye(0.06, 0xd8c04a);
    e.position.set(side * 0.16, 0.14, 0.62);
    e.rotation.y = side * Math.PI / 3;
    g.add(e);
  }

  // Row of purple dorsal sails along the spine, like the reference.
  for (let i = 0; i < 4; i++) {
    const fin = finTriangle(0.14, 0.4 - i * 0.06, 0x5a3aa8);
    fin.position.set(0, 0.32, 0.35 - i * 0.35);
    fin.rotation.z = -0.15;
    g.add(fin);
  }
  // Front flippers.
  for (const side of [-1, 1]) {
    const flipper = finTriangle(0.12, 0.35, 0x5a3aa8);
    flipper.position.set(side * 0.32, -0.12, 0.35);
    flipper.rotation.z = side * (Math.PI / 2 + 0.4);
    g.add(flipper);
  }

  const tail = new THREE.Group();
  const tailFin = finTriangle(0.22, 0.5, 0x5a3aa8);
  tailFin.rotation.x = Math.PI / 2;
  tailFin.position.z = -0.3;
  tail.add(tailFin);
  tail.position.z = -0.85;
  g.add(tail);
  g.userData.tail = tail;
  return g;
}

function buildAmpeel(): THREE.Group {
  const g = new THREE.Group();
  // Segmented eel body with glowing rings.
  const segments = 5;
  for (let i = 0; i < segments; i++) {
    const r = 0.24 - i * 0.03;
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(r, r - 0.02, 0.42, 8), mat(0x2a3a55));
    seg.rotation.x = Math.PI / 2;
    seg.position.z = 0.6 - i * 0.42;
    g.add(seg);
    if (i > 0) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r + 0.015, 0.03, 6, 12),
        new THREE.MeshStandardMaterial({ color: 0x4ae8e8, emissive: 0x4ae8e8, emissiveIntensity: 0.9, roughness: 0.4 }),
      );
      ring.position.z = 0.6 - i * 0.42 + 0.21;
      g.add(ring);
    }
  }
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), mat(0x2a3a55));
  head.position.z = 0.85;
  head.scale.z = 1.2;
  g.add(head);
  for (const side of [-1, 1]) {
    const e = eye(0.05, 0x4ae8e8);
    e.position.set(side * 0.15, 0.1, 0.98);
    e.rotation.y = side * Math.PI / 3;
    g.add(e);
  }
  const tail = new THREE.Group();
  const tailFin = finTriangle(0.16, 0.4, 0x1e2a40);
  tailFin.rotation.x = Math.PI / 2;
  tailFin.position.z = -0.2;
  tail.add(tailFin);
  tail.position.z = -1.5;
  g.add(tail);
  g.userData.tail = tail;
  return g;
}

function buildGhostLeviathan(): THREE.Group {
  const g = new THREE.Group();
  const membrane = mat(0xbfe0ea, { opacity: 0.5, emissiveScale: 0.3, roughness: 0.3 });

  // Broad delta-wing head mantle.
  const mantle = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.6, 3), membrane);
  mantle.rotation.x = Math.PI / 2;
  mantle.rotation.z = Math.PI;
  mantle.scale.set(1.6, 1, 0.35);
  mantle.position.z = 0.4;
  g.add(mantle);

  // Glowing eye spots across the mantle top.
  const spotMat = new THREE.MeshStandardMaterial({ color: 0xf2e05a, emissive: 0xf2e05a, emissiveIntensity: 1.2, roughness: 0.3 });
  const spotPositions: [number, number, number][] = [
    [0, 0.18, 0.75], [0.35, 0.16, 0.55], [-0.35, 0.16, 0.55], [0.7, 0.13, 0.35], [-0.7, 0.13, 0.35],
  ];
  for (const [x, y, z] of spotPositions) {
    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), spotMat);
    spot.position.set(x, y, z);
    g.add(spot);
  }

  // Dark mouth under the mantle.
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), mat(0x2a3a4a, { opacity: 0.9 }));
  mouth.position.set(0, -0.18, 0.45);
  g.add(mouth);

  // Long translucent tapering tail.
  const tail = new THREE.Group();
  const tailBody = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.4, 8), membrane);
  tailBody.rotation.x = -Math.PI / 2;
  tailBody.position.z = -1.2;
  tail.add(tailBody);
  tail.position.z = -0.3;
  g.add(tail);
  g.userData.tail = tail;

  // Trailing tentacle wisps behind the mouth.
  for (let i = 0; i < 5; i++) {
    const wisp = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 1.1, 5), membrane);
    wisp.rotation.x = Math.PI / 2 + 0.3;
    wisp.position.set((i - 2) * 0.18, -0.35, -0.4);
    g.add(wisp);
  }
  return g;
}

function buildReaperLeviathan(): THREE.Group {
  const g = new THREE.Group();
  const bodyColor = 0x9ab8c8;
  const redColor = 0xa8402a;

  // Head with the tall red hood crest.
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), mat(bodyColor));
  head.scale.set(0.8, 0.9, 1.1);
  head.position.z = 0.9;
  g.add(head);
  const crest = finTriangle(0.5, 0.9, redColor);
  crest.position.set(0, 0.55, 0.85);
  crest.rotation.z = 0; // upright sail
  g.add(crest);

  for (const side of [-1, 1]) {
    const e = eye(0.07, 0x3a3a3a);
    e.position.set(side * 0.22, 0.2, 1.12);
    e.rotation.y = side * Math.PI / 4;
    g.add(e);
  }

  // Four dark mandible hooks curving out from the face.
  const mandibleMat = mat(0x3a3230, { roughness: 0.35 });
  const mandibleAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  for (const a of mandibleAngles) {
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 6, 8, Math.PI * 0.8), mandibleMat);
    hook.position.set(Math.cos(a) * 0.3, Math.sin(a) * 0.3, 1.2);
    hook.rotation.z = a + Math.PI / 2;
    hook.rotation.y = 0.5;
    g.add(hook);
  }

  // Long tapering body with red dorsal ridge fins.
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.2, 1.8, 10), mat(bodyColor));
  torso.rotation.x = Math.PI / 2;
  torso.position.z = -0.1;
  g.add(torso);
  for (let i = 0; i < 3; i++) {
    const ridge = finTriangle(0.14, 0.35, redColor);
    ridge.position.set(0, 0.42 - i * 0.04, -0.2 - i * 0.5);
    g.add(ridge);
  }

  const tail = new THREE.Group();
  const tailCone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.4, 8), mat(bodyColor));
  tailCone.rotation.x = -Math.PI / 2;
  tailCone.position.z = -0.7;
  tail.add(tailCone);
  const fluke = finTriangle(0.3, 0.6, redColor);
  fluke.rotation.x = Math.PI / 2;
  fluke.position.z = -1.4;
  tail.add(fluke);
  tail.position.z = -1;
  g.add(tail);
  g.userData.tail = tail;
  return g;
}

const BUILDERS: Record<string, () => THREE.Group> = {
  peeper: buildPeeper,
  bladderfish: buildBladderfish,
  stalker: buildStalker,
  ampeel: buildAmpeel,
  ghost_leviathan: buildGhostLeviathan,
  reaper_leviathan: buildReaperLeviathan,
};

export function buildCreatureMesh(creatureId: string, size: number, fallbackColor: number): THREE.Group {
  const builder = BUILDERS[creatureId];
  const group = builder
    ? builder()
    : (() => {
        const fallback = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.8, 4, 8), mat(fallbackColor));
        body.rotation.x = Math.PI / 2;
        fallback.add(body);
        return fallback;
      })();
  group.scale.setScalar(size);
  return group;
}
