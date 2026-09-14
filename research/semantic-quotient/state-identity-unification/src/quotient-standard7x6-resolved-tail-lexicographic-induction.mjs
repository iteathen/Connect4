#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createRepairCapacityProofEngine, STANDARD7X6_REPAIR_COLUMNS as REPAIRS } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const ROOT='466565554644';
const C=2,G=6,C3=16,G3=20,MAX=100000;
const SAMPLES=Object.freeze([
 {name:'C3_1',sequence:'46656555464471777443',target:C3},{name:'C3_2',sequence:'46656555464472777443',target:C3},
 {name:'C3_3',sequence:'46656555464473777445',target:C3},{name:'C3_4',sequence:'46656555464473777446',target:C3},
 {name:'C3_5',sequence:'46656555464473777454',target:C3},{name:'C3_6',sequence:'46656555464473777565',target:C3},
 {name:'G3_1',sequence:'46656555464436333657',target:G3},{name:'G3_2',sequence:'46656555464435333667',target:G3},
 {name:'G3_3',sequence:'46656555464434333667',target:G3},{name:'G3_4',sequence:'46656555464432333667',target:G3},
 {name:'G3_5',sequence:'46656555464431333667',target:G3},{name:'G3_6',sequence:'46656555464431333575',target:G3},
]);
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
function resolvedCol(target){return target===G3?C:G;}
function lexLess(a,b){return a.delta<b.delta||(a.delta===b.delta&&a.mu<b.mu);}
function lexLe(a,b){return a.delta<b.delta||(a.delta===b.delta&&a.mu<=b.mu);}

function createLexEngine(k){
 const e=createRepairCapacityProofEngine(k,{collectAllWinningActions:false,maxProofStates:MAX});
 const memo=new Map();let proofStates=0,actions=0,p1Branches=0,maxDepth=0,tailWitnesses=0,repairWitnesses=0;
 function delta(state,target){return Math.max(0,6-e.heights(state)[resolvedCol(target)]);}
 function measure(state,target){return {delta:delta(state,target),mu:e.mu(state)};}
 function key(state,target){return `${state}:${target}`;}
 function prove(state,target,depth=0){
  const mk=key(state,target);if(memo.has(mk))return memo.get(mk);proofStates++;maxDepth=Math.max(maxDepth,depth);
  if(proofStates>MAX)throw new Error(`lex proof-state cap exceeded ${MAX}`);
  assert.equal(e.rank(state)%2,0,'lex proof node must be P0 turn');
  const m=measure(state,target),immediate=e.terminalActions(state,0);
  if(immediate.length){const out={proved:true,kind:'immediate_P0_terminal',measure:m};memo.set(mk,out);return out;}
  if(!e.invariant(state,target)){const out={proved:false,kind:'outside_live_target_invariant',measure:m,targetLive:e.singleton(state,0,target),targetDistance:e.targetDistance(state,target)};memo.set(mk,out);return out;}
  const allowed=[...REPAIRS];const rcol=resolvedCol(target);if(m.delta>0&&!allowed.includes(rcol))allowed.push(rcol);
  const rejected=[];
  for(const action of allowed){
   const cell=e.landing(state,action);if(cell===0xff)continue;actions++;
   const afterP0=k.advance(state,action);
   if(afterP0===domain.QN_TERMINAL_WIN){const kind=action===rcol?'resolved_tail_terminal':'repair_terminal';const out={proved:true,kind:'lex_predecessor',measure:m,witness:e.col(action),witnessKind:kind};memo.set(mk,out);return out;}
   assert(afterP0>=0&&e.rank(afterP0)===e.rank(state)+1);
   const afterP0Measure=measure(afterP0,target);
   if(action===rcol){assert.equal(afterP0Measure.delta,m.delta-1,'resolved-tail action failed to decrease tail deficit');assert.equal(afterP0Measure.mu,m.mu,'resolved-tail action changed repair mu');}
   else {assert.equal(afterP0Measure.mu,m.mu-1,'repair action failed to decrease mu');assert(afterP0Measure.delta<=m.delta,'repair action increased tail deficit');}
   assert(lexLess(afterP0Measure,m),'selected P0 action failed lexicographic descent');
   let ok=true,firstFailure=null;
   for(const reply of e.legal(afterP0)){
    const replyCell=e.landing(afterP0,reply);p1Branches++;
    const child=k.advance(afterP0,reply);
    if(child===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(afterP0,1)).has(replyCell));ok=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),reason:'P1_terminal'};continue;}
    assert(child>=0&&e.rank(child)===e.rank(state)+2);
    const childMeasure=measure(child,target);assert(lexLe(childMeasure,afterP0Measure),'P1 reply increased lexicographic resource');
    if(e.terminalActions(child,0).length)continue;
    if(!e.invariant(child,target)){ok=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),reason:'outside_live_target_invariant',childMeasure};continue;}
    const sub=prove(child,target,depth+1);
    if(!sub.proved){ok=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),reason:sub.kind,childMeasure};}
   }
   if(ok){if(action===rcol)tailWitnesses++;else repairWitnesses++;const out={proved:true,kind:'lex_predecessor',measure:m,witness:e.col(action),witnessKind:action===rcol?'resolved_tail_descent':'repair_descent'};memo.set(mk,out);return out;}
   rejected.push({action:e.col(action),...firstFailure});
  }
  const out={proved:false,kind:'no_lex_predecessor',measure:m,rejected};memo.set(mk,out);return out;
 }
 return {e,prove,measure,stats:()=>({proofStates,actionsChecked:actions,p1BranchesChecked:p1Branches,maxDepth,tailWitnesses,repairWitnesses,memoEntries:memo.size})};
}

