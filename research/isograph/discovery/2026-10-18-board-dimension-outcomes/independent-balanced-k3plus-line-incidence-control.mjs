// Independent geometric line-by-line falsifier for the frozen STATIC
// balanced K3+ stripe coloring theorem. Neither controller performs
// legal future strategic game search or computes perfect-play WDL.
import {createBalancedTerminalFreeK3PlusColoring} from './source-all-dimensions-balanced-k3plus-safe-coloring.mjs';
const DIRECTIONS=[[1,0],[0,1],[1,1],[1,-1]];
export function independentAllDimensionK3PlusColoringControl(){
 let totalCases=0,totalOriginalGeometricLines=0,oddWidths=0,
     specialH2Mod4=0,totalSquares=0,errors=[];
 const example=[];
 for(let W=1;W<=24;W++)for(let H=1;H<=24;H++)for(let K=3;K<=8;K++){
  const s=createBalancedTerminalFreeK3PlusColoring({width:W,height:H,connect:K});
  let nP0=0,nP1=0,lineCount=0,monoCount=0;
  for(const p of s.owner)if(p===0)nP0++;else nP1++;
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const [dx,dy] of DIRECTIONS){
   const endX=c+(K-1)*dx,endY=r+(K-1)*dy;
   if(endX<0||endX>=W||endY<0||endY>=H)continue;
   lineCount++;
   let p0=0,p1=0;
   for(let j=0;j<K;j++){
    const x=c+j*dx,y=r+j*dy,owner=s.owner[y*W+x];
    if(owner===0)p0++;else p1++;
   }
   if(p0===K||p1===K)monoCount++;
  }
  const expectedLines=H*Math.max(W-K+1,0)+W*Math.max(H-K+1,0)
   +2*Math.max(W-K+1,0)*Math.max(H-K+1,0);
  if(monoCount||nP0!==Math.ceil(W*H/2)||nP1!==Math.floor(W*H/2)
     ||lineCount!==expectedLines||nP0!==s.counters.n0||nP1!==s.counters.n1){
   errors.push({W,H,K,nP0,nP1,lineCount,monoCount,expectedLines});
  }
  totalCases++;totalOriginalGeometricLines+=lineCount;totalSquares+=W*H;
  if(W&1)oddWidths++;
  if((W&1)&&(H%4===2))specialH2Mod4++;
  if((W===7&&H===6&&K===4)||(W===6&&H===4&&K===4)||(W===5&&H===6&&K===3))
   example.push({W,H,K,nP0,nP1,rowPhaseOffset:s.rowPhaseOffset,
    totalOriginalGeometricLines:lineCount,monoCount});
 }
 // Negative: failure to adjust row phase when odd W and H=4m+2.
 const W=5,H=6,owner=new Uint8Array(W*H);
 let wrong0=0;
 for(let r=0;r<H;r++)for(let c=0;c<W;c++){
  const p=(c&1)^((r%4)>>1);
  owner[r*W+c]=p;if(p===0)wrong0++;
 }
 return {status:errors.length?'UNIVERSAL_K3PLUS_STATIC_COLORING_FALSIFIED':'SOURCE_GEOMETRY_K3PLUS_BALANCED_COLORING_PASS',
   totalCases,totalSquares,totalOriginalGeometricLines,
   oddWidths,specialH2Mod4,errors:errors.slice(0,20),selectedChecks:example,
   brokenUnshiftedH6W5Negative:{W,H,rawP0Count:wrong0,neededP0Count:Math.ceil(W*H/2),
    detectsMissingOddW_Hmod4_2_phaseCorrection:wrong0!==Math.ceil(W*H/2)},
   futureGameStatesValued:0,perfectPlayWDLQueries:0};
}
