import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root = 'C:/r/isomax-isograph-019/research/isograph/discovery/2026-09-26-isomax-core019';
const out = root + '/evidence/decoder-b';
const sha = b => createHash('sha256').update(b).digest('hex');
// Independently implemented from PROFILE.md; never imports or executes decoded programs.
function decode(s) {
  let p = 0;
  const counts = {records:0, fields:0, sequences:0, sequenceItems:0, strings:0, codeUnits:0, numbers:0, booleans:0, nulls:0, negativeZero:0, nonfinite:0, maxDepth:0};
  const fieldOrders = new WeakMap();
  const ws = () => { while (p < s.length && /\s/.test(s[p])) p++; };
  const fail = why => { throw Error(why + ' at offset ' + p); };
  function expect(c) { ws(); if (s[p] !== c) fail('expected ' + c); p++; }
  function token(prefix) {
    ws(); if (s[p++] !== prefix) fail('expected token ' + prefix);
    const start = p; if (s[p] === '-' || s[p] === '+') p++;
    const digits = p; while (/[0-9]/.test(s[p] ?? '')) p++;
    if (p === digits || (p < s.length && !/[\s()]/.test(s[p]))) fail('bad integer token');
    return BigInt(s.slice(start,p));
  }
  function integer(max) { const n = token('#'); if (n < 0n || n > BigInt(max)) fail('integer out of range'); return Number(n); }
  function value(depth=0) {
    counts.maxDepth = Math.max(counts.maxDepth,depth);
    expect('('); const label = token('^'); let v;
    if (label === 980010n) {
      counts.records++; v = Object.create(null); const keys=[]; const seen=new Set();
      ws(); while (s[p] !== ')') {
        expect('('); const key=value(depth+1); if (typeof key !== 'string') fail('nonstring record key');
        if (seen.has(key)) fail('duplicate record key'); seen.add(key); keys.push(key);
        v[key]=value(depth+1); expect(')'); counts.fields++; ws();
      }
      fieldOrders.set(v,keys);
    } else if (label === 980011n) {
      counts.sequences++; v=[]; ws(); while(s[p] !== ')') { v.push(value(depth+1)); counts.sequenceItems++; ws(); }
    } else if (label === 980012n) {
      counts.strings++; const units=[]; ws(); while(s[p] !== ')') { units.push(integer(65535)); counts.codeUnits++; ws(); }
      v=''; for(let k=0;k<units.length;k+=4096) v+=String.fromCharCode(...units.slice(k,k+4096));
    } else if (label === 980013n) {
      counts.numbers++; const hi=integer(4294967295), lo=integer(4294967295);
      const b=Buffer.alloc(8); b.writeUInt32BE(hi,0); b.writeUInt32BE(lo,4); v=b.readDoubleBE(0);
      if(Object.is(v,-0)) counts.negativeZero++;
      if(!Number.isFinite(v)) counts.nonfinite++;
    } else if (label === 980014n) { counts.booleans++; v=integer(1)===1; }
    else if (label === 980015n) { counts.nulls++; v=null; }
    else fail('undeclared label ' + label);
    expect(')'); return v;
  }
  const object=value(); ws(); if(p!==s.length) fail('trailing terms');
  function json(v) {
    if(v===null) return 'null';
    if(typeof v==='number') { if(!Number.isFinite(v)) throw Error('Cannot emit nonfinite binary64 as unambiguous JSON'); return Object.is(v,-0)?'-0':JSON.stringify(v); }
    if(typeof v!=='object') return JSON.stringify(v);
    if(Array.isArray(v)) return '['+v.map(json).join(',')+']';
    return '{'+fieldOrders.get(v).map(k=>JSON.stringify(k)+':'+json(v[k])).join(',')+'}';
  }
  // A separately implemented profile encoder proves transport roundtrip, not source agreement.
  function encode(v) {
    if(v===null) return '(^980015)';
    if(typeof v==='string') return '(^980012'+Array.from({length:v.length},(_,i)=>' #'+v.charCodeAt(i)).join('')+')';
    if(typeof v==='boolean') return '(^980014 #'+Number(v)+')';
    if(typeof v==='number') { const b=Buffer.alloc(8); b.writeDoubleBE(v); return '(^980013 #'+b.readUInt32BE(0)+' #'+b.readUInt32BE(4)+')'; }
    if(Array.isArray(v)) return '(^980011'+v.map(x=>' '+encode(x)).join('')+')';
    return '(^980010'+fieldOrders.get(v).map(k=>' ('+encode(k)+' '+encode(v[k])+')').join('')+')';
  }
  return {object,counts,json:()=>json(object),encode:()=>encode(object)};
}
const rejects = ['(^980016)','(^980015 #0)','(^980014 #2)','(^980012 #65536)','(^980013 #4294967296 #0)','(^980013 #0)','(^980015) (^980015)','(^980010 ((^980012 #97) (^980015)) ((^980012 #97) (^980015)))','(^980010 ((^980015) (^980015)))','(^980012 #1.0)'];
for(const s of rejects) assert.throws(()=>decode(s));
assert.equal(decode('(^980012 #55296 #0 #56320)').object,'\ud800\0\udc00');
assert(Object.is(decode('(^980013 #2147483648 #0)').object,-0));
assert.equal(decode('(^980013 #2147483648 #0)').json(),'-0');
const native=readFileSync(root+'/packet/NATIVE.isg');
assert.equal(sha(native),'430b4d31343f0f3981d43e62f0a4a12304283147acf7fd98f1826f166ff37b3c');
const d=decode(native.toString('utf8'));
assert.equal(d.encode(),native.toString('utf8').trim());
const json=d.json()+'\n'; writeFileSync(out+'/reconstruction.json',json,'utf8');
assert.deepEqual(JSON.parse(json),JSON.parse(JSON.stringify(d.object)));
const types={},operators={},identifiers={};
function walk(v) {
 if(!v || typeof v!=='object')return;
 if(Array.isArray(v)){v.forEach(walk);return;}
 if(typeof v.type==='string') types[v.type]=(types[v.type]??0)+1;
 if(typeof v.operator==='string') operators[v.operator]=(operators[v.operator]??0)+1;
 if(v.type==='Identifier') identifiers[v.name]=(identifiers[v.name]??0)+1;
 Object.values(v).forEach(walk);
}
walk(d.object);
const summary={nativeBytes:native.length,nativeSHA256:sha(native),jsonBytes:Buffer.byteLength(json),jsonSHA256:sha(json),counts:d.counts,topKeys:Object.keys(d.object),types,operators,recordRootPreview:Object.fromEntries(Object.entries(d.object).map(([k,v])=>[k,Array.isArray(v)?{length:v.length,first:v[0] && Object.keys(v[0])}:v && typeof v==='object'?Object.keys(v):v])),roundTrip:'exact original bytes excluding final surrounding whitespace',rejectionControls:rejects.length};
console.log(JSON.stringify(summary,null,2));
for(const [k,v] of Object.entries(d.object)) if(k!=='modules') console.log(k,JSON.stringify(v).slice(0,14000));
if(Array.isArray(d.object.modules)) for(const m of d.object.modules) console.log('MODULE',JSON.stringify(Object.fromEntries(Object.entries(m).filter(([k])=>k!=='program' && k!=='ast'))));
// Native-only inventories: distinguish syntactic coverage from semantic closure.
const modulePaths=new Set(d.object.modules.map(m=>m.path));
assert.equal(modulePaths.size,d.object.modules.length);
assert(d.object.entries.every(e=>modulePaths.has(e)));
const missingLocalImports=d.object.imports.filter(i=>i.kind!=='external' && !modulePaths.has(i.to));
assert.equal(missingLocalImports.length,0);
const importKinds={}; for(const i of d.object.imports) importKinds[i.kind]=(importKinds[i.kind]??0)+1;
const calls={}; const special=[]; let astCount=0;
const show = n => !n?'?':n.type==='Identifier'?n.name:n.type==='ThisExpression'?'this':n.type==='MemberExpression'?show(n.object)+(n.computed?'['+show(n.property)+']':'.'+show(n.property)):n.type==='Literal'?JSON.stringify(n.value):n.type;
function inspect(n,path) {
 if(!n || typeof n!=='object')return;
 if(Array.isArray(n)){n.forEach((x,i)=>inspect(x,path+'/'+i));return;}
 if(typeof n.type==='string')astCount++;
 if(n.type==='CallExpression'||n.type==='NewExpression') { const name=show(n.callee); calls[name]=(calls[name]??0)+1; }
 if(['MetaProperty','AwaitExpression','TryStatement','ClassDeclaration'].includes(n.type))special.push({path,type:n.type,keys:Object.keys(n)});
 for(const [k,v]of Object.entries(n))inspect(v,path+'/'+k);
}
for(const m of d.object.modules)inspect(m.program,m.path);
console.log('AUDIT',JSON.stringify({astCount,astKinds:Object.keys(types).length,importKinds,missingLocalImports,special,calls:Object.fromEntries(Object.entries(calls).filter(([k])=>/Atomics|SharedArray|ArrayBuffer|Worker|performance|parentPort|workerData|Promise|process|URL|Math|JSON|Int32Array|Uint32Array|\.on|\.postMessage|\.terminate|setTimeout|wait|notify|Error/.test(k)))},null,2));
