import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const C = 4;
const R = 3;
const K = 3;
const CELL_COUNT = C * R;
const bit = i => 1n << BigInt(i);
const cell = (c, r) => r * C + c;

function popcountBig(x) {
  let n = 0;
  while (x) { x &= x - 1n; n += 1; }
  return n;
}
function popcountNumber(x) {
  let n = 0;
  while (x) { x &= x - 1; n += 1; }
  return n;
}

const winningLines = [];
for (let r = 0; r < R; r += 1) {
  for (let c = 0; c < C; c += 1) {
    for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      const line = [];
      for (let i = 0; i < K; i += 1) {
        const cc = c + i * dc;
        const rr = r + i * dr;
        if (cc < 0 || cc >= C || rr < 0 || rr >= R) {
          line.length = 0;
          break;
        }
        line.push(cell(cc, rr));
      }
      if (line.length === K) winningLines.push(line);
    }
  }
}
assert.equal(winningLines.length, 14);
const lineMasks = winningLines.map(line => line.reduce((m, x) => m | bit(x), 0n));
const canonicalLineIndex = new Map(winningLines.map((line, i) => [[...line].sort((a,b)=>a-b).join(','), i]));
const linesByCell = Array.from({length:CELL_COUNT}, () => []);
for (let i = 0; i < winningLines.length; i += 1) for (const x of winningLines[i]) linesByCell[x].push(i);

function* permutations(xs) {
  if (xs.length <= 1) { yield xs.slice(); return; }
  for (let i = 0; i < xs.length; i += 1) {
    const head = xs[i];
    const tail = xs.slice(0,i).concat(xs.slice(i+1));
    for (const rest of permutations(tail)) yield [head, ...rest];
  }
}

function geometryAutomorphisms() {
  const autos = [];
  for (const perm of permutations([...Array(C).keys()])) {
    const cellMap = Array(CELL_COUNT);
    for (let r = 0; r < R; r += 1) for (let c = 0; c < C; c += 1) cellMap[cell(c,r)] = cell(perm[c], r);
    const lineMap = Array(winningLines.length);
    let ok = true;
    for (let i = 0; i < winningLines.length; i += 1) {
      const key = winningLines[i].map(x => cellMap[x]).sort((a,b)=>a-b).join(',');
      const mapped = canonicalLineIndex.get(key);
      if (mapped === undefined) { ok = false; break; }
      lineMap[i] = mapped;
    }
    if (ok) autos.push({ id: autos.length, perm, cellMap, lineMap });
  }
  return autos;
}
const automorphisms = geometryAutomorphisms();
assert(automorphisms.length >= 1);

function mapBits(bits, auto) {
  let out = 0n;
  for (let x = 0; x < CELL_COUNT; x += 1) if (bits & bit(x)) out |= bit(auto.cellMap[x]);
  return out;
}
function mapLineMask(mask, auto) {
  let out = 0;
  for (let i = 0; i < winningLines.length; i += 1) if (mask & (1 << i)) out |= 1 << auto.lineMap[i];
  return out;
}

function hasWin(bits) { return lineMasks.some(mask => (bits & mask) === mask); }
function completedLineMask(bits, lastCell) {
  let out = 0;
  for (const i of linesByCell[lastCell]) if ((bits & lineMasks[i]) === lineMasks[i]) out |= 1 << i;
  return out;
}
function heightsOf(p0, p1) {
  const occ = p0 | p1;
  const hs = Array(C).fill(0);
  for (let c = 0; c < C; c += 1) while (hs[c] < R && (occ & bit(cell(c, hs[c])))) hs[c] += 1;
  return hs;
}
function stateKey(p0,p1) { return `${p0.toString(16)}/${p1.toString(16)}`; }

const states = [];
const stateByKey = new Map();
function internState(p0,p1) {
  const key = stateKey(p0,p1);
  const existing = stateByKey.get(key);
  if (existing !== undefined) return existing;
  const ply = popcountBig(p0|p1);
  const p0Win = hasWin(p0), p1Win = hasWin(p1);
  assert(!(p0Win && p1Win));
  let terminal = null;
  if (p0Win) terminal = 1;
  else if (p1Win) terminal = -1;
  else if (ply === CELL_COUNT) terminal = 0;
  const s = { id: states.length, p0, p1, ply, side: ply & 1, terminal, children: [] };
  stateByKey.set(key, s.id);
  states.push(s);
  return s.id;
}
internState(0n,0n);
for (let i = 0; i < states.length; i += 1) {
  const s = states[i];
  if (s.terminal !== null) continue;
  const hs = heightsOf(s.p0,s.p1);
  for (let c = 0; c < C; c += 1) {
    if (hs[c] >= R) continue;
    const landing = cell(c,hs[c]);
    const np0 = s.side === 0 ? s.p0 | bit(landing) : s.p0;
    const np1 = s.side === 1 ? s.p1 | bit(landing) : s.p1;
    const childId = internState(np0,np1);
    const moverBits = s.side === 0 ? np0 : np1;
    const completed = completedLineMask(moverBits, landing);
    s.children.push({ column:c, landing, child:childId, completed });
  }
}

