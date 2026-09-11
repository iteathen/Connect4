# Typed MQ5 + geometry A123 + IMPL marginal qualification

**Date:** 2026-09-11  
**Status:** exact proof-positive / runtime-negative V1; IMPL is not saturated in the strongest serial stack.

## Scope

This experiment answers the checkpoint question that deliberately came *after* joint typed-MQ5 + geometry-A123 qualification:

> Does support-compatible implication / cross-state bound transfer retain material marginal proof value once semantic residual identity, typed exact runtime containers, and geometry-native A1-A3 have already erased a large fraction of the tree?

Tested context:

- `MQ5-TYPED-OPENADDR-V1`
- `A123-GEOMETRY-U1U2-V4`
- exact distance-sensitive null-window alpha-beta
- frozen anchors `663152175 -> -4` and `41267575 -> +3`

IMPL V1 form in this harness:

- same physical gravity support only;
- exact RID favorability remains authority;
- four 32-bit signatures are rejection-only filters;
- lower bounds transfer only from a dominated source to a more-favorable target;
- upper bounds transfer only from a dominating source to a less-favorable target;
- null-window returns are never relabelled exact;
- separate bounded recent lower/upper frontiers per support;
- capacities 4, 8, 16 and 32 per bound-type list;
- both legal stage orders tested: `IMPL -> A123` and `A123 -> IMPL`.

Harness:

`research/minimax/semantic-residual-mq5/run_wsl625_typed_a123_impl_screen.mjs`

Workflow run `34619342695`, job `103329119724`, conclusion **success**.

The separate complete bounded numeric qualifier also passed before this evidence was accepted:

`research/minimax/composition-campaign/2026-09-11-impl-exact-distance-monotonicity.md`

Across 49,147 complete bounded semantic states, 3,385,822 same-support ordered pairs and 271,435 exact dominance pairs there were zero distance-order violations. That remains bounded evidence, not a universal 7x6 proof.

## Loss anchor `663152175 -> -4`

Typed+A123 control: **557,605 nodes**.

| capacity | order | nodes | marginal cut | IMPL bound cuts | candidate visits | exact closure checks | first-run wall ratio |
|---:|---|---:|---:|---:|---:|---:|---:|
| 4 | IMPL→A123 | 419,405 | 24.785% | 31,000 | 798,635 | 706,817 | 1.212x |
| 4 | A123→IMPL | 419,408 | 24.784% | 30,294 | 787,216 | 699,121 | 1.197x |
| 8 | IMPL→A123 | 397,588 | 28.697% | 34,821 | 1,206,088 | 1,057,207 | 1.219x |
| 8 | A123→IMPL | 397,566 | 28.701% | 34,007 | 1,192,647 | 1,048,251 | 1.302x |
| 16 | IMPL→A123 | 378,196 | 32.175% | 37,739 | 1,667,951 | 1,461,631 | 1.358x |
| 16 | A123→IMPL | 378,176 | 32.179% | 36,977 | 1,653,842 | 1,452,244 | 1.490x |
| 32 | IMPL→A123 | 364,377 | 34.653% | 39,679 | 2,095,727 | 1,828,705 | 1.538x |
| 32 | A123→IMPL | **364,320** | **34.663%** | 38,898 | 2,081,650 | 1,819,300 | 1.582x |

Capacity 32 A123→IMPL also reduced:

- semantic states to **254,157**;
- move preparations to **1,377,042**;
- TT writes to **154,027**.

Repeated rotating timing selected the proof-best capacity-32 A123→IMPL form and the first-run wall-best capacity-4 A123→IMPL form. After two warmups:

- control median: **1,520.075 ms**;
- C32 A123→IMPL: **2,328.720 ms**, 364,320 nodes — about **1.532x slower**;
- C4 A123→IMPL: **2,071.114 ms**, 419,408 nodes — about **1.362x slower**.

Relative to typed MQ5 without A123 (`786,581` nodes), the C32 composition reaches **364,320 nodes**, a total proof reduction of about **53.68%**.

## Win anchor `41267575 -> +3`

Typed+A123 control: **3,161,623 nodes**.

