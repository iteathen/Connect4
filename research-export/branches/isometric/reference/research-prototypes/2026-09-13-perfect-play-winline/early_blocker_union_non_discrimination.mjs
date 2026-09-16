import assert from 'node:assert/strict';

const W = 7;
const H = 6;
const CELLS = 42;
const lines = [];

for (let r = 0; r < H; r++) {
  for (let c = 0; c < W; c++) {
    for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      const x = c + 3 * dx;
      const y = r + 3 * dy;
      if (x < 0 || x >= W || y < 0 || y >= H) continue;
      let mask = 0n;
      for (let j = 0; j < 4; j++) {
        mask |= 1n << BigInt((r + j * dy) * W + c + j * dx);
      }
      lines.push(mask);
    }
  }
}
assert.equal(lines.length, 69);

function pc(v) {
  let n = 0;
  while (v) {
    v &= v - 1n;
    n++;
  }
  return n;
}

function canon(ms) {
  const xs = [...new Set(ms.map(x => x.toString()))]
    .map(BigInt)
    .sort((a, b) => pc(a) - pc(b) || (a < b ? -1 : a > b ? 1 : 0));
  const out = [];
  outer: for (const m of xs) {
    for (const p of out) if ((p & ~m) === 0n) continue outer;
    out.push(m);
  }
  return out;
}

function state(reply, third) {
  const h = new Uint8Array(W);
  let p0 = 0n;
  let p1 = 0n;
  for (let mv = 0; mv < 3; mv++) {
    const c = [4, reply, third][mv] - 1;
    const r = h[c]++;
    const bit = 1n << BigInt(r * W + c);
    if (mv & 1) p1 |= bit;
    else p0 |= bit;
  }
  return { h, p0, p1 };
}

function requirements(s) {
  const occ = s.p0 | s.p1;
  const out = [];
  for (const line of lines) {
    if (line & s.p1) continue;
    const rem = line & ~occ;
    if (rem) out.push(rem);
  }
  return canon(out);
}

function empty(h, cell) {
  const row = Math.trunc(cell / W);
  const col = cell - row * W;
  return row >= h[col];
}

function playable(h, cell) {
  const row = Math.trunc(cell / W);
  const col = cell - row * W;
  return row === h[col];
}

function liveOwnGroups(s) {
  const opp = s.p0;
  const occ = s.p0 | s.p1;
  const out = [];
  for (const line of lines) {
    if (line & opp) continue;
    const rem = line & ~occ;
    if (rem) out.push({ line, rem });
  }
  return out;
}

function componentBlocker(q, s) {
  const srow = Math.trunc(s / W);
  return (((srow + 1) & 1) === 0)
    ? (1n << BigInt(s))
    : ((1n << BigInt(q)) | (1n << BigInt(s)));
}

function enumerateTailBlockers(cols, starts) {
  const out = [];
  function rec(i, mask) {
    if (i === cols.length) {
      out.push(mask);
      return;
    }
    const c = cols[i];
    const start = starts[i];
    for (let r = start + 1; r < H; r++) {
      rec(i + 1, mask | (1n << BigInt(r * W + c)));
    }
  }
  rec(0, 0n);
  return out;
}

