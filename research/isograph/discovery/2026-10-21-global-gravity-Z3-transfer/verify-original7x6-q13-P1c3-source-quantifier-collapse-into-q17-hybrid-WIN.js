"use strict";
/**
 * True original 7x6 source q13=4214254422333, P1 to move.
 * If P1 chooses c3r4, P0 chooses c1r2 and forces P1's next
 * exact original move either:
 *  D != c1r3 => P0 c1r3 FIRSTWINS H row3 c1..4;
 *  D == c1r3 => P0 c1r4 must block P1 H row4 c1..4,
 *               reaches q17 42142544223333111 proven P0-WIN
 *               by distinct checked-in hybrid horizontal/vertical
 *               online responder Γ=1 + terminal trap policy.
 *
 * The seven named D reply labels are checked as a finite source
 * proof-control of one Boolean/H4 action inequality, not recursively
 * valued child WLD positions. No solved/oracle input.
 */
const ck=(x,m)=>{if(!x)throw Error("C4_Q13_D3_COLLAPSE "+m)};
const W=7,H=6,directions=[[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]],all=[];
for(let r=0;r<6;r++)for(let c=0;c<7;c++)for(const[dx,dy,t]of directions){
 const cells=[];for(let i=0;i<4;i++){const x=c+i*dx,y=r+i*dy;if(x<0||x>=7||y<0||y>=6){cells.length=0;break;}cells.push([x,y])}
 if(cells.length===4)all.push({t,cells});
}
ck(all.length===69,"real69 windows");
const types=Object.fromEntries(["H","V","R","F"].map(t=>[t,all.filter(z=>z.t===t).length]));
ck(JSON.stringify(types)===JSON.stringify({H:24,V:21,R:12,F:12}),"original direction inventory");
const make=()=>({h:Array(7).fill(0),o:Array.from({length:7},()=>Array(6).fill(-1))});
const cp=q=>({h:q.h.slice(),o:q.o.map(z=>z.slice())});
const ends=(q,p)=>all.filter(z=>z.cells.every(([c,r])=>q.o[c][r]===p));
function ray(q,c,r,p){
 for(const[dx,dy]of directions){let n=1;for(const s of [-1,1])for(let k=1;k<4;k++){
  const x=c+s*dx*k,y=r+s*dy*k;
  if(x<0||x>=7||y<0||y>=6||q.o[x][y]!==p)break;n++;
 }if(n>=4)return true;}
 return false;
}
function play(q,column,p){
 const c=column-1,r=q.h[c];ck(r<6,"true gravity legal");
 q.h[c]++;q.o[c][r]=p;
 const winner=ends(q,p);ck(Boolean(winner.length)===ray(q,c,r,p),"original win ray check");
 return {col:column,row:r+1,p,firstwinner:winner.length>0,
  originalWinningLines:winner.map(z=>({direction:z.t,cells:z.cells.map(([c,r])=>[c+1,r+1])}))};
}
function immediately(q,p){
 const choices=[];
 for(let c=0;c<7;c++)if(q.h[c]<6){
  const row=q.h[c];
  if(all.some(z=>z.cells.some(([cc,rr])=>cc===c&&rr===row)
    &&z.cells.every(([cc,rr])=>(cc===c&&rr===row)||q.o[cc][rr]===p)))choices.push(c+1);
 }
 return choices;
}
const q13=make(),source="4214254422333";
for(let i=0;i<source.length;i++)ck(!play(q13,+source[i],i&1).firstwinner,"q13 original firstwinnerfree prefix");
ck(q13.h.join(",")==="1,4,3,4,1,0,0","source q13 support");
const q14=cp(q13),P1first=play(q14,3,1);
ck(!P1first.firstwinner&&P1first.row===4,"P1 q13 c3r4 legal/firstwinnerfree");
const q15=cp(q14),P0chosen=play(q15,1,0);
ck(!P0chosen.firstwinner&&P0chosen.row===2,"P0 c1r2 primes row3");
const Dthreat=immediately(q15,1),Athreat=immediately(q15,0);
ck(Dthreat.length===0&&Athreat.join(",")==="1",
 "P1 has no immediate source firstwinning and P0 only immediate c1r3");
