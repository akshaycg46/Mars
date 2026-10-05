import * as THREE from '../vendor/three/three.module.js';
// Procedural sky illustration. Atmospheric bands are not a reconstruction of observed clouds.
export function createSky(scene){
 const material=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false,uniforms:{clock:{value:0},dust:{value:0}},
 vertexShader:`varying vec3 direction;void main(){direction=normalize(position);vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}`,
 fragmentShader:`varying vec3 direction;uniform float clock;uniform float dust;
 float hash3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
 float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1)),f.x),f.y),f.z);}
 float fbm(vec3 p){return .55*noise3(p)+.27*noise3(p*2.07)+.13*noise3(p*4.13)+.05*noise3(p*8.21);}
 void main(){vec3 d=normalize(direction);float altitude=max(d.y,0.);float drift=clock*.0015;
 vec3 zenith=mix(vec3(.105,.085,.15),vec3(.23,.09,.035),dust);
 vec3 horizon=mix(vec3(.58,.30,.13),vec3(.42,.16,.045),dust);
 vec3 color=mix(horizon,zenith,pow(altitude,.52));
 float bands=fbm(vec3(d.x*4.+drift,d.y*18.,d.z*4.+drift*.6));
 float wisps=smoothstep(.42,.69,bands)*smoothstep(-.05,.25,d.y);
 color=mix(color,mix(vec3(.57,.39,.27),vec3(.52,.25,.08),dust),wisps*(.48+dust*.28));
 float fine=fbm(d*35.+vec3(drift));color+=(fine-.5)*(.085+dust*.09);
 vec3 sun=normalize(vec3(-20.,30.,12.));float alignment=max(0.,dot(d,sun));
 color+=vec3(.32,.27,.19)*pow(alignment,18.)*(1.-dust*.7);
 color=mix(color,vec3(1.,.92,.74),smoothstep(.9995,.99985,alignment)*(1.-dust*.85));
 gl_FragColor=vec4(color,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const dome=new THREE.Mesh(new THREE.SphereGeometry(500,40,24),material);dome.renderOrder=-100;dome.frustumCulled=false;scene.add(dome);
 return {update(camera,time,weather){dome.position.copy(camera.position);material.uniforms.clock.value=time;material.uniforms.dust.value=weather.dust;}};
}
