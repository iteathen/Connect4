#!/usr/bin/env node
import assert from 'node:assert/strict';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT
//
// Oracle-validation control. Published outcome/terminal-move values are external premises
// copied from Christophe Steininger c4 commit fa27f186d2f1bf8e8fd61bfad63454c6e4b0431c.
// The geometry, gravity landing envelope, GF(2) incidence fingerprints, and the
// standard-board forced-prefix refinement are independently regenerated here.

const K = 4;
const DIRS = [[1,0],[0,1],[1,1],[1,-1]];
const SOURCE_COMMIT = 'fa27f186d2f1bf8e8fd61bfad63454c6e4b0431c';
const decisive = [
  { W: 6, H: 4, winner: 'P1', T: 24, issueUpper: 15 },
  { W: 6, H: 6, winner: 'P1', T: 36, issueUpper: 15 },
  { W: 6, H: 7, winner: 'P0', T: 41, issueUpper: 30 },
  { W: 7, H: 6, winner: 'P0', T: 41, issueUpper: 38 },
  { W: 8, H: 4, winner: 'P1', T: 32, issueUpper: 23 },
  { W: 8, H: 5, winner: 'P0', T: 39, issueUpper: 46 },
  { W: 9, H: 4, winner: 'P1', T: 36, issueUpper: 27 },
  { W: 10, H: 4, winner: 'P1', T: 40, issueUpper: 31 },
];

function zeros(r,c) { return Array.from({ length:r }, () => Array(c).fill(0)); }
function rref2(input) {
  const a = input.map(row => row.map(x => x & 1));
  const rows = a.length, cols = a[0]?.length ?? 0;
  let rank = 0; const pivots = [];
  for (let col=0; col<cols && rank<rows; col++) {
    let p=rank; while (p<rows && !a[p][col]) p++;
    if (p===rows) continue;
    [a[rank],a[p]]=[a[p],a[rank]];
    for (let r=0;r<rows;r++) if (r!==rank && a[r][col]) {
      for (let c=col;c<cols;c++) a[r][c]^=a[rank][c];
    }
    pivots.push(col); rank++;
  }
  return { a, pivots };
}
function rank2(M) { return rref2(M).pivots.length; }
function nullBasis2(M) {
  const { a, pivots } = rref2(M);
  const n = a[0]?.length ?? 0, ps = new Set(pivots);
  const free = Array.from({length:n},(_,i)=>i).filter(i=>!ps.has(i));
  return free.map(f => {
    const v=Array(n).fill(0); v[f]=1;
    for (let r=0;r<pivots.length;r++) {
      let bit=0; for (const j of free) bit ^= a[r][j] & v[j];
      v[pivots[r]]=bit;
    }
    return v;
  });
}
function transpose(M) { return M.length ? Array.from({length:M[0].length},(_,c)=>M.map(r=>r[c])) : []; }
function mul2(A,B) {
  assert.equal(A[0]?.length ?? 0, B.length);
  const out=zeros(A.length,B[0]?.length ?? 0);
  for (let i=0;i<A.length;i++) for (let k=0;k<(A[0]?.length ?? 0);k++) if (A[i][k]) {
    for (let j=0;j<(B[0]?.length ?? 0);j++) out[i][j]^=B[k][j];
  }
  return out;
}
function generateLines(W,H) {
  const out=[];
  for (let x=0;x<W;x++) for (let y=0;y<H;y++) for (const [dx,dy] of DIRS) {
    const cells=[]; let ok=true;
    for (let i=0;i<K;i++) {
      const xx=x+i*dx, yy=y+i*dy;
      if (xx<0||xx>=W||yy<0||yy>=H) { ok=false; break; }
      cells.push({x:xx,y:yy,cell:yy*W+xx});
    }
    if (ok) out.push({x,y,dx,dy,cells});
  }
  return out;
}
function geometry(W,H) {
  const a=Math.max(W-K+1,0), b=Math.max(H-K+1,0);
  return H*a + W*b + 2*a*b;
}
function incidence(W,H,lines) {
  const B=zeros(W*H,lines.length);
  lines.forEach((line,j)=>line.cells.forEach(({cell})=>{B[cell][j]=1;}));
  return B;
}
function axisParity(W,H) {
  const A=zeros(W+H,W*H);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) { const c=y*W+x; A[x][c]=1; A[W+y][c]=1; }
  return A;
}
function verticalLineParity(W,lines) {
  const V=zeros(W,lines.length);
  lines.forEach((l,j)=>{ if (l.dx===0 && l.dy===1) V[l.x][j]=1; });
  return V;
}
function pickColumns(M,ids) { return M.map(row => ids.map(j=>row[j])); }
function supportEnvelope(W,H,T,lines) {
  const q=W*H-T+1;
  assert(q>=1 && q<=W*H);
  const minRow=Math.max(0,H-q);
  const ids=lines.map((l,i)=>l.cells.some(({y})=>y>=minRow)?i:-1).filter(i=>i>=0);
  return { q, minRow, ids };
}
function deficitLandingCells(W,H,q) {
  const seen=new Set(); const d=Array(W).fill(0);
  function rec(c,left) {
    if (c===W) {
      if (left!==0) return;
      for (let x=0;x<W;x++) if (d[x]>0) seen.add(`${x},${H-d[x]}`);
      return;
    }
    for (let n=0;n<=Math.min(H,left);n++) { d[c]=n; rec(c+1,left-n); }
  }
  rec(0,q); return seen;
}
function orientationCounts(lines,ids) {
  const out={horizontal:0,vertical:0,diagonal:0};
  for (const i of ids) {
    const l=lines[i];
    if (l.dy===0) out.horizontal++;
    else if (l.dx===0) out.vertical++;
    else out.diagonal++;
  }
  return out;
}
function fingerprint(W,H,lines,B,ids) {
  const E=pickColumns(B,ids);
  const imageRank=rank2(E);
  const deps=nullBasis2(E);
  const axisRank=rank2(mul2(axisParity(W,H),E));
  let phaseRank=0;
  if (deps.length) {
    const ambient=zeros(lines.length,deps.length);
    deps.forEach((v,k)=>v.forEach((bit,local)=>{ if(bit) ambient[ids[local]][k]=1; }));
    phaseRank=rank2(mul2(verticalLineParity(W,lines),ambient));
  }
  return {
    coordinateDimension: ids.length,
    incidenceImageRank: imageRank,
    incidenceDependencyDimension: deps.length,
    axisBoundaryRank: axisRank,
    cellCoreImageDimension: imageRank-axisRank,
    phaseBoundaryRankInsideDependencies: phaseRank,
    lineCoreDependencyDimension: deps.length-phaseRank,
  };
}

