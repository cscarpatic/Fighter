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
    o.style.cssText='position:fixed;inset:0;z-index:120000;display:none;align-items:center;justify-content:center;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.03),rgba(0,0,0,.28));font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;text-align:center;color:#fff;text-shadow:0 4px 18px #000';
    o.innerHTML=`<div class="collisionCard" style="width:min(920px,92vw);padding:22px 26px 28px;border-top:2px solid rgba(93,210,255,.95);border-bottom:2px solid rgba(93,210,255,.95);background:linear-gradient(90deg,transparent,rgba(5,18,28,.34) 16%,rgba(5,18,28,.44) 50%,rgba(5,18,28,.34) 84%,transparent);box-shadow:0 0 48px rgba(0,0,0,.26)">
      <div class="kicker" style="font-size:clamp(12px,1.7vw,17px);font-weight:900;letter-spacing:.28em;color:#70dfff">EVENTO CRITICO</div>
      <div class="title" style="font-size:clamp(48px,10vw,112px);line-height:.9;font-weight:1000;letter-spacing:-.045em;margin:10px 0 12px;color:#fff;text-shadow:0 0 18px rgba(60,190,255,.85),0 5px 20px #000">COLLISIONE</div>
      <div class="sub" style="font-size:clamp(16px,2.5vw,28px);font-weight:850;letter-spacing:.09em;color:#8fe8ff">COLLISIONE AVVENUTA</div>
      <div class="collisionActions" style="display:flex;justify-content:center;gap:clamp(18px,5vw,54px);margin-top:30px;opacity:0;transform:translateY(12px)">
        <button data-collision-retry style="pointer-events:auto;min-width:180px;padding:13px 22px;border:1px solid rgba(112,223,255,.7);border-radius:10px;background:rgba(4,20,30,.48);color:#eafaff;font:800 clamp(15px,2vw,21px) system-ui;letter-spacing:.06em;box-shadow:0 0 20px rgba(44,180,255,.12)">↻ RIPROVA</button>
        <button data-collision-plan style="pointer-events:auto;min-width:210px;padding:13px 22px;border:1px solid rgba(112,223,255,.7);border-radius:10px;background:rgba(4,20,30,.48);color:#eafaff;font:800 clamp(15px,2vw,21px) system-ui;letter-spacing:.06em;box-shadow:0 0 20px rgba(44,180,255,.12)">⌑ PIANIFICAZIONE</button>
      </div>
    </div>`;
    document.body.appendChild(o);
    o.querySelector('[data-collision-retry]')?.addEventListener('click',()=>document.getElementById('again')?.click());
    o.querySelector('[data-collision-plan]')?.addEventListener('click',()=>document.getElementById('back')?.click());
  }
  const actions=o.querySelector('.collisionActions');
  actions.style.opacity='0';actions.style.transform='translateY(12px)';
  o.style.opacity='1';o.style.display='flex';o.style.pointerEvents='none';
  o.animate?.([{opacity:0},{opacity:1}],{duration:320,easing:'ease-out'});
  setTimeout(()=>{
    o.style.pointerEvents='auto';
    actions.animate?.([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'ease-out',fill:'forwards'});
    actions.style.opacity='1';actions.style.transform='translateY(0)';
  },1250);
}

