// FROZEN independent REAL 7x6 source-q vs PHYSICAL first-win replay.
// Source only checks one ORIGINAL q mask set; independent control checks
// EACH source-certified legal action and EVERY opponent next literal reply.
// No game-value recurrence in source or oracle label fitting. Optional late
// position physical minimax is validator only and restricted to rank >=35.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createSourceGravityResponseCover} from './standard7x6-source-gravity-response-cover.mjs';
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
const producer=createSourceGravityResponseCover({width:W,height:H,connect:K});
const qcore=createExactQCore({width:W,height:H,connect:K});
const originalKlines=[],lineThrough=Array.from({length:N},()=>[]);
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  const ce=c+(K-1)*dx,re=r+(K-1)*dy;
  if(ce<0||ce>=W||re<0||re>=H)continue;
  let m=0n,ids=[];
  for(let k=0;k<K;k++){
   const id=(r+dy*k)*W+c+dx*k;ids.push(id);m|=bit(c+dx*k,r+dy*k);
  }
  originalKlines.push(m);
  for(const id of ids)lineThrough[id].push(m);
 }
if(originalKlines.length!==69||qcore.lineCount!==69)throw Error('bad original K-lines');
function initial(){return{h:Array(W).fill(0),P:[0n,0n],n:0,history:'',winner:null};}
function legal(s){return s.h.flatMap((v,c)=>v<H?[c]:[]);}
function physicalStep(s,a){
 if(s.winner!==null||a<0||a>=W||s.h[a]>=H)throw Error('physical illegal/after first-win');
 const p=s.n&1,r=s.h[a],id=r*W+a,h=s.h.slice(),P=s.P.slice();
 h[a]++;P[p]|=bit(a,r);
 const won=lineThrough[id].some(m=>(P[p]&m)===m);
 return {h,P,n:s.n+1,history:s.history+String(a+1),
  winner:won?p:s.n+1===N?2:null};
}
function hypotheticalImmediateWinningColumns(s,p){
 const found=[];
 for(const c of legal(s)){
  const r=s.h[c],id=r*W+c,withP=s.P[p]|bit(c,r);
  if(lineThrough[id].some(g=>(withP&g)===g))found.push(c+1);
 }
 return found;
}
let seed=0x154AC7D3>>>0;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
const stats={
 schema:'connect4.standard7x6.gravity_response_cover_closed_boolean_control_v0_1',
 date:'2026-10-17',geometry:{W,H,K,originalWinlines:69},seedStart:seed,
 sampledNonwinningTrajectories:0,
 realFirstWinStoppedSourceRoots:0,uniquePhysicalRoots:0,
 originalLegalFirstActionsSourceScanned:0,
 sourceProvenMateInAtMostThreeActionCount:0,
 sourceProvenNonImmediateActionCount:0,
 directImmediateOwnerFirstWin:0,ordinaryTwoColumnFork:0,
 newStackedSingleColumnRelease:0,allOpponentRepliesReleaseGift:0,
 giftWithMultipleOpponentOptions:0,giftWithSingleOpponentOption:0,
 allSourcePositiveActionsIndependentlyValidated:0,
 allOpponentPhysicalReplyBranchesChecked:0,
 ownerWinImmediatelyNextTurnEveryBranch:0,
 sourceSetSvsPhysicalDiscrepancies:0,
 sourceSetZvsPhysicalDiscrepancies:0,
 falseSourceWinOrDrawOrOpponentImmediateWin:0,
 independentPhysicalMinimaxReferenceCalls:0,independentPhysicalMinimaxReferenceStates:0,
 independentlyValuedLatePositiveActions:0,independentMinimaxMismatch:0,
 totalSourceGameValueQueries:0,totalSourceFutureGameStates:0,
 savedProofExamples:[],
 seenGift:null,seenNewStack:null,
 canonical:[],summaryByPly:{},
 finalSeed:null
};
const memo=new Map(),seen=new Set();
function independentPerfectWDL(s){
 stats.independentPhysicalMinimaxReferenceCalls++;
 if(s.winner!==null)return s.winner===2?0:s.winner===0?1:-1;
 const k=s.P[0].toString(16)+'|'+s.P[1].toString(16);
 if(memo.has(k))return memo.get(k);
 stats.independentPhysicalMinimaxReferenceStates++;
 let value=s.n%2===0?-1:1;
 for(const c of legal(s)){
  const v=independentPerfectWDL(physicalStep(s,c));
  value=s.n%2===0?Math.max(value,v):Math.min(value,v);
 }
 memo.set(k,value);return value;
}
function sample(s,canonical=false){
 if(s.winner!==null||s.n>=N)throw Error('not genuine nonterminal source');
 const key=s.P[0].toString(16)+'|'+s.P[1].toString(16);
 if(seen.has(key))return;seen.add(key);
 stats.realFirstWinStoppedSourceRoots++;
 const p=s.n&1,originalQ=qcore.fromPhysical({h:s.h,p0:s.P[0],p1:s.P[1]});
 const result=producer.compute(originalQ);
 stats.originalLegalFirstActionsSourceScanned+=result.statistics.literalCurrentActionMaskScans;
 if(canonical)stats.canonical.push({history:s.history,ply:s.n,status:result.status,
  validAction:result.selectedOriginalLiteralColumn,
  witnessedForms:result.sourceWitnessCounts});
 const slot=stats.summaryByPly[s.n]??(stats.summaryByPly[s.n]={sources:0,positive:0,gifts:0,stacked:0});
 slot.sources++;if(result.status==='VALID_CONTINUATION')slot.positive++;
 for(const proof of result.sourceProvenWinActions){
  stats.sourceProvenMateInAtMostThreeActionCount++;
  const a=proof.literalAction-1,next=physicalStep(s,a);
  if(proof.kind==='IMMEDIATE_OWNER_FIRST_WIN'){
   stats.directImmediateOwnerFirstWin++;
   if(next.winner!==p){stats.falseSourceWinOrDrawOrOpponentImmediateWin++;throw Error('false source immediate win');}
   stats.allSourcePositiveActionsIndependentlyValidated++;
   continue;
  }
  stats.sourceProvenNonImmediateActionCount++;
  if(proof.kind==='TWO_DISTINCT_CURRENT_WIN_TARGETS')stats.ordinaryTwoColumnFork++;
  if(proof.kind==='SAME_COLUMN_STACKED_RELEASE'){stats.newStackedSingleColumnRelease++;slot.stacked++;}
  if(proof.kind==='ALL_OPPONENT_REPLIES_RELEASE_NEXT_WIN'){
   stats.allOpponentRepliesReleaseGift++;slot.gifts++;
   if(proof.opponentLiteralReplyColumns.length>=2)stats.giftWithMultipleOpponentOptions++;
   else stats.giftWithSingleOpponentOption++;
  }
  if(next.winner!==null){stats.falseSourceWinOrDrawOrOpponentImmediateWin++;throw Error('false source nonimmediate-first-action');}
  const physicalS=hypotheticalImmediateWinningColumns(next,p).sort((a,b)=>a-b);
  if(physicalS.join(',')!==proof.currentPlayableOwnerWinTargetColumns.join(',')){
   stats.sourceSetSvsPhysicalDiscrepancies++;throw Error('S source q vs physical p singletons mismatch');
  }
  const physicalZ=[];
  for(const d of legal(next)){
   const firstRow=next.h[d],topRow=firstRow+1;
   if(topRow>=H)continue;
   // Counterfactual p placement AFTER an o blocking cell is placed
   // at firstRow. p's prior stones stay exactly unchanged.
   const id=topRow*W+d,withP=next.P[p]|bit(d,topRow);
   if(lineThrough[id].some(g=>(withP&g)===g))physicalZ.push(d+1);
  }
  if(physicalZ.join(',')!==proof.opponentReplyReleaseOwnerWinTargetColumns.join(',')){
   stats.sourceSetZvsPhysicalDiscrepancies++;throw Error('Z source q vs physical p release mismatch');
  }
  for(const d of legal(next)){
   stats.allOpponentPhysicalReplyBranchesChecked++;
   const afterO=physicalStep(next,d);
   if(afterO.winner!==null){
    stats.falseSourceWinOrDrawOrOpponentImmediateWin++;
    throw Error('opponent won or game prematurely drew despite source guard');
   }
   const replies=legal(afterO).map(c=>physicalStep(afterO,c)).filter(x=>x.winner===p);
   if(!replies.length){
    stats.falseSourceWinOrDrawOrOpponentImmediateWin++;
    throw Error('source response-cover failed independent actual physical opponent reply');
   }
   stats.ownerWinImmediatelyNextTurnEveryBranch++;
  }
  stats.allSourcePositiveActionsIndependentlyValidated++;
  if(proof.kind==='ALL_OPPONENT_REPLIES_RELEASE_NEXT_WIN'&&!stats.seenGift)
   stats.seenGift={history:s.history,ply:s.n,proof,opponentReplies:legal(next).map(x=>x+1)};
  if(proof.kind==='SAME_COLUMN_STACKED_RELEASE'&&!stats.seenNewStack)
   stats.seenNewStack={history:s.history,ply:s.n,proof};
  if(stats.savedProofExamples.length<18&&(proof.kind==='ALL_OPPONENT_REPLIES_RELEASE_NEXT_WIN'||
     proof.kind==='SAME_COLUMN_STACKED_RELEASE')){
   stats.savedProofExamples.push({history:s.history,ply:s.n,proof});
  }
  if(s.n>=35&&stats.independentlyValuedLatePositiveActions<80){
   const v=independentPerfectWDL(next);
   stats.independentlyValuedLatePositiveActions++;
   if(v!==(p===0?1:-1)){stats.independentMinimaxMismatch++;throw Error('physical independent perfect WDL disagrees source');}
  }
 }
}
for(const history of ['','4','44444','444444','444441','4444442']){
 let s=initial();for(const d of history)s=physicalStep(s,Number(d)-1);
 if(s.winner!==null)throw Error('canonical should not yet first-win');
 sample(s,true);
}
for(let game=0;game<4100;game++){
 stats.sampledNonwinningTrajectories++;
 let s=initial();
 while(s.winner===null&&s.n<N){
  sample(s);
  const alive=legal(s).map(c=>physicalStep(s,c)).filter(x=>x.winner===null);
  if(!alive.length)break;
  s=alive[rand()%alive.length];
 }
}
stats.uniquePhysicalRoots=seen.size;stats.finalSeed=seed;
console.log(JSON.stringify(stats,null,2));
