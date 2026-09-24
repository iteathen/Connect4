# Live-line evaluator lineage and optimization recovery

**Date:** 2026-09-24  
**Status:** durable research recovery note; no solver implementation change.  
**Research authority:** `research/semantic-quotient`.  
**Purpose:** prevent repeated reinvention after session/context loss and recover the actual evaluator optimization lineage before another IsoMax/JSMinSys pass.

## Correction

The JSMinSys file `addons/connect4-live-line-evaluator.mjs` added on 2026-09-24 is **not the first live-line evaluator** and must not be treated as a fresh design.

The project has repeatedly implemented the same core idea and closely related move-order evaluators across the incumbent minimax, fixed-width exact Negamax, residual/quotient research, and current IsoMax lineage. Several performance lessons were already qualified. Any new optimization pass must start from those results.

## 1. Incumbent evaluator: live winning-line field

Historical authority/examples:

- `components/incumbent/evaluator.mjs`
- `components/incumbent/search.mjs`
- `docs/specs/C4-0002-incumbent-evaluator-v1.md`
- `docs/research/2026-09-06-legacy-engine-extraction.md`
- `docs/research/2026-09-07-incumbent-node-qualification.md`
- qualified historical checkpoint: `33888bee6cf8d3e1941ad53819ef24a1432a2244`

The incumbent evaluator was explicitly a **live winning-line field**, not a piece-square table. A token contributes through each geometric winning line that is still alive for that player; an opponent token kills that line's contribution.

The accepted incumbent evaluator also carried immediate-threat and future parity/tactical classes. Those additional packed features are distinct from the pure live-line contribution count and should not be silently conflated with it.

The Sep. 7 low-level reimplementation qualified the line-once evaluator against the legacy optimized evaluator across multiple board sizes:

- 4x4: 62,322 comparisons
- 5x4: 70,736
- 6x5: 81,750
- 7x6: 90,026
- 8x7: 95,608
- total: **400,442 exact player-score comparisons**, all matching.

A local Node 22 diagnostic measured roughly **6.58x lower elapsed time** than the legacy object-oriented evaluator over 300,000 root evaluations. This establishes that the evaluator semantics have already undergone a substantial low-level rewrite/optimization campaign.

## 2. Fixed-width exact Negamax ordering lineage

Historical exact-search prototypes are retained under:

`reference/research-prototypes/2026-09-08-exact-solver/`

Examples include `twoword_solver_depclean.mjs` and later decision-state variants.

This lineage is related but **not semantically identical** to the live-line field. The hot recursive solver:

- used fixed-width two-word board state;
- owned preallocated per-depth move/move-score arrays;
- scored legal children numerically;
- insertion-ordered them before recursion;
- performed immediate tactical/forced-move closure before ordinary branching.

The relevant implementation lesson is structural: move scoring and ordering were kept numeric, fixed-width, preallocated, and co-located with the transition work. Do not import its score formula as though it were the live-line evaluator.

## 3. Residual evaluator ordering experiment

Key evidence:

- `docs/research/2026-09-09-allis-evaluator-residual-synthesis.md`
- `docs/research/2026-09-09-low-confidence-survival-batch-1.md`
- `reference/research-prototypes/2026-09-09-low-confidence-survival/evaluator_ordering_survival.mjs`

The residual analogue used:

```
maturity(requirements) = sum(2^(4 - requirement_size))
move_score = maturity(next_own) - maturity(next_opponent)
```

Qualified frozen-cohort result:

| Mode | Nodes | Median ms |
|---|---:|---:|
| center | 2,039 | 3.572 |
| full scored order with cached child transitions | 1,600 (-21.53%) | 4.228 (+18.38%) |
| best scored move first, remaining center order | 1,626 (-20.26%) | 3.959 (+10.86%) |

A prior naive form **recomputed child transitions after scoring** and was about **43% slower** despite the same ~21.5% node reduction.

Durable lesson:

> Ordering work must share/reuse work already required for child transition. Recomputing child state solely to score it is a known regression pattern.

Also, making parity the dominant generic ordering key was adverse:

- 2,039 -> 3,124 nodes (+53.2%);
- parity-dominant hybrid: 2,570 nodes.

Parity remains useful structural/proof metadata, but this evidence rejects it as the primary generic ordering key in that integration.

