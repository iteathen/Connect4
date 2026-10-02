import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank30-d21-structural-nonwin-backprop.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank30_d21_structural_nonwin_backprop.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.exactQClass,'d21a89605c399aca');
assert.equal(r.sequence,'444441566666232222425511515311');
assert.equal(r.rank,30);
assert.deepEqual(r.support,[6,6,2,6,5,5,0]);
assert.equal(r.exactBridge.pass,true);

assert.equal(r.q966Premise.classification,'Q966_P0_NONWIN');
assert.deepEqual(r.q966Premise.interval,{lower:-1,upper:0});

assert.deepEqual(r.rootActions.map(x=>x.column),[3,5,6,7]);
assert.equal(r.rootActions.find(x=>x.column===3).kind,'EXACT_Q966_NONWIN_REPLY');
for(const c of [5,6,7]){
  const x=r.rootActions.find(y=>y.column===c);
  assert.equal(x.kind,'RANK32_FORCED_OBLIGATION_LOSS');
  assert.deepEqual(x.interval,{lower:-1,upper:-1});
}
assert.ok(r.rootActions.every(x=>x.interval.upper<=0));

assert.equal(r.classification,'P0_NONWIN');
assert.deepEqual(r.interval,{lower:-1,upper:0});
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
  rootActions:r.rootActions
}));
