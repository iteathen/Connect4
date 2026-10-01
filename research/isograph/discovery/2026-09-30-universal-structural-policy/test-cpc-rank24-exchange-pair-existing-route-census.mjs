import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank24-exchange-pair-existing-route-census.mjs');
const library=process.argv[2];
assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank24_exchange_pair_existing_route_census.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

assert.deepEqual(r.commonSupport,[1,6,2,6,4,5,0]);
assert.deepEqual(r.states.map(x=>x.name),['A','B']);
for(const state of r.states){
  assert.equal(state.rank,24);
  assert.equal(state.mover,1);
  assert.deepEqual(state.support,[1,6,2,6,4,5,0]);
  assert.deepEqual(state.legalP1Columns,[1,3,5,6,7]);
  assert.equal(state.candidates.length,5);
  for(const row of state.candidates){
    assert.ok(state.legalP1Columns.includes(row.p1Column));
    assert.ok(row.afterP1Terminal===0||row.afterP1Terminal===3);
    if(row.afterP1Terminal===0)assert.equal(row.afterP1Rank,25);
    assert.equal(row.closedReplyCount+row.unclosedReplies.length,row.legalDefenderReplies.length);
    assert.equal(row.fullyRouted,row.unclosedReplies.length===0);
    for(const reply of row.replies){
      assert.ok(row.legalDefenderReplies.includes(reply.defenderColumn));
      if(reply.replyTerminal===0)assert.equal(reply.replyRank,26);
      else assert.equal(reply.replyTerminal,1);
      assert.equal(reply.closed,reply.acceptedRoutes.length>0);
      if(reply.replyTerminal!==0)assert.equal(reply.closed,false);
      for(const route of reply.acceptedRoutes)assert.equal(route.accept,true);
    }
  }
  assert.equal(state.summary.bestUnresolvedCount,Math.min(...state.candidates.map(x=>x.unclosedReplies.length)));
  assert.deepEqual(
    state.summary.bestCandidateColumns,
    state.candidates.filter(x=>x.unclosedReplies.length===state.summary.bestUnresolvedCount).map(x=>x.p1Column)
  );
  assert.deepEqual(
    state.summary.fullyRoutedCandidateColumns,
    state.candidates.filter(x=>x.fullyRouted).map(x=>x.p1Column)
  );
}
assert.equal(r.compositionReady.stateA,r.states[0].summary.fullyRoutedCandidateColumns.length>0);
assert.equal(r.compositionReady.stateB,r.states[1].summary.fullyRoutedCandidateColumns.length>0);
assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('discovery evidence')));

console.log(JSON.stringify({
  pass:true,
  states:r.states.map(x=>({name:x.name,best:x.summary.bestCandidateColumns,bestUnresolvedCount:x.summary.bestUnresolvedCount,fullyRouted:x.summary.fullyRoutedCandidateColumns})),
  compositionReady:r.compositionReady
}));
