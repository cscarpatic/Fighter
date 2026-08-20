(()=>{
  let lastPlayer=null,lastMission=null;
  const staged=new WeakSet();

  function objectiveCenter(s){
    const pts=(s.targets||[]).filter(o=>o?.position&&!o.userData?.dead);
    if(!pts.length)return null;
    let x=0,z=0;for(const o of pts){x+=o.position.x;z+=o.position.z}
    return{x:x/pts.length,z:z/pts.length};
  }

  function stageEnemies(s,p,center){
    const enemies=s.enemies||[];
    const dx=center.x-p.position.x,dz=center.z-p.position.z,len=Math.max(1,Math.hypot(dx,dz));
    const f={x:dx/len,z:dz/len},r={x:-f.z,z:f.x};

    enemies.forEach((e,i)=>{
      if(!e?.position||staged.has(e))return;
      staged.add(e);

      // Aircraft exist from mission start: no invisibility and no teleporting.
      // Place successive patrol pairs far beyond the objective corridor so they
      // visibly approach from long range and appear on radar before visual contact.
      const row=Math.floor(i/2);
      const dist=2600+row*520+(i%2)*180;
      const side=(i%2===0?-1:1)*(420+row*120);
      e.position.x=p.position.x+f.x*dist+r.x*side;
      e.position.z=p.position.z+f.z*dist+r.z*side;
      e.position.y=Math.max(170,p.position.y+90+(i%3)*55);
      e.visible=true;

      // Point the interceptors generally toward the player's approach corridor.
      e.rotation.y=Math.atan2(p.position.x-e.position.x,p.position.z-e.position.z);
      if(e.userData){
        e.userData.s=Math.min(e.userData.s||1.05,1.08);
        e.userData.__longRangeInterceptor=true;
      }
    });
  }

  function setup(){
    const s=window.AeroOpsState,p=s?.player;
    if(!p||!p.position)return;
    const center=objectiveCenter(s);if(!center)return;

    if(p!==lastPlayer||s.mission!==lastMission){
      lastPlayer=p;lastMission=s.mission;

      // Aim the player toward the objective area at mission start.
      const contacts=(s.contacts||[]).filter(o=>o?.position&&!o.userData?.dead);
      const target=contacts.reduce((best,o)=>{
        const priority=o.userData?.objective?0:1;
        const d=Math.hypot(o.position.x-p.position.x,o.position.z-p.position.z);
        const score=priority*100000+d;
        return !best||score<best.score?{o,score}:best;
      },null)?.o;
      if(target){
        const tx=target.position.x-p.position.x,tz=target.position.z-p.position.z;
        p.rotation.y=Math.atan2(-tx,-tz);p.rotation.z=0;
      }

      stageEnemies(s,p,center);
    }

    // Safety: never hide or relocate a staged interceptor later. The core AI is
    // allowed to fly it continuously from its distant spawn toward the player.
    for(const e of s.enemies||[]){
      if(staged.has(e)&&e){e.visible=true;}
    }
  }

  function tick(){setup();requestAnimationFrame(tick)}
  tick();
})();