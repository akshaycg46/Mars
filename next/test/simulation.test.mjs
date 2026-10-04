import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {initializePhysics,makeTerrain,RoverPhysics} from '../public/sim/physics.js';
await initializePhysics();
const meta=JSON.parse(readFileSync(new URL('../public/terrain/gale.json',import.meta.url)));
const bytes=readFileSync(new URL('../public/terrain/gale-heights.f32',import.meta.url));
const measured=makeTerrain(new Float32Array(bytes.buffer,bytes.byteOffset,bytes.length/4),meta);
test('measured terrain matches provenance and collision/render vertices',()=>{
 assert.equal(createHash('sha256').update(bytes).digest('hex'),meta.heightSha256);
 assert.equal(meta.verticalExaggeration,1);assert.equal(measured.heights.length,513*513);
 for(const i of [1000,64002,130000,250000]){const x=measured.vertices[i*3],z=measured.vertices[i*3+2];assert.ok(Math.abs(measured.height(x,z)-measured.vertices[i*3+1])<.0001);}
});
test('rover drives, turns, brakes, resets and releases physics memory',()=>{
 const flat=makeTerrain(new Float32Array(41*41),{width:41,height:41,spacingMeters:1,minimumElevation:0});
 const sim=new RoverPhysics(flat);
 try{
  for(let i=0;i<180;i++)sim.step();const initial=sim.telemetry();assert.equal(initial.contacts,6);assert.ok(initial.tilt<1);
  for(let i=0;i<600;i++)sim.step({throttle:1});const driven=sim.telemetry();assert.ok(driven.position.z-initial.position.z>.2);assert.ok(driven.speed<.05);
  for(let i=0;i<600;i++)sim.step({throttle:1,turn:1});assert.ok(Math.abs(sim.telemetry().rotation.y)>.01);
  for(let i=0;i<180;i++)sim.step({brake:true});assert.ok(sim.telemetry().speed<.005);
  sim.reset();assert.equal(sim.telemetry().distance,0);assert.equal(sim.telemetry().time,0);assert.equal(sim.telemetry().position.z,0);
 }finally{sim.dispose();}
});
test('measured ground produces chassis tilt and finite wheel contacts',()=>{
 const sim=new RoverPhysics(measured);
 try{for(let i=0;i<300;i++)sim.step();const t=sim.telemetry();assert.ok(t.tilt>.1&&t.tilt<10);assert.ok(t.contacts>=3);assert.ok(Number.isFinite(t.position.y));assert.ok(Math.abs(t.position.y-measured.height(t.position.x,t.position.z))<1.5);}finally{sim.dispose();}
});
