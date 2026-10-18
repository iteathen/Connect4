// SOURCE original q=(h,R0,R1) unified W-bit opponent-reply-fiber coverage.
// STRATEGY-ORDER conclusion J_a<=J_b from ONE π for all actual reply labels.
// NO per-reply raw cofactor-family arrays; NO future q; NO future game WDL.
// All possible opponent replies are fused as W-bit INCIDENCE masks inside
// each original generator-pair inclusion clause. Finite STATIC O(W*|R|^2)
// source work is counted, NOT falsely described as zero arithmetic.
// Frozen theorem:
// docs/research/2026-10-18-bitset-fused-uniform-opponent-reply-fiber-preorder.md
export function createSourceBitsetFusedUniformReplyWdlOrder({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<2||W>7||H<2||K<2||
    K>Math.min(W,H)||W*H>42)throw Error('invalid original finite gravity W,H,K');
 const N=W*H,bit=z=>1n<<BigInt(z),id=(c,r)=>r*W+c;
 const cellBits=Array.from({length:N},(_,i)=>bit(i));
 function compute(q,{maxStaticGeneratorPairReplyTests=1400000}={}){
  const h=q?.h;
  if(!Array.isArray(h)||h.length!==W||
    h.some(x=>!Number.isInteger(x)||x<0||x>H)||
    !Array.isArray(q.R0)||!Array.isArray(q.R1)||
    [...q.R0,...q.R1].some(x=>typeof x!=='bigint'||x<=0n))
   throw Error('original nonterminal first-win-stopped q required');
  const n=h.reduce((s,v)=>s+v,0),p=n&1,o=1-p;
  if(n>=N)throw Error('original terminal board');
  let future=0n;
  for(let c=0;c<W;c++)for(let r=h[c];r<H;r++)future|=bit(id(c,r));
  if([...q.R0,...q.R1].some(G=>(G&~future)!==0n))
   throw Error('future original source requirements outside gravity capacity');
  const legal=h.flatMap((z,c)=>z<H?[c+1]:[]);
  const stats={originalSourcePly:n,originalCurrentMover:p,
   originalCurrentLegalFirstActionLabels:legal.length,
   sourceDistinctRootOrderedActionPairsConsidered:0,
   sourceFixedColumnMapsChecked:0,
   sourcePairedRootReplyLabelsMasked:0,
   sourceSafeDirectOpponentTerminalReplyBits:0,
   sourceOriginalGeneratorPairReplyScalarPredicateChecks:0,
   sourceOriginalGeneratorPairReplyBitwiseMaskFusions:0,
   sourceOriginalGeneratorLivenessMasksComputed:0,
   sourceRawPerReplyGeneratorFamilyArraysConstructed:0,
   sourceFutureGameQStatesConstructed:0,
   sourceFutureGameWDLValuesComputed:0,
   sourceAlternateOpponentStrategyTreesExplored:0,
   sourceOneRootReplyMaskPerOrderedActionMap:true,
   sourceNonterminalReplyMaskCoverageFailures:0,
   sourcePositiveWeakWdlActionEdges:0,
   sourceFullColumnPermutationWitnessSearchNodes:0,
   sourceStaticProofBudgetIncomplete:false};
  const firstWin=new Map(legal.map(c=>{
   const x=bit(id(c-1,h[c-1]));
   return [c,(p===0?q.R0:q.R1).some(G=>G===x)];
  }));
  const piMaps=(a,b)=>{
   const maps=[];
   if(h[a-1]===h[b-1]){
    const pi=Array.from({length:W},(_,i)=>i);
    pi[a-1]=b-1;pi[b-1]=a-1;
    maps.push({kind:'SINGLE_FIXED_ROOT_TRANSPOSITION',pi});
   }
   const mirror=Array.from({length:W},(_,i)=>W-1-i);
   if(mirror[a-1]===b-1&&h.every((z,i)=>z===h[mirror[i]])&&
      !maps.some(m=>m.pi.every((x,i)=>x===mirror[i])))
    maps.push({kind:'SINGLE_FIXED_ROOT_REFLECTION',pi:mirror});
   return maps;
  };
  function mapMask(mask,pi){
   let m=0n;
   for(let z=0;z<N;z++)if((mask&cellBits[z])!==0n)
    m|=bit(id(pi[z%W],Math.floor(z/W)));
   return m;
  }
  class Budget extends Error {}
  function charge(){stats.sourceOriginalGeneratorPairReplyScalarPredicateChecks++;
   if(stats.sourceOriginalGeneratorPairReplyScalarPredicateChecks>maxStaticGeneratorPairReplyTests)
    throw new Budget('SOURCE_STATIC_ORIGINAL_GENERATOR_REPLY_MASK_PROOF_BUDGET');}
  const edges=[];
  function attempt(a,b,{kind,pi}){
   if(pi[a-1]!==b-1||!h.every((x,j)=>x===h[pi[j]]))
    throw Error('fixed original map violates root gravity support');
   const xa=bit(id(a-1,h[a-1])),xb=bit(id(b-1,h[b-1]));
   const replyA=[],replyB=[],labels=[],heightA=h.slice(),heightB=h.slice();
   heightA[a-1]++;heightB[b-1]++;
   let nontermMask=0,terminalSafeMask=0;
   for(let r=0;r<W;r++){
    if(heightA[r]===H)continue;
    const s=pi[r];
    if(heightB[s]===H)throw Error('permutation failed original reply alphabet transport');
    const ya=bit(id(r,heightA[r])),yb=bit(id(s,heightB[s]));
    if(mapMask(ya,pi)!==yb)throw Error('permutation failed second-turn landing transport');
    const mark=1<<r;
    labels.push(r);replyA[r]=ya;replyB[r]=yb;
    stats.sourcePairedRootReplyLabelsMasked++;
    const Ro=o===0?q.R0:q.R1;
    const terminalA=Ro.some(G=>G===ya),
      terminalB=Ro.some(G=>G===yb);
    if(terminalA||terminalB){
     if(terminalA&&terminalB||terminalA&&o===1||terminalB&&o===0){
      terminalSafeMask|=mark;
      stats.sourceSafeDirectOpponentTerminalReplyBits++;
      continue;
     }
     return null; // safe P0 relative interval order NOT established
    }
    nontermMask|=mark;
   }
   const live=(G,owner,isLeft)=>{
    const first=isLeft?xa:xb;
    if(owner!==p){return (G&first)===0n?nontermMask:0;}
    let mask=0;
    for(const r of labels){
     const flag=1<<r;
     if((nontermMask&flag)===0)continue;
     const yr=isLeft?replyA[r]:replyB[r];
     if((G&yr)===0n)mask|=flag;
    }
    return mask;
   };
   function residual(G,owner,isLeft,r){
    return owner===p ? G&~(isLeft?xa:xb) :
      G&~(isLeft?replyA[r]:replyB[r]);
   }
   function coverFor(owner,leftG,rightH,leftToRight){
    const liveBoth=live(leftG,owner,true)&live(rightH,owner,false);
    let found=0;
    for(const r of labels){
     const flag=1<<r;
     if((liveBoth&flag)===0)continue;
     charge();
     const aG=residual(leftG,owner,true,r),bH=residual(rightH,owner,false,r);
     const matched=leftToRight ? (bH&mapMask(aG,pi))===bH :
        (aG&mapMask(bH,pi))===aG;
     if(matched)found|=flag;
    }
    stats.sourceOriginalGeneratorPairReplyBitwiseMaskFusions++;
    return found;
   }
   // P0 forward upset U(F0_left) subset U(mapped back F0_right).
   for(const G of q.R0){
    const requirement=live(G,0,true);
    stats.sourceOriginalGeneratorLivenessMasksComputed++;
    if(requirement===0)continue;
    let covered=0;
    for(const H of q.R0){
     covered|=coverFor(0,G,H,true);
     if((covered&requirement)===requirement)break;
    }
    if((covered&requirement)!==requirement){
     stats.sourceNonterminalReplyMaskCoverageFailures++;
     return null;
    }
   }
   // P1 reverse upset U(F1_right) subset U(mapped F1_left).
   for(const H of q.R1){
    const requirement=live(H,1,false);
    stats.sourceOriginalGeneratorLivenessMasksComputed++;
    if(requirement===0)continue;
    let covered=0;
    for(const G of q.R1){
     covered|=coverFor(1,G,H,false);
     if((covered&requirement)===requirement)break;
    }
    if((covered&requirement)!==requirement){
     stats.sourceNonterminalReplyMaskCoverageFailures++;
     return null;
    }
   }
   return {originalFirstActionA:a,originalFirstActionB:b,
    sourceWeakP0RelativeActionValueOrder:'J_a <= J_b',
    deterministicRootMapKind:kind,
    fixedOriginalColumnMapOneBased:pi.map(x=>x+1),
    allPairedOpponentReplyMaskHex:'0x'+(nontermMask|terminalSafeMask).toString(16),
    sourceNonterminalReplyMaskHex:'0x'+nontermMask.toString(16),
    sourceSafeTerminalReplyMaskHex:'0x'+terminalSafeMask.toString(16),
    originalSourceRawPerReplyCofactorFamiliesMaterialized:0,
    sourceAlternativeGameWDLValuesQueried:0};
  }
  try{
   if(n+2<N)for(const a of legal)for(const b of legal){
    if(a===b)continue;
    stats.sourceDistinctRootOrderedActionPairsConsidered++;
    if(firstWin.get(a)||firstWin.get(b))continue;
    for(const map of piMaps(a,b)){
     stats.sourceFixedColumnMapsChecked++;
     const candidate=attempt(a,b,map);
     if(candidate){edges.push(candidate);stats.sourcePositiveWeakWdlActionEdges++;break;}
    }
   }
  }catch(e){
   if(!(e instanceof Budget))throw e;
   stats.sourceStaticProofBudgetIncomplete=true;
   return {status:'INCOMPLETE_SOURCE_MASK_BUDGET',
    sourceWeakOriginalFirstActionOrderEdges:edges,
    selectedOriginalLiteralBestColumn:null,rootScalarWDL:null,
    statistics:stats};
  }
  const index=new Map(legal.map((x,i)=>[x,i]));
  const reach=Array.from({length:legal.length},(_,i)=>Array.from({length:legal.length},(_,j)=>i===j));
  for(const e of edges)reach[index.get(e.originalFirstActionA)][index.get(e.originalFirstActionB)]=true;
  for(let k=0;k<legal.length;k++)for(let i=0;i<legal.length;i++)for(let j=0;j<legal.length;j++)
   if(reach[i][k]&&reach[k][j])reach[i][j]=true;
  const qualifying=legal.filter((z,j)=>legal.every((x,i)=>p===0?reach[i][j]:reach[j][i]));
  return {status:qualifying.length?
    'SOURCE_CERTIFIED_ONE_BEST_ORIGINAL_ACTION':'INCOMPLETE_NO_CURRENT_REPLY_MASK_WDL_EXTREMUM',
   algorithm:'BITSET_FUSED_FULL_OPPONENT_REPLY_STRATEGY_PREORDER',
   sourceWeakOriginalFirstActionOrderEdges:edges,
   selectedOriginalLiteralBestColumn:qualifying[0]??null,
   allCurrentSourceCertifiedExtremumCandidates:qualifying,
   mover:p,originalRootPly:n,originalRootHeights:h.slice(),
   sourceOriginalRootScalarWdl:null,
   sourceFullOptimalMoveSetNotProved:true,
   statistics:stats};
 }
 return Object.freeze({compute});
}
