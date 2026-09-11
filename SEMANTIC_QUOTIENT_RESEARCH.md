# Connect4 semantic-quotient research lane

This branch is the solver-neutral continuity branch for research into the **minimum exact description of the remaining Connect Four game**.

It exists because the same structural question now feeds two intentionally separate solvers:

- `solver/minimax-alpha-beta` — exact game-tree search / alpha-beta research;
- `feature/cuda-bsfp` and `research/zdd-transfer-20260910` — backward symbolic fixed-point / OQS research.

The solver algorithms remain separate. This branch owns the research seam where they share mathematics: exact future-behavior equivalence, win-space reduction, support/accessibility, quotient construction, residual classes, canonical transitions, and practical minimum-description representations.

## Why this branch exists

The durable research had become split across solver-specific branches. At creation time:

- `solver/minimax-alpha-beta@87f537f425c03b12c6bff0141ff0b0c6b3810b5e` contained the consolidated minimax/search corpus, including fixed-width exact search, TT work, win-space search, residual automorphisms, decision-state admission, structural reductions, candidate ledgers, and evidence.
- `research/zdd-transfer-20260910@42e1a1ca90905bb3edec8ad4a2e49c99ef635651` contained the newest BSFP/OQS quotient work, including identified-line quotients, separator-history census, transition-stable residual classes, pointer-free flat transfer tables, and incremental OQS.

The two lines had diverged directly from the product baseline. Neither was a clean umbrella for the other.

This branch starts from the latest OQS research head because that line contains the newest quotient/compiler work. It does **not** claim that every minimax prototype or raw evidence packet has been copied here. The minimax branch remains authority for its actual prototypes and evidence. Cross-solver research added from this point forward should be recorded here first when it is not inherently owned by one solver.

## Research objective

Kolmogorov complexity is useful as an intuition, not a computable optimization target.

The practical target is:

> Find the smallest exact, efficiently updatable state sufficient to determine every future legal transition and game-theoretic consequence relevant to the consuming solver.

For minimax, that includes exact action-labeled transitions and the information needed for distance-sensitive scoring. For BSFP, it includes the exact closed W/D/L relation required by its backward recurrence.

A representation is not accepted because it is small. It must be an exact quotient of the relevant future behavior.

## Branch ownership

This branch may contain:

- solver-neutral research notes and synthesis;
- exact quotient/equivalence experiments;
- small research-only prototypes comparing candidate semantic states;
- cross-solver falsifiers and evidence;
- indexes pointing to authoritative solver-specific prototypes/evidence;
- experiments that determine what information is actually necessary before a solver-specific implementation is chosen.

This branch should not become:

- the maintained minimax solver branch;
- the maintained CUDA-BSFP branch;
- a place to merge solver implementations merely to keep files together;
- an authority that overrides C4 domain/specification contracts;
- a dumping ground for duplicate copies of every historical artifact.

When research becomes implementation-specific, promote it deliberately into the owning solver branch and qualify it there.

## Primary source lanes

### Minimax / alpha-beta

Use `solver/minimax-alpha-beta` for actual search prototypes, benchmark results, and its branch index:

- `MINIMAX_BRANCH.md`
- `reference/research-prototypes/MINIMAX_INDEX.md`
- `docs/research/2026-09-10-minimax-branch-lineage-audit.md`

### CUDA-BSFP / OQS

Use `research/zdd-transfer-20260910` for the newest symbolic quotient/OQS evidence and `feature/cuda-bsfp` for the production-adjacent BSFP lane.

Important cross-solver source records include:

- `docs/specs/C4-0006-control-parity-and-winspace-v1.md`
- `docs/research/2026-09-09-win-space-representation-discussion.md`
- `docs/research/2026-09-10-identified-winline-quotient-exact-results.md`
- `docs/research/2026-09-10-separator-history-census.md`
- `docs/research/2026-09-10-cuda-bsfp-flat-transfer-r4.md`
- `docs/research/2026-09-10-r6-incremental-oqs-results.md`
- `docs/research/2026-09-10-cuda-bsfp-research-synthesis.md`

## Current cross-solver seam

The immediate research question is whether minimax can operate on a substantially smaller **behavioral quotient** than the historical colored board while preserving exact distance-sensitive action values.

The strongest concrete bridge from BSFP is:

```text
physical state
    -> support/accessibility
    -> identified line-hit state (H0,H1)
    -> optional canonical residual class
    -> dense state ID
    -> local action/input
    -> next dense state ID
```

The strongest concrete bridge from minimax is:

```text
exact action-labeled alpha-beta
    + decision-state admission
    + rank-aware proof memory
    + compact exact keys
    + residual semantic reuse
```

The next research should determine the **coarsest exact state** these can share rather than prematurely choosing one existing representation.

See `docs/research/2026-09-10-minimum-description-semantic-quotient.md` for the current synthesis and experiment program.
