// Independent exhaustive PHYSICAL legal-state WDL/action-label falsifier
// for direct source-q zero-strategic-fanout formulas.
// Candidate is ALWAYS computed first from q=(h,R0,R1); the qualified
// recursive full-game oracle-independent q evaluator is VALIDATION ONLY.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createDirectTwoTurnFrontier} from './direct-two-turn-frontier-operator.mjs';

export function runTwoTurnFrontierPhysicalControl({
 geometry={width:4,height:3,connect:3},
 maxPhysicalStates=200000,maxQPositions=100000,
 deadlineAt=Infinity}={}){
 const {width:W,height:H}=geometry,
   core=createExactQCore(geometry),candidate=createDirectTwoTurnFrontier(geometry),
   bit=(c,r)=>1n<<BigInt(r*W+c),
   stack=[{h:Array(W).fill(0),p0:0n,p1:0n,rank:0,history:''}],
   physicalSeen=new Set(),qSeen=new Set(),refMemo=new Map(),begin=Date.now();
 const result={schema:'connect4.two-turn-frontier-physical-conformance.v0_1',
   geometry,status:'PASS',physicalStates:0,uniqueSourceQ:0,
   nonterminalPhysicalEdges:0,qualifiedDirectQ:0,
   qualifiedDirectWithTwoPlusLegalMoves:0,
   returnedIncompleteQ:0,returnedIncompleteWithTwoPlusLegalMoves:0,
   candidateStrategicFutureEvaluations:0,
   candidateSourceBooleanOperations:0,
   outputWDLValueChecks:0,completeOptimalLabelSetChecks:0,
   independentActionValueChecks:0,
   wrongSourceInvariants:0,wrongFullGameWDLOutcome:0,
   wrongCompleteMoveSet:0,wrongIndividualActionValue:0,
   fullGameReferenceStates:0,fullGameReferenceTransitions:0,
   byCertificateKind:{},byMovernodes:{P0:0,P1:0},
   directValueDistribution:{P0Win:0,Draw:0,P1Win:0},
   rankHistogram:{},firstByKind:{},lastByKind:{},
   strongestTwoPlusMoveWitness:null,
   elapsedMs:0,
   sourceOnly:true,referenceWasPostDerivationOnly:true};
 const terminal=(p0,p1)=>core.lines.some(line=>
   (p0&line)===line||(p1&line)===line);
 function fail(field,detail){result[field]++;throw Error(field+': '+JSON.stringify(detail));}
 while(stack.length){
  if(Date.now()>deadlineAt||
     result.physicalStates>=maxPhysicalStates||result.uniqueSourceQ>=maxQPositions){
   result.status='CORPUS_BUDGET_PARTIAL';break;
  }
  const state=stack.pop(),pk=state.p0.toString(16)+':'+state.p1.toString(16);
  if(physicalSeen.has(pk))continue;physicalSeen.add(pk);
  if(terminal(state.p0,state.p1))throw Error('physical source already terminal');
  result.physicalStates++;
  const q=core.fromPhysical(state),qKey=core.key(q);
  if(!qSeen.has(qKey)){
   qSeen.add(qKey);result.uniqueSourceQ++;
   const out=candidate.compute(q);
   result.candidateSourceBooleanOperations+=out.statistics.sourceBitsetOperations;
   if(out.statistics.strategicContinuationsEvaluated!==0||
      out.statistics.childQObjectsMaterialized!==0||
      out.statistics.gameTreeBranchesConstructed!==0||
      out.statistics.quantifiedAlternateGameFuturesConstructed!==0)
     fail('wrongSourceInvariants',{history:state.history,source:q});
   const n=core.legal(q).length,rank=state.rank;
   const byRank=result.rankHistogram[rank]??={sourceQ:0,qualified:0,
     selectedWin:0,selectedDraw:0,selectedLoss:0};
   byRank.sourceQ++;
   if(out.status==='EXACT_ZERO_STRATEGIC_FANOUT_RESTRICTED_DOMAIN'){
    result.qualifiedDirectQ++;byRank.qualified++;
    if(n>=2)result.qualifiedDirectWithTwoPlusLegalMoves++;
    const label=out.proofKind;
    const type=result.byCertificateKind[label]??={sources:0,withTwoPlusLegal:0,
      zeroValueFailures:true,moverP0:0,moverP1:0,
      returnedWins:0,returnedDraws:0,returnedLosses:0,
      completeActionValuesChecked:0};
    type.sources++;
    if(n>=2)type.withTwoPlusLegal++;
    type[rank%2===0?'moverP0':'moverP1']++;
    const moverWon=out.value===(rank%2===0?1:-1),
      moverLost=out.value===(rank%2===0?-1:1);
    type[moverWon?'returnedWins':moverLost?'returnedLosses':'returnedDraws']++;
    if(!result.firstByKind[label])result.firstByKind[label]={
      physicalHistory:state.history,rank,legalLabels:out.legalActionLabels.map(v=>v+1),
      value:out.value,bestMoves:out.bestMoves.map(v=>v+1),
      sourceHeights:q.h,sourceResidualCounts:[q.R0.length,q.R1.length],
      sourceCertificate:out.structuralCertificate||out.firstActionSourceProofs};
    result.lastByKind[label]={physicalHistory:state.history,rank,
      legalLabels:out.legalActionLabels.map(v=>v+1),value:out.value,
      bestMoves:out.bestMoves.map(v=>v+1)};
    const validator=core.solve(q,{sharedMemo:refMemo,
      maxStates:60000,maxTransitions:300000});
    result.fullGameReferenceTransitions+=validator.stats.transitions;
    const expect=validator.answer;
    result.outputWDLValueChecks++;
    if(out.value!==expect.value)
      fail('wrongFullGameWDLOutcome',{history:state.history,q:qKey,
        candidate:out.value,reference:expect.value});
    result.completeOptimalLabelSetChecks++;
    if(JSON.stringify(out.bestMoves)!==JSON.stringify(expect.bestMoves))
      fail('wrongCompleteMoveSet',{history:state.history,q:qKey,
        actual:out.bestMoves,want:expect.bestMoves});
    for(let i=0;i<expect.actionValues.length;i++){
      result.independentActionValueChecks++;
      if(JSON.stringify(out.actionValues[i])!==JSON.stringify(expect.actionValues[i]))
        fail('wrongIndividualActionValue',{history:state.history,
          actual:out.actionValues[i],want:expect.actionValues[i]});
      type.completeActionValuesChecked++;
    }
    if(rank%2===0)result.byMovernodes.P0++;else result.byMovernodes.P1++;
    result.directValueDistribution[out.value===1?'P0Win':out.value===0?'Draw':'P1Win']++;
    if(n>=2&&!result.strongestTwoPlusMoveWitness)
      result.strongestTwoPlusMoveWitness=result.firstByKind[label];
   }else {
     result.returnedIncompleteQ++;
     if(n>=2)result.returnedIncompleteWithTwoPlusLegalMoves++;
   }
  }
  const mover=state.rank%2;
  for(let c=W-1;c>=0;c--){
   if(state.h[c]>=H)continue;
   result.nonterminalPhysicalEdges++;
   const next={h:state.h.slice(),p0:state.p0,p1:state.p1,
     rank:state.rank+1,history:state.history+String(c+1)};
   const mark=bit(c,state.h[c]);next.h[c]++;
   if(mover===0)next.p0|=mark;else next.p1|=mark;
   if(terminal(next.p0,next.p1)||next.rank===W*H)continue;
   if(!physicalSeen.has(next.p0.toString(16)+':'+next.p1.toString(16)))
     stack.push(next);
  }
 }
 result.elapsedMs=Date.now()-begin;
 result.fullGameReferenceStates=refMemo.size;
 return result;
}
