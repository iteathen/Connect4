// FROZEN BEFORE independent physical control of new odd source DRAW/LOSS
// two-certificate completion; preserves earlier separately validated safe
// preemption response original physical control and adds late WDL check.
import {createOddSafePairBestDrawOrLoss} from './standard7x6-odd-safe-pair-best-draw-or-loss-source.mjs';
// INDEPENDENT actual7x6 first-win-stopped physical policy falsifier for
// ODD one original singleton-last-cell U plus all other co-release pairs.
// Frozen BEFORE physical validation. No minimax or alternate q in SOURCE.
// Only after source emits safe PAIR certificate does this physical checker
// vary P first actions and P future choices, then optionally WDL-check late.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createOddSpareColCoReleaseNoWin} from './standard7x6-odd-spare-col-co-release-no-win-source.mjs';
import {createCoReleasePairBlockProof} from './co-release-pair-block-proof.mjs';
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
const core=createExactQCore({width:W,height:H,connect:K}),
 odd=createOddSpareColCoReleaseNoWin({width:W,height:H,connect:K});
const oddBest=createOddSafePairBestDrawOrLoss({width:W,height:H,connect:K});
const byCell=Array.from({length:N},()=>[]);let geometricKLines=0;
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  if(c+(K-1)*dc>=W||r+(K-1)*dr<0||r+(K-1)*dr>=H)continue;
  let mask=0n,ids=[];
  for(let j=0;j<K;j++){const id=(r+j*dr)*W+c+j*dc;mask|=bit(c+j*dc,r+j*dr);ids.push(id);}
  for(const id of ids)byCell[id].push(mask);geometricKLines++;
 }
if(geometricKLines!==69||core.lineCount!==69)throw Error('original K-line count not true standard7x6');
const initial=()=>({h:Array(W).fill(0),P:[0n,0n],n:0,history:'',outcome:null});
const legal=q=>q.h.flatMap((z,c)=>z<H?[c]:[]);
function step(q,c){
 if(q.outcome!==null||q.h[c]>=H)throw Error('illegal original physical first-win action');
 const p=q.n&1,r=q.h[c],id=r*W+c,h=q.h.slice(),P=q.P.slice();
 h[c]++;P[p]|=bit(c,r);
 const hasWin=byCell[id].some(mask=>(P[p]&mask)===mask);
 return {h,P,n:q.n+1,history:q.history+String(c+1),
  outcome:hasWin?(p===0?1:-1):q.n+1===N?0:null};
}
const sourceOriginalWin=100;
const errorCounter={moverFirstWinViolations:0,opponentResponseNotGravityLegal:0,
 emptyAvailableVirginPairOnOpponentTurn:0,ownerPairForbiddenBothPhysicalCells:0,
 terminalPWinDespitePhysicalPairCoverage:0,pairedGuardBroken:0};