function blockers(s) {
  const h = s.h;
  const out = [];

  // A1 Claimeven solution shape.
  for (let c = 0; c < W; c++) {
    for (let lo = 0; lo < H - 1; lo++) {
      const up = lo + 1;
      if (((up + 1) & 1) !== 0) continue;
      const a = lo * W + c;
      const b = up * W + c;
      if (!empty(h, a) || !empty(h, b)) continue;
      out.push(['A1', 1n << BigInt(b)]);
    }
  }

  // A3 Vertical solution shape.
  for (let c = 0; c < W; c++) {
    for (let lo = 0; lo < H - 1; lo++) {
      const up = lo + 1;
      if (((up + 1) & 1) !== 1) continue;
      const a = lo * W + c;
      const b = up * W + c;
      if (!empty(h, a) || !empty(h, b)) continue;
      out.push(['A3', (1n << BigInt(a)) | (1n << BigInt(b))]);
    }
  }

  // A2 Baseinverse solution shape.
  const play = [];
  for (let c = 0; c < W; c++) if (h[c] < H) play.push(h[c] * W + c);
  for (let i = 0; i < play.length; i++) {
    for (let j = i + 1; j < play.length; j++) {
      out.push(['A2', (1n << BigInt(play[i])) | (1n << BigInt(play[j]))]);
    }
  }

  // A5 Lowinverse solution shapes.
  for (let c1 = 0; c1 < W; c1++) {
    for (let c2 = c1 + 1; c2 < W; c2++) {
      for (let l1 = 0; l1 < H - 1; l1++) {
        for (let l2 = 0; l2 < H - 1; l2++) {
          const u1 = l1 + 1;
          const u2 = l2 + 1;
          if (((u1 + 1) & 1) !== 1 || ((u2 + 1) & 1) !== 1) continue;
          const a = l1 * W + c1;
          const b = u1 * W + c1;
          const c = l2 * W + c2;
          const d = u2 * W + c2;
          if (![a, b, c, d].every(x => empty(h, x))) continue;
          for (const bm of [
            (1n << BigInt(a)) | (1n << BigInt(b)),
            (1n << BigInt(c)) | (1n << BigInt(d)),
            (1n << BigInt(b)) | (1n << BigInt(d)),
          ]) out.push(['A5', bm]);
        }
      }
    }
  }

  // A6 Highinverse solution shapes.
  for (let c1 = 0; c1 < W; c1++) {
    for (let c2 = c1 + 1; c2 < W; c2++) {
      for (let l1 = 0; l1 < H - 2; l1++) {
        for (let l2 = 0; l2 < H - 2; l2++) {
          const m1 = l1 + 1;
          const u1 = l1 + 2;
          const m2 = l2 + 1;
          const u2 = l2 + 2;
          if (((u1 + 1) & 1) !== 0 || ((u2 + 1) & 1) !== 0) continue;
          const a = l1 * W + c1;
          const b = m1 * W + c1;
          const c = u1 * W + c1;
          const d = l2 * W + c2;
          const e = m2 * W + c2;
          const f = u2 * W + c2;
          if (![a, b, c, d, e, f].every(x => empty(h, x))) continue;
          const bs = [
            (1n << BigInt(b)) | (1n << BigInt(c)),
            (1n << BigInt(e)) | (1n << BigInt(f)),
            (1n << BigInt(c)) | (1n << BigInt(f)),
            (1n << BigInt(b)) | (1n << BigInt(e)),
          ];
          if (playable(h, a)) bs.push((1n << BigInt(a)) | (1n << BigInt(f)));
          if (playable(h, d)) bs.push((1n << BigInt(d)) | (1n << BigInt(c)));
          for (const bm of bs) out.push(['A6', bm]);
        }
      }
    }
  }

  // A7 Baseclaim solution-shape blockers.
  for (let j = 0; j < play.length; j++) {
    const p2 = play[j];
    const r2 = Math.trunc(p2 / W);
    const c2 = p2 - r2 * W;
    if (r2 + 1 >= H) continue;
    const q2 = (r2 + 1) * W + c2;
    if (((r2 + 2) & 1) !== 0 || !empty(h, q2)) continue;
    for (let i = 0; i < play.length; i++) if (i !== j) {
      for (let z = i + 1; z < play.length; z++) if (z !== j) {
        out.push(['A7', (1n << BigInt(play[i])) | (1n << BigInt(q2))]);
        out.push(['A7', (1n << BigInt(p2)) | (1n << BigInt(play[z]))]);
      }
    }
  }

  // A8 Before, A4 Aftereven, A9 Specialbefore solution shapes.
  for (const g of liveOwnGroups(s)) {
    const empt = [];
    for (let cell = 0; cell < CELLS; cell++) {
      if ((g.rem >> BigInt(cell)) & 1n) empt.push(cell);
    }
    if (!empt.length || empt.some(q => Math.trunc(q / W) === H - 1)) continue;

    const succ = empt.map(q => q + W);
    let successorBlock = 0n;
    for (const x of succ) successorBlock |= 1n << BigInt(x);
    out.push(['A8', successorBlock]);
    for (let i = 0; i < empt.length; i++) {
      out.push(['A8', componentBlocker(empt[i], succ[i])]);
    }

    let aftereven = true;
    const cols = [];
    const starts = [];
    const claimBlockers = [];
    for (const q of empt) {
      const r = Math.trunc(q / W);
      const c = q - r * W;
      if (((r + 1) & 1) !== 0 || r === 0 || !empty(h, q - W)) {
        aftereven = false;
        break;
      }
      cols.push(c);
      starts.push(r);
      claimBlockers.push(1n << BigInt(q));
    }
    if (aftereven) {
      const uniqueCols = [];
      const minStarts = [];
      for (let i = 0; i < cols.length; i++) {
        const j = uniqueCols.indexOf(cols[i]);
        if (j < 0) {
          uniqueCols.push(cols[i]);
          minStarts.push(starts[i]);
        } else {
          minStarts[j] = Math.min(minStarts[j], starts[i]);
        }
      }
      for (const bm of claimBlockers) out.push(['A4', bm]);
      for (const bm of enumerateTailBlockers(uniqueCols, minStarts)) out.push(['A4', bm]);
    }

    for (const q of empt) {
      if (!playable(h, q)) continue;
      const qr = Math.trunc(q / W);
      const qc = q - qr * W;
      for (const x of play) {
        const xr = Math.trunc(x / W);
        const xc = x - xr * W;
        if (xc === qc || x === q) continue;
        let sblock = 1n << BigInt(x);
        for (const si of succ) sblock |= 1n << BigInt(si);
        out.push(['A9', sblock]);
        out.push(['A9', (1n << BigInt(q)) | (1n << BigInt(x))]);
        for (let i = 0; i < empt.length; i++) {
          out.push(['A9', componentBlocker(empt[i], succ[i])]);
        }
      }
    }
  }

  return out;
}

