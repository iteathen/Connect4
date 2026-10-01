import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const library=process.argv[2];
assert(library);
const dir=dirname(fileURLToPath(import.meta.url));
const runner=resolve(dir,'run-cpc-rank20-reply7-dual-pair-choice-elimination-probe.mjs');
const raw=execFileSync(process.execPath,[runner,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_reply7_dual_pair_choice_elimination_probe.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.rank20.sequence,'44444156666623222242');
assert.equal(r.firstStage.rank22DefenderColumn,7);
assert.equal(r.firstStage.p1SetupColumn,7);
assert.deepEqual(r.firstStage.legalDefenderReplies,[1,3,5,6,7]);

const firstByCol=new Map(r.firstStage.routes.map(x=>[x.defenderColumn,x]));
for(const c of [1,3,6]){
  const x=firstByCol.get(c);
  assert.equal(x.kind,'REQUALIFIED_C7_CONTRACTION_RCIC');
  assert.equal(typeof x.accept,'boolean');
}
{
  const x=firstByCol.get(5);
  assert.equal(x.kind,'DUAL_PAIR_CHOICE_MACRO');
  assert.equal(x.p1SetupColumn,1);
  assert.deepEqual(x.legalSecondDefenderReplies,[1,3,5,6,7]);
  assert.equal(x.subroutes.length,5);
  for(const s of x.subroutes){
    assert.equal(typeof s.defenderColumn,'number');
    assert.equal(typeof s.p1ResponseColumn,'number');
    assert.equal(typeof s.accept,'boolean');
    assert.ok(['L_TO_C3R5_RCIC','R_TO_C5R5_RCIC'].includes(s.routeKind));
  }
}
{
  const x=firstByCol.get(7);
  assert.equal(x.kind,'TRANSPORTED_SINGLE_PAIR_MACRO');
  assert.equal(x.p1SetupColumn,1);
  assert.deepEqual(x.legalSecondDefenderReplies,[1,3,5,6,7]);
  assert.equal(x.subroutes.length,5);
  const taken=x.subroutes.find(s=>s.defenderColumn===1);
  assert.equal(taken.routeKind,'DOUBLE_TAKEN_WITNESS');
  assert.equal(taken.valueClaimed,false);
  assert.ok(taken.finalState);
  for(const s of x.subroutes.filter(s=>s.defenderColumn!==1)){
    assert.equal(s.routeKind,'L_TO_C3R5_RCIC');
    assert.equal(typeof s.accept,'boolean');
  }
}

assert.ok(r.boundary.some(x=>x.includes('discovery')));
console.log(JSON.stringify({
  pass:true,
  firstStage:r.firstStage.routes.map(x=>({
    defenderColumn:x.defenderColumn,
    kind:x.kind,
    accept:x.accept??null,
    allClosed:x.allClosed??null
  })),
  smallestWitness:r.smallestRemainingWitness
}));
