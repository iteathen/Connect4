import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-rank32-cpc-owner-kill-reservoir-completion-probe.mjs');
const library=process.argv[2];
assert(library);

const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_rank32_cpc_owner_kill_reservoir_completion_probe.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.targetReservoirModified,false);
assert.equal(r.bsfpModified,false);

assert.equal(r.summary.sourceNoCompleteTemplateAttemptCount,39);
assert.equal(r.summary.sourceUncoveredResidualOccurrenceCount,97);
assert.equal(r.summary.ownerIncompatibleResidualOccurrenceCount,97);
assert.equal(r.summary.ownerIncompatibleResidualFraction,1);
assert.equal(r.summary.ownerKillEligibilityCounterexampleCount,0);

assert.equal(r.attempts.length,39);
for(const a of r.attempts){
  assert.equal(typeof a.exactQClass,'string');
  assert.equal(typeof a.setupColumn,'number');
  assert.ok(Array.isArray(a.candidates));
  for(const c of a.candidates){
    if(c.ownerKillEligible){
      assert.ok(c.uncoveredResiduals.length>0);
      assert.ok(c.uncoveredResiduals.every(x=>x.ownerIncompatible));
    }
    if(c.accept){
      assert.equal(c.ownerKillEligible,true);
      assert.equal(c.validation?.pass,true);
    }
  }
}

assert.ok(Number.isInteger(r.summary.maximumCoverageCandidateCount));
assert.ok(Number.isInteger(r.summary.ownerKillEligibleCandidateCount));
assert.ok(Number.isInteger(r.summary.validatedCandidateCount));
assert.ok(Number.isInteger(r.summary.acceptedAttemptCount));
assert.ok(Number.isInteger(r.summary.newlyClosedQClassCount));
assert.ok(Number.isInteger(r.summary.coveredIncomingTransitionCount));
assert.ok(r.summary.coveredIncomingTransitionCount<=91);

assert.ok(Array.isArray(r.newlyClosedQClasses));
assert.equal(r.newlyClosedQClasses.length,r.summary.newlyClosedQClassCount);
assert.ok(r.boundary.some(x=>x.includes('does not authorize')));
assert.ok(r.conclusion.every(x=>typeof x==='string'));

console.log(JSON.stringify({
  pass:true,
  sourceAttempts:r.summary.sourceNoCompleteTemplateAttemptCount,
  ownerIncompatible:r.summary.ownerIncompatibleResidualOccurrenceCount,
  maximumCoverageCandidates:r.summary.maximumCoverageCandidateCount,
  eligibleCandidates:r.summary.ownerKillEligibleCandidateCount,
  validatedCandidates:r.summary.validatedCandidateCount,
  acceptedAttempts:r.summary.acceptedAttemptCount,
  newlyClosedQClasses:r.summary.newlyClosedQClassCount,
  coveredIncomingTransitions:r.summary.coveredIncomingTransitionCount
}));
