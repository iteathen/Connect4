import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const library=process.argv[2];
assert(library);
const dir=dirname(fileURLToPath(import.meta.url));
const runner=resolve(dir,'run-cpc-rank26-reply7-forced-chain-win-composition.mjs');
const raw=execFileSync(process.execPath,[runner,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank26_reply7_forced_chain_win_composition.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.rank26.rank,26);
assert.equal(r.rank26.mover,1);
assert.deepEqual(r.rank26.support,[2,6,3,6,2,5,2]);
assert.equal(r.layerA.p1Column,5);
assert.equal(r.layerA.cpc.baseline.forcedColumn,5);
assert.equal(r.layerA.cpc.frontier.forcedColumn,5);
assert.equal(r.layerA.handoff.defenderColumn,5);
assert.equal(r.layerA.handoff.rank,28);
assert.deepEqual(r.layerA.handoff.support,[2,6,3,6,4,5,2]);
assert.equal(r.layerB.p1Column,5);
assert.equal(r.layerB.cpc.baseline.forcedColumn,7);
assert.equal(r.layerB.cpc.frontier.forcedColumn,7);
assert.equal(r.layerB.handoff.defenderColumn,7);
assert.equal(r.layerB.handoff.rank,30);
assert.deepEqual(r.layerB.handoff.support,[2,6,3,6,5,5,3]);
assert.equal(r.layerC.p1Column,1);
assert.equal(r.layerC.handoff.rank,31);
assert.deepEqual(r.layerC.handoff.support,[3,6,3,6,5,5,3]);
assert.equal(r.layerC.premise.oracleUsed,false);
assert.equal(r.layerC.premise.solvedInputsUsed,false);
assert.equal(r.layerC.premise.ordinaryGameTreeSearchUsed,false);
assert.equal(typeof r.accept,'boolean');
assert.ok(r.boundary.some(x=>x.includes('No diagnostic W/D/L')));
console.log(JSON.stringify({
  pass:true,
  accept:r.accept,
  layerA:{forced:r.layerA.cpc.baseline.forcedColumn,offForced:r.layerA.offForcedReplies},
  layerB:{forced:r.layerB.cpc.baseline.forcedColumn,offForced:r.layerB.offForcedReplies},
  layerC:{premiseAccept:r.layerC.premise.accept,target:r.layerC.premise.target},
  rejectionReason:r.rejectionReason
}));
