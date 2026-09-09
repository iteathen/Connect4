# Fresh structural experiment — measured results

Root-compiled winning requirements; one worker; unchanged two-word negamax except fixed key masks and equivalent neutral-action elimination. Cold tables have equal entries and bytes.

| Cohort | TT entries | Cases | Baseline nodes | Full nodes | Baseline solve ms | Full solve ms |
|---|---:|---:|---:|---:|---:|---:|
| legacy | 524288 | 2 | 6950040 | 6950040 | 1974.801 | 2008.780 |
| natural | 524288 | 64 | 15396 | 15393 | 3.555 | 4.752 |
| opportunity | 524288 | 20 | 3251 | 2024 | 0.782 | 0.822 |
| dense | 524288 | 16 | 37422 | 37422 | 7.883 | 8.708 |
| openWing | 524288 | 16 | 165029 | 100231 | 44.360 | 24.438 |
| openWing | 131072 | 16 | 165200 | 100347 | 37.598 | 23.417 |

Solve time is median of each repeat's sum of individual admission + compilation + search durations. TT reset, geometry, parsing and warm-up are excluded from this column; reset costs are separately recorded in every raw trial. Sampled sandbox timings are noisy. Legacy and dense controls execute identical recursive bodies and still vary substantially: do not attribute their timing spread to the abstraction.

The two open-wing batches have 7 rounds each. Full mode reduced cohort solve time in 14/14 paired rounds and reduced nodes in 16/16 positions at each capacity. This is an explicitly enriched workload, NOT a general 39% solver-speedup claim.

128K open-wing medians including each trial's TT reset: baseline 44.589 ms, full 29.340 ms. At 512K: baseline 63.856 ms, full 44.674 ms. These remain cold-root experiments, not persistent cross-game throughput.

## Ablation: 16 open-wing positions at 512K

| Mode | Nodes | Median solve ms |
|---|---:|---:|
| full | 100231 | 24.438 |
| rawFull | 115613 | 32.476 |
| base | 165029 | 44.360 |
| compileTax | 165029 | 42.510 |
| key | 148407 | 35.548 |
| neutral | 103594 | 28.590 |

base = unchanged search. compileTax = compiler result ignored. key = erase irrelevant future colors only. neutral = collapse neutral action equivalents only. full = both after antichain reduction. rawFull = both without requirement subsumption.

## Qualification

4659 reachable nonterminal 4x3 connect-3 states; 3735 reduced-requirement classes; 11818 legal edges; 8626 non-winning transitions checked; 24 neutral-choice equalities checked. Same-class states have equal exact values and per-column action values.

Independent 7x6 late-game brute force: 96 positions, all three variants and baseline agree. Without any TT or pruning, neutral action elimination reduces 9712 to 8427 oracle nodes.

Independent cell-array alpha-beta validates 16/16 open-wing exact values. No requirement compiler or bitboard routines are used in that oracle.

The small-board tempo witness 11124224 has exact score +1; suppressing its neutral choice would yield -2. Neutral moves consume real turns. A separate 7x6 both-dead draw guard also passes.

4434 timing trials, no score disagreement, no node-cap exits. Matching old legacy scores is agreement, not independent full-size oracle qualification.

## Interpretation and remaining boundaries

The strongest measured contribution is collapsing equivalent neutral choices; color-erased TT identity adds a smaller overlapping benefit. Antichain minimization exposes more opportunities than merely listing live lines. Ordinary random-surviving and dense controls show little/no node benefit and pay root compilation overhead. Root-frozen support does not exploit irrelevance that emerges later in search. Future reuse is compiler-scoped: changing roots requires invalidation or a separately proved compatibility identity. No custom-evaluator equivalence, multicore publication qualification, full antichain-key engine, scheduler changes, or production readiness is claimed.

The next meaningful experiment is coarse-boundary recompilation on recorded midgame subtrees, with compiler cost and lost cross-scope TT reuse charged. Do not add per-node requirement rebuilding merely to make the quotient more aggressive.

## Full raw artifact

`C4-structural-experiment.zip`, supplied with the research response, contains all raw trials, generated kernels, frozen corpora and execution output. SHA-256: `98c699a0d1061e8bc395631b461cbf473e686dc804d429c1624c9f7ebb51d019`. The repository keeps the reproducible source and this derivative summary; the large raw JSONL is not copied into this commit. Missing original interrupted-attempt output was not reconstructed as evidence; the final experiment was rerun from restored source.
