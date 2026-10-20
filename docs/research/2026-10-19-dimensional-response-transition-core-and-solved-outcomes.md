# W/H/K causal response transition: width common-kernel theorem, finite pair layers, observed WDL boundary

**Date:** 2026-10-19. **Canonical research owner:** `research/semantic-quotient`. Research direction: original owner hypothesis that varying board dimensions reveals the structural forced-response transition responsible for P0's eventual first-win on standard7x6K4 and the externally known 28 strong-optimal first-winning-line identities. **Qualification:** exact structural/one-fixed-response source theorem plus 171 internal physical/geometric controls, 90 independently derived K4 source geometry signatures, and a strictly separate 52-cell externally solved label overlay. **NOT** a total source-only dimension-to-WDL law or universal forced zugzwang proof. Original finite gameplay always uses gravity, alternation, and FIRST-WIN absorption; K5/K6 are *dimension-geometry theorem falsifiers only*, no generalized-K value claims.

## 1. Governing WDL truth — no new empty-root source formula

Published Christophe Steininger and John Tromp K4 empty-board outcomes vary sharply:
```
H=4: W6 P1 WIN, W7 DRAW,   W8 P1 WIN
H=5: W6 DRAW,   W7 DRAW,   W8 P0 WIN
H=6: W6 P1 WIN, W7 P0 WIN, W8 P1 WIN
H=7: W6 P0 WIN, W7 DRAW,   W8 P0 WIN
H=8: W6 P1 WIN, W7 P0 WIN, W8 P1 WIN
```
These are externally solved WDL facts; they do not derive from a formula here. Source exact value certificates remain confined to earlier guarded families (K1/K2, W<K, H=1, some H<K and WH even); a wider K4 regular empty-root source proof is still OPEN. Allis's existing even-H K4 `W<=6` P1 response theorem proves `V_empty<=0`, not whether P1 WINS versus DRAW. More recent source rank39 `Z_n=1` is a genuine local P0 forced win in at most the next P1/P0 pair but does not prove the empty root enters that class.

## 2. NEW linked structural result: two independently discovered width operators denote the SAME set

For K>=4 and W>=K let (mathcal I_{W,K}) be the intersection of ALL length-K consecutive-column intervals. Elementary interval algebra gives
[
mathcal I_{W,K}={c:W-Kle cle K-1}, quad
C_{W,K}=|mathcal I_{W,K}|=max(0,2K-W).
]
We recovered the K4 pure-followup one-move safe opening set from earlier CPC research, and the common-span gate from the older Allis response theorem, then proved their **explicit set equality** within the precise fixed policy below. This is more informative than noting equal numbers.

Infinite-height fixed `P0` follower: P0 opens the bottom of chosen column c, and after every P1 drop P0 responds in the SAME COLUMN immediately ABOVE. For any K>=4, P1 cannot complete ANY original K-line under this policy **iff** `c∈I(W,K)`. For c∈I, P1 occupies even rows in outer columns, odd rows in opened column; all vertical P1 runs are separated, all K-horizontal windows cross the oppositely phased opened column, and K-diagonals include two neighboring outer sites with opposite row parity. If c∉I, P1 may claim K bottom-row cells in some K-column interval excluding c, with P0 forced to take the K-1 previously released upper mates; P1 firstwins bottom on its Kth move before P0 can complete the K upper row. Thus this exact fixed-policy safe opening set is *identical* to the static K-span intersection:
[
oxed{mathcal S_{m fixed mate}(W,K)=mathcal I_{W,K}quad (Wge Kge4).}
]
Verified independently by actual finite original window/owner enumeration for K4,5,6 over 171 individual opening-column cases, 46 inside the kernel and 125 outside; all 125 outer cases have constructed legal gravity first-winning attacker counterexamples. Zero deviations. K3 guard is ESSENTIAL: at W5,K3 the center is in the static intersection but a genuine P1 winning diagonal follows literal sequence `3,2,2,3,3,4,4,4` one-based. None of these data prove finite-height P0 WDL because an ABOVE reply may become UNAVAILABLE near the top.

K4 exact width structure:
```
W=6  I={2,3}  TWO common centers    -- P1 Allis two-center defense can apply (even H)
W=7  I={3}    ONE common center    -- P0 pure-followup initial safety is unique
W=8  I={}     ZERO common centers -- P0 one-setup fixed follower fails
```
(Zero-based columns.) Allis's bounded even-H P1 strategy REQUIRES TWO common centers, so it is no longer applicable at W7. **Strategy-interface failure is NOT game-theoretic impossibility of all P1 defenses**; W8 even-H P1 wins in published labels despite having no common center.

