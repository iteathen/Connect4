import fs from 'node:fs';
import crypto from 'node:crypto';
const dir='C:/r/isomax-isograph-019/research/isograph/discovery/2026-09-26-isomax-core019/evidence/v2-a';
const obj=JSON.parse(fs.readFileSync(dir+'/reconstruction.json','utf8'));
const spec=fs.readFileSync('C:/r/isograph-authority-ref/runtime-source/ecma262-es2025.html','utf8');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const inventory={};const examples={};const special=[];
function walk(x,path){if(!x||typeof x!=='object')return;if(x.type){const t=inventory[x.type]??={count:0,fields:{}};t.count++;examples[x.type]??={path,node:x};for(const [k,v]of Object.entries(x)){const f=t.fields[k]??={count:0,values:[]};f.count++;if(v===null||typeof v!=='object'){if(!f.values.includes(v))f.values.push(v);}}if(['ImportExpression','CatchClause','Literal','Identifier'].includes(x.type)&&x.type!=='Identifier')special.push({path,...x});}for(const [k,v]of Object.entries(x))walk(v,path+'/'+k);}
walk(obj.modules,'/modules');walk(obj.controls,'/controls');
const refs=[...new Set([...obj.semanticBridge.nodeBindings.map(b=>b.section),...obj.semanticBridge.environment,...obj.semanticBridge.numbers,...obj.semanticBridge.memory])];
const refAudit=refs.map(id=>({id,present:new RegExp('id=["\u0027]'+id+'["\u0027]').test(spec)}));
const report={specSha256:sha(spec),moduleKeys:obj.modules.map(m=>Object.keys(m)),moduleNames:obj.modules.map(m=>m.path),controlKeys:obj.controls.map(c=>Object.keys(c)),nodeTypes:Object.keys(inventory).length,totalNodes:Object.values(inventory).reduce((s,n)=>s+n.count,0),unmappedTypes:Object.keys(inventory).filter(t=>!obj.semanticBridge.nodeBindings.some(b=>b.type===t)),unusedMappings:obj.semanticBridge.nodeBindings.filter(b=>!inventory[b.type]).map(b=>b.type),references:refAudit,inventory};
fs.writeFileSync(dir+'/structural-audit.json',JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(dir+'/node-examples.json',JSON.stringify(examples,null,2)+'\n');
console.log(JSON.stringify({...report,inventory:undefined,moduleKeys:obj.modules[0]&&Object.keys(obj.modules[0]),controlKeys:obj.controls[0]&&Object.keys(obj.controls[0])},null,2));
for(const[t,n]of Object.entries(inventory))console.log(t,n.count,JSON.stringify(Object.fromEntries(Object.entries(n.fields).map(([k,v])=>[k,['operator','kind','async','generator','computed','method','shorthand','optional','await','sourceType','expression','static','prefix'].includes(k)?v.values:v.count]))));
console.log('controls',JSON.stringify(obj.controls,null,2));
