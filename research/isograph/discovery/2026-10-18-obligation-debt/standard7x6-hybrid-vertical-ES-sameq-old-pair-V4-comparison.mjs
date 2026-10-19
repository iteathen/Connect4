// FROZEN before comparison. Recompute SAME true original7x6 q from 69
// physical K4 windows for EIGHT source-prequalified vertical-pair/ES/dual
// root histories, then compare source proof status against unchanged
// older FULL gravity co-release pairing + dual overload and fixed V4
// source-only algorithms. No independent physical WDL values are used
// to select proof inputs or to rescue failed source certificates.
// The source packet and separate physical WDL evidence were frozen first.
export function compareHybridVerticalExposedToOldPairAndV4(
 frozenPilot,{createOldFullPairAndDual,createOriginalV4,
 oldPairLimits={maxOperations:180000,maxMs:5000,maxStaticWitnessStates:20000},
 v4Options={maxOperations:180000,maxMs:750,maxRepresentatives:10000}}={}){
 if(!Array.isArray(frozenPilot?.positiveSourceRoots)||
   frozenPilot.positiveSourceRoots.length!==8||
   typeof createOldFullPairAndDual!=='function'||typeof createOriginalV4!=='function')
  throw Error('requires frozen eight preoracle positive source q and pinned prior original source factories');
 const W=7,H=6,N=42,id=(c,r)=>W*r+c,bit=z=>1n<<BigInt(z),lines=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  const v=Array.from({length:4},(_,k)=>[c+k*dx,r+k*dy]);
  if(v.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
   lines.push(v.map(([x,y])=>id(x,y)));
 }
 if(lines.length!==69)throw Error('original true physical K4 69 winlines absent');
 const pop=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 const norm=arr=>{
  const sorted=[...new Set(arr)].sort((a,b)=>pop(a)-pop(b)||(a<b?-1:a>b?1:0)),out=[];
  for(const G of sorted)if(!out.some(z=>(G&z)===z))out.push(G);
  return out;
 };
 function originalSource(history){
  const h=Array(W).fill(0),board=Array(N).fill(-1);
  for(let t=0;t<history.length;t++){
   const c=Number(history[t])-1,p=t&1;
   if(!Number.isInteger(c)||c<0||c>=W||h[c]>=H)
    throw Error('frozen source input invalid original gravity');
   const z=id(c,h[c]++);board[z]=p;
   if(lines.some(L=>L.every(k=>board[k]===p)))
    throw Error('frozen source history crossed a true first winner');
  }
  const R=[0,1].map(p=>{
   const raw=[];
   for(const L of lines){
    if(L.some(k=>board[k]===1-p))continue;
    const G=L.reduce((m,k)=>board[k]===-1?m|bit(k):m,0n);
    if(G===0n)throw Error('already winning root line');
    raw.push(G);
   }
   return norm(raw);
  });
  return {h,R0:R[0],R1:R[1]};
 }
 const priorPair=createOldFullPairAndDual({width:W,height:H,connect:4}),
   priorV4=createOriginalV4({width:W,height:H,connect:4});
 const stats={sourcePreoraclePositiveRoots:8,originalPhysicalWinlines:69,
  sourceOlderPairProvenLOSS:0,sourceOlderPairIncomplete:0,
  sourceOlderPairNoPartialFuturePairOrDualWitness:0,
  sourceOldFullPairPotentialOnlyNovelCount:0,
  sourceOlderPairOrV4ProofDisagreements:0,
  unchangedV4SourceAlreadyProvenBest:0,unchangedV4Incomplete:0,
  unchangedV4BudgetErrors:0,
  potentialWithUncoveredSourceRequirementRoots:0,
  strictNewLossCertificatesAbsentBothOldPairAndV4:0,
  strategicFutureGameValuesComputedInSource:0};
 const rows=[];
 for(const witness of frozenPilot.positiveSourceRoots){
  const q=originalSource(witness.genuineOriginalHistory),source=witness.sourceFullCertificate;
  if(source.status!=='SOURCE_CERTIFIED_CURRENT_MOVER_FORCED_LOSS_VERTICAL_PAIR_EXPOSED_ES_PLUS_DUAL'||
     source.ordinaryRootWDL!==witness.exactOriginalRootP0RelativeWDLCertified||
     source.originalViableMoverGeneratorCount!==(witness.ply%2?q.R1.length:q.R0.length))
   throw Error('source frozen source proof packet differs from actual original q');
  const pair=priorPair.compute(q,oldPairLimits);
  let v4;
  try{v4=priorV4.compute(q,{orderOptions:v4Options});}
  catch(e){v4={status:'REFERENCE_V4_ERROR',reason:String(e)};stats.unchangedV4BudgetErrors++;}
  if(pair.status==='VALID_CONTINUATION')stats.sourceOlderPairProvenLOSS++;
  else{stats.sourceOlderPairIncomplete++;stats.sourceOlderPairNoPartialFuturePairOrDualWitness++;}
  if(v4.status==='VALID_CONTINUATION')stats.unchangedV4SourceAlreadyProvenBest++;
  else if(v4.status==='INCOMPLETE')stats.unchangedV4Incomplete++;
  const uncovered=source.originalMoverUncoveredOriginalGeneratorCount>0;
  if(uncovered)stats.potentialWithUncoveredSourceRequirementRoots++;
  if(pair.status!=='VALID_CONTINUATION'&&v4.status==='INCOMPLETE')
   stats.strictNewLossCertificatesAbsentBothOldPairAndV4++;
  rows.push({
   genuineFirstWinFreeOriginalHistory:witness.genuineOriginalHistory,
   rootPly:witness.ply,rootMover:witness.ply&1,
   rootHeights:q.h,originalResidualCounts:[q.R0.length,q.R1.length],
   currentLegalColumns:q.h.flatMap((z,c)=>z<H?[c+1]:[]),
   hybridProvenAllCurrentFirstActionsLose:true,
   hybridDyadicExposedPotentialNumerator:source.exactErdosSelfridgeDyadicWeightNumerator,
   hybridNonVerticalPairCoveredOriginalGeneratorCount:source.originalMoverUncoveredOriginalGeneratorCount,
   hybridOpponentPackingOverloadExcessNumerator:source.sourceOpponentOverloadStrictNumeratorExcess,
   oldCompletePairingPlusDualSourceStatus:pair.status,
   oldCompletePairingPlusDualFailureReason:pair.reason??null,
   oldCompletePairingSourceOriginalBestColumn:pair.selectedOriginalLiteralColumn??null,
   unchangedV4Status:v4.status,
   unchangedV4OriginalSelectedFirstColumn:v4.selectedOriginalLiteralColumn??null,
   unchangedV4Reason:v4.sourceQualitativeOrderReason??v4.reason??null,
   newLevel2LossSourceRelativeToTheseTwoPriorProofs:
      pair.status!=='VALID_CONTINUATION'&&v4.status==='INCOMPLETE'
  });
 }
 return {schema:'connect4.original7x6.hybrid_vertical_ES_full_game_loss_sameq_oldpair_v4_v0_1',
  status:'SOURCE_V4_SAME_ROOT_PRIOR_CERTIFICATE_MARGINAL_COMPLETE',
  date:'2026-10-18',oldPairLimits,v4Options,stats,rows,
  noIndependentPhysicalMinimaxInComparator:true,
  candidateSourceProofsFrozenBeforeEitherPriorSourceReference:true,
  qualifiedIsoGraphGameTheory12Changed:false,
  maintainedNode26CIOrExternalFormalChecker:'NOT_RUN'};
}
