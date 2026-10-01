import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const library=process.argv[2];
assert(library);
const dir=dirname(fileURLToPath(import.meta.url));
const runner=resolve(dir,'run-cpc-rank31-c3-target-reservoir-qualification.mjs');
const raw=execFileSync(process.execPath,[runner,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank31_c3_target_reservoir_qualification.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.state.rank,31);
assert.equal(r.state.mover,2);
assert.deepEqual(r.state.support,[3,6,3,6,5,5,3]);
assert.deepEqual(r.target,{cell:30,column:3,row:5});
assert.equal(r.guards.activeP1Singleton,true);
assert.equal(r.guards.targetProjectedOwner,1);
assert.equal(r.guards.targetPlayable,false);
assert.equal(r.guards.playableP2Singletons.length,0);
assert.equal(typeof r.accept,'boolean');

if(r.accept){
  assert.ok(r.template);
  assert.equal(r.template.targetIsResponse,true);
  assert.ok(r.template.coverage.length>=1);
  assert.ok(r.validation);
  assert.equal(r.validation.pass,true);
  assert.equal(r.validation.failures.length,0);
}else{
  assert.ok(r.rejectionReason);
}

assert.ok(r.boundary.some(x=>x.includes('game-tree')));
console.log(JSON.stringify({
  pass:true,
  accept:r.accept,
  template:r.template&&{
    capacity:r.template.capacity,
    oddColumns:r.template.oddColumns,
    synchronizedPairs:r.template.synchronizedPairs,
    defenderResidualCount:r.template.defenderResidualCount
  },
  validation:r.validation&&{
    pass:r.validation.pass,
    defenderNodes:r.validation.defenderNodes,
    responsePairs:r.validation.responsePairs,
    targetTerminalResponses:r.validation.targetTerminalResponses
  },
  rejectionReason:r.rejectionReason
}));
