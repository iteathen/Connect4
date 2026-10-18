// FROZEN independent actual 7x6 physical WDL reference for one certified
// DRAW Level2 continuation. Physical first-win K-lines independently built.
// Source only original q root/pair proofs, zero strategic future value queries.
// Validation reference recurses min/max ONLY on late positions after source.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createRootNoForceWinSingleDrawWitness} from './standard7x6-one-action-root-noforce-win-draw-certificate.mjs';
import {createGlobalNoWinBound} from './global-no-win-bound.mjs';
import {createCoReleaseGlobalNoWinBound} from './co-release-global-no-win-bound.mjs';
import {createCoReleaseAfterFirstMoveNonlossBounds} from './co-release-after-first-move-nonloss-bounds.mjs';
import {createCoReleasePairBlockProof} from './co-release-pair-block-proof.mjs';
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),
 geometry={width:W,height:H,connect:K},
 core=createExactQCore(geometry),source=createRootNoForceWinSingleDrawWitness(geometry);
const lines=[],incidence=Array.from({length:N},()=>[]);
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  if(c+(K-1)*dc>=W||r+(K-1)*dr<0||r+(K-1)*dr>=H)continue;
  let mask=0n,ids=[];
  for(let j=0;j<K;j++){let id=(r+dr*j)*W+c+dc*j;mask|=bit(c+dc*j,r+dr*j);ids.push(id);}
  lines.push(mask);for(const id of ids)incidence[id].push(mask);
 }
if(lines.length!==69||core.lineCount!==69)throw Error('incorrect physical original K-windows');
const initial=()=>({h:Array(W).fill(0),P:[0n,0n],n:0,hist:'',ended:null});
const legal=s=>s.h.flatMap((r,c)=>r<H?[c]:[]);
function move(s,c){
 if(s.ended!==null||c<0||c>=W||s.h[c]>=H)throw Error('illegal original physical move');
 const r=s.h[c],p=s.n&1,h=s.h.slice(),P=s.P.slice();h[c]++;P[p]|=bit(c,r);
 const win=incidence[r*W+c].some(m=>(P[p]&m)===m);
 return {h,P,n:s.n+1,hist:s.hist+String(c+1),ended:win?(p===0?1:-1):s.n+1===N?0:null};
}
let seed=0x154AC7D3>>>0;
const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
const memo=new Map();
const stats={
 schema:'connect4.standard7x6.root_no_force_win_plus_action_nonloss_draw_v0_1',
 date:'2026-10-17',board:{W,H,K,originalKWindows:69},seedStart:seed,
 gameHistoriesSampled:0,actual7x6PhysicalRootsVisited:0,
 distinctGenuineRealNonterminalRoots:0,sourceEvaluatedCandidateRoots:0,
 rootNoForcedWinSourceCertified:0,sourceSelectedBestDrawRootActions:0,
 sourceSelectedRootNoWinByExtinction:0,sourceSelectedRootNoWinByPairing:0,
 selectedActionSourceNoLossByPairing:0,selectedActionSourceNoLossByTotalOriginalBlocker:0,
 firstSelectedDrawSourceWitness:null,firstSelectedDrawBeyondFullExtinction:null,
 selectedDrawActionsOriginalLiteralColumns:[],
 sourceFutureStrategicGameValueCalls:0,sourceAlternativeFutureGameStatesCreated:0,
 sourceStaticPairWorkTotal:0,sourceOriginalLiteralActionScans:0,
 sourceBudgetIncomplete:0,
 physicalRecursiveReferenceRootsVerified:0,physicalRootDrawWrong:0,
 physicalActionDrawWrong:0,referenceRecursiveCalls:0,referenceUniqueStates:0,
 physicalDrawWitnessExamples:[],canonical:[],sourceNoWinButActionNotCertified:0,
 finalSeed:null};
