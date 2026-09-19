# Literature synthesis — problems of the current RBA shape

**Date:** 2026-09-18
**Canonical branch:** `research/semantic-quotient`
**Status:** external literature synthesis; no authority promotion
**Research direction:** Josh Oshiro

## Current RBA shape being matched

The live Connect4 research has exposed:

```text
board structural fiber
  -> finite distributive residual lattice
  -> terminal-extended join-preserving cofactor F
  <-> exact right adjoint R
  -> nearly information-preserving transition interface
  -> alternating choice / strong-score semantics
  -> tiny exact action-score / value-policy quotient
```

The main open question is no longer semantic composability. It is:

> What known mathematical structure gives the most abstract exact representation of the alternating value transformer, and can its boundary representation compose compactly toward the root?

## 1. Forward-complete abstract interpretation / complete shells

Closest conceptual match to the **shrinking unknown / refinement process**.

Ranzato and collaborators show that, given an initial abstraction and a family of semantic functions, the **forward complete shell** is the most abstract refinement that is complete for those functions. Strong preservation of a specification language is characterized by forward completeness, and the best strongly preserving abstraction can be constructed as such a shell.

Key sources:

- Ranzato & Tapparo, *Generalized Strong Preservation by Abstract Interpretation* (2004/2006).
- Giacobazzi et al., *Making Abstract Interpretations Complete* (POPL 2000).
- Ranzato & Tapparo, *An Efficient Simulation Algorithm based on Abstract Interpretation* (2007/2008).

Direct RBA correspondence:

```text
concrete domain
    = board-fiber residual/q states

semantic operators
    = legal action transformers
      + terminal semantics
      + alternating value aggregation
      + score-threshold observations

initial abstraction
    = current residual / transition structure

complete shell
    = coarsest refinement that preserves exact value observations
```

This is probably the closest existing formalism to the QU-refinement process already being performed experimentally.

Research implication:

Instead of asking “what is the minimal value carrier?” informally, formulate it as:

```text
compute/characterize the forward complete shell
for the chosen exact Connect4 value operator family
relative to the board-fiber domain
```

If the shell is small, that is essentially an existence/construction theorem for the exact value quotient we seek.

## 2. Sup-preserving maps form quantales / quantaloids

Closest match to the **transition algebra** already discovered.

For a complete lattice L, sup-preserving endomaps form a quantale under pointwise join and composition. More generally, complete lattices with sup-preserving maps form the categorical setting usually denoted SLatt/Sup; on completely distributive lattices, Santocanale studies the associated Girard quantaloid structure.

Key source:

- Luigi Santocanale, *Dualizing sup-preserving endomaps of a complete lattice*, arXiv:2101.10493.

Direct RBA correspondence:

```text
objects
    = support/fiber-indexed residual lattices L_S

morphisms
    = terminal-extended join-preserving cofactors F

composition
    = fixed-word propagation

hom-order / joins
    = pointwise order and join of transformers

right adjoints
    = exact backward constraint lifts
```

Because RBA changes lattices from support to support, **quantaloid** is a better structural word than a single quantale.

This appears to name the fixed-transition layer we independently rediscovered.

Research implication:

Do not spend effort rediscovering composition laws for left-adjoint transition maps. Use quantaloid/residuation theory as the baseline and focus novelty on how the alternating value semantics acts on/over this quantaloid.

## 3. Multirelations / monotone predicate transformers / Game Logic

Closest match to the **alternating controller/opponent transformer**.

Binary multirelations are explicitly used to model two dual forms of nondeterminism, including games and systems interacting with an environment. Deterministic subclasses form categories and sometimes quantaloids. Predicate-transformer semantics and monotone neighborhood semantics are standard ways of representing what outcomes a player can force.

Key sources:

- Furusawa, Guttmann & Struth, *Determinism of Multirelations*, arXiv:2305.11344.
- Furusawa & Guttmann, *Modal algebra of multirelations* (Journal of Logic and Computation, 2025).
- Enqvist et al., *Completeness for Game Logic*, arXiv:1904.07691.
- Hansen et al., *Parity Games and Automata for Game Logic*, arXiv:1709.00777.
- Parikh-style Game Logic / monotone neighborhood semantics.

Direct RBA correspondence:

```text
current player choice
    = angelic / existential branch

opponent reply
    = demonic / universal branch

value threshold U
    = postcondition / winning predicate

RBA predecessor transformer
    = monotone predicate transformer

composed multi-ply block
    = composition of game/predicate transformers
```

This is especially close to the current O3 problem because we already showed two-ply max/min semantics compose exactly. Predicate-transformer/game-logic algebra is designed to make that compositional.

Research implication:

Represent each exact score threshold not merely as a set boundary but as a monotone predicate transformer over the fiber lattice. Then test whether the Connect4 transformer belongs to a restricted multirelational/modal algebra with a compact normal form.

## 4. Antichain algorithms for alternating automata

Closest algorithmic match to **storing only extremal value boundaries**.

Antichain methods avoid explicit state-set construction by representing downward/upward-closed sets by extremal elements. They were developed for universality/inclusion and emptiness problems, including alternating automata, and can be combined with simulation quotients.

Key sources:

- De Wulf, Doyen, Henzinger & Raskin, *Antichains: A New Algorithm for Checking Universality of Finite Automata* and later antichain work.
- Doyen/Raskin et al., *Antichain Algorithms for Finite Automata*.
- Holík, *Simulations and Antichains for Efficient Handling of Finite Automata*, arXiv:1706.03208.

Direct RBA correspondence:

```text
upward-closed winning/value-threshold set
    -> minimal generators only

simulation preorder
    -> dominance/favorability order

alternating automaton
    -> alternating controller/opponent value recurrence
```

