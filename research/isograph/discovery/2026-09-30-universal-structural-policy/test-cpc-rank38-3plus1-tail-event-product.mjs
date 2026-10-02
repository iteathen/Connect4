import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank38-3plus1-tail-event-product.mjs');
const library=process.argv[2];assert(library);
const raw=execFileSync(process.execPath,[script,library],{
  encoding:'utf8',
  maxBuffer:64*1024*1024,
});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank38_3plus1_tail_event_product.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.design,'CPC_RANK38_3PLUS1_TAIL_EVENT_PRODUCT_DESIGN_0_1.md');
assert.equal(r.sourceEvidence,'CPC_Q5D34_G5_SURVIVOR_RANK38_MONOTONE_COMPOSITION_0_1.json');

assert.equal(r.states.length,3);
const expected=new Map([
  ['4f5444dc55bb5371',[6,6,3,6,5,6,6]],
  ['60fba7c1d1c84a97',[6,6,3,6,6,5,6]],
  ['e7eb0902f1f7984c',[6,6,3,6,6,6,5]],
]);
for(const s of r.states){
  assert.deepEqual(s.support,expected.get(s.exactQClass));
  assert.equal(s.rank,38);
  assert.equal(s.exactBridge.pass,true);
  assert.equal(s.remainingEventCount,4);
  assert.equal(s.poset.kind,'THREE_CHAIN_PLUS_SINGLETON');
  assert.equal(s.linearExtensions.length,4);
  assert.deepEqual(
    s.linearExtensions.map(x=>x.events),
    [
      ['B','A1','A2','A3'],
      ['A1','B','A2','A3'],
      ['A1','A2','B','A3'],
      ['A1','A2','A3','B'],
    ]
  );
  assert.equal(s.rootActions.length,2);
  for(const a of s.rootActions){
    assert.ok(['P0_WIN_ALL_EXTENSIONS','P0_NONWIN_ALL_EXTENSIONS','MIXED_EXTENSION_OUTCOMES'].includes(a.disposition));
    assert.ok(a.extensionCount>=1);
  }
  for(const x of s.linearExtensions){
    assert.ok(['P0_WIN','P1_WIN','DRAW'].includes(x.outcome));
    assert.ok(Array.isArray(x.prefixes));
    assert.ok(x.prefixes.length>=1&&x.prefixes.length<=4);
  }
  assert.ok(s.residualIncidence);
  assert.ok(Array.isArray(s.residualIncidence.P0));
  assert.ok(Array.isArray(s.residualIncidence.P1));
}

assert.equal(r.summary.totalLinearExtensions,12);
assert.equal(r.summary.resourceFailureCount,0);
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryFreeBranchGameTreeUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

console.log(JSON.stringify({
  pass:true,
  summary:r.summary,
  states:r.states.map(s=>({
    q:s.exactQClass,
    rootActions:s.rootActions,
    outcomeCounts:s.outcomeCounts,
  })),
  crossStateComparison:r.crossStateComparison,
}));
