import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-c5-reply5-forced-child-blocker-reentry-probe.mjs');
const library=process.argv[2];
assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_c5_reply5_forced_child_blocker_reentry_probe.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

assert.equal(r.forcedChildren.length,3);
for(const child of r.forcedChildren){
  assert.equal(child.forcedDefenderColumn,3);
  assert.equal(child.rank,28);
  assert.equal(child.mover,1);
  assert.equal(child.originalTarget.cell,20);
  assert.equal(child.originalTargetActiveSingleton,true);
  assert.ok(child.legalP1Columns.length>0);
  assert.equal(child.candidates.length,child.legalP1Columns.length);
  assert.equal(child.closed,child.candidates.some(x=>x.acceptedRoutes.length>0));
  assert.equal(child.compositionReady,child.closed);
  for(const row of child.candidates){
    assert.ok(child.legalP1Columns.includes(row.p1Column));
    if(row.afterP1Terminal===0)assert.equal(row.afterP1Rank,29);
    for(const route of row.acceptedRoutes)assert.equal(route.accept,true);
  }
}
assert.equal(r.summary.closedForcedChildCount,r.forcedChildren.filter(x=>x.closed).length);
assert.deepEqual(r.summary.closedIds,r.forcedChildren.filter(x=>x.closed).map(x=>x.id));
assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('discovery evidence')));

console.log(JSON.stringify({
  pass:true,
  children:r.forcedChildren.map(x=>({id:x.id,closed:x.closed,acceptedColumns:x.candidates.filter(y=>y.acceptedRoutes.length).map(y=>y.p1Column)})),
  closedForcedChildCount:r.summary.closedForcedChildCount
}));
