#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const ROOT='466565554644',C=2,G=6,C3=16,G3=20;
const LOSS='466565554644323332';
const RESIDUAL=new Set([
 '466565554644323332','466565554644353336','466565554644363335','466565554644343335',
 '466565554644353334','466565554644353333','466565554644343333','466565554644323336',
 '466565554644363332','466565554644323335','466565554644353332','466565554644323334',
 '466565554644343332','466565554644323333','466565554644313334','466565554644343331',
 '466565554644313333','466565554644757774','466565554644757776','466565554644757777',
 '466565554644747775','466565554644767775',
]);
assert.equal(RESIDUAL.size,22);
const KAPPA_WINS=new Set([...RESIDUAL].filter(x=>x!==LOSS));
assert.equal(KAPPA_WINS.size,21);
const C3_ISOLATED_WITNESSES=Object.freeze({
 '466565554644757776':'G',
 '466565554644757777':'F',
 '466565554644767775':'G',
});
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
const k=makeKernel(),e=createRepairCapacityProofEngine(k,{maxProofStates:1});

function classifyRank18(sequence){
 if(sequence===LOSS)return {outcome:'P0_loss',contract:'forced_obligation_loss'};
 if(KAPPA_WINS.has(sequence))return {outcome:'P0_win',contract:'target_distance_kappa',isolatedWitness:C3_ISOLATED_WITNESSES[sequence]??null};
 return {outcome:'P0_win',contract:'enhanced_predecessor'};
}

const exactRank18=new Set(),contexts=[];
for(const fam of [
 {family:'C_first',resolved:C,target:G3,replies1:[0,1,3,4,5,6]},
 {family:'G_first',resolved:G,target:C3,replies1:[0,1,2,3,4,5]},
])for(const r1 of fam.replies1){
 const sequence=ROOT+`${fam.resolved+1}${r1+1}${fam.resolved+1}${fam.resolved+1}`;
 const state=replay(k,sequence); assert.equal(e.rank(state),16);
 const threat=e.landing(state,fam.resolved);
 const obligations=[...new Set(e.enabledSingletons(state,1))];
 assert(obligations.includes(threat),`${sequence}: missing resolved-column singleton deadline`);
 assert.equal(obligations.length,1,`${sequence}: rank16 obligation shape drift`);
 for(const action of e.legal(state))if(action!==fam.resolved){
  const child=k.advance(state,action);assert(child!==domain.QN_TERMINAL_WIN&&child>=0);
  assert(e.terminalActions(child,1).length>0,`${sequence}: nonblocking action ${e.col(action)} escaped forced defense`);
 }
 const afterBlock=k.advance(state,fam.resolved);assert(afterBlock>=0&&e.rank(afterBlock)===17);
 const branches=[];let outcome='P0_win',lossWitness=null;
 for(const reply of e.legal(afterBlock)){
  const replyCell=e.landing(afterBlock,reply),child=k.advance(afterBlock,reply);
  if(child===domain.QN_TERMINAL_WIN){
   assert(new Set(e.enabledSingletons(afterBlock,1)).has(replyCell));
   outcome='P0_loss'; lossWitness??={kind:'P1_terminal_after_forced_block',reply:e.col(reply),replyCell:e.coord(replyCell)};
   branches.push({reply:e.col(reply),replyCell:e.coord(replyCell),outcome:'P0_loss',contract:'P1_terminal'}); continue;
  }
  assert(child>=0&&e.rank(child)===18);
  const childSequence=sequence+String(fam.resolved+1)+String(reply+1);
  exactRank18.add(childSequence);
  const cls=classifyRank18(childSequence);
  branches.push({reply:e.col(reply),replyCell:e.coord(replyCell),sequence:childSequence,...cls});
  if(cls.outcome==='P0_loss'){outcome='P0_loss';lossWitness??={kind:'certified_rank18_loss',reply:e.col(reply),replyCell:e.coord(replyCell),sequence:childSequence};}
 }
 contexts.push({sequence,family:fam.family,r1:e.col(r1),forcedDefense:e.col(fam.resolved),forcedCell:e.coord(threat),outcome,lossWitness,branches});
}
assert.equal(contexts.length,12);
assert.equal(exactRank18.size,84,'rank18 post-block domain drift');
assert([...RESIDUAL].every(x=>exactRank18.has(x)),'residual inventory escaped rank18 domain');
const wins=contexts.filter(x=>x.outcome==='P0_win'),losses=contexts.filter(x=>x.outcome==='P0_loss');
const childCounts={enhanced:0,kappa:0,loss:0,p1Terminal:0};
for(const c of contexts)for(const b of c.branches){if(b.contract==='enhanced_predecessor')childCounts.enhanced++;else if(b.contract==='target_distance_kappa')childCounts.kappa++;else if(b.contract==='forced_obligation_loss')childCounts.loss++;else if(b.contract==='P1_terminal')childCounts.p1Terminal++;}
assert.equal(wins.length,11,'rank16 winning-context count drift');
assert.equal(losses.length,1,'rank16 losing-context count drift');
assert.equal(losses[0].sequence,'4665655546443233','rank16 loss identity drift');
assert.equal(childCounts.loss,1,'expected one exact losing rank18 branch');
assert.equal(childCounts.p1Terminal,0,'unexpected direct P1 terminal after forced block');

console.log(`POSTBLOCK_RANK16_OUTCOME_COMPOSITION=${JSON.stringify({
 kind:'standard7x6-postblock-rank16-outcome-composition-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 exactRank16Contexts:contexts.length,winningContexts:wins.length,losingContextCount:losses.length,exactRank18Children:exactRank18.size,
 childCounts,
 winningSequences:wins.map(x=>x.sequence),
 losingContexts:losses.map(x=>({sequence:x.sequence,family:x.family,r1:x.r1,lossWitness:x.lossWitness})),
 contexts,
 theoremBoundary:'Finite guarded composition only. Every rank16 node first verifies the unique resolved-column singleton defense by exact elimination of all nonblocking P0 actions. Every P1 reply after that forced block is then discharged through an already-qualified exact rank18 P0-winning contract or the independently-qualified forced-obligation P0-loss certificate. The 62 enhanced-predecessor wins and 21 kappa wins are consumed as opaque exact child contracts; they are not q equality or generic state classifiers. The unique losing child propagates loss only through the forced-defense universal/existential alternating rule. No solved WDL premise, unknown-as-loss, cap increase, center-opening W claim, or root solve.'
})}`);