const exact = new Int8Array(states.length); exact.fill(2);
function value(id) {
  if (exact[id] !== 2) return exact[id];
  const s = states[id];
  if (s.terminal !== null) return exact[id] = s.terminal;
  let v = s.side === 0 ? -1 : 1;
  for (const e of s.children) {
    const cv = value(e.child);
    if (s.side === 0) v = Math.max(v,cv); else v = Math.min(v,cv);
  }
  return exact[id] = v;
}
for (let i = states.length-1; i >= 0; i -= 1) value(i);

// Independent alternating fixed-point control (BSFP-style attractor semantics).
const p0Attr=new Set(states.filter(s=>s.terminal===1).map(s=>s.id));
const p1Attr=new Set(states.filter(s=>s.terminal===-1).map(s=>s.id));
let bsfpPasses=0,bsfpChanged=true;
while(bsfpChanged){
  bsfpChanged=false;bsfpPasses+=1;
  const add0=[],add1=[];
  for(const s of states){
    if(s.terminal!==null)continue;
    if(!p0Attr.has(s.id)){
      const q=s.side===0?s.children.some(e=>p0Attr.has(e.child)):s.children.every(e=>p0Attr.has(e.child));
      if(q)add0.push(s.id);
    }
    if(!p1Attr.has(s.id)){
      const q=s.side===1?s.children.some(e=>p1Attr.has(e.child)):s.children.every(e=>p1Attr.has(e.child));
      if(q)add1.push(s.id);
    }
  }
  for(const id of add0)if(!p0Attr.has(id)){p0Attr.add(id);bsfpChanged=true;}
  for(const id of add1)if(!p1Attr.has(id)){p1Attr.add(id);bsfpChanged=true;}
}
let bsfpMismatches=0;
for(const st of states){const bv=p0Attr.has(st.id)?1:p1Attr.has(st.id)?-1:0;if(bv!==exact[st.id])bsfpMismatches+=1;}
assert.equal(bsfpMismatches,0);

const outputMemo = new Int32Array(states.length); outputMemo.fill(-1);
function outputMask(id) {
  if (outputMemo[id] !== -1) return outputMemo[id];
  const s = states[id];
  if (s.terminal !== null) return outputMemo[id] = 0; // terminal provenance lives on incoming move
  if (exact[id] !== 1) return outputMemo[id] = 0;
  let out = 0;
  for (const e of s.children) {
    if (exact[e.child] !== exact[id]) continue; // W/D/L-perfect action
    const child = states[e.child];
    if (child.terminal === 1) out |= e.completed;
    else if (child.terminal === null) out |= outputMask(e.child);
  }
  return outputMemo[id] = out;
}
for (const s of states) outputMask(s.id);

function liveLineRecords(s, player) {
  const own = player === 0 ? s.p0 : s.p1;
  const opp = player === 0 ? s.p1 : s.p0;
  const hs = heightsOf(s.p0,s.p1);
  const records = [];
  for (let lineId = 0; lineId < winningLines.length; lineId += 1) {
    const line = winningLines[lineId];
    const blockers = line.filter(x => (opp & bit(x)) !== 0n);
    const residual = line.filter(x => (own & bit(x)) === 0n && (opp & bit(x)) === 0n);
    const playable = residual.filter(x => {
      const c = x % C, r = Math.floor(x/C);
      return hs[c] === r;
    });
    records.push({ lineId, blocked:blockers.length>0, blockers, residual, playable });
  }
  return records;
}
function residualAntichain(s, player) {
  const residuals = liveLineRecords(s,player).filter(r=>!r.blocked).map(r=>r.residual.slice());
  residuals.sort((a,b)=>a.length-b.length || a.join(',').localeCompare(b.join(',')));
  const min=[];
  for (const cand of residuals) {
    const cs = new Set(cand);
    if (min.some(prev => prev.every(x => cs.has(x)))) continue;
    min.push(cand);
  }
  return min;
}
function playableCells(s) {
  const hs = heightsOf(s.p0,s.p1); const out=[];
  for (let c=0;c<C;c+=1) if (hs[c] < R) out.push(cell(c,hs[c]));
  return out;
}
function tacticalClass(s) {
  if (s.terminal !== null) return {kind:'terminal', value:s.terminal};
  const playable = new Set(playableCells(s));
  const own = residualAntichain(s,s.side);
  const opp = residualAntichain(s,1-s.side);
  const immediate=[...new Set(own.filter(r=>r.length===1 && playable.has(r[0])).map(r=>r[0]))];
  if (immediate.length) return {kind:'immediate', value:s.side===0?1:-1, cells:immediate};
  const threats=[...new Set(opp.filter(r=>r.length===1 && playable.has(r[0])).map(r=>r[0]))];
  if (threats.length>=2) return {kind:'double-threat-loss', value:s.side===0?-1:1, cells:threats};
  if (own.length===0 && opp.length===0) return {kind:'exhaustion-draw', value:0};
  if (threats.length===1) return {kind:'forced', cell:threats[0]};
  return {kind:'decision'};
}
function pairedResponseNoWin(s) {
  if (s.terminal !== null) return false;
  const hs=heightsOf(s.p0,s.p1);
  if (!hs.every(h => ((R-h)&1)===0)) return false;
  const responseCells=new Set();
  for (let r=(R-1)&1; r<R; r+=2) for (let c=0;c<C;c+=1) responseCells.add(cell(c,r));
  const own=residualAntichain(s,s.side);
  return own.length>0 && own.every(req => req.some(x=>responseCells.has(x)));
}
function structuralInterval(s) {
  let lo=-1, hi=1; const reasons=[];
  const t=tacticalClass(s);
  if (t.value !== undefined) { lo=t.value; hi=t.value; reasons.push(t.kind); }
  if (pairedResponseNoWin(s)) {
    if (s.side===0) { hi=Math.min(hi,0); reasons.push('paired-response:P0-cannot-win'); }
    else { lo=Math.max(lo,0); reasons.push('paired-response:P1-cannot-win'); }
  }
  assert(lo<=hi);
  return {lo,hi,reasons:reasons.sort()};
}

