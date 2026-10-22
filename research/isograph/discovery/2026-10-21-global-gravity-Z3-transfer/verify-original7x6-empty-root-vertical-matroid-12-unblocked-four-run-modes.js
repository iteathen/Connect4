/**
 * Original EMPTY 7x6 source WSL vs same-column upper-mate P1 response policy.
 * No real game positions enumerated: 69 physical K4 windows, 128 seven-bit
 * abstract row words, and ONE genuine seven-ply policy path for falsification.
 * node verify-original7x6-empty-root-vertical-matroid-12-unblocked-four-run-modes.js
 */
"use strict";
const ok=(yes,msg)=>{if(!yes)throw Error("C4_ROOT_12 "+msg);};
const W=7,H=6,dirs=[[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]],K=4;
const lines=[];
for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const[dc,dr,d]of dirs){
 const cells=[];for(let i=0;i<K;i++){
  const x=c+i*dc,y=r+i*dr;
  if(x<0||x>=W||y<0||y>=H){cells.length=0;break;}
  cells.push([x,y]);
 }
 if(cells.length===4)lines.push({d,cells});
}
ok(lines.length===69,"original69 physical K4");
const totals=Object.fromEntries(dirs.map(x=>[x[2],lines.filter(L=>L.d===x[2]).length]));
ok(JSON.stringify(totals)===JSON.stringify({H:24,V:21,R:12,F:12}),"physical original direction counts");
const originalEmptyA=lines.length; // all original 4-site masks distinct/minimal
const upperMatroidFreeSite=(c,r)=>(r%2)===0; // JS row 0,2,4 = physical row1,3,5
const nullity=L=>L.cells.filter(([c,r])=>!upperMatroidFreeSite(c,r)).length;
const gaps={},surviving=[],directionsInFree=[];
for(const L of lines){
 const gap=nullity(L);
 gaps[gap]=(gaps[gap]||0)+1;
 if(gap===0){surviving.push(L.cells.map(([c,r])=>[c+1,r+1]));directionsInFree.push(L.d);}
}
ok(JSON.stringify(gaps)===JSON.stringify({"0":12,"2":45,"4":12}),"source nullity histogram");
ok(surviving.length===12&&directionsInFree.every(x=>x==="H"),"only 12 odd physical-row H4 source monomials");
for(const row of [1,3,5])for(let start=1;start<=4;start++){
 const expected=Array.from({length:4},(_,i)=>[start+i,row]);
 ok(surviving.some(L=>L.length===4&&L.every((p,i)=>p[0]===expected[i][0]&&p[1]===expected[i][1])),"all original odd-row horizontal starts");
}
function noFour(m){return ((m&(m>>1)&(m>>2)&(m>>3))===0);}
let legalWords=0;const endings=[0,0,0,0,0,0,0,0];
for(let x=0;x<128;x++)if(noFour(x)){legalWords++;endings[7]++;}
ok(legalWords===108&&128-legalWords===20,"exact one-row Fibonacci-4 complement");
const dp=Array.from({length:8},()=>Array(8).fill(0));
dp[0][0]=1;
for(let col=0;col<7;col++)for(let hist=0;hist<8;hist++)if(dp[col][hist]){
 for(const bit of [0,1]){
  if(bit&&hist===7)continue; // last three already all1; a fourth 1 forbidden
  dp[col+1][((hist<<1)|bit)&7]+=dp[col][hist];
 }
}
const transfer=dp[7].reduce((a,b)=>a+b,0);
ok(transfer===108,"independent 3-bit automaton exact");
const power3=transfer**3,configs=2**21,hasAnyFour=configs-power3;
ok(power3===1259712&&hasAnyFour===837440,"3 row factor partition");
const bd=Array.from({length:W},()=>Array(H).fill(-1)),heights=Array(W).fill(0);
function literalWin(p){return lines.some(L=>L.cells.every(([c,r])=>bd[c][r]===p));}
function ray(c,r,p){
 for(const[dx,dy]of dirs){
  let n=1;for(const sg of [-1,1])for(let k=1;k<4;k++){
   const x=c+sg*k*dx,y=r+sg*k*dy;
   if(x<0||x>=W||y<0||y>=H||bd[x][y]!==p)break;
   n++;
  }if(n>=4)return true;
 }
 return false;
}
const word="1122334",plyLog=[];
for(let k=0;k<word.length;k++){
 const c=+word[k]-1,p=k&1,row=heights[c];
 ok(row<H,"genuine gravity placement");
 heights[c]++;bd[c][row]=p;
 const won=literalWin(p);
 ok(won===ray(c,row,p),"69 original K4 and independent ray winner agree");
 ok(won===(k===6),"firstwinner must occur at P0 ply7 only");
 plyLog.push({move:k+1,player:p,column:c+1,row:row+1,firstwins:won});
}
let parityControls=0;
for(let a=0;a<7;a++)for(let b=0;b<7;b++){
 // From EMPTY P0 in a then P1 in b; same-column reply lands row2.
 const heights=Array(7).fill(0);heights[a]++;heights[b]++;
 const odd=heights.flatMap((n,i)=>n%2?[i]:[]);
 if(a===b)ok(odd.length===0,"same-column even parity");
 else ok(odd.length===2&&odd.includes(a)&&odd.includes(b),"two-column GF2 phase dipole");
 parityControls++;
}
const report={
 schema:"c4.original7x6_empty_root_vertical_mate_field_modes.v1",
 status:"EXACT_12_UNBLOCKED_HORIZONTAL_ROOT_WSL_MODES_AND_GF2_CROSS_RESPONSE_DIPOLE",
 geometry:"original physical 7x6-k4",original69:totals,
 sourcePlies:0,sourceNormalizedP0Requirements:originalEmptyA,sourceTrapColumns:0,
 exampleStaticRespondentPolicy:"P1 same-column immediate upper-mate from all-even columns, NOT an optimal/robust strategy",
 sourceMatroidFreeSites21:"physical rows 1,3,5; seven columns each",
 residualNullityHistogram:gaps,rootTropicalGamma:0,
 projectedUnblockedRootWSLMonomials:surviving,
 rowAutomaton:{alphabet:"binary hypothetical P0 owner per physical odd row",length:7,forbiddenRunLength:4,staticNoFourConfigurationsPerRow:transfer,totalSevenBitWords:128,wordsContainingFour:20},
 threeRowIndependentProjection:{staticP0FutureOwnerCells:21,allStaticBitAssignments:configs,withNoFourInAnyOddRow:power3,withFourInAtLeastOneOddRow:hasAnyFour},
 fixedPolicyP0WinPath:plyLog,GF2TwoMoveDistinctColumnPhaseChecks:parityControls,
 sourcePolicyNoGeneralWDLInference:true,legalGamePositionsEnumerated:0,perfectPlayRootValueDerived:false,CI:"NOT_RUN"
};
console.log(JSON.stringify(report,null,2));