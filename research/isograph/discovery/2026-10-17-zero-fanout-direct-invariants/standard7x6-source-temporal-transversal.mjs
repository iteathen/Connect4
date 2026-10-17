// Source q only: first-win-guarded temporal dual capacity from original
// residual generator geometry. Evaluates NO future game state/value/strategy.
// Source theorem frozen in docs/research/2026-10-17-standard7x6-temporal-
// transversal-first-win-candidate.md, before independent reference.
// W,H,K remain explicitly parameterized. Primary game W=7,H=6,K=4.
export function createSourceTemporalTransversal({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||K>Math.min(W,H)||W*H>42)
  throw Error('invalid geometry');
 const N=W*H;
 const bitsToCells=g=>{
  const xs=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)if((g&(1n<<BigInt(r*W+c)))!==0n)xs.push({c,r});
  return xs;
 };
 function compute(q,p){
  if(p!==0&&p!==1)throw Error('invalid player');
  const n=q.h.reduce((a,b)=>a+b,0),T=N-n,s=n%2,o=1-p;
  if(T<=0)throw Error('nonterminal source needed');
  const turnSlots=(player,L)=>Math.floor(L/2)+((L%2&&player===s)?1:0);
  const stats={staticThresholdsChecked:0,staticLinePackingAttempts:0,
   staticGeneratorsScanned:0,strategicFutureGamesEvaluated:0};
  function requiredCells(g){
   if(typeof g!=='bigint'||g===0n)throw Error('nonempty BigInt residual requirement needed');
   const cells=bitsToCells(g);
   for(const x of cells)if(x.r<q.h[x.c])throw Error('generator below current gravity frontier');
   return cells;
  }
  const oppEarliest=q.R[o].reduce((best,g)=>{
   const cells=requiredCells(g),max=Array(W).fill(-1);
   for(const {c,r} of cells)max[c]=Math.max(max[c],r);
   let compulsory=0;
   for(let c=0;c<W;c++)if(max[c]>=0)compulsory+=max[c]-q.h[c]+1;
   const minimumOwnerTurn=2*cells.length-(o===s?1:0);
   stats.staticGeneratorsScanned++;
   return Math.min(best,Math.max(compulsory,minimumOwnerTurn));
  },Infinity);
  const pRequirements=q.R[p].map(g=>{
   const cells=requiredCells(g),maxRow=Math.max(...cells.map(x=>x.r));
   return {g,cells,deadline:(W-1)*H-n+maxRow+1};
  });
  const deadlines=[...new Set(pRequirements.map(x=>x.deadline))]
     .filter(x=>x>=1&&x<=T&&x<oppEarliest).sort((a,b)=>a-b);
  for(const L of deadlines){
   stats.staticThresholdsChecked++;
   const allowed=pRequirements.filter(x=>x.deadline<=L);
   const capacity=turnSlots(o,L);
   if(allowed.length<=capacity)continue;
   const overlaps=allowed.map(a=>allowed.reduce((v,b)=>v+(a!==b&&(a.g&b.g)!==0n?1:0),0));
   const idx=Array.from({length:allowed.length},(_,i)=>i);
   const orders=[
     [...idx].sort((a,b)=>allowed[a].cells.length-allowed[b].cells.length||overlaps[a]-overlaps[b]||a-b),
     [...idx].sort((a,b)=>overlaps[a]-overlaps[b]||allowed[a].cells.length-allowed[b].cells.length||a-b),
     [...idx].sort((a,b)=>overlaps[b]-overlaps[a]||allowed[a].cells.length-allowed[b].cells.length||a-b),
     idx,
     [...idx].reverse()
   ];
   for(const ord of orders){
    stats.staticLinePackingAttempts++;
    let occupied=0n;const picked=[];
    for(const i of ord){
     if((occupied&allowed[i].g)!==0n)continue;
     occupied|=allowed[i].g;picked.push(i);
    }
    if(picked.length>capacity){
     const masks=picked.map(i=>allowed[i].g);
     let checked=0n;
     for(const g of masks){
      if((checked&g)!==0n)throw Error('source dual witness invalid');
      checked|=g;
     }
     return {status:'EXACT_P_FIRST_WIN_BY_SOURCE_TEMPORAL_PACKING',
      winner:p,opponent:o,remainingEvents:T,sourceOpponentWinEarliestLowerRank:oppEarliest,
      certificate:{forcedTerminalByRank:L,opponentSlotsBeforeRank:capacity,
        disjointOriginalResidualGenerators:masks.map(String),dualDenominator:1,
        dualWeightSum:picked.length,opponentHasSurvivingGenerators:q.R[o].length>0},
      statistics:stats};
    }
   }
  }
  return {status:'INCOMPLETE',reason:'NO_TIMED_PACKING_WITH_EARLIER_OPPONENT_WIN_EXCLUSION',
   winner:null,sourceOpponentWinEarliestLowerRank:oppEarliest,statistics:stats};
 }
 return {compute};
}
