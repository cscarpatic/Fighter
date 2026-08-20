import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

const entries=new WeakMap();
const destroyedShown=new WeakSet();
const active=[];

function roleFor(o){
  const t=o.userData?.type,n=o.userData?.name||'';
  if(t==='carrier')return 'PORTAEREI';
  if(t==='ship'){
    if(/Musashi|Yamato|Nagato|Arizona|California|Maryland|Oklahoma|Tennessee|West Virginia|Nevada/i.test(n))return 'CORAZZATA';
    if(/Tone|Chikuma/i.test(n))return 'INCROCIATORE';
    if(/Destroyer/i.test(n))return 'CACCIATORPEDINIERE';
    return 'NAVE DA GUERRA';
  }
  if(t==='hangar'){
    if(/airfield|Field|base|Gia Lam|Bac Mai|Sinuiju|H-3|Al Taqaddum/i.test(n))return 'AEROPORTO';
    if(/rail|Yen Vien|Kinh No/i.test(n))return 'SCALO FERROVIARIO';
    if(/Refinery|Astra|Columbia|Vega|Orion/i.test(n))return 'RAFFINERIA';
    return 'INSTALLAZIONE';
  }
  if(t==='armor'){
    if(/Bridge|Ponte|Yalu/i.test(n))return 'PONTE';
    if(/Diga|Dam/i.test(n))return 'DIGA';
    if(/depot|Deposito|bunker/i.test(n))return 'OBIETTIVO PESANTE';
    return 'BERSAGLIO TERRESTRE';
  }
  if(t==='aa')return 'DIFESA ANTIAEREA';
  return 'OBIETTIVO';
}

function palette(o){
  const t=o.userData?.type;
  if(t==='ship'||t==='carrier')return{hex:0xff3154,main:'#ff3154',soft:'#ff9bad'};
  if(t==='aa')return{hex:0xff8b27,main:'#ff8b27',soft:'#ffc686'};
  return{hex:0xffd229,main:'#ffd229',soft:'#fff19a'};
}
function stateFor(o){
  if(o.userData?.dead||o.userData?.hp<=0)return{label:'DISTRUTTO',color:'#ff3b30'};
  const max=Number(o.userData?.maxHp)||Number(o.userData?.hp)||1;
  const hp=Math.max(0,Number(o.userData?.hp)||0),r=hp/max;
  if(r<=.32)return{label:'CRITICO',color:'#ff5a36'};
  if(r<.78)return{label:'DANNEGGIATO',color:'#ffb22e'};
  return{label:'INTEGRO',color:'#69f0ae'};
}
function fitFont(ctx,text,maxWidth,start,min=38){
  let size=start;
  while(size>min){ctx.font=`900 ${size}px Arial Black, Impact, system-ui, sans-serif`;if(ctx.measureText(text).width<=maxWidth)break;size-=3;}
  return size;
}
function makeLabel(o,p){
  const c=document.createElement('canvas');c.width=1400;c.height=330;
  const x=c.getContext('2d');
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false}));
  s.renderOrder=2000;
  const obj={canvas:c,ctx:x,tex,s,last:''};
  drawLabel(obj,o,p,true);
  return obj;
}
function drawTextStroke(ctx,text,x,y,size,fill,stroke='#071018',lw=13){
  ctx.font=`900 ${size}px Arial Black, Impact, system-ui, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
  ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.strokeText(text,x,y);ctx.fillStyle=fill;ctx.fillText(text,x,y);
}
function drawLabel(l,o,p,force=false){
  const st=stateFor(o),name=(o.userData?.name||'TARGET').toUpperCase(),role=roleFor(o),rank=(o.userData.rank??0)+1;
  const key=[name,role,st.label,o.userData.hp,o.userData.maxHp].join('|');if(!force&&key===l.last)return;l.last=key;
  const x=l.ctx,c=l.canvas;x.clearRect(0,0,c.width,c.height);
  // No opaque grey panel: only subtle colored glow and outlined HUD typography.
  x.shadowBlur=28;x.shadowColor=p.main;
  drawTextStroke(x,`P${rank}  ${name}`,700,92,fitFont(x,`P${rank}  ${name}`,1280,88,50),'#ffffff','#071018',16);
  x.shadowBlur=18;x.shadowColor=p.main;drawTextStroke(x,role,700,185,54,p.soft,'#071018',12);
  x.shadowBlur=20;x.shadowColor=st.color;drawTextStroke(x,st.label,700,265,50,st.color,'#071018',12);
  l.tex.needsUpdate=true;
  const length=Math.max(name.length,role.length);const w=Math.max(300,Math.min(430,310+length*3.3));l.s.scale.set(w,Math.round(w*.235),1);
}

function add(o){
  if(entries.has(o))return entries.get(o);
  const p=palette(o),nav=['ship','carrier'].includes(o.userData?.type),r=nav?40:27,g=new THREE.Group();g.userData.__targetMarker=true;
  const ring=new THREE.Mesh(new THREE.RingGeometry(r,r+7,48),new THREE.MeshBasicMaterial({color:p.hex,transparent:true,opacity:.95,side:THREE.DoubleSide,depthTest:false}));ring.rotation.x=-Math.PI/2;ring.position.y=5;ring.renderOrder=1998;g.add(ring);
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,110,8),new THREE.MeshBasicMaterial({color:p.hex,transparent:true,opacity:.42,depthTest:false}));beam.position.y=58;beam.renderOrder=1997;g.add(beam);
  const top=new THREE.Mesh(new THREE.OctahedronGeometry(8),new THREE.MeshBasicMaterial({color:p.hex,depthTest:false}));top.position.y=116;top.renderOrder=1999;g.add(top);
  const label=makeLabel(o,p);label.s.position.y=165;g.add(label.s);
  o.add(g);o.userData.__targetMarker=true;
  const e={o,g,ring,top,label,p,phase:Math.random()*6};entries.set(o,e);active.push(e);return e;
}

function destroyedSprite(o,scene){
  if(destroyedShown.has(o)||!scene)return;destroyedShown.add(o);
  const c=document.createElement('canvas');c.width=900;c.height=220;const x=c.getContext('2d');
  x.shadowBlur=30;x.shadowColor='#ff2f2f';drawTextStroke(x,'DISTRUTTO',450,92,92,'#ff5348','#180000',18);
  const name=(o.userData?.name||'OBIETTIVO').toUpperCase();drawTextStroke(x,name,450,169,42,'#ffd2cf','#180000',10);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false,opacity:1}));
  s.scale.set(330,81,1);s.position.copy(o.position||new THREE.Vector3());s.position.y+=120;scene.add(s);
  const born=performance.now();function fade(now){const age=(now-born)/1000;if(age>4.2){scene.remove(s);tex.dispose();s.material.dispose();return}s.material.opacity=Math.max(0,1-Math.max(0,age-2.8)/1.4);s.position.y+=.07;requestAnimationFrame(fade)}requestAnimationFrame(fade);
}

function frame(t=0){
  requestAnimationFrame(frame);const state=window.AeroOpsState,scene=state?.player?.parent;if(!state)return;
  for(const o of state.targets||[]){
    if(!o)continue;
    if(o.userData?.dead||o.userData?.hp<=0){const e=entries.get(o);if(e)e.g.visible=false;destroyedSprite(o,scene);continue;}
    if(o.parent){const e=add(o);e.g.visible=true;drawLabel(e.label,o,e.p);const q=1+Math.sin(t*.004+e.phase)*.05;e.ring.scale.setScalar(q);e.top.position.y=116+Math.sin(t*.003+e.phase)*4;}
  }
}
frame();