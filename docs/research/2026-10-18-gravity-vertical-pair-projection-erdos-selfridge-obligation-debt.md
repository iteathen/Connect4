# Vertical co-release pairs plus exposed residual Maker–Breaker potential: guarded ORIGINAL q full-future first-win prevention

**2026-10-18 — new guarded ORIGINAL source criterion and research plan, FROZEN BEFORE code and original 7×6 controls.** Research owner `research/semantic-quotient`; governing qualified gameplay authority IsoGraph 1.2 UNCHANGED. **Status at freeze: source theorem mathematically derived, practical positive marginal unknown.** This is an application of the classical Erdős–Selfridge Maker–Breaker criterion to a gravity-specific split of original source winning requirements, not an invention of the generic ES result and NOT arbitrary-q zero-strategic-branching Level2.

## 1. Why old complete pairing and static fork graphs are insufficient

Prior `docs/research/2026-10-17-adaptive-gravity-pairing-plus-opponent-overload-forced-loss.md` requires a FULL co-release-safe pairing of all future physical cells with a pair inside EVERY current mover winning requirement, then uses an independent opponent original winning-requirement fractional overload to prove opponent FIRST WIN. This gives genuine SOURCE LOSS but misses cases with a few viable mover lines that no complete co-release pair can cover.

The new exact current `q=(h,R0,R1)` invariant separates delayed gravity obligations, handled by forced vertical co-release pairs, from a remaining FRONTIER subgame, handled by a potential inequality rather than additional fixed pairs. This can defeat an attacker WIN without binding the defender to a mate on **every** original potential threat line.

## 2. One deterministic ORIGINAL gravity partition, no static pairing search

Let p be current mover at nonterminal root q, o=1−p respondent, T=W·H−Σh>0. For each original column c with t_c=H−h_c still-empty cells:
- if t_c EVEN, form consecutive vertical pairs from the root frontier upward: (c,h_c)~(c,h_c+1), (c,h_c+2)~(c,h_c+3), ...;
- if t_c ODD, leave ONLY the lowest currently playable root-frontier cell (c,h_c) UNPAIRED, and form vertical pairs ABOVE it: (c,h_c+1)~(c,h_c+2), ...

All consecutive same-column pairs are gravity **co-release safe**: whenever p first claims either member of an as-yet-unsecured pair, o immediately claims the other if the pair is unblocked; the only possible first claimed cell is the lower member, which releases the upper mate as an immediately legal defender response. If a pair already has an o-owned member, it is secured forever. In any first-win-free play this policy ensures p never acquires BOTH cells of any chosen pair.

Write U for the union of ALL pair cells and F for the set of UNPAIRED cells. By this deterministic partition, F consists entirely of the ROOT-PLAYABLE first cells of columns whose remaining height t_c is odd. No other unpaired future cell exists, and every x∈F remains physically legal from q until one player claims it, independent of other column moves.

## 3. Expose a conservative independent residual hypergraph

Take ORIGINAL current normalized viable p generator family R_p. Every G∈R_p containing a COMPLETE co-release pair `P_j⊆G` is immediately **pair-blocked** by the respondent's strategy, regardless of other ownership changes. Ignore those G.

For each other remaining G∈R_p (no complete pair contained), form its *EXPOSED residual*

    E(G) = G \ U   ⊆ F.

This grants p ALL pair cells for FREE for purposes of upper-bounding its ability to win: if the original G could ever become all p-owned, then p necessarily claims all cells of E(G). The real respondent owning some paired cells can only make this virtual Maker task easier to DEFEND, not harder. Require `E(G)≠∅`; an empty exposed residual would let p win with only at most one cell of several distinct pairs while o mates the others, so there is no fixed exposed target to defend and this certificate returns INCOMPLETE. We may retain duplicate E(G), or normalize to an antichain; use raw exposed requirements conservatively (duplicates make the weight bound harder but never falsely certify).

Define the dyadic **obligation-debt potential**

    Φ_p(q,U) = Σ_{G∈R_p, G contains no full pair} 2^{-|E(G)|}.

As every E(G) lies in the initially playable set F, this defines an ordinary finite-universe Maker–Breaker positional game on F. The classical Erdős–Selfridge sufficient Breaker-second condition is

    Φ_p(q,U) < 1/2.

This is checked exactly using integer dyadic arithmetic (max surviving K-line residual size ≤K, so multiplying by 2^K yields the integer `Σ 2^(K−|E(G)|) < 2^(K−1)`).

