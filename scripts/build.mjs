import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
fs.rmSync(dist,{force:true,recursive:true});fs.mkdirSync(dist,{recursive:true});
for(const name of ['index.html','styles.css'])fs.copyFileSync(path.join(root,name),path.join(dist,name));
for(const name of ['js','assets'])fs.cpSync(path.join(root,name),path.join(dist,name),{recursive:true});
for(const name of fs.readdirSync(path.join(root,'js')).filter(n=>n.endsWith('.js'))){execFileSync(process.execPath,['--check',path.join(dist,'js',name)]);}
console.log('Build complete: dist/  |  Без внешних пакетов, CDN и критических сетевых зависимостей.');
