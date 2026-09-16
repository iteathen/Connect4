import assert from 'node:assert/strict';
import * as domain from './quotient-negamax-domain-contract.mjs';

// Research direction / structural architecture / invariant-first and self-proving-predicate program: Josh Oshiro
// Formalization / implementation / qualification: OpenAI ChatGPT

export function proveDistance2TargetSupportReentry(kernel, lex, state, target) {
  const e = lex.repair;
  assert.equal(e.rank(state) % 2, 0, 'distance2 re-entry node must be P0 turn');
  assert.equal(e.singleton(state, 0, target), true, 'distance2 re-entry target singleton missing');
  assert.equal(e.targetDistance(state, target), 2, 'distance2 re-entry support distance drift');

  const targetCol = target % 7;
  const supportCell = e.landing(state, targetCol);
  assert.notEqual(supportCell, 0xff, 'distance2 target-support cell unavailable');
  assert.equal(Math.floor(supportCell / 7), 0, 'distance2 target-support action must land on row1');

  const afterP0 = kernel.advance(state, targetCol);
  if (afterP0 === domain.QN_TERMINAL_WIN) {
    return Object.freeze({
      proved: true,
      kind: 'distance2_target_support_reentry',
      witness: e.col(targetCol),
      witnessCell: e.coord(supportCell),
      witnessKind: 'P0_terminal_on_target_support',
      routes: Object.freeze({ P0_terminal_on_target_support: 1 }),
    });
  }
  assert(Number.isSafeInteger(afterP0) && afterP0 >= 0, 'distance2 target-support action invalid');
  assert.equal(e.rank(afterP0), e.rank(state) + 1, 'distance2 target-support rank drift');

  const routes = {};
  const branches = [];
  for (const reply of e.legal(afterP0)) {
    const replyCell = e.landing(afterP0, reply);
    const child = kernel.advance(afterP0, reply);
    if (child === domain.QN_TERMINAL_WIN) {
      assert(new Set(e.enabledSingletons(afterP0, 1)).has(replyCell), `P1 terminal ${e.coord(replyCell)} lacks enabled singleton premise`);
      routes.P1_terminal = (routes.P1_terminal ?? 0) + 1;
      return Object.freeze({
        proved: false,
        kind: 'distance2_target_support_rejected',
        witness: e.col(targetCol),
        witnessCell: e.coord(supportCell),
        routes: Object.freeze(routes),
        firstFailure: Object.freeze({ reply: e.col(reply), replyCell: e.coord(replyCell), reason: 'P1_terminal' }),
        branches: Object.freeze(branches),
      });
    }
    assert(Number.isSafeInteger(child) && child >= 0, 'distance2 target-support reply invalid');
    assert.equal(e.rank(child), e.rank(state) + 2, 'distance2 target-support child rank drift');

    const immediate = e.terminalActions(child, 0);
    if (immediate.length) {
      routes.immediate_P0_terminal = (routes.immediate_P0_terminal ?? 0) + 1;
      branches.push(Object.freeze({
        reply: e.col(reply), replyCell: e.coord(replyCell), route: 'immediate_P0_terminal',
        terminalColumns: Object.freeze(immediate.map((x) => e.col(x.column))),
      }));
      continue;
    }

    if (!e.invariant(child, target)) {
      routes.outside_distance1_invariant = (routes.outside_distance1_invariant ?? 0) + 1;
      return Object.freeze({
        proved: false,
        kind: 'distance2_target_support_rejected',
        witness: e.col(targetCol),
        witnessCell: e.coord(supportCell),
        routes: Object.freeze(routes),
        firstFailure: Object.freeze({
          reply: e.col(reply), replyCell: e.coord(replyCell), reason: 'outside_distance1_invariant',
          targetLive: e.singleton(child, 0, target), targetDistance: e.targetDistance(child, target),
          enabledP1: Object.freeze(e.enabledSingletons(child, 1).map(e.coord)),
        }),
        branches: Object.freeze(branches),
      });
    }

    const proof = lex.prove(child, target);
    if (!proof.proved) {
      routes.lexicographic_unproved = (routes.lexicographic_unproved ?? 0) + 1;
      return Object.freeze({
        proved: false,
        kind: 'distance2_target_support_rejected',
        witness: e.col(targetCol),
        witnessCell: e.coord(supportCell),
        routes: Object.freeze(routes),
        firstFailure: Object.freeze({
          reply: e.col(reply), replyCell: e.coord(replyCell), reason: proof.kind,
          measure: proof.measure ?? null,
          rejected: Object.freeze((proof.rejected ?? []).slice(0, 8)),
        }),
        branches: Object.freeze(branches),
      });
    }
    routes.lexicographic_induction = (routes.lexicographic_induction ?? 0) + 1;
    branches.push(Object.freeze({
      reply: e.col(reply), replyCell: e.coord(replyCell), route: 'lexicographic_induction',
      witness: proof.witness ?? null, witnessKind: proof.witnessKind ?? null,
    }));
  }

  return Object.freeze({
    proved: true,
    kind: 'distance2_target_support_reentry',
    witness: e.col(targetCol),
    witnessCell: e.coord(supportCell),
    witnessKind: 'branch_complete_target_support',
    routes: Object.freeze(routes),
    branches: Object.freeze(branches),
  });
}
