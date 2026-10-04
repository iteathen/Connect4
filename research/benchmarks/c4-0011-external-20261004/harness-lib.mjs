import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,lstatSync} from 'node:fs';
import {join} from 'node:path';
export const hashFile=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
export function filesUnder(root,prefix=''){
 const found=[];
 for(const n of readdirSync(join(root,prefix))){const rel=prefix?`${prefix}/${n}`:n,s=lstatSync(join(root,rel));
  if(s.isSymbolicLink())throw Error(`symlink prohibited: ${rel}`);
  if(s.isDirectory())found.push(...filesUnder(root,rel));else if(s.isFile())found.push(rel);else throw Error(`non-file: ${rel}`);
 }return found.sort();
}
export const closure=root=>Object.fromEntries(filesUnder(root).map(p=>[p,hashFile(join(root,p))]));
export function verifyClosure(root,files){
 const actual=filesUnder(root);for(const p of actual)if(!(p in files))throw Error(`unexpected runtime file: ${p}`);
 for(const [p,h]of Object.entries(files)){if(!actual.includes(p))throw Error(`missing runtime file: ${p}`);if(hashFile(join(root,p))!==h)throw Error(`hash mismatch: ${p}`);}
}
export function parseOutput(stdout,stderr){
 const records=[];for(const line of `${stderr}\n${stdout}`.split(/\r?\n/)){try{const v=JSON.parse(line);if(v&&typeof v==='object'&&v.event)records.push(v);}catch{}}
 const results=records.filter(x=>x.event==='result');if(results.length>1)throw Error('multiple result records');
 return {ready:records.find(x=>x.event==='ready')??null,handoff:records.find(x=>x.event==='handoff')??null,result:results[0]??null,records};
}
export function validateReady(id,r){
 if(!r)return false;
 if(id==='christophe')return r.schema==='c4-0011-christophe-v1'&&r.root==='empty'&&r.root_moves===0&&r.width===7&&r.height===6&&r.search_threads===4&&r.initial_nonempty_entries===0&&r.book_load===false&&r.table_load===false&&r.table_update===false&&r.strong_solves===false;
 return r.solver===id&&r.start==='empty'&&r.ply===0&&r.workers===(id==='isomax'?4:1)&&r.tt_initial_occupied===0&&r.opening_book_loaded===false&&r.persisted_cache_loaded===false&&(id!=='pons'||(r.opening_book_pointer_null===true&&r.opening_book_depth===-1));
}
export function validateResult(id,r){
 if(!r)return false;
 if(id==='christophe')return r.schema==='c4-0011-christophe-v1'&&r.root==='empty'&&[-1,0,1].includes(r.score)&&r.wdl===({[-1]:'loss',0:'draw',1:'win'})[r.score];
 if(r.solver!==id||r.status!=='EXACT'||![-1,0,1].includes(r.wdl))return false;
 if(id==='isomax')return r.result?.status==='EXACT'&&r.result.workersUsed===4&&r.result.requestedWorkers===4&&r.result.errorCode===0&&r.result.errors?.length===0&&r.result.rootWdl===r.wdl&&Array.isArray(r.computed_moves);
 return true;
}
