import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

const originalRotateY = THREE.Object3D.prototype.rotateY;
if (!THREE.Object3D.prototype.__aeroTurnFixedV3) {
  THREE.Object3D.prototype.rotateY = function(angle) {
    const player = window.AeroOpsState?.player;
    if (player && this === player) {
      // The core flight model supplies only a very small yaw input while banking.
      // Amplify it so left/right stick movement produces a clear coordinated turn.
      // Sign is inverted to keep visual bank and heading change in the same direction.
      angle = -angle * 4.6;
    }
    return originalRotateY.call(this, angle);
  };
  THREE.Object3D.prototype.__aeroTurnFixedV3 = true;
}
