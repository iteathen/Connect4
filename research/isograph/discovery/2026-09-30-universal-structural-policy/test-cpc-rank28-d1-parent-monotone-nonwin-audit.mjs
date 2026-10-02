import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank28-d1-parent-monotone-nonwin-audit.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank28_d1_parent_monotone_nonwin_audit.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.sourceStateId,'SECOND_D1_C5_CONTRACTION');
assert.equal(r.sequence,'4444415666662322224255115153');
assert.equal(r.rank,28);
assert.deepEqual(r.support,[4,6,2,6,5,5,0]);
assert.equal(r.exactBridge.pass,true);
assert.match(r.exactQClass,/^[0-9a-f]{16}$/);
assert.deepEqual(r.legalRootActions,[1,3,5,6,7]);

const inherited=new Map(r.rootActions.filter(x=>x.column!==3).map(x=>[x.column,x]));
assert.deepEqual([...inherited.keys()].sort((a,b)=>a-b),[1,5,6,7]);
assert.equal(inherited.get(1).kind,'EXACT_D21_NONWIN_REPLY');
assert.deepEqual(inherited.get(1).interval,{lower:-1,upper:0});
for(const c of [5,6,7]){
  assert.equal(inherited.get(c).kind,'RANK30_FORCED_OBLIGATION_LOSS_REPLY');
  assert.deepEqual(inherited.get(c).interval,{lower:-1,upper:-1});
}

assert.equal(r.cAction.column,3);
assert.ok(Array.isArray(r.cAction.defenderReplies));
assert.ok(r.cAction.defenderReplies.length>0);
for(const child of r.cAction.defenderReplies){
  assert.equal(child.rank,30);
  assert.equal(child.exactBridge.pass,true);
  assert.ok(['P0_WIN','P0_LOSS','P0_NONWIN','UNKNOWN'].includes(child.disposition));
  assert.ok(Array.isArray(child.routeAttempts));
  assert.ok(Array.isArray(child.positiveCertificates));
  assert.ok(Array.isArray(child.legacyTargetFamilies));
  assert.equal(typeof child.lossCertificate,'object');
}
assert.ok([
  'P0_ACTION_LOSS_REPLY',
  'P0_ACTION_NONWIN_REPLY',
  'P0_ACTION_WIN_ALL_REPLIES',
  'P0_ACTION_UNKNOWN',
].includes(r.cAction.classification));

assert.ok(['P0_NONWIN','P0_WIN','UNKNOWN'].includes(r.classification));
if(r.classification==='P0_NONWIN'){
  assert.deepEqual(r.interval,{lower:-1,upper:0});
  assert.ok(r.rootActions.every(x=>x.interval.upper<=0));
}
if(r.classification==='P0_WIN'){
  assert.deepEqual(r.interval,{lower:1,upper:1});
  assert.equal(r.cAction.classification,'P0_ACTION_WIN_ALL_REPLIES');
}
if(r.classification==='UNKNOWN')assert.deepEqual(r.interval,{lower:-1,upper:1});

assert.ok(Number.isInteger(r.summary.resourceFailureCount));
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

console.log(JSON.stringify({
  pass:true,
  q:r.exactQClass,
  cAction:r.cAction,
  classification:r.classification,
  interval:r.interval,
  summary:r.summary,
}));
