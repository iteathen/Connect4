# Owner-requested CPC win/loss without predictive draw screen

Restore current CPC tactical losses, immediate wins, forced blocks and fork
preemption. Remove residual-exhaustion scanning and its no-win bounds, plus
long-range response no-win bounds. These are not all exact-draw results: some
normally narrow WDL to a two-value interval. This scope is stated explicitly
rather than labelling all bound work as a draw test. First-win and full-board
terminal handling remain unchanged in RBA. No independent terminal draw test is
removed, no other solver representation introduced.

Baseline JSMinSys main 93aca1758718bcbf0635c11a957a67ca6387d50c.
Candidate branch experiment/cpc-no-draw-20260926; exact tested revision pinned
in the pre-launch manifests. Durable owner is JSMinSys main; not promoted.
Harness Connect4 7a1a41665d3f5b1a679c16598d60ae3d1035706d.

Fifteen selected tests passed: absence of predictive draw/bounds, retained
tactical losses/forks/first-win ordering, independent small and late 7x6 exact
oracles, move ordering, and Lazy SMP controls. Catalog and geometry audit pass.
Tests requiring deliberately removed deductions are not acceptance tests for
this ablation; no full-suite/final NEES claim. The ledger removes unreachable
scan/call costs but conservatively retains existing fixed dispatch envelope.
Actual all-thread process-cycle measurement remains decisive.

Same control as prior experiment: 45461667, four workers, mask 7, 65,536-entry
local/shared caches, 30-second limit. Four ABBA blocks of uninstrumented fresh
processes. Follow with one separate diagnostic ABBA block of all-worker node
counts. Preserve failures, no silent retries or time extensions. Compare with
full CPC measured in the same blocks, not the previous turn's older timings.
