# Exact K4 width/height phase boundaries and paired-response regimes

**Date:** 2026-10-20. **Research owner:** research/semantic-quotient. **Owner's research hypothesis:** width below5 should change defensive pairing constraints at widths4 and3, and height may exhibit comparable transitions. **Status:** exact physical K4 window geometry and incidence topology, 112 source parameter controls, 8 bounded both-player adversarial vertical-pair policy tests, 4 original physical policy falsifiers, postfreeze known WDL contrast. **NOT** a total source non-search WDL formula, a solver change, or a new qualification of the accepted IsoGraph1.2 gameplay theory. Historic 28 strong-optimal terminal line IDs were never used as formula inputs.

## 1. Two different width transitions, not merely odd/even parity

For real nonperiodic K4 and positive integers W,H let
\[
x=\max(0,W-3),\qquad y=\max(0,H-3).
\]
Count all physical length4 winning windows:
\[
N_H=Hx,\qquad N_V=Wy,\qquad
N_{\nearrow}=N_{\searrow}=xy,\qquad
\boxed{N=Hx+Wy+2xy.}
\]

At fixed H>=4:
- **W5 to W4:** x falls from2 to1. There are two overlapping horizontal K4 spans at W5, sharing the middle THREE columns, but just one at W4, using ALL FOUR columns. The cross-direction incidence graph remains connected. This is a change of constraint multiplicity and shared blocking options, **not** a graph-disconnection transition.
- **W4 to W3:** x falls from1 to0. ALL horizontal and diagonal K4 windows disappear. Only physically separate vertical support chains remain; a different, complete vertical-pair strategy now becomes possible. This IS a change in constraint topology and applicable response proof class.

At fixed W>=4, H5→H4 has the analogous two→one vertical four-row span collapse. At H4→H3 ALL vertical and diagonal K4 windows disappear, leaving only horizontal K4 lines. Unlike width, this change also affects gravity release order and the parity of a column's unmatched top.

## 2. The exact original line/cell incidence component theorem

Create the bipartite graph connecting every actual physical site to every original genuine K4 winning line containing it. Ignoring separately reported physically isolated cells, the number of nontrivial components is exactly

\[
c(W,H;4)=
\begin{cases}
0,&W<4,\ H<4,\\
W,&W<4,\ H\ge4,\\
H,&W\ge4,\ H<4,\\
1,&W\ge4,\ H\ge4.
\end{cases}
\]

**Proof.** If W<4, no K4 horizontal/diagonal line can exist; when H>=4, overlapping four-row intervals connect all sites WITHIN each column but not across columns. Transpose this geometric incidence for H<4 and W>=4. If W,H>=4, overlapping consecutive horizontal intervals connect all physical sites in each row, overlapping vertical intervals connect all physical sites in each column, and these intersections connect the entire grid. If both W,H<4 no K4 line exists; all sites are isolated. This proof extends to any K>=2 after replacing 4 by K. It is a physical incidence theorem, **not** strategic decoupling of turns: two otherwise separate line components still share the alternating player clock, and horizontal-only rows still have vertically constrained gravity accessibility.

Independently regenerated physical K4 line geometry and component counts for ALL 64 W,H=1..8 parameter pairs, plus48 K3/5/6 controls. Zero discrepancies. Binary GF2 and finite-prime field F1009 incidence ranks were also measured separately; F1009 rank must NOT be asserted to equal rank over rationals without proof.

At height6:
| W | H-lines | V-lines | Both diagonals | Total | Original line/cell components | Exact empty root outcome status |
|---:|---:|---:|---:|---:|---:|---|
| 3 | 0 | 9 | 0 | 9 | 3 | DRAW from complete dual vertical-response theorem |
| 4 | 6 | 12 | 6 | 24 | 1 | DRAW in published K4 table |
| 5 | 12 | 15 | 12 | 39 | 1 | DRAW in published K4 table |
| 6 | 18 | 18 | 18 | 54 | 1 | P1 WIN in published table |
| **7** | **24** | **21** | **24** | **69** | **1** | **P0 WIN in published table** |
| 8 | 30 | 24 | 30 | 84 | 1 | P1 WIN in published table |

