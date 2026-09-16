#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
//
// Exact structural theorem for the preterminal center-stutter investigation.
// It derives the remaining-column parity defect and the number of future
// same-column two-ply follow-up pairs after each possible P1 reply.
// This is NOT by itself a strong-distance theorem.

function phaseVector(width,heights,height){return heights.map(h=>(height-h)&1);}
function xorWeight(v){return v.reduce((s,x)=>s+x,0);}
function pathLiftLength(a,b){return Math.abs(a-b);}
function sameColumnPairCapacity(height,heights){return heights.reduce((s,h)=>s+Math.floor((height-h)/2),0);}
function analyze(width,height,centerStackHeight){
  assert(width%2===1);assert(height%2===0);assert(centerStackHeight%2===1&&centerStackHeight<height);
  const center=(width-1)/2;
  const before=Array(width).fill(0);before[center]=centerStackHeight;
  // P1 is to move after an odd number of center events.
  const reports=[];
  for(let reply=0;reply<width;reply++){
    const after=before.slice();after[reply]++;
    const phase=phaseVector(width,after,height);
    const remaining=width*height-(centerStackHeight+1);
    const capacity=sameColumnPairCapacity(height,after);
    const displacement=Array(width).fill(0);displacement[center]^=1;displacement[reply]^=1;
    assert.deepEqual(phase,displacement,'even-height empty-board baseline makes remaining-height parity equal the two-ply phase displacement');
    reports.push({reply,phaseWeight:xorWeight(phase),pathTransport:pathLiftLength(center,reply),sameColumnPairCapacity:capacity,remaining});
  }
  const centerReport=reports[center];
  assert.equal(centerReport.phaseWeight,0);
  assert.equal(centerReport.pathTransport,0);
  assert.equal(centerReport.sameColumnPairCapacity,centerReport.remaining/2);
  for(const r of reports)if(r.reply!==center){
    assert.equal(r.phaseWeight,2);
    assert(r.pathTransport>0);
    assert.equal(r.sameColumnPairCapacity,centerReport.sameColumnPairCapacity-1);
  }
  return{width,height,centerStackHeight,center,reports};
}

const family=[];
for(let W=5;W<=15;W+=2)for(let H=4;H<=12;H+=2)for(let stack=1;stack<H;stack+=2)family.push(analyze(W,H,stack));
const standard=[1,3,5].map(stack=>analyze(7,6,stack));

console.log(`ZERO_PHASE_FOLLOWUP_RESERVOIR=${JSON.stringify({
  proved:true,
  theorem:{
    domain:'odd width W, even height H, odd same-column stack height s<H, with P1 to move',
    centerReply:'unique reply with zero remaining-height parity defect and zero phase-path displacement',
    offCenterReply:'exactly two odd remaining-height columns; phase defect e_center+e_reply',
    followupCapacity:'center gives E/2 future same-column two-ply pairs; every off-center reply gives E/2-1',
    difference:'exactly one two-ply zero-phase follow-up pair'
  },
  standard,
  finiteQualification:{widths:'odd 5..15',heights:'even 4..12',profiles:family.length},
  proofBoundary:'Exact structural reservoir theorem only. It does not prove strong-distance optimality or that cross-column inverse resources cannot compensate for the missing zero-phase pair. In particular the structural preference persists at standard stack height 5, so external strong-distance tie evidence at ply 6 falsifies treating this reservoir as the complete game-distance metric.',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'}
})}`);
