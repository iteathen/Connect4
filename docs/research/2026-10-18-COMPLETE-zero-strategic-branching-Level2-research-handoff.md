# Complete Connect4 Level 2 Zero-Strategic-Branching Research Handoff
**October 18, 2026 — full, restart-ready successor to the interrupted chat handoff**

**Document state during construction:** partial until an explicit `END OF COMPLETE HANDOFF` marker is present and verified. All numbered items 1–20 will be committed in order.

**Durable research owner:** `iteathen/Connect4`, branch `research/semantic-quotient`. **Pre-handoff live GitHub head checked:** `111a8d52485a9f44cdcb6f2bd85d8a19ae4b5827` (snapshot only; fetch live HEAD on resume). **Authoritative current-state routers:** `STATUS.md` and `next_step.yaml`. **Claim strength:** research synthesis/restart guide, NOT a new qualified game-theory authority or a completed universal solver.

This document supersedes the STALE NEXT STEP and output requirements in `docs/research/2026-10-17-zero-branching-comprehensive-context-handoff.md` but preserves that file as historical evidence. In particular, the later owner correction says a valid Level 2 continuation needs ONE certified best move, even though the mathematical complete Level 2 information set consists of ALL best moves.

## 1. Pasteable next-session restart prompt

Resume serious zero-strategic-branching Level 2 Connect4 mathematics in `iteathen/Connect4` on `research/semantic-quotient`. Before any work, thoroughly re-fetch LIVE HEAD, account-global `iteathen/.github/AGENTS.md`, local `AGENT_LOCAL.md`, `research/AGENTS.md`, the qualified IsoGraph 1.2 logic authority/manifest, `STATUS.md`, `next_step.yaml`, this **entire 20-section handoff**, and cited actual 7×6 theorem/evidence files.

Goal: derive ONE exact, source-certified, original legal Level 2 BEST column from EVERY genuine legal first-win-stopped standard 7×6 position WITHOUT valuing two strategically inequivalent future games. Full set of tied-best moves is a stronger optional information result. Level 3 fastest win or longest loss is separate. Do not substitute fewer negamax branches or hidden BDD/QBF/strategy-graph search. Return `INCOMPLETE` where no valid source certificate exists, with original scalar root WDL UNKNOWN unless independently source-proven.

The LATEST verified result after the deterministic-mapping campaign is the directed FIRST-TOUCH shared-blocker defender invariant: 295 source no-forced-win cases on real 7×6 positions, 105 best DRAW/LOSS closures and 19 NEW exact best-action roots beyond immutable unified V4 on the same tested states. Canonical `44444` has 27 of 35 first-touch gate cells without any one common immediate blocker; unrestricted root WDL and best move remain UNKNOWN. Next mathematical target is an exact source-only multi-response/shared-resource adaptive invariant for such obstructions, not more current-action permutation heuristics. Freeze source theorem and producer before independent true 7×6 falsification; commit positive AND negative findings, then update `STATUS.md` and `next_step.yaml`. Do not merge solver branches, promote IsoGraph authority, or claim an unqualified theorem proved.

## 2. Authority, branch, and crash-safe execution

Read in order: latest explicit owner instruction → global `iteathen/.github/AGENTS.md` → `AGENT_LOCAL.md` → `research/AGENTS.md` → qualified `research/isograph/CONNECT4_LOGIC_AUTHORITY_1_2.md` and `CONNECT4_LOGIC_AUTHORITY_MANIFEST_1_2.json` → relevant accepted specs/contracts → live `STATUS.md`/`next_step.yaml` → original source research theorem/evidence files.

All durable Connect4 mathematical work, proof attempts, research scripts, rejected shortcuts, controls and synthesis belongs to ONE owner: `research/semantic-quotient`. Other branches with `research/` in names are historical or solver implementation provenance; do not write new durable research to them. Qualified gameplay theory 1.2 distinguishes orientation-sensitive original future-state carrier `q_o` from horizontally reflected value-cache quotient `q_r`. Research proposals and tests do not automatically become qualified game authority.

