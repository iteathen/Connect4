#!/usr/bin/env node
// Research-only source proof audit; ORIGINAL 7x6 K4 firstwin/gravity.
// All P1 choices until ply6 are verification of a pre-proved P0 policy,
// not a Connect4 root solver or a historical game-value dependency.
import assert from 'node:assert/strict';
const W=7,H=6,DIR=[['H',1,0],['V',0,1],['R',1,1],['F',1,-1]];
function sourceLines(width){
 const lines=[];
 for(let c=0;c<width;c++)for(let r=0;r<H;r++)for(const [dir,dc,dr] of DIR){
  const pts=Array.from({length:4},(_,i)=>[c+i*dc,r+i*dr]);
  if(pts.every(([x,y])=>x>=0&&x<width&&y>=0&&y<H))
   lines.push({dir,pts});
 }
 return lines;
}
const L=sourceLines(W);assert.equal(L.length,69);
assert.equal(sourceLines(6).length,54);
function empty(){return {h:Array(W).fill(0),b:Array.from({length:H},()=>Array(W).fill(-1)),ply:0};}
function move(q,col){
 const c=col-1,p=q.ply%2,r=q.h[c]++;
 assert(c>=0&&c<W&&r>=0&&r<H);
 q.b[r][c]=p;q.ply++;
 return {ply:q.ply,p,col,row:r+1,
  win:L.filter(({pts})=>pts.every(([x,y])=>q.b[y][x]===p)).map(l=>l.pts)};
}
function replay(word){
 const q=empty(),events=[];
 for(const x of word)events.push(move(q,Number(x)));
 return {q,events};
}
const rowCover={};
for(const w of [6,7]){
 const spans=Array.from({length:w-3},(_,j)=>Array.from({length:4},(_,i)=>j+i));
 const valid=[];
 for(let m=0;m<1<<w;m++){
  if(m&(1<<3))continue;
  const cells=Array.from({length:w},(_,c)=>c).filter(c=>m&(1<<c));
  if(spans.every(s=>s.some(c=>cells.includes(c))))valid.push(cells);
 }
 const min=Math.min(...valid.map(v=>v.length));
 rowCover[w]={winSpans:spans.length,minimumP1Blockers:min,
  minimumSites:valid.filter(v=>v.length===min).map(v=>v.map(c=>c+1))};
}
assert.equal(rowCover[6].minimumP1Blockers,1);
assert.equal(rowCover[7].minimumP1Blockers,2);
assert.equal(rowCover[7].minimumSites.length,6);
let earlyP1Pairs=0,repairOn4=0,repairOn6=0,P0WinOn7=0;
const selectedWings={};
for(let p2=1;p2<=7;p2++){
 const wing=p2<=4?[5,6,7]:[3,2,1];selectedWings[p2]=wing;
 for(let p4=1;p4<=7;p4++){
  const q=empty();
  assert.equal(move(q,4).win.length,0);
  assert.equal(move(q,p2).win.length,0);
  assert.equal(move(q,wing[0]).win.length,0);
  const p4event=move(q,p4);assert.equal(p4event.win.length,0);earlyP1Pairs++;
  if(p4event.row===1&&wing.includes(p4)){repairOn4++;continue}
  assert.equal(q.h[wing[1]-1],0);
  assert.equal(move(q,wing[1]).win.length,0);
  for(let p6=1;p6<=7;p6++){
   const t={h:q.h.slice(),b:q.b.map(x=>x.slice()),ply:q.ply};
   const p6event=move(t,p6);assert.equal(p6event.win.length,0);
   if(p6event.row===1&&wing.includes(p6)){repairOn6++;continue}
   assert.equal(t.h[wing[2]-1],0);
   const win=move(t,wing[2]);
   assert.equal(win.p,0);assert(win.win.length>0);
   assert(win.win.some(pts=>{
    const need=[4,...wing].sort((a,b)=>a-b).join();
    return pts.every(([c,r])=>r===0)&&pts.map(([c])=>c+1).sort((a,b)=>a-b).join()===need;
   }));
   P0WinOn7++;
  }
 }
}
assert.equal(earlyP1Pairs,49);
assert.equal(repairOn4,14);
assert.equal(repairOn6,35);
assert.equal(P0WinOn7,210);
const policyFailures=[];
for(const word of ['4355667','4511223']){
 const {events}=replay(word);
 assert(events.slice(0,-1).every(e=>e.win.length===0));
 assert.equal(events.at(-1).ply,7);
 assert.equal(events.at(-1).p,0);
 assert.equal(events.at(-1).win.length,1);
 policyFailures.push({literalWord:word,winMove:7,winK4:events.at(-1).win[0].map(([c,r])=>[c+1,r+1])});
}
const draw=replay('444443333337777774111111222222555555666666');
assert(draw.events.every(e=>e.win.length===0));
assert(draw.q.h.every(h=>h===H));
const blockers=[1,3,5].map(r=>({row:r,P0center:draw.q.b[r-1][3]===0,
 P1columns:Array.from({length:W},(_,c)=>c+1).filter(c=>c!==4&&draw.q.b[r-1][c-1]===1)}));
