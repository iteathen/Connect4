import fs from 'node:fs';
import assert from 'node:assert/strict';

const base=new URL('.',import.meta.url);
const result=JSON.parse(fs.readFileSync(new URL('./OOO_SIX_BUCKET_COUNT_QUOTIENT_0_1.json',base),'utf8'));

assert.equal(result.schema,'connect4.isomax.six_bucket_count_quotient.v1');
assert.equal(result.warrant,'EW-RS-075');
assert.deepEqual(result.cases.map(x=>x.label),['6x3-k3','4x5-k4','6x3-k4']);
assert.ok(!result.cases.some(x=>x.label==='3x6-k4'||x.label==='5x3-k4'),'sealed EW-RS-059 holdout leaked into RS-075');

const modes=[
  'BUCKET_PRESENCE','BUCKET_PARITY','BUCKET_ZOE',
  'BUCKET_CLIP2','BUCKET_CLIP3','BUCKET_EXACT'
];
const expectedControlRank=new Map([
  ['6x3-k3',73],
  ['4x5-k4',254],
  ['6x3-k4',14]
]);

const cases={};
for(const c of result.cases){
  const q=c.decoder.oooSixBucketCountQuotient;
  assert.deepEqual(q.modes,modes,c.label+' six-bucket mode ladder drift');
  const exact=q.audits.find(x=>x.mode==='BUCKET_EXACT');
  assert.ok(exact,c.label+' missing exact six-bucket control');
  assert.equal(exact.imageRank,expectedControlRank.get(c.label),c.label+' exact control rank drift');
  assert.equal(exact.contradictions,0,c.label+' exact control contradiction');
  assert.equal(exact.exactScalarFactorization,true,c.label+' exact control factorization failure');

  cases[c.label]=q.audits.map(x=>({
    mode:x.mode,
    featureKeyCount:x.featureKeyCount,
    imageRank:x.imageRank,
    kernelDimensionRelativeToExact:x.kernelDimensionRelativeToExact,
    zeroStructuralNonzeroScalar:x.zeroStructuralNonzeroScalar,
    contradictions:x.contradictions,
    scalarDependencyImageDimension:x.scalarDependencyImageDimension,
    scalarImageDimensionOnBasis:x.scalarImageDimensionOnBasis,
    exactScalarFactorization:x.exactScalarFactorization
  }));
}

const commonExact=modes.filter(mode=>result.cases.every(c=>
  c.decoder.oooSixBucketCountQuotient.audits.find(x=>x.mode===mode)?.exactScalarFactorization===true
));

assert.equal(result.mechanicalChecks.sixBucketCountSemanticsFrozen,true);
assert.equal(result.mechanicalChecks.sixBucketCountModesFrozenBeforeScalarReplay,true);
assert.equal(result.mechanicalChecks.sixBucketExactControlsReproduced,true);

const out={
  schema:'connect4.isomax.six_bucket_count_quotient_result_verify.v1',
  warrant:'EW-RS-075',
  status:'PASS',
  cases,
  common:{exactModes:commonExact},
  holdouts:{primary:'3x6-k4',backup:'5x3-k4',sealed:true}
};

fs.writeFileSync(new URL('./OOO_SIX_BUCKET_COUNT_QUOTIENT_RESULT_VERIFY_0_1.json',base),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