function transformCellList(xs, auto) { return xs.map(x=>auto.cellMap[x]).sort((a,b)=>a-b); }
function transformedHeights(s, auto) {
  const hs=heightsOf(s.p0,s.p1), out=Array(C);
  for (let c=0;c<C;c+=1) out[auto.perm[c]]=hs[c];
  return out;
}
function statusAt(s,x) { return (s.p0&bit(x))?'P0':(s.p1&bit(x))?'P1':'E'; }

function qResidualsUnder(s, player, auto) {
  return residualAntichain(s,player)
    .map(r => transformCellList(r,auto))
    .sort((a,b)=>a.length-b.length || a.join(',').localeCompare(b.join(',')));
}
function qObjectUnder(s, auto) {
  return {
    side:s.side,
    support:transformedHeights(s,auto),
    p0:qResidualsUnder(s,0,auto),
    p1:qResidualsUnder(s,1,auto),
  };
}
function p0ProvenanceUnder(s, auto) {
  const groups=new Map();
  for (const rec of liveLineRecords(s,0)) {
    if (rec.blocked || rec.residual.length===0) continue;
    const residual=transformCellList(rec.residual,auto);
    const key=residual.join('.');
    let entry=groups.get(key);
    if(!entry){entry={residual,lines:[]};groups.set(key,entry);}
    entry.lines.push(auto.lineMap[rec.lineId]);
  }
  return [...groups.values()]
    .map(g=>({residual:g.residual,lines:[...new Set(g.lines)].sort((a,b)=>a-b)}))
    .sort((a,b)=>a.residual.length-b.residual.length || a.residual.join(',').localeCompare(b.residual.join(',')) || a.lines.join(',').localeCompare(b.lines.join(',')));
}
function outputQObjectUnder(s, auto) {
  return {
    side:s.side,
    support:transformedHeights(s,auto),
    p0Provenance:p0ProvenanceUnder(s,auto),
    p1:qResidualsUnder(s,1,auto),
  };
}
function currentCertificateObject(s, auto, {output=false}={}) {
  const hs=heightsOf(s.p0,s.p1);
  const q=qObjectUnder(s,auto);
  const interval=structuralInterval(s);
  const targets=new Set([...residualAntichain(s,0).flat(),...residualAntichain(s,1).flat()]);
  const cpc=[];
  const ndc=[];
  for (const x of [...targets].sort((a,b)=>a-b)) {
    const c=x%C, r=Math.floor(x/C);
    const depth=Math.max(0,r-hs[c]);
    const eventReservoir=(C-1)*R - s.ply + r + 1;
    const guards=[];
    for(let rr=hs[c];rr<r;rr+=1) guards.push(auto.cellMap[cell(c,rr)]);
    cpc.push({
      cell:auto.cellMap[x],
      supportDepth:depth,
      playableNow:depth===0,
      zeroReservationEventCount:eventReservoir,
      zeroReservationController:(s.side + ((eventReservoir-1)&1))&1,
    });
    ndc.push({cell:auto.cellMap[x],guards:guards.sort((a,b)=>a-b)});
  }
  cpc.sort((a,b)=>a.cell-b.cell);
  ndc.sort((a,b)=>a.cell-b.cell);

  const obligations=[];
  for(let attacker=0;attacker<=1;attacker+=1){
    for(const residual of residualAntichain(s,attacker)){
      if(residual.length!==1) continue;
      const x=residual[0],c=x%C,r=Math.floor(x/C),depth=Math.max(0,r-hs[c]);
      obligations.push({
        attacker,
        responseCell:auto.cellMap[x],
        supportDepth:depth,
        playableNow:depth===0,
        responseSlotsBeforeThreat:depth===0&&attacker!==s.side?1:null,
      });
    }
  }
  obligations.sort((a,b)=>a.attacker-b.attacker || a.responseCell-b.responseCell);
  const immediateOpponentResponses=obligations.filter(o=>o.playableNow&&o.attacker!==s.side).map(o=>o.responseCell);
  const responseParityRows=[];
  for(let r=(R-1)&1;r<R;r+=2)responseParityRows.push(r);
  const temporal={
    obligations,
    immediateDistinctResponseResources:[...new Set(immediateOpponentResponses)].sort((a,b)=>a-b),
    immediateResponseSlotCollision:[...new Set(immediateOpponentResponses)].length>1,
    pairedResponse:{
      applies:pairedResponseNoWin(s),
      responseRowParities:responseParityRows.map(r=>r&1),
    },
  };
  const cert={
    schema:output?'current-causal-certificate-output-v1':'current-causal-certificate-value-v1',
    q,
    structuralInterval:{lo:interval.lo,hi:interval.hi,reasons:interval.reasons},
    cpc,
    wsl:{p0:q.p0,p1:q.p1},
    ndc,
    temporal,
  };
  if(output)cert.outputProvenance=p0ProvenanceUnder(s,auto);
  return cert;
}

