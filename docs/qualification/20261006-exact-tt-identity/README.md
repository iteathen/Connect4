# Exact index plus partial TT key: localhost qualification

The exact 24-byte candidate preserves the normalized RBA identity and its gray
token equivalences. The table index supplies the omitted low locator bits; the
stored partial locator supplies the remaining bits. With every other input
retained, the existing reversible mixer determines one omitted coordinate word.
There is no probabilistic fingerprint and no lookup-time inverse or decoder.
The full 32-bit publication sequence and existing proof/window semantics remain.

## Measurements

Three fresh processes per full-coverage configuration. Empty 7x6, six discovered
and verified pinned P-cores (0/2/4/6/8/10), i5-12600K, the retained Node27 nightly,
V8 14.6.202.34-node.36, 2400/9600 inline flags and startup preload. Existing worker
ordering, tactics, bounds sharing and support plans are unchanged. No RLC,
opening prefix, book, prior TT or runtime oracle. Expected W/D/L is checked only
after process return.

Primary time starts after all workers and page-warmed TTs are ready, includes
constructing the actual empty root and ends at exact-result observation.
Initialization and cleanup remain recorded separately. CPU time includes the
entire process. Process cycles and hot-loop node/hit counters were not collected.

| Layout/capacity | Shared TT | Private TT per worker | Total TT payload | Mean solve | Solve range | Mean process CPU | Max peak RSS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 32-byte retained control | 4 GiB | 256 MiB | 5.500 GiB | 42.128 s | 40.977–43.246 s | 243.052 s | 6.964 GiB |
| 24-byte, same entry count | 3 GiB | 192 MiB | 4.125 GiB | 39.607 s | 38.060–40.557 s | 227.969 s | 5.591 GiB |
| 24-byte, twice shared entries | 6 GiB | 192 MiB | 7.125 GiB | 38.889 s | 36.716–40.179 s | 227.016 s | 8.593 GiB |
| 24-byte, twice private entries | 3 GiB | 384 MiB | 5.250 GiB | 39.682 s | 38.713–40.334 s | 230.214 s | 6.717 GiB |
| Mixed 16/24-byte, 1.5x total slots | 3.5 GiB | 224 MiB | 4.813 GiB | 39.337 s | 37.732–40.522 s | 227.109 s | 6.278 GiB |

All 15 full-coverage runs returned EXACT/WIN/c4 and exited all six workers
cleanly. Every raw stdout/stderr, configuration, runtime/source identity,
external measurement and cleanup record is retained under its run directory.
[comparison.json](comparison.json) contains every value and descriptive
statistics; [compare.mjs](compare.mjs) recomputes them and checks budgets,
runtime/launch flags, outcomes and affinity. These are small samples, not a
statistical significance or universal performance claim.

The 24-byte layout saves 25% TT bytes at unchanged capacity, with a 5.98% lower
mean solve in this series. Doubling its shared entries adds 3 GiB and lowers its
mean by a further 1.81%; that increment is unresolved against run variation.
Doubling private entries showed no added mean improvement. The mixed layout
adds 16.7% TT bytes over full24 for a 0.68% lower mean; that speed advantage is
also unresolved. Its nominal 1.5x slot count is partitioned by support class,
not an assertion that every state can access all slots.

## Decisions and limits

- **RETAINED as a research candidate:** exact full24, including its bounded
  correctness and memory benefit. It is the simplest qualified smaller layout.
- **UNQUALIFIED:** extra-capacity performance premium and mixed layout. Preserve
  their controlled experiments without changing defaults from small differences.
- **REJECTED:** 16-byte-only cache admission. At doubled capacities (4 GiB shared,
  256 MiB per worker) it timed out at 120.013 s. That policy skips bases larger
  than32, losing early/midgame sharing. A structural support audit finds no
  admitted supports at ply20; this is not a runtime visit-frequency measurement.
  Its host option and four generated workers were removed. Narrow16 key helpers
  remain only for the full-coverage mixed experiment and their exact tests.
