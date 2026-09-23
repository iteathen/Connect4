# Production fallback removal

Owner direction: IsoMax must have no production fallback. The recursive native
game-search stack, alternate child expansion, fallback outcome codes/options,
CLI switch and dead search counters were removed. The shared TT/worker/manager
infrastructure and exact RBA four-front machinery remain. Test-only physical
oracles remain independent; production does not import them.

Uncovered queries return INCOMPLETE / QUERY_UNCOVERED (24); construction budget
exhaustion returns INCOMPLETE / BOUNDARY_INCOMPLETE (22). Arena exhaustion remains
FAILED / BOUNDARY_CAPACITY (23). All return null WDL and no move. There is no
automatic retry, alternate search route or timeout increase. General retained
RBA refinement and full-game closure are still missing. This removal does not
implement those missing capabilities or establish a performance improvement.

Validation of implementation commit `ab300587`:

- Three new regressions failed on the old implementation, then passed: uncovered
  1/2/4-worker execution, budget exhaustion, and absence of a fallback stack.
- All 48 tests passed, including exact late-root WDL/move/mirror comparisons,
  independent finite-fiber algebra controls, and executor lifecycle tests.
- Native structural hot-path check: 43 functions, zero detected violations,
  zero open boundaries. This is not a full NEES/JMS runtime/lowering seal.
- Updated cycle harness completed: the covered fixture's prepared complete
  worker/TT/manager closure measured 158,310 median process CPU cycles per
  operation. Whole cold-session medians were 317,894,276 / 492,730,832 /
  880,290,511 cycles at 1/2/4 workers. These fixture results are not full-game
  performance or a multicore scaling claim; each closes through one RBA call.
- All four official Fhourstones inputs now returned QUERY_UNCOVERED and cleaned
  up both threads, with one boundary call and zero published branches or local
  continuations. Whole-operation times were 64.31 / 53.30 / 52.79 / 54.47 ms.
  Still **0/4 solved**. Early rejection is not an improved solve time.

Raw source SHA, host/runtime pins, cycle totals and configuration are retained
in [RBA-only cycle measurements](native-rba-only-cycles.json) and
[Fhourstones outcomes](fhourstones-isomax-rba-only.json), with an
[incremental journal](fhourstones-isomax-rba-only.json.jsonl).
Earlier qualification artifacts are unchanged and describe the removed source
at their recorded revisions.
