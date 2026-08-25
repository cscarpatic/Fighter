(()=>{
  let root=document.getElementById('statusBars');
  if(!root){root=document.createElement('div');root.id='statusBars';document.body.appendChild(root)}
  root.style.cssText='position:fixed!important;left:max(12px,env(safe-area-inset-left));right:auto;top:max(78px,calc(env(safe-area-inset-top) + 58px));z-index:40!important;width:min(250px,42vw);padding:10px 12px;border-radius:14px;background:rgba(3,10,16,.72);border:1px solid rgba(255,255,255,.22);box-shadow:0 8px 24px rgba(0,0,0,.38);font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;color:#fff;pointer-events:none;display:none';
  const defs=[['integrity','INT'],['bombs','BOMBE'],['ammo','COLPI'],['targets','TARGET']];
  const rows={};root.innerHTML='';
  for(const [id,label] of defs){
    const row=document.createElement('div');row.className='statusRow';
    const name=document.createElement('span');name.className='statusName';name.textContent=label;
    const val=document.createElement('strong');val.className='statusValue';val.textContent='—';
    const track=document.createElement('div');track.className='statusTrack';
    const fill=document.createElement('div');fill.className='statusFill';track.appendChild(fill);
    row.append(name,val,track);root.appendChild(row);rows[id]={val,fill,track};
  }
  const parse=id=>{const n=parseInt(document.getElementById(id)?.textContent||'',10);return Number.isFinite(n)?n:0};
  const clamp=(v,m)=>Math.max(0,Math.min(100,m?100*v/m:0));
  let maxBombs=16,maxTargets=3,lastFrame=0;
  function phone(){return document.documentElement.dataset.device==='phone'}
  function place(){
    if(phone()){
      root.classList.add('numericOnly');root.style.left='max(7px,env(safe-area-inset-left))';root.style.right='auto';root.style.top='max(42px,calc(env(safe-area-inset-top) + 36px))';root.style.bottom='auto';root.style.transform='none';root.style.width='auto';root.style.padding='4px 6px';
    }else if(innerWidth<=700){
      root.classList.remove('numericOnly');root.style.left='50%';root.style.right='auto';root.style.top='auto';root.style.bottom='max(118px,calc(env(safe-area-inset-bottom) + 104px))';root.style.transform='translateX(-50%)';root.style.width='min(340px,72vw)';root.style.padding='8px 10px';
    }else{
      root.classList.remove('numericOnly');root.style.left='max(12px,env(safe-area-inset-left))';root.style.right='auto';root.style.top='max(78px,calc(env(safe-area-inset-top) + 58px))';root.style.bottom='auto';root.style.transform='none';root.style.width='min(250px,42vw)';root.style.padding='10px 12px';
    }
  }
  function tick(ts){
    requestAnimationFrame(tick);
    if(ts-lastFrame<100)return;lastFrame=ts;
    const game=document.getElementById('game'),visible=!!game&&!game.classList.contains('hidden');
    root.style.setProperty('display',visible?'flex':'none','important');if(!visible)return;
    place();
    const hp=parse('hh')||100,bombs=parse('hb'),ammo=parse('ham');
    const selected=+document.getElementById('load')?.value;if(selected>0)maxBombs=selected;
    const targets=window.AeroOpsState?.targets||[];if(targets.length)maxTargets=targets.length;
    const alive=targets.filter(o=>o&&!o.userData?.dead&&(o.userData?.hp??1)>0).length;
    const data={integrity:[hp,100,`${hp}%`],bombs:[bombs,maxBombs,`${bombs}`],ammo:[ammo,420,`${ammo}`],targets:[alive,maxTargets,`${alive}`]};
    for(const [id,[v,m,text]] of Object.entries(data)){rows[id].val.textContent=text;rows[id].fill.style.width=clamp(v,m)+'%'}
  }
  place();addEventListener('resize',place,{passive:true});requestAnimationFrame(tick);
})();