Research implication:

The missing compact composition may already have an automata-theoretic analogue: combine a simulation quotient with antichain propagation rather than composing raw transition states.

## 5. Distributive-lattice dualization

Closest match to the **closed-blocker Upper -> Lower dual**.

Elbassioni proves quasi-polynomial algorithms for dualization over distributive lattices. This is precisely the family of problems where one converts between antichain descriptions of complementary monotone regions.

Key source:

- Khaled Elbassioni, *On Dualization over Distributive Lattices*, arXiv:2006.15337.

Current RBA relation:

```text
Upper(next theta)
    -> closure-aware dualization
    -> Lower(theta)
```

Research implication:

Our blocker is not an isolated special trick. It should be analyzed as a distributive-lattice dualization instance. Measure the Connect4-specific parameters that may put it into an easier subclass.

## 6. Coalgebraic behavioral minimization / graded semantics

Closest match to the observation that:

```text
full immediate transition signatures
    retain almost all q distinctions

but exact value behavior
    collapses them by ~1000x
```

Coalgebraic minimization computes behavioral equivalence generically by partition refinement. Graded semantics explicitly handles equivalences of different granularity and separates branching-time equivalence from coarser trace/language-like semantics.

Key sources:

- Deifel, Milius & Wißmann, *Coalgebra Encoding for Efficient Minimization*, arXiv:2102.12842.
- Ford et al., *Graded Monads and Behavioural Equivalence Games*, arXiv:2203.15467.
- Forster et al., *Graded Semantics and Graded Logics for Eilenberg-Moore Coalgebras*, arXiv:2307.14826.

Direct RBA correspondence:

```text
transition/bisimulation-like observation
    = too fine

exact score/action-policy semantics
    = much coarser observation

desired quotient
    = behavioral equivalence for the chosen value semantics
```

This may provide a principled way to define the “minimal exact value carrier” without guessing it.

## 7. Strong preservation + simulation refinement may be the best direct fit

A particularly relevant result: simulation preorders can themselves be characterized as forward-complete shells for union and predecessor operators.

That is almost exactly the mathematical form suggested by current RBA experiments:

```text
choose observation operators
    -> refine closure/domain until forward complete
    -> obtain coarsest exact strongly-preserving quotient
```

This suggests the current RBA QU refinement campaign can be formalized as a shell construction rather than a sequence of ad-hoc assertions.

## 8. Bounded structural complexity / fixed width

Parity games on bounded-treewidth arenas admit substantially easier algorithms; bounded structural parameters often turn otherwise hard game problems tractable.

Sources:

- Bouyer, Jugé & Markey, *Dynamic Complexity of Parity Games with Bounded Tree-Width*, arXiv:1610.00571.
- Staniszewski, *Parity Games of Bounded Tree-Depth*, arXiv:2211.02926.
- Puchala & Rabinovich, *Parity Games, Imperfect Information and Structural Complexity*, arXiv:1703.00683.

This does not directly prove an RBA compact normal form for Connect4, but it reinforces a plausible family theorem:

> fixed board width / bounded incidence width may bound the complexity of the exact transformer algebra even when unrestricted positional games are hard.

The board-fiber work is therefore aligned with known structural-parameter methodology.

## 9. What appears most promising

### Candidate A — Forward-complete shell formulation

Define the concrete fiber domain and exact operator family:

```text
F = {
  action cofactors / adjoints,
  alternating action aggregation,
  strong-score threshold operators,
  terminal constants
}
```

Then seek the **most abstract domain complete for F and the score observations**.

This is the closest existing formal statement of the RBA minimal-carrier problem.

### Candidate B — Quantaloid + predicate-transformer algebra

Treat support/fiber lattices as objects and cofactors as left-adjoint morphisms in a Sup/SLatt-like quantaloid.

Lift alternating play to monotone predicate transformers / multirelations over these objects.

Then RBA may be a finite subalgebra generated by:

```text
left adjoints
right adjoints
join
dual/blocker
existential/angelic choice
universal/demonic choice
score-chain constants/lifts
```

The compact normal-form question becomes an algebraic simplification/minimization problem in that transformer algebra.

### Candidate C — Behavioral quotient after value observation

Use coalgebraic/abstract-interpretation partition refinement to compute the coarsest relation that preserves exact action-score or state-value/policy observations.

Then inspect the resulting quotient for a small generating structure rather than guessing the quotient first.

## 10. Tentative synthesis

The current RBA problem appears to sit at the intersection:

```text
complete-shell abstract interpretation
        +
Sup/SLatt quantaloid of left adjoints
        +
monotone game predicate transformers
        +
antichain boundary representation
        +
distributive-lattice dualization
        +
behavioral minimization
```

The likely novelty is not that any one of these structures exists.

The Connect4-specific problem is their **joint specialization to the board-fiber geometry**, especially the enormous collapse from nearly injective transition behavior to a tiny exact value quotient.

## Recommended next theoretical experiment

Do not immediately invent another RBA operator.

Instead:

1. define the exact score-observation language / operator family;
2. compute the forward-complete shell / strongly-preserving abstraction on complete bounded Connect4 controls;
3. compare that shell exactly with:
   - q equivalence,
   - action-score-vector equivalence,
   - state-score+best-move equivalence;
4. determine which operators force each additional refinement;
5. repeat on the two standard-7x6 pathological supports where the value quotient is already known to be tiny.

If the shell converges directly to the observed 501/347 action-score classes or 74/66 value-policy classes, we will have identified the existing mathematical construction behind the collapse.

If it is finer, the difference tells us exactly which distinctions the existing shell theory preserves that RBA can discard.
