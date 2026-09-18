# Search-method evidence campaign v1

**Status:** Complete on bounded relational controls

**Date:** 2026-09-11

**Workflow:** run `34636074995`, job `103384159647`

## Question

Which BSFP-compatible forward search/proof formulations are worth carrying into the relational solver rebuild after composition with the shared exact state and already-qualified tactical/search mechanisms?

Every candidate operated on the same logical state:

```text
q = supportIndex
  + sideToMove
  + normalized P0 residual requirements
  + normalized P1 residual requirements
```

No positional board was used by the search methods.

The campaign deliberately separated two result contracts:

- **strong-score search:** relational negamax alpha-beta, PVS/NegaScout, MTD(f);
- **W/D/L proof search:** transposition-aware PN-DAG and exact Proof-Set Search (PSS).

The methods therefore should not be ranked by a single raw expansion count across families. Strong-score methods prove the exact distance-sensitive root value; PN/PSS runs prove W/D/L through player-win propositions.

## Campaign model

The first campaign used a precompiled exact relational DAG. This isolates search/control economics from relational-state construction and lets all methods see exactly the same states and transitions.

Each serious candidate was measured in reference form and with relational tactical closure where applicable:

- immediate-win exact closure;
- double-threat exact loss closure;
- forced single-response restriction;
- exact relational transpositions;
- center-first action order.

The campaign also inserted an **ideal exact BSFP boundary** at approximately 50% and 70% of total rank. At or beyond that rank the forward method received the exact relational value immediately.

This BSFP boundary intentionally excludes BSFP construction/publication/query cost. It measures the ceiling on forward work eliminated by confluence, not hybrid end-to-end speed.

## Standalone composed results

The most relevant no-BSFP results are the composed/tactical runs.

| Geometry | AB expanded | PVS expanded | MTD(f) expanded | PN-DAG expanded | PSS expanded |
| --- | ---: | ---: | ---: | ---: | ---: |
| 4x3 c3, win | 213 | 227 | **195** | **24** | 56 |
| 4x4 c4, draw | 4,479 | 4,292 | **4,278** | 11,094 | 13,206 |
| 5x3 c4, draw | 997 | **972** | 987 | 7,898 | 8,957 |
| 4x5 c4, draw | 16,489 | 15,110 | **15,103** | 61,275 | deferred |

Search-only elapsed measurements from the precompiled DAG are consistent with the work ranking on the largest control:

| 4x5 c4 | Median/elapsed |
| --- | ---: |
| alpha-beta | 9.489 ms |
| PVS | 7.876 ms |
| MTD(f) | **7.814 ms** |
| PN-DAG | 425.006 ms |
| PSS | scale-deferred |

These timings are useful for relative search-driver overhead only. The 4x5 relational DAG itself required about 7.11 s to construct in this research implementation, so these numbers are not production end-to-end forecasts.

## Alpha-beta family result

The first campaign does **not** establish a single winner between PVS and MTD(f), but it sharply narrows the field.

On the two larger draw controls:

```text
4x4 c4:
  PVS    4,292 expansions
  MTD(f) 4,278 expansions

4x5 c4:
  PVS    15,110 expansions
  MTD(f) 15,103 expansions
```

They are effectively tied in proof work at this scale. MTD(f) had the lowest measured search-only elapsed time on 4x4 and 4x5, while PVS had a slight expansion advantage on 5x3.

Plain relational alpha-beta remains a necessary control and is not far behind after tactical composition. It should remain available in the common kernel because both PVS and MTD(f) are naturally expressible over the same negamax/TT machinery.

### Interpretation

The relational quotient did not remove the historical strength of null-window search. If anything, it makes memory-enhanced null-window methods more plausible because semantically equivalent physical histories now share one exact TT identity.

MTD(f)'s repeated probes were cheap in these bounded controls because the strong-score domain is discrete and the TT preserves bounds between passes. PVS obtains a similar result with a more conventional single traversal plus occasional re-search.

The next campaign should therefore optimize a **shared relational negamax/TT kernel** and compare alpha-beta, PVS and MTD(f) as lightweight drivers rather than building three unrelated solvers.

## Tactical closure is not optional decoration

Relational tactical facts produced large reductions independently of the driver.

Examples:

```text
4x5 c4:
  alpha-beta: 32,819 -> 16,489
  PVS:        27,927 -> 15,110
  MTD(f):     27,950 -> 15,103

4x3 c3:
  PN-DAG:        121 -> 24
  PSS:           236 -> 56
```

These facts are native consequences of the relational state, not board rescans. They should be part of the common optimization substrate used by surviving methods.

## PN-DAG result

PN-DAG showed the expected asymmetry.

On the winning 4x3 root it was dramatically more selective than strong-score alpha-beta methods:

```text
PN-DAG + tactics: 24 expansions
MTD(f) + tactics: 195 expansions
```

