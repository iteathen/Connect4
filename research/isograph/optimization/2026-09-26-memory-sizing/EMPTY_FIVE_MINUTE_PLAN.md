# Owner-authorized two-run empty-board memory check

Exactly two sequential runs: 64K shared/64K private per worker, then 1M/1M.
Four workers, mask7, empty board, 300-second solver deadline per run.
No retries, no other capacity arms. User explicitly superseded the former
128-run screen and 120-second benchmark limit for these two five-minute probes.
Public solve7x6 policy, JSMinSys and BSFP remain unchanged.

Harness 53b3fe70; JSMinSys ec6a602268e5dd281db9cb29b2f4defd47c6d325.
All-worker node-counter loader enabled identically on both. Cycles are whole
process/all threads. Main-thread progress and RSS are logged every 30 seconds.
These are instrumented diagnostics, not directly comparable to earlier
uninstrumented timings. Larger backing caches total 308 MiB+12 bytes versus
19.25 MiB+12 bytes. 4GiB free-RAM admission; source cleanliness verified.

One observation per configuration cannot establish statistical significance.
On timeouts compare nodes/sec and cycles/visit, but do not call more visits
better solve progress: a larger TT may legitimately reduce visits. Only exact
completion establishes solve speed; otherwise retain result as bounded evidence.
