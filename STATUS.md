# Connect4 current research status

**Updated:** 2026-10-17 (full-future nongeometric branch-elimination checkpoint; older sections retain their qualification dates)  
**Branch:** `research/semantic-quotient`  
**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This file is the current-state router, not a theorem ledger. This branch owns **all durable Connect4 research**, regardless of which solver produced it. Research artifacts live across `research/**` and `docs/research/**` on this branch; the executable research continuation lives in `next_step.yaml`.

## Governing board-domain focus — owner refinement, 2026-10-17

Current zero-strategic-branching mathematics and positive evidence MUST focus on the **standard 7-column × 6-row Connect4 game (W=7,H=6,K=4)**. Reduced-board 4×3/4×4 counts are valid historical scoped controls only, not standard-board discovery progress. **Keep W, H, and win length K explicitly symbolic in the formulas and their incidence/release/parity guards**, even as all primary tests and conclusions specialize to (7,6,4). Generalizing to other board dimensions is a LATER phase after standard-board research is substantially exhausted. Neither generic formula notation nor small-board exhaustive conformance establishes 7×6 value/optimal-action completeness. Source of owner instruction: `docs/research/2026-10-17-owner-standard-7x6-geometry-first-zero-branch-domain.md` (two-phase domain policy). Original 7×6 `44444` exact WDL/complete optimal set remains UNKNOWN.

## Research ownership

`research/semantic-quotient` is the single durable research owner. Active implementation consumers are IsoMax/Isometric, CUDA-BSFP, and SUT. Minimax/Negamax/alpha-beta and Hybrid Confluence are historical solver lineages, not current implementation owners. Temporary experiments may carry in-progress research only until durable results are integrated here.

See `docs/decisions/2026-09-17-single-research-owner.md`.

## Latest primary 7×6 mathematical progress — guarded cross-line transversal and first-win race, 2026-10-17

**Owner goal still OPEN:** zero strategic branching for exact unrestricted 7×6 WDL and COMPLETE optimal columns for arbitrary legal q. All new positive source theorems retain symbolic W/H/K, are verified on genuine W=7,H=6,K=4, and do NOT establish canonical `44444` full outcome or tied-best labels. Game reference used ONLY after source algebra, outside the producer.

