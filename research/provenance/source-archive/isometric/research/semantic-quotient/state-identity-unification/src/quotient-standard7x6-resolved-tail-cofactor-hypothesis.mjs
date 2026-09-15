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
const cases=Object.freeze([
 {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3,adjacentTail:5},
 {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3,adjacentTail:5},
 {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3,adjacentTail:3},
 {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3,adjacentTail:3},
]);
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
function hist(xs,fn){const o={};for(const x of xs){const key=String(fn(x));o[key]=(o[key]??0)+1;}return Object.fromEntries(Object.entries(o).sort((a,b)=>Number(a[0])-Number(b[0])));}
const k=makeKernel(),e=createRepairCapacityProofEngine(k,{collectAllWinningActions:true,maxProofStates:MAX});
function resolvedCol(target){return target===G3?C:G;}
function tailCells(target){const c=resolvedCol(target);return [4*7+c,5*7+c];}
function tailHeight(state,target){return e.heights(state)[resolvedCol(target)];}
function deadlines(state){return e.enabledSingletons(state,1).map(e.coord);}
function burden(state,target){
 const tails=new Set(tailCells(target)),rows=[];let count=0,terms=new Set();
 for(const action of REPAIRS){
  const cell=e.landing(state,action);if(cell===0xff)continue;
  const hits=[];
  for(const t of e.terms(state,1))if(t.includes(cell)){
   const rest=t.filter(x=>x!==cell);if(rest.some(x=>tails.has(x))){count++;const key=rest.map(e.coord).sort().join('+');hits.push(key);terms.add(key);}
  }
  rows.push({column:e.col(action),cell:e.coord(cell),tailCoupledP1Cofactors:[...new Set(hits)].sort()});
 }
 return {count,distinctTerms:[...terms].sort(),byAction:rows.filter(x=>x.tailCoupledP1Cofactors.length)};
}
function descriptor(state,target){return {rank:e.rank(state),target:e.coord(target),mu:e.mu(state),phase:e.heights(state).map(x=>x&1).join(''),caps:REPAIRS.map(c=>e.capacity(state,c)),resolvedColumn:e.col(resolvedCol(target)),resolvedHeight:tailHeight(state,target),rootDeadlines:deadlines(state),tailBurden:burden(state,target)};}

// Qualified positive μ=15 starts.
const positive=[];
for(const c of cases){
 const r19seq=ROOT+c.prefix+String(c.resolved+1).repeat(3),r19=replay(k,r19seq),r20=k.advance(r19,c.adjacentTail),r21=k.advance(r20,c.adjacentTail);assert(r20>=0&&r21>=0);
 for(const rc of e.legal(r21)){
  const y=k.advance(r21,rc);assert(y>=0&&y!==domain.QN_TERMINAL_WIN&&e.rank(y)===22);if(e.terminalActions(y,0).length)continue;assert(e.invariant(y,c.target)&&e.mu(y)===15);
  const proof=e.prove(y,c.target);assert(proof.proved);positive.push({sequence:r19seq+String(c.adjacentTail+1)+String(c.adjacentTail+1)+String(rc+1),state:y,target:c.target,desc:descriptor(y,c.target)});
 }
}
assert.equal(positive.length,16);

// Exact clean post-block μ=15 candidate population.
const candidates=new Map();
for(const fam of [
 {name:'C_first',resolved:C,target:G3,replies1:[0,1,3,4,5,6]},
 {name:'G_first',resolved:G,target:C3,replies1:[0,1,2,3,4,5]},
])for(const r1 of fam.replies1){
 const prefix=ROOT+`${fam.resolved+1}${r1+1}${fam.resolved+1}${fam.resolved+1}`,s16=replay(k,prefix),s17=k.advance(s16,fam.resolved);assert(s17>=0&&e.rank(s17)===17);
 for(const r2 of e.legal(s17)){
  const s18=k.advance(s17,r2);assert(s18>=0&&s18!==domain.QN_TERMINAL_WIN&&e.rank(s18)===18);
  for(const action of e.legal(s18)){
   const s19=k.advance(s18,action);if(s19===domain.QN_TERMINAL_WIN)continue;assert(s19>=0&&e.rank(s19)===19);
   for(const reply of e.legal(s19)){
    const replyCell=e.landing(s19,reply),s20=k.advance(s19,reply);if(s20===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(s19,1)).has(replyCell));continue;}
    assert(s20>=0&&e.rank(s20)===20);if(e.terminalActions(s20,0).length||!e.invariant(s20,fam.target)||e.mu(s20)!==15||deadlines(s20).length)continue;
    const key=e.exactStateTargetKey(s20,fam.target),sequence=prefix+String(fam.resolved+1)+String(r2+1)+String(action+1)+String(reply+1);
    if(!candidates.has(key))candidates.set(key,{sequence,state:s20,target:fam.target,desc:descriptor(s20,fam.target)});
   }
  }
 }
}
assert.equal(candidates.size,160,'μ15 candidate population drift');
const candidateRows=[...candidates.values()];