## 3. Exact height phase coupling across original pair resources

For a real finite H after P0 opens center c:
[
J_1=lfloor(H-1)/2floor+(W-1)lfloor H/2floor,quad
U_1=((H-1)mod2)+(W-1)(Hmod2).
]
Here `J` counts still-existing consecutive future gravity pairs and `U` unmatched column tops, with `WH-1=2J_1+U_1`. At a HYPOTHETICAL but physically legal no-firstwin consecutive H−1 center-column stacked prefix, still one center site remains and all outer columns are vacant:
[
oxed{J_{m gate}=(W-1)lfloor H/2floor,quad
U_{m gate}=1+(W-1)(Hmod2).}
]
Thus H EVEN yields **one** unmatched center top and P1 to move; H ODD yields **W** unmatched column tops and P0 to move. This is exact finite original geometry, independent of any external winning label; the center-stacked path is NOT proved strategically forced on boards besides historical strong7x6.

At even H, P0 has occupied H/2 alternating center rows under that conditional center stack. For K4, each such row can anchor exactly `W-K+1` horizontal *three-missing original winning lines* only if c lies in the common kernel. Additional diagonal center lines create further original owner correlations. At W7 the distinction is:

| Original board | Conditional center-gate pair count (J,U) | P0 central horizontal 3-missing line anchors | Actual full K4 windows | External empty WDL |
|---|---|---|---|---|
| 7×4 | (12,1) | 8 | 31 | DRAW |
| 7×5 | (12,7) | 8 | 50 | DRAW |
| **7×6** | **(18,1)** | **12** | **69** | **P0 WIN** |
| 7×7 | (18,7) | 12 | 88 | DRAW |
| 7×8 | (24,1) | 16 | 107 | P0 WIN |

For the **height +2** extension at W,H>=K, the original four direction line counts change by
[
Delta_H=2(W-K+1),quad Delta_V=2W,quad
Delta_{
earrow}+Delta_{searrow}=4(W-K+1).
]
At K4,W7, H4→H6 adds 8 horizontal +14 vertical +16 diagonal = **38** original K4 windows. Yet center-gate `U=1` remains unchanged. Hence simply knowing top parity or unmatched count cannot explain DRAW→P0 WIN; one must track the NEW three-/two-/one-missing owner obligations, their correct response deadlines, and the extra paired-resource layer. The conjecture that three center-anchor rungs `H/2=K-1=3` is the first capable K4 transition is OPEN.

## 4. Frozen-first comparison to solved outcomes and decisive counterexamples

Source computed W4..12/H4..13 K4 original winning-line and pair fingerprints for all **90** dimensions WITHOUT reading solved values. THEN joined only the **52 externally published** exact root WDL labels, leaving 38 source-blank unknown. Source gate `C>=2,H even` (Allis existing theorem) has 15 known rows, no published P0 win counterexample: 10 DRAW, 5 P1 WIN. Source `C=1,H even,H/2>=3` covers reported 7×6,7×8,7×10, all P0 WIN, but the same `C=1,H even` at 7×4 is DRAW. This is a small **posthoc descriptive pattern**, not an accepted formula or extrapolation to unknown dimensions.

Crucial falsifiers:
- **C alone insufficient:** H6 K4 W8 and W9 have C0 and P1 WIN; W10 H6 ALSO C0 yet P0 WIN. The proposed C=1 condition is not necessary to P0 win.
- **height/pair parity alone insufficient:** W7 H4 and H6 have same C1, even H and `U_gate=1` but DIFFERENT outcomes. Additional pair depth/lines matter, but they are not yet a proven forcing cause.
- **even/odd dimensions alone insufficient:** W6/7/8 at H6 are P1/P0/P1 respectively.
- **strategy guards not value:** W6 even-H P1 no-P0-win does not itself prove whether P1 can WIN; an observation of historical rank39 paired-release P0 wins at W7H6 does not derive all-root forced progression or 28 remoteness-selected line identities.
- **W10 H4→H6** changes P1 WIN→P0 WIN despite C0 at both, so a true GENERAL dimension-to-WDL formula must cover further response mechanisms outside the width7 critical common kernel.

