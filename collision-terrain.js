import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

let lastPlayer=null, terrainScene=null, collisionPending=false;
const matLand=new THREE.MeshStandardMaterial({color:0x6d8056,roughness:1,metalness:0});
const matSand=new THREE.MeshStandardMaterial({color:0xb8a77d,roughness:1,metalness:0});

function addTerrain(state){
  const p=state?.player, scene=p?.parent, m=state?.mission;
  if(!scene||terrainScene===scene)return;
  terrainScene=scene;
  if(m?.land){
    const g=new THREE.PlaneGeometry(5200,5200,48,48),pos=g.attributes.position;
    for(let i=0;i<pos.count;i++) pos.setZ(i,Math.sin(pos.getX(i)*.004)*16+Math.cos(pos.getY(i)*.0035)*11);
    g.computeVertexNormals();
    const land=new THREE.Mesh(g,matLand);land.rotation.x=-Math.PI/2;land.position.y=.45;land.receiveShadow=true;scene.add(land);
  } else {
    const island=new THREE.Mesh(new THREE.CircleGeometry(950,64),matLand);island.rotation.x=-Math.PI/2;island.position.set(-1150,.7,-1750);island.scale.set(1.45,.78,1);scene.add(island);
    const shore=new THREE.Mesh(new THREE.RingGeometry(860,990,64),matSand);shore.rotation.x=-Math.PI/2;shore.position.copy(island.position);shore.position.y=.8;shore.scale.copy(island.scale);scene.add(shore);
  }
}

function impactOverlay(){
  let o=document.getElementById('collisionImpact');
  if(!o){
    o=document.createElement('div');o.id='collisionImpact';
    // Same composition used by the NEW MISSION / LEVEL COMPLETED transition.
    o.style.cssText='position:fixed;inset:0;z-index:120000;display:none;align-items:center;justify-content:center;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.30));font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;text-align:center;color:#fff;text-shadow:0 4px 18px #000';
    o.innerHTML='<div style="padding:24px 34px;border-top:2px solid rgba(255,220,120,.92);border-bottom:2px solid rgba(255,220,120,.92);background:rgba(3,10,16,.23);box-shadow:0 0 45px rgba(0,0,0,.24)"><div class="kicker" style="font-size:14px;font-weight:900;letter-spacing:.28em;color:#ffd86d">EVENTO CRITICO</div><div class="title" style="font-size:clamp(42px,8vw,88px);line-height:.95;font-weight:1000;letter-spacing:-.04em;margin:8px 0">COLLISIONE</div><div class="sub" style="font-size:clamp(15px,2.4vw,25px);font-weight:800;letter-spacing:.08em;color:#dff5ff">COLLISIONE AVVENUTA</div></div>';
    document.body.appendChild(o);
  }
  o.style.opacity='1';o.style.display='flex';
  o.animate?.([{opacity:0},{opacity:1}],{duration:300,easing:'ease-out'});
  setTimeout(()=>{const b=o.animate?.([{opacity:1},{opacity:0}],{duration:450,easing:'ease-in',fill:'forwards'});if(b)b.onfinish=()=>{o.style.display='none';o.style.opacity='1'};else o.style.display='none';},1400);
}

