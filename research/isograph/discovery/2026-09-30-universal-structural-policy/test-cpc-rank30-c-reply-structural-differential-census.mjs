import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank30-c-reply-structural-differential-census.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:96*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank30_c_reply_structural_differential_census.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.design,'CPC_RANK30_C_REPLY_STRUCTURAL_DIFFERENTIAL_CENSUS_DESIGN_0_1.md');
assert.equal(r.sourceEvidence,'CPC_RANK28_D1_PARENT_MONOTONE_NONWIN_AUDIT_0_1.json');
assert.equal(r.states.length,5);

const expected=new Map([
  ['1e8601e86599ef24','UNKNOWN'],
  ['5b07a7c903c1f4bf','P0_WIN'],
  ['3ff97b02970a6bb5','UNKNOWN'],
  ['373c44db3354a385','UNKNOWN'],
  ['ed03539228914a31','UNKNOWN'],
]);
for(const s of r.states){
  assert.equal(s.exactBridge.pass,true);
  assert.equal(s.rank,30);
  assert.equal(s.sourceDisposition,expected.get(s.exactQClass));
  assert.equal(s.eventProduct.P.mover,'P0');
  assert.ok(Array.isArray(s.eventProduct.R.P0));
  assert.ok(Array.isArray(s.eventProduct.R.P1));
  assert.ok(Array.isArray(s.eventProduct.C.singletonTargets.P0));
  assert.ok(Array.isArray(s.eventProduct.C.enabledSingletons.P1));
  assert.ok(Array.isArray(s.actions));
  assert.ok(s.actions.length>0);
  for(const a of s.actions){
    assert.ok(Number.isInteger(a.column));
    assert.ok(Array.isArray(a.targetReservoirAttempts));
    for(const t of a.targetReservoirAttempts){
      assert.ok([
        'TARGET_ABSENT',
        'TARGET_WRONG_PROJECTED_OWNER',
        'PLAYABLE_DEFENDER_SINGLETON_EXISTS',
        'TARGET_NOT_AHEAD_OF_SUPPORT',
        'TRUNCATED_CAPACITY_PARITY_INVALID',
        'ODD_COLUMN_PAIRING_UNAVAILABLE',
        'DEFENDER_RESIDUAL_UNCOVERED',
        'EXACT_VALIDATION_FAILED',
        'ACCEPTED',
      ].includes(t.stage));
      if(t.stage==='DEFENDER_RESIDUAL_UNCOVERED')assert.ok(t.smallestUncoveredResidual);
      if(t.stage==='ACCEPTED')assert.equal(t.validation.pass,true);
    }
  }
}

const positive=r.states.find(x=>x.exactQClass==='5b07a7c903c1f4bf');
assert.ok(positive);
assert.equal(positive.reproducedQualifiedPositive,true);
assert.ok(positive.actions.some(a=>a.targetReservoirAttempts.some(t=>t.stage==='ACCEPTED')));

for(const q of ['1e8601e86599ef24','3ff97b02970a6bb5','373c44db3354a385','ed03539228914a31']){
  const s=r.states.find(x=>x.exactQClass===q);assert.ok(s);
  assert.equal(s.reproducedQualifiedPositive,false);
}

assert.ok(Array.isArray(r.differential.identicalAcrossAll));
assert.ok(Array.isArray(r.differential.unresolvedSharedDifferentFromPositive));
assert.ok(Array.isArray(r.differential.unresolvedSplits));
assert.ok(r.differential.q5bVsQ1e);
assert.ok(Array.isArray(r.differential.q5bVsQ1e.differences));
assert.ok(r.differential.q5bVsQ1e.differences.length>0);
assert.ok(Array.isArray(r.differential.onePlyExactQConvergences));
assert.equal(r.summary.resourceFailureCount,0);

assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

console.log(JSON.stringify({
  pass:true,
  summary:r.summary,
  separator:r.differential.q5bVsQ1e,
  unresolvedShared:r.differential.unresolvedSharedDifferentFromPositive,
}));
