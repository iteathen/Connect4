import assert from 'node:assert/strict';

const W=7,H=6,K=4;
const lines=[];
for(let r=1;r<=H;r++)for(let c=1;c<=W;c++)for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
  const L=[];
  for(let i=0;i<K;i++){
    const x=c+i*dx,y=r+i*dy;
    if(x<1||x>W||y<1||y>H){L.length=0;break;}
    L.push([x,y]);
  }
  if(L.length===K)lines.push(L);
}
assert.equal(lines.length,69);

function play(seq){
  const h=Array(W+1).fill(0),p0=new Set(),p1=new Set();
  for(let i=0;i<seq.length;i++){
    const c=seq[i];
    const cell=`${c},${++h[c]}`;
    (i%2===0?p0:p1).add(cell);
  }
  return {h,p0,p1,toMove:seq.length%2};
}
const cell=(c,r)=>`${c},${r}`;
const owner=(s,c,r)=>s.p0.has(cell(c,r))?'P0':s.p1.has(cell(c,r))?'P1':null;
const playable=(s,c,r)=>s.h[c]+1===r;

// D1 E1 A1: if P1 wants to keep the A-even Claimeven certificate,
// the triggered response is uniquely A2.
const afterA1=play([4,5,1]);
assert.equal(afterA1.toMove,1);
assert(playable(afterA1,1,2));

const afterA2=play([4,5,1,1]);
assert.equal(owner(afterA2,1,2),'P1');
assert.equal(afterA2.toMove,0);

function branch(firstInterior,forcedBlock){
  const s5=play([4,5,1,1,firstInterior]);
  assert.equal(s5.toMove,1);
  assert.equal(owner(s5,1,1),'P0');
  assert.equal(owner(s5,4,1),'P0');
  assert.equal(owner(s5,firstInterior,1),'P0');
  assert(playable(s5,forcedBlock,1));
  assert(playable(s5,firstInterior,2));

  // The bottom line has exactly one empty cell; P1 cannot preserve the
  // triggered even response and block the terminal line with one move.
  const bottom=[[1,1],[2,1],[3,1],[4,1]];
  const empty=bottom.filter(([c,r])=>owner(s5,c,r)===null);
  assert.deepEqual(empty,[[forcedBlock,1]]);

  const s6=play([4,5,1,1,firstInterior,forcedBlock]);
  assert.equal(s6.toMove,0);
  assert.equal(owner(s6,forcedBlock,1),'P1');
  assert(playable(s6,firstInterior,2));
  assert(playable(s6,forcedBlock,2));

  return {
    p0InteriorMove:`${'ABCDEFG'[firstInterior-1]}1`,
    forcedP1BottomBlock:`${'ABCDEFG'[forcedBlock-1]}1`,
    missedEvenResponse:`${'ABCDEFG'[firstInterior-1]}2`,
    selfExposedEvenCell:`${'ABCDEFG'[forcedBlock-1]}2`,
    consequence:`Neither ${'ABCDEFG'[firstInterior-1]}-even nor ${'ABCDEFG'[forcedBlock-1]}-even remains an unconditional universal ownership certificate.`
  };
}

const bThenC=branch(2,3);
const cThenB=branch(3,2);

// Quantify the static damage using only certificates that survive both
// forced-response branches without assuming replacement control in B/C.
function pairBlockers(){
  const out=[];
  for(const r of [1,3,5])out.push([[4,r],[5,r]]);
  out.push([[4,3],[4,4]],[[5,3],[5,4]]);
  return out;
}
const key=([c,r])=>`${c},${r}`;
const hasPair=(L,P)=>P.every(([c,r])=>L.some(([x,y])=>x===c&&y===r));
const label=L=>L.map(([c,r])=>`${'ABCDEFG'[c-1]}${r}`).join('-');
function survivingStaticField(seq){
  const s=play(seq);
  const S=new Set(s.p1);
  // A-even has already answered A2; retain its future A4/A6 claims.
  S.add(cell(1,4));S.add(cell(1,6));
  // F/G even control is untouched by the local collision.
  for(const c of [6,7])for(const r of [2,4,6])S.add(cell(c,r));
  const pairs=pairBlockers();
  const uncovered=[];
  for(const L of lines){
    if(L.some(([c,r])=>S.has(cell(c,r))))continue;
    if(pairs.some(P=>hasPair(L,P)))continue;
    uncovered.push(label(L));
  }
  return uncovered;
}
const left=survivingStaticField([4,5,1,1,2,3]);
const right=survivingStaticField([4,5,1,1,3,2]);
assert.equal(left.length,21);
assert.equal(right.length,20);

console.log(JSON.stringify({
  geometry:{W,H,K,winningLines:lines.length},
  preservedAResponse:{prefix:'D1 E1 A1',requiredResponse:'A2',reason:'A2 is the unique response that preserves the A-even Claimeven certificate.'},
  forcedInteriorCollision:[bThenC,cThenB],
  theorem:'After preserving A-even with A2, P0 can choose B1 or C1. P1 must occupy the other base cell to stop the bottom-row terminal line, so the triggering column misses its row-2 even response and the self-played blocking column exposes its row-2 cell to P0. Both B-even and C-even certificates are therefore lost.',
  conservativeSurvivingStaticField:{
    afterB1C1:{uncoveredCount:left.length,uncovered:left},
    afterC1B1:{uncoveredCount:right.length,uncovered:right}
  }
},null,2));
