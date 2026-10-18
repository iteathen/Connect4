// FROZEN BEFORE RUN independent FIRST-WIN-STOPPED actual standard7x6
// PHYSICAL check of the unified original q ONE best Level2 source output.
// Full physical recursive WDL is independent POST-source validation, only
// on certified positions with limited remaining gravity support.
// Source constructor has no physical/recursive minimax/solved-policy inputs.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createUnifiedOneValidBestActionSource} from './standard7x6-unified-one-valid-best-action-source.mjs';
import {createSingleForcedThreatLadder} from './standard7x6-source-single-forced-threat-ladder.mjs';
import {createSourceGravityResponseCover} from './standard7x6-source-gravity-response-cover.mjs';
import {createRootNoForceWinSingleDrawWitness} from './standard7x6-one-action-root-noforce-win-draw-certificate.mjs';
import {createOriginalSourceInevitableLossBest} from './standard7x6-inevitable-loss-source-dual-packing.mjs';
import {createPairDefenseDualOverloadLoss} from './standard7x6-pair-defense-plus-dual-overload-source.mjs';
import {createGlobalNoWinBound} from './global-no-win-bound.mjs';
import {createCoReleaseGlobalNoWinBound} from './co-release-global-no-win-bound.mjs';
import {createCoReleaseAfterFirstMoveNonlossBounds} from './co-release-after-first-move-nonloss-bounds.mjs';
import {createCoReleasePairBlockProof} from './co-release-pair-block-proof.mjs';
import {createSourceFractionalTransversal} from './standard7x6-source-fractional-transversal.mjs';
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),
 geometry={width:W,height:H,connect:K},
 core=createExactQCore(geometry),source=createUnifiedOneValidBestActionSource(geometry);
const byCell=Array.from({length:N},()=>[]);let originalWinlines=0;
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  if(c+(K-1)*dc>=W||r+(K-1)*dr<0||r+(K-1)*dr>=H)continue;
  let mask=0n,ids=[];
  for(let i=0;i<K;i++){const id=(r+i*dr)*W+c+i*dc;ids.push(id);mask|=bit(c+i*dc,r+i*dr);}
  for(const id of ids)byCell[id].push(mask);originalWinlines++;
 }
