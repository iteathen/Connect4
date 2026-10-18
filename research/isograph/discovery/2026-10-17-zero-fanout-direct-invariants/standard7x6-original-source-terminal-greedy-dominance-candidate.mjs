// PURE ORIGINAL q HYPOTHESIS detector, NOT a qualified Level2 solver.
// See docs/research/2026-10-17-source-dominating-greedy-terminal-column-move-candidate.md
// Source-only original legal terminal columns, exact two-cell owner
// winning generators and both-player inclusion implications.
// Output CANDIDATE_UNQUALIFIED, never VALID_CONTINUATION; physical
// independent oracle must independently falsify/qualify candidate.
export function createTerminalGreedySourceHypothesis({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||
    K>Math.min(W,H)||W*H>42)throw Error('invalid Connect-K gravity geometry');
 const bit=(c,r)=>1n<<BigInt(r*W+c);
 function compute(q){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||
     h.some(z=>!Number.isInteger(z)||z<0||z>H)||
     !Array.isArray(q.R0)||!Array.isArray(q.R1)||
     [...q.R0,...q.R1].some(x=>typeof x!=='bigint'||x===0n))
   throw Error('requires original first-win-stopped q with nonempty residual masks');
  const n=h.reduce((a,b)=>a+b,0),p=n&1;
  if(n>=W*H)throw Error('terminal original source');
  const own=p===0?q.R0:q.R1,all=q.R0.concat(q.R1);
  const stats={currentSourceOriginalResidualRequirements:all.length,
   sourcePlayedTotal:n,originalTopCapacityOneColumns:0,
   sourceOwnerTwoCellPairsThroughTopColumns:0,
   sourceDominanceImplicationsChecked:0,
   sourceZeroSingletonGlobalGuardPassed:0,
   futureGameQConstructed:0,futureGameValuesCalculated:0,
   independentlyComparedStrategicFutureGames:0};
  const oneBit=x=>x>0n&&(x&(x-1n))===0n;
  if(all.some(oneBit))
   return {status:'INCOMPLETE',why:'HAS_ORIGINAL_RESIDUAL_SINGLETON',
    candidates:[],statistics:stats};
  stats.sourceZeroSingletonGlobalGuardPassed=1;
  const eligible=h.flatMap((z,c)=>H-z===1?[c]:[]);
  stats.originalTopCapacityOneColumns=eligible.length;
  const ownSet=new Set(own.map(String));
  const candidates=[];
  for(const cu of eligible)for(const cv of eligible){
   if(cu===cv)continue;
   const u=bit(cu,H-1),v=bit(cv,H-1),uv=u|v;
   if(!ownSet.has(String(uv)))continue;
   stats.sourceOwnerTwoCellPairsThroughTopColumns++;
   let dominated=true;
   for(const G of all){
    stats.sourceDominanceImplicationsChecked++;
    if((G&u)!==0n&&(G&v)===0n){dominated=false;break;}
   }
   if(!dominated)continue;
   candidates.push({
    originalCurrentMover:p,
    originalLiteralCandidateFirstAction:cv+1,
    originalTopCellU:{column:cu+1,rowZeroBased:H-1,maskHex:'0x'+u.toString(16)},
    originalTopCellV:{column:cv+1,rowZeroBased:H-1,maskHex:'0x'+v.toString(16)},
    sourceResidualPairMaskHex:'0x'+uv.toString(16),
    allOriginalGensContainingUAlsoContainV:true,
    noOriginalResidualSingletonBothPlayers:true,
    twoCandidateColumnsExhaustAfterOnePhysicalPlacement:true,
    proposedFutureOpponentReplyColumn:cu+1,
    originalSourceFutureGameQueries:0,
    isQualifiedBestMove:false
   });
  }
  candidates.sort((a,b)=>a.originalLiteralCandidateFirstAction-b.originalLiteralCandidateFirstAction||
    a.originalTopCellU.column-b.originalTopCellU.column);
  return {
   status:candidates.length?'CANDIDATE_UNQUALIFIED':'INCOMPLETE',
   why:candidates.length?'UNRESTRICTED_HYPERGRAPH_GREEDY_LEMMA_GRAVITY_ADAPTATION_NOT_YET_PROVED':
     'NO_DOMINATING_TWO_TERMINAL_COLUMNS_SOURCE_PAIR',
   firstCandidateOriginalLiteralAction:candidates[0]?.originalLiteralCandidateFirstAction??null,
   candidates,statistics:stats};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}
