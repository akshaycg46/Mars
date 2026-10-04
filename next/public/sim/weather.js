// Scenario parameters are illustrative, not current weather or reconstructed observations.
export const WEATHER={
 clear:{label:'Clear afternoon',wind:4,gust:2,dust:.025,fog:.0008,sun:2.6,sky:'#b69b82'},
 wind:{label:'Windblown dust',wind:14,gust:6,dust:.28,fog:.006,sun:1.9,sky:'#ae8664'},
 storm:{label:'Dust storm · 2018 inspired',wind:24,gust:10,dust:.8,fog:.024,sun:.55,sky:'#906140'}
};
export function weatherAt(key,time){
 const w=WEATHER[key]||WEATHER.clear;
 const speed=Math.max(0,w.wind+w.gust*(.65*Math.sin(time*.31)+.35*Math.sin(time*.79)));
 const angle=.9+.18*Math.sin(time*.047);
 return {...w,speed,x:Math.cos(angle)*speed,z:Math.sin(angle)*speed};
}
// Quadratic drag in thin Martian air. Fixed illustrative density, area and drag coefficient.
export function windForce(wind,velocity){const x=wind.x-velocity.x,z=wind.z-velocity.z,speed=Math.hypot(x,z);const factor=.5*.02*1.1*3.5*speed;return {x:x*factor,y:0,z:z*factor};}
