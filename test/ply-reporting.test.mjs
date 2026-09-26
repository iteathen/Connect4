import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {setTimeout as delay} from 'node:timers/promises';
import {instrumentNodeCounts} from '../tools/isomax-node-counts.mjs';
import {startPlyReporter} from '../tools/isomax-ply-reporter.mjs';
import {validateMemoryConfig} from '../tools/isomax-cycle-analysis.mjs';

const source=readFileSync(new URL('../vendor/jsminsys/addons/rba-connect4-alphabeta.mjs',import.meta.url),'utf8').replaceAll('\r\n','\n');
test('ply publication reuses shared-probe selection, preserves local hits and exact lookup',()=>{
  const code=instrumentNodeCounts(source,'rba-connect4-alphabeta.mjs',true);
  const probe=code.slice(code.indexOf('function probeConnect4RbaExactCacheSlot32'),code.indexOf('function storeConnect4RbaExactCacheSlot32'));
  let calls=0;
  const fn=new Function('probeConnect4RbaSharedExactCache32',`${probe};return probeConnect4RbaExactCacheSlot32;`)(()=>{calls++;return 3;});
  const words=new Uint32Array([84,11]),ply=new Uint32Array(1),
    cache={stamp:new Uint32Array(1),value:new Uint8Array([2]),keys:words.slice(),keyWords:2,
      epoch:1,shared:{},sharedSampleBits:1,benchmarkPly:ply,benchmarkMetaOffset:0};
  assert.equal(fn(cache,words,0,0,1),0);assert.equal(ply[0],0);assert.equal(calls,0);
  assert.equal(fn(cache,words,0,0,0),3);assert.equal(ply[0],22);assert.equal(calls,1);
  cache.stamp[0]=1;ply[0]=0;
  assert.equal(fn(cache,words,0,0,0),2);assert.equal(ply[0],0);assert.equal(calls,1);
  assert.equal((code.match(/state\.benchmarkNodes\[0\]\+=1;/g)||[]).length,2);
  assert.ok(!instrumentNodeCounts(source,'rba-connect4-alphabeta.mjs',false).includes('benchmarkPly'));
  assert.throws(()=>instrumentNodeCounts(source.replace('return cache.shared&&','return changed&&'),'rba-connect4-alphabeta.mjs',true),/source guard/);
});

test('reporter samples padded worker slots asynchronously and joins on stop',async()=>{
  const reporter=await startPlyReporter({workers:2,sampleMs:5,reportMs:1000,progress:false});
  const slots=new Uint32Array(reporter.buffer);
  slots[0]=22;slots[16]=38;
  await delay(60);
  const result=await reporter.stop();
  assert.equal(result.cleanup,true);
  assert.equal(result.mode,'latest-shared-probe-ply-samples');
  assert.ok(result.workers[0].histogram[21]>0);
  assert.ok(result.workers[1].histogram[37]>0);
  assert.equal(result.workers[0].maxObservedPly,21);
  assert.equal(result.workers[1].minObservedPly,37);
  assert.equal(result.histogram[21]+result.histogram[37],result.workerSamples);
  assert.deepEqual(await reporter.stop(),result);
});

test('reporter excludes unpublished slots and rejects invalid ply values',async()=>{
  const reporter=await startPlyReporter({workers:2,sampleMs:5,reportMs:1000,progress:false});
  const slots=new Uint32Array(reporter.buffer);slots[16]=99;
  await delay(30);
  const result=await reporter.stop();
  assert.equal(result.workerSamples,0);
  assert.ok(result.invalidSamples>0);
  assert.equal(result.workers[0].maxObservedPly,null);
});

test('ply options fail closed before workers start',()=>{
  const config={sharedCacheCapacity:65536,localCacheCapacity:65536,timeoutMs:1000,recordPly:true};
  assert.equal(validateMemoryConfig(config),config);
  for(const extra of [{recordPly:1},{plySampleMs:0},{plySampleMs:1.5},{plyReportMs:99},{plyReportMs:30001}])
    assert.throws(()=>validateMemoryConfig({...config,...extra}));
});