assert(blockers.every(x=>x.P0center&&x.P1columns.length>=2));
const qq=replay('44546714');
assert(qq.events.every(e=>e.win.length===0));
const immediate={P0:[],P1:[]};
for(let c=0;c<W;c++)if(qq.q.h[c]<H){
 const landing=[c,qq.q.h[c]];
 for(const p of [0,1]){
  if(L.some(l=>l.pts.some(([x,y])=>x===landing[0]&&y===landing[1])&&
    l.pts.every(([x,y])=>(x===landing[0]&&y===landing[1])||qq.q.b[y][x]===p)))
   immediate[p?'P1':'P0'].push([c+1,qq.q.h[c]+1]);
 }
}
assert(immediate.P0.some(c=>c.join()==='3,1'));
assert(immediate.P1.some(c=>c.join()==='4,5'));
const P0finish=move(qq.q,3);assert.equal(P0finish.win.length,1);
const result={schema:1,date:'2026-10-21',status:'SOURCE_EXACT_ONLINE_P1_LATERAL_REPAIR_OR_P0_FIRSTWIN7',
 original7K4:69,original6K4:54,rowCover,
 rootFirstP0Column:4,afterP1FirstMoveWingChoice:selectedWings,
 P1FirstResponses:7,P1RepliesPly2AndPly4:earlyP1Pairs,
 P1AlreadyRepairsByPly4:repairOn4,P1RepairsOnPly6AfterNoEarlyRepair:repairOn6,
 remainingP1RepliesWithoutRepairLeadingToOriginalP0WinOnPly7:P0WinOn7,
 originalP1WinsOnOrBeforePly6:0,
 inheritedSixWideDefenseMirrorFalsifiers:policyFailures,
 legalFirstFiveCenterDrawCounterexample:{
  fullOneBasedWord:'444443333337777774111111222222555555666666',
  P1BlockersOnOriginalP0CenterRows:blockers,
  actualFirstwinnerEvents:0},
 rank8OpponentCounterThreat:{prefixOneBased:'44546714',immediateSites:immediate,
  P0ToMoveCanFirstwinPly9AtColumn:3,
  warning:'A P1 vertical WIN on ply10 after P0 nonwinning column2 on ply9 is not a valid P1 optimal-defense counterexample, because P0 has an immediate ply9 WIN at column3.'},
 theorem:'After P0 center first, P0 chooses an untouched wing and may occupy its three bottom cells on turns3/5/7. P1 must take a first-entry bottom wing cell by ply6 or P0 firstwins on7. This is one necessary early defense repair, NOT a root forced P0 WIN.'
};
console.log(JSON.stringify(result,null,2));
