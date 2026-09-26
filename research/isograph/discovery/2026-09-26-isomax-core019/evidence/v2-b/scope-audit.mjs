import fs from 'node:fs';
const dir='C:/r/isomax-isograph-019/research/isograph/discovery/2026-09-26-isomax-core019/evidence/v2-b';const o=JSON.parse(fs.readFileSync(dir+'/reconstruction.json'));
const scopes=[],uses=[],declarations=[];
function scope(parent,kind,p){const s={parent,kind,path:p,bindings:new Map(),id:scopes.length};scopes.push(s);return s}
function bind(n,s,p){if(!n)return;if(n.type==='Identifier'){s.bindings.set(n.name,p);declarations.push({name:n.name,path:p,scope:s.id});return}if(n.type==='AssignmentPattern'){bind(n.left,s,p+'/left');visit(n.right,s,p+'/right');return}if(n.type==='ObjectPattern'){for(let i=0;i<n.properties.length;i++){let pr=n.properties[i];if(pr.computed)visit(pr.key,s,p+'/properties/'+i+'/key');bind(pr.value,s,p+'/properties/'+i+'/value')}return}throw Error('unhandled pattern '+n.type)}
function visit(n,s,p){if(!n||typeof n!=='object')return;if(Array.isArray(n)){n.forEach((v,i)=>visit(v,s,p+'/'+i));return}switch(n.type){
case 'Program':visit(n.body,s,p+'/body');return;
case 'BlockStatement':visit(n.body,scope(s,'block',p),p+'/body');return;
case 'FunctionDeclaration':if(n.id)bind(n.id,s,p+'/id');
case 'FunctionExpression':case 'ArrowFunctionExpression':{const f=scope(s,'function',p);if(n.type==='FunctionExpression'&&n.id)bind(n.id,f,p+'/id');if(n.type!=='ArrowFunctionExpression')f.bindings.set('arguments',p);n.params.forEach((x,i)=>bind(x,f,p+'/params/'+i));visit(n.body,f,p+'/body');return}
case 'VariableDeclaration':for(let i=0;i<n.declarations.length;i++){let d=n.declarations[i];bind(d.id,s,p+'/declarations/'+i+'/id');visit(d.init,s,p+'/declarations/'+i+'/init')}return;
case 'ImportDeclaration':for(let i=0;i<n.specifiers.length;i++)bind(n.specifiers[i].local,s,p+'/specifiers/'+i+'/local');return;
case 'ExportAllDeclaration':return;
case 'ExportNamedDeclaration':visit(n.declaration,s,p+'/declaration');if(!n.source)for(let i=0;i<n.specifiers.length;i++)visit(n.specifiers[i].local,s,p+'/specifiers/'+i+'/local');return;
case 'ClassDeclaration':bind(n.id,s,p+'/id');visit(n.superClass,s,p+'/superClass');visit(n.body,scope(s,'class',p),p+'/body');return;
case 'Property':case 'MethodDefinition':if(n.computed)visit(n.key,s,p+'/key');visit(n.value,s,p+'/value');return;
case 'MemberExpression':visit(n.object,s,p+'/object');if(n.computed)visit(n.property,s,p+'/property');return;
case 'MetaProperty':case 'Literal':case 'TemplateElement':case 'ThisExpression':case 'Super':case 'ContinueStatement':case 'BreakStatement':return;
case 'ForStatement':case 'ForInStatement':case 'ForOfStatement':{const loop=scope(s,'loop',p);for(const [k,v]of Object.entries(n))if(k!=='type')visit(v,loop,p+'/'+k);return}
case 'Identifier':uses.push({name:n.name,path:p,scope:s});return;
default:for(const [k,v]of Object.entries(n))if(k!=='type')visit(v,s,p+'/'+k);
}}
for(const m of o.modules)visit(m.program,scope(null,'module',m.path),m.path);
let resolved=0,free=[];for(const u of uses){let s=u.scope;while(s&&!s.bindings.has(u.name))s=s.parent;if(s)resolved++;else free.push({name:u.name,path:u.path})}
const globals={};for(const f of free)(globals[f.name]??=[]).push(f.path);
const result={note:'Independent structural ownership check, not an execution or complete ECMAScript early-error verifier. No var declarations occur. Evaluation order and TDZ remain governed by the native AST plus pinned ECMAScript.',scopes:scopes.length,declaredOccurrences:declarations.length,useOccurrences:uses.length,resolvedUses:resolved,globalOccurrences:free.length,globals};fs.writeFileSync(dir+'/scope-audit.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,globals:Object.fromEntries(Object.entries(globals).map(([k,v])=>[k,v.length]))},null,2));
