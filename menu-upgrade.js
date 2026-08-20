(()=>{
  const SVG='http://www.w3.org/2000/svg';
  let busy=false;
  const themes={
    'Pearl Harbor':['#11354a','#d8b55b','PACIFIC FLEET'],
    'Midway':['#0d3857','#63c7d8','CARRIER STRIKE'],
    'Normandia':['#314632','#c9b37a','D-DAY'],
    'Ploiești – Tidal Wave':['#4c3b27','#e5a84a','OIL STRIKE'],
    'Ruhr – Dambusters':['#28353e','#77a6bb','NIGHT RAID'],
    'Golfo di Leyte':['#15374a','#e6bd5e','SIBUYAN SEA'],
    'MiG Alley':['#263d45','#c6644e','JET COMBAT'],
    'Vietnam – Rolling Thunder':['#31452d','#d88a42','HANOI'],
    'Linebacker II':['#252d35','#de654e','STRATEGIC STRIKE'],
    'Desert Storm':['#55462d','#e9c56b','DESERT STRIKE']
  };
  const missionData=()=>window.AERO_CAMPAIGN||[];
  function el(n,c){const x=document.createElement(n);if(c)x.className=c;return x}
  function svgEl(n,a={}){const x=document.createElementNS(SVG,n);for(const[k,v]of Object.entries(a))x.setAttribute(k,v);return x}
  function sceneArt(m){
    const wrap=el('div','missionArt');
    const cv=document.createElement('canvas');cv.width=720;cv.height=300;wrap.appendChild(cv);
    const g=cv.getContext('2d'),th=themes[m.n]||['#173447','#7fd5f2','AIR OPS'];
    const grd=g.createLinearGradient(0,0,0,300);grd.addColorStop(0,th[0]);grd.addColorStop(1,'#07131c');g.fillStyle=grd;g.fillRect(0,0,720,300);
    // horizon / terrain
    if(m.land){g.fillStyle='rgba(100,116,68,.75)';g.beginPath();g.moveTo(0,235);for(let x=0;x<=720;x+=45)g.lineTo(x,218+Math.sin(x*.025)*14+Math.cos(x*.011)*10);g.lineTo(720,300);g.lineTo(0,300);g.fill();}
    else {g.fillStyle='rgba(17,106,137,.72)';g.fillRect(0,220,720,80);for(let y=230;y<300;y+=17){g.strokeStyle='rgba(180,235,250,.12)';g.beginPath();g.moveTo(0,y);g.lineTo(720,y+Math.sin(y)*3);g.stroke();}}
    // stylized aircraft silhouette
    g.save();g.translate(470,105);g.rotate(-.08);g.fillStyle='rgba(235,244,244,.92)';g.beginPath();g.moveTo(-115,5);g.lineTo(-22,-7);g.lineTo(18,-66);g.lineTo(35,-64);g.lineTo(24,-5);g.lineTo(123,10);g.lineTo(125,20);g.lineTo(22,12);g.lineTo(12,64);g.lineTo(-4,64);g.lineTo(-13,11);g.lineTo(-118,18);g.closePath();g.fill();g.restore();
    // scenario icon foreground
    g.fillStyle='rgba(5,12,17,.82)';
    if(!m.land){g.fillRect(55,205,190,20);g.beginPath();g.moveTo(75,225);g.lineTo(224,225);g.lineTo(201,252);g.lineTo(99,252);g.closePath();g.fill();g.fillRect(120,177,55,28);if(m.layout?.some(x=>x[1]==='carrier'))g.fillRect(82,166,160,8);}
    else {for(let i=0;i<4;i++)g.fillRect(45+i*54,205-(i%2)*18,38,48+(i%2)*18);}
    g.fillStyle=th[1];g.font='900 23px system-ui';g.letterSpacing='2px';g.fillText(th[2],24,38);
    g.fillStyle='rgba(255,255,255,.82)';g.font='700 14px system-ui';g.fillText(m.map||'',24,63);
    return wrap;
  }
  function miniMap(m){
    const box=el('div','miniMap');const s=svgEl('svg',{viewBox:'0 0 220 125','aria-label':`Mappa ${m.n}`});box.appendChild(s);
    s.appendChild(svgEl('rect',{x:0,y:0,width:220,height:125,rx:10,fill:m.land?'#29362d':'#092d3e'}));
    if(m.land)s.appendChild(svgEl('path',{d:'M0 96 C38 79 62 94 91 72 S150 54 220 67 L220 125 L0 125Z',fill:'#536344','fill-opacity':.8}));
    const pts=[...(m.layout||[]).map(a=>({x:a[2],z:a[3],t:a[1],n:a[0]})),...(m.aa||[]).map((a,i)=>({x:a[0],z:a[1],t:'aa',n:`AA ${i+1}`}))];
    if(pts.length){const xs=pts.map(p=>p.x),zs=pts.map(p=>p.z),mnx=Math.min(...xs),mxx=Math.max(...xs),mnz=Math.min(...zs),mxz=Math.max(...zs),dx=Math.max(1,mxx-mnx),dz=Math.max(1,mxz-mnz);for(const p of pts){const x=16+(p.x-mnx)/dx*188,y=18+(p.z-mnz)/dz*88;let fill='#ffd64a',r=3;if(p.t==='ship'||p.t==='carrier'){fill='#69d9ff';r=p.t==='carrier'?4.2:3.4}else if(p.t==='aa'){fill='#ff8c42';r=2.7}s.appendChild(svgEl('circle',{cx:x,cy:y,r,fill,stroke:'rgba(255,255,255,.7)','stroke-width':.6}));}}
    const north=svgEl('text',{x:202,y:17,fill:'#fff','font-size':10,'font-weight':900,'text-anchor':'middle'});north.textContent='N↑';s.appendChild(north);
    return box;
  }
  function decorate(){
    if(busy)return;busy=true;
    const data=missionData();const buttons=[...document.querySelectorAll('#missions .mission')];
    buttons.forEach((b,i)=>{
      if(b.dataset.pro==='1')return;const m=data[i];if(!m)return;b.dataset.pro='1';
      const title=b.querySelector('b')?.textContent||m.n,date=b.querySelector('span')?.textContent||m.d;b.textContent='';
      const media=el('div','missionMedia');media.append(sceneArt(m),miniMap(m));
      const body=el('div','missionBody');
      const level=el('div','missionLevel');level.textContent=`LIVELLO ${i+1}`;
      const h=el('h3');h.textContent=title;const d=el('div','missionDate');d.textContent=date;
      const obj=el('div','missionObjectives');(m.objectives||[]).slice(0,3).forEach((o,j)=>{const chip=el('span');chip.innerHTML=`<i>${j+1}</i>${o[0]}`;obj.appendChild(chip)});
      const footer=el('div','missionFooter');footer.innerHTML=`<span>${m.map||'Teatro operativo'}</span><strong>SELEZIONA ›</strong>`;
      body.append(level,h,d,obj,footer);b.append(media,body);
    });
    syncTop();busy=false;
  }
  function syncTop(){
    const sel=document.querySelector('#missions .mission.sel'),name=sel?.querySelector('h3')?.textContent||sel?.querySelector('b')?.textContent||'Missione';
    let badge=document.getElementById('selectedMissionBadge');if(!badge){badge=el('div');badge.id='selectedMissionBadge';const p=document.querySelector('.plan h2');p?.after(badge)}badge.textContent=name.toUpperCase();
  }
  const mo=new MutationObserver(()=>requestAnimationFrame(decorate));
  const start=()=>{const m=document.getElementById('missions');if(m)mo.observe(m,{childList:true,subtree:true});decorate()};
  addEventListener('aero-campaign-ready',()=>setTimeout(start,0),{once:true});
  addEventListener('DOMContentLoaded',()=>setTimeout(start,250),{once:true});
  document.addEventListener('click',e=>{if(e.target.closest('#missions .mission'))setTimeout(decorate,0)});
})();