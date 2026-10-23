import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
import {CONFIG} from '../js/config.js';
import {roundedBox,makeMascotGeometry} from '../js/geometry.js';
import {range,rotY,mul,translate} from '../js/math.js';
import {loadGLB} from '../js/glb-loader.js';
const root=path.resolve('');
test('ten merch items with photos and adequate ruble prices',()=>{
  assert.equal(CONFIG.MERCH.length,10);
  assert.ok(CONFIG.MERCH.every(p=>p.price>=300&&p.price<=10000),'Цены в адекватном диапазоне');
  assert.ok(CONFIG.MERCH.every(p=>typeof p.image==='string'&&p.image.startsWith('assets/merch/')),'У каждого товара есть фото');
  for(const p of CONFIG.MERCH)assert.ok(fs.existsSync(path.join(root,p.image)),`Файл фото существует: ${p.image}`);
  const ids=CONFIG.MERCH.map(p=>p.id);assert.equal(new Set(ids).size,ids.length,'Уникальные id');
});
test('story and chat copy matches approved text',()=>{
  assert.equal(CONFIG.STORY_HEADING,'Привет! Я — твой Квадратный напарник.');
  assert.equal(CONFIG.STORY_SUB,'Листай дальше, и ты узнаешь, как я стал тем, кто я есть.');
  assert.equal(CONFIG.CHAT_HEADING,'Привет! Го пообщаемся');
  assert.equal(CONFIG.CHATBOT_URL,'https://n8n.areniss.ru/webhook/e5c6bb23-248c-477b-a7cd-de3d290fc1bc/chat');
});
test('full turn forwards and backwards around Y returns to original orientation',()=>{
 assert.ok(Math.abs(rotY(2*Math.PI)[0]-1)<1e-5);
 assert.ok(Math.abs(rotY(-2*Math.PI)[2])<1e-5);
 const a=mul(rotY(Math.PI/3),rotY(-Math.PI/3));assert.ok(Math.abs(a[0]-1)<1e-6);
});
test('procedural mascot contains true 3D depth, actual vertices and all body parts',()=>{
 const parts=makeMascotGeometry();assert.ok(parts.length>=25);
 assert.ok(parts.some(p=>p.name==='red-volumetric-cube'));
 assert.ok(parts.some(p=>p.name==='smile'));assert.ok(parts.some(p=>p.name==='shoe'));
 assert.ok(parts.some(p=>p.name==='right-glove'));
 for(const {geometry:g} of parts){assert.ok(g.vertices.length>0);assert.ok(g.indices.length>0);assert.equal(g.vertices.length,g.normals.length);for(const n of g.vertices)assert.ok(Number.isFinite(n));for(const i of g.indices)assert.ok(i<g.vertices.length/3);}
 const box=roundedBox(2,2,1,.1);assert.ok(Math.min(...box.vertices.filter((_,i)=>i%3===2))<-.45);
});
test('source includes WebGL fallback and semantic accessible carousel',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(html,/mascotFallback/);assert.match(html,/aria-roledescription="карусель"/);
 assert.match(html,/id="merch"/);
 assert.match(fs.readFileSync(path.join(root,'styles.css'),'utf8'),/prefers-reduced-motion/);
});
test('GLB generated from mascot is valid GLB v2 with separate mesh nodes',()=>{
 const bin=fs.readFileSync(path.join(root,CONFIG.MASCOT_GLB_PATH));
 assert.equal(bin.readUInt32LE(0),0x46546c67);assert.equal(bin.readUInt32LE(4),2);assert.equal(bin.readUInt32LE(8),bin.length);
 const jsonLen=bin.readUInt32LE(12);const data=JSON.parse(bin.subarray(20,20+jsonLen).toString('utf8'));
 assert.equal(data.asset.version,'2.0');assert.ok(data.meshes.length>=25);assert.ok(data.nodes.some(n=>n.extras?.group==='eyes'));
});

test('GLB loader reconstructs the full 3D scene from the shipped file',async()=>{
 const b=fs.readFileSync(path.join(root,CONFIG.MASCOT_GLB_PATH)),previous=globalThis.fetch;
 try{globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)});
  const parts=await loadGLB('local-test.glb');assert.equal(parts.length,32);assert.ok(parts.some(p=>p.group==='eyes'));
  assert.ok(parts.some(p=>p.name==='right-glove'&&p.group==='right'));
 }finally{globalThis.fetch=previous;}
});
test('story and chat cards do not overlap in visible transition',()=>{
 const ease=(p,a,b)=>range(p,a,b);const alpha=(p,e0,e1,x0,x1)=>ease(p,e0,e1)*(1-ease(p,x0,x1));
 for(let i=0;i<=1000;i++){const p=i/1000;
  const story=alpha(p,.645,.684,.762,.798),chat=alpha(p,.803,.838,.953,.986);
  assert.ok(!(story>.12&&chat>.12),`Overlap at ${p}`);}
});
