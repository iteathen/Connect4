# Freeze: partial-generator constraint propagation before completing any column transport

**Date:** 2026-10-17 Pacific. **Live research HEAD:** `e0202bf4d6d15aad43026919cc74fb1630ad1115`.
**Owner:** `research/semantic-quotient`. **Status:** PRE-IMPLEMENTATION MATHEMATICAL FALSIFIER PLAN.

The existing exact source-only full-future column-permutation simulation (see `CROSS_SUPPORT_COLUMN_TRANSPORT_PLAN_0_1.md`) finds the known horizontal reflection between canonical `44444` P1 replies 1 and 7 but exhausts 300,000 finite source bitset ops before checking all 21 reply pairs. This is a **permutation proof search** budget failure, not a WDL/game-tree branch obstruction.

## Exact new pruning law
At a **partial** height-preserving injective column mapping π on assigned domain D and assigned codomain E, the source antichain generator g has a fixed transported bitset `φπ(g)` whenever every column used by g lies in D. Every extension of π keeps exactly this image. Thus if no target generator h satisfies `h ⊆ φπ(g)`, the corresponding upset inclusion is IMPOSSIBLE for all complete π extensions. The reverse-direction obligation tests generators from the target that use only E and maps them by π^{-1} into the source.

Maintain two **independent viability flags**:
- Forward A≤B: for every *fully mapped* g in A.R0, some B.R0 generator must be contained in φ(g); and for every *inverse-mapped* h in B.R1, some A.R1 generator must be contained in φ^{-1}(h).
- Reverse B≤A: for every inverse-mapped h in B.R0, some A.R0 generator must be contained in φ^{-1}(h); and for every fully mapped g in A.R1, some B.R1 generator must be contained in φ(g).

Only prune the partial permutation node when **BOTH viability directions are false**; a single false direction may still yield a one-way FULL-FUTURE WDL dominance certificate. If both remain viable to full width, emit the exact complete-permutation certificate; mutual inclusion under one π yields exact full future game isomorphism and label transport. Every tentative mapping must preserve `h_A[c]=h_B[π(c)]`; original terminal/first-win and rank guards remain mandatory.

The partial inclusion law is necessary (sound pruning), and at a full mapping it is sufficient as in the already frozen complete source-column simulator. It is mathematically NOT a quantified swap or a game-continuation explorer: mappings are at most W! column correspondence candidates, with no q descendant/WDL queries.

## Implementation, counters, falsifiers
- Represent each residual generator by a compact list of future available cell coordinates plus a column-support mask. At each partial mapping test only generators whose used source/target columns are ALL assigned. Charge every membership, transported source bit and generator containment test. Do not silently omit loop work.
- Enumerate columns in a fixed heuristic order derived ONLY from support and source residual incidence (not solved values). Original literal column mapping is retained even if search order differs. Pre-test the known mirror pair at 44444 to guarantee reflection transport.
- Test all 4x3/4x4 independently legal first-win nonterminal P1 source q where feasible, comparing each newly certified root P1 reply inequality with independently qualified full exact-q WDL after both P1 choices; compare equality/tie and exact-isomorphism future-action transport. Count unique (q,b,c) certificates, newly certified nonmirror pairs and actual root WDL scalar alternatives that could be omitted. For reverse controls use 111/1111222234334, 223 and center-column capacity mismatch.
- Under original 60k reps/node / 300k source Boolean bitset work / 10k source supports / 15 sec per source, test all 21 canonical 44444 move-six reply pairs; preserve any unproved partials as UNKNOWN. No arbitrary cap changes, no independent game-play path enumeration in candidate, no authority promotion/merge.
