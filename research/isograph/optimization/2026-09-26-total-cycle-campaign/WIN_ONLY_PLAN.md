# Owner-requested CPC win-only screen

Hypothesis: removing predictive CPC draw/loss analysis costs fewer total cycles
despite allowing more native RBA search. This candidate takes priority over C2.

Control JSMinSys: 93aca1758718bcbf0635c11a957a67ca6387d50c.
Candidate: experiment/cpc-win-only-20260926 at 3574cb3. Durable owner is JSMinSys
main; this experiment is not promoted production and does not change its pin.
Harness: Connect4 work/isomax-cycle-campaign-20260926 at 7a1a4166.

Replace evaluateConnect4CpcNonterminal32 with mover-playable-singleton detection
only. Otherwise return CPC_NONE with full [1,3] interval and cleared restrictions.
No response bounds, exhaustion closure, opponent-threat/forced-loss analysis,
forced blocks, fork preemption or advisory scans. Keep RBA first-win/full-board
terminal handling, exact TT, live-line ordering, four-worker Lazy SMP, geometry,
capacities and sampling unchanged. No strings or allocations added in the hot
detector. Existing prepared scratch/caller code remains charged, not declared free.

Nine selected candidate, independent physical-oracle, ordering and Lazy SMP
checks passed. Catalog and runtime geometry checks passed. Historical tests that
require the deliberately removed deductions are not candidate acceptance tests;
this is not a claim of the unchanged full suite passing or final NEES approval.

Run production ABBA on 45461667, four blocks if completed, 30-second ceiling.
Preserve timeout/failure rather than extending limits or dropping samples. A
completed-control timeout is decisive negative screening evidence but is not a
completed solve speed ratio. Use separate instrumentation for all-worker visits
if needed to explain outcome, with overhead caveat from round 0. No winner-node
denominator for all-thread cycle accounting.
