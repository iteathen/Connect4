// ORIGINAL q SOURCE deterministic single-column-mapping structural proof.
// For EACH ordered current literal action pair, sort owner-color/row/
// residual-size local incidence signatures ONCE inside each post-action
// height class; test ONE mapping's exact full-future source simulation.
// No permutation DFS, no alternate mapping tests, no future game WDL.
// Theorem frozen prior to tests: docs/research/2026-10-18-deterministic-original-column-incidence-footprint-transport-candidate.md
export function createDeterministicFootprintWdlSource({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||
   K>Math.min(W,H)||W*H>42)throw Error('unsupported original finite gravity geometry');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
 const cellBits=Array.from({length:N},(_,j)=>1n<<BigInt(j));
 function countBits(G){
  let x=G,n=0;while(x){x&=x-1n;n++;}return n;
 }
 function compute(q,{maxSubsetTests=300000,debugPair=null}={}){
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
     q.h.some(v=>!Number.isInteger(v)||v<0||v>H)||
     !Array.isArray(q.R0)||!Array.isArray(q.R1)||
     [...q.R0,...q.R1].some(x=>typeof x!=='bigint'||x<=0n))
   throw Error('requires first-win-stopped original source q');
  const h=q.h,rank=h.reduce((a,x)=>a+x,0),p=rank&1,legal=h.flatMap((v,c)=>v<H?[c]:[]);
  if(rank>=N||!legal.length)throw Error('terminal original q');
  const stats={originalRank:rank,mover:p,
   originalLegalFirstActions:legal.length,
   originalOrderedActionPairsConsidered:0,
   postActionCapacityHistogramCompatiblePairs:0,
   currentOwnerImmediateWinOrFullLastActionExcludedPairs:0,
   sourceRawResidualCofactorMaskDescriptorsConstructed:0,
   sourceColoredFootprintIncidenceCounterUpdates:0,
   sourceDeterministicCanonicalHeightClassSortOperations:0,
   singleCandidateSourceColumnMapsConstructed:0,
   maxCandidateWholeColumnMapsPerOrderedActionPair:1,
   originalGeneratorBitTransports:0,exactSourceGeneratorSubsetTests:0,
   certifiedCurrentP0RelativeWeakOrderEdges:0,
   sourceActionLabelTransitiveClosureTests:0,
   sourceCompletedColumnPermutationCandidateEnumerations:0,
   sourceRecursiveColumnMappingAssignments:0,
   sourceIndependentlyValuedStrategicFutureGames:0,
   sourceFutureGameQConstructed:0,
   sourceOriginalCurrentRootWDLKnown:false,
   sourceStaticGuardExceeded:false};
  const sizes=q.R0.concat(q.R1).map(countBits);
  if(sizes.some(z=>z>K||z<=0))throw Error('original source invalid residual generator');
  function raw(owner,col,x){
   const arr=owner===0?q.R0:q.R1;
   const result=owner===p?arr.map(G=>G&~x):arr.filter(G=>(G&x)===0n);
   stats.sourceRawResidualCofactorMaskDescriptorsConstructed+=result.length;
   return result;
  }
  function histogram(A,B){
   const count=Array(H+1).fill(0);
   for(const x of A)count[x]++;
   for(const x of B)count[x]--;
   return count.every(x=>x===0);
  }
  function footprint(heights,families){
   const profiles=[];
   for(let c=0;c<W;c++){
    const sig=Array(2*K*H).fill(0);
    for(let owner=0;owner<2;owner++)for(const G of families[owner]){
     const k=countBits(G);
     for(let j=0;j<H-heights[c];j++){
      if((G&bit(c,heights[c]+j))!==0n){
       const slot=(owner*K+k-1)*H+j;
       sig[slot]++;
       stats.sourceColoredFootprintIncidenceCounterUpdates++;
      }
     }
    }
    profiles.push({column:c,height:heights[c],signature:sig});
   }
   return profiles;
  }
  function signatureCompare(a,b){
   stats.sourceDeterministicCanonicalHeightClassSortOperations++;
   for(let k=0;k<a.signature.length;k++)
    if(a.signature[k]!==b.signature[k])return a.signature[k]-b.signature[k];
   return a.column-b.column;
  }
  function mapOne(heightA,RA,heightB,RB){
   const profilesA=footprint(heightA,RA),profilesB=footprint(heightB,RB),
     perm=Array(W).fill(-1),inverse=Array(W).fill(-1);
   for(let height=0;height<=H;height++){
    const C=profilesA.filter(x=>x.height===height).sort(signatureCompare),
      D=profilesB.filter(x=>x.height===height).sort(signatureCompare);
    if(C.length!==D.length)throw Error('histogram check was inconsistent');
    for(let j=0;j<C.length;j++){
     perm[C[j].column]=D[j].column;
     inverse[D[j].column]=C[j].column;
    }
   }
   stats.singleCandidateSourceColumnMapsConstructed++;
   if(perm.some(c=>c<0)||inverse.some(c=>c<0))throw Error('direct signature rank mapping incomplete');
   return {perm,inverse,profilesA,profilesB};
  }
  function transport(G,perm){
   let mask=0n;for(let id=0;id<N;id++)if((G&cellBits[id])!==0n){
    stats.originalGeneratorBitTransports++;
    mask|=bit(perm[id%W],Math.floor(id/W));
   }
   return mask;
  }
  function covers(from,to,perm){
   for(const G of from){
    const mapped=transport(G,perm);
    let ok=false;
    for(const H of to){
     stats.exactSourceGeneratorSubsetTests++;
     if(stats.exactSourceGeneratorSubsetTests>maxSubsetTests)
      throw Error('DETERMINISTIC_FOOTPRINT_STATIC_ORIGINAL_SUBSET_BUDGET');
     if((H&mapped)===H){ok=true;break;}
    }
    if(!ok)return false;
   }
   return true;
  }
  const edges=[],notes=[];
  try{
   for(const a of legal)for(const b of legal){
    if(a===b)continue;
    stats.originalOrderedActionPairsConsidered++;
    const ha=h.slice(),hb=h.slice();ha[a]++;hb[b]++;
    if(!histogram(ha,hb))continue;
    stats.postActionCapacityHistogramCompatiblePairs++;
    const xa=bit(a,h[a]),xb=bit(b,h[b]),
     own=p===0?q.R0:q.R1;
    if(rank+1===N||own.some(G=>G===xa||G===xb)){
     stats.currentOwnerImmediateWinOrFullLastActionExcludedPairs++;continue;
    }
    const RA=[raw(0,a,xa),raw(1,a,xa)],
      RB=[raw(0,b,xb),raw(1,b,xb)];
    const {perm,inverse}=mapOne(ha,RA,hb,RB);
    const p0=covers(RA[0],RB[0],perm);
    const p1=p0?covers(RB[1],RA[1],inverse):false;
    if(debugPair&&debugPair[0]===a+1&&debugPair[1]===b+1)
     notes.push({pair:[a+1,b+1],heightA:ha,heightB:hb,
      selectedDeterministicOriginalOneBasedColumnMap:perm.map(c=>c+1),
      P0SourceInclusionGuard:p0,P1ReverseSourceInclusionGuard:p1});
    if(p0&&p1){
     stats.certifiedCurrentP0RelativeWeakOrderEdges++;
     edges.push({sourceLowerP0ValueOriginalLiteralColumn:a+1,
      sourceUpperP0ValueOriginalLiteralColumn:b+1,
      deterministicSingleMappingOriginalOneBased:perm.map(c=>c+1),
      sourceProvedP0RelativeInequality:true,
      rootNumericWDLNotComputed:true});
    }
   }
  }catch(e){
   if(String(e.message)!=='DETERMINISTIC_FOOTPRINT_STATIC_ORIGINAL_SUBSET_BUDGET')throw e;
   stats.sourceStaticGuardExceeded=true;
   return {status:'INCOMPLETE',reason:'STATIC_FOOTPRINT_SOURCE_SUBSET_BUDGET',
    weakEdgesProvedBeforeGuard:edges,debugMapping:notes,
    selectedBestOriginalLiteralColumn:null,statistics:stats};
  }
  const index=new Map(legal.map((c,i)=>[c,i])),M=legal.length,
   reach=Array.from({length:M},()=>Array(M).fill(false)),
   via=Array.from({length:M},()=>Array(M).fill(null));
  for(let i=0;i<M;i++){reach[i][i]=true;via[i][i]=i;}
  for(const e of edges){
   const a=index.get(e.sourceLowerP0ValueOriginalLiteralColumn-1),
     b=index.get(e.sourceUpperP0ValueOriginalLiteralColumn-1);
   reach[a][b]=true;via[a][b]=b;
  }
  for(let k=0;k<M;k++)for(let i=0;i<M;i++)for(let j=0;j<M;j++){
   stats.sourceActionLabelTransitiveClosureTests++;
   if(reach[i][k]&&reach[k][j]&&!reach[i][j]){
    reach[i][j]=true;via[i][j]=via[i][k];
   }
  }
  const candidates=legal.filter((c,i)=>legal.every((_,j)=>p===0?reach[j][i]:reach[i][j]));
  const selected=candidates[0];
  if(selected===undefined)return{status:'INCOMPLETE',
   reason:'NO_CURRENT_MOVER_SOURCE_BEST_FROM_SINGLE_DETERMINISTIC_FOOTPRINT_TRANSPORT',
   sourceProvedWeakP0RelativeActionEdges:edges,
   debugMapping:notes,selectedBestOriginalLiteralColumn:null,
   numericRootWDL:null,statistics:stats};
  return{status:'VALID_CONTINUATION',
   kind:'ORIGINAL_Q_ONE_CANONICAL_INCIDENCE_SORT_MAPPING_WDL_EXTREMUM',
   selectedBestOriginalLiteralColumn:selected+1,
   numericRootWDL:null,bestOutcomeTier:null,
   completeBestMoveSetClaimed:false,
   sourceProvedWeakP0RelativeActionEdges:edges,
   debugMapping:notes,
   sourceIndependentlyValuedFutureGames:0,
   statistics:stats};
 }
 return Object.freeze({width:W,height:H,connect:K,compute});
}
