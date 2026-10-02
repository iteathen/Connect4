import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank34-q2db-two-column-choice-elimination.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank34_q2db_two_column_choice_elimination.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.exactQClass,'2db2abcb67d530e0');
assert.equal(r.rank,34);
assert.deepEqual(r.support,[6,6,3,6,6,6,1]);
assert.equal(r.target,'G3');
assert.deepEqual(r.legalP0Columns,[3,7]);
assert.deepEqual(r.actions.map(x=>x.p0Column),[3,7]);
for(const a of r.actions){
  assert.ok(['ACCEPTED','ELIMINATED','UNRESOLVED'].includes(a.disposition));
  assert.ok(Array.isArray(a.replies));
  for(const x of a.replies){
    assert.ok(['P1_TERMINAL','P0_WIN','UNKNOWN'].includes(x.disposition));
    if(x.disposition==='P0_WIN')assert.ok(x.positiveCertificates.length>0);
  }
}
const c=r.actions.find(x=>x.p0Column===3);assert(c);
assert.equal(c.disposition,'ELIMINATED');
assert.ok(c.replies.some(x=>x.disposition==='P1_TERMINAL'));
assert.ok(['Q2DB_WIN','Q2DB_LOSS','Q2DB_UNRESOLVED'].includes(r.classification));
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
  classification:r.classification,
  actions:r.actions.map(x=>({p0Column:x.p0Column,disposition:x.disposition,replies:x.replies.map(y=>({reply:y.replyColumn,disposition:y.disposition,routes:y.positiveCertificates.map(z=>z.kind)}))})),
  summary:r.summary
}));
