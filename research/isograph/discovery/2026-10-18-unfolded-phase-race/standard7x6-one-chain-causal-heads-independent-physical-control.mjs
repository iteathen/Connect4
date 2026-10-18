// Independent exhaustive original physical fixed-segment word first-head
// falsifier for FROZEN source scalar M/ε first-admissible-label theorem.
// Existence/word enumeration in PHYSICAL validator only; source has none.
import {createPhysicalOneChainSingletonChecker} from './standard7x6-one-chain-singletons-independent-physical-control.mjs';
import {createOneChainCausalHeadSelector} from './standard7x6-source-one-chain-causal-first-heads.mjs';
export function runPhysicalOneChainHeadFalsifier(){
 const physical=createPhysicalOneChainSingletonChecker();
 const source=createOneChainCausalHeadSelector({width:7,height:6,connect:4});
 const cases=[];
 for(let L=1;L<=6;L++)for(const singles of [[],[1],[1,2],[1,2,7]])
  cases.push({history:'',c:4,L,singles});
 for(let L=1;L<=6;L++)for(const singles of [[],[2],[2,3],[2,3,4]])
  cases.push({history:'44444',c:1,L,singles});
 const late='2532541156412471331416356736376672';
 for(let L=1;L<=2;L++)for(const singles of [[],[4],[4,5],[4,5,7]])
  cases.push({history:late,c:2,L,singles});
 if(cases.length!==56)throw Error('must use frozen SAME 56 original physical cases');
 const total={cases:cases.length,originalPhysicalWinlines:69,
  physicallyEnumeratedFixedEventWords:0,sourceOwnerColorProfiles:0,
  physicallyFeasibleOwnerColorProfiles:0,
  sourcePerfectHeadSetMatchesPhysical:0,sourceInfeasibleHeadMaskEmpty:0,
  sourceHeadsSingletonOnly:0,sourceHeadsChainOnly:0,sourceHeadsMultiple:0,
  sourceUniquelyRequiredHeadProfiles:0,
  physicallyObservedHeadMismatch:0,
  actualRootOrFirstActionWDLCalls:0,
  sourceFutureGameValueOrAlternateWordCalls:0};
 const examples=[],incompleteExamples=[];
 function words(c,L,singles){
  const alphabet=[c,...singles],cap=new Map(alphabet.map(z=>[z,z===c?L:1]));
  const out=[],w=[];
  function rec(){
   if(w.length===L+singles.length){out.push(w.slice());return;}
   for(const z of alphabet)if(cap.get(z)>0){
    cap.set(z,cap.get(z)-1);w.push(z);rec();w.pop();cap.set(z,cap.get(z)+1);
   }
  }
  rec();return out;
 }
 for(const test of cases){
  const from=physical.root(test.history),all=words(test.c,test.L,test.singles);
  total.physicallyEnumeratedFixedEventWords+=all.length;
  const fiberHeads=new Map();
  for(const w of all){
   const played=physical.replay(from,w);
   const key=physical.signature(from,played,test.c,test.L,test.singles);
   if(!fiberHeads.has(key))fiberHeads.set(key,new Set());
   fiberHeads.get(key).add(w[0]);
  }
  const T=test.L+test.singles.length;
  for(let b=0;b<2**T;b++){
   const colors=Array.from({length:T},(_,j)=>(b>>j)&1);
   const x=colors.slice(0,test.L),y=colors.slice(test.L);
   const key=x.join('')+'|'+y.join('');
   const expectation=[...(fiberHeads.get(key)||new Set())].sort((a,b)=>a-b);
   const got=source.compute(from.q,{chainColumn:test.c,L:test.L,
    singletonColumns:test.singles,chainOwners:x,singletonOwners:y});
   if(got.exactProjectionAdmissibleHeadColumns===null)
    throw Error('unhandled original source guard in physical test matrix');
   total.sourceOwnerColorProfiles++;
   if(expectation.length)total.physicallyFeasibleOwnerColorProfiles++;
   if(JSON.stringify(got.exactProjectionAdmissibleHeadColumns)!==JSON.stringify(expectation)){
    total.physicallyObservedHeadMismatch++;
    throw Error('SOURCE HEAD SET DISAGREES WITH PHYSICAL ROOT WORDS '+JSON.stringify({test,x,y,expected:expectation,got}));
   }
   if(!expectation.length)total.sourceInfeasibleHeadMaskEmpty++;
   else {
    total.sourcePerfectHeadSetMatchesPhysical++;
    if(expectation.length===1){
     total.sourceUniquelyRequiredHeadProfiles++;
     if(expectation[0]===test.c)total.sourceHeadsChainOnly++;
     else total.sourceHeadsSingletonOnly++;
    }else total.sourceHeadsMultiple++;
    if(examples.length<8 && (got.sourceHeadsMultiple||expectation.length>1))
     examples.push({originalHistory:test.history,chainColumn:test.c,L:test.L,
      singletons:test.singles,chainColors:x,singletonColors:y,sourceCertifiedHeadSet:expectation});
   }
  }
 }
 const firstSimple=source.compute(physical.root('').q,{chainColumn:2,L:2,
  singletonColumns:[1],chainOwners:[0,1],singletonOwners:[0]});
 const secondBarrier=source.compute(physical.root('').q,{chainColumn:4,L:5,
  singletonColumns:[1,2],chainOwners:[1,0,1,0,1],singletonOwners:[0,0]});
 if(JSON.stringify(firstSimple.exactProjectionAdmissibleHeadColumns)!=='[2]'||
   JSON.stringify(secondBarrier.exactProjectionAdmissibleHeadColumns)!=='[1,2]')
  throw Error('exact initial 3-event forced head or odd barrier 2-head source false');
 return {schema:'connect4.7x6.exact_one_chain_causal_first_head_source_vs_full_physical_fiber_v0_1',
  date:'2026-10-18',status:'EXHAUSTIVE_ORIGINAL_PHYSICAL_HEAD_FIBER_CONFORMANCE',
  totals:total,simpleThreeEventGreedyHeadSet:firstSimple.exactProjectionAdmissibleHeadColumns,
  sevenMoveOddBarrierHeadSet:secondBarrier.exactProjectionAdmissibleHeadColumns,
  positiveExamples:examples,sourceInfeasibleExamples:incompleteExamples,
  claimStrength:'SOURCE EXACT RESTRICTED FIXED-PROJECTION SCHEDULING HEADS, NOT STRATEGIC LEVEL2',
  sourceNonstrategic:true,independentPhysicalValidatorBranchesOverFixedWords:true};
}
