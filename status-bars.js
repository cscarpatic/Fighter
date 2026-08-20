(()=>{
  const root=document.createElement('div');
  root.id='statusBars';
  root.style.cssText=[
    'position:fixed','top:max(12px,env(safe-area-inset-top))','right:max(12px,env(safe-area-inset-right))',
    'z-index:45','width:min(250px,43vw)','display:none','padding:10px 12px','border-radius:14px',
    'background:rgba(5,12,18,.56)','border:1px solid rgba(255,255,255,.14)','backdrop-filter:blur(7px)',
    'box-shadow:0 5px 20px rgba(0,0,0,.28)','font-family:system-ui,sans-serif','color:#fff','pointer-events:none'
  ].join(';');

  const defs=[
    ['integrity','INTEGRITÀ','#48e28a'],
    ['bombs','BOMBE','#ffd84a'],
    ['ammo','COLPI','#73c8ff'],
    ['targets','TARGET','#ff6a6a']
  ];
  const rows={};
  defs.forEach(([id,label,color])=>{
    const row=document.createElement('div');row.style.cssText='margin:0 0 8px 0';
    const head=document.createElement('div');head.style.cssText='display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:3px;font-size:11px;font-weight:900;letter-spacing:.05em;text-shadow:0 1px 2px #000';
    const name=document.createElement('span');name.textContent=label;
    const val=document.createElement('strong');val.textContent='—';val.style.fontSize='12px';
    head.append(name,val);
    const track=document.createElement('div');track.style.cssText='height:9px;border-radius:999px;background:rgba(255,255,255,.13);overflow:hidden;border:1px solid rgba(255,255,255,.12)';
    const fill=document.createElement('div');fill.style.cssText=`height:100%;width:100%;border-radius:999px;background:${color};box-shadow:0 0 8px ${color};transition:width .18s ease`;
    track.appendChild(fill);row.append(head,track);root.appendChild(row);rows[id]={val,fill,color};
  });
  document.body.appendChild(root);

  function num(id,fallback=0){const n=parseInt(document.getElementById(id)?.textContent||'',10);return Number.isFinite(n)?n:fallback}
  function pct(v,max){return Math.max(0,Math.min(100,max>0?v/max*100:0))}
  let initialBombs=12,initialTargets=3;

  function update(){
    const game=document.getElementById('game');
    const visible=game&&!game.classList.contains('hidden');
    root.style.display=visible?'block':'none';
    if(!visible){requestAnimationFrame(update);return}

    const hp=num('hh',100),bombs=num('hb',initialBombs),ammo=num('ham',420);
    const state=window.AeroOpsState||{};
    const totalTargets=Math.max(initialTargets,(state.targets||[]).length||0);
    const alive=(state.targets||[]).filter(o=>o&&!o.userData?.dead&&(o.userData?.hp??1)>0).length;

    if((state.targets||[]).length&&initialTargets!==state.targets.length)initialTargets=state.targets.length;
    const load=parseInt(document.getElementById('load')?.value||'',10);if(Number.isFinite(load)&&load>0)initialBombs=load;

    const data={
      integrity:[hp,100,`${hp}%`],
      bombs:[bombs,initialBombs,`${bombs}/${initialBombs}`],
      ammo:[ammo,420,`${ammo}/420`],
      targets:[Math.max(0,alive),Math.max(1,totalTargets),`${Math.max(0,alive)}/${Math.max(1,totalTargets)}`]
    };
    for(const [id,[v,max,label]] of Object.entries(data)){
      rows[id].val.textContent=label;rows[id].fill.style.width=`${pct(v,max)}%`;
    }
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
})();