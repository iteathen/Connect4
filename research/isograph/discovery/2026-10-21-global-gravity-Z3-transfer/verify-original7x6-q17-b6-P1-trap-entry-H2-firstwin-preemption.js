"use strict";
/* Real original7x6 P1 rank17 q after q13 b6 then left P0 primer:
   42142544223336111. P1 source H row2 c3..c6 missing
   c5r2,c6r2 and P0 source ready c5r3 trap.
   P1 c6r2 -> P0 c3r4 (odd Q first mate) -> P1 c5r2
   FIRSTWINS original H row2 at rank20 BEFORE P0 trap response.
   Finite source-proof policy counterexample; not actual P0 q17 WLD.
*/
const assert=(v,m)=>{if(!v)throw Error("C4_B6_TRAP_RACE "+m)};
const W=7,H=6,dirs=[["H",1,0],["V",0,1],["R",1,1],["F",1,-1]];
const K=[];
for(let c=1;c<=7;c++)for(let r=1;r<=6;r++)for(const[type,dx,dy]of dirs){
 const L=Array.from({length:4},(_,i)=>[c+dx*i,r+dy*i]);
 if(L.every(([x,y])=>x>=1&&x<=W&&y>=1&&y<=H))K.push({type,L});
}
assert(K.length===69,"original69 physical K4");
const inv=Object.fromEntries(["H","V","R","F"].map(x=>[x,K.filter(L=>L.type===x).length]));
assert(JSON.stringify(inv)===JSON.stringify({H:24,V:21,R:12,F:12}),"original four K4 types");
const n=([c,r])=>r*W+c;
const init=()=>({h:Array(7).fill(0),owner:new Map()});
function ray(q,c,r,p){
 for(const [t,dx,dy]of dirs){let i=1;for(const sg of [-1,1])for(let k=1;k<4;k++){
  let x=c+sg*k*dx,y=r+sg*k*dy;
  if(x<1||x>7||y<1||y>6||q.owner.get(n([x,y]))!==p)break;i++;
 }if(i>=4)return true;}
 return false;
}
const winning=(q,p)=>K.filter(z=>z.L.every(v=>q.owner.get(n(v))===p));
function play(q,c,p){
 const r=q.h[c-1]+1;assert(r<=6,"legal original gravity");
 q.h[c-1]++;q.owner.set(n([c,r]),p);
 const won=winning(q,p);
 assert((won.length>0)===ray(q,c,r,p),"69 winning lines match independent ray");
 return {column:c,row:r,owner:p,firstwin:won.length>0,
  originalWinLines:won.map(x=>({kind:x.type,physical:x.L}))};
}
function originalMin(q,p){
 const a=[];
 for(const z of K){
  if(z.L.some(v=>q.owner.get(n(v))===1-p))continue;
  const g=z.L.filter(v=>!q.owner.has(n(v)));
  if(g.length)a.push({g,z});
 }
 const u=[...new Map(a.map(x=>[x.g.map(n).sort((a,b)=>a-b).join(","),x])).values()];
 return u.filter(x=>!u.some(y=>y.g.length<x.g.length&&y.g.every(v=>x.g.some(t=>n(t)===n(v)))));
}
const word="42142544223336111",q=init(),history=[];
for(let i=0;i<word.length;i++){
 const a=play(q,+word[i],i%2);
 assert(!a.firstwin,"rank17 source history firstwinner-free");
 history.push(a);
}
assert(q.h.join(",")==="4,4,3,4,1,1,0","source rank17 true support");
const P0=originalMin(q,0),P1=originalMin(q,1);
const readyP0=[];
for(let c=1;c<=7;c++)if(q.h[c-1]<=4){
 const site=[c,q.h[c-1]+2];
 if(P0.some(x=>x.g.length===1&&n(x.g[0])===n(site)))readyP0.push(c);
}
assert(readyP0.includes(5),"genuine P0 current terminal trap c5r3");
const Hline=[[3,2],[4,2],[5,2],[6,2]];
const P1sourceH=P1.find(x=>x.g.map(v=>v.join(",")).sort().join("|")==="5,2|6,2"&&x.z.type==="H");
assert(Boolean(P1sourceH)&&P1sourceH.z.L.map(v=>v.join(",")).join("|")===Hline.map(v=>v.join(",")).join("|"),
 "P1 original row2 H c3..6 source G={c5r2,c6r2}");
const continuation=[],control=[[6,1],[3,0],[5,1]];
for(let j=0;j<control.length;j++){
 const [c,p]=control[j],event=play(q,c,p);
 continuation.push(event);
 if(j<2)assert(!event.firstwin,"no winning K4 before P1 terminal trap entry");
}
const d=continuation[0],a=continuation[1],last=continuation[2];
assert(d.column===6&&d.row===2&&a.column===3&&a.row===4,
 "old odd-Q first entry P1 c6r2 -> P0 paired c3r4 genuinely legal");
assert(last.column===5&&last.row===2&&last.firstwin&&last.owner===1,
 "P1 FIRSTWINS on supposed P0 trap entry c5r2 before A c5r3 reply");
assert(last.originalWinLines.some(v=>v.kind==="H"&&v.physical.map(x=>x.join(",")).join("|")==="3,2|4,2|5,2|6,2"),
 "physical P1 firstwin is original row2 horizontal");
const result={schema:"c4.original7x6_source_terminal_trap_preempted_by_P1_firstwin.v1",
 status:"EXACT_C4XR_B6_Q17_P1_FIRSTWIN_ON_P0_TRAP_ENTRY_DISPROVES_NAIVE_ONLINE_Q_POLICY",
 geometry:inv,sourceHistory:word,sourceRank:17,sourceHeights:[4,4,3,4,1,1,0],
 P0ReadyTrapColumns:readyP0,
 P1OriginalImmediateSourceDefect:{originalK4:Hline,sourceMissing:P1sourceH.g,
  grade:P1sourceH.g.length},
 sourceOldPolicyPairing:{oddSourceColumns:[3,6],DoddFirst:[6,2],Amate:[3,4]},
 threeActualFirstwinnerStoppedMoves:continuation,
 firstWinningAtRank:20,
 winningPlayer:"P1 under THIS old online responder policy",
 causalLesson:"The A=P0 c5 terminal ready trap is not sufficient against an adaptive D that first completes the OTHER source H row2 missing cell c6r2; D c5r2 then FIRSTWINS on trap ENTRY before the A reply. Original matroid rank0 exposes precisely this firstwinner preemption. This does NOT prove actual q17 P0 LOSS or full q13/EMPTY WLD.",
 gameTreeValuesComputed:0,sourceOracleBlind:true,
 maintainedCI:"NOT_RUN",formalAssistant:"NOT_RUN"};
console.log(JSON.stringify(result,null,2));