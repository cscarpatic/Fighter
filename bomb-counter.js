(()=>{
  const DEFAULT_BOMBS=16;
  let last=null,lastLayout='';

  function forceDefault(){
    const load=document.getElementById('load');
    if(!load)return;
    if(!load.dataset.defaultApplied){load.value=String(DEFAULT_BOMBS);load.dataset.defaultApplied='1'}
  }

  function ensureCounter(){
    let box=document.getElementById('bombCounterPro');
    if(box)return box;
    box=document.createElement('div');box.id='bombCounterPro';
    box.innerHTML='<span>💣 BOMBE</span><strong>16</strong>';
    box.style.cssText='position:fixed;z-index:80;display:none;background:rgba(7,16,24,.72);border:1px solid rgba(255,209,91,.72);color:#ffe17a;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;pointer-events:none;text-align:center';
    document.body.appendChild(box);return box;
  }

  function layout(){
    const box=ensureCounter(),label=box.querySelector('span'),value=box.querySelector('strong');
    const w=window.visualViewport?.width||innerWidth,h=window.visualViewport?.height||innerHeight;
    const short=Math.min(w,h),device=document.documentElement.dataset.device||'';
    let mode='desktop';if(device==='phone'||short<500)mode='phone';else if(device==='tablet'||short<850)mode='tablet';
    const key=`${mode}:${Math.round(w/50)}:${Math.round(h/50)}`;if(key===lastLayout)return;lastLayout=key;
    box.style.right=`max(${mode==='phone'?6:mode==='tablet'?10:16}px,env(safe-area-inset-right))`;
    box.style.top=`max(${mode==='phone'?6:mode==='tablet'?12:70}px,calc(env(safe-area-inset-top) + ${mode==='phone'?4:mode==='tablet'?8:0}px))`;
    box.style.minWidth=mode==='phone'?'58px':mode==='tablet'?'82px':'118px';
    box.style.padding=mode==='phone'?'3px 6px':mode==='tablet'?'6px 9px':'8px 12px';
    box.style.borderRadius=mode==='phone'?'7px':mode==='tablet'?'9px':'11px';
    box.style.boxShadow=mode==='phone'?'none':mode==='tablet'?'0 3px 10px rgba(0,0,0,.28)':'0 4px 16px rgba(0,0,0,.38)';
    box.style.backdropFilter=mode==='phone'?'none':'blur(3px)';box.style.webkitBackdropFilter=mode==='phone'?'none':'blur(3px)';
    label.style.cssText=`display:block;font-size:${mode==='phone'?6:mode==='tablet'?8:10}px;font-weight:900;letter-spacing:.04em;line-height:1`;
    value.style.cssText=`display:block;font-size:${mode==='phone'?16:mode==='tablet'?22:30}px;line-height:1;color:#fff;margin-top:${mode==='phone'?1:2}px;font-weight:900`;
  }

  function update(){
    forceDefault();layout();const box=ensureCounter(),game=document.getElementById('game'),hb=document.getElementById('hb');
    const visible=game&&!game.classList.contains('hidden');box.style.display=visible?'block':'none';if(!visible)return;
    const n=parseInt(hb?.textContent||'',10);if(Number.isFinite(n)){box.querySelector('strong').textContent=String(n);if(last!==n){box.animate?.([{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:130,easing:'ease-out'});last=n}box.style.borderColor=n<=2?'rgba(255,80,80,.9)':'rgba(255,209,91,.72)';box.querySelector('strong').style.color=n<=2?'#ff6b6b':'#fff'}
  }

  document.addEventListener('DOMContentLoaded',()=>{forceDefault();ensureCounter();layout();update();});
  addEventListener('pageshow',forceDefault);addEventListener('resize',()=>{lastLayout='';layout()},{passive:true});window.visualViewport?.addEventListener('resize',()=>{lastLayout='';layout()},{passive:true});
  setInterval(update,150);
})();