**Cross-line full-board blocker resource certificate:** Source residual original winning requirements for p form a hypergraph. A rational nonnegative packing λ satisfying every future cell's load `Σ_(G contains x) λ_G<=1`, total weight `Σ λ_G > opponent's remaining turn count`, AND an independent first-win-guarded theorem that opponent **cannot win**, proves p FIRST winner: any nonwinning completely filled board would require opponent stones hitting every G, contradicting the packing. This simultaneously reasons across overlapping original winlines without evaluating strategic continuations. Frozen theorem `docs/research/2026-10-17-standard7x6-bilateral-winline-transversal-packing-candidate.md`, source-only proof producer `standard7x6-source-fractional-transversal.mjs`, evidence `STANDARD7X6_SOURCE_TRANSVERSAL_PHYSICAL_RESULTS_0_1.json`. Nonuniform sample 33,811 legal nonterminal standard 7×6 physical states: 135 exact first-action p wins, including 106 with fewer than two gravity-playable p singleton wins, 0/135 independent unrestricted physical-value mismatches. Combining with a LIGHTWEIGHT immediate/CPC source interval baseline yielded **47 additional** complete exact root WDL/all-optimal masks (1,228→1,275), NOT measured as incremental over all former co-release/one-lane source rules. Every successful witness in this sample used integer λ=1 on disjoint G, not uniquely fractional LP power.

**Stronger temporal first-win race certificate:** For horizon L, restrict p requirements to those guaranteed completely PLACED by L using latest gravity rank `U_q(c,r)=(W-1)H-n+r+1`. A cross-line hyperedge packing that forces >`A_o(L,q)` distinct o blockers AND source original opponent earliest-win LB strictly `>L` proves **p wins by L under EVERY legal move order**, even when opponent residual lines remain. Stronger exact output theorem: since the proof is universal over current legal moves, **EVERY currently legal literal first action is tied with exact WIN_p WDL** (scalar value equivalence, not behavioral game isomorphism), zero game-semantic continuation fanout. The frozen source theorem `docs/research/2026-10-17-standard7x6-temporal-transversal-first-win-candidate.md` and producer `standard7x6-source-temporal-transversal.mjs` were executed before independent ordinary physical recursive reference. Evidence `STANDARD7X6_TEMPORAL_TRANSVERSAL_INITIAL_PHYSICAL_RESULTS_0_1.json` and `STANDARD7X6_TEMPORAL_ALL_LITERAL_BEST_SET_RESULTS_0_1.json`: 434 exact source root wins on same sampled 7×6 population, 375 with surviving opponent win lines, **434/434** unrestricted root and **462/462** literal action values match independent physical WDL, zero false ties, max source semantic fanout ZERO. Important adequacy caveat: **408/434 had only ONE legal first action; only 26 had 2+**, and all three of those with previous CPC opponent no-win unproved already had an immediate winning move. Not a general early/mid-game multi-class breakthrough or measured full existing one-lane increment.

**Canonical early-rank source barrier now proved, 7×6:** Under latest-place event bound `U(c,r)=(W-1)H-ply+r+1`, every future cell has latest-rank `U>=D=(W-1)H-ply+1`. A temporal-transversal source certificate requiring horizon L strictly earlier than opponent's first *possible* win lower-rank B_o cannot select ANY compulsory original residual winning generator when `D>=B_o`. At legal `44444`: D=32 vs B_o=6 for either potential winner; each of P1's seven move6 replies has D=31 and B_o<=6; at `4444442`, D=30 and B_o<=5. Fully source-only frozen literal-case control returns INCOMPLETE for both players in all nine cases; zero successor-game values computed. This rules out improving this particular conservative unconditional-temporal certificate merely by using a stronger fractional LP, **NOT** adaptive strategies or unrestricted game winner/optimal set. Canonical 44444 remains UNKNOWN. Full proof `docs/research/2026-10-17-standard7x6-canonical-temporal-universal-race-barrier.md`; machine evidence `STANDARD7X6_CANONICAL_TRANSVERSAL_SCOPE_RESULTS_0_1.json`. This sharpens next work to conditional threat exposure, shared blockers and response timing rather than universal all-play win certificates.

**Next substantial math seam:** source-structural **ADAPTIVE** cross-line shared-blocker obligations, conditional CPC response-event release/race/parity and forcing within one exact q descriptor; all original first-win, own counter-win, gravity and tie-membership guards mandatory. Exclude static perfect-pair family (already exhausted), redundant per-line EDF and smaller board extrapolation. Need compare new source certificate to full preexisting one-lane rules on actual 7×6 and focus on `44444` / mid ranks. No hidden histories, policy graph, QBF/BDD value alternatives, generic negamax or optimization. Maintained Node26/CI and external theorem certification NOT run; no IsoGraph authority promotion/merge.

## Latest 7×6-specific mathematical conclusion — 2026-10-17: static per-line deadline and universal perfect fixed-mate limits

**ZERO branching objective remains OPEN.** Under the owner's governing standard-board-first directive, source derivations keep W/H/K symbolic but all new geometry controls use actual 7×6 Connect4, not 4×3/4×4 extrapolations. Two substantive narrowly guarded findings:

1. **Deadline-prefix Hall redundancy proved:** For any original horizontal/vertical/diagonal gravity-legal residual generator, every earlier required-target owner-turn deadline inequality follows from the last-event feasibility test (horizontal equal rows, vertical consecutive suffix, diagonal distinct rows/columns with a release-capacity lower bound). An independently committed 7×6 all-support audit examined 823,542 nonfull column-height vectors, 94,757,866 player/line incidences; 5,418 old vs 5,418 Hall-impossible instances, **ZERO new certificates**. A separate source/physical 7×6 sample of 33,811 legal nonterminal positions and 1,000 unrestricted late physical references also found no marginal certificates; 2,919 action values and 122 completed full optimal sets were checked correctly in its qualified sample scope. See `docs/research/2026-10-17-7x6-deadline-hall-redundancy-proof-and-next-seam.md` and `STANDARD7X6_DEADLINE_HALL_ALL_SUPPORTS_RESULTS_0_1.json`. No new 44444 value.

2. **Universal fixed-perfect-immediate-mate strategy restriction characterized:** An analytic necessity/sufficiency argument classifies this *narrow* defender strategy as disjoint one/two-column cross-prefix co-release blocks with vertical even tails. Completely independent 7×6 suffix control compared all 324,688 static perfect matchings on 4,116 real 7×6 height profiles (2/4/6/8 future events) and 1,240,093 order-check calls: 10,675 universal-safe matchings = 10,675 normal-form matchings, ZERO differences. For standard `44444`, after each of P1's seven distinct move-six replies, all 1,852 full-length block matchings collectively yielded **ZERO** coverage certificates for all P0 original residual requirements. Best pairing still leaves 20–26 P0 generators exposed depending on the action. This excludes the fixed-perfect-mate class only, **NOT adaptive defenders, unrestricted WDL, or full tied M***. Proof/evidence in `docs/research/2026-10-17-standard7x6-perfect-mate-response-completeness-candidate.md` and `STANDARD7X6_PERFECT_FIXED_MATE_CANONICAL_RESULTS_0_1.json`.

**NEXT MATHEMATICAL SEAM:** cross-line *ADAPTIVE* source blocker-response obligation closure: account simultaneously for shared blocker moves, gravity-release timing, CPC parity response reservations, first-win counter-wins, and nested universal dependencies in ONE q descriptor. No separately evaluated inequivalent strategic games, hidden strategy tables, more pairing-family tuning, search performance work, or small-board-only progress claim. If not exactly resolved, return INCOMPLETE. Existing qualified IsoGraph 1.2 and 7×6 44444 unknown remain unchanged.

## Latest active mathematical frontier — gravity co-release pairing, ZERO game-semantic fanout — 2026-10-17

**Owner-primary success criterion unchanged:** one source-structural computation producing unrestricted P0-relative WIN/DRAW/LOSS and **ALL** equally optimal legal moves, with **ZERO splitting into multiple inequivalent strategic continuations**. A source proof construction can examine source residual generators, test static matchings, and—if justified—follow at most one unresolved future-behavior class. Search solve time / smaller branch count is NOT a success metric. **The general 7x6 Connect Four zero-branch algorithm has NOT been discovered.**

**New co-release lemma and executable proof:** unlike earlier vertical/same-absolute-row paired defender response, two future cells in DIFFERENT original-height columns may be paired when they occupy the SAME relative ordinal of the two columns' remaining gravity chains. A contiguous prefix of such co-release pairs, followed by even vertical tails, gives a static perfect matching. The defender can take the mate immediately on any attacker first-touch because both cells' predecessor events belonged to the preceding complete pair. If every attacker normalized source win requirement includes some FULL pair, attacker can never win first through any continuation. This produces unrestricted WDL nonwin intervals without constructing speculative q games. Parent source pairing proof `research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/co-release-pair-block-proof.mjs`; formal source pairing normal form `CO_RELEASE_PAIR_BLOCK_NORMAL_FORM_0_1.md`.

**Independent release-order proof control:** 43 abstract height profiles, 418 two-cell target generator masks, 134 produced pair certificates, **2,185 independently enumerated attacker move orders** with 2,051 defender immediate mate availability tests; zero errors and a deliberately misaligned cross-column release pair correctly rejected. This order enumeration belongs to VALIDATION, never the source producer.

**Exhaustive full WDL/all tied-best independent reference:** co-release-enhanced strictly ONE-LANE evaluator `co-release-defensive-one-lane-optimal-set.mjs` with independently run `co-release-defensive-one-lane-physical-control.mjs` passed ALL 3,734 unique q on 4x3 Connect3 and 34,094 on 4x4 Connect4. It now returns **EXACT** unrestricted WDL plus **COMPLETE** optimal move label set for **2,928 / 3,734** and **7,618 / 34,094** respectively, with ZERO incorrect outcomes, false best sets or certified action intervals and maximum game-semantic fanout ONE. New over earlier vertical/equal-height paired defense: **0** on 4x3 and **280** on 4x4. The 4x4 exact confirmed source per-action co-release pairing witnesses 13,662; root co-release defensive witnesses seen in control 4,084. All 100,764 4x4 individual first-action source WDL intervals compared to independent exact values. The control had been committed at `88374e719d75...`, then directly executed from live GitHub source after UI desynchronization with PASS, preserving machine outcome in `CO_RELEASE_ONE_LANE_FULL_REFERENCE_RESULTS_0_1.json`.

**Canonical 7x6 `44444` negative scope remains:** P1 to move on absolute move6; 37 empty cells before its move, 36 afterward; source R0/R1 counts 48/42. No co-release paired defensive certificate was found for ANY of the seven first moves in the tested source block normal form, and every first-action value interval remains **[-1,+1]**. The historic *structural* absolute move7/8 column-completion transition and bounded defensive sets remain previously proved; unrestricted WDL and complete optimal move set at `44444` are **UNKNOWN**. An absent static certificate is NOT a lower bound/impossibility proof.

**NEXT NONLOCAL MATHEMATICAL GAP:** a source-only, exact, first-win/turn/gravity capacity-guarded long-range obligation/value invariant (CPC support event parity, deadline/control, shared blocker/Hall resource constraints and nested response dependencies) to decide multiple *INEQUIVALENT* remaining future action classes simultaneously without computing their separate strategic futures. Derive one source descriptor and prove a nonforking exact `(V,M*)` reconstruction theorem BEFORE independent exact-q reference controls. Do not spend the next batch on another pruning metric, solver speed, generic BDD/QBF deeper matrix, or assume the owner goal already succeeded.

**Durable latest evidence:** `research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/CO_RELEASE_ONE_LANE_FULL_REFERENCE_RESULTS_0_1.json`; frozen plans `GUARDED_CO_RELEASE_STATIC_PAIRING_PLAN_0_1.md` and `CO_RELEASE_PAIR_BLOCK_NORMAL_FORM_0_1.md`. No game-theory authority promotion, no merge.

## Exact nonforking WDL + entire optimal-move set on restricted domains — 2026-10-17

**New substantive owner-aligned mathematical result, qualified but NOT TOTAL:** A SOURCE-ONLY direct first-win/forced-opponent-win/double-threat/exhausted-winline, deterministic-last-column and safe-gravity-pairing calculus certifies exact unrestricted ordinary W/D/L and ALL equally optimal literal moves without constructing ANY speculative future q. When multiple action labels remain unknown, source-only full-future behavior equivalence (mirror, conditional NON-GEOMETRIC column transporter for either mover, or dynamic inert neutral-token bisimulation) can treat the whole class as ONE logical decision. Proved full-future WDL weak inequalities feed a finite `{-1,0,+1}` value-interval closure. If exactly ONE unresolved class or a source-proved extremal class suffices, follow **ONE** next-q semantic lane; if a second inequivalent unresolved class remains necessary, return **INCOMPLETE** WITHOUT evaluating it. No BDD/QBF, game-continuation graph, solved policy table or recursive minimax fallback in producer.

**Stronger exact output theorem:** The user requires `(unrestricted root WDL, COMPLETE WDL-optimal move set)`, NOT the exact numeric values of every strictly inferior move. For P0 MAX with certified root V and sound action interval `[lo,hi]`, c is optimal if `lo(c)=V` and strictly inferior if `hi(c)<V`. For P1 MIN, c is optimal if `hi(c)=V` and inferior if `lo(c)>V`. If every literal label satisfies one of these mutually exclusive conditions, full `(V,M*)` is exact **even if inferior numeric WDL remains in an interval**. Finite lattice implication from source-proved `V(a)<=V(b)` is `lo(b)>=lo(a)`, `hi(a)<=hi(b)`; all actions remain original labels.

**Exhaustive independent qualified small-board verification:** All **3,734** distinct first-win-stopped 4x3 Connect3 exact q and **34,094** 4x4 Connect4 q states were checked with the qualified recursive q core as POST-derivation reference only. The latest ZERO game-semantic fanout operator certified unrestricted WDL and COMPLETE tied best move sets on **2,914/3,734** and **6,725/34,094** q states, respectively, with **ZERO incorrect outcomes or best-move sets and maximum strategic fanout ONE**. Across the exact stages: original direct source 925/1202; two-turn frontier 2019/2866; one unresolved lane 2881/5978; full-future equivalent unknown class 2908/6521; full-future weak WDL lattice 2910/6581; direct exact optimal-set separation **2914/6725**. Of the last results **4/142** leave some proven INFERIOR move's numeric WDL unknown, while correctly identifying exact root value and EVERY optimal tie. Independent generic mathematical controls: all 4,096 directed weak-order graphs over 4 actions, 540,672 anchored WDL lattice constraints, and **1,081,344** mover-optimal-membership tests; **435,728** exact complete optimal-set certificates, including **20,352** with inferior numeric WDL open; ZERO false value/label claims.

**Strict canonical source controls PASS:** legal 4x3-c3 `223` source returns exact P0 WIN with ALL FOUR P1 next-move labels tied, ZERO future q evaluations, matching independent q reference and retaining the `forall b exists a` vs `exists a forall b` distinction from earlier proofs. 4x3 `111` and 4x4 `1111222` remain INCOMPLETE. For standard 7x6 `44444`, `444444`, `4444442` (absolute historic movers 6=P1,7=P0,8=P1), candidate correctly returns INCOMPLETE and visits ZERO speculative future q. This does NOT undo the already proved move7/move8 cofactor/column-completion and bounded defensive masks. **The TOTAL zero-branch Connect Four algorithm and unrestricted `44444` WDL/all-optimal set remain UNKNOWN/NOT DISCOVERED.**

**New proof/evidence:** `docs/research/2026-10-17-direct-one-lane-zero-strategic-fanout-closure.md`;
`research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/` including `direct-two-turn-frontier-operator.mjs`, `single-lane-direct-value.mjs`, `full-future-unknown-class.mjs`, `source-wdl-lattice-closure.mjs`, `source-optimal-set-separation.mjs`, `separated-optimal-set-one-lane.mjs`, and `OPTIMAL_SET_SEPARATION_RESULTS_0_1.json`. Sources executed directly from exact GitHub files in isolated V8 with independent qualified q references; NO maintained Node26 suite or external proof-assistant qualification claimed.

**Next true mathematical gate:** find a rank-independent source `h,R0,R1` structural **long-range strategic obligation/value closure** that resolves remaining inequivalent unknown classes **without evaluating multiple future games**, deriving complete `(V,M*)` directly. Candidate avenues: first-win-guarded CPC/parity/support-deadline invariants, exact shared-response Hall deficiency and simultaneous residual-universal obligation saturation; DO NOT reinterpret an antichain reduction, larger unevaluated QBF or fewer sampled branches as ZERO. Search solve time irrelevant; existing numeric experimental caps are safety envelopes only. No authority promotion or merge.

## Governing owner correction: ZERO strategic branching, not fewer branches — 2026-10-17

**PRIMARY OPEN RESEARCH OBJECTIVE (supersedes earlier success interpretations):** derive the exact unrestricted ordinary W/D/L and **complete all-tied-optimal literal action set** directly from legal source residual q **WITHOUT FORKING INTO MULTIPLE INEQUIVALENT STRATEGIC FUTURE EVALUATIONS**. A set of W/D/L-equivalent legal moves may be returned as ONE logical decision result. For a SINGLE subsequent abstract continuation to represent that set, prove full-future behavioral equivalence or an equally strong transition-preserving quotient, not merely equal scalar value. Ordinary program conditionals and source-local inspections of labels/residual generators are allowed; speculative game continuations, separately quantified alternative strategies, search-generated policy tables, and their disguises inside BDD/QBF/support DAGs are NOT.

**This is NOT a request to reduce branching factor, minimize search time, improve recursion, or count avoided value queries.** Seven→four mirror action classes, 5,554 omitted scalar WDL requests, bounded dual reply antichains, exact two-ply domination and inert-neutral-class pruning are true qualified supporting mathematics and remain preserved, but **NONE is success at ZERO branching while the algorithm still needs to evaluate two inequivalent strategic possibilities**. Do not rank candidates by speed or larger compiled symbolic horizon. The previous branch/recursive core remains constructively exact and is a reference verifier, not the desired zero-branching algorithm. This project's current zero-branch theorem status is **OPEN / NOT DISCOVERED**. Standard `44444` WDL and full optimal set remain UNKNOWN.

**New formal objective/criteria:** `docs/research/2026-10-17-zero-strategic-branching-objective.md`. Primary future work is a mathematically derived **single-lane source-q optimality/value operator**, or direct invariant from which `(V(q), M*(q))` is read. A candidate must prove strategic fanout ZERO, exact WDL, tie completeness and guard/quantifier correctness. A partial order with multiple remaining inequivalent action classes is INCOMPLETE for this goal. Existing 60k/300k/10k/15s experiment caps remain safety/reproducibility controls when running an experiment, **not success gates**, and search solve time is not a research target. Retain all historical positive and negative findings; no authority revision or merge.

## New FULL-FUTURE nongeometric ROOT-ACTION branch elimination — 2026-10-17

**Source-only structural breakthrough, not an unrestricted 7x6 WDL result:** A height/capacity-preserving column permutation π can map EVERY future legal action after one P1 FIRST move b to the actions after a DIFFERENT first move c. The two children need not have identical literal support heights or be related by whole-board reflection. If transported P0 residual completion upset in b is contained in c's and c's P1 upset is contained in transported b's, finite-rank owner-cofactor/terminal induction proves unrestricted **`V(q[b])<=V(q[c])`** without evaluating either future game. Both implications under the SAME π certify exact complete future GAME ISOMORPHISM and transported best-action labels. A different global column permutation may become valid after blocked winning lines remove geometric obligations.

**Exact proof-guided partial-permutation solver:** Reject partial column maps whenever a fully assigned residual generator has no target subset witness; this is sound under every extension, and both weak-order directions are tracked separately. No gameplay continuation searched, source inputs only; future first-win/full-column/draw guards explicit. At canonical `44444`, all 21 P1 first-choice pairs now complete in **291,518 counted source operations**, proving ONLY three conventional reflection pairs `{1,7},{2,6},{3,5}`; no nonreflection order or unrestricted WDL there.

**Full exhaustive small-board validation (qualified recursive q ONLY as independent FALSIFIER):** on **1,786** distinct P1-to-move residual q values of 4x3-c3, direct source transporter proves **86 nonreflection exact future-program isomorphisms** and **320 one-way WDL orders**, zero incorrect values/transported actions. On **16,950** distinct P1 residual q values of 4x4-c4, it proves **2,280 nonreflection future-program isomorphisms** and **3,760 one-way WDL orders**, again zero incorrect. All source legal physical nonterminal positions (4,631 and 134,289 respectively) were covered. Valid novel witness: legal 4x4 source `1111222`, P1 replies **3 and 4** are equivalent under full-future action permutation `[1,2,4,3]` (NOT geometry reflection), without using solved values. The independent validator checks full future WDL action transports.

**Genuine exact scalar minimax action elimination:** Put a directed source-certified edge b→c when `V(q[b])<=V(q[c])`, P1 is minimizing. Collapse strongly connected components of weak order (all have EQUAL scalar full WDL), then evaluate only one representative from each condensation source component (no incoming edges). Every omitted scalar value evaluation has a certified WDL-order proof path from a retained representative; all original literal labels remain available for possible ties. Generic exhaustive algebraic control: **4,096** directed four-action graphs, **33,792** WDL assignments satisfying edges, **zero** wrong minima/SCC equality/path certificates, reversed-arrow mutation rejected.

On the complete unique small-board q corpus, source-only certificates removed the need for **370 / 4,872 (7.59%)** first-action scalar value evaluations in 4x3 and **5,554 / 50,034 (11.10%)** in 4x4, all BEYOND reflection-only reduction and without a single wrong root-min reference. Source proof construction work was separately charged (**408,967 / 3,476,170** total source+graph units across corpora); these counts are potential independent root VALUE-query elimination, NOT measured solver runtime or recursively visited-state savings. The complete optimal-move set is NOT inferred from weak dominance, because an omitted move can still tie.

**Next proof:** a source-cofactor/first-win-guarded NONBIJECTIVE or DYNAMIC alternating-response simulation across INCOMPATIBLE remaining column capacities (especially center-full versus wing responses at `44444`) and a source-only strict-value/tie equality certificate for complete optimal label recovery. Do not resume deeper unevaluated QBF/BDD compilation as the main objective. No full unrestricted `44444` WDL or complete move6 best set, game-theory authority promotion, cap change or merge.

Formal theorem, exact controls/provenance: `docs/research/2026-10-17-cross-support-root-branch-elimination.md`.
Source producers: `research/isograph/discovery/2026-10-17-dual-obligation-quotient/column-transport-partial-generators.mjs`, `root-action-dominance-quotient.mjs`.
Independent physical/generic falsifiers: `column-transport-physical-control.mjs`, `root-action-dominance-physical-control.mjs`, `root-action-dominance-generic-control.mjs`.
Machine evidence: `COLUMN_TRANSPORT_FULL_FUTURE_RESULTS_0_1.json`, `FULL_ROOT_SCALAR_BRANCH_ELIMINATION_RESULTS_0_1.json`.

## Full-future source-only branch comparison: two-ply cofactor diamonds — 2026-10-17

**New substantive structural proof (not merely bounded response equality):** For an original nonterminal P1-to-move source `q=(h,R0,R1)`, consider `P1 b, P0 c` versus `P1 c, P0 b` for DISTINCT legal columns, requiring both sequences nonterminal. They end on the SAME support `h+e_b+e_c`. Using only original parent residual masks, pull back all owner-true/opponent-blocked generators and test the **P0-favorable residual-upset preorder**. If P0's upset in BC is included in CB's and P1's upset in CB is included in BC's, cofactor isotonicity plus finite-rank first-win Bellman induction proves **exact unrestricted `V(BC)<=V(CB)`**, without evaluating future continuations. Both directions certify full future residual-state/every-action equivalence, retaining literal labels. Terminal guards checked before comparison. This is a same-support structural specialization of established q/favorable-order theory.

**Exhaustive independent physical/q controls PASS** (recursive full WDL used VALIDATION ONLY, never to select source certificates). On all 2,208 P1 physical sources of 4x3 Connect3: **1,522 distinct q+column diamonds**, of which **72 exact future equivalences** and **352 one-way full-WDL dominance** certified; **0 false** WDL/antichain claims. On all 67,992 P1 physical sources of 4x4 Connect4: **39,798 distinct q+column diamonds**, **2,372 equal** and **9,380 one-way dominance**, **0 false**. Deduplication by exact q key explicitly avoids inflating independent work by physical-history duplicates. Raw physical-pair counts (including repetitions) were 72+354 over 1,530 eligible 4x3, and 17,642+24,644 over 84,026 4x4. Independent full-q evaluator checked only AFTER producer proof; some one-way source orders had strictly different full WDL, but source theorem claims ONLY weak `<=`, never a strict ordering without another proof. Full WDL and all tied-optimal future action masks transport exactly for the mutual-equality cases.

**Canonical `44444` limitation:** All 21 unordered distinct P1 move6/P0 move7 owner-swap diamonds are structurally INCOMPARABLE under this bare same-support upset order; no new unrestricted move6/turn8 value or tie certificate. The previously proved literal mirror orbits `{1,7},{2,6},{3,5},{4}` remain the only full-horizon move6 equivalence there. The 7→1 one-layer bounded zero-response-signature quotient MUST NOT be mistaken for future WDL equality.

**NEXT structural proof gate:** turn source-only TWO-PLY value comparisons into a **complete alternating response matching**. To prove P1 first reply `b_h` harder than `b_e` in P0 WDL, certify for EVERY legal P0 response `a_h` to `b_h` some matching P0 response `a_e` to `b_e` with full-future source value order, preserving move/terminal/legality guards. Same-support ownership swapping currently matches only `a_h=b_e, a_e=b_h` and cannot cover all other replies. Search a source cofactor-preserving transport/simulation ACROSS DIFFERENT SUPPORTS (possibly existing G2 future-chain iso plus favorable-upset dominance), then prove closure by source-local algebra rather than branching over future games. Weak dominance cannot discard possible tied-best literal labels.

Primary theorem and exact accounting:
`docs/research/2026-10-17-full-future-two-ply-cofactor-simulation.md`.
Producer and independent physical/q conformance:
`research/isograph/discovery/2026-10-17-dual-obligation-quotient/two-ply-owner-swap-simulation.mjs`,
`two-ply-owner-swap-control.mjs`,
`TWO_PLY_OWNER_SWAP_RESULTS_0_1.json`.
Resource envelope unchanged; full standard7x6 `44444` WDL and exact best-move set remain UNKNOWN, no authority promotion/merge.

## Refocused primary research: eliminate adaptive strategic branching — 2026-10-17

**Explicit renewed owner priority:** Do NOT optimize yet another action-QBF/BDD encoding, source-gate GC, variable order, or larger fixed-depth support cone as the default experiment. The target is an exact **source-derived, future-stable adaptive response equivalence/dominance certificate** that removes whole universal/existential strategic obligations BEFORE independently evaluating successor values, while still returning exact W/D/L and **ALL tied-optimal literal moves**. The ordinary recursive/cofactor algorithmic core remains constructively complete; the historic chronological move7/8 transition and bounded turn8 defensive sets are already solved. No turn6/7/8 full-game WDL equivalence has been proved.

**Exact one-layer dual response-obligation theorem:** Given original source-q fixed-horizon P1/P0 response incidence `K_a`, form `S_b={P0 responses a successful after P1 b}`. For one guarded relation, retain the inclusion-*minimal* distinct S_b as the hardest universal replies, preserving **all original P1 labels** as transport metadata. The resulting antichain preserves BOTH `forall b exists a P(b,a)` (each minimal S_b nonempty) and `exists a forall b P(b,a)` (intersection of minimal S_b nonempty), without swapping decision dependencies. Exhaustive 65,536 generic 4×4 binary relations × 16 legal reply masks = **1,048,576** quantifier controls PASS.

**Full independent legal board censuses PASS:** all 2,208 P1-to-move 4×3-c3 states: 5,592→2,546 minimal universal obligations (**54.47% fewer**). All 67,992 4×4-c4 P1 states: 150,246→70,706 (**52.94% fewer**). On the mathematically harder subsets where the bounded `forall b exists a` winning obligation succeeds, reduction is **39.60% (4×3)** and **20.77% (4×4)**. Source cover computation was still required and the new quotient ADDS 46,626 / 1,068,690 bitset operations respectively; **no measured end-to-end source-computation speedup** and no arbitrary-depth reduction is claimed. One-layer minimal widths ≤3 on these boards. All bounded label/quantifier checks agree.

**Load-bearing cross-horizon falsifier:** legal 4×3-c3 source `111` (P1 to move), P1 replies **2** and **3** have IDENTICAL one-layer P0-answer signatures `0x0`, but the independently qualified full exact-q evaluator gives P0 WDL values **+1** versus **0** (win versus draw). The COMPLETE 4×3 P1 census has **220** equal-bounded-signature reply pairs with different full WDL; full 4×4 census has **22,380** such pairs, with legal `1111222234334` replying 3/4 yielding **−1** versus **0**. Therefore bounded equality is NEVER sufficient to claim full-game equivalent replies. On standard7x6 `44444`, the seven P1 replies all have bounded signature `0x0`, yielding ONE bounded obligation class, **not** a seven-way perfect-play WDL class.

**Next exact mathematical gate:** Prove a **guard-complete pointwise future-response simulation**, namely that for every P0 response a and every full future context z, `P(b_h,a,z) ⇒ P(b_e,a,z)`; all future action legality, first-win stopping and time/resource constraints must use a shared correctly totalized domain. By monotonicity of any original alternating quantifier prefix, b_h then weakly dominates b_e for that Boolean WIN/NONLOSS threshold without evaluating b_e as a separate strategic continuation. Both W and N implications are needed to establish weak WDL dominance. **Weak dominance alone cannot remove b_e from the complete tied-optimal move set**: exact equality or a strict quantified value separator must additionally be proved. Construct this pointwise certificate directly from source residual cofactor/support structure, not from a full searched game or a deeper BDD compilation.

**Primary mathematical derivation:** `docs/research/2026-10-17-branch-elimination-dual-obligation-and-future-separation.md`.
Producer/independent generic and legal controls: `research/isograph/discovery/2026-10-17-dual-obligation-quotient/dual-response-obligation.mjs`, `dual-response-generic-control.mjs`, `dual-response-legal-control.mjs`, `dual-response-future-value-falsifier.mjs`.
Machine evidence `DUAL_RESPONSE_OBLIGATION_RESULTS_0_1.json`, `DUAL_RESPONSE_HORIZON_LIFT_RESULTS_0_1.json`.

The full standard7x6 unrestricted `44444` value and complete WDL-optimal action set remain **UNKNOWN [-1,+1]**. No new IsoGraph game-theory authority, solver adoption, resource limit increase, or merge.

## Canonical action-ROBDD output-cone quotient — all k8 action bounds; k9 lower only — 2026-10-16

**New exact structural compression:** From the same guard-complete source-q action-QBF, compile only the deterministic AND/NOT gate ancestors of the requested WIN/NONLOSS threshold output. Every dropped Tseitin gate has a unique total assignment and no path to the selected output; quantified truth and all literal first-action values are preserved. A fixed-order canonical reduced/complemented-edge ROBDD merges identical **Boolean future-cofactor functions**, stronger than syntactic source AND-gate sharing. Stable-handle mark/sweep BDD nodes and last-use source-gate handles preserve the entire first-action labelled vector under the original alternating P0/P1 action prefix. Source first-win, full-column, draw and invalid-move guards are unchanged.

**Independent exact controls:** 47 source/horizon cases, 188 shared first-action threshold projections, **672 literal action checks, 24/24 full-game small-board complete best-move sets** (13 singleton, 11 tied), zero discrepancies. The legal 4x3 prefix `223` preserves TRUE `forall b exists a` but FALSE `exists a forall b` under chronological/reverse ROBDD variable orders. Separate 7x6 physical first-win validation at canonical `44444` checked **601,092 k7** and **3,567,031 k8** physical move transitions, independently confirming every action remains bounded **[-1,+1]**.

**Measured source-bit ROBDD within unchanged caps:** k7 lower/upper TRUE/FALSE threshold vectors COMPLETE at **10,196 / 21,874 BDD Boolean ops** with reverse action-bit order (lower FALSE, upper TRUE). At **k8**, *all* seven literal lower/upper action bounds COMPLETE: lower FALSE using **75,392 BDD ops, 19,354 peak slots**, upper TRUE using **40,220 ops, 15,988 slots**, chronological order. Source-QBF construction and mark/sweep work counted separately. At **k9**, Wlo/Nlo FALSE for all seven labels COMPLETE in **121,999 BDD ops, 39,142 slots**, using only **1,744 of 2,133** source deterministic gate definitions. This agrees with the independently prior-qualified source-owner reflected BDD k9 lower. k9 UPPER action-QBF compilation remains **INCOMPLETE** at 60k nodes under all eight fixed source-only bit orders, before any alternating quantifier elimination. The complete unrestricted WDL / best-action set remains **UNKNOWN**. k10 tested variants are also resource-incomplete; no mathematical minimum-width bound is claimed.

**Scope distinction:** `k8/k9` here means 8/9 ADDITIONAL symbolic plies after historical `44444` (absolute game move13/14), NOT the already solved original chronological move-seven/move-eight **transition** or its exact short-horizon defensive sets. The existing **source-owner reflected BDD reaches k11**, so the new action-QBF canonical cofactor quotient is a substantial improvement over the action-bit AND/NOT projector but not the deepest current bounded-value evaluator.

Frozen theorem/provenance: `docs/research/2026-10-16-action-robd-output-cone-functional-quotient.md`. Producer `research/isograph/discovery/2026-10-16-algorithmic-core/action-robd-output-cone.mjs`; independent tests `action-robd-output-cone-physical-control.mjs`, `action-robd-independent-physical-interval-control.mjs`, `action-robd-quantifier-order-control.mjs`; evidence `ACTION_ROBDD_OUTPUT_CONE_RESULTS_0_1.json` and negative BDD order/GC results. Execution used exact fetched GitHub source in isolated V8, not maintained Node26 or independent external proof assistant.

**Next mathematical target:** an exact quantifier-aware source-factor compilation that performs safe adaptive aggregation **while building the Boolean function**, rather than materializing the complete k9 upper output-cone BDD before its quantifiers. Count genuine source and intermediate work, maintain free first-action variables and full optimal ties, preserve `223` order and first-win/capacity guards. No authority promotion, merge or full-game best-move certificate.

## Guard-qualified local quantifier projection — k7 complete / k8 lower still partial — 2026-10-16

**Primary open research objective remains full exact strategic branch elimination with complete tied-optimal action labels.** A new **proved rule-based local quantifier operator** pushes FORALL through AND, EXISTS through OR (using signed negation duality), and either quantifier past a syntactically x-independent factor, BEFORE materializing both full Shannon cofactor DAGs. Correlated existential-AND and universal-OR cases retain exact Shannon fallback. All source first-win/draw/full-column/invalid-choice guards and chronological adaptive action dependencies remain unchanged; first action is FREE to return all literal labelled values together.

**Qualified bounded controls (Node22 physical, not full Node26):** same 47 source-horizon cases, **188** projections, **672** per-action Boolean threshold checks, zero mismatches; full-game small-board suffixes **24/24 correct WDL and complete optimal sets (13 singleton, 11 tied)**. New independent physical standard7x6 `44444` k7 check: **2,799,124 physical validation transitions**, all **28** action/threshold values agree, zero discrepancies. The candidate itself does no concrete future game search or winning-policy lookup.

**Major positive:** `44444` k7 all FOUR exact **bounded first-action threshold vectors** COMPLETE under the original 60,000-node/300,000 nontrivial Boolean operations/10,000-support/15s limits. Wlo/Nlo FALSE for all seven labels, using **63,757 projected Boolean ops, 6,298 peak nodes**; Whi/Nhi TRUE for all seven, using **166,807 operations, 16,517 nodes**. Additional compaction/evaluation work (not included in Boolean figures) is 268,070 lower / 507,801 upper units. The older action-QBF Shannon projector hit 60k nodes at k7. This is **actual reduced adaptive quantifier evaluation work**, not just compact CNF encoding.

**Remaining open:** all seven move6 actions after `44444` still have intervals **[-1,+1]**, so NO unrestricted game value or complete optimal-action set has been proved there. At k8 Wlo/Nlo are **PARTIAL** after 16/21 inner action bits, 60k nodes and 292,251 Boolean ops; upper thresholds complete TRUE at 20,573 nodes and 208,467 ops, not independently physically checked at k8. The earlier SOURCE-OWNER reflected interval BDD remains ahead at k11 for bounded-value horizon; do not claim the action-QBF is generally fastest.

**Negative follow-on:** A conservative syntactic signed-variable-unateness/common-witness shortcut was proved sound and passed the same physical controls, but saved only **56 counted Boolean ops** at the failed k8 lower wall after **85,612 extra polarity-cache misses**, leaving the 60k cap and unknown outcome unchanged. Keep this as a REJECTED practical default, not a refutation of semantically certified common witnesses.

Primary theorem/test:
`docs/research/2026-10-16-guard-qualified-quantifier-localization-and-action-vectors.md`.
Sound-but-low-benefit negative:
`docs/research/2026-10-16-common-witness-unateness-negative-width.md`.
Reproducible operators/physical controls/measurements:
`research/isograph/discovery/2026-10-16-algorithmic-core/guarded-action-qbf-local-quantifier.mjs`,
`local-quantifier-control.mjs`,
`local-quantifier-k7-physical-control.mjs`,
`GUARDED_LOCAL_QUANTIFIER_PROJECTION_RESULTS_0_1.json`,
`GUARDED_UNATE_WITNESS_PROJECTION_RESULTS_0_1.json`.

**Next:** exact *semantic* dependency/local factor or cofactor-function quotient (not merely syntactic unateness) that shrinks the remaining correlated existential-AND / universal-OR obligations without hiding their enumeration. Preserve `223` noncommutation, literal tied-optimal masks and budgets. No new game-theory authority or merge.

## New exact shared first-action projection — one-pass complete optimal-action sets

**Source-only theorem and Node22 scoped verification, 2026-10-16:** The original guard-complete alternating action-QBF matrix `F_z(a0,...)` can be quantified over **all future action blocks while keeping the first action free**. The resulting function `G_z(a0)` yields every literal legal move's Boolean threshold by direct conditioning, without separate opponent-continuation projection per first move. The ∀/∃ order and guarded first-win/capacity/terminal rules are unchanged. Four such shared functions recover all action value intervals and, where each action interval closes, the exact W/D/L plus **every tied-optimal literal action**.

Independent first-win physical controls: 47 source/horizon cases, **188** shared threshold projections, **672** literal per-action threshold checks (0 mismatches), and 24 complete-game 4x3/4x4 nonterminal suffix positions: **13 unique-best, 11 tied-best, 24/24 exact complete action sets**. Five deliberately uncached separate-per-root-action QBF comparisons show **76.50%–86.71% fewer counted source-plus-projection Boolean work units**, or **68.11%–81.67%** fewer Boolean-plus-charged-GC work units. This is real root-action sharing, **not** demonstrated superiority to cached solvers or to the already stronger source-owner reflected BDD.

Canonical `44444`: all 7 depth6 first-action interval vectors are still **[-1,+1]**. k7 still hits **60,000 retained nodes** after 12/18 inner action bits; unrestricted WDL, all optimal move6/7 values and global nonbranching composition remain OPEN. The independent physical reference explores gameplay only on the *validator* side; the source-QBF projection remains arithmetic on guarded source residuals, though it still expands nested adaptive cofactors.

Primary derivation: `docs/research/2026-10-16-one-pass-optimal-action-vector-quantifier-projection.md`. Exact producer/control/results: `research/isograph/discovery/2026-10-16-algorithmic-core/guarded-action-qbf-first-action-vector.mjs`, `first-action-vector-control.mjs`, `SHARED_FIRST_ACTION_QUANTIFIER_PROJECTION_RESULTS_0_1.json`. No game-theory authority promotion or merge.

## Owner-prioritized open objective — eliminate strategic branching

**Current primary mathematical research objective (2026-10-16 owner clarification):**
derive exact ordinary W/D/L and the **entire legal set of W/D/L-optimal action labels** directly from original residual-state structure **without independently evaluating strategic game continuations**. Return a single move if and only if it is uniquely optimal; otherwise return the full tied-optimal set. Computation may use Boolean gates, proof cases, and bounded action-mask operations; strategic "branch elimination" specifically forbids merely hiding forward continuation/response enumeration inside QBF, BDD, circuits, state support DAGs, or preprocessing. Measure actual construction AND quantifier-elimination work and full action-vector correctness.

This is **the leading open research goal**, not a correction to the existing exact, constructively complete recursive/branching algorithmic core. It neither requires polynomial complexity as an axiom nor promises branch elimination is always possible. Source-anchored reflected BDD k11 remains UNKNOWN; full-depth source-QBF is not yet decided and k7 action QBF projection hits within-bit resource limits. Any exact unavoidable-width lower bound under explicit assumptions is also valuable. Preserve the `223` universal/existential counterexample, first-win/capacity/deadline guards, reflection literal-action transport and original per-compile research budgets.

**Governing priority/success record:**
`docs/research/2026-10-16-branch-elimination-primary-objective.md`.
Continue through GSP-003/004 with source-only simultaneous WIN/NONLOSS action functions, guard-qualified quantifier localization and essential cofactor-width reduction; independently qualify output AND actual saved work rather than expression size alone.

## Constructive algorithmic core — 2026-10-16 (primary research answer)

The owner's corrected definition does **not** require recursion elimination,
branch elimination, polynomial cost, or minimality. Those are optional stronger
properties of an algorithmic core, not its definition.

**The exact ordinary W/D/L + W/D/L-optimal-action-set core is constructively
complete**, by finite-rank induction under qualified q_o congruence,
first-win/draw termination and alternating max/min of exact owner-cofactor
successors. This is a previously established semantic mechanism, now exposed
as a standalone **oracle-independent** constructive evaluator. No new IsoGraph
logic authority or claim ID has been promoted.

Primary proof / distinction:
`docs/research/2026-10-16-constructive-algorithmic-core-completeness.md`.

Evidence:
`research/isograph/discovery/2026-10-16-algorithmic-core/CONSTRUCTIVE_CORE_QUALIFICATION_RESULTS_0_1.json`.

Bounded independent rule-evaluator checks:

- 4x3 Connect-3: 4,631 legal nonterminal states, 11,818 legal edges,
  3,734 exact q states and 0 value/action/cofactor mismatches;
- 4x4 Connect-4: 134,289 legal nonterminal states, 304,574 legal edges,
  34,094 exact q states and 0 value/action/cofactor mismatches;
- standard 7x6: twelve seeded, legal, rank-35 suffix cases, 0 W/D/L or
  action-vector mismatches, without using solved labels.

The implementation is **still recursively branching**, as measured:
10,232 q transitions on 4x3 and 100,764 on 4x4, with many multi-action q
states. Returning one answer tuple `(WDL, set-of-all-WDL-optimal-moves)`
does not itself avoid exploring independent child values.

**Primary continuing research objective (not a prerequisite for the established core):** qualify an exact compressed
alternating-predecessor/antichain operator that *actually reduces separately
evaluated successor computations* while preserving terminal,
realizability/resource/deadline guards. Do not substitute general minimality
proof or turn-six path-by-path verification for this objective.

The older turn-six CPC work below remains an **open, optional test case** for
structural shortcut discovery, not a blocker to identifying the mathematical
core. The empty standard-7x6 root is **not** claimed computed by this
recursive research evaluator. New tests ran in isolated V8; Node26 sustained
qualification and external reproduction remain separate.

## Quantified live-DAG compaction: k6 recovered, k7 transient cofactor wall — 2026-10-16

**Exact structural correction:** A distinct counted live-root audit of canonical `44444` k6 Wlo found only **17,990 reachable AND gates** after 12 action bits, versus 53,025 assigned gate/input IDs (35,017 unreachable historical AND gates). The prior k6 60k *allocated* limit was NOT a semantic cofactor-width obstruction. A frozen exact post-bit live-DAG copier now safely reindexes ONLY reachable AND gates; a signed-edge topological induction proves functional identity. Compaction occurs strictly after both cofactors and the quantified OR/AND have returned, so no in-flight handles are invalidated. Four input-vector mutation checks also pass at every collection.

**Independent physical Node22 controls:** 31 case/horizon combinations, 124 root-threshold attempts, **120 complete with zero physical bounded-value mismatches**, four k8 PARTIAL. At `44444` k6, all four thresholds now finish under unchanged 60,000 peak nodes / 300,000 Boolean operations / 15s: Wlo/Nlo FALSE with **31,064 peak nodes and 216,140 Boolean operations**; Whi/Nhi TRUE with **24,985 peak nodes / 159,697 operations**. The full unrestricted interval remains **UNKNOWN [-1,+1]**. The separately charged k6 *additional* compaction/validation work is **517,861** (lower) and **353,844** (upper) work units; neither figure may be omitted from true total-work comparisons.

**New narrowed wall:** `44444` k7 Wlo/Whi both exhaust 60k retained nodes **within the next cofactor step** after 12/21 completed quantified bits. At the last completed step, live post-GC roots have **26,783** lower / **30,848** upper AND gates; the new within-bit pair construction exceeds remaining headroom BEFORE a safe between-bit collection. k8 also partial. This is a concrete temporary cofactor-product cost under this representation, **not** a mathematical lower bound for all factorized QBF or game strategies. Earlier source-owner reflected interval BDD's k11 remains better for bounded WDL calculation.

Frozen plan, derivation, measurements:
`docs/research/2026-10-16-exact-qbf-live-compaction-transient-width.md`,
`research/isograph/discovery/2026-10-16-algorithmic-core/GUARDED_QBF_LIVE_COMPACTION_PLAN_0_1.md`,
`guarded-action-qbf-project-live-compact.mjs`,
`guarded-action-qbf-projection-live-compact-control.mjs`,
`GUARDED_QBF_LIVE_COMPACTION_RESULTS_0_1.json`,
plus prior `GUARDED_QBF_LIVE_DAG_RESULTS_0_1.json`.

**Next mathematical proof target:** sound guard-complete quantifier localization in factored/source-owner Boolean circuits, performing dependency-independent eliminations before materializing two entire future cofactor subgraphs; measure actual essential cofactor-function width. Do not raise budgets or use game-tree-discovered policy. Qualified recursive exact WDL core remains complete, no unrestricted 44444 winner, no authority revision or merge.

## First actual quantified-action projection: depth-six retained-node wall — 2026-10-16

A separate exact **Shannon cofactor QBF evaluator** now eliminates source-only action bits from the innermost to the outermost block, using OR for P0 EXISTS and AND for P1 FORALL, after substituting deterministic Tseitin definitions. This is a genuine *value-threshold evaluation* operator, not merely a compact CNF wrapper, and constructs no concrete game continuations.

**Node22 independent finite-horizon controls:** 30 cases, 120 projected four-threshold attempts; **118 completed with zero discrepancies** against an independent physical first-win/alternating max-min evaluator. Two P0 lower-bound attempts for canonical `44444` k6 were budget-partial, not wrong.

At `44444` depth5, all four Boolean threshold truths completed: lower FALSE, upper TRUE, hence unrestricted WDL remains UNKNOWN [-1,+1]. The lower projections used 27,563 nontrivial operations and 9,649 retained nodes. At depth6, lower projection exhausted the original **60,000 retained-node limit** after 12 of 18 action bits and 147,262 nontrivial operations; upper projection completed with TRUE using 53,920 nodes / 159,492 operations. No exact root/action value follows from the partial k6 interval. The projector retains dead gates; this is **not** a mathematical lower-bound proof.

Mathematical law, diagnostics, comparator and stop:
`docs/research/2026-10-16-guarded-qbf-shannon-projection-depth6-obstruction.md`.
Producer `research/isograph/discovery/2026-10-16-algorithmic-core/guarded-action-qbf-project.mjs`, separate physical control `guarded-action-qbf-projection-control.mjs`, machine evidence `GUARDED_ACTION_QBF_PROJECTION_RESULTS_0_1.json`. All are current research branch commits.

**Comparative finding:** The earlier source-owner reflected BDD still gets further (k11) than this action-bit QBF projector (k5 complete, k6 lower partial), despite the latter's compact k37 formula. The genuine missing mathematical operation remains sound semantic cofactor merging/structured quantified-width reduction, not another concise formula and not transition correctness. Qualified recursive exact core unchanged, no authority promotion or merge.

## Exact full-depth quantified action representation (value NOT decided) — 2026-10-16

**New rule-only representation theorem:** From a legal nonterminal source q=(h,R0,R1), recurrence-count each column choice with exact Boolean counters, derive landing/owner and first-win residual guards, and build four P0-relative lower/upper WIN/NONLOSS matrices over alternating **binary-coded column actions**. Illegal P0 existential decisions return FALSE, illegal P1 universal decisions TRUE; terminal outcomes absorb remaining actions. Stage-local deterministic Tseitin existential auxiliaries are safely introduced only after their last transitive action input. By induction this yields a polynomial-size CNF QBF **truth-equivalent** to the bounded Bellman threshold. At all 37 remaining plies of canonical `44444`, the QBF truth is equivalent to unrestricted ordinary game WIN/NONLOSS, **but it has not been evaluated**.

**Full `44444` representation:** k37: **12,436 variables, 36,976 CNF clauses, 35,473 real CNF primal edges, 12,325 deterministic auxiliary gates; no enumerated support representatives**. An explicit *trivial-poset, one-trunk path decomposition* satisfies Ganian/Gründel's P1 (reverse prefix) or P2 (forward prefix) by construction. Its **stage-local bilateral-width UPPER bound is 232** versus **1335** for postfix auxiliary scope; neither width is minimal or guarantees affordable QBF solving. k12: 3,270 variables, 9,703 clauses, stage-local width upper bound 184. This crosses the prior 13,524-support-orbit REPRESENTATION ceiling, not the uncomputed WDL/quantifier-elimination frontier.

**Bounded independently replayed controls:** Node22 physical first-win oracle-blind source controls on 4x3-c3, 4x4-c4, standard7x6: **78 compiles, 24,804 independently checked action words, 99,216 Boolean threshold checks, 312 independently aggregated alternating scope checks, 108,888,000 deterministic CNF clause truth checks; 0 mismatches.** Separate full-horizon samples: 1,024 physical words (29 P0 wins, 22 P1 wins, 452 invalid P0 and 521 invalid P1 first-violations), zero mismatches; both aux scopes pass **12,325 defining-gate causal precedence checks**.

**Actual work accounting:** 54,320 charged gate/CNF Boolean work units at k37, below the original 300k nontrivial-Boolean-op cap, plus **456,025** prefix-stage gate-record predicate scans, 86,276 CNF literal visits, 61,625 primal-pair examinations, 141,892 adjacency scans, 70,946 edge coverage checks, and 49,744 path-loop iterations. Do NOT present the Boolean-only count as all-work. The two-schedule structural diagnostic completed locally in **89 ms** under the 15s limit; no value decision speed is claimed.

Primary deductive proof and limitations:
`docs/research/2026-10-16-guarded-action-qbf-full-depth-width.md`.
Executable candidate/harness and evidence:
`research/isograph/discovery/2026-10-16-algorithmic-core/guarded-action-qbf.mjs`,
`guarded-action-qbf-control.mjs`,
`guarded-action-qbf-width-probe.mjs`,
`guarded-action-qbf-full-prefix-control.mjs`, and
`GUARDED_ACTION_QBF_RESULTS_0_1.json`.

**Next real mathematical obstacle:** implement/qualify **quantifier elimination/strategy-extension** over that formula within the 60k-node/300k-Boolean-op/10k-support/15s envelope, preserving all decision dependencies and counting residual cofactor growth. A full formula is not a finished game WDL solver. The original exact recursive core is unchanged and complete; `44444` remains UNKNOWN [-1,+1]. No new IsoGraph game-theory authority or merge.

## Proof literature continuation and exact response-closure falsifier — 2026-10-16

**Newly reviewed primary theorem:** Ganian and Gründel, *Bilateral Treewidth for QBF: Where Strategies and Resolution Meet* (SAT 2026), supplies an exact FPT quantified-elimination method using a sound dependency poset, **full guard-complete CNF**, and a **trunk-aligned tree decomposition**. Its proof combines Q-resolution/universal reduction and bounded strategy extension. These prerequisites have **not** been established for the `44444` game-value circuit; the previously reported primal residual min-fill width 15 is not bilateral QBF width.

**New exact local theorem/test:** Galois closure recovers *any* finite action-labelled P0-response/P1-reply Boolean relation as its all-maximal all-ones rectangles without swapping `forall b exists a` and `exists a forall b`. Source `223` retains the prior independent physical response masks and both asymmetric quantifier results. An exact committed producer/harness completed **65,536** possible 4×4 relations and **1,048,576** legal-mask predicate checks, plus **100** seven-action cases: **zero discrepancies**. Files byte-identical to the committed Git blobs were executed under **Node 22.16.0**, in addition to isolated V8 controls. The largest 4-action compile used **175** counted operations.

**Important negative representation result:** The `223` relation's minimal Boolean rank is **3**, while its canonical set of maximal Galois rectangles has **4** elements. Across all 4×4 matrices, the maximal concept set was **larger** than the distinct action-row basis in **32,916 / 65,536** cases; among the 7-action seeded cases it reached **29 concepts for 7 rows**. Therefore *all maximal Galois concepts* are **not** a generally compressed normal form. This does not rule out a smaller chosen rectangle cover or a dependency-aware hybrid factor circuit.

Proof, primary citations, hierarchy and next conditional QBF factor experiment:
`docs/research/2026-10-16-bilateral-treewidth-and-galois-response-closures.md`.
Operator/control/evidence:
`research/isograph/discovery/2026-10-16-algorithmic-core/adaptive-galois-factor.mjs`,
`adaptive-galois-factor-control.mjs`,
`ADAPTIVE_GALOIS_FACTOR_RESULTS_0_1.json`.

**Unchanged:** the recursive source-q WDL core is complete; `44444` remains `UNKNOWN [-1,+1]` at eleven further plies, depth12 support count still 13,524 > 10,000. No deep adaptive-composition compression, new unrestricted game result, authority change, or merge is claimed. Preferred next gate: prove guarded full QBF translation with explicit action dependency and test actual bilateral decomposition/interface width, rather than further brute support expansion.

## Mathematical logic proof search — new exact candidate interface — 2026-10-16

Per owner directive, research was conducted in **general mathematical
proof literature**, not Connect Four literature or cross-domain
analogies. The strongest relevant theorems concern (a) sound
dependency-qualified quantifier localization, (b) Boolean relation
rank/rectangle factorization for adaptive action-response covers,
(c) OBDD width as the number of distinct essential future
Boolean cofactors, and (d) structured-circuit treewidth/quantified
width upper and lower bounds.

The existing `44444` source-q mirrored BDD can compile eleven
future plies but remains [-1,+1]. Its depth12 cone needs 13,524
canonical supports, exceeding the experimental 10k cap.
The literature points to a more mathematically meaningful objective
than raw support-count reduction:

**Derive a sound factored representation of adaptive P1/P0 response
relations from source residual requirements, retaining legal
first-win/action dependencies; measure the actual width of
distinct cofactor functions crossing each quantified boundary,
and attempt quantifier localization only where dependency
independence is proved.**

A concrete pure Boolean-rank calculation on existing physically
verified 4x3 `223` response masks [0xe,0x4,0xe,0x7] gives an
**EXACT three-rectangle factorization**, with a matching
three-element fooling-set lower bound. It preserves
`forall b exists a` without incorrectly swapping the quantifiers.
This is a test for a proposed descriptor, **not** a proof of
efficient arbitrary-depth composition.

A separate exact geometry/residual hypergraph diagnostic at
`44444` found 37 future-cell variables and 90 total
minimal residual requirements (48 P0,42 P1), with 198
primal graph edges and one connected component. A deterministic
greedy min-fill order gives **treewidth upper bound 15**, NOT
an exact width or an impossibility theorem. After center fills
(`444444`), the raw hypergraph is STILL connected. This
rules out a trivial disconnected-component split of the
displayed requirements, not algebraically equivalent or
conditional-separator factorizations; terminal/turn/capacity
guards introduce further quantified dependencies.

Main theorem/literature record:
`docs/research/2026-10-16-general-mathematical-quantifier-width-proof-search.md`.
Reproducible diagnostic:
`research/isograph/discovery/2026-10-16-algorithmic-core/RESIDUAL_DEPENDENCY_WIDTH_PROBE_0_1.json`
and `residual-dependency-width-probe.mjs`.
Updated continuation:
`next_step.yaml:general_mathematical_proof_research_20261016`.

**No new WDL label or guaranteed polynomial/nonbranching solver is
claimed.** Full ordinary recursive core and qualified authority
are unchanged. No production integration or merge performed.

## Source-anchored interval W/D/L algebra and mirror-orbit cone — 2026-10-16

**New qualified bounded-source candidate:** a four-threshold WIN/NONLOSS
lower/upper Bellman BDD over only future owner variables. At a nonterminal
support cutoff return UNKNOWN [-1,+1]; compose P0 OR / P1 AND
cofactors, exact first-win/draw rules, and all literal action intervals.
By finite-rank monotonicity, each interval encloses actual unrestricted
W/D/L. When bounds meet, the value is EXACT; retain incomplete action
sets as UNKNOWN rather than inventing WDL equivalence. No concrete q
game-state search or winning-policy lookup enters compilation.

Primary derivation and correction:
`docs/research/2026-10-16-source-anchored-interval-and-reflection.md`.
Candidate:
`research/isograph/discovery/2026-10-16-algorithmic-core/bounded-support-interval-bdd.mjs`.

**Qualified controls:**

- On standard7x6 source rank20 `43214636342357317661`, P0
  is already WIN at cutoff depth **1**, with **all seven first-move
  values exact by depth 2**: unique winning column **5**.
  The initial depth4 result was CORRECT but **not strategically deep**;
  a complete independent q solve agrees (79,697 q states,
  351,153 edges), plus direct physical validation.
- Standard rank14/16/18 also certify exact P0 WIN by depth2,
  with optimal columns (1,5), (5), (5) respectively. The full q
  references hit their fixed 800k-edge budgets; separate direct
  physical depth2 validators checked all literal actions and passed.
  Across nine physical finite-horizon controls, **2,089**
  move checks, no discrepancies.
- **90** cross-horizon symbolic computations across **19** legal
  input states found zero interval containment/monotonicity/action
  errors. One predeclared 4x3 `112233` fixture correctly rejected
  as already terminal; 4x3 empty root stays UNKNOWN until depth12.
- Standard7x6 rank10 and canonical `44444` remain **UNKNOWN
  [-1,+1]** through ordinary bounded depth9 despite correct
  local q and turn7/8 cofactor dynamics.

**Exact horizontal reflection reduction** applies ONLY if original
q=(h,R0,R1) is completely mirror invariant. The compiler generates
canonical support-orbit representatives directly and transports
mirrored child owner variables via ordered Shannon ITE (not naive
BDD variable-ID swap). It preserves every literal action interval.
Small-board full-root and symmetric `1243` action values match
independent q exactly. A legal symmetric-height but asymmetric-R
`1234` control is rejected.

**Under the unchanged limits** 60k BDD nodes, 300k nontrivial
operations, 10k compiled support orbits and 15s:
- canonical `44444` k9: 3,934 orbits (7,798 ordinary supports);
- k10: 6,216 orbits (12,341 ordinary); still UNKNOWN;
- k11 with **source-residual-frequency static variable order**:
  **9,366 orbits** (18,620 ordinary support states),
  **16,511** peak nodes, **268,341** BDD operations,
  completed with UNKNOWN outcome. Row-major/column-major k11 hit
  300k operation cap.
- k12 would need **13,524** mirror-orbit supports (26,908 ordinary)
  and remains OUT OF SCOPE beyond the old 10k cap. No resource
  inflation or arbitrary turn6/turn7 WDL claim.

Evidence:
`BOUNDED_SUPPORT_INTERVAL_RANK20_RESULTS_0_1.json`,
`BOUNDED_SUPPORT_INTERVAL_CROSS_HORIZON_RESULTS_0_1.json`,
`BOUNDED_INTERVAL_PHYSICAL_RESULTS_0_2.json`,
`BOUNDED_INTERVAL_HORIZON_SENSITIVITY_RESULTS_0_1.json`,
`REFLECTION_BOUNDED_SUPPORT_INTERVAL_RESULTS_0_1.json`,
`REFLECTED_INTERVAL_VARIABLE_ORDER_RESULTS_0_1.json`
in `research/isograph/discovery/2026-10-16-algorithmic-core/`.

**Current open mathematical objective:** compact exact repeated
composition of adaptive action-labelled response covers beyond
ordinary support plus horizontal reflection, or a lawful multi-ply
cofactor/interval aggregation that does not materialize every support
orbit. Full arbitrary-depth computational branch elimination, early
7x6 perfect-play WDL at `44444`, polynomial scaling, and formal
minimality remain OPEN. Existing complete recursive/branching q
algorithmic core is unchanged and remains valid.

Research code executed with isolated JS V8 source tests only,
not maintained Node26/CI or an independent external reproduction.
No merge or qualified IsoGraph authority promotion.

## Column completion and all-depth residual transitions — 2026-10-16

The owner asked whether the **filled-column transition around moves 7
and 8** is genuinely a new kind of structural mechanism, and directed
testing to completion. The answer is now **NO for residual-state
transitions**: the ordinary owner-true/false q-cofactor algebra and
support/capacity guards handle both filling and later ranks without a
new primitive. **Yes, arbitrary-depth strategic-value composition is
still separately OPEN.**

- Starting at standard7x6 `44444`, all seven legal P1 move6, 48
  P0 move7 and 324 P1 move8 continuations were tested with independent
  physical cofactor, phase and source-upset controls: **384**
  physical/q transitions, **122,928** virtual-upset equalities,
  zero mismatches. Center column 4 first fills at moves 6,7,8
  on exactly 36 continuations each; 216 do not fill by move8.
  The 324 rank8 histories collapse to **219 distinct q**.
- The direct **source-q five-ply** operator was exact against all
  48 constructed rank7 response-cover objects, with no intermediate
  successor q in the candidate. Across the 324 rank8 states,
  its response-cover predictions agree with independently computed
  two-own-move P0 winning-action sets: zero disagreements.
- The six P0 move7 actions following `444444` form **three horizontal
  reflection pairs**, and the algebra gives precise P1 move8
  short-horizon defensive masks. It has **NOT** determined full
  perfect-play-optimal P1 move8 choices or W/D/L equivalence of
  all move7 options. All seven P1 move6 children have no P0 action
  forcing a win within P0's first three subsequent turns, which
  does not determine eventual WDL.
- **General path owner-mask cofactor identity:** for legal nonterminal
  source q and any legal future owner-labelled cell sets A0,A1,
  `Ri_after = Min({r\Ai : r in Ri_source and r∩A_other=∅})`.
  Future-upset queries are read directly from source. Only
  gravity/support and first-win chronology remain prefix-sensitive.
  Verified in **90 complete legal 7x6 games**, including **eight
  rank42 full-board draws**; every rank 1..42 visited, **2,549**
  independent nonterminal q checks, **10,812** source-upset
  queries, **291** full-column events, zero disagreements.
  A preceding 97-game run stopped under fixed 20k physical-move
  budget and was preserved separately; resources were not raised.
- Negative controls reject omitted opponent-blocker requirements,
  using phase=even as a legality predicate on full column 4,
  and identifying distinct rank7 positions solely from phase weight.
- **Load-bearing strategic-value gap:** empty 4x3 Connect-3 is an exact
  P0 WDL win under the complete q core, but the independently
  verified five-ply bounded algebra proves **no P0 win by its
  first three own placements** (all first actions fail). Thus full
  transition correctness does **not** imply a complete nonbranching
  value evaluator.

Main proof and evidence:
`docs/research/2026-10-16-column-completion-through-full-game.md`,
`MOVE7_MOVE8_COLUMN_CLOSURE_RESULTS_0_2.json`,
`ALL_DEPTH_OWNER_MASK_RESULTS_0_1.json`,
`SHORT_HORIZON_VS_FULL_WDL_GAP_RESULTS_0_1.json`,
`ALL_DEPTH_TRANSITION_NEGATIVE_RESULTS_0_1.json`, under
`research/isograph/discovery/2026-10-16-algorithmic-core/`.

**Next mathematical target:** compact composition of *action-labelled
adaptive response-cover antichains* for arbitrary alternating depth.
The full-column state transition should no longer be treated as a
separate unknown. Do not misclassify validation search or finite
horizon response masks as a full-game solving method.
This remains internally qualified V8 research, not maintained Node26
or a new IsoGraph authority. The exact branching/recursive
algorithmic core stays complete regardless.

## Exact four-ply response covers — 2026-10-16

**New optional algebraic result (not a new core requirement):** The
`P1 FORALL / P0 EXISTS / P1 FORALL / P0 immediate-win EXISTS`
four-ply fixed-horizon strategic predicate is directly calculable from
the **original** (h,R0,R1) with only source singleton/pair residuals.
A P0 action-indexed **P1 reply-cover mask family K_a** captures the
adaptive choice; exact universal success iff the union of all K_a
equals the original legal P1 mask. The operator scans at most O(W^3)
local source-residual membership relationships (real work), but
constructs **zero** q successor states or recursive game-value
continuations.

**Qualification/limits:**
- Complete 4x3 and 4x4 small-board P1 domains: **70,200 source q
  positions** and **310,120 (b,a) response rows** checked against
  the independent one-step child-q two-P0-turn cofactor reference,
  with **zero** response-mask mismatches.
- Separate literal physical first-win checker: **33,709**
  P1 states (complete 2,208/2,208 on 4x3, bounded 31,501/67,992
  on 4x4 within frozen 800k move budget), zero mismatches.
  Do not call the partial 4x4 physical check exhaustive.
- Reference constructs **133,392** P1 child q objects in this
  comparison; the direct original-q operator constructs zero,
  while performing **3,438,998** hashed residual-membership probes.
  This is not a measured universal runtime speedup.
- Standard7x6: `44444` and 12 seeded legal rank35 P1 positions
  passed explicit physical, child-q and horizontal-reflection checks;
  bounded four-ply cover at `44444` is empty, **not** an
  eventual game-outcome conclusion.
- Deliberately omitting source P0 or P1 size-two antecedents produced
  falsifiers on legal physical states.

**Important obstruction discovered:** the quantified choice order
**P1 b first, P0 a second** requires tracking who covers whom.
For legal 4x3 history `223`, the source-derived covers are
`K=[0xe,0x4,0xe,0x7]`, legal mask `0xf`: their union covers
all P1 replies, but no single P0 action does. The physical checker
independently verified this; **2,584** positions in the complete
two-game matrix show the same adaptive-only property. Thus collapsing
a cover family to its union is **unsound** for a later
`EXISTS P0 / FORALL P1` composition. The inclusion-maximal
(nonzero) cover-antichain preserves the relevant two scope queries
without keeping dominated action rows: **30,540** nonzero
covers -> **25,446** maximal masks across all 70,200 P1 states.

The new **bounded source-degree observation** is that at most
k additional claimant placements can complete only original
residual requirements of size <=k; prepending an opponent action
does not itself raise the claimant residual degree. The actual
difficulty is adaptive-response correlation, not an immediate
degree-three requirement for this four-ply operator.

Primary research:
`docs/research/2026-10-16-response-cover-next-quantifier-law.md`.
Machine evidence:
`research/isograph/discovery/2026-10-16-algorithmic-core/UNIVERSAL_RESPONSE_COVER_RESULTS_0_1.json`,
`UNIVERSAL_RESPONSE_COVER_7X6_RESULTS_0_1.json`, and
`RESPONSE_COVER_QUANTIFIER_SCOPE_RESULTS_0_1.json`.

**Next vertical law:** lift the **full action-labelled maximal
cover family**, not the bare union, through one preceding P0
true cofactor using exact virtual residual-upset substitution and
existing RBA semiring/adjoint identities. It must avoid full
fifth-ply move-word enumeration, retain terminal/response resource
guards, and measure mixed-cover width and computation. Existing
recursive/branching W/D/L algorithmic core remains fully
satisfactory even if this preferred property remains OPEN.

## First exact algebraic quantifier fusion — 2026-10-16

**Substantive optional nonbranching progress** without a search-generated
policy: from qualified support/antichain/cofactor and first-win geometry,
two *fixed-horizon* strategic quantifier operations are now derived and
independently tested.

1. For **P1 to move**, compute in ONE operation the entire literal P1
   reply-action mask which leaves P0 an immediate first win. It depends
   only on P0 current singleton threat mask T, P1 immediate-win mask B,
   and P0 upper-latent threat mask U; no P1 child q states are
   constructed. An exact monotone Boolean polynomial has at most
   W(W-1)/2 + W + 1 terms plus first-win guards.
2. For **P0 to move**, pull this predicate directly through one P0
   owner-true/false cofactor using only ORIGINAL source residual
   requirements of sizes 1 and 2. The resulting **P0 OR / P1 AND /
   P0 immediate-win OR** decision returns all P0 first actions that
   guarantee a win on P0's first or second own move. The algebra
   scans literal P0 labels locally but does NOT construct any child
   q or recursively search opponent continuations.

**Independent physical qualification:**

- all **70,200** legal P1-turn states on complete 4x3 Connect-3 /
  4x4 Connect-4 controls: exact next-P0-immediate-win favorable
  response masks with zero errors;
- the independent factored monotone polynomial agrees on all
  70,200 states;
- all **68,720** legal P0-turn states in the same two full games:
  exact within-two-P0-moves qualifying action set, zero errors,
  against both direct physical rule continuations and the separately
  written one-step q-cofactor/fusion reference;
- 160,554 P0 candidate first actions checked. The reference
  constructed 143,280 intermediate child q objects; the direct
  algebra constructed **zero**. Residual membership tests and
  literal P0 action scanning are explicitly counted, not hidden;
- deletion of size-two antecedents, exposed upper threat or P1
  immediate-win guard caused actual physical counterexamples;
- standard7x6 short-horizon spot control: 13 P1 states / 19 P0
  states (including `44444`, all seven rank6 replies and 12
  independently sampled late positions with predecessors), plus
  reflection and direct physical crosschecks: zero mismatches.
  No forced next-two-P0-own-move wins were found at the seven
  `44444` rank6 children, as required by local lower-bound geometry.

Mathematical proof/scope:
`docs/research/2026-10-16-local-alternating-quantifier-fusion.md`.
Raw controls:
`research/isograph/discovery/2026-10-16-algorithmic-core/UNIVERSAL_ONE_REPLY_POLYNOMIAL_RESULTS_0_1.json`,
`DIRECT_TWO_MOVE_PULLBACK_RESULTS_0_1.json`, and
`STANDARD7X6_LOCAL_FUSION_RESULTS_0_1.json`.

**Hard limit:** exact nonbranching composition has been shown only for
this fixed one/two-P0-own-move horizon. This is NOT a full 7x6
perfect-play theorem, a no-recursion result, or a universal
polynomial-size alternation closure. The established recursive/branching
algorithmic core remains valid. The earlier 46/47-generator
search-produced winning proof remains **validation only**.

**Next vertical target:** derive, without enumerating action words,
the exact guarded universal preimage of this direct
two-own-move P0-winning region through one further P1 move.
Study necessary degree-three source residuals and mixed reply
correlations using the existing adjoint/antichain-semiring laws.
Test against the small-board q reference **only after the algebra
is derived**, and record intermediate symbolic width as well as
actual independent continuation work. Avoid reverting to
policy-search-based proof generation.

## Optional symbolic branch-work experiment — 2026-10-16

**Primary algorithmic core completeness remains established and unchanged.**
This is a distinct optional efficiency/branch-composition investigation, not
a missing game-theory correctness primitive.

One fixed-support symbolic threshold compiler expresses P0 WIN and NONLOSS
as shared **un-distributed AND/OR circuits** over residual-upset coordinates.
It constructs no concrete-q recursive solved values. Three supports on
4x3 c3 / 4x4 c4 passed exact W/D/L and all optimal-action vectors on
260 legal physical positions and 384 seeded abstract residual-antichain
controls, with no discrepancies.

An exact opt-in support-poset implication/absorption reduction decreased
**final reachable** gates from 301->229, 6163->2851 and 482->407.
These count only reachable final circuits, not the much larger transient
allocation. The independent comparator rejects a corrupted P1 first-win
terminal guard on each support.

**Important negative:** even the small empty 4x3 c3 root failed to compile
under the predeclared 60,000 allocated-gate cap with and without the
simplifier. The representation still recursively visits multiple child
supports and its AND/OR circuit carries choice fanout. Therefore **global
branch elimination is still OPEN**; returning a circuit is not by itself
proof of avoided computational branching.

Primary results/limits:
`docs/research/2026-10-16-nondistributed-symbolic-alternation.md`.
Machine record:
`research/isograph/discovery/2026-10-16-algorithmic-core/SYMBOLIC_POSET_ABSORPTION_RESULTS_0_1.json`.

**Next vertical target:** reduce *transient and peak construction work* on
one fixed root suffix by output-sensitive Boolean/antichain composition;
retain the existing budgets and exact first-win constraints. Do not reopen
minimality, recursion elimination, complete 7x6 root search or per-path
`44444` proofs. This remains an internal V8 research control, not an
accepted Node26 performance qualification or IsoGraph authority promotion.

## Method boundary: search is validation, not branch elimination — 2026-10-16

**Owner correction:** The 46/47-node 4x3 root-win certificates were
**constructed through forward game-tree search**, then independently
verified backward. Their compactness establishes that the result can
be certified cheaply; it does **not** establish a nonbranching solving
method. Keep both artifacts and their negative controls as validation
fixtures, not as a proposed solver or inputs to a structural algorithm.

The **existing exact recursive/branching residual-q core remains a
complete algorithmic core**; it need not eliminate either recursion
or branching. Optional preferred improvement: derive from the
qualified game structure an exact algebraic alternating-choice
transformer which does not discover winning policy choices by
recursively searching separate game continuations. It may recurse
on one structural descriptor and may return a set of equivalent moves.

A compact proof, single returned value, AND/OR wrapper or symbolic
circuit is **insufficient** to claim computational branch elimination
if it conceals independent game continuations in construction.

New research must derive the operator without consulting the
search-generated P0 policy. Afterwards, use the known 4x3 proof,
the 38 opponent replies, the q-only reference, and oracle comparisons
as falsifiers/validation. Track independent child evaluations,
intermediate front widths, proof-generation work and verification
cost separately. If the operator does not close, preserve the
missing mathematical law; do not deepen forward search.

Current routing: `next_step.yaml:branch_elimination_research_boundary`
and the correction in
`docs/research/2026-10-16-input-specialized-winning-region-certificate.md`.

## Input-specialized backward P0-win proof — 2026-10-16

**Confirmed scoped positive result:** Starting only with the concrete empty
4x3 Connect-3 root, a rule-only P0 policy candidate and independently
checked residual-generator proof DAG certify **P0 WIN via column 2
(one-based)**. This certifies one opening and all opponent replies,
not the full W/D/L value function or all equal-valued moves.

- 46 reachable winning-region generators, 72 certified edges.
- P0 one-action policy: 34 nodes; P1 universal response: 12 nodes,
  38 explicitly verified opponent reply actions.
- 22 direct terminal P0 wins, 49 exact q references and **one**
  nonidentical P0-favorable dominance reference.
- 51 producer obligation visits, 72 attempted actions, zero failed
  P0 policy guesses in this scoped discovery.
- Checker independently replays 230 physical source-path moves, verifies
  legal gravity/first-win q and all 72 backward cofactors; no recursive
  WDL game solving or external oracle during verification.
- Matched winner-only candidate with favorable dominance disabled
  certifies the root with **47** generators and **73** edges. Only
  one generator/edge was saved by order-based reuse; the major saving
  relative to the previously solved full WDL reference comes from
  **specializing the desired proof**, not generally eliminating branching.
- The independent checker rejected five deliberate defective
  certificates, including an omitted P1 reply, a wrong terminal
  and a false same-support dominance transport.
- The oracle-free full W/D/L reference agrees on the outcome and
  independently reports all four opening columns as W/D/L-optimal,
  after—not during—certificate construction.

Primary record:
`docs/research/2026-10-16-input-specialized-winning-region-certificate.md`.
Reproducible certificate and readback:
`research/isograph/discovery/2026-10-16-algorithmic-core/INPUT_SPECIALIZED_ROOT_WIN_CERTIFICATE_0_1.json`
and `INPUT_SPECIALIZED_PROOF_CONTROL_RESULTS_0_2.json`.
A second fully persisted **direct-only 47-node / 73-edge** proof
(`INPUT_SPECIALIZED_DIRECT_ONLY_ROOT_CERTIFICATE_0_1.json`)
uses **zero** favorable-order references; all 50 nonterminal edges use
literal q equality, independently establishing the same root win.

**Branch elimination remains OPEN.** The producer still recursively
checks obligations, and its P1 universal cases branch in the proof
graph. Next vertical target: a guarded output-sensitive inclusion
operator that discharges the same 38 P1 actions without explicitly
evaluating each independent future state; count all construction,
quantifier, memory and verification work. No minimality, full-frontier,
or standard7x6 root extension is authorized by this scoped result.

## Active turn-six parity-control certificate frontier — 2026-10-16

This is a **scoped current research update**, not a change to qualified
game-theory authority 1.2, the legacy RBA campaign, or solver implementation.

Primary record: `docs/research/2026-10-16-turn6-bidirectional-certificate-campaign.md`.

- The `44444` oracle-blind q cofactor control covers all seven literal P1
  replies and finds four exact mirror/support classes.
- All seven P1 responses have a compact directly checked finite **P1 delay
  certificate through the next three P0 turns**. This is not a P1 draw/win
  proof or an outcome oracle.
- New **positive** P0-winning region seeds are exactly certified at
  `44444422`, `44444426`, and `44444427` by P0 action 3, producing two
  legal immediate winning landings; those fork certificates check all six
  subsequent P1 replies.
- The earlier `4444442` winning claim remains **OPEN** for P1 interventions
  1,3,5. P1 actions 1/5 directly block the sole P0 terminal landing; action
  3 produces a latent diagonal completion at c5,r4 (one-based) with three
  gravity prerequisites and a P1 zero-reservation CPC phase. No guarded
  P0 ownership correction or alternative full strategy is yet certified.
- **Next vertical experiment:** derive one guarded CPC/WSL/NDC
  resource/response/deadline certificate for each of those three missing
  P1 interventions, or independently certify an alternative P0-winning
  successor. Do not reconstruct rank-complete W/D/L shells or widen
  unbounded game search.
- Code, tests, raw positive and negative evidence are in
  `research/isograph/discovery/2026-10-16-oracle-compiled-frontier/`.
  Execution to date is internal V8 source qualification; maintained Node26
  and independent oracle cross-check for eventual turn-six win remain pending.

## Current semantic authorities

Current qualified Connect4 **game-theory / logic** authority:

- `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_2.md`
- `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_2.isg`
- `research/isograph/CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_2.json`

Qualification and promotion:

- `research/isograph/qualification/FINAL_QUALIFICATION_REVIEW_1_2.md`
- `docs/decisions/2026-09-19-isograph-logic-authority-1-2.md`

Current qualified IsoMax hot-loop performance-research authority:

- `research/isograph/optimization/ISOMAX_HOT_LOOP_GRAPH_AUTHORITY_0_3.md`
- `research/isograph/optimization/ISOMAX_HOT_LOOP_GRAPH_0_3_QUALIFICATION.md`

Historical Connect4 IsoGraph authority 1.1 remains immutable full-corpus qualification/provenance evidence:

- `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_1.md`
- `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_1.isg`
- `research/isograph/CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_1.json`

Authority 1.1 is no longer the active game-theory interpretation. Pre-alpha replacement is direct: no compatibility adapter, dual active semantics, or fallback identity layer. Unknown and unresolved material remains explicitly represented in the current owner rather than treated as absent or false.

## Current authority routing

Pre-alpha research no longer composes the old NEI/RBA/hot-loop overlay stacks as active semantics.

For current game-theory research, use the qualified 1.2 authority and its exact promoted package:

- `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_2.md`;
- `research/isograph/CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_2.json`;
- `research/isograph/successor/CONNECT4_GAME_THEORY_1_2_CANDIDATE.md`;
- `research/isograph/successor/CONNECT4_GAME_THEORY_1_2_CANDIDATE.json`;
- `research/isograph/successor/CONNECT4_GAME_THEORY_1_2_CANDIDATE.isg`;
- `research/isograph/successor/CONNECT4_GAME_THEORY_CLAIM_COVERAGE_1_2_CANDIDATE.json`.

For current **qualified** IsoMax hot-loop semantic/performance research, use:

- `research/isograph/optimization/ISOMAX_HOT_LOOP_GRAPH_0_3_CANDIDATE.md`;
- `research/isograph/optimization/ISOMAX_HOT_LOOP_GRAPH_0_3_CANDIDATE.json`;
- `research/isograph/optimization/ISOMAX_HOT_LOOP_GRAPH_0_3_CANDIDATE.isg`.

The game-theory 1.2 package is promoted as the sole current game-theory/logic authority by `CONNECT4_LOGIC_AUTHORITY_1_2.md` and `FINAL_QUALIFICATION_REVIEW_1_2.md`. The hot-loop 0.3 package is promoted for current performance-research use and has no gameplay-authority effect. Hot-loop realization is additionally governed by `research/isograph/optimization/ISOMAX_HOT_LOOP_NEES_REALIZATION_AUTHORITY_0_2.md`, pinned to NEES Draft 0.3; this changes realization obligations only.

Authority 1.1, the old applied NEI overlay, RBA overlays/QU/topology overlays, and hot-loop 0.1/0.2 graph/NEI layers remain historical provenance/evidence only.

Full DP-01..DP-45 re-discovery on the cleaned successors is complete:

- `research/isograph/discovery/CLEAN_SUCCESSOR_DISCOVERY_0_2.md`;
- `research/isograph/discovery/CLEAN_SUCCESSOR_DISCOVERY_0_2.json`.

The first clean pass was superseded after independent q-congruence reconstruction exposed a required `q_o`/`q_r` distinction. The corrected 0.2 rerun records that defect and its repair. The hot-loop successor still requires no NEI SAME/DISTINCT result at all.

The q review is `research/isograph/qualification/Q_CONGRUENCE_INDEPENDENT_REVIEW_0_1.md`. Old-NEI concept coverage is recorded in `research/isograph/qualification/CLEAN_NEI_REINTEGRATION_COVERAGE_0_1.json`; this is an audit, not a compatibility layer.

Both successors use qualified NEI 0.4 authority from `iteathen/isograph@55c98d31dd2715cdb48abe4f8e313fd72d0dabba`:

```text
facts + constraints + evidence + QU
    -> admissible identity models
    -> derived SAME / DISTINCT / UNKNOWN
