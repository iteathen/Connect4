import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-c5-reply5-post-contraction-cpc-reentry-diagnostic.mjs');
const library=process.argv[2];
assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_c5_reply5_post_contraction_cpc_reentry_diagnostic.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

assert.equal(r.states.length,5);
for(const s of r.states){
  assert.equal(s.targetActiveSingleton,true);
  assert.equal(s.targetProjectedToP1,true);
  assert.deepEqual(s.playableP2Singletons,[]);
  assert.equal(s.targetReservoirTemplateExists,false);
  assert.equal(typeof s.cpcAgreement.oneColumnRestriction,'boolean');
  assert.ok(Array.isArray(s.legalDefenderReplies));
  assert.equal(s.replies.length,s.legalDefenderReplies.length);
  assert.equal(
    s.cpcReentryPromising,
    s.cpcAgreement.oneColumnRestriction &&
      s.replies.every(x=>x.defenderTerminal!==1) &&
      s.replies.filter(x=>x.defenderColumn!==s.cpcAgreement.forcedColumn).every(x=>x.immediateP1WinningColumns.length>0)
  );
  if(s.cpcAgreement.oneColumnRestriction){
    const forced=s.replies.find(x=>x.defenderColumn===s.cpcAgreement.forcedColumn);
    assert(forced);
    if(forced.defenderTerminal===0)assert(forced.forcedChildProfile);
  }
}
assert.equal(r.summary.promisingCount,r.states.filter(x=>x.cpcReentryPromising).length);
assert.deepEqual(r.summary.promisingIds,r.states.filter(x=>x.cpcReentryPromising).map(x=>x.id));
assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('discovery evidence')));

console.log(JSON.stringify({
  pass:true,
  states:r.states.map(x=>({id:x.id,cpc:x.cpcAgreement,promising:x.cpcReentryPromising})),
  promisingCount:r.summary.promisingCount
}));
