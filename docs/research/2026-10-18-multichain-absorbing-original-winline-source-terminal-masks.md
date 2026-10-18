# Exact first-terminal reachability for a fixed colored multichain gravity allocation

**2026-10-18 — mathematical source theorem FROZEN before original true 7×6 physical falsification.** Research owner `research/semantic-quotient`. Qualified IsoGraph 1.2 game-theory semantics and orientation-sensitive original `q_o` unchanged. This extends the exact mixed-radix fixed-color phase-source operator and its sufficient event-rank race bounds. **It decides all possible first-terminal results of hypothetical alternating shuffles of ONE PRESCRIBED future physical-cell owner allocation. It is NOT ordinary perfect-play WDL, a strategy graph, a source best-move oracle or the owner's total zero-strategic-branching Level 2 formula.**

## 1. Fixed owner-colored gravity prefix lattice

Start with a genuine legal nonterminal original `q=(h,R0,R1)`, n=Σh, and r selected distinct gravity columns c_d with lengths m_d of their next physical events and prescribed local owner-color bits x_d[t] (t=0..m_d-1), total T=Σm_d. As established in `docs/research/2026-10-18-multichain-mixed-radix-colored-shuffle-factorization.md`, all legal fixed-profile gravity prefixes at relative rank k share the same resource-count coordinates `i=(i_0,...,i_(r-1))` satisfying Σi=k. Encode the first r−1 coordinates as a mixed-radix index J, with the last inferred from k. At rank k the only next selected column d is physically available when i_d<m_d and `x_d[i_d]=(n+k) mod2`. The earlier source proved full fixed-profile feasibility with Boolean bitset shifts and OR, without enumerating complete words or valuing games.

For every such resource vector i, the set of future physical cells already allocated to p is **fixed**, regardless of which compatible hypothetical word led to i:

    A_p(i) = union over d of the first i_d original gravity cells of c_d
             whose PRE-SPECIFIED local owner bit equals p.

This is not a recolored-game approximation: each chosen original physical cell is uniquely determined by (h,c_d,ordinal) and its prescribed owner. Original source winning requirements R0/R1 retain their exact physical-cell IDs and original first-terminal meaning.

## 2. Source-only terminal threshold vectors

For each original surviving generator `G ∈ R_p` such that every G cell belongs to the selected OWNER-p segment physical-cell allocation, construct the **completion requirement vector**

    θ_{G,d} = 0 if G contains no selected future cell of c_d,
    θ_{G,d} = 1 + max { t : (c_d,h_c+t) ∈ G } otherwise.

The owner-p color guard is ESSENTIAL: if any G physical cell lies outside selected p-owned future events, then G can never complete within this particular fixed-profile segment; omit it.

For any valid resource vector i, `G ⊆ A_p(i)` iff `i_d≥θ_{G,d}` for ALL selected columns d. This is an exact static current-root physical geometry/owner-incidence comparison, not a successor q evaluation.

For a nonterminal physically reachable prefix at layer k with current mover p=(n+k) mod2, one legal next selected event d leads to counts `i'=i+e_d`. The event is an immediate FIRST WIN for p iff some p-generator θ satisfies `i'_j≥θ_{G,j}` for EVERY j. The opponent's own generators cannot newly complete when p places a stone, and previous terminal states are excluded from live propagation.

## 3. Absorbing single-frontier Boolean convolution

Define `N_0 = {i=0}`, the set of fixed-profile physically gravity/turn-color-compatible prefix-resource vectors that have **not** reached either player's FIRST WIN. At each layer k=0..T−1, construct the next layer from the ONE current nonterminal resource bitset `N_k`:

For every source-eligible (i,d) with i∈N_k, d's owner matches the alternating clock, and i_d<m_d:

- If the static p-generator threshold predicate holds at i'=i+e_d, record `p` in the exact possible first-winner set and, if useful, relative first-winning placement rank k+1. The new resource vector is NOT added to `N_(k+1)` (absorbing original FIRST-WIN semantics).
- Otherwise, mark the bit for i' in `N_(k+1)` by Boolean OR. Multiple fixed-profile interleavings reaching the same i' are merged in ONE source resource bit, with no child-game value or path stored.

At the end of T selected events, if the terminal resource vector remains in `N_T`, one whole supplied fixed-profile segment can finish without a win. This means `NO_FIRST_WIN_WITHIN_SEGMENT`, not a game DRAW unless the original full board was actually filled.

**Exact theorem (proved by induction):**

    N_k bit J(i) = 1
      iff there exists a gravity-legal prefix of k selected events
          respecting ALL prescribed physical owner bits,
          reaching resource counts i,
          with NO original first win up to and including rank k.

Thus the union of terminal flags recorded on absorbed transitions, plus the possible nonterminal flag at N_T, is **EXACTLY** the set of possible actual first-terminal outcomes among all hypothetical full fixed-profile shuffles. The source never needs to enumerate the words to compute this set, and no recursively valued game states or opponent strategies are materialized.

