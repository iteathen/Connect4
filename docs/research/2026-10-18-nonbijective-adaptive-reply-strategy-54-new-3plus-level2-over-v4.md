# Non-bijective opponent-reply simulation breaks the ≥3-legal Level2 source-only barrier: 54 new real 7×6 best-action states over V4

**Date 2026-10-18. Canonical research owner `research/semantic-quotient`. Status: mathematically proved SOURCE sufficient weak-order theorem, FROZEN before physical WDL, then internally verified on true original 7×6; no gameplay theory 1.2 authority promotion, solver branch/main merge, maintained Node26 CI or external proof-assistant qualification. Universal zero-strategic-branching Level2 arbitrary-q remains OPEN, and canonical original `44444` remains INCOMPLETE.**

## 1. The governing research gate and the actual new theorem

Earlier strategy-congruence campaign `docs/research/2026-10-18-strategy-congruence-bounded-campaign-11-new-level2-over-v4.md` certified 11 novel best original q over immutable V4 but ALL had only TWO legal first actions, all late and P0 to move. The explicit next gate was **at least one NEW ordinary best-move source certificate with THREE OR MORE current legal literal columns**, ideally both mover parities, with ZERO separately evaluated strategic future-game WDL values. Expanding the fixed-colored future word/first-terminal bitset was NOT acceptable evidence of a new best action.

New exact SOURCE theorem frozen first at `docs/research/2026-10-18-nonbijective-one-round-reply-simulation-strategy-order.md` and implemented at `research/isograph/discovery/2026-10-18-strategy-congruence/standard7x6-source-nonbijective-reply-WDL-order.mjs`.

For current genuine original q=(h,R0,R1), and two nonwinning original first actions a,b, consider future opponent reply sets L_a and L_b. Let `E(r,s)` be a SOURCE original-generator inclusion/first-terminal certificate that the unrestricted TWO-PLY continuation values (not evaluated in source) obey `V(a,r)≤V(b,s)` in P0-relative WDL order.

**Quantifier-direction theorem, necessary for soundness of this sufficient proof rule:**

    Current mover P0:    [∀ s∈L_b ∃ r∈L_a E(r,s)] ⇒ J_a(q)≤J_b(q).
    Current mover P1:    [∀ r∈L_a ∃ s∈L_b E(r,s)] ⇒ J_a(q)≤J_b(q).

This follows exactly from `J_a=min_r V(a,r)` for P0 root mover / P1 opponent, and `J_a=max_r V(a,r)` for P1 root mover / P0 opponent. The nonbijective relation need NOT transport every opponent reply one-to-one; it covers the adversarially relevant side using ANY source-proven related reply. Never silently invert these quantifiers.

**What proves `E(r,s)` without game values:** First, direct ORIGINAL source R_o singleton first-winner guards imply safe -1/+1 value intervals; many comparisons require no follow-up state. Otherwise, provided the two opposite hypothetical TWO-EVENT literal supports have identical COLUMN HEIGHT MULTISETS, construct precisely ONE deterministic post-two whole-column map π: reflection if it maps heights, otherwise fixed first-action transposition if it maps heights, otherwise stable original-column-ordinal matching within equal post-two height classes. If their height multisets differ, source E unknown. Compute original two-event RAW own contraction / enemy blocker deletion **inline directly from current R0/R1** (never materialize q_ar/q_bs or recursively evaluate J/V); require `∀G∈F0(ar)∃H∈F0(bs):H⊆πG`, and reverse P1 favorable upset `∀H∈F1(bs)∃G∈F1(ar):G⊆π^{-1}H`. The frozen full-future same-support monotone-upset theorem gives `V(ar)≤V(bs)` for all possible later adversarial play, including first-win stopping. Because π is a future gravity action-alphabet transport (column heights match after two placements), geometric shape itself need not be preserved when the explicit source mask generator inclusions hold.

Per current root ordered action pair a,b the SOURCE calculates a W×W finite opponent reply relation E and reduces it to the correct `∀∃` bitmask coverage. It independently evaluates **ZERO** future game WDL values or entire q successors and searches **ZERO** opponent policies. It DOES inspect static reply pairs (source original supporter-height vectors for two hypothetical moves and finite source generator subset comparisons). This is *not* a proof that every kind of finite combinatorial branching is eliminated, and not an all-q total best-action formula. Weak `J_a≤J_b` edge direction is P0-relative; on mover P0 an upper extremum is source-optimal, on mover P1 a lower extremum is source-optimal. The SOURCE certifies ONE valid best action when its weak root action-edge transitive closure spans all original legal labels. Failing an inclusion yields INCOMPLETE, not a strict opposite order.

## 2. Frozen SOURCE screen before reference values

Source input generator `research/isograph/discovery/2026-10-18-strategy-congruence/standard7x6-source-nonbijective-3plus-frozen-preoracle-corpus.mjs`, seeded 20261018, 2,400 maximum trajectories, original q ranks29..38, legal original root columns at least3, maximum 7,000 inspected q observations. Genuine first-win-free original colored physical histories and antichain R0/R1 are derived from all **69 TRUE W7H6K4 winning windows**; neither physical recursive minimax nor immutable V4 source is invoked in the screen.