const certCache=new Map();
const outputCertCache=new Map();
function canonicalCertificate(s,{output=false}={}) {
  const cache=output?outputCertCache:certCache;
  const cached=cache.get(s.id); if(cached) return cached;
  let bestKey=null,bestAuto=null,tieAutos=[];
  for(const auto of automorphisms){
    const key=JSON.stringify(currentCertificateObject(s,auto,{output}));
    if(bestKey===null||key<bestKey){bestKey=key;bestAuto=auto;tieAutos=[auto];}
    else if(key===bestKey)tieAutos.push(auto);
  }
  const result={key:bestKey,auto:bestAuto,tieAutos};cache.set(s.id,result);return result;
}

function residualKeyUnder(s, player, auto, includeGeometry=true) {
  const rs=residualAntichain(s,player).map(r=>transformCellList(r,auto));
  if (includeGeometry) return rs.map(r=>r.join('.')).sort().join('|');
  return rs.map(r=>r.length).sort((a,b)=>a-b).join('.');
}
function canonicalProjection(s, builder) {
  let best=null,bestAuto=null;
  for (const auto of automorphisms) {
    const key=builder(auto);
    if (best===null || key<best) { best=key; bestAuto=auto; }
  }
  return {key:best,auto:bestAuto};
}
function wslSupportRawProjection(s) {
  const auto=automorphisms[0];
  return {key:`${s.side};H=${transformedHeights(s,auto).join(',')};P0=${residualKeyUnder(s,0,auto)};P1=${residualKeyUnder(s,1,auto)}`,auto};
}
function wslSupportProjection(s) {
  return canonicalProjection(s,auto => `${s.side};H=${transformedHeights(s,auto).join(',')};P0=${residualKeyUnder(s,0,auto)};P1=${residualKeyUnder(s,1,auto)}`);
}
function outputQRawProjection(s) {
  const auto=automorphisms[0];
  return {key:JSON.stringify(outputQObjectUnder(s,auto)),auto};
}
function outputQProjection(s) {
  return canonicalProjection(s,auto=>JSON.stringify(outputQObjectUnder(s,auto)));
}
function outputCertificateProjection(s) {
  const c=canonicalCertificate(s,{output:true});
  return {key:c.key,auto:c.auto};
}
function residualOnlyProjection(s) {
  return canonicalProjection(s,auto => `${s.side};P0=${residualKeyUnder(s,0,auto)};P1=${residualKeyUnder(s,1,auto)}`);
}
function residualCardinalityProjection(s) {
  return {key:`${s.side};P0=${residualKeyUnder(s,0,automorphisms[0],false)};P1=${residualKeyUnder(s,1,automorphisms[0],false)}`,auto:automorphisms[0]};
}
function supportOnlyProjection(s) {
  return canonicalProjection(s,auto => `${s.side};H=${transformedHeights(s,auto).join(',')}`);
}
function staticCapacityProjection(s) {
  const hs=heightsOf(s.p0,s.p1);
  const interval=structuralInterval(s);
  const parts=[`${s.side}`,`I=${interval.lo},${interval.hi}`];
  for (let p=0;p<=1;p+=1) {
    const live=liveLineRecords(s,p).filter(x=>!x.blocked);
    const sizes=live.map(x=>x.residual.length).sort((a,b)=>a-b);
    const singleton=live.filter(x=>x.residual.length===1);
    const playable=singleton.filter(rec=>{const x=rec.residual[0],c=x%C,r=Math.floor(x/C);return hs[c]===r;});
    const responseCells=new Set(singleton.map(x=>x.residual[0]));
    parts.push(`P${p}:sizes=${sizes.join('.')}:single=${singleton.length}:play=${playable.length}:resources=${responseCells.size}`);
  }
  return {key:parts.join(';'),auto:automorphisms[0]};
}
function localDescriptorProjection(s) {
  const hs=heightsOf(s.p0,s.p1);
  const p0lines=liveLineRecords(s,0), p1lines=liveLineRecords(s,1);
  const descriptors=[];
  for (let x=0;x<CELL_COUNT;x+=1) {
    const c=x%C,r=Math.floor(x/C);
    const d={
      status:statusAt(s,x), rowParity:r&1,
      supportDepth:statusAt(s,x)==='E'?Math.max(0,r-hs[c]):-1,
      p0Live:p0lines.filter(q=>!q.blocked && winningLines[q.lineId].includes(x)).length,
      p1Live:p1lines.filter(q=>!q.blocked && winningLines[q.lineId].includes(x)).length,
      p0Singleton:p0lines.filter(q=>!q.blocked&&q.residual.length===1&&q.residual[0]===x).length,
      p1Singleton:p1lines.filter(q=>!q.blocked&&q.residual.length===1&&q.residual[0]===x).length,
    };
    descriptors.push(JSON.stringify(d));
  }
  descriptors.sort();
  return {key:`${s.side};${descriptors.join('|')}`,auto:automorphisms[0]};
}
function causalProjection(s) { const c=canonicalCertificate(s); return {key:c.key,auto:c.auto}; }