const controls=[];
for(let Dcolumn=1;Dcolumn<=7;Dcolumn++){
 const next=cp(q15);
 const D=play(next,Dcolumn,1);
 ck(!D.firstwinner,"P1 has no current immediate win from q15 source");
 let A,kind;
 if(Dcolumn!==1){
  A=play(next,1,0);
  ck(A.firstwinner&&A.row===3,"P0 immediately FIRSTWINS H row3 after every nonblocking P1 response");
  ck(A.originalWinningLines.some(L=>L.direction==="H"&&L.cells.map(x=>x.join(",")).join("|")==="1,3|2,3|3,3|4,3"),
   "original true lower H4 row3 wins");
  kind="P0_FIRSTWIN_AT_RANK17";
 }else{
  ck(D.row===3&&immediately(next,1).join(",")==="1"&&immediately(next,0).length===0,
   "P1 mandatory c1r3 blocking move exposes immediate P1 upper c1r4 and no P0 current win");
  A=play(next,1,0);
  ck(!A.firstwinner&&A.row===4,"P0 must counterblock P1 H4 upper");
  ck(next.h.join(",")==="4,4,4,4,1,0,0","q17 real source support after forced ladder");
  kind="EXACT_Q17_GUARDED_P0_WIN_SOURCE";
 }
 controls.push({DsecondColumn:Dcolumn,Dplay:D,P0forcedAction:A,
  outcomeBySource:kind,history:source+"3"+"1"+Dcolumn+"1"});
}
ck(controls.length===7&&controls.filter(x=>x.outcomeBySource==="P0_FIRSTWIN_AT_RANK17").length===6,
 "six equivalent immediate P0 source wins, one certified nonterminal q17");
ck(controls.find(x=>x.DsecondColumn===1).history==="42142544223333111",
 "the one nonterminal source is exactly previously qualified q17");
const verdict={
 schema:"c4.original7x6_q13_P1c3_guarded_respondent_WIN_v1",
 status:"EXACT_Q13_P1_C3_SOURCE_P0_WIN_VIA_ONE_BOOLEAN_FORKED_THREAT_LADDER_TO_HYBRID_Q17",
 originalGeometry:types,
 q13Source:{word:source,ply:13,toMove:"P1",heights:q13.h},
 opponentNamedFirstAction:{column:3,physical:P1first},
 P0NextChosenAction:{column:1,physical:P0chosen,
  sourceImmediatelyPlayableP0WinningColumns:Athreat,sourceP1ImmediateWinningColumns:Dthreat},
 sevenP1SecondSourceActionControls:controls,
 exactQuantifiedProof:"On live original q13, if D first c3r4 then A c1r2 creates an original current H row3 P0 firstwin c1r3. P1 has no immediate firstwin of its own, so any reply NOT c1r3 permits A immediate firstwin c1r3. The only legal block c1r3 produces a current original P1 H row4 c1r4 firstwinner; A must own c1r4 to prevent it, reaching q17. q17 is independently proven P0 WIN by single heterogeneous H/V online response-matroid Γ=1 and terminal trap, not by child state game-value calls. Thus this restricted P1 q13 first move c3 is forced P0-WIN.",
 sourceQ17PriorHybridTheorem:"research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/verify-original7x6-q17-hybrid-vertical-horizontal-online-matroid.js",
 sourceQ17CurrentResult:"P0 WIN by sound online matroid with source original69 independent residuals all dependent, h-based legality and terminal progress",
 restriction:"P1 first action at q13 is FIXED c3; other q13 P1 choices require separate source proof; no original EMPTY WLD",
 zeroStrategicChildValueCalls:true,wholeGameStateSpaceNotEnumerated:true,
 previousSolvedOracleNotUsed:true,maintainedCI:"NOT_RUN"};
console.log(JSON.stringify(verdict,null,2));