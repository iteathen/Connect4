import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareGeometry} from '../shared/geometry.mjs';
import {SourceState} from '../shared/source-state.mjs';
import {PhysicalState} from '../variants/a-physical/state.mjs';
import {createPhysical} from './independent-oracle.mjs';
function rng(seed){let x=seed|0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
test('exact exposed-opponent-FIRSTWIN pruning matches independent physical board in all geometries',()=>{
 const rand=rng(0x3509a321); let tests=0;
 for(const [w,h] of [[1,1],[3,7],[4,4],[5,5],[6,5],[7,6],[8,8],[10,10]]){
  const g=prepareGeometry({columns:w,rows:h});
  for(let trial=0;trial<100;trial++){
   const a=new PhysicalState(g),b=new SourceState(g),r=createPhysical(w,h);
   for(let t=0;t<w*h;t++){
    const legal=[];for(let c=0;c<w;c++)if(r.heights[c]<h)legal.push(c);
    if(!legal.length||r.winner>=0)break;
    const mover=r.turn&1,own=r.immediateMask(mover);
    if(own===0){
      for(const c of legal){
       const aa=!!a.exposesOpponentWin(c,mover),bb=!!b.exposesOpponentWin(c,mover);
       assert.equal(aa,bb,`${w}x${h}: A/B mismatch`);
       assert.equal(r.push(c),false,`${w}x${h}: mover no win`);
       const expected=!!(r.immediateMask(mover^1)&(1<<c));
       r.pop(c);
       assert.equal(aa,expected,`${w}x${h}: incorrect exposed FIRSTWIN for c ${c}`);
       tests++;
      }
    }
    const c=legal[rand()%legal.length];
    const aw=a.apply(c),bw=b.apply(c),rw=r.push(c);
    assert.equal(aw,rw);assert.equal(bw,rw);
    if(rw)break;
   }
  }
 }
 console.log(`Verified exposed-FIRSTWIN moves against physical oracle: ${tests}`);
});
