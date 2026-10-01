import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const dir=dirname(fileURLToPath(import.meta.url));
const script=resolve(dir,'run-cpc-rank20-c5-reply5-dual-pair-choice-elimination-probe.mjs');
const library=process.argv[2];
assert(library);
const raw=execFileSync(process.execPath,[script,library],{encoding:'utf8',maxBuffer:64*1024*1024});
const r=JSON.parse(raw);

assert.equal(r.schema,'connect4.cpc_rank20_c5_reply5_dual_pair_choice_elimination_probe.v1');
assert.equal(r.jsMinSysSha,'bf23d3a67652cd42e1975f29c7dc4eed54f7eb42');
assert.equal(r.oracleUsed,false);
assert.equal(r.solvedInputsUsed,false);
assert.equal(r.ordinaryGameTreeSearchUsed,false);
assert.equal(r.productionCpcModified,false);
assert.equal(r.jsMinSysModified,false);
assert.equal(r.bsfpModified,false);

assert.equal(r.rank20.sequence,'44444156666623222242');
assert.deepEqual(r.rank20.support,[1,6,1,6,1,5,0]);
assert.deepEqual(r.sourceRank22.support,[1,6,1,6,3,5,0]);
assert.deepEqual(r.sourceRank22.alignedPairKeys,['1,3|3,5','5,5|7,3']);
assert.deepEqual(r.sourceRank22.distance1Endpoints.map(x=>[x.column,x.row]).sort((a,b)=>a[0]-b[0]),[[1,3],[5,5]]);

assert.deepEqual(r.orientations.map(x=>x.setupColumn),[1,5]);
for(const o of r.orientations){
  assert.equal(o.afterSetupRank,23);
  assert.equal(o.afterSetupTerminal,0);
  assert.ok(o.legalFirstDefenderReplies.length>0);
  assert.equal(o.allClosed,o.firstStageRoutes.every(x=>x.accept===true));
  for(const route of o.firstStageRoutes){
    assert.ok(o.legalFirstDefenderReplies.includes(route.defenderColumn));
    assert.equal(typeof route.accept,'boolean');
    if(route.kind==='OFF_COLUMN_PAIR_CONTRACTION_RCIC'&&route.accept){
      assert.equal(route.contractionToSingleton,true);
      assert.equal(route.targetProjectedToP1,true);
      assert.equal(route.validation?.pass,true);
    }
    if(route.kind==='TAKEN_ENDPOINT_SECOND_SETUP'){
      assert.ok(route.secondSetupColumn===1||route.secondSetupColumn===5);
      assert.ok(Array.isArray(route.subroutes));
      for(const s of route.subroutes){
        assert.equal(typeof s.accept,'boolean');
        if(s.kind==='SECOND_STAGE_OFF_COLUMN_PAIR_CONTRACTION_RCIC'&&s.accept){
          assert.equal(s.contractionToSingleton,true);
          assert.equal(s.targetProjectedToP1,true);
          assert.equal(s.validation?.pass,true);
        }
      }
    }
  }
}

assert.equal(r.summary.bestUnclosedCount,Math.min(...r.orientations.map(x=>x.unclosedCount)));
assert.deepEqual(r.summary.bestSetupColumns,r.orientations.filter(x=>x.unclosedCount===r.summary.bestUnclosedCount).map(x=>x.setupColumn));
assert.ok(r.conclusion.every(x=>typeof x==='string'));
assert.ok(r.boundary.some(x=>x.includes('discovery evidence')));

console.log(JSON.stringify({
  pass:true,
  orientations:r.orientations.map(x=>({setupColumn:x.setupColumn,unclosedCount:x.unclosedCount,allClosed:x.allClosed,smallestWitness:x.smallestRemainingWitness?.kind??null})),
  bestSetupColumns:r.summary.bestSetupColumns,
  bestUnclosedCount:r.summary.bestUnclosedCount
}));
