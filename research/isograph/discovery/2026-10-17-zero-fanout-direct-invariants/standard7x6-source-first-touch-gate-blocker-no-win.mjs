// Original normalized q ONLY. Adaptive o-second first-touch closure:
// every current p requirement generator has a lowest-in-column GATE;
// the first p touch of an active generator at x triggers ONE gravity-safe
// common blocker y(x) for all source G with x as a gate.
// y(x) is EITHER original root frontier of a separate column OR the
// immediately above original same-column cell released by p playing x.
// NO game successor q construction, strategy tree/policy enumeration,
// oracle, value recursion, or full-cell matched pairing search.
// Frozen theorem: docs/research/2026-10-18-source-first-touch-universal-blocker-invariant.md
export function createSourceFirstTouchGateBlockerNoWin({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||
  K>Math.min(W,H)||W*H>42)throw Error('invalid finite original gravity source');
 const N=W*H,bit=id=>1n<<BigInt(id),id=(c,r)=>r*W+c;
 function compute(q){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||
   h.some(z=>!Number.isInteger(z)||z<0||z>H)||
   !Array.isArray(q.R0)||!Array.isArray(q.R1)||
   [...q.R0,...q.R1].some(z=>typeof z!=='bigint'||z<=0n))
   throw Error('nonterminal normalized original source q=(h,R0,R1) required');
  const n=h.reduce((s,z)=>s+z,0),p=n&1,o=1-p,T=N-n;
  if(T<=0)throw Error('not original nonterminal source');
  const owner=p===0?q.R0:q.R1;
  const gateGroups=new Map(),maskFuture=h.reduce((m,first,c)=>{
    for(let r=first;r<H;r++)m|=bit(id(c,r));
    return m;
  },0n);
  let gateIncs=0;
  for(let gi=0;gi<owner.length;gi++){
   const G=owner[gi];
   if((G&~maskFuture)!==0n)throw Error('owner current original R contains already-occupied cell');
   for(let c=0;c<W;c++){
    let lowest=null;
    for(let r=h[c];r<H;r++){
     if((G&bit(id(c,r)))!==0n){lowest=id(c,r);break;}
    }
    if(lowest!==null){
     const group=gateGroups.get(lowest)??[];
     group.push(gi);gateGroups.set(lowest,group);gateIncs++;
    }
   }
  }
  const frontier=h.flatMap((z,c)=>z<H?[id(c,z)]:[]);
  const stats={
   sourceCurrentRank:n,sourceOriginalPlayer:p,sourceOpponent:o,
   originalOwnerViableWinRequirements:owner.length,
   originalFuturePhysicalCells:T,
   sourceGateIncidences:gateIncs,sourceGateCellsWithRequirements:gateGroups.size,
   originalResidualBitIntersectionOps:0,
   staticCandidateGravityReleaseTests:0,
   gateCellsWithCommonOneMoveBlockers:0,
   gateCellsOnlyWithVerticalSuccessor:0,
   gateCellsOnlyWithOriginalRootFrontier:0,
   gateCellsWithNeitherSafeOneMoveBlocker:0,
   sourceProducedSharedDirectedResponseTargets:0,
   sourceCompletePhysicalCellPairsEnumerated:0,
   sourceStrategyTreeNodesOrGameQSuccessors:0,
   sourceIndependentStrategicFutureGameValues:0,
   sourceAdaptivePolicySpecificPrecomputedResponseCount:0
  };
  if(owner.length===0)return {status:'INCOMPLETE',
    reason:'MOVER_ORIGINAL_WIN_GENERATOR_EXTINCT_PREVIOUS_NO_WIN_THEOREM',
    moverCannotForceFirstWinAlreadyProvenByExtinction:true,
    originalRNonemptyNewCertificate:false,statistics:stats};
  const responseMap=[],unsatisfied=[];
  for(const [x,indices] of [...gateGroups].sort((a,b)=>a[0]-b[0])){
   let common=maskFuture;
   for(const i of indices){common&=owner[i];stats.originalResidualBitIntersectionOps++;}
   common&=~bit(x);
   const c=x%W,r=Math.floor(x/W),up=r+1<H?id(c,r+1):null;
   const vert=up!==null&&(common&bit(up))!==0n?up:null;
   const bottoms=frontier.filter(v=>v!==x&&(common&bit(v))!==0n);
   stats.staticCandidateGravityReleaseTests+=1+frontier.length;
   let y=null,kind=null;
   if(vert!==null){y=vert;kind='VERTICAL_SUCCESSOR';}
   else if(bottoms.length){y=bottoms[0];kind='INDEPENDENT_ORIGINAL_FRONTIER';}
   if(y===null){
    stats.gateCellsWithNeitherSafeOneMoveBlocker++;
    if(unsatisfied.length<12)unsatisfied.push({
     xOriginalPhysicalCellID:x,column:c+1,rowZeroBased:r,
     sourceGeneratorsWithGate:indices.length,
     intersectionMaskHex:'0x'+common.toString(16),
     originalBottomResponseCandidates:bottoms.length,
     verticalSuccessorMember:vert!==null});
    continue;
   }
   stats.gateCellsWithCommonOneMoveBlockers++;
   if(vert!==null&&!bottoms.length)stats.gateCellsOnlyWithVerticalSuccessor++;
   if(vert===null&&bottoms.length)stats.gateCellsOnlyWithOriginalRootFrontier++;
   const witness={
    attackedPhysicalCellID:x,
    attackerLiteralColumn:c+1,attackerRowZeroBased:r,
    safeDefenderPhysicalCellID:y,
    defenderLiteralColumn:y%W+1,defenderRowZeroBased:Math.floor(y/W),
    sourceResponseKind:kind,
    originalRequirementIndexes:indices,
    originalSourceCommonIntersectionHex:'0x'+common.toString(16),
    everyFirstTouchedOriginalGeneratorBlockedByReply:true
   };
   for(const i of indices)if((owner[i]&bit(y))===0n)
    throw Error('source directed first-touch response missing one generator');
   if(kind==='VERTICAL_SUCCESSOR'&&y!==x+W)throw Error('response must be immediate same-column successor');
   if(kind==='INDEPENDENT_ORIGINAL_FRONTIER'&&
      h[y%W]!==Math.floor(y/W))throw Error('source frontier response not originally legal');
   responseMap.push(witness);
  }
  const mapResponses=responseMap.map(x=>x.safeDefenderPhysicalCellID);
  stats.sourceProducedSharedDirectedResponseTargets=mapResponses.length-new Set(mapResponses).size;
  stats.sourceAdaptivePolicySpecificPrecomputedResponseCount=responseMap.length;
  if(unsatisfied.length||stats.gateCellsWithNeitherSafeOneMoveBlocker)
   return {status:'INCOMPLETE',
    reason:'AT_LEAST_ONE_ORIGINAL_FIRST_TOUCH_GATE_WITHOUT_COMMON_GRAVITY_SAFE_REPLY',
    originalRNonemptyNewCertificate:false,
    incompleteGateCount:stats.gateCellsWithNeitherSafeOneMoveBlocker,
    firstUncertifiedGateWells:unsatisfied,
    statistics:stats};
  return {status:'CERTIFIED_CURRENT_MOVER_CANNOT_FORCE_WIN',
   kind:'UNIFORM_DIRECTED_FIRST_TOUCH_GATE_COMMON_BLOCKER_INVARIANT',
   originalCurrentMover:p,originalDefendingPlayer:o,
   rootOriginalHeights:h.slice(),currentMoverOriginalSourceR:owner.map(m=>'0x'+m.toString(16)),
   gravitySafeSourceFirstTouchResponsePolicy:responseMap,
   strictlyNoOriginalMOverFirstWinUnderDefenderPolicy:true,
   originalFutureMoveGameWDLNotCalculated:true,
   completeLevel2BestActionNotYetCertified:true,
   originalRNonemptyNewCertificate:true,statistics:stats};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}
