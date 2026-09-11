# Minimax / alpha-beta branch-lineage audit

**Date:** 2026-09-10  
**Branch:** `solver/minimax-alpha-beta`  
**Status:** branch-consolidation record; research evidence, not a new solver specification.

## Purpose

Connect4's exact-search research spread across branch names that stopped describing the underlying algorithm. This audit records which repository branches belong to the minimax/alpha-beta research line, which are mixed, and where the later searchless/BSFP line begins.

The consolidation rule is semantic, not lexical: work belongs here when it was performed to reduce, order, cache, schedule, parallelize, represent, or otherwise accelerate an exact minimax/negamax/alpha-beta proof. Work belongs to the BSFP line when it changes the solving method to symbolic backward/fixed-point closure rather than game-tree search.

## Consolidated minimax lineage

### Maintained incumbent baseline

`feature/incumbent-node-search` is the historical feature branch for the maintained Node minimax/alpha-beta product baseline. Its accepted implementation/specification content is already present in the main-derived product state, including `components/incumbent/`, the conformance vectors, and C4-0002 through C4-0004. The old feature ref is therefore provenance/history, not an additional branch to merge wholesale.

### Exact-search performance line

`research/exact-solver-perf-checkpoint-2026-09-08` is the main experimental exact-search lineage and is the original base of `solver/minimax-alpha-beta`. It contains the two-word fixed-width solver family, TT geometry/capacity experiments, shared-TT experiments, multicore/YBWC work, dependency/chunk experiments, selective-promotion controls, decision-state experiments, win-space-as-search-state experiments, structural quotient experiments, and associated evidence/docs.

`research/exact-solver-rethink-controls-2026-09-09` diverged with two useful control units that did not land in the later research head. Those files were consolidated in commit `1115ad7d428fb1af41ea3f8da31fe427150fbe6f`:

- equal-capacity TT/grouping control;
- root-entry immediate-win precondition counterexample;
- their research note and raw evidence.

### Hidden structural-search line

The following branches are minimax/exact-search research despite their names:

- `research/residual-automorphisms-2026-09-09`
- `research/forced-macro-implication-2026-09-09`
- the pre-searchless portion of `research/low-confidence-survival-2026-09-09`

They cover residual automorphisms, cardinality/structural pruning candidates, forced macro transitions, support-compatible implication, evaluator-guided ordering, Allis/VICTOR-derived rule candidates, strategic-rule compatibility, proof-cost ideas, terminalization, candidate interaction/composition, and the low-confidence survival experiments.

The clean historical cut is commit:

`0d2648c83a88c8c3dd2a4836cb19296d1930b35a`

That commit is the last pre-searchless structural-search unit (`Preserve universalization relation map`). It is 21 commits beyond `research/forced-macro-implication-2026-09-09` and includes the low-confidence survival/evaluator-ordering/Allis/unification experiments.

A temporary historical ref, `research/minimax-structural-cut-20260909`, was created exactly at that commit and merged into `solver/minimax-alpha-beta` through PR #22. This preserved the original history instead of flattening 41 research artifacts into copied files.

## Mixed branch boundary

`research/low-confidence-survival-2026-09-09` is a mixed branch.

**Included:** history through `0d2648c83a88c8c3dd2a4836cb19296d1930b35a`.

**Excluded:** the later commits beginning with nested strategic dependency closure/searchless solver formulation and continuing into backward winning-line fixed points, symbolic backward solving, terminal-boundary BSFP qualification, and explicit BSFP terminology. Those commits change the solving method and belong to the CUDA-BSFP line.

This boundary intentionally allows strategic concepts such as residual win-space, Allis rules, terminalization, or support events to exist in the minimax branch when they were tested as **search pruning, state compression, move ordering, proof ordering, or TT mechanisms**. The same concepts may later have BSFP-native descendants elsewhere; those descendants are not imported here.

## BSFP/searchless branches excluded as source branches

The following refs were audited and are not minimax source branches:

- `feature/cuda-bsfp`
- all `evidence/cuda-bsfp-q1/*` refs
- `research/direct-line-product-bsfp-20260910`
- `research/live-q1-5min-20260910`
- `research/zdd-transfer-20260910`
- `research/identified-winline-quotient-test`
- `research/identified-winline-quotient-test-2`
- `research/identified-winline-quotient-test-3`
- `research/identified-winline-quotient-test-4`
- `research/winline-cone-image`
- `research/winline-product-antichain`
- `research/winline-product-antichain-final`
- `research/winline-product-antichain-run`
- `research/winline-product-dominance`
- `research/winline-product-dominance-v2`
- `tmp-do-not-use-c4diag`

The identified-winline `-2`, `-3`, and `-4` refs resolve to the same commit. The later cone/product branches extend that BSFP quotient/product line. `tmp-do-not-use-c4diag` is also a CUDA-BSFP diagnostic lineage despite its generic temporary name.

Some of these branches contain older minimax research in ancestry or copy common research notes. That ancestry is not a reason to merge the BSFP branch: the corresponding pre-BSFP minimax artifacts are already retained through the consolidated minimax histories above.

## Other branches not imported

- `feature/cuda-mcgs-composition-assessment` — composition/integration assessment, not the Connect4 minimax implementation line.
- `feature/shared-evaluator-v1` — accepted evaluator work already represented in the main-derived product state.
- `feature/solved-strength-oracle` — accepted oracle work already represented in the main-derived product state.
- `agent/benchmark-bootstrap` — early benchmark bootstrap superseded by the accepted benchmark/product state.
- `docs/execution-efficiency-mutation-hygiene` and `docs/global-agent-local-migration` — repository/process documentation branches rather than minimax algorithm research.
- `noop` — no solver research contribution.

## Current consolidated branch

`solver/minimax-alpha-beta` now contains:

1. the accepted incumbent Node minimax/alpha-beta baseline inherited from the product state;
2. the complete 2026-09-08 fixed-width exact-search/TT/multicore research checkpoint line;
3. the later 2026-09-09 exact-search structural, cache, scheduling, decision-state, win-space and quotient experiments;
4. the missing rethink-control unit;
5. the residual-automorphism / forced-macro / evaluator-ordering / Allis / strategic interaction / terminalization lineage through the last pre-searchless commit.

It intentionally does **not** contain the later maintained CUDA-BSFP implementation or BSFP-only research lineage.

## Engineering consequence

Future minimax work should start from `solver/minimax-alpha-beta` and treat the preserved prototypes as candidate/evidence material, not production authority. The next task is to select and independently qualify a clean production exact 7x6 alpha-beta kernel from the strongest measured mechanisms, with exact correctness first and **time to exact proof** as the governing performance metric. Raw NPS remains a supporting metric: the historical Node fixed-width kernel already demonstrated roughly C-class single-thread arithmetic throughput and strong aggregate multicore throughput, while the unfinished empty-board run showed that proof-node count/search policy remained the larger problem.