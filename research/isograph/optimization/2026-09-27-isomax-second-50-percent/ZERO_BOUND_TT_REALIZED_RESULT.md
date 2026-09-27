# Phase 2 result — realized local zero-bound TT

Date: 2026-09-27
Status: major retained candidate; local target crossed, production qualification pending.

Frozen denominator:
`10380f79af68dc1f57455d535814ac0a7eacea33`.

Realized workflow:
- run `36357608169`;
- artifact `10944751138`;
- digest `sha256:617ffad09fc7eadacdd74973f8b325b3e9589c42ec078dd5f168849cf42026c5`.

All realized policies passed directed narrow-window correctness controls before
timing.

## Search-derived LOWER0/UPPER0

Long control `353335714`:

- total process cycles: **-56.2642%**
- 95% paired interval: **[-56.7540%, -55.7744%]**
- wall: **-57.8996%**
- nodes: **11,755,731 -> 2,900,135 (-75.33%)**
- cofactors: **11,813,310 -> 2,900,429 (-75.45%)**
- exact result/root move unchanged.

The mechanism raises cycles/node substantially; its value is overwhelmingly
search-tree reduction. Whole-solve cost nevertheless falls well below the Phase
2 0.50 target:

    candidate / denominator = ~0.43736

So the owner's second cumulative 50% target is crossed at the local exact-solve
screen.

## CPC-derived bounds

Standalone CPC-derived LOWER0/UPPER0:
- cycles +0.62%, inconclusive/adverse;
- nodes unchanged.

Combined search+CPC bounds perform nearly identically to search-only on the long
control but add store pressure and weaker short-control economics.

Disposition:
- retain **search-derived local bounds only**;
- reject CPC-derived bound stores for the initial integrated candidate.

## Important structural conclusion

This result validates the Phase-2 mechanism-neutral target.

The largest gain did not come from making nodes cheaper. It came from preserving
a tiny amount of non-exact online proof information in the W/D/L domain so large
repeated subtrees never had to be searched again.

Because mover-relative W/D/L has only three values, all useful weak non-exact
information collapses to two threshold states:
- LOWER0;
- UPPER0.

That tiny proof carrier produces a ~75% node reduction on the hard control.

## Next gates

Before production promotion:
1. direct-source JSMinSys implementation;
2. canonical NEES/addon ledger integration;
3. full tests;
4. same-runner direct-source confirmation;
5. selected six-deep/one-wide multiworker qualification;
6. short-work and shared-cache interaction checks.

Commit every gate/result promptly due recurring UI desynchronization.
