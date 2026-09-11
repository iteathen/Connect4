# Connect4 minimax / alpha-beta branch

This branch is the consolidation home for the Connect4 **search-based exact-solver** line.

It intentionally collects the maintained Node minimax/alpha-beta baseline, historical competing search builds, exact-search oracles, fixed-width solver experiments, TT/cache work, multicore/YBWC work, structural search reductions, move/proof ordering experiments, and their qualification evidence.

It intentionally does **not** promote a new solver implementation yet. Research prototypes remain prototypes until a separate selection and qualification cycle is requested.

## Boundary

Included here:

- minimax / negamax / alpha-beta exact search;
- exact transposition-table experiments;
- proof-window and proof-order experiments performed inside search;
- move ordering and evaluator ordering experiments;
- parallel alpha-beta / YBWC / coarse-task scheduling;
- search-state representations such as win-space/residual-state experiments when they were used as recursive search identity;
- forced tactical closure and forced macro-edges used to reduce the search tree;
- Allis/VICTOR-derived rule experiments used as exact certificates, pruning, ordering, or proof-cost guidance inside the search solver;
- positive, negative, superseded and rejected experiments plus raw evidence.

Excluded as a source line:

- symbolic backward / searchless fixed-point solving;
- maintained CUDA-BSFP implementation;
- identified-winline quotient/product/OQS work whose runtime is BSFP rather than game-tree search;
- CUDA-MCGS composition work that is not part of the Connect4 minimax implementation.

The historical cut between the mixed September 9 structural-search line and the later searchless/BSFP line is documented in `docs/research/2026-09-10-minimax-branch-lineage-audit.md`.

## 1. Accepted product baseline

These are the maintained/reference-facing pieces inherited from the product state. They are not research candidates merely because this branch contains research around them.

### Domain

- `components/domain/`
- `docs/specs/C4-0001-domain-v1.md`

### Incumbent Node minimax / alpha-beta

- `components/incumbent/`
- `benchmarks/incumbent.mjs`
- `docs/specs/C4-0002-incumbent-evaluator-v1.md`
- `docs/specs/C4-0003-incumbent-search-v1.md`
- `docs/specs/C4-0004-incumbent-benchmark-v1.md`
- `reference/conformance/`

### Exact solved-strength oracle

- `components/oracle/`
- `docs/specs/C4-0005-solved-strength-oracle-v1.md`
- `reference/oracles/`
- `benchmarks/strength.mjs`
- `benchmarks/strength-lib.mjs`

Historical baseline/qualification notes begin with:

- `docs/research/2026-09-06-legacy-engine-extraction.md`
- `docs/research/2026-09-07-incumbent-node-qualification.md`
- `docs/research/2026-09-07-node26-benchmark-evidence.md`
- `docs/research/2026-09-07-solved-strength-oracle.md`

## 1A. Archived incumbent V8 rewrite candidate

The completeness audit found one older executable minimax build that had been preserved only on the live `feature/shared-evaluator-v1` branch rather than in this branch's working tree. It is now organized at:

- `research/minimax/incumbent-v8-rewrite/`

That packet preserves the exact original `components/incumbent-v8/` source, evaluator/search/hot-path regression tests, frozen evaluator/search/self-play vectors, the historical rewrite note, and the old candidate C4-0002/C4-0003 documents. Its `manifest.json` records the original branch/head, PR #5, commit identities and exact Git blob identities.

The original branch head `77c5c0da57ddb65cd7aff9ce131481a19414931a` is also a merge parent of the minimax branch, so its commit provenance is retained.

**Authority:** this is a historical candidate/comparison build, not the current accepted incumbent. The copied candidate spec files live under the packet's `historical/` directory specifically so they cannot be confused with current `docs/specs/` authority.

## 2. Fixed-width exact-search kernel research

Primary prototype directory:

- `reference/research-prototypes/2026-09-08-exact-solver/`

This contains the two-word numeric exact solver family and the main low-level experiments around:

