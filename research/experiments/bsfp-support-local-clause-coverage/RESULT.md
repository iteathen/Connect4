# Support-local clause coverage / cofactor qualification

**Status:** completed differential semantic qualification; production CUDA integration not yet attempted.

**Research direction:** Josh Oshiro.

## Question

Can beneficiary-relative monotone-CNF BSFP be represented persistently by support-local upward-coverage bitsets, with one-ply cofactors implemented entirely by precomputed child-to-parent clause maps, without reconstructing variable clause arrays?

## Authority

The authority is the already-qualified exact OR-of-monotone-CNF clause-frontier recurrence.

The candidate uses, for each support `S`, the exact dictionary

```text
D(S)
  = unique(
      { {v} | v in S }
      union
      { lambda intersect S | lambda is a winning line,
                             lambda intersect S != empty }
    ).
```

A normalized clause record is encoded by the upward closure of its clause IDs in the local inclusion poset.

For every legal support edge and beneficiary relation, each child clause ID is preclassified as:

```text
SATISFIED
KILL
parentClauseID
```

and the candidate recurrence performs cofactors using only these precomputed maps plus coverage-bitset union/subset operations.

No solved database, opening knowledge, minimax/Negamax result, or externally searched game value is consumed.

## Qualification

For every support on each control geometry:

1. solve the exact array-CNF recurrence;
2. solve the support-local coverage recurrence independently through precomputed edge maps;
3. encode the authoritative array frontier into the current support dictionary;
4. require exact equality with the candidate coverage frontier for both beneficiaries.

Any support-level difference is a falsifier.

The reference qualifier uses u32 cell masks because all selected complete controls contain fewer than 31 cells. Coverage uses arbitrary-width `BigInt`; therefore the semantic qualification does not assume one-u64 dictionaries.

## Complete-control results

| Geometry | Supports | Winning lines | Max local dictionary | Cofactor maps | Support mismatches |
|---|---:|---:|---:|---:|---:|
| 4x3 c3 | 256 | 14 | 26 | 1,536 | 0 |
| 4x4 c4 | 625 | 10 | 26 | 4,000 | 0 |
| 5x3 c4 | 1,024 | 6 | 21 | 7,680 | 0 |
| 4x4 c3 | 625 | 24 | 40 | 4,000 | 0 |
| 4x5 c4 | 1,296 | 17 | 37 | 8,640 | 0 |
| 5x4 c4 | 3,125 | 17 | 37 | 25,000 | 0 |
| **Total** | **6,951** | — | — | **50,856** | **0** |

The dense 4x4 Connect-3 control is intentionally retained because earlier clause-frontier work showed it is an unfavorable performance profile. Exact coverage/cofactor closure still held.

## 6x5 Connect-4 support-only dictionary census

The same run enumerated the support-local dictionary from geometry/support alone over all 46,656 6x5 Connect-4 supports.

Selected ranks:

| Rank | Supports | Mean dictionary | Min | Max |
|---:|---:|---:|---:|---:|
| 15 | 4,332 | 39.259 | 27 | 48 |
| 20 | 2,247 | 52.425 | 45 | 56 |
| 21 | 1,666 | 54.633 | 49 | 58 |
| 22 | 1,161 | 56.705 | 53 | 59 |
| 23 | 756 | **58.648** | 56 | **61** |
| 24 | 456 | 60.480 | 58 | 63 |
| 25 | 252 | 62.206 | 61 | **64** |
| 26 | 126 | 63.865 | 62 | 65 |
| 27 | 56 | 65.464 | 64 | 66 |
| 28 | 21 | 66.905 | 66 | 67 |
| 29 | 6 | 68.000 | 68 | 68 |
| 30 | 1 | 69.000 | 69 | 69 |

Consequences:

- every rank-23 support fits in one 64-bit coverage word;
- every support through rank 25 fits in one 64-bit word;
- rank 26 is the first rank where some supports require a second bit;
- the semantic contract remains variable-width; these are workload facts, not a one-u64 engine rule.

This is especially relevant because the previously measured 6x5 CUDA scaling wall appears in the late/high-rank region reached around rank 23.

## What was established

The experiment supports all of the following on the tested variable geometries:

```text
persistent clause record
    -> support-local upward-coverage signature

record conjunction
    -> bitset OR

record implication
    -> reversed bitset subset

one-ply cofactor
    -> exact precomputed support-edge bitset transform
```

No variable clause-array reconstruction is semantically required by the persistent recurrence.

The support-local dictionary is therefore not merely a compression index; it is closed under the exact predecessor algebra used by the qualified clause BSFP.

## What was not established

This experiment does not establish:

- a CUDA speedup;
- superiority over rank-slice ownership BSFP;
- a universal fixed bit width;
- profitability on every Connect-K geometry;
- native-GPU cofactor-map throughput;
- that exact legal-cardinality filtering of clause records is free.

Rank-slice ownership remains the exact production reference/fallback until a packed native A/B proves otherwise.

## Reproduction

GitHub Actions qualification:

```text
workflow: bsfp-support-local-clause-coverage
run:      35035686510
job:      104604170153
head:     3ea28173f7f5743790a1226b0b27f876a4330ca9
runner:   Ubuntu 24.04 / Node 26.7.0
result:   success
```

Run directly with:

```text
node research/experiments/bsfp-support-local-clause-coverage/reference-coverage-cofactor.mjs
```

## Reassessment

The main remaining obstacle to a device-resident clause-coverage solver is no longer semantic cofactor closure.

The execution problem is now bounded and concrete:

1. choose the support/orbit-local dictionary width;
2. apply precomputed child-to-parent coverage transforms efficiently;
3. perform OR-product + minimal-subset normalization;
4. apply cheap exact legal-slice filters where profitable;
5. compare the resulting native GPU profile against qualified rank-slice ownership on the same workloads.

The next device experiment should use **real persistent coverage frontiers from this recurrence**, not synthetic random coverage masks.

## Disposition

**Supports** support-local coverage signatures plus precomputed cofactor maps strongly enough to advance to a real-frontier CUDA A/B profile.

Keep the array-CNF implementation as semantic qualification authority and rank-slice ownership as production/reference fallback.