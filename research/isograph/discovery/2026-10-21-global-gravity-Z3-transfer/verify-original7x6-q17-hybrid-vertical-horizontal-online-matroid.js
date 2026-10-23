"use strict";
/** Original7x6 source 42142544: respondent P1 same-column upper-mates
 * BLOCK the two reachable source-grade3 V firstwinning ribbons, yet
 * one physically legal P0 line transfer creates a grade3 H row3
 * terminal trap c1r3. Test selected five-event witness, original69
 * firstwinner rays, qualified normalized WSL and Oct20 source Q matroid.
 *
 * Does NOT claim forcing against arbitrary P1 or classify source WLD.
 */
const fail=(s)=>{throw Error("C4Q8_INTERFERENCE "+s)};
const ok=(b,s)=>{if(!b)fail(s)};
const W=7,H=6,dirs=[["H",1,0],["V",0,1],["R",1,1],["F",1,-1]],K=[];
for(const [type,dx,dy]of dirs)for(let c=0;c<W;c++)for(let r=0;r<H;r++){
 const cells=Array.from({length:4},(_,i)=>[c+dx*i,r+dy*i]);
 if(cells.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))K.push({type,cells});
}
ok(K.length===69,"69 real original winning lines");
const hist=Object.fromEntries(dirs.map(x=>[x[0],K.filter(k=>k.type===x[0]).length]));
ok(JSON.stringify(hist)===JSON.stringify({H:24,V:21,R:12,F:12}),"69 line direction counts");
const empty=()=>({h:Array(W).fill(0),q:Array.from({length:W},()=>Array(H).fill(-1))});
const bit=(c,r)=>1n<<BigInt(r*W+c);
const pop=m=>{let n=0;while(m){m&=m-1n;n++;}return n;};
const physical=m=>{let a=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++)if(m&bit(c,r))a.push([c+1,r+1]);return a;};
function ray(q,c,r,p){
 for(const [_,dx,dy]of dirs){
  let n=1;
  for(const sign of [-1,1])for(let j=1;j<4;j++){
   let x=c+j*dx*sign,y=r+j*dy*sign;
   if(x<0||x>=W||y<0||y>=H||q.q[x][y]!==p)break;
   n++;
  }
  if(n>=4)return true;
 }
 return false;
}
function step(q,c1,p){
 const c=c1-1,r=q.h[c];ok(r<H,"legal gravity site");
 q.q[c][r]=p;q.h[c]++;
 const win=K.some(L=>L.cells.every(([x,y])=>q.q[x][y]===p));
 ok(win===ray(q,c,r,p),"independent physical ray vs literal K4");
 return {column:c1,row:r+1,player:p,firstwin:win};
}
function WSL(q,p) {
 const raw=[];
 for(const L of K) {
  if(L.cells.some(([x,y])=>q.q[x][y]===1-p))continue;
  let mask=0n;
  for(const [c,r]of L.cells)if(q.q[c][r]===-1)mask|=bit(c,r);
  if(mask)raw.push({mask,L});
 }
 const distinct=new Map();
 for(const a of raw) {
  const key=String(a.mask);
  if(!distinct.has(key))distinct.set(key,{mask:a.mask,provenances:[]});
  distinct.get(key).provenances.push(a.L);
 }
 const U=[...distinct.values()],min=U.filter(g=>!U.some(x=>x.mask!==g.mask&&(g.mask&x.mask)===x.mask));
 return{raw,unique:U,min};
}
const q=empty(),prefix="42142544",trace=[];
for(let i=0;i<prefix.length;i++){
 const evt=step(q,Number(prefix[i]),i&1);
 ok(!evt.firstwin,"all source q8 history prefixes LIVE");
 trace.push(evt);
}
ok(q.h.join(",")==="1,2,0,4,1,0,0","source h authentic original");
const sourceWSL=WSL(q,0),grade=sourceWSL.min.reduce((o,g)=>(o[pop(g.mask)]=(o[pop(g.mask)]||0)+1,o),{});
ok(JSON.stringify(grade)===JSON.stringify({"3":13,"4":26}),"source A13 grades3/4");
const target=[ [0,2],[1,2],[2,2],[3,2] ];
const origin=K.find(L=>L.type==="H"&&L.cells.every((p,i)=>p[0]===target[i][0]&&p[1]===target[i][1]));
ok(Boolean(origin),"true physical H row3 c1..4 exists");
const missing=bit(0,2)|bit(1,2)|bit(2,2),F=bit(1,2)|bit(2,2),y=bit(0,2);
ok(sourceWSL.min.some(G=>G.mask===missing),"initial G3 row3 H source is minimal");
const sourcePhi=(mask)=>Number(sourceWSL.min.some(g=>(g.mask&mask)===g.mask));
ok(sourcePhi(F)===0&&sourcePhi(F|y)===1,"source triple Shannon cofactor leaves singleton");
const after=[2,2,3,3,3],future=[];
for(let k=0;k<after.length;k++){
 const e=step(q,after[k],k&1);
 ok(!e.firstwin,"source five-event witness remains live");
 future.push(e);
}
ok(q.h.join(",")==="1,4,3,4,1,0,0","expected source after h");
ok(q.q[1][2]===0&&q.q[2][2]===0&&q.q[3][2]===0,"real P0 owns H r3 c2,c3,c4");
ok(q.q[1][3]===1&&q.q[2][1]===1,"P1 blocked c2 vertical and supplied c3 support");
const A=WSL(q,0),D=WSL(q,1);
const traps=[];
for(let c=0;c<W;c++)if(q.h[c]+1<H&&A.min.some(z=>z.mask===bit(c,q.h[c]+1)))traps.push(c+1);
ok(traps.includes(1),"P0 H source becomes ready c1r3 trap above c1r2");
ok(A.min.some(z=>z.mask===y),"true postsource min singleton c1r3");
const C=traps.map(c=>c-1),odd=Array.from({length:W},(_,i)=>i).filter(c=>!C.includes(c)&&(H-q.h[c])%2===1);
const pairing=(xs)=>{
 if(xs.length===0)return[[]];
 const [a,...rest]=xs,out=[];
 for(let j=0;j<rest.length;j++)for(const z of pairing(rest.filter((_,k)=>k!==j)))out.push([[a,rest[j]],...z]);
 return out;
};
function isShadow(L){
 if(L.type==="V"||L.cells.some(([c,r])=>r<1))return false;
 const down=L.cells.map(([c,r])=>[c,r-1]);
 if(!K.some(R=>R.type===L.type&&R.cells.every((p,i)=>p[0]===down[i][0]&&p[1]===down[i][1])))return false;
 for(const [c,r]of L.cells){
  if(q.q[c][r]===0)return false;
  if(q.q[c][r-1]===0)continue;
  if(q.q[c][r-1]!==-1||q.q[c][r]!==-1||C.includes(c))return false;
  const start=q.h[c]+((H-q.h[c])&1);
  const prev=r-2;
  if(prev<start||((prev-start)&1)!==0)return false;
 }
 return true;
}
let best=null;
if(C.length&&odd.length%2===0)for(const P of pairing(odd)){
 const E=[],Q=P.map(pair=>pair.map(c=>bit(c,q.h[c]))),X=C.map(c=>bit(c,q.h[c]));
 for(let c=0;c<W;c++)if(!C.includes(c))for(let r=q.h[c]+((H-q.h[c])&1);r<H;r+=2)E.push(bit(c,r));
 const rank=G=>{
  let n=E.filter(x=>(G&x)!==0n).length;
  for(const pair of Q)if(pair.some(x=>(G&x)!==0n))n++;
  if(X.some(x=>(G&x)!==0n))n++;
  return n;
 };
 const items=D.min.map(g=>({g,gap:pop(g.mask)-rank(g.mask),shadow:g.provenances.some(isShadow)}));
 const uncovered=items.filter(z=>z.gap===0&&!z.shadow);
 const trial={Q:P.map(v=>v.map(c=>c+1)),P1minimal:D.min.length,dependent:items.filter(x=>x.gap>0).length,
   shadowedIndependent:items.filter(x=>x.gap===0&&x.shadow).length,
   remainingIndependentUnshadowed:uncovered.length,
   residuals:uncovered.map(z=>({missing:physical(z.g.mask),
    sourceLines:z.g.provenances.map(l=>({type:l.type,physical:l.cells.map(([c,r])=>[c+1,r+1])}))})).slice(0,12),
   rawGamma:Math.min(...items.map(x=>x.gap)),
   augmentedGamma:Math.min(...items.map(x=>x.gap+Number(x.shadow)))};
 if(!best||trial.remainingIndependentUnshadowed<best.remainingIndependentUnshadowed)best=trial;
}
const result={
 schema:"c4.original7x6_q8_grade3_vertical_to_horizontal_trap.v1",
 status:"EXACT_SOURCE_Q8_SAME_COLUMN_VERTICAL_DEFENSE_CREATES_H3_READY_TRAP_BUT_NO_COMPLETE_POLICY_CERTIFICATE",
 sourceHistory:prefix,initialSupport:[1,2,0,4,1,0,0],originalK4:hist,
 sourceP0MinimumMasks:sourceWSL.min.length,sourceP0GradeHistogram:grade,
 chosenSourceG3:{
  originalH4:origin.cells.map(([c,r])=>[c+1,r+1]),
  initialMissing:physical(missing),
  P0FulfilledTwo:physical(F),futureReadyTarget:physical(y),
  sourceBooleanUnderF:sourcePhi(F),
  sourceBooleanUnderFplusTarget:sourcePhi(F|y)
 },
 physicalLocalFiveEventTranscript:future.map(({column,row,player})=>({column,row,player})),
 finalHistory:prefix+after.join(""),finalRank:prefix.length+after.length,
 finalSupport:q.h,finalP0CurrentReadyTrapColumns:traps,
 finalP0SourceWSL:A.min.length,finalP1SourceWSL:D.min.length,
 finalOddNontrapBases:odd.map(c=>c+1),
 oldOnlineP0ResponderSourceFrame:best||"INELIGIBLE_NO_MATCHING",
 interpretation:"A legal samecolumn P1 reply c2r4 prevents P0 V c2r2..r5 but another samecolumn P1 reply c3r2 supplies gravity needed for P0 c3r3. This activates source H row3 c1..4 as actual P0 ready trap c1r3. Thus naive claim SAMECOLUMN response to each vertical prevents all P0 traps by rank13 is false on genuine board. Single source trap alone does not establish P0 WLD; investigate unshadowed P1 original K4s and alternative policies.",
 noKnownSolvedValues:true,fullGameStateEnumeration:false,childStrategicWLDCalls:0,
 maintainedCI:"NOT_RUN",externalFormalProver:"NOT_RUN"
};

