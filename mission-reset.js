(()=>{
  function clearTransientInput(){
    window.__AERO_ANALOG={x:0,y:0,active:false};
    for(const code of ['Space','KeyB','KeyQ','KeyE','KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']){
      window.dispatchEvent(new KeyboardEvent('keyup',{code,key:code,bubbles:true,cancelable:true}));
    }
  }

  function hardResetToPlanning(){
    clearTransientInput();
    try{sessionStorage.setItem('aero-return-planning','1')}catch{}
    location.reload();
  }

  function hardRetry(){
    clearTransientInput();
    // A full reload avoids stale ammo/held-fire state surviving after destruction.
    try{sessionStorage.setItem('aero-auto-retry','1')}catch{}
    location.reload();
  }

  function install(){
    const back=document.getElementById('back');
    if(back&&!back.dataset.fullReset){
      back.dataset.fullReset='1';
      back.addEventListener('click',e=>{
        e.preventDefault();
        e.stopImmediatePropagation();
        hardResetToPlanning();
      },true);
    }

    const again=document.getElementById('again');
    if(again&&!again.dataset.fullReset){
      again.dataset.fullReset='1';
      again.addEventListener('click',e=>{
        e.preventDefault();
        e.stopImmediatePropagation();
        hardRetry();
      },true);
    }
  }

  addEventListener('DOMContentLoaded',()=>{
    install();
    let retry=false;
    try{retry=sessionStorage.getItem('aero-auto-retry')==='1';sessionStorage.removeItem('aero-auto-retry')}catch{}
    if(retry){
      // Wait for the core engine to install its DECOLLA handler, then start fresh.
      setTimeout(()=>document.getElementById('start')?.click(),120);
    }
  });
  setInterval(install,500);
  clearTransientInput();
})();