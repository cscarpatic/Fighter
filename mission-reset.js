(()=>{
  function clearTransientInput(){
    window.__AERO_ANALOG={x:0,y:0,active:false};
    for(const code of ['Space','KeyB','KeyQ','KeyE','KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']){
      window.dispatchEvent(new KeyboardEvent('keyup',{code,key:code,bubbles:true,cancelable:true}));
    }
  }

  function hardResetToPlanning(){clearTransientInput();try{sessionStorage.setItem('aero-return-planning','1')}catch{}location.reload();}
  function hardRetry(){clearTransientInput();try{sessionStorage.setItem('aero-auto-retry','1')}catch{}location.reload();}
  function hardNext(){clearTransientInput();try{sessionStorage.setItem('aero-auto-next','1')}catch{}location.reload();}

  function install(){
    const back=document.getElementById('back');
    if(back&&!back.dataset.fullReset){
      back.dataset.fullReset='1';
      back.addEventListener('click',e=>{
        e.preventDefault();e.stopImmediatePropagation();
        if(back.dataset.nextLevel==='1')hardNext();else hardResetToPlanning();
      },true);
    }
    const again=document.getElementById('again');
    if(again&&!again.dataset.fullReset){
      again.dataset.fullReset='1';
      again.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();hardRetry();},true);
    }
  }

  addEventListener('DOMContentLoaded',()=>{
    install();let retry=false,next=false;
    try{
      retry=sessionStorage.getItem('aero-auto-retry')==='1';
      next=sessionStorage.getItem('aero-auto-next')==='1';
      sessionStorage.removeItem('aero-auto-retry');sessionStorage.removeItem('aero-auto-next');
    }catch{}
    if(retry||next){setTimeout(()=>document.getElementById('start')?.click(),180);}
  });
  setInterval(install,500);clearTransientInput();
})();