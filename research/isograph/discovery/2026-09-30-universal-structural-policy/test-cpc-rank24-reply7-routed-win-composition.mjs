import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const library=process.argv[2];
assert(library);
const dir=dirname(fileURLToPath(import.meta.url));
const runner=resolve(dir,'run-cpc-rank24-reply7-routed-win-composition.mjs');
const raw=execFileSync(process.execPath,[runner,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank24_reply7_routed_win_composition.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.rank24.sequence,'444441566666232222423317');
assert.equal(r.rank24.rank,24);
assert.equal(r.rank24.mover,1);
assert.deepEqual(r.rank24.support,[2,6,3,6,1,5,1]);
assert.equal(r.p1Column,7);
assert.deepEqual(r.legalDefenderReplies,[1,3,5,6,7]);

const byCol=new Map(r.routes.map(x=>[x.defenderColumn,x]));
for(const c of [1,3,6]){
  const x=byCol.get(c);
  assert.equal(x.kind,'FRESH_TARGET_RESERVOIR_REENTRY');
  assert.equal(x.accept,true);
}
{
  const x=byCol.get(5);
  assert.equal(x.kind,'EXACT_RANK26_HANDOFF');
  assert.equal(x.exactHandoff,true);
  assert.equal(x.premise.accept,true);
  assert.equal(x.accept,true);
}
{
  const x=byCol.get(7);
  assert.equal(x.kind,'P1C1_EXACT_RANK27_HANDOFF');
  assert.equal(x.p1Column,1);
  assert.equal(x.exactHandoff,true);
  assert.equal(x.premise.accept,true);
  assert.equal(x.accept,true);
}

assert.equal(r.accept,true);
assert.equal(r.rejectionReason,null);
assert.ok(r.conclusion.some(x=>x.includes('proof routing')));
assert.ok(r.boundary.some(x=>x.includes('No new game-specific proof primitive')));
console.log(JSON.stringify({
  pass:true,
  accept:r.accept,
  routes:r.routes.map(x=>({defenderColumn:x.defenderColumn,kind:x.kind,accept:x.accept}))
}));