## 4. Sep. 12 quotient live-line lineage: direct ancestor of current JSMinSys

Canonical historical source:

`research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs`

Reachable source-history commits:

1. `91da86a7d5b82a9e20dde665fd643ae23d53ee4a` — **restore live-line incidence move ordering**
2. `f0c8a5b901476ac6fd121046d1dd87be3b34aeb4` — **make live-line ordering frontier-native**
3. `99435493eafcb6f6e95e92086cf18dfa2350e8d0` — **bound and validate live-line ordering**
4. `592bfe71faac790d87eac8a54dffb62326966720` — overlap/view correctness hardening
5. `44a1a2c572fff2cd9dfe931077f275e5836a2956` — performance checkpoint containing the retained disjoint-frame fast path

### 4.1 Incidence representation

The first restored form represented each winning line by board-cell masks and maintained a per-cell incidence list. To score a candidate cell it walked only lines incident to that cell and counted lines containing no opponent occupancy.

### 4.2 Frontier-native representation

Commit `f0c8a5b9...` changed to the representation that is the direct conceptual ancestor of current JSMinSys:

- live winning-line IDs stored as bitsets per player;
- `through[cell, word]` precomputed incidence bitsets;
- root state starts with all lines alive;
- an opponent placement clears every live line incident to that cell;
- candidate score is:

```
popcount(live[player] & through[cell])
```

across the prepared line words.

For standard 7x6, 69 lines require exactly three u32 words.

### 4.3 Disjoint-frame transition optimization — RETAINED, currently regressed

The Sep. 12 ranked refinement identified the live frontier transition as a CPU hotspot and changed disjoint recursive frames from:

```
copy all live-line words
then reread/mask/rewrite opponent words
```

to one fused pass:

```
copy mover word unchanged
write opponent word = sourceOpponent & ~throughCell
```

for each line word.

The overlap-safe memmove path remained only for genuinely overlapping external views.

The research note `docs/research/2026-09-12-ranked-probe-refinement.md` records the rationale explicitly:

> “Disjoint frames fuse copying and cancellation: each output word is written once, avoiding the second read/write of the opponent slice.”

The broader refinement batch measured:

- baseline mean elapsed: 2155.39945 ms
- candidate mean elapsed: 2080.63725 ms
- baseline CPU: 2320.5 ms
- candidate CPU: 2258 ms

or 3.47% lower mean elapsed and 2.69% lower mean CPU for the combined refinement batch. The note correctly does **not** attribute all of that gain to the live-line change alone.

### 4.4 Historical CPU evidence

Frozen Sep. 12 line profiles repeatedly showed live-line costs in the hot path:

- overlap/range checks;
- `advanceInto` copying/masking;
- `valueAtStack`;
- software `popcount32`.

The pre-refinement direct-edge profile in particular identified frontier overlap/copy as a high-cost item, motivating the fused disjoint-frame transition.

These profiler CPU-ms attributions are sampling evidence, not exact per-call cycle measurements.

## 5. Ordering implementation lessons from the quotient engine

The quotient Negamax engine preallocated per-depth `moveStack`, `moveScores`, and `frontierStack`.

Its deep `prepareMoves`:

1. performed exact tactical forced-column handling first;
2. scored each legal landing cell from the live-line frontier;
3. insertion-ordered the numeric score/column rows;
4. later incorporated an existing proof/TT best-move hint as a tie-break within equal frontier scores.

The full-engine sanity audit explicitly warned that live-frontier ordering originally bypassed the proof-table best-move hint and identified “frontier score primary, TT hint tie-break within equal score classes” as the safe integration direction.

This is relevant to current IsoMax because it has an exact cache and stronger CPC restrictions. Ordering should consume already-owned exact hints instead of discarding them.

## 6. Current JSMinSys state and recovered regression

Current qualified JSMinSys checkpoint at time of this recovery:

`f191c5f2885d9ae0a966096c1616d597f7fbc58c`

Current file:

`addons/connect4-live-line-evaluator.mjs`

The current scorer correctly implements the frontier-native three-word live-line semantics, but its transition currently:

1. copies all `stateWords`;
2. then loops over the blocked player's words;
3. rereads, masks, and rewrites them.

That is a regression relative to the retained Sep. 12 disjoint-frame optimization.

Current IsoMax wiring also fully materializes the scored move order before searching the first child. This deserves requalification against the historical “best first” and work-reuse lessons rather than being assumed optimal.