function collisionFX(scene,pos){
  const root=new THREE.Group();root.position.copy(pos);scene.add(root);
  const fireMat=new THREE.MeshBasicMaterial({color:0xff6a22,transparent:true,opacity:.95,depthWrite:false});
  const coreMat=new THREE.MeshBasicMaterial({color:0xfff0a6,transparent:true,opacity:1,depthWrite:false});
  const smokeMat=new THREE.MeshBasicMaterial({color:0x2b2b2b,transparent:true,opacity:.7,depthWrite:false});
  const core=new THREE.Mesh(new THREE.SphereGeometry(8,12,10),coreMat);root.add(core);
  const fire=new THREE.Mesh(new THREE.SphereGeometry(15,14,10),fireMat);root.add(fire);
  const smoke=[];
  for(let i=0;i<10;i++){
    const s=new THREE.Mesh(new THREE.SphereGeometry(5+Math.random()*6,8,6),smokeMat.clone());
    s.position.set((Math.random()-.5)*18,(Math.random()-.5)*14,(Math.random()-.5)*18);s.userData.v=new THREE.Vector3((Math.random()-.5)*12,8+Math.random()*12,(Math.random()-.5)*12);root.add(s);smoke.push(s);
  }
  const debris=[];
  const metal=new THREE.MeshStandardMaterial({color:0x3b4247,roughness:.55,metalness:.55});
  for(let i=0;i<18;i++){
    const d=new THREE.Mesh(new THREE.BoxGeometry(1+Math.random()*3,.4+Math.random()*1.2,3+Math.random()*7),metal);
    d.position.set((Math.random()-.5)*10,(Math.random()-.5)*7,(Math.random()-.5)*10);
    d.userData.v=new THREE.Vector3((Math.random()-.5)*42,8+Math.random()*30,(Math.random()-.5)*42);d.userData.spin=new THREE.Vector3(Math.random()*5,Math.random()*5,Math.random()*5);root.add(d);debris.push(d);
  }
  const light=new THREE.PointLight(0xff6b28,8,300);root.add(light);
  const start=performance.now();
  function anim(now){
    const age=(now-start)/1000,dt=.016;
    if(age>2.3){scene.remove(root);root.traverse(o=>{o.geometry?.dispose?.();if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose?.());else o.material.dispose?.()}});return}
    core.scale.setScalar(1+age*2.7);core.material.opacity=Math.max(0,1-age*1.25);
    fire.scale.setScalar(1+age*2.1);fire.material.opacity=Math.max(0,.95-age*.48);light.intensity=Math.max(0,8-age*3.4);
    for(const s of smoke){s.position.addScaledVector(s.userData.v,dt);s.userData.v.y+=4*dt;s.scale.multiplyScalar(1.012);s.material.opacity=Math.max(0,.72-age*.22)}
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
  const mid=pos.clone();a.position.lerp(mid,.16);b.position.lerp(mid,.16);
  // Keep the aircraft visible behind the collision overlay until the user chooses what to do.
  window.__AERO_CRASH_VISUALS=[a,b];
}

function loseByCollision(state,enemy){
  if(collisionPending||window.__AERO_COLLISION_LOSS)return;
  const p=state?.player,scene=p?.parent;if(!p||!scene)return;
  collisionPending=true;window.__AERO_COLLISION_LOSS=true;
  const pos=p.position.clone().lerp(enemy.position,.5);
  keepCrashAircraft(scene,p,enemy,pos);collisionFX(scene,pos);impactOverlay();
  if(p.userData)p.userData.hp=0;if(enemy.userData){enemy.userData.hp=0;enemy.userData.dead=true;}
  // Do not open the old GAME OVER result card: the 3D scene itself remains the game-over screen.
  document.getElementById('end')?.classList.add('hidden');
  document.getElementById('game')?.classList.remove('hidden');
}

function checkCollision(state){
  const p=state?.player;if(!p?.parent||collisionPending||window.__AERO_COLLISION_LOSS)return;
  for(const e of state.enemies||[]){
    if(!e?.parent||e.userData?.dead||e.visible===false)continue;
    const r=(p.userData?.r||24)+(e.userData?.r||24);
    if(p.position.distanceToSquared(e.position)<r*r*.36){loseByCollision(state,e);return;}
  }
}

function frame(){
  requestAnimationFrame(frame);const s=window.AeroOpsState;if(!s?.player)return;
  if(s.player!==lastPlayer){
    lastPlayer=s.player;window.__AERO_COLLISION_LOSS=false;collisionPending=false;
    const o=document.getElementById('collisionImpact');if(o)o.style.display='none';
    window.__AERO_CRASH_VISUALS=null;
  }
  addTerrain(s);checkCollision(s)
}
requestAnimationFrame(frame);
