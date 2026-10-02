import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank30-d1-a-q9f-handoff-continuation.mjs');
const raw=execFileSync(process.execPath,[script],{encoding:'utf8',maxBuffer:32*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank30_d1_a_q9f_handoff_continuation.v1');
assert.equal(r.sourceLeafId,'SECOND_D1_C5_CONTRACTION:A->A');
assert.equal(r.sourceExactQClass,'d21a89605c399aca');
assert.equal(r.rank,30);
assert.deepEqual(r.support,[6,6,2,6,5,5,0]);
assert.equal(r.rootMove,3);
assert.equal(r.rawDefenderReplyCount,4);
assert.equal(r.defenderReplies.length,4);

const first=r.defenderReplies[0];
assert.equal(first.defenderColumn,3);
assert.equal(first.lowerQClass,'9f6b7a33ab7e9552');
assert.equal(first.proved,true);
assert.equal(first.expression,'Q9F_RCIC');
assert.equal(first.proofKind,'EXACT_Q9F_HANDOFF');

assert.ok(['ROOT_MOVE_C3_PROVED','CONTINUATION_UNRESOLVED'].includes(r.classification));
if(r.classification==='ROOT_MOVE_C3_PROVED'){
  assert.equal(r.firstUnresolved,null);
  assert.equal(r.provedReplyCount,4);
  assert.ok(typeof r.rank5Expression==='string');
}else{
  assert.ok(r.firstUnresolved);
  assert.ok(r.provedReplyCount>=1&&r.provedReplyCount<4);
}
assert.equal(r.q9fSourceEvidenceAccepted,true);
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.rankGrammarModified,false);
assert.equal(r.bsfpModified,false);
console.log(JSON.stringify({
  pass:true,
  classification:r.classification,
  provedReplyCount:r.provedReplyCount,
  firstUnresolved:r.firstUnresolved,
  expression:r.rank5Expression
}));
