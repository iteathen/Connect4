# Geometry-sensitive correction: the 4x5 OOO sign-circulation test does NOT falsify original 7x6

**Date:** 2026-10-22 Pacific. **Owner:** `research/semantic-quotient`. **Research direction:** Josh Oshiro. **Status:** scope correction and directly enumerated geometric identities; non-authoritative exploratory research, no game-result premise. **Pre-write branch HEAD:** `ba9b10d6acd50843712a4125326fe486e31a4f91`.

## Immediate disposition — protect the original-board hypothesis

**Correction to a tentative cross-era interpretation:** The 4x5-k4 historical EW-RS-070 matched-dependency witness does show failure of a **coordinatewise cyclic sign-circulation-only** replacement for the old SIGN triangle **on that restricted discovery carrier**. It is **NOT** a falsifier of any 7x6-specific signed-exchange, OOO, causal gluing, or first-win correlation hypothesis. Do not describe this as a defeat of the original-7x6 proposed mechanism. This scope restriction was explicitly required before expanding the falsification claim.

The September EW-RS-069/070 discovery set includes `6x3-k3`, `4x5-k4`, `6x3-k4`. **Every one** has at least one dimension below five. In particular, the old `6x3-k4` has no vertical or diagonal K4 windows; `6x3-k3` changes K and has only one vertical three-cell window per column. None is a representative two-dimensional full-width original7x6 game.

## Exact original geometry, enumerated directly

For a W-column/H-row nonwrapped Connect-k board:
- horizontal windows: `H*max(W-k+1,0)`;
- vertical windows: `W*max(H-k+1,0)`;
- each diagonal orientation: `max(W-k+1,0)*max(H-k+1,0)`;
- horizontal overlapping-pair count: `H * sum_{d=1}^{min(k-1,W-k)} (W-k+1-d)` when W >= k, else zero.

| Board | Horizontal | Vertical | Rising | Falling | Total | Horizontal overlapping pairs | Maximum H windows through one cell |
|---|---:|---:|---:|---:|---:|---:|---:|
| 4x5-k4 | 5 | 8 | 2 | 2 | 17 | **0** | **1** |
| 5x4-k4 | 8 | 5 | 2 | 2 | 17 | 4 | 2 |
| 5x5-k4 | 10 | 10 | 4 | 4 | 28 | 5 | 2 |
| 7x6-k4 | 24 | 21 | 12 | 12 | 69 | **36** | **4** |
| 6x3-k4 | 9 | 0 | 0 | 0 | 9 | 9 | 3 |
| 6x3-k3 | 12 | 6 | 4 | 4 | 26 | 15 | 3 |

Thus width4 does permit exactly one H K4 per row, but **no two distinct H K4 windows overlap**, and a legal landing cannot complete two distinct horizontal windows at once. Width7 has four sliding H windows per row; adjacent-window overlaps alone number 18 across the board, and all overlapping pairs number 36. The same-direction interval-Euler cancellation structure is consequently different. Width below five is a **geometry-degeneracy guard**, not simply a smaller search domain.

## What the old local algebra actually says (scope ONLY 4x5-k4)

The prior frozen hypothesis `docs/research/2026-10-22-frozen-cross-era-sign-order-circulation-and-native-survivor-projection.md` defined, on lex-ordered descriptor token values (A,B,C):
`kappa=sgn(B-A)+sgn(C-B)+sgn(A-C)`.
It correctly equals `sgn((B-A)(C-A)(C-B))` and is zero whenever the triple has fewer than three distinct token values.

An exploratory audit joined `OOO_PRESENCE_FIBER_GEOMETRY_0_1.json` (EW-RS-064) sampled descriptor IDs to `OOO_PAIR_DELTA_COORDINATE_LADDER_0_1.json` (EW-RS-070) matched dependencies, both at historical branch `experiment/isomax-late-xor-components-20260929@f6bfce75ebf6aeafef08b9102ce20e0bfade2bdb`.

The two source generators' complete `auditCase` prefix and descriptor-ID insertion routine are byte-identical; their `repairedDecoderAudit` prefix differs only in EW-RS-064 additionally retaining a `parts` property in the per-class record **after** assigning descriptor IDs. This validates the sampled ID association for the recorded dependency tuples, not a reconstruction of the complete vertex dictionary.

Two EW-RS-070 4x5-k4 matched dependency indices `91` and `134` have:
- source signatures respectively `5:O,10:O,16:O,49:O` and `5:O,10:O,42:O,49:O`;
- historical GF(2)^2 relative scalar code **2** in each case;
- each original OOO residue consists of four triangle faces of those four descriptor vertices;
- each such triangle has **zero** coordinatewise kappa, because all token-coordinate values in those particular vertices are 0/1;
- the frozen original `SIGN` pair signature keys have nonzero GF2 parity support (4 different keys per dependency), consistent with the original signed-triangle scalar factorization.

The original EW-RS-070 4x5-k4 `SIGN` audit had rank283, zero contradictions; support-only and unsigned-magnitude alternatives had nine contradictions. The two reconstructed dependencies are **bounded evidence against replacing all original SIGN keys by kappa-only on that particular carrier**. This does NOT establish failure for the original7x6 or even all W/H>=5 carriers, and the entire original experiment is scalar Q-V T2-O rather than action-indexed Q-A/Q-F.

The original complete generator was **not rerun** in this correction. Sampled descriptor-ID joins, literal signed-pair calculations and independent geometric enumeration were checked, and the inherited historical code/gauge was not used as a 7x6 solved-game premise.

## Revised inference and mandatory validity gate

1. **Unconditional algebraic theorem:** integer descriptor gradient deltas telescope; nonlinear sign circulation may survive. Binary token coordinates have kappa0. Neither claim depends on board dimensions.
2. **Scoped finite observation:** the 4x5 old Q-V witness rules out kappa-only *as an all-boards universal formula that includes 4x5*. It says nothing decisive about 7x6-specific rules.
3. **Not admissible:** using a sub-five carrier to reject, by itself, a proposed obstruction that depends on overlapping H/V/D K4 windows, original7x6 width7 center geometry, two six-column defensive patches, 31 source syzygies, or adaptive first-win response resource gluing.
4. **Minimal geometry-preserving screen:** test structurally nondegenerate W,H >= 5, K4 in both axes before generalizing. This is necessary but not sufficient for a 7x6 theorem; require a separate authentic original7x6 guarded legal-action check.
5. **Surviving research:** old signed triangle remains scalar-exact on its declared finite carriers; the September signed descriptor deltas and October original7x6 causal C6 are still NOT connected by an explicit physical action-preserving map.
6. **Outstanding discriminator:** reconstruct full old descriptor-to-motif mapping on a geometry-valid 5x5 (or directly 7x6) legal action domain, without importing any solved outcome; if no source-derived scalar target is available, test only structural observable congruence/Koopman closure and leave scalar Q-V sufficiency UNRESOLVED.

**Epistemic boundary:** original7x6 empty-board P0 forced WIN remains unproved by this research; no IsoGraph authority promotion or historical test rewrite occurs.
