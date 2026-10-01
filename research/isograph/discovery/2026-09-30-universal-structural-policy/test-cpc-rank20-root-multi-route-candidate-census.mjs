import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-root-multi-route-candidate-census.mjs');
const library=process.argv[2];
assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_root_multi_route_candidate_census.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);
assert.equal(r.rank20.sequence,'44444156666623222242');
assert.equal(r.rank20.rank,20);
assert.equal(r.rank20.mover,1);
assert.deepEqual(r.rank20.support,[1,6,1,6,1,5,0]);

assert.deepEqual(r.legalP1Columns,[1,3,5,6,7]);
assert.equal(r.candidates.length,5);
for(const row of r.candidates){
  assert.ok(r.legalP1Columns.includes(row.p1Column));
  assert.equal(row.afterP1Rank,21);
  assert.ok(row.afterP1Terminal===0||row.afterP1Terminal===3);
  assert.ok(Array.isArray(row.legalDefenderReplies));
  assert.equal(row.closedReplyCount+row.unclosedReplies.length,row.legalDefenderReplies.length);
  assert.equal(row.fullyRouted,row.unclosedReplies.length===0);
  for(const reply of row.replies){
    assert.ok(row.legalDefenderReplies.includes(reply.defenderColumn));
    if(reply.replyTerminal===0) assert.equal(reply.replyRank,22);
    else assert.equal(reply.replyTerminal,1);
    assert.equal(reply.closed,reply.acceptedRoutes.length>0);
    if(reply.replyTerminal!==0) assert.equal(reply.closed,false);
    for(const route of reply.acceptedRoutes)assert.equal(route.accept,true);
  }
}

const c3=r.candidates.find(x=>x.p1Column===3);
assert(c3);
const c3reply3=c3.replies.find(x=>x.defenderColumn===3);
assert(c3reply3);
assert.ok(c3reply3.acceptedRoutes.some(x=>x.kind==='EXACT_RANK22_HANDOFF'&&x.knownRoot==='RANK22_ROUTED'&&x.accept));

assert.equal(r.summary.bestUnresolvedCount,Math.min(...r.candidates.map(x=>x.unclosedReplies.length)));
assert.deepEqual(
  r.summary.bestCandidateColumns,
  r.candidates.filter(x=>x.unclosedReplies.length===r.summary.bestUnresolvedCount).map(x=>x.p1Column)
);
assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('discovery evidence')));

console.log(JSON.stringify({
  pass:true,
  candidates:r.candidates.map(x=>({p1Column:x.p1Column,closed:x.closedReplyCount,unclosed:x.unclosedReplies})),
  fullyRouted:r.summary.fullyRoutedCandidateColumns,
  best:r.summary.bestCandidateColumns,
  bestUnresolvedCount:r.summary.bestUnresolvedCount
}));