- fixed-width 7x6 state arithmetic;
- null-window exact solving;
- direct-mapped TT layouts;
- one/two/four-way TT variants;
- capacity sweeps;
- task-local and shared TT controls;
- multicore workers;
- YBWC/coarse splitting;
- dependency-clean variants;
- profiling and empty-board attempts.

Primary notes:

- `docs/research/2026-09-08-exact-solver-performance-research.md`
- `docs/research/2026-09-08-exact-solver-tt-chunk-reclamation.md`
- `docs/research/2026-09-08-shared-tt-smaller-real-tests.md`
- `docs/research/2026-09-09-performance-envelope.md`

## 3. TT placement, sharing, scheduling, and cleanup experiments

Prototype groups:

- `reference/research-prototypes/2026-09-09-chunk-map/`
- `reference/research-prototypes/2026-09-09-dependency-reassessment/`
- `reference/research-prototypes/2026-09-09-selective-promotion/`
- `reference/research-prototypes/2026-09-09-shared-dependency-dead-ends/`
- `reference/research-prototypes/2026-09-09-rethink/`
- `reference/research-prototypes/2026-09-09-rethink-controls/`

These preserve both successful local mechanisms and failed/overcomplicated dependency-routing ideas. Important conclusions are recorded in:

- `docs/research/2026-09-09-dependency-tt-failed-idea-reassessment.md`
- `docs/research/2026-09-09-shared-dependency-tt-dead-ends-and-corrected-architecture.md`
- `docs/research/2026-09-09-selective-promotion-locality-and-overlap-reassessment.md`
- `docs/research/2026-09-09-rethink-sharing-placement-and-proof.md`
- `docs/research/2026-09-09-rethink-capacity-scheduling-and-proof-boundaries.md`

Do not interpret directory presence as endorsement. Negative experiments are intentionally retained.

## 4. Exact-key, rank, decision-state, and proof-retention work

Prototype groups:

- `reference/research-prototypes/2026-09-09-decision-state/`
- `reference/research-prototypes/2026-09-09-invariant-reassessment/`
- `reference/research-prototypes/2026-09-09-structural-candidates/`

Key notes:

- `docs/research/2026-09-09-exact-key-compression.md`
- `docs/research/2026-09-09-exact-key-compression-local-preservation.md`
- `docs/research/2026-09-09-decision-state-admission-and-proof-frontier-followup.md`
- `docs/research/2026-09-09-decision-state-proof-bitset-followup.md`
- `docs/research/2026-09-09-structural-candidate-retest.md`

This is where compact exact TT identity, intrinsic rank banking, decision-only TT admission, forced single-choice transit compression, proof-frontier experiments, and related controls live.

## 5. Win-space / residual-state search representations

Prototype groups:

- `reference/research-prototypes/2026-09-09-winspace/`
- `reference/research-prototypes/2026-09-09-winspace-native/`
- `reference/research-prototypes/2026-09-09-structural-quotient/`
- `reference/research-prototypes/2026-09-09-residual-automorphisms/`

Key notes:

- `docs/research/2026-09-09-win-space-representation-discussion.md`
- `docs/research/2026-09-09-win-space-search-representation.md`
- `docs/research/2026-09-09-winspace-results.md`
- `docs/research/2026-09-09-native-winspace-candidate-results.md`
- `docs/research/2026-09-09-structural-quotient-protocol.md`
- `docs/research/2026-09-09-structural-quotient-results.md`
- `docs/research/2026-09-09-residual-automorphisms.md`
- `docs/research/2026-09-09-organic-experiment.md`
- `docs/research/2026-09-09-organic-optimization-consolidation.md`

These experiments remain minimax material when the reduced representation is the recursive identity of a negamax/alpha-beta solver. Later symbolic fixed-point descendants are BSFP and are not imported as a source line.

## 6. Forced macro, implication, evaluator, and strategic-rule research

Prototype groups:

