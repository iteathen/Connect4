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
