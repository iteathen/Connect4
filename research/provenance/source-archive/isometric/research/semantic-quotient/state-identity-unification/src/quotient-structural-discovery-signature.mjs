// Research-only exact semantic projection and explicitly lossy ablations.
// No database labels, path IDs, hashes or search evaluations are inputs.
export function geometry(width, height, connect = 4) {
  if (![width, height, connect].every(Number.isSafeInteger) || width < 1 || height < 1 || connect !== 4 || width * height > 256) throw Error('unsupported discovery geometry');
  const lines = [];
  for (let c = 0; c < width; c++) for (let r = 0; r < height; r++) {
    for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      if (c + 3 * dc >= width || r + 3 * dr < 0 || r + 3 * dr >= height) continue;
      lines.push(Array.from({ length: 4 }, (_, j) => (c + j * dc) * height + r + j * dr));
    }
  }
  return Object.freeze({ width, height, connect, lines });
}
export function empty(g) {
  return { heights: Array(g.width).fill(0), owners: Array(g.width * g.height).fill(-1), ply: 0, terminal: null };
}
export function play(g, s, column) {
  if (!Number.isInteger(column) || column < 0 || column >= g.width || s.terminal !== null || s.heights[column] >= g.height) throw Error('illegal move');
  const t = { heights: [...s.heights], owners: [...s.owners], ply: s.ply + 1, terminal: null };
  const v = column * g.height + t.heights[column]++;
  t.owners[v] = s.ply % 2;
  if (g.lines.some(l => l.includes(v) && l.every(x => t.owners[x] === s.ply % 2))) t.terminal = s.ply % 2;
  else if (t.ply === g.width * g.height) t.terminal = 2;
  return t;
}
export function replay(g, moves) { return moves.reduce((s, c) => play(g, s, c), empty(g)); }
export const compareTerms = (a, b) => a.length - b.length || a.reduce((n, v, i) => n || v - b[i], 0);
export function antichain(terms) {
  const sorted = terms.map(t => [...t].sort((a,b) => a-b)).sort(compareTerms), kept = [];
  for (const t of sorted) if (!kept.some(u => u.every(v => t.includes(v)))) kept.push(t);
  return kept;
}
export function residuals(g, s) {
  return [0, 1].map(p => antichain(g.lines.filter(l => l.every(v => s.owners[v] !== 1-p)).map(l => l.filter(v => s.owners[v] === -1))));
}
export function cofactor(requirements, mover, cell) {
  return requirements.map((r,p)=>antichain(p===mover ? r.map(t=>t.filter(v=>v!==cell)) : r.filter(t=>!t.includes(cell))));
}
const enabled = (g, s, v) => s.heights[Math.floor(v / g.height)] === v % g.height;
export function singletonCells(g, s, requirements) { return requirements.filter(t => t.length === 1 && enabled(g, s, t[0])).map(t => t[0]).sort((a,b)=>a-b); }

// Two-event obligations indexed by their common enabling event. No hypothetical
// owner field is filled with baseline CPC parity. These are positive residuals.
export function forkPrecursors(g, s, requirements) {
  const byEnable = new Map();
  for (const t of requirements) if (t.length === 2 && t.every(v => enabled(g,s,v))) {
    for (let i=0;i<2;i++) {
      const targets = byEnable.get(t[i]) ?? new Set();
      targets.add(t[1-i]); byEnable.set(t[i], targets);
    }
  }
  return [...byEnable].filter(([,ts])=>ts.size>=2).map(([m,ts])=>[m,[...ts].sort((a,b)=>a-b)]).sort((a,b)=>a[0]-b[0]);
}

export function binarySpan(terms, cells) {
  const basis = Array(cells).fill(0n);
  for (const t of terms) {
    let x = t.reduce((a,v)=>a | (1n << BigInt(v)),0n);
    for (let i=cells-1;i>=0;i--) if ((x >> BigInt(i)) & 1n) {
      if (basis[i]) x ^= basis[i];
      else { basis[i]=x; break; }
    }
  }
  for (let i=0;i<cells;i++) if (basis[i]) for(let j=i+1;j<cells;j++) if((basis[j] >> BigInt(i)) & 1n) basis[j]^=basis[i];
  return basis.filter(x=>x!==0n).map(x=>x.toString(16));
}

export function describe(g, s) {
  const R = residuals(g,s);
  const singletons = R.map(r=>singletonCells(g,s,r));
  const precursors = R.map(r=>forkPrecursors(g,s,r));
  // Potential is defined ONLY at assigned cells. Empty-column anchor is unknown.
  const kappa = ((g.width-1)*g.height)%2;
  const boundaryPotential = s.heights.map((h,c)=>h ? s.owners[c*g.height+h-1] ^ ((kappa+h-1)%2) : -1);
  const support = [g.width,g.height,g.connect,s.ply%2,s.heights];
  const capacity = [singletons,precursors];
  const prefix = [support,boundaryPotential,capacity];
  const degree2=R.map(r=>r.filter(t=>t.length<=2));
  const spans=R.map(r=>binarySpan(r,g.width*g.height));
  // First legal event derivative, not hypothetical future parity or solved value.
  const jet=s.heights.flatMap((h,c)=>h<g.height ? [[c*g.height+h,cofactor(R,s.ply%2,c*g.height+h).map(r=>r.filter(t=>t.length<=2))]] : []);
  // Both owner-labelled conditional effects. The nonmoving owner's derivative
  // is an obligation template, NOT an assertion that they can act immediately.
  // Its guard requires intervening choices to preserve the event and residual.
  const ownerJet=[0,1].map(p=>s.heights.flatMap((h,c)=>h<g.height ? [[c*g.height+h,cofactor(R,p,c*g.height+h).map(r=>r.filter(t=>t.length<=2))]] : []));
  const signatures = {
    exact: JSON.stringify([support,R]),
    boundaryCapacity: JSON.stringify(prefix),
    degree2: JSON.stringify([prefix,degree2]),
    degree3: JSON.stringify([prefix,R.map(r=>r.filter(t=>t.length<=3))]),
    span: JSON.stringify([prefix,spans]),
    degree2Span: JSON.stringify([prefix,degree2,spans]),
    degree2Jet: JSON.stringify([prefix,degree2,jet]),
    ownerJet: JSON.stringify([prefix,degree2,ownerJet]),
  };
  return { R, support, boundaryPotential, singletons, precursors, signatures };
}

// Exact first-response closure, only necessary restrictions; surviving a filter
// is never promoted to win/draw. Counter-wins precede defense obligations.
export function capacityAllowed(g,s,d=describe(g,s)) {
  const mover=s.ply%2, opponent=1-mover;
  if (d.singletons[mover].length) return { kind:'immediate', cells:d.singletons[mover] };
  const legal=s.heights.flatMap((h,c)=>h<g.height?[c*g.height+h]:[]);
  if(d.singletons[opponent].length>=2) return {kind:'double',cells:[]};
  if(d.singletons[opponent].length===1) return {kind:'forced',cells:d.singletons[opponent]};
  // Fork geometry does not restrict actions here: intervening defense and
  // counter-win guards still require proof. Bare intersections have no authority.
  return {kind:'unresolved',cells:legal};
}
