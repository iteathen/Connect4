"use strict";
/**
 * Rank-local exact original7x6 TRAP BIRTH from a mixed source WSL
 * Boolean-Shannon two-site derivative + physical gravity-height guard.
 * 168 abstract 4-site antichain controls x 24 distinct (e,f,y) roles
 * (NOT any sub-five Connect4 board), plus seven literal P1 move labels
 * and ONE fixed P0 source reply c4 from genuine center-first rank7.
 *
 * No game-tree WLD evaluations, solved data or small-board extrapolation.
 * node verify-original7x6-mixed-Shannon-gravity-trap-birth-operator.js
 */
const ok=(v,s)=>{if(!v)throw Error("C4_MIXED_TRAP "+s);};
const subset=(a,b)=>(a&b)===a;
function normalize(arr) {
 const keys=[...new Set(arr)].sort((a,b)=>a-b);
 return keys.filter(v=>!keys.some(u=>u!==v&&subset(u,v)));
}
const antichains=[];
for(let catalogue=0;catalogue<65536;catalogue++){
 const f=[];for(let k=0;k<16;k++)if(catalogue&(1<<k))f.push(k);
 if(f.every((a,i)=>f.every((b,j)=>i===j||(!subset(a,b)&&!subset(b,a)))))antichains.push(f);
}
ok(antichains.length===168,"exact Dedekind four abstract-site antichains");
const val=(A,z)=>Number(A.some(m=>subset(m,z)));
let abstractDistinctRoleCases=0,abstractLiveDoubleCofactors=0,preexistingSingleton=0,genuineGrade2Birth=0,initialWinsDiscarded=0;
for(const a of antichains)for(let e=0;e<4;e++)for(let f=0;f<4;f++)if(f!==e)for(let y=0;y<4;y++)if(y!==f&&y!==e){
 abstractDistinctRoleCases++;
 const ebit=1<<e,fbit=1<<f,ybit=1<<y;
 const blocked=a.filter(m=>(m&ebit)===0);
 const post=normalize(blocked.map(m=>m&~fbit));
 const fieldUnder=val(a,fbit|ybit),fieldF=val(a,fbit);
 const diff=fieldUnder-fieldF;
 const live=val(a,0)===0&&val(a,fbit)===0;
 if(!live){initialWinsDiscarded++;continue;}
 ok(val(post,0)===0,"A move must not already be FIRSTWIN");
 const actual=Number(post.some(m=>m===ybit));
 ok(diff===actual,"all live original-type antichains trap singleton iff source cofactor discrete derivative");
 const pre=val(a,ybit)-val(a,0);
 const mixed=val(a,fbit|ybit)-val(a,fbit)-val(a,ybit)+val(a,0);
 ok(actual===pre+mixed,"mixed second derivative + preexisting singleton exact decomposition");
 if(pre)preexistingSingleton++;
 if(mixed===1)genuineGrade2Birth++;
 abstractLiveDoubleCofactors++;
}
ok(abstractDistinctRoleCases===168*4*3*2,"all abstract distinct site role triplets");

