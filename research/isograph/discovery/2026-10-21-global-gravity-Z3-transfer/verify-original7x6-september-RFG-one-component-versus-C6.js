/**
 * Original 7x6 September RFG component semantics on October C6 legal faces.
 * Exact BigInt site masks replace September small-board 32-bit masks; all
 * R/F/G predicates are transcribed from frozen EW-RS-070 runner.
 * All counts are genuine legal firstwin-stopped original 7x6 histories.
 * No solved-game oracle, optimal-play premise, nor <5 geometry.
 * Run: node verify-original7x6-september-RFG-one-component-versus-C6.js
 */
"use strict";
const W=7,H=6,K=4,PC=[1,2,3,5,6,7];
const dirs=[[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]];
const assert=(ok,msg)=>{if(!ok)throw Error("C4_RFG_ORIGINAL7X6 "+msg);};
const bm=Array.from({length:W*H},(_,i)=>1n<<BigInt(i));
const lines=[];
for(let row=0;row<H;row++)for(let c=0;c<W;c++)for(const [dx,dy,d]of dirs){
 const cells=[];
 for(let j=0;j<K;j++){const x=c+j*dx,y=row+j*dy;if(x<0||x>=W||y<0||y>=H){cells.length=0;break;}cells.push(y*W+x);}
 if(cells.length===K)lines.push({cells,d,mask:cells.reduce((a,i)=>a|bm[i],0n)});
}
assert(lines.length===69,"original 69 K4 masks");
const dist=Object.fromEntries(["H","V","R","F"].map(d=>[d,lines.filter(l=>l.d===d).length]));
assert(JSON.stringify(dist)===JSON.stringify({H:24,V:21,R:12,F:12}),"direction counts");
const bits=m=>{let a=[];for(let i=0;i<bm.length;i++)if((m&bm[i])!==0n)a.push(i);return a;};
const hasWin=(own)=>lines.some(l=>(own&l.mask)===l.mask);
function checkRay(s,c,r,p){
 const owner=s.own[p];let win=false;
 for(const [dx,dy] of dirs){
  let count=1;
  for(const step of [-1,1])for(let k=1;k<K;k++){
   const x=c+step*k*dx,y=r+step*k*dy;
   if(x<0||x>=W||y<0||y>=H||(owner&bm[y*W+x])===0n)break;
   count++;
  }
  if(count>=K)win=true;
 }
 return win;
}
function drop(s,c,p) {
 const x=c-1,r=s.h[x];assert(r<H,"landing must be legal");
 const h=s.h.slice();h[x]++;
 const own=s.own.slice();own[p]|=bm[r*W+x];
 const child={h,own,rank:s.rank+1,terminal:false};
 const win=hasWin(own[p]);assert(win===checkRay(child,x,r,p),"69 K4 and ray mismatch");
 assert(!hasWin(own[1-p]),"input already had a past opponent win");
 child.terminal=win;child.winner=win?p:null;return child;
}
function source(anchor,idx){
 const free=PC.filter(c=>c!==anchor),bb=free.map((_,i)=>(idx>>(4-i))&1);
 const word=[anchor,...free.flatMap((c,i)=>bb[i]===0?[c,c]:[]),anchor,...free.flatMap((c,i)=>bb[i]===1?[c,c]:[])];
 assert(word.length===12,"source word 12");
 let s={h:Array(W).fill(0),own:[0n,0n],rank:0,terminal:false};
 for(let i=0;i<12;i++){s=drop(s,word[i],i&1);assert(!s.terminal,"source firstwinner free");}
 assert(s.h.join(",")==="2,2,2,0,2,2,2","source support");
 return s;
}
function normalize(masks) {
 const arr=[...new Set(masks)];
 return arr.filter(x=>!arr.some(y=>x!==y&&(x&y)===y));
}
function residuals(own,opp) {
 return normalize(lines.filter(l=>(l.mask&opp)===0n).map(l=>l.mask&~own).filter(m=>m!==0n));
}
function feasible(mask,h,p) {
 const ply=h.reduce((a,b)=>a+b,0),rem=W*H-ply,mover=ply&1;
 const needs=bits(mask).map(i=>Math.floor(i/W)-h[i%W]+1).sort((a,b)=>a-b);
 if(needs.some(n=>n<=0))return false;
 let slot=p===mover?1:2;
 for(const need of needs){while(slot<need)slot+=2;if(slot>rem)return false;slot+=2;}
 return true;
}
function RFG(s) {
 assert(!s.terminal,"RFG on nonterminal only");
 const h=s.h,ply=s.rank,p=ply&1;
 const initial=[residuals(s.own[0],s.own[1]),residuals(s.own[1],s.own[0])];
 const R=initial.map((rs,p)=>rs.filter(m=>feasible(m,h,p)));
 let frontier=0n;
 for(let c=0;c<W;c++)if(h[c]<H){
  const bit=bm[h[c]*W+c];
  if(!R[p].some(x=>x===bit))frontier|=bit;
 }
 const F=R.map(x=>x.slice());F[p]=F[p].filter(x=>(x&frontier)!==frontier);
 let caps=0n;for(let c=0;c<W;c++)if(h[c]<H)caps|=bm[(H-1)*W+c];
 const G=F.map(x=>x.slice()),nonFinal=1-((W*H-1)&1);
 G[nonFinal]=G[nonFinal].filter(x=>(x&caps)!==caps);
 const parent=Array.from({length:W},(_,i)=>i);
 const root=c=>{while(parent[c]!==c){parent[c]=parent[parent[c]];c=parent[c];}return c;};
 for(const mask of [...G[0],...G[1]]){
  const cols=[...new Set(bits(mask).map(b=>b%W))].sort((a,b)=>a-b);
  for(let i=1;i<cols.length;i++)parent[root(cols[i])]=root(cols[0]);
 }
 const comps=new Map();
 for(let c=0;c<W;c++){const r=root(c);if(!comps.has(r))comps.set(r,[]);comps.get(r).push(c+1);}
 const widths=[...comps.values()].map(cs=>cs.length).sort((a,b)=>a-b);
 assert(widths.reduce((a,b)=>a+b,0)===W,"RFG component-width conservation");
 return {widths,componentColumns:[...comps.values()],raw:initial.map(x=>x.length),R:R.map(x=>x.length),F:F.map(x=>x.length),G:G.map(x=>x.length)};
}
function census(){
 const counts={},sinks={},sources=6*32;
 let liveSamples=0,maxOOO=0,firstWin=0,secondWin=0,p1Win=0;
 for(const anchor of PC){
  counts[anchor]={source:0,afterP0center:0,afterP1:0,afterP0third:0};
  sinks[anchor]={firstP0:0,P1:0,thirdP0:0};
  for(let id=0;id<32;id++){
   const q=source(anchor,id);
   function inspect(st,stage){
    let c=RFG(st);counts[anchor][stage]++;liveSamples++;
    const oddDistinct=c.widths.length;
    maxOOO=Math.max(maxOOO,oddDistinct);
    assert(oddDistinct===1&&c.widths[0]===7,"non-singleton RFG on "+anchor+" "+id+" "+stage+" "+JSON.stringify(c.widths));
    return c;
   }
   inspect(q,"source");
   const first=drop(q,4,0);
   if(first.terminal){sinks[anchor].firstP0++;firstWin++;continue;}
   inspect(first,"afterP0center");
   for(let d=1;d<=W;d++){
    const response=drop(first,d,1);
    if(response.terminal){sinks[anchor].P1++;p1Win++;continue;}
    inspect(response,"afterP1");
    const third=drop(response,4,0);
    if(third.terminal){sinks[anchor].thirdP0++;secondWin++;continue;}
    inspect(third,"afterP0third");
   }
  }
 }
 assert(sources===192&&liveSamples===1632,"sample counting");
 assert(firstWin===84&&secondWin===180&&p1Win===0,"absorbing sink totals");
 return {allPhysicalSourceBoards:sources,liveSampleOccurrences:liveSamples,maxDistinctOddComponentTypes:maxOOO,OOOThirdDistinctComponentMonomials:0,stageCounts:counts,terminalSinks:sinks,totalSinks:{firstP0:firstWin,P1:p1Win,thirdP0:secondWin}};
}
function C6(){
 const ids=[1,2,8,9,16,18],z=[1,-1,1,-1,-1,1],reports=[];
 const dot=xs=>xs.reduce((a,x,i)=>a+x*z[i],0);
 for(const anchor of [1,7]){
  const rows=ids.map(id=>source(anchor,id));
  const X=ids.map(id=>(id>>4)&1);
  const initialOOO=rows.map(q=>Math.max(RFG(q).widths.length-2,0));
  assert(dot(X)===0&&initialOOO.every(x=>x===0),"base cycle or OOO mismatch");
  for(let d=1;d<=7;d++){
   const live=[],S=[],win=[];
   for(let i=0;i<rows.length;i++){
    const a=drop(rows[i],4,0);assert(!a.terminal,"hexagon first P0 no win");
    const b=drop(a,d,1);assert(!b.terminal,"hexagon P1 no win");
    const c=drop(b,4,0);
    S.push(Number(!c.terminal));win.push(Number(c.terminal));
    if(!c.terminal)live.push(c);
   }
   const SX=S.map((s,i)=>s*X[i]),liveOOO=live.map(q=>RFG(q).widths.length);
   assert(liveOOO.every(k=>k===1),"survivor OOO still absent");
   assert(dot(S)===0,"equal P0 surviving mass");
   if(d===4){assert(dot(SX)===0&&S.every(v=>v===1),"P1 center blocks delayed hazard");}
   else{assert(dot(SX)===1&&S.join("")==="000101"&&win.reduce((a,b)=>a+b,0)===4,"C6 survivor mismatch");}
   reports.push({anchor,reply:d,zS:dot(S),zX:dot(X),zSX:dot(SX),P0Wins:[win.filter((w,i)=>i%1===0&&z[i]===1&&w).length,win.filter((w,i)=>z[i]===-1&&w).length],sourceOOOAbsent:true,allLiveRFGComponentsOne:true});
  }
 }
 return reports;
}
const result={schema:"c4.cross_era.original7x6_RFG_C6.v1",status:"EXACT_SCOPED_ORIGINAL7X6_RFG_CONNECTEDNESS_AND_OOO_DOMAIN_MISMATCH",geometry:"7x6-k4 only",originalK4:dist,sourceCodeAdaptation:"historical RFG semantics BigInt physical masks instead of historical 32-bit masks",census:census(),C6:C6(),outcomePremises:"none",historicalT2OValueCharacter:"NOT_TESTED",complete7x6GameValue:"NOT_PROVED",oldScalarLawFalsified:false,oldVsNewTypedEquivalenceProved:false};
console.log(JSON.stringify(result,null,2));