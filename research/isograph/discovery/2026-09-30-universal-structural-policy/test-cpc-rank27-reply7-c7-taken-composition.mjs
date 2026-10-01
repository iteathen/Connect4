import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const library=process.argv[2];
assert(library);
const dir=dirname(fileURLToPath(import.meta.url));
const runner=resolve(dir,'run-cpc-rank27-reply7-c7-taken-composition.mjs');
const raw=execFileSync(process.execPath,[runner,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank27_reply7_c7_taken_composition.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.state.rank,27);
assert.equal(r.state.mover,2);
assert.deepEqual(r.state.support,[3,6,3,6,1,5,3]);
assert.equal(r.state.c3r5Singleton,true);
assert.deepEqual(r.legalDefenderReplies,[1,3,5,6,7]);
assert.equal(r.rows.length,5);

const c3=r.rows.find(x=>x.defenderColumn===3);
assert(c3);
assert.equal(c3.kind,'target-support-trigger');
assert.equal(c3.p1TargetTerminal,3);
assert.equal(c3.accept,true);

const c6=r.rows.find(x=>x.defenderColumn===6);
assert(c6);
assert.equal(c6.kind,'qualified-rank28-handoff');
assert.equal(c6.replyTerminal,0);
assert.equal(c6.exactChildMatchesQualifiedRank28Root,true);
assert.equal(c6.premise.accept,true);
assert.equal(c6.accept,true);

for(const col of [1,5,7]){
  const row=r.rows.find(x=>x.defenderColumn===col);
  assert(row);
  assert.equal(row.kind,'c6-blocker-reentry');
  assert.equal(row.replyTerminal,0);
  assert.equal(row.blockColumn,6);
  assert.equal(row.blockTerminal,0);
  assert.equal(row.targetActiveAfterBlock,true);
  assert.deepEqual(row.defenderPlayableSingletons,[]);
  assert.ok(row.targetTemplate);
  assert.equal(row.validation.pass,true);
  assert.equal(row.accept,true);
}

assert.equal(r.accept,true);
assert.ok(r.conclusion.some(x=>x.includes('rank-27')));
console.log(JSON.stringify({pass:true,accept:r.accept,state:r.state,rows:r.rows.map(x=>({defenderColumn:x.defenderColumn,kind:x.kind,accept:x.accept})),conclusion:r.conclusion}));
