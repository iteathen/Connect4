import test from 'node:test';
import assert from 'node:assert/strict';
import {freezeGridThenReplay} from './ooo-grid-freeze-lib.mjs';
import {readFileSync} from 'node:fs';
import {FAMILY_SATURATION_GRID} from './ooo-six-bucket-family-saturation-lib.mjs';

// Exercise the actual nested RS-076 implementation without recomputing its
// expensive upstream game corpus. Scalar getters are a read barrier, including
// the earlier control's exactness flag.
function runActualFamilyAudit({failLast=false}={}){
  const source=readFileSync(new URL('./run-ooo-sign-channel-coupling.mjs',import.meta.url),'utf8');
  const start=source.indexOf('function oooSixBucketFamilySaturationAudit(){');
  const end=source.indexOf('const sixBucketFamilySaturation=oooSixBucketFamilySaturationAudit();',start);
  assert.ok(start>=0&&end>start);
  let preparedCount=0,scalarReads=0;
  const completed=[];
  function readBarrier(){
    scalarReads++;
    assert.equal(preparedCount,64);
    assert.equal(completed.length,64);
    function frozen(value){
      if(value&&typeof value==='object'){
        assert.ok(Object.isFrozen(value));
        for(const child of Object.values(value))frozen(child);
      }
    }
    for(const state of completed)frozen(state);
  }
  const dependency={oooResidue:[0],sourceSignature:'toy',dependencyIndex:0,
    get scalarCode(){readBarrier();return 1;}};
  const control={mode:'BUCKET_CLIP3',imageRank:1,
    get exactScalarFactorization(){readBarrier();return true;}};
  const key=()=>{preparedCount++;if(failLast&&preparedCount===64)throw new Error('last structure failed');return 'toy';};
  const freeze=(grid,prepare,replay)=>freezeGridThenReplay(grid,candidate=>{
    const state=prepare(candidate);
    completed.push(state);
    return state;
  },replay);
  const args={assert,descriptorIds:new Map([['w1|cap=1|r0=0:0|r1=',0]]),
    tripleKeys:[20202],pairBase:100,matchedDependencyQuotient:{dependencies:[dependency],
      get scalarDependencyImageDimension(){readBarrier();return 1;}},
    sixBucketCountQuotient:{audits:[control]},FAMILY_SATURATION_GRID,
    familySaturationTriangleKey:key,xorRow:(a,b)=>a.filter(x=>!b.includes(x)).concat(b.filter(x=>!a.includes(x))).sort((a,b)=>a-b),
    freezeGridThenReplay:freeze};
  const invoke=new Function(...Object.keys(args),source.slice(start,end)+'return oooSixBucketFamilySaturationAudit();');
  try{return {result:invoke(...Object.values(args)),preparedCount,scalarReads};}
  catch(error){error.scalarReads=scalarReads;throw error;}
}

test('actual RS-076 prepares and freezes all 64 structures before scalar or control reads',()=>{
  const out=runActualFamilyAudit();
  assert.equal(out.result.audits.length,64);
  assert.ok(out.scalarReads>0);
});

test('actual RS-076 late preparation failure cannot read any scalar',()=>{
  assert.throws(()=>runActualFamilyAudit({failLast:true}),error=>{
    assert.match(error.message,/last structure failed/);
    assert.equal(error.scalarReads,0);
    return true;
  });
});

test('a late structural failure prevents every scalar replay',()=>{
  let scalarReads=0;
  assert.throws(()=>freezeGridThenReplay([0,1,2],candidate=>{
    if(candidate===2)throw new Error('structural failure');
    return {candidate};
  },()=>{scalarReads++;}),/structural failure/);
  assert.equal(scalarReads,0);
});

test('all candidate structures exist before first scalar access',()=>{
  const prepared=[];
  const out=freezeGridThenReplay([0,1,2],candidate=>{
    prepared.push(candidate);
    return {candidate,rows:[[candidate]]};
  },state=>{
    assert.deepEqual(prepared,[0,1,2]);
    assert.ok(Object.isFrozen(state));
    assert.ok(Object.isFrozen(state.rows[0]));
    assert.throws(()=>state.rows[0].push(9),TypeError);
    return state.candidate+10;
  });
  assert.deepEqual(out,[10,11,12]);
});
