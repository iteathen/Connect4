import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const out=path.dirname(fileURLToPath(import.meta.url));
const o=JSON.parse(fs.readFileSync(path.join(out,'reconstruction.json'),'utf8'));
const i=JSON.parse(fs.readFileSync(path.join(out,'inspection.json'),'utf8'));
const modules=new Set(o.modules.map(m=>m.path));
const derived=i.sourceImports.map(x=>({from:x.module,to:x.source.startsWith('.')?path.posix.normalize(path.posix.join(path.posix.dirname(x.module),x.source)):x.source,kind:x.source.startsWith('.')?x.type:'external'}));
for(const m of o.modules){function walk(v){if(!v||typeof v!=='object')return;if(v.type==='CallExpression'&&v.callee?.type==='MemberExpression'&&v.callee.property?.name==='spawn'){const u=v.arguments?.[0];if(u?.type==='NewExpression'&&u.callee?.name==='URL'&&typeof u.arguments?.[0]?.value==='string'&&u.arguments?.[1]?.type==='MemberExpression'&&u.arguments[1].object?.type==='MetaProperty'&&u.arguments[1].property?.name==='url')derived.push({from:m.path,to:path.posix.normalize(path.posix.join(path.posix.dirname(m.path),u.arguments[0].value)),kind:'workerURL'});}for(const x of Object.values(v))if(typeof x==='object')walk(x);}walk(m.program);}
const key=x=>JSON.stringify(x);
const declared=new Set(o.imports.map(key));
const actual=new Set(derived.map(key));
const mismatches={onlyDerived:derived.filter(x=>!declared.has(key(x))),onlyDeclared:o.imports.filter(x=>!actual.has(key(x)))};
const unresolvedInternal=derived.filter(x=>x.kind!=='external'&&!modules.has(x.to));
const seen=new Set(o.entries); let changed=true;while(changed){changed=false; for(const e of derived) if(seen.has(e.from)&&modules.has(e.to)&&!seen.has(e.to)){seen.add(e.to);changed=true;}}
const effects=[];
const targets=new Set(['Atomics','performance','process','setTimeout','setInterval','clearTimeout','clearInterval','Worker','SharedArrayBuffer','URL','workerData','parentPort']);
for(const m of o.modules){function walk(v,p){if(!v||typeof v!=='object')return;if(v.type==='Identifier'&&targets.has(v.name))effects.push({module:m.path,path:p,name:v.name});for(const[k,x]of Object.entries(v))if(typeof x==='object')walk(x,p+'.'+k);}walk(m.program,'program');}
const summary={moduleCount:modules.size,totalAstNodes:Object.values(i.types).reduce((a,b)=>a+b,0),nodeKinds:Object.keys(i.types).length,derivedEdges:derived.length,declaredEdges:o.imports.length,externalEdges:derived.filter(x=>x.kind==='external'),mismatches,unresolvedInternal,missingEntries:o.entries.filter(x=>!modules.has(x)),notStaticallyReached:[...modules].filter(x=>!seen.has(x)),effects};
fs.writeFileSync(path.join(out,'closure.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({...summary,effects:effects.slice(0,18)},null,2));
