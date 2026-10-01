import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-c5-reply5-hazardous-response-predecessor-diagnostic.mjs');
const library=process.argv[2];
assert(library);

const raw=execFileSync(process.execPath,[script,library],{
  encoding:'utf8',
  maxBuffer:64*1024*1024
});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_c5_reply5_hazardous_response_predecessor_diagnostic.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.targetReservoirModified,false);
assert.equal(r.bsfpModified,false);

assert.equal(r.candidates.length,13);
for(const x of r.candidates){
  assert.equal(x.dynamicValidationPassed,false);
  assert(x.firstFailure);
  assert.equal(x.firstFailure.kind,'defender-terminal');
  assert.ok(x.firstFailure.terminalCell.column===3);
  assert(x.firstFailure.precedingP1Response);
  assert(x.firstFailure.preResponseState);
  assert.equal(
    typeof x.firstFailure.precedingP1Response.immediatelyBelowTerminal,
    'boolean'
  );
  assert.equal(typeof x.firstFailure.cpcReroutePromising,'boolean');
  assert.ok(Array.isArray(x.firstFailure.preResponseState.legalP1Columns));
  assert.ok(Array.isArray(x.firstFailure.preResponseState.immediateP1WinningColumns));
  assert.ok(x.firstFailure.preResponseState.cpc);
}
assert.equal(
  r.summary.cpcReroutePromisingCount,
  r.candidates.filter(x=>x.firstFailure.cpcReroutePromising).length
);
assert.deepEqual(
  r.summary.cpcReroutePromisingIds,
  r.candidates
    .filter(x=>x.firstFailure.cpcReroutePromising)
    .map(x=>x.id+':'+x.signature)
);
assert.ok(Array.isArray(r.recurrence));
assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('discovery evidence')));

console.log(JSON.stringify({
  pass:true,
  candidateCount:r.candidates.length,
  cpcReroutePromisingCount:r.summary.cpcReroutePromisingCount,
  promising:r.summary.cpcReroutePromisingIds,
  recurrence:r.recurrence
}));
