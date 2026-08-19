(()=>{
 let handled=false;
 function currentIndex(){return [...document.querySelectorAll('#missions .mission')].findIndex(x=>x.classList.contains('sel'))}
 function isVictory(){const title=(document.getElementById('et')?.textContent||'').toLowerCase();return !title.includes('fallita')&&!title.includes('abbatt')&&!title.includes('bombe esaurite')}
 function tick(){const end=document.getElementById('end');if(!end||end.classList.contains('hidden')){handled=false;return}if(handled)return;handled=true;if(!isVictory())return;const buttons=[...document.querySelectorAll('#missions .mission')],i=currentIndex(),next=Math.min(i+1,buttons.length-1);localStorage.setItem('aero-level',String(next));if(next>i){buttons[next]?.click();const t=document.getElementById('et');if(t)t.textContent=`LIVELLO ${i+1} COMPLETATO`;const st=document.getElementById('estat');if(st)st.innerHTML+=`<br><b>Nuovo livello sbloccato: ${buttons[next]?.querySelector('b')?.textContent||'missione successiva'}</b>`;const back=document.getElementById('back');if(back)back.textContent='LIVELLO SUCCESSIVO'}else{const t=document.getElementById('et');if(t)t.textContent='CAMPAGNA COMPLETATA'}}
 setInterval(tick,250);
})();