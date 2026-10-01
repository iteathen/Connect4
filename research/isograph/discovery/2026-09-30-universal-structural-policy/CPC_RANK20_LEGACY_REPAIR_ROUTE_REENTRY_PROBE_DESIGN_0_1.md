# RLC rank-20 legacy repair route reentry probe 0.1

**Date:** 2026-10-01  
**Status:** frozen monotonic proof-library integration probe before execution  
**Branch:** `research/universal-structural-policy-20260930`

## Motivation

The unified RCIC route matcher currently consults a narrow catalog of newer RLC roots plus target-reservoir / contraction routes. The older standard-7x6 repair-capacity certificate engine remains present and qualified, but is not consulted by that routing grammar.

This probe tests the monotonicity requirement:

[
\mathcal T_{new} \supseteq \mathcal T_{old}
]

at the live rank-20 c5 / reply-c5 obstruction.

## Sources

Consume only:

- `CPC_RANK20_C5_REPLY5_POST_CONTRACTION_CPC_REENTRY_DIAGNOSTIC_0_1.json`;
- `research/semantic-quotient/state-identity-unification/src/quotient-standard7x6-repair-capacity-proof-lib.mjs`;
- exact RBA/CPC primitives from pinned JSMinSys `bf23d3a67652cd42e1975f29c7dc4eed54f7eb42`.

No solved W/D/L source is allowed.

## Exact representation bridge

For each frozen post-contraction physical sequence:

1. replay it in JSMinSys RBA;
2. replay the same sequence in the older semantic-quotient kernel;
3. compare exact support;
4. normalize each side's active P0 and P1 residual cell sets to sorted cell-set keys;
5. require equality of the complete normalized P0 antichain and complete normalized P1 antichain.

Support equality alone is insufficient.

A state is admitted to the legacy adapter test only after this exact relational identity bridge passes.

## Legacy repair route

Each source state is odd-rank / defender-to-move.

For every legal defender reply:

1. execute the exact reply in both representations;
2. reject the source as fully closed if the defender reply is an immediate defender terminal;
3. otherwise require exact relational identity equality again at the even-rank child;
4. record any immediate P0 terminal action;
5. enumerate every active P0 singleton target in the child;
6. for each singleton, test the legacy repair invariant:
   - P0 to move;
   - target singleton live;
   - target support distance exactly one;
7. for every invariant-compatible target call the unchanged `createRepairCapacityProofEngine(...).prove(child,target)`;
8. accept the defender child if any immediate terminal or any legacy repair proof succeeds.

A source post-contraction state is `LEGACY_REPAIR_CLOSED` iff every legal defender reply is closed by one of those exact routes.

## Resource boundary

The legacy proof engine may use its already-qualified recursive decreasing-`mu` induction. That recursion is the theorem being reused; it is not ordinary free-branch minimax.

Use a fresh quotient kernel/proof engine per source state with a declared proof-state cap. Resource exhaustion is recorded separately from logical rejection.

## Required evidence

For every source state report:

- source sequence/rank/support/target;
- exact bridge pass/failure and normalized antichains in both representations;
- every legal defender reply;
- child exact bridge result;
- active P0 singleton targets;
- invariant-compatible targets;
- proof result / resource failure per target;
- whether that defender reply closes;
- whether the entire source state closes.

Also report whether any state previously rejected by deterministic target-reservoir machinery is closed by the legacy adaptive repair engine.

## Interpretation

Positive result:

- proves a proof-routing integration omission on the exact tested state(s);
- identifies `LEGACY_REPAIR_CAPACITY` as a required route adapter in the unified RLC catalog;
- does not automatically prove the rank-20 root unless the enclosing universal branch composition is subsequently closed.

Negative logical result:

- says the old repair theorem does not cover these exact states after exact representation bridging.

Resource failure:

- is not a theorem rejection.

## Boundary

No oracle, Pons score, solved W/D/L, minimax, ordinary free-branch game-tree value, best-move table, opening book, BSFP solved frontier, physical-position identity shortcut, or sealed holdout may be used.

Production CPC, JSMinSys, target-reservoir semantics, and BSFP remain unchanged.

This probe is research-side only.
