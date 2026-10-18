// One-source ORIGINAL q fractional packing inevitable opponent first win.
// Returns any one original literal legal action as certified Level2 best,
// because all legal alternatives necessarily lose (no WDL future queries).
// Mathematical proof: docs/research/2026-10-17-source-inevitable-loss-dual-packing-any-L2-move.md
import {createSourceFractionalTransversal} from './standard7x6-source-fractional-transversal.mjs';
export function createOriginalSourceInevitableLossBest({width:W,height:H,connect:K}){
 const core=createSourceFractionalTransversal({width:W,height:H,connect:K}),N=W*H;
 function compute(q,{denominators=[1,2,3,4,6,8,12]}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
     q.h.some(h=>!Number.isInteger(h)||h<0||h>H)||
     !Array.isArray(q.R0)||!Array.isArray(q.R1))
   throw Error('requires original nonterminal q');
  const n=q.h.reduce((a,v)=>a+v,0),p=n&1,o=1-p,
   legal=q.h.flatMap((v,c)=>v<H?[c]:[]);
  if(n>=N||!legal.length)throw Error('not first-win-stopped nonterminal');
  const own=p===0?q.R0:q.R1,other=p===0?q.R1:q.R0,
   stat={originalLiteralLegalColumns:legal.length,
    originalWinGeneratorsCurrentMover:own.length,
    originalWinGeneratorsOpposite:other.length,
    staticOriginalFractionalPackingWitnessAttempts:0,
    staticPerCellPackingLoadChecks:0,
    independentFutureGameValueEvaluations:0,
    sourceAlternativeStrategicGameQConstructed:0,
    sourceGameStrategicFanout:0};
  if(own.length) return {status:'INCOMPLETE',
   reason:'CURRENT_MOVER_STILL_HAS_ORIGINAL_VIABLE_WIN_REQUIREMENTS',
   rootValueClaimed:false,statistics:stat};
  const packing=core.prove({h:q.h,R:[q.R0,q.R1]},o,{denominators});
  stat.staticOriginalFractionalPackingWitnessAttempts=packing.statistics.attemptedStaticWeightVectors;
  stat.staticPerCellPackingLoadChecks=packing.statistics.witnessCellIncidenceChecks;
  if(packing.status!=='CERTIFIED_ATTACKER_EVENTUAL_FIRST_WIN_IF_OPPONENT_CANNOT_WIN')
   return {status:'INCOMPLETE',reason:'NO_OPPONENT_FRACTIONAL_OVERLOAD_CERTIFICATE',
    rootValueClaimed:false,sourcePackingAttempt:packing,statistics:stat};
  const totalCurrentMoverTurns=Math.ceil((N-n)/2);
  const D=packing.witness.denominator,sum=packing.witness.sumNumerator;
  if(packing.opponent!==p||packing.attacker!==o||
     packing.opponentTotalTurns!==totalCurrentMoverTurns||
     sum<=D*totalCurrentMoverTurns)
   throw Error('packing theorem wrongly interpreted owner parity');
  return {status:'VALID_CONTINUATION',kind:'INEVITABLE_MOVER_LOSS_ANY_LITERAL_ACTION_BEST',
   exactRootP0RelativeWDL:o===0?1:-1,
   selectedOriginalLiteralColumn:legal[0]+1,
   allOriginalLiteralLegalBestMoves:legal.map(c=>c+1),
   fullLevel2SetCertified:true,
   guaranteedFirstWinningPlayer:o,
   originalCurrentMoverCannotWinProof:'No current mover original residual K-winning generators survive',
   opponentHypergraphExcessProof:packing.witness,
   moverTurnsAvailableUntilFullBoard:totalCurrentMoverTurns,
   firstWinBeforeNonwinningDrawGuard:true,
   opponentWinsAgainstEveryFutureMoveSequence:true,
   sourceStrategicFutureValueQueries:0,
   statistics:stat};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}
