// FROZEN prior to comparing source proof domains. Source-selected four
// q=(h,R0,R1) and original legal histories frozen BEFORE physical WDL and
// V4; true7x6 69-line independent full WDL already separately preserved.
// Compare the SAME q with unchanged source V4, nonbijective adaptive
// reply WDL-order source, first-touch SOURCE and prior FULL vertical pairing
// + fractional defender overload proof. No future strategic WDL or
// minmax calculations in this comparison. V4 static proof budget recorded.
export function compareFourFrozenSupportMirrorLossesSameQ(frozen,{
 createV4,createNonbijective,createFirstTouch,createCompletePairOverload
}={}){
 if(frozen?.inputsAndProofs?.length!==4 ||
   String(frozen.inputsAndProofs.map(x=>x.originalSelectedOrdinal))!=='1,7,12,13'||
   [createV4,createNonbijective,createFirstTouch,createCompletePairOverload].some(f=>typeof f!=='function'))
  throw Error('must use four frozen original support-mirror pre-physical source proof packets and pinned prior source factories');
 const W=7,H=6,N=42,geom={width:W,height:H,connect:4};
 const v4=createV4(geom),adaptive=createNonbijective(geom),
  touch=createFirstTouch(geom),pair=createCompletePairOverload(geom);
 const summary={schema:'connect4.original7x6.four_support_mirror_source_forced_loss_v4_nonbijective_firsttouch_completepair_v0_1',
  date:'2026-10-18',status:'SOURCE_SAME_Q_PRIOR_PROOF_DOMAIN_COMPARISON',
  frozenSourceSelectedQ:4,realOriginalK4Lines:69,
  predeclaredImmutableV4OrderOptions:{maxOperations:180000,maxMs:750,maxRepresentatives:10000},
  counters:{priorV4CertifiedBest:0,priorV4SourceIncomplete:0,priorV4ResourceOrReferenceErrors:0,
   priorNonbijectiveCertifiedBest:0,priorNonbijectiveSourceIncomplete:0,
   priorFirstTouchNoWinCertified:0,priorFirstTouchIncomplete:0,
   priorCompletePairOverloadLossProof:0,priorCompletePairOverloadIncomplete:0,
   sourceNewBestAbsentV4AndNonbijectiveAndFirstTouchAndFullPair:0,
   sourceFutureGameWDLValuesComputed:0},
  rows:[]};
 for(const entry of frozen.inputsAndProofs){
  const q={h:entry.originalSourceQ.h.slice(),
   R0:entry.originalSourceQ.R0.map(BigInt),
   R1:entry.originalSourceQ.R1.map(BigInt)};
  const n=q.h.reduce((a,b)=>a+b,0),p=n&1;
  if(entry.rootOriginalPly!==n||entry.rootOriginalMover!==p ||
     String(entry.originalLegalFirstColumns)!==
      String(q.h.flatMap((v,c)=>v<6?[c+1]:[])))
   throw Error('old source comparator cannot identify frozen q legal actions');
  const t=touch.compute(q),ad=adaptive.analyze(q),
   pa=pair.compute(q,{maxOperations:180000,maxMs:5000,maxStaticWitnessStates:20000});
  let v;
  try{v=v4.compute(q,{orderOptions:{
    maxOperations:180000,maxMs:750,maxRepresentatives:10000}});}
  catch(e){v={status:'V4_REFERENCE_ERROR',reason:String(e)};
   summary.counters.priorV4ResourceOrReferenceErrors++;}
  if(t.status==='CERTIFIED_CURRENT_MOVER_CANNOT_FORCE_WIN')
   summary.counters.priorFirstTouchNoWinCertified++;
  else summary.counters.priorFirstTouchIncomplete++;
  if(ad.selectedBestOriginalColumn!==null)
   summary.counters.priorNonbijectiveCertifiedBest++;
  else summary.counters.priorNonbijectiveSourceIncomplete++;
  if(pa.status==='VALID_CONTINUATION')
   summary.counters.priorCompletePairOverloadLossProof++;
  else summary.counters.priorCompletePairOverloadIncomplete++;
  if(v.status==='VALID_CONTINUATION')
   summary.counters.priorV4CertifiedBest++;
  else if(v.status==='INCOMPLETE')
   summary.counters.priorV4SourceIncomplete++;
  else if(v.status!=='V4_REFERENCE_ERROR')
   summary.counters.priorV4ResourceOrReferenceErrors++;
  const novel=v.status==='INCOMPLETE'&&ad.selectedBestOriginalColumn===null &&
   t.status!=='CERTIFIED_CURRENT_MOVER_CANNOT_FORCE_WIN'&&
   pa.status!=='VALID_CONTINUATION';
  if(novel)summary.counters.sourceNewBestAbsentV4AndNonbijectiveAndFirstTouchAndFullPair++;
  summary.rows.push({originalHistory:entry.originalLegalOneBasedHistory,originalRootPly:n,mover:p,
   originalRootHeights:q.h,originalOriginalRCounts:[q.R0.length,q.R1.length],
   legalOriginalColumns:entry.originalLegalFirstColumns,
   frozenSourceBestLiteral:entry.sourceSelectedBestOriginalColumn,
   frozenSourceRootP0RelativeWDL:entry.sourceExactRootP0RelativeWDL,
   previousFirstTouchSourceStatus:t.status,
   previousNonbijectiveSourceStatus:ad.status,
   previousNonbijectiveSelectedLiteral:ad.selectedBestOriginalColumn,
   previousCompletePairDualSourceStatus:pa.status,
   previousCompletePairDualSourceReason:pa.reason??null,
   previousV4SourceStatus:v.status,
   previousV4BestLiteral:v.selectedOriginalLiteralColumn??null,
   previousV4SourceReason:v.sourceQualitativeOrderReason??v.reason??null,
   sourceNewBestAbsentAllFourPriorFamilies:novel});
 }
 return summary;
}
