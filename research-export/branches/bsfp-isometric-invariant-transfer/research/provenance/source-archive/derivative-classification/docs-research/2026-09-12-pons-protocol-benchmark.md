# Pons protocol: bounded local W/D/L benchmark

Research direction / architecture: Josh Oshiro  
Implementation / qualification: OpenAI ChatGPT

The [Pons test protocol](https://blog.gamesolver.org/solving-connect-four/02-test-protocol/) supplies six sets of 1,000 nonterminal positions, one-based move sequences and exact current-player scores. This execution uses its weak-solver interpretation: compare exact W/D/L with the sign of each published score. It does not claim strong distance scores. The original page's published means describe complete sets; the partial-prefix means below must not be compared as if they covered those same complete populations.

All six full datasets were downloaded from the repository's previously recorded mirror revision `megakilo/alphafour@cf2d4546e5824c155e9dd7e888a572bff3128498`. Exact Git blob hashes were checked before execution; each file contained 1,000 validated records. [Data provenance](evidence/2026-09-12-pons-protocol/provenance.json) binds every file to its URL and blob hash.

## Execution

One batch, one 60,000 ms global budget divided across six sequential set processes. Actual batch duration including process shutdown/reporting was **60,036.93 ms**. Every child exited. No second benchmark or full empty-board solve was launched.

Current frontier-native engine on Node 26.7.0, empty initialization followed by each supplied sequence, exact search to terminal proof with no depth horizon, same 2 GiB reservation budget and ETC-disabled configuration as the recent timing test. Each position received fresh semantic state, proof table and live-line frontier. No proof or state cache was donated between positions. Standard geometry is the dataset's 7 columns × 6 rows, captured by the existing initialization owner; no production board-size code was changed.

The child implements the protocol's streaming interface: one sequence per input line; output sequence, W/D/L value, visited-node count and computation microseconds. Parsing, initialization, path replay and asynchronous output are outside search timing. Setup remains inside the global wall-clock budget. Every completed output was checked in order against the matching external score sign. An interrupted position contributes neither a fabricated score nor a partial visit count.

## Result

**137 completed positions, 137 correct, zero incorrect. All six sets remain partial.**

| Set | Completed / 1,000 | Mean search time | Mean visits |
|---|---:|---:|---:|
| End-Easy | 52 | 0.834 ms | 37.9 |
| Middle-Easy | 53 | 9.312 ms | 1,080.1 |
| Middle-Medium | 29 | 143.725 ms | 38,800.5 |
| Begin-Easy | 1 | 1.338 s | 749,502 |
| Begin-Medium | 2 | 0.814 s | 444,627 |
| Begin-Hard | 0 | unfinished | unavailable |

The averages apply only to completed prefixes. The next position in each set, including the first Begin-Hard position, did not complete within that set's share of the budget. These are full exact subgame solves, unlike the earlier depth-21 unknown-horizon test.

Fresh setup averaged approximately 134–190 ms per completed position, much larger than easy-position search time. Each fresh kernel reserved about 1.21 GiB of accounted typed storage under the unchanged 2 GiB budget. This setup cost consumed much of the batch budget. Thus the run provides external exactness evidence and initial per-position measurements, not a complete 6,000-position benchmark or evidence of a sub-ten-second hardest/empty-board solve. Small cold searches also do not have the same JIT/work distribution as the long empty-board profile.

## Review and next owner

The engine implementation was unchanged. The harness rejects malformed inputs, checks full dataset provenance and output alignment, enforces child termination and preserves raw output/diagnostics. No extra test run was started to hide partial results. Next benchmark work, if continued, should address initialization ownership/reuse of immutable geometry separately from proof/state isolation, and retain explicit timeout/coverage reporting.

[Runner](evidence/2026-09-12-pons-protocol/run.mjs), [per-position results](evidence/2026-09-12-pons-protocol/results.json), and [post-run source hashes](evidence/2026-09-12-pons-protocol/source-hashes.json). Raw streaming output and setup diagnostics for each set are alongside them. Work remains uncommitted; protected main and all refs are unchanged.
