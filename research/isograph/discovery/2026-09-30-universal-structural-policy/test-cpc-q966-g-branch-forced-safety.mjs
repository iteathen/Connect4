import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-q966-g-branch-forced-safety.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8'});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_q966_g_branch_forced_safety.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.sourceQ,'966e6353e06e4d41');
assert.equal(r.startQ,'e0a395d3dff723c5');
assert.equal(r.startRank,33);
assert.deepEqual(r.startSupport,[6,6,3,6,5,5,2]);
assert.equal(r.steps[0].mover,'P1');
assert.ok(['P0_WIN_FORCED_CHAIN','P0_LOSS_FORCED_CHAIN','DRAW_FULL_BOARD','UNRESOLVED_MULTIPLE_SAFE'].includes(r.classification));
assert.ok(r.steps.length>=1&&r.steps.length<=10);
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);
console.log(JSON.stringify({pass:true,classification:r.classification,forced:r.forcedSequence,steps:r.steps.length}));
