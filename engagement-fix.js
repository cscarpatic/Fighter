(()=>{
  let lastPlayer=null;
  function setup(){
    const s=window.AeroOpsState;
    const p=s?.player;
    if(!p||!p.position||p===lastPlayer)return;
    lastPlayer=p;

    // Point the player toward the historical objective area instead of away from it.
    const contacts=(s.contacts||[]).filter(o=>o?.position&&!o.userData?.dead);
    if(contacts.length){
      const target=contacts.reduce((best,o)=>{
        const priority=o.userData?.objective?0:1;
        const d=Math.hypot(o.position.x-p.position.x,o.position.z-p.position.z);
        const score=priority*100000+d;
        return !best||score<best.score?{o,score}:best;
      },null)?.o;
      if(target){
        const dx=target.position.x-p.position.x;
        const dz=target.position.z-p.position.z;
        p.rotation.y=Math.atan2(-dx,-dz);
        p.rotation.z=0;
      }
    }else{
      p.rotation.y=0;
      p.rotation.z=0;
    }

    // Put the first combat patrol close enough for an engagement in seconds,
    // then stagger the rest farther down the route.
    const enemies=s.enemies||[];
    const fwd={x:-Math.sin(p.rotation.y),z:-Math.cos(p.rotation.y)};
    const right={x:Math.cos(p.rotation.y),z:-Math.sin(p.rotation.y)};
    enemies.forEach((e,i)=>{
      if(!e?.position)return;
      const row=Math.floor(i/2);
      const dist=420+row*230+(i%2)*70;
      const side=(i%2===0?-1:1)*(120+row*35);
      e.position.x=p.position.x+fwd.x*dist+right.x*side;
      e.position.z=p.position.z+fwd.z*dist+right.z*side;
      e.position.y=Math.max(110,p.position.y+35+(i%3)*28);
      e.rotation.y=Math.atan2(p.position.x-e.position.x,p.position.z-e.position.z);
      if(e.userData)e.userData.s=Math.min(e.userData.s||1.05,1.12);
    });
  }
  function tick(){setup();requestAnimationFrame(tick)}
  tick();
})();
