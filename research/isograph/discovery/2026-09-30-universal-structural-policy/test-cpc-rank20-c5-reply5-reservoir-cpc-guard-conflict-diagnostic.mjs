import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-c5-reply5-reservoir-cpc-guard-conflict-diagnostic.mjs');
const library=process.argv[2];
assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_c5_reply5_reservoir_cpc_guard_conflict_diagnostic.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.targetReservoirModified,false);
assert.equal(r.bsfpModified,false);
assert.equal(r.rerouteExecuted,false);
assert.equal(r.candidates.length,13);
assert.ok(r.candidates.every(x=>x.firstFailureKind==='defender-terminal'));
assert.ok(r.candidates.every(x=>x.responseDecisions.length>0));
assert.ok(r.candidates.every(x=>Number.isInteger(x.firstCpcExactP1LossDecisionIndex)));
assert.ok(r.candidates.every(x=>x.firstCpcExactP1LossDecisionIndex>=0));
assert.ok(r.candidates.every(x=>x.responseDecisions.some(d=>d.agreedExactP1Loss)));
assert.ok(r.candidates.every(x=>x.responseDecisions.every(d=>[
  'CPC_GUARD_CONFLICT','CPC_GUARD_MATCH','CPC_EXACT','CPC_BOUND','CPC_NONE'
].includes(d.classification))));
assert.equal(r.summary.candidateCount,13);
assert.ok(Number.isInteger(r.summary.guardConflictCandidateCount));
assert.ok(Number.isInteger(r.summary.guardReroutePromisingCount));
assert.ok(Array.isArray(r.summary.guardReroutePromisingIds));
assert.ok(r.boundary.some(x=>x.includes('Production CPC')));

console.log(JSON.stringify({
  pass:true,
  candidateCount:r.summary.candidateCount,
  guardConflictCandidateCount:r.summary.guardConflictCandidateCount,
  guardReroutePromisingCount:r.summary.guardReroutePromisingCount,
  promisingIds:r.summary.guardReroutePromisingIds
}));