On reconnect or UI desync, re-fetch live GitHub HEAD and recent commits before continuing. Never accumulate more than one meaningful unsaved research result. Persist math, executable falsifier and exact intended question BEFORE bounded/long controls. Save source successes, failed hypotheses, budget failures, negative physical witnesses and nonresults promptly. GitHub writes that disconnect have UNKNOWN completion state until re-fetched; don't blindly retry. Separate static SOURCE proof operations, selected one-lane q cofactors, and independently valued future strategic games; zero is required for the last.

Independent physical recursive minimax/negamax is permitted ONLY as a validator after the source proof/selection is frozen; it is not a component of the no-search source algorithm. Recently executed controls were isolated V8/committed scripts; maintained Node26 CI and independent formal proof-assistant qualification have NOT been newly run. No unapproved merge, game-authority promotion or solver branch integration.

## 3. Owner-corrected Level 1 / Level 2 / Level 3 definitions

The owner separated THREE axes: information depth, evaluated player and outcome preference, and opponent quality model. Governing `docs/research/2026-10-17-owner-unified-three-level-information-definition.md` and `docs/research/2026-10-17-owner-level2-set-vs-valid-continuation-correction.md`.

- **Level 1 — Outcome:** ordinary current game win/draw/loss with PERFECT play (P0-relative `V(q) ∈ {−1,0,+1}`), or explicitly labeled sets of merely POSSIBLE outcomes under unknown-quality opposition.
- **Level 2 — Best moves:** ALL original literal legal first actions attaining the strongest available outcome class for current mover, WIN > DRAW > LOSS, NO game-length ranking. **Operationally, valid play needs only ONE provably best move, not the full set**. The full set is stronger Level 2 information, not a precondition for a correct next action.
- **Level 3 — Perfect moves:** timing refinement within the best outcome class: fastest guaranteed win, longest unavoidable loss under perfect opposition. Full-board draws always consume exactly `WH−n` further placements from q, so all drawing continuations tie in duration. Whether a general Level 3 no-branch algorithm is impossible is an OWNER HYPOTHESIS, not a complexity theorem.

For perfect-play mover-relative first-action P0-relative values `J_a(q)`:
- P0 mover chooses any action with `J_a=max_b J_b`.
- P1 mover chooses any action with `J_a=min_b J_b`.
- A certified FORCE WIN action is automatically best. A guaranteed DRAW action is best only if no force-win action exists from root. If mover LOSS is globally certified, ALL legal current first moves are tied best losses.
- A **qualitative order** proof also certifies optimality without computing ANY scalar J or V: for P0 show `∀b J_b≤J_a`; for P1 show `∀b J_a≤J_b`.
- When the source knows one best action but not its outcome, return `VALID_CONTINUATION` and explicitly `ordinaryRootValueP0Relative=null`, `bestOutcomeTier=null`. Do not invent DRAW or all-best membership.

With UNKNOWN opponent skill distinguish FORCE WIN (`exists our strategy, forall opponent policies`) from POSSIBLE WIN (`some first-win-stopped legal future line, perhaps due to opponent mistakes`). The owner's optimistic possibility preference is a different outcome model, NOT a success probability or guaranteed win. Current mathematical effort prioritizes perfect-play Level 2. Historical P0-only WIN masks are special cases, not the whole Level 2 definition.

## 4. Hard zero-branching objective: permitted vs forbidden operations

**Forbidden**: separately evaluating strategically inequivalent future games, regardless of speed or packaging—ordinary negamax/minimax search, multiple child-value recursion, alpha-beta pruning rebranded as elimination, alternative policy/path graphs, BDD/QBF/SAT programs hiding a game strategy tree, exhaustive future-word outcome enumeration, precomputed oracle move labels, or independently valuing each move then returning a set. A smaller branching factor is STILL branching.

**Permitted if honestly audited**: direct original current source residual-mask arithmetic; inspection of CURRENT seven legal literal action labels; fixed source physical symmetries or finite action-LABEL inequality closure; static source generator subset witnesses, fractional winline duals and gravity-safe pairing proof candidates if they do not represent alternative FUTURE GAMES; source algebraic all-opponent response implications; ONE selected strategically FORCED live opponent reply lane with source proof all deviations lose immediately, stopping `INCOMPLETE` if that lane fails. Structural matching witness enumeration remains combinatorial SOURCE proof work: do NOT call it literally zero search of any kind.

