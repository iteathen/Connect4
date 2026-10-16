#!/usr/bin/env node
// Offline validation ONLY. Separate the rule-derived, no-game-search
// 5-ply bounded P0-win mask from independently obtained unrestricted WDL.
// Physical existential/universal game expansion below is a FALSIFIER,
// and cannot become a producer of winning policies or algebraic hypotheses.
import {createVirtualUpsetFivePly} from './virtual-upset-five-ply.mjs';
import {createExactQCore} from './exact-q-core.mjs';
import {independentPhysical} from './universal-one-reply-fusion-control.mjs';
const G={width:4,height:3,connect:3},
MAX_PHYSICAL=100000,MAX_QSTATES=20000,MAX_QEDGES=100000,MAX_MS=30000;
export function runShortHorizonVsWDLGap(){
 const deadline=Date.now()+MAX_MS,start=Date.now();
 const producer=createVirtualUpsetFivePly(G),
   physical=independentPhysical(G),
   core=createExactQCore(G);
 const original=core.createEmpty();
 const bounded=producer.compute(original,{maxChecks:100000,deadlineAt:deadline});
 if(bounded.status!=='COMPLETE_FIVE_PLY_FIXED_HORIZON')
  return {status:'BUDGET_EXHAUSTED',producer:bounded};
 const metrics={physicalNodeCalls:0,physicalActionTransitions:0,
   terminalP0WinningLeaves:0,terminalP1OrDrawLeaves:0,
   boundedHorizonNonwinLeaves:0,strictBudget:MAX_PHYSICAL};
 function response(state,p0OwnMoves){
  if(Date.now()>deadline||metrics.physicalActionTransitions>=MAX_PHYSICAL)
    throw Error('strict bounded physical validation budget');
  metrics.physicalNodeCalls++;
  const p=state.rank&1,moves=physical.legal(state);
  if(p===0){
    for(const c of moves){
      if(metrics.physicalActionTransitions>=MAX_PHYSICAL)throw Error('physical budget');
      metrics.physicalActionTransitions++;
      const edge=physical.transition(state,c);
      if(edge.terminal===1){metrics.terminalP0WinningLeaves++;return true;}
      if(edge.terminal!==undefined){
        metrics.terminalP1OrDrawLeaves++;continue;
      }
      if(p0OwnMoves+1>=3){
        metrics.boundedHorizonNonwinLeaves++;continue;
      }
      if(response(edge.state,p0OwnMoves+1))return true;
    }
    return false;
  }
  for(const c of moves){
    if(metrics.physicalActionTransitions>=MAX_PHYSICAL)throw Error('physical budget');
    metrics.physicalActionTransitions++;
    const edge=physical.transition(state,c);
    if(edge.terminal!==undefined){
      metrics.terminalP1OrDrawLeaves++;return false;
    }
    if(!response(edge.state,p0OwnMoves))return false;
  }
  return true;
 }
 const truthByMove=[];
 for(const c of physical.legal(physical.empty())){
  metrics.physicalActionTransitions++;
  const edge=physical.transition(physical.empty(),c);
  const truth=edge.terminal===1||
    (edge.terminal===undefined&&response(edge.state,1));
  truthByMove.push({column:c+1,winWithinThreeOwnMoves:truth});
 }
 const physicalMask=truthByMove.reduce((m,x)=>x.winWithinThreeOwnMoves?
  m|(1n<<BigInt(x.column-1)):m,0n);
 if(physicalMask!==bounded.forcedP0FirstActionsMask)
  throw Error('physical bounded first-win quantifiers disagree with algebra');
 // All unrestricted perfect-play values are VALIDATION ONLY and are
 // computed strictly after the fixed-horizon result has closed.
 const qFull=core.solve(original,{
  maxStates:MAX_QSTATES,maxTransitions:MAX_QEDGES,
  deadlineAt:deadline
 });
 const unrestricted={value:qFull.answer.value,
  bestMovesOneBased:qFull.answer.bestMoves.map(c=>c+1),
  actionValues:qFull.answer.actionValues.map(([c,v])=>[c+1,v]),
  stats:qFull.stats};
 const boundedMoves=bounded.actionResults.filter(x=>x.universal).map(x=>x.a+1);
 const gap=unrestricted.value===1&&boundedMoves.length===0;
 return {
  schema:'connect4.short-horizon-vs-full-wdl-gap.v0_1',
  status:'PASS',
  board:G,
  boundedHorizon:{claim:'P0 forces win on its first, second or third own placement',
   certifiedMovesOneBased:boundedMoves,
   qMaterializations:bounded.statistics.sourceQChildMaterializations,
   gameTreeSearchCalls:bounded.statistics.recursiveGameStateSolves,
   membershipChecks:bounded.statistics.upsetMembershipTests,
   degreeThreeQueries:bounded.statistics.degreeThreeQueries},
  physicallyIndependentlyVerifiedWithinThreeMoves:{
   successfulMovesOneBased:truthByMove.filter(x=>x.winWithinThreeOwnMoves).map(x=>x.column),
   moveChecks:truthByMove,
   metrics
  },
  unrestrictedReference:unrestricted,
  boundedVsUnrestrictedWinningClaimGap:gap,
  interpretation:'same all-rank residual cofactor rules; finite 3-own-move predicate does not solve full 4x3 Connect3 root; more strategic alternating-value composition still required',
  noSearchPolicySuppliedToCandidate:true,
  validationPhysicalSearchWasNotAlgorithmProducer:true,
  elapsedMs:Date.now()-start
 };
}
if(process.argv[1]?.endsWith('short-horizon-vs-wdl-control.mjs')){
 const z=runShortHorizonVsWDLGap();
 console.log(JSON.stringify(z,null,2));
 if(z.status!=='PASS')process.exitCode=1;
}
