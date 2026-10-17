// Source-only full-FUTURE WDL dominance/equality certificates for
// two-ply ownership-swapped actions (P1 b, P0 c) vs (P1 c, P0 b).
// No successor game positions, concrete future paths or solved WDL inputs.
export function createTwoPlyOwnerSwapSimulation({width:W,height:H,connect:K}) {
 if(![W,H,K].every(Number.isInteger)||W<2||H<1||K<2||W*H>42)
   throw Error('invalid finite gravity geometry');
 const N=W*H,bit=(c,r)=>1n<<BigInt(r*W+c);
 function compute(q,{maxOperations=300000,maxMs=15000}={}){
  const start=Date.now(),rank=q?.h?.reduce((a,b)=>a+b,0);
  if(!q||!Array.isArray(q.h)||q.h.length!==W||
     q.h.some(x=>!Number.isInteger(x)||x<0||x>H)||
     !Array.isArray(q.R0)||!Array.isArray(q.R1)||
     q.R0.some(x=>typeof x!=='bigint'||x<=0n)||
     q.R1.some(x=>typeof x!=='bigint'||x<=0n))
    throw Error('invalid normalized nonterminal source q');
  if(rank>=N||rank%2!==1)throw Error('P1 to move at nonterminal source required');
  const stats={originalSourceInputs:1,unorderedColumnPairsScanned:0,
   eligibleTwoPlyDiamonds:0,terminalGuardSkips:0,fullBoardDrawSkips:0,
   sourceResidualFilterTests:0,sourceAntichainNormalizeTests:0,
   sourceGeneratorContainmentTests:0,sourceUpSetInclusionTests:0,
   certifiedEqualFutureResidualStates:0,certifiedOneWayDominances:0,
   incomparablePairs:0,descendantGameStatesConstructed:0,
   futureGameTransitionsSearched:0,oracleQueries:0,operations:0,elapsedMs:0};
  function charge(kind){
   stats[kind]++;stats.operations++;
   if(stats.operations>maxOperations||Date.now()-start>maxMs)
     throw Error('TWO_PLY_SOURCE_SIMULATION_RESOURCE_LIMIT');
  }
  function normalize(items){
   const sorted=[...new Set(items.map(String))].map(BigInt).sort((a,b)=>{
    function count(x){let n=0;for(;x;x&=x-1n)n++;return n;}
    const ca=count(a),cb=count(b);return ca-cb||(a<b?-1:a>b?1:0);
   });
   const out=[];
   for(const m of sorted){
    let redundant=false;
    for(const e of out){charge('sourceAntichainNormalizeTests');
      if((m&e)===e){redundant=true;break;}
    }
    if(!redundant)out.push(m);
   }
   return out;
  }
  function pull(pool,ownCell,opponentCell){
   const xs=[];
   for(const r of pool){
    charge('sourceResidualFilterTests');
    if((r&opponentCell)!==0n)continue;
    xs.push(r&~ownCell);
   }
   return normalize(xs);
  }
  function upsetIncluded(A,B){
   // U(A) subset U(B) iff each minimal generator a has some b subset a.
   const witnesses=[];
   for(const a of A){
    let w=null;
    for(const b of B){
      charge('sourceGeneratorContainmentTests');
      if((a&b)===b){w=b;break;}
    }
    charge('sourceUpSetInclusionTests');
    if(w===null)return {subset:false,witnesses:[]};
    witnesses.push([a,w]);
   }
   return {subset:true,witnesses};
  }
  const pairs=[];
  for(let b=0;b<W;b++)for(let c=b+1;c<W;c++){
    if(q.h[b]>=H||q.h[c]>=H)continue;
    charge('unorderedColumnPairsScanned');
    const xb=bit(b,q.h[b]),xc=bit(c,q.h[c]);
    const bcR1= pull(q.R1,xb,xc),bcR0=pull(q.R0,xc,xb);
    const cbR1= pull(q.R1,xc,xb),cbR0=pull(q.R0,xb,xc);
    // A win on the first or second placement, or a draw on the
    // second, must NOT be passed off as a nonterminal q similarity.
    if(bcR0.includes(0n)||bcR1.includes(0n)||
       cbR0.includes(0n)||cbR1.includes(0n)){
      stats.terminalGuardSkips++;
      pairs.push({P1ThenP0:[b,c],swapped:[c,b],status:'TERMINAL_GUARD_EXCLUDED'});
      continue;
    }
    if(rank+2>=N){
      stats.fullBoardDrawSkips++;
      pairs.push({P1ThenP0:[b,c],swapped:[c,b],status:'FULL_BOARD_DRAW_GUARD_EXCLUDED'});
      continue;
    }
    stats.eligibleTwoPlyDiamonds++;
    const p0Forward=upsetIncluded(bcR0,cbR0),
      p1Backward=upsetIncluded(cbR1,bcR1);
    const p0Backward=upsetIncluded(cbR0,bcR0),
      p1Forward=upsetIncluded(bcR1,cbR1);
    const bcNoBetter=p0Forward.subset&&p1Backward.subset,
      cbNoBetter=p0Backward.subset&&p1Forward.subset;
    if(bcNoBetter&&cbNoBetter)stats.certifiedEqualFutureResidualStates++;
    else if(bcNoBetter||cbNoBetter)stats.certifiedOneWayDominances++;
    else stats.incomparablePairs++;
    const status=bcNoBetter&&cbNoBetter?'EXACT_FUTURE_WDL_EQUALITY':
      bcNoBetter?'BC_WEAKLY_LOWER_P0_WDL':
      cbNoBetter?'CB_WEAKLY_LOWER_P0_WDL':'INCOMPARABLE';
    pairs.push({P1ThenP0:[b,c],swapped:[c,b],status,
      bcNoBetter,cbNoBetter,
      sourceOnlyCertificate:{
        p0BCSubsetCB:p0Forward.subset,p1CBSubsetBC:p1Backward.subset,
        p0CBSubsetBC:p0Backward.subset,p1BCSubsetCB:p1Forward.subset,
        p0BCToCBWinners:p0Forward.witnesses.map(([a,z])=>[a.toString(16),z.toString(16)]),
        p1CBToBCWinners:p1Backward.witnesses.map(([a,z])=>[a.toString(16),z.toString(16)])
      }
    });
  }
  stats.elapsedMs=Date.now()-start;
  return {schema:'connect4.two-ply-source-owner-swap-simulation.v0_1',
    sourceRank:rank,originalSourceSupport:q.h.slice(),
    supportedScope:'two distinct legal columns, original P1 then P0, both nonterminal, same resulting support',
    pairs,statistics:stats,
    semantics:'By certified same-support residual-upset favorable order, each marked relation preserves EXACT unrestricted P0-relative WDL inequality/equality. Does not alone compare full root P1 action values.',
    branchEliminationScope:'conditioned two-ply continuations only; root action winner and full tie set NOT automatically determined'};
 }
 return Object.freeze({compute,width:W,height:H,connect:K});
}