```

No profile-declared identity answer is active in the successors. No Bayesian identity weight is invented from test counts; Bayes/log-Bayes evidence requires a qualified likelihood model.

The Core-0.18 sanity correction has been applied operationally without changing authority 1.1 semantics. Material discrepancies now carry separate qualification and discovery dispositions. The frozen 1.1 cold evidence remains unchanged; surviving structural leads are tracked in `research/isograph/qualification/DISCREPANCY_DISCOVERY_DISPOSITIONS_1_1.json`.

The first full Discovery Protocol campaign has now executed against those anomalies:

- campaign narrative: `research/isograph/discovery/2026-09-18-discrepancy-protocol-campaign/CAMPAIGN.md`;
- machine ledger: `research/isograph/discovery/2026-09-18-discrepancy-protocol-campaign/DISCOVERY_LEDGER.json`.

Key results:

```text
ESTABLISHED:
    explicit scope metadata != semantic validity restriction
    R0045 = 4 citations/artifacts -> 3 events -> 2 lineages
    evidence-independence applicability is lineage/proof-topology scoped

SUPPORTED:
    semantic-layer substitution is a recurring cold-reconstruction failure mode

FALSIFIED:
    one shared minimal relation-basis explanation for R0015/R0016/R0052 deficits

CLOSED AS ORDINARY ERROR:
    10-lineage / 13-event prose substitution
