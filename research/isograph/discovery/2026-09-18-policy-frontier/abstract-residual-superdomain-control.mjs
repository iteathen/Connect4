#!/usr/bin/env node
import { performance } from 'node:perf_hooks';

function popcountBig(x) {
  let n = 0;
  while (x !== 0n) { x &= x - 1n; n += 1; }
  return n;
}
function subset(a, b) { return (a & ~b) === 0n; }
function compareMask(a, b) {
  const pa = popcountBig(a), pb = popcountBig(b);
  if (pa !== pb) return pa - pb;
  return a < b ? -1 : a > b ? 1 : 0;
}
function normalizeAntichain(values) {
  const uniq = [...new Set(values.map(String))].map(BigInt).sort(compareMask);
  const out = [];
  outer: for (const x of uniq) {
    for (const y of out) if (subset(y, x)) continue outer;
    out.push(x);
  }
  return out;
}
function antichainKey(a) { return a.map(String).join(','); }
function formulaAtLeast(A, B) {
  for (const b of B) {
    let covered = false;
    for (const a of A) if (subset(a, b)) { covered = true; break; }
    if (!covered) return false;
  }
  return true;
}
function compareStrong(a, b) {
  if (a[0] !== b[0]) return Math.sign(a[0] - b[0]);
  if (a[0] === 1) return Math.sign(b[1] - a[1]);
  if (a[0] === -1) return Math.sign(a[1] - b[1]);
  return 0;
}
function negateChildScore(child) { return [-child[0], child[1] + 1]; }

function makeGeometry(W, H, K) {
  const N = W * H;
  const bit = (c, r) => 1n << BigInt(r * W + c);
  const lines = [];
  for (let r = 0; r < H; r++) for (let c = 0; c <= W - K; c++) {
    let m = 0n; for (let i = 0; i < K; i++) m |= bit(c + i, r); lines.push(m);
  }
  for (let c = 0; c < W; c++) for (let r = 0; r <= H - K; r++) {
    let m = 0n; for (let i = 0; i < K; i++) m |= bit(c, r + i); lines.push(m);
  }
  for (let c = 0; c <= W - K; c++) for (let r = 0; r <= H - K; r++) {
    let m = 0n; for (let i = 0; i < K; i++) m |= bit(c + i, r + i); lines.push(m);
  }
  for (let c = 0; c <= W - K; c++) for (let r = K - 1; r < H; r++) {
    let m = 0n; for (let i = 0; i < K; i++) m |= bit(c + i, r - i); lines.push(m);
  }
  return { W, H, K, N, bit, lines };
}
function supportMask(g, heights) {
  let m = 0n;
  for (let c = 0; c < g.W; c++) for (let r = 0; r < heights[c]; r++) m |= g.bit(c, r);
  return m;
}
function residualShapes(g, heights) {
  const S = supportMask(g, heights);
  const set = new Set();
  for (const line of g.lines) {
    const r = line & ~S;
    if (r !== 0n) set.add(String(r));
  }
  return [...set].map(BigInt).sort(compareMask);
}
function enumerateAntichains(shapes) {
  const out = [], chosen = [];
  function rec(i) {
    if (i === shapes.length) { out.push(chosen.slice()); return; }
    rec(i + 1);
    const x = shapes[i];
    for (const y of chosen) if (subset(x, y) || subset(y, x)) return;
    chosen.push(x); rec(i + 1); chosen.pop();
  }
  rec(0);
  return out;
}
function enumerateSupportCone(g, base) {
  const out = [], h = base.slice();
  function rec(c) {
    if (c === g.W) { out.push(h.slice()); return; }
    for (let v = base[c]; v <= g.H; v++) { h[c] = v; rec(c + 1); }
  }
  rec(0);
  out.sort((a,b) => b.reduce((x,y)=>x+y,0) - a.reduce((x,y)=>x+y,0));
  return out;
}
function supportKey(h) { return h.join(','); }

