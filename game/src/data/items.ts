import type { ItemDef } from './types';

export const ITEMS: Record<string, ItemDef> = {
  // Raw resources
  quartz: { id: 'quartz', name: 'Quartz', description: 'Common crystalline mineral, conducts power.', stackSize: 10, category: 'raw', gridW: 1, gridH: 1 },
  copper_ore: { id: 'copper_ore', name: 'Copper Ore', description: 'Refines into copper wiring.', stackSize: 10, category: 'raw', gridW: 1, gridH: 1 },
  titanium: { id: 'titanium', name: 'Titanium', description: 'Salvaged structural metal. Base-building staple.', stackSize: 10, category: 'raw', gridW: 1, gridH: 1 },
  lithium: { id: 'lithium', name: 'Lithium', description: 'Deep mineral used in high-capacity batteries.', stackSize: 10, category: 'raw', gridW: 1, gridH: 1 },
  silver_ore: { id: 'silver_ore', name: 'Silver Ore', description: 'Used in advanced electronics.', stackSize: 10, category: 'raw', gridW: 1, gridH: 1 },
  diamond: { id: 'diamond', name: 'Diamond', description: 'Extremely hard crystal, found only at great depth.', stackSize: 10, category: 'raw', gridW: 1, gridH: 1 },
  kyanite: { id: 'kyanite', name: 'Kyanite', description: 'Heat-resistant mineral found near thermal vents.', stackSize: 10, category: 'raw', gridW: 1, gridH: 1 },
  uraninite: { id: 'uraninite', name: 'Uraninite', description: 'Radioactive ore. Handle with a radiation suit.', stackSize: 10, category: 'raw', gridW: 1, gridH: 1 },

  // Refined materials
  titanium_ingot: { id: 'titanium_ingot', name: 'Titanium Ingot', description: 'Refined titanium for structural parts.', stackSize: 10, category: 'material', gridW: 1, gridH: 1 },
  copper_wire: { id: 'copper_wire', name: 'Copper Wire', description: 'Basic electrical wiring.', stackSize: 10, category: 'material', gridW: 1, gridH: 1 },
  glass: { id: 'glass', name: 'Glass', description: 'Made from quartz, used for windows and tanks.', stackSize: 10, category: 'material', gridW: 1, gridH: 1 },
  silicone_rubber: { id: 'silicone_rubber', name: 'Silicone Rubber', description: 'Flexible waterproof polymer.', stackSize: 10, category: 'material', gridW: 1, gridH: 1 },
  enameled_glass: { id: 'enameled_glass', name: 'Enameled Glass', description: 'Reinforced glass for deep pressure hulls.', stackSize: 10, category: 'material', gridW: 1, gridH: 1 },
  advanced_wiring: { id: 'advanced_wiring', name: 'Advanced Wiring Kit', description: 'High-grade electronics.', stackSize: 10, category: 'material', gridW: 1, gridH: 1 },
  lead: { id: 'lead', name: 'Lead', description: 'Dense shielding metal, refined from local ore.', stackSize: 10, category: 'material', gridW: 1, gridH: 1 },

  // Flora / fauna harvest
  kelp_sample: { id: 'kelp_sample', name: 'Kelp Sample', description: 'Edible seaweed.', stackSize: 10, category: 'food', edible: { food: 10, water: -2 }, gridW: 1, gridH: 1 },
  bulbo_tree_seed: { id: 'bulbo_tree_seed', name: 'Bulbo Tree Seed', description: 'Farmable, filling when cooked.', stackSize: 10, category: 'food', edible: { food: 25, water: 2 }, gridW: 1, gridH: 1 },
  fish_raw: { id: 'fish_raw', name: 'Raw Peeper Fillet', description: 'Fresh fish. Spoils - eat soon or cook it.', stackSize: 5, category: 'food', edible: { food: 20, water: -5 }, gridW: 1, gridH: 1 },
  fish_cooked: { id: 'fish_cooked', name: 'Cooked Peeper Fillet', description: 'Cooked fish, restores hunger without water loss.', stackSize: 5, category: 'food', edible: { food: 35, water: 0 }, gridW: 1, gridH: 1 },
  poison_berry: { id: 'poison_berry', name: 'Crimson Berry', description: 'Looks tasty. It is not.', stackSize: 10, category: 'food', edible: { food: 15, water: 0, poison: 30 }, gridW: 1, gridH: 1 },
  purified_water: { id: 'purified_water', name: 'Purified Water', description: 'Clean drinking water from a filtration unit.', stackSize: 5, category: 'water', edible: { food: 0, water: 40 }, gridW: 1, gridH: 1 },
  filtered_water_pouch: { id: 'filtered_water_pouch', name: 'Water Filtration Pouch', description: 'Crude salt-filtering pouch. Slow but works anywhere.', stackSize: 5, category: 'water', edible: { food: 0, water: 25 }, gridW: 1, gridH: 1 },

  // Salvage
  scrap_metal: { id: 'scrap_metal', name: 'Scrap Metal', description: 'Salvaged from wreckage.', stackSize: 10, category: 'raw', gridW: 1, gridH: 1 },
  data_fragment: { id: 'data_fragment', name: 'Data Fragment', description: 'Corrupted database chip. May unlock a blueprint when scanned.', stackSize: 5, category: 'blueprint-fragment', gridW: 1, gridH: 1 },

  // Tools & equipment
  knife: { id: 'knife', name: 'Survival Knife', description: 'Cuts flora and fights off small predators.', stackSize: 1, category: 'tool', gridW: 2, gridH: 1 },
  scanner: { id: 'scanner', name: 'Scanner', description: 'Scans wrecks and fragments to unlock blueprints.', stackSize: 1, category: 'tool', gridW: 2, gridH: 1 },
  laser_cutter: { id: 'laser_cutter', name: 'Laser Cutter', description: 'Cuts through sealed doors and dense ore.', stackSize: 1, category: 'tool', gridW: 2, gridH: 1 },
  propulsion_cannon: { id: 'propulsion_cannon', name: 'Propulsion Cannon', description: 'Grabs and launches objects and creatures.', stackSize: 1, category: 'tool', gridW: 2, gridH: 2 },
  air_tank_1: { id: 'air_tank_1', name: 'Standard Air Tank', description: '+45 seconds of oxygen capacity.', stackSize: 1, category: 'equipment', gridW: 1, gridH: 2 },
  air_tank_2: { id: 'air_tank_2', name: 'High Capacity Tank', description: '+90 seconds of oxygen capacity.', stackSize: 1, category: 'equipment', gridW: 1, gridH: 2 },
  fins_1: { id: 'fins_1', name: 'Swim Fins', description: 'Increases swim speed.', stackSize: 1, category: 'equipment', gridW: 1, gridH: 1 },
  radiation_suit: { id: 'radiation_suit', name: 'Radiation Suit', description: 'Protects against radiation zones.', stackSize: 1, category: 'equipment', gridW: 2, gridH: 1 },
  thermal_suit: { id: 'thermal_suit', name: 'Thermal Suit', description: 'Protects against extreme heat/cold.', stackSize: 1, category: 'equipment', gridW: 2, gridH: 1 },
  first_aid_kit: { id: 'first_aid_kit', name: 'First Aid Kit', description: 'Restores health instantly.', stackSize: 3, category: 'food', edible: { food: 0, water: 0 }, gridW: 1, gridH: 1 },

  // Base parts
  base_corridor: { id: 'base_corridor', name: 'Corridor', description: 'Base building: connective corridor segment.', stackSize: 5, category: 'base-part', gridW: 1, gridH: 1 },
  base_room: { id: 'base_room', name: 'Multipurpose Room', description: 'Base building: large room module.', stackSize: 5, category: 'base-part', gridW: 1, gridH: 1 },
  base_hatch: { id: 'base_hatch', name: 'Hatch', description: 'Base building: entry/exit hatch.', stackSize: 5, category: 'base-part', gridW: 1, gridH: 1 },
  base_window: { id: 'base_window', name: 'Observation Window', description: 'Base building: reinforced viewport.', stackSize: 5, category: 'base-part', gridW: 1, gridH: 1 },
  base_solar: { id: 'base_solar', name: 'Solar Panel', description: 'Generates power near the surface in daylight.', stackSize: 3, category: 'base-part', gridW: 1, gridH: 1 },
  base_thermal: { id: 'base_thermal', name: 'Thermal Plant', description: 'Generates power near thermal vents.', stackSize: 3, category: 'base-part', gridW: 1, gridH: 1 },
  base_bioreactor: { id: 'base_bioreactor', name: 'Bioreactor', description: 'Burns organic matter for power.', stackSize: 3, category: 'base-part', gridW: 1, gridH: 1 },
  base_nuclear: { id: 'base_nuclear', name: 'Nuclear Reactor', description: 'Massive power output from uraninite rods.', stackSize: 1, category: 'base-part', gridW: 1, gridH: 1 },
  base_fabricator: { id: 'base_fabricator', name: 'Fabricator', description: 'Base building: crafting station.', stackSize: 3, category: 'base-part', gridW: 1, gridH: 1 },
  base_storage: { id: 'base_storage', name: 'Storage Locker', description: 'Base building: extra inventory space.', stackSize: 5, category: 'base-part', gridW: 1, gridH: 1 },
  base_growbed: { id: 'base_growbed', name: 'Grow Bed', description: 'Base building: farm plants for food.', stackSize: 3, category: 'base-part', gridW: 1, gridH: 1 },
  base_moonpool: { id: 'base_moonpool', name: 'Moonpool', description: 'Base building: docks and recharges vehicles.', stackSize: 1, category: 'base-part', gridW: 1, gridH: 1 },
  base_filtration: { id: 'base_filtration', name: 'Water Filtration Machine', description: 'Base building: produces purified water passively.', stackSize: 2, category: 'base-part', gridW: 1, gridH: 1 },

  // Vehicles (crafted at moonpool/fabricator, not inventory items but tracked as unlocks)
  vehicle_seaglide: { id: 'vehicle_seaglide', name: 'Seaglide', description: 'Handheld propulsion device.', stackSize: 1, category: 'tool', gridW: 1, gridH: 2 },
  vehicle_scout: { id: 'vehicle_scout', name: 'Scout Sub', description: 'Small submersible, moderate depth rating.', stackSize: 1, category: 'misc', gridW: 1, gridH: 1 },
  vehicle_cyclops: { id: 'vehicle_cyclops', name: 'Abyss-Class Submarine', description: 'Large submersible with a high depth rating and internal bay.', stackSize: 1, category: 'misc', gridW: 1, gridH: 1 },

  // Story-critical
  cure_serum: { id: 'cure_serum', name: 'Neutralization Serum', description: 'A synthesized cure for the infection. This is the way home.', stackSize: 1, category: 'misc', gridW: 1, gridH: 1 },
};
