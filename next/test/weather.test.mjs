import test from 'node:test';import assert from 'node:assert/strict';
import {WEATHER,weatherAt,windForce} from '../public/sim/weather.js';
test('weather scenarios are deterministic, bounded and use thin-atmosphere drag',()=>{
 for(const key of Object.keys(WEATHER))for(let t=0;t<1000;t+=17){const w=weatherAt(key,t);assert.deepEqual(w,weatherAt(key,t));assert.ok(w.speed>=WEATHER[key].wind-WEATHER[key].gust);assert.ok(w.speed<=WEATHER[key].wind+WEATHER[key].gust);}
 const slow=windForce({x:10,z:0},{x:0,z:0}),fast=windForce({x:20,z:0},{x:0,z:0});assert.equal(fast.x,slow.x*4);assert.ok(fast.x<20);assert.equal(fast.y,0);assert.equal(fast.z,0);assert.deepEqual(windForce({x:20,z:0},{x:20,z:0}),{x:0,y:0,z:0});
});
