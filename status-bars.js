(()=>{
  let root=document.getElementById('statusBars');
  if(!root){root=document.createElement('div');root.id='statusBars';document.body.appendChild(root)}
  root.style.cssText='position:fixed!important;left:max(12px,env(safe-area-inset-left));right:auto;top:max(78px,calc(env(safe-area-inset-top) + 58px));z-index:40!important;width:min(250px,42vw);padding:10px 12px;border-radius:14px;background:rgba(3,10,16,.72);border:1px solid rgba(255,255,255,.22);box-shadow:0 8px 24px rgba(0,0,0,.38);font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;color:#fff;pointer-events:none;display:none';

  const defs=[['integrity','INTEGRITÀ','#48e28a'],['bombs','BOMBE','#ffd84a'],['ammo','COLPI','#73c8ff'],['targets','TARGET','#ff6a6a']];
  const rows={};root.innerHTML='';
  for(const [id,label,color] of defs){
    const row=document.createElement('div');row.style.cssText='margin:0 0 8px';
    const head=document.createElement('div');head.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;font-size:11px;font-weight:900;letter-spacing:.04em;text-shadow:0 2px 3px #000';
    const name=document.createElement('span');name.textContent=label;const val=document.createElement('strong');val.textContent='—';val.style.fontSize='12px';head.append(name,val);
    const track=document.createElement('div');track.style.cssText='height:11px;border-radius:8px;background:rgba(255,255,255,.14);overflow:hidden;border:1px solid rgba(255,255,255,.18)';
    const fill=document.createElement('div');fill.style.cssText=`height:100%;width:100%;background:${color};box-shadow:0 0 8px ${color};transition:width .15s linear`;
    track.appendChild(fill);row.append(head,track);root.appendChild(row);rows[id]={val,fill};
  }

  const parse=id=>{const n=parseInt(document.getElementById(id)?.textContent||'',10);return Number.isFinite(n)?n:0};
  const clamp=(v,m)=>Math.max(0,Math.min(100,m?100*v/m:0));
  let maxBombs=16,maxTargets=3;
  function place(){
    if(innerWidth<=700){
      root.style.left='50%';root.style.right='auto';root.style.top='auto';root.style.bottom='max(118px,calc(env(safe-area-inset-bottom) + 104px))';root.style.transform='translateX(-50%)';root.style.width='min(340px,72vw)';root.style.padding='8px 10px';
    }else{
      root.style.left='max(12px,env(safe-area-inset-left))';root.style.right='auto';root.style.top='max(78px,calc(env(safe-area-inset-top) + 58px))';root.style.bottom='auto';root.style.transform='none';root.style.width='min(250px,42vw)';root.style.padding='10px 12px';
    }
  }
  function tick(){
    requestAnimationFrame(tick);
    const game=document.getElementById('game');const visible=!!game&&!game.classList.contains('hidden');
    root.style.setProperty('display',visible?'block':'none','important');if(!visible)return;
    const hp=parse('hh')||100,bombs=parse('hb'),ammo=parse('ham');
    const selected=+document.getElementById('load')?.value;if(selected>0)maxBombs=selected;
    const targets=window.AeroOpsState?.targets||[];if(targets.length)maxTargets=targets.length;
    const alive=targets.filter(o=>o&&!o.userData?.dead&&(o.userData?.hp??1)>0).length;
    const data={integrity:[hp,100,`${hp}%`],bombs:[bombs,maxBombs,`${bombs}/${maxBombs}`],ammo:[ammo,420,`${ammo}/420`],targets:[alive,maxTargets,`${alive}/${maxTargets}`]};
    for(const [id,[v,m,text]] of Object.entries(data)){rows[id].val.textContent=text;rows[id].fill.style.width=clamp(v,m)+'%'}
  }
  place();addEventListener('resize',place);requestAnimationFrame(tick);
})();