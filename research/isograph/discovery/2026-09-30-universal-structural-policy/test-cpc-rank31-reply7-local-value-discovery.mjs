import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const library=process.argv[2];
assert(library);
const dir=dirname(fileURLToPath(import.meta.url));
const runner=resolve(dir,'run-cpc-rank31-reply7-local-value-discovery.mjs');
const raw=execFileSync(process.execPath,[runner,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.rba_rank31_reply7_local_value_discovery.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,true);
assert.equal(r.proofPremiseAllowed,false);
assert.equal(r.state.rank,31);
assert.equal(r.state.mover,2);
assert.deepEqual(r.state.support,[2,6,3,6,5,6,3]);
assert.deepEqual(r.discovery.moves.map(x=>x.column),[1,3,5,7]);
assert.ok([1,2,3].includes(r.discovery.value));
assert.ok(r.discovery.bestMoves.length>=1);

for(const branch of r.branches){
  assert.ok([1,3,5,7].includes(branch.defenderColumn));
  assert.ok([1,2,3].includes(branch.value));
  assert.equal(branch.rank,32);
  assert.equal(branch.mover,1);
  assert.ok(Array.isArray(branch.p1Moves));
  assert.ok(branch.p1Moves.length>=1);
  assert.ok(branch.bestP1Moves.length>=1);
  assert.deepEqual(
    branch.bestP1Moves,
    branch.p1Moves.filter(x=>x.value===branch.value).map(x=>x.column)
  );
  for(const row of branch.structurallyProfiledBestResponses){
    assert.ok(branch.bestP1Moves.includes(row.column));
    assert.equal(typeof row.terminal,'number');
    assert.ok(Array.isArray(row.p1Minimal));
    assert.ok(Array.isArray(row.p2Minimal));
    assert.ok(Array.isArray(row.p1Aligned));
    assert.ok(Array.isArray(row.p2Aligned));
    assert.ok(Array.isArray(row.p1Singletons));
    assert.ok(Array.isArray(row.p2Singletons));
    assert.ok(Array.isArray(row.exactQualifiedRootMatches));
  }
}

assert.ok(r.boundary.some(x=>x.includes('forbidden as a structural theorem premise')));
console.log(JSON.stringify({
  pass:true,
  value:r.discovery.value,
  bestDefenderMoves:r.discovery.bestMoves,
  branchValues:r.branches.map(x=>({defender:x.defenderColumn,value:x.value,bestP1:x.bestP1Moves})),
  nodes:r.discovery.nodes,
  memoSize:r.discovery.memoSize
}));
