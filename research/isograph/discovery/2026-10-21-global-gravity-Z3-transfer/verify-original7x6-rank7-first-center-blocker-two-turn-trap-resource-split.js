"use strict";
/**
 * Source-analytical original7x6 rank7=4214254, Player1 D to move.
 * Exact two-turn P1-first-column split for future P0 readiness:
 *
 * b1 !=4: P0 A1=c4r4 (sole grade2 fulfillment). Against ANY b2,
 * P0 A2 choice based ONLY on actual gravity h(c3):
 *    h3=0 -> P0 c3r1 => c3r3 READY trap.
 *    h3=1 -> P0 c6 (any safe other) => c3r3 READY trap.
 *    h3=2 -> P0 c3r3 FIRSTWINS original diagonal immediately.
 * No prior Player1 K4 (P1 sole grade2 source requirement has a
 * gravity support demand impossible in TWO P1 placements).
 *
 * b1 =4: P1 takes c4r4 and blocks source sole grade2. All source
 * grade3 ready traps after two new P0 stones require exactly two
 * P1 support cells NONE at c4r4; thus first D c4 kills every grade3
 * possibility by rank11. Initial grade>=3 cannot FIRSTWIN with
 * only two new P0 claims. This only falsifies SHORT ready-trap field
 * formation; it is NOT a Player1 WLD win/draw.
 *
 * Counts exactly 42 local b1/b2 source proof controls (not child WLD),
 * static 14*3 potential source grade3 supports and a few named physical
 * first-c4 negative checks, with original69 K4 and independent rays.
 */
const ok=(v,m)=>{if(!v)throw Error("C4_FIRST_C4_RESOURCE_SPLIT "+m);};
const W=7,H=6,dirs=[["H",1,0],["V",0,1],["R",1,1],["F",1,-1]];
const lines=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const[type,dx,dy]of dirs){
 const cells=[];for(let j=0;j<4;j++){
  const x=c+j*dx,y=r+j*dy;
  if(x<0||x>=W||y<0||y>=H){cells.length=0;break;}
  cells.push([x,y]);
 }
 if(cells.length===4)lines.push({type,cells});
}
ok(lines.length===69,"original 69 K4");
const inv=Object.fromEntries(["H","V","R","F"].map(x=>[x,lines.filter(L=>L.type===x).length]));
ok(JSON.stringify(inv)===JSON.stringify({H:24,V:21,R:12,F:12}),"original K4 orientation");
const site=(c,r)=>r*W+c;
const source=()=>({h:Array(7).fill(0),b:Array.from({length:7},()=>Array(6).fill(-1))});
const cp=q=>({h:q.h.slice(),b:q.b.map(a=>a.slice())});
const physicalWin=(q,p)=>lines.some(L=>L.cells.every(([c,r])=>q.b[c][r]===p));
const ray=(q,c,r,p)=>{
 for(const[type,dx,dy]of dirs) {
  let n=1;for(const sgn of [-1,1])for(let k=1;k<4;k++){
   const x=c+sgn*dx*k,y=r+sgn*dy*k;
   if(x<0||x>=W||y<0||y>=H||q.b[x][y]!==p)break;n++;
  }
  if(n>=4)return true;
 }
 return false;
};
function move(q,c1,p){
 const c=c1-1,r=q.h[c];
 if(r>=H)return null;
 q.h[c]++;q.b[c][r]=p;
 const w=physicalWin(q,p);
 ok(w===ray(q,c,r,p),"original69 physical K4 vs independent ray");
 return{c:c1,row:r+1,owner:p,firstwin:w};
}
const initial=source(),prefix="4214254";
for(let k=0;k<prefix.length;k++)ok(!move(initial,+prefix[k],k&1).firstwin,"legal firstwinfree rank7");
ok(initial.h.join(",")==="1,2,0,3,1,0,0","source h exact");
function minWSL(q,p){
 const U=[];
 for(const L of lines){
  if(L.cells.some(([c,r])=>q.b[c][r]===1-p))continue;
  const missing=L.cells.filter(([c,r])=>q.b[c][r]===-1);
  if(missing.length)U.push({G:missing,L});
 }
 const uniq=[...new Map(U.map(x=>[x.G.map(site).sort((a,b)=>a-b).join(","),x])).values()];
 return uniq.filter(x=>!uniq.some(y=>y.G.length<x.G.length&&y.G.every(v=>x.G.some(w=>site(w[0],w[1])===site(v[0],v[1])))));
}
const A=minWSL(initial,0),D=minWSL(initial,1),AGrades={},DGrades={};
for(const z of A)AGrades[z.G.length]=(AGrades[z.G.length]||0)+1;
for(const z of D)DGrades[z.G.length]=(DGrades[z.G.length]||0)+1;
ok(JSON.stringify(AGrades)===JSON.stringify({"2":1,"3":14,"4":33}),"source A grades2:1,3:14,4:33");
const oneA=A.filter(x=>x.G.length===2);
ok(oneA.length===1&&oneA[0].G.map(([c,r])=>[c+1,r+1].join(",")).sort().join("|")==="3,3|4,4",
 "sole P0 source grade2 {c3r3,c4r4}");
