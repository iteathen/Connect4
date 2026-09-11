# Exact terminal-subtraction specialization results

**Date:** 2026-09-10  
**Lane:** Connect4 CUDA-BSFP  
**Status:** research-qualified on complete CPU controls; not integrated into C1.

## Question

C1 currently realizes terminal subtraction by intersecting every opposite-side frontier record with every complement generator of the terminal requirement. Can the exact monotone set difference be specialized so records outside the forbidden cone pass through unchanged and only affected records branch?

## Exact identities

For a P0 terminal-Win requirement `q` subtracted from a maximal P0-Loss cap `c`:

- if `q` is not a subset of `c`, the entire downward cone under `c` is unaffected, so copy `c` unchanged;
- otherwise branch only the affected cap to `c \\ {x}` for each `x` in `q`, then exact-normalize.

Dually, for a P1 terminal-Loss cap induced by `q` subtracted from a minimal P0-Win generator `g`:

- if `g` already intersects `q`, the upward cone over `g` is unaffected, so copy `g` unchanged;
- otherwise branch only the affected generator by adding one `x` from `q`, then exact-normalize.

These are representation-specific exact algebraic rewrites, not heuristic pruning.

## Reproduction

The prototype `reference/research-prototypes/2026-09-10-bsfp-terminal-specialization/measure-terminal-subtraction.mjs` reconstructs terminal subtraction from authoritative packed42 child frontiers for complete games and compares generic complement-product subtraction with the specialized form after every terminal application.

One-shot GitHub Actions run `34496987106` completed successfully on Ubuntu 24.04 / Node 26.7.0. The original run exposed a reporting-only bug: `addStats()` iterated target keys, so rank accumulators attempted `rank += undefined`; JSON therefore printed late-rank labels as `null`. Aggregate arithmetic never used `rank` and is unaffected. The prototype has been corrected to accumulate source statistic keys only.

## Complete-game results

| Geometry | Terminal applications | Input frontier records | Unaffected records | Generic candidates | Specialized candidates | Candidate reduction | Exact mismatches |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 4x3 c3 | 768 | 3,629 | 2,258 | 7,258 | 5,000 | 31.11% | 0 |
| 4x4 c4 | 1,000 | 4,200 | 3,358 | 12,600 | 5,884 | 53.30% | 0 |
| 5x3 c4 | 1,152 | 2,568 | 1,224 | 7,704 | 5,256 | 31.78% | 0 |
| 4x5 c4 | 3,036 | 35,166 | 27,050 | 105,498 | 51,398 | 51.28% | 0 |
| 5x4 c4 | 8,125 | 104,946 | 79,884 | 314,838 | 155,070 | 50.75% | 0 |
| 5x5 c4 | 28,656 | 1,344,073 | 1,065,332 | **4,032,219** | **1,901,555** | **52.84%** | **0** |

On 5x5, 79.26% of terminal-subtraction input records are unaffected. Generic subtraction nevertheless sends them through the Cartesian complement product. The specialized algebra eliminates **2,130,664 candidate records** before normalization on this complete control.

## Interpretation

This is a materially stronger direct algebraic reduction than the first double-threat absorber's 2.37% aggregate-pair reduction. The scopes differ: terminal specialization only attacks terminal-subtraction products, whereas the double-threat filter applies to universal aggregate candidates. They can compose.

The 6x5 wall begins close to the terminal end of the support lattice, so this candidate has unusually good causal alignment with the observed failure region. It is therefore promoted from “plausible” to **high-priority exact reducer candidate**, while still awaiting the C3 native split between terminal and aggregate work.

Do not convert the 52.84% terminal-candidate reduction into a solver speedup claim. Full C1 time also includes cofactor normalization, terminal union, aggregate pair work, duplicate scans, barriers and publication.

## Next qualification

1. Keep C1/C3 legacy semantics unchanged until a separate Device-JS candidate exists.
2. Implement specialized terminal subtraction as a Connect4-owned Device-JS primitive/profile without changing CUDA-Algorithms or CUDA-JS.
3. Differential-qualify complete 4x3, 4x4 and 5x5 support frontiers before promotion.
4. Use C3 native evidence to determine whether terminal specialization should precede or follow bucketing/dedup work in the 6x5 intervention order.

The empty 7x6 BSFP root remains unsolved.