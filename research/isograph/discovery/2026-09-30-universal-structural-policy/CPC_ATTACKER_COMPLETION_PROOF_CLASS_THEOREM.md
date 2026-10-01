# CPC attacker forced-completion proof-class automaton

**Date:** 2026-09-30  
**Version:** 0.1 frozen before fresh oracle validation  
**Status:** exact rank-local upper-bound theorem candidate  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Construct the attacker-side analogue of the qualified CPC semantic survival automaton.

The survival classes \(S_D\) prove that the attacker cannot terminally complete before a horizon. The present classes \(A_D\) prove that a designated attacker can force terminal completion within a finite physical-ply horizon.

This is not ordinary minimax. The proof graph contains only already-qualified CPC proof transitions:

- one controller-chosen attacker setup;
- native CPC exact defender-loss closure;
- native CPC exact current-action restriction;
- exact RBA cofactor transport through only the CPC-admissible defender responses.

A \`CPC_NONE\` state is a hard boundary: this grammar does not branch through it.

No oracle value is a premise.

## 1. Meaning of \(A_D\)

Fix a designated attacker \(A\).

For a legal nonterminal CPC/RBA state \(q\) with \(A\) to move,

\[
q\in A_D
\]

means:

> there exists a constructive CPC proof certificate under which \(A\) terminally wins in at most \(D\) physical plies from \(q\).

The bound is conservative. Membership in \(A_D\) implies membership in \(A_{D'}\) for any \(D'\ge D\).

Unknown means no certificate in the current grammar, not draw/loss.

## 2. Base constructor: immediate terminal

If \(A\) has a legal current placement that terminally wins, then

\[
\boxed{q\in A_1.}
\]

This is exact first-win closure.

## 3. Native CPC defender-loss upper

Let \(Q\) be a nonterminal state with the defender to move.

The previously qualified CPC forced-completion upper theorem proves that native CPC exact loss of the current mover has a finite attacker completion bound:

- multiple playable attacker singletons: \(\le2\) plies;
- stacked singleton release: \(\le2\);
- all-legal-moves singleton lift: \(\le2\);
- fork-precursor deficiency: \(\le4\).

Let

\[
U_{\rm CPC}(Q)\in\{2,4\}
\]

be the route-specific proven upper bound when one of these exact routes is witnessed.

If CPC is exact for the attacker for another reason that lacks an independently proved strong-distance bound, this constructor does **not** assign a distance.

## 4. Attacker setup into native closure

If attacker move \(a\) is legal and nonterminal, reaches defender-to-move state \(Q\), and native CPC proves

\[
U_{\rm CPC}(Q)\le u,
\]

then

\[
\boxed{q\in A_{1+u}.}
\]

Thus the Hall-fork control may enter \(A_3\).

## 5. Exact CPC restriction transport

Suppose after attacker setup \(a\), the defender-to-move state \(Q\) returns \`CPC_RESTRICT\` with exact preemption set

\[
R(Q).
\]

By CPC semantics:

- every legal defender action outside \(R(Q)\) loses to the attacker within the native noncompliance bound, conservatively at most 4 plies from \(Q\);
- actions inside \(R(Q)\) are the only current actions that can preserve unresolved play under this CPC certificate.

For every \(r\in R(Q)\), apply the exact RBA cofactor and require:

- no defender terminal;
- no draw terminal;
- the exact successor \(Q_r\), with \(A\) to move, is already certified in \(A_{D_r}\).

Let

\[
D_{\max}=\max_{r\in R(Q)}D_r.
\]

Then from \(Q\):

\[
\overline T_A(Q)
\le
\max(4,1+D_{\max}).
\]

Including the initial attacker setup:

\[
\boxed{
q\in
A_{\,1+\max(4,1+D_{\max})}.
}
\]

This is universal quantification only over the exact CPC restriction set, not over an unrestricted continuation tree.

## 6. Controller choice and proof rank

If several attacker setups produce valid certificates, the attacker may choose the smallest upper bound:

\[
D(q)=\min_a D_a(q).
\]

Within one restricted defender response set, the attacker must survive the slowest defender choice:

\[
D_{\max}=\max_r D_r.
\]

This is the already-established proof-hypergraph rank algebra:

- controller alternative: \(\min\);
- opponent variants: \(\max\);
- conjunctive prerequisites: \(\max\).

It operates over proved certificate hyperedges rather than arbitrary recursively evaluated legal positions.

## 7. Required polarity

Every transported endpoint must remain attacker-positive.

A branch is rejected if exact transport yields:

- defender terminal;
- draw terminal;
- CPC exact draw;
- CPC exact defender win;
- no child \(A_D\) certificate where one is required.

This directly incorporates the pair-star composition falsifier: residual cardinality decrease is not enough.

## 8. Expected controls

### Hall-fork

Prefix:

\`2232\`

Attacker setup 4 reaches a native CPC exact defender-loss route with tactical upper 2.

Expected:

\[
\boxed{2232\in A_3.}
\]

### Forced-restriction chain

Prefix:

\`32612636\`

The already-qualified chain is:

- attacker setup 4;
- CPC forces defender response 5;
- attacker setup 4;
- CPC exact defender-loss closure.

Expected:

\[
\boxed{32612636\in A_5.}
\]

## 9. Consumed v4 boundary expectation

At children:

- \`4444415662\`;
- \`4444415663\`;
- \`4444415666\`;

the prior CPC successor scan found:

- every one-ply setup from candidates 2/3 is \`CPC_NONE\`;
- candidate 6 has two restriction-producing setups, but their compliant successors are \`CPC_NONE\`.

Therefore this proof-class grammar is expected to remain unresolved at all three roots.

That negative result is useful: it identifies exactly where a new polarity-preserving CPC hyperedge is required.

## 10. Runtime boundary

The implementation may recursively evaluate already-defined \(A_D\) proof classes only through exact \`CPC_RESTRICT\` edges.

It must stop at \`CPC_NONE\`.

It must not:

- recurse over unrestricted defender legal moves;
- assign values to unresolved children;
- use oracle labels;
- rank moves heuristically;
- use minimax/negamax/alpha-beta.

Memoization by exact CPC/RBA semantic state is permitted because it is proof-class closure, not value search.

## 11. Fresh qualification

After this theorem and implementation are frozen:

1. generate fresh legal states independently of the consumed v4 prefix;
2. retain only states where the structural \(A_D\) grammar proves a finite bound;
3. freeze those structural certificates;
4. query the pinned Pascal Pons oracle afterward;
5. verify only that the oracle result is compatible with the proved attacker win and upper distance;
6. do not repair the rule from oracle failures without consuming those states as training evidence.

## Claim discipline

This theorem candidate:

- is rank-local and geometry-derived;
- uses CPC as the aggregate obligation authority;
- proves only finite attacker completion where its constructors close;
- does not claim completeness;
- does not close the consumed v4 boundary yet;
- does not license v5.
