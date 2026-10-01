import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-uc4a-second-order-curvature-analysis.mjs');
const raw=execFileSync(process.execPath,[script],{encoding:'utf8',maxBuffer:32*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.uc4a_second_order_curvature_analysis.v1');
assert.equal(r.curvatureAtlasSha256,'58ac628a545a434f176e84c834b03f145a7efaf86f2389abb106465b13ea99b3');
assert.equal(r.analysisProtocol,'UC4A_SECOND_ORDER_CURVATURE_ANALYSIS_PROTOCOL_0_1.md');
assert.equal(r.boardCount,52);
assert.equal(r.labelCount,52);
assert.equal(r.curvatureRowCount,101);
assert.equal(r.outcomeLabelsUsedOnlyAfterCurvatureFreeze,true);
assert.equal(r.sealedHoldoutsAccessed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.bsfpModified,false);

for(const algebra of ['integer','gf2']){
  for(const family of ['WIDTH2','HEIGHT2','MIXED','COMBINED']){
    const x=r.rankAnalysis[algebra][family];
    assert.ok(Number.isInteger(x.all.rank));
    assert.ok(Number.isInteger(x.boundary.rank));
    assert.ok(Number.isInteger(x.homogeneous.rank));
    assert.equal(x.boundaryNovelDimension,x.all.rank-x.homogeneous.rank);
    assert.equal(x.homogeneousNovelDimension,x.all.rank-x.boundary.rank);
  }
}
assert.deepEqual(
  Object.fromEntries(Object.entries(r.rankAnalysis.integer).map(([k,v])=>[k,v.all.rank])),
  {WIDTH2:9,HEIGHT2:5,MIXED:6,COMBINED:12}
);
assert.deepEqual(
  Object.fromEntries(Object.entries(r.rankAnalysis.gf2).map(([k,v])=>[k,v.all.rank])),
  {WIDTH2:3,HEIGHT2:2,MIXED:3,COMBINED:4}
);

assert.ok(r.repeatedModes.length>0);
assert.ok(r.repeatedModes.every(x=>x.count>1));
assert.ok(r.blockSupport.COMBINED.all.patterns.length>0);
assert.ok(r.heldOut.integer.COMBINED.width.reports.length>0);
assert.ok(r.heldOut.gf2.COMBINED.height.reports.length>0);

const focus=r.focus['8x6_9x6_10x6'];
assert.equal(focus.id,'WIDTH2:8x6|9x6|10x6');
assert.deepEqual(focus.outcomeWord,['P2_WIN','P2_WIN','P1_WIN']);
assert.equal(focus.boundaryEdgeCount,1);
assert.equal(focus.boundaryAdjacent,true);
assert.deepEqual(focus.exactSignatureMatches,['WIDTH2:8x6|9x6|10x6']);
assert.ok(focus.nonzeroBlocks.includes('P'));

assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('not a theorem')));

console.log(JSON.stringify({
  pass:true,
  rows:r.curvatureRowCount,
  neighborhoodClassCounts:r.neighborhoodClassCounts,
  integer:Object.fromEntries(Object.entries(r.rankAnalysis.integer).map(([k,v])=>[k,{all:v.all.rank,boundary:v.boundary.rank,homogeneous:v.homogeneous.rank,novel:v.boundaryNovelDimension}])),
  gf2:Object.fromEntries(Object.entries(r.rankAnalysis.gf2).map(([k,v])=>[k,{all:v.all.rank,boundary:v.boundary.rank,homogeneous:v.homogeneous.rank,novel:v.boundaryNovelDimension}])),
  repeatedModes:r.repeatedModes.length,
  mixedBoundaryBehaviorModes:r.repeatedModes.filter(x=>x.occursBoundaryAndHomogeneous).length,
  focus:r.focus['8x6_9x6_10x6']
}));
