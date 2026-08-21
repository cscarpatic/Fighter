import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';

let last=performance.now(),sx=0,sy=0;
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const hud=document.createElement('div');
hud.id='assistHud';hud.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:32;display:none;font-family:system-ui,sans-serif';
const gun=document.createElement('div');gun.style.cssText='position:absolute;width:40px;height:40px;border:4px solid #71ffd0;border-radius:50%;box-shadow:0 0 16px #42ffd0,0 0 3px #fff inset;transform:translate(-50%,-50%);display:none';
gun.innerHTML='<i style="position:absolute;left:17px;top:-8px;width:2px;height:56px;background:#71ffd0"></i><i style="position:absolute;top:17px;left:-8px;height:2px;width:56px;background:#71ffd0"></i>';
const bomb=document.createElement('div');bomb.style.cssText='position:absolute;width:58px;height:58px;border:4px dashed #ffd43b;border-radius:50%;box-shadow:0 0 18px #ffbf00,0 0 4px #fff inset;transform:translate(-50%,-50%);display:none';
const bombText=document.createElement('div');bombText.style.cssText='position:absolute;left:50%;top:64px;transform:translateX(-50%);white-space:nowrap;background:rgba(82,55,0,.82);border:1px solid #ffd43b;color:#fff3a2;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:900;letter-spacing:.04em';bombText.textContent='PUNTO IMPATTO BOMBA';bomb.appendChild(bombText);
const info=document.createElement('div');info.style.cssText='position:absolute;left:50%;bottom:16%;transform:translateX(-50%);padding:6px 10px;border-radius:7px;background:rgba(0,0,0,.48);color:#dff;font-size:12px;font-weight:800;letter-spacing:.04em';info.textContent='ASSISTENZA VOLO FACILE';
hud.append(gun,bomb,info);document.body.appendChild(hud);

function nearestAhead(p,enemies){
  let best=null,bScore=Infinity;
  const fwd=new THREE.Vector3(0,0,-1).applyQuaternion(p.quaternion),right=new THREE.Vector3(1,0,0).applyQuaternion(p.quaternion),up=new THREE.Vector3(0,1,0).applyQuaternion(p.quaternion);
  for(const e of enemies||[]){
    if(!e?.parent||e.userData?.dead)continue;
    const v=e.position.clone().sub(p.position),dist=v.length();if(dist>900||dist<25)continue;
    const z=fwd.dot(v);if(z<=0)continue;
    const x=right.dot(v)/z,y=up.dot(v)/z,score=Math.hypot(x,y)*2+dist/1600;
    if(score<bScore){bScore=score;best={e,v,dist,x,y,z}}
  }
  return best;
}
function cameraFor(p){return p?.parent?.children?.find(o=>o.isPerspectiveCamera)||null}
function projectPoint(world,camera){const q=world.clone().project(camera);if(q.z<-1||q.z>1)return null;return{x:(q.x*.5+.5)*innerWidth,y:(-.5*q.y+.5)*innerHeight}}
function ballisticImpact(p){const g=24,dir=new THREE.Vector3(0,0,-1).applyQuaternion(p.quaternion).normalize(),v=dir.multiplyScalar(82),y0=Math.max(0,p.position.y),vy=v.y,disc=vy*vy+2*g*y0;if(disc<0)return null;const t=(vy+Math.sqrt(disc))/g;if(!Number.isFinite(t)||t<=0||t>12)return null;return p.position.clone().addScaledVector(v,t).add(new THREE.Vector3(0,-.5*g*t*t,0))}
function updateAim(p,state){
  const game=document.getElementById('game'),visible=game&&!game.classList.contains('hidden');hud.style.display=visible?'block':'none';if(!visible)return;
  const target=nearestAhead(p,state.enemies);
  if(target&&Math.abs(target.x)<.7&&Math.abs(target.y)<.55){const lateral=target.e.position.clone().sub(p.position),f=new THREE.Vector3(0,0,-1).applyQuaternion(p.quaternion),r=new THREE.Vector3(1,0,0).applyQuaternion(p.quaternion),u=new THREE.Vector3(0,1,0).applyQuaternion(p.quaternion),z=Math.max(1,f.dot(lateral)),x=r.dot(lateral)/z,y=u.dot(lateral)/z;gun.style.left=`${50+x*48}%`;gun.style.top=`${50-y*48}%`;gun.style.display='block'}else gun.style.display='none';
  const cam=cameraFor(p),impact=ballisticImpact(p),sp=cam&&impact?projectPoint(impact,cam):null;
  if(sp&&sp.x>-80&&sp.x<innerWidth+80&&sp.y>-80&&sp.y<innerHeight+80&&p.position.y>35){bomb.style.left=`${sp.x}px`;bomb.style.top=`${sp.y}px`;bomb.style.display='block'}else bomb.style.display='none';
}

function deadzone(v,d=.12){const a=Math.abs(v);if(a<=d)return 0;return Math.sign(v)*(a-d)/(1-d)}
function assist(now){
  requestAnimationFrame(assist);
  const dt=Math.min(.04,(now-last)/1000);last=now;
  const s=window.AeroOpsState,p=s?.player;if(!p?.parent)return;
  const raw=window.__AERO_ANALOG||{x:0,y:0,active:false};
  const tx=raw.active?deadzone(raw.x):0,ty=raw.active?deadzone(raw.y):0;
  sx=THREE.MathUtils.lerp(sx,tx,Math.min(1,dt*5.5));sy=THREE.MathUtils.lerp(sy,ty,Math.min(1,dt*4.5));
  // Stronger auto-level and gentler pitch: easier to keep the horizon and aim steady.
  if(Math.abs(sx)<.04){const z=wrap(p.rotation.z);p.rotation.z=THREE.MathUtils.lerp(z,0,Math.min(1,dt*2.8));}
  if(Math.abs(sy)<.04){p.rotation.x=THREE.MathUtils.lerp(p.rotation.x,0,Math.min(1,dt*1.7));}
  // Clamp normal bank to a comfortable arcade range; full-stick still allows assertive turns.
  const maxBank=Math.abs(sx)>.86?1.02:.58;
  p.rotation.z=THREE.MathUtils.clamp(wrap(p.rotation.z),-maxBank,maxBank);
  p.rotation.x=THREE.MathUtils.clamp(p.rotation.x,-.38,.34);
  // Coordinated-turn assist: horizontal stick gently adds yaw in the intended direction.
  if(Math.abs(sx)>.05){p.rotation.y+=(-sx)*dt*.26;}
  // Gentle altitude hold when the player is not deliberately pitching.
  if(Math.abs(sy)<.08){const desired=+(document.getElementById('alt')?.value||160);if(Math.abs(p.position.y-desired)<220)p.position.y=THREE.MathUtils.lerp(p.position.y,desired,Math.min(1,dt*.11));}
  updateAim(p,s);
}
requestAnimationFrame(assist);