const boardResults=[];
for (const p of decisive) {
  const lines=generateLines(p.W,p.H);
  assert.equal(lines.length, geometry(p.W,p.H));
  const B=incidence(p.W,p.H,lines);
  const env=supportEnvelope(p.W,p.H,p.T,lines);
  const expected=geometry(p.W,p.H)-geometry(p.W,env.minRow);
  assert.equal(env.ids.length,expected);
  assert.equal(expected,p.issueUpper);

  const landing=deficitLandingCells(p.W,p.H,env.q);
  for(let x=0;x<p.W;x++) for(let y=0;y<p.H;y++) {
    assert.equal(landing.has(`${x},${y}`), y>=env.minRow);
  }

  if (env.minRow>=3) assert.equal(expected, env.q*(4*p.W-9));

  boardResults.push({
    ...p,
    geometricLines:lines.length,
    emptyBeforeTerminal:env.q,
    minLastLandingRowZeroBased:env.minRow,
    supportUpper:expected,
    orientationCounts:orientationCounts(lines,env.ids),
    incidenceRank:rank2(B),
    lineKernelDimension:lines.length-rank2(B),
    supportFingerprint:fingerprint(p.W,p.H,lines,B,env.ids),
  });
}

const W=7,H=6,T=41;
const lines=generateLines(W,H), B=incidence(W,H,lines);
const env=supportEnvelope(W,H,T,lines);
assert.equal(env.ids.length,38);
const fixedP0=new Set(['3,0','3,2','3,4']);
const fixedP1=new Set(['3,1','3,3']);
const afterP1=env.ids.filter(i=>!lines[i].cells.some(({x,y})=>fixedP1.has(`${x},${y}`)));
const finalIds=afterP1.filter(i=>lines[i].cells.some(({x,y})=>y>=env.minRow && !fixedP0.has(`${x},${y}`) && !fixedP1.has(`${x},${y}`)));
assert.equal(afterP1.length,30);
assert.equal(finalIds.length,28);
const issue41Ids=[4,7,8,11,13,14,19,22,23,26,27,28,34,35,37,41,43,44,53,56,58,59,61,62,64,67,68,65].sort((a,b)=>a-b);
assert.deepEqual(finalIds.slice().sort((a,b)=>a-b),issue41Ids);
assert.deepEqual(orientationCounts(lines,env.ids),{horizontal:8,vertical:14,diagonal:16});
assert.deepEqual(orientationCounts(lines,afterP1),{horizontal:8,vertical:12,diagonal:10});
assert.deepEqual(orientationCounts(lines,finalIds),{horizontal:8,vertical:12,diagonal:8});

