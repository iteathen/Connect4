# Larger shared-TT ROI test

Six automatically discovered, verified pinned i5-12600K P-core workers; 256MiB private TT per worker. Direct empty7x6 solve; no RLC, opening, book, persisted TT or oracle runtime input. Primary timing excludes initialization and cleanup. Retained Node27 nightly/V8 and JIT settings. Production rc.3 package is unchanged.

| Shared TT / implementation | Trials | Primary solve seconds | Mean seconds | Peak RSS GiB |
|---|---:|---|---:|---:|
| 4GiB packaged, unbanked | 2 | 42.791,41.345 | 42.068 | 6.90 |
| 4GiB candidate, unbanked | 1 | 41.157 | 41.157 | 6.96 |
| 4GiB candidate, two2GiB banks | 2 | 43.386,42.627 | 43.007 | 6.98 |
| 8GiB candidate, two4GiB banks | 3 | 42.151,39.822,41.398 | 41.124 | 10.96 |
| 16GiB candidate, four4GiB banks | 0 | Resource-censored | Unknown | Unknown |

Eight completed full solves returned EXACT first-player WIN/column4, verified all six bindings, and joined all six workers cleanly. The banked4 control preserves global capacity/hash-slot mapping and exposes addressing cost. Its mean is about2.2% slower than the packaged4 mean, but samples are sparse. EightGiB reduces the banked4 mean by4.4%; its net mean improvement over packaged4 is2.2%, about0.944s, for about4.07GiB extra peak RSS. EightGiB's best39.822s is a sample, not a promoted baseline. The mean advantage is smaller than the observed1.446s packaged4 range and2.329s banked8 range. Additional paired evidence is needed for a confident speedup claim. The one unbanked candidate control is as fast as the banked8 mean; it is kept separately because the cold support-library source differs.

EightGiB initialization averaged5.067s versus3.843s for packaged4; this is secondary and does not veto a primary improvement. Whole-process CPU/RSS include initialization/cleanup; no solve-only cycles, node or hot diagnostic counters were collected. An external snapshot during the first8GiB solve showed2487MiB available physical RAM, no page output/writes at that instant, and only about0.4GB remaining commit headroom. It is a system-wide snapshot, not a per-process proof of paging absence. A later8GiB admission was5MB short of the conservative budget and did not allocate; a subsequent attempt passed admission and completed. Both records are retained.

SixteenGiB was not attempted: conservative shared16GiB + private1.5GiB + support/runtime2GiB requires19.5GiB free physical and commit headroom. Admission observed14.0GiB physical and11.5GiB commit headroom. No16GiB allocation or search began; this says nothing about its solve speed on a suitably cleared machine. Its executable path is prepared, but full-capacity correctness/performance remains unqualified. Roughly20GiB free physical and commit headroom is needed to continue.

The experimental banks retain native32 records, halfword field accesses, exact injective key checks, seqlock/CAS/wrap/drop rules and proof tags. Extra bank selection is charged in the554-unit producer ledger. Recursive worker bodies and original unbanked hot functions are unchanged; only cold bindings select banked wrappers. All topology/allocation/fill happens before READY. Twenty-two focused checks passed; additional review regressions passed. Independent review found a malformed reporting-plane alias, fixed with offset0/backing12-byte validation before benchmarking banked controls. Bank attachment trusts the factory topology and whole-object clones; it does not authenticate independently forged SAB backing aliases.

Source: banked trials JSMinSys `cbb039926cab14420df284facd3130b331d89074`; initial unbanked candidate `d96303945035617fa1b5bfa56f749ae1c3d2cb0e`; packaged controls frozen `e6580e951c8318395446dd5916482efddc3d33fd`. Exact consumer revisions, invocations, runtime hash, raw output and cleanup evidence are per run. Packaged baseline source metadata was corrected after its first run from the checked-out experimental producer to the actually executed frozen package; timings and sources were unchanged.

Disposition: keep the candidate/evidence for further experiments; do not promote or replace the4GiB default. A worker-to-memory sizing law is still unqualified:8GiB was tested only at six workers,16GiB was resource-censored, and other machines/dimensions are not covered. Reproduce summaries with `node docs/qualification/20261006-large-shared-tt/analyze.mjs`; invoke `run.ps1` with a fresh case ID and explicit capacity as recorded.
