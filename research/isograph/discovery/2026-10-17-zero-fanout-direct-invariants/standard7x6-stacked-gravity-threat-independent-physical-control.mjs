// INDEPENDENT 7x6 first-win-stopped PHYSICAL CONTROL, frozen before run.
// Source function pure current q masks, no game successor, no WDL solver.
// Independent physical bitboard win detector checks EVERY opponent reply,
// and ordinary recursive reference verifies selected original first action
// on a bounded sample of positives ONLY AFTER original source certificate.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createStackedGravityThreatCertificate} from './standard7x6-stacked-gravity-threat-source-certificate.mjs';
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),
 producer=createStackedGravityThreatCertificate({width:W,height:H,connect:K}),
 sourceCore=createExactQCore({width:W,height:H,connect:K});
const lines=[],byCell=Array.from({length:N},()=>[]);
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const ec=c+(K-1)*dc,er=r+(K-1)*dr;
  if(ec<0||ec>=W||er<0||er>=H)continue;
  let m=0n,ids=[];
  for(let d=0;d<K;d++){const id=(r+d*dr)*W+c+d*dc;ids.push(id);m|=bit(c+d*dc,r+d*dr);}
  for(const id of ids)byCell[id].push(m);
  lines.push(m);
 }
if(lines.length!==69||sourceCore.lineCount!==69)throw Error('bad original 7x6 geometry');
function initial(){return{h:Array(W).fill(0),P:[0n,0n],n:0,history:'',winner:null};}
function legal(s){return s.h.flatMap((v,c)=>v<H?[c]:[]);}
function physicalStep(s,a){
 if(s.winner!==null||s.h[a]>=H)throw Error('physical first-win stopped/legal violation');
 const p=s.n&1,r=s.h[a],id=r*W+a,h=s.h.slice(),P=s.P.slice();
 h[a]++;P[p]|=bit(a,r);
 const win=byCell[id].some(g=>(P[p]&g)===g);
 return {h,P,n:s.n+1,history:s.history+String(a+1),
  winner:win?p:s.n+1===N?2:null};
}
let seed=0x154AC7D3>>>0;
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
const stats={
 schema:'connect4.standard7x6.stacked_gravity_source_first_win_real_physical_control_v0_1',
 date:'2026-10-17',geometry:{W,H,K,originalWinlines:69},seedStart:seed,
 canonicalInputs:[],sampledNonwinningTrajectories:0,
 actualFirstWinStoppedSourcePositions:0,distinctRealPhysicalInputs:0,
 sourceStaticChecks:0,
 sourcePositiveSingleBestActions:0,
 sourcePositiveOriginalFirstActionLabels:[],
 sourcePositiveDistinctRootBoards:0,
 positiveActionsAlreadyImmediateRootWin:0,
 positiveActionsAlreadyTwoDistinctPlayableImmediateThreats:0,
 positiveActionsWithExactlyOneSimultaneouslyPlayableWinningTarget:0,
 physicallyTestedOpponentLiteralReplies:0,
 confirmedActualNoOpponentImmediateCounterwin:0,
 verifiedPWinAfterEveryOpponentReply:0,
 badFirstActionWinPrecedence:0,badFullDrawGuards:0,badOpponentCounters:0,
 wrongSourceWitnessOrPhysicalWinningAction:0,
 selectedFirstActionOrdinaryPerfectWDLChecks:0,
 independentRecursiveReferenceCalls:0,independentReferenceStates:0,
 sampledReferenceWdlWrong:0,
 proofGraphStrategicFutureFanoutAtSource:0,
 sourceFutureGameStatesConstructed:0,
 sourceAnyGameValuesQueried:0,
 sampleUniqueMultiStepSourceWitness:null,
 sampleWitnesses:[],sourceWorkCounts:{literalSourceActionsScanned:0,residualLookupTests:0},
 canonical44444Result:'NOT_TESTED',finishedSeed:0
};
const seen=new Set(),certifiedSeen=new Set(),memo=new Map();
function physicalWDL(s){
 stats.independentRecursiveReferenceCalls++;
 if(s.winner!==null)return s.winner===2?0:s.winner===0?1:-1;
 const key=s.P[0].toString(16)+'|'+s.P[1].toString(16);
 const hit=memo.get(key);if(hit!==undefined)return hit;
 stats.independentReferenceStates++;
 let v=(s.n&1)===0?-1:+1;
 for(const c of legal(s)){
  const y=physicalWDL(physicalStep(s,c));
  v=(s.n&1)===0?Math.max(v,y):Math.min(v,y);
 }
 memo.set(key,v);return v;
}
function examine(s,canon=false){
 if(s.winner!==null||s.n===N)throw Error('source must be first-win-stopped nonterminal');
 const physicalID=s.P[0].toString(16)+'|'+s.P[1].toString(16);
 if(seen.has(physicalID))return;
 seen.add(physicalID);
 stats.actualFirstWinStoppedSourcePositions++;
 const q=sourceCore.fromPhysical({h:s.h,p0:s.P[0],p1:s.P[1]});
 const pr=producer.compute(q);stats.sourceStaticChecks++;
 stats.sourceWorkCounts.literalSourceActionsScanned+=pr.statistics.currentLiteralColumnsScanned;
 stats.sourceWorkCounts.residualLookupTests+=pr.statistics.originalResidualLookupTests;
 if(canon)stats.canonicalInputs.push({history:s.history,ply:s.n,result:pr.status});
 if(s.history==='44444')stats.canonical44444Result=pr.status;
 if(pr.status!=='VALID_CONTINUATION')return;
 const a=pr.selectedOriginalLiteralColumn-1,cert=pr.proof;
 stats.sourcePositiveSingleBestActions++;certifiedSeen.add(physicalID);
 if(cert.mover!==(s.n&1)||a<0||a>=W||s.h[a]>=H)
  throw Error('source proof wrong player or illegal action');
 const first=physicalStep(s,a);
 if(first.winner!==null){stats.badFirstActionWinPrecedence++;throw Error('source stacked theorem false first-action terminal');}
 const p=s.n&1,o=1-p;
 const liveWinColumns=[];
 for(const d of legal(first)){
  const test=physicalStep(first,d);
  if(test.winner===p)liveWinColumns.push(d+1);
  else if(test.winner===o){
   stats.badOpponentCounters++;
   throw Error('uncertified opponent immediate counterwin');
  }
 }
 if(liveWinColumns.length>=2)
  stats.positiveActionsAlreadyTwoDistinctPlayableImmediateThreats++;
 if(liveWinColumns.length===1)
  stats.positiveActionsWithExactlyOneSimultaneouslyPlayableWinningTarget++;
 if(liveWinColumns.length!==1||liveWinColumns[0]!==cert.uniqueStackedColumn){
   stats.wrongSourceWitnessOrPhysicalWinningAction++;
   throw Error('stacked source source theorem not a genuinely single-playable threat');
 }
 for(const d of legal(first)){
  const afterO=physicalStep(first,d);
  stats.physicallyTestedOpponentLiteralReplies++;
  if(afterO.winner!==null){
   stats.badOpponentCounters++;
   throw Error('opponent first wins or board ends before p threatened reply');
  }
  const target=cert.uniqueStackedColumn-1;
  if(afterO.h[target]>=H){stats.badFullDrawGuards++;throw Error('winning target not gravity playable');}
  const win=physicalStep(afterO,target);
  if(win.winner!==p){
   stats.wrongSourceWitnessOrPhysicalWinningAction++;
   throw Error('physical true 7x6 opponent reply contradicts stacked q theorem');
  }
  stats.verifiedPWinAfterEveryOpponentReply++;
 }
 stats.confirmedActualNoOpponentImmediateCounterwin++;
 if(stats.selectedFirstActionOrdinaryPerfectWDLChecks<80){
  const want=p===0?1:-1,got=physicalWDL(first);
  stats.selectedFirstActionOrdinaryPerfectWDLChecks++;
  if(got!==want){stats.sampledReferenceWdlWrong++;throw Error('source certificate selected nonwinning action');}
 }
 if(stats.sampleWitnesses.length<12){
  stats.sampleWitnesses.push({history:s.history,ply:s.n,mover:p,
   firstAction:a+1,stackColumn:cert.uniqueStackedColumn,
   bottomRow:cert.bottomImmediateWinCell.rowZeroBased,
   topRow:cert.upperReleasedWinCell.rowZeroBased,
   pSourceResiduals:q[p===0?'R0':'R1'].length,
   enemyResiduals:q[p===0?'R1':'R0'].length,
   afterFirstSingleWinningColumns:liveWinColumns,
   opponentReplyColumnsCovered:legal(first).map(x=>x+1),
   directSourceCertificate:cert});
 }
}
for(const hist of ['','4','44444','444444','444441','4444442']){
 let st=initial();for(const digit of hist)st=physicalStep(st,Number(digit)-1);
 if(st.winner!==null)throw Error('canonical prefix should not already terminal');
 examine(st,true);
}
for(let game=0;game<4100;game++){
 stats.sampledNonwinningTrajectories++;
 let s=initial();
 while(s.winner===null&&s.n<N){
  examine(s);
  // Independent physical sampler chooses only ongoing nonterminal
  // prefixes; its path is not used in ANY source proof certificate.
  const possible=legal(s).map(c=>physicalStep(s,c)).filter(y=>y.winner===null);
  if(!possible.length)break;
  s=possible[random()%possible.length];
 }
}
stats.distinctRealPhysicalInputs=seen.size;
stats.sourcePositiveDistinctRootBoards=certifiedSeen.size;
stats.finishedSeed=seed;
console.log(JSON.stringify(stats,null,2));
