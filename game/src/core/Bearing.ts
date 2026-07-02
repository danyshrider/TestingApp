import * as THREE from 'three';

// Shared by the HUD compass, radio signals, player beacons, and wreck
// indicators: all of them need "how far, and which way relative to where
// I'm facing" with no map to fall back on.
export function bearingAndDistance(
  playerPos: THREE.Vector3,
  playerYaw: number,
  targetPos: THREE.Vector3,
): { distance: number; bearing: number } {
  const flat = targetPos.clone().sub(playerPos);
  const distance = flat.length();
  flat.y = 0;
  flat.normalize();
  const worldAngle = Math.atan2(flat.x, flat.z);
  let bearing = worldAngle - playerYaw + Math.PI;
  bearing = ((bearing % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  bearing -= Math.PI;
  return { distance, bearing };
}
