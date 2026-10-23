"use strict";
/**
 * Uniform ORIGINAL 7x6 source H-row adjacency support-frontier theorem.
 * Conditional board q: A owns three right cells at original H K4 row r,
 * D owns same three right columns on row r+1, left column h=r-2,
 * both target left cells are EMPTY, A to move, source LIVE.
 *
 * At q both A lower {left,r} and D upper {left,r+1} are possibly
 * already MINIMAL singleton WSL obligations but not physically playable.
 * A lower support (left,r-1) -> makes A singleton playable.
 * D blocking A at (left,r) -> makes D upper singleton playable.
 * A blocking D at (left,r+1) -> removes D upper winning cell.
 *
 * Tests all 16 actual original geometry window coordinates (not states),
 * one real original7x6 rank14 source and its forced two action guards,
 * all true original69 K4 and independent directional rays.
 */
const must=(v,msg)=>{if(!v)throw Error("C4_H3_REFLECT "+msg)};
const W=7,H=6,dirs=[["H",1,0],["V",0,1],["R",1,1],["F",1,-1]],lines=[];
for(const[tag,dx,dy]of dirs)for(let c=0;c<W;c++)for(let r=0;r<H;r++){
 const sites=[];
 for(let k=0;k<4;k++){
  const x=c+k*dx,y=r+k*dy;
  if(x<0||x>=W||y<0||y>=H){sites.length=0;break;}
  sites.push([x,y]);
 }
 if(sites.length===4)lines.push({tag,sites});
}
must(lines.length===69,"69 original physical K4");
const histogram=Object.fromEntries(["H","V","R","F"].map(t=>[t,lines.filter(v=>v.tag===t).length]));
must(JSON.stringify(histogram)===JSON.stringify({H:24,V:21,R:12,F:12}),"orientation inventory original");
const hex=(x,y)=>lines.find(v=>v.tag==="H"&&v.sites[0][0]===x&&v.sites[0][1]===y);
const formalGeometry=[];
for(let start=0;start<=3;start++)for(let r=1;r<=4;r++){
 const lower=hex(start,r),upper=hex(start,r+1);
 must(lower&&upper,"both original consecutive physical H K4s");
 const a=[start,r-1],d=[start,r],u=[start,r+1];
 must(r-1>=0&&r+1<6,"all three source real row coordinates");
 must(lower.sites.every(([c,rr],i)=>c===start+i&&rr===r),"lower true H window");
 must(upper.sites.every(([c,rr],i)=>c===start+i&&rr===r+1),"upper true H window");
 must(d[1]===a[1]+1&&u[1]===d[1]+1,"gravity claim sites sequential");
 const lowerRight=lower.sites.slice(1),upperRight=upper.sites.slice(1);
 must(lowerRight.every(z=>!upperRight.some(v=>v.join(",")===z.join(","))),"distinct physical owner cells");
 formalGeometry.push({startColumn:start+1,lowerRow:r+1,upperRow:r+2,
  initialLeftColumnHeight:r-1,firstAPlayableSite:[a[0]+1,a[1]+1],
  nextDBlockingSite:[d[0]+1,d[1]+1],nextACounterBlockSite:[u[0]+1,u[1]+1]});
}
must(formalGeometry.length===16,"all 4 starts x4 physically legal row pairs verified");
const fresh=()=>({h:Array(7).fill(0),owner:Array.from({length:7},()=>Array(6).fill(-1))});
const win=(q,p)=>lines.filter(L=>L.sites.every(([c,r])=>q.owner[c][r]===p));
function ray(q,c,r,p){
 for(const[tag,dx,dy]of dirs){
  let n=1;
  for(const sg of [-1,1])for(let k=1;k<4;k++){
   const x=c+sg*k*dx,y=r+sg*k*dy;
   if(x<0||x>=W||y<0||y>=H||q.owner[x][y]!==p)break;
   n++;
  }
  if(n>=4)return true;
 }
 return false;
}
function play(q,col,p){
 const c=col-1,r=q.h[c];
 must(r<H,"legal gravity landing");
 q.h[c]++;q.owner[c][r]=p;
 const w=win(q,p);
 must(Boolean(w.length)===ray(q,c,r,p),"original69/ray same FIRSTWIN");
 return {col,row:r+1,who:p,firstwin:Boolean(w.length)};
}
const bit=(c,r)=>1n<<BigInt(7*r+c);
function minWSL(q,p) {
 const u=new Map();
 for(const L of lines){
  if(L.sites.some(([c,r])=>q.owner[c][r]===1-p))continue;
  let mask=0n;
  for(const[c,r]of L.sites)if(q.owner[c][r]===-1)mask|=bit(c,r);
  if(mask&&!u.has(String(mask)))u.set(String(mask),mask);
 }
 const U=[...u.values()];
 return U.filter(m=>!U.some(n=>n!==m&&(m&n)===n));
}
function scalar(q,p,c,row){
 return Number(minWSL(q,p).some(mask=>mask===bit(c-1,row-1)));
}
function firstwins(q,p){
 return Array.from({length:7},(_,i)=>i).filter(c=>q.h[c]<6&&minWSL(q,p).some(m=>m===bit(c,q.h[c]))).map(c=>c+1);
}
const source=fresh(),word="42142544223333";
for(let ply=0;ply<word.length;ply++)must(!play(source,Number(word[ply]),ply&1).firstwin,"real original source prefixes live");
must(source.h.join(",")==="1,4,4,4,1,0,0","source q14 actual heights");
must(source.owner[1][2]===0&&source.owner[2][2]===0&&source.owner[3][2]===0,
 "P0 owns lower H right triple row3 c2,c3,c4");
