import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-q5d34-g4-ef-reply-g5-survivor.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_q5d34_g4_ef_reply_g5_survivor.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.deepEqual(r.cases.map(x=>x.predecessorQ),['f435a6ec7dd5469e','6c9a60f756817109']);
assert.deepEqual(r.cases.map(x=>x.survivorQ),['5992c0c8965586f2','7cac0ef80f3901f7']);
for(const x of r.cases){
  assert.equal(x.survivorRank,37);
  assert.ok(['P0_WIN_FORCED_CHAIN','P0_LOSS_FORCED_CHAIN','DRAW_FULL_BOARD','UNRESOLVED_MULTIPLE_SAFE'].includes(x.survivorClassification));
  assert.ok(['P0_WIN','P0_NONWIN','UNKNOWN'].includes(x.predecessorDisposition));
  assert.ok(x.steps.length>=1);
}
assert.ok(['G4_P0_NONWIN','G4_STILL_UNRESOLVED'].includes(r.classification));
assert.ok(['Q5D_P0_NONWIN','Q5D_UNRESOLVED'].includes(r.q5dImplication));
if(r.classification==='G4_P0_NONWIN')assert.ok(r.cases.some(x=>x.predecessorDisposition==='P0_NONWIN'));
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);
console.log(JSON.stringify({pass:true,classification:r.classification,q5dImplication:r.q5dImplication,cases:r.cases.map(x=>({predecessor:x.predecessorQ,survivor:x.survivorQ,survivorClassification:x.survivorClassification,predecessorDisposition:x.predecessorDisposition,forced:x.forcedSequence}))}));