function lineIds(mask) { const out=[]; for(let i=0;i<winningLines.length;i+=1) if(mask&(1<<i)) out.push(i+1); return out; }
function boardString(s) {
  const rows=[];
  for (let r=R-1;r>=0;r-=1) {
    let row='';
    for (let c=0;c<C;c+=1) row+=statusAt(s,cell(c,r))==='P0'?'0':statusAt(s,cell(c,r))==='P1'?'1':'.';
    rows.push(row);
  }
  return rows;
}
function witnessState(s, normalizedOutput=null) {
  return {
    id:s.id, ply:s.ply, sideToMove:s.side===0?'P0':'P1', boardTopDown:boardString(s),
    p0Bits:`0x${s.p0.toString(16)}`, p1Bits:`0x${s.p1.toString(16)}`,
    exactValue:exact[s.id], structuralInterval:structuralInterval(s), tactical:tacticalClass(s).kind,
    perfectP0TerminalLineIds:lineIds(outputMask(s.id)),
    normalizedTerminalLineIds:normalizedOutput===null?undefined:lineIds(normalizedOutput),
    legalColumns1Based:s.children.map(e=>e.column+1),
  };
}
function pairMetric(a,b) { return [Math.max(a.ply,b.ply),a.ply+b.ply,Math.min(a.id,b.id),Math.max(a.id,b.id)]; }
function metricLess(x,y) { for(let i=0;i<x.length;i+=1){if(x[i]!==y[i])return x[i]<y[i];} return false; }

function analyzeRelation(name, projection, {normalizeProvenance=true}={}) {
  const groups=new Map();
  for (const s of states) {
    if (s.terminal!==null) continue;
    const p=projection(s);
    const normalized=normalizeProvenance?mapLineMask(outputMask(s.id),p.auto):outputMask(s.id);
    let g=groups.get(p.key);
    if(!g){g=[];groups.set(p.key,g);}
    g.push({s,p,normalized});
  }
  let wdlMismatchClasses=0, outputMismatchClasses=0, mergedClasses=0;
  let smallestWdl=null, smallestOutput=null;
  for (const g of groups.values()) {
    if(g.length>1) mergedClasses+=1;
    const vals=new Set(g.map(x=>exact[x.s.id]));
    const outs=new Set(g.map(x=>x.normalized));
    if(vals.size>1) {
      wdlMismatchClasses+=1;
      for(let i=0;i<g.length;i+=1) for(let j=i+1;j<g.length;j+=1) if(exact[g[i].s.id]!==exact[g[j].s.id]) {
        const m=pairMetric(g[i].s,g[j].s);
        if(!smallestWdl || metricLess(m,smallestWdl.metric)) smallestWdl={metric:m,a:g[i],b:g[j]};
      }
    }
    if(outs.size>1) {
      outputMismatchClasses+=1;
      for(let i=0;i<g.length;i+=1) for(let j=i+1;j<g.length;j+=1) if(g[i].normalized!==g[j].normalized) {
        const m=pairMetric(g[i].s,g[j].s);
        if(!smallestOutput || metricLess(m,smallestOutput.metric)) smallestOutput={metric:m,a:g[i],b:g[j]};
      }
    }
  }
  const encodePair=x=>x?{
    metric:x.metric,
    a:witnessState(x.a.s,x.a.normalized),
    b:witnessState(x.b.s,x.b.normalized),
  }:null;
  return {
    name,
    nonterminalStates:states.filter(s=>s.terminal===null).length,
    classes:groups.size,
    mergedClasses,
    wdlMismatchClasses,
    outputMismatchClasses,
    smallestWdlCounterexample:encodePair(smallestWdl),
    smallestOutputCounterexample:encodePair(smallestOutput),
  };
}

