import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-uc4a-latent-structure-tomography-analysis.mjs');
const raw=execFileSync(process.execPath,[script],{encoding:'utf8',env:{...process.env,UC4A_TOMO_DIAGNOSTIC:'1'},stdio:['ignore','pipe','inherit']});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.uc4a_latent_structure_tomography_analysis.v1');
assert.equal(r.structuralAtlasSha256,'49844e4772a337d92ab10735d8bc13d1c5570edb6a1b382d4fb0660205d21760');
assert.equal(r.analysisProtocol,'UC4A_LATENT_STRUCTURE_TOMOGRAPHY_ANALYSIS_PROTOCOL_0_2.md');
assert.equal(r.boardCount,52);
assert.equal(r.labelCount,52);
assert.equal(r.sealedHoldoutsAccessed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.bsfpModified,false);
assert.equal(r.outcomeLabelsUsedOnlyAfterStructuralFreeze,true);
assert.deepEqual(Object.keys(r.views).sort(),['view1','view2','view3','view4','view5','view6']);

assert.ok(r.views.view1.fixedWidthTrajectories.length>0);
assert.ok(r.views.view1.fixedHeightTrajectories.length>0);
assert.ok(r.views.view2.unitEdges.length>0);
assert.equal(
  r.views.view2.unitEdges.length,
  r.views.view2.outcomeChangingEdges.length+r.views.view2.outcomePreservingEdges.length
);

for(const algebra of ['integer','gf2']){
  const x=r.views.view4[algebra];
  assert.ok(Number.isInteger(x.all.rank));
  assert.ok(Number.isInteger(x.boundary.rank));
  assert.ok(Number.isInteger(x.preserving.rank));
  assert.equal(x.boundaryNovelDimension,x.all.rank-x.preserving.rank);
  assert.equal(x.preservingNovelDimension,x.all.rank-x.boundary.rank);
}

assert.equal(r.views.view3.literalExact.warning.includes('singleton'),true);
assert.ok(r.views.view3.identitySuppressed.stages.length>=6);
assert.ok(Array.isArray(r.views.view5.minimalDifferentOutcomeSeparators));
assert.ok(r.views.view6.triangles.length>0);
assert.ok(r.views.view6.triangles.every(x=>x.integerCircuitClosed&&x.gf2CircuitClosed));

const collision=r.focus['8x6_9x6_10x6'];
assert.deepEqual(collision.map(x=>x.board),['8x6','9x6','10x6']);
assert.deepEqual(collision.map(x=>x.outcome),['P2_WIN','P2_WIN','P1_WIN']);
assert.deepEqual(collision.map(x=>x.pathRadius),[4,4,5]);

assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('not a theorem')));
console.log(JSON.stringify({
  pass:true,
  boardCount:r.boardCount,
  unitEdges:r.views.view2.unitEdges.length,
  outcomeChanging:r.views.view2.outcomeChangingEdges.length,
  integerRanks:{
    all:r.views.view4.integer.all.rank,
    boundary:r.views.view4.integer.boundary.rank,
    preserving:r.views.view4.integer.preserving.rank
  },
  gf2Ranks:{
    all:r.views.view4.gf2.all.rank,
    boundary:r.views.view4.gf2.boundary.rank,
    preserving:r.views.view4.gf2.preserving.rank
  },
  triangles:r.views.view6.triangles.length
}));
