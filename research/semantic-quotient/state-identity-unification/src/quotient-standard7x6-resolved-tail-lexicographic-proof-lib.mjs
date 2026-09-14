import assert from 'node:assert/strict';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createRepairCapacityProofEngine, STANDARD7X6_REPAIR_COLUMNS } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';

export const STANDARD7X6_RESOLVED_TAIL_REPAIR_COLUMNS = STANDARD7X6_REPAIR_COLUMNS;

export function createResolvedTailLexicographicProofEngine(kernel, options = {}) {
  const maxProofStates = options.maxProofStates ?? 100000;
  const repair = createRepairCapacityProofEngine(kernel, {
    collectAllWinningActions: false,
    maxProofStates,
  });
  const memo = new Map();
  let proofStates = 0;
  let actionsChecked = 0;
  let p1BranchesChecked = 0;
  let maxDepth = 0;
  let tailWitnesses = 0;
  let repairWitnesses = 0;

  function resolvedColumn(target) {
    // Standard 7x6 latent pair is C3/G3. If G3 remains, C is the resolved column; if C3 remains, G is resolved.
    const col = target % 7;
    if (col === 6) return 2;
    if (col === 2) return 6;
    throw new Error(`unsupported latent target column ${col}`);
  }
  function tailDeficit(state, target) {
    return Math.max(0, 6 - repair.heights(state)[resolvedColumn(target)]);
  }
  function measure(state, target) {
    return { delta: tailDeficit(state, target), mu: repair.mu(state) };
  }
  function lexLess(a, b) {
    return a.delta < b.delta || (a.delta === b.delta && a.mu < b.mu);
  }
  function lexLe(a, b) {
    return a.delta < b.delta || (a.delta === b.delta && a.mu <= b.mu);
  }
  function prove(state, target, depth = 0) {
    const memoKey = `${state}:${target}`;
    if (memo.has(memoKey)) return memo.get(memoKey);
    proofStates++;
    maxDepth = Math.max(maxDepth, depth);
    if (proofStates > maxProofStates) throw new Error(`lex proof-state cap exceeded ${maxProofStates}`);
    assert.equal(repair.rank(state) % 2, 0, 'lex proof node must be P0 turn');

    const current = measure(state, target);
    const immediate = repair.terminalActions(state, 0);
    if (immediate.length) {
      const out = { proved: true, kind: 'immediate_P0_terminal', measure: current };
      memo.set(memoKey, out);
      return out;
    }
    if (!repair.invariant(state, target)) {
      const out = {
        proved: false,
        kind: 'outside_live_target_invariant',
        measure: current,
        targetLive: repair.singleton(state, 0, target),
        targetDistance: repair.targetDistance(state, target),
      };
      memo.set(memoKey, out);
      return out;
    }

    const resolved = resolvedColumn(target);
    const allowed = [...STANDARD7X6_REPAIR_COLUMNS];
    if (current.delta > 0 && !allowed.includes(resolved)) allowed.push(resolved);
    const rejected = [];

    for (const action of allowed) {
      const actionCell = repair.landing(state, action);
      if (actionCell === 0xff) continue;
      actionsChecked++;
      const afterP0 = kernel.advance(state, action);
      if (afterP0 === domain.QN_TERMINAL_WIN) {
        const out = {
          proved: true,
          kind: 'lex_predecessor',
          measure: current,
          witness: repair.col(action),
          witnessKind: action === resolved ? 'resolved_tail_terminal' : 'repair_terminal',
        };
        memo.set(memoKey, out);
        return out;
      }
      assert(afterP0 >= 0 && repair.rank(afterP0) === repair.rank(state) + 1);
      const afterP0Measure = measure(afterP0, target);
      if (action === resolved) {
        assert.equal(afterP0Measure.delta, current.delta - 1, 'resolved-tail action failed to decrease delta');
        assert.equal(afterP0Measure.mu, current.mu, 'resolved-tail action changed repair mu');
      } else {
        assert.equal(afterP0Measure.mu, current.mu - 1, 'repair action failed to decrease mu');
        assert(afterP0Measure.delta <= current.delta, 'repair action increased resolved-tail deficit');
      }
      assert(lexLess(afterP0Measure, current), 'selected P0 action failed lexicographic descent');

      let accepted = true;
      let firstFailure = null;
      for (const reply of repair.legal(afterP0)) {
        const replyCell = repair.landing(afterP0, reply);
        p1BranchesChecked++;
        const child = kernel.advance(afterP0, reply);
        if (child === domain.QN_TERMINAL_WIN) {
          assert(new Set(repair.enabledSingletons(afterP0, 1)).has(replyCell), `P1 terminal ${repair.coord(replyCell)} lacks enabled singleton premise`);
          accepted = false;
          firstFailure ??= { reply: repair.col(reply), replyCell: repair.coord(replyCell), reason: 'P1_terminal' };
          continue;
        }
        assert(child >= 0 && repair.rank(child) === repair.rank(state) + 2);
        const childMeasure = measure(child, target);
        assert(lexLe(childMeasure, afterP0Measure), 'P1 reply increased lexicographic resource');
        if (repair.terminalActions(child, 0).length) continue;
        if (!repair.invariant(child, target)) {
          accepted = false;
          firstFailure ??= {
            reply: repair.col(reply),
            replyCell: repair.coord(replyCell),
            reason: 'outside_live_target_invariant',
            childMeasure,
          };
          continue;
        }
        const sub = prove(child, target, depth + 1);
        if (!sub.proved) {
          accepted = false;
          firstFailure ??= {
            reply: repair.col(reply),
            replyCell: repair.coord(replyCell),
            reason: sub.kind,
            childMeasure,
          };
        }
      }
      if (accepted) {
        if (action === resolved) tailWitnesses++;
        else repairWitnesses++;
        const out = {
          proved: true,
          kind: 'lex_predecessor',
          measure: current,
          witness: repair.col(action),
          witnessKind: action === resolved ? 'resolved_tail_descent' : 'repair_descent',
        };
        memo.set(memoKey, out);
        return out;
      }
      rejected.push({ action: repair.col(action), ...firstFailure });
    }

    const out = { proved: false, kind: 'no_lex_predecessor', measure: current, rejected };
    memo.set(memoKey, out);
    return out;
  }

  return Object.freeze({
    repair,
    resolvedColumn,
    tailDeficit,
    measure,
    prove,
    stats: () => Object.freeze({
      proofStates,
      actionsChecked,
      p1BranchesChecked,
      maxDepth,
      tailWitnesses,
      repairWitnesses,
      memoEntries: memo.size,
      maxProofStates,
    }),
  });
}
