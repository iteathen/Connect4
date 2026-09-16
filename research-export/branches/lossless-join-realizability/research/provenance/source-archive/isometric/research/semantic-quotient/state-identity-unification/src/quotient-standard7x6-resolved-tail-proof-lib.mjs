import assert from 'node:assert/strict';
import * as domain from './quotient-negamax-domain-contract.mjs';
import {
  createRepairCapacityProofEngine,
  STANDARD7X6_REPAIR_COLUMNS,
} from './quotient-standard7x6-repair-capacity-proof-lib.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

export const STANDARD7X6_C3 = 16;
export const STANDARD7X6_G3 = 20;
export const STANDARD7X6_C_COLUMN = 2;
export const STANDARD7X6_G_COLUMN = 6;

export function resolvedColumnForLiveTarget(target) {
  if (target === STANDARD7X6_G3) return STANDARD7X6_C_COLUMN;
  if (target === STANDARD7X6_C3) return STANDARD7X6_G_COLUMN;
  throw new Error(`unsupported standard7x6 live target ${target}`);
}

export function createResolvedTailCapacityProofEngine(kernel, options = {}) {
  const maxProofStates = options.maxProofStates ?? 100000;
  const collectAllWinningActions = options.collectAllWinningActions ?? true;
  const repairColumns = Object.freeze([...(options.repairColumns ?? STANDARD7X6_REPAIR_COLUMNS)]);
  const base = createRepairCapacityProofEngine(kernel, {
    collectAllWinningActions: true,
    maxProofStates,
    repairColumns,
  });

  const memo = new Map();
  let proofStates = 0;
  let candidateActionsChecked = 0;
  let p1BranchesChecked = 0;
  let maxDepth = 0;

  function resolvedColumn(target) { return resolvedColumnForLiveTarget(target); }
  function nu(state, target) { return base.mu(state) + base.capacity(state, resolvedColumn(target)); }
  function progressColumns(target) { return [...repairColumns, resolvedColumn(target)]; }
  function exactStateTargetKey(state, target) {
    return `${base.exactStateTargetKey(state, target)}|resolved=${resolvedColumn(target)}|nu=${nu(state, target)}`;
  }
  function record(key, result) { memo.set(key, result); return result; }

  function prove(state, target, depth = 0) {
    const key = exactStateTargetKey(state, target);
    if (memo.has(key)) return memo.get(key);
    proofStates++;
    maxDepth = Math.max(maxDepth, depth);
    if (proofStates > maxProofStates) throw new Error(`resolved-tail proof-state cap exceeded ${maxProofStates}`);
    assert.equal(base.rank(state) % 2, 0, 'resolved-tail proof node must be P0 turn');

    const measure = nu(state, target);
    const immediate = base.terminalActions(state, 0);
    if (immediate.length) {
      return record(key, {
        proved: true,
        kind: 'immediate_P0_terminal',
        nu: measure,
        terminalActions: immediate.map((x) => base.col(x.column)),
        exactCertificateKey: key,
      });
    }
    if (!base.invariant(state, target)) {
      return record(key, {
        proved: false,
        kind: 'outside_live_target_distance1_invariant',
        nu: measure,
        targetLive: base.singleton(state, 0, target),
        targetDistance: base.targetDistance(state, target),
        exactCertificateKey: key,
      });
    }

    const winningActions = [];
    const rejected = [];
    for (const action of progressColumns(target)) {
      const actionCell = base.landing(state, action);
      if (actionCell === 0xff) continue;
      candidateActionsChecked++;
      const role = action === resolvedColumn(target) ? 'resolved_tail' : 'repair';
      const afterP0 = kernel.advance(state, action);
      if (afterP0 === domain.QN_TERMINAL_WIN) {
        winningActions.push({ column: base.col(action), role, kind: 'P0_terminal_now' });
        if (!collectAllWinningActions) {
          return record(key, {
            proved: true, kind: 'resolved_tail_extended_predecessor', nu: measure,
            witness: base.col(action), witnessRole: role, witnessKind: 'P0_terminal_now',
            winningActions, rejected, exactCertificateKey: key,
          });
        }
        continue;
      }
      assert(afterP0 >= 0 && base.rank(afterP0) === base.rank(state) + 1);
      assert.equal(nu(afterP0, target), measure - 1, 'selected progress action did not strictly decrease nu');

      let accepted = true;
      let rejection = null;
      const branches = [];
      for (const reply of base.legal(afterP0)) {
        const replyCell = base.landing(afterP0, reply);
        p1BranchesChecked++;
        const afterP1 = kernel.advance(afterP0, reply);
        if (afterP1 === domain.QN_TERMINAL_WIN) {
          const enabled = new Set(base.enabledSingletons(afterP0, 1));
          assert(enabled.has(replyCell), `P1 terminal ${base.coord(replyCell)} lacks enabled-singleton premise`);
          accepted = false;
          rejection = { reply: base.col(reply), replyCell: base.coord(replyCell), reason: 'P1_terminal' };
          branches.push({ reply: base.col(reply), result: 'P1_terminal' });
          break;
        }
        assert(afterP1 >= 0 && base.rank(afterP1) === base.rank(state) + 2);
        assert(nu(afterP1, target) <= measure - 1, 'P1 reply increased resolved-tail measure');
        const nextImmediate = base.terminalActions(afterP1, 0);
        if (nextImmediate.length) {
          branches.push({ reply: base.col(reply), result: 'P0_terminal', nu: nu(afterP1, target) });
          continue;
        }
        assert(base.singleton(afterP1, 0, target), 'nonterminal reply killed live target singleton');
        assert.equal(base.targetDistance(afterP1, target), 1, 'nonterminal reply left live-target distance-one invariant');
        const child = prove(afterP1, target, depth + 1);
        branches.push({ reply: base.col(reply), result: child.proved ? 'induction' : 'unproved', nu: nu(afterP1, target), childKey: child.exactCertificateKey });
        if (!child.proved) {
          accepted = false;
          rejection = { reply: base.col(reply), replyCell: base.coord(replyCell), reason: child.kind, childNu: child.nu };
          break;
        }
      }

      if (accepted) {
        winningActions.push({ column: base.col(action), role, kind: 'resolved_tail_extended_induction', branches });
        if (!collectAllWinningActions) {
          return record(key, {
            proved: true, kind: 'resolved_tail_extended_predecessor', nu: measure,
            witness: base.col(action), witnessRole: role, witnessKind: 'resolved_tail_extended_induction',
            winningActions, rejected, exactCertificateKey: key,
          });
        }
      } else {
        rejected.push({ action: base.col(action), role, ...rejection });
      }
    }

    if (winningActions.length) {
      const selected = [...winningActions].sort((a, b) => a.column.localeCompare(b.column))[0];
      return record(key, {
        proved: true, kind: 'resolved_tail_extended_predecessor', nu: measure,
        witness: selected.column, witnessRole: selected.role, witnessKind: selected.kind,
        winningActions, rejected, exactCertificateKey: key,
      });
    }
    return record(key, {
      proved: false, kind: 'no_resolved_tail_extended_predecessor', nu: measure,
      rejected, exactCertificateKey: key,
    });
  }

  function stats() {
    return Object.freeze({ proofStates, candidateActionsChecked, p1BranchesChecked, maxDepth, memoEntries: memo.size });
  }

  return Object.freeze({
    prove, stats, nu, resolvedColumn, progressColumns, exactStateTargetKey,
    base,
    theoremBoundary: 'Standard7x6 live-target distance-one predecessor induction over A/B/D/E/F plus only the already-resolved C/G column, ranked by nu=repair_mu+resolved-tail remaining capacity. The still-live target column is excluded.',
  });
}
