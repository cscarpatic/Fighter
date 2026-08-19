(()=>{
  let ended=false;

  function remainingBombOnlyTargets(){
    const targets=window.AeroOpsState?.targets||[];
    return targets.filter(t=>t?.parent&&!t.userData?.dead&&['ship','carrier'].includes(t.userData?.type));
  }

  function failForNoBombs(){
    if(ended)return;
    const game=document.getElementById('game');
    const end=document.getElementById('end');
    if(!game||!end||game.classList.contains('hidden'))return;

    const bombs=Number(document.getElementById('hb')?.textContent||0);
    if(bombs>0)return;

    const blocked=remainingBombOnlyTargets();
    if(!blocked.length)return;

    ended=true;
    window.__AERO_ANALOG={x:0,y:0,active:false};
    for(const code of ['Space','KeyB','KeyQ','KeyE','KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']){
      window.dispatchEvent(new KeyboardEvent('keyup',{code,key:code,bubbles:true,cancelable:true}));
    }

    game.classList.add('hidden');
    end.classList.remove('hidden');
    const title=document.getElementById('et');
    const score=document.getElementById('es');
    const stats=document.getElementById('estat');
    if(title)title.textContent='Missione fallita — bombe esaurite';
    if(score)score.textContent='0';
    if(stats)stats.textContent=`Restano ${blocked.length} bersagli navali che richiedono bombe: ${blocked.map(t=>t.userData?.name||'bersaglio navale').join(', ')}.`;
  }

  function frame(){
    requestAnimationFrame(frame);
    const game=document.getElementById('game');
    if(game&&!game.classList.contains('hidden')){
      ended=false;
      failForNoBombs();
    }
  }
  requestAnimationFrame(frame);
})();