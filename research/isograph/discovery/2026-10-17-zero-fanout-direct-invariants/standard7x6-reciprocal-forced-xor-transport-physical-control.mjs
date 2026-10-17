// INDEPENDENT ACTUAL STANDARD 7x6 PHYSICAL CONTROL.
// Frozen before execution. Physical reference recursively branches only
// AFTER source-only reciprocal forced-response proof reports classifications.
// Exact theorem docs/research/2026-10-17-7x6-reciprocal-forced-reply-
// binary-exchange-root-theorem.md
import {createReciprocalForcedXorRoot} from './standard7x6-reciprocal-forced-xor-transport.mjs';
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
const originalLines=[],lineThrough=Array.from({length:N},()=>[]);
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]){
  const cc=c+(K-1)*dc,rr=r+(K-1)*dr;
  if(cc>=W||rr<0||rr>=H)continue;
  let mask=0n,ids=[];
  for(let j=0;j<K;j++){const id=(r+j*dr)*W+c+j*dc;ids.push(id);mask|=1n<<BigInt(id);}
  originalLines.push(mask);
  for(const id of ids)lineThrough[id].push(mask);
 }
if(originalLines.length!==69)throw Error('geometry is not standard 7x6 Connect4');
function pop(x){let k=0;for(;x;x&=x-1n)k++;return k;}
function normalize(gs){
 const ms=[...new Set(gs.map(String))].map(BigInt)
    .sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0));
 const out=[];for(const g of ms)if(!out.some(y=>(g&y)===y))out.push(g);
 return out;
}
function physicalSource(st){
 const support=st.P[0]|st.P[1],R=[[],[]];
 for(let p=0;p<2;p++)for(const m of originalLines)
  if((m&st.P[1-p])===0n)R[p].push(m&~support);
 const result={h:st.h.slice(),R0:normalize(R[0]),R1:normalize(R[1])};
 if(result.R0.includes(0n)||result.R1.includes(0n))
  throw Error('terminal position admitted as physical source');
 return result;
}
function fresh(){return {h:Array(W).fill(0),P:[0n,0n],n:0,history:''};}
function legal(st){return st.h.flatMap((x,c)=>x<H?[c]:[]);}
function next(st,c){
 if(st.h[c]===H)throw Error('illegal move');
 const h=st.h.slice(),P=st.P.slice(),row=h[c]++,id=row*W+c,p=st.n%2;
 P[p]|=bit(c,row);
 const s={h,P,n:st.n+1,last:id,lastP:p,history:st.history+String(c+1)};
 s.win=lineThrough[id].some(m=>(P[p]&m)===m);
 return s;
}
function canonical(str){
 let s=fresh();
 for(const c of str){s=next(s,Number(c)-1);if(s.win)throw Error('canonical already first-won');}
 return s;
}
// INDEPENDENT physical WDL reference; exclusively called AFTER proof returned
// and only for selected near-terminal valid true standard-board states.
const memo=new Map();
const refStats={calls:0,uniqueStates:0,memoHits:0,terminalWins:0,terminalDraws:0};
function vReference(st){
 refStats.calls++;
 if(st.win){refStats.terminalWins++;return st.lastP===0?1:-1;}
 if(st.n===N){refStats.terminalDraws++;return 0;}
 const key=st.P[0].toString(16)+'/'+st.P[1].toString(16);
 if(memo.has(key)){refStats.memoHits++;return memo.get(key);}
 refStats.uniqueStates++;
 let v=st.n%2===0?-1:1;
 for(const c of legal(st)){
  const value=vReference(next(st,c));
  v=st.n%2===0?Math.max(v,value):Math.min(v,value);
 }
 memo.set(key,v);return v;
}
const source=createReciprocalForcedXorRoot({width:W,height:H,connect:K});
let seed=0x6A72B911>>>0;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
const stats={schema:'connect4.7x6.reciprocal_forced_xor_source_transporter_control_v0_2',
 date:'2026-10-17',board:{W,H,K,geometricLines:69},seedStart:seed,
 deterministicLegalNonWinningTrajectories:0,firstWinStoppedSourcePositions:0,
 uniquePhysicalSources:0,sourceTwoCellThreatSeedPairs:0,
 guardedReciprocalForcedReplyPairs:0,rootTiesCertified:0,transporterExtraRootTies:0,
 rootWeakWDLOrdersCertified:0,sourceIncomparableReciprocalPairs:0,
 proofOperations:{originalGeneratorsScanned:0,sourceFirstThreatScans:0,sourceOrderedUpsetComparisons:0,staticFullTransportCandidates:0,staticTransportBitTests:0},
 certificateSample:[],canonical:[],referenceChecks:0,referenceRootActionPairsCompared:0,
 referenceErrors:0,referenceReciprocalMacroErrors:0,referenceRootTieErrors:0,
 referenceRootWeakOrderErrors:0,referenceStats:null,
 sourceProducerGameSemanticFutureValuesEvaluated:0,
 allSamplesActualStandard7x6:true,nonuniformLatePrefixSampling:true};
