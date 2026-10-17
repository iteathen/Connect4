# Bounded source-action ROBDD live compaction and exact fused quantification

**Date:** 2026-10-16. **Research owner:** research/semantic-quotient. **Live HEAD at plan:** `d60ed79d44229812ed07c04f1652cd8d03383969`.
**Status:** Frozen experiment, NOT a game-value proof.

## Known exact baseline
Source-derived guarded-action Boolean QBF compiled into canonical complemented-edge ordered BDD, and future blocks are abstracted by exact Shannon OR (P0) / AND (P1), retaining first-action bits. Complete `44444` k7 lower/upper vectors match earlier independent physical controls. k8 lower fails 60k allocated nodes; of 45,322 chrono compiled BDD nodes only 4,212 are reachable from its output. That is not a lower bound on semantic cofactor diversity. Original interval source-owner BDD k11 remains stronger than all current action-bit candidates for bounded horizon.

## Mathematical operator / invariants
After the WHOLE source QBF matrix is compiled and after EACH fully completed quantified action bit (never during an APPLY/abstract recursive call), copy only BDD nodes reachable from current Boolean root into a fresh unique-table, preserving variable order, complemented-edge signs, low/high Shannon functions, reduced/normalized invariant and terminal truth. Discard old APPLY/abstract memos and source gate handles. Topological induction proves the copied BDD computes IDENTICAL Boolean function for every assignment to remaining free action bits. Initial action bits stay free. This is representation/GC, not another quantifier law.

**Cost accounting:** Count old + copy-in-progress nodes as simultaneous storage (do not claim free memory during GC), peak allocated/retained nodes, GC node copies, child-edge visits, unique inserts, additional JS work. Preserve original 60,000-node, 300,000 nontrivial Boolean-op, 10,000-support, 15-second per-compile ceilings. Treat peak old+new compaction buffers as part of the 60k node envelope. No game-state search in candidate.

## Falsification/stop
1. Generic Boolean function algebra controls for complemented edges/ROBDD canonicalization and quantifier order, and independent physical 4x3-c3 / 4x4-c4 short suffix WDL + complete tied optimal sets (including `223`).
2. `44444` k6/k7 exact labelled lower/upper threshold comparisons against previously independent controls. Test k8 only after validation, both chronological/reversed bit orders. k9 optional only if k8 completes. Do not widen caps.
3. If source compilation itself hits 60k at k9, record as a separate wall rather than hiding it under quantifier memory. If BDD cannot fit after safe GC, retain failure as representation-specific, not generalized complexity proof.
4. Compare total Boolean ops + counted GC/scans and peak memory against BOTH earlier AND-gate local quantifier projector and pre-GC ROBDD baseline, with same budgets and no claims of end-to-end wall-clock superiority. Store all negative controls.

Any precise exact outcome after full 37-ply must come from evaluated quantified truth, not CNF construction or bounded k8 intervals. No authority change or merge.
