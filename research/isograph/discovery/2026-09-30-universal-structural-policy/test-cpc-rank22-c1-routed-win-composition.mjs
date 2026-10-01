import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const library=process.argv[2];
assert(library);
const dir=dirname(fileURLToPath(import.meta.url));
const runner=resolve(dir,'run-cpc-rank22-c1-routed-win-composition.mjs');
const raw=execFileSync(process.execPath,[runner,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank22_c1_routed_win_composition.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.rank22.sequence,'4444415666662322224233');
assert.equal(r.rank22.rank,22);
assert.equal(r.rank22.mover,1);
assert.deepEqual(r.rank22.support,[1,6,3,6,1,5,0]);
assert.equal(r.p1Column,1);
assert.deepEqual(r.legalDefenderReplies,[1,3,5,6,7]);

const byCol=new Map(r.routes.map(x=>[x.defenderColumn,x]));
for(const [c,kind] of [[1,'EXACT_RANK24_ZUGZWANG_HANDOFF'],[3,'EXACT_RANK24_SINGLETON_HANDOFF'],[7,'EXACT_RANK24_ROUTED_HANDOFF']]){
  const x=byCol.get(c);
  assert.equal(x.kind,kind);
  assert.equal(x.exactHandoff,true);
  assert.equal(x.premise.accept,true);
  assert.equal(x.accept,true);
}
for(const [c,kind] of [[5,'LOCAL_SHORT_COMPRESSION_RCIC'],[6,'LOCAL_HEIGHT1_COMPRESSION_RCIC']]){
  const x=byCol.get(c);
  assert.equal(x.kind,kind);
  assert.equal(x.localBranchAccept,true);
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
