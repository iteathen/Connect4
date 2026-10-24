import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareGeometry} from '../shared/geometry.mjs';
import {SourceState} from '../shared/source-state.mjs';
import {PhysicalState} from '../variants/a-physical/state.mjs';
import {createPhysical} from './independent-oracle.mjs';
function rng(seed){let x=seed|0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
test('all admitted recursive successors have NO immediate winning move for the next mover',()=>{
 const random=rng(0x2975b31c);let admitted=0,checked=0;
 for(const [w,h] of [[4,4],[5,5],[6,5],[7,6],[8,8],[10,10]]){
  const g=prepareGeometry({columns:w,rows:h});
  for(let game=0;game<120;game++){
   const ref=createPhysical(w,h),source=new SourceState(g),physical=new PhysicalState(g);
   for(let step=0;step<w*h;step++){
    if(ref.winner>=0)break;
    const legal=[];for(let col=0;col<w;col++)if(ref.heights[col]<h)legal.push(col);
    if(!legal.length)break;
    const mover=ref.turn&1,own=ref.immediateMask(mover),opp=ref.immediateMask(mover^1);
    if(!own){
     const forced=opp&&(opp&(opp-1))===0 ? 31-Math.clz32(opp):-1;
     const canDescend=!(opp&&(opp&(opp-1))!==0);
     for(const col of legal){
      if(!canDescend||(forced>=0&&col!==forced))continue;
      const badA=!!physical.exposesOpponentWin(col,mover),badB=!!source.exposesOpponentWin(col,mover);
      assert.equal(badA,badB);
      if(badA)continue;
      assert.equal(ref.push(col),false);
      assert.equal(ref.immediateMask(mover^1),0,`${w}x${h} admitted child invariant after col${col}`);
      assert.equal(source.apply(col,true),false);
      assert.equal(physical.apply(col,true),false);
      const src=source.opponentImmediateColumns(mover^1),phys=physical.opponentImmediateColumns(mover^1);
      assert.deepEqual(src,phys);
      const all=source.immediateColumns(),nxt=mover^1;
      assert.equal(nxt?all.p1:all.p0,0,'next mover winning mask must be empty');
      source.undo(col);physical.undo(col);ref.pop(col);
      admitted++;
     }
    }
    const play=legal[random()%legal.length];
    const live=ref.push(play);source.apply(play);physical.apply(play);checked++;
    if(live)break;
   }
  }
 }
 console.log(`Admitted child checks: ${admitted}; sampled game plies: ${checked}`);
});