Sets of moves may count as one strategic direction only after the required equality/equivalence theorem. Scalar WDL equality is weaker than complete future-game behavior isomorphism and cannot justify replacing arbitrary future lane states without a further proof.

**Total target is OPEN:** source-certified ONE Level 2 best original move for EVERY valid original 7×6 q. Current real-board source results are conditional sufficient proof families on restricted q. Negative source result `INCOMPLETE` does not classify actual game outcome or prove impossibility of a more capable source invariant.

## 5. Original standard7×6×4 source algebra, transitions, and correct first-win

Physical W=7 columns, H=6 rows, K=4, exactly **69 original geometric winning K-cell windows**. Stones drop to the current lowest unfilled row `h_c`. Original first WIN immediately TERMINATES play; otherwise full 42-cell board is DRAW. P0 starts, P1 follows, current mover `p=(Σ h_c) mod2`.

The qualified orientation-sensitive source is

    q=(h,R0,R1)
    R_p = minimal antichain of surviving ORIGINAL winning-line
          remaining physical-cell requirements for player p.

For mover p placing x=(c,h_c): owner R_p contracts x from every generator and inclusion-normalizes; opponent R_(1−p) DELETES every generator containing x, then normalizes. Resulting EMPTY owner generator means p won NOW and play terminates. Full nonwinning board draws; otherwise mover toggles. A completely empty remaining family R_p=[] cannot later regenerate a p winning line. Raw original winning-generator streams can be tested without immediate global Min normalization when the original source cofactor/upset identities justify it.

The exact recursive source q core `research/isograph/discovery/2026-10-16-algorithmic-core/exact-q-core.mjs` is complete in principle for ordinary unrestricted WDL, child action WDL and full WDL-optimal labels, but BRANCHES recursively; reference only. An independent original physical colored 7×6/69-line checker is mandatory as a separate falsifier. `q_o` sameness preserves original action-labelled future game; `q_r` mirror quotient requires explicit column-label reflection transporter, not identity of literal action labels.

## 6. Canonical history 44444 and historical LOCAL move-seven/eight closure

One-based history `44444` means five moves in center original column 4; `n=5`, P1 to move on absolute move SIX, `h=[0,0,0,5,0,0,0]`, **37** future cells, original residual counts **R0=48, R1=42**. Absolute move SEVEN is P0; absolute EIGHT is P1. Older `k8/k9` reports count additional moves after this prefix, NOT necessarily absolute moves eight/nine.

Historical column-completion/move-seven–eight scoped source transition was already exactly solved with bounded controls: `docs/research/2026-10-16-column-completion-through-full-game.md` and `MOVE7_MOVE8_COLUMN_CLOSURE_RESULTS_0_1/0_2.json`. That is NOT a proof of unrestricted canonical 44444 perfect-play WDL or any best move.

The complete original q is EXACTLY invariant under full horizontal reflection φ(c,r)=(6−c,r), giving four guaranteed perfect-WDL equality classes of original P1 first actions:

    {1,7}, {2,6}, {3,5}, {4}

Only equality WITHIN each class is proved. The four classes remain unordered; do not return a guessed best. Direct source reflection requires ZERO permutation-witness enumeration or future game values; proof `docs/research/2026-10-17-fixed-reflection-source-q-automorphism-and-weak-WDL-order.md` and `research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/STANDARD7X6_CANONICAL44444_DIRECT_Q_REFLECTION_EQUALITY_CLASSES_RESULTS_0_1.json`.

Latest first-touch root `44444` failure (October 18): P1 R1=42, **35** original gate physical cells among P1 live generator requirements; **8** admit one common immediately legal blocker, **27** admit none under the current source proof's response guards. The current no-force-win first-touch theorem and Level 2 source operators return `INCOMPLETE`. This proves incompleteness of ONE-common-blocker-at-each-gate method, NOT that P1 wins and NOT that universal nonbranching mathematics is impossible.

## 7. Exact geometry unfolding and GF(2) source phase, but NOT a game-value proof

The fully original 7×6×4 geometric winning game can be unfolded into four orientation-based 1D ribbons: horizontal, vertical, rising diagonal and falling diagonal. The current exact construction has **37 strands**, each physical cell represented in its four corresponding orientation streams (42 physical cells → 168 tied aliases), 36 separators → 204 slots, and **69** contiguous original K=4 winning intervals. All four aliases of a given physical event MUST be equal. This is a faithful representation, not independent copies.

