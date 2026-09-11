# Win-space negamax experiment (research only)

Read `docs/research/2026-09-09-winspace-results.md`. The kernel uses goal identities and legal frontiers rather than historical colored-board state. Only the explicit history/diagnostic controls retain colors. Compile-time specialization occurs outside recursion. Rebinding the root goal dictionary invalidates its TT; no cross-root key compatibility is implied.

## Reproduction

Use Node 22 or newer from repository root. Preserve existing evidence; write new logs to a different directory.

```sh
D=reference/research-prototypes/2026-09-09-winspace
mkdir -p /tmp/c4-winspace-new
node "$D/restore-corpus.mjs"
node "$D/qualify.mjs" > /tmp/c4-winspace-new/qualification.jsonl
node "$D/mechanism.mjs" > /tmp/c4-winspace-new/mechanism.jsonl
node "$D/benchmark.mjs" stress 2097152 7 base,sign,minimal > /tmp/c4-winspace-new/stress.jsonl
node "$D/benchmark.mjs" holdout 2097152 5 base,sign,minimal > /tmp/c4-winspace-new/holdout.jsonl
CORPUS=./challenge.json node "$D/benchmark.mjs" challenge 2097152 5 base,history,lines,draw,sign,minimal > /tmp/c4-winspace-new/challenge.jsonl
node "$D/benchmark.mjs" anchors 2097152 3 base,sign,minimal > /tmp/c4-winspace-new/anchors.jsonl
node "$D/benchmark.mjs" stress 2097152 7 base,adaptive,minimal > /tmp/c4-winspace-new/adaptive-stress.jsonl
```

`challenge.mjs` regenerates the prospective challenge using ONLY baseline difficulty, but overwrites `challenge.json`: run it in a separate source copy. `restore-corpus.mjs` reconstructs the 265-position prior corpus byte-for-byte from small UTF-8 `corpus.txt` and checks its SHA-256. Some frozen neutral subsets are retained but not independently benchmarked in this study. `summarize.mjs` reads the full bundle's original evidence directory and recreates exact cohort repetition sums and full per-position summaries; the repository's reduced evidence set alone does not contain all inputs to that summarizer.

## Identity and cost

Within a fixed root dictionary, packed heights plus player live masks determine remaining goals. The empty-count planes and XOR addresses are derived acceleration state, not extra historical identity. Direct TT validation is exact, not probabilistic. Root-only subsumption does not claim full dynamic minimization.

TT entries cost 16/24/32 bytes for one/two/three goal-mask groups versus the full-key baseline's 14. Equal-byte runs use modulo indexing in both engines. Preparation (including compile and invalidation) is measured. Cold compiler VM allocations and scratch metadata are additional. Adaptive views share one arena, select once at root, and never redirect inside search.

The existing shared-TT publication pattern is research-grade; this study is single-worker. It neither proves portable multiwriter publication nor qualifies GPU execution. No maintained source is changed.

## Preserved evidence

The repository contains original qualification and causal JSONL, the exact frozen challenge, a lossless corpus restorer, a DERIVED unrounded repetition ledger and raw-file identity manifest. Full original timing JSONL, failures, measured-source snapshots and expanded summaries are retained in the downloadable research bundle. A summary or digest is not a substitute for the original logs when auditing timing.