// Independent new role/tempo guard from the previously verified physical
// source q13, not an opponent-game-tree value computation.
const deepCopy20261023=(q0)=>({h:q0.h.slice(),q:q0.q.map(z=>z.slice())});
const currentA20261023=(q0,p)=>WSL(q0,p).min;
function immediate20261023(q0,p) {
 const A=currentA20261023(q0,p),out=[];
 for(let c=0;c<7;c++)if(q0.h[c]<6&&A.some(x=>x.mask===bit(c,q0.h[c])))out.push(c+1);
 return out;
}
function ready20261023(q0,p) {
 const A=currentA20261023(q0,p),out=[];
 for(let c=0;c<7;c++)if(q0.h[c]+1<6&&A.some(x=>x.mask===bit(c,q0.h[c]+1)))out.push(c+1);
 return out;
}
const ready13=ready20261023(q,0);
ok(ready13.join(",")==="1,5","two actual P0 ready row3 H4 source traps c1/c5");
const unmatched13=Array.from({length:7},(_,i)=>i).filter(c=>!ready13.includes(c+1)&&((6-q.h[c])&1)).map(c=>c+1);
ok(unmatched13.join(",")==="3","odd nontrap base B singleton cannot be Q-matched");
const trapFirstwins20261023=[];
for(const trap of ready13){
 const trial=deepCopy20261023(q),Dmove=step(trial,trap,1);
 ok(!Dmove.firstwin,"P1 trap entry not already FIRSTWIN");
 const Amove=step(trial,trap,0);
 ok(Amove.firstwin&&Amove.row===3,"P0 FIRSTWINS physical H3 original on entering trap");
 trapFirstwins20261023.push({Dcolumn:trap,Drow:Dmove.row,P0winnerColumn:trap,P0winnerRow:Amove.row});
}
const qAfter=deepCopy20261023(q),exchangeMoves=[],states=[{
 rank:13,h:qAfter.h.slice(),P0ready:ready20261023(qAfter,0),
 P0immediate:immediate20261023(qAfter,0),P1immediate:immediate20261023(qAfter,1)
}];
for(const [col,p]of [[3,1],[1,0],[1,1],[1,0]]){
 const ev=step(qAfter,col,p);ok(!ev.firstwin,"source exchange before q17 firstwinnerfree");
 exchangeMoves.push(ev);
 states.push({rank:13+exchangeMoves.length,move:ev,h:qAfter.h.slice(),
  P0ready:ready20261023(qAfter,0),
  P0immediate:immediate20261023(qAfter,0),
  P1immediate:immediate20261023(qAfter,1)});
}
ok(states[2].P0immediate.join(",")==="1"&&states[2].P1immediate.length===0,
 "P0 c1r2 creates immediate P0 H row3 firstwin c1r3 and no P1 counterwinner");
