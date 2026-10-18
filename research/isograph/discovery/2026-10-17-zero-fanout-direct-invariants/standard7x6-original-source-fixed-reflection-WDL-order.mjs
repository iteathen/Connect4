// SOURCE-ONLY direct FULL HORIZONTAL BOARD REFLECTION q automorphism
// and direct weak-WDL q-cofactor comparison under ONE fixed reflection.
// NO enumeration/search of column permutation candidate mappings,
// NO game future values or normalized future-game q construction.
// Original source theorem frozen before physical control:
// docs/research/2026-10-17-fixed-reflection-source-q-automorphism-and-weak-WDL-order.md
export function createOriginalSourceFixedReflectionWdlOrder({width:W,height:H,connect:K}){
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