Latest whole-system Fhourstones comparison on `45461667`:

| Metric | static-order pre-wiring | restored live-line order |
|---|---:|---:|
| alpha-beta nodes | 1,590,668 | 806,844 |
| wall ms | 2331.68 | 1820.90 |
| CPU cycles | 6,175,217,199 | 5,144,835,720 |
| cycles / counted node | 3882.15 | 6376.5 |

The evaluator therefore currently buys approximately a 49.3% tree reduction but at substantially greater per-node cost. The goal is to preserve the tree reduction while recovering known implementation efficiency.

## 7. Do-not-repeat list for the next optimization pass

Before proposing novel machinery:

1. **Restore/retest the Sep. 12 disjoint-frame fused copy+cancel path.**
2. Keep hot evaluator state fixed-width, numeric, preallocated, and allocation-free.
3. Do not recompute child/RBA transitions solely for move scoring; historical evidence already showed this failure mode.
4. Requalify **best-first / partial ordering** versus fully materializing every sibling order before the first alpha-beta child. Historical residual evidence retained nearly all node reduction with best-first-only ordering and lower overhead.
5. Reuse already-owned proof/cache move hints as equal-score tie-break evidence where sound; prior quotient audit already identified this seam.
6. Do not promote future parity to the dominant generic ordering key; prior crossed control was strongly adverse.
7. Keep exact forced/tactical/CPC restriction work ahead of advisory move scoring.
8. Treat profiler/sample evidence as directional; use current NEES cycle ledger plus whole-solver A/B for promotion.
9. Do not claim a novel “incremental contribution counter” optimization is new or qualified until the remaining archived branches/evidence have been searched specifically for it. This recovery did not find a qualified retained result for that representation.
10. Persist retained/rejected results after each batch so context resets cannot erase the lineage again.

## 8. Source routing

Primary durable sources for future sessions:

- incumbent semantics: `docs/specs/C4-0002-incumbent-evaluator-v1.md`
- incumbent low-level qualification: `docs/research/2026-09-07-incumbent-node-qualification.md`
- evaluator/residual synthesis: `docs/research/2026-09-09-allis-evaluator-residual-synthesis.md`
- residual ordering A/B: `docs/research/2026-09-09-low-confidence-survival-batch-1.md`
- canonical Sep. 12 implementation: `research/semantic-quotient/state-identity-unification/src/quotient-live-line-move-order.mjs`
- Sep. 12 operation refinement: `docs/research/2026-09-12-ranked-probe-refinement.md`
- full-engine ordering audit: `docs/research/2026-09-12-full-engine-sanity-audit.md`
- frozen profiler evidence: `docs/research/evidence/2026-09-12-*-line-cpu/`

This note is a recovery/index document. The cited source/evidence files remain authority for their own measurements and exact historical implementation.

## 9. Expanded chronology: recovered evaluator generations

This section completes the lineage distinction that was still missing from the first recovery pass. In particular, the 2025 archive contains two materially different evaluator generations, and the later exact-solver ordering line must not be mistaken for the live-line evaluator.

### 9.1 2025 archive — older `Board` generation: surviving-line arrays and `scoreSlot`

Recovered provenance: `reference/legacy-source/Connect4-engine-source.zip`, especially `scripts/classDefinitions.js`.

The oldest recovered implementation of the core per-cell live-line idea is `Board.scoreSlot(player, column, row)`. The board owns `playerWinningPositions[player]`, a per-player collection of geometric four-cell lines that still survive. Opponent occupation removes a line from that player's surviving collection. `scoreSlot` scans those surviving lines and returns how many pass through the requested board cell.

This is important for terminology: the project had an explicit **per-cell surviving-winning-line count** in the 2025 source. It was computed on demand from the surviving-line collection; the recovery did **not** find a maintained numeric counter stored at every cell.

The older evaluator then combines the surviving-line field with threat/Zugzwang classification. Its search did not use `scoreSlot` as the ordinary recursive move-order key: the alpha-beta worker retained center-first geometry, with transposition information able to promote a stored move.

### 9.2 2025 archive — optimized `virtualBoard` generation: incremental per-line liveness

Recovered provenance: the same archive, especially `scripts/virtualBoard.js` and `scripts/abpWorker.js`.

The optimized generation changes representation substantially:

