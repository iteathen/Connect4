# Native RBA solver qualification

Tested implementation: `203235120967f8958a19941c0209cd49aaf68bd2`.
Branch: `work/isomax-jsminsys-rebuild`. Node 26.7.0 / V8 14.6.202.34-node.28;
Windows x64, Intel Core i5-12600K. JSMinSys
`64ba37a11522b533a1de87942a14921fe690ef86`; NEES Draft 0.5
`7650bef0aecc0d2b226ecf253a1f8937ccf89d69`.

## Implemented

- Standard-7x6 stable 625-shape vocabulary with deterministic support-local
  upset coordinates (at most 69 bits/player), terminal-extended cofactors,
  support-first reflection and eight-word exact TT payload.
- Worker-private bounded four-front producer in fixed P0 polarity. Principal
  covers and right adjoints preserve terminal top; alternating streamed
  union/intersection preserves mixed reply covers and paired correlation.
- Action fronts, exact lower/upper query closure and caller-frame root ties.
- Shared worker/TT/manager integration. Uncovered/incomplete/capacity outcomes
  are numeric and explicit. The selected fallback enumerates these same native
  RBA coordinates; no conventional-board reconstruction or private second TT.
- Arena ownership swaps replace boundary-payload copies. Every prepared region
  retains one owner. There are no compatibility shims for the replaced ABI.
- Enclosing worker/manager loops and all native callees are included in the
  structural detector. Hot strings, string conversion, dynamic aggregates,
  copying APIs and allocation are rejected. No character data is currently
  necessary; future hot character data must use indexed numeric storage.
- Cold Node input-mode repair: stdin/eval-only `--input-type` is not passed to
  file workers. Otherwise Node retains its default option inheritance/filtering.

## Semantic and execution controls

`npm test`: **45 passed, 0 failed**. Tests include independent physical-line
residual reconstruction through 32 seeded legal games; reflection; first-win
stopping; >64-bit coordinates; exact TT collisions/generations/pins; capacity,
abort/death/deadline; native WDL and deterministic moves at 1/2/4 workers; genuine
losing branches under retained fallback/surplus; explicit incomplete outcomes;
and a complete-horizon front-only solve with zero fallback nodes.

Four-front tests compare bounded endpoint propagation against an independent
physical oracle, and enumerate every upset pair on three complete small fibers
with two, three and four remaining cells. The independent residual-array game
checks early completion before later replies. Streamed product and capacity
tests distinguish absorption from an incomparable overflow. These controls
are bounded evidence, not an exhaustive proof over standard Connect Four.

`node tools/check-hot-scope.mjs --native-rba`: **43 functions, zero reported
violations, zero open bindings**. Negative tests catch both transitive allocation
and transitive strings. This is a structural check, not full V8 type/lowering
verification or a JMS-SEALED / NEES-EXTREME certification.

## Total CPU-cycle measurements

Reproduce with:

```sh
node --experimental-ffi tools/bench-isomax-cycles.mjs
```

The cold measurement utility uses Windows `QueryProcessCycleTime`, summing all
process threads' user and kernel cycles. It performs no solver computation and
is never called per native node. Raw data:
[`native-rba-cycles.json`](native-rba-cycles.json). Source was clean at measurement.
The complete operation includes transitive helpers, branch tests, memory and
synchronization costs actually executed; no guessed per-source-operator latency
or nominal-GHz conversion is used. A numeric total for this measured scenario
does not supply a closed analytical formula for every possible path.

Seven batches per hot operation, with result consumption and prior warmup:

| Prepared operation on the recorded 32-ply root | Median measured cycles/operation |
|---|---:|
| Support-local basis | 766 |
| Cofactor, including child basis | 3,064 |
| Canonicalization (primary early-return path here) | 76 |
| Two-ply four-front construction | 155,988 |
| Four-front query | 163 |
| Complete worker + TT + manager closure, including rearm | **154,310** |
| Same complete prepared operation, boundary-depth-zero fallback control | **410,932** |

The complete prepared boundary path consumed about **62.4% fewer cycles** on
this fixture and eliminated all **248 fallback entries / 247 transitions**.
Do not add the helper medians to the complete total: that double-counts work.
Warmup/JIT state, callbacks, batch loops and process background activity affect
the raw readings. The empty batch control is about 85 cycles/iteration; it is
reported rather than subtracted as an assumed universal overhead.

Five real threaded cold sessions per configuration, including legal ingress,
preparation, thread startup and cleanup:

| Workers | Two-ply boundary total cycles | Total wall ms | Fallback-control total cycles | Total wall ms |
|---:|---:|---:|---:|---:|
| 1 | 336,485,720 | 55.35 | 297,417,072 | 47.80 |
| 2 | 492,539,170 | 50.92 | 483,922,045 | 50.00 |
| 4 | 888,316,788 | 54.18 | 926,678,804 | 55.66 |

All 30 sessions matched the independent oracle (`rootWdl=-1`, including its
selected move). This small root closes before parallel workers have useful
work in the boundary configuration. Startup/preparation dominates. These data
do **not** establish overall solve-speed superiority or multicore scaling.

The earlier exact-source baseline is retained as
[`native-rba-cycles-before-arena-transfer.json`](native-rba-cycles-before-arena-transfer.json).
Prepared closure changed from 162,969 to 154,310 cycles after ownership swaps;
this sequential observation is not an interleaved statistical performance claim.

## Empty-root bounded execution

[`native-rba-empty-bounded.json`](native-rba-empty-bounded.json) preserves the
uninstrumented control and final measured run. With one worker and a 1,000 ms
solver deadline, final execution returned TIMEOUT, no runtime errors,
`rootWdl=null`, and all threads cleaned up. It recorded **2,496,149 fallback
entries**, 2,496,148 transitions, and **4,074,793,007 total process CPU cycles**.
Session time including cleanup was 1,015.93 ms. Periodic numeric telemetry is
sampled at control boundaries and can lag the last interrupted work.

This was an explicit short deadline qualification, **not an empty-board solve**.
The existing maximum solver timeout remains 120 seconds. No limits were raised.

## Remaining qualification limits

The symbolic producer is bounded (default two plies, 256 generators/front,
100,000 construction-work steps). It is not an unbounded empty-root boundary
synthesizer. Exhausted construction may select the explicitly enabled exact
native fallback; `allowFallback:false` fails without a fabricated WDL.

Actual CPU-cycle totals are now measured. The separate NEES analytical ledger
still contains explicit V8 lowering, cache/coherence, call and wait terms;
these were not assigned invented constants. Full NEES-EXTREME/JMS-SEALED
certification, broad performance tuning and empty-board completion are not
claimed by this implementation checkpoint.
