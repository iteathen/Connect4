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

function qualifyOriginal16(){
  const k=makeKernel();
  const e=createRepairCapacityProofEngine(k,{collectAllWinningActions:true,maxProofStates:100000});
  const cases=[
    {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3,adjacentTail:5},
    {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3,adjacentTail:5},
    {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3,adjacentTail:3},
    {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3,adjacentTail:3},
  ];
  const starts=[];let immediate=0;
  for(const c of cases){
    const r19=replay(k,ROOT+c.prefix+String(c.resolved+1).repeat(3));
    const r20=k.advance(r19,c.adjacentTail);assert(r20>=0&&e.rank(r20)===20);
    const r21=k.advance(r20,c.adjacentTail);assert(r21>=0&&r21!==domain.QN_TERMINAL_WIN&&e.rank(r21)===21);
    for(const rc of e.legal(r21)){
      const y=k.advance(r21,rc);assert(y>=0&&y!==domain.QN_TERMINAL_WIN&&e.rank(y)===22);
      if(e.terminalActions(y,0).length){immediate++;continue;}
      assert(e.invariant(y,c.target),'original-16 start left repair invariant');
      starts.push({member:`${c.name}:${e.col(c.adjacentTail)}->P1:${e.col(rc)}`,state:y,target:c.target});
    }
  }
  assert.equal(immediate,4);assert.equal(starts.length,16);
  const results=starts.map(x=>({...x,proof:e.prove(x.state,x.target)}));
  const failed=results.filter(x=>!x.proof.proved);
  assert.equal(failed.length,0,'reusable engine regressed original 16-state proof domain');
  const stats=e.stats();
  // These exact traversal counts are a refactor-conformance guard, not theorem premises.
  assert.equal(stats.proofStates,9635,'repair proof-state traversal changed');
  assert.equal(stats.candidateActionsChecked,25424,'repair candidate-action traversal changed');
  assert.equal(stats.p1BranchesChecked,80384,'repair P1-branch traversal changed');
  assert.equal(stats.maxDepth,7,'repair proof depth changed');
  return {proved:results.length,failed:failed.length,immediate,stats,certificate:e.exportCertificate()};
}

function qualifyRank20AndExport(){
  const k=makeKernel();
  const e=createRepairCapacityProofEngine(k,{collectAllWinningActions:false,maxProofStates:100000});
  const cases=[
    {name:'C_resolved_P0_owned_C1',prefix:'3733',resolved:C,target:G3},
    {name:'C_resolved_P1_owned_C1',prefix:'7333',resolved:C,target:G3},
    {name:'G_resolved_P1_owned_G1',prefix:'3777',resolved:G,target:C3},
    {name:'G_resolved_P0_owned_G1',prefix:'7377',resolved:G,target:C3},
  ];
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
          if(afterP1===domain.QN_TERMINAL_WIN){assert(new Set(e.enabledSingletons(afterP0,1)).has(replyCell));accepted=false;break;}
          assert(afterP1>=0&&e.rank(afterP1)===22);
          if(e.terminalActions(afterP1,0).length)continue;
          const child=e.prove(afterP1,c.target);
          if(!child.proved){accepted=false;break;}
        }
        if(accepted)witnesses.push(e.col(action));
      }
      rows.push({member:`${c.name}:${e.col(sourceRepair)}`,state,target:c.target,witnesses,key:e.exactStateTargetKey(state,c.target)});
    }
  }
  assert.equal(rows.length,20);assert.equal(rows.filter(x=>x.witnesses.length>0).length,20,'reusable engine regressed 20-state latent closure');
  const stats=e.stats();
  assert.equal(stats.proofStates,38171,'rank20 repair proof-state traversal changed');
  assert.equal(stats.candidateActionsChecked,72034,'rank20 repair action traversal changed');
  assert.equal(stats.p1BranchesChecked,221707,'rank20 repair P1 traversal changed');
  assert.equal(stats.maxDepth,7,'rank20 repair depth changed');
  const logicalKeys=rows.map(x=>x.key),uniqueKeys=new Set(logicalKeys);
  assert.equal(uniqueKeys.size,16,'expected 20 logical rank20 members to have 16 exact state-target keys');
  const certificate=e.exportCertificate();

  // Verify allocator-independent key stability in a fresh kernel, without invoking the prover.
  const k2=makeKernel();
  const e2=createRepairCapacityProofEngine(k2,{collectAllWinningActions:false,maxProofStates:1});
  const freshKeys=[];
  for(const c of cases){
    const r19=replay(k2,ROOT+c.prefix+String(c.resolved+1).repeat(3));
    for(const sourceRepair of REPAIRS){const state=k2.advance(r19,sourceRepair);freshKeys.push(e2.exactStateTargetKey(state,c.target));}
  }
  assert.deepEqual([...freshKeys].sort(),[...logicalKeys].sort(),'exact certificate keys are not stable across fresh kernels');
  assert.equal(e2.stats().proofStates,0,'stable-key check accidentally invoked proof recursion');
  return {closed:20,failed:0,logicalRank20Members:20,uniqueRank20Keys:uniqueKeys.size,stats,certificate};
}

const original16=qualifyOriginal16();
const rank20=qualifyRank20AndExport();
console.log(`REPAIR_PROOF_LIB_CONFORMANCE=${JSON.stringify({
  kind:'standard7x6-repair-proof-lib-conformance-v1',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  original16:{proved:original16.proved,failed:original16.failed,immediate:original16.immediate,stats:original16.stats,certifiedPairs:original16.certificate.stats.certifiedStateTargetPairs},
  rank20:{closed:rank20.closed,failed:rank20.failed,logicalRank20Members:rank20.logicalRank20Members,uniqueRank20Keys:rank20.uniqueRank20Keys,stats:rank20.stats,certifiedPairs:rank20.certificate.stats.certifiedStateTargetPairs},
  stableKey:'rank/turn + seven support heights + exact normalized R0 term bitsets + exact normalized R1 term bitsets + target claim',
  interpretation:'The reusable proof engine reproduces both previously-qualified repair traversals exactly, and its exact certificate keys survive reconstruction in an independent fresh kernel. The exported certificate may therefore be consumed by higher-level theorem composition without allocator-local state ids or recursive proof reconstruction.',
  theoremBoundary:'Traversal counts are refactor-conformance guards only, not game-theoretic premises. Exact certificate-key equality is exact support/residual/claim identity; it does not imply provenance equivalence or any stronger quotient than those serialized components.',
})}`);
