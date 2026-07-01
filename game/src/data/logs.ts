import type { LogEntry } from './types';

// Environmental storytelling: logs are placed at wreck/POI coordinates and
// trigger by proximity, not by clicking a quest marker. Radio signals (see
// RadioSignal defs below) are the only "guidance" toward them, mirroring
// Subnautica's no-map, spatial-memory design.
export const LOGS: LogEntry[] = [
  {
    id: 'log_intro',
    title: "Captain's Log - Impact",
    body: "The Meridian is gone. Hull breach in three sections before I even reached the escape pod. I'm alive, adrift above what looks like an uncharted ocean world. My arm - there's a mark where the containment breach sprayed me. I don't feel sick yet. I need to find the others, if there were any others.",
    triggerRadius: 30,
    position: [0, -2, 0],
  },
  {
    id: 'log_shallows_1',
    title: 'Crew Log - Dr. Amara Voss',
    body: "Day 2. Whatever that spore cloud was, it's in my bloodstream. Slow-acting. I've isolated a compound in the local quartz-adjacent bacteria that seems to slow the progression. Not a cure. I'm heading deeper to the reef systems - there was a research relay down there before the crash, might still be broadcasting.",
    triggerRadius: 25,
    position: [70, -15, 40],
  },
  {
    id: 'log_kelp_1',
    title: 'Salvage Note',
    body: 'Whoever finds this: the kelp forest bioluminescence isn\'t natural. Same pattern as the containment cloud. I think this whole ecosystem has been exposed for generations. If the wildlife survives it, maybe the answer is biological, not chemical.',
    triggerRadius: 25,
    position: [-140, -45, 90],
  },
  {
    id: 'log_reef_1',
    title: 'Crew Log - Dr. Amara Voss',
    body: "Day 6. Found the relay. Dead for years, not from the crash - from something else, deliberately. Someone didn't want this signal getting out. There's a research module further down in the Grand Reef with cold storage. If I had samples of deep fauna blood, kyanite-resistant proteins... it might work.",
    triggerRadius: 25,
    position: [180, -80, -160],
  },
  {
    id: 'log_grand_reef_1',
    title: 'Quarantine Directive 7-A',
    body: '[AUTOMATED] This module is sealed under Directive 7-A. Kharon-strain samples inside are not to be removed without Level 4 clearance. Thermal and radiation protective equipment mandatory beyond this point. The strain reacts violently to synthesized kyanite compounds in early lab trials.',
    triggerRadius: 30,
    position: [-260, -170, -220],
  },
  {
    id: 'log_grand_reef_2',
    title: 'Crew Log - Dr. Amara Voss',
    body: "Day 11. I synthesized a partial neutralizer. It didn't work on me - too far progressed - but the formula is sound. It needs to be paired with a deep-diamond catalyst. There's supposed to be a formation of them in the trench. I'm running out of time to test it myself, but someone else might not be.",
    triggerRadius: 25,
    position: [350, -260, 300],
  },
  {
    id: 'log_trench_1',
    title: 'Personal Log - Dr. Amara Voss (final)',
    body: "Day 14. I won't make the surface again. If you're reading this and you're infected too - the formula is on the terminal fragments scattered near the old excavation site at the bottom of this trench. Kyanite plus diamond plus advanced electronics, synthesized at a proper fabricator. Don't give up on the way out. There's always a way out.",
    triggerRadius: 25,
    position: [520, -340, -400],
  },
  {
    id: 'log_lava_1',
    title: 'Excavation Site Terminal',
    body: 'This structure predates every human record on this planet. The organism responsible for the Kharon strain was contained here once, deliberately, by something that understood it far better than we do. The synthesis chamber nearby still holds a partial reaction record. Use it.',
    triggerRadius: 30,
    position: [610, -420, 550],
  },
  {
    id: 'log_lava_2',
    title: 'Final Transmission',
    body: 'If you are reading this, the serum works. Get to the surface, signal any passing vessel, and get off this planet. Do not come back down here. Whatever built this containment site is still down here somewhere, and it has been watching you the entire descent.',
    triggerRadius: 30,
    position: [640, -460, 600],
  },
];

export interface RadioSignalDef {
  id: string;
  name: string;
  position: [number, number, number];
  unlocksAfterLog?: string; // only becomes active once this log has been discovered
}

// Radio signals act as the game's only "quest marker": a directional ping
// with distance readout, no map, no waypoint line. The player must swim
// there using compass bearing + memory of the terrain.
export const RADIO_SIGNALS: RadioSignalDef[] = [
  { id: 'sig_shallows_1', name: 'Weak Distress Signal', position: [70, -15, 40] },
  { id: 'sig_kelp_1', name: 'Automated Buoy Ping', position: [-140, -45, 90], unlocksAfterLog: 'log_intro' },
  { id: 'sig_reef_1', name: 'Research Relay Carrier Wave', position: [180, -80, -160], unlocksAfterLog: 'log_shallows_1' },
  { id: 'sig_grand_reef_1', name: 'Quarantine Beacon', position: [-260, -170, -220], unlocksAfterLog: 'log_reef_1' },
  { id: 'sig_grand_reef_2', name: 'Faint Voice Log Carrier', position: [350, -260, 300], unlocksAfterLog: 'log_grand_reef_1' },
  { id: 'sig_trench_1', name: 'Excavation Site Ping', position: [520, -340, -400], unlocksAfterLog: 'log_grand_reef_2' },
  { id: 'sig_lava_1', name: 'Ancient Structure Resonance', position: [610, -420, 550], unlocksAfterLog: 'log_trench_1' },
];