- `positionToWinningLines[cell]` is a precomputed incidence map from a cell to winning-line IDs;
- `playerWinnableStatus[player][line]` stores per-player live/dead status;
- on a move by player `p`, only the opponent slice is affected, and only lines incident to the landing cell are cleared;
- undo restores exactly the recorded status changes;
- per-player token incidence is retained separately through move/order state.

Its positional score is the qualified legacy-current rule later frozen by C4-0002: for every line still live for the player, add `20` per already-owned token in that line. Equivalently:

`20 * sum(own_token_count(line))` over opponent-free winning lines.

This is **incremental line-liveness maintenance**, but it is not an incrementally maintained numeric score at each board cell. The optimized threat traversal also contains the historically preserved repeated-immediate-line behavior that caused the two legacy evaluator generations to disagree.

The alpha-beta worker still orders ordinary moves primarily by the fixed center preference, with TT best-move promotion; the evaluator is used for horizon/static value rather than as the ordinary live-line landing-cell move-order score.

### 9.3 2026-09-07 — primitive V8 rewrite of optimized legacy-current semantics

Historical packet:

- original branch: `feature/shared-evaluator-v1`;
- original head: `77c5c0da57ddb65cd7aff9ce131481a19414931a`;
- preserved under `research/minimax/incumbent-v8-rewrite/` on `solver/minimax-alpha-beta`.

`snapshot/components/incumbent-v8/evaluator.mjs` removes the legacy object graph and recomputes the optimized legacy-current evaluator from two u32 board lanes by scanning each geometric line once. It preserves:

- opponent blocking;
- `20 * own-token-count` live-line positional value;
- immediate/future parity tactical classes;
- the repeated-immediate score behavior;
- root-relative `root - 0.65 * opponent` utility.

This rewrite is **recomputed from board state at evaluation time**, not incrementally maintained as a live-line frontier. Its search remains center-first with a reusable TT move searched first when valid. It therefore optimized evaluator implementation without turning the evaluator into the later landing-cell move-order signal.

The later maintained qualification at `33888bee6cf8d3e1941ad53819ef24a1432a2244` froze the same optimized semantics and qualified them against the retained archive.

### 9.4 2026-09-07 — solved-strength qualification and rejected semantic simplification

Commit `0da0c4c692e648b26b0565a6bc6e75c8eb79ac8e` added an independent exact solved-game oracle without changing the frozen evaluator/search.

Key evidence:

- deterministic 128-position calibration: depth 8 through 12 reached 128/128 exact-strong optimal and 128/128 W/D/L preservation;
- 30 beginning spot checks at depth 12: 28/30 exact-strong optimal and 29/30 W/D/L preserving;
- known defect `54676552255627`: exact child scores `[1, 2, -2, -5, 1, -2, -14]`; the incumbent chose a losing one-based column 3 at depth 12 and first selected exact-optimal one-based column 2 at depth 19;
- fixed-depth legacy-compatible and persistent-ordering lanes made the same choices across the investigated depth seam, falsifying cross-move TT ordering as the cause.

A controlled experiment that removed only the repeated-immediate promotion produced mixed gains and regressions and did not improve the eventual correction depth. That semantic simplification is therefore a **rejected replacement**, not an optimization to rediscover casually.

### 9.5 2026-09-08 — fixed-width exact Negamax ordering: related structure, different score

Representative preserved sources:

- `reference/research-prototypes/2026-09-08-exact-solver/twoword_solver_depclean.mjs`;
- `reference/research-prototypes/2026-09-08-exact-solver/twoword_solver_sharedtt.mjs`.

This line is relevant for hot-loop shape but is **not** the live-line contribution evaluator. For each legal candidate it computes the mover's `winningPositions` after the hypothetical move and uses the popcount of that winning-position field as the move score. Children are insertion-ordered eagerly in preallocated per-depth numeric arrays. Equal scores retain the fixed center-first `ORDER=[3,4,2,5,1,6,0]` because movement occurs only on a strict score improvement.

The performance checkpoint established that two-u32 search arithmetic could approach the same-sandbox C arithmetic rate and that locality/TT layout dominated later cost. Those lessons support fixed-width/preallocated implementation, but its move-score formula must not be substituted for current live-line semantics.

### 9.6 2026-09-09 — residual maturity ordering

The residual ordering experiment scores a child as:

