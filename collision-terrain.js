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
    o.style.cssText='position:fixed;inset:0;z-index:99990;pointer-events:none;display:grid;place-items:center;background:radial-gradient(circle,rgba(255,145,35,.14),rgba(110,0,0,.08) 34%,transparent 68%);font-family:system-ui,sans-serif;text-align:center;color:#fff;text-shadow:0 4px 18px #000';
    o.innerHTML='<div><strong style="display:block;font-size:clamp(44px,9vw,110px);letter-spacing:.08em;color:#ff6b36">IMPATTO</strong><span style="font-size:clamp(16px,2.4vw,28px);font-weight:900">COLLISIONE IN VOLO</span></div>';
    document.body.appendChild(o);
  }
  o.style.display='grid';o.animate?.([{opacity:0},{opacity:1,offset:.16},{opacity:1,offset:.72},{opacity:0}],{duration:1450,easing:'ease-out',fill:'forwards'});
  setTimeout(()=>{o.style.display='none'},1500);
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
    if(age>1.55){scene.remove(root);root.traverse(o=>{o.geometry?.dispose?.();if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose?.());else o.material.dispose?.()}});return}
    core.scale.setScalar(1+age*2.7);core.material.opacity=Math.max(0,1-age*1.5);
    fire.scale.setScalar(1+age*2.1);fire.material.opacity=Math.max(0,.95-age*.68);light.intensity=Math.max(0,7-age*5);
    for(const s of smoke){s.position.addScaledVector(s.userData.v,dt);s.userData.v.y+=4*dt;s.scale.multiplyScalar(1.012);s.material.opacity=Math.max(0,.7-age*.25)}
    for(const d of debris){d.position.addScaledVector(d.userData.v,dt);d.userData.v.y-=22*dt;d.rotation.x+=d.userData.spin.x*dt;d.rotation.y+=d.userData.spin.y*dt;d.rotation.z+=d.userData.spin.z*dt}
    requestAnimationFrame(anim);
  }
  requestAnimationFrame(anim);
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
  impactOverlay();collisionFX(scene,pos);
  p.visible=false;enemy.visible=false;
  if(p.userData)p.userData.hp=0;if(enemy.userData){enemy.userData.hp=0;enemy.userData.dead=true;}
  // Keep the 3D scene visible long enough to see the crash before the GAME OVER overlay.
  setTimeout(showGameOver,1350);
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
