import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

const tracked=new WeakSet();
const visuals=new WeakMap();
let last=performance.now();

function finGeometry(){
  const g=new THREE.BufferGeometry();
  const v=new Float32Array([
    0,0,0,  0,7.5,0,  4.8,6.2,0,
    0,0,0,  4.8,6.2,0,  4.2,1.6,0
  ]);
  g.setAttribute('position',new THREE.BufferAttribute(v,3));g.computeVertexNormals();return g;
}
function bombVisual(b){
  if(tracked.has(b))return;tracked.add(b);
  if(b.material){b.material=b.material.clone();b.material.transparent=true;b.material.opacity=0;}
  const g=new THREE.Group();
  const metal=new THREE.MeshStandardMaterial({color:0x626a6d,roughness:.22,metalness:.86});
  const darkMetal=new THREE.MeshStandardMaterial({color:0x2d3437,roughness:.28,metalness:.8});
  const steel=new THREE.MeshStandardMaterial({color:0xb7bec2,roughness:.16,metalness:.95});
  const brass=new THREE.MeshStandardMaterial({color:0xb79d58,roughness:.3,metalness:.72});

  // Longer, slimmer metallic bomb silhouette.
  const body=new THREE.Mesh(new THREE.SphereGeometry(2.85,22,18),metal);body.scale.set(1,3.25,1);body.position.y=-1.2;g.add(body);
  const nose=new THREE.Mesh(new THREE.ConeGeometry(2.55,9.5,20),darkMetal);nose.position.y=-12.9;nose.rotation.z=Math.PI;g.add(nose);
  const tailCone=new THREE.Mesh(new THREE.CylinderGeometry(1.45,2.45,7.2,16),darkMetal);tailCone.position.y=10.2;g.add(tailCone);

  // Polished reinforcement bands.
  for(const y of[-5.4,3.8]){const band=new THREE.Mesh(new THREE.TorusGeometry(2.8,.22,10,28),steel);band.rotation.x=Math.PI/2;band.position.y=y;g.add(band)}
  const fuse=new THREE.Mesh(new THREE.CylinderGeometry(.42,.62,2.7,12),steel);fuse.position.y=-18.3;g.add(fuse);
  const fuseTip=new THREE.Mesh(new THREE.ConeGeometry(.45,2.2,12),steel);fuseTip.position.y=-20.5;fuseTip.rotation.z=Math.PI;g.add(fuseTip);

  const fg=finGeometry();for(let i=0;i<4;i++){const fin=new THREE.Mesh(fg,darkMetal);fin.position.y=10.7;fin.rotation.y=i*Math.PI/2;fin.castShadow=true;g.add(fin)}
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,1.5,12),brass);hub.position.y=17.7;g.add(hub);
  const arming=new THREE.Group();arming.position.y=18.7;const blade1=new THREE.Mesh(new THREE.BoxGeometry(.32,.16,5.3),brass),blade2=new THREE.Mesh(new THREE.BoxGeometry(5.3,.16,.32),brass);arming.add(blade1,blade2);g.add(arming);

  // Longitudinal highlight strips make the casing read as metal while moving.
  for(const x of[-1.15,1.15]){const strip=new THREE.Mesh(new THREE.BoxGeometry(.18,14,.26),steel);strip.position.set(x,-.8,2.45);strip.material=steel.clone();strip.material.transparent=true;strip.material.opacity=.45;g.add(strip)}

  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});g.scale.setScalar(1.03);b.add(g);visuals.set(b,{g,arming});
  if(b.userData?.v){const v=b.userData.v,h=new THREE.Vector3(v.x,0,v.z).multiplyScalar(1.75);v.x=h.x;v.z=h.z;}
}
function isBomb(o){return o?.isMesh&&o.geometry?.type==='CapsuleGeometry'&&o.userData?.v&&typeof o.userData?.life==='number';}
function update(now){requestAnimationFrame(update);const dt=Math.min((now-last)/1000,.05);last=now;const p=window.AeroOpsState?.player,scene=p?.parent;if(!scene)return;scene.traverse(o=>{if(isBomb(o))bombVisual(o)});scene.traverse(b=>{if(!isBomb(b))return;const vis=visuals.get(b),v=b.userData.v;if(!vis||!v)return;const drag=Math.pow(.985,dt);v.x*=drag;v.z*=drag;const vel=v.clone();if(vel.lengthSq()>.001){vel.normalize();const desired=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,-1,0),vel),inv=b.quaternion.clone().invert();vis.g.quaternion.copy(inv.multiply(desired));}vis.arming.rotation.y+=dt*18;});}
requestAnimationFrame(update);