# Frozen independent recheck AFTER exploratory discovery: original7x6 WSL singleton dominates diagonal and survival raises degree to five

**Date:** 2026-10-22 Pacific. **Research direction:** Josh Oshiro. **Branch HEAD:** `262092ff524cae65bf76bf9a4fcdcd4ae9942706`. **Integrity classification:** hypotheses below came from preliminary independent Python original7x6 probes and were **NOT preregistered before those exploratory observations**. They are frozen **before** the forthcoming independently implemented JS original69/ray check; no claim of prospective origin for the preliminary discovery. No solved-game inputs, perfect-player trajectory or below-five board extrapolation.

## Original geometry and source guard

Six anchor original7x6 rank12 32-state legal firstwinner-free source faces have all peripheral columns filled to height2, center c4 empty; each bit x_i denotes P0 ownership of peripheral bottom site c_i,r1, with the top owned by P1. On edge anchor c1 or c7, that anchor has P0 bottom/P1 top and five remaining peripheral bits independently variable. Actual next P0 c4 lands r1. Historical WSL exact residual construction is:
- per original K4 window L, retain R_p(L)=L\setminus O_p when the opponent occupies no cell of L;
- delete empty completed masks (never present in a live board);
- merge equal R and remove every strict superset of another live player-specific R.
Historical September `RFG` is applied afterward with exact ownership-slot, non-own-frontier and final-owner cap guards, not a replacement for WSL normalization.

## Frozen specific cross-line source claims

On c1 anchor, define the original Player 1 falling diagonal residual mask `M_L={(c4,r1),(c2,r3),(c1,r4)}`, arising from the original F K4 `{(c1,r4),(c2,r3),(c3,r2),(c4,r1)}` when `x_3=1`. Its strict singleton subrequirement `N={(c4,r1)}` is supplied by original bottom-right H K4 `{(c4,r1),(c5,r1),(c6,r1),(c7,r1)}` when `x_5=x_6=x_7=0`. Define the **specific historical antichain dominance status**
`D_L=[M_L present as an unblocked residual] [M_L not in normalized P1 antichain]`.

Preliminary exact observed identity over **all 32 legal source faces**:
`D_L = x_3 (1-x_5)(1-x_6)(1-x_7)`.
Check no other original K4 subrequirement causes extra dominance on those 32 states.

On mirrored c7 anchor, define original Player 1 rising `M_R={(c4,r1),(c6,r3),(c7,r4)}` from R K4 `{(c4,r1),(c5,r2),(c6,r3),(c7,r4)}`; H-left singleton `N={(c4,r1)}` arises iff `x_1=x_2=x_3=0`. Predict exact:
`D_R=x_5 (1-x_1)(1-x_2)(1-x_3)`.

The actual P0 c4 first-win event on the edge anchored face reduces to a run111 among six peripheral bottom P0 bits (four horizontal windows through the true center). On `D_L=1`, the only compatible P0 firstwin channel is `x_2=1` (c1 anchor). On `D_R=1`, the only compatible P0 firstwin channel is `x_6=1` (c7 anchor). Consequently the **original first-win live-censor pullback** should be:

```text
D_L * (1-Win_P0,c4) = (1-x_2)x_3(1-x_5)(1-x_6)(1-x_7)
D_R * (1-Win_P0,c4) = (1-x_6)x_5(1-x_1)(1-x_2)(1-x_3)
```

Each product has squarefree primitive degree **five**, with leading coefficient +1 for the all-five-bit monomial. For each edge face EVEN and ODD total parity (16 boards each), original `D` mass should agree **1 vs 1**; after P0 c4 firstwinner stopping `D*(1-Win)` should yield **EVEN 0 vs ODD 1**.

## Historical vs new observable levels

The edge C6 signed measure is `z=(+,-,+,-,-,+)` on actual source indices `[1,2,8,9,16,18]`. Preliminary checks:
- total original unblocked P1 K4 window count: z=0;
- count of **unique** unblocked P1 residual masks before antichain absorption: z=0;
- count of **minimal** P1 residual requirements: z=-1 on anchor c1 and +1 on anchor c7;
- signed count of strictly absorbed P1 residual masks: z=+1 (c1), -1 (c7);
- only the above named diagonal residual M has nonzero z on its dominance predicate.

The independently established October native 69 individual K4 ternary-pattern and 876 Euler field has zero z before first center, whereas the *nonlinear antichain cardinality* has nonzero z already on source. This is a specific **cross-window inclusion/subsumption correlation** and not an OOO *intercomponent oddness triple* (every tested live RFG has one width7 component). The existing October postcenter five-switch parity moment counterexample and these new features use the SAME legal source switch bit family but different observables.

## Independent falsification / exactness gates

1. Rebuild original 69 physical K4 from four directions without importing previous code, and verify exact physical ray wins on all source history prefixes and P0 c4 actions.
2. Rebuild full *unnormalized* per-player residual window catalog, exact duplicate collapse and exact strict subset-minimal antichains; explicitly verify D_L/D_R formulas on all32 states per edge, plus exact first-win source mask and parity masses.
3. Check z on each level (window count/unique count/minimal count/removed count/dominance individual mask).
4. Check all five owner variables are essential to the **survivor-conditioned D** polynomial (the coefficient of the squarefree product is +1 by expansion; directly compute five-bit Möbius difference).
5. Check full historical `ROLE_CAPPAR_REL_INC_ZOE` single-component identity separately: original 7! permutations should distinguish all six C6 board atoms per edge (preliminary Python yes); no oddness-only OOO triple exists on the face. Reproduce with independent code, or label this group-orbit portion outstanding.
6. Use only original source 7x6 and no solved-game priors; do not claim strategic `exists P0/forall P1` closure. Do not confuse scalar parity ensemble differences with actual perfect-play path probabilities.

Expected response to any failure is to preserve exact location and narrow the theorem, never infer an all-board OOO scalar counterexample.
