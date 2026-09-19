# RBA block-signature normalization qualification 0.2

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** exact maximal/minimal antichain-index qualification  
**Authority effect:** none  
**Research direction:** Josh Oshiro

## Qualified law

The block-signature dominance index from checkpoint 0.1 is exact for both subset-maximal and subset-minimal antichain normalization.

For maximal normalization, a candidate `q` may be rejected only if a previously retained exact generator `g` satisfies:

```text
g superset_eq q
```

Every true superset must also have a superset signature on every fixed bit block. Searching all superset signatures in any chosen block is therefore complete; the full-mask test preserves exactness.

Minimal normalization is the exact complement dual on the fixed transformed bit universe:

```text
Min(V)
=
complement(
  Max({ complement(v) | v in V })
)
```

No Connect4 semantics enter either indexing law.

## Maximal-mode real differential

Real rank27 `win15` action-0 x action-2 Lower product:

```text
raw implicit pairs         610,657,152
local skyline candidates     2,862,195
distinct candidates          2,170,447
block-index maximal output     143,550
```

A real 100,000-candidate slice was normalized independently by the existing exact `normalizeQ` implementation and the new block-signature maximalizer:

```text
old normalizer output      26,078
block index output         26,078
generator-set mismatch          0
```

## Minimal-mode full real differential

The complete rank27 `win15` action-Upper union was extracted before normalization:

```text
raw action-Upper candidates 279,650
```

Independent results:

```text
existing exact minimal normalizer 235,107
block-signature complement dual   235,107
qualified Upper stream            235,107

generator-set mismatch                  0
block-dual elapsed                   ~5.10 s
peak RSS                            ~21.7 MiB
```

Thus both directions are now qualified on real RBA frontiers.

## Planner consequence

The exact multiplication pipeline has four independently selectable physical decisions:

```text
1. factor order
2. operand orientation
3. local projection evaluator
4. global antichain normalizer
```

The rank27 controls demonstrate that optimizing only one of these can be misleading.

The previously observed `0 x 2` timeout is now classified as:

```text
semantic product invalid                  NO
intrinsic factor pair infeasible          NO
projection-tree local phase infeasible    NO
old global normalization path adequate    NO
block-signature normalization closes      YES
```

A planner should therefore estimate phase-specific work rather than one scalar proxy.

## Current phase variables

For one exact product:

```text
R = raw implicit pair opportunities
Q = projection/tree leaf work
C = local skyline candidate occurrences
D = distinct candidate count
M = global normalization work
O = final antichain width
```

Current evidence rejects each of `R`, `O`, or projection-pruning percentage as a sufficient standalone predictor.

The useful next question is whether inexpensive sampling can estimate the active pair `(Q,M)` well enough to choose a pipeline before full execution.

## Genericity

The block-signature subset/superset index is a candidate consumer-neutral fixed-width set-antichain mechanism.

Research should keep the ownership split explicit:

```text
Connect4 / RBA:
    residual/value semantics
    transformed q order
    Bellman composition
    threshold authority

generic mechanism candidate:
    block-signature subset/superset existence index
    minimal/maximal fixed-width antichain normalization
```

No lower-layer promotion is made by this checkpoint.

## Next

Build and test a multi-phase exact product planner on the already qualified rank27 products.

The planner must decide or estimate:

- orientation;
- local evaluator;
- global normalizer;
- factor order when more than two factors remain.

Require exact stream equality to persisted rank27 controls before any rank26 descent.

Frozen authority 1.1 is unchanged. The proof/value bridge remains a separate OPEN side seam.
