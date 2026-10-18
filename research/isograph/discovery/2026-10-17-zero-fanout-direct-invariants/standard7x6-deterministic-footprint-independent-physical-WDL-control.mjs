// FROZEN pre-test: independent physical7x6 original board minimax
// + single deterministic incidence-footprint source transport from ONE q.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createDeterministicFootprintWdlSource} from './standard7x6-source-deterministic-column-footprint-WDL-order.mjs';
// FROZEN BEFORE independent TRUE ORIGINAL 7x6 physical minimax control.
// Source-first weak WDL J_2<=J_7 after history below via complete
// capacity-preserving but NON-GEOMETRIC column map [1,5,6,4,7,2,3].
// Physical validator deliberately uses NO source-q, source mask, or
// transport solver. Its recursion is REFERENCE ONLY, not source proof.
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
const history='1555271171452354215737327342666366';
const sourceCertified={lowerP0RelativeOriginalLiteralAction:2,
 upperP0RelativeOriginalLiteralAction:7,
 sourceOneBasedWholeColumnMapping:[1,5,6,4,7,2,3],
 sourceFirstWinStoppedRank:34,
 sourceExpectedHeights:[5,5,5,3,6,5,5]};
const incidence=Array.from({length:N},()=>[]);let winlineCount=0;
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  if(c+(K-1)*dx>=W||r+(K-1)*dy<0||r+(K-1)*dy>=H)continue;
  let mask=0n,ids=[];
  for(let k=0;k<K;k++){
   const id=(r+k*dy)*W+c+k*dx;mask|=bit(c+k*dx,r+k*dy);ids.push(id);
  }
  for(const id of ids)incidence[id].push(mask);
  winlineCount++;
 }
if(winlineCount!==69)throw Error('independent physical 7x6 has wrong 69 K-lines');
function initial(){return {h:Array(W).fill(0),P:[0n,0n],n:0,terminal:null,history:''};}
function legal(s){return s.h.flatMap((r,c)=>r<H?[c]:[]);}
function step(s,c){
 if(s.terminal!==null||!Number.isInteger(c)||c<0||c>=W||s.h[c]>=H)
  throw Error('physical invalid gravity or move after first terminal');
 const p=s.n&1,r=s.h[c],id=r*W+c,h=s.h.slice(),P=s.P.slice();
 h[c]++;P[p]|=bit(c,r);
 const win=incidence[id].some(G=>(P[p]&G)===G);
 return {h,P,n:s.n+1,terminal:win?(p===0?1:-1):s.n+1===N?0:null,
  history:s.history+String(c+1)};
}
const memo=new Map(),stats={
 schema:'connect4.true7x6.nongeometric_source_transport_first_witness_independent_physical_WDL_v0_1',
 rank:null,originalCurrentMover:null,originalHeights:null,legalFirstActions:[],
 physicalKLines:winlineCount,physicalTerminalShortCircuitChecks:0,
 fullRecursiveRootValueCalls:0,physicalReferenceStates:0,
 physicalActionWDLExactValues:[],
 sourceWeakWdlInequalityPhysicallyVerified:false,
 sourceWeakWdlInequalityStrict:false,
 sourceUpperP0ValueActionActuallyBest:false,
 sourceLegacyProofWasNeededForBestAction:false,
 anyOriginalIllegalGravityOrEarlyFirstWin:false
};
function key(s){return s.P[0].toString(16)+'|'+s.P[1].toString(16);}
function WDL(s){
 stats.fullRecursiveRootValueCalls++;
 if(s.terminal!==null)return s.terminal;
 const k=key(s);if(memo.has(k))return memo.get(k);
 stats.physicalReferenceStates++;
 let v=(s.n&1)?1:-1;
 for(const c of legal(s)){
  const val=WDL(step(s,c));v=(s.n&1)?Math.min(v,val):Math.max(v,val);
 }
 memo.set(k,v);return v;
}

// ACTUAL true7x6 independent original physical source test of
// ONE deterministic incidence-footprint mapping per action pair.
// The physical WDL engine above is a separate board implementation.
// No root/action WDL supplied to SOURCE proof.
const sourceCore=createExactQCore({width:W,height:H,connect:K}),
 predictor=createDeterministicFootprintWdlSource({width:W,height:H,connect:K});
const counts={
 schema:'connect4.true7x6.deterministic_footprint_original_q_single_column_map_v0_1',
 date:'2026-10-18',W,H,K,originalWinningLines:winlineCount,
 sourceFixtureNongeometricHistory:history,
 samplePhysicalNonwinningGames:0,sourceRootsExamined:0,
 sourceOriginalOrderedActionPairs:0,
 sourceSingleCandidateMappingsConstructed:0,
 sourcePositiveWdlWeakEdges:0,sourceDirectBestRootSelections:0,
 sourceNoEnumerationOfColumnPermutationCandidates:true,
 sourceFutureCompetingGameValuesQueried:0,
 independentlyPhysicallyCheckedWeakEdges:0,
 independentlyPhysicallyCheckedBestRoots:0,
 falseWeakEdges:0,falseBestRootSelections:0,
 sourceDeterministicOldWitnessPairMapping:null,
 sourceOldWitnessPairSourceGuardQualified:false,
 firstPositiveNongeometricMapping:null,
 firstPositiveBestRootExample:null,
 oldFixtureIndependentPhysicalFirstActionVector:null,
 sourceMaskWork:0,
 finalSeed:null
};
let original=initial();
for(const digit of history){
 original=step(original,Number(digit)-1);
 if(original.terminal!==null)throw Error('frozen real rank34 history ended earlier than first-win stopped');
}
const fixtureQ=sourceCore.fromPhysical({h:original.h,p0:original.P[0],p1:original.P[1]});
const fixtureResult=predictor.compute(fixtureQ,{debugPair:[2,7]});
counts.sourceDeterministicOldWitnessPairMapping=fixtureResult.debugMapping[0]??null;
counts.sourceOldWitnessPairSourceGuardQualified=
 fixtureResult.sourceProvedWeakP0RelativeActionEdges.some(e=>
   e.sourceLowerP0ValueOriginalLiteralColumn===2&&
   e.sourceUpperP0ValueOriginalLiteralColumn===7);
