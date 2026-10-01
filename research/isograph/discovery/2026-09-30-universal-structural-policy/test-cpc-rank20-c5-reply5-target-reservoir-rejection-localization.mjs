import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-c5-reply5-target-reservoir-rejection-localization.mjs');
const library=process.argv[2];
assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_c5_reply5_target_reservoir_rejection_localization.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.targetReservoirModified,false);
assert.equal(r.bsfpModified,false);
assert.equal(r.completeEnumeration,true);

assert.equal(r.states.length,5);
for(const s of r.states){
  assert.equal(s.targetActiveSingleton,true);
  assert.equal(s.targetProjectedToP1,true);
  assert.deepEqual(s.playableP2Singletons,[]);
  assert.equal(s.existingTargetReservoirTemplateExists,false);
  assert.ok(s.defenderResidualCount>0);
  assert.ok(s.totalPairingPrefixCandidates>=s.targetResponseValidCandidates);
  assert.ok(s.maximumCoveredCount>=0&&s.maximumCoveredCount<=s.defenderResidualCount);
  assert.equal(s.minimumUncoveredCount,s.defenderResidualCount-s.maximumCoveredCount);
  assert.ok(Array.isArray(s.maximumCoverageCandidates));
  assert.ok(Array.isArray(s.bestUncoveredSets));
  if(s.targetResponseValidCandidates>0)assert.ok(s.maximumCoverageCandidates.length>0);
  for(const u of s.bestUncoveredSets){
    assert.equal(u.uncoveredCount,s.minimumUncoveredCount);
    assert.ok(Array.isArray(u.residuals));
  }
}
assert.ok(Array.isArray(r.recurrence));
for(const x of r.recurrence){
  assert.ok(typeof x.cellSetKey==='string');
  assert.ok(x.count>=1);
  assert.equal(x.sourceStates.length,x.count);
}
assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('discovery evidence')));

console.log(JSON.stringify({
  pass:true,
  states:r.states.map(x=>({id:x.id,defenderResidualCount:x.defenderResidualCount,maxCovered:x.maximumCoveredCount,minUncovered:x.minimumUncoveredCount,bestUncovered:x.bestUncoveredSets.map(y=>y.residuals.map(z=>z.cellSetKey))})),
  recurring:r.recurrence.filter(x=>x.count>1)
}));