| capacity | order | nodes | marginal cut | IMPL bound cuts | candidate visits | exact closure checks | first-run wall ratio |
|---:|---|---:|---:|---:|---:|---:|---:|
| 4 | IMPL→A123 | 2,227,217 | 29.555% | 185,227 | 4,838,532 | 4,040,001 | 1.328x |
| 4 | A123→IMPL | 2,228,281 | 29.521% | 179,073 | 4,698,905 | 3,953,142 | 1.307x |
| 8 | IMPL→A123 | 2,086,637 | 34.001% | 207,402 | 7,386,353 | 6,065,429 | 1.335x |
| 8 | A123→IMPL | 2,089,943 | 33.897% | 201,296 | 7,203,179 | 5,951,752 | 1.379x |
| 16 | IMPL→A123 | 1,998,301 | 36.795% | 224,651 | 10,431,482 | 8,533,471 | 1.439x |
| 16 | A123→IMPL | 1,999,151 | 36.768% | 217,789 | 10,184,014 | 8,369,495 | 1.468x |
| 32 | IMPL→A123 | **1,950,573** | **38.305%** | **233,207** | 13,305,570 | 10,908,945 | 1.511x |
| 32 | A123→IMPL | 1,950,939 | 38.293% | 227,086 | 13,041,802 | 10,726,584 | 1.564x |

Capacity 32 IMPL→A123 also reduced:

- semantic states to **1,349,074**;
- move preparations to **7,232,456**;
- TT writes to **748,961**.

It avoids substantial certificate work relative to A123→IMPL at the same capacity: A123 checks fall from 981,515 to **748,825**, while the proof tree is slightly smaller.

Repeated rotating timing selected C32 IMPL→A123 as proof-best and C4 A123→IMPL as first-run wall-best. After two warmups:

- control median: **9,181.486 ms**;
- C32 IMPL→A123: **14,601.738 ms**, 1,950,573 nodes — about **1.590x slower**;
- C4 A123→IMPL: **12,585.068 ms**, 2,228,281 nodes — about **1.371x slower**.

Relative to typed MQ5 without A123 (`4,138,812` nodes), the C32 composition reaches **1,950,573 nodes**, a total proof reduction of about **52.87%**.

## Interpretation

IMPL is **not saturated** by typed semantic identity + geometry A123. It remains one of the largest remaining proof-reduction mechanisms in the strong serial stack:

- about **34.66%** marginal node reduction on the loss anchor;
- about **38.30%** marginal node reduction on the win anchor at capacity 32.

The current V1 implementation is nevertheless runtime-negative. The cost evidence is concrete rather than speculative. On the win-anchor C32 IMPL-first form it performs:

- **13,305,570 candidate visits**;
- **10,908,945 exact closure checks**;
- **7,385,431 frontier maintenance checks**;
- 602,325 live frontier items over 80,263 support buckets.

The negative wall-time result therefore belongs to this bounded-recent JS object/BigInt frontier form, not to parent IMPL.

Capacity shows a clean proof-value gradient: larger frontiers monotonically retain more useful proof information on both anchors. The next implementation should therefore try to preserve the C32 proof benefit while making candidate rejection and frontier maintenance substantially cheaper, rather than shrinking the frontier merely to win a microbenchmark.

Stage order is genuinely directional. At high capacity on the win anchor, `IMPL -> A123` is both slightly proof-better and cheaper because IMPL removes many states before certificate evaluation. Loss-anchor proof differences between orders are negligible; timing remains implementation-sensitive. V2 should retain both legal orders in qualification rather than hard-code a global conclusion from one anchor.

## Next implementation seam

Proceed to an indexed/compacted exact-distance IMPL form. The highest-leverage cost targets exposed by V1 are:

1. bulk conservative candidate rejection before per-entry exact RID comparison;
2. fixed-slot frontier storage instead of JS object-array scanning/shifting;
3. O(1) exact-state strengthening instead of linear maintenance scans;
4. collision-safe exact RID closure retained after all filters.

The desired outcome is not merely a faster IMPL microkernel: it is to keep most of the **34.7–38.3% marginal proof reduction** while moving the full typed+A123+IMPL wall time toward or below the typed+A123 control.
