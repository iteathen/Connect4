#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=process.cwd();
const dir=path.join(root,'research','isograph','optimization','2026-09-27-isomax-core020-implicit-closure');
const readJson=name=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
const blob=relative=>execFileSync('git',['hash-object',relative],{cwd:root,encoding:'utf8'}).trim();

const expectedPins=new Map([
  ['research/isograph/optimization/ISOMAX_CORE020_PRIMITIVE_SEMANTICS_0_1.md','61aad6a33833b0bbf7befa51078eeec6c8eff16c'],
  ['research/isograph/optimization/ISOMAX_CORE020_RAW_DOMAIN_0_1.isg','e2a3da5e806ee2dbd5424a17ed0b305a166c41a6'],
  ['research/isograph/optimization/ISOMAX_CORE020_NATURAL_NUMERALS_0_1.isg','33478c141519c645aecee4df26586068e12d638c'],
  ['research/isograph/optimization/ISOMAX_CORE020_PRIMITIVE_GAME_0_1.isg','7597f687f2df302acec35d950402d63b18646e38'],
  ['research/isograph/optimization/ISOMAX_CORE020_PRIMITIVE_ORDERING_0_1.isg','fe9affc47400697bca81dfc13984395f9078b446'],
  ['research/isograph/optimization/ISOMAX_CORE020_PRIMITIVE_EXECUTION_0_1.isg','7d4bc3358fc42ae761d4c54f60beb7c8750fa82c'],
  ['research/isograph/optimization/core020-support/PRIMITIVE_NATURAL_ARITHMETIC_0_5_PIN.isg','fde4915b3a056430e0cb7a3a327e26abc1c7b09b'],
  ['research/isograph/optimization/core020-support/PRIMITIVE_DATA_CONSTRUCTORS_0_5_PIN.isg','c0479ac1de1a1c8ff5737221133601618b1a56cf'],
]);
for(const [relative,expected] of expectedPins){
  assert.ok(fs.existsSync(path.join(root,relative)),'missing frozen input '+relative);
  assert.equal(blob(relative),expected,'frozen input changed '+relative);
}

const a0=readJson('A0_EXPLICIT_ASSERTIONS_0_1.json');
assert.equal(a0.status,'FROZEN_EXPLICIT_BASE');
assert.equal(a0.entries.length,70);
assert.equal(new Set(a0.entries.map(e=>e.id)).size,70);
const explicit=new Set(a0.entries.map(e=>e.id));

const rounds=[];
for(let n=1;n<=7;n++) rounds.push(readJson(`ROUND_0${n}_0_1.json`));
const all=new Map(), rejected=new Set();
for(const round of rounds){
  for(const e of round.entries){
    assert.ok(!all.has(e.id),'duplicate IA id '+e.id);
    all.set(e.id,e);
    if(!e.admitted) rejected.add(e.id);
  }
}
assert.equal(all.size,238,'unexpected generated IA count');
assert.deepEqual([...rejected].sort(),['IA-I136','IA-I137']);
const admitted=new Map([...all].filter(([,e])=>e.admitted));
assert.equal(admitted.size,236,'unexpected admitted IA count');

const expectedRoundAdmitted=new Map([[1,50],[2,45],[3,43],[4,40],[5,30],[6,20],[7,8]]);
for(const round of rounds){
  const count=round.entries.filter(e=>e.admitted).length;
  assert.equal(count,expectedRoundAdmitted.get(round.round),'admitted count drift round '+round.round);
  assert.equal(round.new_assertions,count,'new_assertions field drift round '+round.round);
}

const missing=[],rejectedDeps=[];
for(const e of admitted.values()){
  assert.equal(e.support_mode,'EXACT','non-exact admitted IA '+e.id);
  for(const p of e.premises??[]){
    if(!explicit.has(p)&&!all.has(p)) missing.push([e.id,p]);
    if(rejected.has(p)) rejectedDeps.push([e.id,p]);
  }
}
assert.deepEqual(missing,[],'missing IA premises');
assert.deepEqual(rejectedDeps,[],'admitted assertion depends on rejected IA');

