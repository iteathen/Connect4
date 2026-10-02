import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank30-d1-a-mu1-coupled-target-obligation.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank30_d1_a_mu1_coupled_target_obligation.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.sourceSiblingQ,'966e6353e06e4d41');
assert.equal(r.cases.length,2);
assert.deepEqual(r.cases.map(x=>x.sourceQ).sort(),['2bb8598461e3e623','8fed7b5f375c7093'].sort());

for(const x of r.cases){
  assert.equal(x.rank,34);
  assert.equal(x.target,'G3');
  assert.equal(x.targetLive,true);
  assert.equal(x.targetSupportDistance,1);
  assert.equal(x.mu,1);
  assert.ok(x.enabledP1Singletons.includes('C5'));
  assert.equal(x.forcedBlock.column,3);
  assert.equal(typeof x.forcedBlock.forced,'boolean');
  assert.ok(['COMPOSED_WIN','COUNTEREXAMPLE','UNRESOLVED'].includes(x.disposition));
  if(x.forcedBlock.forced){
    assert.equal(x.forcedBlock.blockLegal,true);
    assert.equal(x.forcedBlock.blockTerminal,false);
    assert.ok(x.postBlockReplies.length>0);
  }
  for(const y of x.postBlockReplies){
    assert.ok(['P1_TERMINAL','P0_WIN','UNKNOWN'].includes(y.disposition));
    if(y.disposition==='P0_WIN')assert.ok(y.positiveCertificates.length>0);
    if(y.disposition==='UNKNOWN')assert.equal(y.positiveCertificates.length,0);
  }
  if(x.disposition==='COMPOSED_WIN'){
    assert.equal(x.forcedBlock.forced,true);
    assert.ok(x.postBlockReplies.every(y=>y.disposition==='P0_WIN'));
  }
  if(x.disposition==='COUNTEREXAMPLE'){
    assert.ok(x.forcedBlock.forced===false||x.postBlockReplies.some(y=>y.disposition==='P1_TERMINAL'));
  }
}

assert.equal(r.summary.resourceFailureCount,0);
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.legacyRepairModified,false);
assert.equal(r.rcicModified,false);
assert.equal(r.bsfpModified,false);
console.log(JSON.stringify({
  pass:true,
  dispositions:r.cases.map(x=>({q:x.sourceQ,disposition:x.disposition,forced:x.forcedBlock.forced,closed:x.postBlockReplies.filter(y=>y.disposition==='P0_WIN').length,total:x.postBlockReplies.length})),
  summary:r.summary
}));
