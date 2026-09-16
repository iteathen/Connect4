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

function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
function popcount32(x){x>>>=0;x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return ((((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24);}
function parseTerm(s){const [a,b]=s.split(':');return [Number.parseInt(a,16)>>>0,Number.parseInt(b,16)>>>0];}
function bitCount([lo,hi]){return popcount32(lo)+popcount32(hi);}
function bitHas([lo,hi],x){return x<32?(((lo>>>x)&1)!==0):(((hi>>>(x-32))&1)!==0);}
function oneBitCell(term){if(bitCount(term)!==1)return null;for(let x=0;x<42;x++)if(bitHas(term,x))return x;return null;}
function parseExactKey(key){
  const p=Object.fromEntries(key.split('|').map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1)];}));
  return {rank:Number(p.rank),turn:Number(p.turn),heights:p.h.split(',').map(Number),r0:p.r0?p.r0.split(';').filter(Boolean).map(parseTerm):[],r1:p.r1?p.r1.split(';').filter(Boolean).map(parseTerm):[],target:Number(p.target)};
}
function landingFromHeights(h,c){return h[c]>=6?0xff:h[c]*7+c;}
function coord(cell){return `${String.fromCharCode(65+(cell%7))}${Math.floor(cell/7)+1}`;}
function muFromHeights(h){return REPAIRS.reduce((s,c)=>s+(6-h[c]),0);}
function enabledSingletonCells(meta,player){
  const terms=player===0?meta.r0:meta.r1,out=[];
  for(const t of terms){const x=oneBitCell(t);if(x!==null&&landingFromHeights(meta.heights,x%7)===x)out.push(x);}
  return out.sort((a,b)=>a-b);
}
function cofactorSizes(terms,cell){return terms.filter(t=>bitHas(t,cell)).map(t=>bitCount(t)-1).sort((a,b)=>a-b);}
function incidentShape(meta){
  return REPAIRS.map(c=>{
    const x=landingFromHeights(meta.heights,c);
    if(x===0xff)return `${c}:full`;
    return `${c}:cap${6-meta.heights[c]}:r0[${cofactorSizes(meta.r0,x).join(',')}]:r1[${cofactorSizes(meta.r1,x).join(',')}]`;
  }).join('|');
}
function feature(meta){
  const enabledP1=enabledSingletonCells(meta,1).map(coord);
  const phase=meta.heights.map(x=>x&1).join('');
  const mu=muFromHeights(meta.heights);
  const f1=`t${meta.target}|m${mu}`;
  const f2=`${f1}|p${phase}`;
  const f3=`${f2}|d${enabledP1.join(',')}`;
  const f4=`${f3}|i${incidentShape(meta)}`;
  return {target:meta.target,mu,phase,enabledP1,incident:incidentShape(meta),levels:[f1,f2,f3,f4]};
}

const cases=Object.freeze([
  {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3},
  {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3},
  {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3},
  {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3},
]);

function produceCertificate(){
  const k=makeKernel(),e=createRepairCapacityProofEngine(k,{collectAllWinningActions:false,maxProofStates:100000});
  const rank20Keys=[];
  for(const c of cases){
    const r19=replay(k,ROOT+c.prefix+String(c.resolved+1).repeat(3));assert.equal(e.rank(r19),19);
    for(const sourceRepair of REPAIRS){
      const state=k.advance(r19,sourceRepair);assert(state>=0&&e.rank(state)===20);assert(e.invariant(state,c.target));
      let any=false;
      for(let action=0;action<7;action++){
        if(e.landing(state,action)===0xff)continue;const afterP0=k.advance(state,action);
        if(afterP0===domain.QN_TERMINAL_WIN){any=true;continue;}
        assert(afterP0>=0&&e.rank(afterP0)===21);let accepted=true;
        for(const reply of e.legal(afterP0)){
          const replyCell=e.landing(afterP0,reply),afterP1=k.advance(afterP0,reply);
          if(afterP1===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(afterP0,1)).has(replyCell));accepted=false;continue;}
          assert(afterP1>=0&&e.rank(afterP1)===22);if(e.terminalActions(afterP1,0).length)continue;
          if(!e.prove(afterP1,c.target).proved)accepted=false;
        }
        if(accepted)any=true;
      }
      assert(any,`${c.name}:${e.col(sourceRepair)} rank20 closure regressed`);rank20Keys.push(e.exactStateTargetKey(state,c.target));
    }
  }
  const stats=e.stats();assert.equal(stats.proofStates,38171);assert.equal(stats.certifiedStateTargetPairs,32881);assert.equal(new Set(rank20Keys).size,16);
  return {certificate:e.exportCertificate(),rank20Keys:new Set(rank20Keys)};
}

const produced=produceCertificate();
const frozenKeys=new Set(produced.certificate.exactStateTargetKeys);