// Challenge the tail-burden hypothesis directly. Sample minimum-burden states first, then
// maximum-burden states, preserving target diversity and proving each in an isolated arena.
const selected=[],seen=new Set();
function add(row,label){const key=`${row.sequence}:${row.target}`;if(seen.has(key))return;seen.add(key);selected.push({...row,label});}
for(const target of [C3,G3]){
 const group=candidateRows.filter(x=>x.target===target);
 for(const row of [...group].sort((a,b)=>a.desc.tailBurden.count-b.desc.tailBurden.count||b.desc.resolvedHeight-a.desc.resolvedHeight||a.sequence.localeCompare(b.sequence)).slice(0,6))add(row,'minimum_tail_burden');
 for(const row of [...group].sort((a,b)=>b.desc.tailBurden.count-a.desc.tailBurden.count||a.desc.resolvedHeight-b.desc.resolvedHeight||a.sequence.localeCompare(b.sequence)).slice(0,3))add(row,'maximum_tail_burden');
}
function proveIsolated(row){const pk=makeKernel(),pe=createRepairCapacityProofEngine(pk,{collectAllWinningActions:true,maxProofStates:MAX}),s=replay(pk,row.sequence);assert(pe.invariant(s,row.target)&&pe.mu(s)===15);let result=null,error=null;try{result=pe.prove(s,row.target);}catch(err){error=String(err?.message??err);if(!error.includes('proof-state cap exceeded')&&!error.includes('reserved quotient'))throw err;}return {result,error,stats:pe.stats()};}
const sampled=[];
for(const row of selected){const q=proveIsolated(row);sampled.push({...row,proved:q.result?.proved??false,witness:q.result?.witness??null,error:q.error,stats:q.stats});if(typeof globalThis.gc==='function')globalThis.gc();}
const completed=sampled.filter(x=>!x.error),proved=completed.filter(x=>x.proved),unproved=completed.filter(x=>!x.proved),resource=sampled.filter(x=>x.error);

const positiveBurdenZero=positive.filter(x=>x.desc.tailBurden.count===0).length;
const candidateZero=candidateRows.filter(x=>x.desc.tailBurden.count===0),candidateNonzero=candidateRows.filter(x=>x.desc.tailBurden.count>0);
const sampledZero=completed.filter(x=>x.desc.tailBurden.count===0),sampledZeroProved=sampledZero.filter(x=>x.proved),sampledZeroUnproved=sampledZero.filter(x=>!x.proved);
const sampledNonzero=completed.filter(x=>x.desc.tailBurden.count>0),sampledNonzeroProved=sampledNonzero.filter(x=>x.proved);

console.log(`RESOLVED_TAIL_COFACTOR_HYPOTHESIS=${JSON.stringify({
 kind:'standard7x6-resolved-tail-opponent-cofactor-hypothesis-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 qualifiedPositiveStarts:positive.length,
 positiveResolvedHeightHistogram:hist(positive,x=>x.desc.resolvedHeight),
 positiveTailBurdenHistogram:hist(positive,x=>x.desc.tailBurden.count),
 positiveTailBurdenZero:positiveBurdenZero,
 exactMu15CleanCandidates:candidateRows.length,
 candidateResolvedHeightHistogram:hist(candidateRows,x=>x.desc.resolvedHeight),
 candidateTailBurdenHistogram:hist(candidateRows,x=>x.desc.tailBurden.count),
 candidateZeroTailBurden:candidateZero.length,candidateNonzeroTailBurden:candidateNonzero.length,
 targetedSamples:sampled.length,completedSamples:completed.length,sampledProved:proved.length,sampledUnproved:unproved.length,resourceFailures:resource.length,
 sampledZeroTailBurden:sampledZero.length,sampledZeroTailBurdenProved:sampledZeroProved.length,sampledZeroTailBurdenUnproved:sampledZeroUnproved.length,sampledNonzeroTailBurden:sampledNonzero.length,sampledNonzeroTailBurdenProved:sampledNonzeroProved.length,
 sampledRows:sampled.map(x=>({label:x.label,sequence:x.sequence,target:x.desc.target,proved:x.proved,witness:x.witness,rank:x.desc.rank,phase:x.desc.phase,caps:x.desc.caps,resolvedColumn:x.desc.resolvedColumn,resolvedHeight:x.desc.resolvedHeight,tailBurdenCount:x.desc.tailBurden.count,tailBurdenTerms:x.desc.tailBurden.distinctTerms,error:x.error})),
 interpretation: positiveBurdenZero===positive.length&&candidateZero.length===0
  ? 'Resolved-tail opponent cofactor burden cleanly separates the qualified μ15 positives from the exact post-block μ15 candidate population, but sufficiency is not tested because no zero-burden comparator exists in that population.'
  : positiveBurdenZero===positive.length&&sampledZeroUnproved.length===0&&sampledZeroProved.length>0
    ? 'Zero resolved-tail opponent cofactor burden survives the bounded sufficiency challenge: every sampled zero-burden comparator proved, while the qualified positives are all zero-burden. This remains a candidate guarded premise pending broader falsification.'
    : 'The simple zero resolved-tail cofactor-burden predicate is falsified or incomplete in this domain. Preserve the sampled counterexamples and refine to the exact action-conditioned tail cofactor topology rather than using rank or total incidence.',
 theoremBoundary:'Tail burden counts only P1 residual cofactors incident to currently playable A/B/D/E/F repair cells whose remaining cells intersect row 5 or 6 of the previously resolved C/G column. It is a claim-relative diagnostic premise, not state equality, solved WDL, or a proof of the latent root.'
})}`);