`maturity(next_own) - maturity(next_opponent)`

where `maturity(requirements) = sum(2^(4 - requirement_size))` over the minimal residual obligations.

It tested both:

- **eager full ordering** (`expCached`): construct/carry child residual transitions, sort all children by score, center order as tie-break;
- **partial best-first ordering** (`expFirstCached`): select only the best scored child first and leave the rest in center order.

Both reused the already-computed child transition. The earlier form that scored and then recomputed the same child transition was about 43% slower despite equivalent node reduction. The full and best-first results are recorded earlier in this note.

Parity-dominant ordering was adverse and is a durable falsifier. The root-relative 0.65 legacy asymmetry also did not improve the exact move-ranking study enough to justify treating that coefficient as general move-order theory.

### 9.7 2026-09-09 — winspace/residual generalization

The winspace and WSL work generalizes the same survival concept from whole geometric lines to **per-player residual winning requirements**. A placement removes the played cell from the mover's requirements and permanently removes opponent requirements containing that cell. Later CPC/WSL-625 formalization preserves this blocker/residual semantics.

This is evaluator-adjacent structural mathematics, not evidence of a distinct qualified live-line landing-cell score. Its strongest CPU lesson is economic: exact semantic compression can reduce search work while still losing elapsed time if the representation/update cost is too high.

One controlled winspace reuse cohort fell from 112,170 to 77,169 nodes (-31.20%) when exact different-board winspace-equivalent TT hits were accepted. Yet broader cohorts sometimes became slower despite fewer nodes, including an ordinary holdout and a prospective challenge. This is directly relevant to the current high cycles/node problem.

### 9.8 2026-09-12 — first recovered direct live-line move-order implementation

Commit `91da86a7d5b82a9e20dde665fd643ae23d53ee4a` is the earliest recovered implementation that directly uses the current landing-cell idea as ordinary move-order advice.

Its scorer uses precomputed cell-to-line incidence, inspects only lines through the candidate landing cell, and counts those with no opponent occupancy. In other words, its semantic score is already:

> number of still-live winning lines for the mover passing through the candidate landing cell.

This first form recomputes liveness for the queried incident lines from board occupancy.

Commit `f0c8a5b901476ac6fd121046d1dd87be3b34aeb4` then makes the representation frontier-native: per-player live-line IDs become bitsets, `through[cell]` becomes a bitset, opponent moves clear incident live-line bits, and candidate score becomes `popcount(live[player] & through[cell])`.

Commits `99435493...`, `592bfe71...`, and `44a1a2c5...` harden and optimize that representation. `44a1a2c5...` retains the important disjoint-frame fused copy/cancel transition described earlier.

### 9.9 2026-09-24 — JSMinSys reimplementation

JSMinSys commit `d7ac5b835487a965a63cfc881d196f749a1442a5` adds `addons/connect4-live-line-evaluator.mjs`; `dae44e21...` fixes its geometry-specialization description; `5f7aab9f...` restores search wiring.

The evaluator semantics are a reimplementation of the Sep. 12 frontier-native generation, not a new evaluator idea:

- two per-player live-line bitsets;
- static `through[cell]` incidence bitsets;
- opponent placement clears the opponent's live lines incident to the played cell;
- landing-cell score is the popcount intersection;
- standard 7x6 uses the three-u32 specialization.

The current production search first applies exact cache/CPC/forced-preemption restrictions, then eagerly scores every remaining move, repeatedly selects the strict argmax, and materializes the full order before child search. Strict-greater selection means equal scores retain configured `actionOrder`, currently the static center-out tie-break.

## 10. Direct answers to the lineage questions

1. **Earliest recovered implementation:** the 2025 archive's older `Board.scoreSlot` is the earliest recovered per-cell live-line count. If the question is specifically 'first recovered use as recursive move ordering', that is Sep. 12 commit `91da86a7...`.

2. **Scoring semantics by generation:** older 2025 `Board`: per-cell count over that player's surviving lines plus separate threat/Zugzwang evaluation; optimized 2025 / Sep. 7 incumbent: `20 * own-token-count` across live lines plus packed tactical/parity classes; Sep. 8 exact solver: count of mover winning-position bits after candidate, not live-line contribution; Sep. 9 residual ordering: own-minus-opponent residual maturity; Sep. 12/current: count of live mover lines through candidate landing cell.

