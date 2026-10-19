// FROZEN BEFORE running unchanged V4 / old nonbijective/first-touch/fullpair
// on 27 PREORACLE-SOURCE-selected original q where mirror/ES NO-WIN plus
// independent original λ packing proves current player forced LOSS.
// Original physical WDL is NEVER queried by this comparator.
// Four first q separately have already passed independent physical controls.
// On each SAME q, inspect all source proof families, never choose candidates
// by observed physical game values. Preserve V4 source budget/error statuses.
export function compareFrozenMirror27SourceLosses(frozen,{
 createV4,createNonbijective,createFirstTouch,createCompletePairOverload}={}){
 const witnesses=frozen?.selectedDistinctFullCurrentMoverLOSSSourceRootProofs;
 if(!Array.isArray(witnesses)||witnesses.length!==27||
  frozen?.sourceMarginalStats?.sourceSelectedDistinctRootLossCandidates!==27||
  [createV4,createNonbijective,createFirstTouch,createCompletePairOverload].some(z=>typeof z!=='function'))
  throw Error('expect exact first-selected 27 frozen SOURCE-only mirror/dual complete LOSS q');
 const geom={width:7,height:6,connect:4},v4=createV4(geom),
  nb=createNonbijective(geom),touch=createFirstTouch(geom),
  pair=createCompletePairOverload(geom);
 const stats={frozenSourceForcedMoverLossQ:27,
  v4CurrentBestVerifiedSource:0,v4SourceIncomplete:0,v4ReferenceErrorsOrBudget:0,
  priorNonbijectiveSourceBest:0,priorNonbijectiveIncomplete:0,
  priorFirstTouchNoWin:0,priorFirstTouchIncomplete:0,
  previousCompletePairingAndDualForcedLOSS:0,previousCompletePairingIncomplete:0,
  sourceNewWdlBestAbsentV4AndNonbijectiveAndOldPairAndFirstTouch:0,
  sourceCurrentMoverP0:0,sourceCurrentMoverP1:0,
  originalLegalColumns2:0,originalLegalColumns3:0,originalLegalColumns4plus:0,
  sourceGameValuesComputed:0};
 const rows=[];
 for(const p of witnesses){
  const q={h:p.originalHeights.slice(),
   R0:p.originalSourceR0.map(BigInt),R1:p.originalSourceR1.map(BigInt)};
  const n=q.h.reduce((a,b)=>a+b,0),mover=n&1,legal=q.h.flatMap((v,c)=>v<6?[c+1]:[]);
  if(n!==p.originalCurrentPly||mover!==p.originalCurrentMover||
    String(legal)!==String(p.originalLegalFirstColumns)||
    p.rootP0RelativeSourceCertifiedWDL!==(mover===0?-1:1))
   throw Error('frozen original source q/mover/LOSS identity changed');
  stats[mover===0?'sourceCurrentMoverP0':'sourceCurrentMoverP1']++;
  stats[legal.length===2?'originalLegalColumns2':legal.length===3?'originalLegalColumns3':'originalLegalColumns4plus']++;
  const a=nb.analyze(q),t=touch.compute(q),
   b=pair.compute(q,{maxOperations:180000,maxMs:5000,maxStaticWitnessStates:20000});
  let v;
  try{v=v4.compute(q,{orderOptions:{maxOperations:180000,maxMs:750,maxRepresentatives:10000}});}
  catch(e){v={status:'V4_REFERENCE_ERROR',reason:String(e)};
   stats.v4ReferenceErrorsOrBudget++;}
  if(v.status==='VALID_CONTINUATION')stats.v4CurrentBestVerifiedSource++;
  else if(v.status==='INCOMPLETE')stats.v4SourceIncomplete++;
  else if(v.status!=='V4_REFERENCE_ERROR')stats.v4ReferenceErrorsOrBudget++;
  if(a.selectedBestOriginalColumn!==null)stats.priorNonbijectiveSourceBest++;
  else stats.priorNonbijectiveIncomplete++;
  if(t.status==='CERTIFIED_CURRENT_MOVER_CANNOT_FORCE_WIN')stats.priorFirstTouchNoWin++;
  else stats.priorFirstTouchIncomplete++;
  if(b.status==='VALID_CONTINUATION')stats.previousCompletePairingAndDualForcedLOSS++;
  else stats.previousCompletePairingIncomplete++;
  const novel=v.status==='INCOMPLETE'&&a.selectedBestOriginalColumn===null&&
   t.status!=='CERTIFIED_CURRENT_MOVER_CANNOT_FORCE_WIN'&&b.status!=='VALID_CONTINUATION';
  if(novel)stats.sourceNewWdlBestAbsentV4AndNonbijectiveAndOldPairAndFirstTouch++;
  rows.push({frozenOriginalHistory:p.firstOriginalLegalHistory,
   originalSourceQ:{h:q.h,R0:p.originalSourceR0,R1:p.originalSourceR1},
   originalRootPly:n,originalCurrentMover:mover,
   originalCurrentLegalColumns:legal,
   sourceCertifiedEveryMoverActionLOSE:true,
   sourceExactP0RelativeRootWDL:p.rootP0RelativeSourceCertifiedWDL,
   selectedOneSourceBestLiteral:p.selectedValidOneOriginalBestColumn,
   sourceMirrorPreemptedOriginalGeneratorCount:p.originalSupportMirrorClassBCount,
   sourceESDyadicPotentialNumerator:p.originalSourcePotentialExactNumerator,
   oldFirstTouchStatus:t.status,
   oldNonbijectiveSourceStatus:a.status,
   oldNonbijectiveSelectedLiteral:a.selectedBestOriginalColumn,
   oldFullPairPlusDualStatus:b.status,
   oldV4Status:v.status,
   oldV4SelectedLiteral:v.selectedOriginalLiteralColumn??null,
   oldV4Reason:v.sourceQualitativeOrderReason??v.reason??null,
   newOriginalLevel2BestOverAllFourPriorSources:novel});
 }
 return {schema:'connect4.original7x6.support_mirror_extra_27_source_LOSS_sameq_prior_v4_nonbijective_firsttouch_fullpair_v0_1',
  date:'2026-10-18',status:'PRIOR_SOURCE_PROOF_DOMAIN_COMPARISON_NOT_PHYSICAL_WDL',
  frozenCandidateCount:27,
  previousUnmodifiedV4Settings:{maxOperations:180000,maxMs:750,maxRepresentatives:10000},
  stats,rows,sourceNoGameWDLOracle:true,
  formalNode26ExternalProof:'NOT_RUN'};
}