function valueTransitionSignature(s) {
  return JSON.stringify(s.children.map(e=>{
    const child=states[e.child];
    return child.terminal!==null
      ? {column:e.column+1,terminal:child.terminal}
      : {column:e.column+1,q:wslSupportRawProjection(child).key};
  }));
}
function outputTransitionSignature(s) {
  return JSON.stringify(s.children.map(e=>{
    const child=states[e.child];
    if(child.terminal!==null){
      return {column:e.column+1,terminal:child.terminal,emittedP0Lines:child.terminal===1?lineIds(e.completed):[]};
    }
    return {column:e.column+1,q:outputQRawProjection(child).key};
  }));
}
function transitionCongruence(name,projection,signatureFn){
  const groups=new Map();
  for(const st of states){if(st.terminal!==null)continue;const k=projection(st).key;let g=groups.get(k);if(!g){g=[];groups.set(k,g);}g.push(st);}
  let mismatchClasses=0,smallest=null;
  for(const g of groups.values()){
    const firstSig=signatureFn(g[0]);let mixed=false;
    for(let i=1;i<g.length;i++)if(signatureFn(g[i])!==firstSig){mixed=true;break;}
    if(!mixed)continue;mismatchClasses+=1;
    for(let i=0;i<g.length;i++)for(let j=i+1;j<g.length;j++){
      if(signatureFn(g[i])===signatureFn(g[j]))continue;const m=pairMetric(g[i],g[j]);
      if(!smallest||metricLess(m,smallest.metric))smallest={metric:m,a:g[i],b:g[j],aSignature:signatureFn(g[i]),bSignature:signatureFn(g[j])};
    }
  }
  return {name,classes:groups.size,mismatchClasses,smallestCounterexample:smallest?{metric:smallest.metric,a:witnessState(smallest.a),b:witnessState(smallest.b),aSignature:smallest.aSignature,bSignature:smallest.bSignature}:null};
}

function projectedChildSetSignature(st, projection){
  const xs=st.children.map(e=>{const ch=states[e.child];return ch.terminal!==null?`T:${ch.terminal}`:`Q:${projection(ch).key}`;});
  return JSON.stringify([...new Set(xs)].sort());
}
function digest(text){return createHash('sha256').update(text).digest('hex');}
function projectedTransitionCongruence(name,projection){
  const groups=new Map();
  for(const st of states){if(st.terminal!==null)continue;const k=projection(st).key;let g=groups.get(k);if(!g){g=[];groups.set(k,g);}g.push(st);}
  let mismatchClasses=0,smallest=null;
  for(const g of groups.values()){
    const sigs=g.map(st=>projectedChildSetSignature(st,projection));
    if(new Set(sigs).size<=1)continue;
    mismatchClasses+=1;
    for(let i=0;i<g.length;i++)for(let j=i+1;j<g.length;j++){
      if(sigs[i]===sigs[j])continue;const m=pairMetric(g[i],g[j]);
      if(!smallest||metricLess(m,smallest.metric))smallest={metric:m,a:g[i],b:g[j],aSig:sigs[i],bSig:sigs[j]};
    }
  }
  return {name,classes:groups.size,mismatchClasses,smallestCounterexample:smallest?{metric:smallest.metric,a:witnessState(smallest.a),b:witnessState(smallest.b),aSuccessorSetSha256:digest(smallest.aSig),bSuccessorSetSha256:digest(smallest.bSig)}:null};
}

// The current value certificate adds explicit proof dependencies but, in this
// control, every included premise is derivable from the accepted C4-0010 q.
// Therefore it must not silently manufacture a finer or coarser semantic identity.
const certToQ=new Map(),qToCert=new Map();
const outCertToQ=new Map(),outQToCert=new Map();
for(const st of states){
  if(st.terminal!==null)continue;
  const ck=causalProjection(st).key,qk=wslSupportProjection(st).key;
  if(certToQ.has(ck))assert.equal(certToQ.get(ck),qk);else certToQ.set(ck,qk);
  if(qToCert.has(qk))assert.equal(qToCert.get(qk),ck);else qToCert.set(qk,ck);
  const ock=outputCertificateProjection(st).key,oqk=outputQProjection(st).key;
  if(outCertToQ.has(ock))assert.equal(outCertToQ.get(ock),oqk);else outCertToQ.set(ock,oqk);
  if(outQToCert.has(oqk))assert.equal(outQToCert.get(oqk),ock);else outQToCert.set(oqk,ock);
}

let provenanceTieAmbiguities=0;
for(const st of states){
  if(st.terminal!==null)continue;
  const c=canonicalCertificate(st,{output:true});
  if(c.tieAutos.length>1){
    const outs=new Set(c.tieAutos.map(a=>mapLineMask(outputMask(st.id),a)));
    if(outs.size>1)provenanceTieAmbiguities+=1;
  }
}
assert.equal(provenanceTieAmbiguities,0);

