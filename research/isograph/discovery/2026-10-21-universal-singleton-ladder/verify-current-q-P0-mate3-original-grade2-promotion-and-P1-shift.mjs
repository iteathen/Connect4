#!/usr/bin/env node
// Current-q ORIGINAL W7/W6 H6 K4 source mate-in-3 Boolean formula.
// All 69/54 physical H/V/rising/falling source lines; no historic28 IDs,
// no Connect4 solver or recursively valued successor states in producer.
// Separate literal physical P0/P1/P0 at-most-three-ply ray control.
import assert from 'node:assert/strict';
const H=6,D=[['H',1,0],['V',0,1],['R',1,1],['F',1,-1]];
function geometry(W){
 const lines=[];
 for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [o,dc,dr] of D){
  const pts=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
  if(pts.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
   lines.push({o,pts,ids:pts.map(([x,y])=>x+W*y)});
 }
 assert.equal(lines.length,W===7?69:54);return{W,lines};
}
const key=(x,y)=>x<y?x+','+y:y+','+x;
function blank(w){return {b:Array(w.W*H).fill(-1),h:Array(w.W).fill(0),n:0,terminal:false};}
function gravity(q,w){return q.h.flatMap((r,c)=>r<H?[c+w.W*r]:[]);}
function ray(b,e,p,w){
 const W=w.W,c=e%W,r=Math.floor(e/W);
 for(const [,dc,dr] of D){
  let n=1;
  for(const sg of [-1,1]){
   let x=c+sg*dc,y=r+sg*dr;
   while(x>=0&&x<W&&y>=0&&y<H&&b[x+W*y]===p){
    n++;x+=sg*dc;y+=sg*dr;
   }
  }
  if(n>=4)return true;
 }
 return false;
}
function physical(q,col,w){
 assert(!q.terminal&&col>=0&&col<w.W&&q.h[col]<H);
 const b=q.b.slice(),h=q.h.slice(),p=q.n%2,e=col+w.W*h[col]++;
 b[e]=p;const win=ray(b,e,p,w);
 assert.equal(win,w.lines.some(L=>L.ids.every(x=>b[x]===p)));
 return {b,h,n:q.n+1,terminal:win,last:e};
}
// Build SOURCE CURRENT-q owner K4 grade1 and grade2 cofactors ONCE,
// never inspect future physical owner assignments in sourceProducer.
function fields(q,w){
 const U0=new Set,U1=new Set,V0=new Set;
 for(const L of w.lines){
  let a=0,b=0,empty=[];
  for(const e of L.ids){
   if(q.b[e]===0)a++;
   else if(q.b[e]===1)b++;
   else empty.push(e);
  }
  if(!b){
   if(a===3&&empty.length===1)U0.add(empty[0]);
   if(a===2&&empty.length===2)V0.add(key(empty[0],empty[1]));
  }
  if(!a&&b===3&&empty.length===1)U1.add(empty[0]);
 }
 return {U0,U1,V0};
}
// For a given source current P0 choice x, the new immediate/latent
// grade1 coefficients are computed by U0'(e)=U0(e) OR V0(x,e).
// A P1 move overwrites just one current target bit from its next-up
// latent coefficient. This is fixed Boolean algebra, not minimax WDL.
function sourceMate3(q,w){
 assert(q.n%2===0&&!q.terminal);
 const {U0,U1,V0}=fields(q,w),actions=[];
 for(const x of gravity(q,w)){
  const c=x%w.W;
  if(U0.has(x)){actions.push({col:c+1,forced:true,immediate:true});continue;}
  const hh=q.h.slice();hh[c]++;
  const allowed=hh.flatMap((r,d)=>r<H?[d+w.W*r]:[]);
  const afterU0=e=>U0.has(e)||V0.has(key(x,e));
  const S=new Set(allowed.filter(e=>afterU0(e)).map(e=>e%w.W));
  const E=new Set(allowed.filter(e=>U1.has(e)).map(e=>e%w.W));
  const L=new Set(allowed.filter(e=>Math.floor(e/w.W)+1<H&&afterU0(e+w.W)).map(e=>e%w.W));
  const forced=E.size===0&&allowed.every(e=>{
   const d=e%w.W;
   return [...S].some(j=>j!==d)||L.has(d);
  });
  actions.push({col:c+1,forced,immediate:false});
 }
 return {Mate3:actions.some(a=>a.forced),winningCurrentMoves:actions.filter(a=>a.forced).map(a=>a.col),actions};
}
// INDEPENDENT checker: only real original P0 x, P1 y, P0 z
// FIRSTWIN races up to 3 plies, not future overall WDL.
function physicalThree(q,w){
 const choices=[];
 for(const x of gravity(q,w)){
  const q1=physical(q,x%w.W,w);
  if(q1.terminal){choices.push({col:x%w.W+1,forced:true,immediate:true});continue;}
  let always=true;
  for(const y of gravity(q1,w)){
   const q2=physical(q1,y%w.W,w);
   if(q2.terminal){always=false;break;}
   if(!gravity(q2,w).some(z=>physical(q2,z%w.W,w).terminal)){
    always=false;break;
   }
  }
  choices.push({col:x%w.W+1,forced:always,immediate:false});
 }
 return choices;
}
function verify(q,w,counts){
 const algebra=sourceMate3(q,w),physical=physicalThree(q,w);
 assert.deepEqual(algebra.actions,physical);
 counts.positions++;counts.P0CandidateActions+=physical.length;
 counts.P0Mate3States+=+algebra.Mate3;
 counts.P0WinningCurrentMoves+=algebra.winningCurrentMoves.length;
 const old=fields(q,w);
 for(const x of gravity(q,w)){
  if(old.U0.has(x))continue;
  const after=physicalMoveOne(q,x,w);
  const now=fields(after,w);
  const expected=new Set([...old.U0].filter(e=>e!==x));
  for(const pair of old.V0){
   const [a,b]=pair.split(',').map(Number);
   if(a===x)expected.add(b);
   if(b===x)expected.add(a);
  }
  assert.deepEqual([...now.U0].sort((a,b)=>a-b),[...expected].sort((a,b)=>a-b));
  assert.deepEqual([...now.U1].sort((a,b)=>a-b),[...old.U1].filter(e=>e!==x).sort((a,b)=>a-b));
  counts.grade2PromotionChecks++;
 }
}
function physicalMoveOne(q,x,w){
 const out=physical(q,x%w.W,w);assert(!out.terminal);return out;
}
function replay(word,w){
 let q=blank(w);
 for(const s of word){
  q=physical(q,Number(s)-1,w);assert(!q.terminal);
 }
 return q;
}
let rng=0x413b92ad;
function randomInt(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return(rng>>>0)%n;}
const report={schema:1,date:'2026-10-21',
 status:'ORIGINAL_SOURCE_CURRENT_Q_GRADE2_TO_GRADE1_PLUS_SINGLETON_LADDER_P0_MATE3',
 noSolversOrHistorical28:true,boards:{}};