// Build progressive diagnostic indexes over the already-certified set. These are census
// features only; equality of a diagnostic signature is not theorem-reuse authority.
const certifiedLevelSets=[new Set(),new Set(),new Set(),new Set()];
for(const key of frozenKeys){const f=feature(parseExactKey(key));for(let i=0;i<4;i++)certifiedLevelSets[i].add(f.levels[i]);}

const k=makeKernel(),e=createRepairCapacityProofEngine(k,{collectAllWinningActions:false,maxProofStates:1});
const exactRank20Qualified=produced.rank20Keys;
const rank20Memo=new Map(),gapStates=new Map();
let rank20Checks=0,rank20Actions=0,rank20P1Branches=0;
function deepCertified(state,target){return frozenKeys.has(e.exactStateTargetKey(state,target));}
function closeRank20(state,target,source){
  const key=e.exactStateTargetKey(state,target);if(rank20Memo.has(key))return rank20Memo.get(key);rank20Checks++;
  if(e.terminalActions(state,0).length){const o={closed:true,kind:'immediate_P0_terminal'};rank20Memo.set(key,o);return o;}
  if(exactRank20Qualified.has(key)){const o={closed:true,kind:'qualified_rank20_contract'};rank20Memo.set(key,o);return o;}
  if(!e.invariant(state,target)){const o={closed:false,kind:'outside_repair_invariant',targetDistance:e.targetDistance(state,target),mu:e.mu(state)};rank20Memo.set(key,o);return o;}
  const rejected=[],witnesses=[];
  for(const action of REPAIRS){
    if(e.landing(state,action)===0xff)continue;rank20Actions++;const afterP0=k.advance(state,action);
    if(afterP0===domain.QN_TERMINAL_WIN){witnesses.push(e.col(action));continue;}
    assert(afterP0>=0&&e.rank(afterP0)===21);assert.equal(e.mu(afterP0),e.mu(state)-1);
    let accepted=true,firstFailure=null;
    for(const reply of e.legal(afterP0)){
      rank20P1Branches++;const replyCell=e.landing(afterP0,reply),afterP1=k.advance(afterP0,reply);
      if(afterP1===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(afterP0,1)).has(replyCell));accepted=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),reason:'P1_terminal'};continue;}
      assert(afterP1>=0&&e.rank(afterP1)===22);if(e.terminalActions(afterP1,0).length)continue;
      if(deepCertified(afterP1,target))continue;
      accepted=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),reason:'outside_frozen_repair_certificate',targetDistance:e.targetDistance(afterP1,target),mu:e.mu(afterP1),enabledP1:e.enabledSingletons(afterP1,1).map(e.coord)};
    }
    if(accepted)witnesses.push(e.col(action));else rejected.push({action:e.col(action),firstFailure});
  }
  const o={closed:witnesses.length>0,kind:witnesses.length?'one_layer_repair_predecessor':'no_frozen_rank20_predecessor',witnesses,rejected,targetDistance:e.targetDistance(state,target),mu:e.mu(state)};
  rank20Memo.set(key,o);
  if(!o.closed&&o.kind==='no_frozen_rank20_predecessor')gapStates.set(key,{state,target,source:[source],result:o});
  return o;
}

// Reconstruct the exact 84 rank18 post-block states, then exhaust one P0/P1 layer exactly
// as in the green two-kernel consumer. The census collects only invariant rank20 failures.
const rank18=[];
for(const x of [
  {family:'C_first',resolved:C,target:G3,replies1:[0,1,3,4,5,6]},
  {family:'G_first',resolved:G,target:C3,replies1:[0,1,2,3,4,5]},
])for(const r1 of x.replies1){
  const s16=replay(k,ROOT+`${x.resolved+1}${r1+1}${x.resolved+1}${x.resolved+1}`);assert.equal(e.rank(s16),16);
  const threat=e.landing(s16,x.resolved);assert(new Set(e.enabledSingletons(s16,1)).has(threat));
  const s17=k.advance(s16,x.resolved);assert(s17>=0&&e.rank(s17)===17);
  for(const r2 of e.legal(s17)){const cell=e.landing(s17,r2),s18=k.advance(s17,r2);assert(s18!==domain.QN_TERMINAL_WIN,`unexpected P1 terminal ${e.coord(cell)}`);assert(s18>=0&&e.rank(s18)===18);rank18.push({family:x.family,r1,r2,state:s18,target:x.target});}
}
assert.equal(rank18.length,84);
let occurrences=0;
for(const row of rank18){
  for(const action of e.legal(row.state)){
    const s19=k.advance(row.state,action);if(s19===domain.QN_TERMINAL_WIN)continue;assert(s19>=0&&e.rank(s19)===19);
    for(const reply of e.legal(s19)){
      const replyCell=e.landing(s19,reply),s20=k.advance(s19,reply);
      if(s20===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(s19,1)).has(replyCell));continue;}
      assert(s20>=0&&e.rank(s20)===20);
      const source={rank18:`${row.family}:${e.col(row.r1)}->${e.col(row.r2)}`,p0Action:e.col(action),p1Reply:e.col(reply)};
      const key=e.exactStateTargetKey(s20,row.target),before=gapStates.has(key);
      const r=closeRank20(s20,row.target,source);
      if(!r.closed&&r.kind==='no_frozen_rank20_predecessor'){
        occurrences++;
        if(before){const g=gapStates.get(key);if(g&&!g.source.some(x=>JSON.stringify(x)===JSON.stringify(source)))g.source.push(source);}
      }
    }
  }
}
assert.equal(e.stats().proofStates,0,'gap census invoked recursive repair proof');

