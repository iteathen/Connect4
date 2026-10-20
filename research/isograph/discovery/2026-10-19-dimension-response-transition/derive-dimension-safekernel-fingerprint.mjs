// Research-only: source-first W/H/K geometric and fixed-followup pairing fingerprint.
// Does not import solved labels, game-value oracle or select strong-optimal lines.
import assert from "node:assert/strict";
const windows=(W,H,K)=>{
 const out=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [dc,dr,t] of [[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]]){
  const a=Array.from({length:K},(_,i)=>[c+i*dc,r+i*dr]);
  if(a.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))out.push({type:t,cells:a});
 }
 return out;
};
const intersect=(W,K)=>Array.from({length:W},(_,c)=>c).filter(c=>
 Array.from({length:W-K+1},(_,s)=>s).every(s=>s<=c&&c<s+K));
const phaseSafe=(W,K)=>{
 if(W<K||K<4)throw Error("only W>=K>=4");
 return Array.from({length:W},(_,c)=>c).filter(c=>{
  // Bulk infinite-height two-owner signed column-phase template after P0 c
  // For each P1 terminal K window possible in rows 0..K+3, verify it cannot
  // consist solely of P1-owned parity sites. All physical sites share identity.
  const H=K+4, p1=(x,r)=>((r%2)===(x===c?1:0));
  return windows(W,H,K).every(line=>!line.cells.every(([x,r])=>p1(x,r)));
 });
};
function data(W,H,K){
 const I=intersect(W,K),S=phaseSafe(W,K),L=windows(W,H,K),
 h=Math.max(0,H-K+1),w=Math.max(0,W-K+1),counts={H:0,V:0,R:0,F:0};
 for(const l of L)counts[l.type]++;
 assert.deepEqual(counts,{H:H*w,V:W*h,R:w*h,F:w*h});
 assert.deepEqual(S,I);
 const center=Math.floor((W-1)/2),stack=Array(H).fill(-1),occupied=H-1;
 for(let r=0;r<occupied;r++)stack[r]=r%2;
 const residual=[Array(5).fill(0),Array(5).fill(0)];
 const residualOrientation=[{H:0,V:0,R:0,F:0},{H:0,V:0,R:0,F:0}];
 for(const l of L){
  let label=[];
  for(const [c,r] of l.cells)label.push(c===center?stack[r]:-1);
  for(let p=0;p<2;p++)if(!label.includes(1-p)){
   const k=label.filter(z=>z<0).length;
   if(k>0){residual[p][k]++;if(k===3)residualOrientation[p][l.type]++;}
  }
 }
 const m=Math.floor(H/2),pair={J_initial:Math.floor((H-1)/2)+(W-1)*Math.floor(H/2),
 U_initial:(H-1)%2+(W-1)*(H%2),
 J_centerGate:(W-1)*Math.floor(H/2),U_centerGate:1+(W-1)*(H%2)};
 assert.equal(2*pair.J_initial+pair.U_initial,W*H-1);
 assert.equal(2*pair.J_centerGate+pair.U_centerGate,W*H-(H-1));
 const horizontalCenterCount=w>0?Array.from({length:w},(_,start)=>start).filter(s=>s<=center&&center<s+K).length:0;
 return {W,H,K,dimensionSignature:{KspanCommonCount:I.length,commonColumns:I,safeFixedFollowupOpenings:S,
 singleCommonCenter:I.length===1,twoCenterDefenseGeometricallyPossible:I.length>=2,
 diagonalEndpointTwist:(K-1)%2},lineCounts:{...counts,total:L.length},
 paired:pair,stackSource:{centerColumn: center,occupiedCenterPrefixLength:H-1,
 nextMover:(H-1)%2,centerP0Stones:Math.ceil((H-1)/2),
 centerP1Stones:Math.floor((H-1)/2),
 horizontalSpansThroughCenter:horizontalCenterCount,
 centerP0HorizontalThreeMissing:Math.ceil((H-1)/2)*horizontalCenterCount,
 survivingOriginalRequirementDegreeByOwner:{P0:residual[0].slice(1),P1:residual[1].slice(1)},
 originalDegree3ByOwnerOrientation:residualOrientation},
 addedRows2Winlines:{horizontal:2*w,vertical:2*W,diagonals:4*w,total:8*W-6*(K-1)}};
}
for(const K of [4,5,6])for(let W=K;W<=2*K+1;W++){
 let x=data(W,K+3,K);
 assert.equal(x.dimensionSignature.KspanCommonCount,Math.max(0,2*K-W));
}
const big=[];for(let H=4;H<=13;H++)for(let W=4;W<=12;W++)big.push(data(W,H,4));
console.log(JSON.stringify({schema:1,status:"SOURCE_GEOMETRY_ONLY",sampleRows:big.length,
 geometryK4:big,allKspanControls:[4,5,6].flatMap(K=>Array.from({length:K+2},(_,i)=>({K,W:K+i,commonCount:intersect(K+i,K).length,safeCount:phaseSafe(K+i,K).length})))},null,2));
