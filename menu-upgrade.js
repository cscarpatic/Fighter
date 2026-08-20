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
  const chart={
    'Pearl Harbor':['PEARL HARBOR · 07/12/1941 08:00','Ford Island · Oahu'],
    'Midway':['MIDWAY · 04/06/1942 10:20','Kido Butai · Pacifico'],
    'Normandia':['NORMANDIA · D-DAY','Omaha / Utah'],
    'Ploiești – Tidal Wave':['PLOIEȘTI · 01/08/1943','Raffinerie · Romania'],
    'Ruhr – Dambusters':['RUHR · 16/05/1943','Möhne / Eder · Germania'],
    'Golfo di Leyte':['SIBUYAN SEA · 24/10/1944','Forza Centrale · Filippine'],
    'MiG Alley':['YALU · 1951','Sinuiju · Corea'],
    'Vietnam – Rolling Thunder':['HANOI · 1967','Fiume Rosso · Vietnam'],
    'Linebacker II':['HANOI · DIC 1972','Yen Vien / Kinh No'],
    'Desert Storm':['IRAQ · 17/01/1991','Al Taqaddum · Iraq']
  };
  const missionData=()=>window.AERO_CAMPAIGN||[];
  function el(n,c){const x=document.createElement(n);if(c)x.className=c;return x}
  function svgEl(n,a={}){const x=document.createElementNS(SVG,n);for(const[k,v]of Object.entries(a))x.setAttribute(k,v);return x}
  function textEl(x,y,t,fill='#dff7ff',size=7,anchor='start'){const q=svgEl('text',{x,y,fill,'font-size':size,'font-family':'system-ui','font-weight':700,'text-anchor':anchor});q.textContent=t;return q}
  function sceneArt(m){
    const wrap=el('div','missionArt');
    const cv=document.createElement('canvas');cv.width=720;cv.height=300;wrap.appendChild(cv);
    const g=cv.getContext('2d'),th=themes[m.n]||['#173447','#7fd5f2','AIR OPS'];
    const grd=g.createLinearGradient(0,0,0,300);grd.addColorStop(0,th[0]);grd.addColorStop(1,'#07131c');g.fillStyle=grd;g.fillRect(0,0,720,300);
    if(m.land){g.fillStyle='rgba(100,116,68,.75)';g.beginPath();g.moveTo(0,235);for(let x=0;x<=720;x+=45)g.lineTo(x,218+Math.sin(x*.025)*14+Math.cos(x*.011)*10);g.lineTo(720,300);g.lineTo(0,300);g.fill();}
    else {g.fillStyle='rgba(17,106,137,.72)';g.fillRect(0,220,720,80);for(let y=230;y<300;y+=17){g.strokeStyle='rgba(180,235,250,.12)';g.beginPath();g.moveTo(0,y);g.lineTo(720,y+Math.sin(y)*3);g.stroke();}}
    g.save();g.translate(470,105);g.rotate(-.08);g.fillStyle='rgba(235,244,244,.92)';g.beginPath();g.moveTo(-115,5);g.lineTo(-22,-7);g.lineTo(18,-66);g.lineTo(35,-64);g.lineTo(24,-5);g.lineTo(123,10);g.lineTo(125,20);g.lineTo(22,12);g.lineTo(12,64);g.lineTo(-4,64);g.lineTo(-13,11);g.lineTo(-118,18);g.closePath();g.fill();g.restore();
    g.fillStyle='rgba(5,12,17,.82)';
    if(!m.land){g.fillRect(55,205,190,20);g.beginPath();g.moveTo(75,225);g.lineTo(224,225);g.lineTo(201,252);g.lineTo(99,252);g.closePath();g.fill();g.fillRect(120,177,55,28);if(m.layout?.some(x=>x[1]==='carrier'))g.fillRect(82,166,160,8);}
    else {for(let i=0;i<4;i++)g.fillRect(45+i*54,205-(i%2)*18,38,48+(i%2)*18);}
    g.fillStyle=th[1];g.font='900 23px system-ui';g.fillText(th[2],24,38);
    g.fillStyle='rgba(255,255,255,.82)';g.font='700 14px system-ui';g.fillText(m.map||'',24,63);
    return wrap;
  }
  function miniMap(m){
    const box=el('div','miniMap');
    const s=svgEl('svg',{viewBox:'0 0 220 125','aria-label':`Carta tattica ${m.n}`});box.appendChild(s);
    s.appendChild(svgEl('rect',{x:0,y:0,width:220,height:125,rx:10,fill:m.land?'#273329':'#0b3040'}));
    for(let i=1;i<4;i++){
      s.appendChild(svgEl('line',{x1:i*55,y1:0,x2:i*55,y2:125,stroke:'#91b5b8','stroke-opacity':.12}));
      s.appendChild(svgEl('line',{x1:0,y1:i*31.25,x2:220,y2:i*31.25,stroke:'#91b5b8','stroke-opacity':.12}));
    }
    if(m.land){
      s.appendChild(svgEl('path',{d:'M0 98 C36 82 61 94 91 73 S151 54 220 69 L220 125 L0 125Z',fill:'#4d5b3c','fill-opacity':.72,stroke:'#8a9a6c','stroke-width':1}));
    }else if(m.n==='Pearl Harbor'){
      s.appendChild(svgEl('path',{d:'M0 20 L67 12 94 32 81 55 115 70 104 96 61 109 0 100Z M150 10 L220 0 220 52 182 60 160 41Z',fill:'#5a6448',stroke:'#9ca87a','stroke-width':1}));
      s.appendChild(svgEl('ellipse',{cx:112,cy:75,rx:21,ry:25,fill:'#657052',stroke:'#b0ba8d'}));
    }
    const pts=[...(m.layout||[]).map(a=>({x:a[2],z:a[3],t:a[1],n:a[0]})),...(m.aa||[]).map((a,i)=>({x:a[0],z:a[1],t:'aa',n:`AA ${i+1}`}))];
    if(pts.length){
      const xs=pts.map(p=>p.x),zs=pts.map(p=>p.z),mnx=Math.min(...xs),mxx=Math.max(...xs),mnz=Math.min(...zs),mxz=Math.max(...zs),dx=Math.max(1,mxx-mnx),dz=Math.max(1,mxz-mnz);
      const objectiveTypes=new Set((m.objectives||[]).map(o=>o[1]));
      for(const p of pts){
        const x=15+(p.x-mnx)/dx*190,y=22+(p.z-mnz)/dz*82;
        const target=objectiveTypes.has(p.t);
        if(p.t==='ship'||p.t==='carrier'){
          s.appendChild(svgEl('rect',{x:x-4,y:y-2.4,width:8,height:4.8,fill:target?'#ff4f4f':'#64d9ff',stroke:'#fff','stroke-width':target?1:.35}));
          if(p.t==='carrier')s.appendChild(svgEl('line',{x1:x-5.5,y1:y,x2:x+5.5,y2:y,stroke:'#fff','stroke-width':.6}));
        }else if(p.t==='aa'){
          s.appendChild(svgEl('line',{x1:x-3,y1:y-3,x2:x+3,y2:y+3,stroke:'#ff9e42','stroke-width':1.6}));
          s.appendChild(svgEl('line',{x1:x+3,y1:y-3,x2:x-3,y2:y+3,stroke:'#ff9e42','stroke-width':1.6}));
        }else{
          s.appendChild(svgEl('circle',{cx:x,cy:y,r:target?3.6:2.6,fill:target?'#ffd84d':'#d5bd67',stroke:target?'#fff4a8':'none','stroke-width':.7}));
        }
      }
    }
    const c=chart[m.n]||[m.n||'CARTA OPERATIVA',m.map||''];
    s.appendChild(textEl(7,11,c[0],'#f5e8bd',7.2));
    s.appendChild(textEl(7,120,c[1],'#b9c8c4',6.4));
    s.appendChild(textEl(205,12,'N↑','#fff',8,'middle'));
    return box;
  }
  function decorate(){
    if(busy)return;busy=true;
    const data=missionData(),buttons=[...document.querySelectorAll('#missions .mission')];
    buttons.forEach((b,i)=>{
      if(b.dataset.pro==='1')return;const m=data[i];if(!m)return;b.dataset.pro='1';
      const title=b.querySelector('b')?.textContent||m.n,date=b.querySelector('span')?.textContent||m.d;b.textContent='';
      const media=el('div','missionMedia');media.append(sceneArt(m),miniMap(m));
      const body=el('div','missionBody'),level=el('div','missionLevel');level.textContent=`LIVELLO ${i+1}`;
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