const gaps=[...gapStates.entries()].map(([key,g])=>{
  const meta=parseExactKey(key),f=feature(meta);
  let firstAbsent='beyond_incident_shape';
  const labels=['target_mu','phase_location','enabled_P1_deadlines','repair_incident_R_shape'];
  for(let i=0;i<4;i++)if(!certifiedLevelSets[i].has(f.levels[i])){firstAbsent=labels[i];break;}
  return {key,state:g.state,target:g.target,targetCoord:e.coord(g.target),mu:f.mu,phase:f.phase,enabledP1:f.enabledP1,incident:f.incident,firstAbsent,sourceCount:g.source.length,sources:g.source.slice(0,4),rejected:g.result.rejected};
});
assert.equal(gaps.length,362,'rank20 distance-one gap population drift');

function hist(xs,keyFn){const o={};for(const x of xs){const k=keyFn(x);o[k]=(o[k]??0)+1;}return Object.fromEntries(Object.entries(o).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))));}
const diagnosticClasses=new Map();
for(const g of gaps){const classKey=`t${g.target}|m${g.mu}|p${g.phase}|d${g.enabledP1.join(',')}|i${g.incident}`;const x=diagnosticClasses.get(classKey)??{count:0,target:g.targetCoord,mu:g.mu,phase:g.phase,enabledP1:g.enabledP1,incident:g.incident,samples:[]};x.count++;if(x.samples.length<3)x.samples.push({source:g.sources[0],rejected:g.rejected});diagnosticClasses.set(classKey,x);}
const classes=[...diagnosticClasses.values()].sort((a,b)=>b.count-a.count||a.target.localeCompare(b.target)||a.mu-b.mu);

console.log(`RANK20_DISTANCE1_GAP_CENSUS=${JSON.stringify({
  kind:'standard7x6-rank20-distance1-frozen-certificate-gap-census-v1',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  producerCertifiedPairs:produced.certificate.stats.certifiedStateTargetPairs,
  consumerRecursiveProofCalls:e.stats().proofStates,
  rank20Checks,
  rank20Actions,
  rank20P1Branches,
  gapOccurrences:occurrences,
  uniqueExactGapStates:gaps.length,
  byTarget:hist(gaps,x=>x.targetCoord),
  muHistogram:hist(gaps,x=>x.mu),
  phaseHistogram:hist(gaps,x=>x.phase),
  enabledP1DeadlineCountHistogram:hist(gaps,x=>x.enabledP1.length),
  enabledP1DeadlineSetHistogram:hist(gaps,x=>x.enabledP1.length?x.enabledP1.join(','):'none'),
  firstSeparatorAgainstCertifiedHistogram:hist(gaps,x=>x.firstAbsent),
  diagnosticClassCount:classes.length,
  topDiagnosticClasses:classes.slice(0,24),
  noEnabledP1DeadlineStates:gaps.filter(x=>x.enabledP1.length===0).length,
  deadlineBearingStates:gaps.filter(x=>x.enabledP1.length>0).length,
  samples:gaps.slice(0,20).map(x=>({target:x.targetCoord,mu:x.mu,phase:x.phase,enabledP1:x.enabledP1,firstAbsent:x.firstAbsent,sourceCount:x.sourceCount,sources:x.sources,rejected:x.rejected})),
  interpretation:'This census isolates only exact P0-turn rank20 states with a live target singleton at support distance one for which one explicit repair predecessor layer cannot discharge every P1 reply into the independently frozen 32,881-pair repair certificate. Progressive separators identify whether the gap is already new at target/mu, phase location, enabled P1 deadlines, repair-channel incident-R shape, or only at still-finer exact residual structure.',
  theoremBoundary:'Diagnostic classes are census groupings, not proof-reuse equivalence classes. No recursive repair proof is invoked in the consumer. No gap state is labeled losing. The census does not widen storage, infer q equality, use solved W/D/L, or promote the latent root to W.',
})}`);
