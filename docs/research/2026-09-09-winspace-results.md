# Win-space negamax: boardless state, exact reuse, and performance limits

Date: 2026-09-09. Status: authorized research only; no maintained implementation promotion.

## Decision

The win-space identity is useful: it permits exact reuse between different colored boards. A same-slot intervention isolates a 31.20% node reduction on the favorable structural cohort. A one-word goal-state implementation is a candidate for later-game/coarse-root selection, not a replacement for the bitboard engine everywhere. Early anchors regress materially; ordinary and prospectively selected positions do not establish a general speedup.

## Inputs and scope

Remote heads were read before mutation: research `bdf16764e16325fceb36509b43809b326d17bfdd`; main `de47d43f4f4133a68973d0876a402531ef5735da`. Baseline is the preserved two-word shared-TT kernel, Git blob `965c3806c92a7add544dce4777d965b3e12376d6`. Its bytes were verified locally. Prior root-compiled quotient sources and the owner-authorized organic bundle were inspected. Unlike those bitboard-carrying prototypes, the new semantic kernel does not carry or update historical stone colors through recursion.

Node v22.16.0, Linux x64, INTEL(R) XEON(R) PLATINUM 8573C, reported parallelism 4. This study uses one worker. No CUDA, Monte Carlo, coarse proof graph, worker scheduling, or live memory reclamation was added.

## Representation and candidates actually tested

The cold compiler maps surviving requirements to stable IDs and board-cell addresses. Two player masks describe which goals are still live. Packed column heights supply legal landing addresses. Three bit planes count remaining empty cells across 32 goals simultaneously. A per-goal XOR of empty-cell addresses exposes the remaining cell when only one is missing, and the other cell after a hypothetical placement in a two-hole goal. Cell-incidence tables update and restore only affected XOR records; count planes update by fixed-width bit operations.

These addresses and temporary cell-set masks are not colored-board states. The semantic recursion consults no historical color. A separate history-key control deliberately retains it for comparison.

`history` uses line-state operations but historical board identity. `lines` uses the exact root-scoped live-goal identity. `draw` adds exhausted-goal draw termination. `sign` also tightens the score to zero on the appropriate side when one player has no possible goal. `minimal` additionally merges duplicate and subsumed requirements at root compilation. Tactical filtering and the threat-count ordering policy follow the existing kernel; the reduced goal set can change the resulting ordering scores. A no-TT, unreduced control establishes ordering/node parity on 32 cases. No separate new ordering heuristic is introduced.

`adaptive` is a deliberately narrow structural rule: compile at the root; use the minimal line engine only when its unique goal dictionary fits one 32-bit group; otherwise use the original bitboard engine. Both views alias one preallocated backing arena. There is no recursive switching or redirect lookup.

## Why identity is exact within a compiled root

For the fixed root dictionary, equal column frontiers imply identical empty cells in every goal, empty counts, residual XORs, remaining capacity, and side-to-move parity. Equal player live masks therefore imply equal remaining winning requirements and corresponding transitions under each column move. Historical colors need not be retained separately.

The TT key is frontiers plus both live masks, not a probabilistic fingerprint. Root dictionaries may differ: rebinding always invalidates the cache. This study does not establish cross-root cache compatibility. Root-only minimization also does not achieve every equivalence obtainable by repeatedly canonicalizing the full residual requirement system.

An empty live-goal collection is different from a completed zero-empty goal. Public entry guards handle immediate wins; internal negamax retains its no-immediate-current-win precondition. Goal exhaustion terminates filler continuations at zero. Other draws still require adversarial resolution of surviving possibilities. Exact distance-sensitive scores are retained; custom heuristic-evaluator equivalence is not claimed.

## Fairness and attribution

Main runs reserve approximately 2 MiB per TT. Baseline entries are 14 bytes; line entries are 16, 24, or 32 bytes for one, two, or three groups. Entry counts are consequently lower for the candidate. Equal-byte configurations use unsigned hash modulo capacity in BOTH engines. These timings should not be directly compared to earlier power-of-two mask timing batches. Baseline here is the full-key engine, not a combined compact-key/coarse-proof champion.

Preparation time includes root compilation, invalidation, and view setup. Search time is recorded separately; reported total is preparation plus search. Parsing is excluded equally, and initial arena allocation/JIT warmup is not charged to each game. Cold compiler objects and scratch metadata exist in addition to the equal TT-byte budget; no equal whole-process-memory claim is made.

Mode order rotates and reverses; root order reverses across repetitions. All measured repetitions are retained. Warmup was extended to exercise the specialized one-word kernel. Median timings below are medians of complete-cohort repetition sums, not selected fastest roots or sums of per-root medians.

## Qualification

The exhaustive 4x3 connect-three traversal visits 4,659 reachable states without a prior winning terminal (including full-board draw terminals if reached). Its freshly minimized remaining-game signatures form 3,735 classes: 924 historical distinctions merge. It checks 11,818 legal transitions, 18,636 variant values, and 18,684 sound window results. Equivalent signatures agree on legal transitions and values. This full-signature class count is not a compression ratio claimed for the timed 7x6 TT.

Independent cell-array 7x6 oracle: 96 late survivor positions plus the immediate-win entry case `121212`; 485 candidate-value comparisons and 3,880 sound-window comparisons pass. Many roots are tactical/trivial; this is not an independent proof of the early benchmark anchors. Baseline agreement on performance cohorts is a separate consistency check, not another independent oracle.

Additional checks: 32 no-TT tactical-order/node comparisons; eight exhausted-goal draw certificates; two abort/unwind restoration checks. Instrumented independent reconstruction checks live goals, empty counts and XORs at 30,003 recursive entries across three-, two-, and one-word dictionaries.

