# Connect4 post-1.1 RBA current overlay 0.8

**Status:** derived successor overlay, not authority 1.1  
**Date:** 2026-09-19  
**Research direction:** Josh Oshiro  
**Refines:** `CONNECT4_POST_1_1_RBA_OVERLAY_0_7.*`

## Rank27 progression disposition

The selected rank27 support remains:

```text
[3,4,2,0,6,6,6]
loss14  114,585 / 158,402
draw15  161,398 / 534,618
win15   235,107 / 306,617
```

A heterogeneous exact staged policy now has bounded routes for all three stress thresholds. The rank27 evaluator campaign is no longer the active blocker to descent.

## C4-R0091 — exact core-relative product absorption

For subset-maximal meet product `Max({a AND b})`, let `envB=OR(B)`.

If some `b0 in B` contains `a AND envB`, then:

```text
a AND b0 = a AND envB
```

is a real row product and dominates every other product in row `a`. The entire row may be replaced by that one witness. Columns are symmetric.

On the qualified rank27 win15 final step, this removes 81.40% of raw pairs before local projection and reproduces the exact 306,617-generator stream.

## C4-R0092 — exact shared-target principal-cover DP

For one cofactor edge, let parent principal `i` have parent upset `P_i` and child image upset `I_i`.

For child target `T`, choose any `b in T`:

```text
MC(0) = {0}

MC(T)
  =
Min(
  union over i with b in I_i
    { P_i union U | U in MC(T \ I_i) }
)
```

Every exact cover contains some image covering `b`; recursion covers the remainder; minimalization retains exactly the minimal parent-cover frontier.

The uncovered-target state is shared across all requested coordinate-preimage targets for that edge.

Qualification:

```text
6 rank26 predecessor edges
x 2 modes
x 48 sampled targets
= 576 exact differentials
mismatches 0
```

A complete 89,032-target ownGE family evaluates in ~142 ms on the first rank26 predecessor; the corresponding 117,692-target oppGE family evaluates in ~95 ms.

## Selected rank26 control

```text
support [3,3,2,0,6,6,6]
rank 26
residual shapes 40
transformed bits 80

fixed-action loss16 interface from known child win15:
    Upper 75,920
    Lower 49,724

fixed-action win15 interface from known child loss14:
    Upper 59,798
    Lower 44,706

max principal-cover frontier 2
```

It was selected because it has the smallest measured interfaces under both independent probes while not minimizing representation width.

Complementary pressure control:

```text
[3,4,1,0,6,6,6]
max own cover frontier 8
```

## Current exact seam

The selected rank26 central threshold is `draw16`.

Three rank27 `draw15` children remain to be cached:

```text
[4,3,2,0,6,6,6]
[3,3,3,0,6,6,6]
[3,3,2,1,6,6,6]
```

The fourth child `[3,4,2,0,6,6,6]` is already closed at draw15.

No proof/value relation is promoted. Frozen authority 1.1 is unchanged.
