import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {parse} from 'acorn';
import {encode,decode} from './native-tree.mjs';

const root=path.resolve(process.argv[2]),out=path.resolve(import.meta.dirname,'packet');
const c4='2ed88683ba46fc4d99790414ad99a2e409acf400',jms='04d37498607ace16dae33c79462ddfe1503c8a0d';
const hash=s=>createHash('sha256').update(s).digest('hex');
const git=(cwd,...args)=>execFileSync('git',['-C',cwd,...args],{encoding:'utf8',maxBuffer:32*1024*1024});
assert.equal(git(path.join(root,'vendor/jsminsys'),'rev-parse','HEAD').trim(),jms);
const todo=['components/isometric/solve.mjs','vendor/jsminsys/addons/rba-connect4-lazy-smp-worker.mjs'];
const seen=new Set(),modules=[],imports=[],external=new Set(),sourceInventory=[],counts={};
function clean(x){
  if(typeof x==='bigint')return {integerDecimal:x.toString()};
  if(x instanceof RegExp)return {regexpPattern:x.source,regexpFlags:x.flags};
  if(Array.isArray(x))return x.map(clean);
  if(x&&typeof x==='object'){
    const o={};for(const [k,v] of Object.entries(x))if(!['start','end','loc','range'].includes(k))o[k]=clean(v);
    return o;
  }
  return x;
}
function visit(x,fn){if(!x||typeof x!=='object')return;if(x.type)fn(x);for(const v of Object.values(x))if(v&&typeof v==='object')if(Array.isArray(v))v.forEach(y=>visit(y,fn));else visit(v,fn);}
while(todo.length){
  const name=todo.shift();if(seen.has(name))continue;seen.add(name);
  const library=name.startsWith('vendor/jsminsys/');
  const text=git(library?path.join(root,'vendor/jsminsys'):root,'show',`${library?jms:c4}:${library?name.slice(16):name}`);
  const ast=parse(text,{ecmaVersion:2025,sourceType:'module',preserveParens:true});
  sourceInventory.push({path:name,revision:library?jms:c4,sha256:hash(text),lines:text.split('\n').length});
  const add=(specifier,kind)=>{
    if(specifier.startsWith('.')){
      const target=path.posix.normalize(path.posix.join(path.posix.dirname(name),specifier));
      if(target.startsWith('../'))throw new Error('closure escaped repository');
      imports.push({from:name,to:target,kind});todo.push(target);
    }else{external.add(specifier);imports.push({from:name,to:specifier,kind:'external'});}
  };
  visit(ast,n=>{
    counts[n.type]=(counts[n.type]||0)+1;
    if(['ImportDeclaration','ExportNamedDeclaration','ExportAllDeclaration'].includes(n.type)&&n.source)add(n.source.value,n.type);
    if(n.type==='ImportExpression')throw new Error(`dynamic import requires explicit closure: ${name}`);
    if(n.type==='NewExpression'&&n.callee.name==='URL'&&n.arguments[0]?.value?.endsWith('.mjs'))add(n.arguments[0].value,'workerURL');
  });
  modules.push({path:name,program:clean(ast)});
}
modules.sort((a,b)=>a.path.localeCompare(b.path));
const program={
  format:'IsoMax executable-source structural rendering candidate 0.3',
  core:{repository:'iteathen/IsoGraph',revision:'43490735f0073acccb4f900e247cd0db19681e1f',versions:['0.17','0.18','0.19']},
  interpretation:{language:'ECMAScript 2025 modules',ecma262Revision:'2e1eeda78a104b5e50eec93214fb800309ee379f',
    runtime:'Node.js 26.7.0',parser:'acorn 8.15.0 with preserveParens',
    normalization:['source locations omitted','comments omitted; no source text reflection claim'],
    externalBoundary:[...external].sort(),
    scope:'complete static module closure of solve7x6 and worker entry; includes inactive exports, not a dynamic reachability claim',
    unresolved:['OS scheduling and event interleaving','JIT lowering and instruction cycles','runtime external API semantics admission']},
  entries:['components/isometric/solve.mjs','vendor/jsminsys/addons/rba-connect4-lazy-smp-worker.mjs'],
  imports,modules,
};
fs.mkdirSync(out,{recursive:true});
const native=encode(program)+'\n';
assert.deepEqual(decode(native),program);
fs.writeFileSync(path.join(out,'NATIVE.isg'),native);
fs.writeFileSync(path.join(out,'MANIFEST.json'),JSON.stringify({status:'CANDIDATE_NOT_QUALIFIED',nativeSha256:hash(native),
  semanticOracleSha256:hash(JSON.stringify(program)),sourceInventory,external:[...external].sort(),counts,
  totalSyntaxNodes:Object.values(counts).reduce((a,b)=>a+b,0)},null,2)+'\n');
fs.mkdirSync('author-only',{recursive:true});
fs.writeFileSync('author-only/source-oracle.json',JSON.stringify(program));
console.log(JSON.stringify({modules:modules.length,nodes:Object.values(counts).reduce((a,b)=>a+b,0),bytes:native.length,external:[...external],hash:hash(native)},null,2));
