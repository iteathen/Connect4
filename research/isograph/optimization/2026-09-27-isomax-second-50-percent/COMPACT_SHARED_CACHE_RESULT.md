# IsoMax Phase-2 research result — compact shared exact cache

Date: 2026-09-28
Status: qualified; new preferred Phase-2 experimental baseline.

## Selected candidate

Previous preferred solver:
`f549dcfdd7d4d0c5ed5cd01cb3141812f1d59862`

New preferred solver:
`9594b6b88420d60f113cb5af560de2f128aec0da`

JSMinSys branch:
`experiment/isomax-phase2-compact-shared-cache-7x6-20260927`

Draft PR:
#110 — compact shared exact cache 7x6.

Full candidate Verify:
`36405205784` — success.

## Structural result

The lossless compact identity qualification established that semantic q identity
contains reconstructible structure:
- rank is determined by support;
- coordinate padding is nonsemantic;
- support widths are geometry-bounded;
- coordinate tails may be packed exactly.

The hot implementation preserves the full private q representation and the
already-computed full-q locator hash, but stores/validates an exact compact
identity inside the shared exact cache.

For selected 7x6:
- shared key: 14 -> 8 uint32 words;
- the first two support heights remain raw, preserving the measured cheap
  mismatch prefix;
- remaining support + terminal bits are packed exactly;
- rank is omitted;
- complete coordinate words remain exact;
- the two five-bit coordinate tails share one word.

The runtime-geometry audit initially rejected a hidden fixed-geometry carrier.
That audit was preserved. The final source selects the compact specialization
only from the initialized geometry contract and retains the full-key fallback.

## Exact-control qualification

Fixed source:
- A = `f549dcf...`;
- B = `9594b6b...`.

Fixed topology:
- 4 workers;
- worker 0 wide/root-frontier;
- workers 1..3 deep;
- rootFrontier=true;
- shared cache 4,194,304;
- local cache 1,048,576 per worker;
- sharedSampleMask=0;
- Node 26.7.0.

Four independent workflows were already launched before the first result was
inspected, all using the same fixed solver source SHAs and protocol.

Evidence:
- workflow `36405382433`, artifact `10962710633`,
  `sha256:5624b28f58b5da2e72fef18605d2b16c004dc1f7605959bcbaab2ff90008cd4e`;
- workflow `36405407193`, artifact `10962491961`,
  `sha256:b1d427665837dce8d709601fdf699751d33a9c02296f0168794ec393fb9cd8f4`;
- workflow `36405435792`, artifact `10962611458`,
  `sha256:1a04990e8561841f7e4fdd6c247f113bd2c4fcb009ad5a1cb0e3bd4572afc7cd`;
- workflow `36405435878`, artifact `10962651064`,
  `sha256:db32ba714286b42d3bfb26ff7ff9b70a5e6bcf5a24f8020d080d527eca00cb80`.

Primary fixture:
`353335714`.

Every one of 64 fresh processes completed exactly with root WDL -1 / move 4.

Per-run whole-process cycles:
- -1.725%, 95% [-2.598%, -0.852%];
- -1.997%, 95% [-3.121%, -0.872%];
- -1.936%, 95% [-3.005%, -0.867%];
- -2.034%, 95% [-3.184%, -0.885%].

Pooled 32 paired blocks:
- whole-process cycles: **-1.923%**, 95% **[-2.360%, -1.486%]**;
- CPU: -1.945%, [-2.402%, -1.488%];
- wall: -1.247%, [-2.251%, -0.243%];
- nodes: -0.549%, [-0.782%, -0.317%];
- cycles/node: -1.382%, [-1.740%, -1.023%];
- shared-store contention: -8.766%, [-11.467%, -6.066%];
- shared bytes: -37.255%;
- RSS: -27.373%, [-27.438%, -27.308%];
- peak RSS: -16.279%, [-16.321%, -16.237%].

This establishes a whole-solve improvement under the campaign acceptance rule.

## Hard fixture

Fixture:
`35333571`.

Three of four paired workflows were censored at 120000 ms for both arms.
One workflow completed exactly in both arms and favored the compact candidate by
3.539% cycles, but a single hard pair does not receive a confidence interval.

The hard evidence is therefore secondary and does not alter the exact-control
qualification.

## Research disposition

Adopt `9594b6b...` as the next Phase-2 optimization baseline.

Carry forward:
- full sharing;
- exact-only shared cache;
- exact compact shared identity;
- known full-q hash reuse;
- private LOWER0/UPPER0;
- same-q coalescing;
- mandatory 1-wide + remaining-deep reduced-core topology.

The improvement is consistent with the structural hypothesis: remove exact
identity entropy that need not cross the shared-memory boundary while preserving
the cheapest discriminating prefix.

Do not merge PR #84 as a consequence of this result.
Do not use single-worker qualification.
