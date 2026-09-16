#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createRepairCapacityProofEngine } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
const ROOT='466565554644',C=2,G=6,C3=16,G3=20;
const RESIDUAL=new Set([
 '466565554644323332','466565554644353336','466565554644363335','466565554644343335',
 '466565554644353334','466565554644353333','466565554644343333','466565554644323336',
 '466565554644363332','466565554644323335','466565554644353332','466565554644323334',
 '466565554644343332','466565554644323333','466565554644313334','466565554644343331',
 '466565554644313333','466565554644757774','466565554644757776','466565554644757777',
 '466565554644747775','466565554644767775',
]);
assert.equal(RESIDUAL.size,22);
function makeKernel(){const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});kernel.prepareSearchStorage();return kernel;}
function replay(k,s){let id=k.rootId;for(const d of s){id=k.advance(id,Number(d)-1);assert(Number.isSafeInteger(id)&&id>=0,`bad replay ${s}`);}return id;}
const k=makeKernel(),e=createRepairCapacityProofEngine(k,{maxProofStates:1});

const stats={nodes:0,maxDepth:0,multiDefects:0,forcedNodes:0,terminalWitnesses:0,childLossWitnesses:0};
const memo=new Map();
function proveForcedLoss(state,depth=0){
 assert.equal(e.rank(state)&1,0,'forced-loss node must be P0 turn');
 stats.nodes++;stats.maxDepth=Math.max(stats.maxDepth,depth);
 if(e.terminalActions(state,0).length)return {loss:false,kind:'P0_terminal_available'};
 if(memo.has(state))return memo.get(state);
 const obligations=[...new Set(e.enabledSingletons(state,1))];
 if(obligations.length===0){const out={loss:false,kind:'no_forced_P1_obligation'};memo.set(state,out);return out;}
 if(obligations.length>=2){
  const actions=[];
  for(const action of e.legal(state)){
   const actionCell=e.landing(state,action),afterP0=k.advance(state,action);
   assert(afterP0!==domain.QN_TERMINAL_WIN,'P0 terminal escaped prior census');assert(afterP0>=0);
   const p1Terminal=e.terminalActions(afterP0,1);
   assert(p1Terminal.length>0,'multi-obligation capacity defect had an escaping P0 action');
   actions.push({action:e.col(action),actionCell:e.coord(actionCell),p1Terminal:p1Terminal.map(x=>e.coord(x.cell))});
  }
  stats.multiDefects++;
  const out={loss:true,kind:'multi_obligation_capacity_defect',obligations:obligations.map(e.coord),temporalResponseSlots:1,actions};memo.set(state,out);return out;
 }

 stats.forcedNodes++;
 const threat=obligations[0],forcedColumn=threat%7;
 assert.equal(e.landing(state,forcedColumn),threat,'forced singleton not at landing cell');
 const nonblocking=[];
 for(const action of e.legal(state)){
  if(action===forcedColumn)continue;
  const afterP0=k.advance(state,action);assert(afterP0!==domain.QN_TERMINAL_WIN&&afterP0>=0);
  const p1Terminal=e.terminalActions(afterP0,1);
  if(p1Terminal.length===0){const out={loss:false,kind:'singleton_not_forced',obligation:e.coord(threat),escapeAction:e.col(action)};memo.set(state,out);return out;}
  nonblocking.push({action:e.col(action),p1Terminal:p1Terminal.map(x=>e.coord(x.cell))});
 }
 const afterBlock=k.advance(state,forcedColumn);
 if(afterBlock===domain.QN_TERMINAL_WIN){const out={loss:false,kind:'forced_block_is_P0_terminal',obligation:e.coord(threat),forcedColumn:e.col(forcedColumn)};memo.set(state,out);return out;}
 assert(afterBlock>=0&&e.rank(afterBlock)===e.rank(state)+1);
 for(const reply of e.legal(afterBlock)){
  const replyCell=e.landing(afterBlock,reply),child=k.advance(afterBlock,reply);
  if(child===domain.QN_TERMINAL_WIN){
   assert(new Set(e.enabledSingletons(afterBlock,1)).has(replyCell));stats.terminalWitnesses++;
   const out={loss:true,kind:'forced_block_then_P1_terminal',obligation:e.coord(threat),forcedColumn:e.col(forcedColumn),adversarialReply:e.col(reply),replyCell:e.coord(replyCell),nonblocking};memo.set(state,out);return out;
  }
  assert(child>=0&&e.rank(child)===e.rank(state)+2);
  if(e.terminalActions(child,0).length)continue;
  const sub=proveForcedLoss(child,depth+1);
  if(sub.loss){
   stats.childLossWitnesses++;
   const out={loss:true,kind:'forced_block_then_child_loss',obligation:e.coord(threat),forcedColumn:e.col(forcedColumn),adversarialReply:e.col(reply),replyCell:e.coord(replyCell),child:sub,nonblocking};memo.set(state,out);return out;
  }
 }
 const out={loss:false,kind:'forced_block_has_no_certified_losing_reply',obligation:e.coord(threat),forcedColumn:e.col(forcedColumn)};memo.set(state,out);return out;
}

