# Connect-K dimension outcome research: post-desync synthesis, exact non-search parameter families and next missing law

**Date:** 2026-10-18 Pacific. **Canonical ownership:** research/semantic-quotient. **Research direction:** Josh Oshiro. **Status:** reproducible current mathematics, conditional theorem ledger, source and physical evidence. Neither a new qualified IsoGraph1.2 game-theory authority nor a universal dimension-to-WDL formula. The side 3D diagonal topology idea is preserved separately and parked, not discarded.

## 1. The target and governing distinction

Empty-board perfect-play dimension function V_empty(W,H,K) is a narrower version of the standing total Level 1 goal V(q), with P0=+1, DRAW=0, P1=-1. Both are still OPEN for arbitrary K>=3 in the nontrivial W,H>=K regular regime. Source mathematical reasoning must not value strategically inequivalent future games via minimax/QBF/BDD or compiled strategies. Independent physical adversarial exploration and published solved tables remain falsifiers only.

Preserve separation:
- balanced monochrome-free static full-board coloring: a necessary structural condition for a possible legal DRAW;
- one actual full-length legal no-winning history: POSSIBLE cooperative draw, but opponents may deviate;
- one online safe response policy for designated defender: guaranteed NO OPPONENT WIN / sometimes forced DRAW under explicit scope;
- two independently valid opposite-side no-loss strategies: exact WDL DRAW;
- explicit P0 first-win strategy: exact P0 WIN;
- missing guards/candidate failure: INCOMPLETE, never extrapolate negative result into LOSS.

## 2. Current exact non-search empty-root parameter classifier, correct order

For all finite W,H positive and K positive:

| Condition | Source conclusion | Proof/evidence |
|---|---|---|
| K=1 | P0 WIN exact | Single first stone wins; entire dimension family |
| K=2 | P0 WIN iff W>=2 AND (H>=2 OR W>=3); otherwise DRAW | Direct three-ply forcing policy for every P1 reply, or single-column/two-cell exhaustion; 1,800 independent roots and 13,890 P1 replies physically checked |
| K>=3 AND W<K | DRAW exact | Independent both-player vertical pair response (P0/P1); 124 independently explored adversarial physical fixtures for K3..6; K2/W1 already classified above |
| K>=3 AND H=1 | DRAW exact | Independent both-player one-row adjacent-pair reply; 216 K3..8 fixtures, 2,527,038 adversarial attacker choices, none wins |
| K>=3 AND H<K AND K<=W<=2K-1 AND WH even | DRAW exact | P0 bottom common-K-span anchor + immediate upper-support mirror proves V>=0, independent P1 horizontal pairs prove V<=0; 65 original P1 adversarial physical controls | 
| K=4 AND H<4, not otherwise certified | **NO unrestricted source DRAW certificate** | Historical 2026-09-14 two-sided horizontal pairing proof lacks P0 first-turn and odd-column responses; keep source bound or INCOMPLETE until repaired (2026-10-19 audit) |
| K>=3 AND H<K AND WH even, outside earlier exact families | P0-NONWIN bound V<=0; exact root sign INCOMPLETE | Frozen P1 horizontal mirror, 73 independent original physical controls, 179,406 P0 choices | 
| K>=3 AND H<K AND WH odd, outside earlier exact families | P1-NONWIN bound V>=0; exact root sign INCOMPLETE | P0 opens unmatched odd column then mirrors paired columns, 58 fully checked P1 opponent-adversarial fixtures |
| K>=4 AND even H AND K<=W<=2K-2, outside earlier exact families | P0-NONWIN bound V<=0; exact root sign INCOMPLETE | Allis 1988 K4 W<=6 even H, generalized symbolic K>=4 two-center strategy and independent checks | 
| everything else | INCOMPLETE | No general source strategy-sufficient law has been established |

The H<K/WH-even P1 policy is actually **forced full-board DRAW when that particular policy is followed**, against any P0 choice. Hence P1 can guarantee at least DRAW and P0 cannot force WIN. It does NOT establish that P0 can hold DRAW against another P1 policy. The historical K4 H<4 result is retained as published research provenance, but its unqualified two-sided pairing PROOF is insufficient outside independently certified subfamilies. See 2026-10-19 thin-height proof audit.

K=2 formula may be restated:

    V_empty(W,H,2) =
       +1 if W>=2 and (H>=2 or W>=3),
        0 otherwise.

H=1 full-K formula:

    V_empty(W,1,K)= +1 iff (K=1) or (K=2 and W>=3);
                      0 otherwise.

Guard order must give exact result before weaker outcome bounds; never return DRAW merely because a concrete *cooperative* drawn word exists.

## 3. New geometric and parity foundations, and their strict limits

Owner/CPC source phase:

    kappa_c = (sum_{d!=c} h_d) mod2.
    XOR_c kappa_c = ((W-1) mod2)*(sum h mod2).

