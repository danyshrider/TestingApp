import type { BiomeDef } from './types';

// Biomes are arranged as concentric rings around the life-pod spawn point.
// Distance from center increases danger & depth, matching Subnautica's
// "verticality/distance as difficulty axis" design.
export const BIOMES: BiomeDef[] = [
  {
    id: 'shallows',
    name: 'Safe Shallows',
    minDepth: 0,
    maxDepth: 40,
    radiusRange: [0, 120],
    floorColor: 0xd8c98a,
    fogColor: 0x2e93a8,
    fogDensity: 0.008,
    ambientTemp: 22,
    hazardRadiation: false,
    resourceTable: ['quartz', 'copper_ore', 'titanium'],
    floraTable: ['kelp_sample', 'bulbo_tree_seed'],
    faunaTable: ['peeper', 'bladderfish'],
    hasLeviathan: false,
  },
  {
    id: 'kelp_forest',
    name: 'Kelp Forest',
    minDepth: 20,
    maxDepth: 90,
    radiusRange: [100, 240],
    floorColor: 0x8a9a4a,
    fogColor: 0x1f7a8c,
    fogDensity: 0.014,
    ambientTemp: 18,
    hazardRadiation: false,
    resourceTable: ['copper_ore', 'titanium', 'silver_ore'],
    floraTable: ['kelp_sample'],
    faunaTable: ['peeper', 'stalker'],
    hasLeviathan: false,
  },
  {
    id: 'reef',
    name: 'Coral Reef',
    minDepth: 40,
    maxDepth: 140,
    radiusRange: [220, 360],
    floorColor: 0xd97a5a,
    fogColor: 0x156b82,
    fogDensity: 0.018,
    ambientTemp: 15,
    hazardRadiation: false,
    resourceTable: ['silver_ore', 'lithium', 'titanium'],
    floraTable: ['kelp_sample', 'poison_berry'],
    faunaTable: ['stalker', 'bladderfish'],
    hasLeviathan: false,
  },
  {
    id: 'grand_reef',
    name: 'Grand Reef',
    minDepth: 100,
    maxDepth: 260,
    radiusRange: [340, 480],
    floorColor: 0x5a4a78,
    fogColor: 0x0c3f57,
    fogDensity: 0.026,
    ambientTemp: 8,
    hazardRadiation: false,
    resourceTable: ['lithium', 'diamond', 'silver_ore'],
    floraTable: ['poison_berry'],
    faunaTable: ['stalker', 'ampeel', 'reaper_leviathan'],
    hasLeviathan: true,
  },
  {
    id: 'trench',
    name: 'Abyssal Trench',
    minDepth: 220,
    maxDepth: 400,
    radiusRange: [460, 600],
    floorColor: 0x241830,
    fogColor: 0x040c1a,
    fogDensity: 0.038,
    ambientTemp: 4,
    hazardRadiation: true,
    resourceTable: ['diamond', 'kyanite', 'uraninite'],
    floraTable: [],
    faunaTable: ['ampeel', 'ghost_leviathan'],
    hasLeviathan: true,
  },
  {
    id: 'lava_zone',
    name: 'Lava Zone',
    minDepth: 350,
    maxDepth: 500,
    radiusRange: [580, 700],
    floorColor: 0x7a1a0a,
    fogColor: 0x2a0603,
    fogDensity: 0.05,
    ambientTemp: 45,
    hazardRadiation: false,
    resourceTable: ['kyanite', 'uraninite', 'diamond'],
    floraTable: [],
    faunaTable: ['ghost_leviathan'],
    hasLeviathan: true,
  },
];

export function biomeAt(distFromCenter: number, depth: number): BiomeDef {
  const candidates = BIOMES.filter(
    (b) => distFromCenter >= b.radiusRange[0] && distFromCenter < b.radiusRange[1],
  );
  if (candidates.length === 0) {
    return distFromCenter < BIOMES[0].radiusRange[1] ? BIOMES[0] : BIOMES[BIOMES.length - 1];
  }
  if (candidates.length === 1) return candidates[0];
  // pick the one whose depth range best matches
  let best = candidates[0];
  let bestScore = Infinity;
  for (const c of candidates) {
    const mid = (c.minDepth + c.maxDepth) / 2;
    const score = Math.abs(mid - depth);
    if (score < bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}
