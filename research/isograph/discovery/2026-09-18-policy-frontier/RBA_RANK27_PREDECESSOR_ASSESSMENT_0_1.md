# RBA rank-27 predecessor assessment 0.1

**Date:** 2026-09-19
**Canonical branch:** research/semantic-quotient
**Status:** structural predecessor assessment only; rank27 root not executed
**Authority effect:** none
**Research direction:** Josh Oshiro

## Immediate predecessor interfaces

Each row reverses one legal placement from closed rank28 support [3,5,2,0,6,6,6] and computes the exact fixed-action predecessor interface induced by the qualified rank28 draw14 boundary.

| column | support | shapes | bits | comparabilities | max cover | fixed Upper | fixed Lower |
|---:|---|---:|---:|---:|---:|---:|---:|
| 0 | [2,5,2,0,6,6,6] | 36 | 72 | 86 | 2 | 40440 | 82352 |
| 1 | [3,4,2,0,6,6,6] | 38 | 76 | 96 | 2 | 23203 | 72117 |
| 2 | [3,5,1,0,6,6,6] | 37 | 74 | 87 | 8 | 45039 | 76967 |
| 4 | [3,5,2,0,5,6,6] | 38 | 76 | 95 | 2 | 67266 | 138905 |
| 5 | [3,5,2,0,6,5,6] | 38 | 76 | 93 | 3 | 76270 | 139887 |
| 6 | [3,5,2,0,6,6,5] | 38 | 76 | 92 | 4 | 86706 | 144462 |

## Selected next predecessor

Selected: [3,4,2,0,6,6,6], rank 27, 38 residual shapes, 76 transformed bits, fixed Upper 23,203, fixed Lower 72,117, max cover 2.

It deliberately does not minimize representation width. Despite being in the highest shape/bit class of the immediate predecessors, it has the smallest fixed-action Upper and a modest Lower. This makes it a direct control against cost models based only on residual-shape count or transformed bit width while avoiding an intentional principal-cover pathology.

The [3,5,1,0,6,6,6] predecessor remains the complementary principal-cover-pressure control because max cover is 8.

## Execution seam

The selected rank27 draw threshold requires the other legal rank28 child draw boundaries. They are not inferred from the one closed child.

Next: cache remaining rank28 draw14 children -> qualify them -> compose selected rank27 draw15 -> compare economics -> reassess before further descent.

Authority 1.1 remains unchanged. The proof/value bridge remains an open side seam.
