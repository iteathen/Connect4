// Frozen October 18 2026 Level 1 SOURCE-only signed residual 2-SAT theorem.
// See docs/research/2026-10-18-level1-signed-residual-2sat-draw-exclusion-frozen.md.
// DRAW_EXCLUDED means no nonwinning full-board legal continuation exists.
// It is NOT a P0/P1 WDL verdict, winning strategy, or proof of optimal move.
// A positive SCC conflict carries the two implication paths, every arc tied
// to the original current q owner-tagged residual generator. ZERO game futures.
export function createSignedTwoClauseDrawExclusion({ width: W, height: H, connect: K }) {
  if (![W, H, K].every(Number.isInteger) ||
      W < 2 || H < 2 || K < 2 || K > Math.min(W, H) || W * H > 42)
    throw Error('unsupported source original board geometry');
  const N = W * H, b = z => 1n << BigInt(z);
  const pop = m => { let x = 0; while (m) { m &= m - 1n; x++; } return x; };
  const literal = (z, ownsP0) => 2 * z + (ownsP0 ? 0 : 1);
  const neg = l => l ^ 1;
  const repr = l => ({
    physicalCellID: l >> 1,
    oneBasedColumn: (l >> 1) % W + 1,
    oneBasedRow: Math.floor((l >> 1) / W) + 1,
    assignedP0: (l & 1) === 0
  });
  function analyze(q) {
    const h = q?.h;
    if (!Array.isArray(h) || h.length !== W ||
        h.some(z => !Number.isInteger(z) || z < 0 || z > H) ||
        !Array.isArray(q.R0) || !Array.isArray(q.R1) ||
        [...q.R0, ...q.R1].some(G => typeof G !== 'bigint' || G <= 0n))
      throw Error('qualified original nonterminal source (h,R0,R1) required');
    const rank = h.reduce((x, y) => x + y, 0);
    if (rank >= N) throw Error('full / already-terminal positions excluded');
    let future = 0n;
    for (let c = 0; c < W; c++)
      for (let r = h[c]; r < H; r++) future |= b(r * W + c);
    if ([...q.R0, ...q.R1].some(G => (G & ~future) !== 0n))
      throw Error('residual mask contains already occupied/nonfuture cell');
    const adj = Array.from({ length: 2 * N }, () => []);
    const radj = Array.from({ length: 2 * N }, () => []);
    const arcs = [];
    const stats = {
      rootPly: rank, rootMover: rank % 2,
      survivingP0Generators: q.R0.length, survivingP1Generators: q.R1.length,
      signedUnitClauses: 0, signedBinaryClauses: 0,
      ignoredThreeOrMoreCellClauses: 0,
      sourcePhysicalFutureCells: N - rank,
      sourceStrategicallyAlternativeFutureGamesVisited: 0,
      sourceGameOutcomeValuesQueried: 0, sourceOpponentPolicyTreesConstructed: 0,
      sourceCompiledGameTreeNodes: 0, sourceImplicationArcCount: 0,
      sourceSccVertexCount: 2 * N
    };
    function addArc(from, to, owner, index, G, arity) {
      const i = arcs.length;
      arcs.push({ from, to, owner, originalGeneratorIndex: index,
        originalSourceGeneratorHex: '0x' + G.toString(16), arity });
      adj[from].push(i); radj[to].push(i);
    }
    for (const owner of [0, 1]) {
      const R = owner === 0 ? q.R0 : q.R1;
      for (let i = 0; i < R.length; i++) {
        const G = R[i], k = pop(G);
        if (k > 2) { stats.ignoredThreeOrMoreCellClauses++; continue; }
        const cells = [];
        for (let z = 0; z < N; z++) if ((G & b(z)) !== 0n) cells.push(z);
        if (cells.length !== k || k < 1) throw Error('invalid source residual bit size');
        // Avoid owner 0 win: at least one physical cell belongs to P1.
        // Avoid owner 1 win: at least one physical cell belongs to P0.
        const u = literal(cells[0], owner === 1);
        if (k === 1) {
          stats.signedUnitClauses++;
          addArc(neg(u), u, owner, i, G, k);
        } else {
          stats.signedBinaryClauses++;
          const v = literal(cells[1], owner === 1);
          addArc(neg(u), v, owner, i, G, k);
          addArc(neg(v), u, owner, i, G, k);
        }
      }
    }
    stats.sourceImplicationArcCount = arcs.length;
    const seen = new Uint8Array(2 * N), finish = [];
    for (let root = 0; root < 2 * N; root++) {
      if (seen[root]) continue;
      seen[root] = 1;
      const stack = [{ node: root, next: 0 }];
      while (stack.length) {
        const f = stack[stack.length - 1];
        if (f.next === adj[f.node].length) {
          finish.push(f.node); stack.pop(); continue;
        }
        const e = arcs[adj[f.node][f.next++]];
        if (!seen[e.to]) {
          seen[e.to] = 1;
          stack.push({ node: e.to, next: 0 });
        }
      }
    }
    const comp = new Int32Array(2 * N).fill(-1);
    let components = 0;
    for (let j = finish.length - 1; j >= 0; j--) {
      const start = finish[j];
      if (comp[start] >= 0) continue;
      comp[start] = components;
      const stack = [start];
      while (stack.length) {
        const u = stack.pop();
        for (const ei of radj[u]) {
          const v = arcs[ei].from;
          if (comp[v] === -1) {
            comp[v] = components; stack.push(v);
          }
        }
      }
      components++;
    }
    stats.sourceSccCount = components;
    function path(from, to) {
      const parent = new Int32Array(2 * N).fill(-1);
      const queue = [from]; parent[from] = -2;
      for (let qi = 0; qi < queue.length && parent[to] === -1; qi++) {
        const u = queue[qi];
        for (const ei of adj[u]) {
          const v = arcs[ei].to;
          if (parent[v] !== -1 || comp[v] !== comp[from]) continue;
          parent[v] = ei; queue.push(v);
        }
      }
      if (parent[to] === -1) throw Error('SCC conflict path construction failed');
      const out = [];
      for (let at = to; at !== from;) {
        const ei = parent[at], e = arcs[ei];
        out.push({ from: repr(e.from), to: repr(e.to),
          originalPlayerWhoseWinMustBeAvoided: e.owner,
          originalGeneratorIndex: e.originalGeneratorIndex,
          originalGeneratorHex: e.originalSourceGeneratorHex,
          originalGeneratorArity: e.arity });
        at = e.from;
      }
      return out.reverse();
    }
    for (let c = 0; c < W; c++)
      for (let r = h[c]; r < H; r++) {
        const z = r * W + c, yes = literal(z, true), no = neg(yes);
        if (comp[yes] === comp[no])
          return {
            status: 'DRAW_EXCLUDED_BY_SOURCE_SIGNED_2SAT_CONTRADICTION',
            sourceNoFullBoardDraw: true, sourceOrdinaryRootWDLP0Relative: null,
            oneBasedContradictoryOriginalCell: { column: c + 1, row: r + 1 },
            pathP0ToP1: path(yes, no), pathP1ToP0: path(no, yes),
            originalSourceHeights: h.slice(), statistics: stats
          };
      }
    return {
      status: 'INCOMPLETE_SOURCE_SIGNED_2SAT_HAS_NO_CONTRADICTION',
      sourceNoFullBoardDraw: false, sourceOrdinaryRootWDLP0Relative: null,
      originalSourceHeights: h.slice(), statistics: stats
    };
  }
  return Object.freeze({ analyze });
}
