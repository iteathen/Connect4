/**
 * Verify original7x6 geometric field catalog (69/1035/625/2922/max13)
 * and local K4 tautologies without generating ANY complete board position.
 *
 * Exhausts only the 3^4 ownership assignments of a SINGLE original K4
 * and only 3^3 local-before-move patterns (one empty landing, three other
 * sites), not gameplay positions/histories, not terminal value labels.
 *
 * node verify-original7x6-nonenumerative-625-field-local-identities.js
 */
"use strict";
const W=7,H=6,K=4;
const dirs=[[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]];
const assert=(b,m)=>{if(!b)throw Error("C4_SYMBOLIC_FIELD "+m);};
const windows=[],through=Array.from({length:42},()=>[]);
for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const[dc,dr,t]of dirs){
 const cs=[];for(let i=0;i<K;i++){const x=c+dc*i,y=r+dr*i;if(x<0||x>=W||y<0||y>=H){cs.length=0;break;}cs.push(y*W+x);}
 if(cs.length===4){const index=windows.length;windows.push({dir:t,cells:cs});for(const site of cs)through[site].push(index);}
}
assert(windows.length===69,"Original 69 K4s");
const distribution=Object.fromEntries(dirs.map(x=>[x[2],windows.filter(z=>z.dir===x[2]).length]));
assert(JSON.stringify(distribution)===JSON.stringify({H:24,V:21,R:12,F:12}),"K4 inventory exact");
const bit=i=>1n<<BigInt(i),masks=new Map();
for(const [lineId,L]of windows.entries())for(let sub=1;sub<(1<<K);sub++){
 let m=0n;
 for(let j=0;j<K;j++)if(sub&(1<<j))m|=bit(L.cells[j]);
 const key=m.toString();if(!masks.has(key))masks.set(key,{m,size:0,source:[]});
 const o=masks.get(key);o.size=popcountBigInt(m);o.source.push({lineId,sub});
}
function popcountBigInt(m){let c=0;while(m){m&=(m-1n);c++;}return c;}
assert(masks.size===625,"625 distinct residual masks");
const bySize={};for(const x of masks.values())bySize[x.size]=(bySize[x.size]??0)+1;
assert(JSON.stringify(bySize)===JSON.stringify({"1":42,"2":282,"3":232,"4":69}),"mask distribution");
let occurrenceCount=0,properLinks=0,maxProper=0;
const all=[...masks.values()];
for(const x of all){
 occurrenceCount+=x.source.length;
 let n=0;for(const y of all)if(x.m!==y.m&&(x.m&y.m)===y.m)n++;
 properLinks+=n;maxProper=Math.max(maxProper,n);
}
assert(occurrenceCount===1035&&properLinks===2922&&maxProper===14,"subset static incidence");
const maxWindows=Math.max(...through.map(x=>x.length));
const maxima=through.flatMap((xs,i)=>xs.length===maxWindows?[{col:i%7+1,row:Math.floor(i/7)+1}]:[]);
assert(maxWindows===13&&maxima.length===2&&maxima[0].col===4,"13 incident K4 bound");
function requirements(s,p){
 const others=p===1?2:1;
 if(s.includes(others))return {type:"blocked"};
 const mask=s.reduce((m,v,i)=>m|(v===0?1<<i:0),0);
 return mask===0?{type:"complete"}:{type:"live",mask};
}
function E(s,p,mask) {
 for(let i=0;i<4;i++)if(s[i]!==((mask&(1<<i))?0:p))return 0;
 return 1;
}
let checkedK4OwnerCases=0,checkedSiteUpdateCases=0;
for(const L of windows)for(const p of [1,2]){
 for(let trit=0;trit<81;trit++){
  let n=trit;const site=[];
  for(let k=0;k<K;k++){site.push(n%3);n=Math.floor(n/3);}
  const active=requirements(site,p);
  const terms=Array.from({length:15},(_,k)=>E(site,p,k+1));
  const sum=terms.reduce((a,b)=>a+b,0);
  assert(sum===(active.type==="live"?1:0),"local line exact residual partition");
  if(active.type==="live")assert(terms[active.mask-1]===1,"unique actual residual flag");
  checkedK4OwnerCases++;
 }
 for(let localLanding=0;localLanding<4;localLanding++){
  for(let input=0;input<27;input++){
   let n=input;const site=Array(4).fill(0);
   for(let i=0;i<4;i++)if(i!==localLanding){site[i]=n%3;n=Math.floor(n/3);}
   const beforeP=requirements(site,p),beforeOpp=requirements(site,3-p);
   const afterSite=site.slice();afterSite[localLanding]=p;
   const afterP=requirements(afterSite,p),afterOpp=requirements(afterSite,3-p);
   if(beforeP.type==="live"){
    assert((beforeP.mask&(1<<localLanding))!==0,"landing included in own missing cells");
    const rest=beforeP.mask&~(1<<localLanding);
    if(rest===0)assert(afterP.type==="complete","own singleton -> firstwinning");
    else assert(afterP.type==="live"&&afterP.mask===rest,"own residual removes landing");
   }else assert(afterP.type==="blocked","own blocked original stays blocked");
   if(beforeOpp.type==="live")assert(afterOpp.type==="blocked","opponent line blocked by placement");
   else assert(afterOpp.type==="blocked","already blocked line stays blocked");
   checkedSiteUpdateCases++;
  }
 }
}
assert(checkedK4OwnerCases===69*2*81,"local 4-cell truth table cases");
assert(checkedSiteUpdateCases===69*2*4*27,"local 3-cell before/after cases");
const result={
 schema:"c4.original7x6_obligation_boolean_field_local.v1",
 status:"STATIC_625_MASK_FIELD_AND_ALL_LOCAL_K4_ACTION_TAUTOLOGIES_PASS",
 originalDimensions:"7x6 K4",K4:distribution,
 uniqueResidualMasks:masks.size,
 residualMaskSizes:bySize,
 labelledWindowSubsetOccurrences:occurrenceCount,
 strictSubsetLinks:properLinks,
 maxProperNonemptySubmasks:maxProper,
 maxOriginalK4WindowsThroughOneSite:maxWindows,
 maxSites:maxima,
 checkedSingleK4TernaryOwnerCases:checkedK4OwnerCases,
 checkedSingleK4MoveOwnerCases:checkedSiteUpdateCases,
 wholeBoardPositionsEnumerated:0,
 proofStatus:"finite local identities and exact static geometry only",
 rootWinningPotentialConstructed:false,
 oracleOrSolvedDataUsed:false
};
console.log(JSON.stringify(result,null,2));