if(originalWinlines!==69||core.lineCount!==69)throw Error('incorrect actual original7x6 K-lines');
const fresh=()=>({h:Array(W).fill(0),P:[0n,0n],n:0,history:'',result:null});
const legal=q=>q.h.flatMap((height,c)=>height<H?[c]:[]);
function play(q,c){
 if(q.result!==null||c<0||c>=W||q.h[c]>=H)throw Error('original physical first-win/gravity move illegal');
 const p=q.n&1,row=q.h[c],id=row*W+c,h=q.h.slice(),P=q.P.slice();P[p]|=bit(c,row);h[c]++;
 const win=byCell[id].some(m=>(P[p]&m)===m);
 return {h,P,n:q.n+1,history:q.history+String(c+1),
  result:win?(p===0?1:-1):q.n+1===N?0:null};
}
let seed=0x13D4726F>>>0;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
const memo=new Map();const stats={
 schema:'connect4.standard7x6.unified_source_one_valid_Level2_best_action_v0_1',
 date:'2026-10-17',W,H,K,originalWinlines,
 frozenSeed:seed,
 actualFirstWinStoppedGenuineRootsVisited:0,
 sourceOriginalRanksEvaluated:0,
 distinctPhysicalInputs:0,
 frozenHistoryWitnesses:[],
 randomPhysicalNonwinningHistories:0,
 certifiedSourceBestOriginalActionsTotal:0,
 certifiedWin:0,certifiedDraw:0,certifiedLoss:0,
 directBoundaryWin:0,forcedLadderWin:0,forcedLadderMaxDepth:0,
 extinctMOverLoss:0,nonextinctPairDualLoss:0,
 unknownOrSourceBudget:0,
 sourceStaticLiteralMoveScanWork:0,
 sourceSelectedForcedFutureQStates:0,
 sourceStrategicallyValuedOtherGameFutures:0,
 sourceMaximumStrategicFutureLaneFanout:0,
 sourceStaticRootDrawPairingWork:0,
 sourceStaticOpponentDualCandidateWork:0,
 originalRootScenariosWithMultipleLegalMovesCertified:0,
 independentOriginalPhysicalFullWDLRootChecks:0,
 independentOriginalPhysicalSelectedActionWDLChecks:0,
 independentOriginalPhysicalEveryBestLossActionWDLChecks:0,
 independentRecursiveCalls:0,independentRecursiveUniqueStates:0,
 sourceFalseSelectedWinningAction:0,
 sourceFalseSelectedDrawingAction:0,
 sourceFalseSelectedLosingAction:0,
 sourceFirstWinOrGravityViolation:0,
 sourceOutcomeProofContradiction:0,
 byPly:{},frozenExamplesByTier:{WIN:[],DRAW:[],LOSS:[]},finalSeed:null
};
function key(q){return q.P[0].toString(16)+'|'+q.P[1].toString(16);}
function value(q){
 stats.independentRecursiveCalls++;
 if(q.result!==null)return q.result;
 const k=key(q);if(memo.has(k))return memo.get(k);
 stats.independentRecursiveUniqueStates++;
 let val=q.n%2===0?-1:1;
 for(const c of legal(q)){
  const y=value(play(q,c));
  val=q.n%2===0?Math.max(val,y):Math.min(val,y);
 }
 memo.set(k,val);return val;
}
const seen=new Set();
function inspect(q,frozen=false){
 if(q.result!==null||q.n===N)throw Error('source input not nonterminal actual history');
 const k=key(q);if(seen.has(k))return;seen.add(k);stats.actualFirstWinStoppedGenuineRootsVisited++;
 if(!frozen&&q.n<27)return;
 const sourceQ=core.fromPhysical({h:q.h,p0:q.P[0],p1:q.P[1]});
 const z=source.compute(sourceQ);
 stats.sourceOriginalRanksEvaluated++;
 const slot=stats.byPly[q.n]??(stats.byPly[q.n]={tested:0,certified:0,win:0,draw:0,loss:0});
 slot.tested++;
 stats.sourceStaticLiteralMoveScanWork+=z.statistics?.sourceWinStaticMoveScans??0;
 stats.sourceSelectedForcedFutureQStates+=z.statistics?.sourceWinLadderConstructedQCount??0;
 stats.sourceStaticRootDrawPairingWork+=z.statistics?.originalSourceDrawStaticPairingOps??0;
 stats.sourceStaticOpponentDualCandidateWork+=z.statistics?.originalSourceLossDualWeightAttempts??0;
 stats.sourceMaximumStrategicFutureLaneFanout=Math.max(
   stats.sourceMaximumStrategicFutureLaneFanout,z.statistics?.sourceGameStrategicFanoutMax??0);
 if(frozen)stats.frozenHistoryWitnesses.push({history:q.history,ply:q.n,
  sourceStatus:z.status,certifiedOutcome:z.bestOutcomeTier,selectedAction:z.selectedOriginalLiteralColumn,proof:z.proofKind});
 if(z.status!=='VALID_CONTINUATION'){stats.unknownOrSourceBudget++;return;}
 const a=z.selectedOriginalLiteralColumn-1,p=q.n&1,
  expected=z.bestOutcomeTier==='WIN'?(p===0?1:-1):z.bestOutcomeTier==='LOSS'?(p===0?-1:1):0;
 if(z.ordinaryRootValueP0Relative!==expected||a<0||q.h[a]>=H)throw Error('source outcome/selected original legal literal incorrect');
 stats.certifiedSourceBestOriginalActionsTotal++;
 stats[z.bestOutcomeTier==='WIN'?'certifiedWin':z.bestOutcomeTier==='DRAW'?'certifiedDraw':'certifiedLoss']++;
 slot.certified++;slot[z.bestOutcomeTier.toLowerCase()]++;
 if(legal(q).length>1)stats.originalRootScenariosWithMultipleLegalMovesCertified++;
 if(z.proofKind==='ONE_FORCED_LANE_TO_GRAVITY_RESPONSE_COVER'){
  if(z.sourceProof.proofSteps?.length>1)stats.forcedLadderWin++;
  else stats.directBoundaryWin++;
  stats.forcedLadderMaxDepth=Math.max(stats.forcedLadderMaxDepth,z.sourceProof.proofSteps.length-1);
 }else if(z.proofKind==='EXTINCT_OWN_WINLINES_OPPONENT_DUAL_FORCE_LOSS')stats.extinctMOverLoss++;
 else if(z.proofKind==='LIVE_OWN_WINLINES_DEFENDER_SAFE_PAIRING_PLUS_DUAL_FORCE_LOSS')stats.nonextinctPairDualLoss++;
 if(stats.frozenExamplesByTier[z.bestOutcomeTier].length<12)
  stats.frozenExamplesByTier[z.bestOutcomeTier].push({history:q.history,rank:q.n,owner:p,
   selectedAction:a+1,proof:z.proofKind,
   ordinaryRootValueP0Relative:expected,
   otherEquallyBestLabelsUnknown:!z.completeLevel2SetKnown,
   sourceForcedReplyRounds:z.statistics.sourceLadderProofDepth});
 if(q.n>=35&&stats.independentOriginalPhysicalFullWDLRootChecks<200){
  const rootValue=value(q);
  stats.independentOriginalPhysicalFullWDLRootChecks++;
  if(rootValue!==expected){
   stats.sourceOutcomeProofContradiction++;
   throw Error('actual physical independent perfect root WDL contradicts source');
  }
  const childV=value(play(q,a));
  stats.independentOriginalPhysicalSelectedActionWDLChecks++;
  if(childV!==expected){
   stats['sourceFalseSelected'+(z.bestOutcomeTier==='WIN'?'Winning':z.bestOutcomeTier==='DRAW'?'Drawing':'Losing')+'Action']++;
   throw Error('actual physical selected action WDL contradicts source');
  }
  if(z.bestOutcomeTier==='LOSS'){
   if(!z.completeLevel2SetKnown||
     z.allBestOriginalLiteralLabels.join(',')!==legal(q).map(x=>x+1).join(','))
    throw Error('source LOSS root claimed without all tied original labels');
   for(const c of legal(q)){
    stats.independentOriginalPhysicalEveryBestLossActionWDLChecks++;
    if(value(play(q,c))!==expected)throw Error('false source full loss all action tie');
   }
  }
 }
}
const frozen=[
 '','4','44444','444444','444441','4444442',
 '243766762437135',
 '15551624162264264226443165545177173',
 '14134251643437345353422222717671666517',
 '46525656251511547372472721217733633364',
 '7654253275136145236326217611177672'
];
for(const history of frozen){
 let q=fresh();for(const c of history)q=play(q,Number(c)-1);
 if(q.result!==null)throw Error('frozen witness already ended');
 inspect(q,true);
}
for(let game=0;game<1150;game++){
 stats.randomPhysicalNonwinningHistories++;
 let q=fresh();
 while(q.result===null&&q.n<N){
  inspect(q);
  const options=legal(q).map(c=>play(q,c)).filter(z=>z.result===null);
  if(!options.length)break;
  q=options[rand()%options.length];
 }
}
stats.distinctPhysicalInputs=seen.size;stats.finalSeed=seed;
console.log(JSON.stringify(stats,null,2));
