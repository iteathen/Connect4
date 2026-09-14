import assert from 'node:assert/strict';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

export const STANDARD7X6_REPAIR_COLUMNS = Object.freeze([0, 1, 3, 4, 5]); // A,B,D,E,F

function canonicalTerms(kernel, state, player) {
  const classId = player === 0 ? kernel.states.p0At(state) : kernel.states.p1At(state);
  return kernel.classes.terms(classId)
    .map(([lo, hi]) => `${(lo >>> 0).toString(16).padStart(8, '0')}:${(hi >>> 0).toString(16).padStart(8, '0')}`)
    .sort();
}

export function createRepairCapacityProofEngine(kernel, options = {}) {
  if (!kernel?.states || !kernel?.supportAccess || !kernel?.classes || typeof kernel.advance !== 'function') {
    throw new TypeError('repair proof engine requires a prepared quotient kernel');
  }
  const repairs = Object.freeze([...(options.repairColumns ?? STANDARD7X6_REPAIR_COLUMNS)]);
  const maxProofStates = options.maxProofStates ?? 100000;
  const collectAllWinningActions = options.collectAllWinningActions === true;
  if (!Number.isInteger(maxProofStates) || maxProofStates < 1) throw new RangeError('invalid maxProofStates');

  const memo = new Map();
  const certifiedKeys = new Set();
  let proofStates = 0;
  let candidateActionsChecked = 0;
  let p1BranchesChecked = 0;
  let maxDepth = 0;

  function rank(state) { return kernel.supportAccess.rankAt(kernel.states.supportAt(state)); }
  function landing(state, column) { return kernel.supportAccess.landingAt(kernel.states.supportAt(state), column); }
  function legal(state) {
    const out = [];
    for (let c = 0; c < 7; c++) if (landing(state, c) !== 0xff) out.push(c);
    return out;
  }
  function heights(state) {
    const out = [];
    for (let c = 0; c < 7; c++) {
      const x = landing(state, c);
      out.push(x === 0xff ? 6 : Math.floor(x / 7));
    }
    return out;
  }
  function capacity(state, column) { return 6 - heights(state)[column]; }
  function mu(state) { return repairs.reduce((sum, column) => sum + capacity(state, column), 0); }
  function col(column) { return String.fromCharCode(65 + column); }
  function coord(cell) { return `${col(cell % 7)}${Math.floor(cell / 7) + 1}`; }
  function has([lo, hi], x) { return x < 32 ? (((lo >>> x) & 1) !== 0) : (((hi >>> (x - 32)) & 1) !== 0); }
  function cells(term) { const out = []; for (let x = 0; x < 42; x++) if (has(term, x)) out.push(x); return out; }
  function terms(state, player) {
    const classId = player === 0 ? kernel.states.p0At(state) : kernel.states.p1At(state);
    return kernel.classes.terms(classId).map(cells);
  }
  function singleton(state, player, cell) { return terms(state, player).some((t) => t.length === 1 && t[0] === cell); }
  function enabledSingletons(state, player) {
    return terms(state, player)
      .filter((t) => t.length === 1)
      .map((t) => t[0])
      .filter((cell) => landing(state, cell % 7) === cell)
      .sort((a, b) => a - b);
  }
  function targetDistance(state, target) { return Math.max(0, 2 - heights(state)[target % 7]); }
  function invariant(state, target) {
    return rank(state) % 2 === 0 && singleton(state, 0, target) && targetDistance(state, target) === 1;
  }
  function terminalActions(state, player) {
    const enabled = new Set(enabledSingletons(state, player));
    const out = [];
    for (const column of legal(state)) {
      const cell = landing(state, column);
      const child = kernel.advance(state, column);
      if (child === domain.QN_TERMINAL_WIN) {
        assert(enabled.has(cell), `${player === 0 ? 'P0' : 'P1'} terminal ${coord(cell)} lacks enabled-singleton premise`);
        out.push({ column, cell });
      }
    }
    return out;
  }

  // Stable exact claim key. It serializes the exact support shape plus normalized residual
  // antichains and the target claim, rather than allocator-local state/class ids.
  // Under standard gravity, the seven column heights are an exact support identity.
  function exactStateTargetKey(state, target) {
    const hs = heights(state);
    return [
      `rank=${rank(state)}`,
      `turn=${rank(state) & 1}`,
      `h=${hs.join(',')}`,
      `r0=${canonicalTerms(kernel, state, 0).join(';')}`,
      `r1=${canonicalTerms(kernel, state, 1).join(';')}`,
      `target=${target}`,
    ].join('|');
  }

  function record(key, result) {
    memo.set(key, result);
    if (result.proved) certifiedKeys.add(key);
    return result;
  }

  function prove(state, target, depth = 0) {
    const key = exactStateTargetKey(state, target);
    if (memo.has(key)) return memo.get(key);
    proofStates++;
    maxDepth = Math.max(maxDepth, depth);
    if (proofStates > maxProofStates) throw new Error(`repair proof-state cap exceeded ${maxProofStates}`);
    assert.equal(rank(state) % 2, 0, 'repair proof node must be P0 turn');

    const m = mu(state);
    const immediate = terminalActions(state, 0);
    if (immediate.length) {
      return record(key, {
        proved: true,
        kind: 'immediate_P0_terminal',
        mu: m,
        terminalActions: immediate.map((x) => col(x.column)),
        exactCertificateKey: key,
      });
    }
    if (!invariant(state, target)) {
      return record(key, {
        proved: false,
        kind: 'outside_repair_invariant',
        mu: m,
        targetLive: singleton(state, 0, target),
        targetDistance: targetDistance(state, target),
        exactCertificateKey: key,
      });
    }

    const winningActions = [];
    const rejected = [];
    for (const action of repairs) {
      const actionCell = landing(state, action);
      if (actionCell === 0xff) continue;
      candidateActionsChecked++;
      const afterP0 = kernel.advance(state, action);
      if (afterP0 === domain.QN_TERMINAL_WIN) {
        winningActions.push({ column: col(action), kind: 'P0_terminal_now' });
        if (!collectAllWinningActions) {
          return record(key, {
            proved: true, kind: 'repair_predecessor', mu: m,
            witness: col(action), witnessKind: 'P0_terminal_now', winningActions,
            rejected, exactCertificateKey: key,
          });
        }
        continue;
      }
      assert(afterP0 >= 0 && rank(afterP0) === rank(state) + 1);
      assert.equal(mu(afterP0), m - 1, 'repair action did not strictly decrease mu');

      let accepted = true;
      let rejection = null;
      const branches = [];
      for (const reply of legal(afterP0)) {
        const replyCell = landing(afterP0, reply);
        p1BranchesChecked++;
        const afterP1 = kernel.advance(afterP0, reply);
        if (afterP1 === domain.QN_TERMINAL_WIN) {
          const p1Enabled = new Set(enabledSingletons(afterP0, 1));
          assert(p1Enabled.has(replyCell), `P1 terminal ${coord(replyCell)} lacks enabled-singleton premise`);
          accepted = false;
          rejection = { reply: col(reply), replyCell: coord(replyCell), reason: 'P1_terminal' };
          branches.push({ reply: col(reply), result: 'P1_terminal' });
          break;
        }
        assert(afterP1 >= 0 && rank(afterP1) === rank(state) + 2);
        assert(mu(afterP1) <= m - 1, 'P1 reply increased repair capacity');
        const nextImmediate = terminalActions(afterP1, 0);
        if (nextImmediate.length) {
          branches.push({ reply: col(reply), result: 'P0_terminal', mu: mu(afterP1) });
          continue;
        }
        assert(singleton(afterP1, 0, target), 'nonterminal reply killed live target singleton');
        assert.equal(targetDistance(afterP1, target), 1, 'nonterminal reply left support-distance-one repair invariant');
        const child = prove(afterP1, target, depth + 1);
        branches.push({ reply: col(reply), result: child.proved ? 'induction' : 'unproved', mu: mu(afterP1), childKey: child.exactCertificateKey });
        if (!child.proved) {
          accepted = false;
          rejection = { reply: col(reply), replyCell: coord(replyCell), reason: child.kind, childMu: child.mu };
          break;
        }
      }

      if (accepted) {
        winningActions.push({ column: col(action), kind: 'repair_induction', branches });
        if (!collectAllWinningActions) {
          return record(key, {
            proved: true, kind: 'repair_predecessor', mu: m,
            witness: col(action), witnessKind: 'repair_induction', winningActions,
            rejected, exactCertificateKey: key,
          });
        }
      } else {
        rejected.push({ action: col(action), ...rejection });
      }
    }

    if (winningActions.length) {
      const selected = [...winningActions].sort((a, b) => a.column.localeCompare(b.column))[0];
      return record(key, {
        proved: true, kind: 'repair_predecessor', mu: m,
        witness: selected.column, witnessKind: selected.kind,
        winningActions, rejected, exactCertificateKey: key,
      });
    }
    return record(key, {
      proved: false, kind: 'no_repair_predecessor', mu: m,
      rejected, exactCertificateKey: key,
    });
  }

  function isCertified(state, target) { return certifiedKeys.has(exactStateTargetKey(state, target)); }
  function exportCertificate() {
    return Object.freeze({
      kind: 'standard7x6-repair-capacity-exact-certificate-v1',
      exactStateTargetKeys: Object.freeze([...certifiedKeys]),
      stats: Object.freeze({ proofStates, candidateActionsChecked, p1BranchesChecked, maxDepth, memoEntries: memo.size, certifiedStateTargetPairs: certifiedKeys.size }),
      boundary: 'Exact support + normalized R0 + normalized R1 + side/rank + target claim. Keys are theorem-certificate identities only; they do not imply provenance equality or any stronger observational equivalence.',
    });
  }
  function stats() { return Object.freeze({ proofStates, candidateActionsChecked, p1BranchesChecked, maxDepth, memoEntries: memo.size, certifiedStateTargetPairs: certifiedKeys.size }); }

  return Object.freeze({
    prove, isCertified, exactStateTargetKey, exportCertificate, stats,
    rank, landing, legal, heights, capacity, mu, col, coord, terms, singleton,
    enabledSingletons, targetDistance, invariant, terminalActions,
    repairColumns: repairs,
  });
}