- 975 first-win-free game trajectories provided **7,000** original q observations: 3,274 P0 roots, 3,726 P1 roots; legal-column breakdown 2,325 three, 2,441 four, 2,234 five-or-more.
- The new source found 39,620 positive weak WDL action-order edges across 5,632 root observations. **36,470** of those edge instances were not proved by the preceding single-FIXED-involution, **BIJECTIVE** fused-reply source on the same q observations; this is SOURCE-only comparison, NOT physical validation of 36,470 edges or a global qualification count.
- The new source selected an original best action at 1,238 q observations; 1,235 of them were absent from preceding fused-reply source. This was the provisional SOURCE-only screen and NOT an assertion that 1,235 were NEW over immutable V4 or independently physically verified.
- The frozen original code first failed to parse due to three unquoted numeric-leading JS stats fields. That **HARNESS-only** failure was preserved at `STANDARD7X6_NONBIJECTIVE_FIRST_CORPUS_RUNNER_SYNTAX_FAILURE_0_1.json`; only the three property names were quoted and the SAME input parameters rerun. A separate attempt to publish the large source packet hit a GitHub HTTP/2 transfer error; to preserve pre-oracle independence, a compact reproducible deterministic 58-case source-only sample was committed before any physical WDL/V4 query.

Source-only frozen subset: `research/isograph/discovery/2026-10-18-strategy-congruence/STANDARD7X6_NONBIJECTIVE_3PLUS_COMPACT_PREORACLE_7000_SAMPLED_RESULTS_0_1.json`, containing **58 selected genuine roots**, 29 each mover, chosen as the first nine late source-positive for each (mover, legal-count=3/4/5+) group plus the predeclared rank34 counterexample and a few latest-rank candidates, deduplicated by literal source history. Those 58 are **58 DISTINCT orientation-sensitive original q identities**, later reconstructed independently from physical occupancy. Source-only selection did not consult V4 or physical WDL.

Root-history edge and selected action map were frozen in the preoracle packet, not fitted to later game-value labels.

## 3. Independent original physical WDL and SAME-q historical V4 comparison

Independently authored ORIGINAL 7×6×4 physical colored-grid minimax `research/isograph/discovery/2026-10-18-strategy-congruence/standard7x6-nonbijective-3plus-independent-physical-v4-control.mjs` checks 69 actual original K4 windows, first-win stopping at every placement, strict gravity, and EVERY original current legal action's unrestricted exact scalar WDL. This oracle is allowed to recurse/branch **ONLY as an independent falsifier after source packet freeze**.

Historical old source V4 loaded unchanged from `research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-unified-v4-dependency-execution-bundle-20261018.mjs` plus its pinned fixed two-column swap factory, with finite frozen source proof-work caps. Physical and V4 evaluated the SAME original q reconstructed from the frozen preoracle history. Complete machine record:

`research/isograph/discovery/2026-10-18-strategy-congruence/STANDARD7X6_NONBIJECTIVE_3PLUS_58_ORIGINAL_PHYSICAL_AND_V4_RESULTS_0_1.json`.

**RESULT: 58/58 source best moves physically BEST, and ALL 651/651 frozen source weak order edges physically correct. 54/58 on the same distinct q where immutable V4 was INCOMPLETE.** Zero root minimax budget failures, source false WDL inequalities, source wrong best moves, V4 reference errors.

The **54** genuinely additional same-q source-best-root certificates (NOT general arbitrary original q coverage) break down:

| Dimension | Verified additional q |
|---|---:|
| P0 to move | 28 |
| P1 to move | 26 |
| Exactly 3 original current legal columns | 21 |
| Exactly 4 legal | 17 |
| 5 or more legal | 16 |
| Selected action UNIQUELY optimal under independent physical WDL | **13** (8 P0, 5 P1) |
| All legal actions TIED under independent physical WDL | 41 |
| Source direct weak edge proof contains ≥1 NONTERMINAL same-support original generator simulation | 23 |
| Source proof uses only opponent-immediate-terminal value bounds | 31 |

Physical mover-relative root outcome distribution among these 54: for P0 roots, **2 WIN, 6 DRAW, 20 LOSS**; for P1 roots, **2 WIN, 3 DRAW, 21 LOSS**. A source output of best action on an unavoidable-LOSS root is still a valid operational Level2 optimal continuation, not proof the mover can win. SOURCE never knew or requested the numeric WDL tier; the physical labels are POST-FROZEN independent falsification.

## 3a. V4 INCOMPLETE was structural, not a resource cap

