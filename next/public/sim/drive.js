import {createSky} from './sky.js';
import {createTerrainMap} from './navigation.js';
import {terrainSurface,createDust} from './environment.js';
import {weatherAt} from './weather.js';
import * as THREE from '../vendor/three/three.module.js';
import {GLTFLoader} from '../vendor/three/GLTFLoader.js';
import {OrbitControls} from '../vendor/three/OrbitControls.js';
import {initializePhysics,makeTerrain,RoverPhysics,PHYSICS,WHEELS} from './physics.js';
const $=id=>document.getElementById(id),keys=new Set();
let sim,renderer,scene,camera,orbit,bodyRoot,wheels=[],paused=false,follow=true,previous=0,accumulator=0,terrain,dust,sky,navigation,waypoint;
const area=new URLSearchParams(location.search).get("area")==="gale"?"gale":"rugged";
$("area").value=area;$("area").onchange=()=>{location.href="/drive?area="+$("area").value;};
$('help-toggle').onclick=()=>{const panel=$('controls-guide');panel.hidden=!panel.hidden;$('help-toggle').setAttribute('aria-expanded',String(!panel.hidden));release();};
const canvas=$('world'),map=$('map');
const release=()=>{keys.clear();document.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));};
const allowed=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space']);
canvas.addEventListener('keydown',e=>{if(allowed.has(e.code)){e.preventDefault();keys.add(e.code);}});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',release);canvas.addEventListener('blur',release);
document.addEventListener('visibilitychange',()=>{release();previous=0;});
document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);b.classList.add('held');});for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,()=>{keys.delete(b.dataset.key);b.classList.remove('held');});});
$('pause').onclick=()=>{paused=!paused;release();$('pause').textContent=paused?'Resume':'Pause';};
$('reset').onclick=()=>{sim.reset(terrain.meta.spawn?.x||0,terrain.meta.spawn?.z||0);paused=false;$("pause").textContent="Pause";release();accumulator=0;navigation?.reset();};
$('camera').onclick=()=>{follow=true;canvas.focus({preventScroll:true});};
async function fetchChecked(url){const r=await fetch(url);if(!r.ok)throw Error(`Could not load ${url} (${r.status})`);return r;}
$('launch').onclick=async()=>{
 $('launch').disabled=true;$('load-status').textContent='Loading measured terrain, rover model and physics…';
 try{
  const [meta,bytes,gltf]=await Promise.all([fetchChecked('/terrain/'+area+'.json').then(r=>r.json()),fetchChecked('/terrain/'+area+'-heights.f32').then(r=>r.arrayBuffer()),new GLTFLoader().loadAsync('/models/curiosity.glb'),initializePhysics()]);
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
  if(digest!==meta.heightSha256)throw Error('Terrain integrity check failed. Reload to try again.');
  terrain=makeTerrain(new Float32Array(bytes),meta);sim=new RoverPhysics(terrain);sim.reset(meta.spawn?.x||0,meta.spawn?.z||0);
  $("coordinates").textContent=`${Math.abs(meta.centerLatitude).toFixed(4)}° S / ${meta.centerLongitude.toFixed(4)}° E`;$("relief").textContent=`${Math.round(meta.maximumElevation-meta.minimumElevation)} m relief · 1.01 m grid`;$("provenance").href="/terrain/"+area+".json";
  renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  scene=new THREE.Scene();scene.background=new THREE.Color('#b69478');scene.fog=new THREE.FogExp2('#b69478',.0008);
  camera=new THREE.PerspectiveCamera(48,1,.1,650);orbit=new OrbitControls(camera,canvas);orbit.enableDamping=true;orbit.maxDistance=90;orbit.minDistance=4;orbit.maxPolarAngle=Math.PI*.48;orbit.addEventListener('start',()=>{follow=false;canvas.focus({preventScroll:true});});
  scene.add(new THREE.HemisphereLight('#e5d9c7','#473b32',1.4));const sun=new THREE.DirectionalLight('#ffecd0',3);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-14;sun.shadow.camera.right=14;sun.shadow.camera.top=14;sun.shadow.camera.bottom=-14;sun.shadow.camera.far=90;sun.shadow.bias=-.0004;scene.add(sun,sun.target);scene.userData.sun=sun;
  scene.add(await terrainSurface(terrain));dust=createDust(scene);sky=createSky(scene);
  bodyRoot=new THREE.Group();scene.add(bodyRoot);gltf.scene.position.y=-.85;bodyRoot.add(gltf.scene);gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  splitWheels(gltf.scene);
  waypoint=new THREE.Group();const markerMaterial=new THREE.MeshBasicMaterial({color:'#ffd36e',transparent:true,opacity:.8,depthTest:false});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.3,.06,6,32),markerMaterial);ring.rotation.x=Math.PI/2;waypoint.add(ring);
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,5,6),markerMaterial);mast.position.y=2.5;waypoint.add(mast);waypoint.renderOrder=10;scene.add(waypoint);
  navigation=createTerrainMap(map,terrain,point=>{$("map-target").value=point.id;waypoint.position.set(point.x,terrain.height(point.x,point.z)+.15,point.z);});
  $('map-target').onchange=()=>{const point=navigation.landmarks.find(p=>p.id===$('map-target').value);if(point)navigation.select(point);};
  for(let i=0;i<120;i++)sim.step();sim.time=0;sim.distance=0;
  $('start').hidden=true;for(const id of ['pause','reset','camera'])$(id).disabled=false;canvas.focus({preventScroll:true});resize();new ResizeObserver(resize).observe(canvas.parentElement);requestAnimationFrame(frame);
 }catch(e){$('load-status').textContent=`Could not start: ${e.message}. This simulation needs WebGL 2 and WebAssembly. Reload to try again.`;$('launch').textContent='Reload to retry';$('launch').disabled=false;$('launch').onclick=()=>location.reload();if(sim)sim.dispose();}
};
function splitWheels(root){
 let original;root.traverse(o=>{if(o.isMesh&&o.material.name==='wheels')original=o;});if(!original)return;
 const centers=[[-2.1216383,.00521584,-2.25808668],[-2.252305,.003620535,-1.18184376],[-2.1215434,.010227,.00290322],[.004106998,.0011723,-2.25534344],[.13477254,.00292832,-1.18158805],[.00433624,.01020852,.00312626]];
 const geo=original.geometry.index?original.geometry.toNonIndexed():original.geometry,p=geo.attributes.position,buckets=centers.map(()=>[]);
 for(let i=0;i<p.count;i+=3){let x=0,z=0;for(let j=0;j<3;j++){x+=p.getX(i+j)/3;z+=p.getZ(i+j)/3;}let best=0,d=Infinity;centers.forEach((c,k)=>{const s=(x-c[0])**2+(z-c[2])**2;if(s<d){d=s;best=k;}});buckets[best].push(i,i+1,i+2);}
 wheels=buckets.map((ids,k)=>{const g=new THREE.BufferGeometry();for(const name of ['position','normal','uv']){const a=geo.attributes[name];if(!a)continue;const values=new Float32Array(ids.length*a.itemSize);ids.forEach((id,j)=>{for(let t=0;t<a.itemSize;t++)values[j*a.itemSize+t]=a.array[id*a.itemSize+t]-(name==='position'?centers[k][t]:0);});g.setAttribute(name,new THREE.BufferAttribute(values,a.itemSize));}const pivot=new THREE.Group(),wheel=new THREE.Mesh(g,original.material);wheel.castShadow=true;pivot.add(wheel);bodyRoot.add(pivot);return {pivot,wheel};});original.visible=false;
}
function resize(){if(!renderer)return;const r=canvas.parentElement.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
function frame(now){
 requestAnimationFrame(frame);if(document.hidden){previous=0;return;}const elapsed=previous?Math.min((now-previous)/1000,.1):0;previous=now;
 const has=(...codes)=>codes.some(c=>keys.has(c));
 if(!paused){accumulator+=elapsed*Number($('rate').value);let steps=0;while(accumulator>=PHYSICS.dt&&steps++<120){sim.step({mode:$("drive-mode").value,wind:weatherAt($("weather").value,sim.time),throttle:Number(has('KeyW','ArrowUp'))-Number(has('KeyS','ArrowDown')),turn:Number(has('KeyD','ArrowRight'))-Number(has('KeyA','ArrowLeft')),brake:has('Space')});accumulator-=PHYSICS.dt;if(sim.edge){paused=true;$('pause').textContent='Resume';release();break;}}accumulator=Math.min(accumulator,.5);}
 const t=sim.telemetry();const weather=weatherAt($("weather").value,t.time);scene.background.set(weather.sky);scene.fog.color.set(weather.sky);scene.fog.density=weather.fog;dust.update(t.position,t.time,weather);$("wind").textContent=weather.speed.toFixed(1)+" m/s";bodyRoot.position.copy(t.position);bodyRoot.quaternion.copy(t.rotation);
 wheels.forEach(({pivot,wheel},i)=>{pivot.position.set(WHEELS[i].x,-.15-(sim.vehicle.wheelSuspensionLength(i)??.45),WHEELS[i].z);pivot.rotation.y=sim.vehicle.wheelSteering(i)||0;wheel.rotation.x=sim.vehicle.wheelRotation(i)||0;});
 const target=bodyRoot.position.clone().add(new THREE.Vector3(0,.5,0));if(follow){const offset=new THREE.Vector3(7,3.8,-10).applyQuaternion(bodyRoot.quaternion);camera.position.lerp(target.clone().add(offset),previous===now&&elapsed===0?1:.09);orbit.target.copy(target);}orbit.update();camera.position.y=Math.max(camera.position.y,terrain.height(camera.position.x,camera.position.z)+1.5);
 const sun=scene.userData.sun;sun.intensity=weather.sun;sun.position.copy(target).add(new THREE.Vector3(-20,30,12));sun.target.position.copy(target);sky.update(camera,t.time,weather);renderer.render(scene,camera);
 $('speed').textContent=`${(t.speed*100).toFixed(1)} cm/s`;$('tilt').textContent=`${t.tilt.toFixed(1)}°`;$('contact').textContent=`${t.contacts} / 6`;$('distance').textContent=`${t.distance.toFixed(1)} m`;$('slope').textContent=`${t.slope.toFixed(1)}°`;$('elapsed').textContent=`${Math.floor(t.time/60)}:${String(Math.floor(t.time%60)).padStart(2,'0')}`;$('state').textContent=t.edge?'Tile edge · reset drive':paused?'Paused':t.tilt>28?'Steep tilt · use caution':has('KeyW','KeyS','ArrowUp','ArrowDown')?'Driving':'Braking';
 const nav=navigation.draw(t);$('navigation-status').textContent=`${nav.label} · ${nav.distance.toFixed(0)} m · ${nav.bearing.toFixed(0)}°`;$('map-caption').textContent=`Contours ${nav.interval} m · click to set a waypoint`;
}
