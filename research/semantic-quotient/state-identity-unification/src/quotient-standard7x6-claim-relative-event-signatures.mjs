#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import * as domain from './quotient-negamax-domain-contract.mjs';

const DOMAIN=Object.freeze({columns:7,rows:6,connect:4});
function replay(kernel,seq){let id=kernel.rootId;for(const d of seq){const n=kernel.advance(id,Number(d)-1);if(!Number.isSafeInteger(n)||n<0)throw new Error(`bad replay ${seq}`);id=n;}return id;}
function hasCell([lo,hi],cell){return cell<32?(((lo>>>cell)&1)!==0):(((hi>>>(cell-32))&1)!==0);}
function cellsOf(term){const out=[];for(let c=0;c<42;c++)if(hasCell(term,c))out.push(c);return out;}
function terms(kernel,id,p){const cid=p===0?kernel.states.p0At(id):kernel.states.p1At(id);return kernel.classes.terms(cid).map(cellsOf);}
function hasSingleton(kernel,id,cell){return terms(kernel,id,0).some(t=>t.length===1&&t[0]===cell);}
function coord(cell){return `${String.fromCharCode(65+(cell%7))}${Math.floor(cell/7)+1}`;}

const {kernel}=createSlot64ResidualQuotientKernel(DOMAIN,{cacheEdges:true,prefixClasses:4096,responseClosure:true,searchStorage:Object.freeze({states:262144,classes:524288,chunksPerSlot:131072})});
kernel.prepareSearchStorage();

const cases=[
  // Historical center response-serialization branch: D1 E1 A1 A2 B1, P1 must block C1.
  {family:'center_response_serialization',seq:'45112',target:2},
  // Latent C3 response after cross-support pair C1/G1 and P0 middle advance C2.
  {family:'latent_target_response_C',seq:'466565554644373',target:2*7+2},
  // Latent G3 response after cross-support pair C1/G1 and P0 middle advance G2.
  {family:'latent_target_response_G',seq:'466565554644377',target:2*7+6},
];

const observations=[];
for(const c of cases){
  const before=replay(kernel,c.seq);
  assert.equal(c.seq.length&1,1,`${c.family}: expected P1 to move`);
  assert.equal(hasSingleton(kernel,before,c.target),true,`${c.family}: target not live singleton`);
  const col=c.target%7;
  const response=kernel.advance(before,col);
  const p1Terminal=response===domain.QN_TERMINAL_WIN;
  if(!p1Terminal){
    assert(response>=0,`${c.family}: response illegal`);
    assert.equal(hasSingleton(kernel,response,c.target),false,`${c.family}: singleton survived response`);
  }
  observations.push({
    family:c.family,
    sequence:c.seq,
    concreteTarget:coord(c.target),
    p1Terminal,
    claimRelativeSignature:{
      observation:'DISCHARGE_ENABLED_LIVE_P0_SINGLETON',
      mover:'P1',
      precondition:'TARGET_IS_ENABLED_AND_LIVE_P0_SINGLETON',
      requiredAction:'CLAIM_TARGET_ON_CURRENT_P1_TURN',
      deadline:'CURRENT_P1_TURN',
      conclusion:'P0_SINGLETON_NO_LONGER_LIVE_OR_P1_HAS_ALREADY_TERMINATED',
    },
  });
}

const signatures=new Set(observations.map(x=>JSON.stringify(x.claimRelativeSignature)));
assert.equal(signatures.size,1);

console.log(`CLAIM_RELATIVE_EVENT_SIGNATURES=${JSON.stringify({
  kind:'standard7x6-claim-relative-singleton-discharge-isomorphism-v1',
  attribution:{researchDirectionInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
  physicalContexts:observations.length,
  claimRelativeClasses:signatures.size,
  observations,
  theorem:'EnabledLiveP0Singleton(x) AND SideToMove=P1 => P1 claims x now discharges that singleton obligation, unless the move itself is already a P1 terminal win.',
  interpretation:'The center forced terminal block and the latent-target responses are one exact claim-relative event operator even though their full q successors and unrelated residual side-effects need not be equivalent.',
  theoremBoundary:'The equivalence is relative to singleton discharge only. It does not license reuse of full successor value, resource state, unrelated residual changes, provenance, or later strategy.',
  authority:'Pure C4-0010 transitions/residuals and terminal semantics. No solved W/D/L labels and no recursive frontier search.'
})}`);
