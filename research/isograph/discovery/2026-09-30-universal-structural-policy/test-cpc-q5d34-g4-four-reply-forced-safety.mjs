import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-q5d34-g4-four-reply-forced-safety.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_q5d34_g4_four_reply_forced_safety.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.sourceQ,'5d34e24395b9d801');
assert.equal(r.p0Action,7);
assert.deepEqual(r.replies.map(x=>x.p1Action),[3,5,6,7]);
assert.deepEqual(r.replies.map(x=>x.startQ),[
  '66739b4c27954716',
  'f435a6ec7dd5469e',
  '6c9a60f756817109',
  '1eb5ab134528f402'
]);
for(const x of r.replies){
  assert.equal(x.startRank,36);
  assert.ok(['P0_WIN_FORCED_CHAIN','P0_LOSS_FORCED_CHAIN','DRAW_FULL_BOARD','UNRESOLVED_MULTIPLE_SAFE'].includes(x.classification));
  assert.ok(x.steps.length>=1);
}
assert.ok(['G4_P0_WIN','G4_P0_NONWIN','G4_UNRESOLVED'].includes(r.classification));
assert.ok(['Q5D_P0_WIN','Q5D_P0_NONWIN','Q5D_UNRESOLVED'].includes(r.q5dImplication));
if(r.classification==='G4_P0_WIN')assert.equal(r.replies.every(x=>x.classification==='P0_WIN_FORCED_CHAIN'),true);
if(r.classification==='G4_P0_NONWIN')assert.ok(r.replies.some(x=>x.classification==='P0_LOSS_FORCED_CHAIN'||x.classification==='DRAW_FULL_BOARD'));
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

console.log(JSON.stringify({
  pass:true,
  classification:r.classification,
  q5dImplication:r.q5dImplication,
  replies:r.replies.map(x=>({p1Action:x.p1Action,q:x.startQ,classification:x.classification,forced:x.forcedSequence}))
}));