This is an important NEGATIVE result: the W3→4 geometrical topological change does not itself change WDL, and the W6→7→8 published P1/P0/P1 reversals happen after connectivity is already1.

## 3. Exact common-span blocking option and response-capacity counts

For any axis length n>=K, the source intersection of ALL consecutive K-site intervals is

\[
I(n,K)=\{n-K,\ldots,K-1\},\quad |I(n,K)|=\max(0,2K-n).
\]

If n<K, there are NO K-site intervals and no such blocking obligation (do not call this an empty blocker-intersection failure). An elementary disjoint-block lower bound and regularly spaced witness prove the minimal size of a GEOMETRIC hitting set for all K intervals is floor(n/K). This does NOT guarantee the defender can actually claim the cells in time under physical gravity and alternating turns.

For K4, width4/5/6/7 admits respectively 4/3/2/1 possible common blocker columns for every horizontal four-column span. Width3 has NO horizontal K4 obligation; width8 has no single common blocker and requires two geometric blockers. Thus width5→4 changes multiplicity and restores extra blocking freedom, while width4→3 removes that cross-column task entirely.

The VERTICAL-row analogue gives H4/H5/H6/H7 respectively 4/3/2/1 common ROWS among all possible vertical length4 intervals. At H8 there is no common row. For standard W7 H6 the projections yield one common column (one-based4) and two common vertical rows (one-based3,4), but this is **NOT** two universal physical cells belonging to all original winning lines. A higher row may not be legal yet, so K-span incidence counts alone do not establish a response deadline.

## 4. Actual original first-win physical policy checks

The earlier accepted source theorem for W<K, K>=3 is strategy-sufficient for an empty-root DRAW at **every height**: only vertical K-lines remain, and EITHER designated player can prevent the opponent from owning both sites of any fixed adjacent pair (rows0/1,2/3,...), using physically released upper mates. Each K>=3 vertical line contains a full fixed pair. This proves both-player nonloss, exact DRAW; not just a found drawn game.

A new independent bounded adversarial test of those already-proved fixed policies for W3 K4 H5,6,7,8, each with defender P0 and defender P1, checked **2,055 original attacker moves over 1,004 defender-turn positions**; no attacker firstwin and no illegal defender response.

Actual original-move falsifiers, with one-based column labels:
- **W4 H4 sequence 1122334:** P1 uses naive vertical same-column upper mates after the first three P0 bottom-row openings. P0 firstwins row1 horizontally on absolute move7. So width4 creates new winning requirements that a W3-complete vertical-only pairing CANNOT cover. This does NOT establish that P0 wins W4 under optimal play; published W4 H4 is DRAW.
- **W5 H4 sequence 12233445:** P0 opens column1 and then upper-mates P1. P1 claims columns2,3,4,5 bottom, firstwinning on move8. This extra right-hand K4 window does not exist at W4 and shows why W5 safe first-column setups exclude an outer edge column. Other W5 openings remain suitable for the infinite-height mate policy, and published finite W5 H4 is DRAW.
- **W4 H4 sequence 1212121:** P0 firstwins vertically in column1 on move7 while P1 mechanically mirrors in column2. At **W4 H3**, shorter prefix 121212 has no win and next P0 fourth stone in column1 is illegal. Thus a horizontal-only pairing rule sufficient to handle some H3 histories fails once H4 introduces vertical K4.

These are fixed POLICY counterexamples, not refutations of the actual published empty-board WDL results. Source machine packet:
research/isograph/discovery/2026-10-20-narrow-phase-transitions/K4_NARROW_WIDTH_DUAL_VERTICAL_POLICY_2055_ACTIONS_AND_GEOMETRY_BOUNDARY_WITNESSES_0_1.json
and reproducible checker:
research/isograph/discovery/2026-10-20-narrow-phase-transitions/independent-original-vertical-horizontal-response-policy-controls.mjs.

