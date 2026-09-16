#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createRepairCapacityProofEngine, STANDARD7X6_REPAIR_COLUMNS as REPAIRS } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const ROOT='466565554644';
const C=2,G=6,C3=16,G3=20;
const MAX=100000;
const NEGATIVE_SAMPLE_PER_TARGET=6;
const cases=Object.freeze([
  {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3,adjacentTail:5},
  {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3,adjacentTail:5},
  {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3,adjacentTail:3},
  {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3,adjacentTail:3},
]);
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
function hamming(a,b){assert.equal(a.length,b.length);let n=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i])n++;return n;}
function l1(a,b){assert.equal(a.length,b.length);return a.reduce((s,x,i)=>s+Math.abs(x-b[i]),0);}
function minOr(xs,f=0){return xs.length?Math.min(...xs):f;}
function maxOr(xs,f=0){return xs.length?Math.max(...xs):f;}

const k=makeKernel(),e=createRepairCapacityProofEngine(k,{collectAllWinningActions:true,maxProofStates:MAX});
function phase(state){return e.heights(state).map(x=>x&1).join('');}
function caps(state){return REPAIRS.map(c=>e.capacity(state,c));}
function sortedCaps(state){return [...caps(state)].sort((a,b)=>a-b);}
function deadlines(state){return e.enabledSingletons(state,1).map(e.coord);}
function local(state,cell,target){
  const p0=e.terms(state,0).filter(t=>t.includes(cell)),p1=e.terms(state,1).filter(t=>t.includes(cell));
  const cof=(t)=>t.filter(x=>x!==cell);
  return {
    p0Incident:p0.length,p1Incident:p1.length,
    p0TargetCoupled:p0.map(cof).filter(t=>t.includes(target)).length,
    p1TargetCoupled:p1.map(cof).filter(t=>t.includes(target)).length,
    p0Cofactors:p0.map(t=>cof(t).map(e.coord).sort().join('+')).sort(),
    p1Cofactors:p1.map(t=>cof(t).map(e.coord).sort().join('+')).sort(),
  };
}
function actionFeatures(state,target){
  const out=[];
  for(const action of REPAIRS){
    const cell=e.landing(state,action);if(cell===0xff)continue;
    const incidence=local(state,cell,target),afterP0=k.advance(state,action);
    if(afterP0===domain.QN_TERMINAL_WIN){out.push({column:e.col(action),cell:e.coord(cell),...incidence,p1TerminalReplies:0,childDeadlineMax:0,childDeadlineSum:0,childInvariantViolations:0,childImmediateP0Terminal:0});continue;}
    assert(afterP0>=0);let p1Terminal=0,deadlineMax=0,deadlineSum=0,invariantViolations=0,p0Terminal=0;
    for(const reply of e.legal(afterP0)){
      const replyCell=e.landing(afterP0,reply),child=k.advance(afterP0,reply);
      if(child===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(afterP0,1)).has(replyCell));p1Terminal++;continue;}
      assert(child>=0);
      const ds=e.enabledSingletons(child,1).length;deadlineMax=Math.max(deadlineMax,ds);deadlineSum+=ds;
      if(e.terminalActions(child,0).length){p0Terminal++;continue;}
      if(!e.invariant(child,target))invariantViolations++;
    }
    out.push({column:e.col(action),cell:e.coord(cell),...incidence,p1TerminalReplies:p1Terminal,childDeadlineMax:deadlineMax,childDeadlineSum:deadlineSum,childInvariantViolations:invariantViolations,childImmediateP0Terminal:p0Terminal});
  }
  return out;
}
function stateDesc(state,target){
  const af=actionFeatures(state,target);
  return {
    rank:e.rank(state),target:e.coord(target),mu:e.mu(state),deadlines:deadlines(state),phase:phase(state),caps:caps(state),sortedCaps:sortedCaps(state),
    p0IncidentSum:af.reduce((s,x)=>s+x.p0Incident,0),p1IncidentSum:af.reduce((s,x)=>s+x.p1Incident,0),
    p0TargetCoupledSum:af.reduce((s,x)=>s+x.p0TargetCoupled,0),p1TargetCoupledSum:af.reduce((s,x)=>s+x.p1TargetCoupled,0),
    actionsWithoutP1Terminal:af.filter(x=>x.p1TerminalReplies===0).length,
    minChildDeadlineMax:minOr(af.map(x=>x.childDeadlineMax)),maxChildDeadlineMax:maxOr(af.map(x=>x.childDeadlineMax)),
    minChildDeadlineSum:minOr(af.map(x=>x.childDeadlineSum)),minInvariantViolations:minOr(af.map(x=>x.childInvariantViolations)),
    maxImmediateP0TerminalReplies:maxOr(af.map(x=>x.childImmediateP0Terminal)),actions:af,
  };
}

