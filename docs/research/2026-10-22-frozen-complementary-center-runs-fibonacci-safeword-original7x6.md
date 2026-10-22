# Frozen: original7x6 two-level center first-win absorbers produce the Fibonacci no000/no111 language

Date: 2026-10-22 Pacific. Canonical research owner: Josh Oshiro, `iteathen/Connect4@research/semantic-quotient`. Exploratory source rule theorem candidate, NOT qualified gameplay authority, NOT an empty-root perfect-play proof. This preregistration is written BEFORE this new rank15/second-P0-window experiment. The prior rank13/14 prereg and tested P1 no-win/rank-closure are separate and preserved, including their falsified prediction of more P1 rank leakage.

## Physical source domain and action sequence

Six source-legal original7x6 rank12 32-board two-stone-peripheral ensembles, fixed anchor `a ∈ {1,2,3,5,6,7}` bottom P0/top P1, five remaining peripheral columns each in either bottom P0/top P1 or bottom P1/top P0, center c4 entirely empty. Six peripheral bottom P0 bits in physical order `y=(c1,c2,c3,c5,c6,c7)`; exactly one chosen y coordinate is fixed 1, other five vary freely, 32 legal firstwinfree ranks per anchor. All four H/V/R/F original 69 K4 windows are required; no winner after its first completion may continue.

P0 on move13 takes center c4 row1. Absorb its immediate win. P1 on move14 plays ANY peripheral original column `d≠4`, hence its stone lands on that peripheral row3. Independent earlier two-ply source theorem predicts no P1 immediate win. P0 on move15 (if game remains live) takes center c4 row2, now gravity-playable because P1 did not block it. Do not treat P1 move14 center as if center row2 remained free: the center-defensive response is a separate guarded branch, not part of this exact source sequence.

## Frozen exact algebra / predicted counts

For the P0 lower center row1 first-win event define
`L(y) = OR_(i=1..4) y_i*y_(i+1)*y_(i+2)`.
This detects at least one **111** factor in the six-bit peripheral word (not H/V/D channel multiplicity). All other orientations are physically impossible at the actual low center landing on rank13.

Every peripheral top owner is the exact complement of peripheral bottom owner. Therefore after a firstwinfree P0 center row1 and any offcenter P1 move14, the P0 center row2 first-win event equals
`U(y) = OR_(i=1..4) (1-y_i)*(1-y_(i+1))*(1-y_(i+2))`,
the appearance of a consecutive **000** in the SAME six peripheral source-owner bits. Offcenter P1 row3 does not change the existing top row2 bits, and row4+ is empty, so no competing vertical/diagonal firstwinner on P0 c4r2 is possible. Thus, for this explicitly fixed three-action schedule, the original source survivor indicator is
`S(y)=(1-L(y))*(1-U(y)) = 1[ no substring 111 AND no substring 000 in y ]`.

This is the exact SAME REGULAR LANGUAGE as the older 2026-09-14 **pure-followup derivative-word** safety subshift forbidding 000/111; the native variables DIFFER. Here y is six original bottom owner states from a guarded physically legal full-state ensemble, whereas the older d=δ(phi) is six width-path GF(2) phase differences under a response strategy. Language equality DOES NOT imply state, transition, or adversarial-policy equivalence. This program tests the common finite combinatorial constraint, not a historical strong-optimal opening.

For six unconstrained bits the number of no000/no111 words is 26 via `s_m=s_(m-1)+s_(m-2)`, `s_1=2,s_2=4`; global complementation y↦1-y bijects safe words having fixed coordinate 1 and fixed coordinate 0. Therefore **exactly 13** of the 32 configurations for EVERY fixed P0 anchor survive both P0 center attacks whenever P1 goes offcenter.

With prior independently verified P0 rank13 firstwins `(12,14,16,16,14,12)` for anchors a=(1,2,3,5,6,7), new rank15 P0 center row2 firstwinning flux MUST be `(7,5,3,3,5,7)` and after both attacks 13/32 survive for every anchor. Total P0 wins across the two controlled turns 19/32 for each anchor. These are **conditional fixed-action mass counts**, not a P0 WIN probability against a strategic P1.

## Predeclared controls / falsifiers

1. Construct all genuine original 69 K4 line windows from board geometry and independently implement four-ray winning detection. Replay all authentic 12-stone prefix histories and both subsequent true owner moves. Reject early first-wins/invalid gravity or any disagreement between literal K4 and ray detectors.
2. For EACH anchor and each of six offcenter P1 reply columns, compare physical P0 row1 firstwinning event with 111, and physical P0 row2 firstwinning event with 000 conditional on lower survival; P1 must not firstwin in between. Terminal wins must route to P0/P1 sinks exactly once, even when multiple windows complete.
3. Independently count all six-bit words avoiding both runs, verify 26 total and 13 for each fixed anchor bit1. Check true physical three-action survivor totals and `12/14/16` lower, `7/5/3` upper, 13 survivors.
4. Require the P1 center-row2 reply countercontrol to be treated differently: it blocks P0 row2 placement, so the two-level run language DOES NOT model that branch. Also preserve any P1 early counterwin if it occurs.
5. Do not identify the 13 safe words with the geometrically unrelated 13-dimensional 7x6 strand-base syzygy quotient, 13 historic last-landing cells, or terminal-line counts. They are different object types absent an explicit map. Do not identify this six-bit y language with the old actual CPC phase d semantics. No solver, historical 28 labels, rooted winning value, selected perfect principal variation or 7x6 empty winning theorem is a premise.

## Hypothesis / next step

The structural prediction is **proved by run-language reasoning if source geometry confirms the windows and first-win guards**, but its new physically validated status and any ramifications for action-indexed correlation closure must await the experiments. A useful next comparison is whether including both complementary center hazards closes a compact two-level action sector and how P1's center reply shifts its guarded response obligations; neither claim is made here.

Commit preregistration first, then independently execute exact source and physical checks, save full evidence+repro program, update current synthesis/map/index, and retain failed hypotheses from the prior two-ply test. No qualified IsoGraph or solver modifications.
