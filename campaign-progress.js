(()=>{
  let handled=false;

  function currentIndex(){
    return [...document.querySelectorAll('#missions .mission')].findIndex(x=>x.classList.contains('sel'));
  }
  function isVictory(){
    const title=(document.getElementById('et')?.textContent||'').toLowerCase();
    return !title.includes('fallita')&&!title.includes('abbatt')&&!title.includes('bombe esaurite')&&!title.includes('collisione')&&!title.includes('game over');
  }
  function selectedMissionName(){
    const i=currentIndex();
    const btn=[...document.querySelectorAll('#missions .mission')][i];
    return btn?.querySelector('h3')?.textContent||btn?.querySelector('b')?.textContent||window.AeroOpsState?.mission?.n||'MISSIONE';
  }
  function makeOverlay(){
    let o=document.getElementById('levelTransitionOverlay');
    if(o)return o;
    o=document.createElement('div');o.id='levelTransitionOverlay';
    o.style.cssText='position:fixed;inset:0;z-index:120000;display:none;align-items:center;justify-content:center;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.34));font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;text-align:center;color:#fff;text-shadow:0 4px 18px #000';
    o.innerHTML='<div style="padding:24px 34px;border-top:2px solid rgba(255,220,120,.9);border-bottom:2px solid rgba(255,220,120,.9);background:rgba(3,10,16,.28);box-shadow:0 0 45px rgba(0,0,0,.25)"><div class="kicker" style="font-size:14px;font-weight:900;letter-spacing:.28em;color:#ffd86d"></div><div class="title" style="font-size:clamp(42px,8vw,88px);line-height:.95;font-weight:1000;letter-spacing:-.04em;margin:8px 0"></div><div class="sub" style="font-size:clamp(15px,2.4vw,25px);font-weight:800;letter-spacing:.08em;color:#dff5ff"></div></div>';
    document.body.appendChild(o);return o;
  }
  function showOverlay(kicker,title,sub){
    const o=makeOverlay();o.querySelector('.kicker').textContent=kicker;o.querySelector('.title').textContent=title;o.querySelector('.sub').textContent=sub||'';o.style.display='flex';
    o.animate?.([{opacity:0},{opacity:1}],{duration:350,easing:'ease-out',fill:'forwards'});
    return o;
  }
  function hideOverlay(){
    const o=document.getElementById('levelTransitionOverlay');if(!o)return;
    const a=o.animate?.([{opacity:1},{opacity:0}],{duration:450,easing:'ease-in',fill:'forwards'});
    if(a)a.onfinish=()=>o.style.display='none';else o.style.display='none';
  }

  function victoryTransition(){
    const buttons=[...document.querySelectorAll('#missions .mission')],i=currentIndex(),next=i+1;
    if(i<0||!buttons.length)return;

    // Keep the finished 3D scene visible instead of replacing it with the old result screen.
    const game=document.getElementById('game'),end=document.getElementById('end');
    game?.classList.remove('hidden');end?.classList.add('hidden');

    if(next<buttons.length){
      localStorage.setItem('aero-level',String(next));
      const nextName=buttons[next]?.querySelector('h3')?.textContent||buttons[next]?.querySelector('b')?.textContent||`LIVELLO ${next+1}`;
      showOverlay(`LIVELLO ${i+1}`, 'COMPLETATO', `PROSSIMA MISSIONE · ${nextName.toUpperCase()}`);
      try{sessionStorage.setItem('aero-auto-next','1');sessionStorage.setItem('aero-show-mission-intro','1')}catch{}
      setTimeout(()=>location.reload(),2200);
    }else{
      showOverlay('CAMPAGNA','COMPLETATA','TUTTE LE MISSIONI CONCLUSE');
    }
  }

  function tick(){
    const end=document.getElementById('end');
    if(!end||end.classList.contains('hidden')){if(!window.__AERO_LEVEL_TRANSITION)handled=false;return}
    if(handled||window.__AERO_COLLISION_LOSS)return;
    handled=true;
    if(!isVictory())return;
    window.__AERO_LEVEL_TRANSITION=true;
    victoryTransition();
  }
  setInterval(tick,120);

  // New-level title shown over the new 3D scene, with the aircraft already loaded.
  addEventListener('DOMContentLoaded',()=>{
    let intro=false;try{intro=sessionStorage.getItem('aero-show-mission-intro')==='1';sessionStorage.removeItem('aero-show-mission-intro')}catch{}
    if(!intro)return;
    const wait=()=>{
      const game=document.getElementById('game'),p=window.AeroOpsState?.player;
      if(!game||game.classList.contains('hidden')||!p){requestAnimationFrame(wait);return}
      const idx=currentIndex();
      const name=selectedMissionName().toUpperCase();
      const o=showOverlay(`LIVELLO ${idx+1}`,'NUOVA MISSIONE',name);
      setTimeout(()=>hideOverlay(),2300);
      setTimeout(()=>{window.__AERO_LEVEL_TRANSITION=false},2700);
    };
    requestAnimationFrame(wait);
  });
})();