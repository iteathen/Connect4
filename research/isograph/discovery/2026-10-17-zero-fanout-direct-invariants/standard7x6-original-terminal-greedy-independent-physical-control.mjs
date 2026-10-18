// INDEPENDENT ORIGINAL REAL 7x6 PHYSICAL source candidate FALSIFIER.
// Frozen before executing. Candidate is NOT A CERTIFIED BEST MOVE.
// Physical recursive min/max oracle branches only after CURRENT SOURCE
// original hyperedge domination guard detected and source output frozen.
// TEST STOP rule: up to 5000 nonwinning trajectories, 120 exact late
// candidate root WDL values, stop and record if any false candidate.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createTerminalGreedySourceHypothesis} from './standard7x6-original-source-terminal-greedy-dominance-candidate.mjs';
const W=7,H=6,K=4,N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),
 core=createExactQCore({width:W,height:H,connect:K}),
 source=createTerminalGreedySourceHypothesis({width:W,height:H,connect:K});
const byCell=Array.from({length:N},()=>[]);let geometricKLines=0;
for(let c=0;c<W;c++)for(let r=0;r<H;r++)
 for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  if(c+(K-1)*dx>=W||r+(K-1)*dy<0||r+(K-1)*dy>=H)continue;
  let G=0n,ids=[];
  for(let j=0;j<K;j++){const id=(r+j*dy)*W+c+j*dx;G|=bit(c+j*dx,r+j*dy);ids.push(id);}
  for(const id of ids)byCell[id].push(G);
  geometricKLines++;
 }
if(geometricKLines!==69||core.lineCount!==69)throw Error('bad original Connect4 geometry');
const blank=()=>({h:Array(W).fill(0),P:[0n,0n],n:0,hist:'',term:null});
const legal=q=>q.h.flatMap((h,c)=>h<H?[c]:[]);
function physical(q,c){
 if(q.term!==null||q.h[c]>=H)throw Error('physical invalid move/first terminal');
 const p=q.n&1,r=q.h[c],id=r*W+c,h=q.h.slice(),P=q.P.slice();
 P[p]|=bit(c,r);h[c]++;
 const won=byCell[id].some(G=>(P[p]&G)===G);
 return {h,P,n:q.n+1,hist:q.hist+String(c+1),term:won?(p===0?1:-1):q.n+1===N?0:null};
}
const stats={
 schema:'connect4.standard7x6.source_greedy_terminal_column_candidate_falsifier_v0_1',
 date:'2026-10-17',board:{W,H,K,originalWinlines:69},seedStart:0x15172427,
 physicallyValidNonwinningTrajectoryCount:0,
 genuinePhysicalFirstWinStoppedNonterminalPositions:0,
 sourceGeometricEligibilityAtLeastTwoTopColumns:0,
 distinctEligibleSourceQSeen:0,
 sourceSingletonFreeEligibilityPassed:0,
 sourceOwnerResidualTwoCellTopPairBeforeDominance:0,
 sourceDominatingPairsCandidateFound:0,
 sourceCandidateDistinctRoots:0,
 originalLegalSourceActionsCandidateTested:0,
 candidateRootsWithLateIndependentFullPhysicalWDL:0,
 independentExactRootActionWDLMismatches:0,
 independentPhysicalRootWDLEvaluations:0,
 independentPhysicalOriginalLegalFirstActionWDLEvaluations:0,
 referenceRecursiveCalls:0,referenceDistinctStates:0,
 sourceIndependentFutureGameValueQueries:0,
 firstGravityGreedyFalsifier:null,exampleCandidate:null,
 noCandidateReason:'NOT_CHECKED',byRank:{},
 lastSeed:null};
