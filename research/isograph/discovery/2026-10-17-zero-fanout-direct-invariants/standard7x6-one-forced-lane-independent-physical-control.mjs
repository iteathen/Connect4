// INDEPENDENT original W=7,H=6,K=4 FIRST-WIN PHYSICAL validation
// of one selected forced-reply source lane. Frozen BEFORE test.
// SOURCE producer never values future games or tries alternative lanes.
// PHYSICAL validator enumerates replies ONLY after source certificate.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createSourceGravityResponseCover} from './standard7x6-source-gravity-response-cover.mjs';
import {createSingleForcedThreatLadder} from './standard7x6-source-single-forced-threat-ladder.mjs';
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),
 core=createExactQCore({width:W,height:H,connect:K}),
 direct=createSourceGravityResponseCover({width:W,height:H,connect:K}),
 ladder=createSingleForcedThreatLadder({width:W,height:H,connect:K});
const winByPhysicalCell=Array.from({length:N},()=>[]);
let originalKlines=0;
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  if(c+(K-1)*dc>=W||r+(K-1)*dr<0||r+(K-1)*dr>=H)continue;
  let m=0n,ids=[];
  for(let j=0;j<K;j++){const id=(r+dr*j)*W+c+dc*j;m|=bit(c+dc*j,r+dr*j);ids.push(id);}
  for(const id of ids)winByPhysicalCell[id].push(m);
  originalKlines++;
 }