Gravity becomes ONE legal future word over original literal column symbols; j-th new occurrence of column c takes its next available cell. Exact owner event parity for a fixed legal future schedule is `χ(e)=(n+t(e)−1) mod2`. For event (c,r), isolate relative within-column row index plus XOR parity of prior moves in OTHER columns; relative column phase is `κ_c=(n−h_c) mod2`. Playing a toggles κ of every OTHER column and leaves κ_a unchanged. Height gradient/shear `Δ_c=h_(c+1)−h_c` unfolds horizontal/diagonal adjacency into local relative-frontier relations.

**Single center event marker at 44444:** the remaining 37 future placements comprise 36 noncenter column events with ONE future center-column symbol. Inserting that center marker at relative rank m changes the player owner of noncenter events in exactly one contiguous word interval when m changes. This is an exact XOR phase shift, not a proof that strategy is linear. Even marker placements with the same center-owner bit can reverse the FIRST winner. After center fills, surviving ORIGINAL winning requirements bridge left and right sides; at `444444`, 12 bridge generators per owner were observed. Left/right projected words may be interleaved, but the game is NOT two independent 3-column games.

**Critical nonlinear obstacle:** original K-line completion is an AND of owner-match requirements, winning across lines an OR, and stopping time is the EARLIEST first terminal for EITHER player. A true-7×6 independent adjacent-event-swap GF(2) test had 23,031 nonzero mixed second derivatives among 286,703 legally checked plaquettes. Thus original first-winner is NOT merely affine in independent parity swaps, despite the exact affine turn-owner clock. A proposed purely linear parity solution must explain these nonlinear interactions.

**Height/phase-only refutation:** independent physical legal real7×6 histories with identical h and parity gradient have different ordinary perfect WDL outcomes; another same-h pair had the SAME drawn WDL but best literal set {1} versus {2}. So include owner-sensitive original R0/R1 or a rigorously equivalent relational carrier. See `docs/research/2026-10-17-true7x6-height-only-Level2-counterexample.md`.

Relevant proved representations / evidence:
- `docs/research/2026-10-17-exact-linear-word-unfolding-of-7x6-gravity-game.md`
- `docs/research/2026-10-17-exact-four-ribbon-geometry-unfolding-and-phase-code-candidate.md`
- `docs/research/2026-10-17-center-full-left-right-shuffle-xor-bridge-factorization.md`
- `docs/research/2026-10-17-canonical44444-single-center-marker-xor-defect-unfolding.md`
- `docs/research/2026-10-17-standard7x6-row-column-phase-boundary-cocycle.md`
- `docs/research/2026-10-17-7x6-independent-event-swap-gf2-curvature-candidate.md`

## 8. Exact WDL Boolean algebra and the missing adaptive strategic closure

Ordinary P0-relative perfect-play V∈{−1,0,+1} has two nested threshold predicates `f_+=[V=+1]`, `f_0=[V≥0]`. Let p=n mod2 and `g_t=f_t XOR p`. On a nonterminal original q, under qualified first-terminal guards, both channels satisfy the transformed Boolean NAND identity

    g_t(q) = 1 XOR PRODUCT_{a legal at q} g_t(q_after_a)

with the correct terminal constants. The first-action transformed zero loci `Z_t(q)={a:g_t(q_after_a)=0}` reconstruct the exact ordinary WDL and conventional COMPLETE best original literal move set, with the P0/P1 mover-dependent nested-set rule. This is a mathematical identity, not yet a source algorithm evaluating unknown child predicates without strategic branching.

For ONE specified hypothetical complete gravity word, the eventual first-winner can be represented by original surviving source owner R_p and XOR schedule phase, using the earliest completed original winning requirement. A supplied word does not quantify opponent choices and thus cannot prove a forced WIN/DRAW/LOSS against arbitrary responses.

