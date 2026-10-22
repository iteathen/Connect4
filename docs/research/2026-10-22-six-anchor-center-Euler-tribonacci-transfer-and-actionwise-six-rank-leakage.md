# Original 7x6 six-anchor source field: center Euler hazard as three-run transfer, constant +6 actionwise rank and fifth-order leakage

**Date:** 2026-10-22 Pacific. **Research branch:** \`iteathen/Connect4@research/semantic-quotient\`. **Guard:** six source-legal firstwinner-free 32-state rank12 faces, fixed support \`[2,2,2,0,2,2,2]\`, P0 to move. **Status:** exact geometry/Boolean-transfer derivation plus full finite guarded rational-rank controls; NO newly qualified IsoGraph1.2 authority and NO independent empty-root P0 winning proof.

Frozen prospectively at \`docs/research/2026-10-21-frozen-six-anchor-original7x6-multi-ensemble-action-kernel-survey.md\`. The c7 case was already known and is an intentional held-in reproducibility control; other anchors have no previously accepted numerical rank premises. No historical solved outcomes, terminal28 IDs or optimal opening were used.

## 1. Six legal source ensembles, seven separately examined actions

Use all actual 69 open H24/V21/R12/F12 source windows. Every physical column other than c4 has two stones; c4 is empty. For a selected anchor \`a ∈ {1,2,3,5,6,7}\`, fix c_a bottom P0/top P1. For each of the other five columns, a binary bit chooses bottom P1/top P0 or bottom P0/top P1. Construct one genuine alternating history per assignment: anchor P0; both stones of each early-phase column; anchor P1; both stones of each late-phase column. All 6×32=192 constructed rank12 histories satisfy gravity, P0/P1 alternation, and no earlier firstwin, independently checked with a directional-ray evaluator and the 69 true geometric windows. Six anchored ensembles overlap as physical state sets; the count192 is of *constructions across the six guarded ensembles*, not a claim of 192 unique boards.

For every anchor compute the entire current native feature family F:
- all complete ternary ownership-pattern indicators on every one of the 69 original K4 windows (hence all full individual K4 grades/blocked patterns);
- every one of 438 gravity-frontier Euler directional-hazard subset indicators for each of P0 and P1, 876 labelled slots total.

For every genuine current P0 legal column c individually, apply actual gravity/owner placement; send firstwinning mass to a sink, with no postwin continuation; pull back *every* child-native K4 and Euler observable to the fixed 32-board source face. Use rational rank over Q on each 32-state evaluation matrix. Modular GF(1009), GF(10007) checks agree. This is NOT the uniform sum of action operators.

## 2. New exact six-column H interval/finite-transfer identity

Write the SIX bottom-row P0 ownership bits away from the still-empty center column c4 as
\`y=(x_1,x_2,x_3,x_5,x_6,x_7)∈{0,1}^6\`.
The anchor fixes exactly one of these y bits to 1. Actual P0 c4r1 placement firstwins iff at least one of the FOUR actual horizontal K4 windows through c4 is completed:

\`A_i=y_i*y_(i+1)*y_(i+2), i=1,2,3,4\`, so
\`W_center = A_1 OR A_2 OR A_3 OR A_4.\`

Thus P0 FIRSTWIN on this source face is exactly **the appearance of substring 111 in the six-bit peripheral-owner word**. Not one other orientation can firstwin on c4: the input has no stones above row2, and c4 lands at row1. If P0 instead plays any other column, its stone lands at row3, also unable to complete an original H/V/R/F K4 on the face. This explains why c4 is the unique TERMINAL-EMISSION action among the seven, but says NOTHING about its strategic optimality from the empty game.

The simultaneously active start indices A_i form one interval, so the exact previously established Euler identity gives

\`W_center = Σ_(i=1)^4 A_i − Σ_(i=1)^3 A_i*A_(i+1).\`

Every A_i is physical owner-degree3; its adjacent overlap product has four distinct peripheral owner sites, hence W_center has multilinear degree≤4 in the six y variables. Fixing any one y anchor leaves five variable bits and cannot increase degree. Therefore the equal-mass EVEN/ODD five-switch parity fields have **identical actual winning-history flux for every anchor** by orthogonality of the degree5 parity character to all degree≤4 monomials.

A separate STATIC finite-state count makes the flux exact without enumerating 32 boards for each anchor. The language of six-bit words with no 111 is recognized by run lengths 0,1,2, using column-vector transfer

\`T=[[1,1,1],[1,0,0],[0,1,0]]\`
and the constrained append-one operator
\`E1=[[0,0,0],[1,0,0],[0,1,0]]\`.

For anchor at peripheral position j (j=1,...,6), the number of safe words among the 32 with y_j=1 is

\`S_j=(1,1,1) T^(6−j) E1 T^(j−1) (1,0,0)^T.\`

Direct multiplication or a complete six-bit Boolean count gives
\`S=(20,18,16,16,18,20)\`;
therefore actual original c4 firstwinning totals \`32−S=(12,14,16,16,14,12)\`.
Their EVEN and ODD halves are respectively \`(6,7,8,8,7,6)\`. Original overlapping K4-window INCIDENCES are more numerous than firstwinning transitions; counting raw line hits rather than the Boolean OR is invalid.

This one-sided **no-111** transfer is distinct from the old September pure-followup safe-phase derivative-word automaton forbidding BOTH 000 and111 (which gives Fibonacci counts). Both are exact finite-range subshift/automaton presentations of four-in-a-row constraints, but on DIFFERENT source variables, under DIFFERENT legal-response guards. Do not equate them as strategic theorem premises.

## 3. All six guarded native ranks: six additional directions under exactly one action

| Fixed peripheral column a | F input rank over Q | F plus actual P0 c4 pullback rank | Increase | Firstwinning sink E/O | Raw original K4 incidences E/O |
|---|---:|---:|---:|---:|---:|
| 1 or 7 | 18 | 24 | **6** | 6/6 | 10/10 |
| 2 or 6 | 16 | 22 | **6** | 7/7 | 12/12 |
| 3 or 5 | 13 | 19 | **6** | 8/8 | 14/14 |

For ALL other c in {1,2,3,5,6,7}, rank(F + pullback_child_native)=rank(F), and firstwinning sink mass is zero on both parity fields. Each of the six anchored center tests generates at least one child original-K4 owner-pattern observable with a **nonzero fifth-order five-switch parity coefficient**: full physical owner-monomial rank≤4 is 31 on that face, and adjoining the child-native field reaches rank32. So the input exact degree≤4 owner moments plus a single such action-absorbed child feature span *all* functions on that particular 32-state face. This is a precise local lower bound on a particular LINEAR moment representation, not a universal compactness impossibility.

An independent orientation-filtered exact V8 source test found that child **horizontal K4 patterns alone** already account for all six additional directions at every anchor. One must retain all genuine overlapping horizontal windows to obtain this result. There is no forced need for a simultaneous H/V/D orientation triple on this face.

A second separately developed Python reconstruction regenerated all 69 windows and current legal firstwinfree positions, checked ray/window agreement, recomputed every one of the 876 Euler feature masks, and calculated the exact rational and modular rank for all 42 separate anchored action cases. It reproduced all anchor/action ranks and sink counts. Reflection a↔8−a and action c↔8−c preserves the entire recorded rank/terminal/high-order profile.

## 4. Cross-era synthesis and remaining mathematical gap

This result consolidates two distinct observations:
- September EW-RS-061/070: an OLD OOO *descriptor-oddness* cubic scalar remainder survives in a horizontal-only board; signed pair-exchange **direction** is load-bearing on a bounded late-game scalar corpus, while orientation H/V/D is not a universal explanation. The old three exact pair deltas among three descriptor vertices sum around their triangle, so only two exact additive differences are independent; nonlinear sign quotients do not preserve that linear relation.
- October original7x6: a source physical signed-gate triple \`u,b,d\` can have all singleton/pairwise distributions equal while its triple differs, and a firstwinning absorber can promote that triadic nonlinear dependency into physical owner degree5. SIX independent native linear directions appear under center absorption in each anchor ensemble; the full linear dimension is not equal to the number of compound gate factors.

**Exact common language:** kernel invariance under each guarded action and a nonlinear signed/capacity-dependent interaction. **Not proved:** an isomorphism between September's signed descriptor exchange triangle and October's source signed slacks; a universal six-direction dynamic rank law; a small closed global field; an adversarial invariant forcing P0 victory. The old Q-V scalar fit on restricted games does not grant action-indexed closure or arbitrary 7x6 P0-exists/P1-forall game semantics.

**Next exact structural test:** Starting from the six new c4-generated native directions, apply EACH legal P1 response operator on the actual surviving fields and test whether the enlarged input space is closed at TWO successive plies. This explicitly tests the history-sensitive *alternating* coupling before selecting a global robust-invariant candidate. Freeze the expected dimensions and falsifiers before running it. Avoid constructing full minimax successor trees as a substitute.

## Evidence and authority scope

- Frozen anchor preregistration: \`docs/research/2026-10-21-frozen-six-anchor-original7x6-multi-ensemble-action-kernel-survey.md\`.
- Actual independently executed Q/GF and geometry checks: \`research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/verify-six-anchor-original7x6-K4-Euler-action-kernel-independent.py\` (Python logical equivalent executed locally; exact committed bytes not separately downloaded/rerun); the independent V8 checker used integer fraction-free rank plus GF1009/GF10007 and geometric/ray checks.
- Machine summary: \`research/isograph/discovery/2026-10-21-global-gravity-Z3-transfer/ORIGINAL7X6_SIX_ANCHOR_SEVEN_ACTION_EULER_K4_RANK_PLUS6_0_1.json\`.
- Cross-era antecedent synthesis: \`docs/research/2026-10-21-cross-era-OOO-signed-slack-kernel-invariance-and-seven-action-rank-synthesis.md\`.

No maintained Node26 CI or external mechanized proof assistant was run. No qualified IsoGraph1.2, production solver, historical terminal-line fixture or specification changed. The original7x6 empty-root perfect-play P0WIN proof remains **OPEN**.
