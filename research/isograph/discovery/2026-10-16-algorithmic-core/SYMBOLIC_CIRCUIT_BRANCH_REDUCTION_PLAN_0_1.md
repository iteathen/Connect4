# Symbolic non-distributed alternating-value circuit: bounded decision

**Date:** 2026-10-16. Canonical research owner `research/semantic-quotient`.
**Start head:** `e04c9fb0b8071ea7d124faa9e17ebe83e82c2d74`.

## Governing question

Constructive W/D/L core is already established and may branch and recurse. Test a **preferred** stronger property: one exact value predicate over a support-conditioned residual fiber may represent all strategic continuations without *separate recursive value solves for each concrete q*.

Do not mistake a single output object containing exponential internal work for branch elimination. Quantify gate count, substitution work, support-level child edges, circuit depth, and physical/q child solves avoided, with a hard budget and negative controls.

## Existing art / do not rediscover

- `RBA_FOUR_FRONT_BLOCK_CHECKPOINT_0_1.md` proves four-front interval closure and 4/6-ply symbolic block roundtrips, but universal products still explode; a naive Upper-only flattening was falsified.
- `RBA_ALGEBRA_CORE_CHECKPOINT_0_1.md` has antichain semiring and Bellman lattice polynomial; it needs output-sensitive mixed-cover multiplication.
- `RBA_RELATION_REFINEMENT_CHECKPOINT_0_1.md` establishes exact cofactor/adjoint structure and non-homomorphism/near-injectivity limitations.
- `exact-q-core.mjs` is the proved oracle-free recursive reference. No new theorem is needed for ordinary recurrence correctness.

## New scope: shared monotone Boolean circuit without distributed DNF

For one fixed support `h`, list distinct nonempty future residual shapes `S_h` derived from all Connect-K geometric lines, removing occupied support cells.

Let `X_j` mean that P0's normalized residual **upset** contains shape j.
Let `Y_j` mean that P1's normalized residual upset **does not** contain shape j.
The pair `(X,Y)` is claimant-P0-favorable. These variables are constrained to come from legal or abstract cofactor-consistent antichain states; do not interpret arbitrary independent Boolean assignments as physical boards.

For action cell `a`, child coordinate maps are monotone:
- own true cofactor: child positive upset bit j is OR of source upset bits i whose residual shape after removing a is a subset of child shape j;
- blocked false cofactor: same but only source residual shapes not containing a.
- complemented opponent positive-favorable channel becomes an AND of corresponding source Y bits.

Define TWO P0 absolute thresholds on each support:
- `W(h,X,Y)`: P0 can force a win (V=+1);
- `N(h,X,Y)`: P0 cannot be forced to lose (V>=0).

Terminal/literal-action guards:
- P0 mover immediate completion: OR of a single coordinate X({a}) into BOTH thresholds;
- P1 mover immediate completion: AND with Y({a}) into BOTH thresholds;
- nonterminal last move: W=false, N=true except for mover's just-completed terminal.
- P0 mover aggregates actions using OR; P1 mover aggregates using AND.
- child predicates are substituted into parent coordinate maps and hashed into a shared, associative/commutative/idempotent AND/OR circuit DAG, *without distributing* AND through OR or enumerating all parent q states.

This is an exact P0-threshold symbolic recurrence under the same first-win semantic guards. On arbitrary physical q, terminal conditions supersede nonterminal child formulas.

## Hard bounds and falsifiers

- Target first: complete 4x3 Connect-3 supports, focused intermediate support `[2,2,1,2]` (rank 7) and empty root if circuit budget allows. Second: 4x4 Connect-4 focused support `[3,3,2,2]` (rank 10) if efficient. No standard7x6 root computation.
- Max 60,000 unique circuit gates and 300,000 substitution visits, 15-second compilation budget **per target**. Abort/report PARTIAL on limit, never escalate silently.
- Compare BOTH thresholds and all W/D/L action values, exact argmax/tied move masks, against the oracle-independent reference `exact-q-core.mjs` on at least the complete set of physically reachable states of the chosen support. Separately stress a bounded sample of abstract antichain pairs if available.
- Stop on first mismatch and report complete support/q witness. Include immediate wins, opponent wins, filled-board draw, mirrored supports, terminal-first mistakes and a deliberate corrupted terminal guard. Use fresh run provenance.
- Quantify preparation cost *including* support-index and geometry preprocessing; gate count, maximum intermediate gate count, compilation actions, number of independent q-value recursive calls during construction (target zero), repeated evaluation per-state gate visits, reference q recursive calls/transitions, and peak memory proxy.
- Candidate compilation must not consult precomputed values, oracle, WDL frontiers, external opening knowledge or solved labels. Physical board states and the recursive core may only validate the completed circuit.

## Interpretation boundaries

A success means a **symbolic single-result value transformer** has been constructed for the tested fiber, without expanding individual continuation q values; it does **not** prove polynomial scaling or genuinely cheap universal branch elimination. Gates with AND/OR fan-in still encode strategic alternatives; their size and expansion cost are decisive. If construction explodes or is more costly than q memoized recursion, preserve it as negative economics, not a failure of the exact core.

If the proposed upper/lower terminal encoding fails, correct the reasoning first; do not introduce oracle-derived patches or reinterpret a false premise as a valid theorem.
