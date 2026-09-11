# Minimax candidate composition campaign — waves 1–3

**Date:** 2026-09-11  
**Status:** active research evidence; no maintained-solver promotion yet.  
**Branch:** `work/minimax-candidate-composition-20260911`

## Governing principle

This campaign implements the repository's existing candidate-classification and signed-synergy methodology rather than ranking optimizations from isolated runs.

Candidates are not rejected from one adverse context. Each candidate form is tested across multiple stacks where practical, and execution order is treated as part of the candidate form.

Governing sources:

- `2026-09-09-directional-core-synergy-map.md`;
- `2026-09-09-signed-candidate-interaction-model-v3.md`;
- `2026-09-09-categorical-reasoning-calibration.md`;
- `2026-09-09-low-confidence-survival-batch-1.md`.

The campaign's explicit execution-order policy is in `research/minimax/composition-campaign/ORDERING.md`.

## Wave 1 — broad crossed interaction census

Workflow run: `34582906902`  
Crossed job: `103210375725`

Frozen eight-position exact-score cohort; 48 configurations; 4 repetitions with the first repetition excluded from timing summaries.

Crossed dimensions:

- CARD off/on;
- FMAC off/on;
- AUTO off/on;
- center / E1-maturity / E1-first-only / E2-primary / E1+E2 / P1-proxy ordering.

All exact root scores matched.

### Candidate effect distributions

| Candidate form | Contexts | Node effect range | Median node effect | Important interpretation |
| --- | ---: | ---: | ---: | --- |
| CARD | 24 | +10.62% .. +56.97% | +28.00% | robust proof reduction; marginal value saturates in strong stacks |
| FMAC | 24 | +44.53% .. +94.70% | +63.14% | strongest robust downstream-work gate in this cohort |
| AUTO | 24 | +5.84% .. +10.40% | +7.94% | node-positive everywhere; high-level implementation time near neutral/slightly negative median |
| E1 maturity | 8 | +11.16% .. +90.41% | +54.49% | ordering effect strongly stack-dependent |
| E1 first-only | 8 | +9.11% .. +90.16% | +53.71% | survives across contexts |
| E2 primary | 8 | +20.28% .. +90.97% | +58.26% | contradicts the earlier single-stack adverse result; retain regime/order sensitivity |
| P1 proxy primary | 8 | **-40.51% .. +87.44%** | +35.28% | highly order/regime sensitive; do not accept or reject globally |
| E2 secondary to E1 | 8 | +3.40% .. +12.49% | +11.44% | positive in every tested crossed context |

This is direct evidence for the user's stated rule: an optimization that looks adverse in one stack can become useful when another mechanism changes the proof tree.

## Historical survival reruns

The same campaign reran the preserved semantic/mechanism harnesses for:

- E1 evaluator ordering;
- SUP event frontier;
- A1–A3 Allis coverage;
- A1–A9 generic blocker-lattice equivalence;
- E3 evaluator asymmetry;
- AUTO residual automorphisms;
- IMPL dominance frontier;
- invariant reassessment.

All passed.

The archived `2026-09-09-structural-quotient/qualify.mjs` script was intentionally removed from subsequent workflow matrices after it failed to import a historical missing `kernel-key.mjs`. That is a reproduction/archive defect, not adverse semantic evidence; current MQ1–MQ4 semantic-quotient qualification supersedes that archive script.

### A1–A9 blocker lattice

The A1–A9 generic 625-ID blocker-lattice harness reproduced **331,955** specialized rule instances across 1,732 generated roots with **0 mismatches**.

Counts:

- A1 15,036;
- A2 25,939;
- A3 10,311;
- A4 1,844;
- A5 32,787;
- A6 32,787;
- A7 55,956;
- A8 26,976;
- A9 130,319.

This mechanically supports the shared RID blocker-lattice substrate. It does not by itself prove A10 whole-cover closure.

### IMPL/dominance frontier survival

The preserved WDL frontier harness again showed substantial avoided proof work while remaining comparison-heavy:

| Complete game | Expanded reduction | Call reduction |
| --- | ---: | ---: |
| 4x3 c3 | 8.12% | 1.33% |
| 4x4 c4 | 35.94% | 29.83% |
| 5x3 c4 | 18.58% | 14.04% |
| 4x5 c4 | 49.88% | 42.87% |

This strengthens the case for a WSL-625-native implication index while preserving the existing negative evidence against scan-heavy/frontier implementations.

## Wave 2 — signed semantic-edge composition

Workflow run: `34584146389`  
Semantic-edge job: `103214316995`

96 crossed configurations around RWS-derived EXH, CARD, FMAC, AUTO and E1/E2 ordering.

The quick `DEAD` switch in this job is **not authoritative DEAD evidence** because it only collapsed multiple currently dead columns and did not carry the exact finite neutral-tempo pool. Authoritative DEAD evidence is wave 2b below.

Useful distributions:

- EXH: 0% .. 14.44% node reduction, median 1.60%. It can be useful or completely saturated by stronger mechanisms.
- CARD: 5.14% .. 50.86%, median 23.29%.
- FMAC: 47.37% .. 94.83%, median 64.98%.
- AUTO: 2.39% .. 10.18%, median 6.27%.
- E2-primary: 20.28% .. 91.13%, median 59.32%.
- E1→E2: 20.28% .. 91.71%, median 60.62%.

