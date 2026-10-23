"use strict";
/** Genuine original7x6 c4,c3,c5 rank5 P0 double-threat source field.
 * Analytic seven-label b1/b2 Boolean formulas, 49 ABSTRACT reply-label
 * checks and six named physical original69/ray controls. NOT a WDL tree.
 */
const ok=(v,m)=>{if(!v)throw Error("C4_ROOT_FORK "+m);};
const W=7,H=6,L=4,dirs=[[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]];
const K=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const[dx,dy,t]of dirs){
 const cells=[];for(let i=0;i<L;i++){
  const x=c+dx*i,y=r+dy*i;if(x<0||x>=W||y<0||y>=H){cells.length=0;break;}
  cells.push([x,y]);
 }
 if(cells.length===L)K.push({t,cells});
}
ok(K.length===69,"original physical69");
const inventory=Object.fromEntries(["H","V","R","F"].map(t=>[t,K.filter(x=>x.t===t).length]));
ok(JSON.stringify(inventory)===JSON.stringify({H:24,V:21,R:12,F:12}),"all original types");
function formula(b1,b2){
 const U=Number(b1!==3&&b1!==5&&b2!==5);
 const T2=Number(U&&b1!==2&&b2!==2);
 const T6=Number(U&&b1!==6&&b2!==6);
 const fork=T2*T6;
 const simplified=Number(![2,3,5,6].includes(b1)&&![2,5,6].includes(b2));
 ok(fork===simplified,"fork factor reduction");
 return {U,T2,T6,fork};
}
let abstractPairs=0,abstractForks=0;
for(let b1=1;b1<=W;b1++)for(let b2=1;b2<=W;b2++){
 const value=formula(b1,b2);abstractPairs++;abstractForks+=value.fork;
}
ok(abstractPairs===49&&abstractForks===12,"exact allowed reply-slot product 3x4");
const build=()=>({h:Array(W).fill(0),o:Array.from({length:W},()=>Array(H).fill(-1))});
const win=(b,p)=>K.some(x=>x.cells.every(([c,r])=>b.o[c][r]===p));
function ray(b,c,r,p){
 for(const[dx,dy]of dirs){let count=1;
  for(const sgn of [-1,1])for(let step=1;step<4;step++){
   const x=c+sgn*step*dx,y=r+sgn*step*dy;
   if(x<0||x>=W||y<0||y>=H||b.o[x][y]!==p)break;
   count++;
  }
  if(count>=4)return true;
 }
 return false;
}
function drop(b,c1,p){
 const c=c1-1,r=b.h[c];ok(r<H,"legal gravity");
 b.h[c]++;b.o[c][r]=p;
 const w=win(b,p);
 ok(w===ray(b,c,r,p),"literal K4/directional ray");
 return {c:c1,row:r+1,p,firstwin:w};
}
function literalThreats(q,p) {
 const result=[];
 for(let col=1;col<=7;col++){
  const c=col-1,r=q.h[c];
  if(r>=H)continue;
  const attacked=K.some(L=>L.cells.some(([x,y])=>x===c&&y===r)
   &&L.cells.every(([x,y])=>(x===c&&y===r)||q.o[x][y]===p));
  if(attacked)result.push(col);
 }
 return result;
}
const selected=[
 {b:[4,3],reason:"both follow latest P0 column; true fork"},
 {b:[7,3],reason:"unproductive P1 early cross; STILL true fork"},
 {b:[3,7],reason:"P1 preempts planned c3 bottom"},
 {b:[4,5],reason:"P1 preempts planned c5 bottom"},
 {b:[2,4],reason:"P1 already occupies c2 bottom"},
 {b:[7,6],reason:"P1 already occupies c6 bottom"},
 {b:[4,2],reason:"P1 blocks c2 bottom on second reply"},
 {b:[7,5],reason:"P1 preempts c5 on second reply"}
];
const controls=[];
for(const item of selected){
 const [b1,b2]=item.b,q=build();
 const sequence=[4,b1,3,b2,5],events=[];
 for(let i=0;i<sequence.length;i++){
  const v=drop(q,sequence[i],i&1);events.push(v);
  ok(!v.firstwin,"all plies <=5 necessarily nonterminal");
 }
 const obs=literalThreats(q,0),p1=literalThreats(q,1),value=formula(b1,b2);
 const pred=[value.T2?2:null,value.T6?6:null].filter(x=>x!==null);
 ok(obs.join(",")===pred.join(","),"physical all69 P0 threat set equals two-term symbolic field");
 ok(p1.length===0,"P1 owns two stones so no K4 immediate win");
 if(value.fork){
  // One opponent reply cannot claim two different genuine frontier cells.
  // Check a named attack reply and P0's certified remaining firstwinning.
  for(const response of [2,6,7]){
   const clone={h:q.h.slice(),o:q.o.map(xs=>xs.slice())};
   const d=drop(clone,response,1);ok(!d.firstwin,"P1 third placement cannot complete K4");
   const still=literalThreats(clone,0);
   const expect=pred.filter(c=>c!==response);
   ok(still.some(c=>expect.includes(c)),"certified surviving P0 win after P1 defender ply6");
   const actual=drop(clone,still[0],0);
   ok(actual.firstwin,"actual P0 FIRSTWIN ply7");
  }
 }
 controls.push({P1ReplyColumns:item.b,sourceFivePlyWord:sequence.join(""),
  P0ImmediateWinningColumns:obs,P1ImmediateWinningColumns:p1,fork:value.fork,
  P0BottomTriple:value.U===1,reason:item.reason});
}
ok(controls.filter(x=>x.fork).length===2,"two controlled fork witnesses");
const report={
 schema:"c4.original7x6_center_triple_causal_fork_deadline.v1",
 status:"EXACT_CENTER_THREE_RUN_TWIN_THREAT_CAUSAL_DEFENSE_DEADLINE_ON_ORIGINAL7X6",
 originalPhysicalK4:inventory,sourceP0OwnColumns:[4,3,5],
 exactRank5Field:{
  U:"[b1!=3][b1!=5][b2!=5]",
  T2:"U[b1!=2][b2!=2]",T6:"U[b1!=6][b2!=6]",
  fork:"[b1 notin {2,3,5,6}][b2 notin {2,5,6}]",
  conditionP1MustSatisfyToAvoidTHISFork:"b1 in {2,3,5,6} OR b2 in {2,5,6}",
  responseDeadline:"P1 own ply4: source rank5 fork if not met",
  physicalP0FirstwinUponFork:"next P0 ply7 after ANY P1 ply6 response"},
 proofSupport:"At rank5 P0 has 3 stones in three different columns with c4 at bottom; no V or diagonal three-line is completable by one legal new P0 cell. Only bottom horizontal c2..5 or c3..6 can complete. P1 has only two stones, no immediate win. Two distinct playable threats survive any one P1 placement.",
 exactSymbolicControl:{b1LabelsWithoutDefense:3,b2LabelsWithoutDefense:4,
  forkSourceWordCountByProduct:12,allTwoReplyWordsByCardinality:49,
  abstractReplyLabelPairsAlgebraChecked:abstractPairs,completeP1GameTreeEnumerated:false},
 originalPhysicalLocalWitnesses:controls,
 rootPerfectPlayWDL:"NOT_PROVED; P1 has productive choices meeting the deadline",solvedOracleInput:false,maintainedCI:"NOT_RUN"
};
console.log(JSON.stringify(report,null,2));