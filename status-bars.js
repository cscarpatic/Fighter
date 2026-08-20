(()=>{
  let root=document.getElementById('statusBars');
  if(!root){root=document.createElement('div');root.id='statusBars';document.body.appendChild(root)}
  root.style.cssText='position:fixed!important;top:72px;right:12px;z-index:99999!important;width:min(270px,48vw);padding:12px 13px;border-radius:14px;background:rgba(3,10,16,.82);border:1px solid rgba(255,255,255,.28);box-shadow:0 8px 28px rgba(0,0,0,.48);font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;color:#fff;pointer-events:none;display:none';

  const defs=[['integrity','INTEGRITÀ','#48e28a'],['bombs','BOMBE','#ffd84a'],['ammo','COLPI','#73c8ff'],['targets','TARGET','#ff6a6a']];
  const rows={};root.innerHTML='';
  for(const [id,label,color] of defs){
    const row=document.createElement('div');row.style.cssText='margin:0 0 10px';
    const head=document.createElement('div');head.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;font-size:12px;font-weight:900;letter-spacing:.04em;text-shadow:0 2px 3px #000';
    const name=document.createElement('span');name.textContent=label;const val=document.createElement('strong');val.textContent='—';val.style.fontSize='13px';head.append(name,val);
    const track=document.createElement('div');track.style.cssText='height:13px;border-radius:8px;background:rgba(255,255,255,.16);overflow:hidden;border:1px solid rgba(255,255,255,.22)';
    const fill=document.createElement('div');fill.style.cssText=`height:100%;width:100%;background:${color};box-shadow:0 0 10px ${color};transition:width .15s linear`;
    track.appendChild(fill);row.append(head,track);root.appendChild(row);rows[id]={val,fill};
  }

  const parse=id=>{const n=parseInt(document.getElementById(id)?.textContent||'',10);return Number.isFinite(n)?n:0};
  const clamp=(v,m)=>Math.max(0,Math.min(100,m?100*v/m:0));
  let maxBombs=12,maxTargets=3;
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
  requestAnimationFrame(tick);
  addEventListener('resize',()=>{if(innerWidth<700){root.style.top='88px';root.style.right='8px';root.style.width='min(220px,52vw)'}});
  if(innerWidth<700){root.style.top='88px';root.style.right='8px';root.style.width='min(220px,52vw)'}
})();