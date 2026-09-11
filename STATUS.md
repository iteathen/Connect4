# Connect4 Minimax / Alpha-Beta Status

**Updated:** 2026-09-10  
**Canonical branch:** `solver/minimax-alpha-beta`  
**State:** consolidated research lane; implementation promotion intentionally paused

## Mission

This branch owns the exact minimax/negamax/alpha-beta solver line, its search-specific experiments, benchmark evidence, TT/scheduling work, and search-side structural optimizations. CUDA-BSFP remains a separate solver. Shared semantic-quotient research is routed through `research/semantic-quotient`.

## Consolidation state

The branch contains the complete identified minimax research lineage through the pre-BSFP structural cut plus the missing rethink-control history. Durable navigation starts at:

- `MINIMAX_BRANCH.md`
- `reference/research-prototypes/MINIMAX_INDEX.md`
- `docs/research/2026-09-10-minimax-branch-lineage-audit.md`

Historical research branch names are evidence/provenance only once their commits are confirmed behind this branch.

## Current technical picture

The fixed-width two-word exact kernel established roughly 10M nodes/s-class single-thread arithmetic and strong aggregate Node throughput. The unresolved empty-board problem is proof efficiency rather than raw JavaScript arithmetic throughput.

Strong surviving search-side mechanisms include:

- exact tactical closure and forced macro-edges / decision-state admission;
- compact exact TT identity;
- rank-aware proof-memory placement;
- exact residual semantic reuse and residual automorphisms;
- global proof sharing at coarse boundaries where qualified;
- fixed-width, allocation-free hot execution.

Several semantically useful mechanisms remain too expensive in their tested forms, including generic implication-frontier lookup, dynamic graph/object machinery, full evaluator rescans and per-node placement/resource policy.

## Shared semantic research boundary

The next representation question is no longer owned by this solver branch alone. Questions about the minimum exact description of the remaining game, identified-line quotienting, behavioral equivalence, support/event sufficiency and OQS-style class compilation belong on `research/semantic-quotient`.

The first shared gate is explicit minimax strong-score qualification of the identified-line quotient, followed by exact behavioral partition refinement and compiled action transitions. Only solver-specific implementations that survive that research should be promoted back here.

## Implementation disposition

Do not build or promote a new maintained minimax kernel merely because the research corpus is consolidated. Preserve the current strongest fixed-width controls and use them as baselines when semantic-quotient MQ1-MQ5 reaches implementation comparison.

## Correctness obligations retained

- exact distance-sensitive scores and action values must remain authoritative;
- raw optimized negamax entry requires its no-current-immediate-win precondition to be discharged at the public/task boundary;
- false TT misses are acceptable, false/torn hits are not;
- experimental shared multiwriter publication still requires a portable ECMAScript memory-model argument before production authority;
- benchmark and oracle semantics remain Connect4-owned.
