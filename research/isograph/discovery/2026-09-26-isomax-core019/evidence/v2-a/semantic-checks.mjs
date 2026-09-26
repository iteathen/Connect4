import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const d='C:/r/isomax-isograph-019/research/isograph/discovery/2026-09-26-isomax-core019/evidence/v2-a';
const o=JSON.parse(fs.readFileSync(d+'/reconstruction.json','utf8'));
const globals=new Map(),refs=[],imports=[],features=[];const scopes=[];
function scope(parent,kind,p){const s={parent,kind,path:p,names:new Map()};scopes.push(s);return s;}
function bind(n,s,p){if(!n)return;if(n.type==='Identifier')s.names.set(n.name,p);else if(n.type==='AssignmentPattern')bind(n.left,s,p+'/left');else if(n.type==='ObjectPattern')n.properties.forEach((x,i)=>bind(x.value,s,p+'/properties/'+i+'/value'));else throw Error('unexpected binding '+n.type);}
function pre(list,s,p){list.forEach((n,i)=>{let q=p+'/'+i;if(n.type==='ExportNamedDeclaration'){n=n.declaration;q+='/declaration';}if(!n)return;if(n.type==='VariableDeclaration')n.declarations.forEach((v,j)=>bind(v.id,s,q+'/declarations/'+j+'/id'));if(['FunctionDeclaration','ClassDeclaration'].includes(n.type))bind(n.id,s,q+'/id');if(n.type==='ImportDeclaration')n.specifiers.forEach((v,j)=>bind(v.local,s,q+'/specifiers/'+j+'/local'));});}
function patternExpr(n,s,p){if(!n)return;if(n.type==='AssignmentPattern'){visit(n.right,s,p+'/right');patternExpr(n.left,s,p+'/left');}if(n.type==='ObjectPattern')n.properties.forEach((x,i)=>{if(x.computed)visit(x.key,s,p+'/properties/'+i+'/key');patternExpr(x.value,s,p+'/properties/'+i+'/value');});}
function visit(n,s,p){if(!n||typeof n!=='object')return;if(Array.isArray(n)){n.forEach((v,i)=>visit(v,s,p+'/'+i));return;}if(!n.type)return;
 if(n.type==='Identifier'){refs.push({name:n.name,scope:s,path:p});return;}
 if(n.type==='Program'||n.type==='BlockStatement'){const b=scope(s,n.type,p);pre(n.body,b,p+'/body');visit(n.body,b,p+'/body');return;}
 if(['FunctionDeclaration','FunctionExpression','ArrowFunctionExpression'].includes(n.type)){const f=scope(s,n.type,p);if(n.id)bind(n.id,f,p+'/id');if(n.type!=='ArrowFunctionExpression')f.names.set('arguments',p);n.params.forEach((v,i)=>bind(v,f,p+'/params/'+i));n.params.forEach((v,i)=>patternExpr(v,f,p+'/params/'+i));visit(n.body,f,p+'/body');return;}
 if(n.type==='VariableDeclaration'){n.declarations.forEach((v,i)=>{patternExpr(v.id,s,p+'/declarations/'+i+'/id');visit(v.init,s,p+'/declarations/'+i+'/init');});return;}
 if(['ForStatement','ForInStatement','ForOfStatement'].includes(n.type)){const f=scope(s,n.type,p),decl=n.init??n.left;if(decl?.type==='VariableDeclaration')decl.declarations.forEach((v,i)=>bind(v.id,f,p+'/loopBinding/'+i));for(const k of ['init','left','right','test','update','body'])visit(n[k],f,p+'/'+k);return;}
 if(n.type==='ClassDeclaration'){visit(n.superClass,s,p+'/superClass');const c=scope(s,n.type,p);bind(n.id,c,p+'/id');visit(n.body,c,p+'/body');return;}
 if(n.type==='ImportDeclaration')return;
 if(n.type==='ExportSpecifier'){visit(n.local,s,p+'/local');return;}
 if(n.type==='ExportAllDeclaration')return;
 if(n.type==='MemberExpression'){visit(n.object,s,p+'/object');if(n.computed)visit(n.property,s,p+'/property');return;}
 if(['Property','MethodDefinition'].includes(n.type)){if(n.computed)visit(n.key,s,p+'/key');visit(n.value,s,p+'/value');return;}
 if(['MetaProperty','Literal','TemplateElement','BreakStatement','ContinueStatement'].includes(n.type))return;
 for(const[k,v]of Object.entries(n))if(k!=='type')visit(v,s,p+'/'+k);
}
o.modules.forEach((m,i)=>visit(m.program,null,'/modules/'+i+'/program'));o.controls.forEach((c,i)=>visit(c.program,null,'/controls/'+i+'/program'));
const bindings=[];for(const r of refs){let s=r.scope;while(s&&!s.names.has(r.name))s=s.parent;if(s)bindings.push({use:r.path,name:r.name,binder:s.names.get(r.name)});else{const uses=globals.get(r.name)??[];uses.push(r.path);globals.set(r.name,uses);}}
for(const m of o.modules)for(const n of m.program.body)if(['ImportDeclaration','ExportAllDeclaration','ExportNamedDeclaration'].includes(n.type)&&n.source){const target=n.source.value.startsWith('node:')?n.source.value:path.posix.normalize(path.posix.join(path.posix.dirname(m.path),n.source.value));imports.push({from:m.path,to:target,kind:target.startsWith('node:')?'external':n.type});}
const missingImports=imports.filter(x=>!o.imports.some(y=>JSON.stringify(x)===JSON.stringify(y)));
const absentTargets=o.imports.filter(x=>!x.to.startsWith('node:')&&!o.modules.some(m=>m.path===x.to));
assert.equal(missingImports.length,0);assert.equal(absentTargets.length,0);
const bits=JSON.parse(fs.readFileSync(d+'/numeric-bits.json','utf8'));for(const b of bits){let v=o;for(const k of b.path.split('/').slice(1))v=v[k];const buf=Buffer.alloc(8);buf.writeDoubleBE(v);assert.equal(buf.toString('hex'),b.hex);}
function encode(x){if(x===null)return '(^980015)';if(typeof x==='boolean')return '(^980014 #'+Number(x)+')';if(typeof x==='string')return '(^980012'+Array.from({length:x.length},(_,i)=>' #'+x.charCodeAt(i)).join('')+')';if(typeof x==='number'){const b=Buffer.alloc(8);b.writeDoubleBE(x);return '(^980013 #'+b.readUInt32BE(0)+' #'+b.readUInt32BE(4)+')';}if(Array.isArray(x))return '(^980011'+x.map(v=>' '+encode(v)).join('')+')';return '(^980010'+Object.entries(x).map(([k,v])=>' ('+encode(k)+' '+encode(v)+')').join('')+')';}
assert.equal(encode(o),fs.readFileSync(d+'/../../packet-v2/NATIVE.isg','utf8').trim());
const report={staticImportEdges:imports.length,extraManifestEdges:o.imports.filter(x=>!imports.some(y=>JSON.stringify(x)===JSON.stringify(y))),missingImports,absentTargets,scopes:scopes.length,resolvedUses:bindings.length,externalNames:Object.fromEntries([...globals].map(([k,v])=>[k,v.length])),numericRoundtrip:'2861 binary64 bit payloads unchanged',nativeRoundtrip:'exact after trimming trailing whitespace',limitation:'Binding navigation checks nearest represented lexical ownership; it is not a full ECMAScript early-error/linker or runtime evaluator. TDZ/default-parameter initialization and per-iteration environment semantics remain governed by the pinned ECMA authority.'};
fs.writeFileSync(d+'/semantic-checks.json',JSON.stringify(report,null,2)+'\n');fs.writeFileSync(d+'/binding-navigation.json',JSON.stringify({bindings,externalUses:Object.fromEntries(globals)},null,2)+'\n');console.log(JSON.stringify(report,null,2));
