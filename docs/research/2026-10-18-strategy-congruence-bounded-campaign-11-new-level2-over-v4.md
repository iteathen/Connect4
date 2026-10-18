# Bounded strategy-congruence campaign outcome: one full-reply source preorder certifies 11 additional real 7×6 Level2 moves over V4

**2026-10-18, frozen success/limits checkpoint after original source and physical controls. Research owner `research/semantic-quotient`. Game theory authority IsoGraph 1.2 UNCHANGED.** The owner's earlier decision was to STOP repeatedly refining fixed future owner-color/geometry chronology, and give ONE bounded attempt to an **observation-sensitive source-only strategy-preserving relation**. The three success tests were (1) a source-defined relation respecting opponent adaptive observation, (2) survival of the original physical counterexamples, (3) at least ONE genuine NEW best original move beyond existing V4 without valuing strategically inequivalent future games. The bounded attempt met all THREE, but only on a narrow late-game domain, and NOT on canonical `44444`.

## 1. Exact mathematical result: uniform first-response transport

Derivation frozen first at `docs/research/2026-10-18-uniform-opponent-reply-fiber-source-action-preorder.md`, then represented algebraically at `docs/research/2026-10-18-bitset-fused-uniform-opponent-reply-fiber-preorder.md`.

At genuine source `q=(h,R0,R1)`, with current literal player p, select original legal distinct first columns a,b with a PREDECLARED fixed column involution π that preserves current height vector and maps a→b: either ONE equal-height two-column swap or ONE whole-board reflection (height symmetric). Both first actions must be nonterminal, and the second-ply boundary must not be a full-board draw.

The fixed map transports ALL legal opponent replies `r` after a onto `π(r)` after b. Using only original q's raw winning-line residual generator masks and original first-win singleton guards, check that every such P0-relative reply-pair terminal is safely ordered, and for every nonterminal pair:

    ∀G∈R0_left_reply ∃H∈R0_right_reply : H⊆π(G),
    ∀H∈R1_right_reply ∃G∈R1_left_reply : G⊆π(H).

These are previously established original same-support full-future monotone-upset WDL inequalities, NOT recursively evaluated successor games. A bijection of the complete opponent-reply set preserves the current `min` on P0 turns and `max` on P1 turns. Hence the current original first-action game values satisfy **J_a≤J_b** without querying either scalar value. A directed weak-order path spanning every currently legal label provides one true Level2 BEST original first action (P0 upper extremum or P1 lower extremum); if there is no global extremum, SOURCE returns INCOMPLETE.

The one-round per-reply pure-source prototype `research/isograph/discovery/2026-10-18-strategy-congruence/standard7x6-source-uniform-reply-fiber-WDL-order.mjs` proved this by scanning reply-specific RAW mask expressions (but no full future q). The stronger **bitset-fused original source implementation**, `standard7x6-source-bitset-fused-uniform-reply-WDL-order.mjs` in the same discovery directory, encodes ALL root opponent replies simultaneously as W-bit masks for EACH original generator-pair inclusion clause. It computes P0 forward and P1 reverse coverage by finite masks

    L0_left(G)⊆OR_H Cover0(G,H),
    L1_right(H)⊆OR_G Cover1(H,G).

Every Cover is computed from ORIGINAL root physical cell indices, root current and reply landing bit positions and π; terminal reply labels enter one guard mask. The SOURCE constructs ZERO future q, ZERO per-reply raw generator-family arrays, ZERO strategic game value calculations and ZERO alternative opponent policy trees. It still scans finite original generator-pair × reply-label incidence predicates and is NOT zero arithmetic, nor a universal best-move law. A current action edge is output only when these strict source guards cover ALL opponent reply labels.