## 5. Height has a second, purely CAUSAL odd/even paired-response phase

After P0's first move into a middle column, the remaining cell capacities are H−1 in that column, H in others. Their exact gravity pairs J and unmatched tops U are

\[
J=\lfloor(H-1)/2\rfloor+(W-1)\lfloor H/2\rfloor,\quad
U=((H-1)\bmod2)+(W-1)(H\bmod2).
\]

For width7:
| H | Constraint type | J | U | Published K4 root outcome where available |
|---:|---|---:|---:|---|
| 3 | horizontal only, three row components | 7 | 6 | not in pinned published table |
| 4 | all orientations, connected | 13 | 1 | DRAW |
| 5 | all orientations, connected | 14 | 6 | DRAW |
| 6 | all orientations, connected | 20 | 1 | P0 WIN |
| 7 | all orientations, connected | 21 | 6 | DRAW |
| 8 | all orientations, connected | 27 | 1 | P0 WIN |

Consequently H3→4 **simultaneously** adds vertical/diagonal obligations, geometrically joins separate rows, adds paired support resources and changes the top-unmatched ownership class. H4→5 only changes multiplicities/parity, yet the full 7×5 game remains drawn. H5→6 does NOT change incidence connectivity but changes response capacity, new exact winning-line clauses and externally known WDL DRAW→P0 WIN.

The old broad 'H<4 => all DRAW by symmetrical horizontal pairs' source proof was specifically found incomplete because it neglected P0 first-turn support and unmatched columns; follow later audit. Existing stronger guarded H<4 results remain true in their domains. Width3 any height is an exact already-proved DRAW. Width4/5 H4..13 are **20/20 published DRAW** outcomes, but this sample is NOT a source proof for unrestricted H.

Source geometry with all 112 parameter checks:
research/isograph/discovery/2026-10-20-narrow-phase-transitions/K4_WIDTH3_4_5_HEIGHT3_4_5_SOURCE_DIRECTION_COUPLING_0_1.json.
External WDL joined only AFTER source freeze:
research/isograph/discovery/2026-10-20-narrow-phase-transitions/POSTFROZEN_NARROW_WIDTH_AND_HEIGHT_PUBLISHED_WDL_CHECKS_0_1.json.
Frozen hypotheses:
docs/research/2026-10-20-narrow-width-3-4-and-height-3-4-transition-frozen.md.

## 6. Source WDL theorem to pursue

The dimensional 'phase shifts' now have **typed causal roles**:
- axis interval birth/death at W/H=K,
- horizontal/vertical/diagonal four-body coupling when BOTH W,H>=K,
- selection space for common K-span blockers and the number of spatially overlapping original winning demands,
- owner-correct physically legal ONLINE response maps and finite paired capacities/deadlines under gravity (height parity changes those without any graph disconnection).

A future complete no-strategic-branching exact WDL formula must derive a **strategy-sufficient source response-compatibility transfer** across these regimes: when W grows3→4, integrate new cross-column blockers; when W grows4→5, handle overlapping transverse threats jointly; when H grows3→4, integrate causal upper-support access and vertical/diagonal deadlines. A legal response to one K4 demand may block several others, so raw Hall/matching quota and independent line-count totals alone are not game-theory proofs. The 28 historical strong-optimal terminal line identities are HELD-BACK validation, not coefficients of this transfer.

**New concrete conclusion:** W5→4 is a window-overlap/multiplicity transition; W4→3 is a genuine geometric TOPological decoupling with a verified strategy-type change. H5→4 and H4→3 are analogous at the line-incidence level but NOT strategically equivalent because gravity acts vertically. WDL itself does NOT flip at these exact boundaries in the known examples. The general source-only WDL solution remains OPEN. No solver, qualified game-authority revision, external formal proof-assistant or maintained Node26 CI was run.
