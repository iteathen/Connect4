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
const cases=Object.freeze([
  {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3},
  {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3},
  {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3},
  {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3},
]);
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
function hist(xs,fn){const o={};for(const x of xs){const k=fn(x);o[k]=(o[k]??0)+1;}return Object.fromEntries(Object.entries(o).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))));}

function produce(){
  const k=makeKernel(),e=createRepairCapacityProofEngine(k,{collectAllWinningActions:false,maxProofStates:100000}),rank20Keys=[];
  for(const c of cases){
    const r19=replay(k,ROOT+c.prefix+String(c.resolved+1).repeat(3));
    for(const sourceRepair of REPAIRS){
      const state=k.advance(r19,sourceRepair);assert(state>=0&&e.rank(state)===20);let any=false;
      for(let action=0;action<7;action++){
        if(e.landing(state,action)===0xff)continue;const p1=k.advance(state,action);
        if(p1===domain.QN_TERMINAL_WIN){any=true;continue;}assert(p1>=0&&e.rank(p1)===21);let ok=true;
        for(const reply of e.legal(p1)){
          const cell=e.landing(p1,reply),p0=k.advance(p1,reply);
          if(p0===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(p1,1)).has(cell));ok=false;continue;}
          assert(p0>=0&&e.rank(p0)===22);if(e.terminalActions(p0,0).length)continue;if(!e.prove(p0,c.target).proved)ok=false;
        }
        if(ok)any=true;
      }
      assert(any,`${c.name}:${e.col(sourceRepair)} rank20 closure regressed`);rank20Keys.push(e.exactStateTargetKey(state,c.target));
    }
  }
  const stats=e.stats();assert.equal(stats.proofStates,38171);assert.equal(stats.certifiedStateTargetPairs,32881);assert.equal(new Set(rank20Keys).size,16);
  return {frozen:new Set(e.exportCertificate().exactStateTargetKeys),rank20:new Set(rank20Keys)};
}

const produced=produce();
const k=makeKernel(),e=createRepairCapacityProofEngine(k,{collectAllWinningActions:false,maxProofStates:1});
const memo=new Map(),gaps=new Map();
function deepCertified(state,target){return produced.frozen.has(e.exactStateTargetKey(state,target));}
function gapCheck(state,target,source){
  const key=e.exactStateTargetKey(state,target);if(memo.has(key)){const old=memo.get(key);if(old.kind==='gap'){const g=gaps.get(key);if(g&&!g.sources.some(x=>x.sequence===source.sequence))g.sources.push(source);}return old;}
  if(e.terminalActions(state,0).length){const x={closed:true,kind:'terminal'};memo.set(key,x);return x;}
  if(produced.rank20.has(key)){const x={closed:true,kind:'qualified_rank20'};memo.set(key,x);return x;}
  if(!e.invariant(state,target)){const x={closed:false,kind:'outside_invariant'};memo.set(key,x);return x;}
  const rejected=[];let any=false;
  for(const action of REPAIRS){
    const actionCell=e.landing(state,action);if(actionCell===0xff){rejected.push({action:e.col(action),mechanism:'full'});continue;}
    const afterP0=k.advance(state,action);if(afterP0===domain.QN_TERMINAL_WIN){any=true;continue;}assert(afterP0>=0&&e.rank(afterP0)===21);
    let ok=true,firstFailure=null;
    for(const reply of e.legal(afterP0)){
      const replyCell=e.landing(afterP0,reply),afterP1=k.advance(afterP0,reply);
      if(afterP1===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(afterP0,1)).has(replyCell));ok=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),mechanism:'P1_terminal'};continue;}
      assert(afterP1>=0&&e.rank(afterP1)===22);if(e.terminalActions(afterP1,0).length)continue;if(deepCertified(afterP1,target))continue;
      const targetLive=e.singleton(afterP1,0,target),distance=e.targetDistance(afterP1,target),deadlines=e.enabledSingletons(afterP1,1).map(e.coord);
      let mechanism;
      if(!targetLive) mechanism='target_killed';
      else if(distance!==1) mechanism=`target_distance_${distance}`;
      else if(deadlines.length) mechanism='uncertified_child_deadline';
      else mechanism='uncertified_child_clean_invariant';
      ok=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),mechanism,targetLive,targetDistance:distance,enabledP1:deadlines,childMu:e.mu(afterP1)};
    }
    if(ok)any=true;else rejected.push({action:e.col(action),...firstFailure});
  }
  const x=any?{closed:true,kind:'one_layer'}:{closed:false,kind:'gap',rejected};memo.set(key,x);
  if(x.kind==='gap')gaps.set(key,{state,target,sources:[source],rejected});
  return x;
}

