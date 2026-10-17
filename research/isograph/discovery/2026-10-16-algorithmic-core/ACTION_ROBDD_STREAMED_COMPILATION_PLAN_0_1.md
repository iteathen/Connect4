# Frozen bounded producer: source gate-lifetime ROBDD projection

**Date:** 2026-10-16. **Owner:** research/semantic-quotient. **Base live HEAD:** `05cbaef434ea5d7d82403184e22cd199a21e59c6`. **Status:** PLAN, no game WDL proof.

## Prior authority and actual evidence

Source-only canonical action-ROBDD (complement edges and reduced ordered Shannon nodes) returned exactly the same k8 lower/upper first-action masks as independent 3,567,031-transition physical validation and passed all 24 full small-board optimal-set controls, with 11 tied optima. A live-root BDD GC after source compilation and each quantified block repaired k8 inside 60k BDD nodes and 300k Boolean operations. At k9, both chronological and reverse action-bit orders exceed 60k nodes while **building source gate DAG** before quantifier abstraction, not while deciding game value. That is not an essential cofactor-width lower bound.

## Exact source-gate lifetime theorem

The source QBF is a deterministic straight-line AND/NOT DAG with definitional Tseitin gate IDs in topological order. For any gate g, compute its remaining-use count in the NOT-YET-COMPILED source gate definitions and the designated output. After compiling a gate, decrement its operands' remaining uses, discard their BDD handles when their last use passes, and retain only BDD roots required by future source gates or final output.

Periodically perform a synchronized **multi-root canonical ROBDD compaction** on this still-live set, never during APPLY recursion: reindex reachable BDD nodes in topological order preserving ordered variable, both cofactors, edge complementation, and shared identities. Transport every surviving source gate handle through the same exact mapping. The resulting uncompiled source gate suffix observes identical Boolean input values under all assignments, by structural induction. No solved-policy inputs, no concrete game successor generation and no change to alternating action quantifier order.

**Global retention guard:** old BDD nodes PLUS copy-in-progress BDD nodes count simultaneously against 60k. All unique-table insertions, source reference-count scans, node copies, BDD APPLY calls/misses, AND abstractions, and time are charged. The 300k limit counts nontrivial Boolean APPLY/quantifier operations; GC work is tracked independently and NOT assumed zero. No cap increase.

## Frozen falsifiers
- Replay prior 47 independent physical bounded cases and 24 complete-game small-board suffix optimal sets, including legal `223` ∀∃ noncommutation and complete tie masks; all four Boolean thresholds.
- Compare k6..k8 `44444` first-action vectors to original unstreamed ROBDD and independent physical bounded control, using exactly the same time/node/operation limits.
- Only after these controls PASS, try `44444` k9 and k10 for chronological/reverse orders, stopping at first new cap. Record whether failure is source gate compilation, compaction simultaneously retained nodes, Boolean operations, or quantified projection and report complete root/action intervals only when lower AND upper converge.
- Do not call syntactic compaction strategic branch elimination. The stronger benefit is exact **functional** cofactor merging by canonical ROBDD. Measure the actual work, not just final root. Existing source-owner reflected BDD k11 remains baseline.

No authority promotion, no merge, no invented WDL/tied move conclusion.
