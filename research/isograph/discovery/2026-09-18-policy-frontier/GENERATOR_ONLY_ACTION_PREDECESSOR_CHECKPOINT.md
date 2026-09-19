# Checkpoint — generator-only fixed-action value predecessor

**Date:** 2026-09-18
**Canonical branch:** `research/semantic-quotient`
**Status:** exact on the two documented standard-7x6 pathological rank-35 supports; theorem/general rank propagation still under derivation
**Authority effect:** none
**Research direction:** Josh Oshiro

## Prior checkpoint

Read first:

- `RECOVERY_CHECKPOINT_RESIDUAL_SUPERDOMAIN.md`
- `ABSTRACT_RESIDUAL_CONSERVATIVE_EXTENSION.md`
- `ABSTRACT_RESIDUAL_SUPERDOMAIN_RESULTS.json`

The residual-superdomain oracle closes the two rank-35 pathologies without materializing the distributed proof products.

This checkpoint tests the stronger question:

> Can a parent **fixed-action strong-value threshold boundary** be constructed directly from a child value boundary without enumerating the parent residual-pair domain?

For the tested cases the answer is yes.

## Setup

Fix parent support `S`, legal action `a` landing at `x`, and current mover/beneficiary `p`.

The q transition factors by player coordinate:

```text
C_own:
    mover residual antichain
    -> owner-true cofactor at x
    -> child mover residual antichain
    or immediate terminal

C_opp:
    opponent residual antichain
    -> owner-false cofactor at x
    -> child opponent residual antichain
```

For a child boundary generator:

```text
g = (g_p, g_opp)
```

the parent condition:

```text
T_a(q_parent) >=_p g
```

factors exactly into:

```text
C_own(A_p) >= g_p

and

C_opp(A_opp) <= g_opp.
```

No parent P0/P1 residual-pair Cartesian census is needed to test either coordinate.

## Coordinate preimage construction

### Mover coordinate

Enumerate only the parent single-player residual antichains and keep those whose nonterminal owner-true cofactor is at least `g_p`.

Normalize to the **minimal** formulas under mover implication order.

These are the least-favorable mover formulas that still reach the child generator upper set.

### Opponent coordinate

Enumerate only the parent single-player residual antichains and keep those whose owner-false cofactor is at most `g_opp`.

Normalize to the **maximal** formulas under ordinary implication order.

Because opponent order is reversed in the beneficiary-favorable state order, these are the least-favorable parent opponent coordinates that still satisfy the child condition.

### Recombine only coordinate frontiers

For one child state generator, take:

```text
minimal mover preimages
    x
maximal opponent preimages
```

then normalize in the parent beneficiary-favorable product order.

This product is over coordinate **frontiers**, not over all proof alternatives or all parent residual pairs.

### Immediate terminal

If the action threshold admits immediate win, add the minimal mover terminal preimage and the maximally permissive opponent coordinate, then normalize with the nonterminal candidates.

## Qualification oracle

The full residual-superdomain oracle from the previous checkpoint was retained only as an independent reference.

For each tested parent support, action and strong threshold:

1. compute the exact oracle threshold boundary by scanning all 491,401 / 495,616 parent residual pairs;
2. independently compute the child threshold boundary;
3. apply the generator-only coordinate-preimage construction above;
4. compare the final parent generator sets exactly, not merely counts.

## Results

### Support [5,5,5,2,6,6,6]

```text
legal actions                       4
nontrivial strong thresholds/action 7
action-threshold cases             28
exact boundary mismatches           0
```

Representative cases:

```text
column 0, threshold draw:
    child generators               24
    coordinate-product candidates  35
    final parent generators        25
    oracle generators              25

column 1, threshold draw:
    child generators               32
    coordinate-product candidates  46
    final parent generators        33
    oracle generators              33

column 3, threshold draw:
    child generators               40
    coordinate-product candidates  54
    final parent generators        26
    oracle generators              26
```

Largest candidate set before parent normalization:

```text
54
```

Compare with the previously published proof-side pathological product:

```text
573,270,600
```

### Support [5,5,2,5,6,6,6]

```text
legal actions                       4
nontrivial strong thresholds/action 7
action-threshold cases             28
exact boundary mismatches           0
```

Representative worst cases:

```text
column 2, draw threshold:
    child generators               58
    coordinate-product candidates  77
    final parent generators        34
    oracle generators              34

column 2, slow-win threshold:
    child generators               58
    coordinate-product candidates  81
    final parent generators        39
    oracle generators              39
```

Largest candidate set before parent normalization:

```text
81
```

Compare with the previously published proof-side pathological product:

```text
58,748,277
```

## Aggregate exact result

```text
pathological supports                    2
fixed actions                            8
nontrivial action-threshold cases       56
exact generator-set mismatches           0

largest full parent oracle domain   495,616 states
largest generator-only candidate set     81
largest final threshold boundary          39
```

The candidate reduction occurs **before** parent residual-pair enumeration and before distributed universal proof materialization.

## Structural interpretation

For one fixed action, the value predecessor is not intrinsically a distributed proof conjunction.

It has the form:

```text
child value upper-set generator
        |
        +-- single-player mover cofactor preimage -> minimal coordinate frontier
        |
        +-- single-player opponent cofactor preimage -> maximal coordinate frontier
        |
        v
small coordinate-frontier product
        |
        v
parent action-value threshold generator
```

This factorization follows from two facts:

1. q transition is coordinate-separable by player residual antichain;
2. the beneficiary-favorable state order is a product of mover implication and reversed opponent implication.

The huge distributed clause/proof product is therefore not required for the tested fixed-action value predecessor.

## What is proved/tested versus still open

### Exact on the tested pathologies

- child boundary -> fixed-action parent threshold boundary;
- exact generator equality against full abstract-domain oracle;
- immediate terminal integration;
- all strong thresholds observed at both supports.

### Still open

The next rank/state recurrence must avoid silently reintroducing a universal product.

With side-to-move value orientation:

```text
parent state V >= theta
    = union over action-value >= theta
```

which is favorable because union of upward sets is boundary union + normalization.

However the child predicate needed by one-ply negation is a lower threshold in the child current-player value order. A complete generator-only rank recurrence therefore needs an exact economical representation/derivation of that dual lower boundary, or an equivalent two-sided score representation.

Do not claim root-scale closure until this dual boundary seam is resolved.

## Immediate next step

Derive and test a two-sided value-boundary representation:

```text
upper threshold minimal generators
+
lower threshold maximal generators
```

Then test:

1. child lower boundary -> parent fixed-action upper boundary;
2. union of action upper boundaries -> parent state upper boundary;
3. derive parent lower boundaries without parent-state enumeration;
4. compare all results exactly against the residual-superdomain oracle;
5. only then descend to rank 34.

## Epistemic disposition

```text
fixed-action coordinate factorization          DEDUCTIVE CANDIDATE
generator-only fixed-action predecessor         EXACT ON 56 PATHOLOGICAL CASES
parent pair enumeration required for operator   NO IN TESTED CASES
dual lower-boundary closure                     OPEN
rank-34 propagation                             NOT YET ATTEMPTED
empty 7x6 root solved                           NO
authority 1.1 mutated                           NO
```

No new relation edge is promoted by this checkpoint.
