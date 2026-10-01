import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-legacy-repair-route-reentry-probe.mjs');
const library=process.argv[2];
assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_legacy_repair_route_reentry_probe.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);
assert.equal(r.sourceStates.length,5);
assert.deepEqual(r.sourceStates.map(x=>x.id),[
  'FIRST_D3_C1_CONTRACTION',
  'SECOND_D1_C5_CONTRACTION',
  'SECOND_D3_C5_CONTRACTION',
  'SECOND_D6_C5_CONTRACTION',
  'SECOND_D7_C5_CONTRACTION'
]);
assert.ok(r.sourceStates.every(x=>x.sourceExactBridge.pass===true));
assert.ok(r.sourceStates.every(x=>Array.isArray(x.defenderReplies)&&x.defenderReplies.length>0));
assert.ok(r.sourceStates.every(x=>x.defenderReplies.every(y=>y.terminal||y.childExactBridge?.pass===true)));
assert.ok(r.sourceStates.every(x=>typeof x.legacyRepairClosed==='boolean'));
assert.ok(Number.isInteger(r.summary.legacyRepairClosedCount));
assert.ok(Array.isArray(r.summary.legacyRepairClosedIds));
assert.ok(Array.isArray(r.summary.newlyRecoveredByLegacyRepairIds));
assert.ok(r.boundary.some(x=>x.includes('Production CPC')));

console.log(JSON.stringify({
  pass:true,
  sourceStates:r.sourceStates.length,
  legacyRepairClosedCount:r.summary.legacyRepairClosedCount,
  newlyRecoveredByLegacyRepairIds:r.summary.newlyRecoveredByLegacyRepairIds,
  resourceFailureCount:r.summary.resourceFailureCount
}));
