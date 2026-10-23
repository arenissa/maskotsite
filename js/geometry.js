import {norm,clamp} from './math.js';
/** Every generated mesh stores actual XYZ vertices and surface normals. */
function builder(){const v=[],n=[],ix=[];return{v,n,ix,add(p,normal){v.push(...p);n.push(...normal);return v.length/3-1;},tri(a,b,c){ix.push(a,b,c)},finish(){return{vertices:new Float32Array(v),normals:new Float32Array(n),indices:new Uint16Array(ix)}}};}
/** Six independently tessellated faces, with vertices projected onto rounded corners. */
export function roundedBox(w,h,d,r=.1,segs=12){const b=builder(),half=[w/2,h/2,d/2];for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){const u=(axis+1)%3,v=(axis+2)%3;const start=b.v.length/3;for(let j=0;j<=segs;j++)for(let i=0;i<=segs;i++){const pos=[0,0,0];pos[axis]=sign*half[axis];pos[u]=((i/segs)*2-1)*half[u];pos[v]=((j/segs)*2-1)*half[v];const inner=pos.map((z,k)=>clamp(z,-half[k]+r,half[k]-r));const diff=pos.map((z,k)=>z-inner[k]);const nr=norm(diff);b.add(inner.map((z,k)=>z+nr[k]*r),nr);}for(let j=0;j<segs;j++)for(let i=0;i<segs;i++){const a=start+j*(segs+1)+i,br=a+1,c=a+(segs+1),d=c+1;if(sign===1){b.tri(a,br,c);b.tri(br,d,c);}else{b.tri(a,c,br);b.tri(br,c,d);}}}return b.finish();}
export function sphere(rx=1,ry=rx,rz=rx,latitude=15,longitude=22){const b=builder();for(let j=0;j<=latitude;j++){const th=j/latitude*Math.PI;for(let i=0;i<=longitude;i++){const ph=i/longitude*2*Math.PI;const s=Math.sin(th),p=[s*Math.cos(ph),Math.cos(th),s*Math.sin(ph)];b.add([p[0]*rx,p[1]*ry,p[2]*rz],norm([p[0]/rx,p[1]/ry,p[2]/rz]));}}for(let j=0;j<latitude;j++)for(let i=0;i<longitude;i++){const a=j*(longitude+1)+i,br=a+1,c=a+longitude+1,d=c+1;b.tri(a,br,c);b.tri(br,d,c);}return b.finish();}
const catmull=(p0,p1,p2,p3,t)=>{const t2=t*t,t3=t2*t;return [0,1,2].map(i=>.5*(2*p1[i]+(-p0[i]+p2[i])*t+(2*p0[i]-5*p1[i]+4*p2[i]-p3[i])*t2+(-p0[i]+3*p1[i]-3*p2[i]+p3[i])*t3));};
export function tube(points,radius=.07,steps=42,sides=10){const b=builder(),sample=t=>{const pos=t*(points.length-1),i=Math.min(Math.floor(pos),points.length-2),f=Math.min(pos-i,1);return catmull(points[Math.max(0,i-1)],points[i],points[i+1],points[Math.min(points.length-1,i+2)],f);};for(let i=0;i<=steps;i++){const t=i/steps,p=sample(t),a=sample(Math.max(0,t-.002)),c=sample(Math.min(1,t+.002));const tangent=norm(c.map((n,k)=>n-a[k]));let u=norm([tangent[1],-tangent[0],0]);if(Math.hypot(...u)<.001)u=[1,0,0];const v=norm([tangent[1]*u[2]-tangent[2]*u[1],tangent[2]*u[0]-tangent[0]*u[2],tangent[0]*u[1]-tangent[1]*u[0]]);for(let j=0;j<=sides;j++){const ang=2*Math.PI*j/sides,nn=u.map((value,k)=>value*Math.cos(ang)+v[k]*Math.sin(ang));b.add(p.map((value,k)=>value+nn[k]*radius),nn);}}for(let i=0;i<steps;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,br=a+1,c=a+sides+1,d=c+1;b.tri(a,br,c);b.tri(br,d,c);}return b.finish();}
export function makeMascotGeometry(){const parts=[];const add=(name,geometry,color,group='body',tx=null)=>parts.push({name,geometry,color,group,tx});
 const red=[.93,.18,.155],redSide=[.9,.16,.15],charcoal=[.132,.134,.145],glove=[.175,.176,.184],dark=[.115,.115,.119],white=[.975,.965,.94];
 add('red-volumetric-cube',roundedBox(2.64,2.62,1.75,.16,24),red,'body');
 // True 3D face: protruding matte-white rounded eye plates, mobile pupils and raised eyebrows.
 for(const eye of [{x:-.63,rotate:-.075,pupil:-.52},{x:.63,rotate:.09,pupil:.72}]){
  add('eye-shadow',roundedBox(.68,.94,.12,.10,10),redSide,'face',{x:eye.x,y:.30,z:.902,rz:eye.rotate});
  add('eye-white',roundedBox(.61,.87,.13,.095,12),white,'eyes',{x:eye.x,y:.32,z:.957,rz:eye.rotate});
  add('pupil',roundedBox(.20,.42,.095,.055,9),dark,'eyes',{x:eye.pupil,y:.28,z:1.040,rz:eye.rotate});
  add('eye-glint',sphere(.045,.075,.020,9,10),[1,1,1],'eyes',{x:eye.pupil+.034,y:.425,z:1.102});
 }
 add('left-eyebrow',tube([[-1.04,.92,1.01],[-.81,1.07,1.047],[-.47,1.065,1.045]],.042,17,9),dark,'face');
 add('right-eyebrow',tube([[.27,1.06,1.04],[.65,1.19,1.035],[1.02,1.22,.96]],.047,20,9),dark,'face');
 add('smile',tube([[-.40,-.46,.963],[-.19,-.575,1.027],[.13,-.594,1.042],[.43,-.40,.981]],.042,33,10),dark,'face');
 // Main arms: bent, round, substantial joints, a left resting hand and right raised fist.
 add('left-arm',tube([[-1.20,-.33,-.06],[-1.65,-.55,-.02],[-1.95,-.92,.10],[-1.79,-1.24,.34],[-1.53,-1.29,.48]],.205,38,12),charcoal,'left');
 add('left-wrist',sphere(.23,.23,.23,12,15),charcoal,'left',{x:-1.53,y:-1.27,z:.51});
 add('left-glove',roundedBox(.62,.55,.50,.22,13),glove,'left',{x:-1.50,y:-1.38,z:.65,rz:-.17});
 for(let i=0;i<3;i++)add('left-knuckles',roundedBox(.165,.26,.19,.065,8),charcoal,'left',{x:-1.77+i*.19,y:-1.36,z:.94,rz:-.12});
 add('right-arm',tube([[1.20,-.34,-.08],[1.51,-.48,.10],[1.78,-.58,.32],[1.86,-.50,.61]],.205,36,12),charcoal,'right');
 add('right-wrist',sphere(.23,.23,.23,12,15),charcoal,'right',{x:1.83,y:-.50,z:.64});
 add('right-glove',roundedBox(.81,.68,.68,.27,17),glove,'right',{x:2.01,y:-.39,z:.77,rz:-.12});
 // Four curved knuckle volumes and separate thumb define the recognizable punch pose.
 for(let i=0;i<4;i++)add('right-knuckle',roundedBox(.22,.38,.32,.092,10),glove,'right',{x:1.71+i*.205,y:-.47,z:1.06,rz:-.085});
 add('right-thumb',sphere(.22,.23,.30,11,14),charcoal,'right',{x:1.69,y:-.72,z:.89});
 // Short legs, bent into broad shoes; not flat stickers.
 for(const sign of [-1,1]){
  const x=.64*sign;
  add('leg',tube([[x,-1.19,-.12],[x+sign*.10,-1.50,-.04],[x+sign*.21,-1.93,.04],[x+sign*.26,-2.16,.20]],.25,32,13),charcoal,'legs');
  add('shoe',sphere(.58,.28,.48,19,22),glove,'legs',{x:x+sign*.23,y:-2.23,z:.45});
  add('shoe-toe',sphere(.47,.225,.40,14,20),glove,'legs',{x:x+sign*.25,y:-2.23,z:.70});
 }
 return parts;
}
