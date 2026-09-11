# Minimax research-prototype index

This index groups the preserved Connect4 minimax/alpha-beta research prototypes by engineering purpose. Directory names remain unchanged so historical reproduction commands, evidence links, and commit references continue to work.

Presence here means **preserved minimax research**, not accepted architecture.

| Prototype directory | Primary purpose | General disposition |
| --- | --- | --- |
| `2026-09-08-exact-solver/` | Fixed-width two-word exact negamax, TT layouts/capacity, shared TT, multicore/YBWC, task-local controls, profiling | Foundational performance research/control family |
| `2026-09-09-chunk-map/` | Chunk-map forwarding, cleanup, tracked mapping | Mostly lifecycle/dependency experiments; retain adverse results |
| `2026-09-09-dependency-reassessment/` | Coarse dependency-family split/reassessment | Research controls; per-node dependency routing not promoted |
| `2026-09-09-selective-promotion/` | Dependency locality, selective promotion, task traces, split-depth and capacity controls | Mixed evidence; useful scheduler/locality diagnostics |
| `2026-09-09-shared-dependency-dead-ends/` | Shared-dependency TT hierarchy/region variants | Negative/corrective research retained intentionally |
| `2026-09-09-rethink/` | Fair isolation controls and root-entry checks | Corrective controls |
| `2026-09-09-rethink-controls/` | Equal-capacity interleave and root-entry precondition | Important fair-control/reproduction artifacts |
| `2026-09-09-invariant-reassessment/` | Solver invariant probes | Correctness/assumption audit support |
| `2026-09-09-decision-state/` | Decision-only TT admission, compact exact key + rank, dominance frontier | Strong structural candidate family; still research |
| `2026-09-09-structural-candidates/` | Rank-banked TT and early win-space structural controls | Positive/negative structural controls |
| `2026-09-09-structural-quotient/` | Search-state quotient experiments and exact differential qualification | Exact-search representation research |
| `2026-09-09-winspace/` | Early win-space search representation, corpus/mechanism qualification | Structural search research |
| `2026-09-09-winspace-native/` | Native packed win-space negamax, specialization, holdout/replay | Strong state-reduction evidence; elapsed-time mixed |
| `2026-09-09-residual-automorphisms/` | Residual-game automorphism qualification | Strong semantic reduction, expensive implementation |
| `2026-09-09-forced-macro-implication/` | Exact forced macro-edges and support-compatible implication | Macro positive; implication node-positive/time-negative in tested JS form |
| `2026-09-09-low-confidence-survival/` | Evaluator ordering, Allis A1-A3 survival, support-event equivalence, asymmetry checks | Candidate survival/falsification packet |

## Suggested reading order

For reconstructing the minimax work without reading every prototype first:

1. `../../MINIMAX_BRANCH.md` — branch scope and organization.
2. `../../docs/research/2026-09-08-exact-solver-performance-research.md` — fixed-width exact-solver starting point.
3. `../../docs/research/2026-09-09-organic-optimization-consolidation.md` — structural rethink/consolidation.
4. `../../docs/research/2026-09-09-decision-state-admission-and-proof-frontier-followup.md` — compact/rank/decision-state composition.
5. `../../docs/research/2026-09-09-forced-macro-and-support-implication.md` — forced-tree compression vs cross-state implication.
6. `../../docs/research/2026-09-09-low-confidence-survival-batch-1.md` — evaluator/Allis/support-event survival tests.
7. `../../docs/research/2026-09-10-minimax-branch-lineage-audit.md` — branch provenance and BSFP boundary.

## Reproduction rule

Do not rename or flatten these directories merely for tidiness. Research notes cite exact paths and many scripts import siblings by relative path. Organization is supplied by this index and `MINIMAX_BRANCH.md`; the original paths remain part of the evidence record.