- **RESOURCE-CENSORED, never started:** doubling both24-byte capacities requires
  8.25 GiB TT payload plus the preserved2 GiB preflight reserve. Available commit
  headroom was insufficient. No paging/OS configuration changes or forced run.

This establishes24-byte complete keys on7x6, not a complete16-byte encoding.
The current16-byte proof applies only when all higher residual coordinate words
are zero. A different exact representation would be needed to reach16 bytes for
the complete domain; this failed admission policy does not falsify that goal.

All100 dimensions1..10 passed bounded physical transition/key checks,1551 states,
without querying solved outcomes. Other dimensions retain their existing wider
exact layout selected at initialization. **No10x10 full solve was attempted.**
Three separately recorded26-case physical-minimax comparisons passed for full24,
narrow16 and mixed; the oracle was never a runtime input. Publication contention,
all proof tags, offsets, wrap/busy/clone handling and independent inverse checks
also passed. Final producer checks passed465/465 root tests and9/9 targeted tests;
the catalog verifies298 sealed functions +638 add-on units and30/30 blocks.
Fresh read-only review found no outstanding issues after correcting the first
full24 run's source attribution. Review bounds and fixes are recorded in
`evidence/exact-tt-identity-20261006/FINAL-REVIEW.md` in the producer repository.

The initial batch required compact7x6, compiled support plans, native
private/shared caches and one optimized shared bank. The subsequent
[12GiB extension and fresh controls](TWELVE-GIB-RESULT.md) add cold-bound full24
shared banks and record their bounded qualification. Larger production profiles
are not qualified by those tests. Neither production package,
automatic memory policy nor main branch was changed. The frozen production
runtime remains40b19431f00174c5d52c442677d67ec698e8c50a.

## Reproduction

Producer: `iteathen/JSMinSys`, branch `work/isomax-auto-workers-20261006`.
Per-run source identities: the first full24 run uses
`b8d0b8336f8f8cd2326bf510b1db652184aadd5e`; subsequent full24/mixed and native
repeats use `4ddd04c7232ba1af34f8607c984d8789aa0e104c`. The first native control
uses the frozen40b1943 source. The full24 workers and their hot helpers are
unchanged between b8d0b83 and4ddd04c; the library additions support cold factory/
attachment and separate16/mixed functions. Exact per-run identities remain in
each invocation and in comparison.json; these are not all one source revision.
Proof, warrants, independent correctness and generators:
`evidence/exact-tt-identity-20261006/`. Cleanup changes only cold admission,
removes rejected workers/ledger units, and leaves timed full24/mixed workers
byte-identical. The earlier native control uses the unchanged frozen40b1943
worker bodies; subsequent native controls use the same worker bodies. Its600s
deadline differs from the120s campaign safety ceiling; every full-coverage run
finished well below both. Runtime/executable/source hashes are retained per run.

From this Connect4 checkout, with the audited producer worktree at
`C:/r/jsminsys-cpc-rebuild-20261004` and retained runtime path available:

```powershell
& docs/qualification/20261006-exact-tt-identity/run.ps1 -Id fresh-control -Identity native32
& docs/qualification/20261006-exact-tt-identity/run.ps1 -Id fresh24 -Identity partial24
& docs/qualification/20261006-exact-tt-identity/run.ps1 -Id fresh24-shared -Identity partial24 -SharedEntries 268435456
& docs/qualification/20261006-exact-tt-identity/run.ps1 -Id fresh24-private -Identity partial24 -LocalEntries 16777216
& docs/qualification/20261006-exact-tt-identity/run.ps1 -Id fresh-mixed -Identity partialMixed
```

Each run uses a new process, checks memory headroom and absence of another
known solver, preallocates/pins before search, validates after return and commits
raw evidence. This runner is a localhost qualification fixture, not a portable
distribution launcher. Historical rejected16-only replay requires frozen
producer6014152f0a64c448923ab97b5efb8320516bd6cc and the corresponding harness
revision; the current runner deliberately no longer admits that policy.
