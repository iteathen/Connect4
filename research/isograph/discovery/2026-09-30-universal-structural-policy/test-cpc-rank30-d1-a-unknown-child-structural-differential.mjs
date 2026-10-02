import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank30-d1-a-unknown-child-structural-differential.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank30_d1_a_unknown_child_structural_differential.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.sourceLeafId,'SECOND_D1_C5_CONTRACTION:A->A');
assert.equal(r.sourceExactQClass,'d21a89605c399aca');
assert.equal(r.siblings.length,4);
assert.deepEqual(r.siblings.map(x=>x.defenderColumn),[3,5,6,7]);
assert.ok(r.siblings.every(x=>x.exactBridge.pass===true));

const c3=r.siblings.find(x=>x.defenderColumn===3);
const c5=r.siblings.find(x=>x.defenderColumn===5);
const c6=r.siblings.find(x=>x.defenderColumn===6);
const c7=r.siblings.find(x=>x.defenderColumn===7);
assert.equal(c3.exactQClass,'9f6b7a33ab7e9552');
assert.equal(c5.exactQClass,'0fc9d79484d94df1');
assert.equal(c6.exactQClass,'9326596be55ae15a');
assert.equal(c7.exactQClass,'966e6353e06e4d41');

assert.ok(Array.isArray(c7.repairTargets));
assert.ok(c7.repairTargets.some(x=>x.target==='G3'));
const g3=c7.repairTargets.find(x=>x.target==='G3');
assert.equal(g3.proved,false);
assert.ok(g3.rejected.length>0);
assert.ok(g3.firstFailureWitnesses.length>0);

for(const x of [c5,c6,c7]){
  assert.ok(x.onePlyConsequences.length>0);
  assert.ok(x.onePlyConsequences.every(y=>y.actionColumn>=1&&y.actionColumn<=7));
}

assert.ok(Array.isArray(r.siblingDifferential.sharedUnresolvedButNotClosed));
assert.ok(Array.isArray(r.siblingDifferential.closedVsUnresolved));
assert.equal(r.summary.resourceFailureCount,0);
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.legacyRepairModified,false);
assert.equal(r.rcicModified,false);
assert.equal(r.forcedLossModified,false);
assert.equal(r.bsfpModified,false);

console.log(JSON.stringify({
  pass:true,
  repairG3:{rejected:g3.rejected.length,failures:g3.firstFailureWitnesses.length},
  onePly:Object.fromEntries([c5,c6,c7].map(x=>[x.defenderColumn,x.onePlyConsequences.length])),
  summary:r.summary
}));