function createSuperdomain(g, base) {
  const started = performance.now();
  const supports = enumerateSupportCone(g, base), byKey = new Map();
  let totalPairs = 0; const pairsByRank = {};
  for (const heights of supports) {
    const shapes = residualShapes(g, heights), ants = enumerateAntichains(shapes);
    const index = new Map(ants.map((a,i)=>[antichainKey(a),i]));
    const rank = heights.reduce((a,b)=>a+b,0);
    totalPairs += ants.length * ants.length;
    pairsByRank[rank] = (pairsByRank[rank] ?? 0) + ants.length * ants.length;
    byKey.set(supportKey(heights), { heights, rank, shapes, ants, index, scores: null, actions: [] });
  }
  for (const node of [...byKey.values()].sort((a,b)=>b.rank-a.rank)) {
    const { heights, rank, ants } = node, n = ants.length;
    if (rank === g.N) { node.scores = [[0,0]]; continue; }
    const side = rank & 1, actions = [];
    for (let c = 0; c < g.W; c++) {
      const row = heights[c]; if (row >= g.H) continue;
      const x = g.bit(c,row), ch = heights.slice(); ch[c]++;
      const child = byKey.get(supportKey(ch));
      const own = new Int32Array(n), opp = new Int32Array(n);
      for (let i = 0; i < n; i++) {
        const a = ants[i], moved = []; let terminal = false;
        for (const r of a) {
          const rr = (r & x) !== 0n ? (r & ~x) : r;
          if (rr === 0n) { terminal = true; break; }
          moved.push(rr);
        }
        own[i] = terminal ? -1 : child.index.get(antichainKey(normalizeAntichain(moved)));
        opp[i] = child.index.get(antichainKey(normalizeAntichain(a.filter(r => (r & x) === 0n))));
      }
      actions.push({ c, child, own, opp });
    }
    node.actions = actions;
    const scores = new Array(n*n);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      let best = null;
      for (const a of actions) {
        const ownId = side === 0 ? a.own[i] : a.own[j];
        const oppId = side === 0 ? a.opp[j] : a.opp[i];
        let sc;
        if (ownId < 0) sc = [1,1];
        else {
          const cn = a.child.ants.length;
          const childScore = side === 0
            ? a.child.scores[ownId * cn + oppId]
            : a.child.scores[oppId * cn + ownId];
          sc = negateChildScore(childScore);
        }
        if (best === null || compareStrong(sc,best) > 0) best = sc;
      }
      scores[i*n+j] = best ?? [0,0];
    }
    node.scores = scores;
  }
  const root = byKey.get(supportKey(base));
  return { root, totalPairs, pairsByRank, elapsedMs: performance.now()-started };
}
function parentActionScores(node) {
  const side = node.rank & 1, n = node.ants.length, result = new Map();
  for (const a of node.actions) {
    const arr = new Array(n*n), cn = a.child.ants.length;
    for (let i=0;i<n;i++) for (let j=0;j<n;j++) {
      const ownId = side===0 ? a.own[i] : a.own[j], oppId = side===0 ? a.opp[j] : a.opp[i];
      if (ownId < 0) arr[i*n+j] = [1,1];
      else {
        const cs = side===0 ? a.child.scores[ownId*cn+oppId] : a.child.scores[oppId*cn+ownId];
        arr[i*n+j] = negateChildScore(cs);
      }
    }
    result.set(a.c, arr);
  }
  return result;
}
function buildFormulaOrder(ants) {
  const n=ants.length, ge=Array.from({length:n},()=>new Uint8Array(n));
  for(let i=0;i<n;i++) for(let j=0;j<n;j++) if(formulaAtLeast(ants[i],ants[j])) ge[i][j]=1;
  return ge;
}
function minimalThresholdBoundary(node, scores, threshold, ge) {
  const n=node.ants.length, side=node.rank&1, boundary=[];
  const stateGE=(x,g)=> {
    const [i,j]=x,[gi,gj]=g;
    return side===0 ? (ge[i][gi] && ge[gj][j]) : (ge[j][gj] && ge[gi][i]);
  };
  for(let k=0;k<scores.length;k++) {
    if(compareStrong(scores[k],threshold)<0) continue;
    const x=[Math.floor(k/n),k%n]; let covered=false;
    for(const g of boundary) if(stateGE(x,g)){covered=true;break;}
    if(covered) continue;
    for(let z=boundary.length-1;z>=0;z--) if(stateGE(boundary[z],x)) boundary.splice(z,1);
    boundary.push(x);
  }
  return boundary;
}
function thresholdSummary(superdomain) {
  const node=superdomain.root, ge=buildFormulaOrder(node.ants), scoresByAction=parentActionScores(node);
  const actions=[]; let maxBoundary=0;
  for(const [c,scores] of scoresByAction) {
    const levels=[];
    for(const s of scores) if(!levels.some(x=>x[0]===s[0]&&x[1]===s[1])) levels.push(s);
    levels.sort(compareStrong); const thresholds=[];
    for(let t=1;t<levels.length;t++) {
      const b=minimalThresholdBoundary(node,scores,levels[t],ge);
      thresholds.push({threshold:levels[t],generators:b.length});
      maxBoundary=Math.max(maxBoundary,b.length);
    }
    actions.push({column:c,levels,thresholds});
  }
  return {actions,maxBoundary};
}
function residualAntichainPhysical(g, mine, theirs, support) {
  const raw=[];
  for(const line of g.lines) {
    if((line & theirs)!==0n) continue;
    const r=line & ~support;
    if(r!==0n) raw.push(r);
  }
  return normalizeAntichain(raw);
}
function hasWin(g, mask) { return g.lines.some(line => (mask & line) === line); }
function heightsFromMasks(g,p0,p1) {
  const occ=p0|p1, h=[];
  for(let c=0;c<g.W;c++) { let r=0; while(r<g.H && (occ&g.bit(c,r))!==0n) r++; h.push(r); }
  return h;
}
function physicalControl(W,H,K) {
  const g=makeGeometry(W,H,K), seen=new Map(), valueMemo=new Map(), actionMemo=new Map();
  const key=(p0,p1)=>`${p0}|${p1}`;
  function enumerate(p0,p1){
    const k=key(p0,p1); if(seen.has(k)) return; seen.set(k,[p0,p1]);
    const h=heightsFromMasks(g,p0,p1), rank=popcountBig(p0|p1), side=rank&1;
    for(let c=0;c<g.W;c++) { if(h[c]>=g.H) continue; const x=g.bit(c,h[c]);
      const n0=side===0?p0|x:p0, n1=side===1?p1|x:p1;
      if(hasWin(g,side===0?n0:n1) || rank+1===g.N) continue;
      enumerate(n0,n1);
    }
  }
  enumerate(0n,0n);
  function solvePhysical(p0,p1){
    const k=key(p0,p1); if(valueMemo.has(k)) return valueMemo.get(k);
    const h=heightsFromMasks(g,p0,p1), rank=popcountBig(p0|p1), side=rank&1;
    let best=null,bestMask=0; const actions=[];
    for(let c=0;c<g.W;c++){ if(h[c]>=g.H) continue; const x=g.bit(c,h[c]);
      const n0=side===0?p0|x:p0,n1=side===1?p1|x:p1; let sc;
      if(hasWin(g,side===0?n0:n1)) sc=[1,1];
      else if(rank+1===g.N) sc=[0,1];
      else sc=negateChildScore(solvePhysical(n0,n1));
      actions.push({c,score:sc}); const cmp=best===null?1:compareStrong(sc,best);
      if(cmp>0){best=sc;bestMask=1<<c;} else if(cmp===0) bestMask|=1<<c;
    }
    best ??= [0,0]; valueMemo.set(k,best); actionMemo.set(k,{bestMask,actions}); return best;
  }
  solvePhysical(0n,0n); for(const [p0,p1] of [...seen.values()].reverse()) solvePhysical(p0,p1);
  const qMemo=new Map(),qActionMemo=new Map();
  const qKey=(h,r0,r1)=>`${h.join('.') }:${antichainKey(r0)}:${antichainKey(r1)}`;
  function qSolve(h,r0,r1){
    const k=qKey(h,r0,r1); if(qMemo.has(k)) return qMemo.get(k);
    const rank=h.reduce((a,b)=>a+b,0),side=rank&1; let best=null,bestMask=0; const actions=[];
    for(let c=0;c<g.W;c++){if(h[c]>=g.H) continue; const x=g.bit(c,h[c]);
      const own=side===0?r0:r1,opp=side===0?r1:r0,moved=[];let terminal=false;
      for(const r of own){const rr=(r&x)!==0n?(r&~x):r;if(rr===0n){terminal=true;break;}moved.push(rr);}
      let sc;
      if(terminal) sc=[1,1];
      else {
        const no=normalizeAntichain(moved),np=normalizeAntichain(opp.filter(r=>(r&x)===0n));
        const ch=h.slice();ch[c]++;
        if(rank+1===g.N) sc=[0,1];
        else {
          const cr0=side===0?no:np,cr1=side===1?no:np;
          sc=negateChildScore(qSolve(ch,cr0,cr1));
        }
      }
      actions.push({c,score:sc}); const cmp=best===null?1:compareStrong(sc,best);
      if(cmp>0){best=sc;bestMask=1<<c;} else if(cmp===0) bestMask|=1<<c;
    }
    best??=[0,0];qMemo.set(k,best);qActionMemo.set(k,{bestMask,actions});return best;
  }
  let stateMismatches=0,actionMismatches=0,bestMoveMismatches=0; const qSet=new Set();
  for(const [p0,p1] of seen.values()){
    const h=heightsFromMasks(g,p0,p1),support=p0|p1;
    const r0=residualAntichainPhysical(g,p0,p1,support),r1=residualAntichainPhysical(g,p1,p0,support);
    const qk=qKey(h,r0,r1);qSet.add(qk);const qs=qSolve(h,r0,r1),ps=valueMemo.get(key(p0,p1));
    if(compareStrong(qs,ps)!==0) stateMismatches++;
    const qa=qActionMemo.get(qk),pa=actionMemo.get(key(p0,p1));
    if(qa.bestMask!==pa.bestMask) bestMoveMismatches++;
    for(const a of pa.actions){const b=qa.actions.find(x=>x.c===a.c);if(!b||compareStrong(a.score,b.score)!==0)actionMismatches++;}
  }
  return {geometry:`${W}x${H}:c${K}`,physicalStates:seen.size,qStates:qSet.size,stateMismatches,actionMismatches,bestMoveMismatches};
}

