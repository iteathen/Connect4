# Candidate structural theorem: connected-component multiset factorization of q_Sigma

**Status:** exact representation theorem candidate; semantic sufficiency is inherited from the reduced carrier, not created by this factorization.  
**Research direction:** Joshua Oshiro

Let a reduced q-style state be

\[
q=(h,R_0,R_1),
\]

viewed as a finite labeled residual hypergraph:

- one vertex for each column;
- vertex label \(h_c\);
- one owner-labeled hyperedge for every residual in \(R_0\cup R_1\).

Let \(S_W\) act by arbitrary column relabeling.

Then the orbit

\[
[q]_{S_W}
\]

is exactly the isomorphism class of this labeled hypergraph.

Every finite hypergraph decomposes uniquely into connected components. Therefore its isomorphism class is uniquely determined by the **multiset of connected-component isomorphism classes**:

\[
[q]_{S_W}
\cong
\operatorname{MSet}(C_1(q),\ldots,C_m(q)).
\]

Conversely, disjoint union of representatives reconstructs the whole hypergraph up to column relabeling.

## Algebraic consequence

At this representation level the natural composition is multiset union.

It is:

- associative;
- commutative;
- identity-bearing;
- generally not self-cancelling.

So the representation algebra presently exposed is a commutative multiset monoid, not yet an XOR group.

## Post-RFG instance

For

\[
q^*=G(F(R(q_o))),
\]

the current transporter-aware representation is

\[
q_{\Sigma RFG}=[q^*]_{S_W}.
\]

The complete 4x4 audit found:

- direct RFG classes: 30,046;
- \(q_{\Sigma RFG}\) classes: 9,308;
- connected-component multiset classes: 9,308;
- component-multiset Q-F: PASS;
- component-multiset Q-A: PASS;
- component-multiset Q-V: PASS.

Thus the concrete component extractor is lossless relative to \(q_{\Sigma RFG}\) on that complete bounded carrier.

## XOR as a later quotient

A per-component XOR valuation

\[
\bigoplus_i \phi(C_i)
\]

would be a **further quotient** of this multiset monoid.

For a fixed component definition and any exponent-2 Abelian codomain, the result depends only on the parity of each component-type multiplicity. The complete 4x4 audit found that component multiplicity parity is not even Q-V sufficient.

Therefore the universal relation

\[
2C\sim 0
\]

is rejected for the currently frozen post-RFG component definition.

This does **not** reject:

- a different component definition after further exact reduction;
- a context-refined component;
- a non-exponent-2 finite algebra;
- a non-group commutative monoid quotient;
- XOR after a later transformation/valuation.

## Global-coupling caveat

Connected components are disconnected in the **surviving residual-incidence hypergraph**, but they still share persistent global game structure such as:

- one alternating turn schedule;
- total remaining move resources;
- first-win stopping;
- board capacity;
- final-board-mover ownership.

Therefore disjoint hypergraph representation does not by itself prove independent-game decomposition. A valid value-composition theorem must either:

1. show those global couplings are fully encoded in the component values plus a small global scheduler coordinate; or
2. reduce them away before component valuation.

## Revised discovery target

The late-stage algebra problem is now:

> Find the coarsest exact rank-local congruence of the post-reduction component multiset representation for Q-F, Q-A, and Q-V, then determine the algebra of the resulting quotient.

XOR is one candidate quotient algebra, not the assumed one.
