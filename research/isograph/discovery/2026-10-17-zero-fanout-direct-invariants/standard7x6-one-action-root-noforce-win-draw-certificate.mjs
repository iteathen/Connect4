// Exact ORIGINAL-q source two-certificate DRAW Level2 single move proof.
// Strong root: current mover cannot FORCE WIN. Strong action: mover can
// GUARANTEE NOT LOSING after first action. Therefore action is best DRAW.
// No strategic q successors / future game value queries; only original
// source cell masks, structured residuals and release-safe static pairs.
// Mathematical theorem frozen:
// docs/research/2026-10-17-source-root-win-exclusion-plus-one-action-draw-witness.md
import {createGlobalNoWinBound} from './global-no-win-bound.mjs';
import {createCoReleaseGlobalNoWinBound} from './co-release-global-no-win-bound.mjs';
import {createCoReleaseAfterFirstMoveNonlossBounds} from './co-release-after-first-move-nonloss-bounds.mjs';
export function createRootNoForceWinSingleDrawWitness(geometry){
 const {width:W,height:H,connect:K}=geometry,N=W*H;
 if(![W,H,K].every(Number.isInteger)||W<2||H<1||K<2||K>Math.min(W,H)||N>42)
  throw Error('unsupported original game geometry');
 const globalNoWin=createGlobalNoWinBound(geometry),
  coGlobal=createCoReleaseGlobalNoWinBound(geometry),
  postAction=createCoReleaseAfterFirstMoveNonlossBounds(geometry);
 function compute(q,{maxOperations=12000,maxMs=45,maxStaticPairings=1400}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
      q.h.some(v=>!Number.isInteger(v)||v<0||v>H)||
      !Array.isArray(q.R0)||!Array.isArray(q.R1))
   throw Error('source q expected');
  const rank=q.h.reduce((s,x)=>s+x,0),p=rank&1,legal=q.h.flatMap((v,c)=>v<H?[c]:[]);
  if(rank>=N||!legal.length)throw Error('nonterminal original source required');
  const stats={originalSourceRootScans:1,staticGlobalPairingWork:0,
   coReleaseGlobalOriginalProofWork:0,staticPostActionPairProofWork:0,
   originalLiteralActionsConsideredForNoLoss:0,
   sourceGameFutureQStatesCreated:0,sourceGameFutureValuesQueried:0,
   sourceStrategyTreesOrBQBFConstructed:0,
   maxStrategicGameSemanticFanout:0,sourceProofTimeBudgetIncomplete:0};
  const own=p===0?q.R0:q.R1;
  let rootSource=null,rootInterval=null;
  if(own.length===0){
   rootSource={kind:'ROOT_MOVER_NO_ORIGINAL_SURVIVING_K_LINE',proof:'No possible mover win at ANY future original first terminal; root p cannot force win'};
   rootInterval=p===0?[-1,0]:[0,1];
  }else{
   try{
    const first=globalNoWin.compute(q,{maxOperations,maxMs});
    stats.staticGlobalPairingWork=first.statistics.originalSourceWorkUnits;
    const bound=first.fullGameRootInterval;
    if((p===0&&bound[1]<=0)||(p===1&&bound[0]>=0)){
     rootInterval=bound;
     rootSource={kind:'GLOBAL_ORIGINAL_SOURCE_NO_FORCED_MOVER_WIN',
      proof:first.sourceProvenGlobalObstructions};
    }
   }catch(e){stats.sourceProofTimeBudgetIncomplete++;}
   if(!rootSource){
    try{
     const c=coGlobal.compute(q,{maxOperations,maxMs});
     stats.coReleaseGlobalOriginalProofWork=c.statistics.sourceProofOperations;
     if(c.fullFutureAttackerCanNeverWinCertified){
      rootSource={kind:'GLOBAL_CO_RELEASE_PAIR_ATTACKER_FIRST_NO_MOVER_FORCED_WIN',
       proof:c.originalSourcePairCertificate};
      rootInterval=p===0?[-1,0]:[0,1];
     }
    }catch(e){stats.sourceProofTimeBudgetIncomplete++;}
   }
  }
  if(!rootSource)return {status:'INCOMPLETE',reason:'ROOT_NO_FORCED_WIN_NOT_CERTIFIED',
   rootNoForcedWinProved:false,selectedOriginalLiteralColumn:null,statistics:stats};
  // Source purely symbolic first-action pair/capacity checks; no
  // alternate q or WDL is constructed. All source predeclared static
  // pairing alternatives must be counted as structural certificate work.
  let per;
  try{per=postAction.compute(q,{maxOperations,maxMs,maxStaticPairings});
  }catch(e){stats.sourceProofTimeBudgetIncomplete++;
   return {status:'INCOMPLETE',reason:'POST_ACTION_NONLOSS_PAIR_CERTIFICATE_BUDGET',
    rootNoForcedWinProved:true,rootSourceProof:rootSource,statistics:stats};}
  stats.staticPostActionPairProofWork=per.statistics?.sourceOperations??0;
  if(per.status!=='COMPLETE_SOURCE_ACTION_WDL_BOUNDS')
   return {status:'INCOMPLETE',reason:'POST_ACTION_STATIC_PAIR_SOURCE_INCOMPLETE',
    rootNoForcedWinProved:true,rootSourceProof:rootSource,statistics:stats};
  stats.originalLiteralActionsConsideredForNoLoss=per.firstActionValueIntervals.length;
  for(const x of per.firstActionValueIntervals){
   if(!legal.includes(x.literalColumn))throw Error('source interval unknown literal action');
   if((p===0&&x.lower>=0)||(p===1&&x.upper<=0)){
    const reason=per.sourceCertificates.find(z=>z.literalColumn===x.literalColumn);
    return {status:'VALID_CONTINUATION',
     kind:'ROOT_NO_FORCED_WIN_PLUS_FIRST_ACTION_NO_FORCED_LOSS_PROVES_DRAW',
     mover:p,selectedOriginalLiteralColumn:x.literalColumn+1,
     exactRootOutcomeP0Relative:0,
     exactChosenFirstActionOutcomeP0Relative:0,
     rootNoForcedWinProved:true,
     exactRootIntervalSource:rootInterval,
     rootSourceProof:rootSource,
     chosenActionNonLossSourceProof:reason,
     chosenActionOriginalP0RelativeSourceInterval:[x.lower,x.upper],
     fullLevel2SetClaimed:false,
     independentlyValuedAlternativeFutureGames:0,statistics:stats};
   }
  }
  return {status:'INCOMPLETE',
    reason:'ROOT_CANNOT_FORCE_WIN_BUT_NO_PROVEN_DRAW_PRESERVING_FIRST_ACTION',
    rootNoForcedWinProved:true,rootSourceProof:rootSource,
    selectedOriginalLiteralColumn:null,statistics:stats};
 }
 return Object.freeze({compute,width:W,height:H,connect:K});
}