// Reconstruct and requalify the sixteen μ=15 adjacent-tail positive starts in their original shared proof arena.
const positive=[];
for(const c of cases){
  const r19seq=ROOT+c.prefix+String(c.resolved+1).repeat(3),r19=replay(k,r19seq);
  const r20=k.advance(r19,c.adjacentTail);assert(r20>=0&&e.rank(r20)===20);
  const r21=k.advance(r20,c.adjacentTail);assert(r21>=0&&r21!==domain.QN_TERMINAL_WIN&&e.rank(r21)===21);
  for(const rc of e.legal(r21)){
    const y=k.advance(r21,rc);assert(y>=0&&y!==domain.QN_TERMINAL_WIN&&e.rank(y)===22);
    if(e.terminalActions(y,0).length)continue;
    assert(e.invariant(y,c.target));assert.equal(e.mu(y),15);
    const seq=r19seq+String(c.adjacentTail+1)+String(c.adjacentTail+1)+String(rc+1);
    const proof=e.prove(y,c.target);assert(proof.proved,`${c.name}:${e.col(rc)} positive start regressed`);
    positive.push({name:`${c.name}:${e.col(c.adjacentTail)}->${e.col(rc)}`,sequence:seq,state:y,target:c.target,proof,desc:stateDesc(y,c.target)});
  }
}
assert.equal(positive.length,16);

// Exact clean post-block rank-20 μ=15 candidates. We select nearest states to the positive corpus
// but prove every selected candidate independently before assigning its outcome.
const candidates=new Map();
for(const fam of [
  {name:'C_first',resolved:C,target:G3,replies1:[0,1,3,4,5,6]},
  {name:'G_first',resolved:G,target:C3,replies1:[0,1,2,3,4,5]},
])for(const r1 of fam.replies1){
  const prefix=ROOT+`${fam.resolved+1}${r1+1}${fam.resolved+1}${fam.resolved+1}`;
  const s16=replay(k,prefix),s17=k.advance(s16,fam.resolved);assert(s17>=0&&e.rank(s17)===17);
  for(const r2 of e.legal(s17)){
    const s18=k.advance(s17,r2);assert(s18>=0&&s18!==domain.QN_TERMINAL_WIN&&e.rank(s18)===18);
    for(const action of e.legal(s18)){
      const s19=k.advance(s18,action);if(s19===domain.QN_TERMINAL_WIN)continue;assert(s19>=0&&e.rank(s19)===19);
      for(const reply of e.legal(s19)){
        const replyCell=e.landing(s19,reply),s20=k.advance(s19,reply);
        if(s20===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(s19,1)).has(replyCell));continue;}
        assert(s20>=0&&e.rank(s20)===20);if(e.terminalActions(s20,0).length||!e.invariant(s20,fam.target)||e.mu(s20)!==15||deadlines(s20).length)continue;
        const key=e.exactStateTargetKey(s20,fam.target),seq=prefix+String(fam.resolved+1)+String(r2+1)+String(action+1)+String(reply+1);
        if(!candidates.has(key))candidates.set(key,{state:s20,target:fam.target,sequence:seq,desc:stateDesc(s20,fam.target)});
      }
    }
  }
}
assert(candidates.size>0,'no μ15 clean candidates');