**Key revised output insight:** a source WDL action WEAK ORDER proof can select one BEST original action even if `V(q)` and all J_a scalar values are UNKNOWN:
- P0: prove chosen a satisfies `J_b≤J_a` for EVERY other legal b.
- P1: prove chosen a satisfies `J_a≤J_b` for EVERY other legal b.
Such a source qualitative certificate must itself use full-future sound cofactor simulation or another proven algebraic invariant, not a heuristic evaluation.

Pointers: `docs/research/2026-10-17-binary-zero-loci-complete-optimal-moves.md`, `docs/research/2026-10-17-standard7x6-binary-source-residual-payoff-factorization.md`, and the exact branching reference `research/isograph/discovery/2026-10-16-algorithmic-core/exact-q-core.mjs`.

## 9. Restricted source-certified WIN: gravity release-cover and one FORCED lane

For current mover p and a proposed original first action a landing at x, define after its nonwinning placement:
- D = all legally playable opponent reply literal columns.
- S = original columns with a NOW gravity-playable immediate p WIN target y, directly detected from current original p source requirement singleton {y} or owner contraction pair {x,y}.
- Z = original opponent reply columns d for which opponent claiming y_d gravity-releases z_d immediately above y_d, with p's original winning requirement singleton {z_d} or pair {x,z_d}.

Explicit source guard: opponent o has NO immediate counterwinning reply (check source R_o singleton original frontiers), no first terminal at an earlier event, and no last-cell DRAW before p gets a win.

Then EXACT necessary/sufficient source Boolean condition to force p FIRST WIN on its very NEXT turn after original a is

    |S| >= 2
       OR (|S|=1 AND unique S member belongs to Z)
       OR (|S|=0 AND D subset_of Z).

Forms: ordinary simultaneous two-column fork; newly identified SAME-column stacked lower/upper gravity fork; newly identified ALL-opponent-replies-release-win where S is empty but every o reply opens an upper winning cell. This checks only current source residual masks; no successor game q, no other move WDL, no opponent tree.

Source `research/isograph/discovery/2026-10-17-zero-fanout-direct-invariants/standard7x6-source-gravity-response-cover.mjs` (henceforth shorten this discovery directory to `D`). Physical evidence `D/STANDARD7X6_GRAVITY_RESPONSE_COVER_DIRECT_MATE_RESULTS_0_1.json`: **134,185** distinct sampled genuine real original7×6 q; **153,311** direct source WIN first-action proofs, including 5,201 stacked-release and 56 all-reply gift proofs (5 with multiple o reply columns). Independent physical reference checked **249,206** actual opponent responses to non-immediate source WIN actions; 80 late selected first-action physical full WDL checks; ZERO contradictions. Many of the total positives are already trivial immediate wins; do not count 153,311 as all newly discovered theorem coverage.

**One deterministic FORCED opponent reply lane:** If source move a creates EXACTLY ONE immediately playable p WIN target b, and o cannot win immediately, then o must BLOCK b or p wins immediately. Follow only the actual `q_after_a,b` lane, choose one next source forcing action from current mask order, and repeat. A rank-descending chain ending in the direct gravity response-cover proof proves original a WIN against ALL opponent strategies. If the single selected lane fails, return INCOMPLETE, NEVER backtrack into a second speculative future game.

`D/standard7x6-source-single-forced-threat-ladder.mjs`, `D/STANDARD7X6_SINGLE_FORCED_THREAT_LADDER_VALID_CONTINUATION_RESULTS_0_1.json`: on 56,712 separately sampled actual original7×6 q, the direct theorem certified 32,614 p-WIN roots and the one-lane method **671 ADDITIONAL** WIN-root continuations, including at least two six-round forced blocking ladders; 6,627 opponent deviations, 1,181 forced blocks, and 59,529 direct leaf physical replies checked; 75 late action recursive physical reference checks; ZERO errors. The source follows at most ONE strategically live future q lane, not a tree.

These are sufficient source WIN best-action proofs, NOT complete game-WDL decision on arbitrary q, and do not rank shortest forced wins (Level 3).

## 10. Restricted source-certified best DRAW and LOSS

**DRAW two-certificate theorem:**

    SOURCE root: current mover p CANNOT FORCE WIN
    AND SOURCE first action a: p can GUARANTEE NOT LOSS
    => V_p(q)=DRAW AND J_a(q)=DRAW => a BEST Level2.

