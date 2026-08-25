const MISSIONS=window.AERO_CAMPAIGN||[
 {n:'Pearl Harbor',d:'7 dicembre 1941 · 08:00',land:false,pc:0xd8d0af,ec:0x48633c,map:'Pearl Harbor, Oahu',b:'Livello 1. Ricostruzione di Battleship Row e Ford Island allo scoppio dell’attacco. Le posizioni sono uno snapshot storico in scala compressa.',objectives:[['Battleship Row','ship',1000],['Ford Island','hangar',750],['Difese AA','aa',550]],layout:[['USS California','ship',-155,-980],['USS Maryland','ship',-80,-1110],['USS Oklahoma','ship',-35,-1110],['USS Tennessee','ship',35,-1240],['USS West Virginia','ship',80,-1240],['USS Arizona','ship',150,-1380],['USS Vestal','ship',195,-1380],['USS Nevada','ship',230,-1530],['Ford Island','hangar',-300,-1240],['Hickam Field','hangar',520,-850]],aa:[[-360,-980],[340,-1030],[-420,-1450],[410,-1510],[40,-1660]]}
];
window.AERO_CAMPAIGN=MISSIONS;
const source=await fetch('./loader.js?campaignCore=17').then(r=>{if(!r.ok)throw new Error('loader '+r.status);return r.text()});
const campaign=window.AERO_CAMPAIGN;
const missionCode='const MISSIONS='+JSON.stringify(campaign)+';';
let patched=source.replace(/const MISSIONS=\[[\s\S]*?\n\];/,missionCode);
patched=patched.replace('let mi=0,order=[0,1,2]','let mi=Math.max(0,Math.min(MISSIONS.length-1,+(localStorage.getItem("aero-level")||0))),order=[0,1,2]');
patched=patched.replace('let hp=100,ammo=420,bombs=6,','let hp=100,ammo=420,bombs=16,');
patched=patched.replace('speed=1.85;thr=.44;t=0;cam=0;en=[];','speed=1.85;thr=.44;t=0;cam=0;lastFire=lastBomb=lastEnemy=0;keys={};en=[];');
patched=patched.replace("R=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});R.setPixelRatio(Math.min(devicePixelRatio,1.5));R.setSize(innerWidth,innerHeight);", "const mobile=document.documentElement.dataset.device==='phone'||document.documentElement.dataset.device==='tablet';R=new THREE.WebGLRenderer({antialias:!mobile,powerPreference:'high-performance',alpha:false,stencil:false});R.setPixelRatio(Math.min(devicePixelRatio,mobile?1:1.35));R.setSize(innerWidth,innerHeight,false);");
patched=patched.replace('function clouds(){const m=new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.42,depthWrite:false});for(let i=0;i<18;i++){', "function clouds(){const m=new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.42,depthWrite:false});const cloudCount=document.documentElement.dataset.device==='phone'?8:document.documentElement.dataset.device==='tablet'?12:18;for(let i=0;i<cloudCount;i++){");
if(patched===source)throw new Error('Campaign patch non applicata');
const blob=new Blob([patched],{type:'text/javascript'});
await import(URL.createObjectURL(blob));
window.dispatchEvent(new CustomEvent('aero-campaign-ready'));