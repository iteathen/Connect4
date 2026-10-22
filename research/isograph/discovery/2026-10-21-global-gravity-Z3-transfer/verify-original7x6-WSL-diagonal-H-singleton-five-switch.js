/**
 * Independent original 7x6 exact WSL antichain dominance to fifth-order
 * firstwinner survival correlation; source face guard c1/c7.
 * This implementation uses literal ternary physical cell arrays, not the
 * previous BigInt residual/RFG implementation or solved-game labels.
 * No sub-five dimensions, no oracle, no perfect-play assumption.
 * Run: node verify-original7x6-WSL-diagonal-H-singleton-five-switch.js
 */
"use strict";
const W=7,H=6,K=4,outer=[1,2,3,5,6,7];
const dirs=[[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]];
const check=(v,m)=>{if(!v)throw Error("C4_WSL_FIVE_SWITCH: "+m);};
const cells=[];
for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const[dx,dy,d]of dirs){
 let cs=[];for(let i=0;i<K;i++){const a=x+i*dx,b=y+i*dy;if(a<0||a>=W||b<0||b>=H){cs=[];break;}cs.push(b*W+a);}
 if(cs.length===K)cells.push({d,cs});
}
check(cells.length===69,"original69 lines");check(dirs.map(([a,b,d])=>cells.filter(x=>x.d===d).length).join(",")==="24,21,12,12","original direction inventory");
function winRay(q,c,r,p){
 for(const[dx,dy]of dirs){
  let n=1;
  for(const sg of [-1,1])for(let k=1;k<4;k++){
   let x=c+sg*k*dx,y=r+sg*k*dy;if(x<0||x>=W||y<0||y>=H||q.b[y*W+x]!==p)break;n++;
  }
  if(n>=4)return true;
 }
 return false;
}
function move(q,c,p){
 const x=c-1,r=q.h[x];check(r>=0&&r<H,"legal gravity landing");
 const b=q.b.slice(),h=q.h.slice();b[r*W+x]=p;h[x]++;
 const state={b,h};
 const ray=winRay(state,x,r,p),literal=cells.some(L=>L.cs.every(i=>b[i]===p));
 check(ray===literal,"ray/original69 firstwinner agree");
 check(!cells.some(L=>L.cs.every(i=>b[i]===1-p)),"no already-terminal parent");
 return {state,win:ray};
}
function physical(anchor,id){
 const free=outer.filter(c=>c!==anchor),bits=free.map((_,i)=>(id>>(4-i))&1);
 const word=[anchor,...free.flatMap((c,i)=>bits[i]?[ ]:[c,c]),anchor,...free.flatMap((c,i)=>bits[i]?[c,c]:[])];
 check(word.length===12,"12 source moves");
 let q={b:Array(42).fill(-1),h:Array(7).fill(0)};
 for(let i=0;i<word.length;i++){const z=move(q,word[i],i&1);check(!z.win,"source firstwinner-free prefix");q=z.state;}
 check(q.h.join(",")==="2,2,2,0,2,2,2","source rank12 heights");
 return {q,bits,id};
}
function req(q,p){
 const candidate=[];
 for(const L of cells){
  if(L.cs.some(i=>q.b[i]===1-p))continue;
  const mask=L.cs.filter(i=>q.b[i]===-1);
  check(mask.length>0,"live source cannot contain complete K4");
  candidate.push(mask);
 }
 const uniqueMap=new Map(candidate.map(m=>[m.join(","),m]));
 const unique=[...uniqueMap.values()];
 const minimal=unique.filter(m=>!unique.some(k=>k.length<m.length&&k.every(i=>m.includes(i))));
 const minSet=new Set(minimal.map(m=>m.join(",")));
 const dominated=unique.filter(m=>!minSet.has(m.join(",")));
 return {candidate,unique,minimal,dominated};
}
const sig=m=>[...m].sort((a,b)=>a-b).join(",");
const zz=[1,-1,1,-1,-1,1],six=[1,2,8,9,16,18];
const dot=(vals,z=zz)=>vals.reduce((sum,v,i)=>sum+v*z[i],0);
const perOwnerEulerSlots=()=>{
 let n=0;
 for(let e=0;e<42;e++){
  const D=dirs.map((_,j)=>j).filter(j=>cells.some(L=>L.d===dirs[j][2]&&L.cs.includes(e)));
  n+=(1<<D.length)-1;
 }return n;
};
check(perOwnerEulerSlots()===438,"438 Euler slots per owner");
function checkNativeNull(sixStates){
 let matchedLinePatterns=0,matchedEulerSlots=0;
 for(const L of cells){
  const hist=new Map();
  for(let i=0;i<6;i++){
   const k=L.cs.map(j=>sixStates[i].q.b[j]).join(",");
   hist.set(k,(hist.get(k)||0)+zz[i]);
  }
  check([...hist.values()].every(v=>v===0),"individual original K4 ternary pattern matches");
  matchedLinePatterns++;
 }
 for(const p of [0,1])for(let e=0;e<42;e++){
  const col=e%W,row=Math.floor(e/W),dd=dirs.map((_,j)=>j).filter(j=>cells.some(L=>L.d===dirs[j][2]&&L.cs.includes(e)));
  for(let subset=1;subset<(1<<dd.length);subset++){
   const xs=sixStates.map(src=>{
    if(src.q.h[col]!==row)return 0;
    return Number(dd.every((j,i)=>!(subset&(1<<i))||cells.some(L=>L.d===dirs[j][2]&&L.cs.includes(e)&&L.cs.every(t=>t===e||src.q.b[t]===p))));
   });
   check(dot(xs)===0,"Euler native C6 moment");
   matchedEulerSlots++;
  }
 }
 check(matchedEulerSlots===876,"both-owner Euler slot exhaustive equality");
 return {matchedOriginalK4FullPatternWindows:matchedLinePatterns,matchedTwoOwnerEulerSlots:matchedEulerSlots};
}
function audit(anchor){
 const records=[],counts={EVEN:{D:0,DS:0},ODD:{D:0,DS:0}};
 const free=outer.filter(c=>c!==anchor);
 const mask=anchor===1?[3,2*W+1,3*W+0]:[3,2*W+5,3*W+6],maskSig=sig(mask);
 for(let id=0;id<32;id++){
  const src=physical(anchor,id),q=src.q,pa=req(q,1);
  const idx=src.bits.reduce((a,b)=>a+b,0)&1,par=idx?"ODD":"EVEN";
  const D=Number(pa.unique.some(m=>sig(m)===maskSig)&&!pa.minimal.some(m=>sig(m)===maskSig));
  const b=Object.fromEntries(free.map((c,i)=>[c,src.bits[i]]));
  const predicted=anchor===1?b[3]*(1-b[5])*(1-b[6])*(1-b[7]):b[5]*(1-b[1])*(1-b[2])*(1-b[3]);
  check(D===predicted,"strict antichain domination formula anchor="+anchor+" id="+id);
  const next=move(q,4,0),S=Number(!next.win),DS=D*S;
  const predDS=anchor===1?(1-b[2])*b[3]*(1-b[5])*(1-b[6])*(1-b[7]):(1-b[6])*b[5]*(1-b[1])*(1-b[2])*(1-b[3]);
  check(DS===predDS,"five-factor survivor normal form anchor="+anchor+" id="+id);
  counts[par].D+=D;counts[par].DS+=DS;
  records.push({id,src,pa,D,DS,S});
 }
 check(counts.EVEN.D===1&&counts.ODD.D===1&&counts.EVEN.DS===0&&counts.ODD.DS===1,"exact parity fields 1/1 => 0/1");
 const mobius5=records.reduce((sum,r)=>sum+(((r.src.bits.reduce((a,b)=>a+b,0))&1)?-1:1)*r.DS,0);
 check(mobius5===-1,"five-bit Boolean Mobius top coefficient +1");
 const witness=six.map(id=>records[id]),native=checkNativeNull(witness.map(x=>x.src));
 const metrics={perLineP1:witness.map(w=>w.pa.candidate.length),uniqueP1:witness.map(w=>w.pa.unique.length),minimalP1:witness.map(w=>w.pa.minimal.length),dominatedP1:witness.map(w=>w.pa.dominated.length),D:witness.map(w=>w.D),DS:witness.map(w=>w.DS),S:witness.map(w=>w.S)};
 const zMeasures=Object.fromEntries(Object.entries(metrics).map(([k,vec])=>[k,dot(vec)]));
 const expected=anchor===1?-1:1;
 check(zMeasures.perLineP1===0&&zMeasures.uniqueP1===0&&zMeasures.minimalP1===expected&&zMeasures.dominatedP1===-expected,"window/unique/antichain z contrast");
 check(zMeasures.D===-expected&&zMeasures.DS===-expected,"single-mask dominance signal");
 const signedDom=new Map();
 for(const [i,r]of witness.entries())for(const m of r.pa.dominated){
  const key=sig(m);signedDom.set(key,(signedDom.get(key)||0)+zz[i]);
 }
 const nonzeroDom=[...signedDom].filter(([k,v])=>v!==0);
 check(nonzeroDom.length===1&&nonzeroDom[0][0]===maskSig&&nonzeroDom[0][1]===-expected,"only one distinguished dominated mask");
 const dBoards=records.filter(r=>r.D).map(x=>x.id),dsBoards=records.filter(r=>r.DS).map(x=>x.id);
 return {anchor,sourceBoards:32,originalK4PatternsAndEuler:native,momentContrast:zMeasures,nonzeroDominatedResiduals:nonzeroDom.map(([k,v])=>({cells:k.split(",").map(Number).map(i=>[i%W+1,Math.floor(i/W)+1]),signedMeasure:v})),activeDSourceIndices:dBoards,activeDSAfterFirstWinIndices:dsBoards,parityMass:counts,mobiusEvenMinusOdd:mobius5,primitiveSquarefreeDegree:5};
}
const reports=[audit(1),audit(7)];
console.log(JSON.stringify({schema:"c4.original7x6_WSL_antichain_five_switch.v1",status:"INDEPENDENT_TERNARY_69K4_WSL_FIVE_SWITCH_EXACT_PASS",geometry:"original7x6 K4",reports,oldOOOTripleOnSource:0,oldExactWDLUsed:false,originalRootWinnerProved:false},null,2));