const roots=[],rank16=[];
for(const fam of [
 {family:'C_first',resolved:C,target:G3,replies1:[0,1,3,4,5,6]},
 {family:'G_first',resolved:G,target:C3,replies1:[0,1,2,3,4,5]},
])for(const r1 of fam.replies1){
 const s16seq=ROOT+`${fam.resolved+1}${r1+1}${fam.resolved+1}${fam.resolved+1}`;
 const s16=replay(k,s16seq);assert.equal(e.rank(s16),16);
 rank16.push({sequence:s16seq,state:s16,family:fam.family,r1:e.col(r1)});
 const threat=e.landing(s16,fam.resolved);assert(new Set(e.enabledSingletons(s16,1)).has(threat));
 const s17=k.advance(s16,fam.resolved);assert(s17>=0&&e.rank(s17)===17);
 for(const r2 of e.legal(s17)){
  const replyCell=e.landing(s17,r2),s18=k.advance(s17,r2);
  if(s18===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(s17,1)).has(replyCell));continue;}
  const sequence=s16seq+String(fam.resolved+1)+String(r2+1);
  roots.push({sequence,state:s18,label:RESIDUAL.has(sequence)?'residual':'qualified_positive'});
 }
}
assert.equal(roots.length,84);assert.equal(rank16.length,12);
const rootResults=roots.map(x=>({...x,proof:proveForcedLoss(x.state)}));
const positiveLoss=rootResults.filter(x=>x.label==='qualified_positive'&&x.proof.loss);
assert.equal(positiveLoss.length,0,'forced-loss calculus contradicts an already-qualified positive rank18 root');
const residualLoss=rootResults.filter(x=>x.label==='residual'&&x.proof.loss);
const rank16Results=rank16.map(x=>({...x,proof:proveForcedLoss(x.state)}));
const rank16Loss=rank16Results.filter(x=>x.proof.loss);

function compactProof(p,depth=0){
 if(!p||depth>5)return null;
 return {kind:p.kind,obligation:p.obligation??null,obligations:p.obligations??null,forcedColumn:p.forcedColumn??null,adversarialReply:p.adversarialReply??null,replyCell:p.replyCell??null,child:p.child?compactProof(p.child,depth+1):null};
}
console.log(`FORCED_OBLIGATION_LOSS_PROPAGATION=${JSON.stringify({
 kind:'standard7x6-forced-obligation-loss-propagation-v1',
 attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
 exactRank18Roots:84,qualifiedPositiveRoots:62,residualRoots:22,
 qualifiedPositiveLossCertificates:positiveLoss.length,
 residualLossCertificates:residualLoss.length,
 residualLossRoots:residualLoss.map(x=>({sequence:x.sequence,proof:compactProof(x.proof)})),
 exactRank16Contexts:rank16.length,rank16LossCertificates:rank16Loss.length,
 rank16LossContexts:rank16Loss.map(x=>({sequence:x.sequence,family:x.family,r1:x.r1,proof:compactProof(x.proof)})),
 stats,
 interpretation:rank16Loss.length?`${rank16Loss.length} exact rank16 scheduler context(s) are adversarially eliminated by forced-obligation loss propagation. This is backward loss evidence, not a root result.`:'No rank16 scheduler context is yet eliminated by the forced-obligation loss calculus; retain the rank18 local-loss certificates only.',
 theoremBoundary:'Loss-only forced-obligation calculus. Base loss requires an exact multi-singleton one-turn response-capacity defect verified over every legal P0 action. A one-singleton node is propagated to loss only after every nonblocking P0 action is exact-terminal for P1 and the unique block has at least one P1 reply that is immediately terminal or recursively certified loss. Nodes with zero obligations, a P0 terminal action, or an uncertified continuation remain unknown. No solved WDL premise, unknown-as-loss, arbitrary P0 choice search, q/frontier expansion, cap increase, center-opening claim, or root solve.'
})}`);
