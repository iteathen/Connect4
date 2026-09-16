#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const G=6,G3=20;
const ROOTS=Object.freeze([
  '46656555464431333374',
  '46656555464432333374',
]);
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
const k=makeKernel(),e=createRepairCapacityProofEngine(k,{collectAllWinningActions:false,maxProofStates:1});
function summary(state){return {rank:e.rank(state),heights:e.heights(state),mu:e.mu(state),p0Enabled:e.enabledSingletons(state,0).map(e.coord),p1Enabled:e.enabledSingletons(state,1).map(e.coord),p0Singletons:e.terms(state,0).filter(t=>t.length===1).map(t=>e.coord(t[0])).sort(),p1Singletons:e.terms(state,1).filter(t=>t.length===1).map(t=>e.coord(t[0])).sort()};}
function terminalColumns(state,player){return e.terminalActions(state,player).map(x=>e.col(x.column));}

const rows=[];
for(const sequence of ROOTS){
  let state=replay(k,sequence);assert.equal(e.rank(state),20);assert(e.invariant(state,G3));
  // Qualified temporal prefix: P0:G2, forced P1:G3, forced P0:G4.
  state=k.advance(state,G);assert(state>=0&&state!==domain.QN_TERMINAL_WIN&&e.rank(state)===21);assert.equal(e.coord(e.landing(state,G)),'G3');
  state=k.advance(state,G);assert(state>=0&&state!==domain.QN_TERMINAL_WIN&&e.rank(state)===22);assert.deepEqual(e.enabledSingletons(state,1).map(e.coord),['G4']);
  state=k.advance(state,G);assert(state>=0&&state!==domain.QN_TERMINAL_WIN&&e.rank(state)===23);
  assert.equal(e.enabledSingletons(state,1).includes(3*7+G),false,'G4 deadline survived forced block');
  const beforeReply=summary(state);
  const replies=[];
  for(const reply of e.legal(state)){
    const replyCell=e.landing(state,reply),child=k.advance(state,reply);
    if(child===domain.QN_TERMINAL_WIN){
      assert(new Set(e.enabledSingletons(state,1)).has(replyCell),`P1 terminal ${e.coord(replyCell)} lacks enabled singleton premise`);
      replies.push({reply:e.col(reply),replyCell:e.coord(replyCell),route:'P1_terminal'});continue;
    }
    assert(child>=0&&e.rank(child)===24);
    const p0wins=terminalColumns(child,0);
    if(p0wins.length){
      replies.push({reply:e.col(reply),replyCell:e.coord(replyCell),route:'P0_immediate_terminal',p0TerminalColumns:p0wins,summary:summary(child)});continue;
    }
    const actions=[];
    for(const action of e.legal(child)){
      const actionCell=e.landing(child,action),afterP0=k.advance(child,action);
      if(afterP0===domain.QN_TERMINAL_WIN){actions.push({action:e.col(action),actionCell:e.coord(actionCell),route:'P0_terminal'});continue;}
      assert(afterP0>=0&&e.rank(afterP0)===25);
      const p1Terminals=[];
      for(const r of e.legal(afterP0)){
        const rCell=e.landing(afterP0,r),next=k.advance(afterP0,r);
        if(next===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(afterP0,1)).has(rCell),`P1 terminal ${e.coord(rCell)} lacks enabled singleton premise`);p1Terminals.push({reply:e.col(r),cell:e.coord(rCell)});}
      }
      actions.push({action:e.col(action),actionCell:e.coord(actionCell),route:p1Terminals.length?'allows_P1_terminal':'no_immediate_P1_terminal',p1Terminals,afterP0:summary(afterP0)});
    }
    const safe=actions.filter(a=>a.route==='no_immediate_P1_terminal').map(a=>a.action);
    const p0term=actions.filter(a=>a.route==='P0_terminal').map(a=>a.action);
    const childSummary=summary(child);
    replies.push({
      reply:e.col(reply),replyCell:e.coord(replyCell),route:'continuation',summary:childSummary,
      immediateP0Actions:p0term,safeNonterminalActions:safe,
      forcedDefense:childSummary.p1Enabled.length===1 && safe.length===1 && p0term.length===0 ? {deadline:childSummary.p1Enabled[0],action:safe[0]} : null,
      actions,
    });
  }
  rows.push({sequence,forcedPrefix:'P0:G2 -> P1:G3 -> P0:G4',beforeReply,replies});
}

const allReplies=rows.flatMap(r=>r.replies);
const routeCounts={};for(const r of allReplies)routeCounts[r.route]=(routeCounts[r.route]??0)+1;
const continuations=allReplies.filter(r=>r.route==='continuation');
const forcedDefenseContinuations=continuations.filter(r=>r.forcedDefense!==null);
const noSafeContinuations=continuations.filter(r=>r.safeNonterminalActions.length===0&&r.immediateP0Actions.length===0);

console.log(`G3_MU16_POST_G4_HANDOFF=${JSON.stringify({
  kind:'standard7x6-g3-mu16-post-g4-temporal-handoff-v1',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  exactRoots:rows.length,totalP1Replies:allReplies.length,routeCounts,
  continuationCount:continuations.length,forcedDefenseContinuationCount:forcedDefenseContinuations.length,noSafeContinuationCount:noSafeContinuations.length,
  rows,
  interpretation:noSafeContinuations.length===0
    ? 'After the qualified G2->G3->G4 temporal prefix, every exact P1 reply either gives immediate P0 terminality or leaves at least one P0 action with no immediate P1 terminal response. Forced-defense rows, when present, identify the next exact temporal deadline; this control does not yet prove those safe continuations.'
    : 'At least one post-G4 P1 reply leaves no immediate P0 terminal and no action avoiding an immediate P1 terminal response. Preserve that exact reply as a local terminal-response certificate candidate before any broader continuation theorem.',
  theoremBoundary:'Exact only for the two preserved G3/mu16 holdouts and the already-qualified forced prefix P0:G2, P1:G3, P0:G4. One additional complete P1 horizon and one local P0/P1 terminal screen are classified. No recursive WDL/minimax, q equality, or root/center-opening result.'
})}`);
