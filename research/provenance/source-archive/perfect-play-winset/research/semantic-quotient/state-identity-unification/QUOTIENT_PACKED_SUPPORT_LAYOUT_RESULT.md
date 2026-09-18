# Packed Support-Lattice Layout Result

**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`  
**Workflow:** run `34652238011`, job `103436801440`  
**Status:** exhaustive structural qualification passed; strongly promoted for large-support integration, not yet whole-solver authority

## Problem

The quotient Negamax kernel currently materializes support metadata with three large structures:

```text
rank[support]
landingCell[support,column]
childSupport[support,column]
```

For standard 7x6 the support lattice has:

```text
7^7 = 823,543 support states
```

The existing table shape therefore becomes a large memory working set before any quotient state or residual class is stored.

The historical kernel `memoryStats()` also omitted the `support.ranks` and `support.weights` arrays from its reported `supportBytes`, so older footprint figures should be read under their recorded accounting contract rather than as complete support-memory measurements.

## Packed descriptor

For standard 7x6:

- each column height is in `[0,6]` -> 3 bits;
- seven heights -> 21 bits;
- support rank is in `[0,42]` -> 6 bits.

Therefore one `u32` descriptor can encode the complete support-local information:

```text
[ rank:6 ][ h6:3 ][ h5:3 ] ... [ h0:3 ]
```

Then:

```text
height(s,c) = shift/mask descriptor[s]
legal(s,c)  = height < rows
landing     = height * columns + c
child       = s + weight[c]
rank(s)     = shift/mask descriptor[s]
```

No per-support/per-column child table is required.

## Qualification

For every support and every column on all tested geometries, packed descriptors reproduced exactly:

- rank;
- legal/full-column classification;
- landing cell;
- child support index.

Standard 7x6 qualification covered:

```text
823,543 supports
5,764,801 support-column edges
```

with zero mismatches.

## Memory

| Geometry | table support bytes | packed bytes | packed / table |
| --- | ---: | ---: | ---: |
| 4x3 c3 | 6,160 | 1,044 | 0.169 |
| 4x4 c4 | 15,016 | 2,520 | 0.168 |
| 5x3 c4 | 29,716 | 4,121 | 0.139 |
| 4x5 c4 | 31,120 | 5,204 | 0.167 |
| **7x6 c4** | **32,118,205** | **3,294,207** | **0.103** |

Standard 7x6 therefore saves:

```text
28,823,998 bytes
```

or about **89.7%** of the measured support-layout storage.

## Access benchmark

A deterministic randomized support/column workload was used after JIT warm-up. The benchmark consumes rank, landing and child support so both layouts provide the same information.

| Geometry | packed / table time |
| --- | ---: |
| 4x3 c3 | 2.705 |
| 4x4 c4 | 2.521 |
| 5x3 c4 | 2.679 |
| 4x5 c4 | 2.345 |
| **7x6 c4** | **0.429** |

The important crossover is standard 7x6: despite extra shifts/masks/addition, the packed layout was approximately **2.33x faster** on the randomized structural access workload.

The most plausible explanation is working-set locality: the direct table representation is ~32 MB, while the packed descriptor is ~3.3 MB and substantially more cache-resident.

This is a structural microbenchmark, not yet a whole-solver performance claim.

## Interpretation

The result rejects a universal policy:

```text
always packed
```

because small support lattices are faster with direct tables.

It strongly supports a scale-sensitive policy:

```text
small support lattice -> direct table layout
large support lattice -> packed u32 descriptor
```

This is an organic optimization: on the target 7x6 geometry it simultaneously improves memory footprint and low-level access throughput.

## Disposition

Promote packed support descriptors to a whole-kernel integration campaign.

Integration requirements:

1. preserve table layout as the bounded-control/reference default;
2. select packed layout explicitly or from a documented support-size threshold;
3. preserve exact q state/class/edge semantics;
4. account for all support-profile arrays truthfully in the new memory report;
5. qualify bounded controls against the existing term-ID solver;
6. use standard 7x6 only for structural/setup/access qualification until an actual exact root-solving campaign is authorized and practical.

The preferred large-domain combination is now:

```text
u16 term-ID residual ontology
+ fixed dense-prefix residual transition cache
+ packed u32 support descriptor
```

subject to whole-kernel qualification.