const transitionControls=[
  transitionCongruence('c4-0010-value-q-transition-congruence',wslSupportRawProjection,valueTransitionSignature),
  transitionCongruence('output-provenance-q-transition-congruence',outputQRawProjection,outputTransitionSignature),
];
for(const t of transitionControls)assert.equal(t.mismatchClasses,0);

const relations=[];
relations.push(analyzeRelation('current-value-certificate-causal-isomorphism',causalProjection,{normalizeProvenance:true}));
relations.push(analyzeRelation('c4-0010-value-quotient-raw',wslSupportRawProjection,{normalizeProvenance:false}));
relations.push(analyzeRelation('c4-0010-value-quotient-plus-geometry-isomorphism',wslSupportProjection,{normalizeProvenance:true}));
relations.push(analyzeRelation('output-provenance-quotient-raw',outputQRawProjection,{normalizeProvenance:false}));
relations.push(analyzeRelation('output-provenance-quotient-plus-geometry-isomorphism',outputQProjection,{normalizeProvenance:true}));
relations.push(analyzeRelation('current-output-certificate-causal-isomorphism',outputCertificateProjection,{normalizeProvenance:true}));
relations.push(analyzeRelation('wsl-antichain-without-support',residualOnlyProjection,{normalizeProvenance:true}));
relations.push(analyzeRelation('residual-cardinality-only',residualCardinalityProjection,{normalizeProvenance:false}));
relations.push(analyzeRelation('support-only',supportOnlyProjection,{normalizeProvenance:true}));
relations.push(analyzeRelation('static-capacity-summary-without-resource-identity-or-order',staticCapacityProjection,{normalizeProvenance:false}));
relations.push(analyzeRelation('local-causal-descriptor-multiset-without-extension-map',localDescriptorProjection,{normalizeProvenance:false}));

const similarityControls=[
  projectedTransitionCongruence('local-causal-descriptor-extension-coherence',localDescriptorProjection),
];
assert(similarityControls[0].mismatchClasses>0);

const causalClassSet=new Set();
const pairedRawClassSet=new Set();
const pairedDecisionRawClassSet=new Set();
const pairedClassSet=new Set();
const pairedDecisionClassSet=new Set();
const pairedDistribution={};
let pairedPhysical=0,pairedDecisionPhysical=0,pairedBoundMismatch=0;
for(const s of states){
  if(s.terminal!==null) continue;
  const ckey=causalProjection(s).key; causalClassSet.add(ckey);
  if(!pairedResponseNoWin(s)) continue;
  pairedPhysical+=1; pairedRawClassSet.add(wslSupportRawProjection(s).key); pairedClassSet.add(ckey);
  const ok=s.side===0?exact[s.id]<=0:exact[s.id]>=0;
  if(!ok) pairedBoundMismatch+=1;
  if(tacticalClass(s).kind==='decision'){
    pairedDecisionPhysical+=1;pairedDecisionRawClassSet.add(wslSupportRawProjection(s).key);pairedDecisionClassSet.add(ckey);
    const k=`side${s.side}:value${exact[s.id]}`;pairedDistribution[k]=(pairedDistribution[k]??0)+1;
  }
}
assert.equal(pairedBoundMismatch,0);

const structuralIntervalStats={facts:0,exactFacts:0,oneSidedFacts:0,mismatches:0,byInterval:{}};
for(const s of states){
  if(s.terminal!==null) continue;
  const q=structuralInterval(s); const k=`[${q.lo},${q.hi}]`;
  structuralIntervalStats.byInterval[k]=(structuralIntervalStats.byInterval[k]??0)+1;
  if(q.lo!==-1||q.hi!==1){
    structuralIntervalStats.facts+=1;
    if(q.lo===q.hi)structuralIntervalStats.exactFacts+=1; else structuralIntervalStats.oneSidedFacts+=1;
    if(exact[s.id]<q.lo||exact[s.id]>q.hi)structuralIntervalStats.mismatches+=1;
  }
}
assert.equal(structuralIntervalStats.mismatches,0);

const valueCertificate=relations[0];
assert.equal(valueCertificate.wdlMismatchClasses,0);
const valueQRaw=relations[1];
assert.equal(valueQRaw.wdlMismatchClasses,0);
assert(valueQRaw.outputMismatchClasses>0);
const outputQRaw=relations[3];
assert.equal(outputQRaw.wdlMismatchClasses,0);
assert.equal(outputQRaw.outputMismatchClasses,0);
const outputCertificate=relations[5];
assert.equal(outputCertificate.wdlMismatchClasses,0);
assert.equal(outputCertificate.outputMismatchClasses,0);

