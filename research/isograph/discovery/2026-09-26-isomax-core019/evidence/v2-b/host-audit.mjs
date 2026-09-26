import fs from 'node:fs';import crypto from 'node:crypto';import path from 'node:path';
const dir='C:/r/isomax-isograph-019/research/isograph/discovery/2026-09-26-isomax-core019/evidence/v2-b';const o=JSON.parse(fs.readFileSync(dir+'/reconstruction.json'));
const host=o.semanticBridge.modelAuthority.runtime;const downloaded=[];
for(const file of host.interfaces){const url='https://raw.githubusercontent.com/'+host.repository+'/'+host.revision+'/'+file;const res=await fetch(url);if(!res.ok)throw Error(url+': '+res.status);const body=await res.text();fs.writeFileSync(dir+'/'+path.basename(file),body);downloaded.push({url,sha256:crypto.createHash('sha256').update(body).digest('hex'),bytes:Buffer.byteLength(body)})}
let links=[],special=[],emptyAttributes=true,identifiers=new Set();const modulePaths=new Set(o.modules.map(x=>x.path));
function walk(v,owner,p){if(!v||typeof v!=='object')return;if(v.type==='Identifier')identifiers.add(v.name);if(v.attributes?.length)emptyAttributes=false;
if(['ImportDeclaration','ExportAllDeclaration','ExportNamedDeclaration'].includes(v.type)&&v.source){const spec=v.source.value;const resolved=spec.startsWith('node:')?spec:path.posix.normalize(path.posix.join(path.posix.dirname(owner),spec));links.push({owner,spec,resolved,external:spec.startsWith('node:'),present:modulePaths.has(resolved),names:v.specifiers?.map(s=>({local:s.local?.name,imported:s.imported?.name,exported:s.exported?.name}))})}
if(v.type==='MetaProperty'||v.type==='SpreadElement'||v.type==='NewExpression'&&['Worker','URL'].includes(v.callee?.name))special.push({owner,path:p,node:v});
for(const [k,x]of Object.entries(v))walk(x,owner,p+'/'+k)}
for(const m of o.modules)walk(m.program,m.path,m.path);
const result={downloaded,emptyAttributes,moduleCount:modulePaths.size,entryClosure:o.entries.map(path=>({path,present:modulePaths.has(path)})),missingInternalLinks:links.filter(x=>!x.external&&!x.present),links,special,identifiers:[...identifiers].sort()};
fs.writeFileSync(dir+'/host-audit.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,links:links.filter(x=>x.external),identifiers:undefined},null,2));
