// Scope guard: genuine P0/P1 residual-q prefixes, one-lane nonbranching
// output and first-win/absolute-rank chronology. Source standard 7x6
// UNKNOWN must never become an unqualified Win/Draw/Loss claim.
import {createExactQCore} from '../2026-10-16-algorithmic-core/exact-q-core.mjs';
import {createSeparatedOptimalSetOneLane} from './separated-optimal-set-one-lane.mjs';
import {createDirectTwoTurnFrontier} from './direct-two-turn-frontier-operator.mjs';
export function runCanonicalZeroFanoutScopeControl() {
 const fixtures=[
  {geometry:{width:4,height:3,connect:3},prefix:'223',expectedMover:1,independentlyValidateFullGame:true},
  {geometry:{width:4,height:3,connect:3},prefix:'111',expectedMover:1,independentlyValidateFullGame:true},
  {geometry:{width:4,height:4,connect:4},prefix:'1111222',expectedMover:1,independentlyValidateFullGame:true},
  {geometry:{width:7,height:6,connect:4},prefix:'44444',expectedMover:1,independentlyValidateFullGame:false},
  {geometry:{width:7,height:6,connect:4},prefix:'444444',expectedMover:0,independentlyValidateFullGame:false},
  {geometry:{width:7,height:6,connect:4},prefix:'4444442',expectedMover:1,independentlyValidateFullGame:false}
 ],results=[];
 for(const fixture of fixtures){
  const core=createExactQCore(fixture.geometry);let q=core.createEmpty();
  for(const move of fixture.prefix){
   const result=core.next(q,Number(move)-1);
   if(result.terminal!==undefined)throw Error('canonical input prematurely terminal');
   q=result.q;
  }
  const mover=q.h.reduce((a,b)=>a+b,0)&1;
  if(mover!==fixture.expectedMover)throw Error('canonical mover parity mismatch');
  const candidate=createSeparatedOptimalSetOneLane(fixture.geometry).compute(q),
    direct=createDirectTwoTurnFrontier(fixture.geometry).compute(q);
  if(candidate.statistics.maximumStrategicFanout>1||
     candidate.statistics.actualMultipleInequivalentFutureValuesPerNode!==0)
    throw Error('canonical source zero-fanout violated');
  const entry={board:fixture.geometry,prefix:fixture.prefix,sourceRank:fixture.prefix.length,
    mover,status:candidate.status,proofKind:candidate.sourceProofKind||null,
    scalarWDL:candidate.value,completeBestOneBased:candidate.bestMoves?.map(x=>x+1)||null,
    sourceLocalDirectStatus:direct.status,
    sourceLocalKnownFirstActionValues:direct.exactCertifiedFirstActionValues?.map(([a,v])=>[a+1,v])||null,
    actualGameSemanticMaxFanout:candidate.statistics.maximumStrategicFanout,
    candidateTrueQChildren:candidate.statistics.selectedSingleFutureQStatesConstructed,
    completeWDLClaimMade:candidate.status==='EXACT_ZERO_STRATEGIC_FANOUT_RESTRICTED_DOMAIN'};
  if(fixture.independentlyValidateFullGame){
   const ref=core.solve(q,{maxStates:60000,maxTransitions:300000}).answer;
   entry.independentWDL=ref.value;
   entry.independentBestOneBased=ref.bestMoves.map(c=>c+1);
   if(candidate.status==='EXACT_ZERO_STRATEGIC_FANOUT_RESTRICTED_DOMAIN'&&(
     candidate.value!==ref.value||
     JSON.stringify(candidate.actionValues)!==JSON.stringify(ref.actionValues)||
     JSON.stringify(candidate.bestMoves)!==JSON.stringify(ref.bestMoves)))
    throw Error('independent scope reference mismatch '+fixture.prefix);
  }else if(fixture.prefix==='44444'&&entry.completeWDLClaimMade)
    throw Error('unexpected unrestricted canonical root proof; requires independent external full game qualification');
  results.push(entry);
 }
 return {schema:'connect4.zero-fanout-standard-source-scope.v0_1',
   status:'PASS',standard7x6RootNotMisclassified:true,
   originalAbsoluteTurn7AndTurn8ChronologyPreserved:true,
   referenceUsedOnlyOnAlreadySmallCompleteGameBoards:true,results};
}
