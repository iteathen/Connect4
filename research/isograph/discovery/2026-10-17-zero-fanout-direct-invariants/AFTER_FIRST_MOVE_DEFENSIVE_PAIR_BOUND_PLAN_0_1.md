# Frozen mathematical test: direct FIRST-ACTION full-future opponent-win impossibility

**Date:** 2026-10-17 Pacific, live research HEAD at freeze `b2c789d90e8742691b31c0d1a0ff67b8bf693cfd`.
**Research owner:** research/semantic-quotient. **Status:** pre-prototype mathematical plan, not source game outcome.

## Owner criterion
Find exact unrestricted root WDL and ALL mover-optimal moves in one game-semantic evaluation lane; no evaluating inequivalent future game continuations, no QBF/BDD or minimax. Testing finite source constraints separately for every literal candidate move is allowed ONLY insofar as the computation never constructs/evaluates that action's strategic future value, but instead extracts necessary exact WDL implications from original q. Explicitly disclose hypothetical per-action SOURCE residual slice work; do NOT falsely report zero algebraic per-action work.

## Algebraic theorem (source-only, unrestricted outcome bounds)

For q=(h,R0,R1) legal nonterminal and mover p=rank mod2, original playable x_c=(c,h_c). Its one-step residual cofactor is SYMBOLICALLY
    h^c_d = h_d+[d=c],
    R_p^c = min{r\{x_c}: r∈R_p},
    R_(1-p)^c = min{r∈R_(1-p): x_c∉r}.
This is ordinary source cofactor arithmetic, not construction of independently valued future game positions.

- An immediate p win {x_c}∈R_p overrides every other rule; last-board-cell nonwinning move draws.
- If `R_(1-p)^c=empty`, the OPPONENT can never win after c. Thus this FIRST ACTION c has a certified full-future **nonloss for mover p**: P0 mover -> P0-relative WDL lower>=0; P1 mover -> P0-relative WDL upper<=0. No next-state WDL evaluation.
- More generally if c nonterminal, opponent o moves NEXT and the remaining cell count is EVEN, and a static gravity-safe perfect pairing of ALL post-c empty cells covers every normalized generator of opponent R_o^c, then the original mover p, who replies second, has a mate-response strategy preventing o from ever completing any winline. This likewise certifies that FIRST ACTION c cannot lose for p, regardless of p's own future winning lines or any opponent attempt. If moreover R_p^c empty, p cannot win either; c is EXACT DRAW, with no future q WDL.
- If `R_p^c` empty, the mover cannot win after nonterminal c: P0 mover -> upper<=0; P1 mover -> lower>=0. This remains true if opponent can win sooner.

The static pair-cover theorem is the prior source fixed-pair defender-response theorem applied after the FIRST move, not a spurious claim that the next attacker or defender can force its own win. Both first-win event timing and gravity entry are explicitly guarded.

## Static pairing witnesses (not gameplay strategy search)

Initially choose deterministic vertical or full-column horizontal equal-height blocks as in `global-no-win-bound.mjs`. To assess whether this deterministic matching is unnecessarily incomplete, use an OPTIONAL exhaustive STATIC partial pairing witness enumeration on **at most W=7 original column names**, *not* future game moves or full strategies. The producer's semantic evaluation lane never branches into game continuations; certificate search records W-by-W source matchings and bitset work separately. Because each valid pairing is one universal future strategy invariant, one source proof witness suffices. Do NOT claim total polynomial-time elimination, best-move determination, or 0 algebraic candidate enumerations from this helper.

## Frozen tests
- Independent full 3734 / 34094 distinct legal q 4x3/4x4: compare every per-action WDL interval, every exact DRAW classification, immediate win/full-board stop and all gravity guarded pairing certificates to exact q reference AFTER source proof construction, with zero false exclusions. Count source operation work, per-label disjoint pair witness counts, and coverage.
- Test canonical 7x6 `44444`: original 37 remaining empty, after each of seven first P1 moves 36 even; report WHICH per-action source win-impossibility/pair-defense proofs exist, not numerical WDL unless exact. The center-fill-vs-wing capacity mismatch must be preserved.
- Legal `223`, `111`, `1111222234334`, first-win, no-lines, odd/even release, opposite-owner threat guards.
- If sound, merge the certified per-action interval bounds with the earlier source full-future weak-order lattice, full-future equivalence classes, and one-lane exact optimal-set separation (which does NOT require inferior numeric WDL), comparing number of exact new `(V,M*)` labels against prior 2914/6725. Candidate may recursively value ONLY ONE still-unknown future-equivalence class. If two inequivalent unknown classes remain, return INCOMPLETE without exploring either.
- Enforce previous per-source safety envelope 60000 nodes/300000 counted source bitset operations/10000 support representatives/15 seconds; these are NOT theorem success/time goals. No authority promotion or merge.

**Key adversarial control:** a singleton opponent threat on the NEXT gravity landing must make paired defense impossible (no pair can be contained in a singleton). A pairing that ignores a winning generator or a player parity mismatch must be rejected. A merely top-landing-free cell with higher threatened cells does not make a column inert.