Exact machine/runner evidence:
- `docs/research/2026-10-19-dimension-pairing-causal-transition-frozen.md` (pre-falsification design);
- `research/isograph/discovery/2026-10-19-dimension-response-transition/derive-dimension-safekernel-fingerprint.mjs` (source-only Node reproduction, committed, maintained Node26 CI not run);
- `research/isograph/discovery/2026-10-19-dimension-response-transition/SOURCE_WHK_PAIR_KERNEL_FINGERPRINT_0_1.json` (90 source-only original geometry rows);
- `research/isograph/discovery/2026-10-19-dimension-response-transition/COMMON_K_COLUMN_SAFE_FOLLOWUP_INFINITE_AND_FINITE_NEGATIVES_0_1.json` (171 K4/5/6 opener controls and K3 guard falsifier);
- `research/isograph/discovery/2026-10-19-dimension-response-transition/POSTFROZEN_52_K4_WDL_TRANSITION_CONTROLS_0_1.json` (52 published labels AFTER source freeze).
External pinned label provenance Steininger commit `fa27f186d2f1bf8e8fd61bfad63454c6e4b0431c`, cross-check Tromp table. No full actual opponent-strategy search was performed in the source producer.

## 5. The exact next missing game-value law: guarded defender-response compatibility

**Dimension dependence is necessary but not a sufficient WDL classifier.** The original W7,H6,K4 board permits an explicitly verified legal cooperative 42-move full DRAW history even though P0 can FORCE WIN under perfect play. Thus physical geometry cannot compel the losing pattern under *every possible* game history. The precise claim to prove is: from one P0 source-selected opening, for **every** P1 adaptive legal action, P0 possesses a source-certified response that maintains a winning invariant or reaches an earlier original FIRST WIN. Do not infer from no-pass that skipping a turn would change the exact outcome; the observed rank39 pattern is a **compulsory-move exposure**.

Suggested algebraic theorem target:

1. Build the FULL all-69-line owner-tagged residual object with original K4 four-body terms, current gravity heights h, live pair capacities j/u, and H/V/rising/falling diagonal/gluing. A source contract is more than a phase word: it must contain physical release guards, owner-correct blockers, terminal firstwin order, and response-resource conflicts/deadlines.
2. Treat a defender policy as a **guarded response relation** `R(q,a,b)` after observing an opponent action a and requiring a legal source-certified reply b (or earlier P0 win). Use a direct symbolic closure/certificate, not an enumerated future strategy tree. A merely sufficient matching with a missing common blocker at 27 of 35 canonical gates is allowed to return INCOMPLETE; it must not be interpreted as impossibility of all possible nonmatching defenses.
3. At `W=2K-2` (K4 W6), instantiate the proven P1 TWO-center split-and-mate safety contract. At `W=2K-1` (K4 W7), it loses a necessary common center and P0's one-setup follower safety kernel becomes UNIQUE. Analyze which additional center-anchored horizontal and diagonal residual obligations and paired-resource deadlines at even H violate all P1 contracts **without assuming** the historic 44444 strong-optimal center chain was forced.
4. Compare SAME original-game source candidate on the critical exact WDL contrasts W6H6 P1 WIN, W7H4 DRAW, W7H6 P0 WIN, W8H6 P1 WIN, plus W10H6 P0 WIN (C0). A general formula may have multiple structurally identified outcome regions rather than one scalar C threshold. Hold all external WDL values back until each source theorem/selector is frozen; no labels can supply its guard.
5. To connect to earlier causal Fourier research, let the two-owner rank-step transfer include the previously checked P1 source/sink pair `Delta s0=-sigma e_x+lambda e_y` and P0's owner cofactor promotion of degree2→degree1 live lines. Search for an invariant cone `I_n(W,H,K)` under alternating universally/exists certified action quantifiers, with successful terminal discharge either earlier P0 win or `Z_n=1`. The norm of Fourier difference is not the invariant itself: the accepted full draw can have the same raw pair budget without P0 force.
6. Distinguish exact scalar empty-board WDL `V_empty(W,H,K)` from all-q WDL `V(q)` and Level3 strong-optimal firstwinning-line identities. Even a sound 7x6 source proof of P0 WIN would not alone recover the historically **28** maximal-delay first-terminal K4 labels; a separate source-optimal remoteness/selection theorem is required.

**Strongest achieved step in this cycle:** an exact common-column/online fixed-pairing identity, a precisely typed original finite-height paired-resource transition, and independent K4 published WDL counterexamples demonstrating what no naive scalar parameter classifier can do. **Missing:** a general strategy-sufficient first-win guarded response law producing WDL at the ordinary empty root. Maintain `INCOMPLETE` until that is proved. No qualified IsoGraph game-theory 1.2 or production solver mutation.
