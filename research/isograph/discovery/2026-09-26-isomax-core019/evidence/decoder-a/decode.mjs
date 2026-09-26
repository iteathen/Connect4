import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const out = path.dirname(fileURLToPath(import.meta.url));
const input = path.resolve(out, '../../packet/NATIVE.isg');
const sha = x => crypto.createHash('sha256').update(x).digest('hex');

// Independent recursive-descent implementation of the six PROFILE constructors.
function decode(s) {
  let p=0, depth=0;
  const counts={records:0,sequences:0,strings:0,codeUnits:0,numbers:0,booleans:0,nulls:0,fields:0,maxDepth:0,negativeZero:0,nonFinite:0};
  const orders=new WeakMap();
  function fail(msg) { throw new Error(`${msg} at offset ${p}`); }
  function ws() { while(p<s.length && /\s/.test(s[p])) p++; }
  function take(c) { ws(); if(s[p++]!==c) fail(`expected ${c}`); }
  function close() { ws(); return s[p]===')'; }
  function integer(prefix, max) {
    ws(); if(s[p++]!==prefix) fail(`expected ${prefix}`);
    const start=p; if(s[p]==='-') p++;
    while(p<s.length && /[0-9]/.test(s[p])) p++;
    const text=s.slice(start,p);
    if(!/^-?\d+$/.test(text) || (p<s.length && !/[\s()]/.test(s[p]))) fail('bad integer');
    const big=BigInt(text);
    if(big<0n || big>BigInt(max)) fail('integer outside permitted range');
    return Number(big);
  }
  function value() {
    depth++; counts.maxDepth=Math.max(counts.maxDepth,depth);
    take('('); const label=integer('^',980015); let result;
    switch(label) {
      case 980010: {
        counts.records++; result=Object.create(null); const keys=[]; orders.set(result,keys);
        while(!close()) {
          take('('); const key=value(); if(typeof key!=='string') fail('record key is not string');
          if(Object.hasOwn(result,key)) fail('duplicate record field');
          result[key]=value(); keys.push(key); counts.fields++; take(')');
        }
        break;
      }
      case 980011: counts.sequences++; result=[]; while(!close()) result.push(value()); break;
      case 980012: {
        counts.strings++; const units=[]; while(!close()) units.push(integer('#',65535)); counts.codeUnits+=units.length;
        result=''; for(let i=0;i<units.length;i+=4096) result+=String.fromCharCode(...units.slice(i,i+4096)); break;
      }
      case 980013: {
        counts.numbers++; const hi=integer('#',0xffffffff),lo=integer('#',0xffffffff);
        const bytes=Buffer.alloc(8); bytes.writeUInt32BE(hi,0); bytes.writeUInt32BE(lo,4); result=bytes.readDoubleBE(0);
        if(Object.is(result,-0)) counts.negativeZero++; if(!Number.isFinite(result)) counts.nonFinite++;
        break;
      }
      case 980014: counts.booleans++; result=!!integer('#',1); break;
      case 980015: counts.nulls++; result=null; break;
      default: fail('undeclared constructor');
    }
    take(')'); depth--; return result;
  }
  const object=value(); ws(); if(p!==s.length) fail('trailing terms');
  return {object,counts,orders};
}

function json(v,orders) {
  if(v===null) return 'null';
  if(typeof v==='number') {
    if(!Number.isFinite(v)) throw new Error('non-finite payload cannot be represented in plain JSON');
    return Object.is(v,-0)?'-0':JSON.stringify(v);
  }
  if(typeof v!=='object') return JSON.stringify(v);
  if(Array.isArray(v)) return '['+v.map(x=>json(x,orders)).join(',')+']';
  return '{'+orders.get(v).map(k=>JSON.stringify(k)+':'+json(v[k],orders)).join(',')+'}';
}

function native(v,orders) {
  if(v===null) return '(^980015)';
  if(typeof v==='boolean') return `(^980014 #${+v})`;
  if(typeof v==='string') return '(^980012'+Array.from({length:v.length},(_,i)=>' #'+v.charCodeAt(i)).join('')+')';
  if(typeof v==='number') { const b=Buffer.alloc(8); b.writeDoubleBE(v); return `(^980013 #${b.readUInt32BE(0)} #${b.readUInt32BE(4)})`; }
  if(Array.isArray(v)) return '(^980011'+v.map(x=>' '+native(x,orders)).join('')+')';
  return '(^980010'+orders.get(v).map(k=>' ('+native(k,orders)+' '+native(v[k],orders)+')').join('')+')';
}

// Controls probe rejection, UTF-16, binary64, order, and repeated occurrences.
const invalid=['(^980016)','(^980014 #2)','(^980012 #65536)','(^980013 #0)','(^980013 #4294967296 #0)','(^980015 #0)','(^980015) (^980015)','(^980010 ((^980012 #97) (^980015)) ((^980012 #97) (^980015)))','(^980010 ((^980014 #0) (^980015)))','(^980011 #1)','(^980012 #-1)'];
for(const s of invalid) assert.throws(()=>decode(s));
assert.equal(decode('(^980012 #55296 #0 #56320)').object,'\ud800\0\udc00');
assert(Object.is(decode('(^980013 #2147483648 #0)').object,-0));
assert.deepEqual(decode('(^980011 (^980014 #1) (^980014 #1))').object,[true,true]);
const ordered=decode('(^980010 ((^980012 #50) (^980015)) ((^980012 #49) (^980015)))');
assert.equal(json(ordered.object,ordered.orders),'{"2":null,"1":null}');
const bytes=fs.readFileSync(input); const before=sha(bytes);
assert.equal(before,'430b4d31343f0f3981d43e62f0a4a12304283147acf7fd98f1826f166ff37b3c');
const text=bytes.toString('utf8'); const decoded=decode(text);
const reconstructed=json(decoded.object,decoded.orders)+'\n';
const regenerated=native(decoded.object,decoded.orders);
assert.equal(regenerated.replace(/\s/g,''),text.replace(/\s/g,''));
fs.writeFileSync(path.join(out,'reconstruction.json'),reconstructed);
assert.equal(sha(fs.readFileSync(input)),before);
const summary={nativeSHA256:before,nativeBytes:bytes.length,reconstructionSHA256:sha(reconstructed),reconstructionBytes:Buffer.byteLength(reconstructed),counts:decoded.counts,roundTrip:'All native tokens match after whitespace removal',rejectionControls:invalid.length,positiveControls:4,topLevelKeys:decoded.orders.get(decoded.object)};
fs.writeFileSync(path.join(out,'counts.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
