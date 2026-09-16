# Low-confidence survival testing — batch 1

**Date:** 2026-09-09  
**Status:** research evidence only; maintained source and `main` unchanged.  
**Branch:** `research/low-confidence-survival-2026-09-09`  
**Language:** JavaScript / Node only. No Python.

## Purpose

The classification work now carries a confidence value for each assessment. This batch changes the research objective from confirming likely winners to **raising the evidence quality of high-impact low/medium-confidence assessments**. Candidates are given their strongest plausible integration rather than tested only as isolated switches.

Confidence values below are meta-confidence in the stated assessment, not candidate quality.

## 1. Residual evaluator maturity ordering

### Question

Does the maintained evaluator's core idea — mature surviving winning opportunities are useful ordering information — still improve proof order after residual state, cardinality bounding and exact tactical/forced normalization have already removed much of the tree?

The tested score is intentionally **not claimed to be exact legacy evaluator equivalence**. It is an antichain-native analogue:

```text
maturity(requirements) = sum(2^(4 - requirement_size))
move_score = maturity(next_own) - maturity(next_opponent)
```

Two integration forms were tested:

- `expCached`: sort all legal decision children by score and reuse the child residual transitions already built for scoring;
- `expFirstCached`: move only the highest-scoring child to the front, preserve center order for the rest, and reuse the built transitions.

### Crossed control

Stack:

- 625-ID residual semantics;
- cardinality earliest-win bound;
- exact immediate-win / double-threat closure;
- repeated unique forced blocks collapsed before decision-state search.

Frozen eight-position exact-oracle cohort. Thirteen rotating-order repetitions; first five warm-up repetitions excluded.

| Mode | Nodes | Node effect vs center | Median ms | Time effect vs center |
| --- | ---: | ---: | ---: | ---: |
| center | 2,039 | — | 3.572 | — |
| expCached | 1,600 | **21.53% fewer** | 4.228 | 18.38% slower |
| expFirstCached | 1,626 | **20.26% fewer** | 3.959 | 10.86% slower |

The earlier naive version recomputed child transitions after scoring and was about 43% slower despite the same 21.5% node saving. Reusing already-built child transitions cuts that loss substantially. This directly supports positive `INC -> evaluator ordering` interaction.

### Confidence change

- **Node/proof-order effectiveness after core normalization:** projected positive, confidence **0.65 -> 0.88**.
- **Hot-kernel elapsed-time effectiveness:** remains unresolved, confidence **0.40**. Current high-level `Map`/array prototype is still time-negative.
- **`INC -> E1` signed interaction:** positive cost-sharing, confidence **0.55 -> 0.80**.

The candidate survives strongly. The next fair test is fixed-width/incremental scoring in a representation-native kernel; do not reject it because the high-level semantic harness spends too much per child.

## 2. Parity signal as primary move ordering — adverse control

An exploratory crossed control put the residual version of the incumbent future-parity class ahead of the maturity score after the same tactical/forced normalization.

It increased the frozen-cohort decision nodes from 2,039 to 3,124 (**53.2% more**) and was substantially slower. A parity-dominant hybrid also increased nodes to 2,570.

This is evidence only against **parity as a dominant generic ordering key in this integration**. It does not weaken parity as:

- Allis rule-instance metadata;
- support/event ownership information;
- proof-cost feature;
- a secondary/tie-break signal not yet tested.

Confidence that parity should be the primary exact-search ordering feature is therefore lowered to **0.20**. Confidence in its broader structural relevance remains medium/high because of the maintained evaluator and Allis convergence.

## 3. Claimeven + Baseinverse + Vertical survival test

### Question

Do the three cheapest Allis rule families have enough real residual coverage to justify continued integration work, or are they mostly historical machinery with little marginal value after tactical normalization?

The test focuses on Black/P1 defensive use, with White/P0 to move. Rules were generated directly from exact gravity state and opponent residual requirements:

