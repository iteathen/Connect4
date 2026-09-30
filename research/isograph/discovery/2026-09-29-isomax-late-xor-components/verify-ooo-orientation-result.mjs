import fs from 'node:fs';
import assert from 'node:assert/strict';

const base=new URL('.',import.meta.url);
const result=JSON.parse(fs.readFileSync(new URL('./OOO_ORIENTATION_PROVENANCE_0_1.json',base),'utf8'));

assert.equal(result.schema,'connect4.isomax.ooo_orientation_provenance.v1');
assert.equal(result.warrant,'EW-RS-071');

const expectedCases=['6x3-k3','4x5-k4','6x3-k4'];
assert.deepEqual(result.cases.map(x=>x.label),expectedCases);
assert.ok(!result.cases.some(x=>x.label==='3x6-k4'||x.label==='5x3-k4'),'sealed EW-RS-059 holdout leaked into RS-071');

const expectedOooRank=new Map([
  ['6x3-k3',75],
  ['4x5-k4',294],
  ['6x3-k4',16]
]);

const expectedModes=[
  'ORI_PRESENCE',
  'ORI_COUNTS',
  'OWNER_ORI_COUNTS',
  'ORI_ROLE_PHASE_COUNTS',
  'ORI_DEPTH_HISTOGRAM',
  'OWNER_ORI_DEPTH_HISTOGRAM',
  'PAIR_ORI_INCIDENCE',
  'OWNER_ORI_PHASE_DEPTH',
  'EXACT_ORIENTATION_PROVENANCE',
  'FULL_DESCRIPTOR_PLUS_EXACT_ORIENTATION'
];

const summary={};
for(const c of result.cases){
  assert.equal(c.decoder.scalarMixedClasses,0,c.label+' base ROLE_CAPPAR scalar purity drift');
  assert.equal(c.decoder.matchedDegree2DependencyQuotient.oooResidueRank,expectedOooRank.get(c.label),c.label+' OOO rank drift');

  const o=c.decoder.oooOrientationProvenance;
  assert.deepEqual(o.modes,expectedModes,c.label+' orientation mode ladder drift');
  assert.deepEqual(o.provenance.projectionControls,{
    qMaskMismatches:0,
    rfgMaskMismatches:0,
    reflectionProvenanceMismatches:0,
    reflectionT2Mismatches:0,
    reflectionExactComponentMismatches:0,
    reflectionRoleCapparMismatches:0
  },c.label+' provenance/reflection control failure');

  const control=o.audits.find(x=>x.mode==='FULL_DESCRIPTOR_PLUS_EXACT_ORIENTATION');
  assert.ok(control,c.label+' missing exact orientation reconstruction control');
  assert.equal(control.imageRank,expectedOooRank.get(c.label),c.label+' exact orientation reconstruction rank drift');
  assert.equal(control.contradictions,0,c.label+' exact orientation reconstruction contradiction');
  assert.equal(control.exactScalarFactorization,true,c.label+' exact orientation reconstruction scalar failure');

  assert.equal(
    o.hvd.hvdTripleCount+o.hvd.nonHvdTripleCount,
    c.decoder.matchedDegree2DependencyQuotient.oooTripleCatalog.length,
    c.label+' HVD partition does not cover OOO triple catalog'
  );

  summary[c.label]={
    rawLineCounts:o.provenance.rawLineCounts,
    tripleCategories:o.tripleCategories,
    hvd:{
      hvdTripleCount:o.hvd.hvdTripleCount,
      nonHvdTripleCount:o.hvd.nonHvdTripleCount,
      hvdRank:o.hvd.hvdOnly.imageRank,
      nonHvdRank:o.hvd.nonHvdOnly.imageRank,
      hvdContradictions:o.hvd.hvdOnly.contradictions,
      nonHvdContradictions:o.hvd.nonHvdOnly.contradictions
    },
    candidates:o.audits.map(x=>({
      mode:x.mode,
      featureKeyCount:x.featureKeyCount,
      imageRank:x.imageRank,
      contradictions:x.contradictions,
      scalarImageDimensionOnBasis:x.scalarImageDimensionOnBasis,
      exactScalarFactorization:x.exactScalarFactorization,
      reconstructibility:x.descriptorReconstructibility,
      shuffled:x.shuffled.map(y=>({
        shift:y.shift,
        imageRank:y.imageRank,
        contradictions:y.contradictions,
        exactScalarFactorization:y.exactScalarFactorization
      }))
    }))
  };
}

assert.ok(result.crossK&&result.crossK.ORI_PRESENCE,'missing cross-k orientation comparison');
for(const mode of expectedModes){
  const x=result.crossK[mode];
  assert.ok(x,'missing cross-k mode '+mode);
  assert.ok(Number.isInteger(x.k3FeatureKeys)&&x.k3FeatureKeys>=0);
  assert.ok(Number.isInteger(x.k4FeatureKeys)&&x.k4FeatureKeys>=0);
  assert.ok(Number.isInteger(x.sharedFeatureKeys)&&x.sharedFeatureKeys>=0);
  assert.ok(x.sharedFeatureKeys<=Math.min(x.k3FeatureKeys,x.k4FeatureKeys));
}

assert.equal(result.mechanicalChecks.orientationProvenanceUnitSemanticsFrozen,true);
assert.equal(result.mechanicalChecks.orientationCandidatesFrozenBeforeScalarReplay,true);
assert.equal(result.mechanicalChecks.orientationProjectionControlsReproduced,true);

const out={
  schema:'connect4.isomax.ooo_orientation_provenance_result_verify.v1',
  warrant:'EW-RS-071',
  status:'PASS',
  cases:summary,
  crossK:result.crossK,
  holdouts:{primary:'3x6-k4',backup:'5x3-k4',sealed:true}
};

fs.writeFileSync(new URL('./OOO_ORIENTATION_PROVENANCE_RESULT_VERIFY_0_1.json',base),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
