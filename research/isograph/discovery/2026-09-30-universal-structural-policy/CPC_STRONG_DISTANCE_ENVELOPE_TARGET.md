# CPC strong-distance envelope target

**Date:** 2026-09-30  
**Status:** architecture correction + exact lower-bound integration target  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Make CPC the single owner of rank-local obligation closure for the universal move finder.

Earlier work derived several exact local obligation theorems individually:
- immediate singleton completion;
- stacked singleton / poisoned support;
- fork precursor restriction;
- Hall-fork completion;
- forced-singleton lift;
- synchronized response survival.

Those results remain useful as theorem proofs and regression controls.

They should **not** become a parallel runtime taxonomy if CPC can derive their joint consequence from the complete current residual basis in one calculation.

## 1. Existing CPC already aggregates obligations

At qualified JSMinSys revision

\`0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb\`

\`evaluateConnect4Cpc32()\` already consumes the complete prepared RBA state and:

- scans both players' singleton profiles in one basis pass;
- handles immediate terminal precedence;
- combines multiple current singleton obligations;
- derives exact forced blocks;
- derives fork-precursor preemption intersections;
- checks paired/synchronized response closure across the active residual basis;
- returns one exact/bound/restriction CPC result.

The active RBA coordinate is upward closed. Its minimal active generators are the current residual-obligation antichain. Therefore CPC already owns the natural aggregate obligation universe.

## 2. Current v4 boundary result

A durable one-call-per-state probe using current qualified CPC gives, for:

- candidate 2: \`4444415662\`;
- candidate 3: \`4444415663\`;
- candidate 6: \`4444415666\`;
- candidate-6 forced successor 2 then 3: \`444441566623\`;
- candidate-6 forced successor 3 then 2: \`444441566632\`;

the same aggregate result:

\[
\text{CPC\_NONE},\qquad [-1,+1],
\]

with no forced column and no preemption restriction.

This is not evidence that CPC is the wrong abstraction.

It means the **current CPC output vocabulary closes W/D/L and current-action restrictions, but does not yet emit the strong-distance interval needed by the move finder at this boundary.**

## 3. Strong-distance extension

Extend the CPC result with:

\[
\boxed{
T(P)\in[\underline T_{\rm CPC}(P),\overline T_{\rm CPC}(P)]
}
\]

in addition to the existing W/D/L interval.

Use a sentinel \(+\infty\) when no finite upper certificate exists.

The calculation remains rank-local and consumes only:
- support heights;
- mover-relative residual coordinates;
- gravity/legal frontier;
- CPC event ordering;
- response resources;
- exact structural certificates compiled into CPC.

No oracle result is a runtime premise.

## 4. Lower component from the CPC residual basis

For every minimal active attacker residual \(R\) in the CPC/RBA coordinate, compute its earliest unopposed completion rank \(e_P(R)\).

For one complete synchronized response template \(\Pi\), define:

\[
H_\Pi(P)=\max\{D:\forall R,\ e_P(R)\le D\Rightarrow Covered_\Pi(R)\}.
\]

Then:

\[
\underline T_{\rm CPC}(P)=\max_\Pi H_\Pi(P).
\]

This is exactly the already-proved bounded synchronized-response survival theorem, but evaluated from CPC's own aggregate residual basis rather than from an external obligation list.

The accompanying control must reproduce:

\[
[3,3,5]
\]

for candidates 2, 3, and 6, and preserve 5 across the two candidate-6 forced response successors.

## 5. Upper component remains the missing theorem

The current CPC implementation has exact terminal, forced-block, fork-preemption, stacked-singleton-like and response-safety machinery, but it does not yet expose a general finite forced-completion rank.

The upper extension must be derived from the same aggregate CPC state.

Candidate compiled rules include the already-proved local theorems, but their runtime role is:

\[
\text{proof rule}
\longrightarrow
\text{CPC closure operator},
\]

not a separate move-scoring coordinate.

The target is:

\[
\overline T_{\rm CPC}(P)
=
\text{earliest rank by which CPC proves completion is unavoidable}.
\]

A finite value is admissible only when CPC supplies a constructive forced-completion certificate under support, response-resource, deadline and first-win guards.

If no such certificate exists:

\[
\overline T_{\rm CPC}(P)=+\infty.
\]

## 6. One calculation, not obligation-specific scoring

The intended runtime shape is:

\[
\text{current RBA/CPC state}
\to
\begin{cases}
\text{W/D/L interval}\\
\text{forced/preemption action restriction}\\
\underline T_{\rm CPC}\\
\overline T_{\rm CPC}
\end{cases}
\]

from one closure calculation.

Individual residuals may still be traversed internally because CPC's basis is made of residual generators, but they are not independent external heuristics.

Likewise, individual theorem controls remain valuable because they prove the soundness of CPC reduction rules.

## 7. Move-finder consequence

For loss-delay comparison, CPC may eliminate child \(b\) in favor of child \(a\) only when:

\[
\underline T_{\rm CPC}(P_a)>
\overline T_{\rm CPC}(P_b).
\]

Until a finite upper bound exists, candidate 6's larger lower bound remains insufficient.

Therefore there is still no v5 license at the consumed falsifier.

## 8. Architectural correction

The next research question is no longer:

> which additional obligation type should the move finder special-case?

It is:

> what exact aggregate CPC closure rule turns the current residual basis, support state, and response resources into a finite forced-completion upper rank?

This keeps the universal move finder aligned with one rank-local proof engine rather than accumulating a tactical rule list.

## Claim discipline

This note:
- promotes CPC as the aggregation boundary, not a new game axiom;
- preserves all earlier theorem guards;
- does not claim current CPC already computes strong distance;
- does not infer upper bounds from lower bounds;
- does not create v5;
- does not use Pons as a proof premise.
