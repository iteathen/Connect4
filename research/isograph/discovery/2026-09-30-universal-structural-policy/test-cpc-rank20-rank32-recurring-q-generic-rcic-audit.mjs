import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-rank32-recurring-q-generic-rcic-audit.mjs');
const library=process.argv[2];
assert(library);

const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:128*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_rank32_recurring_q_generic_rcic_audit.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

assert.equal(r.repeatedQClassCount,34);
assert.equal(r.rows.length,34);
for(const row of r.rows){
  assert.equal(typeof row.exactQClass,'string');
  assert.ok(row.incomingTransitionCount>=2);
  assert.ok(Array.isArray(row.incomingSequences));
  assert.equal(row.incomingSequences.length,row.incomingTransitionCount);
  assert.equal(typeof row.semanticReplayAgreement,'boolean');
  assert.equal(typeof row.jsExactRbaBridgePass,'boolean');
  assert.ok(Array.isArray(row.representatives));
  assert.ok(row.representatives.length>=1);
  assert.equal(typeof row.closedByExistingGrammar,'boolean');
  assert.ok(Array.isArray(row.acceptedRoutes));
  assert.ok(Array.isArray(row.routeKinds));
  if(row.closedByExistingGrammar)assert.ok(row.acceptedRoutes.length>0);
}
assert.equal(
  r.summary.bridgePassCount+r.summary.bridgeFailCount,
  34
);
assert.equal(
  r.summary.closedClassCount+r.summary.unresolvedClassCount,
  34
);
assert.equal(
  r.summary.coveredIncomingTransitionCount+r.summary.uncoveredIncomingTransitionCount,
  r.summary.totalIncomingTransitionCount
);
assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('Production CPC')));

console.log(JSON.stringify({pass:true,summary:r.summary}));
