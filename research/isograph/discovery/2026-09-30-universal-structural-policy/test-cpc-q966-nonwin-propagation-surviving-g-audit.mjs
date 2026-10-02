import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-q966-nonwin-propagation-surviving-g-audit.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_q966_nonwin_propagation_surviving_g_audit.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.exactQClass,'966e6353e06e4d41');
assert.equal(r.rank,32);
assert.deepEqual(r.support,[6,6,3,6,5,5,1]);
assert.equal(r.exactBridge.pass,true);

assert.equal(r.q2dbPremise.classification,'P0_NONWIN');
assert.equal(r.q2dbPremise.interval.lower,-1);
assert.equal(r.q2dbPremise.interval.upper,0);

assert.equal(r.q5dPremise.classification,'P0_NONWIN');
assert.equal(r.q5dPremise.interval.lower,-1);
assert.equal(r.q5dPremise.interval.upper,0);

assert.deepEqual(r.rootActions.map(x=>x.column),[3,5,6,7]);
assert.ok(r.rootActions.every(x=>x.interval.upper<=0));
assert.equal(r.rootActions.find(x=>x.column===3).kind,'P1_TERMINAL_REPLY');
assert.equal(r.rootActions.find(x=>x.column===5).kind,'EXACT_Q2DB_NONWIN_REPLY');
assert.equal(r.rootActions.find(x=>x.column===6).kind,'EXACT_Q2DB_NONWIN_REPLY');
assert.equal(r.rootActions.find(x=>x.column===7).kind,'EXACT_Q5D_NONWIN_HANDOFF');

assert.equal(r.classification,'Q966_P0_NONWIN');
assert.equal(r.interval.lower,-1);
assert.equal(r.interval.upper,0);
assert.equal(r.resourceFailureCount,0);

assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

console.log(JSON.stringify({
  pass:true,
  classification:r.classification,
  interval:r.interval,
  q2db:r.q2dbPremise,
  q5d:r.q5dPremise,
  root:r.rootActions
}));
