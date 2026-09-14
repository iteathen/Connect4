#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN={columns:7,rows:6,connect:4};
const ROOT='466565554644';
const C=2,G=6,C3=16,G3=20,TAILS=[3,4,5];

function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(id>=0);}return id;}
function landing(k,id,c){return k.supportAccess.landingAt(k.states.supportAt(id),c);}
function rank(k,id){return k.supportAccess.rankAt(k.states.supportAt(id));}
function heights(k,id){const a=[];for(let c=0;c<7;c++){const x=landing(k,id,c);a.push(x===0xff?6:Math.floor(x/7));}return a;}
function col(c){return String.fromCharCode(65+c);}
function coord(x){return `${col(x%7)}${Math.floor(x/7)+1}`;}
function has([lo,hi],x){return x<32?(((lo>>>x)&1)!==0):(((hi>>>(x-32))&1)!==0);}
function cells(t){const a=[];for(let x=0;x<42;x++)if(has(t,x))a.push(x);return a;}
function terms(k,id,p){const q=p===0?k.states.p0At(id):k.states.p1At(id);return k.classes.terms(q).map(cells);}
function singleton(k,id,p,x){return terms(k,id,p).some(t=>t.length===1&&t[0]===x);}
function enabledSingletons(k,id,p){return terms(k,id,p).filter(t=>t.length===1).map(t=>t[0]).filter(x=>landing(k,id,x%7)===x).sort((a,b)=>a-b);}
function targetDistance(k,id,t){return Math.max(0,2-heights(k,id)[t%7]);}

const {kernel:k}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:{states:262144,classes:524288,chunksPerSlot:131072}});
k.prepareSearchStorage();
const cases=[
 {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3},
 {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3},
 {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3},
 {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3},
];

