import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank30-d1-a-bidirectional-proof-library-closure.mjs');
const library=process.argv[2];assert(library);

const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank30_d1_a_bidirectional_proof_library_closure.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.sourceLeafId,'SECOND_D1_C5_CONTRACTION:A->A');
assert.equal(r.sourceExactQClass,'d21a89605c399aca');
assert.equal(r.rank,30);
assert.deepEqual(r.support,[6,6,2,6,5,5,0]);
assert.deepEqual(r.previouslyEliminatedRootMoves,[5,6,7]);
assert.equal(r.rootMove,3);
assert.equal(r.children.length,4);

const c3=r.children.find(x=>x.defenderColumn===3);
assert(c3);
assert.equal(c3.exactQClass,'9f6b7a33ab7e9552');
assert.equal(c3.disposition,'P0_WIN');
assert.ok(c3.positiveCertificates.some(x=>x.kind==='EXACT_Q9F_HANDOFF'));

for(const x of r.children){
  assert.ok(['P0_WIN','P0_LOSS','UNKNOWN'].includes(x.disposition));
  assert.equal(x.positiveCertificates.length>0&&x.lossCertificate?.loss===true,false);
  assert.equal(x.exactBridge.pass,true);
}
assert.ok(['WINNING','ELIMINATED','UNRESOLVED'].includes(r.rootMoveDisposition));
assert.ok(['P0_WIN','P0_LOSS','UNKNOWN'].includes(r.leafDisposition));
if(r.rootMoveDisposition==='WINNING')assert.equal(r.leafDisposition,'P0_WIN');
if(r.rootMoveDisposition==='ELIMINATED')assert.equal(r.leafDisposition,'P0_LOSS');
if(r.rootMoveDisposition==='UNRESOLVED')assert.equal(r.leafDisposition,'UNKNOWN');

assert.equal(r.summary.resourceFailureCount,0);
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.legacyRepairModified,false);
assert.equal(r.rcicModified,false);
assert.equal(r.forcedLossModified,false);
assert.equal(r.bsfpModified,false);
console.log(JSON.stringify({
  pass:true,
  leafDisposition:r.leafDisposition,
  rootMoveDisposition:r.rootMoveDisposition,
  children:r.children.map(x=>({defender:x.defenderColumn,q:x.exactQClass,disposition:x.disposition,positive:x.positiveCertificates.map(y=>y.kind),loss:x.lossCertificate?.kind??null}))
}));
