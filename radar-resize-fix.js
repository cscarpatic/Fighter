(()=>{
  const canvas=document.getElementById('radarCanvas');
  const game=document.getElementById('game');
  if(!canvas)return;
  let lastW=0,lastH=0,lastDpr=0;
  function sync(){
    const r=canvas.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,2);
    if(r.width>8&&r.height>8){
      const w=Math.max(1,Math.round(r.width*dpr));
      const h=Math.max(1,Math.round(r.height*dpr));
      if(w!==lastW||h!==lastH||dpr!==lastDpr||canvas.width!==w||canvas.height!==h){
        canvas.width=w;
        canvas.height=h;
        const ctx=canvas.getContext('2d');
        ctx?.setTransform(dpr,0,0,dpr,0,0);
        lastW=w;lastH=h;lastDpr=dpr;
        window.dispatchEvent(new CustomEvent('aero-radar-resized',{detail:{width:r.width,height:r.height,dpr}}));
      }
    }
    requestAnimationFrame(sync);
  }
  const ro=new ResizeObserver(()=>{lastW=lastH=0});
  ro.observe(canvas);
  if(game) new MutationObserver(()=>{lastW=lastH=0}).observe(game,{attributes:true,attributeFilter:['class']});
  addEventListener('orientationchange',()=>{lastW=lastH=0},{passive:true});
  addEventListener('resize',()=>{lastW=lastH=0},{passive:true});
  requestAnimationFrame(sync);
})();
