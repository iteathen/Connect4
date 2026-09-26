import fs from 'node:fs';
import crypto from 'node:crypto';
const root='C:/r/isomax-isograph-019/research/isograph/discovery/2026-09-26-isomax-core019';
const dir=root+'/evidence/v2-b';
const input=fs.readFileSync(root+'/packet-v2/NATIVE.isg');
const s=input.toString('utf8');let p=0;
const counts={}, numbers=[];let records=0,fields=0;
function fail(m){throw Error(m+' at '+p)}
function ws(){while(/\s/.test(s[p]??'')&&p<s.length)p++}
function take(c){ws();if(s[p++]!==c)fail('expected '+c)}
function integer(){take('#');const start=p;while(/[0-9]/.test(s[p]??'')&&p<s.length)p++;if(start===p)fail('missing integer');const v=BigInt(s.slice(start,p));if(v>4294967295n)fail('integer out of range');return Number(v)}
function value(){take('(');take('^');let st=p;while(/[0-9]/.test(s[p]??'')&&p<s.length)p++;let tag=s.slice(st,p);counts[tag]=(counts[tag]??0)+1;let v;
 if(tag==='980010'){v=Object.create(null);records++;ws();while(s[p]!==')'){take('(');let k=value();if(typeof k!=='string')fail('key not string');if(Object.hasOwn(v,k))fail('duplicate key');v[k]=value();fields++;take(')');ws();}}
 else if(tag==='980011'){v=[];ws();while(s[p]!==')'){v.push(value());ws();}}
 else if(tag==='980012'){let chars=[];ws();while(s[p]!==')'){let n=integer();if(n>65535)fail('code unit out of range');chars.push(n);ws();}v='';for(let i=0;i<chars.length;i+=4096)v+=String.fromCharCode(...chars.slice(i,i+4096));}
 else if(tag==='980013'){const hi=integer(),lo=integer();const b=Buffer.alloc(8);b.writeUInt32BE(hi);b.writeUInt32BE(lo,4);v=b.readDoubleBE();if(!Number.isFinite(v))fail('nonfinite number requires lossless JSON schema');numbers.push([hi,lo]);}
 else if(tag==='980014'){let n=integer();if(n>1)fail('invalid boolean');v=!!n;}
 else if(tag==='980015')v=null;
 else fail('unknown constructor '+tag);
 take(')');return v;
}
const obj=value();ws();if(p!==s.length)fail('trailing terms');
function json(v){if(v===null)return 'null';if(typeof v==='number')return Object.is(v,-0)?'-0':JSON.stringify(v);if(typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(json).join(',')+']';return '{'+Object.entries(v).map(([k,x])=>JSON.stringify(k)+':'+json(x)).join(',')+'}'}
const output=json(obj)+'\n';fs.writeFileSync(dir+'/reconstruction.json',output);
function encode(v){if(v===null)return '(^980015)';if(typeof v==='string')return '(^980012'+Array.from({length:v.length},(_,i)=>' #'+v.charCodeAt(i)).join('')+')';if(typeof v==='boolean')return '(^980014 #'+Number(v)+')';if(typeof v==='number'){const b=Buffer.alloc(8);b.writeDoubleBE(v);return '(^980013 #'+b.readUInt32BE()+' #'+b.readUInt32BE(4)+')'}if(Array.isArray(v))return '(^980011'+v.map(x=>' '+encode(x)).join('')+')';return '(^980010'+Object.entries(v).map(([k,x])=>' ('+encode(k)+' '+encode(x)+')').join('')+')'}
const roundtrip=encode(JSON.parse(output));if(roundtrip!==s.trim())fail('roundtrip differs');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const stats={nativeSHA256:hash(input),reconstructionSHA256:hash(output),constructors:counts,records,fields,numericPayloads:numbers.length,byteExactExceptOuterWhitespace:true,topLevel:Object.keys(obj)};
fs.writeFileSync(dir+'/decode-stats.json',JSON.stringify(stats,null,2)+'\n');
fs.writeFileSync(dir+'/bridge.json',JSON.stringify(obj.semanticBridge,null,2)+'\n');
console.log(JSON.stringify(stats,null,2));
console.log('ROOT SHAPES',Object.fromEntries(Object.entries(obj).map(([k,v])=>[k,Array.isArray(v)?v.length:typeof v==='object'?Object.keys(v):typeof v])));
