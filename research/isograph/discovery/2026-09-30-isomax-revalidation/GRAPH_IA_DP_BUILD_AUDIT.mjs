// Reconcile source audits and preserve exact downstream correction targets.
// This generator checks provenance/bookkeeping; it is not a theorem prover.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../../..');
const sources=[];
function read(relative){
  const b=fs.readFileSync(path.join(root,relative));
  sources.push({path:relative,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length});
  return JSON.parse(b);
}
const prefix='research/isograph/discovery/2026-09-30-isomax-revalidation/';
const translation=read(prefix+'TRANSLATION_AUDIT_0_1.json');
const ia=read(prefix+'IA_PROCESS_AUDIT_0_1.json');
const dp=read(prefix+'DISCOVERY_PROTOCOL_AUDIT_0_1.json');
const corePrefix='research/isograph/discovery/2026-09-29-isomax-core020-ia-closure/';
const laterPrefix='research/isograph/discovery/2026-09-29-isomax-full-discovery/';
const core=read(corePrefix+'COMPLETE_IA_ADMISSION_0_2.json');
const ssc=read(laterPrefix+'DISCOVERY_SSC_0_1.json');
const qu=read(laterPrefix+'QU_LEDGER_DISCOVERY_FINAL_0_8.json');
const coreQu=read(corePrefix+'QU_LEDGER_FINAL_0_6.json');
assert.equal(translation.mechanicalChecks.nativeEdgeCount,61);
assert.equal(ia.lateCoverage.length,11);
assert.ok(ia.checks.existingIdentityChecker.exactlyMatchesSavedArtifact);
assert.ok(dp.countermodel.actualLibraryExactProvenanceSeparates);
const copies=['SC-IA044','SC-IA052','SC-IA057'].map(id=>{
  const original=core.admitted.find(a=>a.id===id);
  const copied=ssc.items.find(a=>a.source_id===id);
  assert.ok(original&&copied);assert.equal(copied.body,original.body);assert.equal(copied.closure,'CLOSED_PRIMITIVE');
  const reached=new Set([id]);
  for(let i=0;i<core.admitted.length;i++)for(const a of core.admitted)if(a.premises.some(p=>reached.has(p)))reached.add(a.id);
  return {sourceAssertion:id,originalBody:original.body,nativeRoot:original.native_id,copiedCensusId:copied.id,copiedClosure:copied.closure,iaDescendants:[...reached].filter(x=>x!==id)};
});
const qIndex=qu.entries.findIndex(x=>x.id==='QU-SC-001');
assert.ok(qIndex>=0);
const q=qu.entries[qIndex];
const badFixed=q.fixed.findIndex(x=>x.includes('target separation is necessary but source separation is not'));
assert.ok(badFixed>=0);
const parityExclusions=[
  [corePrefix+'QU_LEDGER_FINAL_0_6.json',coreQu],
  [laterPrefix+'QU_LEDGER_DISCOVERY_FINAL_0_8.json',qu]
].map(([file,ledger])=>{
  const entry=ledger.entries.findIndex(x=>x.id==='QU-SC-004');assert.ok(entry>=0);
  const item=ledger.entries[entry].excluded.findIndex(x=>x.includes('ordinary parity of the exact relative transporter is sufficient'));assert.ok(item>=0);
  return {file,id:'QU-SC-004',jsonPointer:`/entries/${entry}/excluded/${item}`,original:ledger.entries[entry].excluded[item],disposition:'Narrow to direct-parity/homomorphism laws on the fixed pair, or attach the explicit four-pair domain and collision proof before retaining arbitrary non-factorization.'};
});
const correctionRegister=[
  {id:'CORR-01',findings:['TRANSLATION-F001','TRANSLATION-F002','TRANSLATION-F003','TRANSLATION-F004','TRANSLATION-F005','TRANSLATION-F006','TRANSLATION-F007'],subject:'Late native topology',disposition:'RECONSTRUCTION_REQUIRED_BEFORE_TREATING_LINKS_AS_DERIVATIONS',correctedMeaning:'Rank parity derives mover parity only. Row/rank derivations require their joint geometry, depth, phase and multiplicity premises. T2/signature feed a qualified evaluator. OOO is the cubic correction above retained complete lower-degree P/O. Transition invariance requires the same surviving cell and role transport.',retained:'Companion guarded algebra and bounded empirical scalar evidence.',nativeRepair:'Not performed; preserve historical topology and build a separately qualified successor with explicit joint premises and typed directions.'},
  {id:'CORR-02',findings:['IA-PROCESS-F01'],subject:'SC-IA044 / SC-IA052 and copied target-necessity records',disposition:'RESTRICT_TO_FIXED_SOURCE_VALUE_GUARD',correctedMeaning:'With unchanged four edge equations and equal source phase values, the targets must have different phase values. Target-only splitting is sufficient locally. Without the equal-source restriction, source-only splitting can also repair this four-edge witness.',retained:'Native guarded formulas and the general at-least-one-endpoint-splits conclusion.',downstream:'The copied census bodies and QU-SC-001 fixed fact require the guard; do not exclude source-refinement alternatives globally.'},
  {id:'CORR-03',findings:['IA-PROCESS-F02'],subject:'SC-IA057 non-determination',disposition:'MISSING_PAIR_DOMAIN_AND_DERIVATION__REPAIR_AVAILABLE',correctedMeaning:'The fixed A/B observation rejects direct parity equality and homomorphism-only laws. It does not alone reject arbitrary functional dependence. Explicitly admitting AA,AB,BA,BB supplies equal relative parity with different phase differences and proves non-factorization on that enlarged four-pair domain.',retained:'Observed A/B inequality and the new tiny four-pair verification. This is not a claim that relative parity is globally sufficient.',downstream:'A corrected census must state the pair domain and support the two-sample collision; native 211057 currently only repeats the fixed-pair observation.'},
  {id:'CORR-04',findings:['DPAPP-01'],subject:'RS071 diagonal-sign removal',disposition:'EXACT_SYMMETRY_JUSTIFICATION_RETRACTED__CANDIDATE_RETAINED',correctedMeaning:'Simultaneous horizontal reflection is an exact symmetry. Independent D+/D- to D folding is a further forgetful map and requires its own scalar sufficiency evidence. Relative sign patterns can survive the global symmetry.',retained:'Line-catalog reflection check and bounded feature-ladder results.',downstream:'Relative-sign information remains a legitimate research candidate. The abstract countermodel is not a Connect4 scalar counterexample.'},
  {id:'CORR-05',findings:['DPAPP-02'],subject:'H-only control interpretation',disposition:'NARROW_THE_NEGATIVE_CONCLUSION',correctedMeaning:'The H-only case rejects a universal explanation requiring simultaneous H/V/D interaction. It does not establish that orientation information is dispensable in every common law or on mixed-orientation carriers.',retained:'The actual H-only OOO observation in its fixed coordinate system.'},
  {id:'CORR-06',findings:['DPAPP-03'],subject:'RS060 joint target dimension',disposition:'IMPOSSIBLE_FALSIFIER_RECLASSIFIED',correctedMeaning:'Adding two target columns can increase rank by at most two by definition. A reported gain greater than two is an integrity/definition failure, not a scientific falsifier. Gains 0,1,2 and membership in a frozen structural span remain meaningful.',retained:'Later IA-LATE-011 already distinguishes target dimension from a unique structural generator count.'},
  {id:'CORR-07',findings:['IA-PROCESS-F03','IA-PROCESS-F04','TRANSLATION-F008','TRANSLATION-F010'],subject:'Closure and verification status',disposition:'HISTORICAL_OPERATIONAL_RECORD__NOT_NEW_SOUNDNESS_CERTIFICATE',correctedMeaning:'Syntax, finite algebra, coverage counts and recorded zero-new outputs do not independently prove semantic reconstruction or exhaustive inference saturation. The sources already disclaim universal logical completeness. Changed guards, domains or uncertainty exclusions reopen affected closure for the new packet.',retained:'Valid bounded calculations and historical review records.',downstream:'The full discovery census copied stronger human bodies as CLOSED_PRIMITIVE. Those specific closure dispositions cannot be reused as faithful reconstruction without correction.'},
  {id:'CORR-08',findings:['DPAPP-04','TRANSLATION-F009'],subject:'Ordering and identity categories',disposition:'PRESERVE_EXPLICIT_PROFILES',correctedMeaning:'A first passing feature is preferred under a frozen valuation, not automatically coarsest in a quotient order. A representation recoding is not by itself a formal NEI SAME judgment. Per-geometry fits, geometry-parameterized closed laws, and one geometry-blind functional have different quantifiers.',retained:'RS082 and RS095 state their stronger pooled/additive target explicitly; these remain legitimate bounded experiments.'}
];
const result={
  schema:'connect4.isomax.graph_ia_dp_audit_synthesis.v1',
  status:'BOUNDED_AUDIT_COMPLETE_WITH_CONFIRMED_FINDINGS_AND_CORRECTION_REGISTER',
  canonicalOwner:'research/semantic-quotient',authorityEffect:'NONE',sourceHashConvention:'RAW_FILE_BYTES',
  conclusion:'Confirmed lossy/mistyped graph translations, dropped-guard and missing-domain IA reasoning, and discovery-protocol application errors. No defect in upstream DP rules is established. These findings constrain interpretation; they do not erase the independently reproduced bounded scalar results.',
  coverage:{lateNativeEdges:61,lateNativeNodes:39,lateIAs:11,coreSourceInventory:31,coreIAInventory:64,coreProofCoverage:'Selected load-bearing inference bodies and verification procedure; not an independent proof of every Core IA.',protocol:'Pinned DP0.9/0.10 and their actual late-campaign application; no blanket qualification of the full upstream framework.'},
  audits:['TRANSLATION_AUDIT_0_1.json','IA_PROCESS_AUDIT_0_1.json','DISCOVERY_PROTOCOL_AUDIT_0_1.json'],
  correctionRegister,
  downstreamPropagation:{copiedAssertions:copies,quCopy:{file:laterPrefix+'QU_LEDGER_DISCOVERY_FINAL_0_8.json',id:q.id,jsonPointer:`/entries/${qIndex}/fixed/${badFixed}`,original:q.fixed[badFixed],disposition:'Add equal-source-value guard; preserve the original as historical evidence.'},relativeParityExclusions:parityExclusions},
  verification:{translation:'All61 native edges resolved and individually reviewed; structural checks passed.',implicitAssertions:'Original algebra-only identity checker reproduced without overwriting evidence; Boolean endpoint models and explicit four-route-pair repair checked.',discoveryProtocol:'Pinned actual RS071 library coarsens distinct simultaneous-reflection orbits; exact provenance separates the synthetic examples.',repositoryIntegrity:'tools/verify-research-integrity.mjs passed at audit integration; authority1.2 unchanged.',limits:'No new board solving or scalar replay performed for this audit; no sealed outcomes accessed; no native successor or complete theorem-prover closure qualification performed.'},
  researchDisposition:{retain:'RS076 procedural repair, independent4486550-state implementation agreement, valid11 late IAs with guards, and bounded fitted-rank observations.',reopen:'Affected native/prose reconstruction, fixed-source and pair-domain support, dependent QU exclusions, and exact diagonal-sign-removability claim.',rs096:'HOLD',freshExtension:'Source checkpoint only while semantic audit has priority.',moverGauge:'Previously running structural preparation remains separate; no scalar result inferred from this audit.'},
  sources
};
fs.writeFileSync(path.join(here,'GRAPH_IA_DP_AUDIT_0_1.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,correctionEntries:correctionRegister.length,copiedAssertions:copies.map(x=>x.sourceAssertion),quPointer:result.downstreamPropagation.quCopy.jsonPointer,sourceCount:sources.length}));
