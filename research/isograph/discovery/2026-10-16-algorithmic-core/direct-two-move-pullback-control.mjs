#!/usr/bin/env node
// Strictly bounded independent qualification of direct OR/AND/OR pullback.
// Candidate uses only parent support/R0/R1. This validation harness may
// enumerate the finite physical game graph and explicit reply continuations,
// but its observations NEVER enter the algebraic rule constructor.
import {performance} from 'node:perf_hooks';
import {createDirectTwoMovePullback} from './direct-two-move-pullback.mjs';
import {createUniversalOneReplyFusion} from './universal-one-reply-fusion.mjs';
import {independentPhysical} from './universal-one-reply-fusion-control.mjs';

const CASES=[
 {width:4,height:3,connect:3,name:'4x3-c3'},
 {width:4,height:4,connect:4,name:'4x4-c4'}
];
const MAX_STATES=200000,MAX_GRAPH_EDGES=800000;
const MAX_PHYSICAL_DIRECT_ACTION_CALLS=800000;
const MAX_FORMULA_CHECKS=300000,MAX_WALL_MS=30000;
function hex(x){return '0x'+x.toString(16);}
function qEvidence(q){return {h:q.h,R0:q.R0.map(hex),R1:q.R1.map(hex)};}
function directPhysicalP0TwoMove(s,ref,metrics){
 let result=0n;
 for(const a of ref.legal(s)){
  const act=ref.transition(s,a);metrics.physicalValidationTransitions++;
  let ok=act.terminal===1;
  if(act.terminal===undefined){
   ok=true;
   for(const b of ref.legal(act.state)){
    const reply=ref.transition(act.state,b);metrics.physicalValidationTransitions++;
    if(reply.terminal!==undefined){ok=false;break;}
    if(!ref.immediatelyP0Win(reply.state,{
     get physicalP0ImmediateCandidates(){return metrics.physicalP0ImmediateCandidates;},
     set physicalP0ImmediateCandidates(v){metrics.physicalP0ImmediateCandidates=v;},
     get physicalTransitionCalls(){return metrics.physicalValidationTransitions;},
     set physicalTransitionCalls(v){metrics.physicalValidationTransitions=v;}
    })){ok=false;break;}
   }
  }
  if(ok)result|=1n<<BigInt(a);
 }
 return result;
}
function verifyBoard(cfg){
 const start=Date.now(),deadline=start+MAX_WALL_MS,
   qFusion=createUniversalOneReplyFusion(cfg),
   newOperator=createDirectTwoMovePullback(cfg),
   ref=independentPhysical(cfg),visited=new Set(),states=[];
 const metrics={
  physicalStatesEnumerated:0,physicalGraphEdges:0,
  P0StatesLocalAlgebraChecked:0,
  P0ActionMasksEqualToCofactorFusion:0,
  directPullbackMembershipProbes:0,directPullbackPairAntecedentHits:0,
  directPullbackLatentAntecedentHits:0,directPullbackFirstActionChecks:0,
  qCofactorFirstActionObjectsCreated:0,
  P1ContinuationsMaterializedByDirectCandidate:0,
  validatedP0PhysicalStates:0,physicalValidationTransitions:0,
  physicalP0ImmediateCandidates:0,formulaChecks:0,
  mutatedMissingPairDifferences:0,mutatedMissingUpperDifferences:0,
  differingP0ActionMasks:0,physicallyDisagreeingP0Masks:0,
  P0PhysicalValidationPartial:false
 };
 const first={counterexample:null,missingPair:null,missingUpper:null};
 function visit(s){
  if(Date.now()>=deadline||states.length>=MAX_STATES||
     metrics.physicalGraphEdges>=MAX_GRAPH_EDGES)
    throw Error('physical validation graph construction budget hit');
  const k=ref.key(s);if(visited.has(k))return;
  visited.add(k);states.push(s);metrics.physicalStatesEnumerated++;
  for(const a of ref.legal(s)){
   if(metrics.physicalGraphEdges>=MAX_GRAPH_EDGES)
    throw Error('graph edge ceiling hit');
   metrics.physicalGraphEdges++;
   const child=ref.transition(s,a);
   if(child.terminal===undefined)visit(child.state);
  }
 }
 try{visit(ref.empty());}
 catch(e){return {board:cfg,status:'BUDGET_EXHAUSTED',error:String(e),
   metrics,elapsedMs:Date.now()-start};}
 for(const s of states){
  if((s.rank&1)!==0)continue;
  if(Date.now()>deadline||metrics.formulaChecks+cfg.width*3>MAX_FORMULA_CHECKS){
   return {board:cfg,status:'PARTIAL_FORMULA_BUDGET',metrics,
    error:'algebraic local formula work ceiling hit',first,elapsedMs:Date.now()-start};
  }
  const q=ref.qfrom(s);
  const direct=newOperator.compute(q);
  const previous=qFusion.p0WinsWithinTwoOwnMoves(q);
  metrics.formulaChecks+=direct.metrics.P0CandidateActionsScanned;
  metrics.directPullbackMembershipProbes+=direct.metrics.residualMembershipChecks;
  metrics.directPullbackPairAntecedentHits+=direct.metrics.pairSourceAntecedentHits;
  metrics.directPullbackLatentAntecedentHits+=direct.metrics.latentSourceAntecedentHits;
  metrics.directPullbackFirstActionChecks+=direct.metrics.P0CandidateActionsScanned;
  metrics.qCofactorFirstActionObjectsCreated+=previous.P0ContinuationQStatesConstructed;
  metrics.P1ContinuationsMaterializedByDirectCandidate+=direct.metrics.independentP1ChildStatesEvaluated;
  metrics.P0StatesLocalAlgebraChecked++;
  if(direct.forcedWinningFirstActionsMask!==previous.certifiedP0WinningActionsMask){
   metrics.differingP0ActionMasks++;first.counterexample={
    sequence:s.sequence,q:qEvidence(q),direct:hex(direct.forcedWinningFirstActionsMask),
    cofactorReference:hex(previous.certifiedP0WinningActionsMask)};
   break;
  }
  metrics.P0ActionMasksEqualToCofactorFusion++;
  const omitPair=newOperator.compute(q,{omitPairs:true});
  const omitUpper=newOperator.compute(q,{omitUpper:true});
  metrics.formulaChecks+=2*omitPair.metrics.P0CandidateActionsScanned;
  if(omitPair.forcedWinningFirstActionsMask!==direct.forcedWinningFirstActionsMask){
   metrics.mutatedMissingPairDifferences++;
   if(!first.missingPair)first.missingPair={sequence:s.sequence,q:qEvidence(q),
     correct:hex(direct.forcedWinningFirstActionsMask),wrong:hex(omitPair.forcedWinningFirstActionsMask)};
  }
  if(omitUpper.forcedWinningFirstActionsMask!==direct.forcedWinningFirstActionsMask){
   metrics.mutatedMissingUpperDifferences++;
   if(!first.missingUpper)first.missingUpper={sequence:s.sequence,q:qEvidence(q),
     correct:hex(direct.forcedWinningFirstActionsMask),wrong:hex(omitUpper.forcedWinningFirstActionsMask)};
  }
 }
 if(metrics.differingP0ActionMasks)
  return {board:cfg,status:'FAIL',metrics,first,elapsedMs:Date.now()-start};
 // Independent physical continuation expansion for VALIDATION only:
 // hold a whole P0 state to conservative upper bound W*(1+W*(1+W)).
 for(const s of states){
  if((s.rank&1)!==0)continue;
  const safety=cfg.width*(1+cfg.width*(1+cfg.width));
  if(metrics.physicalValidationTransitions+safety>MAX_PHYSICAL_DIRECT_ACTION_CALLS||
     Date.now()>deadline){
   metrics.P0PhysicalValidationPartial=true;break;
  }
  const q=ref.qfrom(s),direct=newOperator.compute(q);
  const expected=directPhysicalP0TwoMove(s,ref,metrics);
  metrics.validatedP0PhysicalStates++;
  if(expected!==direct.forcedWinningFirstActionsMask){
   metrics.physicallyDisagreeingP0Masks++;
   first.counterexample={sequence:s.sequence,q:qEvidence(q),
    direct:hex(direct.forcedWinningFirstActionsMask),
    physical:hex(expected)};
   break;
  }
 }
 const status=first.counterexample?'FAIL':
   metrics.P0PhysicalValidationPartial?'PASS_ALL_ALGEBRA_PARTIAL_PHYSICAL':'PASS';
 return {
  board:cfg,status,metrics,first,elapsedMs:Date.now()-start,
  claim:'all P0 rank-local two-own-move action masks checked vs direct cofactor/fusion; physical first-win search solely validation',
  candidateP0SuccessorQObjectsMaterialized:0
 };
}
export function runDirectPullbackControl(){
 const cases=CASES.map(verifyBoard);
 return {
  schema:'connect4.direct-two-move-residual-pullback.v0_1',
  date:'2026-10-16',
  status:cases.some(x=>x.status==='FAIL')?'FAIL':
    cases.some(x=>x.status!=='PASS')?'PARTIAL':'PASS',
  cases,producerUsesSearch:false,
  externalOracleCalls:0,
  globalFullGameNonbranchingSolved:false
 };
}
if(process.argv[1]?.endsWith('direct-two-move-pullback-control.mjs')){
 const x=runDirectPullbackControl();
 console.log(JSON.stringify(x,null,2));
 if(x.status==='FAIL')process.exitCode=1;
}