for(const [W,N] of [[7,180],[6,110]]){
 const w=geometry(W);
 const counts={positions:0,P0CandidateActions:0,P0Mate3States:0,
  P0WinningCurrentMoves:0,grade2PromotionChecks:0,seededGames:N};
 const early={};
 for(const word of ['', '44','4451','4444']){
  const q=replay(word,w);
  verify(q,w,counts);early[word||'EMPTY']=sourceMate3(q,w).winningCurrentMoves;
 }
 const after445={};
 for(let d=1;d<=W;d++){
  const q=replay('445'+d,w);
  verify(q,w,counts);after445[d]=sourceMate3(q,w).winningCurrentMoves;
 }
 for(let i=0;i<N;i++){
  let q=blank(w),until=5+randomInt(W*H-4);
  for(let j=0;j<until&&!q.terminal;j++){
   const f=gravity(q,w);
   if(!f.length)break;
   q=physical(q,f[randomInt(f.length)]%W,w);
   if(!q.terminal&&q.n%2===0)verify(q,w,counts);
  }
 }
 report.boards[W+'x6']={...counts,early,after445,
  safeP1Move4ToAvoidP0Mate3:Object.entries(after445)
   .filter(([,moves])=>moves.length===0).map(([d])=>Number(d))};
}
assert.deepEqual(report.boards['7x6'].safeP1Move4ToAvoidP0Mate3,[3,6]);
assert.deepEqual(report.boards['6x6'].safeP1Move4ToAvoidP0Mate3,[2,3,6]);
process.stdout.write(JSON.stringify(report,null,2)+'\n');
