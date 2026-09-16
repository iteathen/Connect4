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

const cases=Object.freeze([
  {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3},
  {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3},
  {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3},
  {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3},
]);

// Producer: reproduce the already-qualified rank-20 composition traversal exactly and freeze its proof certificate.
function produceCertificate(){
  const k=makeKernel();
  const e=createRepairCapacityProofEngine(k,{collectAllWinningActions:false,maxProofStates:100000});
  const rank20Keys=[];
  const rows=[];
  for(const c of cases){
    const r19=replay(k,ROOT+c.prefix+String(c.resolved+1).repeat(3));assert.equal(e.rank(r19),19);
    for(const sourceRepair of REPAIRS){
      const state=k.advance(r19,sourceRepair);assert(state>=0&&e.rank(state)===20);assert(e.invariant(state,c.target));
      const witnesses=[];
      for(let action=0;action<7;action++){
        const actionCell=e.landing(state,action);if(actionCell===0xff)continue;
        const afterP0=k.advance(state,action);
        if(afterP0===domain.QN_TERMINAL_WIN){witnesses.push(e.col(action));continue;}
        assert(afterP0>=0&&e.rank(afterP0)===21);
        let accepted=true;
        for(const reply of e.legal(afterP0)){
          const replyCell=e.landing(afterP0,reply),afterP1=k.advance(afterP0,reply);
          if(afterP1===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(afterP0,1)).has(replyCell));accepted=false;continue;}
          assert(afterP1>=0&&e.rank(afterP1)===22);
          if(e.terminalActions(afterP1,0).length)continue;
          const child=e.prove(afterP1,c.target);if(!child.proved)accepted=false;
        }
        if(accepted)witnesses.push(e.col(action));
      }
      assert(witnesses.length>0,`${c.name}:${e.col(sourceRepair)} rank20 closure regressed`);
      const key=e.exactStateTargetKey(state,c.target);rank20Keys.push(key);
      rows.push({member:`${c.name}:${e.col(sourceRepair)}`,target:c.target,key,witnesses});
    }
  }
  assert.equal(rows.length,20);assert.equal(new Set(rank20Keys).size,16);
  const stats=e.stats();
  assert.equal(stats.proofStates,38171);assert.equal(stats.candidateActionsChecked,72034);assert.equal(stats.p1BranchesChecked,221707);assert.equal(stats.maxDepth,7);
  const cert=e.exportCertificate();assert.equal(cert.stats.certifiedStateTargetPairs,32881);
  return {certificate:cert,rank20Keys:new Set(rank20Keys),rows,producerStats:stats};
}

const produced=produceCertificate();
const frozenDeepKeys=new Set(produced.certificate.exactStateTargetKeys);

// Consumer: fresh allocator/storage. No e.prove() call is permitted below this point.
const k=makeKernel();
const e=createRepairCapacityProofEngine(k,{collectAllWinningActions:false,maxProofStates:1});
let rank20Checks=0,rank20Actions=0,rank20P1Branches=0,rank18Actions=0,rank18P1Branches=0;
const rank20Memo=new Map();