let seed=0x17072026>>>0;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
const stats={
 schema:'connect4.true7x6.odd_spare_single_pending_pair_source_no_force_win_v0_1',
 date:'2026-10-17',board:{W,H,K,originalKLines:69},
 sampledFirstWinStoppedPhysicalTrajectories:0,uniquePhysicalSourceStatesSeen:0,
 sampledOriginalRankOddSourceRootsEvaluated:0,oddSourceRootsEligibleOneCapacityCell:0,
 sourceOddSlackPairNoForcedMoverWinCertified:0,
 positiveSourcesWhereOriginalMoverWinningGeneratorsStillLive:0,
 positiveSourcesWith2OrMoreOriginalLegalActions:0,
 matchedFuturePairsInPositiveSourcesTotal:0,
 physicalAttackerFirstActionVaried:0,
 physicalCompleteOpponentPolicyTrials:0,
 physicallyRespondedToFirstTouchedMatchedPair:0,
 physicallyPreemptedFreshPairAfterSpareOrPendingMate:0,
 physicallyReplayedAttackerFutureMoves:0,
 physicalOpponentPairedReplies:0,
 physicalCompletedFirstWinByOpponent:0,
 physicalCompletedNonwinningDraw:0,
 sourcePolicyErrors:0,
 sourceNoWinAgainstPerfectOpponentFullMinimaxRootChecks:0,
 sourceWrongRootPerfectWDL:0,
 sourceStaticPairingProofOps:0,
 sourceStaticPairRepresentativesChecked:0,
 physicalMinimaxReferenceCalls:0,physicalMinimaxUniqueStates:0,
 firstPositive:null,firstPreemptiveExample:null,
 positiveExamples:[],canonical:[],onePendingPolicyViolations:errorCounter,
 finalSeed:0
};
const memo=new Map();
function value(q){
 stats.physicalMinimaxReferenceCalls++;
 if(q.outcome!==null)return q.outcome;
 const k=q.P[0].toString(16)+'|'+q.P[1].toString(16);
 if(memo.has(k))return memo.get(k);
 stats.physicalMinimaxUniqueStates++;
 let v=q.n%2===0?-1:1;
 for(const c of legal(q)){
  const w=value(step(q,c));
  v=q.n%2===0?Math.max(v,w):Math.min(v,w);
 }
 memo.set(k,v);return v;
}
function originalPairIDs(proof,root){
 const pairs=[],byID=new Map(),spare=proof.sourceUnmatchedLastCell,
  spareID=spare.rowZeroBased*W+(spare.originalLiteralColumn-1);
 for(const block of proof.sourceGravitySafePairBlocks)
  for(const pair of block.sourcePairMasksHex){
   const m=BigInt(pair),ids=[];
   for(let id=0;id<N;id++)if((m&(1n<<BigInt(id)))!==0n)ids.push(id);
   if(ids.length!==2)throw Error('source original spare matcher emitted invalid pair size');
   const index=pairs.length; pairs.push(ids);
   for(const id of ids){
    if(byID.has(id))throw Error('two pairs share original physical cell');
    byID.set(id,index);
   }
  }
 if(byID.has(spareID))throw Error('source spare cell accidentally paired');
 for(let c=0;c<W;c++)for(let r=root.h[c];r<H;r++){
  const id=r*W+c;
  if(id!==spareID&&!byID.has(id))throw Error('source pair support not full after spare');
 }
 return {pairs,byID,spareID};
}
function replay(root,proof,first,chooseRandom){
 const p=root.n&1,o=1-p,layout=originalPairIDs(proof,root),
  {pairs,byID,spareID}=layout;
 let q=root,pending=null,playedSpare=false,performedPreempt=false;
 stats.physicalCompleteOpponentPolicyTrials++;
 let firstP=true;
 while(q.outcome===null){
  if(q.n%2!==p)throw Error('original owner turn parity mismatch');
  const a=firstP?first:(chooseRandom?
    legal(q)[rand()%legal(q).length]:legal(q)[0]);
  firstP=false;
  const beforeH=q.h.slice(),originalPCellID=beforeH[a]*W+a;
  const beforePair=byID.get(originalPCellID);
  const wasVirgin=beforePair!==undefined&&
    pairs[beforePair].every(id=>{
     const c=id%W,r=Math.floor(id/W);
     return q.h[c]<=r;
    });
  const wasPendingMate=pending!==null&&beforePair===pending;
  q=step(q,a);stats.physicallyReplayedAttackerFutureMoves++;
  if(q.outcome!==null){
   if(q.outcome===(p===0?1:-1)){
    stats.sourcePolicyErrors++;errorCounter.moverFirstWinViolations++;
    throw Error('p first-won despite odd source safe pairing');
   }
   if(q.outcome===0)stats.physicalCompletedNonwinningDraw++;
   else stats.physicalCompletedFirstWinByOpponent++;
   break;
  }
  if(q.n%2!==o)throw Error('opponent next turn parity wrong');
  let defenderCellID=null;
  if(wasVirgin){
   const [x,y]=pairs[beforePair];
   defenderCellID=x===originalPCellID?y:x;
   stats.physicallyRespondedToFirstTouchedMatchedPair++;
  }else if(originalPCellID===spareID||wasPendingMate){
   if(originalPCellID===spareID){
    if(playedSpare||pending!==null)throw Error('source odd spare policy violated pre-spare dangling invariant');
    playedSpare=true;
   }else pending=null;
   // The source release-poset theorem asserts a fresh minimal pair
   // has a gravity-playable member in the now-current physical q.
   const virginOptions=[];
   for(let i=0;i<pairs.length;i++){
    const [x,y]=pairs[i],cells=[x,y];
    if(cells.some(id=>{
     const c=id%W,r=Math.floor(id/W);
     return q.h[c]>r;
    }))continue;
    const playable=cells.filter(id=>{
     const c=id%W,r=Math.floor(id/W);
     return q.h[c]===r;
    });
    if(playable.length)virginOptions.push({pair:i,id:Math.min(...playable)});
   }
   if(!virginOptions.length){
    stats.sourcePolicyErrors++;
    errorCounter.emptyAvailableVirginPairOnOpponentTurn++;
    throw Error('odd one-pending-pair theorem o preemptive turn cannot access virgin pair');
   }
   virginOptions.sort((a,b)=>a.id-b.id||a.pair-b.pair);
   const choice=virginOptions[0];
   pending=choice.pair;defenderCellID=choice.id;performedPreempt=true;
   stats.physicallyPreemptedFreshPairAfterSpareOrPendingMate++;
  }else{
   stats.sourcePolicyErrors++;errorCounter.pairedGuardBroken++;
   throw Error('attacker claimed a cell neither virgin, spare, nor pending mate');
  }
  const defenderColumn=defenderCellID%W,
   defenderRow=Math.floor(defenderCellID/W);
  if(q.h[defenderColumn]!==defenderRow){
   stats.sourcePolicyErrors++;errorCounter.opponentResponseNotGravityLegal++;
   throw Error('ODD_CROSS_PENDING_RELEASE_COUNTEREXAMPLE '+JSON.stringify({
      originalRootHistory:root.history,originalRootPly:root.n,
      originalUnmatched:proof.sourceUnmatchedLastCell,
      originalSourcePairBlocks:proof.sourceGravitySafePairBlocks,
      currentPhysicalHistory:q.history,attackerOriginalColumn:a+1,
      neededDefenderPhysicalCellId:defenderCellID,
      neededDefenderLiteralColumn:defenderColumn+1,
      neededDefenderRow:defenderRow,
      actualGravityFrontierRow:q.h[defenderColumn],
      currentDanglingPair:pending,
      attackerEnteredPreviouslyVirginPair:wasVirgin,
      attackerEnteredOldPendingMate:wasPendingMate,
      attackerEnteredSpare:originalPCellID===spareID
     }));
  }
  q=step(q,defenderColumn);
  stats.physicalOpponentPairedReplies++;
  if(q.outcome!==null){
   if(q.outcome===(p===0?1:-1)||q.outcome===0){
    stats.sourcePolicyErrors++;errorCounter.terminalPWinDespitePhysicalPairCoverage++;
    throw Error('odd defender o policy allowed p first win or full draw on o turn');
   }
   stats.physicalCompletedFirstWinByOpponent++;
   break;
  }
  // Independent guard: no completed pair can be 2 current-p stones.
  for(const [x,y] of pairs){
   const pHas=id=>(q.P[p]&(1n<<BigInt(id)))!==0n;
   if(pHas(x)&&pHas(y)){
    stats.sourcePolicyErrors++;errorCounter.ownerPairForbiddenBothPhysicalCells++;
    throw Error('p currently owned BOTH cells of an o-protected source pair');
   }
  }
 }
 if(performedPreempt&&!stats.firstPreemptiveExample)
  stats.firstPreemptiveExample={rootHistory:root.history,firstLiteralColumn:first+1,
   originalMover:p,sourceUnmatchedCell:proof.sourceUnmatchedLastCell,
   opponentResponseCount:stats.physicalOpponentPairedReplies,
   actualFirstTerminal:q.outcome};
}
const bestStats={
 schema:'connect4.standard7x6.safe_odd_spare_root_plus_dual_or_one_draw_action_v0_1',
 afterOriginalOddNoWinSourcePositive:0,
 newSourceLOSSClassifiedRoots:0,newSourceDRAWClassifiedRoots:0,
 newOddRootNoWinButOutcomeUnresolved:0,
 proofNoOpponentForcedWinContradictions:0,
 exactRootPhysicalWDLChecks:0,
 originalLiteralActionPhysicalWDLChecks:0,
 wrongRootOrChosenBestAction:0,
 selectedOriginalWDLBestActionExamples:[],
 firstDualLOSS:null,firstOneActionDRAW:null
};
const visited=new Set();
function inspect(q,canonical=false){
 if(q.outcome!==null||q.n>=N)throw Error('real physical source nonterminal only');
 const key=q.P[0].toString(16)+'|'+q.P[1].toString(16);
 if(visited.has(key))return;visited.add(key);
 if(q.n%2!==1 || (q.n<23&&!canonical))return; // standard 7x6 odd T means n odd
 const exact=core.fromPhysical({h:q.h,p0:q.P[0],p1:q.P[1]});
 const eligible=q.h.some(h=>H-h===1);
 if(eligible)stats.oddSourceRootsEligibleOneCapacityCell++;
 stats.sampledOriginalRankOddSourceRootsEvaluated++;
 const proof=odd.compute(exact,{maxOperations:9000,maxMs:23,
  maxStaticWitnessStates:1200});
 stats.sourceStaticPairingProofOps+=proof.statistics.sourceStaticBlockMatchingWorkOps;
 stats.sourceStaticPairRepresentativesChecked+=proof.statistics.sourceStaticBlockRepresentativesVisited;
 if(canonical)stats.canonical.push({history:q.history,ply:q.n,
  status:proof.status,reason:proof.reason??proof.kind,
  staticSourceOps:proof.statistics.sourceStaticBlockMatchingWorkOps});
 if(proof.status!=='CERTIFIED_CURRENT_MOVER_CANNOT_FORCE_WIN')return;
 stats.sourceOddSlackPairNoForcedMoverWinCertified++;
 bestStats.afterOriginalOddNoWinSourcePositive++;
 const candidate=oddBest.compute(exact);
 if(candidate.status==='VALID_CONTINUATION'){
  const outcome=candidate.bestOutcomeTier;
  if(outcome==='LOSS')bestStats.newSourceLOSSClassifiedRoots++;
  else if(outcome==='DRAW')bestStats.newSourceDRAWClassifiedRoots++;
  else throw Error('odd no-forced-win source somehow claimed mover WIN');
  if(bestStats.selectedOriginalWDLBestActionExamples.length<14)
   bestStats.selectedOriginalWDLBestActionExamples.push({
    history:q.history,ply:q.n,mover:q.n&1,bestTier:outcome,
    bestOriginalLiteralColumn:candidate.selectedOriginalLiteralColumn,
    proofKind:candidate.proofKind,
    completeBestSetKnown:candidate.fullLevel2SetKnown,
    fullBestOriginalLabels:candidate.allBestOriginalLiteralMoves
   });
  if(outcome==='LOSS'&&!bestStats.firstDualLOSS)
   bestStats.firstDualLOSS={history:q.history,ply:q.n,originalLegal:legal(q).map(c=>c+1),
    proof:candidate.opponentDualSourceWitness,
    oddSafeRootNoWin:candidate.oddSourceCannotForceWinProof.kind};
  if(outcome==='DRAW'&&!bestStats.firstOneActionDRAW)
   bestStats.firstOneActionDRAW={history:q.history,ply:q.n,
    originalAction:candidate.selectedOriginalLiteralColumn,
    rootProofKind:candidate.oddSourceCannotForceWinProof.kind,
    actionProof:candidate.chosenSourceNonlossProof};
  if(q.n>=34&&bestStats.exactRootPhysicalWDLChecks<90){
   const expected=candidate.ordinaryRootValueP0Relative;
   bestStats.exactRootPhysicalWDLChecks++;
   if(value(q)!==expected){
    bestStats.wrongRootOrChosenBestAction++;throw Error('odd guarded source exact DRAW/LOSS root contradicted independent physical WDL');
   }
   const acts=outcome==='LOSS'?legal(q):[candidate.selectedOriginalLiteralColumn-1];
   for(const action of acts){
    bestStats.originalLiteralActionPhysicalWDLChecks++;
    if(value(step(q,action))!==expected){
     bestStats.wrongRootOrChosenBestAction++;throw Error('odd guarded source best first action disagrees physical ordinary WDL');
    }
   }
  }
 }else bestStats.newOddRootNoWinButOutcomeUnresolved++;
 if(exact.R1.length)stats.positiveSourcesWhereOriginalMoverWinningGeneratorsStillLive++;
 if(legal(q).length>=2)stats.positiveSourcesWith2OrMoreOriginalLegalActions++;
 const pairingCount=proof.sourceGravitySafePairBlocks.reduce((n,block)=>n+block.sourcePairMasksHex.length,0);
 stats.matchedFuturePairsInPositiveSourcesTotal+=pairingCount;
 if(!stats.firstPositive)stats.firstPositive={
   history:q.history,ply:q.n,currentMover:q.n&1,
   legalFirstActions:legal(q).map(c=>c+1),
   originalMoverR:exact.R1.length,originalDefenderR:exact.R0.length,
   unmatched:proof.sourceUnmatchedLastCell,
   pairBlocks:proof.sourceGravitySafePairBlocks};
 if(stats.positiveExamples.length<12)stats.positiveExamples.push({
  history:q.history,ply:q.n,
  R1:exact.R1.length,legal:legal(q).map(c=>c+1),
  unmatched:proof.sourceUnmatchedLastCell,
  pairBlockCount:proof.sourceGravitySafePairBlocks.length,
  pairCount:pairingCount});
 for(const first of legal(q)){
  stats.physicalAttackerFirstActionVaried++;
  replay(q,proof,first,false);
  replay(q,proof,first,true);
 }
 if(q.n>=35&&stats.sourceNoWinAgainstPerfectOpponentFullMinimaxRootChecks<120){
  stats.sourceNoWinAgainstPerfectOpponentFullMinimaxRootChecks++;
  if(value(q)===-1){stats.sourceWrongRootPerfectWDL++;throw Error('source NO P1 force WIN but independent physical perfect q says P1 wins');}
 }
}
for(const history of ['','4','44444','444444','444441','4444442']){
 let q=initial();
 for(const digit of history)q=step(q,Number(digit)-1);
 if(q.outcome!==null)throw Error('canonical original source already terminal');
 inspect(q,true);
}
for(let game=0;game<2300;game++){
 stats.sampledFirstWinStoppedPhysicalTrajectories++;
 let q=initial();
 while(q.outcome===null&&q.n<N){
  inspect(q);
  const choices=legal(q).map(c=>step(q,c)).filter(x=>x.outcome===null);
  if(!choices.length)break;
  q=choices[rand()%choices.length];
 }
}
stats.uniquePhysicalSourceStatesSeen=visited.size;stats.finalSeed=seed;
stats.oddSafePairOutcomeCompletion=bestStats;
console.log(JSON.stringify(stats,null,2));
