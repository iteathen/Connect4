import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {readFileSync,readdirSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {prepareConnect4RbaGeometry} from '../runtime/addons/rba-connect4-geometry.mjs';
import {mixSpan32Locator32} from '../runtime/src/widekey32.mjs';
import * as api from '../runtime/addons/rba-connect4-index-partial-cache.mjs';
import {connect4RbaFromMoves} from '../runtime/addons/rba-connect4-ingress.mjs';
import {createConnect4RbaSharedLayoutCache32,prepareSharedCacheAccess} from '../runtime/addons/rba-connect4-shared-exact-cache-layout.mjs';

const geometry=prepareConnect4RbaGeometry({columns:7,rows:6});
function collisionGroups(banked){
 const targets=banked?[0,7,8,15,16,23,24,31]:[0,7],groups=targets.map(index=>({index,keys:[]}));
 let seed=0x93c4e2f1;
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
 for(let trial=0;trial<100000&&groups.some(g=>g.keys.length<7);trial++){
  const offset=3,q=new Uint32Array(20);let rank=0;
  for(let c=0;c<7;c++){q[offset+c]=random()%7;rank+=q[offset+c];}
  q[offset+7]=rank<<2;
  for(const lane of [8,9,11,12])q[offset+lane]=random();
  q[offset+10]=random()&31;q[offset+13]=random()&31;
  const hash=mixSpan32Locator32(q,offset,14),index=hash&(banked?31:7),group=groups.find(g=>g.index===index);
  if(group&&group.keys.length<7)group.keys.push({q,offset,hash:hash|0,packed:api.packIndexPartial24Support32(q,offset),
   tag:group.keys.length===6?0:1+(group.keys.length%5)});
 }
 assert.ok(groups.every(g=>g.keys.length===7));return groups;
}
const workerSource=`const {workerData:d,parentPort}=require('node:worker_threads');
(async()=>{
 const a=await import(d.url),c=d.banked?a.attachBankedIndexPartialCache32(d.cache):a.attachIndexPartialCache32(d.cache),
  store=d.banked?a.storeBankedIndexPartial24Shared32:a.storeIndexPartial24Shared32,
  probe=d.banked?a.probeBankedIndexPartial24Shared32:a.probeIndexPartial24Shared32,g=d.gate;
 let reads=0,hits=0,misses=0,overlapReads=0;
 const check=k=>{const value=probe(c,k.q,k.offset,k.hash,k.packed);if(value!==0&&value!==k.tag)throw Error('borrowed proof');
  reads++;if(value)hits++;else misses++;if(Atomics.load(g,2)<6)overlapReads++;};
 Atomics.add(g,0,1);Atomics.notify(g,0);Atomics.wait(g,1,0);
 if(d.writer>=0){
  while(Atomics.load(g,3)!==2)Atomics.wait(g,3,Atomics.load(g,3),100);
  for(let i=0;i<d.iterations;i++){
   const group=d.groups[i%d.groups.length],k=group.keys[d.writer];store(c,k.q,k.offset,k.tag,k.hash,k.packed);
   if((i&15)===0)for(const key of group.keys)check(key);
  }
  Atomics.add(g,2,1);
 }else{
  Atomics.add(g,3,1);Atomics.notify(g,3);
  do{for(const group of d.groups)for(const key of group.keys)check(key);}while(Atomics.load(g,2)<6||reads<100000);
 }
 parentPort.postMessage({reads,hits,misses,overlapReads});
})().catch(e=>{parentPort.postMessage({failure:e.message});process.exitCode=1;});`;

for(const banked of [false,true])test(`six synchronized writers and two readers preserve ${banked?'banked boundary':'single-bank'} partial24 proof identity`,{timeout:30000},async()=>{
 const groups=collisionGroups(banked),cache=banked?api.createBankedIndexPartialCache32({geometry,capacity:32,bankCapacity:8}):
  api.createIndexPartialCache32({geometry,capacity:8,shared:true}),
  store=banked?api.storeBankedIndexPartial24Shared32:api.storeIndexPartial24Shared32,
  probe=banked?api.probeBankedIndexPartial24Shared32:api.probeIndexPartial24Shared32;
 // Every writer key and a never-published collision key are checked serially
 // first. The stress validates publication only, not Connect Four outcomes.
 for(const group of groups)for(const k of group.keys.slice(0,6)){
  store(cache,k.q,k.offset,k.tag,k.hash,k.packed);
  for(const other of group.keys)assert.equal(probe(cache,other.q,other.offset,other.hash,other.packed),other===k?k.tag:0);
 }
 const gate=new Int32Array(new SharedArrayBuffer(16)),url=new URL('../runtime/addons/rba-connect4-index-partial-cache.mjs',import.meta.url).href,workers=[];
 try{
  const done=Array.from({length:8},(_,i)=>{
   const worker=new Worker(workerSource,{eval:true,workerData:{url,cache,groups,gate,banked,writer:i<6?i:-1,iterations:24000}});workers.push(worker);
   return new Promise((resolve,reject)=>{let report;worker.once('message',r=>{report=r;});worker.once('error',reject);
    worker.once('exit',code=>code||!report||report.failure?reject(Error(report?.failure??'stress worker failed')):resolve(report));});
  });
  const deadline=Date.now()+20000;
  while(Atomics.load(gate,0)!==8){assert.ok(Date.now()<deadline,'all worker imports reach the start barrier');await new Promise(r=>setTimeout(r,2));}
  Atomics.store(gate,1,1);Atomics.notify(gate,1);
  const reports=await Promise.all(done);
  assert.equal(Atomics.load(gate,2),6);
  for(const r of reports.slice(6)){assert.ok(r.overlapReads>0);assert.ok(r.reads>=100000);}
  // Quiescent publication verifies recoverability after adversarial contention.
  for(const group of groups){const k=group.keys[5];store(cache,k.q,k.offset,k.tag,k.hash,k.packed);assert.equal(probe(cache,k.q,k.offset,k.hash,k.packed),k.tag);}
  assert.deepEqual(Array.from(cache.stats),[0,0,0]);
  console.log(JSON.stringify({kind:banked?'banked-partial24':'partial24',writers:6,readers:2,startBarrier:true,
   collidedRows:groups.map(g=>g.index),keysPerRow:7,storesAttempted:144000,reports}));
 }finally{await Promise.all(workers.map(w=>w.terminate()));}
});

test('banked boundary rows preserve busy, sequence wrap, cloned and signed locator behavior',()=>{
 const cache=api.createBankedIndexPartialCache32({geometry,capacity:32,bankCapacity:8}),cloned=api.attachBankedIndexPartialCache32(structuredClone(cache));
 for(const group of collisionGroups(true)){
  const k=group.keys[0],bank=cloned.banks[(k.hash>>>3)&3],row=(k.hash&7)*6;
  Atomics.store(bank.entries,row,0xffffffff);const before=Array.from(bank.entries.slice(row,row+6));
  assert.equal(api.probeBankedIndexPartial24Shared32(cloned,k.q,k.offset,k.hash,k.packed),0);
  api.storeBankedIndexPartial24Shared32(cloned,k.q,k.offset,k.tag,k.hash,k.packed);
  assert.deepEqual(Array.from(bank.entries.slice(row,row+6)),before);
  Atomics.store(bank.entries,row,0xfffffffe);api.storeBankedIndexPartial24Shared32(cloned,k.q,k.offset,k.tag,k.hash,k.packed);
  assert.equal(Atomics.load(bank.entries,row),0);assert.equal(api.probeBankedIndexPartial24Shared32(cloned,k.q,k.offset,k.hash,k.packed),0);
  api.storeBankedIndexPartial24Shared32(cloned,k.q,k.offset,k.tag,k.hash>>>0,k.packed);
  assert.equal(api.probeBankedIndexPartial24Shared32(cache,k.q,k.offset,k.hash,k.packed),k.tag);
 }
});

test('shipped partial worker preambles carry the complete signed locator ABI',()=>{
 const directory=new URL('../runtime/addons/',import.meta.url),names=readdirSync(directory).filter(name=>/worker-minimal.*-partial24\.mjs$/.test(name));
 assert.ok(names.length>0);
 for(const name of names){
  const source=readFileSync(new URL(name,directory),'utf8'),start=source.indexOf('function negamax('),
   body=source.slice(source.indexOf('{',start)+1,source.indexOf('\n  if(depth){',start));
  assert.ok(start>=0&&body.length>0);
  for(const hash of [0,0x7fffffff,0x80000000,0xfedcba98,0xffffffff]){
   const context={g:{maxBasis:128,keyWords:14,columns:7},words:[],control:[],CONTROL_STOP:0,CANCELLED:-2,
    liveOffset:0,orderRow:0,liveWords:6,Atomics:{load:()=>0},mixSpan32Locator32:()=>hash,packIndexPartial24Support32:()=>0};
   runInNewContext('function carrier(depth,src,supportHandle,n,mover,alpha,beta){'+body+'return hash;}',context);
   const actual=context.carrier(1,0,0,69,0,-2,2);assert.equal(actual,hash|0,name);assert.equal(actual>>>0,hash,name);
  }
 }
});

test('fast TT identity and reflection guards cover geometries 1x1 through 10x10 without searches',()=>{
 let states=0;
 for(let columns=1;columns<=10;columns++)for(let rows=1;rows<=10;rows++){
  const g=prepareConnect4RbaGeometry({columns,rows}),partial=columns===7&&rows===6,
   cache=partial?api.createIndexPartialCache32({geometry:g,capacity:32,shared:true}):
    createConnect4RbaSharedLayoutCache32({geometry:g,keyWords:g.keyWords,capacity:32}),
   access=partial?{store:api.storeIndexPartial24Shared32,probe:api.probeIndexPartial24Shared32}:prepareSharedCacheAccess(cache),
   moves=[],heights=Array(columns).fill(0);
  for(let ply=0;ply<Math.min(columns*rows,24);ply++){
   const q=connect4RbaFromMoves(moves,{geometry:g}).words;if(q[g.metaOffset]&3)break;
   const hash=mixSpan32Locator32(q,0,g.keyWords),tag=1+(ply%5);
   access.store(cache,q,0,tag,hash);assert.equal(access.probe(cache,q,0,hash),tag);
   const mirror=connect4RbaFromMoves(moves.map(c=>columns-1-c),{geometry:g}).words;
   assert.deepEqual(mirror,q);assert.equal(access.probe(cache,mirror,0,mixSpan32Locator32(mirror,0,g.keyWords)),tag);states++;
   let column=ply%columns;while(heights[column]===rows)column=(column+1)%columns;
   heights[column]++;moves.push(column);
  }
 }
 assert.ok(states>500);console.log(JSON.stringify({geometries:100,states,solvedOutcomesQueried:false}));
});