const result={
  kind:'current-causal-certificate-differential',
  generatedAt:'2026-09-13',
  attribution:{
    direction:'Josh Oshiro',
    formalization:'OpenAI ChatGPT',
  },
  domain:{columns:C,rows:R,connect:K,cells:CELL_COUNT,winningLines:winningLines.length},
  graph:{
    states:states.length,
    terminalStates:states.filter(s=>s.terminal!==null).length,
    nonterminalStates:states.filter(s=>s.terminal===null).length,
    rootValue:exact[0],
    rootPerfectP0TerminalLines:popcountNumber(outputMask(0)),
    wdlOracleAgreement:{
      forwardVsAlternatingFixedPointMismatches:bsfpMismatches,
      alternatingFixedPointPasses:bsfpPasses,
    },
  },
  geometryAutomorphisms:automorphisms.map(a=>({id:a.id,columnMap1Based:a.perm.map(x=>x+1)})),
  canonicalSignature:{
    valueSchema:'current-causal-certificate-value-v1',
    outputSchema:'current-causal-certificate-output-v1',
    semanticBase:'C4-0010 q = exact support + normalized P0/P1 residual antichains',
    includes:[
      'W/D/L structural interval facts',
      'CPC zero-reservation event count/controller on residual targets',
      'WSL minimal residual antichains',
      'NDC support guards for residual targets',
      'temporal singleton obligations/response resources/slot collisions',
      'paired-response one-sided bound premise',
    ],
    outputProvenance:'output mode adds exact P0 residual -> original-line provenance; geometry isomorphism carries an original-line -> canonical-line transport map',
    extensionCoherence:'raw C4-0010 q and output-provenance q are checked for exact successor congruence; geometry merges are restricted to global support/winning-line automorphisms, whose renaming extends to every successor',
    valueCertificatePartitionMatchesC40010PlusGeometry:true,
    outputCertificatePartitionMatchesProvenanceQPlusGeometry:true,
    provenanceTieAmbiguities,
    claimBoundary:'Only certificate premises derivable from q are folded into this canonical key. Non-derivable CPC/NDC/path-dependent certificates must extend identity or remain context-owned, as required by C4-0010.',
  },
  transitionControls,
  similarityControls,
  relations,
  structuralIntervalStats,
  relationAssessment:[
    {relation:'c4-0010-value-quotient-raw',category:'exact semantic identity',status:'accepted-authority-independently-requalified',proofObligation:'same q must induce the same legal successor q and terminal result',result:'zero W/D/L and successor-congruence mismatches'},
    {relation:'c4-0010-value-quotient-plus-geometry-isomorphism',category:'exact causal isomorphism',status:'accepted',proofObligation:'renaming must be a support/winning-line automorphism that extends through every legal successor',result:'zero W/D/L mismatches; output requires provenance transport'},
    {relation:'output-provenance-quotient-raw',category:'output semantic identity',status:'accepted-bounded-control',proofObligation:'q plus exact P0 residual origin provenance must preserve successor state and emitted original-line labels',result:'zero W/D/L, output, and successor-congruence mismatches'},
    {relation:'output-provenance-quotient-plus-geometry-isomorphism',category:'output causal isomorphism',status:'accepted-bounded-control',proofObligation:'geometry renaming must transport original-line labels equivariantly',result:'zero W/D/L and provenance-normalized output mismatches'},
    {relation:'wsl-antichain-without-support',category:'unsupported merge',status:'rejected',proofObligation:'residual identity alone would have to preserve playability/event order',result:'fails W/D/L'},
    {relation:'residual-cardinality-only',category:'unsupported dominance-like summary',status:'rejected',proofObligation:'cardinality would have to determine requirement identity and future transitions',result:'fails W/D/L'},
    {relation:'support-only',category:'unsupported merge',status:'rejected',proofObligation:'support alone would have to determine live winning requirements',result:'fails W/D/L'},
    {relation:'static-capacity-summary-without-resource-identity-or-order',category:'static policy summary',status:'rejected',proofObligation:'capacity counts would have to imply one compatible temporal contingent policy',result:'fails W/D/L'},
    {relation:'local-causal-descriptor-multiset-without-extension-map',category:'merely similar',status:'rejected-as-exact-identity',proofObligation:'local descriptor matching would need a successor-extension map / bisimulation',result:'0 W/D/L mismatches on primary control but 4 successor-congruence failures and output mismatches'},
  ],
  guardedRefinementAfterExactCausalQuotient:{
    theorem:'paired-response one-sided interval witness',
    physicalStates:pairedPhysical,
    c40010RawClasses:pairedRawClassSet.size,
    exactCausalClasses:pairedClassSet.size,
    genuineDecisionPhysicalStates:pairedDecisionPhysical,
    genuineDecisionC40010RawClasses:pairedDecisionRawClassSet.size,
    genuineDecisionExactCausalClasses:pairedDecisionClassSet.size,
    exactValueMismatches:pairedBoundMismatch,
    decisionValueDistribution:pairedDistribution,
    conclusion:'The theorem remains a genuine context-preserving interval refinement after exact causal-isomorphism quotienting; it is not a state merge.',
  },
  historicalScratchCount:{
    remembered:'2023 -> 419 + 1604',
    status:'retired-unverified',
    reason:'The obsolete /tmp/c4diff.mjs abstraction is unavailable and the current differential uses different, explicit causal semantics. No current count was tuned toward or interpreted through the remembered numbers.',
  },
};

console.log(JSON.stringify(result,null,2));