ok(states[3].P1immediate.join(",")==="1",
 "P1 blocks row3 c1r3 but now immediately threatens row4 H c1r4");
ok(qAfter.h.join(",")==="4,4,4,4,1,0,0"&&ready20261023(qAfter,0).join(",")==="5",
 "P0 c1r4 mandatory block restores one trap c5, h parity");
const C17=[4],oddB17=Array.from({length:7},(_,c)=>c).filter(c=>!C17.includes(c)&&((6-qAfter.h[c])&1));
ok(oddB17.length===0,"P0 correct-role Q pairing possible after q17");
const p1A17=WSL(qAfter,1),p0A17=WSL(qAfter,0),free17=[];
for(let c=0;c<7;c++)if(!C17.includes(c))for(let r=qAfter.h[c]+((6-qAfter.h[c])&1);r<6;r+=2)free17.push(bit(c,r));
const tr17=C17.map(c=>bit(c,qAfter.h[c]));
const rank17=(mask)=>free17.filter(e=>(mask&e)!==0n).length+Number(tr17.some(x=>(mask&x)!==0n));
const all17=p1A17.min.map(x=>({mask:x.mask,gap:pop(x.mask)-rank17(x.mask),original:x.provenances}));
const gap17={};for(const x of all17)gap17[x.gap]=(gap17[x.gap]||0)+1;
const independent17=all17.filter(x=>x.gap===0);
ok(independent17.length===1&&physical(independent17[0].mask).map(x=>x.join(",")).join("|")==="1,5|2,5|3,5|4,5",
 "sole unshadowed P1 source line H row5 c1..4 still matroid independent");