## Causal result: reuse is not a hash-layout accident

A diagnostic shadow records the full historical board identity while keeping the SAME semantic table slots, entry capacity, move ordering, pruning and publication. One mode rejects otherwise valid semantic hits whenever the colored boards differ; the other accepts them. Both maintain the diagnostic shadows, and this experiment is not timed as a production kernel.

On the 54-position prior structural stress cohort:

| Mode | Nodes |
| --- | ---: |
| Reject different-colored-board hits | 112,170 |
| Accept exact win-space-equivalent hits | 77,169 |

There are 6,515 accepted different-board hits. The 31.20% reduction is attributable to permitting those hits, not a changed table address function. All paired root scores agree. Exact raw per-position output is preserved in `evidence/winspace/mechanism.jsonl`.

## Performance: positive and adverse results

The broad holdout is the prior ordinary survivor-rollout cohort, not real human-game sampling. The 54-position structural stress cohort was deliberately selected in earlier research for relevance collapse; it is favorable, not representative. A new prospective challenge selects the first 12 legal roots with 20,000..299,999 baseline nodes at 128K entries, using baseline difficulty only, before any candidate measurement. Its seed, all moves, scores, and selection counts are frozen.

At 2 MiB TT budget, `minimal` versus baseline:

| Cohort | Roots / repetitions | Baseline nodes | Minimal nodes | Baseline total ms | Minimal total ms |
| --- | --- | ---: | ---: | ---: | ---: |
| Prior structural stress | 54 / 7 | 111,850 | 77,169 | 52.750201 | 40.483206 |
| Prior ordinary holdout | 80 / 5 | 151,809 | 131,464 | 66.379587 | 72.706342 |
| Prospective difficulty challenge | 12 / 5 | 773,257 | 684,468 | 256.001241 | 283.662952 |
| Established early anchors | 3 / 3 | 11,209,846 | 12,419,719 | 3627.084926 | 5404.911017 |

Stress: 31.01% fewer nodes, 23.25% less total time; candidate wins all seven paired cohort totals. Its independent second batch gives 54.844846 -> 44.188340 ms, about 19.43% lower, winning six of seven pairs. The adaptive one-word selector gives 43.769874 ms in that second stress batch with the same 77,169 nodes.

Ordinary holdout: 13.40% fewer nodes but 9.53% greater total time in the first batch. Prospective challenge: 11.48% fewer nodes but 10.81% greater total time. Early anchors: more nodes and approximately 49% slower. These are genuine adverse results, not discarded warmups.

Both-dead and one-sided bounds incrementally reduce the challenge nodes (`lines` 698,005; `draw` 697,489; `sign` 692,981; `minimal` 684,468). Their timing contributions are not established individually; representation cost and noise can dominate.

Capacity controls at 128 KiB and 8 MiB retain the same warning: fewer nodes need not repay wider keys and line updates. At 128 KiB challenge baseline/minimal totals are 296.561243/392.303818 ms; at 8 MiB, 462.031461/490.629649 ms.

## Timing noise and selector limits

In the adaptive early-anchor negative control, every root selects the identical original baseline backend and all node counts match. Nevertheless medians differ (4006.831997 vs 3613.454414 ms), with only three of five paired wins and broad ranges. That is evidence of environmental/measurement variability, not an algorithmic early-position speedup. No selector gain is claimed from it.

Adaptive ordinary-holdout timings look favorable in one later batch, but the search-only totals are nearly equal, and earlier batches were mixed. The one-word threshold is a structural candidate, not a validated profitability predictor. Root setup can still dominate trivial cases. Large goals, multiple key words, fewer entries at equal bytes, and line-incidence work explain why a universal replacement has not earned adoption.

## Corrections and preservation

The first zero-goal root check found two redundant null-window calls, not a wrong score. The root exhaustion guard removed them. Initial benchmark warmup insufficiently exercised one-word specialization; early screens remain exploratory. The first allocator version recreated backing arrays when group count changed; the corrected constructor preallocates one arena and only rebinds views at drained root boundaries. Old sources and outputs remain in the full bundle.

One metadata bug was found after measurement: `CORPUS=./challenge.json` correctly selected and executed challenge rows, but the configuration header hashed the default corpus. Per-trial sequences and the separately frozen challenge record identify the actual input. The published runner fixes that header only; original raw logs and the measured source are not rewritten.

8,817 measured complete solves and 246 warmup solves/capped warmup attempts are recorded across exploration, ablations and confirmations. They are repetitions, not 8,817 independent positions. All benchmark processes exited. No empty-board exact solve, multicore speedup, portable multiwriter publication proof, production crash recovery, or full dynamic minimized-goal DAG is established.

Repository preservation uses UTF-8 source, frozen corpus reconstruction, raw qualification and causal records, and selected exact unrounded repetition aggregates with raw-file hashes. The selected ledger retains every repetition of the reported base/minimal comparisons and adaptive stress/anchor controls; it does not contain all exploratory modes. The repetition ledger is DERIVED, not the full original per-position timing log. The downloadable bundle retains every original per-position log and failed source snapshot. No base64 archive transport is used; main and all prior research remain unchanged.

## Next seam, not an implementation commitment

Retain the boardless one-word engine and exact semantic reuse result for subsequent selection. Investigate cheaper root certification and further compact exact encodings, or a separately measured coarse handoff into the line engine. Do not hide an implicit representation switch in recursive negamax. Compare future candidates against the compact-key baseline as well as this full-key control before claiming portfolio-level superiority.