const soleD2=D.filter(x=>x.G.length===2);
ok(soleD2.length===1&&soleD2[0].G.map(([c,r])=>[c+1,r+1].join(",")).sort().join("|")==="2,4|3,3",
 "sole P1 source grade2 {c2r4,c3r3}");
const Dsupport=(function(){
 const demands=[...soleD2[0].G].map(([c,r])=>{
  const cells=[];for(let u=initial.h[c];u<=r;u++)cells.push([c,u]);
  return cells;
 });
 const union=[...new Map(demands.flat().map(v=>[site(v[0],v[1]),v])).values()];
 // Even if D's other player A could support source K4, the proposed A1 c4
 // does not fill any of these missing gravity column prefix cells.
 ok(union.length===5&&union.every(([c])=>c!==3),"P1 grade2 potential winner needs five actual new physical sites in c2/c3 and no P0 c4 support");
 return union;
})();
// P1 has only two placements through rank10; with P0 first A1 c4,
// it cannot occupy both its source grade2 missing sites, which moreover
// have at least FIVE missing column-prefix physical support cells.
const liveControls=[],branchCounts={ready:0,firstwin:0},byFirst={};
for(let b1=1;b1<=W;b1++){
 if(b1===4)continue;
 const q8=cp(initial),D1=move(q8,b1,1);
 ok(D1&&!D1.firstwin,"no P1 winning on first move");
 const A1=move(q8,4,0);
 ok(A1&&!A1.firstwin&&A1.row===4,"P0 c4r4 sole grade2 fulfillment");
 const row=[];
 for(let b2=1;b2<=W;b2++){
  const q10=cp(q8),D2=move(q10,b2,1);
  ok(D2&&!D2.firstwin,"no P1 firstwinner through rank10 by source grade2 support bound");
  const h3=q10.h[2];
  ok(h3>=0&&h3<=2,"two D moves only can occupy c3 at most twice");
  const a2=h3===1?6:3;
  const P0=move(q10,a2,0);
  ok(Boolean(P0),"P0 stated response always gravity legal");
  let got=0;
  const proof={b1,b2,h3PriorToSecondP0:h3,P0FirstActionColumn:4,P0SecondActionColumn:a2,
    sourceActualActionWord:prefix+b1+4+b2+a2,certification:null};
  if(h3===2){
   ok(P0.firstwin&&P0.c===3&&P0.row===3,
    "P0 c3r3 FIRSTWINS true source diagonal when D supported it twice");
   proof.certification="P0_FIRSTWIN_R_C1R1_C2R2_C3R3_C4R4";
   branchCounts.firstwin++;
  }else {
   ok(!P0.firstwin&&q10.h[2]===1,"P0 leaves a live ready c3r3 trap with h3 exactly1");
   const min=minWSL(q10,0);
   const ready=min.some(x=>x.G.length===1&&x.G[0][0]===2&&x.G[0][1]===2);
   ok(ready,"source sole diagonal grade2 shrinks to singleton c3r3");
   proof.certification="LIVE_READY_P0_C3R3_TRAP_ONE_ABOVE_C3R2";
   branchCounts.ready++;
  }
  liveControls.push(proof);row.push(proof.certification);
 }
 byFirst[b1]=row;
}
ok(liveControls.length===42&&branchCounts.firstwin+branchCounts.ready===42,
 "all six source b1 noncenter cases, all seven second D choices");

