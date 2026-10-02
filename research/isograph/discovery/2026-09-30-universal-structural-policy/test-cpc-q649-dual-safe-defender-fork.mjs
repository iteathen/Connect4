import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-q649-dual-safe-defender-fork.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_q649_dual_safe_defender_fork.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.exactQClass,'6496c888c4e2a157');
assert.equal(r.sequence,'4444415666662322224255115153113756777');
assert.equal(r.rank,37);
assert.deepEqual(r.support,[6,6,3,6,6,6,4]);
assert.equal(r.mover,'P1');
assert.deepEqual(r.legalP1Columns,[3,7]);
assert.deepEqual(r.replies.map(x=>x.p1Column),[3,7]);

for(const x of r.replies){
  assert.equal(x.rank,38);
  assert.ok(typeof x.exactQClass==='string'&&x.exactQClass.length===16);
  assert.ok(['P0_WIN','UNKNOWN'].includes(x.disposition));
  assert.ok(Array.isArray(x.routeAttempts));
  assert.ok(Array.isArray(x.acceptedRoutes));
  if(x.disposition==='P0_WIN')assert.ok(x.acceptedRoutes.length>0);
  if(x.disposition==='UNKNOWN')assert.equal(x.acceptedRoutes.length,0);
}

assert.ok(['Q649_P0_WIN','Q649_UNRESOLVED'].includes(r.classification));
if(r.classification==='Q649_P0_WIN'){
  assert.equal(r.replies.every(x=>x.disposition==='P0_WIN'),true);
  assert.equal(r.feedback.q2dbClosed,true);
}
if(r.classification==='Q649_UNRESOLVED'){
  assert.ok(r.summary.smallestUnknownChild);
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
  classification:r.classification,
  replies:r.replies.map(x=>({p1Column:x.p1Column,q:x.exactQClass,disposition:x.disposition,routes:x.acceptedRoutes.map(y=>y.kind)})),
  summary:r.summary
}));