- `reference/research-prototypes/2026-09-09-forced-macro-implication/`
- `reference/research-prototypes/2026-09-09-low-confidence-survival/`

Key notes:

- `docs/research/2026-09-09-forced-macro-and-support-implication.md`
- `docs/research/2026-09-09-allis-evaluator-residual-synthesis.md`
- `docs/research/2026-09-09-strategic-candidate-theory-evaluator-allis.md`
- `docs/research/2026-09-09-strategic-candidate-theory-state-proof.md`
- `docs/research/2026-09-09-low-confidence-survival-batch-1.md`
- `docs/research/2026-09-09-terminalization-candidate-audit.md`
- `docs/research/2026-09-09-universal-strategic-algebra.md`

This area includes exact forced macro-edges, support-compatible implication, evaluator-derived ordering, Allis A1-A9 rule/certificate studies, terminalization, support-event state ideas, and interaction/classification work.

The mixed historical branch is deliberately cut before the later searchless fixed-point solver begins.

## 7. Candidate ledgers and cross-experiment synthesis

Useful overview documents:

- `docs/research/2026-09-09-historical-107-theory-ledger.md`
- `docs/research/2026-09-09-all-ideas-integration-rethink.md`
- `docs/research/2026-09-09-candidate-compatibility-ranking.md`
- `docs/research/2026-09-09-core-internal-compatibility-audit.md`
- `docs/research/2026-09-09-core-multiaxis-classification.md`
- `docs/research/2026-09-09-directional-core-synergy-map.md`
- `docs/research/2026-09-09-categorical-reasoning-calibration.md`
- `docs/research/2026-09-09-signed-candidate-interaction-model.md`
- `docs/research/2026-09-09-signed-candidate-interaction-model-v2.md`
- `docs/research/2026-09-09-signed-candidate-interaction-model-v3.md`
- `docs/research/2026-09-09-unification-candidate-map.md`

Classification documents record evidence state; they are not architecture authority.

## 8. Evidence

Raw and aggregate research evidence is retained under:

- `docs/research/evidence/`

Important subgroups include exact-solver runs, dependency/chunk/scheduling controls, compact/rank/decision-state results, structural quotient evidence, residual automorphism evidence, win-space/native-winspace evidence, forced-macro/implication evidence, and low-confidence survival evidence.

The archived V8 rewrite's own frozen vectors are deliberately kept inside `research/minimax/incumbent-v8-rewrite/evidence/` so they remain scoped to that historical candidate rather than masquerading as current product evidence.

Evidence should remain adjacent to the original research notes/prototype identities. Do not rewrite adverse results out of the branch.

## 9. Historical branch consolidation

The branch now includes the relevant history/content from:

- `feature/shared-evaluator-v1` — exact V8 rewrite preserved as an organized historical packet;
- `research/exact-solver-perf-checkpoint-2026-09-08`;
- `research/exact-solver-rethink-controls-2026-09-09`;
- `research/residual-automorphisms-2026-09-09`;
- `research/forced-macro-implication-2026-09-09`;
- the pre-searchless portion of `research/low-confidence-survival-2026-09-09` through commit `0d2648c83a88c8c3dd2a4836cb19296d1930b35a`.

The accepted incumbent/evaluator/oracle/bootstrap feature work is otherwise represented by the main-derived product files listed in section 1; obsolete feature snapshots are not copied over accepted versions.

See `docs/research/2026-09-10-minimax-branch-lineage-audit.md` for the original branch disposition; later restructure preservation packets are indexed by `MINIMAX_BRANCH.md` and packet-local manifests.

## 10. Working rule for this branch

Until explicitly requested otherwise:

1. preserve the corpus;
2. organize/index it;
3. do not promote a research prototype into maintained solver code;
4. do not mix CUDA-BSFP runtime work into this branch merely because it shares a strategic concept;
5. when future minimax execution resumes, start by selecting a candidate from the preserved evidence and requalify it against the accepted oracle/contracts rather than treating an old conclusion as authority.
