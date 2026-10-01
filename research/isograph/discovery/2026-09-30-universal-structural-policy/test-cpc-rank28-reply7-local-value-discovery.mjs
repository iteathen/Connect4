import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const library=process.argv[2];
assert(library);
const dir=dirname(fileURLToPath(import.meta.url));
const runner=resolve(dir,'run-cpc-rank28-reply7-local-value-discovery.mjs');
const raw=execFileSync(process.execPath,[runner,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.rba_rank28_reply7_local_value_discovery.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,true);
assert.equal(r.proofPremiseAllowed,false);
assert.equal(r.state.rank,28);
assert.equal(r.state.mover,1);
assert.deepEqual(r.state.support,[2,6,3,6,4,5,2]);
assert.deepEqual(r.discovery.moves.map(x=>x.column),[1,3,5,6,7]);
assert.ok([1,2,3].includes(r.discovery.value));
assert.ok(r.discovery.bestMoves.length>=1);
assert.deepEqual(
  r.discovery.bestMoves,
  r.discovery.moves.filter(x=>x.value===r.discovery.value).map(x=>x.column)
);
assert.equal(r.bestMoveBranches.length,r.discovery.bestMoves.length);
for(const branch of r.bestMoveBranches){
  assert.ok(r.discovery.bestMoves.includes(branch.p1Column));
  assert.equal(branch.rank,29);
  assert.equal(branch.mover,2);
  assert.ok(Array.isArray(branch.defenderMoves));
  assert.ok(branch.defenderMoves.length>=1);
  assert.ok(branch.bestDefenderMoves.length>=1);
  assert.deepEqual(
    branch.bestDefenderMoves,
    branch.defenderMoves.filter(x=>x.value===branch.value).map(x=>x.column)
  );
  assert.ok(branch.structuralProfile);
}
assert.ok(r.boundary.some(x=>x.includes('forbidden as a structural theorem premise')));
console.log(JSON.stringify({
  pass:true,
  value:r.discovery.value,
  bestMoves:r.discovery.bestMoves,
  moves:r.discovery.moves,
  branches:r.bestMoveBranches.map(x=>({p1:x.p1Column,value:x.value,bestDefender:x.bestDefenderMoves}))
}));