counts.oldFixtureIndependentPhysicalFirstActionVector=
 legal(original).map(c=>[c+1,WDL(step(original,c))]);
if(counts.sourceOldWitnessPairSourceGuardQualified){
 const map=new Map(counts.oldFixtureIndependentPhysicalFirstActionVector);
 if(map.get(2)>map.get(7))throw Error('source direct fingerprint weak WDL certificate contradicted physical oracle');
}
const seen=new Set();let randomSeed=0x17020218>>>0;
function randomIndex(length){
 randomSeed=(Math.imul(randomSeed,1664525)+1013904223)>>>0;
 return randomSeed%length;
}
function inspect(s){
 if(s.terminal!==null||s.n<33||legal(s).length<2)return;
 const id=key(s);if(seen.has(id))return;seen.add(id);
 const q=sourceCore.fromPhysical({h:s.h,p0:s.P[0],p1:s.P[1]});
 const proof=predictor.compute(q);
 counts.sourceRootsExamined++;
 counts.sourceOriginalOrderedActionPairs+=proof.statistics.originalOrderedActionPairsConsidered;
 counts.sourceSingleCandidateMappingsConstructed+=proof.statistics.singleCandidateSourceColumnMapsConstructed;
 counts.sourcePositiveWdlWeakEdges+=proof.statistics.certifiedCurrentP0RelativeWeakOrderEdges;
 counts.sourceMaskWork+=proof.statistics.exactSourceGeneratorSubsetTests;
 counts.sourceFutureCompetingGameValuesQueried+=proof.statistics.sourceIndependentlyValuedStrategicFutureGames;
 if(proof.status==='VALID_CONTINUATION'){
  counts.sourceDirectBestRootSelections++;
  if(!counts.firstPositiveBestRootExample)
   counts.firstPositiveBestRootExample={
    history:s.history,n:s.n,sourceBestOriginalLiteral:proof.selectedBestOriginalLiteralColumn,
    weakEdges:proof.sourceProvedWeakP0RelativeActionEdges};
 }
 if(!proof.sourceProvedWeakP0RelativeActionEdges.length&&proof.status!=='VALID_CONTINUATION')return;
 if(s.n<35||counts.independentlyPhysicallyCheckedWeakEdges>1300||
   counts.independentlyPhysicallyCheckedBestRoots>180)return;
 const vals=legal(s).map(c=>[c+1,WDL(step(s,c))]),MapV=new Map(vals);
 for(const edge of proof.sourceProvedWeakP0RelativeActionEdges){
  counts.independentlyPhysicallyCheckedWeakEdges++;
  if(MapV.get(edge.sourceLowerP0ValueOriginalLiteralColumn)>
     MapV.get(edge.sourceUpperP0ValueOriginalLiteralColumn)){
   counts.falseWeakEdges++;
   throw Error('independent physical WDL REFUTES deterministic fingerprint source edge: '+s.history);
  }
  if(!counts.firstPositiveNongeometricMapping&&
     edge.deterministicSingleMappingOriginalOneBased.some((v,i)=>v!==i+1)&&
     edge.deterministicSingleMappingOriginalOneBased.some((v,i)=>v!==W-i)){
   counts.firstPositiveNongeometricMapping={
    history:s.history,n:s.n,edge,independentPhysicalFirstActionValues:vals};
  }
 }
 if(proof.status==='VALID_CONTINUATION'){
  counts.independentlyPhysicallyCheckedBestRoots++;
  const V=(s.n&1)===0?Math.max(...MapV.values()):Math.min(...MapV.values());
  if(MapV.get(proof.selectedBestOriginalLiteralColumn)!==V){
   counts.falseBestRootSelections++;
   throw Error('independent physical WDL refuted deterministic footprint best root action');
  }
 }
}
for(let game=0;game<2200;game++){
 counts.samplePhysicalNonwinningGames++;
 let s=initial();
 while(s.terminal===null){
  inspect(s);
  const choices=legal(s).map(c=>step(s,c)).filter(x=>x.terminal===null);
  if(!choices.length)break;
  s=choices[randomIndex(choices.length)];
 }
}
counts.finalSeed=randomSeed;
counts.status='SAMPLED_TRUE7X6_DETERMINISTIC_FOOTPRINT_SOURCE_WDL_PHYSICAL_FALSIFIER_COMPLETED';
console.log(JSON.stringify(counts,null,2));
