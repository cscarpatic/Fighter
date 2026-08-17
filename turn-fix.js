// Coordinated-turn assist for the arcade flight model.
// A maintained bank continuously changes heading. Tuned numerically for a
// compact arcade turn radius while keeping small joystick inputs controllable.
let last=performance.now();

function wrapPi(a){return Math.atan2(Math.sin(a),Math.cos(a));}

function coordinatedTurn(now){
  requestAnimationFrame(coordinatedTurn);
  const dt=Math.min((now-last)/1000,0.04); last=now;
  const p=window.AeroOpsState?.player;
  if(!p?.parent) return;

  const bank=wrapPi(p.rotation.z);
  const abs=Math.abs(bank);
  if(abs<0.03) return;

  // Stronger authority already at modest bank angles. At the game's normal
  // cruise speed this gives roughly: 20° bank ~74-unit radius, 25° ~64,
  // 35° ~52, and 45° ~44. This keeps dogfights compact without snapping.
  const normalized=Math.min(abs/0.90,1);
  let authority=Math.pow(normalized,0.65);

  // Taper only near knife-edge/inverted attitudes so a deliberate roll stays
  // controllable instead of becoming an uncontrolled flat spin.
  if(abs>1.35) authority*=Math.max(0.28,1-(abs-1.35)/1.55);

  const yawRate=1.65*authority; // rad/s
  p.rotation.y+=Math.sign(bank)*yawRate*dt;
}

requestAnimationFrame(coordinatedTurn);