function deepCertified(state,target){return frozenDeepKeys.has(e.exactStateTargetKey(state,target));}
function closeRank20(state,target){
  const key=e.exactStateTargetKey(state,target);if(rank20Memo.has(key))return rank20Memo.get(key);rank20Checks++;
  const immediate=e.terminalActions(state,0);if(immediate.length){const out={closed:true,kind:'immediate_P0_terminal',witnessColumns:immediate.map(x=>e.col(x.column))};rank20Memo.set(key,out);return out;}
  const exactQualified=produced.rank20Keys.has(key);
  if(exactQualified){const out={closed:true,kind:'qualified_rank20_contract',witnessColumns:[]};rank20Memo.set(key,out);return out;}
  if(!e.invariant(state,target)){const out={closed:false,kind:'outside_repair_invariant',targetLive:e.singleton(state,0,target),targetDistance:e.targetDistance(state,target),mu:e.mu(state)};rank20Memo.set(key,out);return out;}
  const witnesses=[],rejected=[];
  for(const action of REPAIRS){
    if(e.landing(state,action)===0xff)continue;rank20Actions++;
    const afterP0=k.advance(state,action);
    if(afterP0===domain.QN_TERMINAL_WIN){witnesses.push(e.col(action));continue;}
    assert(afterP0>=0&&e.rank(afterP0)===21);assert.equal(e.mu(afterP0),e.mu(state)-1,'rank20 repair action did not decrease mu');
    let accepted=true,firstFailure=null;
    for(const reply of e.legal(afterP0)){
      rank20P1Branches++;
      const replyCell=e.landing(afterP0,reply),afterP1=k.advance(afterP0,reply);
      if(afterP1===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(afterP0,1)).has(replyCell));accepted=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),reason:'P1_terminal'};continue;}
      assert(afterP1>=0&&e.rank(afterP1)===22);assert(e.mu(afterP1)<=e.mu(state)-1,'rank22 reply increased mu');
      if(e.terminalActions(afterP1,0).length)continue;
      if(deepCertified(afterP1,target))continue;
      accepted=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),reason:'outside_frozen_repair_certificate',targetLive:e.singleton(afterP1,0,target),targetDistance:e.targetDistance(afterP1,target),mu:e.mu(afterP1)};
    }
    if(accepted)witnesses.push(e.col(action));else rejected.push({action:e.col(action),firstFailure});
  }
  const out={closed:witnesses.length>0,kind:witnesses.length?'one_layer_repair_predecessor':'no_frozen_rank20_predecessor',witnessColumns:witnesses,rejected,targetDistance:e.targetDistance(state,target),mu:e.mu(state)};
  rank20Memo.set(key,out);return out;
}

// Exact fixed same-target survivor states at rank 16 and their proven forced C4/G4 block.
const survivors=[];
for(const x of [
  {family:'C_first',resolved:C,target:G3,replies1:[0,1,3,4,5,6]},
  {family:'G_first',resolved:G,target:C3,replies1:[0,1,2,3,4,5]},
])for(const r1 of x.replies1){
  const sequence=ROOT+`${x.resolved+1}${r1+1}${x.resolved+1}${x.resolved+1}`;
  const s16=replay(k,sequence);assert.equal(e.rank(s16),16);
  const threat=e.landing(s16,x.resolved);assert(new Set(e.enabledSingletons(s16,1)).has(threat));
  survivors.push({family:x.family,r1,resolved:x.resolved,target:x.target,sequence,state:s16,threat});
}
assert.equal(survivors.length,12);

const rank18Rows=[];
for(const s of survivors){
  const s17=k.advance(s.state,s.resolved);assert(s17>=0&&e.rank(s17)===17);
  for(const reply of e.legal(s17)){
    const replyCell=e.landing(s17,reply),s18=k.advance(s17,reply);
    if(s18===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(s17,1)).has(replyCell));rank18Rows.push({...s,reply,status:'P1_terminal'});continue;}
    assert(s18>=0&&e.rank(s18)===18);rank18Rows.push({...s,reply,status:'nonterminal',rank18State:s18});
  }
}
assert.equal(rank18Rows.length,84);assert.equal(rank18Rows.filter(x=>x.status==='P1_terminal').length,0);

function closeRank18(row){
  const state=row.rank18State,target=row.target;
  const immediate=e.terminalActions(state,0);if(immediate.length)return {...row,closed:true,kind:'immediate_P0_terminal',witnessColumns:immediate.map(x=>e.col(x.column))};
  const witnesses=[],rejected=[];
  for(const action of e.legal(state)){
    rank18Actions++;
    const actionCell=e.landing(state,action),s19=k.advance(state,action);
    if(s19===domain.QN_TERMINAL_WIN){witnesses.push(e.col(action));continue;}
    assert(s19>=0&&e.rank(s19)===19);
    let accepted=true,firstFailure=null;
    for(const reply of e.legal(s19)){
      rank18P1Branches++;
      const replyCell=e.landing(s19,reply),s20=k.advance(s19,reply);
      if(s20===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(s19,1)).has(replyCell));accepted=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),reason:'P1_terminal'};continue;}
      assert(s20>=0&&e.rank(s20)===20);
      const leaf=closeRank20(s20,target);
      if(leaf.closed)continue;
      accepted=false;firstFailure??={reply:e.col(reply),replyCell:e.coord(replyCell),reason:leaf.kind,targetDistance:leaf.targetDistance,mu:leaf.mu};
    }
    if(accepted)witnesses.push(e.col(action));else rejected.push({action:e.col(action),cell:e.coord(actionCell),firstFailure});
  }
  return {...row,closed:witnesses.length>0,kind:witnesses.length?'rank18_predecessor':'no_rank18_predecessor',witnessColumns:witnesses,rejected};
}

