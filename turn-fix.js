import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

const originalRotateY = THREE.Object3D.prototype.rotateY;
if (!THREE.Object3D.prototype.__aeroTurnFixed) {
  THREE.Object3D.prototype.rotateY = function(angle) {
    const player = window.AeroOpsState?.player;
    if (player && this === player) angle = -angle;
    return originalRotateY.call(this, angle);
  };
  THREE.Object3D.prototype.__aeroTurnFixed = true;
}
