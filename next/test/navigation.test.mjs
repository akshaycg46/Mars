import test from 'node:test';import assert from 'node:assert/strict';
import {terrainLandmarks,mapPosition,headingRadians,navigationTo} from '../public/sim/navigation.js';
test('survey markers follow measured extrema and preserve north-up coordinates',()=>{
 const n=101,heights=Float32Array.from({length:n*n},(_,i)=>Math.floor(i/n)+i%n);const t={meta:{width:n,spacingMeters:1,spawn:{x:2,z:3}},half:50,heights};const features=terrainLandmarks(t);assert.deepEqual(features[0],{id:'start',label:'Start',x:2,z:3});assert.ok(features[1].height>features[2].height);for(const f of features.slice(1)){assert.equal(f.height,heights[(f.z+50)*n+f.x+50]);}
 assert.deepEqual(mapPosition(0,0,50,320),{x:160,y:160});assert.deepEqual(mapPosition(-50,-50,50,320),{x:0,y:0});assert.equal(navigationTo({x:0,z:0},{x:0,z:-10}).bearing,0);assert.equal(navigationTo({x:0,z:0},{x:10,z:0}).bearing,90);assert.equal(navigationTo({x:0,z:0},{x:3,z:4}).distance,5);assert.equal(headingRadians({x:0,y:0,z:0,w:1}),0);
});