- Claimeven: two adjacent empty squares, even upper square, solves every residual opponent group containing the upper square;
- Baseinverse: two directly playable squares, solves every residual group containing both;
- Vertical: two adjacent empty squares, odd upper square, solves every residual group containing both.

A deliberately conservative compatibility rule requires selected rule instances to have disjoint required-square sets. This can miss legal Allis combinations, but it avoids giving the candidate an unsound advantage.

### Nontrivial mid/late cohort

Deterministic random legal 7x6 roots at plies 22..32. Only P0-to-move roots whose exact residual solve required 40..10,000 decision nodes were accepted. Twenty-nine roots qualified before the bounded generator exhausted one stratum.

Results:

- 29 roots;
- 39,087 exact decision nodes across the cohort;
- 11 exact White wins, 18 draws/Black wins;
- Claimeven active in 29/29 roots;
- Baseinverse active in 21/29;
- Vertical active in 27/29;
- union of A1-A3 rule coverage solved on average **84.55% of White's residual requirements**;
- raw union fully covered White in 5/29 roots;
- conservative compatible full cover existed in 3/29 roots;
- **0 false hold claims**.

Average raw coverage by ply remained high: 90.5%, 89.8%, 82.0%, 82.8%, 83.7%, 77.1% for plies 22,24,26,28,30,32 respectively.

Three complete conservative certificates were found:

- `3314666541511341134226244557`: exact P0 score 0, 7 residual opponent requirements, 9 rule instances, 4-rule cover;
- `555415323577434125373434421772`: exact P0 score -3, 4 requirements, 4 instances, 2-rule cover;
- `52654167547624557675236336471373`: exact P0 score -1, 3 requirements, 6 instances, 3-rule cover.

### Confidence change

- **A1-A3 as useful residual certificate primitives:** confidence **0.60 -> 0.85**.
- **A1-A3 alone as frequently complete strategic evaluator:** confidence remains only **0.55**; full compatible covers were 3/29 in this deliberately nontrivial sample.
- **`A1-A3 -> compatible rule-cover` signed interaction:** positive, confidence **0.55 -> 0.82**, because these cheap rules already cover most residual obligations even when they do not close the proof alone.
- **Soundness of the conservative implementation on tested roots:** high confidence; formal Allis reasoning is the primary authority and the exact differential produced no false claim. This is not yet a complete independent formalization of the full combination table.

The right interpretation is that the cheap rules survive as **high-coverage primitives**, not that they replace search by themselves.

## 4. Support/event frontier semantic equivalence

### Candidate tested

Replace full residual column heights with:

- minimal residual requirements for both players;
- exact move rank/side;
- for every column that still contains a future residual-requirement cell, the number of neutral cells before the next such event;
- one pooled count for all remaining cells in columns containing **no** future residual event.

The event cells themselves remain addressed by the residual requirements, so the next event row is derivable from the requirement set. The only physical history discarded is distribution of permanently dead tail capacity across dead columns.

### Exhaustive qualification

For every reachable nonterminal physical state in four complete games, states sharing the event representation were checked for:

1. identical exact distance-sensitive value;
2. identical **unique semantic successor set**, including terminal scores.

| Game | Physical states | Residual+height states | Event states | Extra reduction vs residual+height | Value mismatches | Successor mismatches |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 4x3 c3 | 4,659 | 3,735 | 3,670 | 1.74% | 0 | 0 |
| 4x4 c4 | 139,625 | 34,095 | 32,921 | 3.44% | 0 | 0 |
| 5x3 c4 | 152,003 | 11,317 | 10,336 | **8.67%** | 0 | 0 |
| 4x5 c4 | 1,385,521 | 294,593 | 290,162 | 1.50% | 0 | 0 |

Some event equivalence classes are very large; the largest observed groups contained 28, 7,290, 11,166 and 53,534 physical states respectively.

### Confidence change

Separate the claims:

