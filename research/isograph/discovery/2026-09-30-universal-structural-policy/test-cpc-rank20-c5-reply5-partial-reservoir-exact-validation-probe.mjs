import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-c5-reply5-partial-reservoir-exact-validation-probe.mjs');
const library=process.argv[2];
assert(library);

const raw=execFileSync(process.execPath,[script,library],{
  encoding:'utf8',
  maxBuffer:64*1024*1024
});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_c5_reply5_partial_reservoir_exact_validation_probe.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.targetReservoirModified,false);
assert.equal(r.bsfpModified,false);

assert.equal(r.states.length,5);
let totalCandidates=0;
for(const s of r.states){
  assert.ok(s.candidates.length>0);
  totalCandidates+=s.candidates.length;
  for(const c of s.candidates){
    assert.ok(c.syntacticallyUncoveredResiduals.length>0);
    assert.equal(c.uncoveredStillUncovered,true);
    assert.equal(typeof c.validation.pass,'boolean');
    assert.ok(c.validation.defenderNodes>=1);
    assert.ok(Array.isArray(c.validation.failures));
  }
  assert.equal(
    s.dynamicPassCount,
    s.candidates.filter(x=>x.validation.pass).length
  );
}
assert.equal(r.summary.candidateCount,totalCandidates);
assert.equal(
  r.summary.dynamicPassCount,
  r.states.reduce((n,s)=>n+s.dynamicPassCount,0)
);
assert.deepEqual(
  r.summary.passingCandidates,
  r.states.flatMap(s=>s.candidates.filter(c=>c.validation.pass).map(c=>s.id+':'+c.signature))
);
assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('discovery evidence')));

console.log(JSON.stringify({
  pass:true,
  candidateCount:r.summary.candidateCount,
  dynamicPassCount:r.summary.dynamicPassCount,
  passingCandidates:r.summary.passingCandidates,
  failureKinds:r.summary.failureKindHistogram
}));
