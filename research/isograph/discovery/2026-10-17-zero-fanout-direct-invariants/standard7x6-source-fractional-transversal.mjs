// Source-only fractional hyperedge packing witness for original residual q.
// NO future game states, action-value evaluations, opponent policy trees or
// solved WDL tables. Integer weights numerator / positive denominator D.
// W,H,K are symbolic geometry inputs; primary verification W=7 H=6 K=4.
// Mathematical authority: 2026-10-17-standard7x6-bilateral-winline-
// transversal-packing-candidate.md. Standalone Node ESM source.
export function createSourceFractionalTransversal({width:W,height:H,connect:K}){
 if(![W,H,K].every(Number.isInteger)||W<1||H<1||K<2||K>Math.min(W,H)||W*H>42)
  throw Error('invalid source gravity geometry');
 const N=W*H;
 const cellIDs=g=>{
  const ids=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)
   if(g&(1n<<BigInt(r*W+c)))ids.push(r*W+c);
  return ids;
 };
 function prove(q,attacker,{denominators=[1,2,3,4,6,8,12]}={}){
  const n=q.h.reduce((a,b)=>a+b,0),T=N-n,o=1-attacker;
  if(attacker!==0&&attacker!==1)throw Error('bad player');
  if(T<=0)throw Error('nonterminal source q required');
  const oCapacity=Math.floor(T/2)+(T%2&&o===n%2?1:0);
  const R=q.R[attacker];
  const stats={attemptedStaticWeightVectors:0,witnessCellIncidenceChecks:0,
   strategicFutureGamesEvaluated:0,sourceGenerators:R.length};
  if(!R.length)return {status:'INCOMPLETE',reason:'NO_ATTACKER_WIN_REQUIREMENT',capacity:oCapacity,statistics:stats};
  const edges=R.map(g=>{
   if(typeof g!=='bigint'||g===0n)throw Error('nonterminal residual generator expected');
   const ids=cellIDs(g);
   for(const id of ids){const c=id%W,r=Math.floor(id/W);if(r<q.h[c])throw Error('source generator outside future support');}
   return ids;
  });
  const deg=Array(N).fill(0);for(const edge of edges)for(const id of edge)deg[id]++;
  const size=edges.map(z=>z.length),intersections=edges.map(e=>e.reduce((x,id)=>x+deg[id],0));
  const indices=Array.from({length:R.length},(_,i)=>i);
  const orders=[
   [...indices].sort((a,b)=>size[a]-size[b]||intersections[a]-intersections[b]||a-b),
   [...indices].sort((a,b)=>size[b]-size[a]||intersections[a]-intersections[b]||a-b),
   [...indices].sort((a,b)=>intersections[a]-intersections[b]||size[a]-size[b]||a-b),
   [...indices].sort((a,b)=>intersections[b]-intersections[a]||size[a]-size[b]||a-b),
   indices,
   [...indices].reverse()
  ];
  function verify(nums,D){
   const loads=Array(N).fill(0);
   let sum=0;
   for(let i=0;i<nums.length;i++){
    if(nums[i]<0||nums[i]>D||!Number.isInteger(nums[i]))throw Error('bad integer dual weight');
    sum+=nums[i];
    for(const x of edges[i]){stats.witnessCellIncidenceChecks++;loads[x]+=nums[i];}
   }
   if(loads.some(v=>v>D))throw Error('invalid dual cell capacity');
   return {sumNumerator:sum,maximumCellLoadNumerator:Math.max(...loads)};
  }
  let best=null;
  for(const D of denominators){
   if(!Number.isInteger(D)||D<1||D>1000)throw Error('bad static witness denominator');
   for(const quota of [1,Math.max(1,Math.floor(D/2)),D]){
    for(const ord of orders){
     stats.attemptedStaticWeightVectors++;
     const num=Array(R.length).fill(0),load=Array(N).fill(0);
     let changed=true;
     while(changed){
      changed=false;
      for(const i of ord){
       const remain=Math.min(...edges[i].map(x=>D-load[x]));
       const alloc=Math.min(quota,remain,D-num[i]);
       if(alloc<=0)continue;
       num[i]+=alloc;for(const id of edges[i])load[id]+=alloc;
       changed=true;
      }
     }
     const sum=num.reduce((a,b)=>a+b,0);
     if(!best||sum*best.denominator>best.sumNumerator*D)
      best={denominator:D,numerators:num,sumNumerator:sum,order:orders.indexOf(ord),quota};
     if(sum>oCapacity*D){
      const checked=verify(num,D);
      return {status:'CERTIFIED_ATTACKER_EVENTUAL_FIRST_WIN_IF_OPPONENT_CANNOT_WIN',
       attacker,opponent:o,remainingEvents:T,opponentTotalTurns:oCapacity,
       witness:{denominator:D,numerators:num.map(String),sumNumerator:sum,
        ...checked,guaranteedExcessNumerator:sum-oCapacity*D},
       statistics:stats};
     }
    }
   }
  }
  return {status:'INCOMPLETE',reason:'NO_FRACTIONAL_DUAL_GREEDY_WITNESS',
   capacity:oCapacity,bestKnownStaticWeights:{denominator:best.denominator,
    sumNumerator:best.sumNumerator},statistics:stats};
 }
 return {prove};
}
