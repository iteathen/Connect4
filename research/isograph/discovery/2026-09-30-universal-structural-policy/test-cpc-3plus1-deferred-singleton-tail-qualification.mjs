import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-3plus1-deferred-singleton-tail-qualification.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_3plus1_deferred_singleton_tail_qualification.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.theorem,'CPC_3PLUS1_DEFERRED_SINGLETON_TAIL_NONWIN_THEOREM.md');
assert.equal(r.accept,true);
assert.equal(r.states.length,3);
for(const s of r.states){
  assert.equal(s.exactBridge.pass,true);
  assert.equal(s.rank,38);
  assert.equal(s.premises.poset,true);
  assert.equal(s.premises.p0Residual,true);
  assert.equal(s.premises.p1Residual,true);
  assert.equal(s.premises.noPriorTerminal,true);
  assert.equal(s.a1Branch.p1A2Terminal,true);
  assert.equal(s.bBranch.forcedTail,true);
  assert.equal(s.bBranch.outcome,'DRAW');
  assert.equal(s.noP0WinningAction,true);
  assert.equal(s.exactDraw,true);
  assert.equal(s.interval.lower,0);
  assert.equal(s.interval.upper,0);
}
assert.equal(r.summary.qualifiedStateCount,3);
assert.equal(r.summary.failedStateCount,0);
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);
console.log(JSON.stringify({pass:true,summary:r.summary}));
