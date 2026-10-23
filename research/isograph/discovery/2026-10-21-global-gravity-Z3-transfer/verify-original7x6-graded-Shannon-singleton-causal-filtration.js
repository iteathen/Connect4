"use strict";
/**
 * Exact general monotone WSL residual filtration on any source domain:
 * after A source-actual claimed physical sites F and D blocked sites E,
 * every new remaining singleton y comes from SOME original A source
 * minimal residual G with y in G, G\y subset F and G disjoint E.
 * Therefore source grade(G) <= |F|+1, up to original K4 max4.
 *
 * Independently checks 168 abstract 4-site antichains x 3^4 owner-
 * assignment colors, all remaining y; no sub-five Connect4 board,
 * future game tree, solved labels or special winning policy.
 * Reconstructs original W7H6 source rank7 grade count independently.
 */
const assert=(x,s)=>{if(!x)throw Error("C4_GRADED_SHANNON "+s);};
const count=n=>{let k=0;while(n){n&=n-1;k++;}return k;};
const sub=(a,b)=>(a&b)===a;
function min(A){
 const U=[...new Set(A)];
 return U.filter(x=>!U.some(y=>y!==x&&sub(y,x)));
}
const posets=[];
for(let coeffs=0;coeffs<(1<<16);coeffs++){
 const family=[];for(let s=0;s<16;s++)if(coeffs&(1<<s))family.push(s);
 if(family.every((x,i)=>family.every((y,j)=>i===j||(!sub(x,y)&&!sub(y,x)))))posets.push(family);
}
assert(posets.length===168,"four-abstract-site antichain count");
let totalColorings=0,liveColorings=0,firstwinExcluded=0,verifiedFreeY=0;
const positiveSingletonSourceMaxGrade={};
const futureSingletonByNumA={};
for(const A of posets){
 for(let tri=0;tri<81;tri++){
  let encoding=tri,E=0,F=0;
  for(let k=0;k<4;k++){
   const color=encoding%3;encoding=Math.floor(encoding/3);
   if(color===1)F|=1<<k;
   if(color===2)E|=1<<k;
  }
  assert((E&F)===0,"site owner masks disjoint");
  totalColorings++;
  const surviving=A.filter(G=>(G&E)===0);
  const after=min(surviving.map(G=>G&~F));
  if(after.includes(0)){firstwinExcluded++;continue;}
  liveColorings++;
  for(let y=0;y<4;y++){
   const yBit=1<<y;
   if((E|F)&yBit)continue;
   const direct=Number(after.includes(yBit));
   const sources=surviving.filter(G=>(G&yBit)&&sub(G&~yBit,F));
   const symbolic=Number(sources.length>0);
   assert(direct===symbolic,"source lattice coefficient y iff unblocked source G shrinks to {y}");
   for(const G of sources)assert(count(G)<=count(F)+1,"graded causal source upper bound");
   if(direct) {
    const minGrade=Math.min(...sources.map(count));
    const numA=count(F);
    futureSingletonByNumA[numA]=(futureSingletonByNumA[numA]||0)+1;
    const key=String(numA);
    positiveSingletonSourceMaxGrade[key]=Math.max(positiveSingletonSourceMaxGrade[key]||0,Math.max(...sources.map(count)));
    assert(minGrade<=numA+1,"source singleton grade bound tight");
   }
   verifiedFreeY++;
  }
 }
}
assert(totalColorings===168*81&&liveColorings+firstwinExcluded===totalColorings,
  "abstract 3-color cofactor cases exact");

