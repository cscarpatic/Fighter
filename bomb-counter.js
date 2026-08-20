(()=>{
  const DEFAULT_BOMBS=16;
  let last=null;

  function forceDefault(){
    const load=document.getElementById('load');
    if(!load)return;
    if(!load.dataset.defaultApplied){load.value=String(DEFAULT_BOMBS);load.dataset.defaultApplied='1'}
  }

  function ensureCounter(){
    let box=document.getElementById('bombCounterPro');
    if(box)return box;
    box=document.createElement('div');box.id='bombCounterPro';
    box.innerHTML='<span>💣 BOMBE DISPONIBILI</span><strong>16</strong>';
    box.style.cssText='position:fixed;right:max(18px,env(safe-area-inset-right));top:max(74px,env(safe-area-inset-top));z-index:80;display:none;min-width:150px;padding:10px 14px;border-radius:12px;background:rgba(7,16,24,.9);border:2px solid rgba(255,209,91,.9);box-shadow:0 4px 18px rgba(0,0,0,.45);color:#ffe17a;font-family:system-ui,sans-serif;backdrop-filter:blur(5px);pointer-events:none;text-align:center';
    box.querySelector('span').style.cssText='display:block;font-size:11px;font-weight:900;letter-spacing:.06em';
    box.querySelector('strong').style.cssText='display:block;font-size:34px;line-height:1.05;color:#fff;margin-top:2px';
    document.body.appendChild(box);return box;
  }

  function update(){
    forceDefault();const box=ensureCounter(),game=document.getElementById('game'),hb=document.getElementById('hb');
    const visible=game&&!game.classList.contains('hidden');box.style.display=visible?'block':'none';if(!visible)return;
    const n=parseInt(hb?.textContent||'',10);if(Number.isFinite(n)){box.querySelector('strong').textContent=String(n);if(last!==n){box.animate?.([{transform:'scale(1.14)'},{transform:'scale(1)'}],{duration:180,easing:'ease-out'});last=n}box.style.borderColor=n<=2?'rgba(255,80,80,.95)':'rgba(255,209,91,.9)';box.querySelector('strong').style.color=n<=2?'#ff6b6b':'#fff'}
  }

  document.addEventListener('DOMContentLoaded',()=>{forceDefault();ensureCounter();update();});
  addEventListener('pageshow',forceDefault);
  setInterval(update,100);
})();