```

No authority-1.1 semantic artifact changed.

## Current RBA successor frontier — 2026-09-19

Raw post-1.1 RBA execution/research evidence is current through a qualified selected-rank27 staged evaluator and the first selected rank26 predecessor. Its **current semantic interpretation is integrated into `CONNECT4_GAME_THEORY_1_2_CANDIDATE.*`**; the files below are evidence/checkpoints, not parallel authority:

- `research/isograph/successor/CONNECT4_POST_1_1_RBA_OVERLAY_0_8.*`
- `research/isograph/successor/CONNECT4_RBA_QU_0_15.*`
- `research/isograph/successor/CONNECT4_RBA_TOPOLOGY_PLACEMENT_0_8.*`

Current semantic disposition:

```text
C4-R0077  board-fiber residual/cofactor algebra                    deductive_exact
C4-R0078  board-fiber ordinary-value invariance                    guarded_exact
C4-R0079  terminal-extended cofactor adjunction/composition         deductive_exact
C4-R0080  four-front partial-WDL block carrier                      deductive_exact
C4-R0081  Bellman antichain-semiring lattice polynomial            deductive_exact
C4-R0082  local-skyline semiring multiplication factorization      deductive_exact
C4-R0083  selected rank31/rank30/rank29/rank28 recurrence          empirically_supported
C4-R0084  earlier-rank staged/operator cost law                     open_question
C4-R0085  outer-restriction skyline-width monotonicity             deductive_exact
C4-R0086  projection-tree subtree dominance pruning                deductive_exact
C4-R0087  selected rank27 draw15 closure                            empirically_supported
C4-R0088  block-signature subset/superset antichain indexing       deductive_exact
C4-R0089  selected rank27 loss14/win15 adjacent closures           empirically_supported
C4-R0090  static dominance-tree antichain normalization            deductive_exact
C4-R0091  core-relative pre-product absorption                     deductive_exact
C4-R0092  shared-target principal-cover dynamic program            deductive_exact
C4-R0093  rank27 staged qualification / rank26 selection           empirically_supported
```

Selected rank27:

```text
support [3,4,2,0,6,6,6]
loss14  Upper 114,585   Lower 158,402
draw15  Upper 161,398   Lower 534,618
win15   Upper 235,107   Lower 306,617
```

The evaluator campaign has now passed its progression criterion. The known stress thresholds retain exact bounded routes using different qualified phase-local methods. On win15, core-relative absorption reproduces the persisted 239,149-generator three-factor intermediate and 306,617-generator final stream while removing 55.0% and 81.4% of raw pair work respectively.

The first rank26 interface wall was a different operation: repeated principal-cover preimage construction. C4-R0092 shares uncovered-target subproblems across all queries on one cofactor edge. On the first predecessor, 89,032 ownGE targets evaluate in ~142 ms and 117,692 oppGE targets in ~95 ms. A 576-target differential against the prior exact operator has zero mismatches.

Selected rank26:

```text
support [3,3,2,0,6,6,6]
rank 26
residual shapes 40
transformed bits 80

