import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {exact} from './helpers/physical-oracle.mjs';

const apiURL=new URL('../components/isometric/solve.mjs',import.meta.url);

function assertOptimalCallerMove(moves,result,control){
  assert.ok(Number.isInteger(result.move)&&result.move>=0&&result.move<7,JSON.stringify({moves,result}));
  const child=exact([...moves,result.move]);
  assert.equal(child.value,control.value,JSON.stringify({moves,result,control,child}));
}

test('JSMinSys IsoMax solver API exists',async()=>{
  const api=await import(apiURL.href).catch(()=>null);
  assert.ok(api?.solve7x6,'IsoMax solver missing');
});

test('stdin/eval module host flags do not poison Lazy SMP search workers',()=>{
  const code=`import {solve7x6} from ${JSON.stringify(apiURL.href)};console.log(JSON.stringify(await solve7x6([0,1,0,1,0,1,0],{timeoutMs:3000})));`;
  const result=JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',code],{encoding:'utf8',timeout:5000}));
  assert.equal(result.status,'EXACT',JSON.stringify(result));
  assert.equal(result.rootWdl,1);
  assert.equal(result.move,-1);
  assert.equal(result.cleanup,true);
});

test('JSMinSys Lazy SMP IsoMax agrees with independent late-position oracle',async()=>{
  const {solve7x6}=await import(apiURL.href);
  const fixtures=[
    [4,0,0,0,3,3,0,0,6,2,3,0,2,3,6,3,6,3,4,6,2,2,6,1,2,5,6,4],
    [1,3,2,0,4,6,1,0,2,4,5,2,2,3,1,1,1,5,1,3,2,4,6,0,4,4,6,2,0,4,3,3],
  ];
  for(const moves of fixtures){
    const control=exact(moves);
    for(const workers of [2,4]){
      const result=await solve7x6(moves,{workers,timeoutMs:5000});
      assert.equal(result.status,'EXACT',JSON.stringify({moves,workers,result}));
      assert.equal(result.rootWdl,control.value-2);
      assertOptimalCallerMove(moves,result,control);
      assert.equal(result.cleanup,true);
      assert.equal(result.workersUsed,workers);
      assert.equal(result.workersExited,workers);
      assert.ok(result.winner>=0&&result.winner<workers,JSON.stringify(result));
      assert.equal(result.completedWorkers.length,workers);
      assert.ok(result.completedWorkers.some(Boolean),JSON.stringify(result));
      assert.ok(result.winnerMetrics&&result.winnerMetrics.nodes>=0,JSON.stringify(result));
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
    assertOptimalCallerMove(replay,result,control);
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

test('Lazy SMP remains exact across supported qualification worker counts',async()=>{
  const {solve7x6}=await import(apiURL.href);
  const moves=[4,0,0,0,3,3,0,0,6,2,3,0,2,3,6,3,6,3,4,6,2,2,6,1,2,5,6,4];
  const control=exact(moves);
  for(const workers of [2,4]){
    const result=await solve7x6(moves,{workers,timeoutMs:5000});
    assert.equal(result.status,'EXACT',JSON.stringify({workers,result}));
    assert.equal(result.rootWdl,control.value-2);
    assertOptimalCallerMove(moves,result,control);
    assert.equal(result.workersExited,workers);
    assert.equal(result.workersUsed,workers);
    assert.ok(result.winner>=0&&result.winner<workers,JSON.stringify(result));
    assert.ok(result.winnerMetrics&&result.winnerMetrics.nodes>=0,JSON.stringify(result));
  }
});

test('single-worker IsoMax execution remains forbidden',async()=>{
  const {solve7x6}=await import(apiURL.href);
  await assert.rejects(
    ()=>solve7x6([0,1,0,1],{workers:1,timeoutMs:1000}),
    /at least two search workers/,
  );
});

test('cancellation terminates Lazy SMP workers without WDL',async()=>{
  const {solve7x6}=await import(apiURL.href);
  const controller=new AbortController();
  controller.abort();
  const result=await solve7x6([],{workers:2,timeoutMs:5000,signal:controller.signal});
  assert.equal(result.status,'INTERRUPTED',JSON.stringify(result));
  assert.equal(result.rootWdl,null);
  assert.equal(result.move,-1);
  assert.equal(result.cleanup,true);
});
