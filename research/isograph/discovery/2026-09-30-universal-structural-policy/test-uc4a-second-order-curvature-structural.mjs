import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-uc4a-second-order-curvature-structural.mjs');
const raw=execFileSync(process.execPath,[script],{encoding:'utf8',maxBuffer:32*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.uc4a_second_order_curvature_structural.v1');
assert.equal(r.phase,'CURVATURE_STRUCTURAL_FREEZE_BEFORE_OUTCOME_JOIN');
assert.equal(r.structuralAtlasSha256,'49844e4772a337d92ab10735d8bc13d1c5570edb6a1b382d4fb0660205d21760');
assert.equal(r.boardCount,52);
assert.equal(r.curvatureRowCount,101);
assert.deepEqual(r.familyCounts,{WIDTH2:32,HEIGHT2:35,MIXED:34});
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.outcomeLabelsAccessibleToProducer,false);
assert.equal(r.sealedHoldoutsAccessed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.bsfpModified,false);

const s=JSON.stringify(r);
for(const token of ['P1_WIN','P2_WIN','DRAW'])assert.equal(s.includes(token),false);

const focus=r.rows.find(x=>x.family==='WIDTH2'&&x.boards.join('|')==='8x6|9x6|10x6');
assert.ok(focus);
assert.equal(focus.integer['P.pathRadius'],1);
assert.equal(focus.integer['P.phaseDimension'],0);
assert.equal(focus.integer['P.pairDisplacementNullity'],1);
assert.equal(focus.integer['I.coreDelta'],0);
assert.equal(focus.integer['D.maxInitialImpactCount'],0);
assert.equal(focus.integer['P.safeDerivativeWordCount'],16);
assert.equal(focus.gf2['P.phaseRadiusParity'],1);
assert.ok(focus.nonzeroIntegerFields.includes('P.pathRadius'));
assert.ok(focus.nonzeroBlocks.includes('P'));

for(const family of ['WIDTH2','HEIGHT2','MIXED']){
  assert.ok(Number.isInteger(r.rankSummary.integer[family].rank));
  assert.ok(Number.isInteger(r.rankSummary.gf2[family].rank));
}
assert.ok(Number.isInteger(r.rankSummary.integer.COMBINED.rank));
assert.ok(Number.isInteger(r.rankSummary.gf2.COMBINED.rank));
assert.equal(r.rowHashes.length,101);
assert.match(r.curvatureAtlasSha256,/^[0-9a-f]{64}$/);

console.log(JSON.stringify({
  pass:true,
  rows:r.curvatureRowCount,
  families:r.familyCounts,
  ranks:{
    integer:Object.fromEntries(Object.entries(r.rankSummary.integer).map(([k,v])=>[k,v.rank])),
    gf2:Object.fromEntries(Object.entries(r.rankSummary.gf2).map(([k,v])=>[k,v.rank]))
  },
  focus:{
    pathRadius:focus.integer['P.pathRadius'],
    safeDerivativeWordCount:focus.integer['P.safeDerivativeWordCount'],
    pairNullity:focus.integer['P.pairDisplacementNullity'],
    phaseRadiusParity:focus.gf2['P.phaseRadiusParity']
  }
}));
