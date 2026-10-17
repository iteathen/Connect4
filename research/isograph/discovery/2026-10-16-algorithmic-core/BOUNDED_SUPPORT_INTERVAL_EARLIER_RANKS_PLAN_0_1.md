# Search-free interval-Bellman scaling below rank20 — frozen candidate checks

Date: 2026-10-16, branch `research/semantic-quotient`.
Prior success: rank20 exact WDL/all literal move values after **4 symbolic plies**, in a 284-support cone, independent full q reference 79,697 states / 351,153 evaluated edges. The original source-q rank20 has 14,400 possible full-horizon supports and exceeded the frozen 10,000 support cap; no resources were increased. Cross-horizon soundness: 90 symbolic compilations on 19 legal q inputs (plus one invalid first-win fixture properly excluded) with zero WDL-bound or monotonicity errors.

## Predeclared earlier legal source positions

Use only supplied, independently legal prefixes of frozen `43214636342357317661423762461717147` (chosen by rank, **not by solved outcomes**), plus canonical `44444`.

| source | remaining | support rectangle | bounded depths to attempt |
|---|---:|---:|---|
| rank18 prefix | 24 | 24,000 | 2,4,6,8,10 |
| rank16 prefix | 26 | 36,000 | 2,4,6,8,10 |
| rank14 prefix | 28 | 64,800 | 2,4,6,8 (depth10=11,962 >10k cap) |
| rank10 prefix | 32 | 141,120 | 2,4,6,8 (depth10=14,380 >10k cap) |
| canonical `44444` rank5 | 37 | 235,298 | 2,4,6,8 (depth10=12,341 >10k cap) |

Every candidate compiles the **same exact four-threshold** P0 WIN/NONLOSS lower/upper BDD from only source q and gravity, without inspecting searched policies or q descendants. Stop further depth attempts per position if **all action intervals are exact**. Otherwise retain noncollapsed intervals as exact bounds, not guessed values.

Full source-q support cones are not attempted. Maintain hard maxima per compile: **60,000 live ROBDD nodes**, **300,000 nontrivial operations**, **10,000 support states**, **15 seconds**, batched GC every 64 supports/high-water 40k. No limit increased. Independent complete q reference is allowed **only after** all symbolic intervals for that position have been frozen; hard cap 200k unique q/800k transitions/30 seconds. If reference cannot finish, report **reference UNKNOWN**; never convert partials to PASS.

Outputs: exact root and per-action WDL bounds, monotone tightening, max BDD nodes and source lookup work, compared reference if qualified; first horizon at which the result closes and whether all optimal moves are certified. If rank5 `44444` does not stabilize within horizon8, this is a precise negative **for this interval depth**, not a failure of the established algorithmic core or proof that full nonbranching is impossible.

Retain historical algebraic short-horizon results, no node budget stretching, no extra game-tree evaluation inside candidate, no claim that finite depth proves standard root WDL.
