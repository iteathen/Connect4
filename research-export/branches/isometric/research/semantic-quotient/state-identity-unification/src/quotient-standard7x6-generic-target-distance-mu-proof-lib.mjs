import assert from 'node:assert/strict';
import * as domain from './quotient-negamax-domain-contract.mjs';
import { createRepairCapacityProofEngine, STANDARD7X6_REPAIR_COLUMNS } from './quotient-standard7x6-repair-capacity-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

export function createGenericTargetDistanceMuProofEngine(kernel, options = {}) {
  const maxProofStates = options.maxProofStates ?? 100000;
  const maxTargetDistance = options.maxTargetDistance ?? 5;
  const rootActions = options.rootActions == null ? null : Object.freeze([...options.rootActions]);
  if (!Number.isInteger(maxProofStates) || maxProofStates < 1) throw new RangeError('invalid maxProofStates');
  if (!Number.isInteger(maxTargetDistance) || maxTargetDistance < 1 || maxTargetDistance > 5) {
    throw new RangeError('maxTargetDistance must be 1..5');
  }

  const e = createRepairCapacityProofEngine(kernel, { maxProofStates: 1 });
  const memo = new Map();
  let proofStates = 0;
  let actionsChecked = 0;
  let p1BranchesChecked = 0;
  let maxDepth = 0;
  let targetSupportWitnesses = 0;
  let repairWitnesses = 0;
  let forcedDefenseNodes = 0;
  let capacityDefects = 0;

  function measure(state, target) {
    const live = e.singleton(state, 0, target);
    return { distance: live ? e.targetDistance(state, target) : null, mu: e.mu(state) };
  }
  function less(a, b) {
    assert(a.distance !== null && b.distance !== null);
    return a.distance < b.distance || (a.distance === b.distance && a.mu < b.mu);
  }
  function le(a, b) {
    assert(a.distance !== null && b.distance !== null);
    return a.distance < b.distance || (a.distance === b.distance && a.mu <= b.mu);
  }
  function exactKey(state, target) {
    return `${e.exactStateTargetKey(state, target)}|lambda`;
  }
  function obligations(state) {
    return [...new Set(e.enabledSingletons(state, 1))].sort((a, b) => a - b);
  }

  function prove(state, target, depth = 0) {
    assert.equal(e.rank(state) % 2, 0, 'generic target-distance node must be P0 turn');
    const immediate = e.terminalActions(state, 0);
    if (immediate.length) {
      return { proved: true, kind: 'immediate_P0_terminal', measure: measure(state, target), terminals: immediate.map((x) => e.coord(x.cell)) };
    }

    const current = measure(state, target);
    if (current.distance === null || current.distance < 1 || current.distance > maxTargetDistance) {
      return {
        proved: false, kind: 'outside_generic_target_distance_invariant', measure: current,
        targetLive: current.distance !== null, maxTargetDistance,
      };
    }

    const key = exactKey(state, target);
    if (memo.has(key)) return memo.get(key);
    proofStates++;
    maxDepth = Math.max(maxDepth, depth);
    if (proofStates > maxProofStates) throw new Error(`generic target-distance proof-state cap exceeded ${maxProofStates}`);

    const obs = obligations(state);
    if (obs.length >= 2) {
      capacityDefects++;
      const out = {
        proved: false,
        kind: 'forced_obligation_capacity_loss',
        exactLoss: true,
        measure: current,
        obligations: obs.map(e.coord),
        responseSlots: 1,
      };
      memo.set(key, out);
      return out;
    }

    const targetColumn = target % 7;
    let allowed = [...new Set([targetColumn, ...STANDARD7X6_REPAIR_COLUMNS])];
    let forcedDefense = null;
    if (obs.length === 1) {
      forcedDefenseNodes++;
      const threat = obs[0];
      const column = threat % 7;
      forcedDefense = { cell: e.coord(threat), column: e.col(column) };
      allowed = [column];
    }
    if (depth === 0 && rootActions !== null) {
      const rootSet = new Set(rootActions);
      allowed = allowed.filter((action) => rootSet.has(action));
    }

    const rejected = [];
    for (const action of allowed) {
      const actionCell = e.landing(state, action);
      if (actionCell === 0xff) continue;
      if (forcedDefense && actionCell !== obs[0]) {
        rejected.push({ action: e.col(action), reason: 'forced_defense_landing_mismatch', forcedDefense });
        continue;
      }
      actionsChecked++;
      const afterP0 = kernel.advance(state, action);
      if (afterP0 === domain.QN_TERMINAL_WIN) {
        const out = {
          proved: true,
          kind: 'generic_target_distance_predecessor',
          measure: current,
          witness: e.col(action),
          witnessKind: forcedDefense ? 'forced_defense_terminal' : action === targetColumn ? 'target_terminal' : 'repair_terminal',
          forcedDefense,
        };
        memo.set(key, out);
        return out;
      }
      assert(Number.isSafeInteger(afterP0) && afterP0 >= 0);
      assert.equal(e.rank(afterP0), e.rank(state) + 1);
      const afterP0Measure = measure(afterP0, target);
      if (afterP0Measure.distance === null || !less(afterP0Measure, current)) {
        rejected.push({ action: e.col(action), reason: 'no_lambda_descent', afterP0Measure });
        continue;
      }

      let accepted = true;
      let firstFailure = null;
      for (const reply of e.legal(afterP0)) {
        const replyCell = e.landing(afterP0, reply);
        p1BranchesChecked++;
        const child = kernel.advance(afterP0, reply);
        if (child === domain.QN_TERMINAL_WIN) {
          accepted = false;
          firstFailure ??= { reply: e.col(reply), replyCell: e.coord(replyCell), reason: 'P1_terminal' };
          continue;
        }
        assert(Number.isSafeInteger(child) && child >= 0);
        assert.equal(e.rank(child), e.rank(state) + 2);
        const nextImmediate = e.terminalActions(child, 0);
        if (nextImmediate.length) continue;

        const childMeasure = measure(child, target);
        if (childMeasure.distance === null) {
          accepted = false;
          firstFailure ??= { reply: e.col(reply), replyCell: e.coord(replyCell), reason: 'target_not_live', childMeasure };
          continue;
        }
        assert(le(childMeasure, afterP0Measure), 'P1 reply increased generic target-distance resource');
        if (childMeasure.distance < 1 || childMeasure.distance > maxTargetDistance) {
          accepted = false;
          firstFailure ??= { reply: e.col(reply), replyCell: e.coord(replyCell), reason: 'outside_generic_target_distance_invariant', childMeasure };
          continue;
        }
        const sub = prove(child, target, depth + 1);
        if (!sub.proved) {
          accepted = false;
          firstFailure ??= {
            reply: e.col(reply), replyCell: e.coord(replyCell), reason: sub.kind,
            childMeasure, exactLoss: sub.exactLoss === true,
            obligations: sub.obligations ?? null,
            forcedDefense: sub.forcedDefense ?? null,
          };
        }
      }

      if (accepted) {
        if (action === targetColumn) targetSupportWitnesses++;
        else repairWitnesses++;
        const out = {
          proved: true,
          kind: 'generic_target_distance_predecessor',
          measure: current,
          witness: e.col(action),
          witnessKind: forcedDefense ? 'forced_defense_lambda_descent'
            : action === targetColumn ? 'target_support_distance_descent' : 'repair_mu_descent',
          forcedDefense,
        };
        memo.set(key, out);
        return out;
      }
      rejected.push({ action: e.col(action), ...firstFailure });
    }

    const out = {
      proved: false,
      kind: 'no_generic_target_distance_predecessor',
      measure: current,
      obligations: obs.map(e.coord),
      forcedDefense,
      rejected,
    };
    memo.set(key, out);
    return out;
  }

  return Object.freeze({
    repair: e,
    measure,
    prove,
    stats: () => Object.freeze({
      proofStates, actionsChecked, p1BranchesChecked, maxDepth,
      targetSupportWitnesses, repairWitnesses, forcedDefenseNodes, capacityDefects,
      memoEntries: memo.size, maxProofStates, maxTargetDistance, rootActions,
    }),
  });
}