3. **Opponent-piece blocking:** yes for all recovered live-line generations. Older/optimized legacy collections remove or disable a player's lines when the opponent occupies them; Sep. 7 recomputation rejects lines containing opponent tokens; Sep. 12/current clears the opponent's incident line bits.

4. **Recomputed or incremental:** older `Board.scoreSlot` computes the per-cell count on demand over a survivor collection; optimized `virtualBoard` maintains per-line liveness incrementally; Sep. 7 primitive evaluator recomputes by scanning line masks; Sep. 12 `91da` recomputes queried incident-line liveness from occupancy; Sep. 12 `f0c8` onward and current JSMinSys maintain per-player live-line bitsets incrementally.

5. **Direct per-cell live-line counts:** an on-demand per-cell API exists in the oldest recovered `scoreSlot`. No recovered qualified generation maintains a numeric live-line count at every cell as mutable state. Later designs maintain line liveness plus static cell-to-line incidence and derive the cell score on demand.

6. **Update only when a line becomes dead:** yes at the **line-state** level in optimized `virtualBoard`, Sep. 12 frontier-native, and current JSMinSys. A blocking opponent placement clears only incident lines; already-dead lines stay dead. No recovered implementation proves an incrementally decremented per-cell numeric-count table as the retained design.

7. **Per-player state:** yes. Legacy survivor/status collections are per player; Sep. 7 scoring is invoked per player; Sep. 12 frontier-native/current storage has explicit per-player live-line slices. The direct-incidence `91da` form derives one side's score by testing that side against opponent occupancy rather than storing both live slices.

8. **Ordering mode:** legacy incumbent search is static center-first with TT best-move promotion; Sep. 8 exact solver eagerly insertion-orders all legal candidates; Sep. 9 explicitly tested eager full order and partial best-first; Sep. 12 live-line ordering eagerly scores/orders legal moves; current JSMinSys eagerly materializes the full CPC-surviving order via repeated argmax.

9. **Tie behavior:** center-first/fixed geometry dominates the recovered search lineage. Sep. 8 and Sep. 9 preserve center order on equal scores. The integrated Sep. 12 quotient audit also identified exact proof/TT best-move evidence as a safe equal-score tie-break. Current JSMinSys strict-greater selection preserves configured static `actionOrder`. No qualified history-based move heuristic was recovered for this evaluator lineage.

10. **Optimizations attempted:** object graph to u32 line-once recomputation; cell-to-line incidence; per-player incremental liveness; fixed-width bitsets; three-word specialization; preallocated per-depth score/order/frontier storage; fused disjoint copy+cancel; full vs best-first ordering; child-transition reuse; TT/proof hint tie-breaking; residual/winspace compression; parity-dominant ordering; repeated-immediate semantic simplification; recent generic loop-invariant and branchless search transformations.

11. **Improvements that survived evidence:** Sep. 7 primitive evaluator rewrite (about 6.58x faster than legacy object evaluator in its local diagnostic while matching 400,442 player-score samples); Sep. 12 frontier-native representation; Sep. 12 fused disjoint transition retained in the qualified refinement batch; residual child-transition reuse; fixed-width/preallocated hot state; current live-line ordering's large tree reduction on Fhourstones.

12. **Rejected/adverse paths:** recomputing child residual transitions solely for ordering (~43% slower); parity-dominant ordering (+53.2% nodes in the cited cohort); removing repeated-immediate promotion as a universal replacement (mixed solved-strength regressions); broad residual/winspace replacement when representation cost outweighed node reduction; Sep. 24 loop-invariant hoist in production CPC-only search; Sep. 24 branchless mover-frame conversion as a non-robust/no-material-gain change.

13. **Benchmark/node evidence:** 400,442 exact evaluator player-score matches and ~6.58x local evaluator speedup on Sep. 7; residual ordering 2,039 -> 1,600 nodes full / 1,626 best-first but both slower in elapsed time than center on that cohort; exact winspace reuse 112,170 -> 77,169 nodes in the controlled structural cohort with mixed broader elapsed results; Sep. 12 combined refinement -3.47% mean elapsed / -2.69% CPU; current Fhourstones 1,590,668 -> 806,844 nodes with lower total wall/cycles but substantially higher cycles/node.