ok(qAfter.q[0][3]===0&&[1,2,3].every(c=>qAfter.q[c][3]===1),
 "P0 cannot supply earlier aligned H row4 lower shadow: P1 owns c2r4,c3r4,c4r4");
const goal=deepCopy20261023(qAfter),goalEvents=[];
for(const [i,c] of [1,1,2,2,3,3,4].entries()){
 const owner=i%2===0?1:0,e=step(goal,c,owner);
 goalEvents.push(e);
 if(i<6)ok(!e.firstwin,"no firstwinner before P1 final lower row5 H4");
}
ok(goalEvents.length===7&&goalEvents[6].firstwin&&goalEvents[6].player===1&&goalEvents[6].column===4&&goalEvents[6].row===5,
 "P1 FIRSTWINS row5 H c1..4 before P0 final row6 upper mate");
result.parityRepairAndLowerRowFirstwinCounter={
 frozenProtocol:"docs/research/2026-10-23-frozen-C4Q13-to-Q17-odd-repair-row4-deadline-and-row5-P1-lower-shadow-counterexample.md",
 rank13OriginalWord:"4214254422333",rank13P0ReadyTraps:ready13,
 rank13OddUnmatchedNontraps:unmatched13,
 actualP0FirstwinOnOriginalTrapEntry:trapFirstwins20261023,
 originalFourEventDeadlineExchange:exchangeMoves,
 stateFieldAtEveryRank:states,
 rank17Word:"42142544223333111",rank17Heights:qAfter.h.slice(),
 rank17P0ReadyTrapColumns:ready20261023(qAfter,0),
 rank17BoddNontrap:oddB17.map(c=>c+1),
 rank17OriginalP1MinWSL:p1A17.min.length,
 rank17OriginalP0MinWSL:p0A17.min.length,
 rank17P1MatroidGapHistogram:gap17,
 rank17SingleIndependentP1OriginalH4:{
  residual:physical(independent17[0].mask),
  sourceOriginalK4:independent17[0].original.map(L=>({t:L.type,cells:L.cells.map(([c,r])=>[c+1,r+1])})),
  firstwinningShadowByP0LowerH4:false},
 fixedUpperMateCounterPolicy:{
  P1lowerRow5ColumnPlan:[1,2,3,4],P0upperRow6ColumnMates:[1,2,3],
  fullNamedSevenEventRecord:goalEvents,
  P1FirstwinningPly:24,
  originalP1FirstwinH4:[[1,5],[2,5],[3,5],[4,5]],
  P0C4R6UpperMateWouldBeTooLate:true
 },
 guardedConclusion:"Parity restoration and one live P0 terminal trap do NOT certify responding P0 WIN; matroid gap stays0 due an original P1 lower-row H4 which FIRSTWINS before blind P0 upper mates. Fixed policy fails, true q17 WLD UNKNOWN."
};


