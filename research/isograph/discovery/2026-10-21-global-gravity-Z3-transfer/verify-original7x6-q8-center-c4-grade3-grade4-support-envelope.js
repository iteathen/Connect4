"use strict";
/**
 * Original W7H6 K4 center-first q8 source = 42142544, P0 to move.
 * P1 took c4r4 and blocked the only original q7 P0 grade2 diagonal.
 * Exact source support lower-bound (NOT strategic game search):
 *  - any P0 FIRSTWIN by its third own action at rank13 must derive
 *    from a source MINIMAL grade3 K4, all 3 missing cells P0-owned;
 *  - any source MINIMAL grade4 READY trap at rank13 must have P0
 *    claiming its three non-target cells, leaving y exactly one row
 *    above next physical frontier after exactly two P1 placements.
 * Check support prefix resource count and 3A/2D event chronology,
 * genuine original69 literal winning lines, independent physical rays.
 * NO child WLD evaluation, no game tree / solved labels / small boards.
 */
const ok=(v,msg)=>{if(!v)throw Error("C4_Q8_SUPPORT "+msg)};
const W=7,H=6,dirs=[["H",1,0],["V",0,1],["R",1,1],["F",1,-1]],windows=[];
for(const [type,dx,dy] of dirs)for(let c=0;c<W;c++)for(let r=0;r<H;r++){
 const a=[];for(let i=0;i<4;i++){
  const x=c+i*dx,y=r+i*dy;
  if(x<0||x>=W||y<0||y>=H){a.length=0;break;}
  a.push([x,y]);
 }
 if(a.length===4)windows.push({type,cells:a});
}
ok(windows.length===69,"true original 69 physical K4");
const inventory=Object.fromEntries(["H","V","R","F"].map(n=>[n,windows.filter(x=>x.type===n).length]));
ok(JSON.stringify(inventory)===JSON.stringify({H:24,V:21,R:12,F:12}),"original K4 orientation");
const newBoard=()=>({h:Array(W).fill(0),cells:Array.from({length:W},()=>Array(H).fill(-1))});
const clone=q=>({h:q.h.slice(),cells:q.cells.map(v=>v.slice())});
function win(q,p){return windows.some(L=>L.cells.every(([c,r])=>q.cells[c][r]===p));}
function ray(q,c,r,p){
 for(const [_,dx,dy]of dirs){
  let n=1;
  for(const sign of [-1,1])for(let k=1;k<4;k++){
   const x=c+sign*dx*k,y=r+sign*dy*k;
   if(x<0||x>=W||y<0||y>=H||q.cells[x][y]!==p)break;
   n++;
  }
  if(n>=4)return true;
 }
 return false;
}
function move(q,col,p){
 const c=col-1,r=q.h[c];if(r>=H)return null;
 q.h[c]++;q.cells[c][r]=p;
 const winner=win(q,p);
 ok(winner===ray(q,c,r,p),"69 K4 vs independent physical ray");
 return {c,r,p,firstWin:winner};
}
const initial=newBoard(),prefix="42142544",initialTrace=[];
for(let i=0;i<prefix.length;i++){
 const ev=move(initial,Number(prefix[i]),i%2);
 ok(ev&&!ev.firstWin,"genuine firstwin-free original source prefix");
 initialTrace.push(ev);
}
ok(initial.h.join(",")==="1,2,0,4,1,0,0","q8 actual support");
ok(initial.cells[3][3]===1,"P1 actual center blocker c4r4");
function minimum(q,p){
 const raw=[];
 for(const L of windows){
  if(L.cells.some(([c,r])=>q.cells[c][r]===1-p))continue;
  const G=L.cells.filter(([c,r])=>q.cells[c][r]===-1);
  if(G.length)raw.push({G,L});
 }
 const id=([c,r])=>r*W+c;
 const U=[...new Map(raw.map(o=>[o.G.map(id).sort((a,b)=>a-b).join(","),o])).values()];
 return U.filter(a=>!U.some(b=>b.G.length<a.G.length&&b.G.every(x=>a.G.some(y=>id(x)===id(y)))));
}
const A=minimum(initial,0),bySize={};
for(const g of A)bySize[g.G.length]=(bySize[g.G.length]||0)+1;
ok(A.length===39&&JSON.stringify(bySize)===JSON.stringify({"3":13,"4":26}),"q8 source 13 grade3 +26 grade4, none of grade1/2");
const sId=([c,r])=>r*W+c,out=([c,r])=>[c+1,r+1];
function requiredPrefixes(F,y){
 const guards={};
 if(y){
  const [c,r]=y,requiredFinalHeight=r-1;
  if(requiredFinalHeight<0||initial.h[c]>requiredFinalHeight)return null;
  // y and the cell immediately below y must still be empty.
  if(F.some(([fc,fr])=>fc===c&&fr>=requiredFinalHeight))return null;
 }
 const required=new Map();
 for(const[c,r]of F){
  if(r<initial.h[c])return null;
  for(let rr=initial.h[c];rr<=r;rr++)required.set(sId([c,rr]),[c,rr]);
 }
 if(y){
  const[c,r]=y,finalHeight=r-1;
  for(let rr=initial.h[c];rr<finalHeight;rr++)required.set(sId([c,rr]),[c,rr]);
 }
 const aids=new Set(F.map(sId));
 const Ds=[...required].filter(([id])=>!aids.has(id)).map(([id,s])=>s);
 return {required:[...required.values()],Ds};
}
function permutations(xs){
 if(xs.length===0)return [[]];
 const ret=[];
 for(let i=0;i<xs.length;i++)for(const suffix of permutations(xs.filter((_,j)=>j!==i)))ret.push([xs[i],...suffix]);
 return ret;
}
function replayScheduled(Aorder,Dorder,mode,y){
 const q=clone(initial),events=[];
 for(let i=0;i<5;i++){
  const p=i%2===0?0:1;
  const expected=p===0?Aorder[i/2]:Dorder[(i-1)/2];
  const ev=move(q,expected[0]+1,p);
  if(!ev||ev.c!==expected[0]||ev.r!==expected[1])return null;
  events.push(ev);
  if(ev.firstWin){
   if(mode==="A_FIRSTWIN"&&i===4&&p===0)return {q,events,firstWin:true};
   return null;
  }
 }
 if(mode==="A_FIRSTWIN")return null;
 const[c,r]=y;
 if(q.h[c]!==r-1||q.cells[c][r]!==-1)return null;
 const field=minimum(q,0);
 if(!field.some(G=>G.G.length===1&&G.G[0][0]===c&&G.G[0][1]===r))return null;
 return {q,events,firstWin:false};
}
const grades3=A.filter(g=>g.G.length===3),grades4=A.filter(g=>g.G.length===4);
let g3SupportEligible=0,g4SupportEligible=0,eventRoleOrderControls=0,g3Legal=0,g4Legal=0;
const g3=[],g4=[];
const dummyD=[[5,0],[6,0]];
for(const G of grades3){
 const prefixReq=requiredPrefixes(G.G,null);
 if(!prefixReq||prefixReq.Ds.length>2||prefixReq.required.length>5)continue;
 g3SupportEligible++;
 let proven=null;
 const Ds=prefixReq.Ds.slice();
 // If D support is not needed, choose harmless frontier filler
 // sites in c6/c7, one per P1 turn. Those are source-local controls.
 for(const filler of dummyD)if(Ds.length<2&&!Ds.some(x=>sId(x)===sId(filler)))Ds.push(filler);
 if(Ds.length!==2)throw Error("could not choose two safe D controls");
 for(const ao of permutations(G.G))for(const di of permutations(Ds)){
  eventRoleOrderControls++;
  const p=replayScheduled(ao,di,"A_FIRSTWIN",null);
  if(p){g3Legal++;if(!proven)proven=p;}
 }
 g3.push({K4type:G.L.type,originalK4:G.L.cells.map(out),P0sourceMissing:G.G.map(out),
  minimumDsupport:prefixReq.Ds.map(out),oneLegalRank13FirstwinnerWord:proven?prefix+proven.events.map(x=>x.c+1).join(""):null,
  trueOriginalPhysicalWitness:!!proven});
}
for(const G of grades4)for(const y of G.G){
 const F=G.G.filter(x=>x!==y),envelope=requiredPrefixes(F,y);
 if(!envelope||envelope.Ds.length>2||envelope.required.length>5)continue;
 g4SupportEligible++;
 let proven=null;
 const Ds=envelope.Ds.slice();
 for(const filler of dummyD)if(Ds.length<2&&!Ds.some(x=>sId(x)===sId(filler)))Ds.push(filler);
 if(Ds.length!==2)throw Error("unable to choose D support local controls");
 for(const ao of permutations(F))for(const di of permutations(Ds)){
  eventRoleOrderControls++;
  const p=replayScheduled(ao,di,"A_READY_TRAP",y);
  if(p){g4Legal++;if(!proven)proven=p;}
 }
 g4.push({K4type:G.L.type,originalK4:G.L.cells.map(out),
  trapTarget:out(y),P0requiredClaims:F.map(out),minimumDsupport:envelope.Ds.map(out),
  oneLegalRank13TrapFormationWord:proven?prefix+proven.events.map(x=>x.c+1).join(""):null,
  trueOriginalPhysicalWitness:!!proven});
}
ok(g3SupportEligible===2&&g4SupportEligible===1,"support-envelope source count two vertical wins and one diagonal ready trap");
ok(g3.every(x=>x.trueOriginalPhysicalWitness)&&g4.every(x=>x.trueOriginalPhysicalWitness),"every envelope source candidate admits one genuine event-order legal witness");
ok(g3.every(x=>x.K4type==="V"&&[1,2].includes(x.P0sourceMissing[0][0])),"two source vertical completion candidates c1 and c2");
ok(g4[0].K4type==="R"&&g4[0].trapTarget.join(",")==="3,4","one diagonal trap target c3r4");
const report={
 schema:"c4.original7x6_q8_center_block_hard_grade3grade4_source_envelopes.v1",
 status:"EXACT_CENTER_BLOCK_Q8_TWO_VERTICAL_GRADE3_WIN_AND_ONE_RISING_GRADE4_TRAP_SOURCE_ENVELOPES",
 board:"true original7x6 K4",lineInventory:inventory,
 source:{originalLegalFirstwinnerFreeHistory:prefix,playerToMove:"P0",heights:initial.h,
  P1C4R4Owner:true,P0minimumWSL:A.length,P0sourceGradeHistogram:bySize},
 methodology:"Static original source missing-site grade, column-prefix support budget with at most two D source support placements, and chronological D/A physical event order A,D,A,D,A checked only on at-most-five specified source events, no future WLD tree.",
 counts:{sourceGrade3Candidates:grades3.length,sourceGrade4Candidates:grades4.length,
  grade4SourceTargetCandidates:grades4.length*4,
  sourceGrade3DirectWinSupportEligible:g3SupportEligible,
  sourceGrade4ReadyTrapSupportEligible:g4SupportEligible,
  finiteEventRoleOrderChecks:eventRoleOrderControls,
  physicalLegalGrade3TerminalFirstwinEventSchedules:g3Legal,
  physicalLegalGrade4NonterminalReadyTrapEventSchedules:g4Legal},
 physicalSourceCandidates:{grade3DirectWIN:g3,grade4ReadyTrap:g4},
 epistemic:{provesAnyP0WinningPolicyFromQ8:false,
   noAdversarialP1UniversalClosure:true,
   noOriginalEmptyBoardWLD:true,
   localSupportPosetEventsNotStrategicHistoryWLD:true,
   noSolvedGameInput:true,noSubfiveGameBoardExperiments:true,
   maintainedNode26CI:"NOT_RUN",externalProofAssistant:"NOT_RUN"}
};
console.log(JSON.stringify(report,null,2));