**THEOREM (gravity hybrid p NO FIRST WIN).** If all exposed residuals are nonempty and `Φ_p<1/2`, respondent o has one uniform online defensive strategy:
1. When p claims a cell in any still-unsecured vertical pair, o immediately claims its gravity-released mate;
2. when p plays in F, o responds on an available member of F via the classical Erdős–Selfridge maximum-danger/potential strategy on the projected hyperedges `{E(G)}`;
3. when p plays outside any live exposed hyperedge and no required pair needs mate, o may take a legal harmless or improving move.

**Reason:** Every original p generator containing a full pair is permanently denied. The others project onto E(G)⊆F; even if p is *virtually credited* ownership of all paired region U, p must win the F-only Maker–Breaker subgame to complete any such G. o claims a matching mate on every p move in U and responds via a valid second-player ES strategy on F on every p move in F. Moves by p in U are PASSES relative to F, and o mate responses are passes too. Extra o claims in F when p passes can only help Breaker. The original gravity restrictions never forbid the selected F response, because F were ROOT-frontier cells; they remain available until owned. Thus ES defeats all exposed p lines and pairing defeats all covered p lines. Hence p cannot FIRST WIN, against ALL adaptive p legal game policies, without enumerating their game continuations.

**If R_p empty**, earlier source extinction applies; do NOT count as newly covered.

## 4. Combine with an independent opponent WIN inevitability overload

Exactly as the already frozen fractional source theorem, seek rational nonnegative weights λ_G for ORIGINAL R_o such that

    ∀ future physical x, Σ_{G∈R_o:x∈G} λ_G ≤ 1,
    and Σ_{G∈R_o} λ_G > ⌈T/2⌉.

The current p may occupy at most ⌈T/2⌉ additional physical cells before an unwinning full board. If o has NOT FIRST WON by a hypothetical full board, each surviving original o winline G must contain at least one future p cell. Summing λ_G over the p cells then yields `Σ λ_G≤⌈T/2⌉`, contradiction. Combined with p NO-FIRST-WIN hybrid strategy, **o MUST FIRST WIN** under that one uniform o defensive policy.

This proves ordinary root p **LOSS**, and EVERY currently legal original literal action is equally Level2 best (all lose). SOURCE may return one original legal action without asking any actual future game value.

**Important T parity distinction:** earlier full-pairing proof required even T, but this hybrid pairing is PARTIAL, and the fractional capacity threshold uses ⌈T/2⌉ for both odd and even T. For odd T, p makes the last hypothetical full-board move if neither first-wins; the weighted blocking contradiction still forces o to have won earlier. No repeated game-state recursion appears in either source component.

## 5. Frozen source and physical falsification obligations

1. Freeze PURE original q source producer computing this canonical vertical U/F, root generator pair-containing vs exposed partition, exact rational dyadic potential and, only for potential positives, existing frozen original R_o fractional packing `standard7x6-source-fractional-transversal.mjs` (do not copy/rewrite that oracle). Verify every λ numerator/denominator integer capacity directly from original R_o. ZERO future game q states or opponent game-value queries.
2. Independently true original W7 H6 K4 physical 69-line checker builds nonterminal q along fixed seeded first-win-free histories, computes the same partition and Φ in separate code, and checks all positive source masks and rational dual capacities before game play. If a full hybrid-positive source q is found, physically validate o online policy on actual legal p game variations, and use independent physical WDL minimax only after source candidate freeze, with finite budget and honest incompletes.
3. Compare positives on SAME original q to previous FULL co-release pairing+dual overload source and old V4; count only truly marginal source-positive LOSS states over those, never simply a potential inequality as a Level2 outcome.
4. Preserve sample-negative results (especially potential failures), proof budgets and any invalid forced-win label; Node26 CI/independent external formal checker not implied. `44444` unrestricted first-action best remains INCOMPLETE unless new exact root source strategy proof applies.

## 6. External provenance and no-overclaim

The base Maker–Breaker potential theorem is ERDŐS–SELFRIDGE (1973), surveyed in ICM 2014 positional-games overview `https://www.mathunion.org/fileadmin/ICM/Proceedings/ICM2014.4/ICM2014.4.pdf`, and used for m,n,k games (e.g. `https://doi.org/10.1016/j.tcs.2020.02.023`). The new Connect4-specific idea is the exact SOURCE projection of delayed gravity cells into deterministic vertical co-release pairs plus an exposed root-frontier residual hypergraph, composed with the previously known original fractional overload. We do not call that classic potential theorem our own, nor silently extend it to arbitrary unreleased cells.

This is a sufficient structural certificate, not a necessary characterization and not the total zero-strategic-branching game theory.
