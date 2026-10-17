// Exact unrestricted min/max and COMPLETE WDL-optimal label set from
// arbitrary sound three-valued source action intervals. Inferior first
// actions need only be STRICTLY separated from the certified optimum;
// their exact WDL can remain unknown. NO game continuation evaluation.
export function certifyOptimalSetFromSourceIntervals(intervals,mover){
 if(!Array.isArray(intervals)||!intervals.length||
   (mover!==0&&mover!==1))throw Error('invalid legal action interval input');
 const sorted=intervals.slice().sort((a,b)=>a.literalColumn-b.literalColumn);
 if(new Set(sorted.map(x=>x.literalColumn)).size!==sorted.length)throw Error('duplicate action label');
 for(const a of sorted){
  if(!Number.isInteger(a.literalColumn)||![-1,0,1].includes(a.lower)||
   ![-1,0,1].includes(a.upper)||a.lower>a.upper)
   throw Error('invalid certified action WDL interval');
 }
 const aggregate=mover===0?Math.max:Math.min,
   rootLow=aggregate(...sorted.map(x=>x.lower)),
   rootHigh=aggregate(...sorted.map(x=>x.upper));
 if(rootLow!==rootHigh)return {status:'INCOMPLETE_ROOT_WDL',
   rootWDLInterval:[rootLow,rootHigh],
   exactRootWDL:null,completeOptimalLiteralMoves:null,
   uncertainOptimalLiteralMoves:sorted.map(x=>x.literalColumn),
   exactActionWDLRequiredForInferiorMoves:false,
   sourceOnly:true};
 const V=rootLow,best=[],inferior=[],ambiguous=[];
 for(const a of sorted){
  if(mover===0){
   if(a.lower===V)best.push(a.literalColumn);
   else if(a.upper<V)inferior.push(a.literalColumn);
   else ambiguous.push(a.literalColumn);
  }else{
   if(a.upper===V)best.push(a.literalColumn);
   else if(a.lower>V)inferior.push(a.literalColumn);
   else ambiguous.push(a.literalColumn);
  }
 }
 if(ambiguous.length)return {status:'INCOMPLETE_OPTIMAL_MEMBERSHIP',
   rootWDLInterval:[V,V],exactRootWDL:V,
   completeOptimalLiteralMoves:null,
   alreadyCertifiedBestLabels:best,alreadyCertifiedInferiorLabels:inferior,
   uncertainOptimalLiteralMoves:ambiguous,
   exactActionWDLRequiredForInferiorMoves:false,sourceOnly:true};
 return {status:'EXACT_ROOT_WDL_AND_COMPLETE_OPTIMAL_SET_WITH_POSSIBLE_INFERIOR_INTERVALS',
   exactRootWDL:V,
   completeOptimalLiteralMoves:best,
   provablyInferiorLiteralMoves:inferior,
   originalLiteralActionValueIntervals:sorted.map(x=>({
     literalColumn:x.literalColumn,lower:x.lower,upper:x.upper})),
   inferiorActionsWhoseNumericWDLRemainsUnknown:
     sorted.filter(x=>inferior.includes(x.literalColumn)&&x.lower!==x.upper)
       .map(x=>x.literalColumn),
   certifiedEveryLegalLabelMemberOrStrictlyInferior:true,
   sourceOnly:true,maxStrategicFanout:0};
}
