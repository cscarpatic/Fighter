import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

const tracked=new WeakSet();
const visuals=new WeakMap();
let last=performance.now();

function finGeometry(){
  const g=new THREE.BufferGeometry();
  const v=new Float32Array([
    0,0,0,  0,5.4,0,  3.5,4.3,0,
    0,0,0,  3.5,4.3,0,  3.5,1.2,0
  ]);
  g.setAttribute('position',new THREE.BufferAttribute(v,3));
  g.computeVertexNormals();
  return g;
}

function bombVisual(b){
  if(tracked.has(b)) return;
  tracked.add(b);

  if(b.material){b.material=b.material.clone();b.material.transparent=true;b.material.opacity=0;}

  const g=new THREE.Group();
  const olive=new THREE.MeshStandardMaterial({color:0x49533c,roughness:.38,metalness:.42});
  const oliveDark=new THREE.MeshStandardMaterial({color:0x2b3328,roughness:.48,metalness:.32});
  const steel=new THREE.MeshStandardMaterial({color:0x7f8580,roughness:.3,metalness:.72});
  const yellow=new THREE.MeshStandardMaterial({color:0xcaa92a,roughness:.48,metalness:.28});

  // Long, slender WWII-style general purpose bomb body.
  const body=new THREE.Mesh(new THREE.SphereGeometry(3.15,18,14),olive);
  body.scale.set(1,2.25,1);body.position.y=-.7;g.add(body);

  const nose=new THREE.Mesh(new THREE.ConeGeometry(2.82,6.8,18),oliveDark);
  nose.position.y=-8.35;nose.rotation.z=Math.PI;g.add(nose);

  const tailCone=new THREE.Mesh(new THREE.CylinderGeometry(1.55,2.7,5.5,14),oliveDark);
  tailCone.position.y=7.1;g.add(tailCone);

  // Yellow identification bands and metal fuse detail.
  for(const y of[-3.8,-2.9]){
    const band=new THREE.Mesh(new THREE.TorusGeometry(3.02,.22,8,24),yellow);
    band.rotation.x=Math.PI/2;band.position.y=y;g.add(band);
  }
  const fuse=new THREE.Mesh(new THREE.CylinderGeometry(.48,.7,2.1,10),steel);
  fuse.position.y=-12;g.add(fuse);
  const fuseTip=new THREE.Mesh(new THREE.ConeGeometry(.52,1.6,10),steel);
  fuseTip.position.y=-13.75;fuseTip.rotation.z=Math.PI;g.add(fuseTip);

  // Four tapered tail fins instead of box-like fins.
  const fg=finGeometry();
  for(let i=0;i<4;i++){
    const fin=new THREE.Mesh(fg,oliveDark);
    fin.position.y=7.3;fin.rotation.y=i*Math.PI/2;
    fin.castShadow=true;g.add(fin);
  }

  // Small arming propeller at the tail for a more recognizable silhouette.
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,1.2,10),steel);hub.position.y=11.3;g.add(hub);
  const arming=new THREE.Group();arming.position.y=12.1;
  const blade1=new THREE.Mesh(new THREE.BoxGeometry(.38,.18,4.5),steel);
  const blade2=new THREE.Mesh(new THREE.BoxGeometry(4.5,.18,.38),steel);
  arming.add(blade1,blade2);g.add(arming);

  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  g.scale.setScalar(1.08);
  b.add(g);visuals.set(b,{g,arming});

  if(b.userData?.v){
    const v=b.userData.v;
    const horizontal=new THREE.Vector3(v.x,0,v.z).multiplyScalar(1.75);
    v.x=horizontal.x;v.z=horizontal.z;
  }
}

function isBomb(o){return o?.isMesh && o.geometry?.type==='CapsuleGeometry' && o.userData?.v && typeof o.userData?.life==='number';}

function update(now){
  requestAnimationFrame(update);
  const dt=Math.min((now-last)/1000,.05); last=now;
  const p=window.AeroOpsState?.player,scene=p?.parent;if(!scene)return;
  scene.traverse(o=>{if(isBomb(o)) bombVisual(o)});
  scene.traverse(b=>{
    if(!isBomb(b))return;
    const vis=visuals.get(b),v=b.userData.v;if(!vis||!v)return;
    const drag=Math.pow(.985,dt);v.x*=drag;v.z*=drag;
    const vel=v.clone();
    if(vel.lengthSq()>.001){
      vel.normalize();
      const desired=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,-1,0),vel);
      const invParent=b.quaternion.clone().invert();
      vis.g.quaternion.copy(invParent.multiply(desired));
    }
    vis.arming.rotation.y+=dt*18;
  });
}
requestAnimationFrame(update);
