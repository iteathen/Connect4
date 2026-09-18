# CPU attribution to frozen source lines

Research direction / architecture: Josh Oshiro

Implementation / qualification: OpenAI ChatGPT

The owner requires CPU timing mapped to code lines. The previous report exposed
method timing and raw line ticks but did not present CPU estimates beside each
line. Its links also targeted mutable working-tree files. This is a measurement
and evidence defect; no solver semantics changed in this unit.

`quotient-bounded-line-profile.mjs` now wraps the existing normal bounded search.
It captures source before execution, runs the existing externally timed child,
checks source bytes afterward, verifies every result/search/proof counter against
the supplied baseline, and writes a line report with frozen source copies and
SHA-256 hashes. It refuses to overwrite an evidence directory. Reporting occurs
after search; there are no new per-node timers or engine operations.

Each row records function, frozen file/line, code, raw position ticks and estimated
CPU milliseconds. The explicit estimator is:

`process CPU ms * line position ticks / sum(profile node hitCount)`.

This assumes profiler samples represent CPU distribution. It does not supply
exact per-line timestamps or invocation durations. Process CPU includes runtime
and possibly background work. Runtime/unmapped hits retain an unassigned share;
function and line totals overlap. JIT inlining and call-site placement remain
attribution limits. Aggregate node hits differ slightly from timestamped sample
arrays at profiler boundaries, so the report retains both counts and uses the
aggregate hit denominator matching aggregate position ticks. These meanings
follow the [V8 Inspector profiler contract](https://chromedevtools.github.io/devtools-protocol/tot/Profiler/#type-PositionTickInfo).

The unchanged engine ran once on the empty 7-column, 6-row board, connect-4,
depth 8, with the existing 60-second kill timer. Search took 10763.457 ms and
process CPU 10688 ms. The report contains 537 mapped locations and 6829 aggregate
hits. All bounded result and search/proof/descriptor counters match the earlier
unprofiled candidate. Report generation checks tick conservation, source-line
bounds and source stability. No matching test process remained. No full root or
remote workflow was run. This local diagnostic wrapper does not change CI or
claim performance improvement; engine qualification remains as previously recorded.

[Full line report](evidence/2026-09-12-direct-residual-line-cpu/line-cpu.md),
[machine-readable attribution and source hashes](evidence/2026-09-12-direct-residual-line-cpu/line-cpu.json),
and the raw profile/result are retained together.

From the repository root, use the local Node executable with:

```text
node research/semantic-quotient/state-identity-unification/src/quotient-bounded-line-profile.mjs NEW_OUTPUT_DIRECTORY BASELINE_RESULT_JSON --columns 7 --rows 6 --depth 8 --timeout-ms 60000
```

Geometry remains an input to the existing initialization owner. Next owner is a
matched before/after comparison using this same attribution method, followed by
analysis of class/event reuse. No causal speedup claim follows from this one run.
