# IsoMax-only tooling cleanup

The public solver and CLI contain no unused local evaluator, worker, manager or
TT implementation: they delegate to the pinned library. JSMinSys (including its
gitlink) and BSFP were not changed. Move ordering was not changed.

Removed frozen experiment workflows that explicitly checked out historical
JSMinSys revisions rather than the repository pin. Original workflow bodies and
results remain recoverable from parent 7a1a41665d3f5b1a679c16598d60ae3d1035706d
and the canonical research branch. This does not rewrite historical results.

Removed three experiment-only runners: diagnosticSampleMask, diagnosticLeverage
and externally supplied sharedExactCache are not inputs of the pinned host.
Their current invocation silently ignored the requested experimental behavior.
No compatibility wrappers or replacement diagnostic implementations were added.

Removed paths:

- .github/workflows/isomax-cofactor-ab.yml
- .github/workflows/isomax-cofactor-cpu-census.yml
- .github/workflows/isomax-lazy-smp-ab.yml
- .github/workflows/isomax-lazy-smp-capacity-ab.yml
- .github/workflows/isomax-lazy-smp-capacity.yml
- .github/workflows/isomax-lazy-smp-density.yml
- .github/workflows/isomax-lazy-smp-empty-ab.yml
- .github/workflows/isomax-lazy-smp-empty-capacity-ab.yml
- .github/workflows/isomax-lazy-smp-hard.yml
- .github/workflows/isomax-lazy-smp-lead-ab.yml
- .github/workflows/isomax-lazy-smp-lead-census.yml
- .github/workflows/isomax-lazy-smp-leverage-census.yml
- .github/workflows/isomax-lazy-smp-remaining-leads.yml
- .github/workflows/isomax-lazy-smp-shifted-slot-hard.yml
- .github/workflows/isomax-priority-sharing-ab.yml
- .github/workflows/isomax-rank39-sharing-ab.yml
- tools/bench-lazy-smp-persistence.mjs
- tools/bench-lazy-smp-lead-census.mjs
- tools/bench-lazy-smp-leverage.mjs

Retained: public adapter/CLI, Fhourstones and bounded capacity/control runners,
current dependency verification, CPU profile summarization, whole-process cycle
measurement and separate all-worker node diagnostics. The post-DONE fault probe
still exercises supported managed-session APIs and is not dead code.

Historical evidence and research are not unused executable code and remain.

Validation: 13/13 Connect4 tests pass; 19 retained JavaScript modules pass
syntax checks; retained IsoMax workflow tool references resolve; no references
to removed diagnostic runners remain in active tools/tests/workflows. The named
function reference scan found an unused residuals() oracle helper; it was removed,
and internal lines()/position() helpers are no longer exported.
This is a scoped audit, not a formal proof of absence of all unreachable code.
