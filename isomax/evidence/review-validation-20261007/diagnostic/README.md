# Private recursive-entry diagnostic

The production runtime continues to expose `nodeCounts: null`. This one-off
generator makes a private copy and guards the exact prepared host, lifecycle host
and two selected partial24 worker modules against `source-lock.json`. It verifies
every original package file stayed unchanged after the copy, and records complete
before/after file hashes in the private diagnostic manifest. Only four copied
files change. The copied package is never a replacement distribution.

Each center/live worker increments a local Number once at `negamax` entry.
After ordinary completion or cooperative cancellation, the worker writes one
final count and publication flag and sends one cold message. There are no added
atomic operations, allocations, messages, sampling or shared writes per node.
Entries include cancellation-return invocations; direct root conclusions can have
zero entries. This count does not include every transition, proof evaluation,
cache operation or avoided child. It is not a common work unit across solvers.

Production cleanup immediately terminates peers. The private lifecycle host first
sets the existing STOP flag, allows up to 1000 ms for natural exits, then performs
the existing termination/join. That grace period lets losers unwind and publish
counts. Any missing publication produces null and an incomplete aggregate; no
count is inferred from a winner or extrapolated from a CPU profile. The runner
requires six publications, cleanup and six exits to expose an aggregate.

Instrumentation changes generated machine code and the execution schedule. Its
wall/CPU time and entry rates describe only the diagnostic run and cannot be used
as production performance measurements or as a multiplier for production time.
The all-worker sum describes entries through diagnostic cancellation, including
the brief work between winner publication and STOP. The native solvers retain
their upstream counters, which have different inclusion rules.

```powershell
$evidence = 'docs/qualification/20261007-review-validation'
& $node "$evidence/diagnostic/prepare-diagnostic.mjs" $productionPackage $newPrivateDiagnosticPackage
# Check generated syntax before any diagnostic solve.
& $node --check "$newPrivateDiagnosticPackage/runtime/addons/rba-connect4-prepared-session-host.mjs"
# Run serially after every production/native comparison timing.
$diagnosticPreload=([Uri](Resolve-Path "$newPrivateDiagnosticPackage/runtime/tools/benchmark-v8-startup-preload.mjs").Path).AbsoluteUri
& $node --experimental-ffi --max-inlined-bytecode-size=2400 --max-inlined-bytecode-size-cumulative=9600 --import $diagnosticPreload "$evidence/diagnostic/run-diagnostic.mjs" $newPrivateDiagnosticPackage > "$evidence/diagnostic/empty-board.json"
```

The runner verifies every copied file hash before importing that copy and selects
six workers, partial24 and the explicit 12 GiB memory profile. It inherits the
package's physical-core discovery and verified pinning. The prepared host retains
the existing table initialization and after-readiness root construction. For a
bounded control, append a 1..7 legal history to the runner command. Counts are
unqualified until actual runs confirm publication, WDL, witness and cleanup.
