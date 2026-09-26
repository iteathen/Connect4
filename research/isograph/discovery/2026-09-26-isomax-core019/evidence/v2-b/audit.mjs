import fs from 'node:fs';import crypto from 'node:crypto';import path from 'node:path';
const dir='C:/r/isomax-isograph-019/research/isograph/discovery/2026-09-26-isomax-core019/evidence/v2-b';
const o=JSON.parse(fs.readFileSync(dir+'/reconstruction.json','utf8'));
const types={}, refs=[], flags=new Set(['operator','prefix','computed','optional','async','generator','expression','kind','method','shorthand','static','sourceType','await','tail']);
function walk(v,p){if(!v||typeof v!=='object')return;if(v.type){let t=types[v.type]??={count:0,fields:{}};t.count++;for(const [k,x] of Object.entries(v)){let a=t.fields[k]??=[];let desc=(flags.has(k) && typeof x !== 'object')||x===null?JSON.stringify(x):Array.isArray(x)?'array':typeof x;if(!a.includes(desc))a.push(desc);}if(['ImportDeclaration','ExportAllDeclaration','ExportNamedDeclaration'].includes(v.type)&&v.source)refs.push({path:p,source:v.source.value});}for(const [k,x] of Object.entries(v))walk(x,p+'/'+k)}
walk(o.modules,'modules');walk(o.controls,'controls');
const ecma=fs.readFileSync('C:/r/isograph-authority-ref/runtime-source/ecma262-es2025.html');const html=ecma.toString('utf8');
const bindings=new Map(o.semanticBridge.nodeBindings.map(x=>[x.type,x]));
const sections=[...o.semanticBridge.nodeBindings.map(x=>x.section),...o.semanticBridge.environment,...o.semanticBridge.numbers,...o.semanticBridge.memory];
const anchors=sections.map(id=>({id,present:html.includes('id="'+id+'"')||html.includes("id='"+id+"'")}));
const audit={ecmaHash:crypto.createHash('sha256').update(ecma).digest('hex'),types,missingTypeBindings:Object.keys(types).filter(x=>!bindings.has(x)),unusedTypeBindings:[...bindings.keys()].filter(x=>!types[x]),anchors,refs,modules:o.modules.map(x=>({keys:Object.keys(x),path:x.path}))};
fs.writeFileSync(dir+'/structural-audit.json',JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify({ecmaHash:audit.ecmaHash,types,missingTypeBindings:audit.missingTypeBindings,unusedTypeBindings:audit.unusedTypeBindings,missingAnchors:anchors.filter(x=>!x.present),moduleShapes:audit.modules.slice(0,2),firstModule:Object.fromEntries(Object.entries(o.modules[0]).filter(([k])=>k!=='program'&&k!=='ast'))},null,2));
