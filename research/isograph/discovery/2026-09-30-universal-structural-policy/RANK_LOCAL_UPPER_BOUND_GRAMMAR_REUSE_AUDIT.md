# Rank-local upper-bound grammar reuse audit

**Date:** 2026-09-30  
**Status:** exact theorem reuse audit / negative boundary localization  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Before inventing another strong-distance operator, re-use the exact response-capacity theorems already present in the repository and determine whether their current local composition closes the consumed v4 falsifier.

This audit consumes no solved W/D/L values and no oracle move scores.

The oracle-derived fact that \`444441566\` is a consumed training position is provenance only; every result below is recomputed from current occupancy, support heights, legal frontier, mover-relative ownership, generated Connect-Four lines, and previously proved structural theorem schemas.

## Reused exact theorems

### 1. Immediate / playable singleton completion

A currently playable winning frontier cell is terminal on the mover's present turn.

### 2. One-setup Hall fork

Current active theorem in this directory:

\`RANK_LOCAL_FORCED_COMPLETION_UPPER_BOUND_THEOREM.md\`

A legal attacker setup producing at least two distinct currently playable winning frontier cells, with no defender immediate counter-win, yields \(\overline T\le3\).

### 3. Poisoned support / stacked-singleton overload

Existing authority:

\`docs/research/2026-09-13-poisoned-support-progress-calculus.md\`

If a defender plays the immediate support below a latent attacker singleton, the released target is playable by the attacker next turn.

If the attacker simultaneously has:
- a playable singleton lower cell \(s\); and
- a latent singleton immediately above \(s\),

then the defender loses whether it blocks \(s\) or plays elsewhere.

This is an exact support-release overload, not a heuristic threat count.

### 4. Fork-precursor capacity and intersection

Existing authorities:

- \`docs/research/2026-09-14-fork-precursor-capacity-theorem.md\`
- \`docs/research/2026-09-14-fork-precursor-intersection-and-merge.md\`

A defender moving immediately before a known two-singleton enabler must preempt the enabler or enough future singleton endpoints.

For several alternative enablers, the defender's one current move must lie in the intersection of all exact preemption sets.

### 5. Forced-singleton lift

Current active theorem:

\`RANK_LOCAL_FORCED_SINGLETON_LIFT_THEOREM.md\`

A unique already-playable attacker terminal target forces the defender's response. A finite child upper certificate then lifts by exactly two plies.

### 6. Temporal Hall / response matroid

Existing authorities:

- \`docs/research/2026-09-13-temporal-response-capacity-calculus.md\`
- \`docs/research/2026-09-13-response-matroid-defect-transfer.md\`
- \`docs/research/2026-09-14-response-capacity-hall-closure.md\`

These provide exact deficiency semantics once the proof state has already produced genuine unit-capacity response obligations with exact release/deadline neighborhoods.

The missing step is not Hall's theorem. It is deriving a forced future obligation family from the current v4 geometry without smuggling in a game-tree result.

## Consumed v4 boundary

Prefix:

\`444441566\`

The side to move at the prefix chooses candidate 2, 3, or 6. In each child the other player becomes the attacker for the remoteness certificate.

The previously proved synchronized-response lower bounds are:

\[
\underline T(P_2)=3,\qquad
\underline T(P_3)=3,\qquad
\underline T(P_6)=5.
\]

The executable audit applies the exact local upper-bound grammar above to each child.

## Result

For all three children:

- no immediate attacker terminal exists;
- no legal one-setup two-playable-singleton Hall fork exists;
- no legal one-setup stacked-singleton overload exists;
- no one-step forced-singleton lift reaches one of those base certificates;
- no strict fork-precursor intersection closes the position at the first attacker setup layer.

Therefore the current finite upper bounds remain unknown:

\[
P_2:[3,+\infty],\qquad
P_3:[3,+\infty],\qquad
P_6:[5,+\infty].
\]

This is a boundary of the **current certificate grammar**, not a claim that no rank-local upper bound exists.

## New exact structural observation at candidate 6

Candidate 6 has a rank-local response macro not present in candidates 2 or 3 at the first attacker move:

- attacker setup in column 2 creates exactly one currently playable terminal target in column 3;
- the defender has no immediate counter-win, so column 3 is forced;
- symmetrically, attacker setup in column 3 creates exactly one currently playable terminal target in column 2;
- the defender is forced to take that other endpoint.

Thus the attacker can choose either orientation of a two-column ownership split across columns 2 and 3:

\[
A:2\Rightarrow D:3,
\qquad
A:3\Rightarrow D:2.
\]

This is an exact forced-response transport fact. It does **not** itself prove a win or an upper remoteness bound.

It is closely related to the synchronized-response channel already responsible for the stronger survival lower bound \(H(P_6)=5\): the same two columns form a causal response channel, but the upper-bound problem now needs to understand what structural facts survive after the forced ownership split.

## Candidate 2/3 first-layer observation

No poisoned-support or fork-precursor restriction fires at the first attacker setup layer in candidates 2 or 3 under the exact guards audited here. A setup in column 4 simply fills the last legal cell of that column; the resulting absence of column 4 from the defender legal set is ordinary board capacity, not a strategic poison certificate.

## Narrowed next theorem target

The missing object is now more specific than generic Hall deficiency:

> a **post-response transport / support-release consequence theorem** that converts a forced response fragment into exact new residual, blocker, phase, and deadline obligations, and then proves progress without replaying a move tree.

The existing response/control decomposition already gives the correct state update skeleton:

\[
F
\to n(F)
\to \text{support frontier update}
\to \text{newly accessible events}
\to \text{residual regeneration}
\to \text{deadline / response obligations}.
\]

The next experiment should apply that exact feedback to the forced 2↔3 split at candidate 6 and to the still-unresolved first-layer geometry at candidates 2/3, then ask whether a response-matroid circuit or forced-completion certificate emerges.

## Claim discipline

This audit:
- does not create v5;
- does not rank candidates by a heuristic score;
- does not infer exact remoteness from lower bounds;
- does not use Pons as a proof premise;
- does not say the existing theorem corpus is incomplete globally.

It establishes only that the currently composed **local** upper-bound grammar does not yet separate the consumed v4 siblings, while exposing the first causal response-transport structures that differ among them.
