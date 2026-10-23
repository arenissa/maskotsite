import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dirArg=process.argv.find(a=>a.startsWith('--dir='));
const root=path.resolve(base,dirArg?dirArg.slice('--dir='.length):'.');
const port=Number(process.env.PORT||process.argv.find(a=>a.startsWith('--port='))?.slice(7)||3000);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.avif':'image/avif','.ico':'image/x-icon','.json':'application/json; charset=utf-8'};
http.createServer((req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');let pathname=decodeURIComponent(url.pathname);
  if(pathname==='/'||pathname.endsWith('/'))pathname+='/index.html';
  const target=path.resolve(root,'.'+pathname);
  if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  fs.readFile(target,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(target).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data);});
 }catch(e){res.writeHead(400);res.end('Bad request');}
}).listen(port,'0.0.0.0',()=>console.log(`RED SQUARE landing: http://localhost:${port} (dir: ${root})`));
