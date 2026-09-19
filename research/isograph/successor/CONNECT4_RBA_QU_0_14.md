# Connect4 RBA Quantifiable Unknown - 0.14 staged local-query planner refinement

**Record ID:** `RBA-QU-0014`  
**Refines:** `RBA-QU-0013`  
**State:** `OPEN`  
**Date:** 2026-09-19  
**Authority effect:** post-1.1 research refinement only

## Newly fixed / constrained

- C4-R0090 gives an exact static candidate dominance-tree normalizer for maximal antichains and its complement dual for minimal antichains;
- static-tree and C4-R0088 block-signature normalization return the identical full 143,550-generator action-0 x action-2 stream;
- flat and projection-tree local evaluators return the identical 2,862,195 candidate-occurrence stream on that product;
- global normalization choice may be deferred until after exact local execution exposes C and D;
- deterministic union-nearest extreme probes catch rare local-projection tails missed by small hash samples;
- a greedy cheapest-first factor order is falsified by the exact 0 x 2 intermediate because its remaining continuations are expensive;
- the remaining large wall on the qualified win15 final step occurs in local restricted-image evaluation before global normalization.

## Refined open region

- O1 minimality / canonical presentation;
- O2 intrinsic staged local-query cost law;
- O3 adaptive local-evaluator scaling at rank27 and earlier;
- O4 transformer fusion;
- O5 empty-root compactness;
- O6 proof/value bridge;
- O7 independent replay;
- O8 multi-factor order/orientation planning with bounded lookahead;
- O9 representation-independent prunable-volume characterization;
- O10 deterministic rare-tail / local-query pressure prediction;
- O11 efficient hard restricted-image evaluation.

## Current exact seam

Qualify a staged product planner on the persisted rank27 products:

```text
preflight
    deterministic hash projection probes
    + union-nearest extreme probes

execute exact local projection

observe
    C local occurrence volume
    D distinct volume

choose exact global normalizer
    static dominance tree
    or block-signature index
    or retained exact control

for multi-factor products
    bounded lookahead over exact intermediate
    against remaining factors
```

The next technical target is the hard local restricted-image phase, especially the persisted win15 final product.

Do not descend to rank26 until the staged planner reproduces the persisted rank27 controls under bounded policy.

Frozen authority 1.1 remains unchanged.
