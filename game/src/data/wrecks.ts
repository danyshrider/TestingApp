export interface WreckSite {
  scanTargetId: string;
  position: [number, number, number];
  kind: 'wreck' | 'fragment';
}

// Scan targets tied to blueprints.ts. Wrecks are large salvage structures;
// fragments are small floating debris. Positions loosely align with the
// PDA log / radio signal sites in logs.ts so discovering one usually means
// discovering the other, without needing an explicit map or quest marker.
export const WRECK_SITES: WreckSite[] = [
  { scanTargetId: 'wreck_shallows_1', position: [70, -18, 40], kind: 'wreck' },
  { scanTargetId: 'wreck_shallows_2', position: [-40, -12, 65], kind: 'wreck' },
  { scanTargetId: 'wreck_kelp_1', position: [-140, -48, 90], kind: 'wreck' },
  { scanTargetId: 'wreck_kelp_2', position: [-170, -55, 30], kind: 'wreck' },
  { scanTargetId: 'fragment_kelp_1', position: [-110, -40, 140], kind: 'fragment' },
  { scanTargetId: 'wreck_reef_1', position: [180, -82, -160], kind: 'wreck' },
  { scanTargetId: 'fragment_reef_1', position: [250, -95, -110], kind: 'fragment' },
  { scanTargetId: 'wreck_grand_reef_1', position: [-260, -172, -220], kind: 'wreck' },
  { scanTargetId: 'wreck_grand_reef_2', position: [350, -262, 300], kind: 'wreck' },
  { scanTargetId: 'fragment_grand_reef_1', position: [-320, -190, -180], kind: 'fragment' },
  { scanTargetId: 'wreck_trench_1', position: [520, -342, -400], kind: 'wreck' },
  { scanTargetId: 'wreck_trench_2', position: [470, -360, -320], kind: 'fragment' },
  { scanTargetId: 'fragment_trench_1', position: [560, -350, -370], kind: 'fragment' },
  { scanTargetId: 'wreck_lava_1', position: [610, -422, 550], kind: 'wreck' },
  { scanTargetId: 'wreck_lava_2', position: [640, -462, 600], kind: 'wreck' },
];
