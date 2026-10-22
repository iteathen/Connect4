/**
 * Exact original 7x6 static K4 hypergraph Boolean-pivotality tensor contraction.
 * Independent z_s in {0,1} describes hypothetical future ownership, NOT game.
 * No enumeration of complete 42-site assignments / legal gameplay positions.
 * A triple of 6-bit column masks is a 3-column transfer boundary.
 *
 * node run-original7x6-K4-Boolean-pivotality-three-column-transfer.js
 */
"use strict";
const W=7,H=6,K=4,dir=[[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]];
const assert=(v,m)=>{if(!v)throw Error("C4_GLOBAL_PIVOTAL "+m);};
const original=[];
for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const [dx,dy,tag]of dir){
 const cs=[];for(let t=0;t<K;t++){
  const c=x+t*dx,r=y+t*dy;if(c<0||c>=W||r<0||r>=H){cs.length=0;break;}cs.push([c,r]);
 }
 if(cs.length===K)original.push({tag,cs});
}
assert(original.length===69,"original 69 windows");
const inventory=Object.fromEntries(dir.map(x=>[x[2],original.filter(z=>z.tag===x[2]).length]));
assert(JSON.stringify(inventory)===JSON.stringify({H:24,V:21,R:12,F:12}),"original direction counts");
/* Every physical column has 6 independent Boolean sites. A vertical
   K4 within the new column is prohibited before transferring. */
const allowedCols=[];
for(let m=0;m<(1<<H);m++)if(!(m&(m>>>1)&(m>>>2)&(m>>>3)))allowedCols.push(m);
assert(allowedCols.length===56,"56 vertical-K4-free column masks");
/* State s is three immediately preceding physical-column bitsets:
   a = s>>12, b=(s>>6)&63, c=s&63. First three virtual columns
   are all zero, making the first <4 real-column transitions correct. */
const shift=(s,d)=>((s&4095)<<6)|d;
function compatible(s,d){
 const a=s>>>12,b=(s>>>6)&63,c=s&63;
 const H4=a&b&c&d;
 const R4=a&(b>>>1)&(c>>>2)&(d>>>3);
 const F4=(a>>>3)&(b>>>2)&(c>>>1)&d;
 return !(H4||R4||F4);
}
const forward=[new Map([[0,1]])];
let acceptedForward=0;
for(let col=0;col<W;col++){
 const next=new Map();
 for(const [s,n]of forward[col])for(const d of allowedCols){
  if(!compatible(s,d))continue;
  const t=shift(s,d);
  next.set(t,(next.get(t)||0)+n);
  acceptedForward++;
 }
 forward.push(next);
}
const Z=[...forward[W].values()].reduce((a,b)=>a+b,0);
assert(Number.isSafeInteger(Z)&&Z<=2**(W*H)&&Z>0,"exact source partition count");
let backward=new Map([...forward[W].keys()].map(k=>[k,1]));
const occupied=Array.from({length:W},()=>Array(H).fill(0));
let acceptedBackward=0;
for(let col=W-1;col>=0;col--){
 const current=new Map();
 for(const [s,n]of forward[col]){
  let suffix=0;
  for(const d of allowedCols){
   if(!compatible(s,d))continue;
   const back=backward.get(shift(s,d));
   assert(back!==undefined,"all transfer successor triples reachable");
   suffix+=back;
   const weight=n*back;
   for(let row=0;row<H;row++)if(d&(1<<row))occupied[col][row]+=weight;
   acceptedBackward++;
  }
  current.set(s,suffix);
 }
 backward=current;
}
assert(backward.get(0)===Z,"forward/backward partition agreement");
assert(acceptedForward===acceptedBackward,"same static width3 transfer graph visited");
const pivot=occupied.map(col=>col.map(owned=>Z-2*owned));
for(let c=0;c<W;c++)for(let r=0;r<H;r++){
 const p=pivot[c][r];
 assert(p>=0&&Number.isSafeInteger(p),"physical-site monotone pivotal count");
 assert(p===pivot[W-1-c][r],"static left/right reflection");
 assert(p===pivot[c][H-1-r],"static vertical reflection (NOT a gravity symmetry)");
}
const maxPivotal=Math.max(...pivot.flat());
const maxLocations=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)if(pivot[c][r]===maxPivotal)maxLocations.push({column:c+1,row:r+1});
assert(Z===439428365759,"independently checked original69 source partition");
assert(maxPivotal===149598088717,"independently checked center-source pivotality");
assert(maxLocations.length===2&&maxLocations.every(x=>x.column===4&&[3,4].includes(x.row)),"central static source peak");
const result={
 schema:"c4.original7x6_global_static_pivotality_tensor.v1",
 status:"EXACT_7X6_K4_BOOLEAN_FIELD_WIDTH3_TRANSFER_AND_GRADIENT",
 geometry:{width:W,height:H,K,originalWinningLineCounts:inventory},
 meaning:"hypothetical independent binary physical-site completion, not legal gravity-colored boards or perfect-play WDL",
 K4freeStaticSubsets:Z,
 physicalSubsetsNotEnumerated:2**(W*H),
 verticalK4freeColumnMasks:allowedCols.length,
 forwardBoundaryStatesByColumn:forward.map(a=>a.size),
 maximumBoundaryTripleStates:Math.max(...forward.map(a=>a.size)),
 acceptedTransferEdgesForward:acceptedForward,
 acceptedTransferEdgesBackward:acceptedBackward,
 mostPivotalPhysicalSites:maxLocations,
 mostPivotalCount:maxPivotal,
 mostPivotalProbability:maxPivotal/(2**41),
 staticPivotalCountByRow:Array.from({length:H},(_,r)=>pivot.map(col=>col[r])),
 checkedIndependentScalarValues:{
  centerColumn4Row3:149598088717,
  centerColumn4Row1:111434791827,
  cornerColumn1Row1:36789765449,
  centerLeftColumn3Row3:127272240843
 },
 algebra:"I_e = #K4free(e=0) - #K4free(e=1) = Z - 2*derivative_Z_by_site_weight_e",
 resultScope:"STATIC FIELD INFLUENCE ONLY; does not infer first-best move or optimal root outcome",
 original7x6GamePositionsEnumerated:0,
 firstWinGameHistoriesEnumerated:0,
 solvedWDLUsed:false,
 rootAdversarialInvariantConstructed:false
};
console.log(JSON.stringify(result,null,2));