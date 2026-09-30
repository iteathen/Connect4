import fs from 'node:fs';
import assert from 'node:assert/strict';

const witness=JSON.parse(fs.readFileSync(new URL('./WITNESS_PRIOR_AUDIT_0_1.json',import.meta.url),'utf8')),
  fixed=JSON.parse(fs.readFileSync(new URL('./FIXED_FRAME_ROUTE_AUDIT_0_1.json',import.meta.url),'utf8'));

const groups=witness.groupResolution.map(g=>({
  group:g.group,
  storedFiberSize:2,
  exactStateClasses:g.exact?1:2,
  columnOrbitClasses:g.orbit?1:2,
  literalFutureClasses:g.literal?1:2,
  multisetFutureClasses:g.multiset?1:2,
  setFutureClasses:g.set?1:2,
  storedSheetDistinctionSurvivesLiteralFuture:!g.literal,
}));
assert.equal(groups.length,6);
assert.ok(groups.every(g=>g.literalFutureClasses===1),
  'every witness sheet pair must collapse under independently computed literal-future behavior');

const routes=fixed.rows.map(r=>({
  startSheet:r.startSheet,
  rawExactReconvergence:r.rawEndpointExactEqual,
  rawOrbitReconvergence:r.rawEndpointOrbitEqual,
  rawLiteralReconvergence:r.rawEndpointLiteralFutureEqual,
  rawMultisetReconvergence:r.rawEndpointMultisetFutureEqual,
  rawSetReconvergence:r.rawEndpointSetFutureEqual,
  oneGlobalActionTransporterExists:r.globalActionPermutationFutureEqual,
  transporterWitnesses:r.globalActionPermutationFutureTransporters,
}));
assert.ok(routes.every(r=>r.oneGlobalActionTransporterExists));

const corrected={
  behaviorRelation:'complete no-canonicalization literal-action future tree from each exact canonical sheet state',
  transporterAwareRouteRelation:'complete literal-action future tree after one explicit global action permutation between fixed-source-frame route endpoints',
  witnessGroups:groups,
  binaryGroupsRemainingAtLiteralFutureResolution:
    groups.filter(g=>g.literalFutureClasses===2).length,
  binaryGroupsCollapsedAtLiteralFutureResolution:
    groups.filter(g=>g.literalFutureClasses===1).length,
  storedWitnessBinaryCarrierExists:true,
  literalFutureBinaryCarrierExists:
    groups.some(g=>g.literalFutureClasses===2),
  z2HolonomyDefinedAfterLiteralFutureCollapse:
    groups.every(g=>g.literalFutureClasses===2),
};

const out={
  schema:'connect4.isomax.foundational_prior_audit.transporter_aware_reconstruction.v1',
  date_author_local:'2026-09-29',
  inputs:['WITNESS_PRIOR_AUDIT_0_1.json','FIXED_FRAME_ROUTE_AUDIT_0_1.json'],
  corrected,
  fixedFrameRoutes:routes,
  falsifier:{
    claim_under_test:'the stored two-sheet witness distinguishes two recursively literal-action-labelled future behaviors at every base node, so its odd holonomy is an intrinsic future-behavior obstruction',
    result:'FALSIFIED',
    reason:[
      'all six stored two-sheet witness groups collapse to one independently computed literal-action future behavior in their canonical frames',
      'the two fixed-source-frame route endpoints are literal-future distinct only until an explicit global action transporter is applied',
      'after behavior-level collapse, the witness does not retain a two-sheet fiber on which the stored Z2 deltas could be interpreted as intrinsic future-behavior transport'
    ],
    surviving_weaker_claim:'the stored canonical-frame action-token construction carries a non-exact Z2 cochain / odd relative holonomy on its own representation graph',
  },
  identity_scope:{
    notClaimed:[
      'physical states are identical',
      'exact residual states are identical',
      'arbitrary-column orbits are identical',
      'qualified standard-7x6 q_o/q_r theorem directly applies to this bounded pruned carrier'
    ],
    supported:[
      'within the audited bounded pruned transition model, each stored sheet pair has identical complete fixed-canonical-frame literal future behavior',
      'fixed-source-frame route endpoints have complete literal future correspondence under at least one explicit global action permutation'
    ]
  },
  disposition:'CURRENT_SURVIVING_OBSTRUCTION_REINTERPRETED_AS_REPRESENTATION_RELATIVE_HOLONOMY__INTRINSIC_FUTURE_BEHAVIOR_OBSTRUCTION_NOT_SUPPORTED'
};
fs.writeFileSync(new URL('./TRANSPORTER_AWARE_RECONSTRUCTION_0_1.json',import.meta.url),
  JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:'TRANSPORTER_AWARE_RECONSTRUCTION_COMPLETE',corrected:out.corrected,falsifier:out.falsifier,disposition:out.disposition},null,2));
