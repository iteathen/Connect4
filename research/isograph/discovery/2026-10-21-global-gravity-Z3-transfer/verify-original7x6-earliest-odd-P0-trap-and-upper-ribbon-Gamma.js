"use strict";
/**
 * Exact source geometry rank lower bound for first P0 odd-capacity trap
 * on a P1 turn in ORIGINAL 7x6 Connect4, and two named legal rank9
 * physical prefixes with complete P1 WSL / response-matroid rank gap.
 * No future WDL, complete game-space enumeration or solved data.
 */
const check=(v,msg)=>{if(!v)throw Error("C4_ODD_TRAP "+msg);};
const W=7,H=6,dirs=[[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]];
const windows=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dx,dy,name]of dirs){
 const s=[];
 for(let k=0;k<4;k++){const x=c+k*dx,y=r+k*dy;
  if(x<0||x>=W||y<0||y>=H){s.length=0;break;}s.push([x,y]);
 }
 if(s.length===4)windows.push({name,s});
}
check(windows.length===69,"original69 fourway");
const dirCount=Object.fromEntries(["H","V","R","F"].map(x=>[x,windows.filter(w=>w.name===x).length]));
check(JSON.stringify(dirCount)===JSON.stringify({H:24,V:21,R:12,F:12}),"H/V/R/F exact");
const geom=[];
for(const L of windows)for(const [col,row]of L.s){
 const below=row-1;
 if(below<0||(H-below)<2||((H-below)&1)!==1)continue;
 // A trap has target y=row (0-index) one row above empty
 // frontier x=row-1, requiring height=row-1 in target column.
 if(L.name==="V")continue; // X empty or y still empty violates V gravity
 let sum=below;
 for(const [c,r]of L.s)if(!(c===col&&r===row)){
  check(c!==col,"non-V K4 must use distinct source columns");
  sum+=r+1;
 }
 if(L.name==="H")check(sum===4*row+2,"horizontal support formula");
 else check(sum===4*Math.min(...L.s.map(x=>x[1]))+8,"diagonal support formula");
 geom.push({kind:L.name,target:[col+1,row+1],minimumOccupied:sum});
}
const lower=Math.min(...geom.map(x=>x.minimumOccupied));
check(lower===8,"odd capacity trap requires >=8 occupied");
const minP1TurnRank=lower%2?lower:lower+1;
check(minP1TurnRank===9,"rank9 earliest possible on odd P1 turn");
const bit=(c,r)=>1n<<BigInt(r*W+c);
const board=()=>({h:Array(7).fill(0),o:Array.from({length:7},()=>Array(6).fill(-1))});
function wins(q,p){return windows.some(L=>L.s.every(([c,r])=>q.o[c][r]===p));}
function ray(q,c,r,p){
 for(const [dx,dy]of dirs){let n=1;
  for(const sg of [-1,1])for(let k=1;k<4;k++){
   const x=c+sg*k*dx,y=r+sg*k*dy;
   if(x<0||x>=W||y<0||y>=H||q.o[x][y]!==p)break;n++;
  }
  if(n>=4)return true;
 }
 return false;
}
function move(q,column,p){
 const c=column-1,r=q.h[c];check(r<H,"legal gravity landing");
 q.h[c]++;q.o[c][r]=p;
 const won=wins(q,p);
 check(won===ray(q,c,r,p),"literal69/independent ray agreement");
 return {column,row:r+1,owner:p,won};
}
function residual(q,p){
 const raw=[];
 for(const L of windows){
  if(L.s.some(([c,r])=>q.o[c][r]===1-p))continue;
  let m=0n;
  for(const [c,r]of L.s)if(q.o[c][r]===-1)m|=bit(c,r);
  if(m)raw.push({m,L});
 }
 const unique=[...new Map(raw.map(x=>[String(x.m),x])).values()];
 const min=unique.filter(x=>!unique.some(y=>x.m!==y.m&&(x.m&y.m)===y.m));
 return {raw,unique,min};
}
const pop=m=>{let n=0;while(m){m&=m-1n;n++;}return n;};
const physical=m=>{
 const cells=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)if(m&bit(c,r))cells.push([c+1,r+1]);
 return cells;
};
const sources=[];
for(const word of ["143224454","122454434"]){
 const q=board();
 for(let i=0;i<word.length;i++)check(!move(q,Number(word[i]),i&1).won,"rank9 source prefix must be firstwinfree");
 check(q.h.join(",")==="1,2,1,4,1,0,0","actual rank9 support");
 const P0=residual(q,0),P1=residual(q,1),C=[];
 for(let c=0;c<W;c++){
  if(H-q.h[c]<2)continue;
  const y=bit(c,q.h[c]+1);
  if(P0.min.some(x=>x.m===y))C.push(c);
 }
 check(C.join(",")==="2","maximal genuine trap C only column3");
 const B=Array.from({length:W},(_,i)=>i).filter(c=>!C.includes(c)&&((H-q.h[c])&1));
 check(B.join(",")==="0,4","P1 D nontrap odd bases c1,c5");
 const nontrap=Array.from({length:W},(_,i)=>i).filter(c=>!C.includes(c));
 const E=[];
 for(const c of nontrap)for(let r=q.h[c]+((H-q.h[c])&1);r<H;r+=2)E.push(bit(c,r));
 const Q=B.map(c=>bit(c,q.h[c])),X=C.map(c=>bit(c,q.h[c]));
 function rank(m){
  let n=0;
  for(const e of E)if(m&e)n++;
  if(Q.some(e=>Boolean(m&e)))n++;
  if(X.some(e=>Boolean(m&e)))n++;
  return n;
 }
 const deficits=P1.min.map(x=>({...x,gap:pop(x.m)-rank(x.m)}));
 const gamma=Math.min(...deficits.map(x=>x.gap));
 const histogram={};for(const x of deficits)histogram[x.gap]=(histogram[x.gap]||0)+1;
 const independent=deficits.filter(x=>x.gap===0).map(x=>({
  type:x.L.name,remaining:physical(x.m),
  physicalK4:x.L.s.map(([c,r])=>[c+1,r+1]),gap:0
 }));
 check(gamma===0,"candidate odd trap still leaves P1 original win requirement matroid-independent");
 const row5=[4,5,6,7].map(c=>bit(c-1,4)).reduce((a,b)=>a|b,0n);
 check(independent.some(x=>x.remaining.length===4&&x.remaining.map(y=>y.join(",")).sort().join("|")==="4,5|5,5|6,5|7,5"),"original row5 c4-7 independent wave");
 check(P1.min.some(x=>x.m===row5),"exact surviving P1 row5 source mask present in minimal WSL");
 const a={h:q.h.slice(),o:q.o.map(c=>c.slice())};
 const P1entry=move(a,3,1);check(!P1entry.won,"P1 cannot firstwin before P0 trap reply");
 const P0reply=move(a,3,0);check(P0reply.won,"genuine original P0 diagonal K4 firstwinner via row3");
 sources.push({word,sourceRank:9,heights:q.h,sourceFirstwinnerFree:true,
  P0OddRemainingTrapColumns:C.map(c=>c+1),oddNontrapBases:B.map(c=>c+1),
  P1WinningLineResiduals:P1.raw.length,P1NormalizedWSLRequirements:P1.min.length,
  tropicalGamma:gamma,deficitHistogram:histogram,independentOriginalK4Residuals:independent,
  genuineP1EntryAndP0AboveTrapFirstwin:true});
}
check(sources[0].P1WinningLineResiduals===36&&sources[0].P1NormalizedWSLRequirements===34,"first source P1 residual counts");
check(sources[1].P1WinningLineResiduals===35&&sources[1].P1NormalizedWSLRequirements===33,"second source P1 residual counts");
check(sources[0].independentOriginalK4Residuals.length===2&&sources[1].independentOriginalK4Residuals.length===1,"rank9 surviving independent WSL modes");
const report={schema:"c4.original7x6_odd_capacity_P0_trap_earliest_source.v1",
 status:"EXACT_RANK9_EARLIEST_P0_ODD_TRAP_AND_UPPER_HORIZONTAL_RIBBON_GAMMA_ZERO",
 geometry:dirCount,necessaryRoleParity:"P1-turn rank odd implies odd number of odd-capacity columns; an even nontrap odd-base Q pairing demands at least one odd-capacity trap",
 lowerBound:{minimumMandatoryOccupiedCells:lower,minimumRankWithP1Next:minP1TurnRank,sourcePhysicalWindowTargetChecks:geom.length,
  Hminimum:Math.min(...geom.filter(x=>x.kind==="H").map(x=>x.minimumOccupied)),
  diagonalMinimum:Math.min(...geom.filter(x=>x.kind!=="H").map(x=>x.minimumOccupied))},
 originalRank9LiveSources:sources,
 verdict:"P0 trap formation at earliest feasible rank DOES NOT suffice: normalized P1 WSL still contains a matroid-independent physical upper horizontal row5 K4. Return INCOMPLETE, not opponent WDL.",
 fullGameStateEnumeration:false,childStrategicWDLValues:false,solvedOutcomeInput:false,maintainedCI:"NOT_RUN"};
console.log(JSON.stringify(report,null,2));