import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';
const done=new WeakSet();

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
  if(t==='ship'||t==='carrier') return {main:'#ff334f',light:'#ffd7de',dark:'rgba(95,0,18,.94)',hex:0xff334f};
  if(t==='aa') return {main:'#ff8a25',light:'#ffe3c5',dark:'rgba(100,38,0,.94)',hex:0xff8a25};
  return {main:'#ffd329',light:'#fff1a8',dark:'rgba(86,65,0,.94)',hex:0xffd329};
}

function label(o,p){
  const c=document.createElement('canvas');c.width=1024;c.height=256;
  const x=c.getContext('2d');
  x.shadowColor='rgba(0,0,0,.65)';x.shadowBlur=16;
  x.fillStyle=p.dark;x.beginPath();x.roundRect(14,14,996,228,30);x.fill();
  x.shadowBlur=0;x.strokeStyle=p.main;x.lineWidth=10;x.stroke();
  x.fillStyle=p.main;x.fillRect(14,14,996,56);
  x.fillStyle='#111';x.font='900 31px system-ui';x.textAlign='left';x.textBaseline='middle';
  x.fillText(`OBIETTIVO P${(o.userData.rank??0)+1}`,42,42);
  const name=(o.userData.name||'TARGET').toUpperCase();
  x.fillStyle='#fff';x.font='900 54px system-ui';x.textAlign='center';
  x.fillText(name,512,132);
  x.fillStyle=p.light;x.font='900 34px system-ui';
  x.fillText(roleFor(o),512,198);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false}));
  s.scale.set(300,75,1);s.renderOrder=1000;return s;
}

function add(o){
  if(done.has(o))return;done.add(o);
  const p=palette(o),nav=['ship','carrier'].includes(o.userData?.type),r=nav?38:26,g=new THREE.Group();
  g.userData.__targetMarker=true;
  const ring=new THREE.Mesh(new THREE.RingGeometry(r,r+7,48),new THREE.MeshBasicMaterial({color:p.hex,transparent:true,opacity:.96,side:THREE.DoubleSide,depthTest:false}));
  ring.rotation.x=-Math.PI/2;ring.position.y=5;ring.renderOrder=999;g.add(ring);
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.25,110,8),new THREE.MeshBasicMaterial({color:p.hex,transparent:true,opacity:.5,depthTest:false}));
  beam.position.y=58;beam.renderOrder=998;g.add(beam);
  const top=new THREE.Mesh(new THREE.OctahedronGeometry(8),new THREE.MeshBasicMaterial({color:p.hex,depthTest:false}));
  top.position.y=116;top.renderOrder=1000;g.add(top);
  const l=label(o,p);l.position.y=154;g.add(l);
  o.add(g);o.userData.__targetMarker=true;
}

function frame(t=0){
  requestAnimationFrame(frame);
  const s=window.AeroOpsState;
  for(const o of s?.targets||[])if(o?.parent&&!o.userData?.dead)add(o);
  for(const o of s?.targets||[]){
    const m=o?.children?.find(c=>c.userData?.__targetMarker);
    if(m){const q=1+Math.sin(t*.004+(o.userData.rank||0))*.055;m.scale.setScalar(q)}
  }
}
frame();