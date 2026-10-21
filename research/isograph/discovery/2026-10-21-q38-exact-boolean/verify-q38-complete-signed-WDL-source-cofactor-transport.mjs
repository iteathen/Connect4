#!/usr/bin/env node
// Original 7x6 K4 source q38 COMPLETE signed P0WIN/DRAW/P1WIN certificate.
// F38 computes from CURRENT q38 only: all 69 actual four-way ownership
// K4 windows, grade-1 U, grade-2 V, literal gravity column heights.
// Compose one P0 source-cofactor promotion with the proven q39 fixed
// Boolean expression. Never consult solver outcomes, historic T28 IDs,
// or future game-valued successors in F38. Historical witnessed games
// and the independently written last-four-ply physical ray evaluator are
// used only AFTER constructing the source formula for falsification.
// Node 20+: node verify-q38-complete-signed-WDL-source-cofactor-transport.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const W=7,H=6,DIR=[['H',1,0],['V',0,1],['R',1,1],['F',1,-1]];
const at=(c,r)=>c+W*r, lines=[];
for(let c=0;c<W;c++)for(let r=0;r<H;r++)for(const [d,dx,dy] of DIR){
  const points=Array.from({length:4},(_,i)=>[c+i*dx,r+i*dy]);
  if(points.every(([x,y])=>x>=0&&x<W&&y>=0&&y<H))
    lines.push({d,points,sites:points.map(([x,y])=>at(x,y))});
}
assert.equal(lines.length,69);

function physicalRay(board,e,player){
  const c=e%W,r=Math.floor(e/W);
  for(const [,dx,dy] of DIR){
    let n=1;
    for(const s of [-1,1]){
      let x=c+s*dx,y=r+s*dy;
      while(x>=0&&x<W&&y>=0&&y<H&&board[at(x,y)]===player){
        n++;x+=s*dx;y+=s*dy;
      }
    }
    if(n>=4)return true;
  }
  return false;
}
function all69Win(board,p){
  return lines.some(l=>l.sites.every(e=>board[e]===p));
}
function F(heights){
  return heights.flatMap((h,c)=>h<H?[at(c,h)]:[]);
}
function replay(firstwinFreeWord){
  const board=Array(W*H).fill(-1),heights=Array(W).fill(0);
  for(let t=0;t<firstwinFreeWord.length;t++){
    const c=Number(firstwinFreeWord[t])-1;
    assert(Number.isInteger(c)&&c>=0&&c<W&&heights[c]<H);
    const e=at(c,heights[c]++),p=t%2;
    board[e]=p;
    const native=all69Win(board,p),ray=physicalRay(board,e,p);
    assert.equal(native,ray,'original K4 window vs independent ray disagreement');
    assert.equal(native,false,'illegal earlier firstwin in source prefix');
  }
  return {board,heights,n:firstwinFreeWord.length};
}
function U(q,p,e){
  assert.equal(q.board[e],-1);
  return lines.some(l=>l.sites.includes(e)&&
    l.sites.every(s=>s===e||q.board[s]===p));
}
function V(q,p,e,f){
  assert(e!==f&&q.board[e]===-1&&q.board[f]===-1);
  return lines.some(l=>l.sites.includes(e)&&l.sites.includes(f)&&
    l.sites.every(s=>s===e||s===f||q.board[s]===p));
}

// No game-valued successors. The three possible rank39 physical
// capacity shapes are eliminated algebraically with singleton U and
// doubleton V original owner-projector cofactors.
function source39(heights,U0,U1,V1){
  const caps=heights.map(h=>H-h).filter(h=>h>0).sort((a,b)=>b-a).join(',');
  let P0=false,P1=false;
  if(caps==='3'){
    const c=heights.findIndex(h=>h===3),x=at(c,3),y=x+W,z=y+W;
    P0=!U1(x)&&U0(y);
    P1=U1(x)||(!U0(y)&&(U1(z)||V1(x,z)));
  }else if(caps==='2,1'){
    const c=heights.findIndex(h=>h===4),d=heights.findIndex(h=>h===5);
    const x=at(c,4),y=x+W,z=at(d,5);
    const Bxz=U1(z)||V1(x,z);
    const Bxy=U1(y)||V1(x,y);
    const Bzy=U1(y)||V1(z,y);
    P0=!U1(x)&&!U1(z)&&U0(x)&&(U0(y)||U0(z));
    P1=U1(x)||U1(z)||
      (!U0(y)&&Bxz&&!U0(z)&&Bxy)||
      (!U0(x)&&Bzy);
  }else if(caps==='1,1,1'){
    const cells=F(heights);
    assert.equal(cells.length,3);
    P0=cells.every(e=>!U1(e))&&cells.filter(U0).length>=2;
    P1=cells.some(U1);
    if(!P1)P1=cells.some(x=>{
      const other=cells.filter(e=>e!==x);
      return other.every(y=>{
        const z=other.find(e=>e!==y);
        return !U0(y)&&(U1(z)||V1(x,z));
      });
    });
  }else throw new Error('invalid rank39 original shape '+caps);
  assert(!(P0&&P1),'source contradiction both players forced WIN');
  return P0?1:P1?-1:0;
}