must(source.owner[1][3]===1&&source.owner[2][3]===1&&source.owner[3][3]===1,
 "P1 owns upper H right triple row4 c2,c3,c4");
must(source.h[0]===1&&scalar(source,0,1,3)===1&&scalar(source,1,1,4)===1,
 "both source H missing left singleton masks exist but are NOT yet playable");
must(firstwins(source,0).length===0&&firstwins(source,1).length===0,
 "neither player has an immediately playable terminal K4 before frontier advance");
const events=[],field=[{rank:14,leftHeight:source.h[0],P0CurrentWins:firstwins(source,0),P1CurrentWins:firstwins(source,1)}];
for(const [col,p]of [[1,0],[1,1],[1,0]]){
 const evt=play(source,col,p);
 must(!evt.firstwin,"three prescribed ladder moves live and blocking");
 events.push(evt);
 field.push({rank:14+events.length,leftHeight:source.h[0],
  P0CurrentWins:firstwins(source,0),P1CurrentWins:firstwins(source,1),
  P0LowerSingleton:scalar(source,0,1,3),
  P1UpperSingleton:scalar(source,1,1,4)});
}
must(field[1].P0CurrentWins.join(",")==="1"&&field[1].P1CurrentWins.length===0,
 "A lower support exposes A current immediate win cell r3");
must(field[2].P1CurrentWins.join(",")==="1"&&field[2].P0CurrentWins.length===0,
 "D claimed r3, blocks A and advances D upper r4 current immediate win");
must(field[3].P1CurrentWins.length===0&&field[3].P0CurrentWins.length===0,
 "A claims r4 and blocks D upper original K4 without itself firstwinning");
must(field[1].P1UpperSingleton===1&&field[2].P1UpperSingleton===1&&field[3].P1UpperSingleton===0,
 "D upper K4 singleton source preexists; gravity readiness changes until A blocks");
const result={
 schema:"c4.original7x6_adjacent_horizontal_3run_gravity_threat_reflection.v1",
 status:"EXACT_ORIGINAL7X6_LOWER_A_H3_TO_UPPER_D_H3_THREAT_REFLECTION_ON_GRAVITY_FRONTIER",
 geometry:histogram,
 uniformConditionalTheorem:"On any genuine LIVE original7x6 board with A next, original lower H K4 three right A stones, adjacent upper H K4 three right D stones, and first-column occupied height exactly physical r-2, actual A first lower-support placement makes A remaining lower cell immediately playable as a WIN; D claiming that lower cell to block without D already FIRSTWINNING makes D remaining upper cell immediately playable as a WIN; A must own upper cell to block if it has no other FIRSTWIN. The upper D singleton preexisted in residual field: this is an exact GRAVITY READINESS transfer, not creation of a new owner-residual K4 mask.",
 allActualOriginalTwoAdjacentHWindowGeometryControls:formalGeometry,
 actualOriginal7x6SourceHistory:word,
 actualOriginalSource14SupportBeforeLadder:[1,4,4,4,1,0,0],
 actualRealPlayerOwnerTriple:{
  lowerOwnerP0Row3:[[2,3],[3,3],[4,3]],
  upperOwnerP1Row4:[[2,4],[3,4],[4,4]],
  leftColumnBeforeHeight:1,
  actualNextMoves:[1,1,1]},
 physicalSequence:events,
 ownerLabeledImmediateFirstwinFields:field,
 q17AfterWord:word+"111",
 noPerfectPlayWLDInferred:true,noOpponentGameTreeEvaluated:true,
 solvedValuesUsed:false,CI:"NOT_RUN"
};
console.log(JSON.stringify(result,null,2));