import test from 'node:test';
import assert from 'node:assert/strict';
import { IsoMaxSolver } from '../solver.mjs';
import { IsoMaxSurplusBranchManager } from '../execution/surplus-manager.mjs';
import { makeCorpus } from '../../../benchmarks/isomax-ordering/corpus.mjs';

test('one-worker surplus profile preserves one native continuation across published branches',
  {timeout:30000}, async () => {
    const moves=makeCorpus({seed:0x1025a,ply:30,count:1})[0].moves;
    const expected=new IsoMaxSolver().solveMoves(moves);
    const manager=new IsoMaxSurplusBranchManager({
      workers:1,maxQ:65536,workCapacity:65536,occurrenceCapacity:131072,
      queueCapacity:131072,publicationCapacity:131072,
      workerClassReserve:524288,workerEntryReserve:1048576,
    });
    try{
      const actual=await manager.solveMoves(moves,{timeoutMs:15000});
      assert.equal(actual.value,expected.value);
      assert.equal(actual.move,expected.move);
      assert.equal(actual.scheduler.architecture,'surplus-opportunity-pull');

      const worker=actual.metrics.worker;
      assert.ok(worker.branches>0,'fixture must exercise genuine branches');
      assert.ok(worker.occurrencesPublished>0,'surplus alternatives must become globally visible');
      assert.ok(worker.localReclaims>0,'single worker must reclaim un-stolen surplus locally');
      assert.equal(worker.surplusRemote,0,'single worker cannot turn its own surplus into remote dependencies');
      assert.equal(worker.helperWaits,0,'single worker must not wait for a helper');
      assert.equal(worker.workClaims,1,
        'branching must not force the single worker to end its current continuation and claim new roots');
      assert.equal(worker.pathReplayApplies,moves.length,
        'single-worker execution should replay only the external root, not every decision frontier');
    }finally{await manager.close();}
  });

test('surplus helpers steal alternatives while the current worker keeps local recursion',
  {timeout:45000}, async () => {
    const roots=makeCorpus({seed:0x1025b,ply:30,count:2}).map(x=>x.moves);
    let remote=0,claims=0,branches=0;
    const manager=new IsoMaxSurplusBranchManager({
      workers:2,maxQ:131072,workCapacity:131072,occurrenceCapacity:262144,
      queueCapacity:262144,publicationCapacity:262144,
      workerClassReserve:262144,workerEntryReserve:524288,
    });
    try{
      for(const moves of roots){
        const expected=new IsoMaxSolver().solveMoves(moves);
        const actual=await manager.solveMoves(moves,{timeoutMs:20000});
        assert.equal(actual.value,expected.value);
        assert.equal(actual.move,expected.move);
        remote+=actual.metrics.worker.surplusRemote;
        claims+=actual.metrics.worker.workClaims;
        branches+=actual.metrics.worker.branches;
      }
      assert.ok(branches>claims,
        'workers should traverse multiple branch points inside claimed continuations');
      assert.ok(claims>=2,'second worker should claim globally exposed surplus work');
      assert.ok(remote>0,'at least one local parent should consume work executed by a helper');
    }finally{await manager.close();}
  });

test('surplus profile preserves q_r mirror action transport through physical root selection',
  {timeout:30000}, async () => {
    const moves=makeCorpus({seed:0x1025c,ply:32,count:1})[0].moves;
    const mirror=moves.map(column=>6-column);
    const manager=new IsoMaxSurplusBranchManager({
      workers:2,maxQ:65536,workCapacity:65536,occurrenceCapacity:131072,
      queueCapacity:131072,publicationCapacity:131072,
      workerClassReserve:262144,workerEntryReserve:524288,
    });
    try{
      for(const root of [moves,mirror]){
        const expected=new IsoMaxSolver().solveMoves(root);
        const actual=await manager.solveMoves(root,{timeoutMs:15000});
        assert.equal(actual.value,expected.value);
        assert.equal(actual.move,expected.move);
      }
    }finally{await manager.close();}
  });
