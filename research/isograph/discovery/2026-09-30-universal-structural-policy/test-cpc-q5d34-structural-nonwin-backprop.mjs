import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-q5d34-structural-nonwin-backprop.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_q5d34_structural_nonwin_backprop.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.exactQClass,'5d34e24395b9d801');
assert.equal(r.rank,34);
assert.deepEqual(r.support,[6,6,3,6,5,5,3]);
assert.equal(r.exactBridge.pass,true);

assert.equal(r.rank38DrawPremise.accept,true);
assert.equal(r.rank38DrawPremise.interval.lower,0);
assert.equal(r.rank38DrawPremise.interval.upper,0);

assert.equal(r.rank37Survivors.length,2);
for(const s of r.rank37Survivors){
  assert.equal(s.interval.upper,0);
  assert.ok(s.drawReplyQClasses.length>=1);
}

assert.equal(r.rank36Predecessors.length,2);
for(const s of r.rank36Predecessors){
  assert.equal(s.exactDraw,true);
  assert.equal(s.interval.lower,0);
  assert.equal(s.interval.upper,0);
  assert.equal(s.actionIntervals.length,3);
}

assert.equal(r.g4Action.interval.upper,0);
assert.ok(r.g4Action.drawReplyQClasses.length>=1);

assert.equal(r.rootActions.length,4);
assert.deepEqual(r.rootActions.map(x=>x.column),[3,5,6,7]);
assert.ok(r.rootActions.every(x=>x.interval.upper<=0));

assert.equal(r.classification,'P0_NONWIN');
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
  rank36:r.rank36Predecessors,
  g4:r.g4Action,
  rootActions:r.rootActions
}));
