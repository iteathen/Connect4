# Fast optimization campaign

Owner: Connect4 research/semantic-quotient. Implementation owner: JSMinSys main.
Baseline JSMinSys: 04d37498607ace16dae33c79462ddfe1503c8a0d.
Temporary implementation branch: perf/rba-closure-absorption-20260926.

Start with C1 only. Preserve native representation, selected library helpers,
terminal rules, separate player coordinates, supported geometry and witnesses.
No extra state or production instrumentation. C2/C3 remain queued independently.

Fast gate: principal-upset work regression (baseline 3 expansions instead of 1),
existing subsecond coordinate/CPC/Lazy-SMP tests, then native-child differential
checks, catalog/geometry/full unit checks and short interleaved four-worker
whole-operation A/B. Any slower candidate is rejected, not rescued by its lower
operation count. A microbenchmark is diagnostic, not the promotion boundary.

Measurement: Windows QueryProcessCycleTime on Node26.7.0, actual aggregate
process cycles, no nominal-GHz conversion. Fresh Node process/session per solve,
four workers, unchanged mask7/cache65536/CPC-only settings, 5-second safety cap
for quick solved controls. No full120-second benchmark in this fast screen.
Warm transition microbench and traces run separately from timing samples.
NEES live main7650bef (Draft0.5) governs affected-scope review; source-cost
unknowns remain symbolic, runtime traces and whole-operation totals are evidence.
Do not claim full new system conformance from tests or counter reductions alone.

Persist exact implementation candidates, checks, measurements and dispositions.
Promote no candidate solely because fewer nodes/operations are observed.
