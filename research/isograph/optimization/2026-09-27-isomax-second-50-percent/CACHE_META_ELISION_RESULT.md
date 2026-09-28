# IsoMax Phase-2 research result — cache meta elision

Date: 2026-09-28
Status: exact identity result retained; no preferred-solver speed promotion.

## Candidate

Baseline:
`f549dcfdd7d4d0c5ed5cd01cb3141812f1d59862`

Verified candidate:
`03019e7fdde9270798ae5598656897293523b92e`

Verify:
`36403670506` — success.

The candidate proves and exploits a strict MSS fact at the cache boundary:
nonterminal meta is a deterministic function of support,
`meta = sum(column heights) << 2`.

The full search state remains intact, but exact cache identity becomes the
contiguous support + P0 residual + P1 residual prefix. Standard 7x6 identity is
13 uint32 words rather than 14. This is exact projection, not fingerprinting.

## Qualification evidence

Three fixed-SHA workflows were launched by successive branch updates before any
outcome was inspected. All used:
- 4 workers = worker 0 wide + workers 1..3 deep;
- rootFrontier=true;
- shared cache 4,194,304;
- local cache 1,048,576 per worker;
- full sharing;
- Node 26.7.0.

Artifacts:
- run `36403822254`, artifact `10961627274`,
  `sha256:77c86ac7e7850508b539bb4c749a0485daecdbe92eb4a87bb355aa3cec0ec38b`;
- run `36403886144`, artifact `10961378634`,
  `sha256:1c12f6323229eff9a38542e1f392a96d52cb8102bf4185f2b9c46440cfdaf440`;
- run `36403946612`, artifact `10962020752`,
  `sha256:336a504fcc0681ec1ea1d6409ef0ca1a67fac11dc2044dca186bf3439d6fc878`.

## Exact control — 353335714

Each run used eight balanced AB/BA blocks. The complete available evidence is
24 paired blocks / 48 fresh exact processes.

Every process returned root WDL -1 / move 4.

Individual cycle results:
- run 1: +0.185%, 95% [-2.365%, +2.735%];
- run 2: -0.663%, 95% [-1.150%, -0.177%];
- run 3: -0.541%, 95% [-0.994%, -0.088%].

Pooled 24-block paired result:
- whole-process cycles: **-0.340%**, 95% **[-1.092%, +0.412%]**;
- CPU: -0.367%, [-1.197%, +0.464%];
- wall: +0.515%, [-1.340%, +2.371%];
- nodes: -0.140%, [-0.418%, +0.138%];
- cycles/node: -0.197%, [-0.974%, +0.580%];
- shared hits: -0.631%, [-1.076%, -0.186%];
- shared stores: +0.130%, [-0.011%, +0.271%];
- RSS: **-4.626%**, [-4.702%, -4.550%];
- peak RSS: **-4.847%**, [-4.904%, -4.790%].

The memory effect is qualified. The Phase-2 acceptance metric is whole-process
cycles, whose interval crosses zero.

## Hard fixed window — 35333571

All six samples timed out at 120000 ms. Exact solve-speed ratios are inadmissible.

Across the three paired windows the candidate was descriptively:
- cycles -1.757%, interval [-5.845%, +2.331%];
- nodes -1.875%, interval [-4.390%, +0.640%];
- cycles/node +0.116%, interval [-1.571%, +1.803%];
- peak RSS -5.171%, interval [-6.445%, -3.897%].

## Research disposition

Retain the theorem:

```
cacheable nonterminal q
+ equal support
-> equal rank
-> equal meta
```

Therefore meta is provably redundant exact identity information.

But the clean implementation does not establish a whole-solve speed gain.
Accordingly:
- keep `f549dcf...` as preferred Phase-2 speed baseline;
- do not promote `03019e...`;
- PR #109 is closed without merge;
- retain meta elision as a memory result and as a composable exact reduction;
- continue with the next distinct measured identity/operation-class hypothesis.

PR #84 remains draft/open; no merge authorization follows.
