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
const AB_COLUMNS = Object.freeze([0, 1]); // A,B
const OFF_TARGET_COLUMNS = Object.freeze([0, 1, 3, 4, 5]); // never C/G target columns

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
    cell:coord(cell),
    p0Incident:p0.map(termKey).sort(),p1Incident:p1.map(termKey).sort(),
    p0Cofactors:p0.map((term)=>cofactorKey(term,cell)).sort(),
    p1Cofactors:p1.map((term)=>cofactorKey(term,cell)).sort(),
  };
}
function enabledSingletons(kernel,id,player){
  return terms(kernel,id,player)
    .filter((term)=>term.length===1)
    .map((term)=>term[0])
    .filter((cell)=>landing(kernel,id,cell%7)===cell)
    .map(coord)
    .sort();
}
function supportClass(cap){
  if(cap===0) return 'EXHAUSTED';
  if(cap===1) return 'ODD_TAIL_1';
  return `${cap&1?'ODD':'EVEN'}_CHAIN_${cap}`;
}

function classifyCandidate(kernel,state,col,target){
  const actionCell=landing(kernel,state,col);
  const column=colName(col);
  if(actionCell===0xff){
    return {column,status:'unavailable_full',safe:false};
  }
  const beforeCapacity=capacity(kernel,state,col);
  const inputIncidence=localIncidence(kernel,state,actionCell);
  const next=kernel.advance(state,col);
  if(next===domain.QN_TERMINAL_WIN){
    return {
      column,actionCell:coord(actionCell),beforeCapacity,inputIncidence,
      status:'P0_terminal',safe:true,afterCapacity:null,
      p1TerminalReplies:[],targetSupportReplies:[],enabledP1SingletonsAfterP0:[],
    };
  }
  assert(Number.isSafeInteger(next)&&next>=0,`${column} candidate invalid`);
  assert.equal(rank(kernel,next),23);
  const afterCapacity=capacity(kernel,next,col);
  assert.equal(afterCapacity,beforeCapacity-1,`${column} did not consume one support event`);

  const targetLive=hasSingleton(kernel,next,target);
  const targetDistance=targetSupportDistance(kernel,next,target);
  if(!targetLive){
    return {
      column,actionCell:coord(actionCell),beforeCapacity,afterCapacity,inputIncidence,
      status:'unsafe_target_singleton_destroyed',safe:false,targetLive,targetSupportDistanceAfterP0:targetDistance,
      p1TerminalReplies:[],targetSupportReplies:[],enabledP1SingletonsAfterP0:enabledSingletons(kernel,next,1),
    };
  }
  if(targetDistance===0){
    return {
      column,actionCell:coord(actionCell),beforeCapacity,afterCapacity,inputIncidence,
      status:'unsafe_target_exposed_on_P1_turn',safe:false,targetLive,targetSupportDistanceAfterP0:targetDistance,
      p1TerminalReplies:[],targetSupportReplies:[],enabledP1SingletonsAfterP0:enabledSingletons(kernel,next,1),
    };
  }
  assert.equal(targetDistance,1,'unexpected target support distance after off-target P0 action');

  const enabledP1=enabledSingletons(kernel,next,1);
  const p1TerminalReplies=[];
  const targetSupportReplies=[];
  let replyCount=0;
  for(let p1Col=0;p1Col<7;p1Col++){
    const replyCell=landing(kernel,next,p1Col);
    if(replyCell===0xff) continue;
    replyCount++;
    const p1next=kernel.advance(next,p1Col);
    if(p1next===domain.QN_TERMINAL_WIN){
      const replyCoord=coord(replyCell);
      // Exact C4-0010 terminal cofactor boundary: the played cell must be an enabled P1 singleton.
      assert(enabledP1.includes(replyCoord),`${column}: terminal P1 reply ${replyCoord} lacks enabled P1 singleton premise`);
      p1TerminalReplies.push({column:colName(p1Col),cell:replyCoord});
      continue;
    }
    assert(Number.isSafeInteger(p1next)&&p1next>=0);
    const live=hasSingleton(kernel,p1next,target);
    const dist=targetSupportDistance(kernel,p1next,target);
    assert.equal(live,true,'nonterminal P1 reply killed target singleton unexpectedly');
    assert([0,1].includes(dist));
    if(dist===0){
      const targetWin=kernel.advance(p1next,target%7);
      assert.equal(targetWin,domain.QN_TERMINAL_WIN,'enabled P0 target singleton did not terminate');
      targetSupportReplies.push({column:colName(p1Col),cell:coord(replyCell)});
    }
  }

  const safe=p1TerminalReplies.length===0;
  return {
    column,actionCell:coord(actionCell),beforeCapacity,afterCapacity,
    beforeSupportClass:supportClass(beforeCapacity),afterSupportClass:supportClass(afterCapacity),
    inputIncidence,status:safe?'safe_strict_capacity_descent':'unsafe_immediate_P1_terminal',safe,
    targetLive,targetSupportDistanceAfterP0:targetDistance,replyCount,
    enabledP1SingletonsAfterP0:enabledP1,p1TerminalReplies,targetSupportReplies,
  };
}