const grade3=A.filter(x=>x.G.length===3);
let sourceGrade3TargetChoices=0,eligible=0,eligibleDpackages=[];
for(const [j,item] of grade3.entries())for(let k=0;k<3;k++){
 const target=item.G[k],F=item.G.filter((v,i)=>i!==k),[c,r]=target;
 const targetFinalH=r-1;
 let guard=targetFinalH>=0&&initial.h[c]<=targetFinalH;
 if(F.some(([cc,rr])=>cc===c&&rr>=targetFinalH))guard=false;
 const required=new Map();
 if(guard){
  for(const[cc,rr]of F)for(let level=initial.h[cc];level<=rr;level++)required.set(site(cc,level),[cc,level]);
  for(let level=initial.h[c];level<targetFinalH;level++)required.set(site(c,level),[c,level]);
 }
 const ownF=new Set(F.map(([cc,rr])=>site(cc,rr)));
 const requiredD=[...required].filter(([id])=>!ownF.has(id)).map(([id,v])=>v);
 const valid=guard&&F.every(v=>required.has(site(v[0],v[1])))&&requiredD.length<=2&&required.size<=4;
 sourceGrade3TargetChoices++;
 if(valid){
  ok(requiredD.length===2&&requiredD.every(([cc,rr])=>cc!==3),
   "EVERY feasible grade3 two-turn P0 trap consumes both P1 supporting site placements at columns != c4");
  eligible++;
  eligibleDpackages.push({sourceK4:item.L.type,
   target:[c+1,r+1],DrequiredSites:requiredD.map(([cc,rr])=>[cc+1,rr+1]),
   ArequiredSites:F.map(([cc,rr])=>[cc+1,rr+1])});
 }
}
ok(sourceGrade3TargetChoices===42&&eligible===7,
 "independent reconstructed seven source grade3 possible ready traps");
const sourceP1b4=cp(initial);
const firstCenterBlock=move(sourceP1b4,4,1);
ok(!firstCenterBlock.firstwin&&firstCenterBlock.row===4&&sourceP1b4.b[3][3]===1,
 "P1 first c4 permanently blocks sole original grade2 P0 R diagonal");