if(originalKlines!==69)throw Error('invalid 7x6 original K-lines');
function blank(){return{h:Array(W).fill(0),P:[0n,0n],n:0,history:'',winner:null};}
function legal(s){return s.h.flatMap((height,c)=>height<H?[c]:[]);}
function play(s,a){
 if(s.winner!==null||a<0||a>=W||s.h[a]>=H)throw Error('invalid original first-win-stopped action');
 const p=s.n&1,r=s.h[a],id=r*W+a,h=s.h.slice(),P=s.P.slice();
 h[a]++;P[p]|=bit(a,r);
 const w=winByPhysicalCell[id].some(G=>(P[p]&G)===G);
 return {h,P,n:s.n+1,history:s.history+String(a+1),
  winner:w?p:s.n+1===N?2:null};
}
function hypotheticallyWinningColumns(s,p){
 return legal(s).filter(c=>{
  const r=s.h[c],id=r*W+c;
  const withP=s.P[p]|bit(c,r);
  return winByPhysicalCell[id].some(G=>(withP&G)===G);
 });
}
let seed=0x154AC7D3>>>0;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
const stats={
 schema:'connect4.standard7x6.single_forced_lane_source_winner_physical_validation_v0_1',
 date:'2026-10-17',board:{W,H,K,originalKlines},seedStart:seed,
 genuineNonterminalOriginalRoots:0,uniqueSourceRoots:0,
 historiesSampled:0,selectedForcedLaneSourceEvaluations:0,
 sourceDirectAlreadyCertifiableRoots:0,
 oneLaneNewPositiveRootMoveCertificates:0,
 sourceValidWinMovesTotal:0,
 sourceForcedRoundHistogram:{},
 rootSelectedForcedLaneUnsuccessfulCount:0,
 sourceConstructedFutureQStatesAcrossAllSelectedLanes:0,
 sourceEvaluatedAlternativeFutureWDLQueries:0,
 sourceEvaluatedGameSemanticMaxFanout:0,
 sourceStaticCandidateChecks:0,
 physicalForcedStepSourceProofsReplayed:0,
 physicalOffThreatOpponentDeviationsChecked:0,
 physicalForcedOpponentBlocksChecked:0,
 physicalDirectTerminalStepOpponentRepliesChecked:0,
 wrongPhysicalSourceWinningCertificate:0,
 positiveNewRootSamples:[],canonical:[],
 positiveLateFullRecursivePhysicalChecks:0,
 independentPlainPhysicalRecursiveCalls:0,
 independentPlainPhysicalStates:0,wrongIndependentFullWDL:0,
 finalSeed:null
};
const seen=new Set(),memo=new Map();
function independentWDL(s){
 stats.independentPlainPhysicalRecursiveCalls++;
 if(s.winner!==null)return s.winner===2?0:s.winner===0?1:-1;
 const key=s.P[0].toString(16)+'|'+s.P[1].toString(16);
 if(memo.has(key))return memo.get(key);
 stats.independentPlainPhysicalStates++;
 let V=(s.n&1)?1:-1;
 for(const a of legal(s)){
  const child=independentWDL(play(s,a));
  V=(s.n&1)?Math.min(V,child):Math.max(V,child);
 }
 memo.set(key,V);return V;
}
function verifyPhysicalSourcePath(s,result){
 if(result.status!=='VALID_CONTINUATION'||!result.certificate)
  throw Error('positive proof required for replay');
 const p=s.n&1,proof=result.certificate.proofSteps;
 let physical=s;
 for(let k=0;k<proof.length;k++){
  const node=proof[k];
  if(node.kind==='SINGLE_WIN_THREAT_FORCES_ONE_BLOCKING_REPLY'){
   const a=node.selectedPAction-1,b=node.uniqueForcedOpponentBlockColumn-1;
   const afterP=play(physical,a);
   if(afterP.winner!==null){stats.wrongPhysicalSourceWinningCertificate++;throw Error('forcing action unexpectedly terminal');}
   const threats=hypotheticallyWinningColumns(afterP,p);
   if(threats.length!==1||threats[0]!==b){
    stats.wrongPhysicalSourceWinningCertificate++;throw Error('source unique forced threat not physical unique');
   }
   for(const d of legal(afterP)){
    const afterO=play(afterP,d);
    if(afterO.winner!==null){stats.wrongPhysicalSourceWinningCertificate++;throw Error('opponent instant win or early draw');}
    if(d!==b){
     stats.physicalOffThreatOpponentDeviationsChecked++;
     const afterPResponse=play(afterO,b);
     if(afterPResponse.winner!==p){
      stats.wrongPhysicalSourceWinningCertificate++;throw Error('opponent unforced deviation escaped P win');
     }
    }
   }
   const forcedO=play(afterP,b);
   stats.physicalForcedStepSourceProofsReplayed++;
   stats.physicalForcedOpponentBlocksChecked++;
   if(forcedO.winner!==null){
    stats.wrongPhysicalSourceWinningCertificate++;throw Error('forced blocker ended game rather than passing turn');
   }
   physical=forcedO;continue;
  }
  if(node.kind==='DIRECT_SOURCE_NEXT_OWNER_TURN_WIN'){
   const a=node.literalPAction-1;
   const afterP=play(physical,a);
   if(node.sourceCertificate.kind==='IMMEDIATE_OWNER_FIRST_WIN'){
    if(afterP.winner!==p)throw Error('false immediate owner win source');
   }else{
    if(afterP.winner!==null)throw Error('supposed non-immediate direct source action terminal');
    for(const d of legal(afterP)){
     const afterO=play(afterP,d);
     stats.physicalDirectTerminalStepOpponentRepliesChecked++;
     if(afterO.winner!==null){stats.wrongPhysicalSourceWinningCertificate++;throw Error('direct leaf opponent first win/draw');}
     if(!legal(afterO).some(c=>play(afterO,c).winner===p)){
      stats.wrongPhysicalSourceWinningCertificate++;
      throw Error('direct leaf not guaranteed physical owner response win');
     }
    }
   }
   if(k!==proof.length-1)throw Error('direct terminal proof must be last');
   continue;
  }
  throw Error('unknown proof step kind');
 }
}
function inspect(s,canonical=false){
 if(s.winner!==null||s.n>=N)throw Error('requires genuine nonterminal history');
 const key=s.P[0].toString(16)+'|'+s.P[1].toString(16);
 if(seen.has(key))return;seen.add(key);
 stats.genuineNonterminalOriginalRoots++;
 const q=core.fromPhysical({h:s.h,p0:s.P[0],p1:s.P[1]});
 const baseline=direct.compute(q);
 const result=ladder.compute(q);
 stats.selectedForcedLaneSourceEvaluations++;
 stats.sourceConstructedFutureQStatesAcrossAllSelectedLanes+=result.statistics.sourceQStatesMaterializedAlongOneLane;
 stats.sourceStaticCandidateChecks+=result.statistics.staticSingleThreatCandidatesConsidered+
    result.statistics.sourceOriginalCurrentActionScans;
 stats.sourceEvaluatedGameSemanticMaxFanout=Math.max(
   stats.sourceEvaluatedGameSemanticMaxFanout,result.statistics.sourceStrategicContinuationLaneFanoutMax);
 const valid=result.status==='VALID_CONTINUATION';
 if(canonical)stats.canonical.push({history:s.history,ply:s.n,
  baseline:baseline.status,ladder:result.status,
  forcedRounds:result.sourceForcedReplyRounds});
 if(baseline.status==='VALID_CONTINUATION')stats.sourceDirectAlreadyCertifiableRoots++;
 if(!valid){if(result.statistics.selectedOneLaneForcedTwoPlyTransitions>0)
   stats.rootSelectedForcedLaneUnsuccessfulCount++;return;}
 stats.sourceValidWinMovesTotal++;
 stats.sourceForcedRoundHistogram[result.sourceForcedReplyRounds]=
  (stats.sourceForcedRoundHistogram[result.sourceForcedReplyRounds]??0)+1;
 if(baseline.status!=='VALID_CONTINUATION'){
  stats.oneLaneNewPositiveRootMoveCertificates++;
  if(!result.sourceForcedReplyRounds)throw Error('new proof without forced selected lane');
  if(stats.positiveNewRootSamples.length<12)
   stats.positiveNewRootSamples.push({history:s.history,ply:s.n,mover:s.n&1,
    firstAction:result.selectedOriginalLiteralColumn,forcedRounds:result.sourceForcedReplyRounds,
    proofSteps:result.certificate.proofSteps});
 }
 verifyPhysicalSourcePath(s,result);
 if(s.n>=35&&stats.positiveLateFullRecursivePhysicalChecks<75){
  const child=play(s,result.selectedOriginalLiteralColumn-1);
  const v=independentWDL(child);
  stats.positiveLateFullRecursivePhysicalChecks++;
  if(v!==((s.n&1)===0?1:-1)){
   stats.wrongIndependentFullWDL++;throw Error('independent physical minimax disagreed');
  }
 }
}
for(const history of ['','4','44444','444444','444441','4444442']){
 let s=blank();for(const ch of history)s=play(s,Number(ch)-1);
 if(s.winner!==null)throw Error('canonical already ended');inspect(s,true);
}
for(let game=0;game<1700;game++){
 stats.historiesSampled++;
 let s=blank();
 while(s.winner===null&&s.n<N){
  inspect(s);
  const options=legal(s).map(c=>play(s,c)).filter(z=>z.winner===null);
  if(!options.length)break;
  s=options[rand()%options.length];
 }
}
stats.uniqueSourceRoots=seen.size;stats.finalSeed=seed;
console.log(JSON.stringify(stats,null,2));
