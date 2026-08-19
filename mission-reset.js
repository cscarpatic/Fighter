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
    if(again&&!again.dataset.inputReset){
      again.dataset.inputReset='1';
      again.addEventListener('click',clearTransientInput,true);
    }
  }

  addEventListener('DOMContentLoaded',install);
  setInterval(install,500);
  clearTransientInput();
})();