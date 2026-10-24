import test from 'node:test';
import assert from 'node:assert/strict';
import {IsoMaxA,IsoMaxB,IsoMaxC} from '../index.mjs';
import {createPhysical} from './independent-oracle.mjs';
const variants=[IsoMaxA,IsoMaxB,IsoMaxC];
function seeded(seed){let s=seed|0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};}
function check(w,h,prefix){
 const ref=createPhysical(w,h);
 for(const col of prefix)assert.equal(ref.push(col),false,'fixture must remain firstwinnerfree');
 const expected=ref.referenceWdl(new Map());
 for(const Solver of variants){
  const result=new Solver({columns:w,rows:h,ttMiB:1,nodeLimit:10000000,deadlineMs:20000}).solve(prefix);
  assert.equal(result.currentPlayerWdl,expected,`${result.variant} WDL ${w}x${h} ${prefix}`);
  assert.equal(result.rootWdl,ref.turn&1?(-expected||0):expected);
  assert.equal(result.status,'EXACT');
  if(ref.turn===w*h)assert.equal(result.move,-1);
  else{
   assert.ok(result.move>=0&&result.move<w&&ref.heights[result.move]<h,'legal root action');
   const win=ref.push(result.move),v=win?1:(-ref.referenceWdl(new Map()) || 0);
   assert.equal(v,expected,`${result.variant} must return WDL-preserving move`);
   ref.pop(result.move);
  }
 }
}

test('all A/B/C independently agree with JavaScript physical minimax',()=>{
 check(4,4,[]);
 check(4,4,[1,1,2,2]);
 const random=seeded(0x1234adcb);
 for(const [w,h,rank,count] of [[5,5,18,12],[6,5,24,8],[7,6,32,12]]){
  let found=0;
  for(let attempt=0;attempt<12000&&found<count;attempt++){
   const ref=createPhysical(w,h),prefix=[];
   for(let i=0;i<rank;i++){
    let legal=[];
    for(let c=0;c<w;c++)if(ref.heights[c]<h&&!(ref.immediateMask(ref.turn&1)&(1<<c)))legal.push(c);
    if(!legal.length)break;
    const move=legal[random()%legal.length];
    assert.equal(ref.push(move),false);prefix.push(move);
   }
   if(prefix.length!==rank)continue;
   check(w,h,prefix);found++;
  }
  assert.ok(found>=Math.max(2,count/2),`${w}x${h} ${rank}: found ${found}`);
 }
});

test('all three enforce FIRSTWIN stops and 1..10 board-size limits',()=>{
 for(const Solver of variants){
  assert.throws(()=>new Solver({columns:11}),RangeError);
  assert.throws(()=>new Solver({rows:0}),RangeError);
  assert.throws(()=>new Solver({ttMiB:0}),RangeError);
  assert.throws(()=>new Solver({nodeLimit:0}),RangeError);
  const direct=new Solver({columns:4,rows:4,ttMiB:.0625});
  assert.equal(direct.solve([]).status,'EXACT');
  assert.throws(()=>direct.solve([]),/one-shot/);
  const term=new Solver({columns:5,rows:5,ttMiB:.0625}).solve([0,1,0,1,0,2,0]);
  assert.equal(term.rootWdl,1);assert.equal(term.move,-1);
  assert.throws(()=>new Solver({columns:5,rows:5,ttMiB:.0625}).solve([0,1,0,1,0,2,0,3]),/post-terminal/);
 }
});