Proof: Root q is first-win free, establishing N0. A legal next event is uniquely specified by (i,d) and original gravity. Original player turn parity and target color are root-profile arithmetic. The original winning-line terminal test is exactly G⊆A_p(i'), equivalently threshold θ. The only distinct ways to extend a nonterminal prefix are these current-column heads, but Boolean OR combines their *resource facts*, not game-value alternatives. Once terminal, first-win stopping is absolute and the prefix cannot extend as an actual game. Every true nonterminal prefix arises from some preceding true nonterminal prefix and a source-eligible nonwinning event; hence induction both ways. The first-winning event occurs on a transition from some N_k and is recorded precisely. All nonterminal complete words are accounted for at N_T. QED.

## 4. Source algorithm and reporting discipline

The producer operates on **ONE prescribed fixed future owner profile** and the original q only:

- Source generator subset/threshold construction from `R0,R1` and original event geometry;
- One Boolean resource bitset per layer; source scans or bit-slices static prefix-count positions, checks head phase, and absorbs terminal wins;
- A possible-terminal mask in `{P0_FIRST, P1_FIRST, NO_FIRST_WIN_IN_SEGMENT}`, and optionally per-winner attainable first-win ranks;
- `sourceFutureGameWDLQueries=0`, `sourceStrategyTreeNodes=0`, `sourceCompleteWordsEnumerated=0`; record the nonzero STATIC resource-prefix work transparently.

Unlike previous sufficient upper/lower rank enclosure rules, this operator returns an **exact fixed-profile first-terminal possibility set** even when two original owners would eventually complete one of their winlines in a counterfactual complete allocation.

**Scope warning:** This is a static finite automaton membership/terminal reachability over colored column-prefix resources. Its OR merges alternative **schedules for a fixed coloring**; this is combinatorial source work, not literally zero branching of every kind. Since the coloring is externally prescribed, the operation does not transport conditional opponent actions or solve `∀ opponent / ∃ our response`. Do NOT use the exact possible-winner set to assign ordinary perfect-play WDL to q or assert a Level2 best column.

This exact representation may be large for many nontrivial columns (mixed-radix width `∏_{d<r-1}(m_d+1)`), so source budget exhaustion must return `INCOMPLETE_RESOURCE`, not invented absence of wins.

## 5. FROZEN independent genuine original7×6 physical tests

1. Freeze pure original source producer implementing this theorem, then a separately authored original 69 geometric four-cell winning-line physical checker. Physical test may enumerate multiple *complete hypothetical words* to FALSIFY the source first-winner set; the source must never enumerate or value alternative strategic games.
2. Use EXACT SAME already frozen 62 original W7H6K4 three-column physical configurations and 1,482 feasible prescribed owner-color patterns (5,704 source checked, 10,326 physical test words). Verify all source predicted terminal result flags and original first-win ranks against independently observed earliest terminal; compare specifically with previously frozen rank-bound outcomes `STANDARD7X6_THREE_CHAIN_EVENT_RANK_BOUNDS_22_DUAL_FIRST_WIN_MATCHED_RESULTS_0_1.json`.
3. Of 22 previously source-dual possible winning-color profiles, the prior rank-envelope sufficient theorem closed ONE (P1 first); 21 remained incomplete; physical control found NINE owner-color fibers with BOTH possible first winners. New exact source terminal outcome sets must classify every one of the 22 without false positives, and MUST report BOTH winner possibilities on the four-event `2544 / 4425` genuine physical witness.
4. For nonterminal source profiles, show the original `NO_FIRST_WIN_IN_SEGMENT` flag rather than an unjustified full-board DRAW.
5. Preserve all failures and budget exhaustion with exact frozen source ref, independent control ref, original seed/input corpus, and qualification strength. Maintained Node26 CI / external proof assistant remain separate gates. No qualified authority promotion or solver branch merge; canonical `44444` original perfect WDL and one source-certified best move remain UNKNOWN/INCOMPLETE.

## 6. Next mathematical seam after exact fixed-profile first-terminal closure

This theorem finishes chronological terminal classification of a GIVEN owner allocation without explicit word evaluation, but does **not** pick an allocation against adversarial opponent play. The owner-proposed ultimate geometry unfolding + turn-sequence elimination requires an additional **observation-sensitive strategy-congruence invariant**, not just an exact complete-trajectory event-colored abstraction. This exact distinction is physically proven by the rank34 valid `2,4,5,7 ↔ 5,7,2,4` trace-diamond root values `J2=-1`, `J5=0` despite identical nonterminal endpoints.

The next target is an ORIGINAL q/ribbon source theorem that transports **all** opponent reply fibers under adaptive play without separately valuing future strategic games. This is OPEN and should not be disguised by further trajectory simulations or source Boolean structures that implicitly compute perfect-play minimax values.
