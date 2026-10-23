/**
 * Tiny binary GLB 2.0 mesh reader. Supports opaque unskinned meshes,
 * POSITION/NORMAL, optional indices, baseColorFactor and node transforms.
 * Existing procedural character is retained if an external GLB cannot be loaded.
 * Texture maps and skeletal animation require a future full glTF engine.
 */
import {I,mul,scale,translate} from './math.js';
const u32=(d,n)=>d.getUint32(n,true);
function quaternionMatrix([x,y,z,w]){
 const m=I(),x2=x+x,y2=y+y,z2=z+z,xx=x*x2,yy=y*y2,zz=z*z2,xy=x*y2,xz=x*z2,yz=y*z2,wx=w*x2,wy=w*y2,wz=w*z2;
 m[0]=1-(yy+zz);m[1]=xy+wz;m[2]=xz-wy;
 m[4]=xy-wz;m[5]=1-(xx+zz);m[6]=yz+wx;
 m[8]=xz+wy;m[9]=yz-wx;m[10]=1-(xx+yy);return m;
}
export async function loadGLB(url,{signal}={}){
 const res=await fetch(url,{signal});if(!res.ok)throw Error(`GLB request ${res.status}`);
 const array=await res.arrayBuffer(),dv=new DataView(array);
 if(u32(dv,0)!==0x46546c67||u32(dv,4)!==2)throw Error('Expected GLB 2.0');
 let pos=12,gltf,binaryStart=0,binaryLength=0;
 while(pos+8<=array.byteLength){const len=u32(dv,pos),type=u32(dv,pos+4);pos+=8;if(type===0x4e4f534a)gltf=JSON.parse(new TextDecoder().decode(new Uint8Array(array,pos,len)));if(type===0x004e4942){binaryStart=pos;binaryLength=len;}pos+=len;}
 if(!gltf||!binaryStart||!binaryLength)throw Error('Missing GLB JSON/BIN chunks');
 function read(idx){const a=gltf.accessors[idx],bv=gltf.bufferViews[a.bufferView],dim=a.type==='VEC3'?3:a.type==='VEC2'?2:1,size={5121:1,5123:2,5125:4,5126:4}[a.componentType];if(!size)throw Error('Unsupported GLB data type');
  const base=binaryStart+(bv.byteOffset||0)+(a.byteOffset||0),stride=bv.byteStride||dim*size;
  const output=a.componentType===5126?new Float32Array(a.count*dim):new Uint32Array(a.count*dim);
  for(let i=0;i<a.count;i++)for(let j=0;j<dim;j++){
   const off=base+i*stride+j*size,ref=i*dim+j;
   output[ref]=a.componentType===5126?dv.getFloat32(off,true):a.componentType===5125?dv.getUint32(off,true):a.componentType===5123?dv.getUint16(off,true):dv.getUint8(off);
  }
  return output;
 }
 const result=[];
 function visit(index,parent=I()){
  const n=gltf.nodes[index],local=n.matrix?new Float32Array(n.matrix):mul(mul(translate(...(n.translation||[0,0,0])),quaternionMatrix(n.rotation||[0,0,0,1])),scale(...(n.scale||[1,1,1])));
  const world=mul(parent,local);
  if(n.mesh!==undefined){const mesh=gltf.meshes[n.mesh];for(const [primitiveIndex,prim] of mesh.primitives.entries()){
   if(prim.mode!==undefined&&prim.mode!==4)continue;
   if(prim.attributes.POSITION===undefined)continue;
   const vertices=read(prim.attributes.POSITION),normals=prim.attributes.NORMAL===undefined?new Float32Array(vertices.length):read(prim.attributes.NORMAL);
   const raw=prim.indices===undefined?Array.from({length:vertices.length/3},(_,i)=>i):read(prim.indices);
   let exceeds=vertices.length/3>65535;for(const index of raw){if(index>65535){exceeds=true;break;}}if(exceeds)throw Error('One GLB primitive exceeds WebGL1 uint16 limits; split mesh into primitives');
   const col=gltf.materials?.[prim.material]?.pbrMetallicRoughness?.baseColorFactor||[.92,.17,.15,1];
   result.push({name:n.name||mesh.name||'imported-mesh-'+primitiveIndex,group:n.extras?.group||'body',geometry:{vertices,normals,indices:new Uint16Array(raw)},color:col.slice(0,3),local:world});
  }}
  for(const child of n.children||[])visit(child,world);
 }
 const scene=gltf.scenes[gltf.scene||0];for(const root of scene.nodes||[])visit(root);
 if(!result.length)throw Error('No supported 3D meshes in GLB');return result;
}
