# Exact shared-TT key compression: fixed-format integration experiment

Date: 2026-09-09. Status: research evidence, not maintained implementation.

## Outcome

The direct-mapped shared TT can encode its exact 49-bit position identity using one 32-bit stored word plus existing index bits, rather than two stored key words. The unchanged bound, writer diagnostic and publication-control fields bring the experimental entry size from 14 to 10 bytes: **28.57% less TT backing memory at the same entry capacity**.

This is exact reconstruction, not probabilistic tagging. The collision pattern, replacement rule, bound semantics, tactical/move ordering, and eldest-first two-lane YBWC search policy were held unchanged within each comparison. No dependency allocation, cleanup, move hints, or per-node scheduler code was introduced.

Timing is workload-dependent. The more demanding position showed promising reductions; the smaller position was effectively tied. These small sandbox batches do not establish universal speedups or production readiness.

## Exactness argument

Write the canonical key as low word L and high word H, where 0 <= H < 2^17. Let all following low-word arithmetic be modulo 2^32:

    t = L XOR imul(H, 0x9e3779b1)
    x = imul(t XOR (t >>> 16), 0x85ebca6b)
    index = x AND (2^k - 1)

This is the pre-existing slot hash, not a newly chosen collision policy.

For a fixed H, XOR with imul(H, constant) is invertible. The xor-right-16 transform is its own inverse. The odd multiplier 0x85ebca6b is invertible modulo 2^32, with inverse 0xa5cb9243.

The fixed-format candidate always stores:

    q = (H << 15) OR (x >>> 17)

Recover H = q >>> 15 and x = (q << 17) OR (index AND 0x1ffff). Invert the multiplication and XOR transforms to recover L. Therefore equal index and q imply the same full canonical key within the stated domain.

The representation requires at least 17 index bits; descriptors smaller than 128K need another exact format or the existing full-key baseline.

## Qualification performed

The research run included:

- millions of key reconstruction round trips across supported index widths;
- independent cell-array late-game oracle checks;
- public immediate-win guard qualification;
- full exact-score solves for `663152175` (-4) and `41267575` (+3) at multiple TT capacities;
- comparison of score, node/hit/write counters, and decoded occupied final TT entries in controlled single-worker cases;
- retained-entry addressing checks for the fixed-format candidate across smaller aligned regions.

The retained-region check proves an addressing/encoding property only. It does not prove live allocator safety, resident-scope purity, or the inherited shared-memory publication protocol.

An initial qualification failure was preserved: Node strict assertion distinguishes `+0` from `-0`, and the independent recursive oracle emitted `-0` for a draw while the public solver normalized to `0`. The correction normalized the oracle expectation at the comparison boundary rather than changing solver behavior.

## Representative performance evidence

Environment: Linux x64, Node v22.16.0, AMD EPYC 9V74 as reported by the sandbox. This is not Windows or the project's newer target Node qualification.

Representative fixed-format comparisons against the full-key baseline:

| Position | Workers | Entries | Full-key median | Fixed-format median | Paired wins |
|---|---:|---:|---:|---:|---:|
| `41267575` | 1 | 512K | 1.312 s | 1.157 s | 5/6 |
| `41267575` | 4 | 512K | 1.149 s | 1.043 s | 4/6 |
| `41267575` | 4 | 1M | 1.266 s | 1.098 s | 5/6 |
| `663152175` | 4 | 256K | 111.0 ms | 110.5 ms | 6/12 |

The smaller case is effectively tied. The favorable larger-position medians are promising but do not establish a universal speedup.

At 512K/one worker both modes search exactly 5,854,083 nodes.

## Byte accounting

| Entries | Full-key TT | Fixed-format TT | Saving |
|---:|---:|---:|---:|
| 256K | 3.5 MiB | 2.5 MiB | 1 MiB |
| 512K | 7 MiB | 5 MiB | 2 MiB |
| 1M | 14 MiB | 10 MiB | 4 MiB |
| 2M | 28 MiB | 20 MiB | 8 MiB |

All entries retain the writer diagnostic byte and publication-control word. Equal entry count was deliberate: the experiment asked whether identical cache knowledge could be represented more densely before reopening capacity selection.

## Integration consequence

If slot/address bits participate in exact identity, relocation is no longer a free storage operation. Arbitrary slab movement or a change in address interpretation must preserve the encoding contract or invalidate/rewrite affected entries. Thus a successful density optimization constrains later allocator/lifecycle designs.

## Disposition

Retain the fixed-format exact-residual representation as a research candidate and denser flat-TT control. Do not promote it to maintained source yet.

The next fair TT-capacity comparison should be rerun using this denser representation because reducing bytes per entry can move the previous locality knee. Same-key monotone bound retention, scheduling affinity, dependency layout, and cleanup remain separate experiments.
