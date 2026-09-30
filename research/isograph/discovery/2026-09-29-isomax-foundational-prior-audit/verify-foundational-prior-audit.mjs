import fs from 'node:fs';
import assert from 'node:assert/strict';

const base=new URL('.',import.meta.url);
const read=n=>JSON.parse(fs.readFileSync(new URL('./'+n,base),'utf8'));

const w=read('WITNESS_PRIOR_AUDIT_0_1.json');
const f=read('FIXED_FRAME_ROUTE_AUDIT_0_1.json');
const c=read('CLOSURE_PRIOR_AUDIT_0_1.json');
const g=read('GEOMETRY_COVARIANCE_AUDIT_0_1.json');
const t=read('TRANSPORTER_AWARE_RECONSTRUCTION_0_1.json');
const car=read('CARRIER_PRIOR_AUDIT_0_1.json');
const id=read('IDENTITY_QU_NEI_AUDIT_0_1.json');
const lego=read('LEGO_INVENTORY_0_1.json');
const shape=read('PROBLEM_SHAPE_MAP_0_1.json');
const ia1=read('IA_AUDIT_ROUND_01_0_1.json');
const ia2=read('IA_AUDIT_ROUND_02_0_1.json');
const ia3=read('IA_AUDIT_ROUND_03_FIXED_POINT_0_1.json');
const qu=read('QU_LEDGER_FOUNDATIONAL_AUDIT_0_1.json');
const dp=read('DP_FOUNDATIONAL_AUDIT_DELTA_0_1.json');
const dts=read('DTS_FOUNDATIONAL_AUDIT_0_1.json');
const mss=read('MSS_FOUNDATIONAL_AUDIT_0_1.json');
const ei=read('EXPERIMENTAL_INQUIRY_FOUNDATIONAL_AUDIT_0_1.json');

assert.equal(w.disposition.parityAnomalyReproduced,true);
assert.equal(w.disposition.exactEndpointReconvergence,false);
assert.equal(w.disposition.orbitEndpointReconvergence,false);
assert.equal(w.disposition.literalFutureReconvergence,true);
assert.ok(w.groupResolution.every(x=>!x.exact&&!x.orbit&&x.literal&&x.multiset&&x.set));
assert.equal(w.independentSheetGauge.gaugeInvariantDifference,true);
assert.equal(w.independentSheetGauge.storedDifference,1);
assert.equal(w.independentSheetGauge.independentDifference,1);
const storedOdd=w.independentSheetGauge.edges.find(x=>x.stored===1)?.id;
const independentOdd=w.independentSheetGauge.edges.find(x=>x.independent===1)?.id;
assert.notEqual(storedOdd,independentOdd);

assert.ok(f.rows.every(x=>
  !x.rawEndpointExactEqual &&
  !x.rawEndpointOrbitEqual &&
  !x.rawEndpointLiteralFutureEqual &&
  x.rawEndpointMultisetFutureEqual &&
  x.rawEndpointSetFutureEqual &&
  x.globalActionPermutationFutureEqual));

assert.equal(c.results.residualsAudited,56);
assert.equal(c.results.supportReleaseMismatchCount,0);
assert.equal(c.results.supportReleaseMatchesExactIsolatedSchedule,true);

assert.equal(g.columnPermutationAudit.allPermutations,120);
assert.equal(g.columnPermutationAudit.physicalBoardAutomorphismCount,2);
assert.equal(g.columnPermutationAudit.nonPhysicalCanonicalizerUses,10);
assert.equal(g.result.everyWitnessCanonicalizerIsPhysicalBoardSymmetry,false);
assert.equal(g.result.everyDisplayedResidualIsSubsetOfPhysicalWinningLine,false);

assert.equal(t.corrected.binaryGroupsCollapsedAtLiteralFutureResolution,6);
assert.equal(t.corrected.binaryGroupsRemainingAtLiteralFutureResolution,0);
assert.equal(t.corrected.literalFutureBinaryCarrierExists,false);
assert.equal(t.falsifier.result,'FALSIFIED');

const flat=car.cases.find(x=>x.label.startsWith('4x5'));
const obs=car.cases.find(x=>x.label.startsWith('5x4'));
assert.ok(flat&&obs);
assert.equal(flat.independent.exactPotentialExists,true);
assert.equal(flat.independent.cycleRank,40);
assert.equal(obs.independent.exactPotentialExists,false);
assert.equal(obs.independent.cycleRank,542);
assert.equal(obs.independent.contradictoryPairs,1);
assert.deepEqual(obs.independent.minimumContradiction.paths,[
  [2723,2255,59],[2724,2710,350]
]);
assert.equal(obs.independent.basisCountVariesAcrossTestedOrders,true);
assert.ok(new Set(obs.independent.basisNonzeroValues).size>1);
assert.equal(obs.independent.scalarCycleFunctionalImageRank,1);
assert.ok(car.cases.every(x=>Object.values(x.comparisons).every(Boolean)));

assert.equal(id.nei_queries.length,3);
assert.ok(id.nei_queries.every(x=>x.result.startsWith('INCOMPLETE')));
assert.ok(lego.hard_legos.length>=16);
assert.ok(lego.soft_legos.length>=6);
assert.ok(lego.missing_legos.length>=6);
assert.ok(shape.candidates.some(x=>
  x.shape.includes('groupoid holonomy')&&x.fit.startsWith('HIGH')));

assert.equal(ia1.new_assertions.length,8);
assert.equal(ia2.new_assertions.length,6);
assert.equal(ia3.new_assertions.length,0);
assert.equal(ia3.support_refinements.length,0);
assert.equal(ia3.qu_refinements.length,0);
assert.equal(ia3.stop_rule_result.status,'FOUNDATIONAL_AUDIT_IA_FIXED_POINT');

assert.equal(qu.no_probability_added,true);
assert.equal(qu.no_preferred_realization_selected,true);
assert.equal(dp.impacted.length,21);
assert.ok(dts.results.some(x=>x.id==='DTS-A005'));
assert.ok(mss.results.some(x=>x.id==='MSS-A003'));
assert.ok(ei.inquiries.some(x=>
  x.id==='EI-A005'&&x.status==='CLOSED_MODEL_BREAK'));

const report=fs.readFileSync(new URL('./FOUNDATIONAL_PRIOR_AUDIT_REPORT_0_1.md',base),'utf8');
for(const phrase of [
  'representation-graph non-exactness: CONFIRMED',
  'intrinsic literal-future obstruction: NOT SUPPORTED / WITNESS FALSIFIED',
  'old middle-edge mechanism search: CLOSED'
])assert.ok(report.includes(phrase));

console.log(JSON.stringify({
  status:'FOUNDATIONAL_PRIOR_AUDIT_PASS',
  model_break:'INTRINSIC_LITERAL_FUTURE_OBSTRUCTION_WITNESS_FALSIFIED',
  representation_graph:'NONEXACT_CONFIRMED',
  ia_fixed_point:ia3.stop_rule_result.status,
  next:'TRANSPORTER_AWARE_OR_PHYSICAL_FRAME_CARRIER'
},null,2));
