# Checkpoint — closed two-sided generator-only rank propagation through rank 35

**Date:** 2026-09-18
**Canonical branch:** `research/semantic-quotient`
**Status:** exact against full residual-superdomain oracle on both documented standard-7x6 pathological future cones
**Authority effect:** none
**Research direction:** Josh Oshiro

## Read first after reconnect

1. `RECOVERY_CHECKPOINT_RESIDUAL_SUPERDOMAIN.md`
2. `ABSTRACT_RESIDUAL_CONSERVATIVE_EXTENSION.md`
3. `GENERATOR_ONLY_ACTION_PREDECESSOR_CHECKPOINT.md`
4. this file

This checkpoint supersedes the prior open question about whether the child lower-value side would force parent residual-pair enumeration.

It did not.

## Result

A complete two-sided strong-value boundary recurrence was constructed using only:

- support-local single-player residual antichain dictionaries;
- implication order on those antichains;
- exact one-cell owner/opponent cofactors;
- minimal upper-threshold state generators;
- maximal lower-threshold state generators;
- small coordinate-frontier preimages;
- boundary normalization.

The construction propagates from the full board down through the entire seven-ply future cones of both pathological rank-35 supports.

The construction itself never evaluates the full P0/P1 residual-pair value table.

The full residual-superdomain tables are retained only as independent qualification oracles.

## Canonical strong-score levels

At a support with `r` cells remaining, side-to-move strong scores lie in the ordered finite scale:

```text
loss in 2
loss in 4
...
loss in largest even <= r

draw at board exhaustion

win in largest odd <= r
...
win in 3
win in 1
```

with:

```text
win > draw > loss
faster win better
slower loss better
```

The one-ply nonterminal transform:

```text
child [sign,d]
    -> parent action [-sign,d+1]
```

reverses strong-score order.

Therefore a parent action upper-threshold query consumes a **child lower-threshold** boundary.

## Stored boundary pair

For every support `S` and score threshold `theta`, store:

```text
Upper(S,theta)
    minimal generators of { q | V(q) >= theta }

Lower(S,theta)
    maximal generators of { q | V(q) <= theta }
```

Both are represented in the current-player favorable residual product order.

## Fixed-action upper predecessor

For action `a` at parent support:

1. map parent threshold `theta` through one-ply score reversal;
2. select the corresponding child lower boundary;
3. reinterpret the child's maximal lower generators as minimal generators in the parent-beneficiary orientation;
4. pull each child generator back through:
   - minimal mover-coordinate cofactor preimages;
   - maximal opponent-coordinate cofactor preimages;
5. cross only those coordinate frontiers;
6. add the immediate-terminal boundary;
7. normalize.

This is the operator qualified in the preceding checkpoint.

## Parent state upper boundary

Because the stored value is side-to-move value:

```text
V_parent(q) = max_a Q_a(q).
```

Therefore:

```text
{V_parent >= theta}
    = union_a {Q_a >= theta}.
```

So:

```text
Upper(S,theta)
    = minimal_normalize(
        union of fixed-action upper boundaries
      ).
```

No universal Cartesian conjunction appears.

## Exact lower-boundary dualization

For adjacent score levels:

```text
theta < next(theta)
```

the lower set is exactly:

```text
{V <= theta}
    = complement {V >= next(theta)}.
```

The state order is a two-coordinate product:

```text
mover formula implication
x
reversed opponent formula implication.
```

Given minimal upper generators `B`, the maximal complement boundary can be derived without value-state enumeration:

For each mover antichain `m`:

1. collect upper generators whose mover coordinate is below/equal to `m`;
2. these generators forbid corresponding opponent principal upsets;
3. compute the maximal allowed opponent coordinate in the reversed opponent order using only the single-player antichain poset;
4. emit those conditioned candidates;
5. globally maximal-normalize them.

This is an exact two-coordinate antichain dualization.

For the maximum score level, `Lower` is simply the maximal state boundary of the whole abstract domain.

## Full boundary-only recurrence

The resulting closed recurrence is:

```text
child Upper / Lower boundaries
        |
        v
child Lower selected by score reversal
        |
        v
coordinate-separable q cofactor preimage
        |
        v
fixed-action parent Upper
        |
        v
union across actions
        |
        v
parent Upper
        |
        v
dual complement of next Upper
        |
        v
parent Lower
```

Repeat rank by rank.

