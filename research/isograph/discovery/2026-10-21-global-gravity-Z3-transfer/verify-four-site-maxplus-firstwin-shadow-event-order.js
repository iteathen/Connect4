"use strict";
/**
 * Pure abstract event-poset lemma underlying causal row-shift K4 shadow:
 * four strict physical owner-mate dependencies Ai BEFORE Di imply
 * max(A event completion times) STRICTLY BEFORE max(D event times).
 * Enumerates only 8! abstract event orders, not Connect4 positions.
 */
const ok=(v,msg)=>{if(!v)throw Error("C4_MAXPLUS_ORDER "+msg)};
const tokens=Array.from({length:8},(_,i)=>i);
let permutations=0,admissible=0,violations=0,minGap=Infinity,maxGap=0,hist={};
function rec(i){
 if(i===8){
  permutations++;
  const time=Array(8);
  for(let step=0;step<8;step++)time[tokens[step]]=step+1;
  if(Array.from({length:4},(_,k)=>k).some(k=>time[2*k]>=time[2*k+1]))return;
  admissible++;
  const TA=Math.max(...[0,2,4,6].map(k=>time[k]));
  const TD=Math.max(...[1,3,5,7].map(k=>time[k]));
  const gap=TD-TA;
  if(!(gap>=1))violations++;
  minGap=Math.min(minGap,gap);maxGap=Math.max(maxGap,gap);
  hist[gap]=(hist[gap]??0)+1;
  return;
 }
 for(let j=i;j<8;j++){
  [tokens[i],tokens[j]]=[tokens[j],tokens[i]];
  rec(i+1);
  [tokens[i],tokens[j]]=[tokens[j],tokens[i]];
 }
}
rec(0);
ok(permutations===40320&&admissible===2520&&violations===0,"all four abstract pair-precedence event orders");
ok(minGap>=1,"strict A-four-site completion before D-four-site completion");
const report={schema:"c4.generic_four_site_firstwin_maxplus_event_order.v1",
 status:"EXACT_2520_LINEAR_EXTENSIONS_PROVE_STRICT_MAXPLUS_FIRSTWIN_SHADOW",
 abstractEightDistinctEventTokens:true,pairwiseConstraints:["A1<D1","A2<D2","A3<D3","A4<D4"],
 enumeratedAbstractPermutations:permutations,acceptedStrictEventLinearExtensions:admissible,
 expectedLinearExtensionsByIndependentPairConstraints:40320/16,
 violations,completionGapSupport:{minGap,maxGap,histogram:hist},
 theorem:"max_i time(A_i) < max_i time(D_i) whenever all four time(A_i)<time(D_i). For a genuine original7x6 H/R/F row-down aligned source K4 whose policy guarantees these strict four edges, A FIRSTWINS the shifted K4 before D could FIRSTWIN its upper K4.",
 sourceConnection:"original7x6 source 122454434, D=P1 row5 c4..7, A=P0 aligned row4 c4..7; old online respondent mate policy establishes four strict edges, including c4r4 already P0-owned at source",
 gamePositionsEnumerated:0,gameHistoriesEnumerated:0,
 necessaryCausalPolicyProofStillRequired:true,
 emptyRootWINProved:false,noSolvedLabels:true,CI:"NOT_RUN"};
console.log(JSON.stringify(report,null,2));