const seen=new Set();const referenceCases=[];
function inspect(st){
 if(st.n>=N||st.win)return;
 const key=st.P[0].toString(16)+'|'+st.P[1].toString(16);
 if(seen.has(key))return;
 seen.add(key);stats.firstWinStoppedSourcePositions++;
 const proof=source.analyze(physicalSource(st));
 stats.sourceTwoCellThreatSeedPairs+=proof.stats.sourceTwoCellThreatSeeds;
 stats.guardedReciprocalForcedReplyPairs+=proof.stats.reciprocalThreatAndCounterwinGuardsPassed;
 stats.rootTiesCertified+=proof.stats.sameFullFuturePrograms+proof.stats.transportedRootTies;
 stats.transporterExtraRootTies+=proof.stats.transportedRootTies;
 stats.rootWeakWDLOrdersCertified+=proof.stats.oneWayWeakWDLOrders;
 stats.sourceIncomparableReciprocalPairs+=proof.stats.incomparable;
 stats.proofOperations.originalGeneratorsScanned+=proof.stats.originalSourceGeneratorsExamined;
 stats.proofOperations.sourceFirstThreatScans+=proof.stats.firstActionThreatScans;
 stats.proofOperations.sourceOrderedUpsetComparisons+=proof.stats.comparedFullFutureUpsetRelations;
 stats.proofOperations.staticFullTransportCandidates+=proof.stats.staticTransportFullPermutationsChecked;
 stats.proofOperations.staticTransportBitTests+=proof.stats.staticTransportBitTests;
 for(const cert of proof.certificates){
  if(stats.certificateSample.length<16)stats.certificateSample.push({history:st.history,ply:st.n,...cert});
  if(st.n>=34&&referenceCases.length<140)referenceCases.push({st,a:cert.literalA-1,b:cert.literalB-1,cert});
 }
}
for(const hist of ['44444','444444','4444442']){
 const st=canonical(hist),q=physicalSource(st),proof=source.analyze(q);
 stats.canonical.push({history:hist,n:st.n,residualCounts:[q.R0.length,q.R1.length],
  completeRootPairCertificates:proof.certificates.map(z=>[z.literalA,z.literalB,z.classification]),
  sourceTwoCellSeeds:proof.stats.sourceTwoCellThreatSeeds,
  rootWDLAndBestMoves:'UNDETERMINED_BY_THIS_SOURCE_PROOF'});
}
for(let game=0;game<2800;game++){
 stats.deterministicLegalNonWinningTrajectories++;
 let st=fresh();
 while(!st.win&&st.n<N){
  if(st.n>=12)inspect(st);
  const nonWinning=legal(st).filter(c=>!next(st,c).win);
  if(!nonWinning.length)break;
  st=next(st,nonWinning[rand()%nonWinning.length]);
 }
}
stats.uniquePhysicalSources=seen.size;
for(const {st,a,b,cert} of referenceCases){
 const rootA=next(st,a),rootB=next(st,b);
 const vA=vReference(rootA),vB=vReference(rootB);
 const qAB=next(rootA,b),qBA=next(rootB,a);
 const vAB=vReference(qAB),vBA=vReference(qBA);
 stats.referenceChecks++;stats.referenceRootActionPairsCompared++;
 if(vA!==vAB||vB!==vBA){
  stats.referenceErrors++;stats.referenceReciprocalMacroErrors++;
  throw Error('FALSE forced-response root-value macro at '+st.history);
 }
 if(cert.classification.startsWith('EXACT_ROOT_VALUE_TIE')&&vA!==vB){
  stats.referenceErrors++;stats.referenceRootTieErrors++;
  throw Error('FALSE root value tie at '+st.history);
 }
 if(cert.rootScalarOrderABlessOrEqualBA&&vA>vB ||
    cert.rootScalarOrderBAlessOrEqualAB&&vB>vA){
  stats.referenceErrors++;stats.referenceRootWeakOrderErrors++;
  throw Error('FALSE root WDL order at '+st.history);
 }
}
stats.referenceStats=refStats;stats.seedEnd=seed;
console.log(JSON.stringify(stats,null,2));
