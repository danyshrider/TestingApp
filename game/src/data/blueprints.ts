import type { BlueprintDef } from './types';

// Blueprints unlock recipes when their corresponding scan target is fully
// scanned. This replaces XP levels as the progression driver, per design.
export const BLUEPRINTS: BlueprintDef[] = [
  { id: 'bp_advanced_wiring', name: 'Advanced Wiring Kit', scanTargetId: 'wreck_shallows_1', scanTimeSec: 4, description: 'Recovered from a crashed escape pod fragment.' },
  { id: 'bp_air_tank_2', name: 'High Capacity Tank', scanTargetId: 'wreck_shallows_2', scanTimeSec: 4, description: 'Diving equipment schematics.' },
  { id: 'bp_enameled_glass', name: 'Enameled Glass', scanTargetId: 'wreck_kelp_1', scanTimeSec: 5, description: 'Pressure-hull glass composite formula.' },
  { id: 'bp_lead', name: 'Lead Refining', scanTargetId: 'fragment_reef_1', scanTimeSec: 5, description: 'Ore refinement process fragment.' },
  { id: 'bp_radiation_suit', name: 'Radiation Suit', scanTargetId: 'wreck_reef_1', scanTimeSec: 6, description: 'Hazard gear from a quarantined research module.' },
  { id: 'bp_thermal_suit', name: 'Thermal Suit', scanTargetId: 'fragment_grand_reef_1', scanTimeSec: 6, description: 'Insulated dive suit schematic.' },
  { id: 'bp_thermal_plant', name: 'Thermal Plant', scanTargetId: 'wreck_grand_reef_1', scanTimeSec: 6, description: 'Geothermal power generator design.' },
  { id: 'bp_bioreactor', name: 'Bioreactor', scanTargetId: 'fragment_kelp_1', scanTimeSec: 5, description: 'Organic matter power converter.' },
  { id: 'bp_seaglide', name: 'Seaglide', scanTargetId: 'wreck_kelp_2', scanTimeSec: 5, description: 'Personal propulsion device.' },
  { id: 'bp_moonpool', name: 'Moonpool', scanTargetId: 'wreck_grand_reef_2', scanTimeSec: 7, description: 'Vehicle bay construction plans.' },
  { id: 'bp_laser_cutter', name: 'Laser Cutter', scanTargetId: 'wreck_trench_1', scanTimeSec: 7, description: 'High-power cutting tool schematic.' },
  { id: 'bp_propulsion_cannon', name: 'Propulsion Cannon', scanTargetId: 'wreck_trench_2', scanTimeSec: 8, description: 'Object manipulation tool design.' },
  { id: 'bp_nuclear_reactor', name: 'Nuclear Reactor', scanTargetId: 'wreck_lava_1', scanTimeSec: 9, description: 'High-yield reactor core schematic.' },
  { id: 'bp_cyclops', name: 'Abyss-Class Submarine', scanTargetId: 'fragment_trench_1', scanTimeSec: 8, description: 'Large submersible hull design recovered from deep salvage.' },
  { id: 'bp_cure_serum', name: 'Neutralization Serum', scanTargetId: 'wreck_lava_2', scanTimeSec: 10, description: 'The final research log: a cure synthesis formula.' },
];

export function blueprintByScanTarget(scanTargetId: string): BlueprintDef | undefined {
  return BLUEPRINTS.find((b) => b.scanTargetId === scanTargetId);
}
