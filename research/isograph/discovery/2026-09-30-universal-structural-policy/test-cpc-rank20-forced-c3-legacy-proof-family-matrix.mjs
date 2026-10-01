import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-forced-c3-legacy-proof-family-matrix.mjs');
const raw=execFileSync(process.execPath,[script],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);
assert.equal(r.schema,'connect4.cpc_rank20_forced_c3_legacy_proof_family_matrix.v1');
assert.equal(r.states.length,3);
assert.deepEqual(r.states.map(x=>x.id),['SECOND_D1_C5_CONTRACTION','SECOND_D6_C5_CONTRACTION','SECOND_D7_C5_CONTRACTION']);
for(const s of r.states){
  assert.ok(Array.isArray(s.engines));
  assert.deepEqual(s.engines.map(x=>x.engine),['LAMBDA','THETA','DISTANCE2_TARGET_SUPPORT','DISTANCE1_RESOLVED_TAIL_CAPACITY']);
  assert.ok(s.engines.every(x=>typeof x.applicable==='boolean'));
  assert.ok(s.engines.every(x=>!x.applicable||typeof x.proved==='boolean'));
  assert.equal(typeof s.legacyUnionClosed,'boolean');
}
assert.equal(r.summary.stateCount,3);
assert.ok(Array.isArray(r.summary.legacyUnionClosedIds));
assert.ok(Number.isInteger(r.summary.resourceFailureCount));
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);
console.log(JSON.stringify({pass:true,summary:r.summary}));