const rows=[];
for(const sample of SAMPLES){
 const k=makeKernel(),x=createLexEngine(k),state=replay(k,sample.sequence);assert.equal(x.e.rank(state),20);assert(x.e.invariant(state,sample.target));assert.equal(x.e.mu(state),15);assert.equal(x.measure(state,sample.target).delta,2,'sample resolved-tail deficit drift');
 let result=null,error=null;try{result=x.prove(state,sample.target);}catch(err){error=String(err?.message??err);if(!error.includes('lex proof-state cap exceeded')&&!error.includes('reserved quotient'))throw err;}
 rows.push({...sample,completed:error===null,proved:result?.proved??false,witness:result?.witness??null,witnessKind:result?.witnessKind??null,kind:result?.kind??null,measure:x.measure(state,sample.target),error,stats:x.stats(),rejected:result?.rejected??[]});
 if(typeof globalThis.gc==='function')globalThis.gc();
}
const completed=rows.filter(x=>x.completed),proved=completed.filter(x=>x.proved),failed=completed.filter(x=>!x.proved),resource=rows.filter(x=>!x.completed);
const witnessKinds={};for(const x of proved)witnessKinds[x.witnessKind]=(witnessKinds[x.witnessKind]??0)+1;

console.log(`RESOLVED_TAIL_LEXICOGRAPHIC_INDUCTION=${JSON.stringify({
 kind:'standard7x6-resolved-tail-plus-repair-lexicographic-predecessor-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 measure:'rho=(resolved-tail deficit delta=6-height(resolved C/G column), mu=sum remaining capacities in A,B,D,E,F)',
 rule:'At a P0 live-target/support-distance-one state, allow A/B/D/E/F repair actions and, while delta>0, the previously resolved C/G column. A resolved-tail action decreases delta by one with mu unchanged; a repair action decreases mu by one; every P1 reply is nonincreasing in both. Exact terminal and invariant guards remain mandatory.',
 exactPreviouslyUnprovedStarts:rows.length,completedStarts:completed.length,provedStarts:proved.length,failedStarts:failed.length,resourceFailures:resource.length,witnessKinds,
 rows:rows.map(x=>({name:x.name,sequence:x.sequence,target:x.target===C3?'C3':'G3',proved:x.proved,witness:x.witness,witnessKind:x.witnessKind,kind:x.kind,measure:x.measure,error:x.error,stats:x.stats,rejected:x.proved?[]:x.rejected.slice(0,6)})),
 interpretation:failed.length===0&&resource.length===0
  ? 'All twelve previously directly unproved μ=15 partial-tail clean states close under one well-founded lexicographic predecessor schema once resolved-tail advancement is admitted as a structural action. This is positive evidence that the missing calculus is tail-completion descent composed ahead of the existing repair-capacity induction.'
  : 'The lexicographic tail+repair schema does not close every previously unproved representative. Preserve the exact failed action/reply separators; do not infer loss or widen the proof cap.',
 theoremBoundary:'This is a bounded structural induction over the twelve exact previously unproved μ=15 representatives. It adds only the previously resolved C/G column to the qualified A/B/D/E/F action family and uses an explicit lexicographic well-founded measure. It is not q equality, arbitrary minimax, solved-WDL lookup, center-opening W membership, or a root solve.'
})}`);
