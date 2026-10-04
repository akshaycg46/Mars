import * as THREE from '../vendor/three/three.module.js';
// Fine grain and mottling are visual detail only; they do not alter measured heights.
function grainTexture(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d'),image=ctx.createImageData(512,512);
 let seed=72831;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){const v=Math.max(0,Math.min(255,130+(random()-.5)*110+16*Math.sin(x*.13+Math.sin(y*.037)*3)));const k=(y*512+x)*4;image.data.set([v,v,v,255],k);}ctx.putImageData(image,0,0);
 const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(128,128);return texture;
}
export async function terrainSurface(terrain){
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(terrain.vertices,3));geometry.setIndex(new THREE.BufferAttribute(terrain.indices,1));geometry.computeVertexNormals();
 const n=terrain.meta.width,uv=new Float32Array(n*n*2),colors=new Float32Array(n*n*3),sand=new THREE.Color('#bd8660'),rock=new THREE.Color('#77776f'),rust=new THREE.Color('#a25736'),chalk=new THREE.Color('#d8b697');
 const color=new THREE.Color();
 for(let r=0;r<n;r++)for(let c=0;c<n;c++){
  const i=r*n+c,h=terrain.vertices[i*3+1],x=terrain.vertices[i*3],z=terrain.vertices[i*3+2],slope=1-geometry.attributes.normal.getY(i);
  uv[i*2]=c/(n-1);uv[i*2+1]=1-r/(n-1);
  const patch=.5+.5*Math.sin(x*.028+Math.sin(z*.019)*2.8);const layer=.5+.5*Math.sin(h*.62+Math.sin(x*.014));
  color.copy(sand).lerp(rust,patch*.38).lerp(chalk,layer*.3).lerp(rock,Math.min(.8,slope*2.4));color.toArray(colors,i*3);
 }
 geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
 const image=await new THREE.TextureLoader().loadAsync('/terrain/'+terrain.meta.ortho.file);image.colorSpace=THREE.SRGBColorSpace;image.anisotropy=8;
 // 513 texel centers align with the 513 measured grid nodes (avoid a half-pixel shift).
 image.repeat.set(512/513,512/513);image.offset.set(.5/513,.5/513);
 const material=new THREE.MeshStandardMaterial({map:image,vertexColors:true,bumpMap:grainTexture(),bumpScale:.055,roughness:.97});
 material.onBeforeCompile=shader=>{
  shader.vertexShader='varying vec3 terrainPoint;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n terrainPoint = position;');
  shader.fragmentShader=`varying vec3 terrainPoint;
   float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float noise2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+1.),f.x),f.y);}
   float fbm(vec2 p){return .53*noise2(p)+.27*noise2(p*2.03)+.13*noise2(p*4.17)+.07*noise2(p*8.31);}
   float stoneEdge(vec2 p){vec2 i=floor(p),f=fract(p);float a=9.,b=9.;for(int y=-1;y<=1;y++){for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 v=g+vec2(hash21(i+g),hash21(i+g+37.))-f;float d=dot(v,v);if(d<a){b=a;a=d;}else{b=min(b,d);}}}return smoothstep(.018,.11,b-a);}
  `+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
   diffuseColor.rgb = mix(vec3(0.16), diffuseColor.rgb * 2.2, 0.85);`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec2 p=terrainPoint.xz;
   float variation=fbm(p*.32);
   float exposure=smoothstep(.42,.65,variation);
   float seam=stoneEdge(p*3.2+vec2(noise2(p*2.))*.35);
   float grit=noise2(p*95.);
   float grain=.78+.35*grit;
   float bedrock=mix(.42,1.,seam);
   vec3 ash=vec3(.24,.22,.19);
   diffuseColor.rgb=mix(diffuseColor.rgb,ash,exposure*.52);
   diffuseColor.rgb*=grain*mix(1.,bedrock,exposure*.78);
   diffuseColor.rgb*=.82+.35*fbm(p*2.8);
  `);
 };
 const mesh=new THREE.Mesh(geometry,material);mesh.receiveShadow=true;return mesh;
}
export function createDust(scene){
 const count=1800,positions=new Float32Array(count*3);let seed=87;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<count;i++){positions[i*3]=(random()-.5)*70;positions[i*3+1]=random()*18-3;positions[i*3+2]=(random()-.5)*70;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{clock:{value:0},wind:{value:new THREE.Vector2()},opacity:{value:0}},vertexShader:`uniform float clock; uniform vec2 wind; void main(){vec3 p=position;p.xz=mod(p.xz+wind*clock*.12+35.,70.)-35.;p.y+=sin(clock*.3+position.x)*.3;vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp(55./-mv.z,1.,5.);gl_Position=projectionMatrix*mv;}`,fragmentShader:`uniform float opacity;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(.69,.43,.23,(1.-d*2.)*opacity);}`});
 const points=new THREE.Points(g,m);points.frustumCulled=false;scene.add(points);
 return {update(position,time,w){points.position.copy(position);m.uniforms.clock.value=time;m.uniforms.wind.value.set(w.x,w.z);m.uniforms.opacity.value=w.dust*.48;points.visible=w.dust>.05;}};
}
