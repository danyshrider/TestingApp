export interface ItemStack {
  id: string;
  qty: number;
}

export interface ItemDef {
  id: string;
  name: string;
  description: string;
  stackSize: number;
  category: 'raw' | 'material' | 'food' | 'water' | 'tool' | 'equipment' | 'blueprint-fragment' | 'base-part' | 'misc';
  edible?: { food: number; water: number; poison?: number };
  gridW: number;
  gridH: number;
}

export interface RecipeDef {
  id: string;
  name: string;
  result: string;
  resultQty: number;
  ingredients: ItemStack[];
  station: 'inventory' | 'fabricator' | 'workbench' | 'moonpool';
  tier: 1 | 2 | 3;
  unlockedBy?: string; // blueprint id required, undefined = known from start
}

export interface BlueprintDef {
  id: string;
  name: string;
  scanTargetId: string; // scannable object id that grants this
  scanTimeSec: number;
  description: string;
}

export type BiomeId =
  | 'shallows'
  | 'kelp_forest'
  | 'reef'
  | 'grand_reef'
  | 'trench'
  | 'lava_zone';

export interface BiomeDef {
  id: BiomeId;
  name: string;
  minDepth: number;
  maxDepth: number;
  radiusRange: [number, number];
  floorColor: number;
  fogColor: number;
  fogDensity: number;
  ambientTemp: number;
  hazardRadiation: boolean;
  resourceTable: string[];
  floraTable: string[];
  faunaTable: string[];
  hasLeviathan: boolean;
}

export type CreatureBehaviorTag = 'passive' | 'edible' | 'predator' | 'leviathan';

export interface CreatureDef {
  id: string;
  name: string;
  behavior: CreatureBehaviorTag;
  speed: number;
  size: number;
  color: number;
  damage: number;
  detectionRadius: number;
  fleeRadius?: number;
  loot?: ItemStack[];
  health: number;
}

export interface LogEntry {
  id: string;
  title: string;
  body: string;
  triggerRadius: number;
  position: [number, number, number];
  discovered?: boolean;
}

export type Difficulty = 'survival' | 'freedom' | 'hardcore' | 'creative';
