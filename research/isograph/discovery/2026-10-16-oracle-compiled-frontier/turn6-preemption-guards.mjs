#!/usr/bin/env node
// Oracle-blind classification of precisely the THREE reply guards left open by
// the proposed P0 2-then-3 fork from center-full 444444.
import assert from 'node:assert/strict';
import {replay,move,legal,residual,bit,popcount,LINES} from './turn6-structural-control.mjs';
const W=7,H=6;
function cells(mask){
 const c=[];
 for(let col=0;col<W;col++)for(let row=0;row<H;row++)
  if((mask&bit(col,row))!==0n)c.push({column:col+1,row:row+1,index0:[col,row]});
 return c;
}
function immediateFor(s,who){
 if(s.terminal!==null)return [];
 const owner=who===0?s.p0:s.p1;
 return legal(s).filter(col=>{
  const test=owner|bit(col,s.h[col]);
  return LINES.some(l=>(l.mask&test)===l.mask);
 }).map(c=>c+1);
}
export function inspectThreePreemptions(){
 const result=[];
 for(const P1Intervention of [1,3,5]){
  const seq='4444442'+P1Intervention+'3';
  const s=replay(seq);
  assert.equal(s.rank,9);assert.equal(s.terminal,null);assert.equal(s.rank%2,1);
  const R0=residual(s,0),ones=R0.filter(m=>popcount(m)===1);
  assert.equal(ones.length,1);
  const target=cells(ones[0])[0],r0=target.index0[1],c0=target.index0[0];
  const obstruction= r0-s.h[c0];
  assert.ok(obstruction>=0);
  const N=(W-1)*H-s.rank+r0+1;
  const q0=((W-1)*H+r0)&1; // absolute zero-reservation owner P0=0/P1=1
  const classified={
   P1Intervention,sequence:seq,support:s.h,
   P0Singleton: {column:target.column,row:target.row,
      gravityPredecessorsRemaining:obstruction,immediatelyPlayable:obstruction===0,
      eventCountN:N,basicAbsoluteControlOwner:q0===0?'P0':'P1',
      basicParityCorrectionToP0:q0===0?0:1},
   legalP0ThreatCellsIfNext:immediateFor(s,0),
   legalP1WinsNow:immediateFor(s,1)
  };
  if(obstruction===0){
   const blocked=move(s,c0);
   if(!blocked||blocked.terminal===0)throw Error('illegal direct blocker');
   classified.P1LegalDirectBlock=target.column;
   classified.P0ImmediateWinsAfterBlock=immediateFor(blocked,0);
   assert.equal(classified.P0ImmediateWinsAfterBlock.length,0);
  }else{
   classified.P1LegalDirectBlock=null;
   classified.P0ImmediateWinsAfterBlock=null;
  }
  result.push(classified);
 }
 assert.deepEqual(result.map(x=>x.P0Singleton.gravityPredecessorsRemaining),[0,3,0]);
 assert.deepEqual(result.map(x=>x.P0Singleton.basicAbsoluteControlOwner),['P0','P1','P0']);
 return {schema:'connect4.turn6.three-fork-preemption-guards.v0_1',
  root:'444444',proposedP0First:2,proposedP0Second:3,
  exactPreemptionCases:result,
  interpretation:'P1 replies 1 and 5 block a current single P0 winning landing, while reply 3 yields a nonplayable row-4 diagonal target in column 5 with three gravity prerequisites and basic zero-reservation control P1; a guarded parity correction/race proof is missing.',
  oracleQueries:0,recursiveGameSolveCalls:0,
  noClaim:'No assertion that a parity flip is possible, that a delayed target is P0-owned, that this P0 plan is forced, or that P0 wins from 444444.'};
}
if(process.argv[1]?.endsWith('turn6-preemption-guards.mjs'))
 console.log(JSON.stringify(inspectThreePreemptions(),null,2));
