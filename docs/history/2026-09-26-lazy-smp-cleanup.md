# Lazy SMP execution cleanup

Owner direction: keep Lazy SMP as the sole active IsoMax execution model and
remove competing implementations/branches while preserving project history.
Connect4 baseline: `7db9b5c3d31d86e7cfee84d02c551a96c892d0cb`.
JSMinSys cleanup: PR #50, merged `93aca1758718bcbf0635c11a957a67ca6387d50c`.

Removed upstream: RBA shared-work TT, RBA BranchManager/worker composition and
old evaluator/publication/reconciliation routines. Cold ingress is extracted
unchanged. Generic library primitives remain; they are not alternate IsoMax
execution modes. Native coordinates/cofactors, CPC, live-line ordering, worker
alpha-beta and exact caches remain. C1 cofactor absorption was already merged
upstream before this cleanup; adopting it is distinct from removal of old code.

Moved obsolete current-state, shared-q/retained-pull designs and the prior
C4-0011 snapshot into `retired-execution/`, with explicit historical labels.
Current agent instructions, C4-0011, status, dependency docs and q_r qualification
now agree with the Lazy SMP decision. Original semantic guards remain; the
Candidate specification status is unchanged. Old measurements were not rescored.
The q_r reporter now reads the actual git revision instead of emitting an old
hard-coded SHA. There is no new solver implementation in Connect4.

Qualification so far: application 11/11 tests; upstream 138/138 tests; independent
upstream review and Linux CI passed. The q_r control passed 134,289 nonterminal
4x4 states and 6,621 sampled standard-board states, with equal key/orbit counts.
The initial local q_r output exposed the old hard-coded report SHA; its output
was not used as exact-head provenance and the reporter was corrected before
the final recorded qualification. No timeout or memory limit was increased.

The history manifest records archived branch tips before deletion. Exact old
source, unique research, failed experiments and qualification lineage remain
recoverable through those immutable archive tags; no experimental result is
silently declared successful. Lazy SMP and generic cofactor candidates are kept.

Local four-worker smoke, input 45461667: EXACT +1, caller move 3, oracle
matched, wall 1056.3568 ms, process CPU 4719 ms, process cycles 17,603,717,519,
all four workers exited and cleanup=true. Winner-only nodes=708,500; this is
not all-worker work, so cycles/node is intentionally not derived from it.
One bounded smoke is not a comparative speedup claim or full Fhourstones score.

Integration: PR166 merged as1522943f; PR163 then merged as0c8824c0,
preserving the eight independently added local benchmark evidence files.
The sole current implementation branch is work/isomax-jsminsys-rebuild. The
former solver/isometric tip1f98d7b15eefdc5cf032f6f6bcb4bb71b51a02b1 is retired
under archive/lazy-smp-retirement-20260926/solver/isometric, preserving the full
older implementation/research lineage. Current verify, q_r and Fhourstones
workflow push routing follows the surviving branch. Archived old experimental
workflow comparisons remain manual/revision-scoped, not production routing.
