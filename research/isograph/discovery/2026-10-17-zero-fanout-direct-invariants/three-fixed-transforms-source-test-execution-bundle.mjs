// Standalone STATIC TEST EXECUTION BUNDLE of THREE unmodified frozen source modules.
// Only strips ESM import/export boilerplate. No theorem/game rules changed.
// Used in isolated JS test execution to avoid exceeding connector per-call read limit.
// --- ORIGINAL: research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-source-fixed-two-column-swap-WDL-order.mjs  GitBlob=7beb2ca37b1e8a4cf0885c91f6c3678261b18329 ---
// ORIGINAL q=(h,R0,R1) DIRECT WDL weak source order under fixed
// transposition of TWO EQUAL-HEIGHT first-action columns only.
// NO recursive/static column-permutation assignment/enumeration.
// NO strategic future q or game value queries. Raw cofactor masks are
// ORIGINAL q generator descriptions (not normalized q successors).
// Frozen math (before actual7x6 control):
// docs/research/2026-10-17-fixed-transposition-raw-source-WDL-order-theorem.md
function createSourceFixedTwoColumnSwapWdlOrder({width:W,height:H,connect:K}){
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


// --- ORIGINAL: research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-original-source-fixed-reflection-WDL-order.mjs  GitBlob=d932f40180d0170fd5a1747471227e5a37287e0c ---
// SOURCE-ONLY direct FULL HORIZONTAL BOARD REFLECTION q automorphism
// and direct weak-WDL q-cofactor comparison under ONE fixed reflection.
// NO enumeration/search of column permutation candidate mappings,
// NO game future values or normalized future-game q construction.
// Original source theorem frozen before physical control:
// docs/research/2026-10-17-fixed-reflection-source-q-automorphism-and-weak-WDL-order.md
function createOriginalSourceFixedReflectionWdlOrder({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||
   K>Math.min(W,H)||W*H>42)throw Error('invalid original Connect-K gravity board');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c),
  mirror=c=>W-1-c,
  mapBit=Array.from({length:N},(_,id)=>
   bit(mirror(id%W),Math.floor(id/W)));
 function compute(q,{maxStaticSubsetTests=150000}={}){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||
   h.some(z=>!Number.isInteger(z)||z<0||z>H)||
   !Array.isArray(q.R0)||!Array.isArray(q.R1)||
   [...q.R0,...q.R1].some(m=>typeof m!=='bigint'||m<=0n))
   throw Error('genuine original first-win-stopped q expected');
  const n=h.reduce((a,b)=>a+b,0),p=n&1,legal=h.flatMap((v,c)=>v<H?[c]:[]);
  if(n>=N||!legal.length)throw Error('original nonterminal source only');
  const stats={
   originalRank:n,mover:p,currentLegalOriginalActions:legal.length,
   hSourceMirrorSymmetryChecked:1,
   originalR0R1MasksReflected:0,
   originalSourceMaskCellBitReflectionOperations:0,
   fullQOriginalHorizontalReflectionAutomorphism:0,
   mirrorRelatedCurrentFirstActionTiesProved:0,
   postActionMirrorSupportEqualPairsCompared:0,
   postActionMirrorSupportInequalityPairsExcluded:0,
   originalQRawOwnerOpponentCofactorMaskCopies:0,
   originalQRawGeneratorSubsetTests:0,
   directWeakP0WDLInequalities:0,
   originalSourceReflectionWdlDirectEqualities:0,
   sourceCurrentActionOrderReachabilityChecks:0,
   staticColumnPermutationAssignmentsSearched:0,
   staticCompletedColumnPermutationCandidatesEnumerated:0,
   futureGameSuccessorQMaterialized:0,
   independentlyValuedAlternativeStrategicGameOutcomes:0,
   staticSourceMaskBudgetIncomplete:false
  };
  function phi(mask){
   stats.originalR0R1MasksReflected++;
   let out=0n;
   for(let id=0;id<N;id++){
    stats.originalSourceMaskCellBitReflectionOperations++;
    if(mask&(1n<<BigInt(id)))out|=mapBit[id];
   }
   return out;
  }
  const reflectedH=h.every((z,c)=>z===h[mirror(c)]);
  let exactQautomorphism=false;
  if(reflectedH){
   exactQautomorphism=[q.R0,q.R1].every(R=>{
    const set=new Set(R.map(String));
    return R.every(G=>set.has(String(phi(G))));
   });
   if(exactQautomorphism)stats.fullQOriginalHorizontalReflectionAutomorphism=1;
  }
  const R0=new Set(q.R0.map(String)),R1=new Set(q.R1.map(String));
  function raw(owner,col,x){
   const R=owner===0?q.R0:q.R1;
   const result=owner===p?R.map(G=>G&~x):
    R.filter(G=>(G&x)===0n);
   stats.originalQRawOwnerOpponentCofactorMaskCopies+=result.length;
   return result;
  }
  function covers(from,to){
   const witnesses=[];
   for(const G of from){
    const reflected=phi(G);
    let matching=null;
    for(const H of to){
     stats.originalQRawGeneratorSubsetTests++;
     if(stats.originalQRawGeneratorSubsetTests>maxStaticSubsetTests)
      throw Error('SOURCE_FIXED_REFLECTION_STATIC_SOURCE_SUBSET_BUDGET');
     if((H&reflected)===H){matching=H;break;}
    }
    if(matching===null)return null;
    witnesses.push({originalSourceRawMask:'0x'+G.toString(16),
     mirroredRawMask:'0x'+reflected.toString(16),
     dominatingOriginalRawMask:'0x'+matching.toString(16)});
   }
   return witnesses;
  }
  const edges=[],edgeKeys=new Set();
  function appendEdge(a,b,kind,proof){
   if(a===b)return;
   const key=a+','+b;
   if(edgeKeys.has(key))return;
   edgeKeys.add(key);
   stats.directWeakP0WDLInequalities++;
   edges.push({lowerP0ValueOriginalLiteralAction:a+1,
    upperP0ValueOriginalLiteralAction:b+1,
    kind,sourceProof:proof,sourceFutureWDLQueries:0});
  }
  if(exactQautomorphism){
   for(const a of legal){
    const b=mirror(a);
    if(a>=b)continue;
    appendEdge(a,b,'CURRENT_Q_EXACT_FULL_FUTURE_REFLECTION_AUTOMORPHISM',
      {hMirrorInvariant:true,R0MirrorInvariant:true,R1MirrorInvariant:true});
    appendEdge(b,a,'CURRENT_Q_EXACT_FULL_FUTURE_REFLECTION_AUTOMORPHISM',
      {hMirrorInvariant:true,R0MirrorInvariant:true,R1MirrorInvariant:true});
    stats.mirrorRelatedCurrentFirstActionTiesProved++;
    stats.originalSourceReflectionWdlDirectEqualities++;
   }
  }
  try{
   for(const a of legal)for(const b of legal){
    if(a===b)continue;
    // One fixed horizontal reflection ONLY; mapping every column's
    // post-action support MUST agree under phi, otherwise no q
    // future-program simulation is possible via this source map.
    const same=Array.from({length:W},(_,c)=>
     h[c]+(c===a?1:0)===
      h[mirror(c)]+(mirror(c)===b?1:0)).every(Boolean);
    if(!same){stats.postActionMirrorSupportInequalityPairsExcluded++;continue;}
    stats.postActionMirrorSupportEqualPairsCompared++;
    if(edgeKeys.has(a+','+b))continue; // exact q automorphism already proved
    if(n+1===N)continue;
    const xa=bit(a,h[a]),xb=bit(b,h[b]),own=p===0?q.R0:q.R1;
    if(own.some(G=>G===xa||G===xb))continue;
    const F0a=raw(0,a,xa),F0b=raw(0,b,xb),
      F1a=raw(1,a,xa),F1b=raw(1,b,xb);
    const A=covers(F0a,F0b);
    if(A===null)continue;
    const B=covers(F1b,F1a);
    if(B===null)continue;
    appendEdge(a,b,'FIXED_GLOBAL_REFLECTION_RAW_ORIGINAL_Q_P0_WEAK_WDL_TRANSPORT',
      {reflectedFullPostActionGravitySupport:true,
       P0SourceSubsetWitnesses:A,
       P1ReverseSourceSubsetWitnesses:B});
   }
  }catch(e){
   if(String(e.message)==='SOURCE_FIXED_REFLECTION_STATIC_SOURCE_SUBSET_BUDGET'){
    stats.staticSourceMaskBudgetIncomplete=true;
    return {status:'INCOMPLETE',reason:'FIXED_GLOBAL_REFLECTION_SOURCE_SUBSET_BUDGET',
      originalSourceFullMirrorAutomorphismProved:exactQautomorphism,
      sourceP0WdlWeakOrderEdges:edges,
      selectedOriginalLiteralBestColumn:null,statistics:stats};
   }
   throw e;
  }
  const index=new Map(legal.map((c,i)=>[c,i])),M=legal.length,
   reach=Array.from({length:M},()=>Array(M).fill(false)),
   hop=Array.from({length:M},()=>Array(M).fill(null));
  for(let i=0;i<M;i++){reach[i][i]=true;hop[i][i]=i;}
  for(const e of edges){
   const i=index.get(e.lowerP0ValueOriginalLiteralAction-1),
    j=index.get(e.upperP0ValueOriginalLiteralAction-1);
   reach[i][j]=true;hop[i][j]=j;
  }
  for(let k=0;k<M;k++)for(let i=0;i<M;i++)for(let j=0;j<M;j++){
   stats.sourceCurrentActionOrderReachabilityChecks++;
   if(reach[i][k]&&reach[k][j]&&!reach[i][j]){
    reach[i][j]=true;hop[i][j]=hop[i][k];
   }
  }
  const best=legal.filter((c,i)=>legal.every((_,j)=>
   p===0?reach[j][i]:reach[i][j]));
  const equivalence=[];
  const seen=new Set();
  for(let i=0;i<M;i++){
   if(seen.has(i))continue;
   const classIndexes=[];
   for(let j=0;j<M;j++){
    if(reach[i][j]&&reach[j][i]){seen.add(j);classIndexes.push(j);}
   }
   equivalence.push(classIndexes.map(x=>legal[x]+1));
  }
  if(!best.length)return {status:'INCOMPLETE',
    reason:'NO_SOURCE_WDL_ORDER_EXTREMUM_FROM_ONE_FIXED_REFLECTION',
    originalSourceFullMirrorAutomorphismProved:exactQautomorphism,
    originalLegalLiteralColumns:legal.map(c=>c+1),
    sourceP0WdlWeakOrderEdges:edges,
    sourceProvedActionWdlEqualityClasses:equivalence,
    selectedOriginalLiteralBestColumn:null,
    numericalRootWDL:null,statistics:stats};
  const a=best[0],to=index.get(a),proof=[];
  for(let i=0;i<M;i++){
   const from=p===0?i:to,dest=p===0?to:i,seq=[from];
   let z=from;
   for(let t=0;z!==dest;t++){
    if(t>M)throw Error('direct reflection source order path failed');
    z=hop[z][dest];
    if(z===null)throw Error('source reflection proof path missing link');
    seq.push(z);
   }
   proof.push({sourceWdlLessOrEqualOriginalActionPath:seq.map(x=>legal[x]+1)});
  }
  return {status:'VALID_CONTINUATION',
   kind:'ORIGINAL_Q_ONE_FIXED_REFLECTION_DIRECT_WDL_ORDER_EXTREMAL',
   selectedOriginalLiteralBestColumn:a+1,
   numericalRootWDL:null,sourceOutcomeTier:null,
   sourceFullBestSetClaimed:false,
   originalSourceFullMirrorAutomorphismProved:exactQautomorphism,
   originalLegalLiteralColumns:legal.map(c=>c+1),
   sourceP0WdlWeakOrderEdges:edges,
   sourceProvedActionWdlEqualityClasses:equivalence,
   sourceProofOfBest:proof,
   sourceIndependentFutureGameWDLsEvaluated:0,
   statistics:stats};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}


