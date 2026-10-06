# Capacity replay

Owner steering: test the space saved by exact partial keys as additional entries,
rather than judging smaller entries only at unchanged capacity. No search,
ordering, tactical, worker or runtime changes in these measurements.

The retained control uses six pinned P-core workers, shared 2^27 and private
2^23 entries, 32 bytes each: 4 GiB shared plus 256 MiB per worker (5.5 GiB TT
payload overall). Initialization and cleanup are separate from empty-board solve.

Declared before their scalar/performance replay:

| Identity | Shared capacity | Private capacity per worker | Total TT payload | Purpose |
| --- | ---: | ---: | ---: | --- |
| native32 | 2^27 | 2^23 | 5.5 GiB | Immediately retained control |
| partial24 | 2^27 | 2^23 | 4.125 GiB | Width/access and footprint control |
| partial24 | 2^28 | 2^24 | 8.25 GiB | Double all entries; preflight resource-censored, not run |
| partial24 | 2^28 | 2^23 | 7.125 GiB | Double shared entries with private count unchanged |
| partial24 | 2^27 | 2^24 | 5.25 GiB | Double private entries within original total TT budget |
| partialMixed | 2^27 narrow + 2^26 wide | 2^23 narrow + 2^22 wide | 4.8125 GiB | Full coverage, 50% additional entries |

The private-double test is declared here before its first run. The other rows
were declared by the original warrants or by the owner-directed capacity replay
before their runs. The mixed result was already observed when writing this
replay document; its original MIXED-WARRANT predates its replay.

Full performance tests are empty 7x6 only. Generic dimensions through 10x10
receive bounded correctness tests, never full-solve performance tests.

Repeat/crossover promising full-coverage cases and control. Keep exact byte
budgets visible: a 6 GiB shared table is not memory-equivalent to a 4 GiB one.
Current power-of-two capacities prevent arbitrary fine-grained byte equality.
Fresh process, fresh preallocated/page-warmed TT, all-ready barrier, same frozen
Node/V8/flags and verified affinity. No unrelated CPU-heavy work during runs.
Existing 120-second individual search ceiling remains. Resource preflight must
retain its physical/commit reserve; do not force paging to complete a test.

Report wall and process CPU time, peak RSS, exact result and worker exits. Native
process-cycle measurements are unavailable in the retained harness. Record
missing cycles as unavailable, never zero. A single best time is not promotion
evidence. Runtime defaults and frozen package remain unchanged during replay.
