/** Generate an editable GLB of the exact procedural character used on the site. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {makeMascotGeometry} from '../js/geometry.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const gltf={asset:{version:'2.0',generator:'RED SQUARE procedural mascot exporter'},scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:[],bufferViews:[],accessors:[],buffers:[{byteLength:0}]};
const chunks=[];let byteLength=0;
function align4(n){return(n+3)&~3;}
function write(data,target=34962){const bytes=Buffer.from(data.buffer,data.byteOffset,data.byteLength);const off=byteLength;const padding=align4(bytes.length)-bytes.length;chunks.push(bytes);if(padding)chunks.push(Buffer.alloc(padding));byteLength+=bytes.length+padding;const idx=gltf.bufferViews.length;gltf.bufferViews.push({buffer:0,byteOffset:off,byteLength:bytes.length,target});return idx;}
function accessor(data,type,componentType,withBounds=false){const view=write(data,type==='SCALAR'?34963:34962),count=data.length/(type==='VEC3'?3:1),obj={bufferView:view,byteOffset:0,componentType,count,type};if(withBounds){obj.min=[Infinity,Infinity,Infinity];obj.max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<data.length;i+=3)for(let k=0;k<3;k++){obj.min[k]=Math.min(obj.min[k],data[i+k]);obj.max[k]=Math.max(obj.max[k],data[i+k]);}}const id=gltf.accessors.length;gltf.accessors.push(obj);return id;}
const materialMap=new Map();function material(color){const key=color.join(',');if(materialMap.has(key))return materialMap.get(key);const id=gltf.materials.length;gltf.materials.push({name:'mat-'+id,pbrMetallicRoughness:{baseColorFactor:[...color,1],metallicFactor:0,roughnessFactor:.82},doubleSided:true});materialMap.set(key,id);return id;}
for(const part of makeMascotGeometry()){
 const geo=part.geometry;const position=accessor(geo.vertices,'VEC3',5126,true),normal=accessor(geo.normals,'VEC3',5126),indices=accessor(geo.indices,'SCALAR',5123);
 const mi=gltf.meshes.length;gltf.meshes.push({name:part.name,primitives:[{attributes:{POSITION:position,NORMAL:normal},indices,material:material(part.color),mode:4}]});
 const node={name:part.name,mesh:mi,extras:{group:part.group}};if(part.tx){node.translation=[part.tx.x||0,part.tx.y||0,part.tx.z||0];const a=(part.tx.rz||0)/2;node.rotation=[0,0,Math.sin(a),Math.cos(a)];}
 gltf.scenes[0].nodes.push(gltf.nodes.length);gltf.nodes.push(node);
}
gltf.buffers[0].byteLength=byteLength;
function pad(buf,fill=0x20){const n=align4(buf.length);return n===buf.length?buf:Buffer.concat([buf,Buffer.alloc(n-buf.length,fill)]);}
const json=pad(Buffer.from(JSON.stringify(gltf),'utf8')),binary=pad(Buffer.concat(chunks),0);const buf=Buffer.alloc(12+8+json.length+8+binary.length);
buf.writeUInt32LE(0x46546c67,0);buf.writeUInt32LE(2,4);buf.writeUInt32LE(buf.length,8);
buf.writeUInt32LE(json.length,12);buf.writeUInt32LE(0x4e4f534a,16);json.copy(buf,20);
const bi=20+json.length;buf.writeUInt32LE(binary.length,bi);buf.writeUInt32LE(0x004e4942,bi+4);binary.copy(buf,bi+8);
fs.writeFileSync(path.join(root,'assets/mascot-procedural.glb'),buf);
console.log('GLB exported:',buf.length,'bytes;',gltf.nodes.length,'separate objects');
