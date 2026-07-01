import type { RecipeDef } from './types';

export const RECIPES: RecipeDef[] = [
  // Tier 1 - known from start / basic survival
  { id: 'r_knife', name: 'Survival Knife', result: 'knife', resultQty: 1, ingredients: [{ id: 'titanium', qty: 1 }, { id: 'silicone_rubber', qty: 1 }], station: 'fabricator', tier: 1 },
  { id: 'r_scanner', name: 'Scanner', result: 'scanner', resultQty: 1, ingredients: [{ id: 'titanium', qty: 1 }, { id: 'copper_wire', qty: 1 }], station: 'fabricator', tier: 1 },
  { id: 'r_titanium_ingot', name: 'Titanium Ingot', result: 'titanium_ingot', resultQty: 1, ingredients: [{ id: 'titanium', qty: 2 }], station: 'fabricator', tier: 1 },
  { id: 'r_copper_wire', name: 'Copper Wire', result: 'copper_wire', resultQty: 1, ingredients: [{ id: 'copper_ore', qty: 1 }], station: 'fabricator', tier: 1 },
  { id: 'r_glass', name: 'Glass', result: 'glass', resultQty: 1, ingredients: [{ id: 'quartz', qty: 2 }], station: 'fabricator', tier: 1 },
  { id: 'r_silicone', name: 'Silicone Rubber', result: 'silicone_rubber', resultQty: 1, ingredients: [{ id: 'kelp_sample', qty: 2 }], station: 'fabricator', tier: 1 },
  { id: 'r_water_pouch', name: 'Water Filtration Pouch', result: 'filtered_water_pouch', resultQty: 1, ingredients: [{ id: 'kelp_sample', qty: 1 }, { id: 'silicone_rubber', qty: 1 }], station: 'fabricator', tier: 1 },
  { id: 'r_fish_cooked', name: 'Cook Fish', result: 'fish_cooked', resultQty: 1, ingredients: [{ id: 'fish_raw', qty: 1 }], station: 'fabricator', tier: 1 },
  { id: 'r_first_aid', name: 'First Aid Kit', result: 'first_aid_kit', resultQty: 1, ingredients: [{ id: 'kelp_sample', qty: 1 }, { id: 'titanium', qty: 1 }], station: 'fabricator', tier: 1 },
  { id: 'r_air_tank_1', name: 'Standard Air Tank', result: 'air_tank_1', resultQty: 1, ingredients: [{ id: 'titanium', qty: 2 }, { id: 'glass', qty: 1 }], station: 'fabricator', tier: 1 },
  { id: 'r_fins_1', name: 'Swim Fins', result: 'fins_1', resultQty: 1, ingredients: [{ id: 'silicone_rubber', qty: 2 }], station: 'fabricator', tier: 1 },

  // Base parts - tier 1
  { id: 'r_base_corridor', name: 'Corridor', result: 'base_corridor', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 2 }], station: 'fabricator', tier: 1 },
  { id: 'r_base_room', name: 'Multipurpose Room', result: 'base_room', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 4 }], station: 'fabricator', tier: 1 },
  { id: 'r_base_hatch', name: 'Hatch', result: 'base_hatch', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 1 }], station: 'fabricator', tier: 1 },
  { id: 'r_base_window', name: 'Observation Window', result: 'base_window', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 1 }, { id: 'glass', qty: 2 }], station: 'fabricator', tier: 1 },
  { id: 'r_base_solar', name: 'Solar Panel', result: 'base_solar', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 1 }, { id: 'copper_wire', qty: 2 }, { id: 'glass', qty: 1 }], station: 'fabricator', tier: 1 },
  { id: 'r_base_fabricator', name: 'Fabricator', result: 'base_fabricator', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 2 }, { id: 'copper_wire', qty: 2 }], station: 'fabricator', tier: 1 },
  { id: 'r_base_storage', name: 'Storage Locker', result: 'base_storage', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 2 }], station: 'fabricator', tier: 1 },
  { id: 'r_base_growbed', name: 'Grow Bed', result: 'base_growbed', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 1 }, { id: 'glass', qty: 1 }], station: 'fabricator', tier: 1 },
  { id: 'r_base_filtration', name: 'Water Filtration Machine', result: 'base_filtration', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 2 }, { id: 'copper_wire', qty: 1 }], station: 'fabricator', tier: 1 },

  // Tier 2 - unlocked by scanning wrecks/fragments
  { id: 'r_laser_cutter', name: 'Laser Cutter', result: 'laser_cutter', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 2 }, { id: 'advanced_wiring', qty: 1 }, { id: 'diamond', qty: 1 }], station: 'fabricator', tier: 2, unlockedBy: 'bp_laser_cutter' },
  { id: 'r_air_tank_2', name: 'High Capacity Tank', result: 'air_tank_2', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 2 }, { id: 'lithium', qty: 1 }, { id: 'glass', qty: 1 }], station: 'fabricator', tier: 2, unlockedBy: 'bp_air_tank_2' },
  { id: 'r_advanced_wiring', name: 'Advanced Wiring Kit', result: 'advanced_wiring', resultQty: 1, ingredients: [{ id: 'copper_wire', qty: 2 }, { id: 'silver_ore', qty: 1 }], station: 'fabricator', tier: 2, unlockedBy: 'bp_advanced_wiring' },
  { id: 'r_enameled_glass', name: 'Enameled Glass', result: 'enameled_glass', resultQty: 1, ingredients: [{ id: 'glass', qty: 2 }, { id: 'titanium_ingot', qty: 1 }], station: 'fabricator', tier: 2, unlockedBy: 'bp_enameled_glass' },
  { id: 'r_radiation_suit', name: 'Radiation Suit', result: 'radiation_suit', resultQty: 1, ingredients: [{ id: 'lead', qty: 2 }, { id: 'silicone_rubber', qty: 2 }], station: 'fabricator', tier: 2, unlockedBy: 'bp_radiation_suit' },
  { id: 'r_thermal_suit', name: 'Thermal Suit', result: 'thermal_suit', resultQty: 1, ingredients: [{ id: 'kyanite', qty: 2 }, { id: 'silicone_rubber', qty: 2 }], station: 'fabricator', tier: 2, unlockedBy: 'bp_thermal_suit' },
  { id: 'r_lead', name: 'Lead', result: 'lead', resultQty: 1, ingredients: [{ id: 'uraninite', qty: 1 }], station: 'fabricator', tier: 2, unlockedBy: 'bp_lead' },
  { id: 'r_base_thermal', name: 'Thermal Plant', result: 'base_thermal', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 2 }, { id: 'kyanite', qty: 2 }, { id: 'advanced_wiring', qty: 1 }], station: 'fabricator', tier: 2, unlockedBy: 'bp_thermal_plant' },
  { id: 'r_base_bioreactor', name: 'Bioreactor', result: 'base_bioreactor', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 2 }, { id: 'lead', qty: 1 }, { id: 'copper_wire', qty: 2 }], station: 'fabricator', tier: 2, unlockedBy: 'bp_bioreactor' },
  { id: 'r_base_moonpool', name: 'Moonpool', result: 'base_moonpool', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 4 }, { id: 'advanced_wiring', qty: 2 }, { id: 'enameled_glass', qty: 1 }], station: 'fabricator', tier: 2, unlockedBy: 'bp_moonpool' },
  { id: 'r_vehicle_seaglide', name: 'Seaglide', result: 'vehicle_seaglide', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 1 }, { id: 'copper_wire', qty: 2 }, { id: 'silicone_rubber', qty: 1 }], station: 'fabricator', tier: 2, unlockedBy: 'bp_seaglide' },
  { id: 'r_vehicle_scout', name: 'Scout Sub', result: 'vehicle_scout', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 4 }, { id: 'advanced_wiring', qty: 2 }, { id: 'enameled_glass', qty: 2 }], station: 'moonpool', tier: 2, unlockedBy: 'bp_moonpool' },

  // Tier 3 - deep tech
  { id: 'r_propulsion_cannon', name: 'Propulsion Cannon', result: 'propulsion_cannon', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 3 }, { id: 'advanced_wiring', qty: 2 }, { id: 'diamond', qty: 1 }], station: 'fabricator', tier: 3, unlockedBy: 'bp_propulsion_cannon' },
  { id: 'r_base_nuclear', name: 'Nuclear Reactor', result: 'base_nuclear', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 4 }, { id: 'lead', qty: 2 }, { id: 'uraninite', qty: 2 }, { id: 'advanced_wiring', qty: 2 }], station: 'fabricator', tier: 3, unlockedBy: 'bp_nuclear_reactor' },
  { id: 'r_vehicle_cyclops', name: 'Abyss-Class Submarine', result: 'vehicle_cyclops', resultQty: 1, ingredients: [{ id: 'titanium_ingot', qty: 6 }, { id: 'advanced_wiring', qty: 3 }, { id: 'enameled_glass', qty: 3 }, { id: 'diamond', qty: 2 }], station: 'moonpool', tier: 3, unlockedBy: 'bp_cyclops' },
  { id: 'r_cure_serum', name: 'Neutralization Serum', result: 'cure_serum', resultQty: 1, ingredients: [{ id: 'kyanite', qty: 2 }, { id: 'diamond', qty: 2 }, { id: 'advanced_wiring', qty: 1 }], station: 'fabricator', tier: 3, unlockedBy: 'bp_cure_serum' },
];

export function recipeById(id: string): RecipeDef | undefined {
  return RECIPES.find((r) => r.id === id);
}
