import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

let lastPlayer=null, terrainScene=null;
const matLand=new THREE.MeshStandardMaterial({color:0x6d8056,roughness:1,metalness:0});
const matSand=new THREE.MeshStandardMaterial({color:0xb8a77d,roughness:1,metalness:0});

function addTerrain(state){
  const p=state?.player, scene=p?.parent, m=state?.mission;
  if(!scene||terrainScene===scene)return;
  terrainScene=scene;
  // Always render some land when the historical area includes coast/islands/ground.
  if(m?.land){
    const g=new THREE.PlaneGeometry(5200,5200,48,48),pos=g.attributes.position;
    for(let i=0;i<pos.count;i++) pos.setZ(i,Math.sin(pos.getX(i)*.004)*16+Math.cos(pos.getY(i)*.0035)*11);
    g.computeVertexNormals();
    const land=new THREE.Mesh(g,matLand);land.rotation.x=-Math.PI/2;land.position.y=.45;land.receiveShadow=true;scene.add(land);
  } else {
    // Coastal/island backdrop for naval scenarios so sea is not an endless empty plane.
    const island=new THREE.Mesh(new THREE.CircleGeometry(950,64),matLand);island.rotation.x=-Math.PI/2;island.position.set(-1150,.7,-1750);island.scale.set(1.45,.78,1);scene.add(island);
    const shore=new THREE.Mesh(new THREE.RingGeometry(860,990,64),matSand);shore.rotation.x=-Math.PI/2;shore.position.copy(island.position);shore.position.y=.8;shore.scale.copy(island.scale);scene.add(shore);
  }
}

function loseByCollision(){
  const end=document.getElementById('end'), game=document.getElementById('game');
  if(!end||!game||game.classList.contains('hidden'))return;
  game.classList.add('hidden');end.classList.remove('hidden');
  const et=document.getElementById('et'), es=document.getElementById('es'), estat=document.getElementById('estat');
  if(et)et.textContent='MISSIONE FALLITA';
  if(es)es.textContent='COLLISIONE';
  if(estat)estat.textContent='Collisione in volo con un altro velivolo.';
  window.__AERO_COLLISION_LOSS=true;
}

function checkCollision(state){
  const p=state?.player;if(!p?.parent||window.__AERO_COLLISION_LOSS)return;
  for(const e of state.enemies||[]){
    if(!e?.parent||e.userData?.dead)continue;
    const r=(p.userData?.r||24)+(e.userData?.r||24);
    if(p.position.distanceToSquared(e.position)<r*r*.36){
      loseByCollision();return;
    }
  }
}

function frame(){requestAnimationFrame(frame);const s=window.AeroOpsState;if(!s?.player)return;if(s.player!==lastPlayer){lastPlayer=s.player;window.__AERO_COLLISION_LOSS=false;}addTerrain(s);checkCollision(s)}
requestAnimationFrame(frame);
