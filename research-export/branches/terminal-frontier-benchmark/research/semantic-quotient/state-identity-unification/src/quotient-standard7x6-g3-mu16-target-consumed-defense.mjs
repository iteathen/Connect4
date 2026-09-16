#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const G=6;
const STATES=Object.freeze([
 '4665655546443133337477',
 '4665655546443233337477',
]);
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
const k=makeKernel(),e=createRepairCapacityProofEngine(k,{collectAllWinningActions:false,maxProofStates:1});
const rows=[];
for(const sequence of STATES){
 const state=replay(k,sequence);assert.equal(e.rank(state),22);const threat=e.landing(state,G);assert.equal(e.coord(threat),'G4');assert(new Set(e.enabledSingletons(state,1)).has(threat),'G4 deadline drift');
 const nonBlocking=[];
 for(const action of e.legal(state)){
  if(action===G)continue;
  const afterP0=k.advance(state,action);if(afterP0===domain.QN_TERMINAL_WIN){nonBlocking.push({action:e.col(action),route:'P0_terminal'});continue;}
  assert(afterP0>=0&&e.rank(afterP0)===23);const g4=e.landing(afterP0,G);assert.equal(e.coord(g4),'G4');const afterP1=k.advance(afterP0,G);const terminal=afterP1===domain.QN_TERMINAL_WIN;if(terminal)assert(new Set(e.enabledSingletons(afterP0,1)).has(g4));nonBlocking.push({action:e.col(action),route:terminal?'P1_terminal_G4':'G4_not_terminal'});
 }
 const block=k.advance(state,G);assert(block>=0&&block!==domain.QN_TERMINAL_WIN);assert.equal(e.rank(block),23);
 const replies=[];
 for(const reply of e.legal(block)){
  const cell=e.landing(block,reply),child=k.advance(block,reply);
  if(child===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(block,1)).has(cell));replies.push({reply:e.col(reply),replyCell:e.coord(cell),route:'P1_terminal'});continue;}
  assert(child>=0&&e.rank(child)===24);const immediate=e.terminalActions(child,0);if(immediate.length){replies.push({reply:e.col(reply),replyCell:e.coord(cell),route:'immediate_P0_terminal',terminalColumns:immediate.map(x=>e.col(x.column))});continue;}
  replies.push({reply:e.col(reply),replyCell:e.coord(cell),route:'nonterminal_unclassified',mu:e.mu(child),heights:e.heights(child),enabledP0:e.enabledSingletons(child,0).map(e.coord),enabledP1:e.enabledSingletons(child,1).map(e.coord),p0TermCount:e.terms(child,0).length,p1TermCount:e.terms(child,1).length});
 }
 rows.push({sequence,forcedBlock:'G4',nonBlocking,replies});
}
const nonBlockingFlat=rows.flatMap(x=>x.nonBlocking),replyFlat=rows.flatMap(x=>x.replies),replyCounts={};for(const x of replyFlat)replyCounts[x.route]=(replyCounts[x.route]??0)+1;
console.log(`G3_MU16_TARGET_CONSUMED_DEFENSE=${JSON.stringify({
 kind:'standard7x6-g3-mu16-target-consumed-forced-defense-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 exactStates:rows.length,
 allNonterminalNonblockingActionsLoseToG4:nonBlockingFlat.filter(x=>x.route!=='P0_terminal').every(x=>x.route==='P1_terminal_G4'),
 nonblockingP0Terminals:nonBlockingFlat.filter(x=>x.route==='P0_terminal').length,
 replyCount:replyFlat.length,replyRouteCounts:replyCounts,rows,
 interpretation:replyCounts.P1_terminal
  ? 'Blocking G4 is forced against the inherited deadline, but at least one exact P1 terminal override exists after the block; preserve that branch.'
  : replyCounts.nonterminal_unclassified
    ? 'G4 is an exact forced defense and produces no immediate P1 terminal override, but at least one rank-24 successor needs a new contract classification.'
    : 'G4 is an exact forced defense and every P1 reply after the block gives an immediate P0 terminal certificate.',
 theoremBoundary:'Exact only for the two target-consumed successors of the shared G3/mu16 falsifiers. This proves forced defense only by direct enabled-singleton terminal consequences and classifies one P1 reply horizon after G4. No recursive search, solved WDL, or q equality is used.'
})}`);