loss16 fixed-action interface from known child win15:
    Upper 75,920 / Lower 49,724

win15 fixed-action interface from known child loss14:
    Upper 59,798 / Lower 44,706
```

The selected rank26 target is `draw16`. Three of its four legal rank27 `draw15` children remain to be generated and qualified.

The proof/certificate clause-to-value bridge remains a separate OPEN side seam represented directly in authority 1.2 as `QU-GAME-02`. Authority 1.1 remains immutable historical evidence.

## Historical applied NEI layer — superseded for active interpretation

The old applied NEI overlay remains immutable research/provenance evidence:

- `research/isograph/identity/CONNECT4_NEI_APPLICATION_0_1.md`;
- `research/isograph/identity/CONNECT4_NEI_APPLICATION_MANIFEST_0_1.json`;
- `research/isograph/identity/CONNECT4_NEI_PROFILES_0_1.json`;
- `research/isograph/identity/CONNECT4_NEI_RESULTS_0_1.json`;
- `research/isograph/identity/CONNECT4_NEI_RESULTS_0_1.isg`.

Do not use it as a current identity layer. Its profile-declared SAME/DISTINCT framing is replaced in active research by the integrated 1.2 game-theory candidate, where identity conclusions are derived from ordinary facts/evidence/QU under qualified NEI 0.4.

The historical standard-7x6 incomplete result remains correct at its pinned old evidence revision. The later q_o congruence is now independently qualified in authority 1.2; that later result does not rewrite the historical NEI artifact.

### Discovery Protocol rerun with NEI

The original discrepancy campaign was rerun against the same authority evidence with the applied NEI layer enabled:

- `research/isograph/discovery/2026-09-18-nei-enabled-rerun/CAMPAIGN.md`;
- `research/isograph/discovery/2026-09-18-nei-enabled-rerun/DISCOVERY_LEDGER.json`;
- `research/isograph/discovery/2026-09-18-nei-enabled-rerun/BEFORE_AFTER.json`.

Measured effect:

~~~text
original branches materially changed     1
original branches precision improved     1
original branches unchanged / NEI N/A    3
new NEI-enabled discovery branches       2
~~~

The material change was R0045: NEI showed that the 4/3/2 evidence hierarchy is **not** a global artifact->event->lineage quotient staircase. Artifact `3000222` participates in five lineages, so evidence identity projection must be context/anchor scoped.

The new cross-domain structural candidate is:

~~~text
fine identity DISTINCT
-> context/profile-specific projection
-> scoped semantic identity SAME
-> fine residual/provenance preserved
~~~

observed across R0044 artifact/lineage, R0074 event/lineage, and SIU physical/future-behavior identity.

The standard-7x6 state-identity gap was then investigated directly in the high-value-lead campaign.

### High-value lead investigation

Primary record:

- `research/isograph/discovery/2026-09-18-high-value-leads/CAMPAIGN.md`
- `research/isograph/discovery/2026-09-18-high-value-leads/LEAD_LEDGER.json`

Results:

~~~text
semantic scope:
    current structured fields are insufficient for exact derivation;
    successor needs typed claim-domain / guards / evidence-coverage / exclusions

evidence independence:
    current graph cleanly separates deductive-only vs empirical lineages;
    successor should type evidence_mode

identity projection:
    artifact identity != artifact-lineage occurrence
    contextual correspondence span replaces global quotient assumption

standard 7x6 q identity:
    direct future-behavior congruence proof candidate derived

same-q breaker search:
    reclassified as adversarial theorem/implementation qualification
~~~

The q-congruence proof shows that equal support + equal normalized P0/P1 residual antichains determines legal actions, immediate terminal results, and every nonterminal successor q; finite induction then determines the entire ordinary future game. An exhaustive abstract antichain/cofactor control passed 32,906 set families / 131,474 cofactor cases.

The historical NEI-C4-0007 result remains `INCOMPLETE_UNQUALIFIED` under its pinned evidence revision. Authority 1.2 now carries qualified `SAME` for the scoped orientation-sensitive q_o future-behavior identity question.

## Operational-layer method emergence

A new Discovery Protocol campaign tested whether active solving methodology had been mapped at the wrong semantic layer:

- `research/isograph/discovery/2026-09-18-method-emergence/CAMPAIGN.md`
- `research/isograph/discovery/2026-09-18-method-emergence/OPERATIONAL_LAYER_METHOD_EMERGENCE.md`
- `research/isograph/discovery/2026-09-18-method-emergence/DISCOVERY_LEDGER.json`

The campaign erased solver `consumed_by` labels from the claim graph before interpretation. The operational/proof core remained connected.

Current discovery disposition:

~~~text
ordinary exact game semantics:
    behavior state + legal transition + terminal boundary
    + alternating player quantification + finite rank
    -> unique ranked W/D/L recurrence

state-evolution edge:
    q_r -> q_(r+1)

value-dependency edge:
    V(q_(r+1)) -> V(q_r)

IsoMax:
    demand-driven materialization/evaluation of that dependency

CUDA-BSFP:
    supply-driven symbolic predecessor/evaluation of that dependency

NDC / guarded certificates:
    shortcut proof edges over the same exact game semantics
~~~

This strongly supports the hypothesis that solver multiplicity was partly a representation-layer/control-flow distinction. It does **not** establish complete structural shortcut closure, standard-7x6 q as frozen authority, or a final SUT architecture.

The active guarded mixed-cofactor obligation seam remains valid; it is now interpreted as compact derivation of shortcut controllable-predecessor facts rather than creation of a separate solver semantics.

## Exact best-move frontier discovery

The follow-up campaign targeted the actual decision problem rather than solver recurrence:

- `research/isograph/discovery/2026-09-18-policy-frontier/CAMPAIGN.md`
- `research/isograph/discovery/2026-09-18-policy-frontier/SUPPORT_LOCAL_ACTION_VALUE_ISOTONY.md`
- `research/isograph/discovery/2026-09-18-policy-frontier/RESULTS.json`

Current strongest result:

~~~text
fix support S and side p

qA >=_p qB
    when mover residual completion is no harder
    and opponent residual completion is no easier

candidate consequence:
    exact state value and every fixed-action strong score are isotone
~~~

Complete-control adversarial evidence:

~~~text
comparable q pairs              6,300,753
state W/D/L violations                  0
state strong-distance violations         0

comparable fixed-action pairs  18,076,405
action W/D/L violations                 0
action strong-distance violations        0
~~~

This yields exact support-local antichain frontiers for action-score thresholds. The direct predicate `column c is optimal` is not monotone and is rejected as the frontier object.

Policy-collapse headroom is large: q/support-policy collapse ranges from 3.646x to 32.671x on the four controls, while transition-closed policy automata collapse only about 1.16x-1.34x. The useful object is therefore a decision/value relation evaluated on current structure, not a smaller q state machine.

This remains a derived theorem candidate and implementation lead under current authority 1.2.

The standard-7x6 bounded constructive follow-up is now complete through sampled ranks 26-40.

Key cross-rank result:

~~~text
independent child-rank frontiers
+ one exact legal transition
-> held-out parent action intervals
-> exact best-move proof when intervals separate

20k child frontier budget:
    rank 26 best-move coverage   15.40%
    rank 30                      54.62%
    rank 34                      81.63%
    rank 36                      88.39%
    rank 38                      97.44%
    rank 39                     100.00%

aggregate ranks 26-39:
    held-out q states        64,644
    held-out actions        257,007
    false action claims           0
    false best-move claims        0
~~~

Scaling the child frontier from 20k to 100k states raised rank-28 best-move coverage from 30.44% to 73.36% and rank-26 coverage from 15.40% to 61.36%, again with zero false claims.

This shifts the open engineering question from whether the relation can select moves to how to construct/propagate enough frontier coverage toward the root.


## Confirmed direct-propagation representation wall

The direct rank-propagation follow-up advanced beyond the sampled frontier work and has now been independently reviewed.

Evidence:

- `research/isograph/discovery/2026-09-18-policy-frontier/DIRECT_PROPAGATION_CLAUSE_Q_BRIDGE.md`
- `research/isograph/discovery/2026-09-18-policy-frontier/DIRECT_PROPAGATION_RESULTS.json`
- `research/isograph/discovery/2026-09-18-policy-frontier/DIRECT_PROPAGATION_CONFIRMATION.md`
- `research/isograph/discovery/2026-09-18-policy-frontier/DIRECT_PROPAGATION_CONFIRMATION.json`

Recorded post-authority IsoGraph claims:

~~~text
C4-R0075  empirically_supported
    observed standard-7x6 rank-35 wall is a scoped
    representation/composition explosion at distributed
    universal proof conjunction before semantic/value collapse

C4-R0076  missing_law
    derive a compact realizability-preserving clause/proof
    -> residual/q-value controllable predecessor before
    universal alternatives are fully distributed
~~~

Confirmation boundaries:

- rank 35 has exactly 1,709 supports;
- recorded pathological move-width products recompute exactly to 573,270,600 and 58,748,277;
- maintained BSFP host/CUDA semantics independently confirm Cartesian candidate generation before antichain normalization;
- C4-R0073/R0074 already qualify the predecessor-closed clause carrier;
- the large residual-shaped projection gap is real, but the recorded 626/192 rank-39 projection objects are **not** legal-q classes because exact cardinality and alternating-history realizability were not enforced.

Historical authority 1.1 remains unchanged; current authority 1.2 integrates the claim statuses. The original overlay evidence lives in:

`research/isograph/successor/CONNECT4_POST_1_1_DIRECT_PROPAGATION_OVERLAY_0_1.*`

This now supersedes generic reducer tuning as the primary scaling seam.

## Gameplay strategy / implementation proposal lane

The persistent index for turning IsoGraph findings into gameplay descriptions, solver strategies, and implementation experiments is:

- `research/GAMEPLAY_STRATEGY_INDEX.md`

Current rough proposals cover:

~~~text
q-native gameplay description
packed q transition compiler
symbolic q fixed-point solving
guarded obligation/searchless closure
behavioral quotienting beyond q
profile-safe proof/cache keys
generic Connect-K q congruence
~~~

This is a proposal/implementation surface, not semantic authority. New durable gameplay-facing ideas should enter through that index so they remain visible and trackable.

## Consolidated research-lane state

On 2026-09-17, the canonical research lane was fast-forwarded through `research/structural-calculus-handoff-20260916`, the exact unified-knowledge trees were attached under `research/`, and the later BSFP/Isometric transfer packet was consolidated from `research/bsfp-isometric-invariant-transfer`. This branch now preserves the active structural-calculus lineage, BSFP/Isometric transfer research, and the normalized cross-lineage research knowledge base.

The consolidation changes branch ownership/provenance only. It does not promote research claims, alter theorem dispositions, or make this branch a solver implementation head. Non-research solver/product branches remain outside this cleanup.

Use `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_2.md` as the logic entrypoint. `research/canonical/CLAIM_INDEX.json` is now a legacy claim-ID/readability bridge, while `research/provenance/SOURCE_MANIFEST.json` remains source provenance.

## Authority and proof boundary

- Domain target: every positive finite rectangle `W x H`, Connect-4 (`K=4`).
- C4-0006 and C4-0007 remain Candidate structural/proof specifications. C4-0010 is an accepted research consumer and does not promote imported Candidate clauses.
- Finite sweeps, solved W/D/L tables, strong-distance data, and varying-board censuses are discovery/validation/falsification evidence only.
- Unknown is not loss; theorem failure is not theorem negation; equal dimension is not a natural isomorphism; absence of a forcing certificate is not a draw certificate.
- No recursive minimax/Negamax/MCTS/PNS result or solved database label is a premise of an asserted structural theorem.
- First-win stopping remains authoritative over partial structural observations.

## Closed structural foundation currently in use

The current research stack is:

```text
geometric winning-line axioms
  -> support / future placement-event frontier
  -> CPC control potential / event precedence
  -> positive residual antichains and blocker clauses
  -> guarded response/resource/deadline consequences
  -> NDC certificate closure / shortcut proof dependencies
  -> solver-neutral ranked exact value dependency
  -> solver-specific evaluation/materialization policy.
