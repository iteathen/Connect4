#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
//
// Empty-board K=4 first-event centrality.  Counts the geometric winning
// predicates advanced for the mover and simultaneously blocked for the opponent
// by each initially playable bottom cell.  This is an exact structural impact
// count, not by itself a game-theoretic optimal-move theorem.

const K=4;
function horizontalIntervalsContaining(W,c){
  const lo=Math.max(0,c-(K-1)),hi=Math.min(c,W-K);
  return Math.max(0,hi-lo+1);
}
function degreeFormula(W,c,H=K){
  assert(W>=K&&H>=K&&c>=0&&c<W);
  return 1
    + horizontalIntervalsContaining(W,c)
    + (c<=W-K?1:0)
    + (c>=K-1?1:0);
}
function generatedDegree(W,c,H=K){
  let n=0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
    const cells=[];let ok=true;
    for(let i=0;i<K;i++){
      const xx=x+i*dx,yy=y+i*dy;
      if(xx<0||xx>=W||yy<0||yy>=H){ok=false;break;}
      cells.push([xx,yy]);
    }
    if(ok&&cells.some(([xx,yy])=>xx===c&&yy===0))n++;
  }
  return n;
}
function profile(W){
  const degrees=Array.from({length:W},(_,c)=>degreeFormula(W,c,6));
  const max=Math.max(...degrees);
  return {W,degrees,max,maxColumns:degrees.map((d,c)=>d===max?c:null).filter(c=>c!==null)};
}

const reports=[];
for(let W=4;W<=40;W++){
  const p=profile(W);reports.push(p);
  for(let c=0;c<W;c++)assert.equal(generatedDegree(W,c,6),p.degrees[c]);
  if(W===4)assert.deepEqual(p.maxColumns,[0,3]);
  else if(W===5)assert.deepEqual(p.maxColumns,[1,3]);
  else if(W===6)assert.deepEqual(p.maxColumns,[2,3]);
  else if(W===7)assert.deepEqual(p.maxColumns,[3]);
  else assert.deepEqual(p.maxColumns,Array.from({length:W-6},(_,i)=>i+3));
}
const unique=reports.filter(r=>r.maxColumns.length===1);
assert.deepEqual(unique.map(r=>r.W),[7]);
const standard=profile(7);
assert.deepEqual(standard.degrees,[3,4,5,7,5,4,3]);
assert.deepEqual(standard.maxColumns,[3]);

console.log(`K4_INITIAL_EVENT_CENTRALITY=${JSON.stringify({
  proved:true,
  formula:'d_W(c)=1+h4_W(c)+I(c<=W-4)+I(c>=3)',
  interpretation:'number of geometric winning predicates advanced for mover / blocked for opponent by the empty-board bottom event',
  uniqueMaximumWidth:7,
  standard,
  generalMaximum:{W4:[0,3],W5:[1,3],W6:[2,3],W7:[3],Wge8:'columns 3..W-4'},
  phaseCenterRelation:'At W=7 the unique requirement-impact maximum is also the unique center of the canonical phase path P_W.',
  proofBoundary:'Exact empty-board geometry only. Maximum local requirement impact is not asserted to imply optimal play without an additional CPC/NDC deadline/dominance theorem.',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'}
})}`);
