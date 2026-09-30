import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const base='research/isograph/discovery/2026-09-29-isomax-full-discovery/';
const read=name=>JSON.parse(fs.readFileSync(base+name,'utf8'));
const findings=read('DISCOVERY_FINDINGS_FINAL_0_1.json');
const ei=read('EXPERIMENTAL_INQUIRY_LEDGER_FINAL_0_1.json');
const mss=read('MSS_VALUATION_FINAL_0_1.json');
const dts=read('DTS_SYNTHESIS_FINAL_0_1.json');
const nei=read('NEI_ANALYSIS_FINAL_0_1.json');
const dp=read('DP_LEDGER_FINAL_0_1.json');
const qu=read('QU_LEDGER_DISCOVERY_FINAL_0_8.json');
const ia=read('DISCOVERY_IA_CLOSURE_FINAL_0_2.json');
const fixed=read('DISCOVERY_FIXED_POINT_0_1.json');
const ssc=read('DISCOVERY_SSC_0_1.json');
const hit=read('MOTIF_HITTING_SET_0_1.json');

assert.equal(findings.status,'DISCOVERY_OPERATIONAL_FIXED_POINT');
assert.equal(findings.findings.length,31);
assert.equal(new Set(findings.findings.map(x=>x.id)).size,31);
assert.deepEqual(findings.findings.map(x=>x.id),
  Array.from({length:31},(_,i)=>'DISC-F'+String(i+1).padStart(3,'0')));
assert.equal(findings.live_gap.next_experiment_warrant,null);

assert.equal(ei.status,'DISCOVERY_OPERATIONAL_FIXED_POINT__NO_ACTIVE_WARRANTS');
assert.equal(ei.inquiries.length,18);
assert.deepEqual(ei.active_warrants,[]);
assert.ok(ei.inquiries.every(x=>x.status!=='PENDING'));
assert.equal(ei.stop_decision.decision,'NO_NEW_WARRANT');

assert.equal(mss.objectives.length,9);
assert.ok(mss.objectives.every(x=>x.result&&x.result!=='PENDING_EW018'));
assert.equal(mss.valuation.preferred_next_gap,null);

assert.equal(dts.pending,null);
assert.equal(dts.results.length,11);

assert.equal(nei.status,'NO_NATURAL_IDENTITY_PROMOTION__DISCOVERY_FIXED_POINT');
assert.equal(nei.queries.length,5);
assert.ok(nei.queries.every(x=>x.result==='INCOMPLETE'));

assert.equal(dp.entries.length,45);
assert.equal(dp.counts.total,45);
assert.equal(dp.counts.pending,0);
assert.ok(dp.entries.every(x=>x.status!=='PENDING'&&x.pending_refinement===null));
assert.equal(dp.stop_decision.decision,'NO_NEW_EXPERIMENTAL_WARRANT');

assert.equal(qu.entries.length,6);
assert.ok(qu.entries.every(x=>x.status==='OPEN'));
assert.equal(qu.no_probability_added,true);
assert.equal(qu.no_preferred_open_realization_selected,true);
assert.equal(qu.next_experimental_warrant,null);
assert.equal(qu.status,'DISCOVERY_REFINED_OPEN_STATE__NO_ACTIVE_WARRANT');

assert.equal(ia.status,'DISCOVERY_IA_CANDIDATE_OPERATIONAL_FIXED_POINT');
assert.equal(ia.candidates.length,22);
assert.equal(new Set(ia.candidates.map(x=>x.id)).size,22);
assert.ok(ia.candidates.every(x=>
  x.core021_admission==='NOT_ADMITTED'&&
  x.representation_closure==='INCOMPLETE_UNEXPANDED'));
assert.equal(ia.admission_summary.admitted_native,0);
assert.equal(ia.rounds.at(-1).new_candidates,0);
assert.equal(ia.fixed_point.operational,true);
assert.equal(ia.fixed_point.native_admission_fixed_point,false);

assert.deepEqual(ssc.counts,{
  source_assertions:31,
  implicit_assertions:64,
  qu_regions:6,
  structural_semantic_items:12,
  total:113,
});
assert.equal(ssc.scope_revision,null);
assert.equal(ssc.closure_invalidation.predecessor_preserved,true);

assert.equal(hit.k4_release.nonzero_cycles,22);
assert.equal(hit.k4_release.minimum_hitting_set_size,6);
assert.equal(hit.k4_release.number_of_minimum_solutions,6);
assert.equal(hit.k3_standard.nonzero_cycles,23);
assert.equal(hit.k3_standard.motif_uncovered_nonzero_cycles,6);
assert.equal(hit.k3_standard.motif_only_hitting_set,'INFEASIBLE');

assert.equal(fixed.status,'DISCOVERY_OPERATIONAL_FIXED_POINT__PAUSE');
assert.equal(fixed.source_semantic_census.conserved,true);
assert.equal(fixed.completion.dp_protocols,45);
assert.equal(fixed.completion.dp_pending,0);
assert.equal(fixed.completion.findings,31);
assert.equal(fixed.completion.experimental_inquiries,18);
assert.equal(fixed.completion.active_warrants,0);
assert.equal(fixed.completion.qu_regions,6);
assert.equal(fixed.completion.nei_queries,5);
assert.equal(fixed.completion.nei_promotions,0);
assert.equal(fixed.completion.discovery_ia_candidates,22);
assert.equal(fixed.completion.discovery_ia_native_admissions,0);
assert.equal(fixed.completion.ia_last_round_new_candidates,0);
assert.equal(fixed.final_stop_test.result,'FIXED_POINT_REACHED_FOR_SELECTED_DISCOVERY_PROFILE');
assert.equal(fixed.implementation_boundaries.production_isomax_modified,false);
assert.equal(fixed.implementation_boundaries.bsfp_modified,false);
assert.equal(fixed.disposition,'PAUSE');

const phase1=read('PHASE1_OBSERVATIONS_0_1.json');
for(const row of [...phase1.baselines,...phase1.guard_matrix])
  assert.equal(row.outcomeLabelsUsedByProducer,false);

const changed=execFileSync('git',[
  'diff','--name-only',
  '0aa24ff7fa73516113bc8d62dab0da535a42a012..HEAD'
],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
const allowedWorkflow=new Set([
  '.github/workflows/isomax-full-discovery-phase1.yml',
  '.github/workflows/isomax-full-discovery-fixed-point.yml',
]);
for(const path of changed){
  assert.ok(
    path.startsWith('research/')||
    allowedWorkflow.has(path)||
    path==='tools/verify-isomax-full-discovery.mjs',
    'non-research mutation escaped discovery boundary: '+path
  );
}
assert.ok(!changed.some(path=>
  path.startsWith('solvers/')||
  path.includes('/bsfp/')||
  path.includes('/BSFP/')
),'solver/BSFP mutation detected');

const report=fs.readFileSync(base+'DISCOVERY_FINAL_REPORT_0_1.md','utf8');
assert.match(report,/operational fixed point/i);
assert.match(report,/PAUSE/);
assert.match(report,/No production IsoMax, solver, or BSFP code was modified/);

console.log(JSON.stringify({
 status:'ISOMAX_FULL_DISCOVERY_FIXED_POINT_PASS',
 findings:31,dpProtocols:45,experimentalInquiries:18,
 quRegions:6,neiQueries:5,iaCandidates:22,nativeIaAdmissions:0,
 changedPaths:changed.length,disposition:'PAUSE'
},null,2));