const rank18Results=rank18Rows.map(closeRank18);
const rank18Closed=rank18Results.filter(x=>x.closed),rank18Failed=rank18Results.filter(x=>!x.closed);
const rank18ByStateTarget=new Map(rank18Results.map(x=>[e.exactStateTargetKey(x.rank18State,x.target),x]));

// Compose the proven forced block backward over all exact rank-16 survivors.
const rank16Results=[];
for(const s of survivors){
  const s17=k.advance(s.state,s.resolved);assert(s17>=0&&e.rank(s17)===17);
  const routes=[];let closed=true;
  for(const reply of e.legal(s17)){
    const replyCell=e.landing(s17,reply),s18=k.advance(s17,reply);
    if(s18===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(s17,1)).has(replyCell));closed=false;routes.push({reply:e.col(reply),route:'P1_terminal'});continue;}
    const row=rank18ByStateTarget.get(e.exactStateTargetKey(s18,s.target));assert(row,'rank18 reconstruction drift');
    routes.push({reply:e.col(reply),route:row.closed?'closed_rank18_predecessor':'open_rank18',witnessColumns:row.witnessColumns});if(!row.closed)closed=false;
  }
  rank16Results.push({...s,closed,forcedAction:e.col(s.resolved),routes});
}
const closedRank16Keys=new Set(rank16Results.filter(x=>x.closed).map(x=>e.exactStateTargetKey(x.state,x.target)));

// Re-evaluate the fixed same-target macros at the exact latent root, accepting only terminal or now-closed rank16 exits.
function testRootMacro(attack,target,otherTarget){
  const root=replay(k,ROOT);assert.equal(e.rank(root),12);const first=k.advance(root,attack);assert(first>=0&&e.rank(first)===13);
  const branches=[];let closed=true;
  for(const r1 of e.legal(first)){
    const r1Cell=e.landing(first,r1),s14=k.advance(first,r1);
    if(s14===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(first,1)).has(r1Cell));closed=false;branches.push({reply1:e.col(r1),route:'P1_terminal'});continue;}
    if(e.terminalActions(s14,0).length){branches.push({reply1:e.col(r1),route:'immediate_P0_terminal'});continue;}
    const second=k.advance(s14,attack);
    if(second===domain.QN_TERMINAL_WIN){branches.push({reply1:e.col(r1),route:'P0_terminal_second_support'});continue;}
    assert(second>=0&&e.rank(second)===15);
    const replies=[];let branchClosed=true;
    for(const r2 of e.legal(second)){
      const r2Cell=e.landing(second,r2),s16=k.advance(second,r2);
      if(s16===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(second,1)).has(r2Cell));branchClosed=false;replies.push({reply2:e.col(r2),route:'P1_terminal'});continue;}
      if(e.terminalActions(s16,0).length){replies.push({reply2:e.col(r2),route:'immediate_P0_terminal'});continue;}
      const survivorTarget=e.singleton(s16,0,otherTarget)?otherTarget:target;
      const key=e.exactStateTargetKey(s16,survivorTarget);
      if(closedRank16Keys.has(key)){replies.push({reply2:e.col(r2),route:'closed_rank16_survivor',target:e.coord(survivorTarget)});continue;}
      branchClosed=false;replies.push({reply2:e.col(r2),route:'outside_closed_rank16',targetLive:e.singleton(s16,0,survivorTarget),targetDistance:e.targetDistance(s16,survivorTarget),enabledP1Singletons:e.enabledSingletons(s16,1).map(e.coord)});
    }
    if(!branchClosed)closed=false;branches.push({reply1:e.col(r1),route:branchClosed?'closed_second_support_branch':'open_second_support_branch',replies});
  }
  return {attack:e.col(attack),closed,branches};
}
const rootMacros=[testRootMacro(C,C3,G3),testRootMacro(G,G3,C3)];

