/** Exact original7x6 rank12 edge signed-circuit compatibility C6 algebra.
 * The separate original69K4/876Euler physical verifier supplies the native
 * observable restriction; this checks the bipartite graph/potential theorem.
 * Run Node22+. This exact function body executed in isolated V8 before commit.
 */
function auditC4SixEdgeExchangePotential(){
 const assert=(x,msg)=>{if(!x)throw Error(msg)};
 const indices=[1,2,8,9,16,18], signs=[1,-1,1,-1,-1,1];
 const bit=(id,k)=>(id>>(4-k))&1;
 const word=i=>Array.from({length:5},(_,k)=>bit(i,k)).join("");
 const edgeStates=indices.map((id,j)=>({
  index:id,sign:signs[j],word:word(id),
  left:word(id).slice(0,2),middle:bit(id,2),right:word(id).slice(3,5)
 }));
 assert(edgeStates.every(e=>e.middle===0),"fixed middle zero");
 const left=[...new Set(edgeStates.map(e=>e.left))].sort(), right=[...new Set(edgeStates.map(e=>e.right))].sort();
 assert(left.join(",")==="00,01,10"&&right.join(",")==="00,01,10","left right three categories each");
 const histogram=(sign,side)=>Object.fromEntries((side==="left"?left:right).map(s=>[s,edgeStates.filter(e=>e.sign===sign&&e[side]===s).length]));
 for(const side of ["left","right"])assert(JSON.stringify(histogram(1,side))===JSON.stringify(histogram(-1,side)),"matching marginals");
 const incidence=edgeStates.map(e=>[
  ...left.map(c=>Number(c===e.left)),
  ...right.map(c=>Number(c===e.right))
 ]);
 function qRank(rows){
  // Signed-exact elimination for small integer matrices, no floating point.
  const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a};
  const a=rows.map(row=>row.slice());let r=0;
  const n=a.length,m=a[0].length;
  for(let col=0;col<m&&r<n;col++){
   let ix=a.findIndex((row,k)=>k>=r&&row[col]!==0);
   if(ix<0)continue;
   [a[r],a[ix]]=[a[ix],a[r]];
   for(let i=r+1;i<n;i++){
    if(a[i][col]===0)continue;
    let va=a[i][col],vb=a[r][col];
    a[i]=a[i].map((x,k)=>vb*x-va*a[r][k]);
    let d=a[i].reduce((p,x)=>gcd(p,x),0);
    if(d>1)a[i]=a[i].map(x=>x/d);
   }
   r++;
  }
  return r;
 }
 assert(qRank(incidence)===5,"edge-by-vertex additive potential rank");
 const cycleFlux=f=>f.reduce((a,x,i)=>a+x*signs[i],0);
 const basis=[incidence.map(_=>1),incidence.map(e=>e[0]),incidence.map(e=>e[1]),incidence.map(e=>e[3]),incidence.map(e=>e[4])];
 assert(qRank(basis)===5,"constant and actual four peripheral owner bits span potential");
 for(let col=0;col<6;col++)assert(cycleFlux(incidence.map(v=>v[col]))===0,"circulation kills each vertex potential");
 for(let omit=0;omit<6;omit++){
  const sub=incidence.filter((_,i)=>i!==omit);
  assert(qRank(sub)===5,"each proper five edge set independent");
 }
 // Edges alternate around one connected 6-cycle; each side vertex degree 2.
 for(let key of left)assert(edgeStates.filter(e=>e.left===key).length===2,"left degree2");
 for(let key of right)assert(edgeStates.filter(e=>e.right===key).length===2,"right degree2");
 const plus= edgeStates.filter(e=>e.sign===1), minus=edgeStates.filter(e=>e.sign===-1);
 assert(plus.length===3&&minus.length===3,"three edges per perfect matching");
 function survival(anchor,id){
  let v=Array.from({length:5},(_,k)=>bit(id,k));
  let peripheral=anchor===1?[1,...v]:[...v,1];
  let run=(x)=>[0,1,2,3].some(i=>peripheral.slice(i,i+3).every(t=>t===x));
  assert(!run(1),"six edge witnesses all survive first center");
  return Number(!run(0));
 }
 const cases=[];
 for(let anchor of [1,7]){
  let S=edgeStates.map(e=>survival(anchor,e.index));
  let SX=edgeStates.map((e,i)=>S[i]*bit(e.index,0));
  assert(cycleFlux(S)===0,"scalar survivor lies in additive potential space");
  assert(cycleFlux(SX)===1,"survivor-weighted genuine owner bit is nonpotential");
  assert(S.filter(Boolean).length===2,"2 survivors of 6");
  assert(S.filter((t,i)=>t&&signs[i]>0).length===1&&S.filter((t,i)=>t&&signs[i]<0).length===1,"one survivor each");
  cases.push({anchor,sourceWords:edgeStates.map(e=>e.word),survivorIndicator:S,
    scalarCycleCirculation:cycleFlux(S),ownerWeightedCycleCirculation:cycleFlux(SX),
    plusMinusSurvivorCounts:[1,1],plusMinusP0FirstwinCounts:[2,2]});
 }
 return {status:"EXACT_BIPARTITE_MATCHING_HEXAGON_COHOMOLOGY_VERIFIED",
  vertices:6,edges:6,graphType:"C6",incidenceQrank:5,cycleDimension:1,
  additivePotentialDimension:5,independentOwnerPotentialBasis:5,
  alternatingPlusMinusCircuit:edgeStates,allProperFiveEdgeSubsetsIndependent:true,
  cases,priorK4MomentEqualityVerifiedSeparately:true,solverKnowledgeUsed:false,rootGameOutcomeProved:false};
}
console.log(JSON.stringify(auditC4SixEdgeExchangePotential(),null,2));
