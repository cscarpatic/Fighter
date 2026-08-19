import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

// Combat visual/behaviour layer. It is loaded before the core engine, so it can
// validate newly-created projectiles without changing the flight model itself.
const originalAdd=THREE.Object3D.prototype.add;
const smoke=[];
const tracked=new WeakMap();

function materialColorHex(o){
  const c=o?.material?.color;
  return c?.getHex?.() ?? -1;
}
function isCylinderMesh(o){return o?.isMesh && o.geometry?.type==='CylinderGeometry';}
function nearestEnemy(pos){
  let best=null,bd=Infinity;
  for(const e of window.AeroOpsState?.enemies||[]){
    if(!e?.parent||e.userData?.dead)continue;
    const d=e.position.distanceToSquared(pos);
    if(d<bd){bd=d;best=e;}
  }
  return bd<140*140?best:null;
}
function enemyHasFiringSolution(enemy){
  const p=window.AeroOpsState?.player;
  if(!enemy||!p)return false;
  const to=p.position.clone().sub(enemy.position);
  const dist=to.length();
  if(dist<35||dist>430)return false;
  to.normalize();
  const forward=new THREE.Vector3(0,0,-1).applyQuaternion(enemy.quaternion).normalize();
  const dot=forward.dot(to);
  // About a 24 degree half-angle: enemy guns can only fire close to the nose.
  return dot>0.9135;
}
function enhanceTracer(mesh,enemy=false){
  if(mesh.userData.__tracerEnhanced)return;
  mesh.userData.__tracerEnhanced=true;
  mesh.scale.set(enemy?1.05:1.25,enemy?1.7:2.15,enemy?1.05:1.25);
  if(mesh.material){
    mesh.material=mesh.material.clone();
    mesh.material.transparent=true;
    mesh.material.opacity=1;
    mesh.material.depthWrite=false;
    mesh.material.color.setHex(enemy?0xff5533:0xfff2a0);
  }
  const glow=new THREE.Mesh(
    new THREE.CylinderGeometry(enemy?1.15:1.4,enemy?1.15:1.4,enemy?18:25,6),
    new THREE.MeshBasicMaterial({color:enemy?0xff3d24:0xffd85a,transparent:true,opacity:.26,depthWrite:false,blending:THREE.AdditiveBlending})
  );
  glow.rotation.copy(mesh.rotation);
  mesh.add(glow);
  const tip=new THREE.PointLight(enemy?0xff4028:0xffd45c,enemy?2.0:2.6,enemy?38:48,2);
  mesh.add(tip);
}

THREE.Object3D.prototype.add=function(...objs){
  const accepted=[];
  for(const o of objs){
    if(isCylinderMesh(o)){
      const hex=materialColorHex(o);
      const enemyShot=hex===0xff6655;
      const playerShot=hex===0xfff2a0;
      if(enemyShot){
        const shooter=nearestEnemy(o.position);
        if(!enemyHasFiringSolution(shooter)){
          // Suppress impossible side/rear gunfire before the projectile enters scene.
          continue;
        }
        enhanceTracer(o,true);
      }else if(playerShot){enhanceTracer(o,false);}
    }
    accepted.push(o);
  }
  if(!accepted.length)return this;
  return originalAdd.apply(this,accepted);
};

function smokePuff(parent,intensity=1){
  if(!parent?.parent)return;
  const mat=new THREE.MeshBasicMaterial({color:0x24282a,transparent:true,opacity:.42,depthWrite:false});
  const puff=new THREE.Mesh(new THREE.SphereGeometry(3.2+Math.random()*2.4,7,6),mat);
  puff.position.set((Math.random()-.5)*6,(Math.random()-.5)*3,12+Math.random()*8);
  parent.add(puff);
  smoke.push({o:puff,parent,life:1.4+Math.random()*.8,max:2.1,rise:5+Math.random()*5,spread:1.2+intensity*.4});
}
function addScorch(enemy){
  if(enemy.userData.__scorched)return;
  enemy.userData.__scorched=true;
  enemy.traverse(o=>{
    if(o.isMesh&&o.material?.color){
      o.material=o.material.clone();
      o.material.color.multiplyScalar(.58);
      if('roughness'in o.material)o.material.roughness=Math.min(1,(o.material.roughness||.5)+.2);
    }
  });
}
function addDamageGlow(enemy){
  if(enemy.userData.__damageGlow)return;
  enemy.userData.__damageGlow=true;
  const ember=new THREE.PointLight(0xff6a32,1.4,32,2);
  ember.position.set(0,1,8);enemy.add(ember);
}

let last=performance.now(),smokeTimer=0;
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.04,(now-last)/1000);last=now;smokeTimer-=dt;
  const enemies=window.AeroOpsState?.enemies||[];
  for(const e of enemies){
    if(!e?.parent)continue;
    const hp=e.userData?.hp??36;
    const prev=tracked.get(e)??hp;tracked.set(e,hp);
    if(hp<=24)addScorch(e);
    if(hp<=15)addDamageGlow(e);
    if(hp<=27&&smokeTimer<=0){smokePuff(e,hp<=15?1.5:1);smokeTimer=.085;}
    if(hp<prev){
      // brief hit sparks at the fuselage
      for(let i=0;i<3;i++){
        const sp=new THREE.Mesh(new THREE.SphereGeometry(.8,5,4),new THREE.MeshBasicMaterial({color:0xffc258,transparent:true,opacity:.95,depthWrite:false,blending:THREE.AdditiveBlending}));
        sp.position.set((Math.random()-.5)*9,(Math.random()-.5)*5,(Math.random()-.5)*14);e.add(sp);
        smoke.push({o:sp,parent:e,life:.18,max:.18,rise:1,spread:3,spark:true});
      }
    }
  }
  for(let i=smoke.length-1;i>=0;i--){
    const s=smoke[i];s.life-=dt;
    if(!s.o?.parent||s.life<=0){s.o?.parent?.remove(s.o);smoke.splice(i,1);continue;}
    s.o.position.y+=s.rise*dt;
    s.o.position.z+=s.spread*dt;
    const k=s.spark?1+dt*5:1+dt*.55;s.o.scale.multiplyScalar(k);
    if(s.o.material)s.o.material.opacity=Math.max(0,(s.life/s.max)*(s.spark?.9:.42));
  }
}
requestAnimationFrame(frame);