assert.equal(e.stats().proofStates,0,'consumer invoked recursive repair prover');
const rank18WitnessCounts={};for(const x of rank18Closed)for(const c of x.witnessColumns)rank18WitnessCounts[c]=(rank18WitnessCounts[c]??0)+1;
const rank20Kinds={};for(const v of rank20Memo.values())rank20Kinds[v.kind]=(rank20Kinds[v.kind]??0)+1;

console.log(`CERTIFIED_REPAIR_PREDECESSOR_CONSUMER=${JSON.stringify({
  kind:'standard7x6-two-kernel-certified-repair-predecessor-consumer-v1',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  producer:{certifiedStateTargetPairs:produced.certificate.stats.certifiedStateTargetPairs,rank20LogicalMembers:20,rank20UniqueKeys:produced.rank20Keys.size,stats:produced.producerStats},
  consumer:{recursiveProofCalls:e.stats().proofStates,rank20Checks,rank20Actions,rank20P1Branches,rank20Kinds,rank18Actions,rank18P1Branches},
  rank18:{states:rank18Results.length,closed:rank18Closed.length,failed:rank18Failed.length,witnessColumnCounts:rank18WitnessCounts},
  rank16:{states:rank16Results.length,closed:rank16Results.filter(x=>x.closed).length,failed:rank16Results.filter(x=>!x.closed).length,rows:rank16Results.map(x=>({member:`${x.family}:${e.col(x.r1)}`,sequence:x.sequence,target:e.coord(x.target),closed:x.closed,forcedAction:x.forcedAction}))},
  latentRoot:{sequence:ROOT,macros:rootMacros,closedCandidateColumns:rootMacros.filter(x=>x.closed).map(x=>x.attack)},
  rank18FailureSamples:rank18Failed.slice(0,12).map(x=>({member:`${x.family}:${e.col(x.r1)}->${e.col(x.reply)}`,target:e.coord(x.target),mu:e.mu(x.rank18State),targetDistance:e.targetDistance(x.rank18State,x.target),enabledP1Singletons:e.enabledSingletons(x.rank18State,1).map(e.coord),rejected:x.rejected})),
  interpretation:rootMacros.some(x=>x.closed)
    ? 'At least one exact same-target macro at 466565554644 is branch-complete into terminal certificates and finite alternating-predecessor layers backed only by the frozen independently-produced repair certificate. This is a guarded winning-contract certificate for the fixed latent root, not a center-opening or game-root solve.'
    : rank16Results.every(x=>x.closed)
      ? 'All 12 forced-block rank16 survivors close through the frozen repair certificate, but the fixed root macro still has an exact higher-level separator outside those survivors.'
      : rank18Failed.length===0
        ? 'All post-block rank18 states close into the frozen repair certificate, but at least one rank16 forced-block branch remains open.'
        : 'The frozen independently-produced repair certificate does not yet absorb every post-block rank18 state through the bounded predecessor layers. Preserve the exact failed predecessor separators; do not recurse or widen storage.',
  theoremBoundary:'Producer and consumer use separate fresh kernels. The consumer never invokes recursive repair proof. A rank22 leaf is accepted only by exact stable certificate-key membership in the independently-produced proof certificate; a rank20 leaf is accepted only by exact qualified rank20 membership or one explicit repair predecessor layer whose nonterminal rank22 leaves are all frozen-certified. No solved W/D/L labels, arbitrary minimax/frontier search, q approximation, or storage widening is used.',
})}`);
