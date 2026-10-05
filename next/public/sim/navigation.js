export function terrainLandmarks(terrain){
 const {width:n,spacingMeters:s}=terrain.meta;const margin=Math.ceil(35/s);let high={height:-Infinity},low={height:Infinity};
 for(let r=margin;r<n-margin;r+=2)for(let c=margin;c<n-margin;c+=2){const height=terrain.heights[r*n+c];const point={x:c*s-terrain.half,z:r*s-terrain.half,height};if(height>high.height)high=point;if(height<low.height)low=point;}
 return [{id:'start',label:'Start',x:terrain.meta.spawn?.x||0,z:terrain.meta.spawn?.z||0},{...high,id:'high',label:'High point'},{...low,id:'low',label:'Low ground'}];
}
export function mapPosition(x,z,half,size){return {x:(x+half)/(2*half)*size,y:(z+half)/(2*half)*size};}
export function headingRadians(q){return Math.atan2(2*(q.x*q.z+q.w*q.y),1-2*(q.x*q.x+q.y*q.y));}
export function navigationTo(from,to){const dx=to.x-from.x,dz=to.z-from.z;return {distance:Math.hypot(dx,dz),bearing:(Math.atan2(dx,-dz)*180/Math.PI+360)%360};}
export function createTerrainMap(canvas,terrain,onTarget){
 const size=320;canvas.width=canvas.height=size;const ctx=canvas.getContext('2d'),background=document.createElement('canvas');background.width=background.height=size;const b=background.getContext('2d'),im=b.createImageData(size,size),range=terrain.meta.maximumElevation-terrain.base,interval=range>60?20:2;
 const levels=new Float32Array(size*size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const wx=(x/(size-1)*2-1)*terrain.half,wz=(y/(size-1)*2-1)*terrain.half,h=terrain.height(wx,wz);levels[y*size+x]=h;
  const dx=(terrain.height(wx+2,wz)-terrain.height(wx-2,wz))/4,dz=(terrain.height(wx,wz+2)-terrain.height(wx,wz-2))/4;
  const shade=Math.max(.28,Math.min(1.25,(.7+dx*.45-dz*.35)/Math.sqrt(1+dx*dx+dz*dz)*1.4));const v=h/range,k=(y*size+x)*4;
  im.data.set([(66+v*162)*shade,(65+v*124)*shade,(61+v*61)*shade,255],k);
 }
 b.putImageData(im,0,0);b.fillStyle='#f5deaa77';
 for(let y=1;y<size;y++)for(let x=1;x<size;x++){const i=y*size+x,band=Math.floor(levels[i]/interval);if(band!==Math.floor(levels[i-1]/interval)||band!==Math.floor(levels[i-size]/interval))b.fillRect(x,y,1,1);}
 b.strokeStyle='#e9dfbd30';b.lineWidth=1;for(let i=1;i<5;i++){b.beginPath();b.moveTo(i*size/5,0);b.lineTo(i*size/5,size);b.moveTo(0,i*size/5);b.lineTo(size,i*size/5);b.stroke();}
 const landmarks=terrainLandmarks(terrain);let trail=[],target=landmarks[1];
 function select(point){target=point;onTarget(point);}
 canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect();select({id:'custom',label:'Waypoint',x:Math.max(-terrain.half+5,Math.min(terrain.half-5,((e.clientX-r.left)/r.width*2-1)*terrain.half)),z:Math.max(-terrain.half+5,Math.min(terrain.half-5,((e.clientY-r.top)/r.height*2-1)*terrain.half))});});
 function draw(t){
  const p=mapPosition(t.position.x,t.position.z,terrain.half,size);if(!trail.length||Math.hypot(p.x-trail.at(-1).x,p.y-trail.at(-1).y)>.65){trail.push(p);if(trail.length>2500)trail.shift();}
  ctx.drawImage(background,0,0);ctx.strokeStyle='#f0fbca';ctx.lineWidth=2;ctx.beginPath();trail.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
  for(const feature of landmarks){const f=mapPosition(feature.x,feature.z,terrain.half,size);ctx.fillStyle=feature.id==='start'?'#a5d9ce':'#ffe4a0';ctx.beginPath();ctx.arc(f.x,f.y,4,0,Math.PI*2);ctx.fill();ctx.font='bold 14px Arial';ctx.textAlign=f.x>size*.65?'right':'left';const tx=f.x+(f.x>size*.65?-8:8),ty=Math.max(17,f.y-8);ctx.lineWidth=4;ctx.strokeStyle='#1b211e';ctx.strokeText(feature.label,tx,ty);ctx.fillText(feature.label,tx,ty);}
  const goal=mapPosition(target.x,target.z,terrain.half,size);ctx.strokeStyle='#ffd36e';ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(goal.x,goal.y);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(goal.x,goal.y,8,0,Math.PI*2);ctx.stroke();
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-headingRadians(t.rotation));ctx.fillStyle='#fff';ctx.strokeStyle='#172624';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,10);ctx.lineTo(-6,-6);ctx.lineTo(0,-3);ctx.lineTo(6,-6);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
  ctx.fillStyle='#fff1d3';ctx.font='bold 14px Arial';ctx.textAlign='left';ctx.fillText('N ↑',12,22);const bar=100/(terrain.half*2)*size;ctx.fillRect(12,size-20,bar,3);ctx.font='12px Arial';ctx.fillText('100 m',12,size-25);
  return {...navigationTo(t.position,target),label:target.label,interval};
 }
 select(target);return {draw,landmarks,select,reset(){trail=[];}};
}
