// ORIGINAL q=(h,R0,R1) DIRECT WDL weak source order under fixed
// transposition of TWO EQUAL-HEIGHT first-action columns only.
// NO recursive/static column-permutation assignment/enumeration.
// NO strategic future q or game value queries. Raw cofactor masks are
// ORIGINAL q generator descriptions (not normalized q successors).
// Frozen math (before actual7x6 control):
// docs/research/2026-10-17-fixed-transposition-raw-source-WDL-order-theorem.md
export function createSourceFixedTwoColumnSwapWdlOrder({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<1||K<2||
  K>Math.min(W,H)||W*H>42)throw Error('invalid original gravity board');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),
  colMasks=Array.from({length:W},(_,c)=>{
   let m=0n;for(let r=0;r<H;r++)m|=bit(c,r);return m;
  });
 function compute(q,{maxStaticSubsetTests=120000}={}){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||
    h.some(z=>!Number.isInteger(z)||z<0||z>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(z=>typeof z!=='bigint'||z<=0n))
   throw Error('requires exact original normalized first-win-stopped q');
  const n=h.reduce((s,x)=>s+x,0),p=n&1,legal=h.flatMap((z,c)=>z<H?[c]:[]);
  if(n>=N||!legal.length)throw Error('original nonterminal q required');
  const stats={
   originalSourcePly:n,mover:p,originalLegalLabels:legal.length,
   currentOriginalResidualGenerators:q.R0.length+q.R1.length,
   originalStaticLiteralActionPairsConsidered:0,
   equalCurrentHeightActionPairs:0,unequalHeightExcludedPairs:0,
   immediateTerminalOrFullBoardExcludedPairs:0,
   originalQGeneratorCofactorMasksWritten:0,
   bitwiseFixedTwoColumnSwaps:0,
   exactOriginalGeneratorSubsetChecks:0,
   originalGeneratorDominanceWitnesses:0,
   sourceProvedWeakP0WdlOrderEdges:0,
   directPositiveBiDirectionalWdlTies:0,
   certifiedSourceActionOrderPathChecks:0,
   originalFutureGameQStatesConstructed:0,
   sourceIndependentGameValueQueries:0,
   sourceStaticColumnPermutationAssignmentNodes:0,
   sourceCompletedColumnPermutationCandidatesEnumerated:0,
   sourceStrategicLiveFutureLaneFanout:0,
   sourceBudgetIncomplete:false
  };
  function charge(){
   stats.exactOriginalGeneratorSubsetChecks++;
   if(stats.exactOriginalGeneratorSubsetChecks>maxStaticSubsetTests)
    throw Error('SOURCE_DIRECT_TWO_SWAP_STATIC_SUBSET_GUARD');
  }
  function rawFamily(owner,col,x){
   const result=owner===p?q[owner===0?'R0':'R1'].map(G=>G&~x):
     q[owner===0?'R0':'R1'].filter(G=>(G&x)===0n);
   stats.originalQGeneratorCofactorMasksWritten+=result.length;
   return result;
  }
  function swapFn(a,b){
   const maskA=colMasks[a],maskB=colMasks[b],others=~(maskA|maskB),
    d=BigInt(b-a);
   return m=>{
    stats.bitwiseFixedTwoColumnSwaps++;
    return (m&others)|((m&maskA)<<d)|((m&maskB)>>d);
   };
  }
  // All original masks are finite positive subsets; direct source
  // inclusion witnesses test raw potential B source generator H
  // subset of sigma(source generator G), no normalized game q child.
  function covers(from,to,perm){
   const witness=[];
   for(const G of from){
    const mapped=perm(G);let Hwin=null;
    for(const H of to){
     charge();
     if((H&mapped)===H){Hwin=H;break;}
    }
    if(Hwin===null)return null;
    stats.originalGeneratorDominanceWitnesses++;
    witness.push({fromOriginalRawMaskHex:'0x'+G.toString(16),
      transformedOriginalMaskHex:'0x'+mapped.toString(16),
      matchingOtherSourceMaskHex:'0x'+Hwin.toString(16)});
   }
   return witness;
  }
  const sourceEdges=[];
  function edge(a,b,swap,P0from,P0to,P1from,P1to){
   const first=covers(P0from,P0to,swap);
   if(first===null)return null;
   const second=covers(P1from,P1to,swap);
   if(second===null)return null;
   stats.sourceProvedWeakP0WdlOrderEdges++;
   return {
    lowerP0ValueLiteralAction:a+1,upperP0ValueLiteralAction:b+1,
    sourceProof:'TWO_COLUMN_DIRECT_RAW_Q_FAVORABILITY_TRANSPOSITION',
    fixedTranspositionLiteralColumns:[a+1,b+1],
    originalEqualHeight:h[a],
    P0SourceDominanceWitnesses:first,
    P1ReverseSourceDominanceWitnesses:second,
    sourceFullFutureValueInequalityClaim:'J_'+(a+1)+' <= J_'+(b+1),
    mappedStrategicFutureGameValuesEvaluated:0
   };
  }
  try{
   for(let i=0;i<legal.length;i++)for(let j=i+1;j<legal.length;j++){
    const a=legal[i],b=legal[j];
    stats.originalStaticLiteralActionPairsConsidered++;
    if(h[a]!==h[b]){stats.unequalHeightExcludedPairs++;continue;}
    stats.equalCurrentHeightActionPairs++;
    const xa=bit(a,h[a]),xb=bit(b,h[b]),owner=q[p===0?'R0':'R1'];
    if(owner.some(G=>G===xa||G===xb)||n+1===N){
     stats.immediateTerminalOrFullBoardExcludedPairs++;continue;
    }
    const perm=swapFn(a,b);
    const F0a=rawFamily(0,a,xa),F0b=rawFamily(0,b,xb),
      F1a=rawFamily(1,a,xa),F1b=rawFamily(1,b,xb);
    const forward=edge(a,b,perm,F0a,F0b,F1b,F1a);
    if(forward!==null)sourceEdges.push(forward);
    const reverse=edge(b,a,perm,F0b,F0a,F1a,F1b);
    if(reverse!==null)sourceEdges.push(reverse);
    if(forward!==null&&reverse!==null)stats.directPositiveBiDirectionalWdlTies++;
   }
  }catch(e){
   if(String(e.message)==='SOURCE_DIRECT_TWO_SWAP_STATIC_SUBSET_GUARD'){
    stats.sourceBudgetIncomplete=true;
    return {status:'INCOMPLETE',reason:'DIRECT_FIXED_SWAP_STATIC_SOURCE_MASK_BUDGET',
     sourceProvedOriginalWeakWdlOrderEdges:sourceEdges,
     selectedOriginalLiteralColumn:null,ordinaryRootValueP0Relative:null,
     statistics:stats};
   }
   throw e;
  }
  const index=new Map(legal.map((c,i)=>[c,i])),M=legal.length,
   paths=Array.from({length:M},()=>Array(M).fill(false)),
   via=Array.from({length:M},()=>Array(M).fill(null));
  for(let i=0;i<M;i++){paths[i][i]=true;via[i][i]=i;}
  for(const e of sourceEdges){
   const i=index.get(e.lowerP0ValueLiteralAction-1),
     j=index.get(e.upperP0ValueLiteralAction-1);
   paths[i][j]=true;via[i][j]=j;
  }
  for(let k=0;k<M;k++)for(let i=0;i<M;i++)for(let j=0;j<M;j++){
   stats.certifiedSourceActionOrderPathChecks++;
   if(paths[i][k]&&paths[k][j]&&!paths[i][j]){
    paths[i][j]=true;via[i][j]=via[i][k];
   }
  }
  const qualifying=legal.filter((c,i)=>legal.every((_,j)=>
   p===0?paths[j][i]:paths[i][j]));
  const first=qualifying[0];
  if(first===undefined)return {status:'INCOMPLETE',
   reason:'NO_GLOBAL_CURRENT_MOVER_EXTREMUM_FROM_EXPLICIT_FIXED_TRANSPOSE_EDGES',
   sourceProvedOriginalWeakWdlOrderEdges:sourceEdges,
   selectedOriginalLiteralColumn:null,ordinaryRootValueP0Relative:null,
   originalLegalLiteralColumns:legal.map(c=>c+1),
   statistics:stats};
  const t=index.get(first),proof=[];
  for(let i=0;i<M;i++){
   const from=p===0?i:t,to=p===0?t:i;
   const path=[from];let c=from;
   for(let step=0;c!==to;step++){
    if(step>M)throw Error('source weak order path closure cycle invalid');
    c=via[c][to];
    if(c===null)throw Error('source weak WDL order path missing hop');
    path.push(c);
   }
   proof.push({lowerP0ValueAction:legal[from]+1,
    upperP0ValueAction:legal[to]+1,
    fixedSourceWdlTranspositionPath:path.map(x=>legal[x]+1)});
  }
  return {status:'VALID_CONTINUATION',
   kind:'DIRECT_SOURCE_TWO_COLUMN_SWAP_WDL_EXTREMAL_BEST_ACTION',
   selectedOriginalLiteralColumn:first+1,
   ordinaryRootValueP0Relative:null,bestOutcomeTier:null,
   fullLevel2SetKnown:false,sourceBestActionWdlUnknown:true,
   originalLegalLiteralColumns:legal.map(c=>c+1),
   sourceProvedOriginalWeakWdlOrderEdges:sourceEdges,
   sourceExtremumProofOverAllRootLegalColumns:proof,
   qualifiedOriginalLiteralActionSelectionCandidates:qualifying.map(x=>x+1),
   sourceFutureGameValuesEvaluated:0,statistics:stats};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}