No parent P0/P1 residual-pair value census is required.

## Qualification — pathological cone 1

Target:

```text
[5,5,5,2,6,6,6]
```

Boundary-only propagation covered every support in the complete future cone, ranks 42 down through 35.

Construction metrics:

```text
fixed-action threshold constructions     460
largest pre-normalization preimage set    54
largest state Upper boundary              61
largest state Lower boundary             119
```

Exact oracle comparison:

```text
Upper threshold cases                    180
Upper generator-set mismatches             0

Lower threshold cases                    180
Lower generator-set mismatches             0
```

Per-rank mismatches were zero at every rank 35..42.

## Qualification — pathological cone 2

Target:

```text
[5,5,2,5,6,6,6]
```

Construction metrics:

```text
fixed-action threshold constructions     460
largest pre-normalization preimage set    81
largest state Upper boundary              55
largest state Lower boundary              99
```

Exact oracle comparison:

```text
Upper threshold cases                    180
Upper generator-set mismatches             0

Lower threshold cases                    180
Lower generator-set mismatches             0
```

Per-rank mismatches were zero at every rank 35..42.

## Aggregate

```text
pathological future cones                   2
boundary-only action constructions        920
oracle Upper comparisons                   360
oracle Lower comparisons                   360
total exact boundary comparisons           720
total generator-set mismatches               0

largest generator-preimage candidate set    81
largest Upper boundary                      61
largest Lower boundary                     119
```

The construction replaces the previously observed:

```text
573,270,600
58,748,277
```

distributed universal proof candidate domains at the two rank-35 pathologies.

## Structural consequence

For ordinary exact strong value, the needed recurrence now appears closed at the **value-boundary layer**:

```text
support-local residual function posets
+ q cofactor
+ finite score reversal
+ upper/lower threshold antichains
+ exact two-coordinate dualization
-> next-rank exact value boundaries
```

The distributed proof-side universal conjunction is not used.

This is not yet a statement that every proof/certificate calculation can discard clause/realizability structure.

It is a candidate exact ordinary-value calculus.

## Relation to C4-R0076

This strongly changes the interpretation of the missing law.

The previous wording expected:

```text
predecessor-closed clause/proof carrier
    -> realizability-preserving compact predecessor
    -> q/value boundary.
```

The tested ordinary-value path is instead:

```text
support-local residual function domain
    -> conservative exact q-value extension
    -> generator-only q predecessor
    -> exact value boundary.
```

Realizability is not reconstructed because legal q is transition-closed and the abstract value solution is a conservative extension.

This may resolve the ordinary-value portion of C4-R0076, but **do not change its status yet**. The result still needs theorem review, durable independent implementation, and earlier-rank scaling qualification.

No relation to C4-R0043/C4-R0069 is promoted by this checkpoint.

## Immediate next step

Attempt rank 34 without falling back to parent residual-pair enumeration.

Measure for every tested rank-34 support:

- residual shape count;
- single-player antichain count;
- implication-poset construction cost;
- fixed-action preimage candidate count;
- Upper/Lower generator widths;
- time/memory.

Start from supports immediately preceding the two pathological rank-35 targets so the rank-35 boundaries above are direct child inputs.

Stop if the **single-player residual-antichain dictionary itself** becomes the new combinatorial wall. If it does, identify its exact structural source instead of hiding it with buffers/timeouts.

If rank 34 closes, continue rank-wise only while generator and single-coordinate growth remain structurally informative.

## Reconnect marker

At the moment this checkpoint was written, the next research command is conceptually:

```text
derive_rank34_boundary_only_predecessor
```

Do not repeat:

- ownership-mask rank propagation;
- distributed clause universal products;
- legal-q census construction;
- owner-bit ROBDD;
- full line-hit/history propagation;
- parent residual-pair value enumeration for construction.

Use the full residual-pair solver only as a bounded qualification oracle where affordable.

## Epistemic disposition

```text
conservative residual value extension           DEDUCTIVE CANDIDATE
fixed-action generator predecessor               EXACT ON PATHOLOGIES
two-sided Upper/Lower boundary closure           EXACT ON 2 COMPLETE FUTURE CONES
boundary-only rank recurrence through rank 35    720/720 EXACT ORACLE MATCHES
rank 34                                           NEXT
empty root solved                                 NO
authority 1.1 mutated                             NO
new IsoGraph relation promoted                    NO
```
