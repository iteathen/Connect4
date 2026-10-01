import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-uc4a-ip-symmetry-phase-structural.mjs');
const raw=execFileSync(process.execPath,[script],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.uc4a_ip_symmetry_phase_structural.v1');
assert.equal(r.phase,'LABEL_FREE_IP_STRUCTURAL_MODE_FREEZE');
assert.equal(r.boardCount,169);
assert.equal(r.curvatureRowCount,430);
assert.deepEqual(r.familyCounts,{WIDTH2:143,HEIGHT2:143,MIXED:144});
assert.equal(r.outcomeLabelsAccessibleToProducer,false);
assert.equal(r.localizationArtifactAccessibleToProducer,false);
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.sealedHoldoutsAccessed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

const board=b=>r.boards.find(x=>x.board===b);
const b76=board('7x6');
assert.ok(b76);
assert.equal(b76.I.yCell,28);
assert.equal(b76.I.yLine,28);
assert.equal(b76.I.linePhaseQuotientRank,6);
assert.deepEqual(b76.I.coreReflection,{
  leftRightFixed:{yCell:14,yLine:14},
  geometryOnlyTopBottomFixed:{yCell:16,yLine:14},
  rotation180Fixed:{yCell:14,yLine:14}
});
assert.equal(b76.P.safeEntryCount,1);
assert.deepEqual(b76.P.safeEntryColumns,[4]);
assert.equal(board('8x6').P.safeEntryCount,0);
assert.equal(board('16x16').width,16);
assert.equal(board('16x16').height,16);

const s=JSON.stringify(r);
for(const token of ['P1_WIN','P2_WIN','DRAW','boundaryAdjacent','homogeneous','Q-b28863204048bdde'])assert.equal(s.includes(token),false);

assert.equal(r.modeCensus.integer.familyRanks.WIDTH2>0,true);
assert.equal(r.modeCensus.integer.familyRanks.HEIGHT2>0,true);
assert.equal(r.modeCensus.integer.familyRanks.MIXED>0,true);
assert.ok(r.modeCensus.integer.projectiveModes.length>0);
assert.ok(r.modeCensus.reflectionSector.linearDependencies.length>=0);
assert.ok(r.modeCensus.safeEntryCurvature.rows.length>0);

const focus=r.curvatureRows.find(x=>x.id==='WIDTH2:8x6|9x6|10x6');
assert.ok(focus);
assert.equal(focus.outcomeLabel,undefined);
assert.match(r.structuralAtlasSha256,/^[0-9a-f]{64}$/);

console.log(JSON.stringify({
  pass:true,
  boards:r.boardCount,
  curvatureRows:r.curvatureRowCount,
  familyCounts:r.familyCounts,
  ipRanks:r.modeCensus.integer.familyRanks,
  projectiveModes:r.modeCensus.integer.projectiveModes.length,
  safeEntryCurvatureRows:r.modeCensus.safeEntryCurvature.rows.length
}));