function key(s){return s.P[0].toString(16)+'|'+s.P[1].toString(16);}
function plainWDL(s){
 stats.referenceRecursiveCalls++;
 if(s.ended!==null)return s.ended;
 const k=key(s);
 if(memo.has(k))return memo.get(k);
 stats.referenceUniqueStates++;
 let V=(s.n&1)===0?-1:1;
 for(const c of legal(s)){
  const v=plainWDL(move(s,c));
  V=(s.n&1)===0?Math.max(V,v):Math.min(V,v);
 }
 memo.set(k,V);return V;
}
const visited=new Set();
function check(s,isCanon=false){
 const k=key(s);
 if(visited.has(k))return;visited.add(k);
 stats.actual7x6PhysicalRootsVisited++;
 if(s.ended!==null||s.n===N)throw Error('source root not first-win-stopped nonterminal');
 if(s.n<31)return;
 const q=core.fromPhysical({h:s.h,p0:s.P[0],p1:s.P[1]});
 const result=source.compute(q,{maxOperations:4000,maxMs:8,maxStaticPairings:400});
 stats.sourceEvaluatedCandidateRoots++;
 stats.sourceBudgetIncomplete+=result.statistics.sourceProofTimeBudgetIncomplete;
 stats.sourceStaticPairWorkTotal+=(result.statistics.staticGlobalPairingWork||0)+
  (result.statistics.coReleaseGlobalOriginalProofWork||0)+
  (result.statistics.staticPostActionPairProofWork||0);
 stats.sourceOriginalLiteralActionScans+=result.statistics.originalLiteralActionsConsideredForNoLoss;
 if(isCanon)stats.canonical.push({hist:s.hist,status:result.status,reason:result.reason});
 if(result.rootNoForcedWinProved)stats.rootNoForcedWinSourceCertified++;
 if(result.status!=='VALID_CONTINUATION'){
  if(result.rootNoForcedWinProved)stats.sourceNoWinButActionNotCertified++;
  return;
 }
 stats.sourceSelectedBestDrawRootActions++;
 const a=result.selectedOriginalLiteralColumn-1;
 if(result.rootSourceProof.kind==='ROOT_MOVER_NO_ORIGINAL_SURVIVING_K_LINE')
  stats.sourceSelectedRootNoWinByExtinction++;
 else stats.sourceSelectedRootNoWinByPairing++;
 const reasons=result.chosenActionNonLossSourceProof.sourceConsequenceReasons??[];
 if(reasons.some(r=>r.kind.includes('PAIR_DEFENSE')))
  stats.selectedActionSourceNoLossByPairing++;
 if(reasons.some(r=>r.kind.includes('BLOCKS_ALL')))
  stats.selectedActionSourceNoLossByTotalOriginalBlocker++;
 if(!stats.firstSelectedDrawSourceWitness)
  stats.firstSelectedDrawSourceWitness={hist:s.hist,ply:s.n,mover:s.n&1,
   action:a+1,rootProof:result.rootSourceProof.kind,actionReasons:reasons.map(z=>z.kind)};
 if(result.rootSourceProof.kind!=='ROOT_MOVER_NO_ORIGINAL_SURVIVING_K_LINE'&&
   !stats.firstSelectedDrawBeyondFullExtinction)
  stats.firstSelectedDrawBeyondFullExtinction={hist:s.hist,ply:s.n,mover:s.n&1,
   action:a+1,rootProof:result.rootSourceProof.kind,actionReasons:reasons.map(z=>z.kind)};
 if(stats.physicalRecursiveReferenceRootsVerified<180&&s.n>=35){
  const root=plainWDL(s),chosen=plainWDL(move(s,a));
  stats.physicalRecursiveReferenceRootsVerified++;
  if(root!==0){stats.physicalRootDrawWrong++;throw Error('source root no-win plus nonloss physically not draw');}
  if(chosen!==0){stats.physicalActionDrawWrong++;throw Error('source chosen a not exact DRAW');}
 }
 if(stats.physicalDrawWitnessExamples.length<16)stats.physicalDrawWitnessExamples.push({
  history:s.hist,ply:s.n,playerToMove:s.n&1,h:s.h,
  selectedLiteralColumn:a+1,rootNoWinSourceKind:result.rootSourceProof.kind,
  actionSourceReasons:reasons.map(z=>z.kind),
  fullBestSetNotClaimed:true
 });
}
for(const hist of ['','4','44444','444444','444441','4444442']){
 let s=initial();for(const c of hist)s=move(s,Number(c)-1);
 if(s.ended!==null)throw Error('canonical prefix terminal');
 if(s.n>=31)check(s,true);
 else stats.canonical.push({hist,sourceNotAttemptedBelowRank:31});
}
for(let run=0;run<1250;run++){
 stats.gameHistoriesSampled++;
 let s=initial();
 while(s.ended===null&&s.n<N){
  check(s);
  const choices=legal(s).map(c=>move(s,c)).filter(x=>x.ended===null);
  if(!choices.length)break;
  s=choices[rand()%choices.length];
 }
}
stats.distinctGenuineRealNonterminalRoots=visited.size;
stats.finalSeed=seed;
console.log(JSON.stringify(stats,null,2));
