import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-rank32-forced-obligation-loss-census.mjs');
const raw=execFileSync(process.execPath,[script],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_rank32_forced_obligation_loss_census.v1');
assert.equal(r.sourceTransitionCount,36);
assert.equal(r.rank32Classes.length,24);
assert.equal(r.sourceLeaves.length,11);
assert.ok(r.rank32Classes.every(x=>x.rank===32));
assert.ok(r.rank32Classes.every(x=>typeof x.lossCertified==='boolean'));
assert.ok(r.rank32Classes.every(x=>x.proofCompleted===true||x.resourceFailure!==null));
assert.ok(r.sourceLeaves.every(x=>Array.isArray(x.rootActions)&&x.rootActions.length>0));
assert.ok(r.sourceLeaves.every(x=>typeof x.fullyActionEliminated==='boolean'));
assert.equal(r.summary.rank32ClassCount,24);
assert.ok(Number.isInteger(r.summary.rank32LossCertifiedCount));
assert.ok(Number.isInteger(r.summary.rank30LossCertifiedCount));
assert.ok(Number.isInteger(r.summary.resourceFailureCount));
assert.ok(Array.isArray(r.summary.rank32LossCertifiedQClasses));
assert.ok(Array.isArray(r.summary.rank30LossCertifiedLeafIds));
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);
assert.ok(r.boundary.some(x=>x.includes('Unknown is never treated as loss')));

console.log(JSON.stringify({
  pass:true,
  rank32LossCertifiedCount:r.summary.rank32LossCertifiedCount,
  rank30LossCertifiedCount:r.summary.rank30LossCertifiedCount,
  resourceFailureCount:r.summary.resourceFailureCount,
  rank30LossCertifiedLeafIds:r.summary.rank30LossCertifiedLeafIds
}));
