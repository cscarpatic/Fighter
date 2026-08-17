import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

const originalRotateY = THREE.Object3D.prototype.rotateY;
if (!THREE.Object3D.prototype.__aeroTurnFixedV5) {
  THREE.Object3D.prototype.rotateY = function(angle) {
    const player = window.AeroOpsState?.player;
    if (player && this === player) {
      // Preserve the core model's correct left/right sign, but amplify yaw so
      // normal banking produces a much tighter, more arcade-friendly turn.
      angle *= 6.5;
    }
    return originalRotateY.call(this, angle);
  };
  THREE.Object3D.prototype.__aeroTurnFixedV5 = true;
}
