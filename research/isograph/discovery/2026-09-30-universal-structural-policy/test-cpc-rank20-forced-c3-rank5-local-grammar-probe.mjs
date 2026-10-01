import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-forced-c3-rank5-local-grammar-probe.mjs');
const raw=execFileSync(process.execPath,[script],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_forced_c3_rank5_local_grammar_probe.v1');
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
  assert.equal(typeof row.exactQClass,'string');
  assert.equal(typeof row.rank5Proved,'boolean');
  assert.ok(row.rank5Expression===null||row.rank5Expression.startsWith('E(A('));
  if(row.rank5Proved){
    assert.equal(typeof row.rootMove,'number');
    assert.ok(row.rawDefenderReplyCount>=1);
    assert.ok(row.distinctLowerQClassCount>=1);
    assert.ok(row.distinctLowerExpressionCount>=1);
    assert.equal(row.lowerConsequences.length,row.rawDefenderReplyCount);
    assert.ok(row.lowerConsequences.every(x=>x.proved));
  }
  assert.ok(Array.isArray(row.rootMoveAttempts));
}

assert.equal(r.summary.rank5ProvedCount+r.summary.unresolvedCount,11);
assert.equal(r.summary.cumulativeBoundedGrammarClosureCount,r.summary.rank5ProvedCount);
assert.equal(r.summary.unresolvedExactQClasses.length,r.summary.unresolvedCount);
assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('Production CPC')));

console.log(JSON.stringify({pass:true,summary:r.summary}));