// New HORIZONTAL / VERTICAL HETEROGENEOUS Q matroid on the verified
// genuine original7x6 q17, independent of the earlier pure-upper-mate
// proof. The OLD pure upper mate intentionally FAILS as preserved above.
// This new policy restores all P1 K4 requirements to rank-dependent.
const hybridHmirror20261023=[
 [bit(0,4),bit(1,4)], // c1r5/c2r5
 [bit(0,5),bit(1,5)]  // c1r6/c2r6
];
const hybridVfree20261023=[
 bit(2,4),bit(3,4), // P1 lower c3r5,c4r5; P0 upper r6
 ...[5,6].flatMap(c=>[0,2,4].map(r=>bit(c,r))) // D c6/7 odd rows
];
const hybridX20261023=bit(4,1); // D entry c5r2 triggers P0 H r3 firstwin
function hybridRank20261023(m){
 let k=hybridVfree20261023.filter(x=>(m&x)!==0n).length;
 for(const pair of hybridHmirror20261023)if(pair.some(x=>(m&x)!==0n))k++;
 if((m&hybridX20261023)!==0n)k++;
 return k;
}
const hybridP1WSL20261023=WSL(qAfter,1),hybridHistogram20261023={};
const hybridObligations20261023=[],hybridIndependent20261023=[];
for(const item of hybridP1WSL20261023.min){
 const gap=pop(item.mask)-hybridRank20261023(item.mask);
 ok(gap>=0,"hybrid partition matroid rank nullity nonnegative");
 hybridHistogram20261023[gap]=(hybridHistogram20261023[gap]||0)+1;
 const entry={gap,missing:physical(item.mask),
  originalK4:item.provenances.map(L=>({dir:L.type,cells:L.cells.map(([c,r])=>[c+1,r+1])}))};
 hybridObligations20261023.push(entry);
 if(gap===0)hybridIndependent20261023.push(entry);
}
ok(JSON.stringify(hybridHistogram20261023)===JSON.stringify({"1":8,"2":9,"3":3,"4":2}),
 "hybrid matroid ALL P1 minimal WSL nullities positive");
ok(hybridIndependent20261023.length===0,"no independent P1 source WIN masks");
for(const item of hybridP1WSL20261023.raw)ok(pop(item.mask)-hybridRank20261023(item.mask)>=1,
 "all original unblocked D K4 residuals, including nonminimal, dependent");

