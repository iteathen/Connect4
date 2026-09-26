import fs from 'node:fs';
import path from 'node:path';
import {parse} from 'acorn';
import {generate,GENERATOR} from 'astring';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

// Consumes a frozen decoder output, never the author's source. Syntax round
// trip is one bridge obligation, not an operational qualification by itself.
const input=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const output=path.resolve(process.argv[3]);fs.mkdirSync(output,{recursive:true});
const generator={...GENERATOR,ParenthesizedExpression(n,s){s.write('(');this[n.expression.type](n.expression,s);s.write(')');}};
function normalize(x){
  if(x&&typeof x==='object'){
    if(x.type==='ParenthesizedExpression')return normalize(x.expression);
    if(Array.isArray(x))return x.map(normalize);
    const out={};for(const [k,v] of Object.entries(x))if(!['start','end','loc','range'].includes(k))out[k]=normalize(v);
    return out;
  }
  return x;
}
const results=[];
for(const m of input.modules){
  const text=generate(m.program,{generator});
  const next=parse(text,{ecmaVersion:2025,sourceType:'module',preserveParens:true});
  assert.deepEqual(normalize(next),normalize(m.program),m.path);
  const file=path.join(output,m.path);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);
  execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
  results.push({path:m.path,sha256:createHash('sha256').update(text).digest('hex'),parseEquivalent:true,nodeSyntaxCheck:true});
}
fs.writeFileSync(path.join(output,'reconstruction-check.json'),JSON.stringify({status:'SYNTAX_ROUNDTRIP_PASS',modules:results},null,2)+'\n');
console.log(JSON.stringify({status:'SYNTAX_ROUNDTRIP_PASS',modules:results.length}));
