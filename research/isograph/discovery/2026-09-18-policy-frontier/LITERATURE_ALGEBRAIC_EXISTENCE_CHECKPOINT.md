# Literature checkpoint — existence and limits of an algebraic Connect4 solution

**Date:** 2026-09-18
**Canonical branch:** `research/semantic-quotient`
**Base live head before this checkpoint:** `8bf46f3045dd64de7420bad8f7566aa9073133e5`
**Status:** literature synthesis / research guidance
**Authority effect:** none
**Research direction:** Josh Oshiro

## Question

Does existing mathematics/theoretical-CS establish either:

1. existence of an exact algebraic solution for a game of the structural shape currently exposed by the Connect4 residual-lattice work; or
2. impossibility of a compact algebraic/non-search solution?

The answer from the literature is asymmetric:

- exact algebraic/fixed-point formulation: **yes, generically**;
- compact closed form for standard 7x6 Connect4: **not established**;
- impossibility of such a compact 7x6-specific formulation: **not established**.

A fixed finite board cannot be ruled out by ordinary asymptotic complexity arguments because any one fixed instance admits a finite hard-coded representation. Complexity barriers become meaningful only for a uniform family or for a stated representation-size/time bound.

## 1. Finite games as lattice fixed points

Relevant literature:

- Baldan, König, Padoan, Mika-Michalski, *Fixpoint Games on Continuous Lattices*, arXiv:1810.11404.
- Bertrand, Bouyer, Staquet, *Antichains for Concurrent Parameterized Games*, arXiv:2505.13460.

These works characterize game/verification solutions by monotone equations over lattices and least/greatest fixed points. Bertrand et al. explicitly compute a winning region as an antichain fixed point on a finite lattice.

Consequence for current Connect4 work:

```text
support-local residual lattice
+ monotone predecessor/value operator
+ finite rank
-> exact fixed-point / backward algebra exists in principle
```

This supports the *existence* of an algebraic recurrence. It does not imply a compact representation or cheap root solution.

## 2. Antichain symbolic game solving

Antichain game algorithms exploit monotone winning regions and retain only extremal boundary elements instead of enumerating every state.

This is directly analogous to the current Connect4 objects:

```text
Upper(S,theta) = minimal generators of value >= theta
Lower(S,theta) = maximal generators of value <= theta
```

The literature therefore provides a known algorithmic family for the exact move from explicit state sets to boundary-only symbolic solving.

The remaining Connect4-specific question is representation growth, not whether such a symbolic algebra is legitimate.

## 3. Cofactor predecessor as a Galois adjoint

For one support edge, the current residual-shape cofactor is join-preserving on the upset lattice.

Standard order theory says a join-preserving map between suitable complete lattices has a right adjoint/Galois connection characterizing greatest preimages of lower constraints.

This matches the derived Connect4 operation:

```text
F(U) <= V
    iff
U <= R(V)
```

where `R` is the greatest exact parent coordinate preimage.

The current `COFACTOR_UPSET_ADJOINT_CHECKPOINT.md` should therefore be reframed during theorem review as a concrete finite Galois-adjoint instance, not as an ad-hoc optimization.

## 4. Closed-blocker Lower dual as distributive-lattice dualization

Relevant literature:

- Defrain, Nourine, Uno, *On the dualization in distributive lattices and related problems*, arXiv:1902.07004.
- Elbassioni, *On Dualization over Distributive Lattices*, arXiv:2006.15337.
- Mary, *Enumeration of minimal transversals of hypergraphs of bounded VC-dimension*, arXiv:2407.00694.

The current exact identity:

```text
Lower(theta)
    = complement Upper(next(theta))
```

combined with closure-constrained hitting sets is a distributive-lattice dualization problem.

This is particularly important because the general dualization problem has nontrivial output-sensitive/quasi-polynomial algorithms, and stronger polynomial/incremental-polynomial results are known under structural restrictions such as bounded VC dimension or other restricted incidence/poset classes.

Research implication:

Do not treat the closed-blocker implementation as the final algorithm.

Measure the Connect4-specific dualization instances for structural parameters that may place them in a tractable subclass:

- residual-shape poset width/height;
- generator-hypergraph VC dimension;
- conformality;
- incidence/treewidth-like parameters;
- closure-system dimension;
- number/distribution of join-irreducibles.

A theorem that these parameters are bounded by Connect-K geometry could convert the current empirical blocker scaling into a genuine complexity bound.

## 5. Gravity as a poset restriction

Relevant literature:

- Bagan et al., *Poset Positional Games*, FUN 2024 / Discrete Mathematics 2025, arXiv:2404.07700.

The paper explicitly uses Connect-4 as motivation. Gravity becomes a poset restriction; a union of disjoint chains is identified as a direct generalization of Connect-4's move-access structure.

Important complexity facts from that framework:

- general poset positional games can remain hard under severe restrictions;
- Maker-Breaker is PSPACE-complete even at poset width 2 with winning sets of size 3;
- restricted subfamilies become polynomial when additional structural parameters are fixed;
- the union-of-disjoint-chains case is treated separately and admits tractable cases.

