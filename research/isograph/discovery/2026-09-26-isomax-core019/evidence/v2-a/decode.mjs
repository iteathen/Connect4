import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root='C:/r/isomax-isograph-019/research/isograph/discovery/2026-09-26-isomax-core019';
const out=root+'/evidence/v2-a';
function decode(source) {
 let at=0; const counts={}; const numericBits=[];
 function ws(){while(at<source.length && /\s/.test(source[at]))at++;}
 function token(){ws();const start=at;while(at<source.length&&!/[\s()]/.test(source[at]))at++;if(start===at)throw Error('expected atom at '+at);return source.slice(start,at);}
 function mark(c){ws();if(source[at++]!==c)throw Error('expected '+c+' at '+(at-1));}
 function integer(max){const t=token();if(!/^#(?:0|[1-9][0-9]*)$/.test(t))throw Error('invalid integer '+t);const n=BigInt(t.slice(1));if(n>BigInt(max))throw Error('range');return Number(n);}
 function value(path){
  mark('(');const label=token();counts[label]=(counts[label]??0)+1; let v;
  if(label==='^980010'){v=Object.create(null);ws();while(source[at]!==')'){mark('(');const k=value(path+'/<key>');if(typeof k!=='string'||Object.hasOwn(v,k))throw Error('invalid/duplicate key');v[k]=value(path+'/'+k);mark(')');ws();}}
  else if(label==='^980011'){v=[];ws();while(source[at]!==')'){v.push(value(path+'/'+v.length));ws();}}
  else if(label==='^980012'){const units=[];ws();while(source[at]!==')'){units.push(integer(65535));ws();}v='';for(let i=0;i<units.length;i+=4096)v+=String.fromCharCode(...units.slice(i,i+4096));}
  else if(label==='^980013'){const hi=integer(4294967295),lo=integer(4294967295);const b=Buffer.alloc(8);b.writeUInt32BE(hi,0);b.writeUInt32BE(lo,4);v=b.readDoubleBE();numericBits.push({path,hex:b.toString('hex')});if(!Number.isFinite(v)||Object.is(v,-0))throw Error('JSON requires explicitly declared special-number schema at '+path);}
  else if(label==='^980014'){v=integer(1)===1;}
  else if(label==='^980015'){v=null;}
  else throw Error('undeclared label '+label);
  mark(')');return v;
 }
 const object=value('');ws();if(at!==source.length)throw Error('trailing terms');return {object,counts,numericBits};
}
// Decoder integrity controls are invented here, independent of campaign controls.
for(const s of ['(^980015 #0)','(^980014 #2)','(^980012 #65536)','(^980013 #0)','(^980016)','(^980015) (^980015)','(^980010 ((^980012 #97) (^980015)) ((^980012 #97) (^980015)))'])assert.throws(()=>decode(s));
assert.equal(decode('(^980012 #55296 #0 #56320)').object.length,3);
assert.deepEqual([...decode('(^980011 (^980014 #1) (^980014 #0))').object],[true,false]);
const input=fs.readFileSync(root+'/packet-v2/NATIVE.isg');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(hash(input),'8d002aa2728ebabb9f1f7f7fc5a6c563f5514fab8a568fbec4954475ca867718');
const result=decode(input.toString('utf8'));
const bytes=JSON.stringify(result.object,null,2)+'\n';
fs.writeFileSync(out+'/reconstruction.json',bytes);
fs.writeFileSync(out+'/numeric-bits.json',JSON.stringify(result.numericBits,null,2)+'\n');
const summary={nativeSha256:hash(input),reconstructionSha256:hash(bytes),nativeBytes:input.length,reconstructionBytes:Buffer.byteLength(bytes),constructorCounts:result.counts,numericPayloads:result.numericBits.length,keys:Object.keys(result.object)};
fs.writeFileSync(out+'/decode-summary.json',JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
for(const k of Object.keys(result.object))if(!['modules','controls'].includes(k))console.log(k+': '+JSON.stringify(result.object[k],null,2));
console.log('collections',Object.entries(result.object).filter(([k,v])=>Array.isArray(v)).map(([k,v])=>[k,v.length]));
