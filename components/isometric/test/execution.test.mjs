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

test('manager preserves native exact values and center-first actions across turns, mirrors and first win',{timeout:30000},async()=>{
  const manager=new IsoMaxBranchManager({workers:2,taskNodes:128});
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

test('bounded manager feeds multiple real workers and exposes exact task splits',{timeout:30000},async()=>{
  const moves=makeCorpus({seed:0x205c4,ply:20,count:1})[0].moves;
  const manager=new IsoMaxBranchManager({workers:2,taskNodes:8});
  try{
    const actual=await manager.solveMoves(moves,{timeoutMs:25000});
    const expected=new IsoMaxSolver().solveMoves(moves);
    assert.equal(actual.value,expected.value);assert.equal(actual.move,expected.move);
    assert.ok(actual.metrics.workerTasks.every(n=>n>0));
    assert.equal(actual.metrics.maxActive,2);
    assert.ok(actual.metrics.splitTasks>0);
    assert.ok(actual.metrics.maxPending<=4);
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
