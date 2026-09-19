# RBA rank-27 loss14 adjacent-threshold checkpoint 0.1

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** selected rank27 `loss14` threshold CLOSED  
**Authority effect:** none  
**Research direction:** Josh Oshiro

## Target

~~~text
support            [3,4,2,0,6,6,6]
rank               27
remaining cells    15
residual shapes    38
transformed bits   76
threshold          loss14
~~~

This is the first adjacent-threshold test after exact `draw15` closure.

## Recovery / recurrence qualification

The transient late-rank harness from the prior session was unavailable after reconnect. The recurrence was independently reconstructed from committed research artifacts: `rank33-lattice-boundary-control.mjs`, `COFACTOR_UPSET_ADJOINT_CHECKPOINT.md`, `RBA_NATIVE_SEMIRING_CHECKPOINT_0_1.md`, and the persisted rank29/rank28/rank27 checkpoints.

The rebuilt shape-only engine uses support-local residual-shape lattices, principal cofactor images, exact right adjoints for <= coordinate preimages, minimal principal-cover frontiers for >= coordinate preimages, transformed q*=(mover-upset, complement(opponent-upset)), subset-minimal Upper antichains, subset-maximal Lower antichains, and exact Lower meet/intersection products.

A resumable per-support threshold cache was used so bounded interruptions do not rebuild completed descendants.

Before the new threshold was trusted, the reconstruction reproduced multiple persisted controls exactly by generator count, including:

~~~text
rank29 [3,5,2,1,6,6,6] draw13
    Upper  47,472
    Lower 140,454

rank29 wide child
    Upper  27,647
    Lower 103,479

rank28 draw14 controls
    [4,4,2,0,6,6,6]  67,191 / 17,721
    [3,5,2,0,6,6,6] 144,462 / 78,546
    [3,4,3,0,6,6,6]  63,615 / 36,217
~~~

A redundant full `draw15` replay was stopped before the known wide final descendant completed because its purpose was reconstruction qualification, not a new result. No mismatch was observed.

## Exact rank28 win13 children

The rank27 `loss14` threshold maps by one-ply strong-score negation to rank28 `win13`.

| child support | Upper(win13) | Lower(win13) |
|---|---:|---:|
| [4,4,2,0,6,6,6] | 19,523 | 16,074 |
| [3,5,2,0,6,6,6] | 51,645 | 29,554 |
| [3,4,3,0,6,6,6] | 27,276 | 38,042 |
| [3,4,2,1,6,6,6] | 126,524 | 122,309 |

The second row exactly matches the previously closed selected rank28 strong boundary at `win13`.

## Rank27 fixed-action fronts

| column | action Upper | action Lower |
|---:|---:|---:|
| 0 | 13,774 | 11,883 |
| 1 | 19,329 | 14,379 |
| 2 | 13,460 | 9,231 |
| 3 | 86,597 | 106,363 |

Upper union:

~~~text
raw action-Upper candidates  133,160
Upper(loss14)                114,585
~~~

Lower products:

~~~text
11,883 x 14,379 =   170,865,657 implicit -> 44,625 exact
44,625 x 9,231   =   411,933,375 implicit -> 65,885 exact
65,885 x 106,363 = 7,007,726,255 implicit -> 158,402 exact

aggregate root Lower opportunities = 7,590,525,287
~~~

## Exact result

~~~text
Upper(loss14) = 114,585
Lower(loss14) = 158,402
~~~

Canonical stream hashes:

~~~text
Upper  f38ea10662b49c9746140bdf8b4da1009ce784c8ecde59247867c720b365bf20
Lower  15b671bcc8b9caab5814712aba5a8888e1fbb6f411862ae13e489da1e310db1e
~~~

Serialization is one lowercase hexadecimal transformed q-mask per line, sorted numerically, newline terminated.

## Root-only execution economics

With the exact rank28 children already cached:

~~~text
preimage/action construction      ~4.9999 s
Lower local-product generation   ~20.9944 s
global normalization             ~11.8385 s
total root replay                ~39.3273 s

all Lower raw opportunities    7,590,525,287
local skyline candidates         1,263,256
projection-tree leaf scans               0
~~~

The final root was deliberately evaluated by direct local-skyline streaming rather than the rebuilt projection index, because the rebuilt index topology was slower than streaming on this 7B product. This is an evaluation-policy fact, not a semantic distinction.

## Structural consequence

The selected support's `draw15` final product required projection-index pruning to escape a flat 89.6B scan wall. The adjacent `loss14` threshold closes exactly with ordinary local-skyline streaming:

~~~text
draw15 Lower   534,618
loss14 Lower   158,402

draw15 final implicit product   89.58B
loss14 all root Lower products   7.59B
~~~

Therefore the draw15 evaluation wall is not a uniform property of the support fiber.

Current evidence points to threshold/boundary-specific restricted-image structure:

~~~text
support fiber
 + threshold
 + induced action-front geometry
 + restricted-image width / scan volume
 + global normalization
~~~

This is evidence refining C4-R0084. No general threshold-local scaling theorem is promoted yet.

## Next

Compute selected rank27 `win15`, whose child threshold is rank28 `loss14`. Then compare `loss14 / draw15 / win15` on the same support before deciding whether projection-pruning behavior is fiber-stable, threshold-local, or predictable from action-front geometry.

Do not descend to rank26 yet.

Frozen authority 1.1 is unchanged. The proof/value bridge remains a separate OPEN side seam.