const WIN = 1;
const DRAW = 0;
const LOSS = -1;
const rows = [
  [DRAW, LOSS, WIN, WIN, WIN, WIN, WIN],
  [LOSS, WIN, LOSS, DRAW, DRAW, WIN, LOSS],
  [LOSS, LOSS, DRAW, DRAW, LOSS, WIN, WIN],
  [LOSS, LOSS, LOSS, WIN, LOSS, LOSS, LOSS],
];
rows.push([...rows[2]].reverse(), [...rows[1]].reverse(), [...rows[0]].reverse());

const byValue = {
  '-1': { states: 0, fullUnion: 0 },
  '0': { states: 0, fullUnion: 0 },
  '1': { states: 0, fullUnion: 0 },
};
const typeCounts = {};

for (let reply = 1; reply <= 7; reply++) {
  for (let third = 1; third <= 7; third++) {
    const s = state(reply, third);
    const reqs = requirements(s);
    const bs = blockers(s);
    const covered = new Set();

    for (const [type, bm] of bs) {
      typeCounts[type] = (typeCounts[type] ?? 0) + 1;
      for (let i = 0; i < reqs.length; i++) {
        if ((reqs[i] & bm) === bm) covered.add(i);
      }
    }

    const value = rows[reply - 1][third - 1];
    const bucket = byValue[String(value)];
    bucket.states++;
    if (covered.size === reqs.length) bucket.fullUnion++;

    assert.equal(
      covered.size,
      reqs.length,
      `incomplete blocker union after 4,${reply},${third}`,
    );
  }
}

assert.deepEqual(byValue, {
  '-1': { states: 20, fullUnion: 20 },
  '0': { states: 10, fullUnion: 10 },
  '1': { states: 19, fullUnion: 19 },
});

console.log(JSON.stringify({
  kind: 'early-blocker-union-non-discrimination',
  states: 49,
  byValue,
  typeCounts,
  interpretation:
    'Raw union of generated A1-A9 solution-shape blockers covers every P0 residual requirement in every labeled third-ply state, including all 19 P0-win states. Coverage without simultaneous certificate compatibility carries no W/D/L discrimination here.',
}, null, 2));
