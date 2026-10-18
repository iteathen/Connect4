// FROZEN BEFORE RUN: independent TRUE standard7x6 first-win-stopped
// physical verification of source opponent-second safe static response
// PAIR plus opponent remaining winline fractional dual overload.
// Physical tests inspect original literal p first choices and simulate
// policy response until first original winning K-line. No solved root WDL
// enters the source. An independent branching physical WDL reference
// checks late certified positives (bounded only in validator).
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createPairDefenseDualOverloadLoss} from './standard7x6-pair-defense-plus-dual-overload-source.mjs';
import {createCoReleasePairBlockProof} from './co-release-pair-block-proof.mjs';
import {createSourceFractionalTransversal} from './standard7x6-source-fractional-transversal.mjs';
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),
 geom={width:W,height:H,connect:K},
 qcore=createExactQCore(geom),source=createPairDefenseDualOverloadLoss(geom);
const lines=[],byCell=Array.from({length:N},()=>[]);
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  if(c+(K-1)*dx>=W||r+(K-1)*dy<0||r+(K-1)*dy>=H)continue;
  let mask=0n,ids=[];
  for(let i=0;i<K;i++){let id=(r+i*dy)*W+c+i*dx;mask|=bit(c+i*dx,r+i*dy);ids.push(id);}
  for(const id of ids)byCell[id].push(mask);lines.push(mask);
 }
