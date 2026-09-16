#!/usr/bin/env node
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const SEQUENCE = '4665655546';
const HINGE_COLUMN = 3; // zero-based D
const TARGETS = Object.freeze({ C3: 2 * 7 + 2, G3: 2 * 7 + 6 });

function replay(kernel, sequence) {
  let stateId = kernel.rootId;
  for (const digit of sequence) {
    const child = kernel.advance(stateId, Number(digit)-1);
    if (!Number.isSafeInteger(child) || child < 0) throw new Error(`bad replay ${sequence}`);
    stateId = child;
  }
  return stateId;
}
function rank(kernel,id){return kernel.supportAccess.rankAt(kernel.states.supportAt(id));}
function legal(kernel,id){const s=kernel.states.supportAt(id),out=[];for(let c=0;c<7;c++)if(kernel.supportAccess.landingAt(s,c)!==0xff)out.push(c);return out;}
function heights(kernel,id){const s=kernel.states.supportAt(id),out=[];for(let c=0;c<7;c++){const cell=kernel.supportAccess.landingAt(s,c);out.push(cell===0xff?6:Math.floor(cell/7));}return out;}
function phase(h){return h.map(x=>x&1);}
function hasCell([lo,hi],cell){return cell<32?(((lo>>>cell)&1)!==0):(((hi>>>(cell-32))&1)!==0);}
function cellsOf(term){const out=[];for(let cell=0;cell<42;cell++)if(hasCell(term,cell))out.push(cell);return out;}
function terms(kernel,id,player){const cid=player===0?kernel.states.p0At(id):kernel.states.p1At(id);return kernel.classes.terms(cid).map(cellsOf);}
function coord(cell){return `${String.fromCharCode(65+(cell%7))}${Math.floor(cell/7)+1}`;}
function findSingleton(ts,cell){return ts.some(t=>t.length===1&&t[0]===cell);}
function baseOwnerRelativeToSideToMove(stateRank,targetCell){const row=Math.floor(targetCell/7);const N=36-stateRank+row+1;return ((N-1)&1)===0?'sideToMove':'opponent';}

const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});
kernel.prepareSearchStorage();
const root=replay(kernel,SEQUENCE);
if(rank(kernel,root)!==10)throw new Error('rank drift');
const beforeTerms=terms(kernel,root,0);
const hingePairs={
  C3D3: beforeTerms.some(t=>t.length===2&&t.includes(TARGETS.C3)&&t.includes(17)),
  D3G3: beforeTerms.some(t=>t.length===2&&t.includes(17)&&t.includes(TARGETS.G3)),
};
if(!hingePairs.C3D3||!hingePairs.D3G3)throw new Error('hinge pair drift');

const afterP0=kernel.advance(root,HINGE_COLUMN);
if(afterP0===domain.QN_TERMINAL_WIN)throw new Error('D3 unexpectedly immediate terminal');
if(afterP0<0)throw new Error('D3 illegal');
const afterP0Terms=terms(kernel,afterP0,0);
const afterP0Singletons={C3:findSingleton(afterP0Terms,TARGETS.C3),G3:findSingleton(afterP0Terms,TARGETS.G3)};
const replies=[];
for(const c of legal(kernel,afterP0)){
  const landing=kernel.supportAccess.landingAt(kernel.states.supportAt(afterP0),c);
  const child=kernel.advance(afterP0,c);
  if(child===domain.QN_TERMINAL_WIN){replies.push({column:c+1,landing:coord(landing),p1Terminal:true});continue;}
  if(child<0){replies.push({column:c+1,landing:coord(landing),invalid:true});continue;}
  const h=heights(kernel,child),ph=phase(h),p0=terms(kernel,child,0);
  const singletonState={C3:findSingleton(p0,TARGETS.C3),G3:findSingleton(p0,TARGETS.G3)};
  replies.push({
    column:c+1,
    landing:coord(landing),
    p1Terminal:false,
    supportRank:rank(kernel,child),
    heights:h,
    phase:ph.join(''),
    phaseWeight:ph.reduce((a,b)=>a+b,0),
    hingeSingletons:singletonState,
    C3SupportDistance:Math.max(0,2-h[2]),
    G3SupportDistance:Math.max(0,2-h[6]),
    baseOwnerC3:baseOwnerRelativeToSideToMove(rank(kernel,child),TARGETS.C3),
    baseOwnerG3:baseOwnerRelativeToSideToMove(rank(kernel,child),TARGETS.G3),
  });
}
const nonterminal=replies.filter(r=>!r.p1Terminal&&!r.invalid);
console.log(`D3_HINGE_CONTROL=${JSON.stringify({
  kind:'standard7x6-zero-phase-d3-hinge-convergence-v1',
  attribution:{researchDirectionInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  sequence:SEQUENCE,
  rootHeights:heights(kernel,root),
  rootPhase:phase(heights(kernel,root)).join(''),
  hingePairs,
  p0Move:{column:4,landing:'D3',immediateTerminal:false,afterMovePhase:phase(heights(kernel,afterP0)).join(''),singletonConsequences:afterP0Singletons},
  replies,
  universalFacts:{
    noImmediateP1TerminalReply:replies.every(r=>!r.p1Terminal),
    bothSingletonsSurviveEveryNonterminalReply:nonterminal.every(r=>r.hingeSingletons.C3&&r.hingeSingletons.G3),
    bothTargetsBaseP0AtEveryNonterminalReply:nonterminal.every(r=>r.baseOwnerC3==='sideToMove'&&r.baseOwnerG3==='sideToMove'),
    zeroPhaseReplyColumns:nonterminal.filter(r=>r.phaseWeight===0).map(r=>r.column),
    defectPhaseReplyColumns:nonterminal.filter(r=>r.phaseWeight>0).map(r=>r.column),
  },
  theoremBoundary:'This establishes only the immediate universal structural consequence of P0:D3 across one P1 reply. Nonplayable singleton residuals are future obligations, not immediate wins; base CPC ownership is zero-reservation only.',
  authority:'Pure C4-0010 transitions. No external W/D/L labels and no recursive hard-frontier descent.'
})}`);