const controls=[];
for(const g of [[4,3,3],[4,4,4],[5,3,4]]) { const t=performance.now(); const r=physicalControl(...g); r.elapsedMs=performance.now()-t; controls.push(r); }
const targets=[];
for(const base of [[5,5,5,2,6,6,6],[5,5,2,5,6,6,6]]) {
  const g=makeGeometry(7,6,4), sd=createSuperdomain(g,base), ts=thresholdSummary(sd);
  targets.push({
    support:base, rank:base.reduce((a,b)=>a+b,0), emptyCells:g.N-base.reduce((a,b)=>a+b,0),
    residualShapes:sd.root.shapes.length, antichainsPerPlayer:sd.root.ants.length,
    parentResidualPairs:sd.root.ants.length**2, totalResidualPairsInFutureCone:sd.totalPairs,
    pairsByRank:sd.pairsByRank, solveElapsedMs:sd.elapsedMs,
    maxThresholdBoundary:ts.maxBoundary, actionThresholds:ts.actions
  });
}
console.log(JSON.stringify({
  schema:1,
  experiment:'connect4-abstract-residual-superdomain-conservative-extension',
  controls,
  standard7x6PathologicalTargets:targets,
  interpretation:{
    abstractDomain:'all normalized antichain pairs over support-local future residual shapes; NOT a legal-q census',
    legalSubsetProperty:'legal q states use the same local cofactor transition; nonterminal legal successors remain legal q',
    authorityEffect:'none'
  }
},null,2));
if(controls.some(x=>x.stateMismatches||x.actionMismatches||x.bestMoveMismatches)) process.exitCode=1;
