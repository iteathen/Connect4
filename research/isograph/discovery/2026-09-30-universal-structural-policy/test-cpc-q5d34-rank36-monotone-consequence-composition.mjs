import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-q5d34-rank36-monotone-consequence-composition.mjs');
const library=process.argv[2]; assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:128*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_q5d34_rank36_monotone_consequence_composition.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.sourceQ,'5d34e24395b9d801');
assert.equal(r.rank,34);
assert.deepEqual(r.safeP0Actions,[5,6,7]);
assert.equal(r.physicalReplyHistoryCount,10);
assert.equal(r.uniqueQClassCount,9);
assert.equal(r.qClassifications.length,9);
assert.equal(r.rootActions.length,3);
assert.deepEqual(r.rootActions.map(x=>x.p0Action),[5,6,7]);

const dispositionSet=new Set(['P0_WIN','P0_LOSS','UNKNOWN']);
for(const q of r.qClassifications){
  assert.equal(q.rank,36);
  assert.ok(/^[0-9a-f]{16}$/.test(q.exactQClass));
  assert.ok(dispositionSet.has(q.disposition));
  assert.equal(q.exactBridge.pass,true);
  assert.ok(Array.isArray(q.positiveCertificates));
  assert.equal(typeof q.lossCertificate.loss,'boolean');
  assert.equal(q.positiveCertificates.length>0&&q.lossCertificate.loss,true&&false);
}

const actionSet=new Set(['P0_ACTION_WIN_ALL_REPLIES','P0_ACTION_FAILS_LOSS_REPLY','P0_ACTION_UNKNOWN']);
for(const a of r.rootActions){
  assert.ok(actionSet.has(a.classification));
  assert.ok(a.replyQClasses.length>=1);
  assert.ok(a.replyQClasses.every(x=>/^[0-9a-f]{16}$/.test(x)));
}
assert.ok(new Set(['P0_WIN_EXISTS_ACTION','P0_LOSS_ALL_ACTIONS','UNKNOWN']).has(r.classification));

const merge=r.exactQMergeGroups.find(x=>x.exactQClass==='e5d63da12420fdb3');
assert(merge);
assert.equal(merge.memberCount,2);
assert.deepEqual(merge.members.map(x=>x.p0Action).sort((a,b)=>a-b),[5,6]);

assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.legacyRepairModified,false);
assert.equal(r.rcicModified,false);
assert.equal(r.forcedLossModified,false);
assert.equal(r.bsfpModified,false);
assert.ok(r.boundary.some(x=>x.includes('No solved W/D/L')));

console.log(JSON.stringify({
  pass:true,
  classification:r.classification,
  uniqueQClassCount:r.uniqueQClassCount,
  dispositionCounts:r.summary.dispositionCounts,
  rootActions:r.rootActions.map(x=>({p0Action:x.p0Action,classification:x.classification,replyQClasses:x.replyQClasses})),
  firstUnresolved:r.summary.firstUnresolvedQ??null
}));