This is task-specific use of the established **turn-based alternating simulation** idea, not a claim of inventing general simulation theory. Relevant mathematical prior art: Cranen et al., `Parity Game Reductions`, Acta Informatica 2018 (https://doi.org/10.1007/s00236-017-0301-x), and Geeraerts et al., `Synthesising Succinct Strategies` (https://verif.ulb.be/ggeeraer/papers/reach-synth.pdf). Earlier Connect4 same-support residual-upset theorem and fixed current action swap/reflection transport are explicit dependencies, not new results of this campaign.

## 2. Freeze-first real original 7×6 candidate results

The original source-only deterministic generator `standard7x6-uniform-reply-fiber-frozen-preoracle-corpus.mjs` was committed BEFORE any WDL physical/minimax or immutable V4 call. Seed 20261018, up to 2600 first-win-free original board trajectories, original ranks 26–39, stopped after 12,500 sampled genuine original q. Every q independently reconstructed from the original 69 W7×H6 K4 physical winning windows; sample is nonuniform and repeated q observations were possible.

Durable compact source packet:

`research/isograph/discovery/2026-10-18-strategy-congruence/STANDARD7X6_UNIFORM_REPLY_FIBER_12500_PREORACLE_COMPACT_0_1.json`.

- **12,500** genuinely nonterminal q observations, generated along 1,062 nonwinning physical histories.
- **2,851** roots with source uniform-reply weak-order edges; 4,308 SOURCE weak-order edges total (not all newly discovered).
- **112** weak J_a≤J_b inequalities at **105** q observations NOT proved by the earlier fixed first-ply swap/reflection direct source operators on the SAME q.
- **35** root observations where the uniform-reply source direct weak preorder alone proved a global current-label BEST; of these **12** depended on a weak-order edge not proved by one-ply swap/reflection. No WDL physical/game scores or V4 were read in the SOURCE screen.

The first large full-payload Github artifact transfer failed at the transport layer; source packet was reproduced EXACTLY and the smaller complete candidate-classification payload committed. This was a transport failure, not evidence of a mathematical claim. In the first physical regression harness, the retained historical V4 dependency bundle lacked the fixed-two-column source factory. The failure was independently preserved as `STANDARD7X6_FIRST_V4_CONTROL_HARNESS_MISSING_FACTORY_0_1.json`; injected the separately pinned UNCHANGED fixed-swap factory and reran the frozen physical reference. The control scripts and sample were not edited to fit the results.

## 3. Fully independent ORIGINAL physical WDL and SAME-Q V4 reference

Frozen independent first-win-stopped physical true7×6 colored-grid/69-window recursive minimax:

`research/isograph/discovery/2026-10-18-strategy-congruence/standard7x6-uniform-reply-fiber-independent-physical-v4-marginal-control.mjs`.

Unchanged V4 from retained source bundle `research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-unified-v4-dependency-execution-bundle-20261018.mjs` with its separately pinned original fixed-swap source; evaluated ONLY after the source candidate packet was frozen. Independent physical reference exhaustively valued each currently legal root action in the selected late original q.

First reference evidence: `STANDARD7X6_UNIFORM_REPLY_FIBER_NEW_ORDER_AND_V4_MARGINAL_PHYSICAL_RESULTS_0_1.json`.

The NEW source bitset-fused operator was independently checked over the **SAME 2,851 SOURCE-positive q roots**, retaining exact original weak-edge sets and exact best-selected actions on all 2,851; **112/112** earlier novel edges retained. There were ZERO per-reply raw cofactor-family arrays constructed by fused source, ZERO strategic future q objects/values, 617,056 original static generator/reply scalar predicate checks and 215,013 current-label W-bit coverage fusions on this frozen positive corpus. Machine `STANDARD7X6_FUSED_UNIFORM_REPLY_2851_SAME_ROOT_112_NEW_EDGES_SOURCE_EQUIVALENCE_RESULTS_0_1.json`.

The fused operator then passed an independent DIRECT rerun of 105 original physical q roots and their 112 new source weak-order edges, plus SAME-Q unmodified V4 reference. Frozen direct physical runner `standard7x6-fused-reply-source-independent-physical-v4-direct-control.mjs`; evidence `STANDARD7X6_FUSED_REPLY_SOURCE_112_EDGES_11_NEW_BEST_OVER_V4_DIRECT_PHYSICAL_0_1.json`.

| Same-q original7×6 result | Verified |
|---|---:|
| New source action-order inequalities physically checked | 112/112 |
| Physically incorrect weak-order inequalities | **0** |
| New source-selected root best actions physically verified | 12/12 |
| Those 12 where unchanged prior V4 already proved a best move | 1 |
| **New best-action q roots source-certified beyond V4** | **11** |
| Independent physical WDL or V4 reference budget incomplete | 0 |

The **11** newly source-certified q are DISTINCT by original q=(h,R0,R1) identity, not just repeated move histories. All are P0 to move in LATE positions (rank34,36,38) with exactly TWO original legal columns still available. **TWO** show a genuinely superior drawing move against a losing rival. In the other NINE, independent physical minimax shows BOTH available moves lose under perfect play; the source still rigorously selects a valid equally BEST Level2 continuation without knowing the numeric root outcome.

Two concretely useful new DRAW-vs-LOSS best choices, both previously `INCOMPLETE` under original frozen V4 and SOURCE selected without any alternative game VALUE calculations:

1. Legal original history `562433542363654245164656543322217771`, rank36, h=[3,6,6,6,6,6,3], P0 to move; legal {1,7}. New source chooses **column 1**, independent physical values J1=0, J7=−1. Ordinary physical root WDL DRAW, selected move uniquely BEST. The source weak reply-fiber proof here is solely safe opponent-immediate-terminal coverage (no nonterminal reply mask).
2. Legal original history `376442621443756113162473317437157566`, rank36, h=[6,3,6,6,3,6,6], P0 to move; legal {2,5}. New source chooses **column 5**, physical values J2=−1,J5=0. Unique source-selected best DRAW. This source certificate is also safe terminal-response-only.

Among ALL **112** new action-order edges absent from the direct first-ply swap/reflection: **60** were proved by terminal-safe reply coverage alone, but **52** also had original nonterminal opponent replies requiring the genuine same-support RAW generator upset inclusion. Among the 12 direct-source best-root observations, at least FOUR use such nonterminal generator inclusion, and the physical selected action is correct. Thus this is not exclusively an immediate-win/reply tactical rule; it contains full-future source WDL monotonicity as a proof ingredient.

## 4. Bounded-attempt objective and decisive limits

**Bounded campaign success gates:**

1. One source-only observation-sensitive relation that preserves ALL root opponent responses? **YES**, the fixed online reply transporter ρ(r)=πr plus the bitset source subset-coverage clauses, proven as a sufficient P0-relative WDL order.
2. Survive existing original strategic counterexamples? **YES**, direct corpus contains the original rank34 same-endpoint/not-same-action WDL witness `2532541156412471331416356736376672`; source did NOT assert equal best actions from a static trace, and its new source weak-order certificates had zero physical refutations.
3. Certify at least one NEW genuine original Level2 best move beyond V4 without valuing alternative strategic game futures in source? **YES: 11 distinct original q**, all physical verified on SAME q against immutable prior V4.

**Severe limits:**
- No new BEST-action SOURCE certificates yet on real roots with 3+ legal columns, though source proved new individual weak-order inequalities on some such roots.
- No new source BEST root at P1 to move, though novel source weak-order edges occurred on P1 roots too.
- The source theorem still needs a height-preserving single fixed π (one simple swap or full reflection), AND it scans finite opponent reply labels and original generator-pair bit masks. This is a valid source WDL-order algebra, not a universal owner goal of ZERO branching across all possible q.
- It does not infer strict WDL inequalities from source non-inclusion, and it does not prove all tied BEST moves. It returns one proven optimal original action where every other legal label is weakly dominated in the appropriate direction.
- At original canonical `44444` (P1 move6), the new fused source still returns `INCOMPLETE`. Its different-height center action remains outside these fixed root-height-permutation comparisons; prior original horizontal mirror equalities still hold.
- No maintained Node26 CI, independent external mathematical proof assistant, or IsoGraph gameplay authority promotion has occurred. Project internal independent physical implementations and mathematical source proof constitute **scoped internal evidence**, not formal universal external qualification.

## 5. Recommendation / next-stop gate

Unlike the fixed-owner chronology line, this source proof made REAL marginal BEST-move progress on correct adaptive two-player strategy comparisons; the track has NOT exhausted all meaningful directions. The next research gate is a **single targeted extension to 3+ available original actions** and ideally both movers, with ZERO independently valued strategic future games: e.g. find a new source-defined root **reply transporter not restricted to exact height-preserving column involutions** while retaining a *single* closed Boolean-generator incidence proof of full opponent-response coverage. Avoid treating a family of reply-dependent future game automorphism searches or per-action alternative game q constructions as success.

A bounded attempt should be continued only if it produces a NEW original Level2 best-action q whose current legal mask has >=3 choices, or a verified new certificate in the difficult canonical rank5 `44444` case. If it cannot, preserve this genuinely positive theorem, but STOP extending marginal position count and return to deeper original source structural strategy invariants instead of building a faster nested search.

**Current top-line scientific conclusion:** owner-geometry unfolding/phase factorization was a useful exact SOURCE representation, but full first-action WDL *strategy* transport needs opponent-reply-inclusive source relations. This new finite current-q uniform reply relation is demonstrably useful, though still far from a complete nonbranching standard Connect4 Level2 solution.
