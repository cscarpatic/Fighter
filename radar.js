import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

const canvas=document.getElementById('radarCanvas');
const ctx=canvas?.getContext('2d');
const rangeLabel=document.getElementById('radarRange');
let range=2500;

function resize(){if(!canvas||!ctx)return;const dpr=Math.min(window.devicePixelRatio||1,2),r=canvas.getBoundingClientRect();canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener('resize',resize,{passive:true});

function tri(x,y,size,fill,angle=0){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*.72,size);ctx.lineTo(-size*.72,size);ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.restore()}
function diamond(x,y,size,fill){ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.fillStyle=fill;ctx.fillRect(-size/2,-size/2,size,size);ctx.restore()}
function cross(x,y,size,stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-size,y-size);ctx.lineTo(x+size,y+size);ctx.moveTo(x+size,y-size);ctx.lineTo(x-size,y+size);ctx.stroke()}
function label(text,x,y){ctx.font='8px system-ui';ctx.textAlign='left';ctx.fillStyle='rgba(235,248,255,.88)';ctx.fillText(text,x+6,y-5)}
function plot(obj,kind,cx,cy,scale,player){if(!obj||!obj.parent||obj.userData?.dead)return;const dx=obj.position.x-player.position.x,dz=obj.position.z-player.position.z,dist=Math.hypot(dx,dz);if(dist>range)return;const x=cx+dx*scale,y=cy+dz*scale;if(kind==='enemy'){const f=new THREE.Vector3(0,0,-1).applyQuaternion(obj.quaternion);tri(x,y,5,'#ff6262',Math.atan2(f.x,-f.z));return}if(kind==='aa'){cross(x,y,4,'#ffb35c');return}const type=obj.userData?.type;if(type==='ship'||type==='carrier'){ctx.strokeStyle='#63d8ff';ctx.lineWidth=2;ctx.beginPath();ctx.rect(x-5,y-3,10,6);ctx.stroke();if(type==='carrier'){ctx.beginPath();ctx.moveTo(x-7,y);ctx.lineTo(x+7,y);ctx.stroke()}}else diamond(x,y,7,'#f6d365');if(obj.userData?.objective||type==='carrier')label(obj.userData?.name||'',x,y)}

function draw(){requestAnimationFrame(draw);if(!canvas||!ctx)return;const game=document.getElementById('game');if(game?.classList.contains('hidden'))return;const state=window.AeroOpsState,player=state?.player;if(canvas.width===0||canvas.height===0)resize();const r=canvas.getBoundingClientRect(),w=r.width,h=r.height,cx=w/2,cy=h/2;ctx.clearRect(0,0,w,h);ctx.fillStyle='rgba(3,14,22,.88)';ctx.fillRect(0,0,w,h);const radius=Math.min(w,h)*.45;ctx.strokeStyle='rgba(126,218,244,.25)';ctx.lineWidth=1;for(const frac of[.25,.5,.75,1]){ctx.beginPath();ctx.arc(cx,cy,radius*frac,0,Math.PI*2);ctx.stroke()}ctx.beginPath();ctx.moveTo(cx,cy-radius);ctx.lineTo(cx,cy+radius);ctx.moveTo(cx-radius,cy);ctx.lineTo(cx+radius,cy);ctx.stroke();ctx.font='9px system-ui';ctx.textAlign='center';ctx.fillStyle='rgba(225,246,255,.82)';ctx.fillText('N',cx,10);ctx.fillText('S',cx,h-4);ctx.fillText('W',6,cy+3);ctx.fillText('E',w-6,cy+3);if(!player||!player.parent){ctx.font='11px system-ui';ctx.fillStyle='rgba(220,240,248,.72)';ctx.fillText('RADAR IN ATTESA',cx,cy);return}const scale=radius/range;(state.contacts||[]).forEach(o=>plot(o,'contact',cx,cy,scale,player));(state.guns||[]).forEach(o=>plot(o,'aa',cx,cy,scale,player));(state.enemies||[]).forEach(o=>plot(o,'enemy',cx,cy,scale,player));const f=new THREE.Vector3(0,0,-1).applyQuaternion(player.quaternion);tri(cx,cy,7,'#8affce',Math.atan2(f.x,-f.z));ctx.strokeStyle='rgba(138,255,206,.72)';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+f.x*25,cy+f.z*25);ctx.stroke();ctx.font='8px system-ui';ctx.textAlign='right';ctx.fillStyle='rgba(220,240,248,.7)';ctx.fillText(`${(range/1000).toFixed(1)} km`,w-5,h-5)}

document.getElementById('radarToggle')?.addEventListener('click',()=>document.getElementById('radar')?.classList.toggle('compact'));
document.getElementById('radarZoom')?.addEventListener('click',()=>{range=range===2500?4200:2500;if(rangeLabel)rangeLabel.textContent=range===2500?'2.5 km':'4.2 km'});
resize();draw();
await import('./loader.js?v=4');
