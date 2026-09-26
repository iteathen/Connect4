import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const out=path.dirname(fileURLToPath(import.meta.url));
const o=JSON.parse(fs.readFileSync(path.join(out,'reconstruction.json'),'utf8'));
console.log(JSON.stringify({format:o.format,core:o.core,interpretation:o.interpretation,entries:o.entries,moduleType:typeof o.modules,moduleCount:o.modules.length,moduleFirstKeys:Object.keys(o.modules[0]),importCount:o.imports.length},null,2));
const types={},operators={},calls={},news={},ids={},sourceImports=[],special=[];
const countsByModule=[];
function desc(n) { if(!n)return ''; if(n.type==='Identifier')return n.name; if(n.type==='Literal')return JSON.stringify(n.value); if(n.type==='MemberExpression')return desc(n.object)+(n.computed?'['+desc(n.property)+']':'.'+desc(n.property)); if(n.type==='MetaProperty')return desc(n.meta)+'.'+desc(n.property); return n.type; }
for(const m of o.modules) {
 let ncount=0;
 function walk(n,p='$') {
  if(n===null || typeof n!=='object') return;
  if(n.type){ ncount++; types[n.type]=(types[n.type]||0)+1; }
  if(n.operator)operators[n.operator]=(operators[n.operator]||0)+1;
  if(n.type==='Identifier') ids[n.name]=(ids[n.name]||0)+1;
  if(n.type==='CallExpression') calls[desc(n.callee)]=(calls[desc(n.callee)]||0)+1;
  if(n.type==='NewExpression') news[desc(n.callee)]=(news[desc(n.callee)]||0)+1;
  if(n.source && /^(Import|Export)/.test(n.type))sourceImports.push({module:m.path,at:p,type:n.type,source:n.source.value});
  if(n.type==='ImportExpression'||n.type==='MetaProperty'||n.type==='AwaitExpression'||n.type==='WithStatement'||(n.type==='Literal'&&(n.regex||n.bigint)))special.push({module:m.path,at:p,node:n});
  for(const [k,v] of Object.entries(n)) if(typeof v==='object')walk(v,p+'.'+k);
 }
 walk(m); countsByModule.push({path:m.path,keys:Object.keys(m),astNodes:ncount});
}
const report={moduleCount:o.modules.length,importCount:o.imports.length,countsByModule,types,operators,calls,news,ids,sourceImports,special};
fs.writeFileSync(path.join(out,'inspection.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({countsByModule,types,operators,calls,news,special},null,2));
