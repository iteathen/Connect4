import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const library=process.argv[2];
assert(library);
const dir=dirname(fileURLToPath(import.meta.url));
const runner=resolve(dir,'run-cpc-rank31-reply7-forced-c6-continuation-probe.mjs');
const raw=execFileSync(process.execPath,[runner,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank31_reply7_forced_c6_continuation_probe.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.state.rank,31);
assert.equal(r.state.mover,2);
assert.deepEqual(r.state.support,[2,6,3,6,5,6,3]);
assert.deepEqual(r.legalDefenderMoves,[1,3,5,7]);
assert.ok(Array.isArray(r.parentTargetCertificates));
assert.ok(Array.isArray(r.parentTargetCertificateFailures));
assert.ok(Array.isArray(r.exactQualifiedRootMatches));
assert.equal(r.rows.length,4);
assert.deepEqual(r.rows.map(x=>x.defenderColumn),[1,3,5,7]);

for(const row of r.rows){
  assert.equal(typeof row.terminal,'number');
  assert.ok(Array.isArray(row.exactQualifiedRootMatches));
  assert.ok(Array.isArray(row.targetCertificates));
  assert.ok(Array.isArray(row.targetCertificateFailures));
  if(row.terminal===0){
    assert.ok(Array.isArray(row.p1ImmediateWinningColumns));
    assert.ok(Array.isArray(row.p1Minimal));
    assert.ok(Array.isArray(row.p2Minimal));
    assert.ok(Array.isArray(row.p1Singletons));
    assert.ok(Array.isArray(row.p2Singletons));
    assert.ok(row.cpcForP1);
    assert.ok(row.literalP1ImmediateResponse);
    for(const cert of row.targetCertificates){
      assert.ok(cert.template);
      assert.equal(typeof cert.validation.pass,'boolean');
    }
  }
}

assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('game-tree')));
console.log(JSON.stringify({
  pass:true,
  state:r.state,
  parentTargets:r.parentTargetCertificates.map(x=>({target:x.target,pass:x.validation.pass})),
  rows:r.rows.map(x=>({
    defenderColumn:x.defenderColumn,
    terminal:x.terminal,
    p1Immediate:x.p1ImmediateWinningColumns,
    cpc:x.cpcForP1?.baseline?.kind??null,
    forced:x.cpcForP1?.baseline?.forcedColumn??null,
    targets:x.targetCertificates.map(c=>({target:c.target,pass:c.validation.pass})),
    matches:x.exactQualifiedRootMatches
  }))
}));