function nearestDistance(c){
  const ps=positive.filter(p=>p.target===c.target);assert(ps.length);
  return Math.min(...ps.map(p=>{
    const d0=hamming(c.desc.phase,p.desc.phase),d1=l1(c.desc.caps,p.desc.caps),d2=Math.abs(c.desc.p0IncidentSum-p.desc.p0IncidentSum),d3=Math.abs(c.desc.p1IncidentSum-p.desc.p1IncidentSum);
    return d0*1000+d1*100+d2*10+d3;
  }));
}
const selected=[];
for(const target of [C3,G3]){
  const group=[...candidates.values()].filter(x=>x.target===target).sort((a,b)=>nearestDistance(a)-nearestDistance(b)||a.desc.p0IncidentSum-b.desc.p0IncidentSum||a.sequence.localeCompare(b.sequence));
  const seen=new Set();
  for(const x of group){
    const diversity=`${x.desc.phase}|${x.desc.sortedCaps.join(',')}|${x.desc.p0IncidentSum}|${x.desc.p1IncidentSum}`;
    if(seen.has(diversity))continue;seen.add(diversity);selected.push(x);
    if([...selected].filter(y=>y.target===target).length>=NEGATIVE_SAMPLE_PER_TARGET)break;
  }
}

function proveIsolated(row){
  const pk=makeKernel(),pe=createRepairCapacityProofEngine(pk,{collectAllWinningActions:true,maxProofStates:MAX}),s=replay(pk,row.sequence);
  assert.equal(pe.rank(s),20);assert(pe.invariant(s,row.target));assert.equal(pe.mu(s),15);assert.equal(pe.enabledSingletons(s,1).length,0);
  let result=null,error=null;try{result=pe.prove(s,row.target);}catch(err){error=String(err?.message??err);if(!error.includes('proof-state cap exceeded')&&!error.includes('reserved quotient'))throw err;}
  return {result,error,stats:pe.stats()};
}
const sampled=[];
for(const row of selected){const q=proveIsolated(row);sampled.push({...row,completed:q.error===null,proved:q.result?.proved??false,witness:q.result?.witness??null,error:q.error,stats:q.stats});if(typeof globalThis.gc==='function')globalThis.gc();}
const negative=sampled.filter(x=>x.completed&&!x.proved),newPositive=sampled.filter(x=>x.completed&&x.proved),resource=sampled.filter(x=>!x.completed);
assert(negative.length>0,'targeted μ15 sample produced no unproved comparator');

function matchKey(d,tier){
  const common=`${d.target}|m${d.mu}|rd${d.deadlines.join(',')||'none'}`;
  if(tier===1)return `${common}|p${d.phase}|sc${d.sortedCaps.join(',')}`;
  if(tier===2)return `${common}|p${d.phase}`;
  return common;
}
function pairsAt(tier){
  const out=[];
  for(const p of positive)for(const n of negative)if(matchKey(p.desc,tier)===matchKey(n.desc,tier))out.push({p,n,tier});
  return out;
}
let pairs=pairsAt(1),tier=1;if(!pairs.length){pairs=pairsAt(2);tier=2;}if(!pairs.length){pairs=pairsAt(3);tier=3;}
assert(pairs.length>0,'no μ15 proved/unproved matched pair under declared tiers');

