import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-rlc-proof-library-monotonicity-audit.mjs');
const library=process.argv[2];assert(library);

const raw=execFileSync(process.execPath,[script,library],{
  encoding:'utf8',
  maxBuffer:64*1024*1024,
});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.rlc_proof_library_monotonicity_audit.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.design,'RLC_PROOF_LIBRARY_MONOTONICITY_AUDIT_DESIGN_0_1.md');

assert.ok(Array.isArray(r.families));
assert.ok(r.families.length>=15);
assert.deepEqual(
  new Set(r.families.map(x=>x.id)).size,
  r.families.length,
  'family ids must be unique'
);

const required=[
  'IMMEDIATE_TERMINAL',
  'FORCED_RESPONSE_FORK',
  'REPAIR_CAPACITY',
  'LEGACY_TARGET_LAMBDA',
  'LEGACY_TARGET_THETA',
  'DISTANCE2_TARGET_SUPPORT',
  'DISTANCE1_RESOLVED_TAIL_CAPACITY',
  'TRUNCATED_TARGET_RESERVOIR',
  'RLC_RCIC',
  'CPC_GUARD_SURVIVAL',
  'BX_FINITE_RESERVOIR',
  'THREE_COLUMN_PHASE_TRANSFER',
  'THREE_PLUS_ONE_DEFERRED_SINGLETON_TAIL_DRAW',
  'RESPONSE_MATROID_CIRCUIT',
  'COMPATIBLE_COVER_PROGRESS',
  'CHOICE_ELIMINATION',
  'WDL_INTERVAL_PREDECESSOR',
  'RESIDUAL_ANTICHAIN_DOMINANCE',
  'POST_RESPONSE_PREDECESSOR_TRANSPORT',
  'RECURSIVE_CONSEQUENCE_Q_CONVERGENCE',
  'LATENT_CONTRACT_FIXED_FAMILY',
  'THREE_COORDINATE_DECODER_REJECTED',
];
for(const id of required)assert.ok(r.families.some(x=>x.id===id),'missing family '+id);

const allowed=new Set([
  'THEOREM_FAMILY_ROUTABLE',
  'THEOREM_FAMILY_ADAPTER_MISSING',
  'EXACT_STATE_ONLY',
  'OBSOLETE_OR_REJECTED',
  'SUPERSEDED_BY_ROUTABLE',
  'CANDIDATE_NOT_QUALIFIED',
]);
for(const f of r.families)assert.ok(allowed.has(f.disposition),'bad disposition '+f.id);

assert.equal(r.summary.unclassifiedCount,0);
assert.equal(r.summary.adapterMissingCount,0);
assert.equal(r.summary.invalidSupersessionCount,0);
assert.ok(r.summary.routableFamilyCount>0);

for(const f of r.families.filter(x=>x.qualification==='QUALIFIED_REUSABLE')){
  assert.ok(
    f.disposition==='THEOREM_FAMILY_ROUTABLE'||f.disposition==='SUPERSEDED_BY_ROUTABLE',
    'qualified reusable family not monotone-routable: '+f.id
  );
}

assert.deepEqual(
  r.legacyTargetAdapter.engineKinds,
  ['LAMBDA','THETA','DISTANCE2_TARGET_SUPPORT','DISTANCE1_RESOLVED_TAIL_CAPACITY']
);
assert.equal(r.legacyTargetAdapter.usesExactStateIdentity,true);
assert.equal(r.legacyTargetAdapter.supportOnlyIdentity,false);
assert.equal(r.legacyTargetAdapter.hardCodedStateIds,false);

assert.equal(r.rank20Regression.sequence,'44444156666623222242');
assert.equal(r.rank20Regression.rank,20);
assert.deepEqual(r.rank20Regression.support,[1,6,1,6,1,5,0]);
assert.equal(r.rank20Regression.legacyRepairClosedCount,0);
assert.equal(r.rank20Regression.legacyRepairResourceFailureCount,0);
assert.equal(r.rank20Regression.legacyFamilyMatrixClosedCount,0);
assert.equal(r.rank20Regression.legacyFamilyMatrixResourceFailureCount,0);

assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);

console.log(JSON.stringify({
  pass:true,
  families:r.families.length,
  summary:r.summary,
  legacyTargetAdapter:r.legacyTargetAdapter,
  rank20Regression:r.rank20Regression,
}));
