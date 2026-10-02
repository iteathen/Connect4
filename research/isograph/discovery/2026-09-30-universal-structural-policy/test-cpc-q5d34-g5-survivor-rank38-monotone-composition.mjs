import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-q5d34-g5-survivor-rank38-monotone-composition.mjs');
const library=process.argv[2];assert(library);

const raw=execFileSync(process.execPath,[script,library],{
  encoding:'utf8',
  maxBuffer:64*1024*1024,
});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_q5d34_g5_survivor_rank38_monotone_composition.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.design,'CPC_Q5D34_G5_SURVIVOR_RANK38_MONOTONE_COMPOSITION_DESIGN_0_1.md');
assert.equal(r.sourceEvidence,'CPC_Q5D34_G4_EF_REPLY_G5_SURVIVOR_0_1.json');

assert.equal(r.physicalReplyHistoryCount,6);
assert.equal(r.uniqueQClassCount,5);
assert.ok(Array.isArray(r.exactQMergeGroups));
const shared=r.exactQMergeGroups.find(x=>x.exactQClass==='e7eb0902f1f7984c');
assert.ok(shared);
assert.equal(shared.memberCount,2);
assert.deepEqual(new Set(shared.members.map(x=>x.sourceQ)).size,2);

assert.equal(r.qClassifications.length,5);
assert.deepEqual(
  r.legacyTargetEngineKinds,
  ['LAMBDA','THETA','DISTANCE2_TARGET_SUPPORT','DISTANCE1_RESOLVED_TAIL_CAPACITY']
);
for(const q of r.qClassifications){
  assert.equal(q.rank,38);
  assert.equal(q.exactBridge.pass,true);
  assert.ok(['P0_WIN','P0_LOSS','UNKNOWN'].includes(q.disposition));
  assert.ok(Array.isArray(q.routeAttempts));
  assert.ok(Array.isArray(q.positiveCertificates));
  assert.ok(Array.isArray(q.legacyTargetFamilies));
  assert.equal(typeof q.lossCertificate,'object');
  assert.equal(typeof q.lossCertificate.loss,'boolean');
  assert.ok(Number.isInteger(q.resourceFailureCount));
  if(q.disposition==='P0_WIN')assert.ok(q.positiveCertificates.length>0);
  if(q.disposition==='P0_LOSS'){
    assert.equal(q.positiveCertificates.length,0);
    assert.equal(q.lossCertificate.loss,true);
  }
  if(q.positiveCertificates.length>0)assert.equal(q.lossCertificate.loss,false);
}

assert.equal(r.survivors.length,2);
for(const s of r.survivors){
  assert.ok(['P0_WIN_ALL_REPLIES','P0_FAILS_LOSS_REPLY','UNKNOWN'].includes(s.classification));
  assert.equal(s.replyQClasses.length,3);
}

assert.equal(r.summary.totalResourceFailures,0);
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.legacyRepairModified,false);
assert.equal(r.rcicModified,false);
assert.equal(r.forcedLossModified,false);
assert.equal(r.bsfpModified,false);

console.log(JSON.stringify({
  pass:true,
  classification:r.classification,
  uniqueQClassCount:r.uniqueQClassCount,
  survivors:r.survivors,
  summary:r.summary,
}));
