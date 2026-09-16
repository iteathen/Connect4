# Packed quotient support layout result

**Status:** qualified scaling candidate  
**Date:** 2026-09-11  
**Branch:** `research/semantic-quotient`

## Question

Can the quotient-native Negamax support lattice stop carrying separate rank, landing-cell and child-support tables without sacrificing exactness or hot-path performance?

## Candidate

One `Uint32` descriptor per support state packs:

- every column height;
- support rank.

For standard 7x6 each height uses 3 bits and rank uses 6 bits, for 27 bits total. Legal/landing information is derived by shift/mask and child support remains `supportIndex + weight[column]`.

## Qualification

`src/quotient-packed-support-layout-campaign.mjs` exhaustively compared the packed descriptor against the existing table layout for every support and column on 4x3 c3, 4x4 c4, 5x3 c4, 4x5 c4 and standard 7x6 c4.

The 7x6 qualification checked:

- 823,543 support states;
- 5,764,801 support/action edges;
- rank;
- landing cell / legality;
- child support.

All comparisons matched exactly.

Actions run `34652238011`, job `103436801440`.

## Memory

| Geometry | Existing complete support tables | Packed support | Packed / table |
| --- | ---: | ---: | ---: |
| 4x3 c3 | 6,160 B | 1,044 B | 16.9% |
| 4x4 c4 | 15,016 B | 2,520 B | 16.8% |
| 5x3 c4 | 29,716 B | 4,121 B | 13.9% |
| 4x5 c4 | 31,120 B | 5,204 B | 16.7% |
| **7x6 c4** | **32,118,205 B** | **3,294,207 B** | **10.3%** |

Standard 7x6 therefore saves about 28.8 MB of typed support data before any other solver changes.

## Access microbenchmark

Small controls favored direct table access because the complete tables fit cheaply in cache. Standard 7x6 reversed that result:

```text
7x6 randomized support probes:
table:  111.270 ms
packed:  47.764 ms
ratio:    0.429
```

This is structural microbenchmark evidence, not by itself whole-solver evidence.

## Whole-solver integration

`src/quotient-packed-support-solver-campaign.mjs` then ran the term-ID full-window W/D/L Negamax with packed support access. It first traversed the complete bounded quotient graphs in lockstep against the table-backed kernel and required identical qIDs, class IDs and edges, followed by independent BSFP root/action W/D/L checks.

Actions run `34653582333`, job `103441020199`.

Solve-only medians:

| Geometry | Table support | Packed support | Packed / table |
| --- | ---: | ---: | ---: |
| 4x4 c4 | 3.065 ms | 3.039 ms | 0.992 |
| 5x3 c4 | 0.869 ms | 0.522 ms | 0.601 |
| 4x5 c4 | 11.720 ms | 11.785 ms | 1.006 |

On 4x5 the packed representation is effectively performance-neutral while preserving the complete 294,593-state graph exactly. The candidate still allocated the legacy support tables outside the timed solve section; this experiment isolates access semantics/performance rather than final integrated memory.

## Disposition

Promote packed support as the current **7x6 scaling representation candidate**. Do not yet delete the table-backed path. The next composition experiment is:

```text
term-ID residual classes
+ fixed dense-prefix residual transition cache
+ packed support descriptor
+ full-window W/D/L Negamax
```

This targets the two dominant geometry-scaling memory structures while preserving direct-index hot paths.

## Accounting correction

Historical base-kernel `memoryStats()` counted landing/child support tables but did not include `support.ranks`/`support.weights`. Existing evidence remains valid under its recorded accounting contract and is not rewritten. New scaling comparisons should count complete support storage explicitly.
