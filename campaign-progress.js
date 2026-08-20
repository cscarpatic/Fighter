(()=>{
 let handled=false;
 function currentIndex(){return [...document.querySelectorAll('#missions .mission')].findIndex(x=>x.classList.contains('sel'))}
 function isVictory(){const title=(document.getElementById('et')?.textContent||'').toLowerCase();return !title.includes('fallita')&&!title.includes('abbatt')&&!title.includes('bombe esaurite')&&!title.includes('collisione')}
 function tick(){
   const end=document.getElementById('end');
   if(!end||end.classList.contains('hidden')){handled=false;return}
   if(handled)return;handled=true;if(!isVictory())return;
   const buttons=[...document.querySelectorAll('#missions .mission')],i=currentIndex(),next=Math.min(i+1,buttons.length-1);
   localStorage.setItem('aero-level',String(next));
   const back=document.getElementById('back');
   if(next>i){
     const t=document.getElementById('et');if(t)t.textContent=`LIVELLO ${i+1} COMPLETATO`;
     const st=document.getElementById('estat');if(st)st.innerHTML+=`<br><b>Prossima missione pronta.</b>`;
     if(back){back.textContent='LIVELLO SUCCESSIVO';back.dataset.nextLevel='1';}
   }else{
     const t=document.getElementById('et');if(t)t.textContent='CAMPAGNA COMPLETATA';
     if(back){back.textContent='TORNA AL MENU';delete back.dataset.nextLevel;}
   }
 }
 setInterval(tick,250);
})();