function collisionFX(scene,pos){
  const root=new THREE.Group();root.position.copy(pos);scene.add(root);
  const fireMat=new THREE.MeshBasicMaterial({color:0xff6a22,transparent:true,opacity:.95,depthWrite:false});
  const coreMat=new THREE.MeshBasicMaterial({color:0xfff0a6,transparent:true,opacity:1,depthWrite:false});
  const smokeMat=new THREE.MeshBasicMaterial({color:0x2b2b2b,transparent:true,opacity:.7,depthWrite:false});
  const core=new THREE.Mesh(new THREE.SphereGeometry(8,12,10),coreMat);root.add(core);
  const fire=new THREE.Mesh(new THREE.SphereGeometry(15,14,10),fireMat);root.add(fire);
  const smoke=[];
  for(let i=0;i<8;i++){
    const s=new THREE.Mesh(new THREE.SphereGeometry(5+Math.random()*5,8,6),smokeMat.clone());
    s.position.set((Math.random()-.5)*16,(Math.random()-.5)*12,(Math.random()-.5)*16);s.userData.v=new THREE.Vector3((Math.random()-.5)*11,8+Math.random()*10,(Math.random()-.5)*11);root.add(s);smoke.push(s);
  }
  const debris=[];
  const metal=new THREE.MeshStandardMaterial({color:0x3b4247,roughness:.55,metalness:.55});
  for(let i=0;i<14;i++){
    const d=new THREE.Mesh(new THREE.BoxGeometry(1+Math.random()*3,.4+Math.random()*1.2,3+Math.random()*7),metal);
    d.position.set((Math.random()-.5)*10,(Math.random()-.5)*7,(Math.random()-.5)*10);
    d.userData.v=new THREE.Vector3((Math.random()-.5)*38,8+Math.random()*28,(Math.random()-.5)*38);d.userData.spin=new THREE.Vector3(Math.random()*5,Math.random()*5,Math.random()*5);root.add(d);debris.push(d);
  }
  const light=new THREE.PointLight(0xff6b28,7,260);root.add(light);
  const start=performance.now();
  function anim(now){
    const age=(now-start)/1000,dt=.016;
    if(age>1.7){scene.remove(root);root.traverse(o=>{o.geometry?.dispose?.();if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose?.());else o.material.dispose?.()}});return}
    core.scale.setScalar(1+age*2.7);core.material.opacity=Math.max(0,1-age*1.5);
    fire.scale.setScalar(1+age*2.1);fire.material.opacity=Math.max(0,.95-age*.68);light.intensity=Math.max(0,7-age*5);
    for(const s of smoke){s.position.addScaledVector(s.userData.v,dt);s.userData.v.y+=4*dt;s.scale.multiplyScalar(1.012);s.material.opacity=Math.max(0,.7-age*.25)}
    for(const d of debris){d.position.addScaledVector(d.userData.v,dt);d.userData.v.y-=22*dt;d.rotation.x+=d.userData.spin.x*dt;d.rotation.y+=d.userData.spin.y*dt;d.rotation.z+=d.userData.spin.z*dt}
    requestAnimationFrame(anim);
  }
  requestAnimationFrame(anim);
}

function keepCrashAircraft(scene,p,enemy,pos){
  const a=p.clone(true),b=enemy.clone(true);
  a.position.copy(p.position);a.quaternion.copy(p.quaternion);
  b.position.copy(enemy.position);b.quaternion.copy(enemy.quaternion);
  a.userData.__crashVisual=true;b.userData.__crashVisual=true;
  scene.add(a,b);
  p.visible=false;enemy.visible=false;
  const mid=pos.clone();a.position.lerp(mid,.18);b.position.lerp(mid,.18);
  setTimeout(()=>{scene.remove(a);scene.remove(b);},1900);
}

function showGameOver(){
  const end=document.getElementById('end'), game=document.getElementById('game');
  if(!end||!game)return;
  game.classList.add('hidden');end.classList.remove('hidden');
  const et=document.getElementById('et'), es=document.getElementById('es'), estat=document.getElementById('estat');
  if(et)et.textContent='GAME OVER';
  if(es)es.textContent='COLLISIONE';
  if(estat)estat.innerHTML='Collisione in volo con un altro velivolo.<br><b>Scegli RIPROVA per tentare nuovamente la missione oppure PIANIFICAZIONE per tornare alla campagna.</b>';
  const again=document.getElementById('again'),back=document.getElementById('back');
  if(again)again.textContent='RIPROVA';
  if(back&&back.textContent!=='LIVELLO SUCCESSIVO')back.textContent='PIANIFICAZIONE';
  window.__AERO_COLLISION_LOSS=true;collisionPending=false;
}

function loseByCollision(state,enemy){
  if(collisionPending||window.__AERO_COLLISION_LOSS)return;
  const p=state?.player,scene=p?.parent;if(!p||!scene)return;
  collisionPending=true;window.__AERO_COLLISION_LOSS=true;
  const pos=p.position.clone().lerp(enemy.position,.5);
  keepCrashAircraft(scene,p,enemy,pos);collisionFX(scene,pos);impactOverlay();
  if(p.userData)p.userData.hp=0;if(enemy.userData){enemy.userData.hp=0;enemy.userData.dead=true;}
  setTimeout(showGameOver,1700);
}

function checkCollision(state){
  const p=state?.player;if(!p?.parent||collisionPending||window.__AERO_COLLISION_LOSS)return;
  for(const e of state.enemies||[]){
    if(!e?.parent||e.userData?.dead||e.visible===false)continue;
    const r=(p.userData?.r||24)+(e.userData?.r||24);
    if(p.position.distanceToSquared(e.position)<r*r*.36){loseByCollision(state,e);return;}
  }
}

function frame(){requestAnimationFrame(frame);const s=window.AeroOpsState;if(!s?.player)return;if(s.player!==lastPlayer){lastPlayer=s.player;window.__AERO_COLLISION_LOSS=false;collisionPending=false;}addTerrain(s);checkCollision(s)}
requestAnimationFrame(frame);
