import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-q1e-d21-successor-exact-convergence.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_q1e_d21_successor_exact_convergence.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.design,'CPC_Q1E_D21_SUCCESSOR_EXACT_CONVERGENCE_DESIGN_0_1.md');

assert.equal(r.q1e.exactQClass,'1e8601e86599ef24');
assert.equal(r.q1e.rank,30);
assert.deepEqual(r.q1e.support,[5,6,3,6,5,5,0]);
assert.equal(r.q1e.exactBridge.pass,true);

assert.equal(r.d21.exactQClass,'d21a89605c399aca');
assert.equal(r.d21.rank,30);
assert.deepEqual(r.d21.support,[6,6,2,6,5,5,0]);
assert.equal(r.d21.exactBridge.pass,true);

assert.deepEqual(r.successors.q1eAfterA.support,[6,6,3,6,5,5,0]);
assert.deepEqual(r.successors.d21AfterC.support,[6,6,3,6,5,5,0]);
assert.equal(typeof r.convergence.exactQEqual,'boolean');
assert.equal(r.convergence.supportEqual,true);
assert.equal(typeof r.convergence.p0ResidualsEqual,'boolean');
assert.equal(typeof r.convergence.p1ResidualsEqual,'boolean');
assert.equal(
  r.convergence.exactQEqual,
  r.convergence.supportEqual&&r.convergence.p0ResidualsEqual&&r.convergence.p1ResidualsEqual
);

assert.equal(r.q1eRootActions.length,5);
assert.deepEqual(r.q1eRootActions.map(x=>x.column),[1,3,5,6,7]);
for(const c of [3,5,6,7]){
  const a=r.q1eRootActions.find(x=>x.column===c);
  assert.equal(a.kind,'P1_A6_TERMINAL_REPLY');
  assert.deepEqual(a.interval,{lower:-1,upper:-1});
}
const a=r.q1eRootActions.find(x=>x.column===1);
assert.ok(a);

if(r.convergence.exactQEqual){
  assert.equal(r.afterG.q1eChildQ,'966e6353e06e4d41');
  assert.equal(r.afterG.d21ChildQ,'966e6353e06e4d41');
  assert.equal(r.afterG.sameExactQ,true);
  assert.equal(a.kind,'EXACT_Q966_NONWIN_REPLY_VIA_CONVERGENCE');
  assert.deepEqual(a.interval,{lower:-1,upper:0});
  assert.equal(r.classification,'P0_NONWIN');
  assert.deepEqual(r.interval,{lower:-1,upper:0});
}else{
  assert.equal(a.kind,'FORCED_A6_SUCCESSOR_UNRESOLVED');
  assert.deepEqual(a.interval,{lower:-1,upper:1});
  assert.equal(r.classification,'UNKNOWN');
  assert.deepEqual(r.interval,{lower:-1,upper:1});
  assert.ok(r.convergence.residualDifference);
}

assert.equal(r.resourceFailureCount,0);
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

console.log(JSON.stringify({
  pass:true,
  convergence:r.convergence,
  afterG:r.afterG,
  classification:r.classification,
  interval:r.interval
}));
