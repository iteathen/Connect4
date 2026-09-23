import test from 'node:test';
import assert from 'node:assert/strict';
import {position,exact} from './helpers/physical-oracle.mjs';
const apiURL=new URL('../components/isometric/solve.mjs',import.meta.url);
function late(seed,rank=35){
  for(let attempt=0;attempt<100;attempt++){
    const moves=[];
    while(moves.length<rank){
      const p=position(moves),safe=[];
      for(let c=0;c<7;c++)if(p.heights[c]<6 && !position([...moves,c]).terminal)safe.push(c);
      if(!safe.length)break;
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;moves.push(safe[seed%safe.length]);
    }
    if(moves.length===rank)return moves;
  }
  throw Error('late fixture generation failed');
}
test('native solver API exists',async()=>{
  const api=await import(apiURL.href).catch(()=>null);assert.ok(api?.solve7x6,'native solver missing');
});
test('real RBA solver matches independent late-position WDL and caller-frame moves at 1/2/4 workers',async()=>{
  const {solve7x6}=await import(apiURL.href);
  for(const seed of [173,826,4728]){
    const moves=late(seed),control=exact(moves);
    for(const workers of [1,2,4]){
      const result=await solve7x6(moves,{workers,timeoutMs:5000});
      assert.equal(result.status,'EXACT',JSON.stringify(result));
      assert.equal(result.rootWdl,control.value-2);
      assert.equal(result.move,control.move);
      assert.equal(result.cleanup,true);
    }
    const mirror=moves.map(c=>6-c),reference=exact(mirror);
    const result=await solve7x6(mirror,{workers:2,timeoutMs:5000});
    assert.equal(result.rootWdl,reference.value-2);assert.equal(result.move,reference.move);
  }
});
test('native terminal and bounded unfinished runs do not invent moves or results',async()=>{
  const {solve7x6}=await import(apiURL.href);
  const won=await solve7x6([0,1,0,1,0,1,0],{workers:1,timeoutMs:5000});
  assert.equal(won.rootWdl,1);assert.equal(won.move,-1);
  const bounded=await solve7x6([],{workers:1,timeoutMs:100});
  assert.equal(bounded.status,'TIMEOUT');assert.equal(bounded.rootWdl,null);assert.equal(bounded.cleanup,true);
});
