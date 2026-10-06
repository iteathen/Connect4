# Ply reporting setup qualification

The benchmark now records sampled absolute ply with a separate reporting
worker. It is opt-in (`recordPly: true`), retains all-worker node and process
cycle accounting, and does not modify the production library or dependency pin.

Tested library: `ec6a602268e5dd281db9cb29b2f4defd47c6d325` (clean).
Harness base: `ae77259c`, plus the Windows file-URL launch correction whose
exact source hash is recorded in `manifest.json`. Host: Windows, Intel
i5-12600K, Node 26.7.0. Four search workers and one reporting worker.

## Correctness and cleanup

- Repository tests: 20/20 passed, including four new ply-reporting controls.
- Two OFF/ON ABBA blocks on 45461667: 8/8 EXACT, WDL +1, action 3, clean worker
  joins, valid all-worker counters and complete cycle partitions.
- Empty board, five seconds: clean TIMEOUT, no WDL manufactured, 29,297,275
  visits, four search workers exited, reporting worker joined, no invalid ply
  samples. This was a setup smoke test, not the next five-minute memory test.

## Observer cost

The paired mean change was +0.677% total process cycles, +0.020% solve cycles,
and +0.178% wall time. Reporter startup accounts for additional setup work and
is included in total cycles. The two-block total-cycle descriptive 95% interval
is [-6.96%, +8.31%]; this screen does **not** establish zero overhead or a <1%
bound. Node-counter instrumentation is present in both arms. No production
speed or NEES conformance claim follows from these diagnostic runs.

## Ply capture

During the five-second empty-board smoke test the sampled ranges were:

| Worker | Minimum observed ply | Maximum observed ply | Last observed ply |
|---|---:|---:|---:|
| 0 | 29 | 40 | 38 |
| 1 | 32 | 40 | 37 |
| 2 | 29 | 40 | 39 |
| 3 | 21 | 36 | 35 |

Most captured values were in the late 30s. `timeout-empty.stdout` includes
the complete 43-bin histograms and one-second windows. `timeout-empty.stderr`
contains asynchronous progress captured during execution, so a later failure
does not erase earlier windows. Counts are time samples of the latest eligible
shared-cache probe, not exact visits per ply or complete solved layers. This
demonstrates that the test can expose the depth context missing from the prior
memory comparisons; it does not establish their historical depth distribution.

## Initial setup failure

The first attempt never started the solver: Windows rejected a raw `C:` path
passed to Node `--import` (`ERR_UNSUPPORTED_ESM_URL_SCHEME`). The runner now uses
`pathToFileURL()`. The original manifest and stderr are retained in the adjacent
`../ply-reporting-20260926/` directory. No solver failure or silent retry is
being folded into the passing observations.
