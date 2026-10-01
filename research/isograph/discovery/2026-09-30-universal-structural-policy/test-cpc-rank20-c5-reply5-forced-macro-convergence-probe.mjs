import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-c5-reply5-forced-macro-convergence-probe.mjs');
const library=process.argv[2];
assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_c5_reply5_forced_macro_convergence_probe.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

assert.deepEqual(r.sourceRank22.support,[1,6,1,6,3,5,0]);
assert.equal(r.routeA.p1Column,3);
assert.equal(r.routeA.forcedDefenderColumn,5);
assert.equal(r.routeB.p1Column,5);
assert.equal(r.routeB.forcedDefenderColumn,3);
assert.deepEqual(r.routeA.result.support,[1,6,2,6,4,5,0]);
assert.deepEqual(r.routeB.result.support,[1,6,2,6,4,5,0]);
assert.equal(r.comparison.supportEqual,true);
assert.equal(typeof r.comparison.exactRbaEqual,'boolean');
assert.equal(typeof r.comparison.basisEqual,'boolean');
assert.ok(Array.isArray(r.comparison.p1ResidualSymmetricDifference));
assert.ok(Array.isArray(r.comparison.p2ResidualSymmetricDifference));
if(r.comparison.exactRbaEqual){
  assert.equal(r.comparison.p1ResidualSymmetricDifference.length,0);
  assert.equal(r.comparison.p2ResidualSymmetricDifference.length,0);
}else{
  assert.ok(r.comparison.p1ResidualSymmetricDifference.length+r.comparison.p2ResidualSymmetricDifference.length>0);
}
assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('discovery evidence')));

console.log(JSON.stringify({
  pass:true,
  exactRbaEqual:r.comparison.exactRbaEqual,
  basisEqual:r.comparison.basisEqual,
  p1Diff:r.comparison.p1ResidualSymmetricDifference.length,
  p2Diff:r.comparison.p2ResidualSymmetricDifference.length,
  routeAKnownRoot:r.routeA.result.knownRoot,
  routeBKnownRoot:r.routeB.result.knownRoot
}));
