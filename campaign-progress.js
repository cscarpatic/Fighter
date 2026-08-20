(()=>{
  let handled=false, transitioning=false;

  function buttons(){return [...document.querySelectorAll('#missions .mission')]}
  function currentIndex(){return buttons().findIndex(x=>x.classList.contains('sel'))}
  function missionName(i){
    const b=buttons()[i];
    return b?.querySelector('h3')?.textContent||b?.querySelector('b')?.textContent||window.AERO_CAMPAIGN?.[i]?.n||`MISSIONE ${i+1}`;
  }
  function isVictory(){
    const title=(document.getElementById('et')?.textContent||'').toLowerCase();
    return !title.includes('fallita')&&!title.includes('abbatt')&&!title.includes('bombe esaurite')&&!title.includes('collisione')&&!title.includes('game over');
  }

  function overlay(){
    let o=document.getElementById('levelTransitionOverlay');
    if(o)return o;
    o=document.createElement('div');o.id='levelTransitionOverlay';
    o.style.cssText='position:fixed;inset:0;z-index:120000;display:none;align-items:center;justify-content:center;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.30));font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;text-align:center;color:#fff;text-shadow:0 4px 18px #000';
    o.innerHTML='<div style="padding:24px 34px;border-top:2px solid rgba(255,220,120,.92);border-bottom:2px solid rgba(255,220,120,.92);background:rgba(3,10,16,.23);box-shadow:0 0 45px rgba(0,0,0,.24)"><div class="kicker" style="font-size:14px;font-weight:900;letter-spacing:.28em;color:#ffd86d"></div><div class="title" style="font-size:clamp(42px,8vw,88px);line-height:.95;font-weight:1000;letter-spacing:-.04em;margin:8px 0"></div><div class="sub" style="font-size:clamp(15px,2.4vw,25px);font-weight:800;letter-spacing:.08em;color:#dff5ff"></div></div>';
    document.body.appendChild(o);return o;
  }
  function show(kicker,title,sub){
    const o=overlay();o.querySelector('.kicker').textContent=kicker;o.querySelector('.title').textContent=title;o.querySelector('.sub').textContent=sub||'';o.style.opacity='1';o.style.display='flex';
    o.animate?.([{opacity:0},{opacity:1}],{duration:300,easing:'ease-out'});return o;
  }
  function hide(ms=420){
    const o=overlay();const a=o.animate?.([{opacity:1},{opacity:0}],{duration:ms,easing:'ease-in',fill:'forwards'});
    if(a)a.onfinish=()=>{o.style.display='none';o.style.opacity='1'};else o.style.display='none';
  }

  function waitForNewPlayer(oldPlayer,next){
    const begun=performance.now();
    const check=()=>{
      const game=document.getElementById('game'),p=window.AeroOpsState?.player;
      if(game&&!game.classList.contains('hidden')&&p&&p!==oldPlayer){
        show(`LIVELLO ${next+1}`,'NUOVA MISSIONE',missionName(next).toUpperCase());
        setTimeout(()=>hide(500),2300);
        setTimeout(()=>{transitioning=false;window.__AERO_LEVEL_TRANSITION=false;handled=false},2900);
        return;
      }
      if(performance.now()-begun<6000)requestAnimationFrame(check);
      else{transitioning=false;window.__AERO_LEVEL_TRANSITION=false;handled=false;hide();}
    };
    requestAnimationFrame(check);
  }

  function victoryTransition(){
    const all=buttons(),i=currentIndex(),next=i+1;
    if(i<0||!all.length)return;
    const game=document.getElementById('game'),end=document.getElementById('end');
    game?.classList.remove('hidden');end?.classList.add('hidden');

    if(next>=all.length){
      show('CAMPAGNA','COMPLETATA','TUTTE LE MISSIONI CONCLUSE');
      transitioning=true;return;
    }

    transitioning=true;window.__AERO_LEVEL_TRANSITION=true;
    localStorage.setItem('aero-level',String(next));
    const oldPlayer=window.AeroOpsState?.player;
    show(`LIVELLO ${i+1}`,'COMPLETATO',`PROSSIMA MISSIONE · ${missionName(next).toUpperCase()}`);

    // Select the next level internally while the mission menu stays hidden.
    // This updates the core engine's private mission index without exposing the selection screen.
    all[next]?.click();

    setTimeout(()=>{
      const menu=document.getElementById('menu');
      if(menu)menu.classList.add('hidden');
      // Start rebuilds the 3D scene directly for the newly selected mission.
      document.getElementById('start')?.click();
      waitForNewPlayer(oldPlayer,next);
    },2100);
  }

  function tick(){
    if(transitioning)return;
    const end=document.getElementById('end');
    if(!end||end.classList.contains('hidden')){handled=false;return}
    if(handled||window.__AERO_COLLISION_LOSS)return;
    handled=true;
    if(!isVictory())return;
    victoryTransition();
  }
  setInterval(tick,100);
})();