const W=7,H=6,dirs=[[1,0,"H"],[0,1,"V"],[1,1,"R"],[1,-1,"F"]],windows=[];
for(let col=0;col<W;col++)for(let row=0;row<H;row++)for(const [dx,dy,type]of dirs){
 const cells=[];
 for(let k=0;k<4;k++){
  const c=col+k*dx,r=row+k*dy;
  if(c<0||c>=W||r<0||r>=H){cells.length=0;break;}
  cells.push([c,r]);
 }
 if(cells.length===4)windows.push({type,cells});
}
ok(windows.length===69,"original69 K4");
const inventory=Object.fromEntries(["H","V","R","F"].map(t=>[t,windows.filter(L=>L.type===t).length]));
ok(JSON.stringify(inventory)===JSON.stringify({H:24,V:21,R:12,F:12}),"original winline inventory");
const bit=(c,r)=>1n<<BigInt(r*W+c);
const newBoard=()=>({h:Array(W).fill(0),b:Array.from({length:W},()=>Array(H).fill(-1))});
const copy=q=>({h:q.h.slice(),b:q.b.map(v=>v.slice())});
function winner(q,p){return windows.some(L=>L.cells.every(([c,r])=>q.b[c][r]===p));}
function ray(q,c,r,p){
 for(const [dx,dy]of dirs){let n=1;for(const side of [-1,1])for(let k=1;k<4;k++){
  const x=c+side*k*dx,y=r+side*k*dy;
  if(x<0||x>=W||y<0||y>=H||q.b[x][y]!==p)break;n++;
 }if(n>=4)return true;}
 return false;
}
function place(q,column,p) {
 const c=column-1,r=q.h[c];ok(r<H,"true gravity legal move");
 q.h[c]++;q.b[c][r]=p;
 const w=winner(q,p);
 ok(w===ray(q,c,r,p),"independent ray and original69 terminal predicate agree");
 return {column,row:r+1,player:p,firstwin:w,physicalMask:bit(c,r)};
}
function WSL(q,p){
 const raw=[];
 for(const L of windows){
  if(L.cells.some(([c,r])=>q.b[c][r]===1-p))continue;
  let m=0n;for(const[c,r]of L.cells)if(q.b[c][r]===-1)m|=bit(c,r);
  if(m)raw.push({mask:m,source:L});
 }
 const uniques=[...new Map(raw.map(e=>[String(e.mask),e])).values()];
 const minimal=uniques.filter(x=>!uniques.some(y=>x.mask!==y.mask&&(x.mask&y.mask)===y.mask));
 return {raw,uniques,minimal};
}
const field=(A,z)=>Number(A.some(m=>(m.mask&z)===m.mask));
const word="4214254",root=newBoard(),sourceTrace=[];
for(let i=0;i<word.length;i++){
 const move=place(root,Number(word[i]),i&1);
 ok(!move.firstwin,"genuine rank7 firstwinfree prefix");
 sourceTrace.push({column:move.column,row:move.row,player:move.player});
}
ok(root.h.join(",")==="1,2,0,3,1,0,0","rank7 support");
const p0=WSL(root,0),targetF=bit(3,3),targetY=bit(2,2);
const diagonal=windows.find(L=>L.type==="R"&&L.cells.map(([c,r])=>(c+1)+","+(r+1)).join("|")==="1,1|2,2|3,3|4,4");
ok(Boolean(diagonal),"actual original R c1r1..c4r4");
ok(p0.minimal.some(x=>x.mask===(targetF|targetY)),"actual two-site grade2 minimal P0 source obligation");
ok(field(p0.minimal,targetF)===0&&field(p0.minimal,targetY)===0&&field(p0.minimal,targetF|targetY)===1,"strict source +1 mixed second derivative");
const mixedPhi=(field(p0.minimal,targetF|targetY)-field(p0.minimal,targetF)-field(p0.minimal,targetY));
ok(mixedPhi===1,"pure two-site mixed WSL Shannon derivative");
const controls=[];
for(let b=1;b<=7;b++) {
 const live=copy(root);
 const D=place(live,b,1);
 ok(!D.firstwin,"first P1 D action cannot terminal from rank7 prefix");
 const A=place(live,4,0);
 ok(!A.firstwin,"P0 rank9 c4 must not immediately firstwin on this fixed trunk");
 const after=WSL(live,0);
 const c=2,ready=(live.h[c]+1)<H,yReady=ready?bit(c,live.h[c]+1):0n;
 const direct=Number(ready&&after.minimal.some(x=>x.mask===yReady));
 const f=A.physicalMask,sourceAfterA=field(p0.minimal,f);
 const phiY=ready?field(p0.minimal,f|yReady):0;
 const newTrap=Number(ready&&phiY-sourceAfterA===1);
 ok(direct===newTrap,"exact live trap field equals guarded source boolean discrete derivative");
 const deltaNew=phiY-sourceAfterA;
 // The old source grade2 generates the trap ONLY if D P1 claimed c3r1
 // (support h_c3 is now1), AND P0 really claims f=c4r4.
 ok(direct===Number(b===3),"P0 terminal trap c3 birth exactly when D selects col3");
 const actualTraps=[];
 for(let k=0;k<W;k++)if(live.h[k]+1<H){
  const y=bit(k,live.h[k]+1);
  if(after.minimal.some(x=>x.mask===y))actualTraps.push(k+1);
 }
 ok(actualTraps.join(",")===(b===3?"3":""),"all current P0 terminal trap columns characterized");
 controls.push({
  previousActualP1Column:b,nextP0Column:4,
  DphysicalLanding:[D.column,D.row],AphysicalLanding:[A.column,A.row],
  supportAfterBoth:live.h.slice(),
  sourceP0WSLDirectSingletonTargetAfterPair:direct,
  twoSiteShannonDerivedTrap:newTrap,
  sourcePhiAtP0f:sourceAfterA,
  sourcePhiAtP0fPlusFrontierOneAbove:phiY,
  P0TrapColumns:actualTraps,
  currentP0WSLCount:after.minimal.length
 });
}
ok(controls.length===7&&controls.filter(x=>x.P0TrapColumns.length>0).length===1,
 "exact local source-typed P1 universal trap-formation coverage1/7");
