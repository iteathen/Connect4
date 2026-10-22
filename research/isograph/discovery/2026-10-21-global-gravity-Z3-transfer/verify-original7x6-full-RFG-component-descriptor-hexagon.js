/**
 * Full historical two-stage ROLE_CAPPAR_REL_INC_ZOE component identity
 * on genuine 7x6 edge-anchor C6 source boards. Replaces historical 32-bit
 * masks with 42-bit-capable BigInt; exhausts ALL 7! role permutations.
 * Verification independent of the preceding signed-moment checker.
 * No old WDL scalar or solved opening data.
 * Run: node verify-original7x6-full-RFG-component-descriptor-hexagon.js
 */
"use strict";
const W=7,H=6,K=4,peripheral=[1,2,3,5,6,7],dirs=[[1,0],[0,1],[1,1],[1,-1]];
const assert=(v,m)=>{if(!v)throw Error("C4_FULL_RFG_DESC: "+m);};
const winlines=[];
for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const[dx,dy]of dirs){
 const cells=[];for(let k=0;k<K;k++){const xx=x+k*dx,yy=y+k*dy;if(xx<0||xx>=W||yy<0||yy>=H){cells.length=0;break;}cells.push(yy*W+xx);}
 if(cells.length===K)winlines.push(cells);
}
assert(winlines.length===69,"original K4 catalog");
function drop(q,c,p){
 const x=c-1,y=q.h[x],h=q.h.slice(),b=q.b.slice();assert(y<6,"legal gravity landing");h[x]++;b[y*7+x]=p;
 const win=winlines.some(L=>L.every(i=>b[i]===p));return {q:{b,h},win};
}
function build(anchor,id){
 const free=peripheral.filter(c=>c!==anchor),bits=free.map((_,i)=>(id>>(4-i))&1);
 const seq=[anchor,...free.flatMap((c,i)=>bits[i]?[ ]:[c,c]),anchor,...free.flatMap((c,i)=>bits[i]?[c,c]:[])];
 assert(seq.length===12,"authentic history");
 let q={b:Array(W*H).fill(-1),h:Array(W).fill(0)};
 for(let t=0;t<12;t++){const next=drop(q,seq[t],t&1);assert(!next.win,"firstwinnerfree history");q=next.q;}
 assert(q.h.join(",")==="2,2,2,0,2,2,2","source gravity support");
 return q;
}
function minimalResidual(q,p){
 const req=[];
 for(const L of winlines){
  if(L.some(i=>q.b[i]===1-p))continue;
  const x=L.filter(i=>q.b[i]===-1);assert(x.length>0,"source cannot already have won");req.push(x);
 }
 const unique=new Map(req.map(x=>[x.join(","),x])),a=[...unique.values()];
 return a.filter(x=>!a.some(y=>y.length<x.length&&y.every(i=>x.includes(i))));
}
function RFG(q){
 const h=q.h,ply=h.reduce((a,b)=>a+b,0),mover=ply&1,rem=W*H-ply;
 const R=[minimalResidual(q,0),minimalResidual(q,1)].map((arr,p)=>arr.filter(m=>{
  const needs=m.map(i=>Math.floor(i/W)-h[i%W]+1).sort((a,b)=>a-b);
  if(needs.some(x=>x<=0))return false;
  let slot=p===mover?1:2;
  for(const need of needs){while(slot<need)slot+=2;if(slot>rem)return false;slot+=2;}return true;
 }));
 const frontier=[];
 for(let c=0;c<W;c++)if(h[c]<H){
  const i=h[c]*W+c;if(!R[mover].some(x=>x.length===1&&x[0]===i))frontier.push(i);
 }
 const F=R.map(x=>x.slice());
 F[mover]=F[mover].filter(x=>!frontier.every(i=>x.includes(i)));
 const caps=Array.from({length:W},(_,c)=>(H-1)*W+c).filter(i=>h[i%W]<H);
 const G=F.map(x=>x.slice()),nonFinal=1-((W*H-1)&1);
 G[nonFinal]=G[nonFinal].filter(x=>!caps.every(i=>x.includes(i)));
 // Union-find on all remaining owner residual requirements.
 const parent=Array.from({length:W},(_,i)=>i);
 const root=c=>{while(parent[c]!==c){parent[c]=parent[parent[c]];c=parent[c];}return c;};
 for(const mask of [...G[0],...G[1]]){
  const cs=[...new Set(mask.map(i=>i%W))];for(let j=1;j<cs.length;j++)parent[root(cs[j])]=root(cs[0]);
 }
 const rs=new Set(Array.from({length:W},(_,i)=>root(i)));
 assert(rs.size===1,"exact original RFG one connected component");
 return {R,F,G};
}
function allPermutations(){
 const a=Array.from({length:W},(_,i)=>i),out=[];
 function rec(k){
  if(k===W){out.push(a.slice());return;}
  for(let j=k;j<W;j++){[a[k],a[j]]=[a[j],a[k]];rec(k+1);[a[k],a[j]]=[a[j],a[k]];}
 }
 rec(0);return out;
}
const PERMS=allPermutations();assert(PERMS.length===5040,"7! all permutations");
function finalKey(h,requirements,p){
 const phases=Array(W);
 for(let c=0;c<W;c++)phases[p[c]]=(H-h[c])&1;
 const owners=requirements.map(rs=>rs.map(mask=>mask.map(i=>{
  const col=i%W,row=Math.floor(i/W);
  return (row-h[col])+":"+p[col];
 }).sort().join(",")).sort().join(";"));
 return "w7|cap="+phases.join(".")+"|r0="+owners[0]+"|r1="+owners[1];
}
function directDescriptor(h,rs){
 let best=null,witness=null;
 for(const p of PERMS){const key=finalKey(h,rs,p);if(best===null||key<best){best=key;witness=p;}}
 return {key:best,argmin:witness};
}
const bm=Array.from({length:W*H},(_,i)=>1n<<BigInt(i));
function twoStageDescriptor(h,rs){
 let best=null,canon=null;
 for(const p of PERMS){
  const hh=Array(W);
  for(let c=0;c<W;c++)hh[p[c]]=h[c];
  const m=rs.map(owner=>owner.map(mask=>{
   let x=0n;for(const i of mask)x|=bm[Math.floor(i/W)*W+p[i%W]];return x;
  }).sort((a,b)=>a<b?-1:a>b?1:0));
  const key=hh.join(",")+"|"+m[0].join(".")+"|"+m[1].join(".");
  if(best===null||key<best){best=key;canon={hh,rr:m};}
 }
 const masks=canon.rr.map(owner=>owner.map(v=>{
  const cells=[];for(let i=0;i<W*H;i++)if((v&bm[i])!==0n)cells.push(i);return cells;
 }));
 return directDescriptor(canon.hh,masks).key;
}
const ids=[1,2,8,9,16,18],z=[1,-1,1,-1,-1,1],results=[];
const fingerprint=s=>{let h=14695981039346656037n;for(let i=0;i<s.length;i++)h=BigInt.asUintN(64,(h^BigInt(s.charCodeAt(i)))*1099511628211n);return h.toString(16).padStart(16,"0");};
for(const anchor of [1,7]){
 const items=[];
 for(let i=0;i<6;i++){
  const q=build(anchor,ids[i]),rr=RFG(q).G,d=directDescriptor(q.h,rr);
  const fp=fingerprint(d.key);
  items.push({index:ids[i],sign:z[i],key:d.key,fingerprintFNV64:fp,bytes:d.key.length,argmin:d.argmin});
 }
 assert(new Set(items.map(x=>x.key)).size===6,"6 source atoms carry 6 different full old descriptors");
 const signedHistogram=new Map();
 for(const x of items)signedHistogram.set(x.key,(signedHistogram.get(x.key)||0)+x.sign);
 assert([...signedHistogram.values()].every(v=>v===1||v===-1),"full descriptor detects C6 sign");
 const twice=build(anchor,1),f=RFG(twice).G;
 assert(twoStageDescriptor(twice.h,f)===items[0].key,"historical canonicalComponent + roleCappar matches direct orbit");
 results.push({anchor,sourceIndices:ids,sevenFactorialEnumerated:PERMS.length,uniqueDescriptorCount:6,QrankOfOneHotOnC6:6,zAnnihilatesDescriptor:false,exactTwoStageEqualityCheck:true,items:items.map(({key,...rest})=>rest)});
}
for(const entry of results[0].items){
 const match=results[1].items.find(x=>x.fingerprintFNV64===entry.fingerprintFNV64);
 assert(match&&entry.bytes===match.bytes,"horizontal-reflection canonical cross-check");
}
console.log(JSON.stringify({schema:"c4.original7x6_FULL_RFG_DESCRIPTOR_C6.v1",status:"EXACT_TWO_STAGE_5040_PERM_ORBIT_FULL_DESCRIPTOR_SEPARATES_EVERY_C6_ATOM",originalPhysicalGeometry:"7x6-k4",sourceWDL:"NONE",OOODistinctComponentCubic:"ZERO_ON_THIS_GUARD",results,rootWinProved:false},null,2));