// Source-only q38 formula. Every cofactor on the RHS is of the
// ACTUAL CURRENT q38. In particular, no post-x owner array is formed.
function source38(q){
  assert.equal(q.n,38);
  const U0=e=>U(q,0,e),U1=e=>U(q,1,e),V0=(e,f)=>V(q,0,e,f);
  const V1=(e,f)=>V(q,1,e,f);
  const candidates=[];
  for(const x of F(q.heights)){
    const c=x%W;
    if(U0(x)){
      candidates.push({column:c+1,value:1,immediateWin39:true});
      continue;
    }
    const h=q.heights.slice();h[c]++;
    const value=source39(h,
      e=>U0(e)||V0(x,e),
      e=>U1(e),
      (e,f)=>V1(e,f));
    candidates.push({column:c+1,value,immediateWin39:false});
  }
  const score=Math.max(...candidates.map(c=>c.value));
  return {score,candidates};
}

// Independent true original last-at-most-four-ply physical game
// evaluator for independent validation ONLY. Not called by source38.
function physicalTiny(q){
  if(q.n===42)return 0;
  const p=q.n%2,children=[];
  for(const e of F(q.heights)){
    const b=q.board.slice(),h=q.heights.slice();b[e]=p;h[e%W]++;
    const native=all69Win(b,p),ray=physicalRay(b,e,p);
    assert.equal(native,ray);
    children.push(native?(p===0?1:-1):physicalTiny({board:b,heights:h,n:q.n+1}));
  }
  return p===0?Math.max(...children):Math.min(...children);
}
// Physically update ONE source stone only to falsify the F38 cofactor
// identity against independent actual q39 owner reinspection.
function currentMove(q,x){
  const c=x%W,b=q.board.slice(),h=q.heights.slice();
  assert.equal(x,at(c,h[c]));b[x]=q.n%2;h[c]++;
  return {board:b,heights:h,n:q.n+1};
}
function transferControls(q,x){
  const after=currentMove(q,x);
  if(all69Win(after.board,0))return 0;
  const remain=F(after.heights).length===0?[]:
    after.board.flatMap((v,e)=>v===-1?[e]:[]);
  let tests=0;
  for(const e of remain){
    assert.equal(U(after,0,e),U(q,0,e)||V(q,0,x,e));
    assert.equal(U(after,1,e),U(q,1,e));
    tests+=2;
  }
  for(let i=0;i<remain.length;i++)for(let j=i+1;j<remain.length;j++){
    assert.equal(V(after,1,remain[i],remain[j]),
      V(q,1,remain[i],remain[j]));
    tests++;
  }
  return tests;
}

const historic=JSON.parse(readFileSync(new URL(
  '../2026-10-19-true7x6-quantum-algebra/STRONG28_ISSUE41_HISTORICAL_WITNESS_FIXTURE_0_1.json',
  import.meta.url),'utf8'));
const rootWords=[...new Set(historic.witnesses.map(w=>w.movesZeroBased))];
assert.equal(rootWords.length,27);
const cohort=[],modifiedSeen=new Set;
for(const w of rootWords){
  const full=w.slice(0,38).split('').map(c=>+c+1).join('');
  cohort.push({group:'historicRootStrong',q:replay(full)});
  for(let i=0;i<37;i++){
    if(w[i]===w[i+1])continue;
    const alter=w.slice(0,i)+w[i+1]+w[i]+w.slice(i+2);
    try{
      const q=replay(alter.slice(0,38).split('').map(c=>+c+1).join(''));
      const key=q.board.join(',');
      if(modifiedSeen.has(key))continue;
      modifiedSeen.add(key);cohort.push({group:'legalModifiedRootHistory',q});
    }catch{
      // Invalid gravity sequence or premature firstwinner, not an input.
    }
  }
}
assert.equal(cohort.filter(z=>z.group==='legalModifiedRootHistory').length,306);

