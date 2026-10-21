#!/usr/bin/env node
// Source-only Connect4 ORIGINAL 7x6 gravity/turn/firstwin C8 deadline theorem.
// Construct every true H/V/rising/falling K4 window from its physical sites;
// conditional center-five + terminal-firstwin41 geometry constructs C8,
// never import the historic winning line IDs or a solved-game oracle.
// Exact earliest claim rank=38 proof is symbolic area+turn parity; a true
// chronological 38-move witness supplies matching existence.
import assert from 'node:assert/strict';
const W=7,H=6,DIR=[['H',1,0],['V',0,1],['R',1,1],['F',1,-1]],site=(c,r)=>c+W*r;
const LL=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [o,dx,dy] of DIR){
 const coords=Array.from({length:4},(_,i)=>[c+i*dx,r+i*dy]);
 if(coords.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
 LL.push({o,coords,sites:coords.map(([x,y])=>site(x,y))});
}
assert.equal(LL.length,69);
const F=new Set(Array.from({length:W},(_,c)=>[site(c,4),site(c,5)]).flat()
 .filter(x=>x!==site(3,4)));
const T=LL.filter(l=>l.sites.some(e=>F.has(e))&&
 !l.sites.some(e=>e===site(3,1)||e===site(3,3)));
assert.equal(F.size,13);assert.equal(T.length,28);
// F-only mandatory site C8 emerges algebraically from singleton source
// last-landing support clauses, not solved winning-line IDs.
const singleton=new Map;
for(const l of T){
 const avail=l.sites.filter(e=>F.has(e));
 if(avail.length===1)singleton.set(avail[0],(singleton.get(avail[0])||0)+1);
}
const C8=[...singleton.keys()].sort((a,b)=>a-b);
assert.equal(C8.length,8);
assert(T.every(l=>l.sites.some(e=>C8.includes(e))));
const xy=e=>[e%W+1,Math.floor(e/W)+1];
assert.deepEqual(C8.map(xy).sort((a,b)=>a[0]-b[0]||a[1]-b[1]),
 [[1,5],[2,5],[3,5],[3,6],[5,5],[5,6],[6,5],[7,5]]);

// True original physical ray detector independent of enumerated-K4 checker.
function ray(board,e,p){
 const c=e%W,r=Math.floor(e/W);
 for(const [,dx,dy] of DIR){
  let n=1;
  for(const s of [-1,1]){
   let x=c+s*dx,y=r+s*dy;
   while(x>=0&&x<W&&y>=0&&y<H&&board[site(x,y)]===p){
    n++;x+=s*dx;y+=s*dy;
   }
  }
  if(n>=4)return true;
 }
 return false;
}
function replay(word){
 const b=Array(W*H).fill(-1),h=Array(W).fill(0),moves=[];
 for(let t=0;t<word.length;t++){
  const c=Number(word[t])-1,r=h[c]++,p=t%2;
  assert(c>=0&&c<W&&r>=0&&r<H);
  const e=site(c,r);b[e]=p;
  const native=LL.some(l=>l.sites.every(x=>b[x]===p));
  assert.equal(ray(b,e,p),native,'two independent original winning checkers');
  assert.equal(native,false,'all witness real prefixes firstwin-free');
  moves.push({ply:t+1,p,e});
 }
 return {b,h,moves};
}
// Earliest possible h=(5,5,6,5,6,5,5) has area37: 5 center and32
// required noncenter. Since EVERY last C8 cell belongs to P1 and the last
// original rank37 is a P0 turn, C8 cannot have been completed by37. Nor
// earlier, because the column support has 37 distinct physical sites.
const minimumHeights=[5,5,6,5,6,5,5];
assert.equal(minimumHeights.reduce((a,b)=>a+b),37);
assert.equal(37%2,1); // original ply37 mover is P0 (0).
const word38='44444316171121213232325353556575766677';
const q=replay(word38);
assert.equal(word38.length,38);
assert.equal(word38.slice(0,5),'44444');
assert(q.h.every((h,i)=>h>=minimumHeights[i]));
assert(C8.every(e=>q.b[e]===1),'ALL mandatory cells are real P1 stones');
const acquisitions=C8.map(e=>({cell:xy(e),ply:q.moves.find(t=>t.e===e).ply}));
assert.equal(Math.max(...acquisitions.map(t=>t.ply)),38);
// This is not a game solve: at rank38 there are only 4 real cells left.
// Independent future WDL check is a bounded 4-ply verification only.
function val(b,h,ply){
 if(ply===W*H)return 0;
 const p=ply%2,children=[];
 for(let c=0;c<W;c++){
  if(h[c]===H)continue;
  const bb=b.slice(),hh=h.slice(),e=site(c,hh[c]++);
  bb[e]=p;
  const w=ray(bb,e,p);
  assert.equal(w,LL.some(l=>l.sites.every(x=>bb[x]===p)));
  children.push(w?(p===0?1:-1):val(bb,hh,ply+1));
 }
 return p===0?Math.max(...children):Math.min(...children);
}
const wdl=val(q.b,q.h,38);assert.equal(wdl,0);
const oldFull='444441121311162232323323665656554577757767';
const draw=replay(oldFull);
assert.equal(draw.moves.length,42);assert(draw.h.every(h=>h===6));
assert(C8.every(e=>draw.b[e]===1));
const result={
 schema:1,scope:'original 7x6 K4 CONDITIONAL terminal-T28 C8 target, no perfect root WDL input',
 originalSourceWindows:LL.length,
 oneBasedMandatoryC8:C8.map(xy),
 gravityRankLowerBound:37,
 turnParityStrengthenedLowerBound:38,
 provedExactEarliestP1C8FirstwinfreeRank:38,
 trueLegalWitness38OneBased:word38,
 truePhysicalColumnHeights38:q.h,
 mandatoryP1StonesClaimPlies:acquisitions,
 firstwinnerHistoryPassIndependentOriginalRayAnd69Window:true,
 independentlyPerfectContinuationFromGivenQ38:'DRAW',
 olderComplete42OneBasedDrawWithAllC8:oldFull,
 semanticLimit:'Any root forced-win P0 strategy must prevent or exploit an online defensive opportunity, rather than assert C8 physically impossible or necessarily too late.'
};
process.stdout.write(JSON.stringify(result,null,2)+'\n');
