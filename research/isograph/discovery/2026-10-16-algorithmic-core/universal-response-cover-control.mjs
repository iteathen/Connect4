#!/usr/bin/env node
// Oracle-blind, independent physical validation of the rule-derived P1
// universal / P0 exists / P1 universal / P0 immediate response-cover
// operator. Only the VALIDATOR materializes concrete game continuations.
//
// Entire physical reachable state graph constructed for qualification,
// but no game-tree search / solved policy feeds the algebraic producer.
import {performance} from 'node:perf_hooks';
import {createUniversalResponseCover} from './universal-response-cover-operator.mjs';
import {createDirectTwoMovePullback} from './direct-two-move-pullback.mjs';
import {independentPhysical} from './universal-one-reply-fusion-control.mjs';
const BOARDS=[
 {width:4,height:3,connect:3,name:'4x3-c3'},
 {width:4,height:4,connect:4,name:'4x4-c4'}
];
const MAX_STATES=200000,MAX_GRAPH_EDGES=800000,
 MAX_PHYSICAL_VALIDATION_EDGES=800000,MAX_ROWS=300000,MAX_MS=30000;
const pc=x=>{let n=0;for(;x;x&=x-1n)n++;return n;};
const hex=x=>'0x'+x.toString(16);
const resultQ=q=>({h:q.h.slice(),R0:q.R0.map(hex),R1:q.R1.map(hex)});
const maskMirror=(x,w)=>{let out=0n;for(let c=0;c<w;c++)
 if((x&(1n<<BigInt(c)))!==0n)out|=1n<<BigInt(w-1-c);return out;};
