# Terminal-column gravity-compatible analogue of the greedy-move lemma: one best-move candidate

**Frozen before independent 7x6 evaluation, 2026-10-17 Pacific.** Canonical research branch research/semantic-quotient. **STATUS: UNQUALIFIED MATHEMATICAL HYPOTHESIS, NOT A PROVEN CONNECT4 BEST ACTION.** W,H,K symbolic with primary board W=7,H=6,K=4. Original qualified IsoGraph gameplay logic unchanged.

## Cross-domain source

The STACS 2026 achievement-positional-game research *Maker-Maker Games of Rank 4 Are PSPACE-Complete* (https://drops.dagstuhl.de/storage/00lipics/lipics-vol364-stacs2026/html/LIPIcs.STACS.2026.40/LIPIcs.STACS.2026.40.html) restates an exact **Greedy Move Lemma**. In an UNRESTRICTED first-win strong achievement hypergraph game without singleton surviving edges, if the current mover has a surviving edge {u,v} and every surviving winning edge of either player containing u ALSO contains v, then playing v first is optimal and immediately threatens u, forcing the reply u. The imported lemma was not proved for original gravity Connect Four. Rank-4 generalized hypergraph PSPACE-completeness does NOT entail any impossibility result for fixed standard 7x6.

## Conservative gravity-compatible candidate conditions from ONE exact original source q=(h,R0,R1)

Let p=sum(h) mod2 be current mover, A(q) the ordinary original literal legal columns. Select two DISTINCT legal columns cu!=cv such that EACH has exactly ONE unoccupied cell: H-h[cu]=H-h[cv]=1. The current legal top cells are u=(cu,H-1), v=(cv,H-1). Playing either exhausts its column and releases no future cell. Require:

1. Both owner-tagged surviving original generator families contain NO singleton generators anywhere, including above still-unplayable gravity positions.
2. Current-mover original residual family R_p contains the two-cell generator exactly {u,v}.
3. Every surviving generator G of either player containing u also contains v. This is a source dominance implication tested directly over original 7x6 winning-line residuals.
4. Current source is genuine first-win-stopped and no immediate original terminal already occurred.

**Candidate claim only:** choosing original literal column cv (v) is a Level2 best move under PERFECT opposition, despite unknown scalar V, because v threatens u and opponent must spend next move occupying u or lose. With both columns terminal, following v/u does NOT alter the future legal-column predecessor graph for any other column. The published unrestricted greedy-move lemma suggests this relation, but gravity may still change first-win chronology and emulation of other strategic moves.

**DO NOT PROMOTE without proof.** A forced opponent reply does NOT alone certify optimality against all other current moves. The lemma in unrestricted games might rely on strategically unavailable gravity replacements. Numeric/physical positive samples are evidence, not a universal mathematical proof.

## Frozen independent standard 7x6 falsification plan

1. Commit a SOURCE-only detector taking current q and examining literal legal terminal-column pairs and 69 original residual masks. Return CANDIDATE_UNQUALIFIED with chosen first column, never VALID_CONTINUATION, and ZERO child q construction/WDL lookups.
2. Generate deterministic true7x6 legal FIRST-WIN-STOPPED physical q at early/middle/late ranks; run detector. For each detected source candidate, compute ordinary root V and ALL current literal first-action values using independent PHYSICAL recursive minimax reference only AFTER source q-based candidate frozen. A candidate whose action WDL fails to equal root disproves gravity adaptation. Preserve actual legal history, original q masks and full WDL vector.
3. If no candidates occur in bounded sample, preserve SAMPLE_NEGATIVE and do not infer mathematical completeness. If all pass, seek a direct gravity source-proof simulation rather than relying on testing alone.
4. No solver merge or qualified IsoGraph 1.2 promotion.

## Why relevant to current research

A genuine source rule that proves ONE best move via a local residual requirement DOMINANCE implication, without ever proving scalar root WDL, could advance the owner's total non-search Level2 target more directly than restricted source first-win/no-win strategy certificates. This candidate exploits the gravity-poset terminal condition to reduce its difference from the unrestricted achievement-game lemma but does NOT assume the difference has disappeared.