The root no-forced-WIN proof must be GLOBAL for every current legal a under perfect opponent defenses, not a single losing alternative. It may arise from extinct p original win-generator family, a safe uniform gravity defender pairing, odd-spare guarded pairing, or latest directed first-touch shared-blocker strategy. The selected a source NONLOSS can arise from exhausting every original opponent residual winning requirement by that placement or a source guaranteed defender co-release response. No alternative first-action game values required.

`docs/research/2026-10-17-source-root-win-exclusion-plus-one-action-draw-witness.md`, `D/STANDARD7X6_ROOT_NO_WIN_SINGLE_DRAW_BEST_SOURCE_RESULTS_0_1.json`: 8,899 sampled late original q; **213** best DRAW original actions, 15 requiring a nontrivial source root no-forced-WIN pairing despite live owner winning requirements; 180 independent physical scalar-root-plus-selected-action WDL checks, zero mismatches.

**LOSS with vanished p original requirements:** if R_p=[] then p can NEVER win, and if surviving opponent original winning requirements R_o have nonnegative rational packing λ with per-remaining-physical-cell load ≤1 and `Σ λ > ceil((WH−n)/2)`, opponent must win before any hypothetical full-board DRAW (p has too few future stone placements to block all opponent original K-lines). Therefore current mover p LOSS regardless of p strategy, and EVERY legal original move is tied Level2 BEST LOSS. `D/STANDARD7X6_INEVITABLE_LOSS_ANY_BEST_MOVE_SOURCE_RESULTS_0_1.json`: 17 certified roots, 30 all-best original actions, all 17 roots and 30 actions independent physical WDL-verified.

**LOSS even when R_p survives:** a uniform o second-player gravity co-release pair-response policy covers EVERY current-mover viable original winning requirement with at least one complete pair; o takes the mate of each p first-touch, so p cannot first-win. A separate λ packing of o winlines exceeding p remaining blocking-turn capacity forces o first-win. This gives exact p LOSS despite remaining p winning lines. `docs/research/2026-10-17-adaptive-gravity-pairing-plus-opponent-overload-forced-loss.md`, `D/STANDARD7X6_PAIR_DEFENSE_DUAL_OVERLOAD_NONEXTINCT_FORCED_LOSS_RESULTS_0_1.json`: 18 sound real q, 40 equally losing first actions, 80 physical full defender-response-policy trials, 17 late root/36 legal-action WDL checks, zero mismatches.

**Opponent-skill caveat:** a source-pair policy forces defeat against perfect o responses; it does NOT mean o wins if o intentionally abandons the policy. Genuine history `41674362237752476413243476111375532156` has a physically possible p FIRST WIN suffix `565` against o mistakes, while a perfect o defender can force p LOSS. `D/STANDARD7X6_PAIR_DEFENSE_POLICY_NECESSITY_PHYSICAL_RESULTS_0_1.json`. Distinguish guaranteed outcome from possible outcome.

## 11. Odd spare cell, rejected cross-prefix theorem, corrected policy

With odd T=WH−n=2m+1, even-cell pairing leaves one unmatched U. An initial source theorem allowing an arbitrary ONE preemptively o-owned pending matched pair was **PHYSICALLY REJECTED**. In a two-cross-pair prefix, the half-filled earlier pair can release one cell of a later cross pair without releasing its mate on the other column. Exact real7×6 counterexample: legal original history `32452113456772416435741762343657217` with continuation `155` makes the claimed defender mate in literal original col6 row5 illegal because actual row4 is the gravity frontier. Record: `docs/research/2026-10-17-odd-spare-gravity-cross-prefix-rejection-and-safe-restriction.md`. The original unrestricted odd theorem is FALSE and must remain marked REJECTED.

**Sound guarded repair:** choose ONE currently playable unmatched original last cell U in a column with exactly one future cell; pair all OTHER future cells with co-release-safe source blocks where any cross-column prefix has **length ≤1** (plus vertical paired tails). With at most one pending half-filled pair, the opponent can preemptively mark an available virgin pair after p touches U or the previous pending mate; unsafe second cross-pair successors cannot become asymmetrically released. Each current-mover original generator contains one full matched pair, denying p first win against this ONE defender policy. `D/STANDARD7X6_ODD_SINGLE_SPARE_SAFE_GRAVITY_PAIR_NO_FORCED_WIN_RESULTS_0_1.json`: 18,076 sampled odd-turn real7×6 q, 65 guarded source NO-FORCE-WIN positives with live p winning requirements, 414 independent physical defender-policy trials including 306 preemptions, 50 late recursive WDL root checks, zero contradictions.

