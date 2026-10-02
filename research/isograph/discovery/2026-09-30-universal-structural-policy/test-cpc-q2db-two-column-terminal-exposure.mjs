import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-q2db-two-column-terminal-exposure.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8'});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_q2db_two_column_terminal_exposure.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.exactQClass,'2db2abcb67d530e0');
assert.equal(r.rank,34);
assert.deepEqual(r.support,[6,6,3,6,6,6,1]);
assert.deepEqual(r.legalP0Columns,[3,7]);
assert.equal(r.actions.length,2);
for(const x of r.actions){
  assert.ok([3,7].includes(x.p0Column));
  assert.equal(x.p0ImmediateTerminal,false);
  assert.ok(Array.isArray(x.p1ImmediateTerminals));
  assert.ok(Array.isArray(x.enabledP1Singletons));
}
assert.ok(['P0_LOSS_TERMINAL_EXPOSURE','P0_WIN_IMMEDIATE','UNRESOLVED'].includes(r.classification));
if(r.classification==='P0_LOSS_TERMINAL_EXPOSURE')assert.ok(r.actions.every(x=>x.p1ImmediateTerminals.length>0));
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);
console.log(JSON.stringify({pass:true,classification:r.classification,actions:r.actions}));
