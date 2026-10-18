// FROZEN BEFORE RUN: on SAME 2700 actual 7x6 physical q as first-touch
// policy validation, combine new source no-win with opponent dual
// eventual FIRST-WIN or ONE robust first-action nonloss to certify
// a Level2 best DRAW/LOSS. Compare prior immutable V4 source only
// AFTER new SOURCE qualification, then independently PHYSICAL minimax.
import {createSourceFirstTouchBestDrawOrLoss} from './standard7x6-source-first-touch-best-draw-loss.mjs';
import {createUnifiedOneValidBestActionSourceV4} from './standard7x6-unified-one-valid-best-action-source-v4.mjs';
// FROZEN BEFORE FIRST REAL 7x6 RUN.
// Original first-win-stopped gravity PHYSICAL control of ONE source-q
// adaptive non-pairing first-touch gate response map x -> y(x).
// If SOURCE positive, independently vary attacker legal actions; o
// uses static directed source policy, NEVER strategic WDL evaluation.
// Separate physical perfect-play minimax only on scoped late roots.
// No oracle/game successor in PURE source producer.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createSourceFirstTouchGateBlockerNoWin} from './standard7x6-source-first-touch-gate-blocker-no-win.mjs';
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),
  geometry={width:W,height:H,connect:K},
  qcore=createExactQCore(geometry),
  source=createSourceFirstTouchGateBlockerNoWin(geometry),
  outcomeSource=createSourceFirstTouchBestDrawOrLoss(geometry),
  oldV4=createUnifiedOneValidBestActionSourceV4(geometry);
const winlinesByCell=Array.from({length:N},()=>[]);
let originalWinlines=0;
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  if(c+(K-1)*dx>=W||r+(K-1)*dy<0||r+(K-1)*dy>=H)continue;
  let mask=0n,ids=[];
  for(let j=0;j<K;j++){
   const id=(r+j*dy)*W+c+j*dx;ids.push(id);mask|=bit(c+j*dx,r+j*dy);
  }
  for(const id of ids)winlinesByCell[id].push(mask);
  originalWinlines++;
 }
if(originalWinlines!==69||qcore.lineCount!==69)
  throw Error('invalid ORIGINAL standard7x6 geometric first winlines');
