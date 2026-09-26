# IsoMax total-cycle optimization campaign

Owner request: plan and start optimization, with full cycle accounting so a
local one-percent saving cannot conceal a larger cost elsewhere.

Baseline: Connect4 afbb8baa2a504790319890d935f641b3e4087e4b;
JSMinSys 93aca1758718bcbf0635c11a957a67ca6387d50c. Four workers, Lazy SMP,
mask 7, local/shared capacity 65,536, native RBA/CPC, exact-only shared evidence.
No BSFP, alternate scheduler, witness weakening or longer solver deadline.

## Measurement contract

The governing unit is the complete native library solve, including cold module
and geometry preparation, root ingress, caches, worker startup, every worker's
work, shared traffic, winner observation and terminate/join cleanup. The harness
also reports process-startup cycles rather than subtracting them invisibly.
QueryProcessCycleTime supplies actual cumulative user+kernel cycles across all
process threads; do not estimate from GHz. The Intel i5-12600K host is not the
catalog's AMD Zen 3 cost profile. Keep static operation envelopes/symbolic costs
separate from measured hardware totals; unknown JIT/memory costs are not zero.

Three disjoint accounting buckets must sum exactly to the cumulative total:
process/bootstrap to first counter read; library import+geometry/setup; solve
through final join. Report CPU milliseconds and wall time alongside cycles.
Post-measurement report formatting/output and the parent campaign controller
are measurement infrastructure, outside the solve; do not hide them as solver
savings. No per-function timers or strings enter production hot paths.

Production winner-only nodes cannot divide all-worker cycles. A separate,
source-guarded loader redirects existing node increments to padded single-writer
slots. It adds no second increment but can change machine code. Measure its
overhead against untouched production. Use uninstrumented runs for acceptance;
instrumented runs diagnose total visits, visits/sec and cycles/visit only, and
must retain their measurement label. Read final slots only after all joins.

Each sample is a fresh process. Paired ABBA blocks on the same host, same inputs,
worker count, capacities and deadline reduce drift. Save every sample, ordering,
source SHA/dirty state, Node/V8/CPU, raw outcomes and exact errors incrementally.
No silent retries, overwritten artifacts or dropped unfavorable samples.

## Acceptance

Exact oracle/WDL and required caller-frame witness, lifecycle and cleanup first.
Compare total process cycles and solve cycles, CPU, wall, work, memory and the
affected operation ledgers. Never sum percentages with different denominators.
A repeatable >1% whole-operation cycle regression on any declared completed
control blocks promotion; a local gain cannot compensate by assertion. Faster
wall time that costs more machine cycles is explicitly a tradeoff, not automatic
acceptance. No hiding a losing workload inside an aggregate average.

Use block-paired ratios and uncertainty intervals. A/A establishes the host's
resolution; noisy or overlapping one-percent results remain unqualified.
Initial four-block screens are not final statistical proof. Promising candidates
need independent repeated confirmation and the wider corpus. Time-bounded
unresolved probes measure progress/throughput, not cost to complete or solve
speedup. Keep total work reduction separate from cost per visit.

## Ordered work

1. Round 0: implement immutable, crash-safe paired harness; qualify accounting
   sum, all-worker counter ownership, exact oracle and cleanup; run A/A and
   measurement-overhead screens on completed Fhourstones input 45461667.
2. C2: compose retained dense cofactor candidate (JSMinSys PR33) with current
   C1 per-player upward-closure absorption. Reuse existing prepared storage;
   preserve sparse/generic geometry, terminal semantics and reflection. Update
   its real operation ledger, differential-test transitions, and test paired
   whole solves against current C1 baseline. Do not cherry-pick the obsolete
   copied body that bypasses absorption.
3. Only after C2: inspect measured cofactor/canonicalization/cache costs for a
   direct, causal next candidate. No broad instrumentation in production.
4. Lower priority: route-8-only shared evidence protection. Prior broad tagging,
   rank heuristics, shared backfill, shifted slots, extra diversity, persistent
   cache and waitAsync variants were rejected or unqualified; do not repeat
   them without a changed hypothesis and an explicit total-cost budget.

Quick screens use four workers and a 30-second ceiling (less than the unchanged
120-second production ceiling). Follow-up completed controls include reflected
roots, late tactical states and route-displacement controls; short hard/empty
probes are separate progress evidence. Full standard four-input Fhourstones
qualification is a later confirmation burden, never manufactured from timeouts.

## Persistence and integration

Implementation/measurement infrastructure belongs to the active IsoMax lane;
generic hot changes belong in JSMinSys. Canonical findings, rejected candidates
and raw research samples belong here on research/semantic-quotient. Commit a
coherent harness before running; commit a candidate before measurement; retain
failed screens. Independent review and exact-head qualification precede any
production promotion. Starting this campaign does not claim an optimization win.

Evidence read: NEES Draft 0.5 COST_ACCOUNTING; current JSMinSys spec/profile and
cycle ledger; September 25 all-leads final report; route-8-only plan 0.9; September
26 PR review (C1/C2 interaction) and Lazy SMP cleanup. Research guides hypotheses,
not automatic applicability to the current revision.
