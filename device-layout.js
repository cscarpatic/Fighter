(()=>{
  const root=document.documentElement;
  const isTouch=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
  const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);

  function classify(){
    const w=window.visualViewport?.width||innerWidth;
    const h=window.visualViewport?.height||innerHeight;
    const short=Math.min(w,h),long=Math.max(w,h);
    let device='desktop';
    if(isTouch){
      if(short<500||long<850)device='phone';
      else device='tablet';
    }
    root.dataset.device=device;
    root.dataset.orientation=w>=h?'landscape':'portrait';
    root.style.setProperty('--screen-w',`${w}px`);
    root.style.setProperty('--screen-h',`${h}px`);
    root.style.setProperty('--ui-scale',String(Math.max(.72,Math.min(1.18,short/760))));
    updateRotateGate();
  }

  function rotateGate(){
    let g=document.getElementById('rotateGate');
    if(g)return g;
    g=document.createElement('div');g.id='rotateGate';
    g.innerHTML='<div class="rotatePhone">↻</div><strong>RUOTA IL DISPOSITIVO</strong><span>AERO OPS 3D è ottimizzato per la modalità orizzontale</span>';
    document.body.appendChild(g);return g;
  }

  function updateRotateGate(){
    const g=rotateGate();
    const game=document.getElementById('game');
    const inGame=game&&!game.classList.contains('hidden');
    const portrait=root.dataset.orientation==='portrait';
    g.classList.toggle('show',!!(isTouch&&portrait&&inGame));
  }

  async function requestGameMode(){
    try{
      const el=document.documentElement;
      if(!document.fullscreenElement&&el.requestFullscreen) await el.requestFullscreen({navigationUI:'hide'});
    }catch{}
    try{
      if(screen.orientation?.lock) await screen.orientation.lock('landscape');
    }catch{}
  }

  function installStartHook(){
    const start=document.getElementById('start');
    if(start&&!start.dataset.deviceHook){
      start.dataset.deviceHook='1';
      start.addEventListener('pointerdown',requestGameMode,{capture:true});
      start.addEventListener('click',()=>{requestGameMode();setTimeout(classify,60)},true);
    }
  }

  function stabilizeViewport(){
    classify();
    if(isIOS){
      document.body.classList.add('ios-device');
      setTimeout(()=>window.scrollTo(0,1),60);
    }
  }

  addEventListener('resize',stabilizeViewport,{passive:true});
  addEventListener('orientationchange',()=>setTimeout(stabilizeViewport,120),{passive:true});
  window.visualViewport?.addEventListener('resize',stabilizeViewport,{passive:true});
  document.addEventListener('fullscreenchange',classify);
  setInterval(()=>{installStartHook();updateRotateGate()},400);
  addEventListener('DOMContentLoaded',()=>{installStartHook();stabilizeViewport()});
  stabilizeViewport();
})();