#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN = Object.freeze({ columns: 7, rows: 6, connect: 4 });
const ROOT = '466565554644';
const C = 2, G = 6, C3 = 2 * 7 + C, G3 = 2 * 7 + G;
const TAIL_COLUMNS = Object.freeze([3, 4, 5]); // D,E,F
const CHAIN_COLUMNS = Object.freeze([0, 1]); // A,B

function replay(kernel, seq) {
  let id = kernel.rootId;
  for (const d of seq) {
    const next = kernel.advance(id, Number(d) - 1);
    if (!Number.isSafeInteger(next) || next < 0) throw new Error(`bad replay ${seq}`);
    id = next;
  }
  return id;
}
function rank(kernel, id) { return kernel.supportAccess.rankAt(kernel.states.supportAt(id)); }
function landing(kernel, id, col) { return kernel.supportAccess.landingAt(kernel.states.supportAt(id), col); }
function heights(kernel, id) {
  const support = kernel.states.supportAt(id), out = [];
  for (let c = 0; c < 7; c++) {
    const cell = kernel.supportAccess.landingAt(support, c);
    out.push(cell === 0xff ? 6 : Math.floor(cell / 7));
  }
  return out;
}
function capacity(kernel, id, col) { return 6 - heights(kernel, id)[col]; }
function colName(col) { return String.fromCharCode(65 + col); }
function coord(cell) { return `${colName(cell % 7)}${Math.floor(cell / 7) + 1}`; }
function hasCell([lo, hi], cell) { return cell < 32 ? (((lo >>> cell) & 1) !== 0) : (((hi >>> (cell - 32)) & 1) !== 0); }
function cellsOf(term) { const out=[]; for(let cell=0; cell<42; cell++) if(hasCell(term,cell)) out.push(cell); return out; }
function terms(kernel,id,p){ const cid=p===0?kernel.states.p0At(id):kernel.states.p1At(id); return kernel.classes.terms(cid).map(cellsOf); }
function hasSingleton(kernel,id,cell){ return terms(kernel,id,0).some((term)=>term.length===1&&term[0]===cell); }
function targetSupportDistance(kernel,id,target){ return Math.max(0,2-heights(kernel,id)[target%7]); }
function termKey(term){ return term.map(coord).join('-'); }
function contains(term,cell){ return term.includes(cell); }
function cofactorKey(term,cell){ return term.filter((x)=>x!==cell).map(coord).join('-'); }
function localIncidence(kernel,id,cell){
  if(cell===0xff) return null;
  const p0=terms(kernel,id,0).filter((term)=>contains(term,cell));
  const p1=terms(kernel,id,1).filter((term)=>contains(term,cell));
  return {
    cell: coord(cell),
    p0Incident:p0.map(termKey).sort(), p1Incident:p1.map(termKey).sort(),
    p0Cofactors:p0.map((term)=>cofactorKey(term,cell)).sort(),
    p1Cofactors:p1.map((term)=>cofactorKey(term,cell)).sort(),
  };
}
function stable(value){ if(Array.isArray(value)) return value.map(stable); if(value===null||typeof value!=='object') return value; const out={}; for(const k of Object.keys(value).sort()) out[k]=stable(value[k]); return out; }
function key(value){ return JSON.stringify(stable(value)); }