A move in column a toggles only the two adjacent local seam differences delta_c=h_c XOR h_(c+1), although it flips kappa in every OTHER column. Horizontal K-line endpoint beta correction is eta_first XOR eta_last. Diagonal K-line adds (K-1) mod2 twist, so even-K diagonals differ from horizontals in endpoint parity and odd-K endpoints coincide despite differing intermediate conditions. H+2 preserves each column's future unmatched parity, but adds new K-lines; 10x4 P1 and 10x6 P0 show the parity preservation does not imply WDL equality.

Current exact geometry includes original four direction ribbons with shared physical cells; K-1-column static boundary transfer detects all monochromatic K-windows via at most 2^[H(K-1)] suffix states for fixed H,K. Its finite static coloring polynomial checks matched all nine independent original-grid exhaustions, and H4/H5 K4 source screens across W4..12 confirmed balanced safe static colorings regardless of P0/P1/DRAW oracle labels.

**Strong mathematical negative:** for every W,H positive and K>=3 there exists an explicitly balanced static coloring with no monochromatic K-line (four-row phase 0011, adjusted when odd W and H mod4=2). 3,456 original physical geometry controls and 1,225,240 winlines checked. Therefore EMPTY-root *balanced STATIC draw infeasibility* is NEVER a valid way to prove non-DRAW at K>=3. K>=4 further has one explicit **genuine legal alternating cooperative full DRAW history** for every W,H; 1,280 independent W/H<=16 K4..8 physical trajectories and 92,480 moves checked. Hence *actual legal DRAW path absence* cannot explain ANY K>=4 perfect-play P0/P1 decisive root. The gap is opponent-contingent control of outcomes.

## 4. Frozen physically verified theorem evidence packets (new and inherited)