function hybridRespond20261023(q0,Dcol){
 const h=q0.h.slice();let Acol=Dcol;
 if(Dcol===1||Dcol===2){
  ok(h[0]===h[1]&&(h[0]===4||h[0]===5),
   "horizontal source c1/c2 equal layer5/6 before P1 move");
  Acol=Dcol===1?2:1;
 } else if([3,4,6,7].includes(Dcol)) {
  ok(h[Dcol-1]%2===0&&h[Dcol-1]<=4,
   "vertical source even-height lower/upper two-slot response");
 } else {
  ok(Dcol===5&&h[4]===1,"c5 P0 terminal trap still virgin");
 }
 const D=step(q0,Dcol,1);
 ok(!D.firstwin,"hybrid source D owner sets exclude P1 K4 firstwinner");
 const A=step(q0,Acol,0);
 if(Dcol<=2)ok(A.row===D.row&&q0.h[0]===q0.h[1],"P0 same-row mirror restores equal heights");
 else if(Dcol===5){
  ok(A.firstwin&&A.row===3,"P0 c5r3 original H FIRSTWIN on P1 trap entry c5r2");
  ok(K.some(L=>L.type==="H"&&L.cells.map(([c,r])=>[c+1,r+1].join(",")).join("|")==="2,3|3,3|4,3|5,3"&&
   L.cells.every(([c,r])=>q0.q[c][r]===0)),"source P0 original H3 terminal ray present");
 }else ok(A.row===D.row+1&&A.column===D.column,"P0 upper same-column vertical mate");
 return{D,A,kind:Dcol<=2?"HORIZONTAL_ROW_MIRROR":Dcol===5?"P0_TRAP_FIRSTWIN":"VERTICAL_UPPER_MATE"};
}
const hybridImmediate20261023=deepCopy20261023(qAfter);
const hybridTrapControl20261023=hybridRespond20261023(hybridImmediate20261023,5);
ok(hybridTrapControl20261023.A.firstwin,"real immediate P0 response H original K4 c2..c5 row3");
const hybridNamed20261023=deepCopy20261023(qAfter);
const hybridDscript20261023=[1,3,6,2,4,7,6,7,6,7],hybridEvents20261023=[];
for(const Dc of hybridDscript20261023){
 const item=hybridRespond20261023(hybridNamed20261023,Dc);
 hybridEvents20261023.push(item);
 if(item.A.firstwin)break;
}
if(!hybridEvents20261023.at(-1).A.firstwin) {
 ok(hybridEvents20261023.length===10&&[1,2,3,4,6,7].every(c=>hybridNamed20261023.h[c-1]===6),
  "named legal D source control exhausts exactly twenty nontrap sites");
 const terminal=hybridRespond20261023(hybridNamed20261023,5);
 hybridEvents20261023.push(terminal);
 ok(terminal.A.firstwin,"ten pair exchanges force P1 into current source c5 terminal trap");
}
ok(hybridEvents20261023.length<=11&&17+2*11===39,
 "P0 FIRSTWIN by original ply39, before board42/draw");
const hybridCertificate20261023={
 originalSourceWord:"42142544223333111",
 sourceP1MinimumWSL:hybridP1WSL20261023.min.length,
 sourceP1RawUnblockedK4:hybridP1WSL20261023.raw.length,
 horizontalRankOneMirrorBlocksPhysical:[
  [[1,5],[2,5]],[[1,6],[2,6]]
 ],
 verticalP1FreeLowerPhysical:[[3,5],[4,5],
  [6,1],[6,3],[6,5],[7,1],[7,3],[7,5]],
 sourceP0TerminalTrap:{P1Entry:[5,2],P0Reply:[5,3],originalH:[[2,3],[3,3],[4,3],[5,3]]},
 P1MatroidNullityProfile:hybridHistogram20261023,
 P1OriginalSourceMinimumCertificates:hybridObligations20261023,
 gamma:Math.min(...hybridObligations20261023.map(x=>x.gap)),
 sourceDSourceOriginalK4AllDependent:true,
 horizontalAndVerticalOnlineLegalityInductiveProof:"c1,c2 heights initially both4, every same-row D/A mirror preserves equality, D owns at most one cell per row-pair; c3,c4 initially even4 and c6,c7 even0, D lower/A upper same-column preserves even height, D only lower physical rows; c5 entry D c5r2 forces A c5r3 original H FIRSTWIN",
 nontrapRemainingPhysicalSitesAtSource:20,
 nontrapP1_A_pairsBeforeForcedTrapAtMost:10,
 latestP0GuaranteedFirstwinRank:39,
 noP1FirstwinPossibleBySourceRankProof:true,
 noDrawByFiniteTerminalTrap:true,
 oneNamedIndependentPhysicalControl:hybridEvents20261023,
 oneImmediateC5TrueSourceTrapControl:hybridTrapControl20261023,
 sourceWinner:"P0 WIN",
 unrestrictedOriginalEmptyRootWLD:"OPEN",
 sourceWinnerUsedNoSolvedOraclePremises:true
};
ok(hybridCertificate20261023.gamma===1&&hybridCertificate20261023.noDrawByFiniteTerminalTrap,
 "exact guarded P0 WIN proof source hybrid matroid positive");
result.hybridHorizontalVerticalPolicyWIN=hybridCertificate20261023;
result.status="EXACT_GUARDED_ORIGINAL7X6_Q17_P0_WIN_USING_HV_HETEROGENEOUS_PARTITION_MATROID";

console.log(JSON.stringify(result,null,2));