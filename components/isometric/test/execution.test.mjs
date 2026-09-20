import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { IsoMaxBranchManager } from '../execution/branch-manager.mjs';
import { IsoMaxTaskSolver, validateTaskResult } from '../execution/task.mjs';
import { IsoMaxSolver } from '../solver.mjs';
import { makeCorpus } from '../../../benchmarks/isomax-ordering/corpus.mjs';
import { createSearchWorkerExecutor } from '../../../research/semantic-quotient/state-identity-unification/src/quotient-search-worker-executor.mjs';

test('running retirement unwinds to the exact task root without publishing WDL', () => {
  const solver = new IsoMaxTaskSolver(), needed = new SharedArrayBuffer(4), abort = new SharedArrayBuffer(4);
  Atomics.store(new Int32Array(needed), 0, 1);
  const create = solver.createState, check = solver.checkTaskControl;
  let state, before;
  const snapshot = s => [s.ply, s.p0Class, s.p1Class, s.status, s.sideToMove,
    s.supportCode, s.supportLo, s.supportHi, s.playableLo, s.playableHi, Array.from(s.heights)];
  solver.createState = function (moves) { state = create.call(this, moves); before = snapshot(state); return state; };
  solver.checkTaskControl = function (s) {
    if (this.metrics.nodes > 0) Atomics.store(this.needed, 0, 0);
    return check.call(this, s);
  };
  const result = solver.runTask({ moves: [], rootPly: 0, nodeBudget: 65536, needed, abort });
  assert.equal(result.kind, 'retired'); assert.equal(Object.hasOwn(result, 'value'), false);
  assert.ok(result.nodes > 0 && result.nodes < 65536);
  assert.equal(result.metrics.controlChecks, 2);
  assert.deepEqual(snapshot(state), before);
  assert.equal(solver.pool.sealed, false); assert.equal(solver.transitionCache.sealed, false);
  validateTaskResult(result);
  solver.checkTaskControl = check; Atomics.store(new Int32Array(needed), 0, 1);
  const exact = solver.runTask({ moves: [0,1,0,1,0,1], rootPly: 6, nodeBudget: 65536, needed, abort });
  assert.equal(exact.kind, 'exact'); assert.equal(exact.value, 1);
});

test('completed exact value survives a later retirement request', () => {
  const solver = new IsoMaxTaskSolver(), needed = new SharedArrayBuffer(4), abort = new SharedArrayBuffer(4);
  Atomics.store(new Int32Array(needed), 0, 1);
  const enter = solver.solveNode;
  solver.solveNode = function (state) {
    const value = enter.call(this, state);
    Atomics.store(this.needed, 0, 0);
    return value;
  };
  const result = solver.runTask({ moves:[0,1,0,1,0,1], rootPly:6, nodeBudget:65536, needed, abort });
  assert.equal(result.kind, 'exact'); assert.equal(result.value, 1);
});

test('native task quantum preserves root and never claims unfinished WDL',()=>{
  const solver=new IsoMaxTaskSolver(),needed=new SharedArrayBuffer(4),abort=new SharedArrayBuffer(4);
  Atomics.store(new Int32Array(needed),0,1);
  const split=solver.runTask({moves:[],rootPly:0,nodeBudget:8,needed,abort});
  assert.equal(split.kind,'split');assert.equal(split.nodes,8);assert.equal(Object.hasOwn(split,'value'),false);
  validateTaskResult(split);
  assert.throws(()=>validateTaskResult({...split,value:0}),/unfinished/);
  const win=solver.runTask({moves:[0,1,0,1,0,1],rootPly:6,nodeBudget:8,needed,abort});
  assert.equal(win.kind,'exact');assert.equal(win.value,1);
  Atomics.store(new Int32Array(needed),0,0);
  assert.equal(solver.runTask({moves:[],rootPly:0,nodeBudget:8,needed,abort}).kind,'retired');
});

