import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-q2db-forced-terminal-safety-chain.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8'});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_q2db_forced_terminal_safety_chain.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.startQ,'2db2abcb67d530e0');
assert.equal(r.startRank,34);
assert.deepEqual(r.startSupport,[6,6,3,6,6,6,1]);
assert.ok(r.steps.length>=1);
assert.equal(r.steps[0].mover,'P0');
assert.deepEqual(r.steps[0].safeActions,[7]);
assert.equal(r.steps[0].forcedAction,7);
assert.ok(['P0_WIN_FORCED_CHAIN','P0_LOSS_FORCED_CHAIN','DRAW_FULL_BOARD','UNRESOLVED_MULTIPLE_SAFE'].includes(r.classification));
assert.ok(r.steps.length<=9);
for(const step of r.steps){
  assert.ok(['P0','P1'].includes(step.mover));
  assert.ok(Array.isArray(step.legalActions));
  assert.ok(Array.isArray(step.immediateTerminalActions));
  assert.ok(Array.isArray(step.actionAudit));
  assert.ok(Array.isArray(step.safeActions));
}
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);
console.log(JSON.stringify({pass:true,classification:r.classification,forcedSequence:r.forcedSequence,steps:r.steps.length}));
