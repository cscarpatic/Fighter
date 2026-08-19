import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

const upgraded=new WeakSet();
let sceneDone=false;
const mats={
 hull:new THREE.MeshStandardMaterial({color:0x505c64,roughness:.48,metalness:.32}),
 hullDark:new THREE.MeshStandardMaterial({color:0x303940,roughness:.55,metalness:.28}),
 deck:new THREE.MeshStandardMaterial({color:0x6f6757,roughness:.88,metalness:.05}),
 deckDark:new THREE.MeshStandardMaterial({color:0x343a3e,roughness:.8,metalness:.12}),
 steel:new THREE.MeshStandardMaterial({color:0x77838a,roughness:.52,metalness:.38}),
 black:new THREE.MeshStandardMaterial({color:0x1e2428,roughness:.7,metalness:.18}),
 wood:new THREE.MeshStandardMaterial({color:0x74644e,roughness:.92,metalness:.02}),
 white:new THREE.MeshBasicMaterial({color:0xe7ecee}),
 red:new THREE.MeshBasicMaterial({color:0xb8443b}),
 yellow:new THREE.MeshBasicMaterial({color:0xe5d289})
};

function mesh(g,m,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;return o}
function box(x,y,z,m,px=0,py=0,pz=0){return mesh(new THREE.BoxGeometry(x,y,z),m,px,py,pz)}
function cyl(r1,r2,h,m,px=0,py=0,pz=0,seg=10){return mesh(new THREE.CylinderGeometry(r1,r2,h,seg),m,px,py,pz)}

function hullShape(length,width,height){
  const s=new THREE.Shape();
  s.moveTo(0,-length*.5);
  s.bezierCurveTo(width*.52,-length*.42,width*.56,-length*.18,width*.5,0);
  s.bezierCurveTo(width*.5,length*.26,width*.35,length*.44,0,length*.5);
  s.bezierCurveTo(-width*.35,length*.44,-width*.5,length*.26,-width*.5,0);
  s.bezierCurveTo(-width*.56,-length*.18,-width*.52,-length*.42,0,-length*.5);
  const geo=new THREE.ExtrudeGeometry(s,{depth:height,bevelEnabled:true,bevelThickness:1.8,bevelSize:1.2,bevelSegments:2,steps:1});
  geo.rotateX(Math.PI/2); geo.translate(0,height*.5,0);
  return geo;
}

function gunTurret(scale=1){
  const g=new THREE.Group();
  const base=cyl(8*scale,9*scale,5*scale,mats.steel,0,2.5*scale,0,12);g.add(base);
  const roof=box(16*scale,4*scale,13*scale,mats.steel,0,6*scale,-1*scale);g.add(roof);
  for(const x of[-3.5,0,3.5]){
    const b=cyl(.75*scale,.9*scale,24*scale,mats.black,x*scale,7*scale,-14*scale,8);
    b.rotation.x=Math.PI/2;g.add(b);
  }
  return g;
}
function aaMount(scale=1){
  const g=new THREE.Group();g.add(cyl(2.2*scale,2.5*scale,1.6*scale,mats.steel,0,.8*scale,0,8));
  for(const x of[-.7,.7]){const b=cyl(.22*scale,.28*scale,7*scale,mats.black,x*scale,2.2*scale,-3.2*scale,6);b.rotation.x=Math.PI/2;g.add(b)}return g;
}
function mast(scale=1){
  const g=new THREE.Group();
  const pole=cyl(.7*scale,.95*scale,24*scale,mats.black,0,12*scale,0,8);g.add(pole);
  const yard=box(18*scale,.6*scale,.6*scale,mats.black,0,17*scale,0);g.add(yard);
  const top=box(6*scale,2.2*scale,5*scale,mats.steel,0,22*scale,0);g.add(top);return g;
}

