import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { createSlot64ResidualQuotientKernel } from './quotient-native-negamax-slot64-residual-kernel.mjs';
import { createQuotientNegamaxEngine } from './quotient-negamax-engine.mjs';
import { QN_ILLEGAL, QN_TERMINAL_WIN, TACTICAL_NONE, FRONTIER_BOUND_DRAW } from './quotient-negamax-domain-contract.mjs';

// Research observer only: never used as production identity, ordering or proof.
// All physical columns remain in the complete graph and in the search below.
function census(spec) {
  const { kernel: k } = createSlot64ResidualQuotientKernel(spec, { prefixClasses: 4096 });
  const s = k.states, parent = [-1], move = [-1];
  for (let id = 0; id < s.count; id++) for (let c = 0; c < spec.columns; c++) {
    const child = k.advance(id, c);
    if (child >= 0 && parent[child] === undefined) { parent[child] = id; move[child] = c; }
  }
  const values = new Int8Array(s.count), keys = new Array(s.count);
  const classLo = new Uint32Array(k.classes.size), classHi = new Uint32Array(k.classes.size);
  const vocabulary = k.classes.termVocabulary;
  for (let id = 0; id < k.classes.size; id++) for (const term of k.classes.termIds(id)) {
    classLo[id] |= vocabulary.lo[term]; classHi[id] |= vocabulary.hi[term];
  }
  const columnLo = new Uint32Array(spec.columns), columnHi = new Uint32Array(spec.columns);
  for (let c = 0; c < spec.columns; c++) for (let r = 0; r < spec.rows; r++) {
    const cell = r * spec.columns + c;
    if (cell < 32) columnLo[c] |= 1 << cell; else columnHi[c] |= 1 << (cell - 32);
  }
  function deadColumns(id) {
    const lo = classLo[s.p0Class[id]] | classLo[s.p1Class[id]];
    const hi = classHi[s.p0Class[id]] | classHi[s.p1Class[id]];
    return Array.from({ length: spec.columns }, (_, c) => !(lo & columnLo[c]) && !(hi & columnHi[c]));
  }
  function path(id) {
    const result = [];
    while (parent[id] >= 0) { result.push(move[id]); id = parent[id]; }
    return result.reverse();
  }
  const groups = new Map();
  let bilateralExhausted = 0, multiNeutralStates = 0, unresolvedMultiNeutralStates = 0;
  let equivalentNeutralEdges = 0, mergedStates = 0, mergedUnresolvedStates = 0;
  let witness = null;
  for (let id = s.count - 1; id >= 0; id--) {
    const dead = deadColumns(id), liveHeights = [], neutral = [], signature = [];
    let rest = s.support[id], capacity = 0, best = -1, legal = 0;
    for (let c = 0; c < spec.columns; c++) {
      const height = rest % (spec.rows + 1); rest = Math.floor(rest / (spec.rows + 1));
      if (dead[c]) { capacity += spec.rows - height; liveHeights.push('-'); }
      else liveHeights.push(height);
      const child = k.advance(id, c);
      if (child === QN_ILLEGAL) continue;
      legal++;
      if (child >= 0) assert.ok(child > id, 'census is not ordered by increasing rank');
      best = Math.max(best, child === QN_TERMINAL_WIN ? 1 : -values[child]);
      if (!dead[c]) signature.push(`${c}:${child === QN_TERMINAL_WIN ? 'W' : keys[child]}`);
      if (dead[c]) {
        assert.ok(child >= 0);
        assert.equal(s.p0Class[child], s.p0Class[id]);
        assert.equal(s.p1Class[child], s.p1Class[id]);
        neutral.push({ column: c, child });
      }
    }
    values[id] = legal ? best : 0;
    if (neutral.length) signature.push(`N:${keys[neutral[0].child]}`);
    const transitionSignature = JSON.stringify(signature);
    const key = `${s.p0Class[id]}/${s.p1Class[id]}|${capacity}|${liveHeights.join(',')}`;
    keys[id] = key;
    const unresolved = k.tacticalCode(id) === TACTICAL_NONE && k.frontierBoundCode(id) !== FRONTIER_BOUND_DRAW;
    if (k.classes.isEmpty(s.p0Class[id]) && k.classes.isEmpty(s.p1Class[id])) {
      bilateralExhausted++;
      assert.equal(values[id], 0);
    }
    const prior = groups.get(key);
    if (prior) {
      assert.equal(values[id], values[prior.id], 'neutral capacity aliases different WDL');
      assert.equal(transitionSignature, prior.transitionSignature, 'pooled neutral states have different mapped successors');
      mergedStates++;
      if (unresolved && prior.unresolved) mergedUnresolvedStates++;
    } else groups.set(key, { id, unresolved, transitionSignature });
    if (neutral.length > 1) {
      multiNeutralStates++;
      if (unresolved) unresolvedMultiNeutralStates++;
      for (const item of neutral.slice(1)) {
        assert.equal(keys[item.child], keys[neutral[0].child], 'neutral choices differ after capacity reduction');
        assert.equal(values[item.child], values[neutral[0].child]);
        equivalentNeutralEdges++;
      }
      if (unresolved && values[id] !== 0 && (!witness || path(id).length < witness.path.length)) {
        witness = { path: path(id), stateId: id, supportIndex: s.support[id], p0Class: s.p0Class[id],
          p1Class: s.p1Class[id], value: values[id], neutralCapacity: capacity,
          choices: neutral.map(({ column, child }) => ({ column, child, value: -values[child] || 0 })) };
      }
    }
  }
  // Observe eligible duplicate actions on the real exact engine path, without
  // changing the move list or answering any proof request from the census.
  const visited = new Set(), neutralActionsVisited = new Map();
  let transitionCalls = 0, neutralTransitionCalls = 0, neutralCallsWithEquivalentSibling = 0;
  const solver = createQuotientNegamaxEngine({
    columns: k.columns, cellCount: k.cellCount, rootId: k.rootId, centerOrder: k.centerOrder,
    proofStore: k.proofStore,
    rankAt: id => k.supportAccess.rankAt(s.support[id]),
    isLegal: (id, c) => k.supportAccess.landingAt(s.support[id], c) !== 255,
    landingCellAt: (id, c) => k.supportAccess.landingAt(s.support[id], c),
    tacticalCode: k.tacticalCode, frontierBoundCode: k.frontierBoundCode, frontierOrder: k.frontierOrder,
    transition(id, column) {
      transitionCalls++; visited.add(id);
      const dead = deadColumns(id);
      if (dead[column]) {
        neutralTransitionCalls++;
        neutralActionsVisited.set(id, (neutralActionsVisited.get(id) ?? 0) | (1 << column));
        if (dead.filter((yes, c) => yes && k.supportAccess.landingAt(s.support[id], c) !== 255).length > 1) neutralCallsWithEquivalentSibling++;
      }
      return k.advance(id, column);
    },
  }, { etc: false });
  assert.ok(solver.solveRoot() === values[k.rootId]);
  let additionalEquivalentActionsVisited = 0;
  for (let mask of neutralActionsVisited.values()) {
    let count = 0;
    while (mask) { count++; mask &= mask - 1; }
    additionalEquivalentActionsVisited += Math.max(0, count - 1);
  }
  return { spec, stateCount: s.count, capacityClasses: groups.size, mergedStates, mergedUnresolvedStates,
    bilateralExhausted, multiNeutralStates, unresolvedMultiNeutralStates, equivalentNeutralEdges,
    witness, rootValue: values[k.rootId], search: { ...solver.metrics, uniqueTransitionParents: visited.size,
      transitionCalls, neutralTransitionCalls, neutralCallsWithEquivalentSibling, additionalEquivalentActionsVisited } };
}
const results = [[4, 3, 3], [4, 4, 4], [5, 3, 4], [4, 5, 4]].map(([columns, rows, connect]) => census({ columns, rows, connect }));
const result = { kind: 'current-quotient-neutral-capacity-census', scope: 'complete bounded active quotient graphs; unpruned WDL cross-check; production search observed unchanged; no timing claim or full standard root', results };
if (process.argv[2]) await writeFile(process.argv[2], JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