- \`COMPLETE_K1_K2_W_H_TO30_EXACT_DIMENSION_WDL_0_1.json\`: 1,800 roots; no mismatches.
- \`H1_ALL_K3PLUS_216_DUAL_DEFENDER_PHYSICAL_0_1.json\`: 216 exhaustive fixed-defender original adversarial fixtures; neither opponent ever wins.
- \`NARROW_WIDTH_W_LT_K_124_POLICY_UNIVERSAL_ORIGINAL_PHYSICAL_0_1.json\`: 124 K3..6 adversarial fixtures; both players' no-win policies.
- \`HORIZONTAL_ONLY_EVEN_AREA_P1_DRAW_73_COMPLETE_PHYSICAL_0_1.json\`: 73 K3..6 fixtures; P1 forced-draw policy versus 179,406 original P0 choices.
- \`UNIVERSAL_K4PLUS_LEGAL_DRAW_ALL_1280_ORIGINAL_PHYSICAL_0_1.json\`: existential legal DRAW, not perfect-play outcome.
- \`UNIVERSAL_K3PLUS_STATIC_BALANCED_SAFE_ALL_3456_ORIGINAL_LINES_0_1.json\`: balanced static-coloring no-go, not legal game/strategy.
- \`STATIC_K_COLUMN_TRANSFER_9_INDEPENDENT_POLYNOMIAL_18_DIMENSION_CONTROLS_0_1.json\`: exact static interface and its decisive WDL nonsufficiency.

All packets reside in \`research/isograph/discovery/2026-10-18-board-dimension-outcomes/\`. Source proofs were frozen before independent physical controls. These are internal geometry/physical validation, NOT external independently formalized proof assistant qualification or authority promotion.

## 5. What to stop spending effort on

**REJECT** attempts to obtain empty-board WDL by static balanced final-color existence at K>=3; always TRUE by constructive theorem. **DO NOT** infer eventual V(W,H+2,K)=V(W,H,K) merely from column parity preservation; first three published exceptions explicitly invalidate universal H+2 equality. **DO NOT** classify WDL using only W mod2,H mod2,K mod2, CPC phase, or diagonal-start height. The frozen K4 oracle table contains same-parity outcome counterexamples. **DO NOT** treat a cooperative draw as a guaranteed draw under perfect opposition. **DO NOT** conceal future game-tree paths in fixed-width dynamic programming or symbolic circuits and claim elimination of strategic branching.

The user-suggested 3D orientation/intersection idea remains filed separately:
\`docs/research/2026-10-18-orientation-layer-3d-topology-and-cell-intersections-candidate.md\` (deferred, no strategic authority or background task).

## 6. Next hard theorem: reusable guarded RESPONSE-COMPATIBILITY interface

The exact column-to-column geometric transfer only knows which winning-lines intersect; it cannot determine whether one player can enforce their denial while the other chooses moves adaptively. The new P1 H<K proof supplies the smallest nontrivial source archetype:

    local paired-column parity/equal-height invariant
    + one original opponent landing
    -> one gravity-legal mate response
    + no adjacent K-cell monochromatic winner for either player.

Seek a strictly more general theorem operator that composes *owned original K-line blocking obligations* and a **one-response-per-observed-attacker-event capacity** across columns. Express a static certified response contract whose preserved invariant implies NO ATTACKER WIN for all attacker events; for original K>=4 regular boards, diagonal requirements cross the same column-pair boundary and will invalidate the naive identical-row mirror. Do not assume one shared blocker exists: historical 44444 has 27/35 first-touch gates without one common immediately legal response, and source adaptive obligation-debt work remains open.

Candidate contract interface (candidate, NOT proved sufficient globally):

    Contract_D = (
       original winning-line subset blocked by the contract,
       paired/mirror height or release invariant,
       legal root entry precondition,
       verified response function for any attacker landing,
       resource conflicts with neighboring contracts,
       parity/ownership correction and exact stop guards
    ).

Prove each local contract's inductive safety and algebraic cross-contract compatibility WITHOUT constructing strategically alternative future q values. THEN propose a transfer law for compatible contract families as width increases by one, retaining K-1 horizontal/diagonal crossing generator constraints. A successful guarded signed root outcome theorem would combine simultaneous P0/P1 no-loss proofs to DRAW, or one forced WIN source proof to WIN. Until then return INCOMPLETE. This may permit size-law periodicity later, but no proof currently.

## 7. Secondary search-engine applicability

- K1/K2 empty-root exact result, H1/K3+ exact DRAW and W<K exact DRAW: genuine node-level exact cutoffs with O(1) dimension guards, if generalized K supported by consumer; costs negligible, but reuse existing terminal check where possible.
- H<K WH even: one-sided certified P0-nonwin upper bound V<=0; potentially alpha-beta bound tightening, not an exact WDL cutoff until extra guards. O(1) dimension filter; strategy witness O(1) per opponent move in proof, source engine contract still needs independent correctness qualification.
- K-1 static coloring transfer, static parity and cooperative draw histories: NO admissible exact WDL cutoff. Their evaluation may cost far more than search work; defer engine integration.
- No gameplay solver, hot-loop or CUDA/BSFP implementation changes authorized. Any later benchmark must measure total wall-clock solve cost, not merely node count.

**Disposition:** total arbitrary W,H,K dimension classifier remains OPEN; exact new K1/K2 and H1 families established; key missing object is a strategy-sufficient online-response transfer, not geometry or static coloring.


## 8. New strategy-sufficient regular-board transfer: Allis two-center width threshold

**This changes the research focus materially.** Source: \`docs/research/2026-10-18-allis-central-two-column-general-k-even-height-nonwin.md\`, independently validated \`research/isograph/discovery/2026-10-18-board-dimension-outcomes/ALLIS_GENERAL_K_TWO_CENTER_17_FULL_AND_12000_SAMPLED_0_1.json\`. Distinguish Allis's prior K4 W<=6 even-H proof from our symbolic K>=4 extension.

For fixed K, all possible horizontal/diagonal K-column spans share a common intersection of size

    C(W,K)=max(0,2K-W) when W>=K.

Thus:
- K<=W<=2K-2: at least TWO shared columns;
- W=2K-1: precisely ONE shared column;
- W>=2K: ZERO shared columns.

When H is EVEN and K>=4, source chooses two adjacent common columns u=W-K, v=u+1. P1 answers every P0 outer-column drop by immediate SAME-COLUMN upper mate, controlling P0's outer row parity. In the common pair, P1 first splits the bottom cells, then mates vertically; when one center fills on P0's top-row move, P1 shifts response to the other. A source invariant proves every P0 vertical/horizontal/diagonal K-line blocked. Therefore

    H even, K>=4, K<=W<=2K-2
       => P1 can prevent P0 FIRST WIN
       => V_empty(W,H,K) in {-1,0}.

In the critical diagonals, K-2 outer columns always contain two positions of OPPOSITE column-index parity for K>=4. A diagonal alternates row parity across such columns, and P0 owns only even-index rows in outer columns, so no P0 diagonal K-line exists. This is not a mere parity lookup: the argument includes an explicit legally viable P1 response resource contract.

Original physical validation after theorem/source freeze: **17 complete exhaustive P0-opponent fixtures** (70,407 physical states and 312,532 P0 alternatives/312,532 P1 replies), plus **12,000** independently simulated P0-adversarial games covering K4,5,6 and 202,500 original P0/P1 move pairs; zero P0 first wins, zero illegality and zero resource incompletes. Exact symbolic proof, internal physical corroboration, **external independent formal checker NOT RUN**. No production solver adoption or authority-1.2 promotion.

**Now genuine regular K4 table coverage:** source-only partial classifier \`source-partial-empty-dimension-WDL-classifier.mjs\`, with independently checked guards \`check-partial-empty-dimension-classifier-guards.mjs\`, classifies **15 of the 52** published K4 regular-board states as P0-NONWIN (W4/5/6, even H), zero disagreements with published WDL; the remaining **37 of 52** are still INCOMPLETE; none of the 52 has a source exact scalar WDL from our dimension guard union yet. This is genuinely meaningful one-sided outcome information on regular K4, not a new exact K4 opening-game solve. In the updated, fail-closed parameter screen 1<=W,H<=12 and 1<=K<=8: **744 exact classifications, 137 one-sided bounds and 271 INCOMPLETE**. Historical inherited K4 thin-height proof gap is NOT treated as an exact source guard; the new exact even-area common-span horizontal-only family is included. These are deliberately nonuniform geometry-domain counts, not coverage percentages for unrestricted game states.

**The mathematically smallest uncovered dual problem** is to find an analogous P0 no-loss contract on W4/5,H>=4,K4 (especially even H), which could combine with Allis P1 nonwin to prove exact DRAW without search. At width6,H even published P1-win prevents generalizing such a P0 policy to width6. At W7,H6 published P0 WIN prevents broadening the P1 two-center contract past W=2K-2. Any next theorem MUST retain and explain these negative guards.

**Engine assessment**: new Allis-general K>=4 even-H width threshold gives a constant-time P0-relative upper bound 0 at the empty root, but not exact WDL node cutoff. It may improve alpha-beta bounds for generalized-K solvers, subject to original-game qualification and wall-time benefit. Existing K4 prior published strategy must be credited; no solver modifications authorized.


## 9. October 19 corrective audit: horizontal K-span positive theorem and odd-spare negative proof

**Latest guarded exact extension:** For K>=3, H<K, K<=W<=2K-1, the horizontal length-K column-span intersection contains the single P0 bottom anchor c=W-K. P0 opens there, then replies immediately above each P1 stone when available. The P0-top source invariant means every P1 upper-row stone has an earlier P0 lower supporter, so any alleged first P1 horizontal win above row0 would imply an earlier P0 horizontal win directly below; bottom row is blocked by the anchor. Thus **V>=0** independent of opponent quality. When area WH is even, the separately frozen P1 horizontal response guarantees **V<=0**, so these boards have exact DRAW. Frozen theorem \`docs/research/2026-10-19-p0-top-support-mirror-horizontal-only-common-kernel-exact-draw.md\`; original P1-adversarial physical control: 65 complete fixtures, 311,603 P1 alternatives, ZERO P1 first wins/budgets, 45 fixtures eligible for source exact DRAW composition. Negative W=2K,H2 lower-bound-guard examples preserved. This is a new parameterized WDL subfamily, not a proof that all H<K is DRAW.

**Historical thin-board pair strategy corrected:** Old \`docs/research/2026-09-14-thin-board-draw-theorem.md\` Case2 treats H<4 for all widths by an asserted two-sided horizontal mirror. P0's first move in a paired column makes mate heights unequal at the first P1 turn, and an odd-width unmatched column has no specified reply. These are concrete **proof gaps, NOT counterexamples to the published DRAW outcomes**. The old theorem document remains unchanged; audit \`docs/research/2026-10-19-k4-thin-height-dual-pair-proof-obligation-audit.md\` and exact parity spill-debt derivation \`docs/research/2026-10-19-unmatched-parity-spill-debt-column-pairing-obstruction.md\` qualify future source consumption. No source-EXACT K4 H<4 outcome is inferred from that unsatisfied legacy two-sided proof alone. Independently proved W<K, H1, and common-K-span even-area cases retain exact status.

**Partial source classifier after fail-closed correction:** \`research/isograph/discovery/2026-10-18-board-dimension-outcomes/source-partial-empty-dimension-WDL-classifier.mjs\` now gives 744 exact, 137 one-sided and 271 incomplete parameter values for W,H<=12, K<=8 (1152 tested), zero source-versus-published contradictions. Specifically K4 W5 H3 (published DRAW) returns only source **V>=0**, and K4 W8 H3 returns only **V<=0**, until complementary online policies are proved. On the 52 published K4 W4..12/H4..13 games, 15 remain covered by K-general Allis P0-nonwin bound, 37 INCOMPLETE, no new exact root scalars.

**Immediate next mathematical target:** derive a **P1 no-P0-win** strategy for the K4 W5 H3 odd-area horizontal-only example or a more general signed pairing-reserve theorem closing the deficit, then transfer that inductive response contract through new diagonal K-lines at H>=K on W4/5. The old parity argument cannot simply be asserted for either player: a P1 responder with one odd-height unmatched column is forced to spill one reply into the protected region if P0 exhausts that column. Source decision must return INCOMPLETE until its pending-pair debt has a certified legal release mechanism. Independent physical opposition may falsify frozen candidates, but source may not evaluate future game values.
