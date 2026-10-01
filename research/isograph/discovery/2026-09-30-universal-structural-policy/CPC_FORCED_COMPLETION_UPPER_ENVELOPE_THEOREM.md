# CPC forced-completion strong-distance upper envelope

**Date:** 2026-09-30  
**Status:** exact architecture theorem / CPC-native upper-bound primitive  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Move the already-qualified forced-completion primitives into the same aggregate CPC proof engine that owns the current residual basis.

The universal move finder should not maintain separate runtime solvers for:

- immediate/double singleton obligations;
- stacked support-release singleton obligations;
- all-move singleton release;
- fork precursors;
- Hall forks;
- forced-singleton lifts.

At the pinned JSMinSys CPC authority, these causal cases already appear inside one \`evaluateConnect4Cpc32()\` calculation over the complete current RBA/CPC residual basis.

This theorem attaches a conservative strong-distance upper rank to the existing CPC result without changing its W/D/L authority.

No solved W/D/L label or oracle score is a proof premise.

## 1. Convention

Fix a nonterminal state \(P\) and an attacker \(A\).

Let \(T_A(P)\) be the number of physical plies from \(P\) through the attacker terminal move under the stated forced-completion certificate.

A finite upper certificate

\[
\overline T_A(P)\le U
\]

means the attacker can force terminal completion in at most \(U\) physical plies.

Unknown remains \(+\infty\).

The lower/survival CPC envelope is a separate field and is not converted into an upper bound.

## 2. Native CPC exact-loss routes

At JSMinSys revision

\`0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb\`

the nonterminal CPC evaluator can prove the current mover loses through the following exact aggregate routes.

### 2.1 Multiple playable opponent singletons

If the aggregate CPC singleton pass finds at least two distinct currently playable opponent terminal cells, the mover can occupy at most one before the opponent's next turn.

Therefore:

\[
\boxed{\overline T_A(P)\le2.}
\]

### 2.2 Stacked singleton release

If exactly one opponent singleton target is currently playable and blocking it immediately releases another active singleton directly above it, the forced block is followed by the opponent terminal.

Therefore:

\[
\boxed{\overline T_A(P)\le2.}
\]

### 2.3 All-legal-moves singleton lift

If there is no current playable opponent singleton but every legal mover action releases an active opponent singleton above the played support event, every legal move permits opponent terminal on the next ply.

Therefore:

\[
\boxed{\overline T_A(P)\le2.}
\]

### 2.4 Fork-precursor deficiency

CPC's fork-preemption closure builds the intersection of current actions that preempt every qualified fork precursor.

If that intersection is empty, then after any mover action at least one fork precursor remains.

The opponent then:

1. plays the surviving enabler;
2. creates at least two distinct playable singleton targets;
3. survives the mover's one blocking placement;
4. takes another target terminally.

Therefore:

\[
\boxed{\overline T_A(P)\le4.}
\]

These are all native nonterminal CPC branches that return an exact win for the opponent at the pinned implementation. Residual-exhaustion and long-range response closure may prove draws/bounds, but do not introduce a different exact opponent-win route.

Hence a native nonterminal CPC exact opponent win carries the conservative aggregate guarantee

\[
\boxed{\overline T_A(P)\le4.}
\]

and the existing aggregate scratch can refine it to \(2\) when one of the first three routes is witnessed.

## 3. CPC restriction transport

Suppose CPC returns \`CPC_RESTRICT\` with one exact current preemption column \(r\).

Under the pinned CPC implementation this restriction arises from either:

- one currently playable opponent singleton, for which every non-\(r\) move loses within 2 plies; or
- a unique common fork preemption, for which every non-\(r\) move loses within 4 plies.

Let \(Q=P+r\) be the exact compliant successor.

If an independently sound CPC upper certificate gives

\[
\overline T_A(Q)\le U,
\]

then every mover policy from \(P\) terminates by either:

- at most 4 plies after a noncompliant move; or
- one compliant ply plus at most \(U\) more plies.

Therefore:

\[
\boxed{
\overline T_A(P)\le \max(4,1+U).
}
\]

This is a deterministic CPC transport rule. It does not branch over all legal replies.

## 4. Attacker setup lift

If attacker \(A\) has a legal nonterminal setup move \(a\) to \(Q=P+a\), and CPC proves

\[
\overline T_A(Q)\le U,
\]

then:

\[
\boxed{
\overline T_A(P)\le1+U.
}
\]

The setup is a constructive attacker choice. No minimax recursion is required.

Combining setup lift with restriction transport gives a linear CPC certificate chain.

## 5. Earlier Hall-fork theorem becomes a CPC route

Use prefix

\`2232\`.

The attacker setup in column 4 produces a defender-to-move state whose aggregate CPC singleton pass sees two playable attacker singleton terminals, columns 1 and 5.

Native CPC therefore proves an exact opponent win with

\[
\overline T\le2
\]

from the post-setup state.

By attacker setup lift:

\[
\boxed{\overline T(2232)\le3.}
\]

This is the earlier one-setup Hall-fork result, now recovered from one CPC calculation rather than a separate Hall-fork runtime operator.

Hall's \(2>1\) argument remains the proof witness for the CPC route.

## 6. Earlier forced-singleton lift becomes CPC transport

Use prefix

\`32612636\`.

The aggregate CPC chain is:

1. attacker setup column 4;
2. CPC returns a unique restriction: defender column 5;
3. after the compliant response, attacker setup column 4;
4. CPC exact-loss closure sees the terminal fork.

The final post-setup CPC state has upper rank \(2\).

The second setup therefore gives a child upper rank \(3\).

The unique CPC restriction transports this to at most \(4\) plies from the first post-setup defender state.

The first attacker setup gives:

\[
\boxed{\overline T(32612636)\le5.}
\]

This is the earlier forced-singleton-lift control, expressed entirely through aggregate CPC outputs plus exact state transport.

## 7. Consumed v4 boundary

At the consumed prefix

\`444441566\`

the CPC successor scan establishes:

- candidates 2 and 3: every legal one-ply attacker setup remains \`CPC_NONE\`;
- candidate 6:
  - setup 2 gives \`CPC_RESTRICT\`, uniquely forcing response 3;
  - setup 3 gives \`CPC_RESTRICT\`, uniquely forcing response 2;
  - both exact compliant successors return \`CPC_NONE\`.

Therefore this CPC upper grammar still produces:

\[
\overline T(P_2)=+\infty,
\qquad
\overline T(P_3)=+\infty,
\qquad
\overline T(P_6)=+\infty.
\]

The lower CPC envelope remains:

\[
\underline T(P_2)=3,\quad
\underline T(P_3)=3,\quad
\underline T(P_6)=5.
\]

There is still no interval separation and no v5 license.

The candidate-6 restrictions are nevertheless important: they are now recovered directly from CPC rather than from a separate singleton-response solver.

## 8. Architectural consequence

The strong-distance CPC target can now be stated as one aggregate result:

\[
CPC^*(P)=
\left(
V(P),
\underline T(P),
\overline T(P),
R(P),
W(P)
\right),
\]

where:

- \(V\): current CPC W/D/L interval;
- \(\underline T\): constructive survival lower horizon;
- \(\overline T\): constructive forced-completion upper horizon;
- \(R\): exact current action restriction when proved;
- \(W\): optional witness/provenance.

Individual obligations remain useful internally as theorem witnesses, but they are not parallel move scores.

## 9. Next theorem target

The unresolved v4 boundary requires a CPC aggregate progress rule stronger than the current singleton/fork grammar.

The target is not another obligation class. It is an exact CPC consequence over the existing residual/support state that proves one of:

- a finite forced-completion upper rank;
- a strict well-founded defect-progress transition;
- an exact value-class restriction needed before loss-delay comparison.

Candidate internal witness mechanisms may still use support-release chains, response-matroid deficiency, or deadline resource exhaustion, but their externally authoritative output should remain the aggregate CPC consequence.

## Claim discipline

This theorem:

- does not claim CPC currently closes the v4 children;
- does not infer an upper bound from the survival lower bound;
- does not create v5;
- does not use Pons as a proof premise;
- does not require ordinary minimax/negamax recursion;
- centralizes earlier exact obligation theorems inside CPC rather than discarding their proofs.
