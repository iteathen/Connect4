import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-macro-singleton-safe-predecessor.mjs');
const library=process.argv[2];
assert(library);

const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_macro_singleton_safe_predecessor.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.targetReservoirModified,false);
assert.equal(r.bsfpModified,false);
assert.equal(r.candidateCount,13);
assert.equal(r.candidates.length,13);

for(const c of r.candidates){
  assert.ok(c.predecessorRank>=20);
  assert.ok(Array.isArray(c.predecessorSupport)&&c.predecessorSupport.length===7);
  assert.equal(typeof c.frozenMappedResponseColumn,'number');
  assert.ok(Array.isArray(c.legalP1Moves)&&c.legalP1Moves.length>0);
  assert.ok(Array.isArray(c.macroSafeColumns));
  assert.ok(['MACRO_SAFE_ALTERNATIVE_EXISTS','ONLY_MAPPED_MOVE_MACRO_SAFE','NO_MACRO_SAFE_MOVE'].includes(c.disposition));
  for(const m of c.legalP1Moves){
    assert.equal(typeof m.macroSafe,'boolean');
    assert.ok(Array.isArray(m.defenderTriggers));
    for(const d of m.defenderTriggers){
      assert.equal(typeof d.safeResponseExists,'boolean');
      assert.ok(Array.isArray(d.singletonSafeP1Responses));
    }
  }
}

assert.equal(
  r.summary.macroSafeAlternativeExistsCount+
  r.summary.onlyMappedMoveMacroSafeCount+
  r.summary.noMacroSafeMoveCount,
  13
);
assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('Production CPC')));

console.log(JSON.stringify({
  pass:true,
  candidateCount:r.candidateCount,
  macroSafeAlternativeExistsCount:r.summary.macroSafeAlternativeExistsCount,
  onlyMappedMoveMacroSafeCount:r.summary.onlyMappedMoveMacroSafeCount,
  noMacroSafeMoveCount:r.summary.noMacroSafeMoveCount
}));
