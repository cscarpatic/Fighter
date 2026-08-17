import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

const tracked=new WeakSet();
const visuals=new WeakMap();
let last=performance.now();

function bombVisual(b){
  if(tracked.has(b)) return;
  tracked.add(b);

  // Preserve collision mesh but hide its crude capsule appearance.
  if(b.material){
    b.material=b.material.clone();
    b.material.transparent=true;
    b.material.opacity=0;
  }

  const g=new THREE.Group();
  const dark=new THREE.MeshStandardMaterial({color:0x2f3a30,roughness:.48,metalness:.35});
  const bandMat=new THREE.MeshStandardMaterial({color:0x151b17,roughness:.5,metalness:.5});

  // Main bomb body: pointed nose, cylindrical casing and tapered tail.
  const body=new THREE.Mesh(new THREE.CylinderGeometry(2.7,3.3,11,12),dark);
  body.position.y=0;
  g.add(body);

  const nose=new THREE.Mesh(new THREE.ConeGeometry(2.72,5.5,12),dark);
  nose.position.y=-8.2;
  nose.rotation.z=Math.PI;
  g.add(nose);

  const tail=new THREE.Mesh(new THREE.CylinderGeometry(1.8,2.7,4.5,10),dark);
  tail.position.y=7.7;
  g.add(tail);

  const band=new THREE.Mesh(new THREE.TorusGeometry(3.0,.32,6,16),bandMat);
  band.rotation.x=Math.PI/2;
  band.position.y=-1.8;
  g.add(band);

  // Four tail fins.
  for(let i=0;i<4;i++){
    const fin=new THREE.Mesh(new THREE.BoxGeometry(.55,5.8,4.6),dark);
    fin.position.y=9.2;
    fin.position.x=Math.cos(i*Math.PI/2)*2.3;
    fin.position.z=Math.sin(i*Math.PI/2)*2.3;
    fin.rotation.y=i*Math.PI/2;
    g.add(fin);
  }

  // Slightly enlarged visual for readability from chase camera.
  g.scale.setScalar(1.18);
  b.add(g);
  visuals.set(b,g);

  // The core game gives the bomb forward speed, but it is too low visually.
  // Increase inherited aircraft momentum once, while keeping gravity untouched.
  if(b.userData?.v){
    const v=b.userData.v;
    const horizontal=new THREE.Vector3(v.x,0,v.z);
    horizontal.multiplyScalar(1.75);
    v.x=horizontal.x;
    v.z=horizontal.z;
  }
}

function isBomb(o){
  return o?.isMesh && o.geometry?.type==='CapsuleGeometry' && o.userData?.v && typeof o.userData?.life==='number';
}

function update(now){
  requestAnimationFrame(update);
  const dt=Math.min((now-last)/1000,.05); last=now;
  const p=window.AeroOpsState?.player;
  const scene=p?.parent;
  if(!scene) return;

  scene.traverse(o=>{if(isBomb(o)) bombVisual(o)});

  scene.traverse(b=>{
    if(!isBomb(b)) return;
    const g=visuals.get(b),v=b.userData.v;
    if(!g||!v) return;

    // Mild aerodynamic drag: horizontal momentum persists, producing a clear arc.
    const drag=Math.pow(.985,dt);
    v.x*=drag; v.z*=drag;

    // Align the detailed bomb model with its instantaneous velocity vector.
    const vel=v.clone();
    if(vel.lengthSq()>.001){
      vel.normalize();
      const desired=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,-1,0),vel);
      const invParent=b.quaternion.clone().invert();
      g.quaternion.copy(invParent.multiply(desired));
    }
  });
}

requestAnimationFrame(update);
