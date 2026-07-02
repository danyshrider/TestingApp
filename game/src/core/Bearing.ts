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
  // The camera faces world -Z at yaw 0, i.e. its forward direction sits at
  // world angle (yaw + PI). Positive bearing must mean "to my right" in view
  // space, which flips the sign since yaw increases counter-clockwise.
  let bearing = playerYaw + Math.PI - worldAngle;
  bearing = ((bearing % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  if (bearing > Math.PI) bearing -= Math.PI * 2;
  return { distance, bearing };
}