let seed=stats.seedStart>>>0;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
const memo=new Map();
function wdl(q){
 stats.referenceRecursiveCalls++;
 if(q.term!==null)return q.term;
 const k=q.P[0].toString(16)+'|'+q.P[1].toString(16);
 if(memo.has(k))return memo.get(k);
 stats.referenceDistinctStates++;
 let value=(q.n&1)===0?-1:1;
 for(const c of legal(q)){
  const a=wdl(physical(q,c));value=(q.n&1)===0?Math.max(value,a):Math.min(value,a);
 }
 memo.set(k,value);return value;
}
const inspected=new Set();
function inspect(q){
 if(q.term!==null)throw Error('physical first-win stopped source required');
 stats.genuinePhysicalFirstWinStoppedNonterminalPositions++;
 const eligible=q.h.filter(h=>h===H-1).length;
 if(eligible<2)return;
 stats.sourceGeometricEligibilityAtLeastTwoTopColumns++;
 const key=q.P[0].toString(16)+'|'+q.P[1].toString(16);
 if(inspected.has(key))return;inspected.add(key);
 stats.distinctEligibleSourceQSeen++;
 const sourceQ=core.fromPhysical({h:q.h,p0:q.P[0],p1:q.P[1]});
 const d=source.compute(sourceQ);
 stats.sourceOwnerResidualTwoCellTopPairBeforeDominance+=d.statistics.sourceOwnerTwoCellPairsThroughTopColumns;
 if(d.statistics.sourceZeroSingletonGlobalGuardPassed)stats.sourceSingletonFreeEligibilityPassed++;
 if(d.status!=='CANDIDATE_UNQUALIFIED')return;
 stats.sourceCandidateDistinctRoots++;
 stats.sourceDominatingPairsCandidateFound+=d.candidates.length;
 const spot=stats.byRank[q.n]??(stats.byRank[q.n]={candidates:0,oracle:0});
 spot.candidates++;
 if(!stats.exampleCandidate)stats.exampleCandidate={
  history:q.hist,ply:q.n,sourceRCounts:[sourceQ.R0.length,sourceQ.R1.length],
  legalOriginalColumns:legal(q).map(x=>x+1),candidates:d.candidates
 };
 if(q.n<34||stats.candidateRootsWithLateIndependentFullPhysicalWDL>=120)return;
 const p=q.n&1,root=wdl(q);
 stats.independentPhysicalRootWDLEvaluations++;stats.candidateRootsWithLateIndependentFullPhysicalWDL++;spot.oracle++;
 const all=legal(q).map(c=>{stats.independentPhysicalOriginalLegalFirstActionWDLEvaluations++;
  return {literalOriginalColumn:c+1,valueP0Relative:wdl(physical(q,c))};});
 const want=p===0?Math.max(...all.map(z=>z.valueP0Relative)):Math.min(...all.map(z=>z.valueP0Relative));
 if(root!==want)throw Error('physical ordinary reference does not satisfy root min/max');
 for(const chosen of d.candidates){
  stats.originalLegalSourceActionsCandidateTested++;
  const actual=all.find(z=>z.literalOriginalColumn===chosen.originalLiteralCandidateFirstAction);
  if(actual.valueP0Relative!==root){
   stats.independentExactRootActionWDLMismatches++;
   stats.firstGravityGreedyFalsifier={history:q.hist,ply:q.n,h:q.h,
    exactRootP0RelativeValue:root,chosenFirstAction:chosen.originalLiteralCandidateFirstAction,
    chosenActionValue:actual.valueP0Relative,allOriginalLiteralActionValues:all,
    originalSourceR0Masks:sourceQ.R0.map(String),
    originalSourceR1Masks:sourceQ.R1.map(String),
    sourceGreedyCondition:chosen};
   // Preserve counterexample as a result (do NOT discard by exception).
   return;
  }
 }
}
for(let g=0;g<5000;g++){
 stats.physicallyValidNonwinningTrajectoryCount++;
 let q=blank();
 while(q.term===null){
  inspect(q);
  if(stats.firstGravityGreedyFalsifier)break;
  const next=legal(q).map(c=>physical(q,c)).filter(z=>z.term===null);
  if(!next.length)break;
  q=next[rand()%next.length];
 }
 if(stats.firstGravityGreedyFalsifier)break;
}
stats.noCandidateReason=stats.sourceCandidateDistinctRoots?
 'SOURCE_HYPOTHESIS_FOUND_IN_NONUNIFORM_REAL7X6_ROOTS_NOT_FORMALLY_PROVEN':
 'NONE_FOUND_IN_THIS_NONUNIFORM_REAL7X6_CORPUS';
stats.lastSeed=seed;
console.log(JSON.stringify(stats,null,2));
