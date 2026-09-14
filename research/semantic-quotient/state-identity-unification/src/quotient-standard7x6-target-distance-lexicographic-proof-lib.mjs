import assert from 'node:assert/strict';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createResolvedTailLexicographicProofEngine, STANDARD7X6_RESOLVED_TAIL_REPAIR_COLUMNS } from './quotient-standard7x6-resolved-tail-lexicographic-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

export function createTargetDistanceLexicographicProofEngine(kernel, options = {}) {
  const maxProofStates = options.maxProofStates ?? 100000;
  const lex = createResolvedTailLexicographicProofEngine(kernel, { maxProofStates });
  const e = lex.repair;
  const memo = new Map();
  let distance2ProofStates = 0;
  let actionsChecked = 0;
  let p1BranchesChecked = 0;
  let maxDepth = 0;
  let targetSupportWitnesses = 0;
  let repairWitnesses = 0;
  let resolvedWitnesses = 0;
  let forcedWitnesses = 0;
  let capacityDefects = 0;

  function measure(state, target) {
    const live = e.singleton(state, 0, target);
    return {
      distance: live ? e.targetDistance(state, target) : null,
      delta: lex.tailDeficit(state, target),
      mu: e.mu(state),
    };
  }
  function kappaLess(a, b) {
    assert(a.distance !== null && b.distance !== null);
    return a.distance < b.distance
      || (a.distance === b.distance && (a.delta < b.delta
        || (a.delta === b.delta && a.mu < b.mu)));
  }
  function kappaLe(a, b) {
    assert(a.distance !== null && b.distance !== null);
    return a.distance < b.distance
      || (a.distance === b.distance && (a.delta < b.delta
        || (a.delta === b.delta && a.mu <= b.mu)));
  }
  function combinedProofStates() {
    return distance2ProofStates + lex.stats().proofStates;
  }
  function assertCombinedCap() {
    if (combinedProofStates() > maxProofStates) throw new Error(`target-distance proof-state cap exceeded ${maxProofStates}`);
  }
  function exactCapacityDefect(state, obligations) {
    assert.equal(e.terminalActions(state, 0).length, 0);
    const actionChecks = [];
    for (const action of e.legal(state)) {
      const actionCell = e.landing(state, action);
      const afterP0 = kernel.advance(state, action);
      assert(afterP0 !== domain.QN_TERMINAL_WIN && afterP0 >= 0);
      const p1Terminal = e.terminalActions(afterP0, 1);
      if (!p1Terminal.length) return null;
      actionChecks.push({ action: e.col(action), actionCell: e.coord(actionCell), p1Terminal: p1Terminal.map((x) => e.coord(x.cell)) });
    }
    return { obligations: obligations.map(e.coord), temporalResponseSlots: 1, actionChecks };
  }
  function verifyForcedAction(state, threat, forcedColumn) {
    assert.equal(e.landing(state, forcedColumn), threat);
    const eliminated = [];
    for (const action of e.legal(state)) {
      if (action === forcedColumn) continue;
      const afterP0 = kernel.advance(state, action);
      assert(afterP0 !== domain.QN_TERMINAL_WIN && afterP0 >= 0);
      const p1Terminal = e.terminalActions(afterP0, 1);
      if (!p1Terminal.length) return null;
      eliminated.push({ action: e.col(action), p1Terminal: p1Terminal.map((x) => e.coord(x.cell)) });
    }
    return eliminated;
  }

  function prove(state, target, depth = 0) {
    assert.equal(e.rank(state) % 2, 0, 'target-distance proof node must be P0 turn');
    const immediate = e.terminalActions(state, 0);
    if (immediate.length) return { proved: true, kind: 'immediate_P0_terminal', measure: measure(state, target) };

    const live = e.singleton(state, 0, target);
    const distance = live ? e.targetDistance(state, target) : null;
    if (!live || (distance !== 1 && distance !== 2)) {
      return { proved: false, kind: 'outside_target_distance_invariant', measure: measure(state, target), targetLive: live, targetDistance: distance };
    }
    if (distance === 1) {
      const out = lex.prove(state, target, depth);
      assertCombinedCap();
      return out;
    }

    const memoKey = `${state}:${target}`;
    if (memo.has(memoKey)) return memo.get(memoKey);
    distance2ProofStates++;
    maxDepth = Math.max(maxDepth, depth);
    assertCombinedCap();
    const current = measure(state, target);
    assert.equal(current.distance, 2);

    const obligations = [...new Set(e.enabledSingletons(state, 1))];
    let allowed;
    let forced = null;
    if (obligations.length >= 2) {
      const certificate = exactCapacityDefect(state, obligations);
      if (certificate) {
        capacityDefects++;
        const out = { proved: false, kind: 'multi_obligation_capacity_defect', measure: current, certificate };
        memo.set(memoKey, out);
        return out;
      }
      return { proved: false, kind: 'multi_obligation_not_exact_defect', measure: current, obligations: obligations.map(e.coord) };
    }
    if (obligations.length === 1) {
      const threat = obligations[0];
      const forcedColumn = threat % 7;
      const eliminated = verifyForcedAction(state, threat, forcedColumn);
      if (!eliminated) return { proved: false, kind: 'singleton_not_forced', measure: current, obligation: e.coord(threat) };
      forced = { threat, forcedColumn, eliminated };
      allowed = [forcedColumn];
    } else {
      const targetColumn = target % 7;
      const resolved = lex.resolvedColumn(target);
      allowed = [targetColumn, ...STANDARD7X6_RESOLVED_TAIL_REPAIR_COLUMNS];
      if (current.delta > 0 && !allowed.includes(resolved)) allowed.push(resolved);
    }

    const rejected = [];
    for (const action of [...new Set(allowed)]) {
      const actionCell = e.landing(state, action);
      if (actionCell === 0xff) continue;
      actionsChecked++;
      const afterP0 = kernel.advance(state, action);
      if (afterP0 === domain.QN_TERMINAL_WIN) {
        const out = { proved: true, kind: 'target_distance_predecessor', measure: current, witness: e.col(action), witnessKind: forced ? 'forced_defense_terminal' : 'P0_terminal' };
        memo.set(memoKey, out);
        return out;
      }
      assert(afterP0 >= 0 && e.rank(afterP0) === e.rank(state) + 1);
      const afterP0Measure = measure(afterP0, target);
      if (afterP0Measure.distance === null || !kappaLess(afterP0Measure, current)) {
        rejected.push({ action: e.col(action), reason: 'no_kappa_descent', afterP0Measure });
        continue;
      }

      let accepted = true;
      let firstFailure = null;
      for (const reply of e.legal(afterP0)) {
        const replyCell = e.landing(afterP0, reply);
        p1BranchesChecked++;
        const child = kernel.advance(afterP0, reply);
        if (child === domain.QN_TERMINAL_WIN) {
          assert(new Set(e.enabledSingletons(afterP0, 1)).has(replyCell), `P1 terminal ${e.coord(replyCell)} lacks enabled singleton premise`);
          accepted = false;
          firstFailure ??= { reply: e.col(reply), replyCell: e.coord(replyCell), reason: 'P1_terminal' };
          continue;
        }
        assert(child >= 0 && e.rank(child) === e.rank(state) + 2);
        if (e.terminalActions(child, 0).length) continue;
        const childMeasure = measure(child, target);
        if (childMeasure.distance === null) {
          accepted = false;
          firstFailure ??= { reply: e.col(reply), replyCell: e.coord(replyCell), reason: 'target_not_live', childMeasure };
          continue;
        }
        assert(kappaLe(childMeasure, afterP0Measure), 'P1 reply increased target-distance lexicographic resource');
        if (childMeasure.distance !== 1 && childMeasure.distance !== 2) {
          accepted = false;
          firstFailure ??= { reply: e.col(reply), replyCell: e.coord(replyCell), reason: 'outside_target_distance_invariant', childMeasure };
          continue;
        }
        const sub = childMeasure.distance === 1 ? lex.prove(child, target, depth + 1) : prove(child, target, depth + 1);
        assertCombinedCap();
        if (!sub.proved) {
          accepted = false;
          firstFailure ??= { reply: e.col(reply), replyCell: e.coord(replyCell), reason: sub.kind, childMeasure };
        }
      }
      if (accepted) {
        const targetColumn = target % 7;
        const resolved = lex.resolvedColumn(target);
        if (forced) forcedWitnesses++;
        if (action === targetColumn) targetSupportWitnesses++;
        else if (action === resolved) resolvedWitnesses++;
        else repairWitnesses++;
        const out = {
          proved: true,
          kind: 'target_distance_predecessor',
          measure: current,
          witness: e.col(action),
          witnessKind: forced ? 'forced_defense_kappa_descent'
            : action === targetColumn ? 'target_support_distance_descent'
            : action === resolved ? 'resolved_tail_kappa_descent' : 'repair_kappa_descent',
          forcedObligation: forced ? e.coord(forced.threat) : null,
        };
        memo.set(memoKey, out);
        return out;
      }
      rejected.push({ action: e.col(action), ...firstFailure });
    }

    const out = { proved: false, kind: 'no_target_distance_predecessor', measure: current, obligations: obligations.map(e.coord), rejected };
    memo.set(memoKey, out);
    return out;
  }

  return Object.freeze({
    lex,
    repair: e,
    measure,
    prove,
    stats: () => Object.freeze({
      distance2ProofStates,
      lexProofStates: lex.stats().proofStates,
      combinedProofStates: combinedProofStates(),
      actionsChecked,
      p1BranchesChecked,
      maxDepth,
      targetSupportWitnesses,
      repairWitnesses,
      resolvedWitnesses,
      forcedWitnesses,
      capacityDefects,
      memoEntries: memo.size,
      maxProofStates,
    }),
  });
}
