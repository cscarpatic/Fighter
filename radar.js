import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

const oldCanvas=document.getElementById('radarCanvas');
const rangeLabel=document.getElementById('radarRange');
let zoom=1,sceneEnhanced=false,markers=[];
const NS='http://www.w3.org/2000/svg';
const svg=document.createElementNS(NS,'svg');
svg.id='radarSvg';svg.setAttribute('viewBox','0 0 210 190');svg.setAttribute('preserveAspectRatio','xMidYMid meet');svg.style.cssText='display:block;width:100%;height:190px;background:radial-gradient(circle,#0a2632,#06121a);';
oldCanvas?.replaceWith(svg);

const el=(name,attrs={})=>{const n=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);return n};
function text(x,y,s,fill='#dff7ff',size=8,anchor='start'){const n=el('text',{x,y,fill,'font-size':size,'font-family':'system-ui','font-weight':'700','text-anchor':anchor});n.textContent=s;svg.appendChild(n);return n}
function alive(o){return !!o&&!o.userData?.dead&&!!o.position}
function isObjective(o,state){return !!o?.userData?.objective&&(state?.targets||[]).includes(o)}
function staticObjects(state){const a=[];for(const list of[state?.contacts,state?.guns])for(const o of list||[])if(alive(o))a.push(o);return a}
function bounds(state){const all=staticObjects(state);if(!all.length)return{minX:-1200,maxX:1200,minZ:-2700,maxZ:700};let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;for(const o of all){minX=Math.min(minX,o.position.x);maxX=Math.max(maxX,o.position.x);minZ=Math.min(minZ,o.position.z);maxZ=Math.max(maxZ,o.position.z)}const px=Math.max(380,(maxX-minX)*.24),pz=Math.max(520,(maxZ-minZ)*.22);return{minX:minX-px,maxX:maxX+px,minZ:minZ-pz,maxZ:maxZ+pz}}
function map(o,b){const W=210,H=190,pad=13,bw=Math.max(1,b.maxX-b.minX),bh=Math.max(1,b.maxZ-b.minZ),s=Math.min((W-pad*2)/bw,(H-pad*2)/bh)*zoom,cx=(b.minX+b.maxX)/2,cz=(b.minZ+b.maxZ)/2;return{x:W/2+(o.position.x-cx)*s,y:H/2+(o.position.z-cz)*s}}
function inMap(x,y){return x>=-12&&x<=222&&y>=-12&&y<=202}
function drawGrid(){svg.innerHTML='';for(const f of[.25,.5,.75]){svg.appendChild(el('line',{x1:210*f,y1:0,x2:210*f,y2:190,stroke:'#4b91a8','stroke-opacity':.18}));svg.appendChild(el('line',{x1:0,y1:190*f,x2:210,y2:190*f,stroke:'#4b91a8','stroke-opacity':.18}))}text(105,10,'N','#dff7ff',9,'middle');text(105,187,'S','#dff7ff',9,'middle');text(5,98,'W','#dff7ff',9);text(205,98,'E','#dff7ff',9,'end')}
function plotContact(o,b,state){if(!alive(o))return;const{x,y}=map(o,b);if(!inMap(x,y))return;const type=o.userData?.type,target=isObjective(o,state);if(type==='ship'||type==='carrier'){svg.appendChild(el('rect',{x:x-5,y:y-3,width:10,height:6,fill:'none',stroke:target?'#ff5252':'#63d8ff','stroke-width':target?2.5:1.7}));if(type==='carrier')svg.appendChild(el('line',{x1:x-7,y1:y,x2:x+7,y2:y,stroke:target?'#ff5252':'#63d8ff','stroke-width':1.5}));if(target){svg.appendChild(el('circle',{cx:x,cy:y,r:10,fill:'none',stroke:'#ff5252','stroke-width':2}));text(x+8,y-7,`P${(o.userData.rank??0)+1} ${o.userData?.name||''}`,'#ff9393',7)}}else{svg.appendChild(el('rect',{x:x-4,y:y-4,width:8,height:8,fill:target?'#ffd84d':'#e6bf62',transform:`rotate(45 ${x} ${y})`}));if(target){svg.appendChild(el('circle',{cx:x,cy:y,r:9,fill:'none',stroke:'#ffd84d','stroke-width':1.7}));text(x+7,y-6,`P${(o.userData.rank??0)+1} ${o.userData?.name||''}`,'#ffe58a',7)}}}
function plotAA(o,b){if(!alive(o))return;const{x,y}=map(o,b);if(!inMap(x,y))return;svg.appendChild(el('line',{x1:x-4,y1:y-4,x2:x+4,y2:y+4,stroke:'#ffad52','stroke-width':2}));svg.appendChild(el('line',{x1:x+4,y1:y-4,x2:x-4,y2:y+4,stroke:'#ffad52','stroke-width':2}))}
function headingDeg(o){const f=new THREE.Vector3(0,0,-1).applyQuaternion(o.quaternion);return Math.atan2(f.x,-f.z)*180/Math.PI}
function plotEnemy(o,b){if(!alive(o))return;const{x,y}=map(o,b);if(!inMap(x,y))return;svg.appendChild(el('polygon',{points:`${x},${y-5} ${x+4},${y+5} ${x-4},${y+5}`,fill:'#ff6262',transform:`rotate(${headingDeg(o)} ${x} ${y})`}))}
function plotPlayer(o,b){const{x,y}=map(o,b),cx=Math.max(8,Math.min(202,x)),cy=Math.max(8,Math.min(182,y)),off=x!==cx||y!==cy;svg.appendChild(el('polygon',{points:`${cx},${cy-8} ${cx+6},${cy+7} ${cx-6},${cy+7}`,fill:'#8affce',stroke:'#d9fff1','stroke-width':1.2,transform:`rotate(${headingDeg(o)} ${cx} ${cy})`}));text(cx+9,cy-8,off?'TU →':'TU','#aaffdf',7)}