But on draw roots it performed much more work:

```text
4x5 c4:
  PN-DAG: 61,275 expansions
  PVS:    15,110
  MTD(f): 15,103
```

The campaign resolves W/D/L by first asking whether P0 can force a win, then whether P1 can force a win when needed. Draw therefore requires two negative proofs. That is structurally unfavorable for draw-heavy roots.

PN-DAG remains valuable research because its proof-directed behavior may be useful for decisive subproblems, move/proof ordering, or future mixed strategies. It has not earned selection as the general forward solver from this campaign.

## Proof-Set Search result

PSS correctly accounted for shared proof leaves in the relational DAG and remained exact on all controls on which it was run. However, its explicit proof-set propagation was expensive.

Examples:

```text
4x4 c4 composed:
  expansions:            13,206
  set elements produced: 13,812,478
  maximum set size:      211

5x3 c4 composed:
  expansions:             8,957
  set elements produced: 43,265,130
  maximum set size:      336
```

PSS was deliberately scale-deferred on 4x5 once the relational graph exceeded the campaign's 50,000-state exact-untruncated-set limit.

This is evidence against the current explicit-set realization as a hot production path, not evidence that transposition-aware proof accounting is useless. Compact/truncated proof sets or PSS-derived ordering remain legitimate later candidates, especially if BSFP has already closed much of the deep graph.

## BSFP compatibility and confluence leverage

All tested families can consume exact BSFP facts directly over `q`.

The ideal-boundary runs show that the payoff can be very large.

### 4x5 c4, composed/tactical

| Method | No BSFP | rank 10 boundary (~50%) | rank 14 boundary (~70%) |
| --- | ---: | ---: | ---: |
| alpha-beta | 16,489 | **1,388** | 9,264 |
| PVS | 15,110 | **1,305** | 8,562 |
| MTD(f) | 15,103 | **1,315** | 8,573 |
| PN-DAG | 61,275 | **6,079** | 36,177 |

The earlier rank-10 wall removes roughly an order of magnitude of forward expansion work for the surviving strong-score methods. The later wall still helps, but substantially less.

This supports the confluence hypothesis that the BSFP boundary should meet forward reasoning **before** the forward method has traversed most of its difficult interior.

Again, these are leverage ceilings. BSFP computation and query cost must be added before making a hybrid performance claim.

### Other ~50% walls

| Geometry | AB | PVS | MTD(f) | PN-DAG | PSS |
| --- | ---: | ---: | ---: | ---: | ---: |
| 4x3 rank 6 | 82 | 87 | **80** | **18** | 36 |
| 4x4 rank 8 | 566 | **548** | 556 | 1,792 | 1,629 |
| 5x3 rank 8 | 347 | **341** | 349 | 1,551 | 1,904 |

PSS does occasionally improve over PN-DAG under a useful solved boundary, which is enough reason to retain it as research rather than reject the family outright.

## Candidate disposition after v1

### Advance to the next composition campaign

- **relational negamax alpha-beta** — required control and shared kernel;
- **PVS/NegaScout** — strongest conventional driver;
- **MTD(f)** — strongest or co-strongest tested driver, particularly attractive with exact relational TT reuse.

### Retain as research candidates, not current hot-path finalists

- **PN-DAG** — compelling for decisive proofs but poor general draw economics in this formulation;
- **PSS** — semantically suited to DAG transpositions but current exact set representation has unacceptable scaling pressure.

### Not yet admitted

- **df-pn/PDS-PN variants** — require a precise transposition/DAG-safe correctness contract before evidence is meaningful;
- conspiracy-number, Rivest min/max approximation, B* and learned proof-cost mechanisms — better treated initially as ordering/scheduling candidates layered over a surviving exact kernel.

## Next campaign

The next evidence campaign should stop spending most effort on textbook driver differences and instead ask which driver benefits most from the complete relational optimization stack.

Keep alpha-beta, PVS and MTD(f) on one shared kernel and add, in controlled stages:

1. packed/on-the-fly relational transitions rather than a precompiled whole DAG;
2. compact exact TT under equal-byte memory controls;
3. reflection/residual automorphism canonicalization;
4. native relational tactical closure;
5. earliest-win/support bounds;
6. compiled local proof/Allis masks where exact and cheap;
7. proof-cost/action ordering candidates;
8. coarse parallelism only after serial economics stabilize;
9. actual BSFP-produced boundary/query data and total hybrid accounting.

The selection target remains **time to exact proof under fair total-system accounting**, not minimum nodes in isolation.

## Non-claims

This campaign does not establish:

- standard 7x6 solver performance;
- end-to-end production speed, because DAG construction was precomputed;
- hybrid speed, because BSFP boundary construction cost was excluded;
- that MTD(f) is the final production driver;
- that PN/PSS families are globally inferior outside the tested controls/compositions;
- that every historical minimax optimization has already been re-expressed relationally.
