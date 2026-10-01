import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-forced-c3-target-distance-legacy-reentry-probe.mjs');
const library=process.argv[2];
assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_forced_c3_target_distance_legacy_reentry_probe.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);
assert.equal(r.states.length,3);
assert.deepEqual(r.states.map(x=>x.id),[
  'SECOND_D1_C5_CONTRACTION',
  'SECOND_D6_C5_CONTRACTION',
  'SECOND_D7_C5_CONTRACTION'
]);
assert.ok(r.states.every(x=>x.sourceCpcForcedColumn===3));
assert.ok(r.states.every(x=>x.childExactBridge.pass===true));
assert.ok(r.states.every(x=>[1,2].includes(x.targetDistance)));
assert.ok(r.states.every(x=>typeof x.proved==='boolean'));
assert.ok(r.states.every(x=>x.proofCompleted===true||x.resourceFailure!==null));
assert.equal(r.summary.stateCount,3);
assert.ok(Number.isInteger(r.summary.provedCount));
assert.ok(Array.isArray(r.summary.provedIds));
assert.ok(Array.isArray(r.summary.enclosingStateClosedIds));
assert.ok(Number.isInteger(r.summary.resourceFailureCount));
assert.ok(r.boundary.some(x=>x.includes('Production CPC')));

console.log(JSON.stringify({
  pass:true,
  provedCount:r.summary.provedCount,
  provedIds:r.summary.provedIds,
  enclosingStateClosedIds:r.summary.enclosingStateClosedIds,
  resourceFailureCount:r.summary.resourceFailureCount
}));
