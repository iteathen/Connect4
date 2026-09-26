# Doubled-memory follow-up

Owner requested one additional five-minute empty-board probe at double the
previous larger allocation, then publication. Exactly one run: four workers,
2,097,152 shared entries and 2,097,152 private entries per worker, mask7,
300-second solver deadline. Cache backing allocation 616 MiB + 12 bytes.
The requested allocation supersedes the earlier 512MiB screen budget for this
run; maintain 4GiB free-RAM admission. No retry or extra baseline run.

Use identical sample and all-worker loader to previous five-minute probes.
Harness 3a41a2fc only raises cold validation bound; solver remains clean
JSMinSys ec6a602268e5dd281db9cb29b2f4defd47c6d325. No library, BSFP, production
configuration or move-order edits. Harness tests 16/16 pass.

Compare to published empty-five-minute/large.json and baseline.json.
Report node throughput, cycles/visit, total cycles, sampled RSS, result and
cleanup. A single sequential observation per size can suggest curvature or
saturation but cannot establish a linear scaling law or solve-time improvement.
Do not equate more visited nodes with more solved proof.
