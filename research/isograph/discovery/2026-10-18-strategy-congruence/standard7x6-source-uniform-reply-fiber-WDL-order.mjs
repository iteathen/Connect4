// PURE original q=(h,R0,R1) STATIC alternating-simulation reply-fiber proof.
// FROZEN theorem: docs/research/2026-10-18-uniform-opponent-reply-fiber-source-action-preorder.md
// One FIXED root source column transposition or reflection for ALL reply labels.
// No future game WDL, no future strategic q objects, no QBF/BDD, no search over
// π choices. For each ACTUAL opponent reply original label, compare raw
// original source mask contractions by full-future monotonicity and terminal
// guards. Count these finite response obligations explicitly (not a game-value
// branch, and not a zero-arithmetic claim). Output a P0-relative WEAK ORDER.
export function createSourceUniformReplyFiberWdlOrder({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||K<2||
    K>Math.min(W,H)||W*H>42)throw Error('invalid source geometry');
 const N=W*H, bit=z=>1n<<BigInt(z),id=(c,r)=>r*W+c;
 const cells=Array.from({length:W*H},(_,i)=>bit(i));
 function certify(q,{maxSourceOriginalMaskSubsetChecks=1250000}={}){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||h.some(v=>!Number.isInteger(v)||v<0||v>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(z=>typeof z!=='bigint'||z<=0n))
   throw Error('exact original first-win-stopped residual q required');
  const n=h.reduce((a,b)=>a+b,0),p=n&1,o=1-p;
  if(n>=N)throw Error('root terminal');
  let future=0n;
  for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)future|=bit(id(c,r));
  if([...q.R0,...q.R1].some(G=>(G&~future)!==0n))
   throw Error('original q residual generator outside future');
  const legal=h.flatMap((z,c)=>z<H?[c+1]:[]);
  const stats={originalRootPly:n,legalOriginalColumns:legal.length,
   sourceFirstActionOrderedPairsConsidered:0,
   sourcePredeclaredColumnMapsChecked:0,
   sourceOnePlyImmediateTerminalRootPairsSkipped:0,
   sourcePairedOpponentReplyOriginalLabelsExamined:0,
   sourcePairedReplyImmediateTerminalCases:0,
   sourceRawTwoPlyGeneratorMasksConstructed:0,
   sourceGeneratorSubsetComparisons:0,
   sourceDirectWeakWdlEdges:0,
   sourceNewBestActionGraphReachabilityEdges:0,
   sourceFutureGameQObjectsMaterialized:0,
   sourceStrategicallyInequivalentFutureWdlGamesValued:0,
   sourceOtherProverAlternativePermutationsEnumerated:0,
   sourceReflectedOrSwappedFutureValueQueries:0,
   sourceMaxOpponentReplyFiberBranchCount:0,
   sourceSemanticReplyObligationsInspected:true,
   sourceNoSearchOverStaticMappings:true};
  const edges=[];
  function fixedMaps(a,b){
   const result=[];
   if(h[a-1]===h[b-1]){
    const pi=Array.from({length:W},(_,c)=>c);
    pi[a-1]=b-1;pi[b-1]=a-1;
    result.push({kind:'FIXED_ROOT_TWO_COLUMN_TRANSPOSITION',pi});
   }
   const reflection=Array.from({length:W},(_,c)=>W-1-c);
   if(reflection[a-1]===b-1&&h.every((z,c)=>z===h[reflection[c]])&&
      !result.some(v=>v.pi.every((y,c)=>y===reflection[c])))
    result.push({kind:'FIXED_ROOT_FULL_REFLECTION',pi:reflection});
   return result;
  }
  const raw=(x,y,s)=> {
   const masks=[];
   if(s===p){
    for(const G of s===0?q.R0:q.R1)if((G&bit(y))===0n){
     masks.push(G&~bit(x));stats.sourceRawTwoPlyGeneratorMasksConstructed++;
    }
   }else{
    for(const G of s===0?q.R0:q.R1)if((G&bit(x))===0n){
     masks.push(G&~bit(y));stats.sourceRawTwoPlyGeneratorMasksConstructed++;
    }
   }
   return masks;
  };
  function permuteMask(G,pi){
   let result=0n;
   for(let i=0;i<N;i++)if((G&cells[i])!==0n)
    result|=bit(id(pi[i%W],Math.floor(i/W)));
   return result;
  }
  function included(A,B,pi){ // U(A) subset U(π^-1(B))
   if(!A.length)return true;
   if(!B.length)return false;
   for(const G of A){
    const mapped=permuteMask(G,pi);
    let found=false;
    for(const H of B){
     stats.sourceGeneratorSubsetComparisons++;
     if(stats.sourceGeneratorSubsetComparisons>maxSourceOriginalMaskSubsetChecks)
      return false; // conservative proof budget, never assert a failed pair
     if((H&mapped)===H){found=true;break;}
    }
    if(!found)return false;
   }
   return true;
  }
  const immediateFirst=(col)=>{
   const x=id(col-1,h[col-1]);
   return (p===0?q.R0:q.R1).some(G=>G===bit(x));
  };
  const firstWin=new Map(legal.map(c=>[c,immediateFirst(c)]));
  function check(a,b,map){
   const pi=map.pi,x=id(a-1,h[a-1]),xx=id(b-1,h[b-1]);
   if(pi[a-1]!==b-1||!h.every((height,c)=>h[pi[c]]===height))
    throw Error('predeclared π does not transport first-action gravity support');
   const firstHeight=h.slice(),secondHeight=h.slice();
   firstHeight[a-1]++;secondHeight[b-1]++;
   let covered=0,terminal=0;
   const proofs=[];
   for(let r=1;r<=W;r++){
    if(firstHeight[r-1]===H)continue;
    const s=pi[r-1]+1;
    if(secondHeight[s-1]===H)return null;
    const y=id(r-1,firstHeight[r-1]),yy=id(s-1,secondHeight[s-1]);
    if(permuteMask(bit(y),pi)!==bit(yy))
     throw Error('fixed map failed identical original reply landing cell relation');
    covered++;stats.sourcePairedOpponentReplyOriginalLabelsExamined++;
    const opponentR=o===0?q.R0:q.R1;
    const hasWinA=opponentR.some(G=>G===bit(y)&&(G&bit(x))===0n);
    const hasWinB=opponentR.some(G=>G===bit(yy)&&(G&bit(xx))===0n);
    if(hasWinA||hasWinB){
     terminal++;stats.sourcePairedReplyImmediateTerminalCases++;
     if(hasWinA&&hasWinB)continue;
     const t=o===0?+1:-1;
     if(hasWinA&&t===-1)continue;
     if(hasWinB&&t===+1)continue;
     return null;
    }
    const A0=raw(x,y,0),B0=raw(xx,yy,0),A1=raw(x,y,1),B1=raw(xx,yy,1);
    if(!included(A0,B0,pi))return null;
    // Check U(B1) ⊆ U(π(A1)). Instead of a physically geometric π^-1
    // translate B1 by inverse map to compare with A1. Our allowed maps are
    // INVOLUTIONS (fixed swap or full reflection), so π inverse = π.
    if(!included(B1,A1,pi))return null;
   }
   return {mapKind:map.kind,columnMapOneBased:pi.map(x=>x+1),
    originalFirstActionA:a,originalFirstActionB:b,
    ownerP0RelativeWdlOrder:'J_a <= J_b',
    fullOpponentReplyFiberCardinality:covered,
    pairedReplyImmediateTerminalCases:terminal,
    sourceOriginalFutureGameWdlValuesComputed:0,
    sourceAllOpponentRepliesGuarded:true};
  }
  const ab=legal.slice();
  if(n+2<N){
   for(const a of ab)for(const b of ab){
    if(a===b)continue;
    stats.sourceFirstActionOrderedPairsConsidered++;
    if(firstWin.get(a)||firstWin.get(b)){
     stats.sourceOnePlyImmediateTerminalRootPairsSkipped++;continue;
    }
    for(const map of fixedMaps(a,b)){
     stats.sourcePredeclaredColumnMapsChecked++;
     const proof=check(a,b,map);
     if(proof){edges.push(proof);stats.sourceDirectWeakWdlEdges++;break;}
    }
   }
  }
  // Collate CURRENT ACTION LABEL full-reply-fiber orders by transitivity.
  const index=new Map(legal.map((x,i)=>[x,i]));
  const reach=Array.from({length:legal.length},(_,i)=>Array.from({length:legal.length},(_,j)=>i===j));
  for(const E of edges)reach[index.get(E.originalFirstActionA)][index.get(E.originalFirstActionB)]=true;
  for(let k=0;k<legal.length;k++)
   for(let i=0;i<legal.length;i++)for(let j=0;j<legal.length;j++)
    if(reach[i][k]&&reach[k][j])reach[i][j]=true;
  const best=legal.filter((z,j)=>legal.every((x,i)=>p===0?reach[i][j]:reach[j][i]));
  const selected=best.length?best[0]:null;
  return {status:selected!==null?'SOURCE_CERTIFIED_ONE_BEST_ORIGINAL_ACTION':
      'INCOMPLETE_UNPROVEN_GLOBAL_ACTION_EXTREMUM',
   theorem:'UNIFORM_SINGLE_ROUND_OPPONENT_REPLY_FIBER_WITH_FULL_FUTURE_RESIDUAL_UPSET_ORDER',
   rootOriginalHeightSupport:h.slice(),rootOriginalMover:p,rootOriginalPly:n,
   selectedOriginalBestLiteralColumn:selected,
   selectedActionValidWithoutActionWdlCalculation:selected!==null,
   ordinaryRootWdlP0Relative:null,
   completeLevel2SetKnown:false,
   sourceWeakOriginalActionOrderEdges:edges,
   sourceCurrentActionReachableInequalityPairs:
     legal.flatMap((a,i)=>legal.flatMap((b,j)=>i!==j&&reach[i][j]?[[a,b]]:[])),
   sourceOnePlyCurrentPlayerImmediateWinColumns:[...firstWin].filter(([c,w])=>w).map(([c])=>c),
   statistics:stats};
 }
 return Object.freeze({certify});
}
