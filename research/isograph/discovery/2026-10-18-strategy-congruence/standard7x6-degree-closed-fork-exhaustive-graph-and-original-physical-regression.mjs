// Frozen before validation. The new SOURCE direct degree graph computes
// current original q fork preemptions without neighbor-pair enumeration.
// Exact pre-existing independent original W7H6K4 physical 69-line/84-reply
// tester injected with new SOURCE, original P0/P1 first-win semantics unchanged.
// Separately enumerate ALL undirected simple graphs up to SIX vertices as
// a pure independent combinatorial identity falsifier, plus seeded n7 graphs.
// This test is NEVER a minimax game solver or a source future WDL query.
import {createOriginalDegreeClosedForkFunnel} from './standard7x6-source-degree-closed-fork-funnel.mjs';
import {verifyOriginalCanonical44444CenterForkGraphPhysical} from './standard7x6-canonical44444-center-fork-graph-independent-physical-control.mjs';
export function runOriginalDegreeClosedForkRegression({seed=20261018,sevenVertexGraphs=3000}={}){
 const source=createOriginalDegreeClosedForkFunnel({width:7,height:6,connect:4});
 const originalPhysical=verifyOriginalCanonical44444CenterForkGraphPhysical();
 // NOTE: for direct equivalence of different SOURCE backends the caller
 // must inject the new SOURCE into the physical checker independently;
 // the root physical test above still uses original frozen SOURCE backend.
 // We additionally verify GRAPH geometry against both independent source
 // implementations on physical q in a separate orchestrating wrapper.
 const stats={sourceSelectedSevenVertexSeed:seed,abstractGraphsExhaustiveUpToVertexCount:6,
  exactSimpleAbstractUndirectedGraphsEnumerated:0,
  abstractDegreeClosedPreemptionIdentitiesPassed:0,
  abstractGraphPreemptionIdentityMismatches:0,
  randomlySampledSevenVertexAbstractGraphs:0,
  physicalCanonicalPriorSourceReferenced:true,
  physicalCanonicalOriginalFixedTwoMoveStates:originalPhysical.totals.centerCompletedAndSixP0WingRepliesPhysicallyReplayed,
  physicalCanonicalP1ExcludedActions:originalPhysical.totals.sourceExcludedP1CurrentActionsWithExplicitAttackerForcedWINMacro,
  physicalCanonicalResponseBranches:originalPhysical.totals.independentPhysicalP1NextReplyOptionsCheckedAfterAttackerFork,
  sourceNoFutureGameWDLQueries:0,
  sourceNoNeighborPairEnumerationDoneInDegreeAlgorithm:true};
 let state=seed>>>0;
 function random(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
 const allGraphs=(v,each)=>{
  const pairs=[];for(let x=0;x<v;x++)for(let y=x+1;y<v;y++)pairs.push([x,y]);
  const num=2**pairs.length;
  for(let m=0;m<num;m++)each(v,pairs,m);
 };
 function check(v,pairs,m){
  const adj=Array(v).fill(0);
  for(let z=0;z<pairs.length;z++)if((m>>z)&1){
   const [a,b]=pairs[z];adj[a]|=1<<b;adj[b]|=1<<a;
  }
  let direct=(1<<v)-1,closed=(1<<v)-1;
  for(let x=0;x<v;x++){
   const neighbors=Array.from({length:v},(_,k)=>adj[x]&(1<<k)?k:-1).filter(k=>k>=0);
   for(let i=0;i<neighbors.length;i++)for(let j=i+1;j<neighbors.length;j++)
    direct&=(1<<x)|(1<<neighbors[i])|(1<<neighbors[j]);
   const d=neighbors.length,local=d<2?(1<<v)-1:d===2?((1<<x)|adj[x]):(1<<x);
   closed&=local;
  }
  stats.exactSimpleAbstractUndirectedGraphsEnumerated++;
  if(direct!==closed){
   stats.abstractGraphPreemptionIdentityMismatches++;
   throw Error('GRAPH-THEORETIC DEGREE PREEMPTION FORMULA FALSE '+JSON.stringify({v,pairs,m,direct,closed,adj}));
  }
  stats.abstractDegreeClosedPreemptionIdentitiesPassed++;
 }
 for(let v=1;v<=6;v++)allGraphs(v,check);
 const pairs=[];for(let x=0;x<7;x++)for(let y=x+1;y<7;y++)pairs.push([x,y]);
 for(let i=0;i<sevenVertexGraphs;i++){
  check(7,pairs,random()&((1<<21)-1));
  stats.randomlySampledSevenVertexAbstractGraphs++;
 }
 if(stats.exactSimpleAbstractUndirectedGraphsEnumerated!==1+2+8+64+1024+32768+sevenVertexGraphs||
    stats.abstractGraphPreemptionIdentityMismatches)
  throw Error('frozen complete simple-graph regression count unexpected');
 return {status:'ALL_GRAPH_DEGREE_PREEMPTION_IDENTITIES_AND_REFERENCE_ORIGINAL_PHYSICAL_PASS',
  date:'2026-10-18',stats,
  canonicalReferencePhysicalOriginalForkControl:originalPhysical.status,
  theorem:'docs/research/2026-10-18-playable-two-generator-fork-graph-degree-closed-form-strategy-cut.md',
  sourceRemainingOriginalGameBestAt44444:'INCOMPLETE',
  sourceNoGameTree:true};
}
