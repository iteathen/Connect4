import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const library=process.argv[2];
assert(library);
const dir=dirname(fileURLToPath(import.meta.url));
const runner=resolve(dir,'run-cpc-rank28-reply7-c5-forced-child-structural-probe.mjs');
const raw=execFileSync(process.execPath,[runner,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank28_reply7_c5_forced_child_structural_probe.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.state.rank,28);
assert.equal(r.state.mover,1);
assert.deepEqual(r.state.support,[2,6,3,6,4,5,2]);
assert.deepEqual(r.legalP1Moves,[1,3,5,6,7]);
assert.equal(r.rows.length,5);
assert.deepEqual(r.rows.map(x=>x.p1Column),[1,3,5,6,7]);

for(const row of r.rows){
  assert.equal(typeof row.terminal,'number');
  assert.ok(Array.isArray(row.exactQualifiedRootMatches));
  assert.ok(Array.isArray(row.targetCertificates));
  if(row.terminal===0){
    assert.ok(row.cpcForP2);
    assert.ok(Array.isArray(row.p1Minimal));
    assert.ok(Array.isArray(row.p2Minimal));
    assert.ok(Array.isArray(row.immediateP2WinningColumns));
    assert.ok(row.literalImmediateEscape);
    for(const cert of row.targetCertificates){
      assert.equal(typeof cert.target.column,'number');
      assert.equal(typeof cert.target.row,'number');
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
  rows:r.rows.map(x=>({
    p1Column:x.p1Column,
    terminal:x.terminal,
    cpc:x.cpcForP2?.baseline?.kind??null,
    forced:x.cpcForP2?.baseline?.forcedColumn??null,
    targetCertificates:x.targetCertificates.map(c=>({target:c.target,pass:c.validation.pass})),
    exactMatches:x.exactQualifiedRootMatches
  }))
}));