// Exact post-block rank18 domain and all P0/P1 routes into rank20.
const rank18=[];
for(const x of [
  {family:'C_first',resolved:C,target:G3,replies1:[0,1,3,4,5,6]},
  {family:'G_first',resolved:G,target:C3,replies1:[0,1,2,3,4,5]},
])for(const r1 of x.replies1){
  const prefix=ROOT+`${x.resolved+1}${r1+1}${x.resolved+1}${x.resolved+1}`;
  const s16=replay(k,prefix),s17=k.advance(s16,x.resolved);assert(s17>=0&&e.rank(s17)===17);
  for(const r2 of e.legal(s17)){const s18=k.advance(s17,r2);assert(s18>=0&&s18!==domain.QN_TERMINAL_WIN&&e.rank(s18)===18);rank18.push({family:x.family,r1,r2,state:s18,target:x.target,sequence:prefix+String(x.resolved+1)+String(r2+1)});}
}
assert.equal(rank18.length,84);
for(const row of rank18)for(const action of e.legal(row.state)){
  const s19=k.advance(row.state,action);if(s19===domain.QN_TERMINAL_WIN)continue;assert(s19>=0&&e.rank(s19)===19);
  for(const reply of e.legal(s19)){
    const replyCell=e.landing(s19,reply),s20=k.advance(s19,reply);if(s20===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(s19,1)).has(replyCell));continue;}assert(s20>=0&&e.rank(s20)===20);
    gapCheck(s20,row.target,{sequence:row.sequence+String(action+1)+String(reply+1),rank18:`${row.family}:${e.col(row.r1)}->${e.col(row.r2)}`,p0Action:e.col(action),p1Reply:e.col(reply)});
  }
}
assert.equal(e.stats().proofStates,0,'obstruction census invoked recursive proof');
assert.equal(gaps.size,362,'rank20 gap population drift');

function actionPattern(g,columnAware=true){
  const m=new Map(g.rejected.map(x=>[x.action,x.mechanism]));
  const vals=REPAIRS.map(c=>{const a=e.col(c),v=m.get(a)??'accepted';return columnAware?`${a}:${v}`:v;});
  return columnAware?vals.join('|'):[...vals].sort().join('|');
}
const rows=[...gaps.values()].map(g=>{
  const rootDeadlines=e.enabledSingletons(g.state,1).map(e.coord);
  const phase=e.heights(g.state).map(x=>x&1).join('');
  const columnPattern=actionPattern(g,true),multisetPattern=actionPattern(g,false);
  const mechanisms=new Set(g.rejected.map(x=>x.mechanism));
  return {...g,targetCoord:e.coord(g.target),mu:e.mu(g.state),phase,rootDeadlines,columnPattern,multisetPattern,mechanisms:[...mechanisms].sort()};
});
const coarseClasses=new Map();
for(const r of rows){
  const key=`t${r.targetCoord}|m${r.mu}|rd${r.rootDeadlines.length}|p${r.multisetPattern}`;
  const c=coarseClasses.get(key)??{count:0,target:r.targetCoord,mu:r.mu,rootDeadlineCount:r.rootDeadlines.length,mechanismMultiset:r.multisetPattern,samples:[]};c.count++;if(c.samples.length<3)c.samples.push({source:r.sources[0],rootDeadlines:r.rootDeadlines,columnPattern:r.columnPattern});coarseClasses.set(key,c);
}
const classes=[...coarseClasses.values()].sort((a,b)=>b.count-a.count||a.target.localeCompare(b.target)||a.mu-b.mu);
const mechanismOccurrences=[];for(const r of rows)for(const x of r.rejected)mechanismOccurrences.push({state:r,action:x.action,mechanism:x.mechanism});
const cleanChildStates=rows.filter(r=>r.rejected.some(x=>x.mechanism==='uncertified_child_clean_invariant'));
const deadlineChildStates=rows.filter(r=>r.rejected.some(x=>x.mechanism==='uncertified_child_deadline'));
const terminalExposureStates=rows.filter(r=>r.rejected.some(x=>x.mechanism==='P1_terminal'));
const targetKilledStates=rows.filter(r=>r.rejected.some(x=>x.mechanism==='target_killed'));
const noRootDeadline=rows.filter(r=>r.rootDeadlines.length===0);

