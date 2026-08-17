// Coordinated-turn assist for the arcade flight model.
// The core game controls roll/pitch; this layer makes a maintained bank keep
// changing heading, which is the intuitive behaviour expected by the player.
let last=performance.now();

function wrapPi(a){return Math.atan2(Math.sin(a),Math.cos(a));}

function coordinatedTurn(now){
  requestAnimationFrame(coordinatedTurn);
  const dt=Math.min((now-last)/1000,0.04); last=now;
  const p=window.AeroOpsState?.player;
  if(!p?.parent) return;

  const bank=wrapPi(p.rotation.z);
  const abs=Math.abs(bank);
  if(abs<0.035) return; // small dead-zone around wings-level

  // Full turn authority is reached around 55 degrees of bank. Above ~80
  // degrees we taper it so rolls remain controllable instead of becoming spins.
  let authority=Math.min(abs/0.95,1);
  if(abs>1.4) authority*=Math.max(0.2,1-(abs-1.4)/1.45);

  const sign=Math.sign(bank);
  const yawRate=0.92*authority; // rad/s, intentionally arcade-friendly
  p.rotation.y+=sign*yawRate*dt;
}

requestAnimationFrame(coordinatedTurn);