function buildBattleship(old){
  const g=new THREE.Group();g.name='Professional battleship';
  g.add(mesh(hullShape(132,50,14),mats.hull,0,0,0));
  g.add(box(45,4.5,118,mats.deck,0,13,-1));
  g.add(box(31,13,32,mats.steel,0,21,5));
  g.add(box(23,11,24,mats.steel,0,32,4));
  const bridge=box(19,10,16,mats.steel,0,42,0);g.add(bridge);
  for(const z of[-40,-20,33,48]){const t=gunTurret(.82);t.position.set(0,15,z);if(z>0)t.rotation.y=Math.PI;g.add(t)}
  for(const z of[-12,15]){const f=cyl(4.8,5.6,18,mats.black,0,38,z,12);f.rotation.z=.05;g.add(f)}
  const m1=mast(.85);m1.position.set(0,42,-5);g.add(m1);const m2=mast(.7);m2.position.set(0,36,28);g.add(m2);
  for(const x of[-19,19])for(const z of[-32,-8,18,41]){const a=aaMount(.8);a.position.set(x,16,z);g.add(a)}
  for(const x of[-24,24]){const rail=box(.45,2,95,mats.black,x,17,0);g.add(rail)}
  // bow anchor details
  for(const x of[-11,11]){const a=cyl(2.2,2.2,1.4,mats.black,x,10,-56,12);a.rotation.x=Math.PI/2;g.add(a)}
  return g;
}

function buildCarrier(old){
  const g=new THREE.Group();g.name='Professional aircraft carrier';
  g.add(mesh(hullShape(220,72,14),mats.hullDark,0,0,0));
  g.add(box(68,4,214,mats.deckDark,0,15,0));
  // angled bow and deck edge visual blocks
  g.add(box(62,1.2,202,mats.deck,0,17.6,0));
  const island=new THREE.Group();
  island.add(box(17,15,36,mats.steel,24,26,5));
  island.add(box(13,12,23,mats.steel,24,39,4));
  island.add(cyl(4,4.7,16,mats.black,24,54,7,10));
  const mast1=mast(.7);mast1.position.set(24,48,-5);island.add(mast1);g.add(island);
  // deck centerline and landing markings
  for(let z=-85;z<=80;z+=18){g.add(box(1.2,.25,10,mats.white,0,18.4,z))}
  g.add(box(2.2,.26,188,mats.yellow,-18,18.45,0));
  g.add(box(2.2,.26,188,mats.yellow,18,18.45,0));
  // elevators
  for(const z of[-45,38]){const e=box(24,.35,30,mats.hull,12,18.6,z);g.add(e)}
  // defensive mounts
  for(const x of[-31,31])for(const z of[-76,-30,24,72]){const a=aaMount(.9);a.position.set(x,17,z);g.add(a)}
  return g;
}

function transferAndReplace(o,newModel){
  const keep=o.children.filter(c=>c.userData?.__targetMarker || c.type==='Sprite');
  for(const c of [...o.children])if(!keep.includes(c))o.remove(c);
  o.add(newModel);
  newModel.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true}});
  upgraded.add(o);
}

function upgradeShips(state){
  for(const o of state?.contacts||[]){
    if(!o?.parent||upgraded.has(o))continue;
    const t=o.userData?.type;
    if(t==='carrier')transferAndReplace(o,buildCarrier(o));
    else if(t==='ship')transferAndReplace(o,buildBattleship(o));
  }
}

function addOceanDetail(scene){
  if(scene.userData.__proOcean)return;scene.userData.__proOcean=true;
  // subtle sun glints / wave strips, cheap enough for mobile
  const mat=new THREE.MeshBasicMaterial({color:0x9bd9ec,transparent:true,opacity:.08,depthWrite:false});
  for(let i=0;i<70;i++){
    const w=box(18+Math.random()*55,.05,.6+Math.random()*1.2,mat,(Math.random()-.5)*2600,1.15,-200-Math.random()*3300);
    w.rotation.y=(Math.random()-.5)*.8;scene.add(w);
  }
}
function addAtmosphere(scene){
  if(scene.userData.__proAtmos)return;scene.userData.__proAtmos=true;
  scene.fog && (scene.fog.density*=.72);
  scene.add(new THREE.DirectionalLight(0xffd59a,.55));
  scene.children[scene.children.length-1].position.set(500,350,-900);
}
function enhanceScene(state){
  const p=state?.player;if(!p?.parent)return;const scene=p.parent;
  if(!sceneDone){sceneDone=true;addAtmosphere(scene);if(!state.mission?.land)addOceanDetail(scene)}
}

function frame(){requestAnimationFrame(frame);const s=window.AeroOpsState;if(!s?.player)return;enhanceScene(s);upgradeShips(s)}
requestAnimationFrame(frame);
