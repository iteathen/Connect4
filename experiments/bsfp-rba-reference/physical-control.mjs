// External qualification oracle only. Physical enumeration never participates
// in the RBA/P2 construction. First-win stopping uses independent ray scanning.
import { createConnectWinningLines } from '../../components/bsfp/geometry.mjs';
import { normalizeResidualRequirements, residualStateKey } from '../../components/bsfp/residual-winspace.mjs';

export function physicalControl(geometry) {
  const { columns, rows, connect } = geometry;
  const cellBit = (c, r) => 1n << BigInt(r * columns + c);
  const key = (p0, p1) => p0 + '/' + p1;
  const lines = createConnectWinningLines(geometry).map(line => line.reduce((v, c) => v | (1n << BigInt(c)), 0n));
  function wins(mask, c, r) {
    for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      let count = 1;
      for (const sign of [-1, 1]) for (let x = c + sign * dc, y = r + sign * dr;
        x >= 0 && x < columns && y >= 0 && y < rows && (mask & cellBit(x, y)); x += sign * dc, y += sign * dr) count++;
      if (count >= connect) return true;
    }
    return false;
  }
  const states = new Map(), ranks = Array.from({ length: columns * rows + 1 }, () => []);
  const root = { p0: 0n, p1: 0n, heights: Array(columns).fill(0), rank: 0 };
  states.set(key(0n, 0n), root); ranks[0].push(root);
  let edges = 0, terminalEdges = 0;
  for (let rank = 0; rank < ranks.length; rank++) for (const state of ranks[rank]) {
    const mover = rank & 1;
    state.actions = [];
    for (let c = 0; c < columns; c++) {
      const r = state.heights[c];
      if (r === rows) continue;
      edges++;
      const p0 = mover === 0 ? state.p0 | cellBit(c, r) : state.p0;
      const p1 = mover === 1 ? state.p1 | cellBit(c, r) : state.p1;
      if (wins(mover === 0 ? p0 : p1, c, r)) {
        state.actions.push({ value: mover === 0 ? 1 : -1 }); terminalEdges++; continue;
      }
      const childKey = key(p0, p1);
      if (!states.has(childKey)) {
        const heights = state.heights.slice(); heights[c]++;
        const child = { p0, p1, heights, rank: rank + 1 };
        states.set(childKey, child); ranks[rank + 1].push(child);
      }
      state.actions.push({ child: childKey });
    }
    const occupied = state.p0 | state.p1;
    const residual = opponent => normalizeResidualRequirements(lines.filter(l => !(l & opponent)).map(l => l & ~occupied));
    state.p0Requirements = residual(state.p1);
    state.p1Requirements = residual(state.p0);
    const supportIndex = state.heights.reduce((index, h, c) => index + h * (rows + 1) ** c, 0);
    state.qKey = residualStateKey({ ...state, supportIndex, sideToMove: mover });
  }
  for (let rank = ranks.length - 1; rank >= 0; rank--) for (const state of ranks[rank]) {
    const values = state.actions.map(a => a.child === undefined ? a.value : states.get(a.child).value);
    state.value = !values.length ? 0 : rank & 1 ? Math.min(...values) : Math.max(...values);
  }
  // Explicit reachable-q ordinary-value reference; structural transition
  // equality is checked before sharing. This census is qualification-only.
  const q = new Map();
  for (let rank = ranks.length - 1; rank >= 0; rank--) for (const state of ranks[rank]) {
    const signature = JSON.stringify(state.actions.map(a => a.child === undefined ? ['terminal', a.value] : ['q', states.get(a.child).qKey]));
    const prior = q.get(state.qKey);
    if (prior) {
      if (prior.signature !== signature || prior.value !== state.value) throw new Error('q transition/value quotient mismatch');
      continue;
    }
    const values = state.actions.map(a => a.child === undefined ? a.value : q.get(states.get(a.child).qKey).value);
    const value = !values.length ? 0 : rank & 1 ? Math.min(...values) : Math.max(...values);
    if (value !== state.value) throw new Error('explicit-q recurrence mismatch');
    q.set(state.qKey, { signature, value });
  }
  return { geometry, rootWdl: root.value, states, q, edges, terminalEdges };
}