const rows=[];
for(const c of cases){
 const r19=replay(k,ROOT+c.prefix+String(c.resolved+1).repeat(3));
 for(const tail of TAILS){
  const r20=k.advance(r19,tail);assert(r20>=0&&rank(k,r20)===20);
  const r21=k.advance(r20,tail);assert(r21>=0&&r21!==domain.QN_TERMINAL_WIN);
  for(let p1c=0;p1c<7;p1c++){
   const p1cell=landing(k,r21,p1c);if(p1cell===0xff)continue;
   const r22=k.advance(r21,p1c);assert(r22>=0&&r22!==domain.QN_TERMINAL_WIN&&rank(k,r22)===22);
   if(targetDistance(k,r22,c.target)===0)continue;
   assert(singleton(k,r22,0,c.target));
   assert.equal(targetDistance(k,r22,c.target),1);

   const supportCol=c.target%7;
   const supportCell=landing(k,r22,supportCol);
   assert.equal(Math.floor(supportCell/7),1,'expected target row-2 support event');
   const afterP0=k.advance(r22,supportCol);
   assert(afterP0>=0&&afterP0!==domain.QN_TERMINAL_WIN&&rank(k,afterP0)===23);
   assert(singleton(k,afterP0,0,c.target));
   assert.equal(landing(k,afterP0,supportCol),c.target,'target singleton did not become enabled');

   const p0Enabled=enabledSingletons(k,afterP0,0);
   const p1Enabled=enabledSingletons(k,afterP0,1);
   const replies=[];
   let p1TerminalOverrides=0,forcedBlocks=0,nonBlockTargetWins=0;
   let blockState=null;
   for(let rc=0;rc<7;rc++){
    const cell=landing(k,afterP0,rc);if(cell===0xff)continue;
    const child=k.advance(afterP0,rc);
    if(child===domain.QN_TERMINAL_WIN){
      assert(p1Enabled.includes(cell),'P1 terminal reply lacks enabled singleton premise');
      p1TerminalOverrides++;
      replies.push({column:col(rc),cell:coord(cell),outcome:'P1_terminal_override'});
      continue;
    }
    assert(child>=0&&rank(k,child)===24);
    if(cell===c.target){
      forcedBlocks++;
      blockState={
        reply:coord(cell),
        p0EnabledAfterBlock:enabledSingletons(k,child,0).map(coord),
        p1EnabledAfterBlock:enabledSingletons(k,child,1).map(coord),
        targetStillLive:singleton(k,child,0,c.target),
        heights:heights(k,child),
      };
      replies.push({column:col(rc),cell:coord(cell),outcome:'forced_target_block'});
    }else{
      const win=k.advance(child,supportCol);
      assert.equal(win,domain.QN_TERMINAL_WIN,'non-blocking P1 reply escaped enabled target singleton');
      nonBlockTargetWins++;
      replies.push({column:col(rc),cell:coord(cell),outcome:'P0_target_terminal_next'});
    }
   }
   assert.equal(forcedBlocks,1,'expected exactly one target blocking response');
   const demand=p0Enabled.length;
   const responseRank=demand===0?0:1;
   const defect=Math.max(0,demand-responseRank);
   const status=p1TerminalOverrides>0
     ? 'P1_terminal_override_exists'
     : defect>0
       ? 'P0_response_capacity_circuit'
       : blockState.p0EnabledAfterBlock.length>0
         ? 'P0_forced_block_then_immediate_terminal'
         : 'forced_target_block_continuation';
   rows.push({
     member:`${c.name}:${col(tail)}->P1:${col(p1c)}`,
     target:coord(c.target),supportAction:coord(supportCell),status,
     enabledP0Singletons:p0Enabled.map(coord),enabledP1Singletons:p1Enabled.map(coord),
     responseCapacity:{demand,responseRank,defect,temporalSlot:'current_P1_turn',obligations:p0Enabled.map(x=>({singleton:coord(x),soleBlockingAction:coord(x)}))},
     p1TerminalOverrides,nonBlockTargetWins,blockState,replies,
   });
  }
 }
}
assert.equal(rows.length,48);
const counts={};for(const r of rows)counts[r.status]=(counts[r.status]??0)+1;
const exactCircuits=rows.filter(r=>r.status==='P0_response_capacity_circuit').length;
const forcedContinuations=rows.filter(r=>r.status==='forced_target_block_continuation').length;
const forcedThenTerminal=rows.filter(r=>r.status==='P0_forced_block_then_immediate_terminal').length;
const terminalOverrides=rows.filter(r=>r.status==='P1_terminal_override_exists').length;
const unresolvedRows=rows
 .filter(r=>r.status==='forced_target_block_continuation'||r.status==='P1_terminal_override_exists')
 .map(r=>({
   member:r.member,target:r.target,supportAction:r.supportAction,status:r.status,
   enabledP0Singletons:r.enabledP0Singletons,enabledP1Singletons:r.enabledP1Singletons,
   responseCapacity:r.responseCapacity,p1TerminalOverrides:r.p1TerminalOverrides,
   blockState:r.blockState,
   terminalOverrideReplies:r.replies.filter(x=>x.outcome==='P1_terminal_override'),
 }));
console.log(`TAIL_HANDOFF_TARGET_SUPPORT_SUMMARY=${JSON.stringify({
 kind:'standard7x6-tail-handoff-target-support-routing-summary-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 exactTailHandoffs:rows.length,statusCounts:counts,exactCapacityCircuits:exactCircuits,
 forcedBlockThenImmediateTerminal:forcedThenTerminal,forcedBlockContinuations:forcedContinuations,
 statesWithP1TerminalOverride:terminalOverrides,unresolvedRowCount:unresolvedRows.length,
 connect4ObligationSlotMap:{obligation:'enabled live P0 singleton must be blocked before next P0 turn',soleBlockingAction:'P1 claims that singleton cell',temporalResponseSlot:'current single P1 move',capacityCircuit:'demand >= 2 with response rank 1 and no P1 terminal override'},
 unresolvedRows,
 interpretation:'Target-support is an exact response-serialization contract on every retained exhausted-tail handoff. Capacity circuits and forced-block-then-terminal rows are closed local predecessor certificates; only forced-block continuations or P1 terminal overrides remain as next-seam evidence.',
 theoremBoundary:'Bounded one-P0-action plus exhaustive immediate-P1-reply control on the retained 48 exhausted-tail handoffs only. Forced blocking is not later-strategy closure, and P1 terminal override is a counterexample rather than a loss inference for unrelated actions.',
 authority:'Exact C4-0010 support/residual transitions only; no W/D/L labels, recursive q search, Bayesian confidence, or output-cardinality premise.'
})}`);
