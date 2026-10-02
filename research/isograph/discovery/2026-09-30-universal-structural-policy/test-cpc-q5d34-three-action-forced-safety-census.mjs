import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-q5d34-three-action-forced-safety-census.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_q5d34_three_action_forced_safety_census.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.sourceQ,'5d34e24395b9d801');
assert.equal(r.rank,34);
assert.deepEqual(r.support,[6,6,3,6,5,5,3]);
assert.deepEqual(r.children.map(x=>x.p0Action),[5,6,7]);
assert.deepEqual(r.children.map(x=>x.startQ),['fbb987f9d3becc5b','d22c464c13d0aab6','a2feb3b4c09b10f3']);
for(const x of r.children){
  assert.equal(x.startRank,35);
  assert.ok(['P0_WIN_FORCED_CHAIN','P0_LOSS_FORCED_CHAIN','DRAW_FULL_BOARD','UNRESOLVED_MULTIPLE_SAFE'].includes(x.classification));
  assert.ok(x.steps.length>=1);
}
assert.ok(['Q5D_P0_WIN','Q5D_P0_LOSS','Q5D_P0_DRAW_OR_LOSS','Q5D_UNRESOLVED'].includes(r.classification));
if(r.classification==='Q5D_P0_WIN')assert.ok(r.winningActions.length>=1);
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);
console.log(JSON.stringify({
  pass:true,
  classification:r.classification,
  children:r.children.map(x=>({p0Action:x.p0Action,q:x.startQ,classification:x.classification,forced:x.forcedSequence})),
  winningActions:r.winningActions
}));