const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{
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
      if(targetSupportDistance(kernel,afterP1,c.target)===0) continue; // already routed to immediate P0 terminal certificate
      assert.equal(hasSingleton(kernel,afterP1,c.target),true);
      assert.equal(targetSupportDistance(kernel,afterP1,c.target),1);
      assert.equal(capacity(kernel,afterP1,selectedTail),0);

      const candidates=OFF_TARGET_COLUMNS.map((col)=>classifyCandidate(kernel,afterP1,col,c.target));
      const ab=candidates.filter((candidate)=>AB_COLUMNS.map(colName).includes(candidate.column));
      const abSafe=ab.filter((candidate)=>candidate.safe);
      const allSafe=candidates.filter((candidate)=>candidate.safe);
      const deterministic=allSafe.slice().sort((a,b)=>{
        const aCap=a.beforeCapacity??-1,bCap=b.beforeCapacity??-1;
        if(bCap!==aCap) return bCap-aCap;
        return a.column.localeCompare(b.column);
      })[0]??null;
      handoffs.push({
        member:`${c.name}:${colName(selectedTail)}->P1:${colName(p1Col)}`,
        target:coord(c.target),selectedExhaustedTail:colName(selectedTail),
        p1ReplyColumn:colName(p1Col),p1ReplyCell:coord(p1Cell),
        abSafeCount:abSafe.length,allOffTargetSafeCount:allSafe.length,
        selectedWitness:deterministic?{column:deterministic.column,status:deterministic.status,beforeCapacity:deterministic.beforeCapacity??null,afterCapacity:deterministic.afterCapacity??null}:null,
        candidates,
      });
    }
  }
}
assert.equal(handoffs.length,48);

const abBothSafe=handoffs.filter((row)=>row.abSafeCount===2).length;
const abExactlyOneSafe=handoffs.filter((row)=>row.abSafeCount===1).length;
const abNoSafe=handoffs.filter((row)=>row.abSafeCount===0);
const allNoSafe=handoffs.filter((row)=>row.allOffTargetSafeCount===0);
assert(abNoSafe.length>0,'negative control failed: universal A/B witness unexpectedly became true');

const candidateStatusCounts={};
for(const row of handoffs){
  for(const candidate of row.candidates){
    const k=`${candidate.column}:${candidate.status}`;
    candidateStatusCounts[k]=(candidateStatusCounts[k]??0)+1;
  }
}
const unsafeTerminalCandidateCount=handoffs.flatMap((row)=>row.candidates).filter((c)=>c.status==='unsafe_immediate_P1_terminal').length;
const terminalReplyCells={};
for(const candidate of handoffs.flatMap((row)=>row.candidates)){
  for(const reply of candidate.p1TerminalReplies??[]){
    terminalReplyCells[reply.cell]=(terminalReplyCells[reply.cell]??0)+1;
  }
}
const selectedWitnessColumns={};
for(const row of handoffs){
  const column=row.selectedWitness?.column??'NONE';
  selectedWitnessColumns[column]=(selectedWitnessColumns[column]??0)+1;
}

const summarizeCandidate=(c)=>({
  column:c.column,status:c.status,safe:c.safe,actionCell:c.actionCell??null,
  beforeCapacity:c.beforeCapacity??null,afterCapacity:c.afterCapacity??null,
  enabledP1SingletonsAfterP0:c.enabledP1SingletonsAfterP0??[],
  p1TerminalReplies:c.p1TerminalReplies??[],targetSupportReplies:c.targetSupportReplies??[],
});
const summarizeHandoff=(row)=>({
  member:row.member,target:row.target,selectedExhaustedTail:row.selectedExhaustedTail,
  p1ReplyColumn:row.p1ReplyColumn,p1ReplyCell:row.p1ReplyCell,
  abSafeCount:row.abSafeCount,allOffTargetSafeCount:row.allOffTargetSafeCount,
  selectedWitness:row.selectedWitness,
  candidates:row.candidates.map(summarizeCandidate),
});

console.log(`TAIL_HANDOFF_ACTION_SAFETY_CLASSIFICATION=${JSON.stringify({
  kind:'standard7x6-tail-handoff-action-safety-classification-v1',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  exactTailHandoffs:handoffs.length,
  falsifiedCandidateTheorem:{
    statement:'Every exhausted D/E/F tail handoff has a safe A/B witness.',
    falsified:true,
    counterexampleCount:abNoSafe.length,
    minimalCounterexamples:abNoSafe.slice(0,6).map(summarizeHandoff),
  },
  abCoverage:{bothSafe:abBothSafe,exactlyOneSafe:abExactlyOneSafe,noneSafe:abNoSafe.length},
  broaderOffTargetCoverage:{candidateColumns:['A','B','D','E','F'],statesWithNoSafeAction:allNoSafe.length,minimalNoSafeCounterexamples:allNoSafe.slice(0,6).map(summarizeHandoff)},
  candidateStatusCounts,unsafeTerminalCandidateCount,terminalReplyCells,selectedWitnessColumns,
  exactTerminalSeparator:'Every observed immediate P1 terminal reply is witnessed by an enabled live P1 singleton at the reply cell after the candidate P0 action.',
  interpretation: allNoSafe.length===0
    ? 'A/B alone is not universally sufficient, but the broader action-conditioned off-target family supplies at least one immediately safe witness in every retained tail handoff. This is an existence theorem with exact per-action R/terminal guards, not a state quotient.'
    : 'Some retained tail handoffs have no immediately safe off-target witness even after broadening to A/B/D/E/F. Those states must be routed through the exact enabled-P1-singleton obligations/capacity calculus rather than interpreted as losses.',
  theoremBoundary:'Safety is one-P0-action plus exhaustive immediate-P1-reply safety only. Failure of this family is not P0 loss. Success does not prove repeated-policy closure, center-opening W, q equality, provenance equality, or arbitrary later strategy.',
  authority:'Exact C4-0010 support/residual transitions only. No solved W/D/L labels, recursive q search, Bayesian confidence, or output-cardinality premise.'
})}`);
