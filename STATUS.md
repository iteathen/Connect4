# Connect4 Semantic-Quotient Research Status

**Updated:** 2026-09-11  
**Canonical branch:** `research/semantic-quotient`  
**State:** quotient-native exactness and proof-work compression qualified; forward wall-clock speedup not yet qualified

## Mission

Find the smallest exact, efficiently updatable description of the remaining Connect Four game and determine which forward/backward exact reasoning forms exploit it best. This branch owns solver-neutral semantic and comparative research, not production solver implementation.

Product lanes remain:

- preserved historical `solver/minimax-alpha-beta`;
- `solver/cuda-bsfp`;
- `solver/hybrid-confluence`;
- future forward solver generation only after the quotient-native kernel passes the performance gate.

## Exact relational identity

Logical state:

```text
q = supportIndex
  + sideToMove
  + normalized P0 residual requirements
  + normalized P1 residual requirements
```

For ordinary legal Connect Four, `sideToMove` is derivable from support-rank parity.

SIU-1 checked 1,681,808 complete-control physical states with zero projection, transition, terminal, strong-score, per-action-score, BSFP W/D/L, or reverse-closure mismatches.

Common algebra:

```text
forward:  T(q,a) -> q' | terminal
backward: Pre_a(Q) -> exact predecessor set/frontier
hybrid:   exact W/D/L or sound proof facts keyed by q
```

State-level inverse transition is intentionally set-valued; reversibility is not required.

## Quotient-native machine state

The current forward research kernel is genuinely quotient-native:

```text
qID -> supportIndex + p0ResidualClassId + p1ResidualClassId
sideToMove = rank(supportIndex) & 1
```

Timed search carries numeric quotient IDs only. Residual masks use two `u32` lanes. No recursive colored-board identity, BigInt residual state, string key, or precompiled game DAG is used in the timed kernel.

Complete reachable quotient census reproduced SIU-1 exactly:

| Geometry | reachable q states |
| --- | ---: |
| 4x3 c3 | 3,735 |
| 4x4 c4 | 34,095 |
| 5x3 c4 | 11,317 |
| 4x5 c4 | 294,593 |

Root and every legal root-action W/D/L matched the independent BSFP oracle. The compiled two-u32 residual transition algebra was independently checked against the qualified BigInt reference with zero mismatches.

Authority:

- `state-identity-unification/QUOTIENT_NATIVE_NEGAMAX_RESULT.md`
- run `34646025717`, job `103416896894`
- refinement run `34646180590`, job `103417404214`

## Native physical-economics campaigns

### ETC and edge caching

Precompiled-DAG ETC did not transfer directly once child quotient construction became real work.

4x5:

```text
no edge cache / no ETC: 15,054 expansions, ~18.5 ms
forcing ETC:            10,530 expansions, ~24.5 ms
```

Speculative child construction for ETC is rejected as a default. A full `state × columns` quotient-edge cache is also rejected for the larger control.

A one-child best/refutation witness was qualified and can obtain exact ETC cutoffs without speculative child construction, but it still lost slightly on 4x5 and remains conditional.

Authority:

- `QUOTIENT_BEST_CHILD_RESULT.md`
- run `34646887500`, job `103419703662`

### Residual-class transition cache shape

Dense residual-class transitions remain the current **speed** baseline on 4x5 even though occupancy is sparse.

4x5:

```text
dense:   18.420 ms, 1,844,704 B typed lower bound
sparse:  21.825 ms,   828,896 B
direct8: 22.531 ms,   861,664 B
none:    24.806 ms,   533,984 B
```

Do not trade wall-clock away merely to reduce table footprint unless 7x6 scale makes memory pressure dominant.

Authority:

- `QUOTIENT_CLASS_CACHE_RESULT.md`
- run `34646665677`, job `103418974713`

## Native driver tournament

With the same quotient representation and transition machinery, the governing 4x5 control favored **full-window W/D/L fail-soft Negamax**.

```text
full-window: 18.759 ms, 15,054 expansions
threshold:   19.111 ms, 15,159 expansions
MTD(f):      19.282 ms, 15,058 expansions
PVS:         19.706 ms, 15,062 expansions
```

Witness-composed variants reduced some proof work but still lost wall-clock and used more memory.

Current native driver:

```text
W/D/L-native fail-soft full-window Negamax
```

PVS, MTD(f), threshold and witness-only ETC remain conditional and should not be reopened unless the transition/TT/hardware cost model materially changes.

Authority:

- `QUOTIENT_NATIVE_DRIVER_RESULT.md`
- run `34647110759`, job `103420431514`

## Equal-byte quotient versus exact physical W/D/L control

The governing physical control is purpose-built for fairness rather than inherited from the legacy incumbent:

```text
physical state = supportIndex + exact P0 ownership bitmask
P1 = support universe - P0
```

It uses the same W/D/L fail-soft full-window contract, same tactical closure, same TT-best/center-first order, exact physical key equality, and a bounded 4-way exact-key TT. Physical typed arrays must fit below the quotient solver's isolated root-only typed-array footprint.

Governing run: `34647777241`, job `103422562204`.

### 4x5 c4

```text
root-only typed-memory budget: 1,844,704 B

quotient:
  16.697 ms
  15,054 expansions
  24,882 calls

physical:
  15.804 ms
  36,826 expansions
  51,924 calls
  1,745,668 typed bytes
  131,072 TT slots
  519 replacements
```

So the quotient performs **~59.1% fewer expansions** but is still **~5.7% slower wall-clock**.

### Other complete controls

```text
5x3 c4: quotient 0.838 ms vs physical 2.041 ms  -> quotient win
4x4 c4: quotient 7.436 ms vs physical 4.368 ms  -> physical win
```

The exact conclusion is therefore:

```text
semantic exactness:          qualified
proof-work compression:      qualified
consistent wall-clock win:   NOT YET qualified
```

The quotient is doing dramatically less proof work. The remaining deficit is cost per quotient expansion.

Authority:

- `state-identity-unification/QUOTIENT_VS_PHYSICAL_WDL_RESULT.md`
- `state-identity-unification/evidence/2026-09-11-quotient-vs-physical-wdl.json`
- governing Actions run `34647777241`, job `103422562204`

Earlier v1/v2 comparison runs are non-authoritative harness history.

## Current next seam

Do **not** start another search-method campaign. The next evidence unit is direct hot-path transition/interner optimization.

Target:

```text
T(q,a)
  = residual-class update
  + residual canonicalization / class intern
  + quotient-state intern
```

Measure and reduce:

1. residual normalization work on transition misses;
2. residual-class hash/probe/equality cost;
3. quotient-state hash/probe/equality cost;
4. transient arrays/copies during residual reduction;
5. dynamic JS-array metadata behind canonical residual classes;
6. duplicate transition recomputation without restoring a costly full edge table.

The desired organic result is to preserve the quotient's ~59% 4x5 proof-work reduction while cutting enough per-transition cost to cross the wall-clock break-even point.

Only after that seam stabilizes should research move to reflection/residual automorphism, compiled local proof masks, proof-cost ordering, standard 7x6 scale, and actual BSFP-boundary composition.

## Hard non-claims

- no standard 7x6 production performance claim;
- no quotient forward speedup claim yet;
- typed-array accounting is not complete JS heap accounting;
- no final claim that dense class-transition storage is optimal at 7x6 scale;
- no default ETC claim on the native kernel;
- no end-to-end hybrid speedup claim until actual BSFP build/publication/query cost is included.
