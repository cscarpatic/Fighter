import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

const originalAdd=THREE.Scene.prototype.add;
const active=[];
let patched=false;

function isExplosionObject(o){
  if(!o?.isMesh||!o.material?.color||!o.geometry)return false;
  const hex=o.material.color.getHex();
  return (hex===0xff8b3d||hex===0x333333) && o.geometry.type==='SphereGeometry';
}

function addRaw(scene,obj){originalAdd.call(scene,obj)}

function makeExplosion(scene,pos,flak=false){
  const g=new THREE.Group();
  g.position.copy(pos);
  g.userData.__enhancedExplosion=true;

  const flash=new THREE.Mesh(
    new THREE.SphereGeometry(flak?8:12,12,10),
    new THREE.MeshBasicMaterial({color:flak?0xffc56e:0xffffb0,transparent:true,opacity:.98,depthWrite:false})
  );
  g.add(flash);

  const fire=new THREE.Mesh(
    new THREE.SphereGeometry(flak?11:18,14,12),
    new THREE.MeshBasicMaterial({color:flak?0xff7a35:0xff5a1f,transparent:true,opacity:.82,depthWrite:false})
  );
  g.add(fire);

  const ring=new THREE.Mesh(
    new THREE.RingGeometry(flak?9:14,flak?12:19,40),
    new THREE.MeshBasicMaterial({color:0xffd36a,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false})
  );
  ring.rotation.x=-Math.PI/2;
  g.add(ring);

  const smoke=[];
  for(let i=0;i<(flak?3:6);i++){
    const s=new THREE.Mesh(
      new THREE.SphereGeometry(flak?6:9,8,7),
      new THREE.MeshBasicMaterial({color:flak?0x3b3b3b:0x2d2d2d,transparent:true,opacity:.5,depthWrite:false})
    );
    s.position.set((Math.random()-.5)*(flak?12:22),Math.random()*(flak?8:16),(Math.random()-.5)*(flak?12:22));
    g.add(s); smoke.push(s);
  }

  const light=new THREE.PointLight(flak?0xff8b45:0xff6a24,flak?7:12,flak?180:300,2);
  g.add(light);
  addRaw(scene,g);
  active.push({scene,g,flash,fire,ring,smoke,light,age:0,life:flak?1.05:1.65,flak});
}

if(!THREE.Scene.prototype.__aeroExplosionFX){
  THREE.Scene.prototype.add=function(...objs){
    const result=originalAdd.apply(this,objs);
    for(const o of objs){
      if(!patched&&isExplosionObject(o)){
        const flak=o.material.color.getHex()===0x333333;
        makeExplosion(this,o.position.clone(),flak);
      }
    }
    return result;
  };
  THREE.Scene.prototype.__aeroExplosionFX=true;
  patched=false;
}

let last=performance.now();
function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min((now-last)/1000,.05); last=now;
  for(let i=active.length-1;i>=0;i--){
    const e=active[i]; e.age+=dt;
    const q=Math.min(1,e.age/e.life);
    e.flash.scale.setScalar(1+q*(e.flak?2.1:3.1));
    e.fire.scale.setScalar(1+q*(e.flak?2.6:3.8));
    e.ring.scale.setScalar(1+q*(e.flak?5:7));
    e.flash.material.opacity=Math.max(0,1-q*2.8);
    e.fire.material.opacity=Math.max(0,.9-q*.9);
    e.ring.material.opacity=Math.max(0,.85-q*1.05);
    e.light.intensity=Math.max(0,(e.flak?7:12)*(1-q*1.35));
    e.smoke.forEach((s,j)=>{
      s.position.y+=dt*(e.flak?7:12)*(1+j*.08);
      s.scale.setScalar(1+q*(e.flak?2.2:3.4));
      s.material.opacity=Math.max(0,.48-q*.34);
    });
    if(q>=1){e.scene.remove(e.g);active.splice(i,1)}
  }
}
requestAnimationFrame(animate);