Composing this guarded root no-WIN with one action NONLOSS or opponent strict winline packing gave **16** DRAW best roots and **3** LOSS best roots among those same 65. These were **19 new over V1** on that odd-specific comparison, NOT a further 19 beyond the later V4. `D/STANDARD7X6_SAFE_ODD_PAIR_SOURCE_DRAW_OR_LOSS_BEST_RESULTS_0_1.json` and `D/STANDARD7X6_UNIFIED_V1_V2_SAFE_ODD_19_NEW_LEVEL2_BEST_MARGINAL_RESULTS_0_1.json`.

The isolated topmost remaining center cell at canonical `44444` does NOT by itself furnish a safe complete original R1-blocking pairing; the guarded odd source returned INCOMPLETE. Do not confuse failed pairing witness construction with a perfect-play P1 winning proof.

## 12. Integrated proof-carrying source V1 through V4 (historical progression)

These are restricted-domain mathematical best-action certifiers, NOT yet a single total no-branch solver. Older source files/evidence remain immutable.

- **V1:** combine source direct gravity WIN, one forced-opponent-lane WIN ladder, root no-WIN plus first-action NONLOSS DRAW, and extinct/pair-protected opponent dual LOSS. On ONE nonuniform original7×6 corpus of 12,771 tested late genuine q, source certified **10,819** best first actions: 10,550 WIN / 244 DRAW / 25 LOSS; 200 independent selected root+action physical WDL checks with zero disagreements. This is a sample ratio, NOT an arbitrary-state coverage rate.
- **V2:** add corrected safe odd one-spare blocker response plus opponent dual LOSS or source a NONLOSS DRAW. 19 newly source-qualified q over V1 among 65 guarded odd-root q on SAME selected corpus; safe prefix ≤1 only.
- **V3:** add scalar-free qualitative original source WDL-order extremum via full capacity-preserving source column transporter. Root V and all other J values can be UNKNOWN; 11 new best source moves beyond V2 among 48 qualitative source positives, independently physically verified. Older static transport enumerated 57,670 completed compatible COLUMN PERMUTATION proof candidates across one q corpus; this is STATIC SOURCE proof search, not independently valued future games.
- **V4:** direct original raw-q two-column same-height SWAP inequality ahead of V3 static full-column permutation fallback. Fixed source swap certified 86 best roots in its own true7×6 corpus, all ALREADY V3 best. On SAME 23 scalar-free V3 positions it avoided **4,142** completed static permutation proof candidates by using one bitwise fixed transposition; **ZERO new q best coverage** compared to V3. The fallback is retained when direct source insufficient. `D/standard7x6-unified-one-valid-best-action-source-v4.mjs` is the latest INTEGRATED frozen research selector, not a qualified public solver.
- All versions emit one original literal best action and source certificate when guarded; otherwise `INCOMPLETE`. V3/V4 may certify one action while explicit root ordinary WDL is NULL/UNKNOWN. A positive proof is NOT necessarily complete all-best set.

**Crucial current routing:** October 18 FIRST-TOUCH source best DRAW/LOSS work is frozen SEPARATELY from unified V4 and contributed **19 NEW source best positions over V4** on its own same-root 295-no-WIN-certificate comparison. It has not been silently merged into a qualified V5; a further union requires separate source proof and independent same-corpus validation. Do not add the two unrelated counts of 19 as disjoint global positions.

Main records `docs/research/2026-10-17-unified-one-certified-best-action-source-protocol.md` and `docs/research/2026-10-17-unified-source-v4-fixed-two-column-swap-before-transport.md`; evidence `D/STANDARD7X6_UNIFIED_SOURCE_V3_SCALAR_FREE_11_NEW_LEVEL2_BEST_RESULTS_0_1.json` and `D/STANDARD7X6_UNIFIED_V4_DIRECT_SOURCE_23_NO_PERMUTATION_RESULTS_0_1.json`.

