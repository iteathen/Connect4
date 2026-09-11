# Connect4 Semantic-Quotient Research Status

**Updated:** 2026-09-11  
**Canonical branch:** `research/semantic-quotient`  
**State:** MQ1-MQ4 passed; SIU-1 relational exactness passed; search-method campaign v1 complete

## Mission

Find the smallest exact, efficiently updatable description of the remaining Connect Four game and determine which forward/backward exact reasoning forms exploit it best. This branch owns solver-neutral research into future-behavior equivalence, win-space reduction, support/accessibility sufficiency, relational state identity, canonical transitions, cross-solver proof contracts and comparative search-method evidence.

It does **not** own production solver implementation. Those remain on:

- `solver/minimax-alpha-beta`
- `solver/cuda-bsfp`
- `solver/hybrid-confluence`

## Qualified semantic chain

Complete bounded-game qualification establishes:

```text
physical colored history
  -> identified-line quotient (support,H0,H1)
  -> support + minimal residual antichain pair
  -> coarsest exact action-behavior class
```

### MQ1-MQ4

Across **1,681,808** complete-control physical nonterminal states, the shared semantic work established zero exact strong-score/action-score mismatches for the qualified relational reductions. MQ4 generated complete game automata directly from:

```text
support + minimal residual pair + column
  -> terminal score | next relational state
```

without carrying a colored ownership board recursively.

For complete 4x5 c4:

```text
physical states:          1,385,521
relational states:          294,593
behavioral classes:         229,232
nonterminal transitions:    814,300  # SIU-1 nonterminal relational DAG
terminal win edges:           76,058
```

The earlier MQ4 flat-table accounting remains authoritative for its exact serialized transition profile.

## SIU-1 — one relational language in both directions

`research/semantic-quotient/state-identity-unification/` tested the BSFP-aligned logical state:

```text
supportIndex
+ sideToMove
+ normalized P0 residual requirements
+ normalized P1 residual requirements
```

The forward engine used only that relational state. A reverse exact W/D/L closure used only relational IDs plus the exact inverse relation. Colored board state was confined to an independent oracle.

Across the same **1,681,808** complete-control physical states, SIU-1 produced zero physical-projection, forward-transition, terminal, strong-score, per-action-score, BSFP W/D/L, or reverse-closure mismatches.

Observed physical-to-relational reduction ranged from **1.247x to 13.431x**. On 4x5 c4, 1,385,521 physical states collapsed to 294,593 relational states, with one relational state representing as many as 37,080 physical states.

The quotient is deliberately not state-level reversible. The common algebra is:

```text
forward:       T(q,a) -> q' | terminal
backward: Pre_a(Q) -> exact predecessor set/frontier
hybrid:        exact classification/proof facts keyed by q
```

Common semantics must not force common physical representation. On 4x5, the existing BSFP ownership-antichain result used only 40,707 W/L boundary records versus 294,593 explicit relational states.

Authority:

- `research/semantic-quotient/state-identity-unification/SIU1_RESULT.md`
- `research/semantic-quotient/state-identity-unification/evidence/2026-09-11-siu1-relational-dual-direction.json`
- Actions run `34632643724`, job `103372941221`

## Search-method evidence campaign v1

The first comparative campaign treated search method as an experimental dimension while holding the BSFP-compatible relational language fixed.

Primary methods tested:

```text
strong-score:
  relational negamax alpha-beta
  PVS / NegaScout
  MTD(f)

W/D/L proof:
  PN-DAG
  exact Proof-Set Search (PSS)
```

All implemented candidate correctness assertions passed on the bounded controls. Search methods operated over a precompiled relational DAG; positional board state was absent from search.

### Standalone composed work

With relational tactical closure enabled:

| Geometry | AB | PVS | MTD(f) | PN-DAG | PSS |
| --- | ---: | ---: | ---: | ---: | ---: |
| 4x3 c3, win | 213 | 227 | **195** | **24** | 56 |
| 4x4 c4, draw | 4,479 | 4,292 | **4,278** | 11,094 | 13,206 |
| 5x3 c4, draw | 997 | **972** | 987 | 7,898 | 8,957 |
| 4x5 c4, draw | 16,489 | 15,110 | **15,103** | 61,275 | deferred |

On 4x5, search-only median elapsed time over the precompiled graph was approximately 9.49 ms AB, 7.88 ms PVS and 7.81 ms MTD(f). These are driver/search measurements only; the research DAG itself required about 7.11 s to construct and is not a production representation.

### Candidate disposition

Advance to the next composition campaign:

- relational negamax alpha-beta as the control and common exact kernel;
- PVS/NegaScout as a driver;
- MTD(f) as a driver.

Retain as research candidates, not current hot-path finalists:

- PN-DAG — exceptionally selective on the decisive 4x3 root but weak on the tested draw roots because draw requires two negative player-win proofs;
- PSS — exact and transposition-aware, but explicit proof-set propagation produced very high set/backup cost and was scale-deferred beyond 50k relational states in v1.

Standard df-pn was not admitted because a DAG/transposition-safe correctness contract was not established for this campaign.

### Tactical composition result

Relational tactical closure materially reduced work across methods. On 4x5:

```text
alpha-beta: 32,819 -> 16,489
PVS:        27,927 -> 15,110
MTD(f):     27,950 -> 15,103
```

This confirms that search methods must be compared in their best compatible composition, not as bare textbook algorithms.

### Ideal BSFP confluence leverage

The campaign supplied exact relational values at fixed rank walls to measure forward-work elimination. BSFP construction/publication/query cost was intentionally excluded.

On 4x5 c4, composed/tactical:

| Method | no BSFP | rank 10 (~50%) | rank 14 (~70%) |
| --- | ---: | ---: | ---: |
| alpha-beta | 16,489 | **1,388** | 9,264 |
| PVS | 15,110 | **1,305** | 8,562 |
| MTD(f) | 15,103 | **1,315** | 8,573 |
| PN-DAG | 61,275 | **6,079** | 36,177 |

The earlier wall is dramatically more valuable, supporting the hypothesis that confluence should occur before forward reasoning traverses most of its hard interior.

This is a leverage ceiling only, not a hybrid speed claim.

Authority:

- `research/semantic-quotient/state-identity-unification/src/search-method-evidence-campaign.mjs`
- `research/semantic-quotient/state-identity-unification/SEARCH_METHOD_CAMPAIGN_V1_RESULT.md`
- `research/semantic-quotient/state-identity-unification/evidence/2026-09-11-search-method-campaign-v1.json`
- Actions run `34636074995`, job `103384159647`

## Hard BSFP compatibility rule

Future forward candidates must speak the same exact relational `q` language and consume exact BSFP facts directly. They may publish only facts with explicit sound proof meaning (exact values, qualified bounds, certified closures). Heuristic scores, proof-number estimates, neural values and ordering hints are never BSFP authority.

Compatibility does not require common mutable state or common control flow.

## Current next questions

1. Build one **packed/on-the-fly relational negamax kernel** and compare alpha-beta, PVS and MTD(f) as thin drivers over exactly the same implementation.
2. Reapply the best compatible optimization portfolio: relational tactical closure, automorphism/reflection canonicalization, earliest-win/support bounds, compiled local proof masks and proof-cost ordering.
3. Use equal-byte exact TT/cache controls rather than equal entry counts where layouts differ.
4. Replace ideal BSFP rank walls with actual BSFP-produced/queryable boundaries and account for build, publication and lookup cost.
5. Continue SIU symbolic-preimage work so BSFP retains frontier compression instead of enumerating every `q`.
6. Characterize standard 7x6 relational scale before any production promotion.

Production branch restructuring is deferred until the shared-kernel evidence establishes which forward driver/composition deserves the new solver generation.