function classifyChainCandidate(kernel, state, col, target) {
  const actionCell = landing(kernel, state, col);
  assert.notEqual(actionCell, 0xff);
  const beforeCapacity = capacity(kernel, state, col);
  const incidence = localIncidence(kernel, state, actionCell);
  const next = kernel.advance(state, col);
  if (next === domain.QN_TERMINAL_WIN) {
    return {
      column: colName(col), actionCell: coord(actionCell), beforeCapacity,
      inputIncidence: incidence, p0Outcome: 'P0_terminal', safe: true,
      replyCount: 0, terminalP1Replies: 0, targetSupportReplies: 0,
    };
  }
  assert(next >= 0);
  assert.equal(rank(kernel, next), 23);
  const afterCapacity = capacity(kernel, next, col);
  assert.equal(afterCapacity, beforeCapacity - 1);
  const targetLive = hasSingleton(kernel, next, target);
  const supportDistance = targetSupportDistance(kernel, next, target);
  assert.equal(targetLive, true, 'off-target chain action killed live target singleton');
  assert.equal(supportDistance, 1, 'off-target chain action exposed target on P1 turn');

  const replies=[];
  for(let p1Col=0;p1Col<7;p1Col++){
    const replyCell=landing(kernel,next,p1Col);
    if(replyCell===0xff) continue;
    const p1next=kernel.advance(next,p1Col);
    if(p1next===domain.QN_TERMINAL_WIN){
      replies.push({column:colName(p1Col),cell:coord(replyCell),status:'P1_terminal'});
      continue;
    }
    assert(p1next>=0);
    const dist=targetSupportDistance(kernel,p1next,target);
    const live=hasSingleton(kernel,p1next,target);
    assert.equal(live,true,'nonterminal P1 reply killed target singleton without claiming target');
    assert([0,1].includes(dist));
    let route='continue';
    let p0TargetTerminal=false;
    if(dist===0){
      const targetWin=kernel.advance(p1next,target%7);
      assert.equal(targetWin,domain.QN_TERMINAL_WIN,'enabled singleton after P1 support reply did not terminate');
      route='target_enabled_P0_terminal';
      p0TargetTerminal=true;
    }
    replies.push({column:colName(p1Col),cell:coord(replyCell),status:'nonterminal',targetSupportDistance:dist,route,p0TargetTerminal});
  }
  const terminalP1Replies=replies.filter((r)=>r.status==='P1_terminal').length;
  return {
    column: colName(col), actionCell: coord(actionCell), beforeCapacity, afterCapacity,
    inputIncidence: incidence, p0Outcome:'nonterminal_strict_chain_descent',
    targetSingletonPreserved:true,targetSupportDistanceAfterP0:supportDistance,
    replyCount:replies.length,terminalP1Replies,
    targetSupportReplies:replies.filter((r)=>r.route==='target_enabled_P0_terminal').length,
    safe: terminalP1Replies===0,
    replies,
  };
}

const { kernel } = createSlot64ResidualQuotientKernel(DOMAIN, {
  cacheEdges:true,prefixClasses:4096,responseClosure:true,
  searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072}),
});
kernel.prepareSearchStorage();

const cases=[
  {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3},
  {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3},
  {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3},
  {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3},
];

const handoffs=[];
for(const c of cases){
  const rank19=replay(kernel,ROOT+c.prefix+String(c.resolved+1).repeat(3));
  for(const selectedTail of TAIL_COLUMNS){
    const afterRepair=kernel.advance(rank19,selectedTail); assert(afterRepair>=0&&rank(kernel,afterRepair)===20);
    assert.equal(capacity(kernel,afterRepair,selectedTail),1);
    const afterP0=kernel.advance(afterRepair,selectedTail); assert(afterP0>=0&&afterP0!==domain.QN_TERMINAL_WIN);
    assert.equal(capacity(kernel,afterP0,selectedTail),0);
    for(let p1Col=0;p1Col<7;p1Col++){
      const p1Cell=landing(kernel,afterP0,p1Col); if(p1Cell===0xff) continue;
      const afterP1=kernel.advance(afterP0,p1Col); assert(afterP1>=0&&afterP1!==domain.QN_TERMINAL_WIN);
      assert.equal(rank(kernel,afterP1),22);
      if(targetSupportDistance(kernel,afterP1,c.target)===0) continue; // routed already to immediate P0 terminal certificate
      assert.equal(hasSingleton(kernel,afterP1,c.target),true);
      assert.equal(targetSupportDistance(kernel,afterP1,c.target),1);
      assert.equal(capacity(kernel,afterP1,selectedTail),0);

      const candidates=CHAIN_COLUMNS.map((col)=>classifyChainCandidate(kernel,afterP1,col,c.target));
      const safe=candidates.filter((candidate)=>candidate.safe);
      assert(safe.length>0,`${c.name}:${colName(selectedTail)}->${colName(p1Col)} has no safe A/B chain witness`);
      const deterministic=safe.slice().sort((a,b)=>{
        if(b.beforeCapacity!==a.beforeCapacity) return b.beforeCapacity-a.beforeCapacity;
        return a.column.localeCompare(b.column);
      })[0];
      handoffs.push({
        member:`${c.name}:${colName(selectedTail)}->P1:${colName(p1Col)}`,
        target:coord(c.target),selectedExhaustedTail:colName(selectedTail),p1ReplyColumn:colName(p1Col),p1ReplyCell:coord(p1Cell),
        chainCapacities:Object.fromEntries(CHAIN_COLUMNS.map((col)=>[colName(col),capacity(kernel,afterP1,col)])),
        candidateCount:candidates.length,safeCandidateCount:safe.length,candidates,
        selectedWitness:{column:deterministic.column,beforeCapacity:deterministic.beforeCapacity,p0Outcome:deterministic.p0Outcome,terminalP1Replies:deterministic.terminalP1Replies,targetSupportReplies:deterministic.targetSupportReplies},
      });
    }
  }
}
assert.equal(handoffs.length,48);