- **Exactness on the four tested games:** confidence **1.00** with respect to the exhaustive program's stated value/successor checks.
- **General semantic sufficiency of the event-support idea for standard 7x6:** confidence **0.55 -> 0.86**. The monotone residual structure provides a strong reason to expect the same argument to generalize, but full 7x6 exhaustive proof is unavailable.
- **Projected state reduction beyond residual+heights:** positive, confidence **0.82**; magnitude is clearly regime-dependent.
- **Projected runtime benefit:** still confidence **0.35**. No fixed-width event kernel has been timed.
- **`SUP-event -> DEAD` signed interaction:** strong positive/subsuming, confidence **0.55 -> 0.90**. Permanently dead column tails were safely pooled in every exhaustive tested game.
- **`SUP-event -> SEWB/Aftereven/Before/IMPL` interactions:** remain projected, not measured. Their confidence is not upgraded merely because event-state exactness improved.

This candidate now deserves implementation-level performance work; it no longer belongs in the mostly conceptual bucket.

## 5. Legacy 0.65 root-relative asymmetry

### Question

Does the incumbent evaluator's specific `score0 - 0.65 * score1` asymmetry improve exact move ranking, or is the useful signal mostly in the underlying player scores?

Thirty-six deterministic nontrivial P0-to-move decision roots at plies 20..30 were used. Roots with immediate P0 wins or any immediate P1 threat were excluded so tactical closure would not decide the move before ordering. Exact child values were solved independently inside the residual exact harness.

| Ranking signal | Top-1 optimal move | Mean best-move rank | Pairwise exact-order accuracy |
| --- | ---: | ---: | ---: |
| legacy 0.65 asymmetry | 55.6% | 1.917 | 71.0% |
| symmetric `score0-score1` | 55.6% | **1.861** | **74.2%** |
| own score only | 50.0% | 2.028 | 61.8% |
| `-opponent score` | 52.8% | 1.972 | 74.3% |
| center prior | 38.9% | 2.444 | 54.0% |

The evaluator information is clearly useful relative to center ordering, but **the 0.65 asymmetry itself did not improve the ranking**. It tied symmetric top-1 rate and lost on mean rank and pairwise concordance.

### Confidence change

- **Underlying evaluator player-score information as exact-search ordering evidence:** confidence **0.60 -> 0.82**.
- **Specific 0.65 asymmetry as an exact-search ordering improvement over symmetric scoring:** confidence **0.40 -> 0.20**.
- **E3 adoption likelihood in recursive exact search:** lowered. It remains a compatibility behavior of the incumbent and may still have root/game-strength value outside this exact-ranking objective.

## Batch conclusion

The low-confidence campaign is working as intended:

- **SUP event frontier:** major confidence increase; semantic candidate survives strongly.
- **Residual maturity ordering:** major increase in node-effect confidence; performance integration still unresolved.
- **A1-A3 Allis rules:** survive as high-coverage exact certificate primitives; standalone completeness remains limited.
- **0.65 evaluator asymmetry:** specifically weakened; the evaluator information survives, the asymmetry does not earn special treatment.
- **Parity-primary ordering:** weakened in this tested form without discarding parity's other roles.

The next high-information targets should be:

1. fixed-width/incremental implementation of residual maturity ordering;
2. 7x6 event-frontier transition differential plus fixed-width NPS test;
3. richer Allis cover additions chosen by uncovered-requirement analysis, rather than all six remaining rules at once;
4. proof-cost ordering built only from already-paid metadata;
5. implication reuse with a candidate index that eliminates support-local linear/frontier scans.

## Preserved artifacts

- `reference/research-prototypes/2026-09-09-low-confidence-survival/evaluator_ordering_survival.mjs`
- `reference/research-prototypes/2026-09-09-low-confidence-survival/allis_a123_survival.mjs`
- `reference/research-prototypes/2026-09-09-low-confidence-survival/support_event_equivalence.mjs`
- `reference/research-prototypes/2026-09-09-low-confidence-survival/e3_root_asymmetry_rank.mjs`
- `docs/research/evidence/2026-09-09-low-confidence-survival-batch-1.json`
- `docs/research/evidence/2026-09-09-low-confidence-survival-batch-2.json`
