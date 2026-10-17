// Full-game exact individual FIRST-action WDL from ORIGINAL source residual
// frontier/one- and two-cell requirements. No action is actually played;
// no child q, no recursive game continuation, no policy oracle, no BDD/QBF.
// If every legal action has an exact source-local two-turn certificate,
// return exact unrestricted WDL and ALL optimal literal labels. Else
// defer only to the independent already proved SOURCE-ONLY pairing/parity
// theorem (not a minimax fallback); otherwise INCOMPLETE.
import {createDirectZeroFanout} from './direct-zero-fanout-operator.mjs';
export function createDirectTwoTurnFrontier({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||W*H>42)
   throw Error('invalid finite gravity geometry');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),
    older=createDirectZeroFanout({width:W,height:H,connect:K});
 function compute(q,{maxOperations=300000,maxMs=15000}={}){
  const start=Date.now(),rank=q?.h?.reduce((a,b)=>a+b,0);
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
      q.h.some(x=>!Number.isInteger(x)||x<0||x>H)||
      !Array.isArray(q.R0)||!Array.isArray(q.R1)||
      q.R0.some(m=>typeof m!=='bigint'||m<=0n)||
      q.R1.some(m=>typeof m!=='bigint'||m<=0n))
    throw Error('normalized nonterminal source q required');
  if(rank>=N)throw Error('cannot evaluate already full board as nonterminal');
  const p=rank&1,o=1-p,legal=[];
  for(let c=0;c<W;c++)if(q.h[c]<H)legal.push(c);
  const own=p===0?q.R0:q.R1,opponent=p===0?q.R1:q.R0;
  const ownMasks=new Set(own.map(String)),enemyMasks=new Set(opponent.map(String));
  const stats={sourceGenerators:q.R0.length+q.R1.length,
    legalFirstActionScans:0,postPlacementFrontierCellScans:0,
    sourceOneCellMembershipTests:0,sourceTwoCellMembershipTests:0,
    sourceOpponentAllBlockedTests:0,certifiedImmediateMoverWin:0,
    certifiedOpponentImmediateReplyWin:0,
    certifiedUnavoidableMoverDoubleThreat:0,
    certifiedBothResidualFamiliesKilled:0,
    certifiedLastPlacementDraw:0,
    provisionalUnknownActions:0,
    strategicContinuationsEvaluated:0,
    childQObjectsMaterialized:0,
    gameTreeBranchesConstructed:0,
    quantifiedAlternateGameFuturesConstructed:0,
    sourceBitsetOperations:0,elapsedMs:0};
  function charge(field){
   stats[field]++;stats.sourceBitsetOperations++;
   if(stats.sourceBitsetOperations>maxOperations||Date.now()-start>maxMs)
      throw Error('DIRECT_TWO_TURN_SOURCE_BUDGET_EXHAUSTED');
  }
  const winVal=p===0?1:-1,loseVal=-winVal,results=[];
  for(const c of legal){
   charge('legalFirstActionScans');
   const x=bit(c,q.h[c]),xkey=String(x);
   if(ownMasks.has(xkey)){
    charge('sourceOneCellMembershipTests');
    stats.certifiedImmediateMoverWin++;
    results.push({column:c,value:winVal,reason:'IMMEDIATE_OWNER_SINGLETON_FIRST_WIN',
      proof:{sourceLandingCell:'0x'+x.toString(16)}});
    continue;
   }
   charge('sourceOneCellMembershipTests');
   if(rank+1===N){
    stats.certifiedLastPlacementDraw++;
    results.push({column:c,value:0,reason:'FULL_BOARD_NONWINNING_DRAW',
      proof:{sourceRank:rank,boardCells:N}});
    continue;
   }
   const nextFrontier=[];
   for(const d of legal){
    const row=q.h[d]+(d===c?1:0);
    if(row<H)nextFrontier.push({column:d,cell:bit(d,row)});
   }
   const opponentInstant=[];
   for(const f of nextFrontier){
    charge('postPlacementFrontierCellScans');
    charge('sourceOneCellMembershipTests');
    if(enemyMasks.has(String(f.cell)))opponentInstant.push(f.column);
   }
   if(opponentInstant.length){
    stats.certifiedOpponentImmediateReplyWin++;
    results.push({column:c,value:loseVal,
      reason:'OPPONENT_HAS_FIRST_WIN_IMMEDIATELY_AFTER_THIS_LANDING',
      proof:{opponentPlayableWinningColumnWitnesses:opponentInstant,
        originalMoverLandingCell:'0x'+x.toString(16)}});
    continue;
   }
   const moverThreatColumns=[];
   for(const f of nextFrontier){
    charge('postPlacementFrontierCellScans');
    const y=f.cell;
    charge('sourceOneCellMembershipTests');
    const alreadySingleton=ownMasks.has(String(y));
    charge('sourceTwoCellMembershipTests');
    const newSingleton=ownMasks.has(String(x|y));
    if(alreadySingleton||newSingleton)moverThreatColumns.push(f.column);
   }
   if(moverThreatColumns.length>=2){
    stats.certifiedUnavoidableMoverDoubleThreat++;
    results.push({column:c,value:winVal,
      reason:'MOVER_TWO_DISTINCT_NEXT_TURN_SINGLETON_WINS',
      proof:{nowPlayablyThreatenedDistinctColumns:moverThreatColumns,
        opponentHasNoImmediateFirstWin:true,
        oneOpponentMoveCanBlockAtMostOneThreat:true}});
    continue;
   }
   if(own.length===0){
    let allKilled=true;
    for(const r of opponent){
     charge('sourceOpponentAllBlockedTests');
     if((r&x)===0n){allKilled=false;break;}
    }
    if(allKilled){
     stats.certifiedBothResidualFamiliesKilled++;
     results.push({column:c,value:0,
       reason:'AFTER_MOVER_BLOCKER_BOTH_OPEN_WINNING_FAMILIES_EMPTY',
       proof:{moverHadNoRemainingWinningRequirement:true,
         opponentAllRequirementsContainedOriginalLanding:true}});
     continue;
    }
   }
   stats.provisionalUnknownActions++;
   results.push({column:c,value:null,reason:'NO_EXACT_SOURCE_LOCAL_FINISHING_CERTIFICATE'});
  }
  let result;
  if(results.every(x=>x.value!==null)){
   const value=p===0?Math.max(...results.map(x=>x.value)):Math.min(...results.map(x=>x.value));
   result={status:'EXACT_ZERO_STRATEGIC_FANOUT_RESTRICTED_DOMAIN',
     proofKind:'SOURCE_FRONTIER_TWO_TURN_COMPLETE_ACTION_VECTOR',
     value,playerToMove:p,legalActionLabels:legal.slice(),
     bestMoves:results.filter(x=>x.value===value).map(x=>x.column),
     actionValues:results.map(x=>[x.column,x.value]),
     firstActionSourceProofs:results,
     zeroStrategicFanoutCertified:true,
     fullUnrestrictedWDLCertified:true,allTiedOptimalMovesCertified:true,
     universalBoardCoverageClaim:false};
  }else {
   // The old operator has only other source-local algebraic certificates,
   // not a child-game solver, and never evaluates alternative futures.
   const old=older.compute(q,{maxOperations:Math.max(1,maxOperations-stats.sourceBitsetOperations),
     maxMs:Math.max(1,maxMs-(Date.now()-start))});
   if(old.status==='EXACT_ZERO_STRATEGIC_FANOUT_RESTRICTED_DOMAIN'){
     result={...old,proofKind:'SOURCE_PAIRING_OR_PARITY_FALLBACK_'+old.proofKind,
       firstActionSourceProofs:results,
       sourceBaselineCertificate:old.structuralCertificate,
       alternativeStrategicFuturesEvaluated:0};
   }else {
     result={status:'INCOMPLETE',value:null,bestMoves:null,actionValues:null,
       playerToMove:p,legalActionLabels:legal,
       firstActionSourceProofs:results,
       exactCertifiedFirstActionValues:results.filter(x=>x.value!==null)
         .map(x=>[x.column,x.value]),
       unknownFirstActionLabels:results.filter(x=>x.value===null).map(x=>x.column),
       fullUnrestrictedWDLCertified:false,allTiedOptimalMovesCertified:false,
       zeroStrategicFanoutCertified:true,
       universalBoardCoverageClaim:false};
   }
  }
  result.statistics={...stats,sourceBaselineOperations:result.sourceBaselineCertificate?
      Math.max(0,(result.statistics?.sourceBitsetOperations??0)):0,
    elapsedMs:Date.now()-start};
  return result;
 }
 return Object.freeze({compute,width:W,height:H,connect:K});
}
