# Solver consumption map

Solver families consume the shared claim graph. They do not fork its truth status.

## Isometric

Primary role: direct consumer and extension point for the relational structural calculus.

Current/high-priority claims:
- C4-R0001 structural/win-space model
- C4-R0002 exact geometry
- C4-R0003 through C4-R0005 local exact predicates
- C4-R0006 exact-before-heuristic ordering
- C4-R0007 unresolved residual boundary
- C4-R0008 quotient preservation requirement
- C4-R0009 dead-residual exact draw
- C4-R0011 missing composition laws
- C4-R0012 derivative-derived candidate predicates
- C4-R0013 perfect-play win-set structural experiments

Isometric should distinguish its calculus from any residual search mechanism. A claim becoming useful to Isometric does not by itself establish the claim.

## Negamax / Minimax lineage

Primary role: recursive adversarial solver/control implementation that can consume exact structural certificates, forced-move constraints, move ordering, quotient reductions, and residual/evaluation boundaries.

Shared claims especially relevant now:
- C4-R0003 through C4-R0007
- C4-R0008
- C4-R0009
- C4-R0010 as an implementation-performance constraint

Historical Minimax candidate/composition work is preserved under provenance and is being normalized into the same graph. It must not be treated as a separate research ontology merely because it was produced on a Minimax branch.

## BSFP

Primary role: backward/symbolic solving experiments and structural qualification under BSFP-specific execution semantics.

Shared research especially relevant:
- C4-R0001 and structural win-space representation
- C4-R0002 geometry
- C4-R0007 residual-boundary semantics where applicable
- C4-R0008 equivalence/preservation law
- C4-R0009 exact dead-residual draw where its guards are represented

BSFP-specific performance/representation claims remain solver-specific until generalized. Its evidence and experiments are preserved in the provenance archive for normalization.

## Consumption contract

A solver mapping should eventually record:

- research claim ID;
- exact code/contract location consuming it;
- whether consumption is correctness-critical, optimization-only, ordering-only, or evaluation-only;
- implementation guard equivalence to the research guard;
- qualification tests/evidence.

If implementation uses a weaker or different guard, create a separate implementation claim rather than pretending it implements the canonical theorem unchanged.