const namedCenterBlocked=[
 [3,3,5],[4,3,6],[2,1,1],[6,7,6],[5,3,2]
];
const negativeControls=[];
for(const [Acol,Dcol,Alast]of namedCenterBlocked){
 const t=cp(sourceP1b4);
 const first=move(t,Acol,0);
 ok(first&&!first.firstwin,"source q7 A cannot firstwin in one placement");
 const second=move(t,Dcol,1);
 if(!second){continue;}
 if(second.firstwin){negativeControls.push({Acol,Dcol,Alast,observedPriorP1Win:true});continue;}
 const last=move(t,Alast,0);
 if(!last)continue;
 ok(!last.firstwin,"P1 c4 source blocks all original P0 firstwin before two own placements");
 const after=minWSL(t,0),ready=[];
 for(let c=0;c<W;c++)if(t.h[c]+1<H&&after.some(x=>x.G.length===1&&x.G[0][0]===c&&x.G[0][1]===t.h[c]+1))ready.push(c+1);
 ok(ready.length===0,"no P0 READY trap after first P1 c4 under source support grade gates");
 negativeControls.push({P0FirstColumn:Acol,P1SecondColumn:Dcol,P0SecondColumn:Alast,
  firstWinner:null,P0ReadyTrapColumns:ready});
}
ok(negativeControls.length===5,"five literal first-P1-center negative source controls");
const report={
 schema:"c4.original7x6_rank7_two_turn_c4blocker_selfsupport_split.v1",
 status:"EXACT_ORIGINAL7X6_RANK7_NONCENTER_P1_FORCES_P0_TRAP_OR_WIN_WITHIN_2A_AND_P1_C4_BLOCKS_ALL_BY_R11",
 source:{genuineOriginal7x6Rank7Word:prefix,P1ToMove:true,heights:initial.h,
  P0SourceMinWSLGrades:AGrades,P1SourceMinWSLGrades:DGrades,
  P0UniqueGrade2:[[3,3],[4,4]],
  P1UniqueGrade2:[[3,3],[2,4]],
  P1Grade2PhysicalMandatorySupportCells:Dsupport.map(([c,r])=>[c+1,r+1])},
 noncenterP1SourceFormation:{
  fixedP0FirstReply:4,sourceP0OwnsC4R4:true,
  subsequentP0ResponseByC3Height:"If h3=0 then P0 c3r1; if h3=1 then P0 c6 (leaves h3=1); if h3=2 then P0 c3r3 FIRSTWINS",
  allP1NoncenterFirstChoices:6,allP1SecondChoices:7,
  localTrueOriginalK4AndRayTestedSourceCases:42,
  resultCounts:branchCounts,sourceControls:liveControls,
  uniformProof:"Source P0 grade2 sole R requirement is {c3r3,c4r4}. If P1 b1!=c4, P0 owns c4r4 at rank9. Only P1 first/second moves can add 0,1 or2 c3 support cells. P0 second move adapts solely to actual height c3 and yields h3=1 READY P0 c3r3 trap or actual immediate c3r3 R FIRSTWIN. P1 cannot firstwin by rank10 because its only grade2 SOURCE residual c2r4/c3r3 would need >=5 new original column-prefix cells while P1 has only2 and P0 first reply c4 cannot supply any."},
 firstP1CenterBlock:{
  firstP1Column:4,actualP1C4R4:true,
  blocksOnlyP0SourceGrade2:true,
  grade1SourceP0Masks:0,
  grade3SourceCandidateAndTargetPairs:sourceGrade3TargetChoices,
  staticPhysicallyFeasibleGrade3ReadyTrapsForTwoPOwnPlacements:eligible,
  grade3AllFeasibleResourcePatterns:eligibleDpackages,
  P1SupportsRequiredForEveryFeasibleGrade3Trap:2,
  anyGrade3SupportUsesP1C4R4:false,
  necessaryProof:"D1=c4r4 consumes one of two D support placements, all seven feasible grade3 ready trap candidates require TWO different physical D support cells with neither c4r4. The P0 source sole grade2 is D-blocked; source grade1 absent; source grade4 cannot shrink to singleton or produce P0 FIRSTWIN with only two A own placements. Therefore NO P0 READY terminal trap and NO P0 FIRSTWIN through its rank11 turn under any legal continuations from this b1.",
  namedOriginalPhysicalNegativeControls:negativeControls,
  actualWLDFromAllTheseStates:"UNKNOWN - no ready-trap/quick-firstwin proof does not imply P1 draws/wins"},
 epistemic:{completeGameTreeNotEnumerated:true,
  twoTurnLocalSourceChecksNotFutureStrategicValueQueries:true,
  rank7ActualPerfectPlayWLD:"UNPROVED",
  noKnownSolvedOracleValues:true,subfiveBoardRefutations:"NONE",
  maintainedCI:"NOT_RUN",externalFormalProver:"NOT_RUN"}
};
console.log(JSON.stringify(report,null,2));