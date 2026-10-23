import {makeMascotGeometry} from './geometry.js';
import {loadGLB} from './glb-loader.js';
import {CONFIG} from './config.js';
import {chain,mul,translate,scale,rotY,rotZ,perspective,lookAt,I,lerp,range,clamp} from './math.js';

const VERTEX=`
attribute vec3 aPosition;attribute vec3 aNormal;
uniform mat4 uMvp;uniform mat4 uModel;
varying vec3 vNormal;varying vec3 vPosition;
void main(){vec4 wp=uModel*vec4(aPosition,1.0);vPosition=wp.xyz;vNormal=mat3(uModel)*aNormal;gl_Position=uMvp*vec4(aPosition,1.0);}`;
const FRAGMENT=`
precision highp float;uniform vec3 uColor;uniform float uBrightness;
varying vec3 vNormal;varying vec3 vPosition;
void main(){vec3 n=normalize(vNormal);vec3 light=normalize(vec3(-0.48,0.85,0.96));
float diffuse=max(dot(n,light),0.0);float ambient=0.68+0.13*n.y;
float spec=pow(max(dot(reflect(-light,n),normalize(vec3(0.0,0.0,9.0)-vPosition)),0.0),21.0)*0.15;
vec3 rgb=uColor*(ambient+0.41*diffuse)*uBrightness+vec3(spec);
float rim=pow(1.0-max(dot(n,normalize(vec3(0.0,0.1,9.0)-vPosition)),0.0),3.0)*0.048;
gl_FragColor=vec4(min(rgb+vec3(rim),vec3(1.0)),1.0);}`;
function compile(gl,type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const e=gl.getShaderInfoLog(s);gl.deleteShader(s);throw Error(e);}return s;}
function program(gl){const vs=compile(gl,gl.VERTEX_SHADER,VERTEX),fs=compile(gl,gl.FRAGMENT_SHADER,FRAGMENT),p=gl.createProgram();gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
function buffer(gl,target,data){const b=gl.createBuffer();gl.bindBuffer(target,b);gl.bufferData(target,data,gl.STATIC_DRAW);return b;}
function localMatrix(t){if(!t)return I();return chain(translate(t.x||0,t.y||0,t.z||0),rotZ(t.rz||0));}
const ease=(x,a,b)=>range(x,a,b);
function blinkFactor(t){ // two quick natural eye closes, approximately every 6.2 s.
 const f=t%6.2;let b=1;for(const at of [2.36,2.65]){const d=Math.abs(f-at);if(d<.13)b=Math.min(b,.09+.91*(d/.13));}return b;
}
/**
 * Actual WebGL renderer, using indexed 3D mesh geometry and custom lighting.
 * No SVG/canvas-2D "fake 3D" rotation and no CDN or npm dependency.
 */
export function createMascotRenderer(canvas,{progress,reducedMotion}){
 let gl,shader,parts=[],raf=0,width=0,height=0,lastTime=0,visible=true,dead=false;
 const fallback=()=>document.documentElement.classList.add('no-webgl');
 try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,depth:true,powerPreference:'high-performance'});
  if(!gl)throw Error('WebGL not available');shader=program(gl);
  const attrs={pos:gl.getAttribLocation(shader,'aPosition'),normal:gl.getAttribLocation(shader,'aNormal')};
  const uniforms={mvp:gl.getUniformLocation(shader,'uMvp'),model:gl.getUniformLocation(shader,'uModel'),color:gl.getUniformLocation(shader,'uColor'),brightness:gl.getUniformLocation(shader,'uBrightness')};
  const gpuParts=items=>items.map(part=>({...part,local:part.local||localMatrix(part.tx),vbo:buffer(gl,gl.ARRAY_BUFFER,part.geometry.vertices),nbo:buffer(gl,gl.ARRAY_BUFFER,part.geometry.normals),ibo:buffer(gl,gl.ELEMENT_ARRAY_BUFFER,part.geometry.indices),length:part.geometry.indices.length}));
  const freeParts=items=>{for(const part of items){gl.deleteBuffer(part.vbo);gl.deleteBuffer(part.nbo);gl.deleteBuffer(part.ibo);}};
  parts=gpuParts(makeMascotGeometry());
  const abort=new AbortController();
  if(CONFIG.MASCOT_GLB_PATH)loadGLB(CONFIG.MASCOT_GLB_PATH,{signal:abort.signal}).then(model=>{if(dead)return;const newer=gpuParts(model);freeParts(parts);parts=newer;}).catch(err=>{if(!abort.signal.aborted)console.warn('Procedural mascot is active (GLB unavailable):',err.message);});
  gl.useProgram(shader);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
  function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,1.7);const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(w!==width||h!==height){width=w;height=h;canvas.width=w;canvas.height=h;gl.viewport(0,0,width,height);}}
  const reduced=Boolean(reducedMotion);
  function render(ms){raf=requestAnimationFrame(render);if(dead||!visible||document.hidden)return;
    resize();const t=ms/1000,dt=Math.min((ms-lastTime)/1000,.05);lastTime=ms;
    const p=clamp(progress.current);const isMobile=window.innerWidth<768;
    const intro=ease(p,.058,.247),limb=ease(p,.135,.266),isTurn=ease(p,.264,.618);
    const cameraZ=isMobile?10.8:9.65;
    const aspect=width/height;
    const view=lookAt([0,.22,cameraZ],[0,-.23,0]);
    const proj=perspective((isMobile?37:37)*Math.PI/180,aspect,.1,70);
    const vp=mul(proj,view);
    const baseScale=isMobile?.66:(aspect<1.22?.79:.93);
    const moveX=(isMobile?0:(aspect<1.22?.65:1.65))*intro;
    const bob=reduced?0:((intro>.94)?Math.sin(t*1.55)*.055:0);
    const angleY=(reduced?0:Math.PI*2*isTurn)+((p>.79&&!reduced)?Math.sin(t*.9)*.045:0);
    const rz=(1-intro)*.7854+(intro>.90&&!reduced?Math.sin(t*1.08)*.02:0);
    const character=chain(translate(moveX,-.02+bob,0),rotY(angleY),rotZ(rz),scale(baseScale));
    const birth=lerp(.53,1,intro);
    const growing=chain(character,scale(birth,birth,1));
    const bodyS=chain(growing,scale(1,1,lerp(.05,1,intro)));
    const appear=chain(character,scale(limb));
    const sideSwing=!reduced&&p>.788?Math.sin(t*3.4)*.11*ease(p,.79,.85):0;
    const rightArm=chain(appear,translate(1.20,-.34,-.08),rotZ(sideSwing-.03*ease(p,.80,.87)),translate(-1.20,.34,.08));
    const eyeBlink=reduced?1:blinkFactor(t);
    const eyes=chain(appear,translate(0,.32,0),scale(1,eyeBlink,1),translate(0,-.32,0));
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(shader);
    gl.enableVertexAttribArray(attrs.pos);gl.enableVertexAttribArray(attrs.normal);
    for(const part of parts){let parent=character;
      switch(part.group){case'body':parent=bodyS;break;case'face':parent=appear;break;case'eyes':parent=eyes;break;case'right':parent=rightArm;break;case'left':case'legs':parent=appear;break;}
      const world=mul(parent,part.local),mvp=mul(vp,world);
      gl.uniformMatrix4fv(uniforms.mvp,false,mvp);gl.uniformMatrix4fv(uniforms.model,false,world);
      gl.uniform3fv(uniforms.color,part.color);gl.uniform1f(uniforms.brightness,part.group==='body'?1:1);
      gl.bindBuffer(gl.ARRAY_BUFFER,part.vbo);gl.vertexAttribPointer(attrs.pos,3,gl.FLOAT,false,0,0);
      gl.bindBuffer(gl.ARRAY_BUFFER,part.nbo);gl.vertexAttribPointer(attrs.normal,3,gl.FLOAT,false,0,0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,part.ibo);gl.drawElements(gl.TRIANGLES,part.length,gl.UNSIGNED_SHORT,0);
    }
  }
  const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;},{threshold:0});
  observer.observe(canvas);
  const lost=e=>{e.preventDefault();cancelAnimationFrame(raf);fallback();};
  canvas.addEventListener('webglcontextlost',lost,{passive:false});
  const restored=()=>window.location.reload();canvas.addEventListener('webglcontextrestored',restored);
  const onResize=()=>{width=0;};window.addEventListener('resize',onResize,{passive:true});
  raf=requestAnimationFrame(render);
  return ()=>{dead=true;abort.abort();cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('resize',onResize);canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);if(gl){freeParts(parts);gl.deleteProgram(shader);}};
 }catch(err){console.error('Mascot WebGL fallback:',err);fallback();return()=>{};}
}