```

The following September 14 results are retained as the active foundation rather than repeated here in full:

- **total-domain static geometry and third-difference calculus** — symbolic formulas for line count, incidence rank/kernel, axis/phase quotients, and their board-family boundary cases;
- **A4/quiver decomposition** — canonical static decomposition of the principal empty-board maps; standard 7x6 yields `69 = 28 + 6 + 28 + 7`;
- **thin-board theorem** — `min(W,H)<4` implies empty-board draw by quantified legal response proof;
- **binary control potential** — CPC, phase, seams, and ownership correction are views of one parity/control potential rather than duplicated player-color state;
- **domain-wall / gravity normal form** — terminal four-lines are zero-edge predicates; ownership fields admit an anchor-plus-seam representation;
- **safe pure-followup / seam reservoir** — exact defensive geometry, including the standard width-7 center-safe affine seam cube;
- **anchored zero-edge residuals** — both players share one zero-edge terminal geometry with player identity supplied by the ownership anchor;
- **affine/clause separation** — blocker sets are positive monotone clauses, not XOR unless split ownership is separately certified.

Primary routing for these results is in `docs/research/RESEARCH_INDEX.md` and the `required_authority` / `qualified_premises` sections of `next_step.yaml`.

## Current strategic interpretation

The smallest preserved common strategic shape is:

```text
binary control potential
+ full positive residual incidence
+ affine ownership/parity relations
+ monotone blocker clauses
+ support / response-resource / deadline guards
+ NDC composition
-> exact terminal or proof consequence where qualified.
```

Pure-followup/domain-wall safety is a defensive/no-loss substrate, not a signed value theorem. Hall/resource deficiency is a sufficient forcing/stopping certificate only under its exact guards; absence of Hall deficiency is not draw evidence.

## Active seam — guarded mixed-owner cofactor obligation birth

The solved-database collision audit changed the classification of the missing mechanism.

For player `p`, the positive residual antichain is a monotone Boolean completion formula. Owner-labelled events are exact cofactors. On distinct cells, owner-`p` and owner-`1-p` substitutions commute algebraically. Therefore the missing noncommuting game content is not another residual-algebra primitive; it enters through legality/admissibility, support, response resources, deadlines, opponent-universal intervention, and first-win stopping.

Current classification:

```text
new primitive enabling predicate        not warranted
owner-labelled enabling                derived certificate relation
cofactor degree drop                   exact algebra, not yet obligation birth
intervening-choice stability           missing guard
cofactor -> obligation quantifier lift primary missing composition rule
winner/sign lift                       downstream of decisive terminal certificate
```

Target rule shape:

```text
MixedCofactorConsequence
+ AdmissibleSupport
+ UniversalInterventionStability
+ SharedResourceAccounting
+ FirstWinBeforeDeadline
-> CertifiedObligation.
```

Apply this first to the documented shared d-column continuation of the minimal six-ply collision. Stop at the first required guard not derivable from existing support, blocker, control-potential, response-resource, deadline, or first-win coordinates. Only that residue is a candidate new predicate.

### Bounded collision control

Zero-based paths:

```text
A = [6,6,6,6,2,2] -> database draw
B = [2,6,6,2,6,6] -> database P0 win
```

They share support `[0,0,2,0,0,0,4]`, degree-2 structural signatures, and all first-P0-event degree-2 jets. Independent structural replay reproduced exactly 13 differing degree-2 signatures among 49 common two-event column pairs. `P0 a1, P1 d1` exposes a B-only P1 residual `{e1,f1}`.

That residual is a discriminator, not a proof of the database outcome. Degree contraction alone does not establish an active defensive obligation.

Primary notes:

- `docs/research/2026-09-14-solved-db-structural-discovery.md`
- `docs/research/2026-09-14-solved-db-structural-assessment.md`

Finite database results currently falsify value-completeness of boundary-capacity, degree-2, GF(2)-span, and current-owner degree-2-jet projections. Exact residual identity and the ownerJet signature have no sampled value collision, but this is finite validation only and gives no theorem or compact-selector proof.

## Immediate execution target

`next_step.yaml` owns the executable continuation:

`derive_guarded_mixed_cofactor_obligation_birth`

The first construction must:

1. preserve exact support and full positive residual identity;
2. separate commuting Boolean cofactor algebra from game-time admissibility;
3. quantify opponent interventions over the post-cofactor consequence/antichain, not survival of one named residual;
4. reuse existing singleton/fork, blocker, response-capacity, deadline, and NDC consequence types before inventing new state;
5. use solved labels only to falsify proposed rules;
6. preserve first-win stopping and absolute player/sign lift only after an exact terminal certificate.

## Solver / ordering side seam

GitHub issue **#43 — `Design-only: theorem-tiered packed structural key for frontier-native Negamax ordering`** records the move-order/advisory-evaluation design. It remains **design only**: no implementation, pruning authority, branch, or PR is implied by that issue.

Conventional fixed-center, reversed-worker, history/killer, or scalar heuristic policies have no default structural authority. They may remain explicit controls or survive only through measured evidence.

## Paused / preserved work

- post-center strong-distance selector — paused inside the broader guarded value-closure problem;
- history-aware marked residual calculus after the qualified 21-space — preserved;
- forward W/D/L rank-7 P1 horizon at exact state `4665655` — unfinished but preserved;
- varying-board census — validation/falsification only;
- former `research/connect-k-derivative-classification` work — retired from live topology; its durable predicate/axiom results are integrated into the canonical derivative claim registry and retained provenance, and they do not solve the temporal guard seam.

## Retention and cleanup rule

Keep durable theorem derivations, exact qualification evidence, useful falsifiers, and historically important performance/provenance records. Git history is the archive for superseded handoffs, chat summaries, temporary publication checkpoints, and obsolete executable/scaffolding state.

Do not create another chronological status ledger. Update this file only when the current proof boundary, active seam, or routing materially changes.