console.log(`RANK20_GAP_OBSTRUCTION_CENSUS=${JSON.stringify({
  kind:'standard7x6-rank20-gap-obstruction-census-v1',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  uniqueGapStates:rows.length,
  consumerRecursiveProofCalls:e.stats().proofStates,
  byTarget:hist(rows,x=>x.targetCoord),
  muHistogram:hist(rows,x=>x.mu),
  rootDeadlineCountHistogram:hist(rows,x=>x.rootDeadlines.length),
  rootDeadlineSetHistogram:hist(rows,x=>x.rootDeadlines.length?x.rootDeadlines.join(','):'none'),
  repairActionFailureMechanismHistogram:hist(mechanismOccurrences,x=>x.mechanism),
  columnAwareActionPatternCount:new Set(rows.map(x=>x.columnPattern)).size,
  mechanismMultisetPatternCount:new Set(rows.map(x=>x.multisetPattern)).size,
  coarseObstructionClassCount:classes.length,
  topCoarseObstructionClasses:classes.slice(0,24),
  statesWithCleanInvariantUncertifiedChild:cleanChildStates.length,
  statesWithDeadlineBearingUncertifiedChild:deadlineChildStates.length,
  statesWithP1TerminalExposure:terminalExposureStates.length,
  statesWithTargetKilledChild:targetKilledStates.length,
  noRootDeadlineStates:noRootDeadline.length,
  noRootDeadlineWithCleanInvariantChild:noRootDeadline.filter(r=>r.rejected.some(x=>x.mechanism==='uncertified_child_clean_invariant')).length,
  representativeCleanNoDeadline:noRootDeadline.find(r=>r.rejected.some(x=>x.mechanism==='uncertified_child_clean_invariant')) ? (()=>{const r=noRootDeadline.find(r=>r.rejected.some(x=>x.mechanism==='uncertified_child_clean_invariant'));return {target:r.targetCoord,mu:r.mu,phase:r.phase,sequence:r.sources[0].sequence,source:r.sources[0],rootDeadlines:r.rootDeadlines,columnPattern:r.columnPattern,rejected:r.rejected};})() : null,
  interpretation:'The obstruction census classifies why the existing one-layer repair predecessor fails, rather than treating every exact rank20 state as its own theorem class. In particular, uncertified_child_clean_invariant means the target remains live at support distance one, no enabled P1 singleton is present in the offending child, and the only observed defect is absence from the finite frozen certificate; that is the strongest signal that certificate coverage, rather than a new tactical deadline, is the missing premise.',
  theoremBoundary:'Obstruction classes are diagnostic only. The consumer makes zero recursive repair calls, labels no gap state losing, and does not widen storage. A clean invariant child is not assumed winning merely because it satisfies the same local invariant; it is explicitly recorded as an unproved candidate for the next representative theorem test.',
})}`);
