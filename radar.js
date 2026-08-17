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
function objects(state){const a=[];if(alive(state?.player))a.push(state.player);for(const list of[state?.contacts,state?.guns,state?.enemies])for(const o of list||[])if(alive(o))a.push(o);return a}
function bounds(state){const all=objects(state);if(!all.length)return{minX:-1200,maxX:1200,minZ:-2700,maxZ:700};let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;for(const o of all){minX=Math.min(minX,o.position.x);maxX=Math.max(maxX,o.position.x);minZ=Math.min(minZ,o.position.z);maxZ=Math.max(maxZ,o.position.z)}const px=Math.max(280,(maxX-minX)*.15),pz=Math.max(340,(maxZ-minZ)*.14);return{minX:minX-px,maxX:maxX+px,minZ:minZ-pz,maxZ:maxZ+pz}}
function map(o,b){const W=210,H=190,pad=13,bw=Math.max(1,b.maxX-b.minX),bh=Math.max(1,b.maxZ-b.minZ),s=Math.min((W-pad*2)/bw,(H-pad*2)/bh)*zoom,cx=(b.minX+b.maxX)/2,cz=(b.minZ+b.maxZ)/2;return{x:W/2+(o.position.x-cx)*s,y:H/2+(o.position.z-cz)*s}}
function shipTarget(o,state){return !!o?.userData?.objective&&(o.userData.type==='ship'||o.userData.type==='carrier')&&(state.targets||[]).includes(o)}
function drawGrid(){svg.innerHTML='';for(const f of[.25,.5,.75]){svg.appendChild(el('line',{x1:210*f,y1:0,x2:210*f,y2:190,stroke:'#4b91a8','stroke-opacity':.18}));svg.appendChild(el('line',{x1:0,y1:190*f,x2:210,y2:190*f,stroke:'#4b91a8','stroke-opacity':.18}))}text(105,10,'N','#dff7ff',9,'middle');text(105,187,'S','#dff7ff',9,'middle');text(5,98,'W','#dff7ff',9);text(205,98,'E','#dff7ff',9,'end')}
function plotContact(o,b,state){if(!alive(o))return;const{x,y}=map(o,b),type=o.userData?.type,target=shipTarget(o,state);if(type==='ship'||type==='carrier'){svg.appendChild(el('rect',{x:x-5,y:y-3,width:10,height:6,fill:'none',stroke:target?'#ff5252':'#63d8ff','stroke-width':target?2.5:1.7}));if(type==='carrier')svg.appendChild(el('line',{x1:x-7,y1:y,x2:x+7,y2:y,stroke:target?'#ff5252':'#63d8ff','stroke-width':1.5}));if(target){svg.appendChild(el('circle',{cx:x,cy:y,r:10,fill:'none',stroke:'#ff5252','stroke-width':2}));text(x+8,y-7,`TARGET ${o.userData?.name||''}`,'#ff9393',7)}}else{const g=el('rect',{x:x-4,y:y-4,width:8,height:8,fill:o.userData?.objective?'#ffd84d':'#e6bf62',transform:`rotate(45 ${x} ${y})`});svg.appendChild(g);if(o.userData?.objective)text(x+7,y-6,o.userData?.name||'','#ffe58a',7)}}
function plotAA(o,b){if(!alive(o))return;const{x,y}=map(o,b);svg.appendChild(el('line',{x1:x-4,y1:y-4,x2:x+4,y2:y+4,stroke:'#ffad52','stroke-width':2}));svg.appendChild(el('line',{x1:x+4,y1:y-4,x2:x-4,y2:y+4,stroke:'#ffad52','stroke-width':2}))}
function plotEnemy(o,b){if(!alive(o))return;const{x,y}=map(o,b);svg.appendChild(el('polygon',{points:`${x},${y-5} ${x+4},${y+5} ${x-4},${y+5}`,fill:'#ff6262'}))}
function plotPlayer(o,b){const{x,y}=map(o,b);svg.appendChild(el('polygon',{points:`${x},${y-7} ${x+6},${y+7} ${x-6},${y+7}`,fill:'#8affce',stroke:'#d9fff1','stroke-width':1}));text(x+8,y-8,'TU','#aaffdf',7)}

function makeTextSprite(t){const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.fillStyle='rgba(110,0,0,.82)';g.roundRect(8,16,496,96,18);g.fill();g.strokeStyle='#ff7373';g.lineWidth=4;g.stroke();g.fillStyle='#fff';g.font='700 34px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(t,256,64);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));spr.scale.set(140,35,1);return spr}
function addTargetMarker(obj){if(!obj||obj.userData.__targetMarker)return;obj.userData.__targetMarker=true;const group=new THREE.Group(),ring=new THREE.Mesh(new THREE.RingGeometry(28,34,48),new THREE.MeshBasicMaterial({color:0xff3333,transparent:true,opacity:.92,side:THREE.DoubleSide,depthTest:false}));ring.rotation.x=-Math.PI/2;ring.position.y=3;group.add(ring);const beam=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,95,8),new THREE.MeshBasicMaterial({color:0xff4545,transparent:true,opacity:.55,depthTest:false}));beam.position.y=50;group.add(beam);const spr=makeTextSprite(`TARGET • ${obj.userData.name||'NAVE'}`);spr.position.y=108;group.add(spr);obj.add(group);markers.push({group,ring,obj,phase:Math.random()*Math.PI*2})}
function enhance(state){const p=state?.player;if(!p?.parent)return;const scene=p.parent;if(!sceneEnhanced){sceneEnhanced=true;scene.add(new THREE.HemisphereLight(0xbfe9ff,0x4e5840,.35))}for(const o of state.targets||[])if(shipTarget(o,state))addTargetMarker(o)}
function animateMarkers(time){for(const m of markers){if(!m.obj?.parent||m.obj.userData?.dead){m.group.visible=false;continue}m.group.visible=true;m.ring.scale.setScalar(1+Math.sin(time*3+m.phase)*.08)}}

function draw(){requestAnimationFrame(draw);if(document.getElementById('game')?.classList.contains('hidden'))return;drawGrid();const state=window.AeroOpsState||{},player=state.player;if(!player?.position){text(105,98,'SINCRONIZZAZIONE…','#ffd88a',10,'middle');return}enhance(state);animateMarkers(performance.now()/1000);const b=bounds(state);for(const o of state.contacts||[])plotContact(o,b,state);for(const o of state.guns||[])plotAA(o,b);for(const o of state.enemies||[])plotEnemy(o,b);plotPlayer(player,b);text(205,184,zoom===1?'SCENARIO':'ZOOM','#a7cfdb',7,'end')}

document.getElementById('radarToggle')?.addEventListener('click',()=>document.getElementById('radar')?.classList.toggle('compact'));
document.getElementById('radarZoom')?.addEventListener('click',()=>{zoom=zoom===1?1.3:1;if(rangeLabel)rangeLabel.textContent=zoom===1?'SCENARIO':'ZOOM'});
draw();
await import('./loader.js?v=10');
