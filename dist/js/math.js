/** Small column-major matrix utility. No external WebGL dependencies. */
export const I = () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
export function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s;}return o;}
export function translate(x=0,y=0,z=0){const o=I();o[12]=x;o[13]=y;o[14]=z;return o;}
export function scale(x=1,y=x,z=x){const o=I();o[0]=x;o[5]=y;o[10]=z;return o;}
export function rotX(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[5]=c;o[6]=s;o[9]=-s;o[10]=c;return o;}
export function rotY(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[2]=-s;o[8]=s;o[10]=c;return o;}
export function rotZ(a){const o=I(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[1]=s;o[4]=-s;o[5]=c;return o;}
export function chain(...ms){return ms.reduce((a,b)=>mul(a,b),I());}
export function perspective(fovy,aspect,near,far){const f=1/Math.tan(fovy/2),o=new Float32Array(16);o[0]=f/aspect;o[5]=f;o[10]=(far+near)/(near-far);o[11]=-1;o[14]=2*far*near/(near-far);return o;}
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const norm=v=>{const l=Math.hypot(...v)||1;return v.map(n=>n/l);};
export function lookAt(eye,target,up=[0,1,0]){const z=norm(sub(eye,target)),x=norm(cross(up,z)),y=cross(z,x);const o=I();o[0]=x[0];o[1]=y[0];o[2]=z[0];o[4]=x[1];o[5]=y[1];o[6]=z[1];o[8]=x[2];o[9]=y[2];o[10]=z[2];o[12]=-dot(x,eye);o[13]=-dot(y,eye);o[14]=-dot(z,eye);return o;}
export const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
export const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
export const lerp=(a,b,t)=>a+(b-a)*t;
export const range=(p,a,b)=>smooth((p-a)/(b-a));