const report={
 schema:"c4.original7x6_mixed_Shannon_gravity_trap_birth.v1",
 status:"EXACT_TWO_SITE_SHANNON_DERIVATIVE_TIMES_GRAVITY_GUARD_TRAP_BIRTH_AND_7_REPLY_ROOT_HOLE",
 fullPhysical7x6K4:inventory,
 abstractControls:{allFourAbstractSiteAntichains:antichains.length,
  distinctSourceRoleTriplets:abstractDistinctRoleCases,
  validLiveDoubleActionBooleanCofactors:abstractLiveDoubleCofactors,
  excludedTerminalOrInitialWinTriplets:initialWinsDiscarded,
  casesWithPreexistingSingleton:preexistingSingleton,
  pureGrade2SourceBirths:genuineGrade2Birth},
 physicalSource:{
  firstwinnerFreeWord:word,
  actualRank:7,playerToMove:"P1",
  sourceP0PhysicalDiagonal:[[1,1],[2,2],[3,3],[4,4]],
  sourceP0MinimalTwoPieceDiagonalRequirement:[[3,3],[4,4]],
  sourceTwoSiteMixedDerivative:mixedPhi,
  P1AllSevenLiteralResponsesFollowedByFixedP0Center:controls,
  exactIndicator:"ReadyTrapP0_c3_after(P1 b then P0 c4) = [b==3]",
  priorCertifiedRank9P0WINHistoryWhenB3:"421425434",
  otherSixCasesStatus:"NO MATROID-TRAP CERTIFICATE VIA FIXED c4 REPLY; WLD UNKNOWN, not proven losing/drawing"
 },
 universalTheorem:"On any live original7x6 q with D opponent legal e, responder A legal f (no earlier firstwinner), and after both a target y one physical row above the next gravity frontier, the responder terminal-trap singleton indicator in the exact normalized post-action WSL equals supportGuard*(Phi_A(source,{f,y})-Phi_A(source,{f})), where other hypothetical A-owner cells are zero; this is the existing true WSL Shannon cofactor evaluated at just two source sites.",
 noFullGameStateEnumeration:true,localPhysicalTwoPlyControls:7,childStrategicWLDValuesEvaluated:0,
 knownSolvedResultsPremises:false,rootWLDWithoutSearchStillOpen:true,
 CI:"NOT_RUN",externalFormalChecker:"NOT_RUN"
};
console.log(JSON.stringify(report,null,2));