import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-uc4a-ip-symmetry-phase-bridge.mjs');
const raw=execFileSync(process.execPath,[script],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.uc4a_ip_symmetry_phase_bridge.v1');
assert.equal(r.structuralAtlasSha256,'374d744378bf71b77db0711d1eb2ef4a21ec1cb4c80736aa206abd4520dd1aa9');
assert.equal(r.curvatureLocalizationSchema,'connect4.uc4a_curvature_quotient_localization.v1');
assert.equal(r.rawOutcomeSourcesAccessed,false);
assert.equal(r.wdlLabelsAccessed,false);
assert.equal(r.sealedHoldoutsAccessed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

assert.equal(r.unlabeledModes.sourceCurvatureRows,430);
assert.ok(r.unlabeledModes.uniqueProjectiveModes>0);
assert.ok(Array.isArray(r.targets));
assert.ok(r.targets.length>0);

for(const t of r.targets){
  assert.ok(['IN_SPACE','OUT_OF_SPACE'].includes(t.bridgeStatus));
  if(t.bridgeStatus==='IN_SPACE'){
    assert.ok(t.targetNonzeroCoordinates.length>0);
    assert.ok(t.global.minimumSpanOrder===null||[1,2,3].includes(t.global.minimumSpanOrder));
    assert.ok(t.sameFamily.minimumSpanOrder===null||[1,2,3].includes(t.sameFamily.minimumSpanOrder));
    if(t.global.minimumSpanOrder!==null){
      assert.ok(t.global.minimalSpanningModeSets.length>0);
      assert.ok(t.global.minimalSpanningModeSets.every(x=>x.modeIds.length===t.global.minimumSpanOrder));
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
  if(r.focus.minimumSpanOrder!==null){
    assert.ok(r.focus.minimalSpanningModeSets.length>0);
    for(const set of r.focus.minimalSpanningModeSets){
      assert.equal(set.modeIds.length,r.focus.minimumSpanOrder);
      assert.equal(typeof set.everyModeRecursOutsideFocusDimensions,'boolean');
    }
  }else{
    assert.equal(r.focus.failureAtOrder3,true);
  }
}

assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('not a theorem')));

console.log(JSON.stringify({
  pass:true,
  modes:r.unlabeledModes.uniqueProjectiveModes,
  targets:r.targets.length,
  inSpace:r.targets.filter(x=>x.bridgeStatus==='IN_SPACE').length,
  focus:{
    directionId:r.focus.directionId,
    bridgeStatus:r.focus.bridgeStatus,
    minimumSpanOrder:r.focus.minimumSpanOrder??null,
    spanningSets:r.focus.minimalSpanningModeSets?.length??0
  }
}));
