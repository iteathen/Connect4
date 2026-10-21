// ORIGINAL Connect4 7x6 K4 geometry only; historical strong28 is a HELD-OUT label.
// Conditional five-center opening & ply41 terminal landing shape are not root
// perfect-play conclusions. Exact 28-clause hitting core and legal DRAW control.
// No Connect Four game solver, oracle, or recursive game valuation.
import assert from 'node:assert/strict';
const W=7,H=6,DIR=[['H',1,0],['V',0,1],['R',1,1],['F',1,-1]];
const id=(c,r)=>r*W+c;
const lines=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [o,dx,dy] of DIR){
 const cells=Array.from({length:4},(_,i)=>[c+i*dx,r+i*dy]);
 if(cells.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
  lines.push({o,cells,ids:cells.map(([x,y])=>id(x,y))});
}
assert.equal(lines.length,69);
const F=new Set(Array.from({length:W},(_,c)=>[id(c,4),id(c,5)]).flat().filter(x=>x!==id(3,4)));
const centerP1=new Set([id(3,1),id(3,3)]);
const T=lines.filter(l=>l.ids.some(e=>F.has(e))&&!l.ids.some(e=>centerP1.has(e)));
assert.equal(F.size,13);assert.equal(T.length,28);

// Seven pairwise vertex-disjoint original winlines provide a literal dual
// packing certificate: any P1 blocker hitting every T line has >=7 cells.
const pack=[0,1,2,4,5,6].map(c=>{
 const start=c===6?2:1;
 return Array.from({length:4},(_,r)=>id(c,start+r));
});
pack.push([1,2,3,4].map(c=>id(c,5)));
const canon=L=>L.slice().sort((a,b)=>a-b).join(',');
const Tkeys=new Set(T.map(l=>canon(l.ids)));
assert(pack.every(l=>Tkeys.has(canon(l))));
assert.equal(new Set(pack.flat()).size,28);

// Seven CELL original P1 static blocker witness achieves minimum7.
const static7=[[0,2],[2,3],[4,3],[1,4],[5,4],[6,4],[3,5]].map(([c,r])=>id(c,r));
assert.equal(new Set(static7).size,7);
assert(T.every(l=>l.ids.some(e=>static7.includes(e))));

// F-only defense: brute-force just 2^13 STATIC bitmasks, NOT game histories.
const Fs=[...F].sort((a,b)=>a-b);
const hist={};let optimum=Infinity,minimumSets=[];
for(let mask=0;mask<1<<13;mask++){
 const C=new Set(Fs.filter((e,i)=>Boolean(mask&(1<<i))));
 if(!T.every(l=>l.ids.some(e=>C.has(e))))continue;
 const size=C.size;
 hist[size]=(hist[size]||0)+1;
 if(size<optimum){optimum=size;minimumSets=[C]}
 else if(size===optimum)minimumSets.push(C);
}
assert.equal(optimum,8);
assert.equal(minimumSets.length,1);
assert.deepEqual(hist,{8:1,9:5,10:10,11:10,12:5,13:1});
const must=minimumSets[0];
// DIRECT algebraic factorization proof: mandatory sites each have >=1
// line touching F in exactly that ONE site. Every original T-line touches
// at least one of these forced sites. Thus the full 28-clause F-only
// Boolean cover polynomial equals PRODUCT of eight mandatory variables.
const singleton=new Map;
for(const l of T){
 const s=l.ids.filter(e=>F.has(e));
 if(s.length===1)singleton.set(s[0],(singleton.get(s[0])||0)+1);
}
assert.equal(singleton.size,8);
assert.deepEqual(new Set(singleton.keys()),must);
assert(T.every(l=>l.ids.some(e=>must.has(e))));

// 26 actual firstwin-free fully legal DRAWs sharing the historical five
// center-column opening. Static phase generation uses no strategic oracle.
const draws=[];
for(let mask=0;mask<1<<W;mask++){
 const eps=Array.from({length:W},(_,c)=>(mask>>c)&1);
 if(eps[3]!==0)continue; // P0 occupies center row1
 const owner=(c,r)=>(eps[c]+r)%2;
 if(lines.some(l=>l.cells.every(([c,r])=>owner(c,r)===owner(...l.cells[0]))))continue;
 const p1=Array.from({length:W},(_,c)=>c).filter(c=>eps[c]===1);
 const p0=Array.from({length:W},(_,c)=>c).filter(c=>eps[c]===0&&c!==3);
 const word=[3,3,3,3,3,...p1.flatMap(c=>Array(6).fill(c)),3,...p0.flatMap(c=>Array(6).fill(c))];
 assert.equal(word.length,42);
 const board=Array(W*H).fill(-1),heights=Array(W).fill(0);
 for(let t=0;t<42;t++){
  const c=word[t],r=heights[c]++;
  assert(r<6);assert.equal(owner(c,r),t%2);
  board[id(c,r)]=t%2;
  assert(!lines.some(l=>l.ids.every(x=>board[x]===t%2)),'no earlier actual win');
 }
 assert(heights.every(h=>h===6));
 draws.push({bottomOwnerBits:eps.join(''),oneBasedWord:word.map(c=>c+1).join('')});
}
assert.equal(draws.length,26);
const xy=e=>[e%W+1,Math.floor(e/W)+1];
const payload={
 schema:1,date:'2026-10-20',
 scope:'TRUE W7xH6 original 69 K4; candidate late terminal T28 conditioned on first-five center and P0 ply41; no source root game-value proof',
 originalLines:69,candidateTerminalSourceLines:28,eligibleLastLandingSites:13,
 originalSevenLineDisjointPacking:pack.map(l=>l.map(xy)),
 originalSevenCellStaticHittingSet:static7.map(xy),
 globalStaticBlockingNumber:7,
 eligibleLandingRestrictedStaticBlockingNumber:8,
 uniqueEightForcedLandingBlockers:[...must].sort((a,b)=>a-b).map(xy),
 eligibleLandingSingletonClauseMultiplicities:[...singleton].sort((a,b)=>a[0]-b[0]).map(([e,m])=>({site:xy(e),nClauses:m})),
 hittingCoverSubsetCounts:hist,enumeratedLandingSubsets:8192,
 exactBooleanSimplification:'AND of 28 original terminal line-cover clauses restricted to the eligible 13 last sites is IDENTICALLY the AND of eight singleton compulsory-site variables, with five unconstrained remaining F variables.',
 explicitDrawsWithFiveCenterFirst:{count:draws.length,example:draws.find(x=>x.bottomOwnerBits==='0010001'),
 firstWinFreeAll26:true},
 meaning:[
  'Historical 28 terminal line labels are a discovery target/validation, never a theorem premise proving P0 optimality.',
  'Even five initial center-column drops do not force one of the 28 line events on every legally possible path: all26 supplied literal games are draws, requiring strategically inferior P0 continuation.',
  'Blocking all 28 terminal candidate lines with P1 cells somewhere takes min7 STATIC sites, and with P1 cells only on the 13 candidate final landing sites takes a unique mandatory 8-core. Both disregard legal chronology and optimal replies.',
  'The next independent proof target is an ONLINE, gravity/owner/turn/firstwin impossibility of maintaining all necessary defensive obligations against perfectly controlling P0, not unconditional static UNSAT of the 28 cover clauses.'
 ]
};
process.stdout.write(JSON.stringify(payload,null,2)+'\n');