In the strongest tested high-level stack EXH reached exact cutoffs but produced no additional nodes beyond the same stack with EXH disabled. This is saturation, not evidence against EXH's exact bound semantics.

## Wave 2b — exact DEAD neutral-tempo composition

Workflow run: `34584146389`  
Job: `103214317298`

The authoritative harness is `dead_neutral_exact_v2.mjs`.

The earlier `dead_neutral_exact.mjs` is retained as a failed construction: it incorrectly wrote exact TT values after alpha-beta cutoffs. No result from that draft is accepted.

Exact v2 semantics:

- a column is retired only when no surviving residual requirement references any future cell in it;
- every remaining physical cell in retired columns is preserved in one finite neutral-tempo pool;
- a neutral move consumes one pool slot and flips side;
- interval TT semantics are preserved;
- exact frozen-oracle scores are required for every configuration.

72 configurations; 5 repetitions; one warm-up.

### DEAD effect

Across all tested contexts:

- minimum node reduction: **3.25%**;
- median: **9.83%**;
- maximum: **14.88%**.

The strongest tested composition was:

`DEAD + AUTO + CARD + E1→E2`, neutral action last

with **1,181 nodes**, versus 1,296 for the corresponding no-DEAD stack.

### Neutral-action priority

Neutral move **first** was worse than neutral move **last in every tested context**.

First-vs-last node effect ranged approximately from -0.82% to -7.43%, median -1.20%.

Therefore the current evidence-backed default is:

**retire dead columns before AUTO/scoring, but search the pooled neutral-tempo action after strategic actions.**

This is an ordering result, not merely a DEAD candidate result.

## Wave 3 — stage ordering and E1/E2/P1 permutations

Workflow run: `34584521106`  
Job: `103215532790`

54 configurations; 6 repetitions; two warm-ups.

Default pipeline held tactical normalization fixed:

`IWIN -> DTH -> FBLK -> FMAC -> CARD(if enabled) -> AUTO stage -> E1/E2/P1 ordering`

### AUTO before vs after child scoring

For every tested ordering, AUTO-before and AUTO-after produced identical node counts. AUTO-before avoided scoring approximately 5.4%–8.7% of candidate children.

AUTO-before was generally faster, with the strongest CARD+E1→E2 context:

- AUTO pre: 1,296 nodes / 2,723 scored children / median 2.747 ms;
- AUTO post: 1,296 nodes / 2,889 scored children / median 3.082 ms.

Current default:

**perform exact action-orbit reduction before expensive child ordering/scoring.**

### Strong-stack move-order ranking

With CARD and AUTO-pre enabled:

| Order | Nodes | Median ms |
| --- | ---: | ---: |
| **E1 -> E2** | **1,296** | **2.747** |
| E2 -> E1 | 1,373 | 3.006 |
| E1 -> E2 -> P1 | 1,387 | 3.166 |
| E2 -> E1 -> P1 | 1,435 | 3.144 |
| E1 | 1,481 | 3.145 |
| E1 -> P1 -> E2 | 1,516 | 3.124 |
| center | 1,906 | 4.101 |
| P1 -> E1 -> E2 | 2,046 | 4.252 |
| P1 | 2,136 | 4.525 |

Thus the best tested lexical order is **E1 maturity first, E2 parity/future-threat second**.

The tested P1 proxy is harmful when dominant in this strong stack and also weakens E1/E2 when inserted high in the lexical order. It is **not rejected globally** because wave 1 showed contexts in which its node effect was strongly positive. The next fair P1 form is a cheap tie-break or regime-gated feature using already-paid metadata, not a universal primary key.

## Current evidence-backed default candidate order

The campaign now uses this default when a candidate is present:

1. `RWS -> RID -> SUP -> INC/FW` semantic/execution substrate;
2. `IWIN -> DTH -> FBLK -> FMAC` exact tactical normalization;
3. `BEXH -> EXH -> CARD/SEWB` exact terminal/bound layer, with CARD/SEWB treated as overlapping/substitutive forms;
4. exact DEAD neutral retirement while preserving neutral tempo;
5. AUTO action/state equivalence, before expensive child scoring;
6. exact proof/cache retrieval and implication where available;
7. decision scoring: E1 first, E2 second; P1 currently only as a later/tie-break/regime candidate;
8. pooled neutral-tempo action after strategic actions.

The ordering remains provisional outside the measured regimes. Reverse-order controls are retained wherever the signed synergy map predicts plausible interference or cost reversal.

## Next campaign waves

1. SUP-event + SEWB fixed-width/performance crossing and CARD substitution;
2. A10 rule-cover closure over the qualified A1–A9 blocker lattice, with proposition-aware credit;
3. WSL-625-native IMPL/dominance indexing to remove linear/frontier scan cost;
4. P1 tie-break/regime forms rather than dominant P1;
5. compact TT/rank/hint/capacity interaction under the selected semantic stack;
6. completed coarse-proof reuse before testing expensive in-flight JOIN coordination;
7. serial semantic stack first, then STT/YBWC/AFF parallel composition.