// --- ORIGINAL: research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-source-two-fixed-transform-WDL-extremum.mjs  GitBlob=954c2739211272da10a258d1adcc5daab6b71319 ---
// ORIGINAL q SOURCE-only WDL order from TWO predetermined transformations:
// (1) swap just two equal-height original first-action columns,
// (2) horizontally REFLECT the entire original board.
// NO search/enumeration of candidate whole-column permutations;
// NO future-game WDL evaluations or game successors. Complete source
// proof frozen before independent true7x6 physical control:
// docs/research/2026-10-17-fixed-transposition-plus-reflection-source-WDL-closure.md
function createSourceTwoFixedTransformWdlExtremum({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||
    K>Math.min(W,H)||W*H>42)throw Error('invalid true gravity Connect-K');
 const geometry={width:W,height:H,connect:K},
  two=createSourceFixedTwoColumnSwapWdlOrder(geometry),
  mirror=createOriginalSourceFixedReflectionWdlOrder(geometry);
 function compute(q,{maxFixedSubsetTests=120000,maxReflectedSubsetTests=150000}={}){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||
    h.some(z=>!Number.isInteger(z)||z<0||z>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(z=>typeof z!=='bigint'||z<=0n))
   throw Error('current original first-win stopped normalized q expected');
  const n=h.reduce((s,x)=>s+x,0),p=n&1,
   legal=h.flatMap((z,c)=>z<H?[c+1]:[]);
  if(n>=W*H||!legal.length)throw Error('original terminal q rejected');
  const swap=two.compute(q,{maxStaticSubsetTests:maxFixedSubsetTests}),
   reflection=mirror.compute(q,{maxStaticSubsetTests:maxReflectedSubsetTests});
  const stats={
   sourceOriginalRank:n,mover:p,
   literalLegalOriginalColumns:legal.length,
   fixedSwapOriginalActionPairsCompared:
    swap.statistics.originalStaticLiteralActionPairsConsidered,
   fixedSwapOriginalRawGeneratorSubsetChecks:
    swap.statistics.exactOriginalGeneratorSubsetChecks,
   fixedReflectionOriginalRawGeneratorSubsetChecks:
    reflection.statistics.originalQRawGeneratorSubsetTests,
   fixedReflectionExactOriginalQFullGameAutomorphism:
    reflection.originalSourceFullMirrorAutomorphismProved,
   sourceFixedSwapP0WeakOrderEdges:
    swap.sourceProvedOriginalWeakWdlOrderEdges.length,
   sourceFixedReflectionP0WeakOrderEdges:
    reflection.sourceP0WdlWeakOrderEdges.length,
   sourceUnionDistinctWeakP0WdlEdges:0,
   sourceTransitiveClosureActionLabelBooleanOps:0,
   sourceRootBestMovesSelectedByUnion:0,
   sourceRootBestWasProvedByFixedSwapAlone:swap.status==='VALID_CONTINUATION',
   sourceRootBestWasProvedByReflectionAlone:reflection.status==='VALID_CONTINUATION',
   staticWholeColumnPermutationCandidatesEnumerated:0,
   staticColumnPermutationAssignmentNodes:0,
   futureGameQSuccessorObjectsConstructed:0,
   strategicFutureGameValueCalls:0,
   sourceFullGameValueUnknown:true
  };
  const edgeByKey=new Map();
  for(const e of swap.sourceProvedOriginalWeakWdlOrderEdges){
   const a=e.lowerP0ValueLiteralAction,b=e.upperP0ValueLiteralAction;
   edgeByKey.set(a+','+b,{
    lowerP0ValueOriginalLiteralAction:a,
    upperP0ValueOriginalLiteralAction:b,
    fixedOriginalTransformKind:'SWAP_ONLY_TWO_CURRENT_LEGAL_COLUMNS',
    sourceWitness:e
   });
  }
  for(const e of reflection.sourceP0WdlWeakOrderEdges){
   const a=e.lowerP0ValueOriginalLiteralAction,b=e.upperP0ValueOriginalLiteralAction;
   if(!edgeByKey.has(a+','+b))edgeByKey.set(a+','+b,{
    lowerP0ValueOriginalLiteralAction:a,upperP0ValueOriginalLiteralAction:b,
    fixedOriginalTransformKind:'FULL_ORIGINAL_HORIZONTAL_REFLECTION',
    sourceWitness:e
   });
  }
  stats.sourceUnionDistinctWeakP0WdlEdges=edgeByKey.size;
  const map=new Map(legal.map((c,i)=>[c,i])),M=legal.length,
   paths=Array.from({length:M},()=>Array(M).fill(false)),
   next=Array.from({length:M},()=>Array(M).fill(null));
  for(let i=0;i<M;i++){paths[i][i]=true;next[i][i]=i;}
  for(const e of edgeByKey.values()){
   const i=map.get(e.lowerP0ValueOriginalLiteralAction),
    j=map.get(e.upperP0ValueOriginalLiteralAction);
   if(i===undefined||j===undefined)
    throw Error('source fixed transform emitted nonlegal original column');
   paths[i][j]=true;next[i][j]=j;
  }
  for(let k=0;k<M;k++)for(let i=0;i<M;i++)for(let j=0;j<M;j++){
   stats.sourceTransitiveClosureActionLabelBooleanOps++;
   if(paths[i][k]&&paths[k][j]&&!paths[i][j]){
    paths[i][j]=true;next[i][j]=next[i][k];
   }
  }
  const best=legal.filter((a,i)=>legal.every((_,j)=>p===0?paths[j][i]:paths[i][j]));
  const classes=[],seen=new Set();
  for(let i=0;i<M;i++){
   if(seen.has(i))continue;
   const group=[];
   for(let j=0;j<M;j++)if(paths[i][j]&&paths[j][i]){
    seen.add(j);group.push(legal[j]);
   }
   classes.push(group);
  }
  if(!best.length)return{
   status:'INCOMPLETE',
   reason:'FIXED_SWAP_AND_REFLECTION_ORDER_GRAPH_LACKS_GLOBAL_CURRENT_MOVER_EXTREMUM',
   originalCurrentQFullReflectionAutomorphism:
    reflection.originalSourceFullMirrorAutomorphismProved,
   originalLegalLiteralColumns:legal,
   sourceActionEquivalenceClassesFromTwoFixedTransforms:classes,
   sourceProvedWeakOriginalWDLInequalities:[...edgeByKey.values()],
   selectedOriginalLiteralBestColumn:null,ordinaryRootP0RelativeValue:null,
   sourceFutureValuesQueried:0,statistics:stats
  };
  stats.sourceRootBestMovesSelectedByUnion=best.length;
  const chosen=best[0],t=map.get(chosen),cert=[];
  for(let i=0;i<M;i++){
   const a=p===0?i:t,b=p===0?t:i;
   const labels=[legal[a]];let now=a,remaining=0;
   while(now!==b){
    now=next[now][b];
    if(now===null||++remaining>M)throw Error('source fixed transform action order path missing');
    labels.push(legal[now]);
   }
   const originalEdges=[];
   for(let j=1;j<labels.length;j++){
    const e=edgeByKey.get(labels[j-1]+','+labels[j]);
    if(!e)throw Error('source transitive path missing certificate edge');
    originalEdges.push({lowerP0ValueOriginalLiteralAction:labels[j-1],
      upperP0ValueOriginalLiteralAction:labels[j],
      fixedTransformProofKind:e.fixedOriginalTransformKind});
   }
   cert.push({fromOriginalLiteralAction:labels[0],
    toOriginalLiteralAction:labels[labels.length-1],
    provenWeakP0WdlPath:labels,originalFixedProofEdges:originalEdges});
  }
  return {status:'VALID_CONTINUATION',
   kind:'SOURCE_QUALITATIVE_BEST_FROM_FIXED_SWAP_AND_HORIZ_REFLECTION_ONLY',
   mover:p,selectedOriginalLiteralBestColumn:chosen,
   ordinaryRootP0RelativeValue:null,rootBestOutcomeTier:null,
   allBestOriginalLiteralColumnsNotClaimed:true,
   sourceRootBestEvenWithoutWdlScalar:true,
   sourceRootBestWasProvedBySwapAlone:swap.status==='VALID_CONTINUATION',
   sourceRootBestWasProvedByReflectionAlone:reflection.status==='VALID_CONTINUATION',
   sourceCurrentQExactHorizontalReflection:
    reflection.originalSourceFullMirrorAutomorphismProved,
   originalLegalLiteralColumns:legal,
   sourceActionEquivalenceClassesFromTwoFixedTransforms:classes,
   sourceProvedWeakOriginalWDLInequalities:[...edgeByKey.values()],
   sourceBestDominatesAllOriginalLegalActionProof:cert,
   sourceFutureGameValuesIndependentlyComputed:0,
   statistics:stats};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}

