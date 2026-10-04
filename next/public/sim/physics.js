import {windForce} from './weather.js';
import RAPIER from '../vendor/rapier/rapier.mjs';
export const PHYSICS = Object.freeze({ gravity:3.71, mass:899, radius:0.24265, maxSpeed:0.04, dt:1/60, restLength:0.45, stiffness:28, friction:0.8 });
// Wheel centers measured from the NASA GLB (meters). Body origin is 0.85 m above model ground.
export const WHEELS = [
 {x:-1.05875,z:-1.16300,steer:-1}, {x:-1.18941,z:-0.08675,steer:0}, {x:-1.05865,z:1.09799,steer:1},
 {x:1.06700,z:-1.16025,steer:-1}, {x:1.19766,z:-0.08650,steer:0}, {x:1.06723,z:1.09822,steer:1}
];
export const initializePhysics=()=>RAPIER.init();
export function makeTerrain(heights,meta){
 const n=meta.width, spacing=meta.spacingMeters, half=(n-1)*spacing/2;
 if(n!==meta.height||heights.length!==n*n||!heights.every(Number.isFinite))throw Error('Invalid measured terrain');
 const base=meta.minimumElevation;
 const vertices=new Float32Array(n*n*3),indices=new Uint32Array((n-1)*(n-1)*6);
 for(let r=0;r<n;r++)for(let c=0;c<n;c++){const i=r*n+c;vertices[i*3]=c*spacing-half;vertices[i*3+1]=heights[i]-base;vertices[i*3+2]=r*spacing-half;}
 let k=0;for(let r=0;r<n-1;r++)for(let c=0;c<n-1;c++){const a=r*n+c,b=a+1,d=a+n,e=d+1;indices.set([a,d,b,b,d,e],k);k+=6;}
 function height(x,z){
  const u=Math.max(0,Math.min(n-1.000001,(x+half)/spacing)),v=Math.max(0,Math.min(n-1.000001,(z+half)/spacing));
  const c=Math.floor(u),r=Math.floor(v),fx=u-c,fz=v-r,a=r*n+c;
  // Exactly the same diagonal as both the rendered mesh and collision triangles.
  return (fx+fz<=1?heights[a]+fx*(heights[a+1]-heights[a])+fz*(heights[a+n]-heights[a]):heights[a+n+1]+(1-fx)*(heights[a+n]-heights[a+n+1])+(1-fz)*(heights[a+1]-heights[a+n+1]))-base;
 }
 function slope(x,z){const dx=(height(x+1,z)-height(x-1,z))/2,dz=(height(x,z+1)-height(x,z-1))/2;return Math.atan(Math.hypot(dx,dz))*180/Math.PI;}
 return {meta,heights,vertices,indices,half,base,height,slope};
}
export class RoverPhysics {
 constructor(terrain){
  this.terrain=terrain;this.world=new RAPIER.World({x:0,y:-PHYSICS.gravity,z:0});this.world.timestep=PHYSICS.dt;
  this.world.numSolverIterations=8;
  this.ground=this.world.createCollider(RAPIER.ColliderDesc.trimesh(terrain.vertices,terrain.indices).setFriction(PHYSICS.friction).setRestitution(0));
  this.body=this.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0,terrain.height(0,0)+.88,0).setCanSleep(false).setCcdEnabled(true).setLinearDamping(.05).setAngularDamping(.8));
  this.world.createCollider(RAPIER.ColliderDesc.cuboid(.8,.24,1).setMass(PHYSICS.mass).setFriction(.65).setRestitution(0),this.body);
  this.vehicle=this.world.createVehicleController(this.body);this.vehicle.indexUpAxis=1;this.vehicle.setIndexForwardAxis=2;
  for(const [i,w] of WHEELS.entries()){
   this.vehicle.addWheel({x:w.x,y:-.15,z:w.z},{x:0,y:-1,z:0},{x:-1,y:0,z:0},PHYSICS.restLength,PHYSICS.radius);
   this.vehicle.setWheelSuspensionStiffness(i,PHYSICS.stiffness);this.vehicle.setWheelSuspensionCompression(i,3.5);this.vehicle.setWheelSuspensionRelaxation(i,4.5);
   this.vehicle.setWheelMaxSuspensionTravel(i,.25);this.vehicle.setWheelMaxSuspensionForce(i,1800);this.vehicle.setWheelFrictionSlip(i,1.6);this.vehicle.setWheelSideFrictionStiffness(i,1);
  }
  this.time=0;this.distance=0;this.steering=0;this.edge=false;this.paused=false;this.lastPosition={...this.body.translation()};
  this.world.step();
 }
 reset(x=0,z=0){const limit=this.terrain.half-5;x=Math.max(-limit,Math.min(limit,x));z=Math.max(-limit,Math.min(limit,z));this.body.setTranslation({x,y:this.terrain.height(x,z)+.88,z},true);this.body.setRotation({x:0,y:0,z:0,w:1},true);this.body.setLinvel({x:0,y:0,z:0},true);this.body.setAngvel({x:0,y:0,z:0},true);this.steering=0;this.time=0;this.distance=0;this.lastPosition={...this.body.translation()};this.edge=false;}
 step({throttle=0,turn=0,brake=false,wind={x:0,z:0}}={}){
  const p=this.body.translation(),v=this.body.linvel(),q=this.body.rotation();
  this.edge=Math.max(Math.abs(p.x),Math.abs(p.z))>this.terrain.half-5;
  if(this.edge){brake=true;throttle=0;}
  this.steering+=(turn*.5-this.steering)*.08;
  const forward={x:2*(q.x*q.z+q.w*q.y),y:2*(q.y*q.z-q.w*q.x),z:1-2*(q.x*q.x+q.y*q.y)};
  const speed=v.x*forward.x+v.y*forward.y+v.z*forward.z;
  // Force-based speed governor; position and orientation are never imposed during driving.
  const force=brake||throttle===0?0:Math.max(-300,Math.min(300,(throttle*PHYSICS.maxSpeed-speed)*2600));
  for(let i=0;i<6;i++){this.vehicle.setWheelSteering(i,this.steering*WHEELS[i].steer);this.vehicle.setWheelEngineForce(i,force);this.vehicle.setWheelBrake(i,brake||!throttle?30:0);}
  this.vehicle.updateVehicle(PHYSICS.dt);
  const air=windForce(wind,v);this.body.applyImpulse({x:air.x*PHYSICS.dt,y:0,z:air.z*PHYSICS.dt},true);
  this.world.step();this.time+=PHYSICS.dt;
  // Approximate static tire friction for the parking brake, bounded by mu * weight.
  // Airborne wheels cannot stop the chassis, and steep slopes can still overcome it.
  if((brake||!throttle)&&WHEELS.filter((_,i)=>this.vehicle.wheelIsInContact(i)).length>=3){
   const velocity=this.body.linvel(),speed=Math.hypot(velocity.x,velocity.z);
   const impulse=Math.min(speed*PHYSICS.mass,PHYSICS.friction*PHYSICS.mass*PHYSICS.gravity*PHYSICS.dt);
   if(speed>0)this.body.applyImpulse({x:-velocity.x/speed*impulse,y:0,z:-velocity.z/speed*impulse},true);
  }
  const next=this.body.translation();this.distance+=Math.hypot(next.x-this.lastPosition.x,next.z-this.lastPosition.z);this.lastPosition={...next};
 }
 telemetry(){const p=this.body.translation(),q=this.body.rotation(),v=this.body.linvel();const upY=1-2*(q.x*q.x+q.z*q.z);return {position:p,rotation:q,speed:Math.hypot(v.x,v.z),tilt:Math.acos(Math.max(-1,Math.min(1,upY)))*180/Math.PI,slope:this.terrain.slope(p.x,p.z),contacts:WHEELS.filter((_,i)=>this.vehicle.wheelIsInContact(i)).length,elevation:this.terrain.height(p.x,p.z)+this.terrain.base,time:this.time,distance:this.distance,edge:this.edge};}
 dispose(){this.world.removeVehicleController(this.vehicle);this.world.free();}
}
