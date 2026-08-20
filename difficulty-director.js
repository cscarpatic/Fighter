import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

let lastPlayer=null;

const profiles=[
  {fighters:5, targets:3, aaExtra:0, skill:1.00, hp:1.00, aaRate:1.00},
  {fighters:6, targets:3, aaExtra:0, skill:1.04, hp:1.04, aaRate:.94},
  {fighters:6, targets:4, aaExtra:1, skill:1.08, hp:1.08, aaRate:.90},
  {fighters:7, targets:4, aaExtra:1, skill:1.12, hp:1.12, aaRate:.86},
  {fighters:7, targets:5, aaExtra:2, skill:1.16, hp:1.16, aaRate:.82},
  {fighters:8, targets:5, aaExtra:2, skill:1.20, hp:1.20, aaRate:.78},
  {fighters:9, targets:5, aaExtra:2, skill:1.25, hp:1.25, aaRate:.74},
  {fighters:10,targets:6, aaExtra:3, skill:1.30, hp:1.30, aaRate:.70},
  {fighters:11,targets:6, aaExtra:3, skill:1.36, hp:1.36, aaRate:.66},
  {fighters:12,targets:7, aaExtra:4, skill:1.42, hp:1.42, aaRate:.62}
];

function levelIndex(state){
  const all=window.AERO_CAMPAIGN||[];
  const n=state?.mission?.n;
  const i=all.findIndex(m=>m?.n===n);
  return Math.max(0,Math.min(profiles.length-1,i<0?0:i));
}

function cloneEnemy(template,scene,i,profile){
  const e=template.clone(true);
  e.visible=true;
  e.position.set((i%2?1:-1)*(1700+i*120),180+(i%4)*35,-2600-i*170);
  e.rotation.set(0,Math.PI,0);
  e.userData={...template.userData,kind:'enemy',dead:false};
  const baseHp=Number(template.userData?.hp)||36;
  e.userData.hp=Math.round(baseHp*profile.hp);
  e.userData.maxHp=e.userData.hp;
  e.userData.s=Math.max(Number(template.userData?.s)||1.05,1.02*profile.skill);
  e.userData.__difficultyClone=true;
  scene.add(e);return e;
}

function strengthenFighters(state,profile){
  const en=state.enemies||[],scene=state.player?.parent;if(!scene||!en.length)return;
  en.forEach((e,i)=>{
    if(!e?.userData)return;
    const baseHp=Number(e.userData.hp)||36;
    if(!e.userData.__difficultyScaled){
      e.userData.hp=Math.round(baseHp*profile.hp);
      e.userData.maxHp=e.userData.hp;
      e.userData.s=Math.max(Number(e.userData.s)||1.05,1.02*profile.skill);
      // combat-effects/AI extensions can use these normalized skill hints.
      e.userData.skill=profile.skill;
      e.userData.aimAssist=Math.min(.96,.68+(profile.skill-1)*.48);
      e.userData.fireAggression=profile.skill;
      e.userData.__difficultyScaled=true;
    }
  });
  const template=en[0];
  while(en.length<profile.fighters){const e=cloneEnemy(template,scene,en.length,profile);en.push(e)}
}

function addObjectives(state,profile){
  const targets=state.targets||[],contacts=state.contacts||[];
  if(targets.length>=profile.targets)return;
  const candidates=contacts.filter(o=>o?.position&&!o.userData?.dead&&!targets.includes(o));
  for(const o of candidates){
    if(targets.length>=profile.targets)break;
    o.userData.objective=true;
    o.userData.rank=targets.length;
    o.userData.pts=Math.max(Number(o.userData.pts)||0,500+targets.length*100);
    const hp=Number(o.userData.hp)||70;
    o.userData.hp=Math.round(hp*(1+(profile.hp-1)*.45));
    o.userData.maxHp=o.userData.hp;
    targets.push(o);
  }
}

function cloneAA(template,scene,target,i,profile){
  const a=template.clone(true);
  const ang=(i*2.399963229728653),rad=150+45*(i%3);
  const x=(target?.position?.x||0)+Math.cos(ang)*rad;
  const z=(target?.position?.z||-1500)+Math.sin(ang)*rad;
  a.position.set(x,0,z);a.visible=true;
  a.userData={...template.userData,kind:'aa',name:`AA rinforzo ${i+1}`,dead:false,__difficultyClone:true};
  const cd=Number(template.userData?.cd)||1.2;
  a.userData.cd=Math.max(.35,cd*profile.aaRate);
  scene.add(a);return a;
}

function strengthenAA(state,profile){
  const guns=state.guns||[],scene=state.player?.parent;if(!scene||!guns.length)return;
  guns.forEach(g=>{if(g?.userData&&!g.userData.__difficultyScaled){const cd=Number(g.userData.cd)||1.2;g.userData.cd=Math.max(.35,cd*profile.aaRate);g.userData.skill=profile.skill;g.userData.__difficultyScaled=true;}});
  const template=guns[0],targets=state.targets||[];
  const desired=guns.length+profile.aaExtra;
  let i=0;
  while(guns.length<desired){const target=targets[i%Math.max(1,targets.length)];guns.push(cloneAA(template,scene,target,i,profile));i++}
}

function announce(level,profile){
  let badge=document.getElementById('difficultyBadge');
  if(!badge){badge=document.createElement('div');badge.id='difficultyBadge';badge.style.cssText='position:fixed;left:max(12px,env(safe-area-inset-left));top:max(58px,calc(env(safe-area-inset-top) + 44px));z-index:40;padding:6px 9px;border-radius:8px;background:rgba(5,13,20,.58);border:1px solid rgba(255,255,255,.15);color:#eaf7ff;font:800 10px system-ui;letter-spacing:.08em;pointer-events:none;text-shadow:0 1px 3px #000';document.body.appendChild(badge)}
  const names=['RECLUTA','FACILE','NORMALE','NORMALE+','IMPEGNATIVO','VETERANO','VETERANO+','ASSO','ASSO+','ELITE'];
  badge.textContent=`LIVELLO ${level+1} · ${names[level]}`;
}

function apply(){
  const s=window.AeroOpsState,p=s?.player;if(!p||!p.parent||p===lastPlayer)return;
  lastPlayer=p;
  const level=levelIndex(s),profile=profiles[level];
  strengthenFighters(s,profile);
  addObjectives(s,profile);
  strengthenAA(s,profile);
  announce(level,profile);
  window.AeroDifficulty={level:level+1,...profile};
}

function frame(){requestAnimationFrame(frame);apply()}
requestAnimationFrame(frame);
