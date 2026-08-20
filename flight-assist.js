import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

let last=performance.now(),lastPlayer=null;
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const hud=document.createElement('div');
hud.id='assistHud';hud.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:32;display:none;font-family:system-ui,sans-serif';
const gun=document.createElement('div');gun.style.cssText='position:absolute;width:34px;height:34px;border:3px solid #7fffd4;border-radius:50%;box-shadow:0 0 12px #42ffd0;transform:translate(-50%,-50%);display:none';
gun.innerHTML='<i style="position:absolute;left:14px;top:-7px;width:2px;height:46px;background:#7fffd4"></i><i style="position:absolute;top:14px;left:-7px;height:2px;width:46px;background:#7fffd4"></i>';
const bomb=document.createElement('div');bomb.style.cssText='position:absolute;width:40px;height:40px;border:3px dashed #ffd95a;border-radius:50%;box-shadow:0 0 12px #ffd95a;transform:translate(-50%,-50%);display:none';
const info=document.createElement('div');info.style.cssText='position:absolute;left:50%;bottom:16%;transform:translateX(-50%);padding:5px 9px;border-radius:7px;background:rgba(0,0,0,.45);color:#dff;font-size:12px;font-weight:800;letter-spacing:.04em';info.textContent='ASSISTENZA VOLO ATTIVA';
hud.append(gun,bomb,info);document.body.appendChild(hud);

function nearestAhead(p,enemies){let best=null,bScore=Infinity;const fwd=new THREE.Vector3(0,0,-1).applyQuaternion(p.quaternion),right=new THREE.Vector3(1,0,0).applyQuaternion(p.quaternion),up=new THREE.Vector3(0,1,0).applyQuaternion(p.quaternion);for(const e of enemies||[]){if(!e?.parent||e.userData?.dead)continue;const v=e.position.clone().sub(p.position),dist=v.length();if(dist>900||dist<25)continue;const z=fwd.dot(v);if(z<=0)continue;const x=right.dot(v)/z,y=up.dot(v)/z,score=Math.hypot(x,y)*2+dist/1600;if(score<bScore){bScore=score;best={e,v,dist,x,y,z}}}return best}
function updateAim(p,state){const game=document.getElementById('game'),visible=game&&!game.classList.contains('hidden');hud.style.display=visible?'block':'none';if(!visible)return;const target=nearestAhead(p,state.enemies);if(target&&Math.abs(target.x)<.7&&Math.abs(target.y)<.55){const lead=.12+target.dist/4500;const ex=target.e.userData?.s||1;const lateral=target.e.position.clone().sub(p.position);const f=new THREE.Vector3(0,0,-1).applyQuaternion(p.quaternion),r=new THREE.Vector3(1,0,0).applyQuaternion(p.quaternion),u=new THREE.Vector3(0,1,0).applyQuaternion(p.quaternion);const z=Math.max(1,f.dot(lateral)),x=r.dot(lateral)/z,y=u.dot(lateral)/z;gun.style.left=`${50+x*48}%`;gun.style.top=`${50-y*48}%`;gun.style.display='block';}else gun.style.display='none';
  // Simple CCIP-style bomb cue: farther forward at high speed/altitude, centered laterally.
  const alt=Math.max(0,p.position.y),fall=Math.sqrt(2*alt/24),speed=78;const forwardDist=speed*fall*.78;const vertical=Math.min(34,8+alt/16);bomb.style.left='50%';bomb.style.top=`${52+vertical}%`;bomb.style.display=alt>45?'block':'none';bomb.title=`Punto impatto stimato ${Math.round(forwardDist)} m avanti`;
}
function assist(now){requestAnimationFrame(assist);const dt=Math.min(.04,(now-last)/1000);last=now;const s=window.AeroOpsState,p=s?.player;if(!p?.parent)return;const a=window.__AERO_ANALOG||{x:0,y:0,active:false};
  // Easy mode: strong but smooth recovery when the stick is released.
  if(!a.active||Math.abs(a.x)<.08){const z=wrap(p.rotation.z);p.rotation.z=THREE.MathUtils.lerp(z,0,Math.min(1,dt*1.8));}
  if(!a.active||Math.abs(a.y)<.08){p.rotation.x=THREE.MathUtils.lerp(p.rotation.x,0,Math.min(1,dt*.9));}
  // Keep normal manoeuvres comfortable; full-stick still allows aerobatics via existing model.
  if(a.active&&Math.abs(a.x)<.82){const max=.72;p.rotation.z=THREE.MathUtils.clamp(wrap(p.rotation.z),-max,max);}
  updateAim(p,s);
}
requestAnimationFrame(assist);
