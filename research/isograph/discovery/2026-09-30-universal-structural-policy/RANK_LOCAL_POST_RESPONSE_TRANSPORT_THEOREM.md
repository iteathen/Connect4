# Rank-local post-response transport consequence theorem

**Date:** 2026-09-30  
**Status:** exact structural transport theorem / prerequisite for guarded multi-slot upper bounds  
**Branch:** \`research/universal-structural-policy-20260930\`

## Purpose

Define the exact rank-local state update after a previously certified response fragment.

The current upper-bound grammar has reached a hard boundary at the consumed v4 falsifier. Hall deficiency itself is not missing; the missing step is transporting a certified response through:

- support height;
- phase;
- ownership;
- residual winning requirements;
- legal frontier;
- release/deadline structure.

This theorem makes that transport exact and identifies a concrete compression boundary: support/phase transport alone is not sufficient.

No solved W/D/L value, oracle score, principal variation, or ordinary minimax recursion is used.

## 1. Certified response fragment

Fix a legal nonterminal position \(P\).

A response fragment \(F\) is admissible here only when its internal move sequence has already been proved:

- legal under gravity;
- ownership-typed;
- nonterminal at every intermediate move unless the fragment's conclusion is that terminal itself;
- consistent with first-win stopping;
- forced or otherwise justified by an already-proved structural certificate.

For each column \(c\), let

\[
n_c(F)
\]

be the number of cells consumed by the fragment in that column.

Let:

- \(A_F\) be the newly occupied cells owned by player \(A\);
- \(D_F\) be the newly occupied cells owned by player \(D\).

These ownership sets are part of the fragment descriptor. They may not be discarded when two fragments have the same consumption vector.

## 2. Support transport

If the initial support vector is

\[
h=(h_1,\ldots,h_W),
\]

then the exact successor support vector is

\[
\boxed{h'_c=h_c+n_c(F).}
\]

This is just gravity-chain consumption.

## 3. Phase transport

Define

\[
\phi_c=h_c\bmod 2
\]

and

\[
\tau(F)_c=n_c(F)\bmod 2.
\]

Then

\[
\boxed{\phi'=\phi+\tau(F)}
\]

over \(GF(2)\).

For the adjacent-column derivative

\[
d_i=\phi_i+\phi_{i+1},
\]

the successor is

\[
\boxed{d'=d+\delta\tau(F).}
\]

This is the already-derived path/Laplacian response action.

## 4. Exact residual-line transport

The residual update must retain line identity until after ownership transport.

For a generated winning line \(L\) and player \(p\), define the live residual at \(P\):

\[
R_p(L,P)=L\setminus Own_p(P)
\]

only when

\[
L\cap Own_{1-p}(P)=\varnothing.
\]

Otherwise \(L\) is dead for \(p\).

Let \(N_p(F)\) be the cells newly owned by \(p\) in the certified fragment and \(N_{1-p}(F)\) the cells newly owned by the opponent.

Then every previously live line transforms exactly as:

\[
\boxed{
R_p(L,P+F)=
R_p(L,P)\setminus N_p(F)
}
\]

provided

\[
R_p(L,P)\cap N_{1-p}(F)=\varnothing.
\]

If that intersection is nonempty, the line is dead for \(p\) after the fragment.

After this line-indexed update, empty residuals are terminal lines and nonempty residuals may be normalized to the minimal antichain.

### Why line identity matters

Applying this update only to the pre-fragment minimal antichain is not generally complete.

A nonminimal residual can become newly minimal after an opponent-owned fragment cell kills the former minimal residual that dominated it.

Therefore exact transport must use:

- full generated line identity; or
- another representation proved to preserve the same latent residual provenance.

## 5. Legal frontier and deadline regeneration

The legal frontier is then regenerated from \(h'\).

Any theorem using:

- playable singleton targets;
- support release;
- earliest possible completion rank;
- response slots;
- deadline neighborhoods;
- Hall matching;

must consume the **transported** support and residual state.

A pre-fragment scalar deadline, transversal size, or phase class is not automatically valid after \(F\).

## 6. Candidate-6 forced split control

Use the consumed v4 training prefix

\`444441566\`

and candidate move 6.

After candidate 6, the attacker has the synchronized bottom residual pair

\[
\{B1,C1\}.
\]

There are exactly two qualified forced-singleton response fragments:

\[
F_{B\to C}: A:B1,\ D:C1,
\]

and

\[
F_{C\to B}: A:C1,\ D:B1.
\]

For both fragments:

\[
n(F)=(0,1,1,0,0,0,0)
\]

in one-based columns 1 through 7, hence

\[
\tau(F)=(0,1,1,0,0,0,0).
\]

The candidate-6 child begins with:

\[
\phi=(1,0,0,1,1,1,0),
\]

\[
d=(1,0,1,0,0,1).
\]

Both forced fragments produce:

\[
\phi'=(1,1,1,1,1,1,0),
\]

\[
d'=(0,0,0,0,0,1).
\]

So the two fragments are **identical in support and phase transport**.

## 7. Ownership-sensitive residual divergence

Despite identical \(n(F)\), \(\tau(F)\), support and phase:

- the two fragments assign different owners to \(B1\) and \(C1\);
- their exact residual line families differ.

For the attacker:

- both successors have 30 minimal residual requirements;
- 27 minimal residuals are common;
- 3 occur only after \(A:B1,D:C1\);
- 3 occur only after \(A:C1,D:B1\).

For the defender:

- both successors have 29 minimal residual requirements;
- 26 are common;
- 3 occur only in each orientation.

The full live generated-line counts also differ:

- \(A:B1,D:C1\): 33 attacker-live lines, 33 defender-live lines;
- \(A:C1,D:B1\): 32 attacker-live lines, 32 defender-live lines.

One exact attacker-side difference is:

- after \(A:B1,D:C1\), the minimal residual \(\{C2,E4\}\) exists;
- it does not exist in the opposite ownership orientation.

Therefore:

\[
\boxed{
n(F),\tau(F),\phi',d'
\text{ do not determine the post-response residual proof state.}
}
\]

Typed ownership/blocker consequences are load-bearing.

## 8. No unsafe macro merge

Two response fragments may be merged as one proof state only if the fields used by all downstream theorems are proved equivalent.

At minimum, for the present calculus that includes:

- support frontier;
- side to move;
- typed ownership assignments or an exact quotient thereof;
- residual line/provenance state;
- response resources;
- deadlines/first-win guards.

Equal phase transport alone is insufficient.

## 9. Consequence for the strong-distance interval program

This theorem does not itself produce a finite upper bound at the v4 falsifier.

It supplies the exact transition operator required before constructing a guarded multi-slot response graph.

The next admissible pipeline is:

\[
\text{certified response fragment}
\to
\text{exact transport}
\to
\text{regenerated terminal obligations}
\to
\text{exact response-slot neighborhoods}
\to
\text{Hall / matroid deficiency}
\to
\overline T.
\]

If the regenerated obligation family is not unit-capacity, enrich the resource model rather than forcing a Hall interpretation.

## Claim discipline

This result:

- is exact for certified fragments under the stated guards;
- uses only current geometry and mechanically derived successor facts;
- does not rank candidates;
- does not infer a win from phase transport;
- does not infer a win from residual counts;
- does not create v5;
- does not use oracle values as premises.
