import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

const entries=new WeakMap();
const destroyedShown=new WeakSet();

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
function fitFont(ctx,text,maxWidth,start,min=34){let size=start;while(size>min){ctx.font=`900 ${size}px system-ui, sans-serif`;if(ctx.measureText(text).width<=maxWidth)break;size-=2;}return size;}
function drawOutlined(ctx,text,x,y,size,fill,stroke='#05080b',lw=9){ctx.font=`900 ${size}px system-ui, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.strokeText(text,x,y);ctx.fillStyle=fill;ctx.fillText(text,x,y);}
function makeLabel(o,p){
  const c=document.createElement('canvas');c.width=1200;c.height=250;
  const ctx=c.getContext('2d');
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false,alphaTest:.02}));
  s.renderOrder=2000;
  const l={canvas:c,ctx,tex,s,last:''};drawLabel(l,o,p,true);return l;
}
function drawLabel(l,o,p,force=false){
  const st=stateFor(o),name=(o.userData?.name||'TARGET').toUpperCase(),role=roleFor(o),rank=(o.userData.rank??0)+1;
  const key=[name,role,st.label,o.userData.hp,o.userData.maxHp].join('|');if(!force&&key===l.last)return;l.last=key;
  const x=l.ctx,c=l.canvas;x.clearRect(0,0,c.width,c.height);
  x.shadowBlur=14;x.shadowColor=p.main;
  const title=`P${rank}  ${name}`;
  drawOutlined(x,title,600,70,fitFont(x,title,1080,74,40),'#ffffff','#05080b',10);
  x.shadowBlur=10;x.shadowColor=p.main;drawOutlined(x,role,600,142,42,p.soft,'#05080b',8);
  x.shadowBlur=12;x.shadowColor=st.color;drawOutlined(x,st.label,600,205,39,st.color,'#05080b',8);
  l.tex.needsUpdate=true;
  const length=Math.max(name.length,role.length);const w=Math.max(230,Math.min(330,235+length*2.5));l.s.scale.set(w,w*.208,1);
}

function add(o){
  if(entries.has(o))return entries.get(o);
  const p=palette(o),nav=['ship','carrier'].includes(o.userData?.type),r=nav?36:24,g=new THREE.Group();g.userData.__targetMarker=true;
  // Ring belongs to the world surface: respect depth so aircraft and scenery occlude it.
  const ringMat=new THREE.MeshBasicMaterial({color:p.hex,transparent:true,opacity:.48,side:THREE.DoubleSide,depthTest:true,depthWrite:false});
  const ring=new THREE.Mesh(new THREE.RingGeometry(r,r+3.5,40),ringMat);ring.rotation.x=-Math.PI/2;ring.position.y=1.2;ring.renderOrder=0;g.add(ring);
  // Small pointer also respects depth; only the text label remains an overlay.
  const pointer=new THREE.Mesh(new THREE.ConeGeometry(3.2,8,8),new THREE.MeshBasicMaterial({color:p.hex,transparent:true,opacity:.72,depthTest:true,depthWrite:false}));pointer.position.y=58;pointer.rotation.z=Math.PI;pointer.renderOrder=0;g.add(pointer);
  const label=makeLabel(o,p);label.s.position.y=92;g.add(label.s);
  o.add(g);o.userData.__targetMarker=true;
  const e={o,g,ring,pointer,label,p,phase:Math.random()*6};entries.set(o,e);return e;
}

function destroyedSprite(o,scene){
  if(destroyedShown.has(o)||!scene)return;destroyedShown.add(o);
  const c=document.createElement('canvas');c.width=900;c.height=180;const x=c.getContext('2d');
  x.shadowBlur=22;x.shadowColor='#ff2f2f';drawOutlined(x,'DISTRUTTO',450,70,82,'#ff5348','#180000',14);
  drawOutlined(x,(o.userData?.name||'OBIETTIVO').toUpperCase(),450,135,38,'#ffd2cf','#180000',8);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false,opacity:1}));
  s.scale.set(300,60,1);s.position.copy(o.position||new THREE.Vector3());s.position.y+=105;scene.add(s);
  const born=performance.now();function fade(now){const age=(now-born)/1000;if(age>3.6){scene.remove(s);tex.dispose();s.material.dispose();return}s.material.opacity=Math.max(0,1-Math.max(0,age-2.3)/1.3);s.position.y+=.05;requestAnimationFrame(fade)}requestAnimationFrame(fade);
}

function frame(t=0){
  requestAnimationFrame(frame);const state=window.AeroOpsState,scene=state?.player?.parent;if(!state)return;
  for(const o of state.targets||[]){
    if(!o)continue;
    if(o.userData?.dead||o.userData?.hp<=0){const e=entries.get(o);if(e)e.g.visible=false;destroyedSprite(o,scene);continue;}
    if(o.parent){const e=add(o);e.g.visible=true;drawLabel(e.label,o,e.p);const q=1+Math.sin(t*.004+e.phase)*.025;e.ring.scale.setScalar(q);e.pointer.position.y=58+Math.sin(t*.003+e.phase)*2;}
  }
}
frame();