import fs from 'node:fs';
import assert from 'node:assert/strict';

const base=new URL('.',import.meta.url);
const result=JSON.parse(fs.readFileSync(new URL('./OOO_PAIR_DELTA_COORDINATE_LADDER_0_1.json',base),'utf8'));

assert.equal(result.schema,'connect4.isomax.ooo_pair_delta_coordinate_ladder.v1');
assert.equal(result.warrant,'EW-RS-070');

const expectedCases=['6x3-k3','4x5-k4','6x3-k4'];
assert.deepEqual(result.cases.map(x=>x.label),expectedCases);
assert.ok(!result.cases.some(x=>x.label==='3x6-k4'||x.label==='5x3-k4'),'sealed EW-RS-059 holdout leaked into RS-070');

const candidates=[
  'DELTA_SUPPORT_TRIANGLE',
  'DELTA_PARITY_TRIANGLE',
  'DELTA_SIGN_TRIANGLE',
  'DELTA_ABS_MAG_TRIANGLE',
  'DELTA_SIGNED_PARITY_TRIANGLE',
  'DELTA_SIGNED_CLIPPED_MAG_TRIANGLE',
  'DELTA_EXACT_TRIANGLE'
];
const expectedExactRank=new Map([
  ['6x3-k3',75],
  ['4x5-k4',283],
  ['6x3-k4',16]
]);
const expectedScalarDim=new Map([
  ['6x3-k3',1],
  ['4x5-k4',2],
  ['6x3-k4',2]
]);

const summary={};
for(const c of result.cases){
  const q=c.decoder.oooPairDeltaCoordinate;
  assert.deepEqual(q.candidates,candidates,c.label+' RS-070 candidate order drift');
  const exact=q.audits.find(x=>x.mode==='DELTA_EXACT_TRIANGLE');
  assert.ok(exact,c.label+' missing exact delta control');
  assert.equal(exact.imageRank,expectedExactRank.get(c.label),c.label+' exact delta rank drift');
  assert.equal(exact.contradictions,0,c.label+' exact delta contradiction');
  assert.equal(exact.exactScalarFactorization,true,c.label+' exact delta factorization failure');
  assert.equal(exact.scalarDependencyImageDimension,expectedScalarDim.get(c.label),c.label+' scalar image dimension drift');

  summary[c.label]=q.audits.map(x=>({
    mode:x.mode,
    featureKeyCount:x.featureKeyCount,
    imageRank:x.imageRank,
    kernelDimensionRelativeToExactDelta:x.kernelDimensionRelativeToExactDelta,
    zeroStructuralNonzeroScalar:x.zeroStructuralNonzeroScalar,
    contradictions:x.contradictions,
    scalarDependencyImageDimension:x.scalarDependencyImageDimension,
    scalarImageDimensionOnBasis:x.scalarImageDimensionOnBasis,
    exactScalarFactorization:x.exactScalarFactorization
  }));
}

assert.equal(result.mechanicalChecks.pairDeltaUnitSemanticsFrozen,true);
assert.equal(result.mechanicalChecks.pairDeltaCandidatesFrozenBeforeScalarReplay,true);
assert.equal(result.mechanicalChecks.pairDeltaExactControlReproduced,true);

const out={
  schema:'connect4.isomax.ooo_pair_delta_coordinate_ladder_result_verify.v1',
  warrant:'EW-RS-070',
  status:'PASS',
  cases:summary,
  holdouts:{primary:'3x6-k4',backup:'5x3-k4',sealed:true}
};

fs.writeFileSync(new URL('./OOO_PAIR_DELTA_COORDINATE_LADDER_RESULT_VERIFY_0_1.json',base),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
