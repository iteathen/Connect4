import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {exact} from './helpers/physical-oracle.mjs';

const apiURL=new URL('../components/isometric/solve.mjs',import.meta.url);

test('JSMinSys IsoMax solver API exists',async()=>{
  const api=await import(apiURL.href).catch(()=>null);
  assert.ok(api?.solve7x6,'IsoMax solver missing');
});

test('stdin/eval module host flags do not poison managed search worker',()=>{
  const code=`import {solve7x6} from ${JSON.stringify(apiURL.href)};console.log(JSON.stringify(await solve7x6([0,1,0,1,0,1,0],{timeoutMs:3000})));`;
  const result=JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',code],{encoding:'utf8',timeout:5000}));
  assert.equal(result.status,'EXACT',JSON.stringify(result));
  assert.equal(result.rootWdl,1);
  assert.equal(result.move,-1);
  assert.equal(result.cleanup,true);
});

test('JSMinSys CPC-first IsoMax agrees with independent late-position oracle',async()=>{
  const {solve7x6}=await import(apiURL.href);
  const fixtures=[
    [4,0,0,0,3,3,0,0,6,2,3,0,2,3,6,3,6,3,4,6,2,2,6,1,2,5,6,4],
    [1,3,2,0,4,6,1,0,2,4,5,2,2,3,1,1,1,5,1,3,2,4,6,0,4,4,6,2,0,4,3,3],
  ];
  for(const moves of fixtures){
    const control=exact(moves);
    for(const workers of [1,2,4]){
      const result=await solve7x6(moves,{workers,timeoutMs:5000});
      assert.equal(result.status,'EXACT',JSON.stringify({moves,workers,result}));
      assert.equal(result.rootWdl,control.value-2);
      assert.equal(result.move,control.move);
      assert.equal(result.cleanup,true);
      assert.equal(result.workersUsed,workers);
      assert.equal(result.workersExited,workers+1);
      assert.equal(result.metrics.branches,0);
      assert.equal(result.metrics.claims,1);
      assert.equal(result.metrics.evaluations,1);
      assert.equal(result.metrics.ttLive,1);
      assert.ok(result.metrics.alphaBetaNodes>=0);
    }
  }
});

test('JSMinSys IsoMax preserves caller-frame witness under reflection',async()=>{
  const {solve7x6}=await import(apiURL.href);
  const moves=[4,0,0,0,3,3,0,0,6,2,3,0,2,3,6,3,6,3,4,6,2,2,6,1,2,5,6,4];
  for(const replay of [moves,moves.map(c=>6-c)]){
    const control=exact(replay);
    const result=await solve7x6(replay,{workers:2,timeoutMs:5000});
    assert.equal(result.status,'EXACT',JSON.stringify({replay,result}));
    assert.equal(result.rootWdl,control.value-2);
    assert.equal(result.move,control.move);
  }
});

test('terminal roots return exact WDL with no move',async()=>{
  const {solve7x6}=await import(apiURL.href);
  const result=await solve7x6([0,1,0,1,0,1,0],{timeoutMs:3000});
  assert.equal(result.status,'EXACT',JSON.stringify(result));
  assert.equal(result.rootWdl,1);
  assert.equal(result.move,-1);
  assert.equal(result.cleanup,true);
});

test('managed Negamax root claim remains single-owner across worker counts',async()=>{
  const {solve7x6}=await import(apiURL.href);
  const moves=[4,0,0,0,3,3,0,0,6,2,3,0,2,3,6,3,6,3,4,6,2,2,6,1,2,5,6,4];
  const control=exact(moves);
  for(const workers of [1,2,4]){
    const result=await solve7x6(moves,{workers,timeoutMs:5000});
    assert.equal(result.status,'EXACT',JSON.stringify({workers,result}));
    assert.equal(result.rootWdl,control.value-2);
    assert.equal(result.move,control.move);
    assert.equal(result.workersExited,workers+1);
    assert.equal(result.metrics.branches,0);
    assert.equal(result.metrics.claims,1);
    assert.equal(result.metrics.evaluations,1);
    assert.equal(result.metrics.ttLive,1);
    assert.ok(result.metrics.alphaBetaNodes>0);
  }
});

test('cancellation terminates the managed search worker without WDL',async()=>{
  const {solve7x6}=await import(apiURL.href);
  const controller=new AbortController();
  controller.abort();
  const result=await solve7x6([],{workers:2,timeoutMs:5000,signal:controller.signal});
  assert.equal(result.status,'INTERRUPTED',JSON.stringify(result));
  assert.equal(result.rootWdl,null);
  assert.equal(result.move,-1);
  assert.equal(result.cleanup,true);
});
