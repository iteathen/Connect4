import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-uc4a-ip-regime-defect-bridge.mjs');
const raw=execFileSync(process.execPath,[script],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.uc4a_ip_regime_defect_bridge.v1');
assert.equal(r.regimeAtlasSha256,'7ce03e10c6ca122f51e44d817d23fc71270d35a9b826cce74a92e49a8f59ecbe');
assert.equal(r.curvatureLocalizationSchema,'connect4.uc4a_curvature_quotient_localization.v1');
assert.equal(r.rawOutcomeSourcesAccessed,false);
assert.equal(r.wdlLabelsAccessed,false);
assert.equal(r.sealedHoldoutsAccessed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

assert.equal(r.structuralDefects.count,38);
assert.ok(r.targets.length>0);
for(const t of r.targets){
  assert.ok(['IN_SPACE','OUT_OF_SPACE'].includes(t.bridgeStatus));
  if(t.bridgeStatus==='IN_SPACE'){
    for(const scope of ['global','sameFamily']){
      const x=t[scope];
      assert.ok(x.minimumSpanOrder===null||[1,2,3].includes(x.minimumSpanOrder));
      if(x.minimumSpanOrder===null){
        assert.equal(x.failureAtOrder3,true);
      }else{
        assert.ok(x.minimalSpanningDefectSets.length>0);
        assert.ok(x.minimalSpanningDefectSets.every(s=>s.directionIds.length===x.minimumSpanOrder));
      }
    }
  }else{
    assert.ok(t.outOfSpaceFields.length>0);
  }
}

assert.equal(r.focus.localizationRowId,'WIDTH2:8x6|9x6|10x6');
assert.equal(typeof r.focus.directionId,'string');
assert.ok(['IN_SPACE','OUT_OF_SPACE'].includes(r.focus.bridgeStatus));
if(r.focus.bridgeStatus==='IN_SPACE'){
  assert.ok(r.focus.minimumSpanOrder===null||[1,2,3].includes(r.focus.minimumSpanOrder));
  if(r.focus.minimumSpanOrder!==null)assert.ok(r.focus.minimalSpanningDefectSets.length>0);
}

const s=JSON.stringify(r);
for(const token of ['UC4A_BOARD_OUTCOME_STRUCTURAL_TRIANGLE_CENSUS','BOARD_SIZE_ANALYSIS.json'])assert.equal(s.includes(token),false);

assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('not a theorem')));

console.log(JSON.stringify({
  pass:true,
  defects:r.structuralDefects.count,
  targets:r.targets.length,
  inSpace:r.targets.filter(x=>x.bridgeStatus==='IN_SPACE').length,
  exactMatches:r.targets.filter(x=>x.bridgeStatus==='IN_SPACE'&&x.global.minimumSpanOrder===1).length,
  focus:{
    directionId:r.focus.directionId,
    bridgeStatus:r.focus.bridgeStatus,
    minimumSpanOrder:r.focus.minimumSpanOrder??null,
    sets:r.focus.minimalSpanningDefectSets?.length??0
  }
}));