Therefore:

```text
gravity / chain structure alone
    != proof of easy compact solution

gravity + special geometric winning-line incidence
    may still admit a compact special algebra
```

The literature does not collapse those two statements.

## 6. General positional-game hardness is a warning, not a refutation

Relevant results include:

- Schaefer-style PSPACE hardness for general positional games;
- bounded-degree positional-game PSPACE-completeness;
- recent Maker-Maker rank-4 PSPACE-completeness.

These show that:

```text
small winning sets
+ alternating perfect information
+ monotone positional objectives
```

do not by themselves imply a polynomial compact solution.

They do **not** prove hardness of the specific rectangular gravity Connect-K family, and they certainly cannot rule out a compact formula for the one fixed 7x6 instance.

Recent summaries still list the suitable generalized classical Connect Four complexity as unresolved beyond membership in PSPACE. Do not cite general positional-game PSPACE-completeness as though it were a theorem about standard generalized rectangular Connect Four.

## 7. Existing symbolic Connect4 work

Relevant work:

- Edelkamp & Kissmann, *On the Complexity of BDDs for State Space Search: A Case Study in Connect Four*, AAAI 2011.
- Böck, *Strongly Solving 7x6 Connect-Four on Consumer Grade Hardware*, arXiv:2507.05267 (2025).

Böck's strong solution used symbolic BDD search and produced an 89.6 GB lookup table in roughly 47 hours on one CPU core with 128 GB RAM.

This establishes that exact symbolic set propagation is practical, but also demonstrates that a generic Boolean-state representation can remain enormous.

The current Connect4 residual-boundary work is structurally different:

```text
BDD:
    represent large exact state/value sets symbolically

current research:
    quotient to residual-function lattice
    retain extremal value boundaries
    use adjoints and lattice duality
```

Therefore BDD success neither proves nor refutes the stronger compact-boundary hypothesis.

## 8. What the literature *does* prove for our question

### Existence level

For a finite monotone game/value formulation:

```text
YES:
an exact algebraic/fixed-point characterization exists.
```

This follows from standard finite-lattice/fixed-point game theory and is consistent with antichain symbolic algorithms.

### Compactness level

```text
UNKNOWN for this Connect4 representation.
```

No located theorem establishes that standard 7x6 Connect4 value boundaries remain polynomially/smallly representable all the way to the root.

### Closed-form / rank-free level

```text
UNKNOWN.
```

No located theorem establishes a one-shot expression from empty-board geometry directly to exact best move without fixed-point/rank propagation.

### Impossibility level

```text
NO relevant impossibility theorem found for fixed 7x6.
```

Family-level PSPACE hardness of broader positional-game classes is insufficient.

## 9. Strongest interpretation of the current research

The current work is no longer merely a faster recursive solver.

It is converging on an established formal-methods shape:

```text
finite distributive lattice
+ monotone/cofactor morphisms
+ Galois adjoints
+ antichain value boundaries
+ distributive-lattice dualization
+ finite score/rank recurrence
-> exact game value
```

The novel Connect4 question is whether its specific residual-shape incidence makes the boundary algebra uniformly compact.

That is the correct theorem target.

## 10. Recommended theorem/search targets

### T1 — formal algebra theorem

State and prove the current recurrence using standard terminology:

```text
ResidualUpsetLattice(S)
Cofactor left adjoint
Cofactor right adjoint
Upper predecessor
closed dual / lattice dualization
finite strong-score recurrence
```

This would separate already-known general order theory from the genuinely Connect4-specific parts.

### T2 — compactness parameter theorem

Look for a geometry-derived bound on one or more:

```text
boundary width
minimal-cover width
closed-blocker dual width
VC dimension
residual-poset width
incidence treewidth
join-irreducible interaction width
```

If a bound depends only mildly on board width/K rather than number of legal positions, that is a route to a true algebraic solver complexity theorem.

### T3 — family boundary

Define the uniform family precisely before making a complexity claim:

```text
fixed K=4, variable W,H?
fixed W=7,K=4, variable H?
fixed width W and K, variable H?
arbitrary W,H,K?
```

Different choices may have radically different complexity.

### T4 — rank-elimination test

Ask whether the support/rank recurrence is simply Kleene iteration of one monotone lattice operator and whether the operator has additional algebraic structure (closure, idempotence, nilpotence, bounded index, matrix/semiring representation) permitting collapse of multiple rank steps.

A proof of bounded iteration index or compositional exponentiation would be the most plausible route from the current algebraic recurrence toward a more direct formula.

## Current disposition

```text
exact algebraic fixed-point formulation exists generically     YES
current Connect4 lattice machinery matches known theory         YES
compact 7x6-specific algebra proved externally                  NO
compact 7x6-specific algebra ruled out externally               NO
general positional-game hardness transfers to Connect4          NO
lattice dualization literature directly relevant                YES
next mathematical target                                        COMPACTNESS / RANK-COLLAPSE THEOREM
```
