import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const library=process.argv[2];
assert(library);
const dir=dirname(fileURLToPath(import.meta.url));
const runner=resolve(dir,'run-cpc-rank27-c5-obstruction-endpoint-handoff.mjs');
const raw=execFileSync(process.execPath,[runner,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank27_c5_obstruction_endpoint_handoff.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.state.rank,27);
assert.equal(r.state.mover,2);
assert.deepEqual(r.state.support,[2,6,3,6,2,5,3]);
assert.equal(r.state.c5r5Singleton,true);
assert.equal(r.state.obstructionPresent,true);
assert.deepEqual(r.legalDefenderReplies,[1,3,5,6,7]);
assert.equal(r.rows.length,5);

const contested=r.rows.find(x=>x.defenderColumn===5);
assert(contested);
assert.equal(contested.kind,'contested-c3-target');
assert.equal(contested.replyTerminal,0);
assert.equal(contested.p1MoveColumn,1);
assert.equal(contested.p1MoveTerminal,0);
assert.equal(contested.c3r5P1Singleton,true);
assert.ok(contested.targetTemplate);
assert.equal(contested.targetTemplate.targetIsResponse,true);
assert.equal(contested.validation.pass,true);
assert.equal(contested.accept,true);

for(const col of [1,3,6,7]){
  const row=r.rows.find(x=>x.defenderColumn===col);
  assert(row);
  assert.equal(row.kind,'c5-endpoint-block');
  assert.equal(row.replyTerminal,0);
  assert.equal(row.p1MoveColumn,5);
  assert.equal(row.p1MoveTerminal,0);
  assert.equal(row.obstructionPresentAfterBlock,false);
  assert.equal(row.c5r5Singleton,true);
  assert.deepEqual(row.defenderPlayableSingletons,[]);
  assert.ok(row.targetTemplate);
  assert.equal(row.targetTemplate.targetIsResponse,true);
  assert.equal(row.validation.pass,true);
  assert.equal(row.accept,true);
}

assert.equal(r.accept,true);
assert.ok(r.conclusion.some(x=>x.includes('rank-27')));
console.log(JSON.stringify({pass:true,accept:r.accept,state:r.state,rows:r.rows.map(x=>({defenderColumn:x.defenderColumn,kind:x.kind,accept:x.accept})),conclusion:r.conclusion}));
