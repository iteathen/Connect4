import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-rank32-consequence-class-transport-census.mjs');
const raw=execFileSync(process.execPath,[script],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_rank32_consequence_class_transport_census.v1');
assert.equal(r.sourceLeafCount,11);
assert.equal(r.rows.length,11);
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

for(const row of r.rows){
  assert.equal(typeof row.sourceLeafId,'string');
  assert.equal(typeof row.sourceQClass,'string');
  assert.equal(row.sourceRank,30);
  assert.ok(Array.isArray(row.transitions));
  assert.equal(row.rawTransitionCount,row.transitions.length);
  assert.ok(Array.isArray(row.unresolvedTargetQClasses));
  assert.equal(row.quotientUnresolvedArity,new Set(row.unresolvedTargetQClasses).size);
}

assert.ok(Array.isArray(r.unresolvedQClasses));
assert.equal(r.summary.uniqueUnresolvedQClassCount,r.unresolvedQClasses.length);
assert.ok(r.summary.unresolvedTransitionCount>=r.summary.uniqueUnresolvedQClassCount);
assert.equal(
  r.summary.repeatedUnresolvedQClassCount,
  r.unresolvedQClasses.filter(x=>x.incomingTransitionCount>1).length
);
for(const q of r.unresolvedQClasses){
  assert.equal(q.rank,32);
  assert.ok(q.incomingTransitionCount>=1);
  assert.ok(Array.isArray(q.sourceLeafIds));
  assert.ok(Array.isArray(q.macroLabels));
}
assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('Production CPC')));

console.log(JSON.stringify({pass:true,summary:r.summary}));
