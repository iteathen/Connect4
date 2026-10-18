// ORIGINAL q=(h,R0,R1) source-only NONBIJECTIVE P0-relative
// first-action WDL WEAK ORDER through complete opponent reply coverage.
// FROZEN theorem docs/research/2026-10-18-nonbijective-one-round-reply-simulation-strategy-order.md
// For current P0, forall RIGHT opponent replies s, exists LEFT r with
// V(a,r)<=V(b,s); for current P1, forall LEFT r exists RIGHT s.
// Source uses original raw q generator masks, direct two-event contraction,
// 1 deterministic height-transport π per reply pair. NO successor q,
// game-value calculations, future opponent policies or QBF/minimax search.
export function createOriginalNonbijectiveReplyWdlOrder({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||H<2||
    K<2||K>Math.min(W,H)||W*H>42)throw Error('invalid gravity original geometry');
 const N=W*H,cell=(c,r)=>r*W+c,bit=z=>1n<<BigInt(z),bitCell=(c,r)=>bit(cell(c,r));
 const originalBits=Array.from({length:N},(_,z)=>bit(z));
 const reflection=Array.from({length:W},(_,i)=>W-1-i);
 const nbits=m=>{let n=0;for(;m;m&=m-1n)n++;return n;};
 function analyze(q,{maxStaticGeneratorTests=1800000}={}){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||h.some(z=>!Number.isInteger(z)||z<0||z>H)||
   !Array.isArray(q.R0)||!Array.isArray(q.R1)||
   [...q.R0,...q.R1].some(z=>typeof z!=='bigint'||z<=0n))
   throw Error('real original nonterminal q required');
  const n=h.reduce((x,y)=>x+y,0),p=n&1,o=1-p,legal=[];
  for(let c=0;c<W;c++)if(h[c]<H)legal.push(c);
  if(n>=N||!legal.length)throw Error('root original board full');
  let future=0n;
  for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)future|=bitCell(c,r);
  if([...q.R0,...q.R1].some(G=>(G&~future)!==0n))
   throw Error('original root R owner masks include nonfuture physical cells');
  const stats={sourceOriginalRootPly:n,sourceOriginalCurrentMover:p,
   currentLegalLiteralFirstActions:legal.length,sourceRootOrderedActionPairs:0,
   sourceOpponentReplyOriginalLabelPairRelationChecks:0,
   sourceTerminalSafeReplyPairEdges:0,sourceStaticHeightHistogramMismatchPairs:0,
   sourceDeterministicStableHeightPostTwoMaps:0,sourceDeterministicFixedFullReflectionMaps:0,
   sourceDeterministicFixedTwoColumnSwapMaps:0,
   sourceOriginalGeneratorSubsetChecks:0,sourceOriginalGeneratorMasksTransformed:0,
   sourceOriginalReplyCoverageRoots:0,sourcePositiveActionWdlEdges:0,
   sourceZeroFutureWdlValues:0,sourceZeroFutureGameQObjects:0,
   sourceZeroOpponentPolicyTrees:0,sourceZeroStaticMapCandidatePermutationSearch:true,
   sourceBudgetIncomplete:false};
  const edges=[];
  const winFirst=c=>(p===0?q.R0:q.R1).some(G=>G===bitCell(c,h[c]));
  const immediate=new Set(legal.filter(winFirst));
  const equalHeightsMap=(Hleft,Hright,pi)=>
   Hleft.every((ht,c)=>Hright[pi[c]]===ht);
  const sameHistogram=(Hleft,Hright)=>{
   const a=Hleft.slice().sort((a,b)=>a-b),b=Hright.slice().sort((a,b)=>a-b);
   return a.every((v,i)=>v===b[i]);
  };
  function canonicalMap(Hleft,Hright,a,b){
   if(!sameHistogram(Hleft,Hright))return null;
   if(equalHeightsMap(Hleft,Hright,reflection)){
    stats.sourceDeterministicFixedFullReflectionMaps++;
    return {pi:reflection,kind:'FIXED_FULL_POST_TWO_REFLECTION'};
   }
   const swap=Array.from({length:W},(_,j)=>j);
   swap[a]=b;swap[b]=a;
   if(equalHeightsMap(Hleft,Hright,swap)){
    stats.sourceDeterministicFixedTwoColumnSwapMaps++;
    return {pi:swap,kind:'FIXED_ROOT_FIRST_ACTION_POST_TWO_SWAP'};
   }
   const indexed=v=>Array.from({length:W},(_,c)=>c).sort((a,b)=>v[a]-v[b]||a-b);
   const left=indexed(Hleft),right=indexed(Hright),pi=Array(W);
   for(let k=0;k<W;k++)pi[left[k]]=right[k];
   if(!equalHeightsMap(Hleft,Hright,pi))
    throw Error('deterministic height-class canonical map not valid');
   stats.sourceDeterministicStableHeightPostTwoMaps++;
   return {pi,kind:'STABLE_POST_TWO_HEIGHT_CLASS_MAP'};
  }
  class Budget extends Error {}
  function charge(){
   if(++stats.sourceOriginalGeneratorSubsetChecks>maxStaticGeneratorTests)
    throw new Budget('static original q finite reply-pair/generator mask tests exhausted');
  }
  function mapMask(G,pi){
   let v=0n;
   stats.sourceOriginalGeneratorMasksTransformed++;
   for(let z=0;z<N;z++)if((G&originalBits[z])!==0n)
    v|=bitCell(pi[z%W],Math.floor(z/W));
   return v;
  }
  function inversePi(pi){const back=Array(W);
   for(let i=0;i<W;i++)back[pi[i]]=i;
   return back;
  }
  // One fixed original generator and TWO static physical landed cells;
  // returns null for blocked G, otherwise RAW GENERATOR MASK expression.
  // Does not create any future game state or raw per-reply q family arrays.
  function residual(G,owner,x,y){
   if(owner===p){if((G&y)!==0n)return null;return G&~x;}
   if((G&x)!==0n)return null;return G&~y;
  }
  function coverage(originalFrom,originalTo,owner,x,y,xx,yy,pi,reverse){
   // reverse=false: for each LEFT original viable residual G find H RIGHT
   // with H subset pi(G). reverse=true: for each RIGHT H find LEFT G
   // with G subset inverse_pi(H). Owner p unaffected by ordering of events.
   if(!reverse){
    for(const G of originalFrom){
     const ga=residual(G,owner,x,y);if(ga===null)continue;
     const mg=mapMask(ga,pi);let seen=false;
     for(const H of originalTo){
      const hb=residual(H,owner,xx,yy);if(hb===null)continue;
      charge();
      if((hb&mg)===hb){seen=true;break;}
     }
     if(!seen)return false;
    }
   }else{
    const inv=inversePi(pi);
    for(const H of originalTo){
     const hb=residual(H,owner,xx,yy);if(hb===null)continue;
     const mh=mapMask(hb,inv);let seen=false;
     for(const G of originalFrom){
      const ga=residual(G,owner,x,y);if(ga===null)continue;
      charge();
      if((ga&mh)===ga){seen=true;break;}
     }
     if(!seen)return false;
    }
   }
   return true;
  }
  function provePair(a,r,b,s){
   stats.sourceOpponentReplyOriginalLabelPairRelationChecks++;
   const ha=h.slice(),hb=h.slice(),x=bitCell(a,ha[a]),xx=bitCell(b,hb[b]);
   ha[a]++;hb[b]++;
   if(ha[r]>=H||hb[s]>=H)return null;
   const y=bitCell(r,ha[r]),yy=bitCell(s,hb[s]);
   ha[r]++;hb[s]++;
   const opponentR=o===0?q.R0:q.R1;
   const leftWin=opponentR.some(G=>G===y&&(G&x)===0n);
   const rightWin=opponentR.some(G=>G===yy&&(G&xx)===0n);
   if(leftWin||rightWin){
    if(leftWin&&rightWin||leftWin&&o===1||rightWin&&o===0){
     stats.sourceTerminalSafeReplyPairEdges++;
     return {kind:'SOURCE_SAFE_OPPONENT_IMMEDIATE_FIRST_WIN_BOUND',
      mapKind:null,staticSubsetMasksChecked:0};
    }
    return null;
   }
   const perm=canonicalMap(ha,hb,a,b);
   if(perm===null){stats.sourceStaticHeightHistogramMismatchPairs++;return null;}
   const start=stats.sourceOriginalGeneratorSubsetChecks;
   if(!coverage(q.R0,q.R0,0,x,y,xx,yy,perm.pi,false))return null;
   if(!coverage(q.R1,q.R1,1,x,y,xx,yy,perm.pi,true))return null;
   return {kind:'SOURCE_FULL_FUTURE_SAME_SUPPORT_RESIDUAL_WDL_MONOTONE',
    mapKind:perm.kind,mapColumns:perm.pi.map(x=>x+1),
    staticSubsetMasksChecked:stats.sourceOriginalGeneratorSubsetChecks-start};
  }
  try{
   if(n+2<N)for(const a of legal)for(const b of legal){
    if(a===b)continue;
    stats.sourceRootOrderedActionPairs++;
    if(immediate.has(a)||immediate.has(b))continue;
    const left=h.flatMap((v,c)=>v+(c===a?1:0)<H?[c]:[]),
      right=h.flatMap((v,c)=>v+(c===b?1:0)<H?[c]:[]);
    const pairRelation=[],cover=new Set();
    // SOURCE quantifier orientation: current P0 => right (b) MIN replies
    // all covered by SOME left reply. Current P1 => all left (a) MAX
    // replies covered by SOME right reply.
    if(p===0){
     for(const s of right){
      let witness=null;
      for(const r of left){
       const result=provePair(a,r,b,s);
       if(result){witness={leftOriginalOpponentReply:r+1,
        rightOriginalOpponentReply:s+1,...result};break;}
      }
      if(witness){pairRelation.push(witness);cover.add(s);}
      else break;
     }
    }else{
     for(const r of left){
      let witness=null;
      for(const s of right){
       const result=provePair(a,r,b,s);
       if(result){witness={leftOriginalOpponentReply:r+1,
        rightOriginalOpponentReply:s+1,...result};break;}
      }
      if(witness){pairRelation.push(witness);cover.add(r);}
      else break;
     }
    }
    if(cover.size!==(p===0?right.length:left.length))continue;
    stats.sourceOriginalReplyCoverageRoots++;
    stats.sourcePositiveActionWdlEdges++;
    edges.push({lowerP0RelativeOriginalFirstColumn:a+1,upperP0RelativeOriginalFirstColumn:b+1,
     theorem:'NONBIJECTIVE_REPLY_SIMULATION',
     sourceOpponentQuantifier:p===0?'FOR_EVERY_RIGHT_REPLY_EXISTS_LEFT_REPLY':'FOR_EVERY_LEFT_REPLY_EXISTS_RIGHT_REPLY',
     coveredOriginalReplyCount:cover.size,
     sourceReplyPairFullFutureStaticProofWitnesses:pairRelation,
     sourceFutureGameQValuesComputed:0,
     sourceFutureQChildrenMaterialized:0});
   }
  }catch(e){
   if(!(e instanceof Budget))throw e;
   stats.sourceBudgetIncomplete=true;
   return {status:'INCOMPLETE_SOURCE_STATIC_GENERATOR_REPLY_RESOURCE_BUDGET',
    sourceOriginalWeakP0WdlEdges:edges,selectedBestOriginalColumn:null,
    originalRootWDLP0Relative:null,statistics:stats};
  }
  const ix=new Map(legal.map((c,i)=>[c,i])),reach=Array.from({length:legal.length},(_,i)=>
   Array.from({length:legal.length},(_,j)=>i===j));
  for(const ed of edges){
   reach[ix.get(ed.lowerP0RelativeOriginalFirstColumn-1)][ix.get(ed.upperP0RelativeOriginalFirstColumn-1)]=true;
  }
  for(let k=0;k<legal.length;k++)for(let i=0;i<legal.length;i++)for(let j=0;j<legal.length;j++)
   if(reach[i][k]&&reach[k][j])reach[i][j]=true;
  const best=legal.filter((v,j)=>legal.every((_,i)=>p===0?reach[i][j]:reach[j][i]));
  return {status:best.length?'SOURCE_CERTIFIED_ONE_OPTIMAL_ORIGINAL_FIRST_ACTION':'INCOMPLETE_SOURCE_GLOBAL_WEAK_WDL_ORDER',
   originalRootHeights:h.slice(),originalRootPly:n,originalCurrentMover:p,
   originalLegalLiteralFirstActions:legal.map(c=>c+1),
   selectedBestOriginalColumn:best.length?best[0]+1:null,
   allSourceCertifiedExtrema:best.map(c=>c+1),
   sourceOriginalWeakP0WdlEdges:edges,
   sourceOrdinaryRootWDL:null,sourceCompleteAllBestOriginalLabels:null,
   sourceAlternativeStrategicallyInequivalentFutureGameValues:0,
   statistics:stats};
 }
 return Object.freeze({analyze});
}
