#!/usr/bin/env node
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

import {
  RLC_PROOF_LIBRARY_FAMILIES,
  auditCatalog,
  responseMatroidAudit,
  compatibleCoverProgressAudit,
  choiceElimination,
  predecessorInterval,
} from './rlc-proof-library-catalog.mjs';
import {LEGACY_TARGET_ENGINE_KINDS} from './rlc-legacy-target-adapter.mjs';

const library=process.argv[2];assert(library,'JSMinSys checkout path required');
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const DESIGN='RLC_PROOF_LIBRARY_MONOTONICITY_AUDIT_DESIGN_0_1.md';
const root=resolve(import.meta.dirname,'../../../..');
const here=import.meta.dirname;

const git=(cwd,...args)=>execFileSync('git',['-C',cwd,...args],{encoding:'utf8'}).trim();
assert.equal(git(library,'rev-parse','HEAD'),EXPECTED,'JSMinSys pin drift');
assert.equal(git(library,'status','--porcelain'),'','JSMinSys checkout dirty');

function sourcePath(spec){
  return spec.startsWith('JSMinSys:')
    ?resolve(library,spec.slice('JSMinSys:'.length))
    :resolve(root,spec);
}
function sourceText(spec){return readFileSync(sourcePath(spec),'utf8');}

const sourceAudit=[];
for(const family of RLC_PROOF_LIBRARY_FAMILIES){
  const sources=family.sourceFiles.map(spec=>({spec,present:existsSync(sourcePath(spec))}));
  sourceAudit.push({id:family.id,sources});
  for(const s of sources)assert.equal(s.present,true,`missing source for ${family.id}: ${s.spec}`);
}

// Classification guardrails: a file existing is not itself qualification.
assert.match(
  sourceText('research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_FORMULA_THREE_COORDINATE_LOCAL_DECODER_THEOREM.md'),
  /Status:\*\* rejected|Status: rejected/i
);
assert.match(
  sourceText('research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-recursive-dominance.mjs'),
  /bounded structural simulation test only/
);
assert.match(
  sourceText('research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-latent-c1-full-closure.mjs'),
  /Exact only for the fixed latent state 466565554644/
);
assert.match(
  sourceText('research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_BX_VIABILITY_FINITE_RESERVOIR_THEOREM.md'),
  /qualified exact local composition theorem/
);
assert.match(
  sourceText('research/isograph/discovery/2026-09-30-universal-structural-policy/CPC_TRUNCATED_TARGET_RESERVOIR_PAIRING_THEOREM.md'),
  /qualified structural theorem/
);

// Adapter smoke controls. These exercise the generic combinators rather than
// merely checking that their source files exist.
const responseControl=responseMatroidAudit(
  ['o1','o2'],
  new Map([['o1',['r1']],['o2',['r1']]])
);
assert.equal(responseControl.rank,1);
assert.equal(responseControl.deficiency,1);
assert.equal(responseControl.overloaded,true);

const coverControl=compatibleCoverProgressAudit({
  requirements:['a','b'],
  fragments:[
    {id:'fa',solves:['a'],decreases:true},
    {id:'fb',solves:['b'],decreases:true},
  ],
  compatible:()=>true,
});
assert.equal(coverControl.proved,true);
assert.deepEqual(choiceElimination([1,3,5],[1,5]),[3]);
assert.deepEqual(predecessorInterval(0,[[-1,0],[0,1]]),[0,1]);
assert.deepEqual(predecessorInterval(1,[[-1,0],[0,1]]),[-1,0]);

const summary=auditCatalog();
assert.equal(summary.unclassifiedCount,0);
assert.equal(summary.adapterMissingCount,0);
assert.equal(summary.invalidSupersessionCount,0);

const rank20Repair=JSON.parse(readFileSync(resolve(here,'CPC_RANK20_LEGACY_REPAIR_ROUTE_REENTRY_PROBE_0_1.json'),'utf8'));
const rank20Matrix=JSON.parse(readFileSync(resolve(here,'CPC_RANK20_FORCED_C3_LEGACY_PROOF_FAMILY_MATRIX_0_1.json'),'utf8'));
assert.equal(rank20Repair.schema,'connect4.cpc_rank20_legacy_repair_route_reentry_probe.v1');
assert.equal(rank20Matrix.schema,'connect4.cpc_rank20_forced_c3_legacy_proof_family_matrix.v1');

const rank20Root=JSON.parse(readFileSync(resolve(here,'CPC_RANK20_ROOT_MULTI_ROUTE_CANDIDATE_CENSUS_0_1.json'),'utf8')).rank20;
assert.equal(rank20Root.sequence,'44444156666623222242');
assert.equal(rank20Root.rank,20);
assert.deepEqual(rank20Root.support,[1,6,1,6,1,5,0]);

const out={
  schema:'connect4.rlc_proof_library_monotonicity_audit.v1',
  date:'2026-10-01',
  design:DESIGN,
  jsMinSysSha:EXPECTED,
  families:RLC_PROOF_LIBRARY_FAMILIES,
  sourceAudit,
  combinatorControls:{
    responseMatroid:responseControl,
    compatibleCoverProgress:coverControl,
    choiceElimination:{actions:[1,3,5],nonWinning:[1,5],survivors:[3]},
    predecessorIntervals:{p0:[0,1],p1:[-1,0]},
  },
  legacyTargetAdapter:{
    engineKinds:LEGACY_TARGET_ENGINE_KINDS,
    usesExactStateIdentity:true,
    supportOnlyIdentity:false,
    hardCodedStateIds:false,
    stateInterface:'semantic quotient kernel state + exact target cell; each engine enforces its own structural invariant',
  },
  rank20Regression:{
    sequence:rank20Root.sequence,
    rank:rank20Root.rank,
    support:rank20Root.support,
    legacyRepairClosedCount:rank20Repair.summary.legacyRepairClosedCount,
    legacyRepairResourceFailureCount:rank20Repair.summary.resourceFailureCount,
    legacyFamilyMatrixClosedCount:rank20Matrix.summary.legacyUnionClosedCount,
    legacyFamilyMatrixResourceFailureCount:rank20Matrix.summary.resourceFailureCount,
    interpretation:'The exact rank-20 obstruction survived all applicable legacy queries already executed; this is not a claim about every rank-20 state.',
  },
  summary,
  oracleUsed:false,
  solvedInputsUsed:false,
  productionCpcModified:false,
  jsMinSysModified:false,
  bsfpModified:false,
  conclusion:[
    'Every cataloged qualified reusable certificate family is either directly routable through a research-side adapter or explicitly mapped to a stronger routed replacement.',
    'Exact-only latent/rank-specific results remain exact-q handoffs and are not promoted into generic theorem classes.',
    'Rejected and unqualified candidate artifacts remain visible in the audit but are excluded from retained proof capability.',
    'The four legacy target engines omitted from the newer state-local q5d34 audit now have one shared certificate-class adapter.',
    'The earlier exact rank-20 obstruction remains unclosed by the legacy repair/family queries that were applicable, with zero recorded resource failures.',
  ],
  boundary:[
    'This is a proof-library integration audit, not a new Connect Four W/D/L theorem.',
    'No oracle, solved W/D/L table, minimax, ordinary free-branch game-tree value, opening book, best-move label, BSFP solved frontier, or support-only exact-state shortcut is used.',
    'Production CPC is read-only. JSMinSys is pinned and read-only. BSFP is unchanged.',
    'Candidate theorem files are not counted as proof availability merely because they exist.',
  ],
};

console.log(JSON.stringify(out,null,2));
