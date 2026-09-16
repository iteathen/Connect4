#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
//
// Target-free structural response filtration for standard 7x6.  No solved
// best-move scores, forced-prefix labels, terminal distance, predefined 28, or
// recursive game-tree evaluation is used.
//
// For each odd-height center stack at which P1 is to move, compare all seven
// replies inside the parity-capacity maximal-delay P0 terminal envelope.  Measure
// the line-dependency phase-boundary rank (vertical-line parity on ker(B_E)).

const W=7,H=6,K=4,CENTER=3;
const DIRS=[[1,0],[0,1],[1,1],[1,-1]];
const zeros=(r,c)=>Array.from({length:r},()=>Array(c).fill(0));
function rref(M){
  const a=M.map(r=>r.map(x=>x&1));let row=0;const piv=[];
  for(let col=0;col<(a[0]?.length??0)&&row<a.length;col++){
    let p=row;while(p<a.length&&!a[p][col])p++;if(p===a.length)continue;
    [a[row],a[p]]=[a[p],a[row]];
    for(let r=0;r<a.length;r++)if(r!==row&&a[r][col])for(let c=col;c<a[0].length;c++)a[r][c]^=a[row][c];
    piv.push(col);row++;
  }
  return{a,piv};
}
const rank=M=>rref(M).piv.length;
function nullBasis(M){
  const {a,piv}=rref(M),n=a[0]?.length??0,ps=new Set(piv),free=Array.from({length:n},(_,i)=>i).filter(i=>!ps.has(i));
  return free.map(f=>{const v=Array(n).fill(0);v[f]=1;for(let r=0;r<piv.length;r++){let s=0;for(const j of free)s^=a[r][j]&v[j];v[piv[r]]=s;}return v;});
}
function generateLines(){
  const out=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)for(const[dx,dy]of DIRS){
    const cells=Array.from({length:K},(_,i)=>({x:x+i*dx,y:y+i*dy}));
    if(cells.every(p=>p.x>=0&&p.x<W&&p.y>=0&&p.y<H))out.push({cells,dx,dy});
  }
  return out;
}
const lines=generateLines();assert.equal(lines.length,69);
const key=p=>`${p.x},${p.y}`;

function prefix(cols){
  const h=Array(W).fill(0),p0=new Set(),p1=new Set();
  cols.forEach((c,ply)=>{const p={x:c,y:h[c]++};(ply&1?p1:p0).add(key(p));});
  return{h,p0,p1};
}
function envelope(cols){
  const s=prefix(cols);
  // Latest parity-compatible possible P0 terminal on a 42-cell board is ply 41.
  // Immediately before it two cells remain empty, so final landing is in the
  // top two zero-based rows 4 or 5.  This is a structural capacity envelope,
  // not a premise that optimal defense attains ply 41.
  const candidates=lines.filter(l=>
    !l.cells.some(p=>s.p1.has(key(p))) &&
    l.cells.some(p=>p.y>=H-2&&!s.p0.has(key(p))&&!s.p1.has(key(p)))
  );
  const n=candidates.length,B=zeros(W*H,n);
  candidates.forEach((l,j)=>l.cells.forEach(p=>B[p.y*W+p.x][j]=1));
  const rb=rank(B),ker=nullBasis(B),Kmat=zeros(n,ker.length);
  ker.forEach((v,j)=>v.forEach((x,i)=>Kmat[i][j]=x));
  const V=zeros(W,n);
  candidates.forEach((l,j)=>{if(l.dx===0&&l.dy===1)V[l.cells[0].x][j]=1;});
  const VK=zeros(W,ker.length);
  for(let i=0;i<W;i++)for(let k=0;k<ker.length;k++)for(let j=0;j<n;j++)VK[i][k]^=V[i][j]&Kmat[j][k];
  return{candidateCount:n,incidenceRank:rb,dependencyDimension:n-rb,phaseRank:rank(VK)};
}

// Canonical center-prefix filtration before each P1 response.
const centerPrefix=[];
for(let s=0;s<=5;s++)centerPrefix.push({stackHeight:s,...envelope(Array(s).fill(CENTER))});
assert.deepEqual(centerPrefix.map(x=>[x.stackHeight,x.candidateCount,x.dependencyDimension,x.phaseRank]),[
  [0,38,10,4],[1,38,10,4],[2,35,8,2],[3,35,8,2],[4,30,4,0],[5,28,2,0]
]);

const responseProfiles=[];
for(const stackHeight of[1,3,5]){
  const base=Array(stackHeight).fill(CENTER),replies=[];
  for(let reply=0;reply<W;reply++)replies.push({reply,...envelope([...base,reply])});
  responseProfiles.push({stackHeight,replies});
}
const p1=responseProfiles[0].replies;
assert.equal(p1[CENTER].phaseRank,2);for(const r of p1)if(r.reply!==CENTER)assert.equal(r.phaseRank,4);
const p3=responseProfiles[1].replies;
assert.equal(p3[CENTER].phaseRank,0);for(const r of p3)if(r.reply!==CENTER)assert.equal(r.phaseRank,2);
const p5=responseProfiles[2].replies;
assert(p5.every(r=>r.phaseRank===0));

console.log(`MAXDELAY_PHASE_RESPONSE_FILTRATION=${JSON.stringify({
  proved:true,
  primitives:{turnModulus:2,connect:K,width:W,height:H},
  centerPrefix,
  responseProfiles,
  theorem:{
    firstP1Response:'after one center event, center is the unique reply reducing active terminal-envelope phase rank from 4 to 2; every off-center reply leaves rank 4',
    secondP1Response:'after D1 d2 D3 structurally, center is the unique reply reducing active phase rank from 2 to 0; every off-center reply leaves rank 2',
    preterminalResponse:'after five center events, active phase rank is already 0 and all seven P1 replies remain phase-rank 0',
    filtration:'canonical P1 center blockers give phase ranks 4 -> 2 -> 0 before the natural preterminal P0 event',
    typedInterpretation:'P1 two-ply reply displacement lives in C_phase. Once the relevant terminal envelope has phase rank 0, that boundary sector cannot distinguish reply columns.'
  },
  proofBoundary:'Exact finite structural theorem about the parity-capacity terminal envelope. It does NOT yet prove that strong-distance optimal play minimizes this phase rank, nor that the latest possible P0 horizon is attained. External best-move scores may validate the pattern only after this theorem is fixed.',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'}
})}`);
