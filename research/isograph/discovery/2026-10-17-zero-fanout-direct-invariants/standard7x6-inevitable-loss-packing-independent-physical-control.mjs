// Frozen independent ORIGINAL TRUE7x6 physical WDL control of source
// inevitable-loss fractional winning-line packing. Source no q futures,
// independent physical recursive oracle used ONLY AFTER positive source.
import {createOriginalSourceInevitableLossBest} from './standard7x6-inevitable-loss-source-dual-packing.mjs';
import {createSourceFractionalTransversal} from './standard7x6-source-fractional-transversal.mjs';
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),
 geom={width:W,height:H,connect:K},
 source=createOriginalSourceInevitableLossBest(geom),core=createExactQCore(geom);
const byCell=Array.from({length:N},()=>[]);let nLines=0;
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  if(c+(K-1)*dx>=W||r+(K-1)*dy<0||r+(K-1)*dy>=H)continue;
  let mask=0n,ids=[];
  for(let j=0;j<K;j++){const id=(r+j*dy)*W+c+j*dx;mask|=bit(c+j*dx,r+j*dy);ids.push(id);}
  for(const id of ids)byCell[id].push(mask);nLines++;
 }
if(nLines!==69||core.lineCount!==69)throw Error('wrong Connect4 physical geometry');
const blank=()=>({h:Array(W).fill(0),P:[0n,0n],n:0,hist:'',ended:null});
const legal=s=>s.h.flatMap((z,c)=>z<H?[c]:[]);
function move(s,c){
 if(s.ended!==null||s.h[c]>=H)throw Error('illegal physical first-win continuation');
 const p=s.n&1,r=s.h[c],id=r*W+c,h=s.h.slice(),P=s.P.slice();
 h[c]++;P[p]|=bit(c,r);
 const win=byCell[id].some(m=>(P[p]&m)===m);
 return {h,P,n:s.n+1,hist:s.hist+String(c+1),ended:win?(p===0?1:-1):s.n+1===N?0:null};
}
let seed=0x13D4726F>>>0;
const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
const memo=new Map();
const stats={
 schema:'connect4.standard7x6.inevitable_loss_original_dual_L2_all_actions_v0_1',
 W,H,K,sourceSampleSeed:seed,randomNonwinningPhysicalTrajectories:0,
 originalPhysicalFirstWinStoppedSourceRoots:0,uniqueActualPhysicalRoots:0,
 candidateSourceRootsEvaluated:0,sourceMOverWinGeneratorsEmpty:0,
 certifiedRootCurrentPlayerInevitableLoss:0,
 certifiedOriginalLiteralLegalBestActions:0,
 positiveRootsWithMultipleLegalActions:0,
 firstSourcePositive:null,sourceStaticWeightVectorsAttempted:0,
 sourcePackingPerCellChecks:0,
 independentFullPhysicalWDLCheckedRoots:0,independentFullPhysicalWDLCheckedFirstActions:0,
 independentReferenceCalls:0,independentReferenceStates:0,
 physicalRootWDLDisagreements:0,physicalActionWDLDisagreements:0,
 sourceFutureGameValueQueries:0,sourceFutureGameStatesCreated:0,
 canonical:[],positiveSampleWitnesses:[],finalSeed:null
};
function key(s){return s.P[0].toString(16)+'|'+s.P[1].toString(16);}
function plain(s){
 stats.independentReferenceCalls++;
 if(s.ended!==null)return s.ended;
 const k=key(s);if(memo.has(k))return memo.get(k);
 stats.independentReferenceStates++;
 let v=(s.n&1)?1:-1;
 for(const a of legal(s)){
  const score=plain(move(s,a));v=(s.n&1)?Math.min(v,score):Math.max(v,score);
 }
 memo.set(k,v);return v;
}
const seen=new Set();
function inspect(s,isCanon=false){
 const k=key(s);
 if(seen.has(k))return;
 seen.add(k);stats.originalPhysicalFirstWinStoppedSourceRoots++;
 if(s.n<28){if(isCanon)stats.canonical.push({history:s.hist,sourceNotEvaluatedUntilRank28:true});return;}
 const q=core.fromPhysical({h:s.h,p0:s.P[0],p1:s.P[1]});
 if(q[s.n%2===0?'R0':'R1'].length===0)stats.sourceMOverWinGeneratorsEmpty++;
 const proof=source.compute(q);stats.candidateSourceRootsEvaluated++;
 stats.sourceStaticWeightVectorsAttempted+=proof.statistics.staticOriginalFractionalPackingWitnessAttempts||0;
 stats.sourcePackingPerCellChecks+=proof.statistics.staticPerCellPackingLoadChecks||0;
 if(isCanon)stats.canonical.push({history:s.hist,source:proof.status});
 if(proof.status!=='VALID_CONTINUATION')return;
 stats.certifiedRootCurrentPlayerInevitableLoss++;
 stats.certifiedOriginalLiteralLegalBestActions+=legal(s).length;
 if(legal(s).length>1)stats.positiveRootsWithMultipleLegalActions++;
 const winner=(s.n&1)===0?-1:1;
 if(proof.exactRootP0RelativeWDL!==winner||proof.allOriginalLiteralLegalBestMoves.join(',')!==
    legal(s).map(c=>c+1).join(','))throw Error('source all-losing action labeling wrong');
 if(!stats.firstSourcePositive)stats.firstSourcePositive={history:s.hist,ply:s.n,
  sourceMover:s.n&1,literalActions:proof.allOriginalLiteralLegalBestMoves,packing:proof.opponentHypergraphExcessProof};
 if(stats.positiveSampleWitnesses.length<12)
  stats.positiveSampleWitnesses.push({history:s.hist,ply:s.n,
   sourceMover:s.n&1,allLossBestMoves:proof.allOriginalLiteralLegalBestMoves,
   rationalPackingDenominator:proof.opponentHypergraphExcessProof.denominator,
   rationalPackingNumeratorSum:proof.opponentHypergraphExcessProof.sumNumerator,
   currentMoverRemainingBlockingTurns:proof.moverTurnsAvailableUntilFullBoard});
 if(s.n>=35&&stats.independentFullPhysicalWDLCheckedRoots<130){
  stats.independentFullPhysicalWDLCheckedRoots++;
  if(plain(s)!==winner){stats.physicalRootWDLDisagreements++;throw Error('physical root does not force source opponent win');}
  for(const a of legal(s)){
   stats.independentFullPhysicalWDLCheckedFirstActions++;
   if(plain(move(s,a))!==winner){
    stats.physicalActionWDLDisagreements++;throw Error('source ALL losing best labels not true physical WDL');}
  }
 }
}
for(const hist of ['','4','44444','444444','444441','4444442']){
 let s=blank();for(const c of hist)s=move(s,Number(c)-1);
 if(s.ended!==null)throw Error('canonical terminal');
 inspect(s,true);
}
for(let game=0;game<1600;game++){
 stats.randomNonwinningPhysicalTrajectories++;
 let s=blank();
 while(s.ended===null&&s.n<N){
  inspect(s);
  const future=legal(s).map(c=>move(s,c)).filter(x=>x.ended===null);
  if(!future.length)break;
  s=future[rand()%future.length];
 }
}
stats.uniqueActualPhysicalRoots=seen.size;stats.finalSeed=seed;
console.log(JSON.stringify(stats,null,2));
