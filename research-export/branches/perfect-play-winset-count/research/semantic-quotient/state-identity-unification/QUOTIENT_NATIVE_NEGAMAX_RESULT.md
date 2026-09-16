# Quotient-native Negamax kernel result

**Status:** exact bounded-control qualification passed; native-kernel performance shaping remains open  
**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`

## Question

Can the qualified relational Connect Four state become the actual hot search state rather than merely a semantic key layered over a physical board or research-object representation?

The target machine state for this campaign was:

```text
qID -> (supportIndex, p0ResidualClassId, p1ResidualClassId)
```

with side-to-move derived from support-rank parity. Recursive search carries only dense numeric quotient IDs. The timed kernel uses two `u32` lanes for residual masks and does not use a colored board, BigInt residual masks, residual objects, string keys, or a precompiled game DAG.

## Implementation

Authority/evidence:

- `src/quotient-native-negamax-kernel.mjs`
- `src/quotient-native-negamax-campaign.mjs`
- `src/quotient-native-negamax-refinement.mjs`
- workflow run `34646025717`, job `103416896894`
- refinement workflow run `34646180590`, job `103417404214`

The kernel contains:

- exact residual-antichain classes with custom open-address interning;
- lazy compiled own-placement and opponent-block residual-class transitions;
- exact quotient-state interning over `(support,p0Class,p1Class)`;
- quotient-native immediate-win / forced-response / double-threat closure;
- W/D/L-native fail-soft negamax;
- dense exact lower/upper W/D/L bounds indexed directly by `qID`;
- optional quotient-edge caching;
- ETC variants for native-transition economics experiments.

## Exactness qualification

The new machine representation reproduced the complete reachable SIU-1 quotient census exactly:

| Geometry | Exact reachable q states |
| --- | ---: |
| 4x3 c3 | 3,735 |
| 4x4 c4 | 34,095 |
| 5x3 c4 | 11,317 |
| 4x5 c4 | 294,593 |

All qualified cases also matched the independent BSFP W/D/L oracle at the root and for every legal root action.

The compiled two-`u32` residual transitions were independently compared against the previously qualified BigInt residual algebra. On 4x5 alone the campaign checked:

```text
own transitions:    190,826
block transitions:  223,828
terminal reductions: 14,158
mismatches:               0
```

This qualifies the packed quotient algebra on the bounded controls. It does **not** establish standard 7x6 performance or scale.

## First native-kernel finding: precompiled-DAG ETC does not transfer directly

The earlier search-control campaign found ETC highly effective when all child IDs already existed in a precompiled relational DAG. Native quotient execution changes that cost model.

On 4x5:

| Candidate | Expanded | Median total time | Typed-memory lower bound |
| --- | ---: | ---: | ---: |
| WDL native, no ETC | 15,054 | 18.539 ms | 1,844,704 B |
| forcing ETC | 10,530 | 24.471 ms | 3,991,008 B |

Forcing ETC reduced expansions by about **30.1%** but increased measured total time by about **32.0%**. The reason is structural: probing every child forces construction/interning of quotient children that ordinary alpha-beta would never visit.

Therefore the precompiled-DAG conclusion `ETC advances by default` is superseded for the native kernel. ETC remains a candidate mechanism, but speculative quotient construction is not an acceptable default.

## Edge-cache refinement

The refinement campaign separated the cost of state-edge caching from search control.

### 4x5 c4

| Candidate | Expanded | Median total | q states created | Typed-memory lower bound |
| --- | ---: | ---: | ---: | ---: |
| edge cache, no ETC | 15,054 | 26.300 ms | 15,728 | 2,106,848 B |
| **no edge cache, no ETC** | **15,054** | **18.539 ms** | **15,728** | **1,844,704 B** |
| forcing ETC | 10,530 | 24.471 ms | 18,779 | 3,991,008 B |
| cached-edge-only ETC | 14,765 | 26.225 ms | 15,724 | 2,106,848 B |
| cached-edge-only ETC, remaining>=3 | 14,780 | 19.825 ms | 15,724 | 2,106,848 B |
| cached-edge threshold ETC | 14,851 | 20.225 ms | 15,727 | 2,106,848 B |

The per-state edge cache made the no-ETC 4x5 control about **41.9% slower** while adding 262,144 typed bytes. Its hit rate is too low to justify unconditional storage in the current serial kernel.

Cached-edge-only ETC avoids speculative state growth and produces some exact cutoffs, but on 4x5 the edge-cache/scanning cost still outweighs the work saved.

### Cross-control disposition

The 4x4 control did benefit from cached-edge-only ETC with an interior gate:

```text
no-edge/no-ETC:              9.998 ms, 4,250 expansions
cached-edge ETC remaining>=3: 7.919 ms, 4,201 expansions
```

The 5x3 and 4x5 controls favored no-edge/no-ETC. The tiny decisive 4x3 case favored threshold/cached-edge variants but is too small for that result to govern the larger-kernel default.

So ETC is now **conditional physical policy**, not a structural default. Future ETC work must either make child identity substantially cheaper or provide a lower-cost selective/materialized-child probe surface.

## Current strongest native baseline

For the current larger bounded controls, advance:

```text
quotient-native qID state
+ side-to-move from support rank parity
+ two-u32 residual substrate
+ lazy exact residual-class transitions
+ quotient-native tactical closure
+ W/D/L-native fail-soft negamax
+ dense exact W/D/L bounds by qID
+ no per-state quotient-edge cache
+ no forcing ETC
```

This baseline is not yet the production winner. It is the strongest **qualified native quotient kernel** from which further physical optimization should proceed.

## Largest remaining structural waste

The 4x5 no-edge baseline discovered 7,470 residual classes. Its dense class-transition arrays reserve capacity for 8,192 classes × 20 cells × 2 transition modes:

```text
reserved class-transition entries: 327,680
observed populated entries:          22,039
occupancy:                            ~6.73%
reserved typed bytes:             1,310,720
```

This dense class-transition cache is now the dominant typed-memory component and is sparsely occupied. It is the next organic optimization target: reduce cache footprint/locality cost without restoring BigInt/object/string hot-path machinery or weakening exactness.

## Measurement caveat

`memoryStats().totalTypedBytes` is a **typed-array lower bound**, not complete JavaScript heap usage. Dynamic JavaScript arrays holding canonical residual terms and metadata are not included. Equal-byte promotion claims therefore remain open until the representation is made sufficiently fixed-width or full memory is measured comparably.

## Promotion status

Passed:

- no recursive colored-board identity;
- no precompiled game DAG dependency;
- exact reachable quotient census on all complete controls;
- exact compiled residual transitions against independent qualified algebra;
- exact root/action W/D/L against BSFP oracle;
- native transition/search cost included in timing.

Still open:

- sparse/compact residual-class transition economics;
- complete fixed-width memory accounting;
- equal-byte comparison against the physical/incumbent control;
- driver tournament on the stabilized native kernel;
- standard 7x6 scale/performance;
- actual BSFP-boundary composition cost.

## Decision

The quotient-native architecture survives its first physical implementation test. The main lesson is that optimizations selected on a precompiled quotient graph must be requalified after child construction becomes real work.

The next step is not to restore the board. It is to make the quotient machine representation itself cheaper.