if(lines.length!==69||qcore.lineCount!==69)throw Error('not 7x6 original K game');
function blank(){return {h:Array(W).fill(0),P:[0n,0n],n:0,history:'',winner:null};}
const legal=q=>q.h.flatMap((h,c)=>h<H?[c]:[]);
function step(q,c){
 if(q.winner!==null||c<0||c>=W||q.h[c]>=H)throw Error('not original gravity first-win action');
 const p=q.n&1,r=q.h[c],id=r*W+c,h=q.h.slice(),P=q.P.slice();
 h[c]++;P[p]|=bit(c,r);
 const win=byCell[id].some(m=>(P[p]&m)===m);
 return {h,P,n:q.n+1,history:q.history+String(c+1),
  winner:win?p:q.n+1===N?2:null};
}
let seed=0x22102172>>>0;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
const memo=new Map();
const report={
 schema:'connect4.true7x6.pair_response_plus_opponent_dual_forced_loss_v0_1',
 W,H,K,originalGeometricKLines:69,seedStart:seed,randomHistories:0,
 genuineFirstWinStoppedRootsSeen:0,distinctPhysicalNonterminalSources:0,
 sourceAttemptRoots:0,sourceOriginalMoverWinningLinesNonempty:0,
 sourcePossibleOpponentDualOverloadRoots:0,
 sourceConfirmedForcedLossRoots:0,
 certifiedRootLegalOriginalMovesAllLose:0,
 certifiedNontrivialAtLeast2PChoicesRoots:0,
 opponentPairingCompletionOriginalPairsTotal:0,
 certifiedFractionalWinExcessNumeratorSum:0,
 sourceStaticFractionalCandidatesChecked:0,
 sourceStaticPairingBlockCandidatesChecked:0,
 originalLiteralPFirstRepliesPhysicallyTested:0,
 physicalPairMateRepliesPlayed:0,
 physicalPNoImmediateWinAtFirstMoveChecked:0,
 fullPairedPolicyPhysicalCompletionTrials:0,
 winningOpponentPolicyTrials:0,
 physicallyStoppedAtOpposingFirstWin:0,
 sourceEarlyOpponentWinContradictions:0,
 sourceDrawContradictions:0,
 sourcePairIllegalGravityResponses:0,
 sourcePairCoverageOrDualDisagreements:0,
 checkedLateOriginalPhysicalMinimaxRoots:0,
 checkedLateOriginalFirstActionsAgainstMinimax:0,
 independentFullPhysicalRecursiveCalls:0,
 independentFullPhysicalUniqueStates:0,
 independentFullReferenceDisagreements:0,
 sourceFutureStrategicWDLValuesQueried:0,
 newNontrivialSourceRootExample:null,
 sourcePairBudgetIncomplete:0,
 canonical:[],witnessExamples:[],elapsedMs:null,finalSeed:null
};
function key(q){return q.P[0].toString(16)+'|'+q.P[1].toString(16);}
function plainPhysicalWDL(q){
 report.independentFullPhysicalRecursiveCalls++;
 if(q.winner!==null)return q.winner===2?0:q.winner===0?1:-1;
 const k=key(q);if(memo.has(k))return memo.get(k);
 report.independentFullPhysicalUniqueStates++;
 let val=q.n%2===0?-1:1;
 for(const a of legal(q)){
  const v=plainPhysicalWDL(step(q,a));
  val=q.n%2===0?Math.max(val,v):Math.min(val,v);
 }
 memo.set(k,val);return val;
}
function pairMappingFromSource(proof,q){
 const pairMap=new Map(),allCells=new Set();
 for(const block of proof.sourceUniformDefenderReplyPolicy)
  for(const pairHex of block.sourcePairMasksHex){
   const m=BigInt(pairHex),ids=[];
   for(let id=0;id<N;id++)if((m&(1n<<BigInt(id)))!==0n)ids.push(id);
   if(ids.length!==2)throw Error('source returned invalid physical pair size');
   for(const id of ids){
    if(allCells.has(id))throw Error('source returned overlapping original pair');
    allCells.add(id);
   }
   pairMap.set(ids[0],ids[1]);pairMap.set(ids[1],ids[0]);
   report.opponentPairingCompletionOriginalPairsTotal++;
  }
 for(let c=0;c<W;c++)for(let r=q.h[c];r<H;r++)
  if(!pairMap.has(r*W+c))throw Error('source pairing did not cover original future physical cell');
 return pairMap;
}
function replayPolicy(q,proof,first,alternateTrial){
 const p=q.n&1,o=1-p,mates=pairMappingFromSource(proof,q);
 let cur=step(q,first),moverFirst=cur.winner;
 report.physicalPNoImmediateWinAtFirstMoveChecked++;
 if(moverFirst!==null){
  report.sourceEarlyOpponentWinContradictions++;throw Error('p first-won despite original all-p-winline paired');
 }
 let firstReply=true;
 while(cur.winner===null){
  if(cur.n%2!==o)throw Error('turn parity inconsistent before defender mate');
  const lastID=cur.history.length>q.history.length?
    (()=>{const c=Number(cur.history.at(-1))-1;return (cur.h[c]-1)*W+c;})():-1;
  const mate=mates.get(lastID);
  if(mate===undefined)throw Error('no original pair mate for attacker first touch');
  const c=mate%W,row=Math.floor(mate/W);
  if(cur.h[c]!==row){
   report.sourcePairIllegalGravityResponses++;
   throw Error('claimed gravity co-release reply not literally playable');
  }
  cur=step(cur,c);
  report.physicalPairMateRepliesPlayed++;
  if(cur.winner!==null){
   if(cur.winner!==o){report.sourceEarlyOpponentWinContradictions++;throw Error('p won or drawn despite opponent safe pairing');}
   report.physicallyStoppedAtOpposingFirstWin++;
   break;
  }
  const choices=legal(cur);
  if(!choices.length){report.sourceDrawContradictions++;throw Error('opponent has not first won by full board');}
  const pick=firstReply&&!alternateTrial?choices[0]:
   alternateTrial?choices[(rand()%choices.length)]:choices[choices.length-1];
  cur=step(cur,pick);
  if(cur.winner!==null){
   report.sourceEarlyOpponentWinContradictions++;
   throw Error('p won or drew while opponent mate defense in force');
  }
  firstReply=false;
 }
 if(cur.winner!==o){report.sourceDrawContradictions++;throw Error('source pairing/dual failed first opponent win');}
 report.winningOpponentPolicyTrials++;
}
const seen=new Set();
function inspect(q,canonical=false){
 if(q.winner!==null||q.n>=N)throw Error('test input must legal first-win stopped');
 const k=key(q);if(seen.has(k))return;seen.add(k);
 report.genuineFirstWinStoppedRootsSeen++;
 if(q.n<22){if(canonical)report.canonical.push({history:q.history,sourceNotAttemptedBeforeRank22:true});return;}
 const sourceQ=qcore.fromPhysical({h:q.h,p0:q.P[0],p1:q.P[1]}),p=q.n&1;
 if(sourceQ[p===0?'R0':'R1'].length>0)report.sourceOriginalMoverWinningLinesNonempty++;
 const output=source.compute(sourceQ,{maxOperations:4000,maxMs:12,maxStaticWitnessStates:1200,
  denominators:[1,2,3,4,6,8,12]});
 report.sourceAttemptRoots++;
 report.sourceStaticFractionalCandidatesChecked+=output.statistics.staticDualWeightVectorsExamined;
 report.sourceStaticPairingBlockCandidatesChecked+=output.statistics.staticPairBlockOptionsTried;
 report.sourcePairBudgetIncomplete+=output.statistics.sourcePairingBudgetIncomplete;
 if(output.reason!=='NO_OPPONENT_SOURCE_DUAL_OVERLOAD'&&output.reason!=='ALREADY_COVERED_BY_OLDER_EXTINCT_P_WINLINE_CONDITION'&&
   output.reason!=='REQUIRES_DEFENDER_AS_SECOND_WITH_EVEN_REMAINING_CELLS')report.sourcePossibleOpponentDualOverloadRoots++;
 if(canonical)report.canonical.push({history:q.history,rootStatus:output.status,reason:output.reason||output.kind});
 if(output.status!=='VALID_CONTINUATION')return;
 report.sourceConfirmedForcedLossRoots++;
 const ownRequirements=sourceQ[p===0?'R0':'R1'];
 if(!ownRequirements.length){report.sourcePairCoverageOrDualDisagreements++;throw Error('source nontrivial own K-lines must survive');}
 if(legal(q).length>=2)report.certifiedNontrivialAtLeast2PChoicesRoots++;
 report.certifiedRootLegalOriginalMovesAllLose+=legal(q).length;
 const T=N-q.n,D=output.sourceDualOpponentWinCertificate.denominator,
  sum=output.sourceDualOpponentWinCertificate.sumNumerator;
 if(T%2!==0||sum<=D*(T/2))throw Error('dual not overloaded at root');
 report.certifiedFractionalWinExcessNumeratorSum+=sum-D*T/2;
 if(!report.newNontrivialSourceRootExample)
  report.newNontrivialSourceRootExample={history:q.history,ply:q.n,mover:p,
   originalLegalActions:legal(q).map(c=>c+1),ownLiveOriginalKLines:ownRequirements.length,
   opponentLiveOriginalKLines:sourceQ[p===0?'R1':'R0'].length,
   responsePolicy:output.sourceUniformDefenderReplyPolicy,
   opponentPackedWinlines:output.sourceDualOpponentWinCertificate};
 if(report.witnessExamples.length<10)
  report.witnessExamples.push({history:q.history,ply:q.n,mover:p,legalActions:legal(q).map(c=>c+1),
   ownViableR:ownRequirements.length,
   fractionalWinLineCount:output.sourceDualOpponentWinCertificate.numerators.length,
   sourceBlockCount:output.sourceUniformDefenderReplyPolicy.length});
 for(const a of legal(q)){
  report.originalLiteralPFirstRepliesPhysicallyTested++;
  report.fullPairedPolicyPhysicalCompletionTrials++;
  replayPolicy(q,output,a,false);
  report.fullPairedPolicyPhysicalCompletionTrials++;
  replayPolicy(q,output,a,true);
 }
 if(q.n>=32&&report.checkedLateOriginalPhysicalMinimaxRoots<100){
  report.checkedLateOriginalPhysicalMinimaxRoots++;
  const want=p===0?-1:1;
  if(plainPhysicalWDL(q)!==want){
   report.independentFullReferenceDisagreements++;throw Error('source forced loser not ordinary physical WDL');
  }
  for(const a of legal(q)){
   report.checkedLateOriginalFirstActionsAgainstMinimax++;
   if(plainPhysicalWDL(step(q,a))!==want){
    report.independentFullReferenceDisagreements++;throw Error('source forced loss not every original first action');
   }
  }
 }
}
for(const hist of ['','4','44444','444444','444441','4444442']){
 let q=blank();for(const c of hist)q=step(q,Number(c)-1);
 if(q.winner!==null)throw Error('canonical should still be nonterminal');
 inspect(q,true);
}
for(let game=0;game<3100;game++){
 report.randomHistories++;
 let q=blank();
 while(q.winner===null&&q.n<N){
  inspect(q);
  const possible=legal(q).map(c=>step(q,c)).filter(z=>z.winner===null);
  if(!possible.length)break;
  q=possible[rand()%possible.length];
 }
}
report.distinctPhysicalNonterminalSources=seen.size;report.finalSeed=seed;
console.log(JSON.stringify(report,null,2));
