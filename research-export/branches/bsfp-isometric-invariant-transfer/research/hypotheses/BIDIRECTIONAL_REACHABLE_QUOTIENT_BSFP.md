# Bidirectional reachable-quotient BSFP

**Status:** live cross-lineage hypothesis. No production solver change.

**Research direction:** Josh Oshiro.

## Core observation

Two previously separate results point at the same seam:

1. the identified-line quotient `Q=(support,H0,H1)` is exact on the tested reachable physical-state controls for terminal behavior, transitions/actions and W/D/L;
2. the direct BSFP line-product lane fails only when arbitrary symbolic `(H0,H1)` pairs are admitted without preserving support-local realizability.

This suggests that part of the C4-R0043 difficulty may be an artifact of solving a deliberately widened symbolic domain rather than the legal/reachable semantic domain required by an empty-root solve.

## Candidate architecture

Use the two solver directions together at runtime:

```text
empty root
   |
   v
forward exact semantic transition
   -> reachable quotient classes q
   -> exact q transitions / dense IDs
   |
   v
finite reachable quotient DAG / ranked relation
   |
   v
backward BSFP / interval proof propagation
   -> root W/D/L / proof state
```

No external solved value, opening book, optimal line set or precomputed game result is a premise. The forward construction is part of the runtime algorithm and therefore may legitimately supply exact reachability premises to the backward solve.

This is not ordinary minimax search: the forward phase need not evaluate choices or recursively solve values. It computes the exact reachable semantic transition system under the chosen quotient identity.

## Why this is aligned with Isometric

The architecture cleanly separates:

```text
operational state:
  frontier/workset records used to build/propagate the graph

semantic identity:
  exact quotient q preserving the requested transition/value behavior

proof state:
  backward W/D/L interval, antichain or certificate information over q.
```

Isometric/Isomax can continue shrinking the semantic identity or proving claim-relative transform equivalences without forcing BSFP to adopt the same physical representation.

## Potential resolution of the line-hit realizability problem

If only runtime-reachable quotient classes are admitted, arbitrary unrealizable `(H0,H1)` products never enter the state universe.

The remaining requirements become:

1. exact forward generation of reachable q classes;
2. exact equality/grouping and dense ID assignment;
3. storage or regeneration of the action-labelled transition relation;
4. exact backward existential/universal predecessor propagation over those IDs;
5. terminal/first-win semantics preserved on transitions.

This may be strictly simpler than constructing a closed symbolic recurrence over every support-local Boolean assignment.

Strong falsifier: reachable quotient identity is not sufficient on larger controls or the reachable q graph is too large/expensive to construct relative to symbolic BSFP.

## Forward reachability without colored-board history

Two forward forms should be compared.

### Form A — exact semantic automaton

Use the already-qualified residual/identified-line semantic transition:

```text
q + legal column -> terminal | q'.
```

Deduplicate q' by exact full-record equality. Hashes may select buckets but never define identity.

### Form B — support/line-hit causal constraints

Construct reachable line-hit classes from support transitions plus exact realizability constraints, avoiding physical ownership reconstruction where possible.

At fixed support, final nonterminal ownership plus legal move counts still does not guarantee an alternating legal history. Ownership events in each column form precedence chains and global turns provide alternating P0/P1 slots.

Thus physical reachability can be stated as an **alternating-chain scheduling** problem:

```text
column cell precedence
+ owner-labelled events
+ fixed alternating turn slots
+ final nonterminality
-> existence of a legal history.
```

Because winning ownership is monotone, if the final assignment is nonterminal then no earlier prefix can already contain a win. First-win stopping therefore reduces to final nonterminality for this reachability check.

A compact Hall/interval/deadline characterization of this scheduling problem would be an Isometric calculus result; a bounded runtime DP/matching implementation is also admissible because its cost is part of the solve.

## Relationship to separator hidden-history evidence

The separator census rejected crossing ownership `X` alone for the full symbolic C1 function, but reported no physically reachable collision in the tested controls. That is exactly the pattern predicted here:

```text
full symbolic quotient requires extra hidden compatibility memory;
legal causal quotient may require less.
```

The decisive experiment is therefore not another wider symbolic accumulator. It is to compare the minimal transition class on:

```text
all symbolic assignments
versus
legal count-correct nonterminal assignments
versus
runtime-reachable assignments.
```

Measure how much hidden-history state disappears at each restriction.

## CUDA convergence

The forward quotient builder and O3 device path need essentially the same generic machinery:

```text
exact transform
-> candidate records
-> exact grouping
-> variable-length compaction
-> dense IDs
-> original-to-group mapping
-> device-resident next-layer chaining.
```

Therefore CUDA-Algorithms grouping/compaction work is not only an OQS optimization. It is also the generic substrate for a forward reachable semantic quotient.

Horizontal reflection should canonicalize candidates before grouping so mirrored states share one semantic representative where the root/problem contract permits it.

## Backward proof representation

Three proof-state forms should be compared over the same reachable q graph:

1. exact W/D/L scalar per q class;
2. six-element W/D/L interval per q class so Isometric one-sided certificates can narrow values before exact closure;
3. structural certificate/antichain proof state where claim-relative theorem reuse avoids repeating equivalent proof work.

The graph identity and proof identity must remain separate.

## Runtime exact-search cooperation

A runtime search/proof component may solve selected q classes or prove bounds and inject them into the backward phase as exact certificates. This is allowed because the information is earned during the run.

The selection objective is not "search as much as possible" but

```text
backward symbolic work eliminated / runtime certificate cost.
```

Repeated certificate patterns become Isometric discovery material; once a searchless theorem replaces them, the runtime search disappears from that seam.

## Experiment sequence

1. Reproduce complete small controls with a forward reachable `Q=(support,H0,H1)` graph and backward W/D/L propagation; compare every reachable state/value against existing authorities.
2. Compare graph/class counts against full symbolic C1 and the full-symbolic line-product quotient.
3. Add horizontal reflection canonicalization and verify exact action remapping.
4. Replace physical-state generation with the existing semantic residual automaton where qualified.
5. Measure hidden-history class count after restricting R1/R3 controls to legal and reachable q classes.
6. Only then attempt a bounded standard-7x6 layer growth experiment.
7. If graph growth is still prohibitive, use Isometric certificates/interval bounds to stop or merge proof work before widening the quotient identity.

## Falsifiers

- any reachable state maps to a quotient class with mixed W/D/L or mixed action semantics;
- runtime forward construction depends on an external solved label;
- exact grouping uses hash equality without full-record verification;
- reflection canonicalization loses action orientation or provenance required by the requested output;
- first-win terminal states are admitted as ordinary nonterminal q nodes;
- forward graph materialization costs more than the symbolic work it replaces with no reusable semantic benefit;
- proof-state equivalence is silently promoted to semantic q identity.