A separate read-only same-q replication of unchanged V4 under the PREDECLARED comparator resource envelope `orderOptions={maxOperations:180000,maxMs:750,maxRepresentatives:10000}` found that **ALL 54 original V4 INCOMPLETE results** were precisely `NO_SOURCE_PROVED_ROOT_CURRENT_MOVER_GLOBAL_WDL_EXTREMAL_ORBIT`, with ZERO time, static operation or representative-count budget exhaustion. Source V2 reported `NO_UNIVERSALLY_APPLICABLE_SOURCE_BEST_ACTION_THEOREM` on all 54. Historical V4 had constructed 451 static column permutation witnesses total (max 120 on one root) but lacked a proved global current action-label extremum in these positions.

Durable matched audit: `research/isograph/discovery/2026-10-18-strategy-congruence/STANDARD7X6_NONBIJECTIVE_54_V4_INCOMPLETE_NOT_RESOURCE_BUDGET_AUDIT_0_1.json`. Consequently the new 54-source-best increase is not simply a consequence of V4 being starved of resources; it is new **SOURCE proof coverage**, still under a bounded nonuniform control corpus and pending independent external qualification.

## 4. Counterexample repaired and new strict witnesses

The old physically counterexample to promoting static equal four-move endpoints into strategic equality is now a NEW positive source strategy WDL best-action witness:
- Genuine original legal history `2532541156412471331416356736376672`, n34, P0 mover; legal **{2,4,5,7}**, original R0=4/R1=3.
- Frozen SOURCE theorem selects **original literal column 5** through nonbijective full reply coverage; independent physical ordinary WDL `J2=-1,J4=-1,J5=0,J7=-1`. Unique best DRAW versus three LOSS choices.
- Historic V4 source returns INCOMPLETE on the same q. The fixed four-ply equal-endpoint sequences `2457↔5724` still show that static history equivalence alone is not sufficient; the NEW proof instead transports opposing replies in the correct quantifier orientation.

Additional strict P0 examples:
- History `11367147416672536667432334324427`, n32, legal {1,2,5,7}; source selects col1 **WIN**, all three rivals **LOSS**; V4 INCOMPLETE.
- History `63373726573342663551126155527744`, n32, legal {1,2,4,6,7}; source selects col2 **WIN**, every rival **LOSS**; V4 INCOMPLETE.

For P1, strict new best (P1 minimizes P0-relative value):
- History `227265274113625631757767341443443`, n33, legal {1,2,3,5,6}; SOURCE selects **col5 P1 WIN** (`J5=-1`), while all 4 rivals are **P1 LOSS** (`J1=J2=J3=J6=+1`); unchanged V4 INCOMPLETE.
- History `655547727634343146271613124141657`, n33, legal {2,3,5,6,7}; SOURCE selects **col5 DRAW** (`J5=0`), others **P1 LOSS** (J=+1); V4 INCOMPLETE.
- History `633624232334665664524737244117725`, n33, legal {1,5,7}; SOURCE col5 P1 WIN J5=-1 vs J1=J7=+1; V4 INCOMPLETE.

These witnesses satisfy the owner's explicit **NEW ≥3 ORIGINAL LEGAL LABELS** stage gate, including both mover parities, and show a mathematically significant gap versus prior fixed-root involution source transport.

**Canonical `44444` is NOT SOLVED:** despite 7 legal literal columns, nonbijective current source produced reflection equality-direction edges {1↔7,2↔6,3↔5} but no cross-class extremum; q ordinary scalar WDL and one source-certified BEST original action remain UNKNOWN/INCOMPLETE. No false canonical best move is inferred.

## 5. Honest mathematical boundary / next limited research

This SOURCE method is **nonuniform opponent-reply simulation at the single root action level**, not a true two-game bisimulation/isomorphism: π can vary over (r,s) pairs, and sufficient order is only **weak scalar first-action WDL**, not preservation of full strategy identities nor all tied-best labels. The individual fixed post-two-ply π is deterministic, height support-preserving and checked by original RAW generator subset dominance. This is an exact one-round alternating MIN/MAX source abstraction with rigorous full-future monotonicity, not the geometric perfect-play law sought for ALL q.

The direct source loops over up to W² root (r,s) reply pairs and source generator masks; that is real finite algebraic proof work and may represent a nontrivial static relation matrix, though it never independently values or recursively explores successor games. **Do not call it elimination of all possible combinatorial branching** in the user’s stronger total ideal. Neither word shuffles nor future game value trees are evaluated in SOURCE.

The frozen 7,000 sampled q results are NONUNIFORM late ranks 29–38; 58 pre-registered same-q physical tests are encouraging internal evidence but not formal exhaustive qualification. The user-directed target of ONE new Level2 best action with ≥3 legal columns has been met. A subsequent arbitrary-board source theorem will need to eliminate the dependence on selecting/covering individual opponent reply relational pairs (and remove fixed post-two-ply height-support/isomorphism restrictions), ideally producing an unconditional rank-local weak-order or WIN/DRAW/LOSS invariant. This is high-risk and OPEN. Do not continue blindly accumulating more late-game sample positives as though that constitutes the universal solution.

No external independent formally certified proof, no maintained Node26 CI, no qualified IsoGraph1.2 promotion, no solver branch or main merge.
