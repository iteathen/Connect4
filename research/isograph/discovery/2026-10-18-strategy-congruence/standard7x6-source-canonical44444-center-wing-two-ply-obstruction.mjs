// SOURCE ORIGINAL q=(h,R0,R1) only; no physical game WDL, no future game
// q states, no strategy/search over column permutation assignments.
// Frozen theorem:
// docs/research/2026-10-18-canonical44444-two-ply-support-and-residual-cardinality-obstruction.md
// Exact necessary obstructions to an earlier nonbijective FULL-FUTURE
// two-ply whole-column-height-isomorphic raw-generator WDL-order proof.
// This does NOT prove any actual original first-action WDL inequality.
export function certifyOriginalCanonical44444TwoPlyTransportObstruction(q,{
 width:W=7,height:H=6,connect:K=4}={}){
 if(W!==7||H!==6||K!==4)throw Error('canonical witness fixed to original W7H6K4');
 const N=42,id=(c,r)=>r*W+c,bit=z=>1n<<BigInt(z);
 const originalHeights=[0,0,0,5,0,0,0];
 const expectedPly=5;
 if(!q||!Array.isArray(q.h)||q.h.length!==7||
    q.h.some((v,i)=>v!==originalHeights[i])||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    q.R0.length!==48||q.R1.length!==42||
    [...q.R0,...q.R1].some(z=>typeof z!=='bigint'||z<=0n))
  return {status:'INCOMPLETE_NOT_CANONICAL_SOURCE_Q_SHAPE',sourceRootWDL:null,
    sourceBestOriginalColumn:null};
 const n=q.h.reduce((a,b)=>a+b,0),p=n&1,o=1-p;
 if(n!==expectedPly||p!==1)throw Error('canonical original mover must be P1');
 const wings=[1,2,3,5,6,7],rootLegal=[1,2,3,4,5,6,7];
 const pop=m=>{let k=0;for(;m;m&=m-1n)k++;return k;};
 const ops={staticOriginalReplyHeightFingerprints:0,
  staticSourceOriginalResidualGeneratorsScanned:0,
  staticOriginalGeneratorMinimumWidthWitnessChecks:0,
  staticCurrentSourceOpponentImmediateFirstWinChecks:0,
  independentlyValuedFutureGameWDLStates:0,
  constructedFullFutureGameQChildren:0,
  originalOpponentPoliciesOrHypotheticalWordTreesEnumerated:0,
  completedColumnPermutationsSearched:0};
 function hist(a,r){
  const hh=q.h.slice(),first=a-1,second=r-1;
  if(hh[first]===H)throw Error('source attempted full first column');
  hh[first]++;
  if(hh[second]===H)throw Error('source attempted full second column');
  hh[second]++;
  ops.staticOriginalReplyHeightFingerprints++;
  return Array.from({length:H+1},(_,z)=>hh.filter(v=>v===z).length);
 }
 const key=h=>h.join('.');
 function minR0AndWitness(P1first,P0reply){
  const afterFirst=q.h.slice(),x=id(P1first-1,afterFirst[P1first-1]++);
  if(afterFirst[P0reply-1]>=H)throw Error('original second P0 reply physically illegal');
  const y=id(P0reply-1,afterFirst[P0reply-1]++);
  const blocks=bit(x),own=bit(y),eligible=[];
  for(let i=0;i<q.R0.length;i++){
   const G=q.R0[i];
   ops.staticSourceOriginalResidualGeneratorsScanned++;
   if((G&blocks)!==0n)continue;
   const m=G&~own;
   if(m===0n)throw Error('canonical two-ply root reply P0 would immediately FIRST WIN');
   eligible.push({G:m,index:i});
  }
  if(!eligible.length)return {minSize:null,sourceOriginalMinWitnesses:[],nonterminalOpponentP0:true};
  let minSize=Infinity;
  for(const {G} of eligible){ops.staticOriginalGeneratorMinimumWidthWitnessChecks++;minSize=Math.min(minSize,pop(G));}
  const witness=eligible.filter(z=>pop(z.G)===minSize).slice(0,4).map(z=>({
   rootOriginalGeneratorIndex:z.index,postTwoRawOriginalResidualMaskHex:'0x'+z.G.toString(16),
   missingFuturePhysicalCellsOneBased:Array.from({length:N},(_,i)=>
     (z.G&bit(i))!==0n?{column:i%7+1,row:Math.floor(i/7)+1}:null).filter(Boolean)
  }));
  return {minSize,sourceOriginalMinWitnesses:witness,
   originalSourceP0ImmediateFirstWin:false};
 }
 const c4One=bit(id(3,5));
 if(q.R1.some(G=>G===c4One))
  throw Error('canonical center move immediate P1 WIN, outside nonterminal theorem guard');
 for(const w of wings)if(q.R1.some(G=>G===bit(id(w-1,0))))
  throw Error('canonical wing move immediate P1 WIN, outside nonterminal theorem guard');
 const rows=[];
 for(const wing of wings){
  const leftWingRows=[];
  const rightSupportReplyFingerprints=[];
  for(const rightReply of rootLegal){
   const right={reply:rightReply,heightHistogram:hist(wing,rightReply)};
   rightSupportReplyFingerprints.push(right);
  }
  const rightMin=minR0AndWitness(wing,4);
  if(rightMin.minSize!==3)throw Error('SOURCE WIDTH3 right canonical post-two requirement no-go FALSE');
  const rightCenterHist=key(hist(wing,4));
  const centerFirstWingReplies=[];
  for(const leftReply of wings){
   const a=hist(4,leftReply),matching=rightSupportReplyFingerprints
      .filter(x=>key(x.heightHistogram)===key(a)).map(x=>x.reply);
   const leftMin=minR0AndWitness(4,leftReply);
   if(leftMin.minSize!==2||matching.length!==1||matching[0]!==4)
    throw Error('SOURCE canonical center→wing width2 vs width3 universal matching obstruction FALSE');
   centerFirstWingReplies.push({leftReply,matchingRightOriginalReplies:matching,
    leftP0MinResidualWidth:leftMin.minSize,
    rightP0MinResidualWidth:rightMin.minSize,
    sourceWidthTwoWitness:leftMin.sourceOriginalMinWitnesses[0],
    staticWDLUpsetInclusionProvedImpossibleForANYWholeColumnPermutation:true});
  }
  const wingFirstWingReplies=wings.map(reply=>{
   const a=hist(wing,reply);
   const centerS=wings.filter(s=>key(hist(4,s))===key(a));
   if(centerS.length)throw Error('wing-first wing-reply matched center-first support despite center height5 vs6');
   return {leftReply:reply,matchingRightOriginalReplies:centerS,
    noPostTwoHeightClassCompatibleColumnBijection:true};
  });
  rows.push({wing,
   opponentP0RepliesAfterCenterFirst:wings,
   opponentP0RepliesAfterWingFirst:rootLegal,
   centerFirstToWingFirst:{p1SourceMustCoverEveryLeftP0Reply:true,
    leftP0WinRequirementsOfSize2OnEveryReply:true,
    rightP0WinRequirementsOfMinimumSize3:true,
    allSixSupportMatchingOppositeRepliesOnlyCenter4:true,
    replyEvidence:centerFirstWingReplies,
    canPriorHeightIsomorphicRawGeneratorProveJ_centerLEJ_wing:false},
   wingFirstToCenterFirst:{p1SourceMustCoverEveryLeftP0Reply:true,
    noMatchedSourceWholeColumnSupportForAnyWingP0Reply:true,
    unmatchedLeftReplyEvidence:wingFirstWingReplies,
    canPriorHeightIsomorphicRawGeneratorProveJ_wingLEJ_center:false},
   originalRightAfterWingThenCenterP0MinResidualWidth:rightMin.minSize,
   matchedRightSupportHeightHistogram:JSON.parse('['+rightCenterHist.replace(/\./g,',')+']')});
 }
 return {status:'SOURCE_CERTIFIED_CANONICAL_44444_TWO_PLY_WHOLE_COLUMN_TRANSPORT_PROOF_FAMILY_OBSTRUCTED',
   claimClass:'NEGATIVE_SCOPE_BOUNDARY_ON_EXISTING_TWO_PLY_POST_SUPPORT_ISOMORPHIC_FULL_FUTURE_UPSET_CERTIFICATE',
   canonicalOriginalPly:n,canonicalOriginalMover:'P1',
   canonicalOriginalHeights:q.h.slice(),
   canonicalOriginalSourceRCounts:[q.R0.length,q.R1.length],
   allSixRootWingClassesChecked:true,
   allTwelveRootCrossCenterWingOrderedActionComparisonsExcludedByThisProofFamily:true,
   proofIsNotActualGameWDLOrder:true,ordinaryRootWDL:null,sourceLevel2BestOriginalColumn:null,
   originalFutureGameValuesEvaluated:0,
   cases:rows,statistics:ops};
}