const blank=()=>({h:Array(W).fill(0),P:[0n,0n],n:0,hist:'',terminal:null});
const legal=q=>q.h.flatMap((h,c)=>h<H?[c]:[]);
function play(q,c){
 if(q.terminal!==null||c<0||c>=W||q.h[c]>=H)
  throw Error('physical source first-win-stopped illegality');
 const p=q.n&1,r=q.h[c],id=r*W+c,h=q.h.slice(),P=q.P.slice();
 h[c]++;P[p]|=bit(c,r);
 const won=winlinesByCell[id].some(G=>(G&P[p])===G);
 return {h,P,n:q.n+1,hist:q.hist+String(c+1),
  terminal:won?(p===0?1:-1):q.n+1===N?0:null};
}
const stats={
 schema:'connect4.standard7x6.source_first_touch_directed_blocker_physical_v0_1',
 testDate:'2026-10-18',board:{W,H,K,originalWinlines:69},
 seed:0x118F426C,physicalNonwinningHistories:0,
 realPhysicalNonterminalSourcesSeen:0,
 realSourceQChecked:0,realSourceQOwnerLiveGensNonempty:0,
 sourceGuardSuccessfulRoots:0,sourceGuardFailedRoots:0,
 sourceWithAtLeastTwoCurrentLegalMoves:0,
 sourceDirectedRepeatedBlockerTargets:0,
 sourceVerticalSuccessorResponseMaps:0,
 sourceOriginalFrontierResponseMaps:0,
 originalPhysicalAttackerChoicesTested:0,
 physicalAdversarialPChoicesDFSNodes:0,
 completeAdversarialPPolicyDFSRoots:0,
 boundedSourcePhysicalDFSRoots:0,
 physicalDefenderSuccessfulReplies:0,
 physicallyPlayedVerticalSuccessorReplies:0,
 physicallyPlayedFrontierReplies:0,
 physicallyChosenIdleDefenderReplies:0,
 physicalOwnerWinDetectedAfterSourceProof:0,
 physicalIllegalDefenderReplyDetected:0,
 physicalOriginalGateTouchNotCoveredBySourceMap:0,
 independentFullPhysicalMinimaxRootChecks:0,
 independentPhysicalMinimaxStates:0,
 independentPhysicalMinimaxCalls:0,
 physicallyWrongNoForceWinRoot:0,
 sourceNoGameWDLQueries:0,
 canonical:[],positiveExamples:[],firstNonpairingDirectedPolicy:null,
 firstPhysicalFalsifier:null,finalSeed:null
};
let seed=stats.seed>>>0;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
const refMemo=new Map();
const value=q=>{
 stats.independentPhysicalMinimaxCalls++;
 if(q.terminal!==null)return q.terminal;
 const k=q.P[0].toString(16)+'|'+q.P[1].toString(16);
 if(refMemo.has(k))return refMemo.get(k);
 stats.independentPhysicalMinimaxStates++;
 let v=q.n%2===0?-1:1;
 for(const c of legal(q)){
  const a=value(play(q,c));v=q.n%2===0?Math.max(v,a):Math.min(v,a);
 }
 refMemo.set(k,v);return v;
};
const marginal={
 schema:'connect4.true7x6.first_touch_no_force_win_plus_one_best_DRAW_LOSS_vs_V4_v0_1',
 firstTouchSourceNoWinPositiveRoots:0,
 newOutcomeSourceBestActionRoots:0,newSourceBestDraw:0,newSourceBestLoss:0,
 newSourceBestFromVerifiedPartialPrefix:0,
 oldV4AlreadyCertifiesBestRoot:0,
 oldV4PreviouslyINCOMPLETEnewSourceBestRoot:0,
 v4VerifiedWIN:0,v4VerifiedDRAW:0,v4VerifiedLOSS:0,
 v4ScalarUnknownRoot:0,
 independentPhysicalRootWDLChecks:0,
 independentPhysicalSelectedMoveWDLChecks:0,
 independentPhysicalAllLossMoveWDLChecks:0,
 independentlyPhysicallyWrongRootOrSelectedMove:0,
 contradictionsToOldV4WDL:0,
 newSourceExamplesOverV4:[],
 firstDrawBestWitness:null,firstLossBestWitness:null
};
const seen=new Set();
function physicallyReplaySourcePolicy(root,sourceQ,proof,firstActions,exhaustive){
 const p=root.n&1,o=1-p,owner=p===0?sourceQ.R0:sourceQ.R1;
 const map=new Map(proof.gravitySafeSourceFirstTouchResponsePolicy.map(x=>
   [x.attackedPhysicalCellID,x]));
 const rootP=root.P[p],rootO=root.P[o],memo=new Set();
 const pFirstWin=p===0?1:-1;
 let exhausted=false,nodes=0;
 function dfs(q,first){
  nodes++;stats.physicalAdversarialPChoicesDFSNodes++;
  if(exhaustive&&nodes>14000){exhausted=true;return;}
  if(q.terminal!==null){
   if(q.terminal===pFirstWin)throw Error('source failed physical invariant: p FIRST WON!');
   return;
  }
  if(q.n%2!==p)throw Error('policy DFS not at current mover turn');
  const key=q.P[0].toString(16)+'|'+q.P[1].toString(16);
  if(memo.has(key))return;memo.add(key);
  const options=first===null?legal(q):[first];
  for(const c of options){
   if(!legal(q).includes(c))throw Error('illegal frozen first action');
   if(first!==null)stats.originalPhysicalAttackerChoicesTested++;
   const x=q.h[c]*W+c,preFutureO=q.P[o]&~rootO;
   const live=owner.filter(G=>(G&preFutureO)===0n);
   const preFutureP=q.P[p]&~rootP;
   if(live.some(G=>(G&preFutureP)!==0n))
    throw Error('source policy violated original active-generator untouched invariant BEFORE attacker move');
   const touched=live.filter(G=>(G&(1n<<BigInt(x)))!==0n);
   const afterP=play(q,c);
   if(afterP.terminal===pFirstWin){
    stats.physicalOwnerWinDetectedAfterSourceProof++;
    throw Error('source gated first touch protection contradicted physical first-win');
   }
   if(afterP.terminal!==null)continue;
   let defenderColumn=null;
   if(touched.length){
    const original=map.get(x);
    if(!original){
     stats.physicalOriginalGateTouchNotCoveredBySourceMap++;
     throw Error('physical attacker touched live original G at non-source gate x');
    }
    const y=original.safeDefenderPhysicalCellID,cy=y%W,ry=Math.floor(y/W);
    if(touched.some(G=>(G&(1n<<BigInt(y)))===0n))
     throw Error('source first touch response missing one live attacked G');
    if(afterP.h[cy]!==ry){
     stats.physicalIllegalDefenderReplyDetected++;
     stats.firstPhysicalFalsifier={root:root.hist,current:afterP.hist,x,y,
       frontierActual:afterP.h[cy],replyRow:ry,proof:original};
     throw Error('source fixed response is ILLEGAL at this original physical gravity frontier');
    }
    defenderColumn=cy;
    if(original.sourceResponseKind==='VERTICAL_SUCCESSOR')
     stats.physicallyPlayedVerticalSuccessorReplies++;
    else stats.physicallyPlayedFrontierReplies++;
   }else {
    const all=legal(afterP);
    if(!all.length)throw Error('nonterminal after attacker with zero opponent moves');
    defenderColumn=all[0];
    stats.physicallyChosenIdleDefenderReplies++;
   }
   const afterO=play(afterP,defenderColumn);
   stats.physicalDefenderSuccessfulReplies++;
   if(afterO.terminal===pFirstWin)throw Error('defender move created opponent P first win impossible');
   if(afterO.terminal===null){
    const afterFutureO=afterO.P[o]&~rootO;
    const afterFutureP=afterO.P[p]&~rootP;
    if(owner.some(G=>(G&afterFutureO)===0n&&(G&afterFutureP)!==0n))
     throw Error('source first touch invariant not restored after response');
    if(exhaustive)dfs(afterO,null);
    else {
     // One deterministic continuation lane of P alternatives only,
     // with three root-action samples separately initialized below.
     const options2=legal(afterO);
     if(options2.length)dfs(afterO,options2[(rand()%options2.length)]);
    }
   }
   if(exhausted)return;
  }
 }
 for(const c of firstActions){dfs(root,c);if(exhausted)break;}
 if(exhausted)stats.boundedSourcePhysicalDFSRoots++;
 else if(exhaustive)stats.completeAdversarialPPolicyDFSRoots++;
}
function inspect(q,canonical=false){
 if(q.terminal!==null||q.n===N)throw Error('source input must physical nonterminal');
 const id=q.P[0].toString(16)+'|'+q.P[1].toString(16);
 if(seen.has(id))return;seen.add(id);
 stats.realPhysicalNonterminalSourcesSeen++;
 if(!canonical&&q.n<20)return;
 const originalQ=qcore.fromPhysical({h:q.h,p0:q.P[0],p1:q.P[1]});
 const own=(q.n&1)===0?originalQ.R0:originalQ.R1;
 if(own.length)stats.realSourceQOwnerLiveGensNonempty++;
 const proof=source.compute(originalQ);
 stats.realSourceQChecked++;
 if(canonical)stats.canonical.push({history:q.hist,ply:q.n,
  status:proof.status,reason:proof.reason,sourceGateStats:proof.statistics});
 if(proof.status!=='CERTIFIED_CURRENT_MOVER_CANNOT_FORCE_WIN'){stats.sourceGuardFailedRoots++;return;}
 if(!own.length)throw Error('new source guard claimed with no owner live R');
 stats.sourceGuardSuccessfulRoots++;

 marginal.firstTouchSourceNoWinPositiveRoots++;
 const candidate=outcomeSource.compute(originalQ);
 if(candidate.status==='VALID_CONTINUATION'){
  marginal.newOutcomeSourceBestActionRoots++;
  if(candidate.sourceBestOutcomeTier==='DRAW'){
   marginal.newSourceBestDraw++;
   if(candidate.selectedActionVerifiedInPartialPrefix)
    marginal.newSourceBestFromVerifiedPartialPrefix++;
   if(!marginal.firstDrawBestWitness)
    marginal.firstDrawBestWitness={history:q.hist,ply:q.n,
     mover:q.n&1,literalAction:candidate.selectedOriginalLiteralColumn,
     oldRootSourceKind:proof.kind,firstActionInterval:candidate.sourceFirstActionVerifiedP0RelativeInterval,
     sourceVerificationWasPartialPrefix:!!candidate.selectedActionVerifiedInPartialPrefix};
  }else if(candidate.sourceBestOutcomeTier==='LOSS'){
   marginal.newSourceBestLoss++;
   if(!marginal.firstLossBestWitness)
    marginal.firstLossBestWitness={history:q.hist,ply:q.n,
     mover:q.n&1,allLiteralActionLabels:candidate.allBestOriginalLiteralLabels,
     opponentDual:candidate.sourceOpponentFirstWinDualWitness};
  }else throw Error('new source no-win theorem cannot emit WIN tier');
  const old=oldV4.compute(originalQ);
  if(old.status==='VALID_CONTINUATION'){
   marginal.oldV4AlreadyCertifiesBestRoot++;
   if(old.ordinaryRootValueP0Relative!==null){
    marginal['v4Verified'+old.bestOutcomeTier]++;
    if(old.ordinaryRootValueP0Relative!==candidate.ordinaryRootP0RelativeWDL){
     marginal.contradictionsToOldV4WDL++;
     throw Error('original V4 scalar exact WDL disagrees new source tier');
    }
   }else marginal.v4ScalarUnknownRoot++;
  }else{
   marginal.oldV4PreviouslyINCOMPLETEnewSourceBestRoot++;
   if(marginal.newSourceExamplesOverV4.length<15)
    marginal.newSourceExamplesOverV4.push({
     history:q.hist,ply:q.n,mover:q.n&1,
     newBest:candidate.selectedOriginalLiteralColumn,
     newBestTier:candidate.sourceBestOutcomeTier,
     oldV4Status:old.status,
     sharedOriginalResponseTargets:proof.statistics.sourceProducedSharedDirectedResponseTargets});
  }
  if(q.n>=35&&marginal.independentPhysicalRootWDLChecks<180){
   const expected=candidate.ordinaryRootP0RelativeWDL,
     a=candidate.selectedOriginalLiteralColumn-1;
   const exact=value(q);marginal.independentPhysicalRootWDLChecks++;
   if(exact!==expected){
    marginal.independentlyPhysicallyWrongRootOrSelectedMove++;
    throw Error('independent full original physical root WDL contradicts new source');
   }
   if(value(play(q,a))!==expected){
    marginal.independentlyPhysicallyWrongRootOrSelectedMove++;
    throw Error('new source-selected Level2 best literal action not physical WDL best');
   }
   marginal.independentPhysicalSelectedMoveWDLChecks++;
   if(candidate.sourceBestOutcomeTier==='LOSS'){
    for(const b of legal(q)){
     marginal.independentPhysicalAllLossMoveWDLChecks++;
     if(value(play(q,b))!==expected){
      marginal.independentlyPhysicallyWrongRootOrSelectedMove++;
      throw Error('source all current legal actions LOSS claim contradicted physical WDL');
     }
    }
   }
  }
 }
 if(legal(q).length>=2)stats.sourceWithAtLeastTwoCurrentLegalMoves++;
 stats.sourceDirectedRepeatedBlockerTargets+=
  proof.statistics.sourceProducedSharedDirectedResponseTargets;
 stats.sourceVerticalSuccessorResponseMaps+=proof.statistics.gateCellsOnlyWithVerticalSuccessor;
 stats.sourceOriginalFrontierResponseMaps+=proof.statistics.gateCellsOnlyWithOriginalRootFrontier;
 if(proof.statistics.sourceProducedSharedDirectedResponseTargets&&!stats.firstNonpairingDirectedPolicy)
  stats.firstNonpairingDirectedPolicy={history:q.hist,ply:q.n,
   responseMap:proof.gravitySafeSourceFirstTouchResponsePolicy};
 if(stats.positiveExamples.length<12)stats.positiveExamples.push({
  history:q.hist,ply:q.n,p:q.n&1,legal:legal(q).map(x=>x+1),
  originalOwnerResiduals:own.length,
  sourceGateCellCount:proof.statistics.sourceGateCellsWithRequirements,
  sourceSharedDirectedBlockerTargets:proof.statistics.sourceProducedSharedDirectedResponseTargets,
  originalResponsePlan:proof.gravitySafeSourceFirstTouchResponsePolicy
 });
 const firstOptions=legal(q),exhaustive=q.n>=30;
 physicallyReplaySourcePolicy(q,originalQ,proof,exhaustive?firstOptions:
  firstOptions.slice(0,Math.min(firstOptions.length,3)),exhaustive);
 if(q.n>=35&&stats.independentFullPhysicalMinimaxRootChecks<90){
  stats.independentFullPhysicalMinimaxRootChecks++;
  const ordinary=value(q),currentWin=(q.n&1)===0?1:-1;
  if(ordinary===currentWin){
   stats.physicallyWrongNoForceWinRoot++;
   throw Error('source no-force-win claim WRONG under independent physical minimax');
  }
 }
}
for(const history of ['','4','44444','444444','444441','4444442']){
 let q=blank();for(const c of history)q=play(q,Number(c)-1);
 if(q.terminal!==null)throw Error('canonical firstwin stopped proof fixture terminated');
 inspect(q,true);
}
for(let game=0;game<2700;game++){
 stats.physicalNonwinningHistories++;
 let q=blank();
 while(q.terminal===null){
  inspect(q);
  const options=legal(q).map(c=>play(q,c)).filter(z=>z.terminal===null);
  if(!options.length)break;
  q=options[rand()%options.length];
 }
}
stats.finalSeed=seed;
stats.marginalOutcomeSelection=marginal;
console.log(JSON.stringify(stats,null,2));