14. **Fastest historical implementation:** there is no defensible single global winner because the generations were not benchmarked under one common harness and several have different score semantics. The fastest qualified replacement of the full legacy static evaluator is the Sep. 7 primitive line-once implementation (~6.58x local diagnostic). For the **same landing-cell live-line semantics as current JSMinSys**, the strongest recovered representation is the Sep. 12 frontier-native bitset line, with `44a1a2c5...` containing the retained disjoint-frame transition optimization. Its combined-batch gain cannot be attributed solely to the evaluator transition.

15. **Closest representation to current JSMinSys/RBA:** Sep. 12 `f0c8a5b9...` through `44a1a2c5...`, by a wide margin. It uses the same conceptual per-player live-line bitsets, cell incidence bitsets, incremental blocker cancellation, and popcount landing-cell scoring. The current copy-all-then-mask transition is a regression relative to the retained disjoint-frame fast path.

16. **Constraints on the next optimization batch:** preserve exact landing-cell semantics and CPC-before-advice ordering; first requalify the known fused disjoint transition; compare full materialization against best-first/partial ordering; reuse child/transition work rather than recomputing it for a score; consider exact-cache/proof hints only as sound tie/order evidence; do not make parity the dominant generic key; do not silently change the frozen static evaluator semantics; measure both tree work and total cycles because fewer nodes can still be slower; keep every modified JSMinSys operation cycle-accounted under NEES.

## 11. Sep. 24 same-runner rejected search micro-optimizations

These two experiments are not live-line semantic generations, but they are relevant falsifiers for the next implementation-cost pass because they changed production hot-loop shape without changing search work.

### `7420df2c...` — loop-invariant hoist

GitHub Actions run `36043693906` used the same-runner B-C-C-B A/B harness against baseline `d3f02ef91026df0332fe41be77fdd9e81dc18e2f`. Across the 11 CPC-only rows, aggregate warm medians averaged approximately:

- baseline: `2.126653 ms`;
- candidate: `2.761705 ms`;
- delta: **+29.86% slower**.

Node counts were identical. The other modes were mixed/slightly favorable, but CPC-only is the production path being optimized. This is a clear implementation-cost rejection, not a semantic finding.

### `328fff58...` — branchless mover-frame conversion

GitHub Actions run `36043917031` used the same B-C-C-B harness. CPC-only aggregate warm medians were approximately:

- baseline: `2.176469 ms`;
- candidate: `2.172914 ms`;
- delta: **-0.16%**, effectively flat at this scale.

The combined mode aggregate was about **+0.16%** and individual non-production modes were mixed. Node counts were identical. No robust production gain was demonstrated, so this transformation should not be reintroduced merely because it looks cheaper syntactically.

## 12. Current whole-solver comparison and stop gate

Current Fhourstones checkpoint, branch `benchmark/isomax-fhourstones-live-line-20260924`, commit `b1286a3c6b934e67918aa26950f93a5001a11546`, input `45461667`:

| Metric | static center-out | live-line ordering |
|---|---:|---:|
| exact result | +1 | +1 |
| nodes | 1,590,668 | 806,844 |
| cofactors | — | 807,290 |
| wall | ~2.332 s | 1.8208976 s |
| CPU cycles | 6,175,217,199 | 5,144,835,720 |
| cycles / node | ~3,882.15 | ~6,376.5 |

Recovered interpretation:

- live-line ordering removes about **49.3%** of nodes;
- wall falls about **21.9%**;
- total CPU cycles fall about **16.7%**;
- cycles/node rise about **64%**.

The next optimization target is therefore **not inventing another evaluator**. It is reducing the implementation cost of the already-effective ordering while preserving its tree reduction, starting from the historical fast paths and falsifiers above.

### Stop gate

No new live-line optimization should begin from this note alone until the candidate is explicitly compared against the recovered Sep. 12 frontier-native implementation and the do-not-repeat list. The first implementation experiment should be a measured requalification of a recovered idea, not a redesign.

At the time of this expanded recovery, implementation heads were re-read as:

- JSMinSys PR #26: `f191c5f2885d9ae0a966096c1616d597f7fbc58c`;
- Connect4 PR #163: `c240379ba208934bf13415ac8da46fd4e48d9998`;
- research authority before this documentation update: `b6b57b4b741037babe33e692b46d6609cc9d9724`.

No solver/evaluator behavior is changed by this research-note update.
