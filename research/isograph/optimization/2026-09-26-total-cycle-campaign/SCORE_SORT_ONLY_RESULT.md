# Score-only sort, no additional ordering policy

Owner requested testing score-only sorting and taking its first entry.
Candidate: e016360d9c8d20aae5dace5b6d735e37975cc4c9. Baseline: 49f88b2b0cd45ae427f43ceece568a4895953e5f.
Harness: 7a1a41665d3f5b1a679c16598d60ae3d1035706d.

## Candidate

The existing descending live-line insertion sort is unchanged. Default input columns
are enumerated 0..6; equal scores remain in incidental input order without a
secondary comparator or extra tie pass. Cold center preordering and the worker-index
rotation override are removed. CPC exact proofs, action restrictions, forced
transit, live-line evaluator and caching remain unchanged. This combines the two
previously isolated policy changes, not the earlier CPC-filter-off variant.
Root retains its existing score-only maximum selection. No new generic JS sort,
allocation, strings, or random tie selection was introduced into hot execution.

## Results

Windows i5-12600K, Node 26.7.0, four workers, position 45461667.
Four ABBA blocks / 16 fresh-process samples, uninstrumented production cycle
measurement. Same mask 7, caches 65536, timeout 30s. No concurrent performance tests.

- Total process cycles: **+53.71%**, descriptive 95% interval **[+49.32%, +58.11%]**.
- Solve cycles: +54.45%.
- Wall time: **+59.14%**, interval [+54.08%, +64.20%].
- All 16 results EXACT, rootWdl=1, move=3, clean worker shutdown.
- Every bootstrap + setup + solve cycle sum reconciles exactly.
- Aggregate node instrumentation disabled; winner nodes are not total nodes.

Arithmetic arm means (delta above uses mean paired block ratios):

[
  {
    "arm": "A",
    "cycles": 16909352282.5,
    "ms": 1030.077475
  },
  {
    "arm": "B",
    "cycles": 25990366950.625,
    "ms": 1639.1996375000003
  }
]

## Qualification limits

New guards failed on baseline then passed on candidate. Targeted run: 23/24 pass.
Documented full command node --test test/*.test.mjs: 143/144 pass. Failure:
CPC pooled-frontier response extends all-even pairing without counting omitted frontiers
(test/cpc-alphabeta.test.mjs:119, 0 !== 2). Reproduced unchanged on baseline.
No full-green or final NEES qualification claim. Catalog: 297 sealed functions /
114 add-on units verified. Ledger conservatively retains removed cold work costs.
Initial bare node --test also incorrectly discovered the managed-host-worker fixture
as a standalone test; initial output is preserved. Correct repository glob excludes it.

This single-position screen rejects promotion on current evidence. It does not
prove which interactions cause the extra work or generalize to the whole suite.
No production pin changed. Raw manifests, process outputs, samples, summaries and
test logs are in score-sort-only-production/.