function markerStyle(obj){
  const t=obj?.userData?.type;
  if(t==='ship'||t==='carrier')return{color:0xff3b3b,bg:'rgba(105,0,0,.86)',label:'NAVE'};
  if(t==='aa')return{color:0xff9f36,bg:'rgba(100,45,0,.86)',label:'AA'};
  return{color:0xffd23f,bg:'rgba(95,72,0,.86)',label:'TARGET'};
}
function makeTextSprite(obj,style){
  const c=document.createElement('canvas');c.width=640;c.height=144;const g=c.getContext('2d');
  const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthTest:false}));
  spr.scale.set(175,40,1);
  return{spr,canvas:c,ctx:g,style,last:''};
}
function updateMarkerLabel(m,player){
  const dist=player?.position&&m.obj?.position?Math.round(player.position.distanceTo(m.obj.position)):0;
  const rank=(m.obj.userData.rank??0)+1;
  const name=m.obj.userData.name||m.style.label;
  const s=`P${rank} • ${name} • ${dist} m`;
  if(s===m.last)return;m.last=s;
  const g=m.ctx,c=m.canvas;g.clearRect(0,0,c.width,c.height);g.fillStyle=m.style.bg;g.beginPath();g.roundRect(10,18,620,106,20);g.fill();g.strokeStyle=`#${m.style.color.toString(16).padStart(6,'0')}`;g.lineWidth=5;g.stroke();g.fillStyle='#fff';g.font='700 34px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(s,320,71);m.spr.material.map.needsUpdate=true;
}
function addTargetMarker(obj){
  if(!obj||obj.userData.__targetMarker)return;obj.userData.__targetMarker=true;
  const style=markerStyle(obj),group=new THREE.Group();group.userData.__targetMarker=true;
  const radius=(obj.userData.type==='carrier'?42:obj.userData.type==='ship'?34:24);
  const ring=new THREE.Mesh(new THREE.RingGeometry(radius,radius+6,48),new THREE.MeshBasicMaterial({color:style.color,transparent:true,opacity:.94,side:THREE.DoubleSide,depthTest:false}));ring.rotation.x=-Math.PI/2;ring.position.y=3;group.add(ring);
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,105,8),new THREE.MeshBasicMaterial({color:style.color,transparent:true,opacity:.48,depthTest:false}));beam.position.y=54;group.add(beam);
  const top=new THREE.Mesh(new THREE.OctahedronGeometry(6,0),new THREE.MeshBasicMaterial({color:style.color,transparent:true,opacity:.95,depthTest:false}));top.position.y=110;group.add(top);
  const label=makeTextSprite(obj,style);label.spr.position.y=130;group.add(label.spr);
  obj.add(group);markers.push({group,ring,top,obj,style,phase:Math.random()*Math.PI*2,...label});
}
function enhance(state){const p=state?.player;if(!p?.parent)return;const scene=p.parent;if(!sceneEnhanced){sceneEnhanced=true;scene.add(new THREE.HemisphereLight(0xbfe9ff,0x4e5840,.35))}for(const o of state.targets||[])if(alive(o))addTargetMarker(o)}
function animateMarkers(time,state){for(const m of markers){if(!m.obj?.parent||m.obj.userData?.dead){m.group.visible=false;continue}m.group.visible=true;const pulse=1+Math.sin(time*3+m.phase)*.09;m.ring.scale.setScalar(pulse);m.top.rotation.y=time*1.8;m.top.position.y=110+Math.sin(time*2.2+m.phase)*5;updateMarkerLabel(m,state?.player)}}

function draw(){requestAnimationFrame(draw);if(document.getElementById('game')?.classList.contains('hidden'))return;drawGrid();const state=window.AeroOpsState||{},player=state.player;if(!player?.position){text(105,98,'SINCRONIZZAZIONE…','#ffd88a',10,'middle');return}enhance(state);animateMarkers(performance.now()/1000,state);const b=bounds(state);for(const o of state.contacts||[])plotContact(o,b,state);for(const o of state.guns||[])plotAA(o,b);for(const o of state.enemies||[])plotEnemy(o,b);plotPlayer(player,b);text(205,184,zoom===1?'SCENARIO FISSO':'ZOOM','#a7cfdb',7,'end')}

document.getElementById('radarToggle')?.addEventListener('click',()=>document.getElementById('radar')?.classList.toggle('compact'));
document.getElementById('radarZoom')?.addEventListener('click',()=>{zoom=zoom===1?1.3:1;if(rangeLabel)rangeLabel.textContent=zoom===1?'SCENARIO':'ZOOM'});
draw();
await import('./loader.js?v=12');