const memo=new Map(),visiting=new Set();
function depth(id){
  if(explicit.has(id))return 0;
  if(memo.has(id))return memo.get(id);
  assert.ok(admitted.has(id),'depth requested for unavailable IA '+id);
  assert.ok(!visiting.has(id),'cycle at '+id);
  visiting.add(id);
  const e=admitted.get(id);
  let d=1;
  for(const p of e.premises??[]) d=Math.max(d,1+depth(p));
  visiting.delete(id);
  memo.set(id,d);
  return d;
}
for(const [id,e] of admitted){
  const d=depth(id);
  assert.equal(e.normalized_depth,d,'normalized depth drift '+id);
}
assert.equal(Math.max(...memo.values()),18,'maximum IA depth changed');

const normalizedBodies=new Map();
for(const e of admitted.values()){
  const key=e.body.trim().replace(/\s+/g,' ').toLowerCase();
  assert.ok(!normalizedBodies.has(key),`duplicate normalized IA body: ${normalizedBodies.get(key)} / ${e.id}`);
  normalizedBodies.set(key,e.id);
}

const rejected136=all.get('IA-I136'),rejected137=all.get('IA-I137');
for(const e of [rejected136,rejected137]){
  assert.equal(e.admitted,false);
  assert.equal(e.disposition,'REJECTED_AFTER_NEI_0_4_REEVALUATION');
}
const neiReview=fs.readFileSync(path.join(dir,'NEI_DP_REEVALUATION_0_1.md'),'utf8');
assert.ok(neiReview.includes('GENERATED_IA_IDENTITY_AUTHORITY_AMPLIFICATION_CONFIRMED'));
assert.ok(neiReview.includes('STRUCTURE_ESTABLISHED'));

const residuals=readJson('RESIDUAL_CANDIDATES_0_1.json');
assert.equal(residuals.status,'PRESERVED_NOT_ADMITTED');
assert.equal(residuals.entries.length,13);
const residualIds=new Set(residuals.entries.map(e=>e.id));
for(const id of ['RES-001','RES-003','RES-004','RES-006','RES-007','RES-008','RES-010','RES-012'])
  assert.ok(residualIds.has(id),'missing required residual '+id);

const fixed=readJson('ROUND_08_FIXED_POINT_0_1.json');
assert.equal(fixed.status,'OPERATIONAL_FIXED_POINT');
assert.equal(fixed.new_assertions,0);
assert.equal(fixed.support_refinements,0);
assert.equal(fixed.input.explicit_assertions,70);
assert.equal(fixed.input.admitted_implicit_assertions,236);
assert.equal(fixed.input.rejected_generated_candidates,2);
assert.equal(fixed.input.residual_candidates,13);
assert.equal(fixed.input.max_normalized_dependency_depth,18);
assert.equal(fixed.completeness_claim,'OPERATIONAL_ONLY__NOT_UNIVERSAL_THEOREM_PROVING_COMPLETENESS');
for(const family of ['L','D','R','A','C','N','O']){
  assert.equal(fixed.family_results[family].new_assertions,0,'fixed-point family not empty '+family);
}
assert.equal(fixed.nei_dp_recheck.new_exact_ia,0);
assert.equal(fixed.nei_dp_recheck.new_support_refinement,0);

console.log(JSON.stringify({
  status:'PASS',
  explicitAssertions:70,
  generatedCandidates:238,
  admittedImplicitAssertions:236,
  rejectedGeneratedCandidates:[...rejected],
  residualCandidates:residuals.entries.length,
  maxNormalizedDepth:Math.max(...memo.values()),
  missingPremises:0,
  rejectedPremiseDependencies:0,
  duplicateNormalizedBodies:0,
  fixedPointRound:8,
  fixedPointNewAssertions:0,
  fixedPointSupportRefinements:0,
  qualificationClaim:'operational fixed point only'
},null,2));