test('existing executor accepts typed native results and still rejects invalid WDL',async()=>{
  class Fake extends EventEmitter {postMessage(m){this.sent=m;}}
  const worker=new Fake(),executor=createSearchWorkerExecutor([worker],{validateResult:validateTaskResult});
  const p=executor.submit({type:'isomax-task'});
  worker.emit('message',{type:'result',taskId:worker.sent.taskId,kind:'split',nodes:8,frames:[{moves:[],values:[]}]});
  assert.equal((await p).kind,'split');await executor.drain();executor.close();
  const bad=new Fake(),e=createSearchWorkerExecutor([bad],{validateResult:validateTaskResult});
  const rejected=e.submit({type:'isomax-task'});
  bad.emit('message',{type:'result',taskId:bad.sent.taskId,kind:'exact',value:4,nodes:0});
  await assert.rejects(rejected,/invalid/);
  await assert.rejects(e.drain());assert.throws(()=>e.close());
});

test('executor redispatches queued authoritative work to the next available worker',async()=>{
  class Fake extends EventEmitter {
    constructor(){super();this.sent=[];}
    postMessage(message){this.sent.push(message);}
  }
  const first=new Fake(),second=new Fake();
  const executor=createSearchWorkerExecutor([first,second],{validateResult:validateTaskResult});
  const p1=executor.submit({type:'isomax-task',jobId:1});
  const p2=executor.submit({type:'isomax-task',jobId:2});
  const p3=executor.submit({type:'isomax-task',jobId:3});
  assert.equal(first.sent.length,1);assert.equal(second.sent.length,1);
  assert.equal(executor.stats().queued,1);
  first.emit('message',{type:'result',taskId:first.sent[0].taskId,jobId:1,kind:'exact',value:0,nodes:1});
  assert.equal(first.sent.length,2,'freed worker must take queued work in the same executor turn');
  assert.equal(executor.stats().queued,0);
  second.emit('message',{type:'result',taskId:second.sent[0].taskId,jobId:2,kind:'exact',value:0,nodes:1});
  first.emit('message',{type:'result',taskId:first.sent[1].taskId,jobId:3,kind:'exact',value:0,nodes:1});
  await Promise.all([p1,p2,p3]);await executor.drain();
  const stats=executor.stats();
  assert.equal(stats.completed,3);assert.equal(stats.dispatched,3);
  assert.ok(stats.redispatches>=1);assert.ok(stats.queueWaitMsTotal>=0);assert.ok(stats.redispatchIdleMsTotal>=0);
  executor.close();
});

test('bounded ready reserve queues portable work without changing exact result',{timeout:30000},async()=>{
  const moves=makeCorpus({seed:0x205c4,ply:20,count:1})[0].moves;
  const expected=new IsoMaxSolver().solveMoves(moves);
  const manager=new IsoMaxBranchManager({workers:2,taskNodes:8,readyReserve:2});
  try{
    const actual=await manager.solveMoves(moves,{timeoutMs:25000});
    assert.equal(actual.value,expected.value);assert.equal(actual.move,expected.move);
    assert.equal(actual.scheduler.readyReserve,2);assert.equal(actual.scheduler.outstandingLimit,4);
    assert.ok(actual.metrics.maxPending>2);assert.ok(actual.metrics.maxPending<=4);
    assert.ok(actual.executor.maxQueued>0);
    assert.ok(actual.metrics.readySamples>0);assert.ok(actual.metrics.maxReadyLeaves>0);
  }finally{await manager.close();}
});

test('manager preserves native exact values and center-first actions across turns, mirrors and first win',{timeout:30000},async()=>{
  const manager=new IsoMaxBranchManager({workers:2,taskNodes:128,rankCutDepth:3});
  try{
    for(const ply of [28,29,34,35]){
      for(const {moves} of makeCorpus({seed:772+ply,ply,count:4})){
        for(const replay of [moves,moves.map(c=>6-c)]){
          const solver=new IsoMaxSolver(),expected=solver.solveMoves(replay);
          const actual=await manager.solveMoves(replay);
          assert.equal(actual.value,expected.value);
          assert.equal(actual.move,expected.move,JSON.stringify(replay));
        }
      }
    }
    for(const moves of [[],[0,1,0,1,0,1,0],[0,1,0,1,0,1]]){
      if(!moves.length)continue;
      const expected=new IsoMaxSolver().solveMoves(moves),actual=await manager.solveMoves(moves);
      assert.equal(actual.value,expected.value);assert.equal(actual.move,expected.move);
    }
  }finally{await manager.close();}
  assert.equal(manager.workers.length,0);
});

