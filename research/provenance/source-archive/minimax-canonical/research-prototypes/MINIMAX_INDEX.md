# Minimax research-prototype index

This index groups the preserved Connect4 minimax/alpha-beta research prototypes by engineering purpose. Historical directory names remain unchanged so reproduction commands, evidence links, and commit references continue to work.

Presence here means **preserved minimax research**, not accepted architecture.

## Historical prototype directories

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

## Organized restructure-era packets

New research does not extend the historical `reference/research-prototypes/` catch-all. Restructure-era packets live under `research/minimax/`.

| Packet | Origin | Contents | Disposition |
| --- | --- | --- | --- |
| `../../research/minimax/incumbent-v8-rewrite/` | `feature/shared-evaluator-v1` / PR #5 | Exact Node/V8 incumbent rewrite source, TT, evaluator/search regression tests, frozen evaluator/search/self-play vectors, historical note/specs, manifest | Historical executable comparison candidate; not current accepted incumbent |

The V8 packet was recovered during the destructive branch audit because its branch history had been preserved but its executable candidate was not previously present in the consolidated minimax working tree. Its original branch head is now also a merge parent of `solver/minimax-alpha-beta`.

## Suggested reading order

For reconstructing the minimax work without reading every prototype first:

1. `../../MINIMAX_BRANCH.md` — branch scope and organization.
2. `../../research/minimax/incumbent-v8-rewrite/README.md` — early alternate Node/V8 incumbent candidate recovered during restructuring.
3. `../../docs/research/2026-09-08-exact-solver-performance-research.md` — fixed-width exact-solver starting point.
4. `../../docs/research/2026-09-09-organic-optimization-consolidation.md` — structural rethink/consolidation.
5. `../../docs/research/2026-09-09-decision-state-admission-and-proof-frontier-followup.md` — compact/rank/decision-state composition.
6. `../../docs/research/2026-09-09-forced-macro-and-support-implication.md` — forced-tree compression vs cross-state implication.
7. `../../docs/research/2026-09-09-low-confidence-survival-batch-1.md` — evaluator/Allis/support-event survival tests.
8. `../../docs/research/2026-09-10-minimax-branch-lineage-audit.md` — original branch provenance and BSFP boundary.

## Reproduction rule

Do not rename or flatten historical prototype directories merely for tidiness. Research notes cite exact paths and many scripts import siblings by relative path. Organization is supplied by this index and `MINIMAX_BRANCH.md`; historical paths remain part of the evidence record.

New recovered or newly created candidates should instead use organized `research/minimax/<packet>/` directories with a packet-local manifest.