// A source-derived independent 38-ply P1 C8 block witness, where
// all 69 original P0 K4 windows are already permanently opponent-hit.
const C8='44444316171121213232325353556575766677';
cohort.push({group:'earlyC8Block',q:replay(C8)});
let independentDraws=0;
for(let mask=0;mask<1<<W;mask++){
  const eps=Array.from({length:W},(_,c)=>(mask>>c)&1);
  if(eps[3]!==0)continue;
  const owner=(c,r)=>(eps[c]+r)%2;
  if(lines.some(l=>l.points.every(([c,r])=>
    owner(c,r)===owner(...l.points[0]))))continue;
  const P1Bottom=Array.from({length:W},(_,c)=>c).filter(c=>eps[c]===1);
  const P0Bottom=Array.from({length:W},(_,c)=>c).filter(c=>eps[c]===0&&c!==3);
  const full=[3,3,3,3,3,...P1Bottom.flatMap(c=>Array(6).fill(c)),
    3,...P0Bottom.flatMap(c=>Array(6).fill(c))].map(c=>c+1).join('');
  assert.equal(full.length,42);
  // Test the ACTUAL full drawn history too, not just static coloring.
  replay(full);
  cohort.push({group:'independentLegalDraw',q:replay(full.slice(0,38))});
  independentDraws++;
}
assert.equal(independentDraws,26);
assert.equal(cohort.length,360);
const outcomes={},capacities={},currentActions={},failures=[];
let cofactorIndependentChecks=0;
for(const {group,q} of cohort){
  const source=source38(q);
  for(const x of F(q.heights))cofactorIndependentChecks+=transferControls(q,x);
  const independent=physicalTiny(q);
  if(independent!==source.score)failures.push({group,independent,source});
  const bucket=outcomes[group]??={n:0,P0WIN:0,DRAW:0,P1WIN:0};
  outcomes[group]=bucket;bucket.n++;
  bucket[independent===1?'P0WIN':independent===-1?'P1WIN':'DRAW']++;
  const shape=q.heights.map(h=>H-h).filter(h=>h>0).sort((a,b)=>b-a).join('+');
  capacities[shape]=(capacities[shape]||0)+1;
  currentActions[source.candidates.length]=(currentActions[source.candidates.length]||0)+1;
}
assert.equal(failures.length,0);
assert.deepEqual(outcomes.historicRootStrong,
  {n:27,P0WIN:27,DRAW:0,P1WIN:0});
assert.deepEqual(outcomes.legalModifiedRootHistory,
  {n:306,P0WIN:248,DRAW:46,P1WIN:12});
assert.deepEqual(outcomes.earlyC8Block,{n:1,P0WIN:0,DRAW:1,P1WIN:0});
assert.deepEqual(outcomes.independentLegalDraw,
  {n:26,P0WIN:1,DRAW:25,P1WIN:0});
assert.deepEqual(capacities,{'4':25,'3+1':260,'2+2':39,
  '2+1+1':35,'1+1+1+1':1});
assert.deepEqual(currentActions,{'1':25,'2':299,'3':35,'4':1});

// Separate independent source monotone permanent blocker certificates:
// if every original line contains an opponent stone, p can NEVER win.
// If BOTH are closed from a real firstwinfree q, game is forced DRAW.
function closed(q,p){
  return lines.every(l=>l.sites.some(e=>q.board[e]===1-p));
}
assert.equal(closed(replay(C8),0),true);
const twoOwnerBlocked40='4444422222266666641111113333335555557777';
const forcedDraw40=replay(twoOwnerBlocked40);
assert.equal(forcedDraw40.n,40);
assert.equal(closed(forcedDraw40,0),true);
assert.equal(closed(forcedDraw40,1),true);
const result={
  schema:1,date:'2026-10-21',
  status:'SOURCE_EXACT_SIGNED_WDL_ORIGINAL_7X6_AT_RANK38_AND_PERMANENT_BLOCKER_DRAW',
  sourceOriginalK4:69,ownerGrade1AndGrade2CofactorsOnly:true,
  algebraInput:'current q38 with 4 original physical empty cells and P0 to move',
  update:'U0_after_x(e)=U0(e) OR V0(x,e); U1 and V1 unchanged for remaining sites',
  boundedAlgebra:'OR over current P0 legal actions; algebraic q39 three-capacity Boolean expressions; no recursive successor game WDL',
  independentlyRealFirstwinfreeQ38:cohort.length,
  resultsByCohort:outcomes,
  totalOutcomes:{P0WIN:276,DRAW:72,P1WIN:12},
  originalCapacityShapeCounts:capacities,
  legalP0ActionCountDistribution:currentActions,
  independentlyCheckedCofactorTransferEqualities:cofactorIndependentChecks,
  independentActualFourPlyPhysicalWDLDisagreements:failures.length,
  sourceC8P1FullBlockingRank38:C8,
  all69P0K4LinesAlreadyBlockedAtC8q38:true,
  bothOwnersAll69PermanentBlockedAtQ40:twoOwnerBlocked40,
  fullDRAWWithoutAnyFutureValueEvaluationAtQ40:true,
  limitations:[
    'This is a sound exact guarded late WDL algebra, not an empty-root WIN theorem.',
    'The q38 one-ply OR is a bounded local algebraic action contraction and does not eliminate strategic alternatives at the empty board.',
    '27 root-strong sample words are heldback validation fixtures only. The source producer reads no historic T28 IDs or solved root game values.',
    'The independent four-ply physical recursion is validation, NEVER a dependency of source38.',
    'Maintained Node26 CI and third-party formal proof assistant not run.'
  ]
};
process.stdout.write(JSON.stringify(result,null,2)+'\n');
