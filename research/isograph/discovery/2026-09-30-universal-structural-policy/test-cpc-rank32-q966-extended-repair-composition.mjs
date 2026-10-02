import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank32-q966-extended-repair-composition.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank32_q966_extended_repair_composition.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.exactQClass,'966e6353e06e4d41');
assert.equal(r.rank,32);
assert.deepEqual(r.support,[6,6,3,6,5,5,1]);
assert.equal(r.target,'G3');
assert.equal(r.mu,2);
assert.deepEqual(r.actions.map(x=>x.action),['E','F']);
for(const a of r.actions){
  assert.equal(a.muAfterAction,1);
  assert.ok(a.replies.length>0);
  assert.ok(['ACCEPTED','COUNTEREXAMPLE','UNRESOLVED'].includes(a.disposition));
  for(const x of a.replies){
    assert.ok(['P1_TERMINAL','P0_WIN','UNKNOWN'].includes(x.disposition));
    if(x.disposition==='P0_WIN')assert.ok(x.positiveCertificates.length>0);
  }
  if(a.disposition==='ACCEPTED')assert.ok(a.replies.every(x=>x.disposition==='P0_WIN'));
}
assert.ok(['Q966_WIN','Q966_COUNTEREXAMPLE','Q966_UNRESOLVED'].includes(r.classification));
if(r.classification==='Q966_WIN')assert.ok(r.actions.some(x=>x.disposition==='ACCEPTED'));
assert.equal(r.summary.resourceFailureCount,0);
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.legacyRepairModified,false);
assert.equal(r.rcicModified,false);
assert.equal(r.bsfpModified,false);
console.log(JSON.stringify({pass:true,classification:r.classification,actions:r.actions.map(x=>({action:x.action,disposition:x.disposition,replies:x.replies.length})),summary:r.summary}));