test('rank-cut policy is bounded, four-worker scoped and keeps an explicit control',()=>{
  for(const workers of [1,2,3,4,8]){
    assert.equal(new IsoMaxBranchManager({workers}).rankCutDepth,workers===4?3:0);
    assert.equal(new IsoMaxBranchManager({workers,rankCutDepth:0}).rankCutDepth,0);
  }
  for(const rankCutDepth of [-1,43,NaN,Infinity,1.5])
    assert.throws(()=>new IsoMaxBranchManager({rankCutDepth}),/rankCutDepth/);
});

test('bounded manager feeds multiple real workers and exposes exact task splits',{timeout:30000},async()=>{
  const moves=makeCorpus({seed:0x205c4,ply:20,count:1})[0].moves;
  const manager=new IsoMaxBranchManager({workers:2,taskNodes:8});
  const replies=[];
  try{
    await manager.start();
    const submit=manager.executor.submit.bind(manager.executor);
    manager.executor={...manager.executor,submit:async message=>{
      const result=await submit(message);replies.push(result);return result;
    }};
    const actual=await manager.solveMoves(moves,{timeoutMs:25000});
    const expected=new IsoMaxSolver().solveMoves(moves);
    assert.equal(actual.value,expected.value);assert.equal(actual.move,expected.move);
    assert.ok(actual.metrics.workerTasks.every(n=>n>0));
    assert.equal(actual.metrics.maxActive,2);
    assert.ok(actual.metrics.splitTasks>0);
    assert.ok(actual.metrics.maxPending<=4);
    for(const key of ['nodes','transitionCacheHits','nativeExactHits','recursiveChildren','forcedTransitions'])
      assert.equal(actual.metrics[key],replies.reduce((sum,r)=>sum+(r.metrics?.[key]??0),0),key);
    assert.equal(actual.metrics.expandedEntries,
      actual.metrics.nodes-actual.metrics.transitionCacheHits-actual.metrics.nativeExactHits);
    assert.equal(actual.metrics.transitionAttempts,actual.metrics.recursiveChildren+actual.metrics.forcedTransitions);
    assert.ok(actual.metrics.expandedEntries>0);
    assert.ok(actual.metrics.transitionAttempts>0);
    console.log(JSON.stringify({multicore:actual.metrics,elapsedMs:actual.elapsedMs}));
  }finally{await manager.close();}
});

test('timeout, worker death, capacity and pre-abort fail closed and clean up',{timeout:15000},async()=>{
  const timed=new IsoMaxBranchManager({workers:2,taskNodes:8192});
  await assert.rejects(timed.solveMoves([],{timeoutMs:150}),/ISOMAX_TIMEOUT/);
  assert.equal(timed.workers.length,0);
  const failed=new IsoMaxBranchManager({workers:2});
  await failed.start();
  const run=failed.solveMoves([],{timeoutMs:5000});
  const rejection=assert.rejects(run,/exit|worker|aborted/i);
  await failed.workers[0].terminate();await rejection;
  assert.equal(failed.workers.length,0);
  const capped=new IsoMaxBranchManager({workers:2,maxTasks:1});
  await assert.rejects(capped.solveMoves([]),/CAPACITY/);
  const aborted=new IsoMaxBranchManager({workers:2});
  await assert.rejects(aborted.solveMoves([],{signal:AbortSignal.abort()}),/ABORTED/);
  assert.equal(aborted.workers.length,0);
});

test('continuation handoff retains completed dependencies instead of restarting proof work',{timeout:10000},async()=>{
  const moves=Array.from('466537327657277224',c=>Number(c)-1);
  const expected=new IsoMaxSolver().solveMoves(moves);
  const manager=new IsoMaxBranchManager({workers:1});
  try{
    const result=await manager.solveMoves(moves,{timeoutMs:9000});
    assert.equal(result.value,expected.value);assert.equal(result.move,expected.move);
    assert.ok(result.metrics.splitTasks>0);
    assert.ok(result.metrics.nodes<expected.metrics.nodes*1.01,
      'continuation/cache retention must not multiply the serial proof work');
  }finally{await manager.close();}
});

test('closing an active session aborts, terminates and is idempotent',{timeout:5000},async()=>{
  const manager=new IsoMaxBranchManager({workers:2});
  await manager.start();
  const run=manager.solveMoves([]),rejected=assert.rejects(run,/ABORTED/);
  await manager.close().catch(error=>assert.match(error.message,/ABORTED/));
  await rejected;await manager.close();assert.equal(manager.workers.length,0);
});
