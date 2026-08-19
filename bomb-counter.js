(()=>{
  const DEFAULT_BOMBS=12;
  let last=null;

  function ensureDefault(){
    const load=document.getElementById('load');
    if(load&&!load.dataset.defaultApplied){
      load.dataset.defaultApplied='1';
      load.value=String(DEFAULT_BOMBS);
    }
  }

  function ensureCounter(){
    let box=document.getElementById('bombCounterPro');
    if(box)return box;
    box=document.createElement('div');
    box.id='bombCounterPro';
    box.innerHTML='<span>💣 BOMBE</span><strong>12</strong>';
    box.style.cssText=[
      'position:fixed','right:max(18px,env(safe-area-inset-right))','top:max(74px,env(safe-area-inset-top))',
      'z-index:40','display:none','min-width:116px','padding:9px 13px','border-radius:12px',
      'background:rgba(7,16,24,.82)','border:1px solid rgba(255,209,91,.75)','box-shadow:0 4px 18px rgba(0,0,0,.35)',
      'color:#ffe17a','font-family:system-ui,sans-serif','backdrop-filter:blur(5px)','pointer-events:none',
      'text-align:center'
    ].join(';');
    box.querySelector('span').style.cssText='display:block;font-size:11px;font-weight:800;letter-spacing:.08em';
    box.querySelector('strong').style.cssText='display:block;font-size:28px;line-height:1.05;color:#fff;margin-top:2px';
    document.body.appendChild(box);
    return box;
  }

  function update(){
    ensureDefault();
    const box=ensureCounter();
    const game=document.getElementById('game');
    const hb=document.getElementById('hb');
    const visible=game&&!game.classList.contains('hidden');
    box.style.display=visible?'block':'none';
    if(!visible)return;
    const n=parseInt(hb?.textContent||'',10);
    if(Number.isFinite(n)){
      box.querySelector('strong').textContent=String(n);
      if(last!==n){
        box.animate?.([{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:180,easing:'ease-out'});
        last=n;
      }
      box.style.borderColor=n<=2?'rgba(255,80,80,.9)':'rgba(255,209,91,.75)';
      box.querySelector('strong').style.color=n<=2?'#ff6b6b':'#fff';
    }
  }

  document.addEventListener('DOMContentLoaded',()=>{ensureDefault();ensureCounter();update();});
  setInterval(update,100);
})();