const stdFiltration={
  support38:fingerprint(W,H,lines,B,env.ids),
  afterOpponentPrefix30:fingerprint(W,H,lines,B,afterP1),
  exactCandidate28:fingerprint(W,H,lines,B,finalIds),
};
assert.deepEqual(stdFiltration.support38,{
  coordinateDimension:38,incidenceImageRank:28,incidenceDependencyDimension:10,
  axisBoundaryRank:6,cellCoreImageDimension:22,phaseBoundaryRankInsideDependencies:4,lineCoreDependencyDimension:6,
});
assert.deepEqual(stdFiltration.afterOpponentPrefix30,{
  coordinateDimension:30,incidenceImageRank:26,incidenceDependencyDimension:4,
  axisBoundaryRank:6,cellCoreImageDimension:20,phaseBoundaryRankInsideDependencies:0,lineCoreDependencyDimension:4,
});
assert.deepEqual(stdFiltration.exactCandidate28,{
  coordinateDimension:28,incidenceImageRank:26,incidenceDependencyDimension:2,
  axisBoundaryRank:6,cellCoreImageDimension:20,phaseBoundaryRankInsideDependencies:0,lineCoreDependencyDimension:2,
});

const q2Family=[];
for (let width=4;width<=30;width++) {
  const height=5, terminal=width*height-1;
  const familyLines=generateLines(width,height);
  const familyB=incidence(width,height,familyLines);
  const familyEnv=supportEnvelope(width,height,terminal,familyLines);
  const fp=fingerprint(width,height,familyLines,familyB,familyEnv.ids);
  const expected={
    coordinateDimension:8*width-18,
    incidenceImageRank:5*width-7,
    incidenceDependencyDimension:3*width-11,
    axisBoundaryRank:width-1,
    cellCoreImageDimension:4*width-6,
    phaseBoundaryRankInsideDependencies:width-3,
    lineCoreDependencyDimension:2*width-8,
  };
  assert.deepEqual(fp,expected);
  const familyE=pickColumns(familyB,familyEnv.ids);
  const familyDeps=nullBasis2(familyE);
  const familyAmbient=zeros(familyLines.length,familyDeps.length);
  familyDeps.forEach((v,k)=>v.forEach((bit,local)=>{ if(bit) familyAmbient[familyEnv.ids[local]][k]=1; }));
  const phaseImage=mul2(verticalLineParity(width,familyLines),familyAmbient);
  for (const vector of transpose(phaseImage)) {
    assert.equal(vector[0],0);
    assert.equal(vector[width-1],0);
    assert.equal(vector.reduce((a,b)=>a^b,0),0);
  }
  assert.equal(rank2(phaseImage),width-3);
  q2Family.push({width,...fp,phaseStructure:'Even(F2^(W-2 interior columns))'});
}

console.log(`TERMINAL_SUPPORT_BOUND_AUDIT=${JSON.stringify({
  kind:'connect4-k4-terminal-support-upper-bound-audit-v1',
  proved:true,
  externalPremises:{sourceCommit:SOURCE_COMMIT,scope:'winner and terminal move only; not target-free theorem premises'},
  boardResults,
  q2FiniteWidthFamily:{testedWidths:[4,30],height:5,terminalRule:'N-1 so q=2',sectorFormula:'(2W-8) line-core + (W-3) phase + (4W-6) cell-core + (W-1) axis = 8W-18',rows:q2Family},
  standard7x6:{
    supportUpper:38,
    afterFixedOpponentCenter:30,
    afterFixedOwnLandingExclusion:28,
    exactIssue41LineIds:issue41Ids,
    filtration:stdFiltration,
    interpretation:'The 38->28 coordinate reduction removes 10 line coordinates but only 2 incidence-image dimensions; most loss is dependency freedom. The axis-boundary rank remains 6 throughout.',
  },
  proofBoundary:'Upper bounds are geometry+gravity consequences of externally supplied terminal moves. Only 7x6 is tightened to an exact nonzero witnessed count here. Do not treat other support caps as exact until matching witnesses or stronger exclusions exist.',
  attribution:{researchDirectionStructuralArchitectureInvariantFirstProgram:'Josh Oshiro',formalizationImplementationQualification:'OpenAI ChatGPT'},
})}`);