const W=7,H=6,steps=[[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]],catalogue=[];
for(let x=0;x<W;x++)for(let y=0;y<H;y++)for(const [dx,dy,tag]of steps){
 let a=[];for(let i=0;i<4;i++){
  let c=x+i*dx,r=y+i*dy;
  if(c<0||c>=W||r<0||r>=H){a=[];break;}a.push([c,r]);
 }if(a.length===4)catalogue.push({tag,a});
}
assert(catalogue.length===69,"true original7x6 69 lines");
const inv=Object.fromEntries(["H","V","R","F"].map(t=>[t,catalogue.filter(x=>x.tag===t).length]));
assert(JSON.stringify(inv)===JSON.stringify({H:24,V:21,R:12,F:12}),"true original directions");
const q=Array.from({length:W},()=>Array(H).fill(-1)),heights=Array(W).fill(0),history="4214254";
for(let i=0;i<history.length;i++){
 const c=+history[i]-1,r=heights[c]++;
 assert(r<H,"real source gravity legal");
 q[c][r]=i&1;
 assert(!catalogue.some(l=>l.a.every(([a,b])=>q[a][b]===(i&1))),"real q7 firstwinnerfree");
}
assert(heights.join(",")==="1,2,0,3,1,0,0","rank7 real source support");
const bit=(c,r)=>1n<<BigInt(r*W+c);
const source=[];
for(const L of catalogue){
 if(L.a.some(([c,r])=>q[c][r]===1))continue;
 let mask=0n;
 for(const [c,r]of L.a)if(q[c][r]===-1)mask|=bit(c,r);
 if(mask)source.push(mask);
}
const uniq=[...new Set(source.map(String))].map(BigInt);
const sorted=uniq.filter(m=>!uniq.some(n=>m!==n&&(m&n)===n));
const popBig=v=>{let n=0;while(v){v&=v-1n;n++;}return n;};
const sizes={};for(const m of sorted)sizes[popBig(m)]=(sizes[popBig(m)]||0)+1;
assert(JSON.stringify(sizes)===JSON.stringify({"2":1,"3":14,"4":33})&&sorted.length===48,
 "actual rank7 P0 WSL grades2/3/4 exact");
const report={
 schema:"c4.original7x6_monotone_WSL_graded_causal_filtration.v1",
 status:"EXACT_WSL_CAUSAL_SOURCE_GRADE_M_PLUS_ONE_UNIFORM_SINGLETON_FILTRATION",
 mathematicalIdentity:"For live q and any ACTUAL still-live opponent site set E and respondent site set F, the postcofactor A-minimum singleton {y} (unoccupied y) exists iff some original source minimal WSL G includes y, is disjoint E, and G minus y is a subset of F. Therefore degree(G)<=|F|+1. This is an exact Boolean/Shannon source identity, not a sufficient perfect-play win condition.",
 independentAbstractProofControls:{
  fourAbstractSiteAntichains:posets.length,
  assignmentsOfAbstractFourSitesToFutureA_D_orFree:totalColorings,
  liveNonterminalAbstractCofactors:liveColorings,
  abstractAFirstwinTerminationExcluded:firstwinExcluded,
  exactIndividualFreeYSummaryChecks:verifiedFreeY,
  observedMaxSourceGradeWithMCurrentAOwnClaims:positiveSingletonSourceMaxGrade,
  positiveSingletonsByNumberOfAClaimedAbstractSites:futureSingletonByNumA
 },
 original7x6Source:{
  originalK4:inv,legalFirstwinnerfreeWord:history,rank:7,
  support:heights,normalizedP0MinimalMasks:sorted.length,
  P0SourceGradeHistogram:sizes,
  causeOfNoOneOwnMoveFork:"only one grade2 source mask, no grade1; one A claim can produce at most one new singleton, and opponent cannot create one by claiming a site",
  followupGrade3SourceCountForTwoAMoves:14,
  followupGrade4SourceCountForThreeAMoves:33,
  futureAOwnerSetMustBeLegallyCausallyRealizable:true
 },
 priorQualifiedQSourceShannonSemanticsRetained:true,
 anyRootWLDProved:false,wholeGameStateSpaceEnumerated:false,
 solvedWLDInputsUsed:false,maintainedCI:"NOT_RUN",externalProver:"NOT_RUN"
};
console.log(JSON.stringify(report,null,2));