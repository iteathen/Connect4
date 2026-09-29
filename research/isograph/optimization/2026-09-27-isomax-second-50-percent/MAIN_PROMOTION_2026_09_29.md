# IsoMax selected runtime promoted to JSMinSys main

Owner request: update the repository with the best performing retained IsoMax version, review the PR, and merge to main.

JSMinSys [PR #119](https://github.com/iteathen/JSMinSys/pull/119) merged as **0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb**. This focused promotion uses selected runtime **6bbba7c71c60afb1018a22b6d5c03f495f5d2c9e** and the cold accounting/profile snapshot **c55a2ebad560a239cc2572a8214ec8f670410783**. It does not merge the accumulated experimental branches or PR #84.

## Retained implementation

Full-q hash reuse; compact lossless shared/private identity; packed private epoch/value tags; packed recursive move-order rows; private LOWER0/UPPER0 and same-q coalescing; exact-only shared cache; native Lazy SMP root-frontier worker; startup affinity; large shared-buffer view restoration. Selected src/addons/tools/test blobs were verified identical across 84 files. The K versus STOP_TEST and cold Number-multiply accounting corrections are included.

Rejected proof-mask, pending redundant CPC-check removal, support-neutral experiments, Stage-9 support plans and strategist work are excluded. No solved outcomes are introduced. Current CPC interval semantics remain intact.

## Profile and qualification scope

Owner-selected localhost profile: Windows i5-12600K, Node v27.0.0-nightly20260928b59840b593; four pinned P-cores, worker 0 wide and workers 1..3 deep; full sharing; 268435456 shared entries (10 GiB), 16777216 private entries per worker (576 MiB).

This is the retained qualified runtime plus a hardware-specific measured profile selection. The singleton private-memory curve does not establish a universal optimum. Prior paired optimization results keep their own denominators and are not summed into an invented cumulative speedup.

## Review and fresh confirmation

Independent focused source review found no critical/important defect; 33 focused tests and generation checks passed. Full local verification: 180 tests on Node 26.7 and 180 on the pinned nightly; 298 catalog functions, 170 add-on units, 30/30 blocks; generator, frontier, geometry, schema and syntax checks passed. Final PR-head Verify [36533571397](https://github.com/iteathen/JSMinSys/actions/runs/36533571397) passed all three required jobs.

Fresh clean source e7ab2138e2bf1fce59687adf4ac6aa5bab49235b, standard 7x6 fixture 35333571, unchanged profile and 120000 ms ceiling:

- EXACT, rootWdl -1, zero-based move 4, matching qualified evidence.
- 33.324750 seconds wall; 132.751 seconds process CPU.
- 487526972082 process solve cycles; 59293601 nodes; 8222.253 cycles/node.
- Worker nodes [11256819,16027014,15963459,16046309]; all four contributed.
- Shared hits 7292424; stores 19707412; contention 1444797.
- Peak RSS 12824293376 bytes; all workers exited; cleanup true; no errors.

This is an integration confirmation, not a paired improvement claim or an empty-board solve.

Raw evidence, source manifest, affinity reports, review scope and reproduction command are committed in [JSMinSys main evidence](https://github.com/iteathen/JSMinSys/tree/0899c5811918e68c22dc1b0e4dd8af97d9b4bbcb/evidence/isomax-selected-promotion-20260929). Review: [PR comment](https://github.com/iteathen/JSMinSys/pull/119#issuecomment-5885249565).

Disposition: promoted at the owner's request following review and green checks. Future optimization continues from this retained runtime; historical negative evidence remains unchanged.
