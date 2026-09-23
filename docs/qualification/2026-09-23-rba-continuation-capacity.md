# RBA continuation: first whole-solver boundary

At `c45e9f49`, all 57 tests pass and the native structural audit has 45 functions,
no forbidden operations and no open execution call boundary. Whole Fhourstones
qualification now traverses RBA q dependencies, rather than returning after one
query. It reaches fixed shared-TT capacity (error 1) on all four inputs.

| Input | Claims | Branches | RBA boundary closures | Transitions | TT hits | Peak live q |
|---|---:|---:|---:|---:|---:|---:|
| 45461667 | 1657 | 1556 | 98 | 5180 | 320 | 4096 |
| 35333571 | 1436 | 1390 | 45 | 4678 | 374 | 4096 |
| 13333111 | 1375 | 1317 | 57 | 4781 | 383 | 4096 |
| empty | 1179 | 1137 | 41 | 4723 | 338 | 4096 |

All return null WDL and clean up. No geometry replay, alternate solver, arena
failure or timeout increase. [Raw evidence](fhourstones-rba-continuation.json)
includes CPU cycles and the larger fixed table (2,506,840 bytes). Basis insertion
writes are explicitly counted; carried derived basis is not claimed free.

Measured fixed-fixture cofactor cycles fell from 2,983.76 to 2,434.01 and prepared
whole closure from 156,881.69 to 153,921.10 after incremental basis work. These
are noninterleaved observations on one fixture, not a universal speedup claim.
See [before](rba-continuation-before-incremental-basis.json) and
[after](rba-continuation-incremental-basis.json).

Next testable mechanism: FIFO queue admission broadens the unresolved frontier
after retained-first-child execution. Test newest-frontier-first scheduling with
reverse action insertion to preserve local ranking, under unchanged capacity.
This changes work order only, not RBA identity, bounds or semantic value.
