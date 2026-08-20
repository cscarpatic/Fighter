(()=>{
  let lastPlayer=null,lastMission=null;
  const activated=new WeakSet();
  const staged=new WeakSet();

  function objectiveCenter(s){
    const pts=(s.targets||[]).filter(o=>o?.position&&!o.userData?.dead);
    if(!pts.length)return null;
    let x=0,z=0;for(const o of pts){x+=o.position.x;z+=o.position.z}
    return{x:x/pts.length,z:z/pts.length};
  }

  function stageEnemies(s,p){
    const enemies=s.enemies||[];
    enemies.forEach((e,i)=>{
      if(!e?.position||staged.has(e))return;
      staged.add(e);
      e.visible=false;
      e.userData.__interceptorIndex=i;
      // Keep dormant patrols far outside combat until the trigger distance is reached.
      e.position.set(6000+i*180,500,6000+i*220);
      if(e.userData)e.userData.s=Math.min(e.userData.s||1.05,1.08);
    });
  }

  function activateWave(s,p,center,maxIndex){
    const enemies=s.enemies||[];
    const dx=center.x-p.position.x,dz=center.z-p.position.z,len=Math.max(1,Math.hypot(dx,dz));
    const f={x:dx/len,z:dz/len},r={x:-f.z,z:f.x};
    enemies.forEach((e,i)=>{
      if(i>maxIndex||activated.has(e)||!e?.position)return;
      activated.add(e);e.visible=true;
      const row=Math.floor(i/2),side=(i%2===0?-1:1)*(170+row*45),ahead=330+row*130;
      // Interceptors appear ahead and slightly offset, converging from the objective area.
      e.position.x=p.position.x+f.x*ahead+r.x*side;
      e.position.z=p.position.z+f.z*ahead+r.z*side;
      e.position.y=Math.max(120,p.position.y+45+(i%3)*30);
      e.rotation.y=Math.atan2(p.position.x-e.position.x,p.position.z-e.position.z);
    });
  }

  function setup(){
    const s=window.AeroOpsState,p=s?.player;
    if(!p||!p.position)return;
    if(p!==lastPlayer||s.mission!==lastMission){
      lastPlayer=p;lastMission=s.mission;
      const contacts=(s.contacts||[]).filter(o=>o?.position&&!o.userData?.dead);
      const target=contacts.reduce((best,o)=>{const priority=o.userData?.objective?0:1,d=Math.hypot(o.position.x-p.position.x,o.position.z-p.position.z),score=priority*100000+d;return !best||score<best.score?{o,score}:best},null)?.o;
      if(target){const dx=target.position.x-p.position.x,dz=target.position.z-p.position.z;p.rotation.y=Math.atan2(-dx,-dz);p.rotation.z=0;}
      stageEnemies(s,p);
    }

    const center=objectiveCenter(s);if(!center)return;
    const dist=Math.hypot(center.x-p.position.x,center.z-p.position.z);
    const n=(s.enemies||[]).length;
    // No immediate encounter. Escalation begins as the player closes on the target area.
    if(dist<1450)activateWave(s,p,center,Math.min(1,n-1));
    if(dist<1000)activateWave(s,p,center,Math.min(3,n-1));
    if(dist<650)activateWave(s,p,center,n-1);

    // Dormant aircraft remain harmless and far away even if their base AI updates them.
    (s.enemies||[]).forEach((e,i)=>{if(!activated.has(e)&&e?.position){e.visible=false;e.position.x=6000+i*180;e.position.z=6000+i*220;e.position.y=500;}});
  }
  function tick(){setup();requestAnimationFrame(tick)}
  tick();
})();