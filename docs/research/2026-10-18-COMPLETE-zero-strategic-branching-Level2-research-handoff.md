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

