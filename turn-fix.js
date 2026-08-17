import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

const originalRotateY = THREE.Object3D.prototype.rotateY;
if (!THREE.Object3D.prototype.__aeroTurnFixedV4) {
  THREE.Object3D.prototype.rotateY = function(angle) {
    const player = window.AeroOpsState?.player;
    if (player && this === player) {
      // Stronger coordinated yaw so the aircraft can turn tightly without
      // making the joystick itself more nervous. Left/right sign remains aligned
      // with the visual bank direction.
      angle = -angle * 8.0;
    }
    return originalRotateY.call(this, angle);
  };
  THREE.Object3D.prototype.__aeroTurnFixedV4 = true;
}
