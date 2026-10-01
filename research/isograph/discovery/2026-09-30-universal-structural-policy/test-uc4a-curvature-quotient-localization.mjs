import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-uc4a-curvature-quotient-localization.mjs');
const raw=execFileSync(process.execPath,[script],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.uc4a_curvature_quotient_localization.v1');
assert.equal(r.curvatureAtlasSha256,'58ac628a545a434f176e84c834b03f145a7efaf86f2389abb106465b13ea99b3');
assert.equal(r.curvatureRowCount,101);
assert.equal(r.sealedHoldoutsAccessed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

const families=['WIDTH2','HEIGHT2','MIXED','COMBINED'];
const expectedIntegerNovelty={WIDTH2:3,HEIGHT2:1,MIXED:2,COMBINED:2};
const expectedGf2Novelty={WIDTH2:1,HEIGHT2:0,MIXED:0,COMBINED:0};
for(const family of families){
  const bi=r.part1.blockSubsetLocalization.integer[family];
  const bg=r.part1.blockSubsetLocalization.gf2[family];
  assert.equal(bi.fullSpaceBoundaryNovelDimension,expectedIntegerNovelty[family]);
  assert.equal(bg.fullSpaceBoundaryNovelDimension,expectedGf2Novelty[family]);
  assert.equal(bi.subsets.length,63);
  assert.equal(bg.subsets.length,63);
  assert.equal(r.part2.canonicalIntegerQuotients[family].residualRank,expectedIntegerNovelty[family]);
  assert.equal(r.part2.canonicalIntegerQuotients[family].fullSpaceBoundaryNovelDimension,expectedIntegerNovelty[family]);
  if(expectedGf2Novelty[family]===0) assert.deepEqual(bg.minimalFullNoveltyBlockSubsets,[]);
  const f=r.part3.primitiveFieldSubsetCensus[family];
  assert.deepEqual(f.testedBySize,{'1':65,'2':2080,'3':43680});
  assert.equal(f.fullSpaceBoundaryNovelDimension,expectedIntegerNovelty[family]);
  assert.ok(Array.isArray(f.minimalFullNoveltyFieldSubsets));
  assert.ok(f.maxBoundaryNovelBySize['1']>=0);
  assert.ok(f.maxBoundaryNovelBySize['2']>=f.maxBoundaryNovelBySize['1']);
  assert.ok(f.maxBoundaryNovelBySize['3']>=f.maxBoundaryNovelBySize['2']);
}

for(const family of families){
  for(const candidate of r.part1.blockSubsetLocalization.integer[family].minimalFullNoveltyBlockSubsets){
    assert.ok(candidate.blocks.length>=1);
    assert.equal(candidate.boundaryNovelDimension,expectedIntegerNovelty[family]);
  }
  for(const candidate of r.part3.primitiveFieldSubsetCensus[family].minimalFullNoveltyFieldSubsets){
    assert.ok(candidate.fields.length>=1&&candidate.fields.length<=3);
    assert.equal(candidate.boundaryNovelDimension,expectedIntegerNovelty[family]);
  }
}

assert.equal(r.focus.rowId,'WIDTH2:8x6|9x6|10x6');
assert.equal(typeof r.focus.residualZero,'boolean');
assert.ok(r.focus.residualZero||typeof r.focus.directionId==='string');
for(const key of ['height6','width8','width9','width10']){
  const h=r.focus.holdoutSurvival[key];
  assert.equal(typeof h.survives,'boolean');
  assert.equal(typeof h.representativeInAllSpan,'boolean');
  assert.equal(typeof h.representativeInHomogeneousSpan,'boolean');
}

assert.ok(r.part4.heldOutReuse.blockCandidates.length>=0);
assert.ok(r.part4.heldOutReuse.fieldCandidates.length>=0);
assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('not a theorem')));

console.log(JSON.stringify({
  pass:true,
  curvatureRows:r.curvatureRowCount,
  integerNovelty:Object.fromEntries(families.map(f=>[f,r.part1.blockSubsetLocalization.integer[f].fullSpaceBoundaryNovelDimension])),
  minimalBlockCarriers:Object.fromEntries(families.map(f=>[f,r.part1.blockSubsetLocalization.integer[f].minimalFullNoveltyBlockSubsets.length])),
  minimalFieldCarriers:Object.fromEntries(families.map(f=>[f,r.part3.primitiveFieldSubsetCensus[f].minimalFullNoveltyFieldSubsets.length])),
  focus:{residualZero:r.focus.residualZero,directionId:r.focus.directionId??null}
}));