const bothSafe=handoffs.filter((row)=>row.safeCandidateCount===2).length;
const exactlyOneSafe=handoffs.filter((row)=>row.safeCandidateCount===1).length;
const witnessColumns=Object.fromEntries(CHAIN_COLUMNS.map((col)=>[colName(col),handoffs.filter((row)=>row.selectedWitness.column===colName(col)).length]));
const witnessCapacityTransitions=[...new Set(handoffs.map((row)=>{
  const c=row.candidates.find((candidate)=>candidate.column===row.selectedWitness.column);
  return c.p0Outcome==='P0_terminal'?`${c.beforeCapacity}->terminal`:`${c.beforeCapacity}->${c.afterCapacity}`;
}))].sort();
const candidateIncidenceClasses=Object.fromEntries(CHAIN_COLUMNS.map((col)=>[colName(col),new Set(handoffs.map((row)=>key(row.candidates.find((candidate)=>candidate.column===colName(col)).inputIncidence))).size]));
const anyP0TerminalWitness=handoffs.some((row)=>row.selectedWitness.p0Outcome==='P0_terminal');
const anyUnsafeCandidate=handoffs.some((row)=>row.safeCandidateCount<2);

console.log(`TAIL_HANDOFF_SAFE_CHAIN_WITNESS=${JSON.stringify({
  kind:'standard7x6-tail-handoff-safe-chain-witness-v1',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  exactTailHandoffs:handoffs.length,
  witnessTheorem:{
    statement:'Every retained exhausted D/E/F tail handoff with target support distance one has at least one A/B off-target P0 chain action that either wins immediately or strictly consumes one chain support unit, preserves the live target singleton without enabling it on the intervening P1 turn, and admits no immediate P1 terminal reply.',
    witnessSelectionRule:'maximize remaining A/B capacity; break ties A before B, after exact safety guard',
    supportMeasure:'selected A/B remaining capacity',
  },
  bothABSafe:bothSafe,exactlyOneABSafe:exactlyOneSafe,anyUnsafeCandidate,anyP0TerminalWitness,
  selectedWitnessColumns:witnessColumns,
  witnessCapacityTransitions,
  candidateIncidenceClasses,
  handoffs,
  interpretation:'The exhausted-tail handoff does not require a state-like progress class. A fresh action-conditioned A/B cone supplies the next witness. Exact A/B R incidence remains load-bearing for the safety guard, while the selected chain capacity gives the strict well-founded support component once a witness is chosen.',
  theoremBoundary:'This proves existence of a safe next A/B action and exhaustively checks only its immediate P1 reply horizon on the 48 retained tail-handoff states. It does not prove repeated chain-policy closure, center-opening W, q equality, provenance equality, or arbitrary later strategy.',
  authority:'Exact C4-0010 support/residual transitions only. No solved W/D/L labels, recursive q search, Bayesian confidence, or output-cardinality premise.'
})}`);
