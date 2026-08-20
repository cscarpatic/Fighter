import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

let activeScene=null, root=null;
const mat=(c,r=.8,m=.05)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const M={concrete:mat(0x8f9694,.95,.04),road:mat(0x44494b,.95,.02),sand:mat(0xb8a77e,1,0),steel:mat(0x606b70,.55,.3),roof:mat(0x5f655c,.88,.05),brick:mat(0x7c6151,.92,.02),green:mat(0x50633d,.98,0),water:mat(0x2c7890,.4,.08),oil:mat(0x5a5d59,.65,.18)};
function mesh(g,m,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.receiveShadow=true;o.castShadow=true;return o}
function box(g,x,y,z,m){const o=mesh(new THREE.BoxGeometry(x,y,z),m);g.add(o);return o}
function runway(g,x,z,len=520,w=42,rot=0){const r=mesh(new THREE.BoxGeometry(w,.5,len),M.road,x,.4,z);r.rotation.y=rot;g.add(r);for(let k=-len/2+35;k<len/2;k+=55){const p=mesh(new THREE.BoxGeometry(2,.55,24),M.concrete,x,.75,z+k);p.rotation.y=rot;g.add(p)}}
function hangar(g,x,z,s=1){const h=mesh(new THREE.BoxGeometry(70*s,24*s,50*s),M.roof,x,12*s,z);g.add(h);const d=mesh(new THREE.BoxGeometry(38*s,15*s,.7),M.road,x,9*s,z-25*s);g.add(d)}
function tank(g,x,z,s=1){const t=mesh(new THREE.CylinderGeometry(15*s,15*s,16*s,20),M.oil,x,8*s,z);g.add(t);const top=mesh(new THREE.CylinderGeometry(15.3*s,15.3*s,.8*s,20),M.steel,x,16.3*s,z);g.add(top)}
function dock(g,x,z,len=300,rot=0){const d=mesh(new THREE.BoxGeometry(25,2,len),M.concrete,x,1,z);d.rotation.y=rot;g.add(d)}
function bridge(g,x,z,len=280,rot=0){const deck=mesh(new THREE.BoxGeometry(18,4,len),M.concrete,x,20,z);deck.rotation.y=rot;g.add(deck);for(const q of[-.35,0,.35]){const p=mesh(new THREE.BoxGeometry(10,38,10),M.concrete,x,0,z+len*q);p.rotation.y=rot;g.add(p)}}
function radar(g,x,z){const mast=mesh(new THREE.CylinderGeometry(1.2,1.7,48,10),M.steel,x,24,z);g.add(mast);const dish=mesh(new THREE.TorusGeometry(14,1.2,8,24,Math.PI),M.steel,x,48,z);dish.rotation.z=Math.PI/2;g.add(dish)}
function factory(g,x,z,scale=1){for(let i=0;i<3;i++){const b=mesh(new THREE.BoxGeometry(70*scale,28*scale,55*scale),M.brick,x+(i-1)*78*scale,14*scale,z);g.add(b)}for(let i=0;i<3;i++){const c=mesh(new THREE.CylinderGeometry(5*scale,6*scale,60*scale,12),M.brick,x+(i-1)*60*scale,30*scale,z+45*scale);g.add(c)}}
function rail(g,x,z,len=550,rot=0){for(const off of[-3,3]){const r=mesh(new THREE.BoxGeometry(.7,.25,len),M.steel,x+off,.3,z);r.rotation.y=rot;g.add(r)}for(let k=-len/2;k<len/2;k+=16){const s=mesh(new THREE.BoxGeometry(12,.25,1.2),M.road,x,.2,z+k);s.rotation.y=rot;g.add(s)}}
function dam(g,x,z){const d=mesh(new THREE.BoxGeometry(360,70,28),M.concrete,x,35,z);g.add(d);for(const sx of[-120,-40,40,120]){const spill=mesh(new THREE.BoxGeometry(45,42,3),M.water,x+sx,18,z-16);g.add(spill)}}
function village(g,x,z,n=18,spread=340){for(let i=0;i<n;i++){const px=x+(Math.random()-.5)*spread,pz=z+(Math.random()-.5)*spread;const h=mesh(new THREE.BoxGeometry(18,10+Math.random()*8,22),M.brick,px,6,pz);g.add(h)}}
function build(name,scene){const g=new THREE.Group();g.name='Historical infrastructure';
  if(name==='Pearl Harbor'){dock(g,-20,-1160,620,0);dock(g,260,-1330,420,0);runway(g,-320,-1220,560,46,0);runway(g,500,-850,620,48,.1);for(const p of[[-430,-900],[-500,-980],[390,-720],[470,-700]])tank(g,...p,1.2);for(const p of[[-350,-1080],[-250,-1180],[430,-930],[580,-920]])hangar(g,...p,.8)}
  else if(name==='Midway'){runway(g,0,-2100,720,44,.15);for(const p of[[-110,-2050],[120,-2180],[210,-2010]])hangar(g,...p,.75);radar(g,260,-2250);dock(g,-300,-2400,300,.15)}
  else if(name==='Normandia'){for(let x=-1200;x<=1200;x+=180){const b=mesh(new THREE.BoxGeometry(90,4,20),M.concrete,x,2,-1460+Math.sin(x*.004)*80);g.add(b)}village(g,-420,-1320,22,420);village(g,380,-1330,25,450);road(g=>g);}
  else if(name.includes('Ploie')){factory(g,0,-1350,1.2);for(const p of[[-320,-1200],[-220,-1430],[260,-1250],[360,-1450],[60,-1600]])tank(g,...p,1.35);rail(g,0,-1780,900,.08)}
  else if(name.includes('Dambusters')||name.includes('Ruhr')){dam(g,0,-1500);village(g,420,-1250,20,500);factory(g,-500,-1250,.8)}
  else if(name.includes('Leyte')){dock(g,-350,-1450,460,.05);runway(g,540,-1250,620,46,-.08);for(const p of[[470,-1300],[600,-1200]])hangar(g,...p,.85)}
  else if(name.includes('MiG Alley')){runway(g,0,-1500,760,48,.04);for(const p of[[-180,-1450],[190,-1500],[-250,-1650]])hangar(g,...p,.8);rail(g,420,-1250,680,.12);bridge(g,-450,-1750,300,.1)}
  else if(name.includes('Rolling Thunder')){bridge(g,0,-1450,430,.06);rail(g,-360,-1280,760,.1);factory(g,440,-1520,.9);village(g,0,-1100,24,520)}
  else if(name.includes('Linebacker')){runway(g,-500,-1450,760,52,.03);rail(g,220,-1550,980,.05);factory(g,520,-1300,.85);radar(g,-150,-1750);for(const p of[[-610,-1410],[-420,-1490]])hangar(g,...p,.9)}
  else if(name.includes('Desert Storm')){runway(g,0,-1500,860,56,0);for(const p of[[-190,-1450],[190,-1450],[-250,-1650],[250,-1650]])hangar(g,...p,.9);radar(g,420,-1350);for(const p of[[-520,-1200],[520,-1200]])tank(g,...p,1.1)}
  scene.add(g);return g;
}
function road(){}
function tick(){requestAnimationFrame(tick);const s=window.AeroOpsState;if(!s?.player?.parent)return;const scene=s.player.parent;if(scene!==activeScene){activeScene=scene;root=build(s.mission?.n||'',scene)}}
requestAnimationFrame(tick);
