// Source-only original Connect-K geometry/response-filtration control.
// Owner: research/semantic-quotient. Historical WDL labels are NOT imported.
// Call: node research/isograph/discovery/2026-10-20-narrow-phase-transitions/source-k4-width-height-incidence-response-filtration.mjs
// K>=2, original nonwrapped finite 4-orientation windows; gravity applies vertically.
const assert = (ok,message)=>{if(!ok)throw Error(message);};
export const WINS=(W,H,K)=>{
 const out=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)
   for(const [dx,dy,orientation] of [[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]]){
    const cells=Array.from({length:K},(_,i)=>[c+i*dx,r+i*dy]);
    if(cells.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
      out.push({orientation,cells,sites:cells.map(([x,y])=>x*H+y)});
   }
 return out;
};
export const theoretical=(W,H,K)=>{
 const x=Math.max(0,W-K+1),y=Math.max(0,H-K+1);
 return {H:H*x,V:W*y,R:x*y,F:x*y,total:H*x+W*y+2*x*y};
};
export const originalIncidenceGraph=(W,H,lines)=>{
 const n=W*H,par=Array.from({length:n+lines.length},(_,i)=>i);
 const root=x=>par[x]===x?x:(par[x]=root(par[x]));
 const union=(x,y)=>{let a=root(x),b=root(y);if(a!==b)par[b]=a;};
 const live=new Set();
 lines.forEach((line,i)=>line.sites.forEach(site=>{
   live.add(site);
   union(site,n+i);
 }));
 const byRoot=new Map();
 for(const site of live){const r=root(site);byRoot.set(r,(byRoot.get(r)||0)+1);}
 return {nontrivialComponents:byRoot.size,isolatedCells:n-live.size,
   componentCellSizes:[...byRoot.values()].sort((a,b)=>b-a)};
};
const GF2rank=lines=>{
 const basis=new Map();
 for(const {sites} of lines){
   let v=0n;
   for(const j of sites)v^=1n<<BigInt(j);
   while(v){
     const k=v.toString(2).length-1;
     const b=basis.get(k);
     if(b===undefined){basis.set(k,v);break;}
     v^=b;
   }
 }
 return basis.size;
};
const MOD=1009;
const inv=a=>{
 let e=MOD-2,base=a,result=1;
 while(e){if(e%2)result=(result*base)%MOD;base=(base*base)%MOD;e=Math.floor(e/2);}
 return result;
};
const rankFp=(lines,physicalCells)=>{
 const A=lines.map(line=>{
   const row=Array(physicalCells).fill(0);
   for(const site of line.sites)row[site]=1;
   return row;
 });
 let pivot=0;
 for(let col=0;col<physicalCells&&pivot<A.length;col++){
   let best=pivot;
   while(best<A.length&&A[best][col]===0)best++;
   if(best>=A.length)continue;
   [A[best],A[pivot]]=[A[pivot],A[best]];
   const inverse=inv(A[pivot][col]);
   for(let j=col;j<physicalCells;j++)A[pivot][j]=(A[pivot][j]*inverse)%MOD;
   for(let i=pivot+1;i<A.length;i++){
     const mul=A[i][col];
     if(!mul)continue;
     for(let j=col;j<physicalCells;j++)A[i][j]=(A[i][j]-mul*A[pivot][j]%MOD+MOD)%MOD;
   }
   pivot++;
 }
 return pivot;
};
export function profile(W,H,K=4){
 assert(Number.isInteger(W)&&W>0&&Number.isInteger(H)&&H>0&&Number.isInteger(K)&&K>=2,"valid dimensions");
 const lines=WINS(W,H,K),theory=theoretical(W,H,K);
 const counted={H:0,V:0,R:0,F:0,total:lines.length};
 for(const line of lines)counted[line.orientation]++;
 assert(JSON.stringify(theory)===JSON.stringify(counted),"K-window enumeration mismatch");
 const graph=originalIncidenceGraph(W,H,lines);
 const expected=(W<K&&H<K)?0:(W<K)?W:(H<K)?H:1;
 assert(graph.nontrivialComponents===expected,"incidence graph connectivity theorem counterexample");
 assert(graph.isolatedCells===((W<K&&H<K)?W*H:0),"incidence graph isolated cells mismatch");
 const sharedInterval=(n)=>n<K?null:{
   count:Math.max(0,2*K-n),
   indices:Array.from({length:n},(_,i)=>i).filter(c=>
     Array.from({length:n-K+1},(_,j)=>j).every(start=>start<=c&&c<start+K)),
   minTransversal:Math.floor(n/K),
   possibleIntervals:n-K+1
 };
 const futureAfterOpening=Array.from({length:W},(_,c)=>H-Number(c===Math.floor((W-1)/2)));
 const paired={J:futureAfterOpening.reduce((z,t)=>z+Math.floor(t/2),0),
   U:futureAfterOpening.reduce((z,t)=>z+(t%2),0),
   remainingAfterFirstMove:W*H-1};
 assert(2*paired.J+paired.U===paired.remainingAfterFirstMove,"gravity-pair budget identity violated");
 return {W,H,K,lineCounts:counted,topology:graph,rankGF2:GF2rank(lines),
   rankF1009:rankFp(lines,W*H),
   columnKspan:sharedInterval(W),rowKspan:sharedInterval(H),
   pairedFutureAfterP0MiddleColumnOpen:paired,
   sourceWDLforWidthBelowK:W<K?"DRAW EXACT BOTH-PLAYER VERTICAL PAIR POLICY":"INCOMPLETE BY THIS GUARD",
   sourceWDLforBothDimensionsBelowK:(W<K&&H<K)?"DRAW EXACT NO WINNING LINE":"not applicable"};
}
const all=[];
for(let W=1;W<=8;W++)for(let H=1;H<=8;H++)all.push(profile(W,H));
const generalKSpotChecks=[];
for(const K of [3,5,6])for(let W=K-1;W<=K+2;W++)
 for(let H=K-1;H<=K+2;H++){
  const p=profile(W,H,K);
  generalKSpotChecks.push({K,W,H,counts:p.lineCounts,
    components:p.topology.nontrivialComponents});
 }
const highlights=all.filter(x=>
  ([3,4,5].includes(x.W)&&[3,4,5,6,7,8].includes(x.H))||
  (x.W===7&&[1,2,3,4,5,6,7,8].includes(x.H))||
  (x.H===6&&[3,4,5,6,7,8].includes(x.W)));
console.log(JSON.stringify({schema:1,status:"PASS_SOURCE_ONLY_ORIGINAL_WINDOW_AND_COMPONENT_FORMULAS",
 independentControls:all.length+generalKSpotChecks.length,
 exactGuard:"K>=2 finite nonperiodic original 4 direction K-windows and alternating gravity pair budgeting; not WDL labeling",
 originalK4Rows:all,highlights,generalKSpotChecks},null,2));