function actionDiff(p,n){
  const pm=new Map(p.desc.actions.map(x=>[x.column,x])),nm=new Map(n.desc.actions.map(x=>[x.column,x])),out=[];
  const fields=['p0Incident','p1Incident','p0TargetCoupled','p1TargetCoupled','p1TerminalReplies','childDeadlineMax','childDeadlineSum','childInvariantViolations','childImmediateP0Terminal'];
  for(const c of REPAIRS.map(e.col)){
    const a=pm.get(c),b=nm.get(c);if(!a||!b)continue;
    for(const f of fields)if(a[f]!==b[f])out.push({column:c,field:f,proved:a[f],unproved:b[f]});
    if(JSON.stringify(a.p0Cofactors)!==JSON.stringify(b.p0Cofactors))out.push({column:c,field:'p0Cofactors',proved:a.p0Cofactors,unproved:b.p0Cofactors});
    if(JSON.stringify(a.p1Cofactors)!==JSON.stringify(b.p1Cofactors))out.push({column:c,field:'p1Cofactors',proved:a.p1Cofactors,unproved:b.p1Cofactors});
  }
  return out;
}
const numericFields=['rank','p0IncidentSum','p1IncidentSum','p0TargetCoupledSum','p1TargetCoupledSum','actionsWithoutP1Terminal','minChildDeadlineMax','maxChildDeadlineMax','minChildDeadlineSum','minInvariantViolations','maxImmediateP0TerminalReplies'];
const reports=pairs.slice(0,16).map(({p,n,tier})=>({
  tier,key:matchKey(p.desc,tier),
  proved:{name:p.name,sequence:p.sequence,rank:p.desc.rank,phase:p.desc.phase,caps:p.desc.caps,witness:p.proof.witness??p.proof.selectedWitnessColumn??null},
  unproved:{sequence:n.sequence,rank:n.desc.rank,phase:n.desc.phase,caps:n.desc.caps},
  numericDifferences:numericFields.filter(f=>p.desc[f]!==n.desc[f]).map(f=>({field:f,proved:p.desc[f],unproved:n.desc[f]})),
  actionConditionedDifferences:actionDiff(p,n),
}));

const direction=[];
for(const f of numericFields){const ds=pairs.map(({p,n})=>p.desc[f]-n.desc[f]);if(ds.every(x=>x>0))direction.push({field:f,direction:'proved_gt_unproved',minDelta:Math.min(...ds)});else if(ds.every(x=>x<0))direction.push({field:f,direction:'proved_lt_unproved',maxDelta:Math.max(...ds)});}
const matchedRankDiff=new Set(pairs.map(({p,n})=>`${p.desc.rank}->${n.desc.rank}`));
console.log(`MU15_POSITIVE_NEGATIVE_DIFFERENTIAL=${JSON.stringify({
  kind:'standard7x6-mu15-clean-invariant-positive-negative-differential-v1',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  qualifiedPositiveStarts:positive.length,exactMu15CleanCandidateStates:candidates.size,targetedDirectSamples:sampled.length,
  sampledProved:newPositive.length,sampledUnproved:negative.length,resourceFailures:resource.length,
  selectedMatchingTier:tier,matchingTierMeaning:tier===1?'same target, mu, root deadline set, phase, and sorted repair-capacity multiset':tier===2?'same target, mu, root deadline set, and phase':'same target, mu, and root deadline set',
  matchedPairCount:pairs.length,matchedRankDifferences:[...matchedRankDiff].sort(),consistentDirectionalNumericFields:direction,
  pairReports:reports,
  sampledRows:sampled.map(x=>({sequence:x.sequence,target:x.desc.target,proved:x.proved,witness:x.witness,rank:x.desc.rank,mu:x.desc.mu,phase:x.desc.phase,caps:x.desc.caps,p0IncidentSum:x.desc.p0IncidentSum,p1IncidentSum:x.desc.p1IncidentSum,actionsWithoutP1Terminal:x.desc.actionsWithoutP1Terminal,minChildDeadlineSum:x.desc.minChildDeadlineSum,error:x.error})),
  interpretation:'Mu=15 contains both qualified proved and directly unproved clean live-target states, so mu is definitively not a sufficient value classifier. The matched differential identifies additional load-bearing structure; reported fields are candidate premises only until falsified beyond these pairs.',
  theoremBoundary:'Positive starts are exactly the already-qualified adjacent-tail repair starts and are rechecked by the current proof engine. Comparator outcomes are independently proved/unproved in fresh 100k-state arenas. Matching and feature differences are claim-relative diagnostics, not q/state equality or WDL oracle labels.'
})}`);