function runBoard(board){
 const t=performance.now(),deadline=Date.now()+MAX_MS,
  producer=createUniversalResponseCover(board),
  sourceIndependentAlgebra=createDirectTwoMovePullback(board),
  physical=independentPhysical(board),
  visited=new Set(),states=[],
  groups=new Map();
 const stats={
  physicalPositionsEnumerated:0,physicalGraphEdges:0,
  P1StatesAlgebraicallyCompared:0,sourceOperatorRows:0,
  referenceQChildStatesConstructed:0,
  referenceDirectTwoMoveOperatorCalls:0,
  sourceResidualMembershipQueries:0,
  sourcePairResidualQueries:0,
  sourceOpponentOneMoveGuards:0,
  sourceP0ImmediateWinRows:0,
  responseCoverTrueRows:0,sourceThirdLandingLabels:0,
  referenceMaskMismatches:0,
  physicalPositionsChecked:0,physicalValidationTransitionCalls:0,
  physicalValidationP0ImmediateCalls:0,
  physicalActionMaskMismatches:0,
  universalMaskMismatches:0,
  reflectedPositionChecks:0,reflectionMismatches:0,
  caseCountByRank:{},physicalCaseCountByRank:{},
  mutatedOmitP0PairDetected:false,mutatedOmitP1PairDetected:false,
  mutateProducerRows:0,completeCandidateStates:0
 };
 let error=null,firstMismatch=null,firstPositive=null,
  firstP0PairCounterexample=null,firstP1PairCounterexample=null;
 function enumerate(s){
  if(Date.now()>deadline||states.length>=MAX_STATES||stats.physicalGraphEdges>=MAX_GRAPH_EDGES)
   throw Error('fixed validation graph budget exhausted');
  const k=physical.key(s);
  if(visited.has(k))return;
  visited.add(k);stats.physicalPositionsEnumerated++;states.push(s);
  if(!groups.has(s.rank))groups.set(s.rank,[]);
  groups.get(s.rank).push(s);
  for(const c of physical.legal(s)){
   if(stats.physicalGraphEdges>=MAX_GRAPH_EDGES)
    throw Error('fixed validation graph edges exhausted');
   stats.physicalGraphEdges++;
   const child=physical.transition(s,c);
   if(child.terminal===undefined)enumerate(child.state);
  }
 }
 function physicalImmediateP0(s){
  for(const c of physical.legal(s)){
   stats.physicalValidationTransitionCalls++;
   stats.physicalValidationP0ImmediateCalls++;
   if(physical.transition(s,c).terminal===1)return true;
  }
  return false;
 }
 function physicalResponseMask(s){
  const byB=new Map();
  for(const b of physical.legal(s)){
   stats.physicalValidationTransitionCalls++;
   const first=physical.transition(s,b);
   let good=0n;
   if(first.terminal===undefined){
    for(const a of physical.legal(first.state)){
     stats.physicalValidationTransitionCalls++;
     const second=physical.transition(first.state,a);
     let yes=second.terminal===1;
     if(second.terminal===undefined){
      yes=true;
      for(const d of physical.legal(second.state)){
       stats.physicalValidationTransitionCalls++;
       const third=physical.transition(second.state,d);
       if(third.terminal!==undefined||!physicalImmediateP0(third.state)){
        yes=false;break;
       }
      }
     }
     if(yes)good|=1n<<BigInt(a);
    }
   }
   byB.set(b,good);
  }
  return byB;
 }
 function rowsFromReference(s){
  const byB=new Map();
  for(const b of physical.legal(s)){
   const next=physical.transition(s,b);
   let mask=0n;
   if(next.terminal===undefined){
    stats.referenceQChildStatesConstructed++;
    stats.referenceDirectTwoMoveOperatorCalls++;
    mask=sourceIndependentAlgebra.compute(physical.qfrom(next.state)).forcedWinningFirstActionsMask;
   }
   byB.set(b,mask);
  }
  return byB;
 }
 function maskMap(result){
  return new Map(result.responseActionsByP1.map(x=>[x.initialP1,x.certifiedP0RepliesMask]));
 }
 function reportDiff(s,a,b,source){
  const q=physical.qfrom(s);
  return {rank:s.rank,sequence:s.sequence,h:s.h,
   q:resultQ(q),b:b+1,claimedMask:hex(a),referenceMask:hex(source)};
 }
 try{enumerate(physical.empty());}
 catch(e){return {board,status:'BUDGET_EXHAUSTED',stats,
  error:String(e),elapsedMs:+(performance.now()-t).toFixed(3)};}
 const rankGroups=[...groups.entries()].filter(([rank])=>rank%2===1)
   .sort((a,b)=>a[0]-b[0]);
 const candidates=rankGroups.flatMap(([,states])=>states);
 // Core algebraic comparison uses no physical 4-ply game continuation
 // enumeration, only the separate exact already-qualified 2-own-move
 // cofactor pullback applied to each one-step b child for validation.
 let algebraicPartial=false;
 for(const s of candidates){
  if(Date.now()>deadline){algebraicPartial=true;break;}
  const q=physical.qfrom(s),f=producer.compute(q);
  const bCount=physical.legal(s).length;
  // Actual row count was obtained before budget check. That one source-q
  // producer call is charged too; retain at most one-position overshoot
  // as a negative audit if the strict check below has not been triggered.
  if(stats.sourceOperatorRows+f.statistics.P0ReplyActionLabels>MAX_ROWS){
   algebraicPartial=true;break;
  }
  stats.P1StatesAlgebraicallyCompared++;
  stats.sourceOperatorRows+=f.statistics.P0ReplyActionLabels;
  stats.sourceResidualMembershipQueries+=f.statistics.sourceResidualMembershipQueries;
  stats.sourcePairResidualQueries+=f.statistics.sizeTwoSourceQueries;
  stats.sourceOpponentOneMoveGuards+=f.statistics.P1FirstWinGuards;
  stats.sourceP0ImmediateWinRows+=f.statistics.P0ImmediateWinRows;
  stats.responseCoverTrueRows+=f.statistics.successfulResponsePairs;
  stats.sourceThirdLandingLabels+=f.statistics.secondP1LandingLabels;
  stats.caseCountByRank[s.rank]=(stats.caseCountByRank[s.rank]??0)+1;
  const map=maskMap(f),ref=rowsFromReference(s);
  let covered=0n;
  for(const [b,mask] of ref){
   const pred=map.get(b);
   if(pred!==mask){
    stats.referenceMaskMismatches++;
    firstMismatch=reportDiff(s,pred,b,mask);break;
   }
   if(mask!==0n)covered|=1n<<BigInt(b);
  }
  if(firstMismatch)break;
  if(covered!==f.coveredInitialP1Mask||
     f.universalBoundedP0Win!==(covered===f.initialLegalP1Mask)){
    stats.universalMaskMismatches++;
    firstMismatch={sequence:s.sequence,rank:s.rank,reference:hex(covered),
      predicted:hex(f.coveredInitialP1Mask)};break;
  }
  if(!firstPositive&&f.universalBoundedP0Win)
   firstPositive={rank:s.rank,sequence:s.sequence,coverByP0Column:f.responseCoverByP0Column.map(hex)};
  if(!firstP0PairCounterexample){
   const mutated=producer.compute(q,{omitP0Pairs:true});
   stats.mutateProducerRows+=mutated.statistics.P0ReplyActionLabels;
   if(mutated.coveredInitialP1Mask!==f.coveredInitialP1Mask||
      mutated.responseCoverByP0Column.some((x,i)=>x!==f.responseCoverByP0Column[i])){
    firstP0PairCounterexample={sequence:s.sequence,rank:s.rank,
      correct:f.responseCoverByP0Column.map(hex),mutated:mutated.responseCoverByP0Column.map(hex)};
    stats.mutatedOmitP0PairDetected=true;
   }
  }
  if(!firstP1PairCounterexample){
   const mutated=producer.compute(q,{omitP1Pairs:true});
   stats.mutateProducerRows+=mutated.statistics.P0ReplyActionLabels;
   if(mutated.coveredInitialP1Mask!==f.coveredInitialP1Mask||
      mutated.responseCoverByP0Column.some((x,i)=>x!==f.responseCoverByP0Column[i])){
    firstP1PairCounterexample={sequence:s.sequence,rank:s.rank,
      correct:f.responseCoverByP0Column.map(hex),mutated:mutated.responseCoverByP0Column.map(hex)};
    stats.mutatedOmitP1PairDetected=true;
   }
  }
  if(stats.reflectedPositionChecks<40){
   const mirror=physical.reflected(s),
    mirrorOp=producer.compute(physical.qfrom(mirror));
   for(let a=0;a<board.width;a++){
    const expected=maskMirror(f.responseCoverByP0Column[a],board.width),
      actual=mirrorOp.responseCoverByP0Column[board.width-1-a];
    if(expected!==actual){
      stats.reflectionMismatches++;
      firstMismatch={sequence:s.sequence,column:a+1,mirrorDiff:true,
       expected:hex(expected),actual:hex(actual)};break;
    }
   }
   stats.reflectedPositionChecks++;
   if(firstMismatch)break;
  }
 }
 if(firstMismatch)
  return {board,status:'FAIL',stats,firstMismatch,
    firstPositive,firstP0PairCounterexample,firstP1PairCounterexample,
    elapsedMs:+(performance.now()-t).toFixed(3)};
 // Separate direct PHYSICAL first-win game-continuation test, capped.
 // A round-robin rank order exercises shallow and deep domains before the
 // per-board 800k move limit, rather than only near-terminal cases.
 let physicalPartial=false;
 const maxLen=Math.max(...rankGroups.map(x=>x[1].length));
 OUTER:for(let i=0;i<maxLen;i++)for(const [rank,list] of rankGroups){
  if(i>=list.length)continue;
  const s=list[i];
  // Tight first-win-independent worst-case per P1 root:
  // W^1 + W^2 + W^3 + W^4 explicit physical move calls.
  const W=board.width,ceiling=W+W**2+W**3+W**4;
  if(Date.now()>deadline||stats.physicalValidationTransitionCalls+ceiling>MAX_PHYSICAL_VALIDATION_EDGES){
   physicalPartial=true;break OUTER;
  }
  const expected=physicalResponseMask(s),got=producer.compute(physical.qfrom(s)),
    map=maskMap(got);
  stats.physicalPositionsChecked++;
  stats.physicalCaseCountByRank[rank]=(stats.physicalCaseCountByRank[rank]??0)+1;
  let cover=0n;
  for(const [b,mask] of expected){
   if(mask!==map.get(b)){
    stats.physicalActionMaskMismatches++;
    firstMismatch=reportDiff(s,map.get(b),b,mask);break;
   }
   if(mask!==0n)cover|=1n<<BigInt(b);
  }
  if(firstMismatch)break OUTER;
  if(cover!==got.coveredInitialP1Mask||
    got.universalBoundedP0Win!==(cover===got.initialLegalP1Mask)){
   stats.universalMaskMismatches++;firstMismatch={
    sequence:s.sequence,rank,physicalCover:hex(cover),algebraCover:hex(got.coveredInitialP1Mask)};
   break OUTER;
  }
 }
 const status=firstMismatch?'FAIL':algebraicPartial||physicalPartial?
   'PASS_BOUNDED_PARTIAL':'PASS';
 return {board,status,stats,physicalPartial,algebraicPartial,
  firstMismatch,firstPositive,firstP0PairCounterexample,firstP1PairCounterexample,
  elapsedMs:+(performance.now()-t).toFixed(3),
  proofScope:'fixed 4 strategic plies only; search-generated policy is never a producer input',
  producerParentOnly:true};
}
export function runResponseCoverQualification(){
 const cases=BOARDS.map(runBoard);
 return {
  schema:'connect4.source-q-four-ply-response-cover.v0_1',
  date:'2026-10-16',
  status:cases.some(x=>x.status==='FAIL')?'FAIL':
    cases.every(x=>x.status==='PASS')?'PASS':'PARTIAL',
  cases,oracleQueries:0,policySearchInputs:0,
  arbitraryHorizonNonbranchingProved:false
 };
}
if(process.argv[1]?.endsWith('universal-response-cover-control.mjs')){
 const z=runResponseCoverQualification();
 console.log(JSON.stringify(z,null,2));
 if(z.status==='FAIL')process.exitCode=1;
}
