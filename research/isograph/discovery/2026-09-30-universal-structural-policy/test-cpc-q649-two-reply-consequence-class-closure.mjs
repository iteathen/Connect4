import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-q649-two-reply-consequence-class-closure.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8'});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_q649_two_reply_consequence_class_closure.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.sourceQ,'6496c888c4e2a157');
assert.equal(r.rank,37);
assert.deepEqual(r.support,[6,6,3,6,6,6,4]);
assert.equal(r.children.length,2);
assert.deepEqual(r.children.map(x=>x.p1Action),[3,7]);
assert.deepEqual(r.children.map(x=>x.startQ),['28d9883e71b855c4','e7eb0902f1f7984c']);
for(const x of r.children){
  assert.equal(x.startRank,38);
  assert.ok(['P0_WIN_FORCED_CHAIN','P0_LOSS_FORCED_CHAIN','DRAW_FULL_BOARD','UNRESOLVED_MULTIPLE_SAFE'].includes(x.classification));
  assert.ok(x.steps.length>=1);
}
assert.ok(['P0_WIN_ALL_P1_REPLIES','P0_LOSS_P1_REPLY','P0_NONWIN_DRAW_REPLY','UNRESOLVED'].includes(r.classification));
if(r.classification==='P0_WIN_ALL_P1_REPLIES')assert.ok(r.children.every(x=>x.classification==='P0_WIN_FORCED_CHAIN'));
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);
console.log(JSON.stringify({pass:true,classification:r.classification,children:r.children.map(x=>({action:x.p1Action,class:x.classification,forced:x.forcedSequence})),q2db:r.q2dbTransportedClassification}));
