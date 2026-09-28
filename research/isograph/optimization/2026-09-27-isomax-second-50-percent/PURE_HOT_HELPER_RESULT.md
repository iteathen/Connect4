# Phase-2 result — mandatory known-hash helper specialization

Date: 2026-09-27
Status: exact but not a qualified whole-solve improvement.

## Premise

The preceding IsoGraph isolation result selected pure coalesced locator-hash
reuse at:

`f549dcfdd7d4d0c5ed5cd01cb3141812f1d59862`

and rejected selective all-noncutoff shared fallback from the preferred path.

The next minimum-machinery hypothesis was that hot shared exact calls still paid
a compatibility-path selection even though the caller already had the q hash.

A separate candidate therefore split:
- compatibility shared exact probe/store helpers that compute a hash; and
- mandatory-known-hash hot probe/store helpers with no default-path selection.

Full q-key equality, sequence validation, exact-only shared semantics, private
LOWER0/UPPER0 bounds, and same-q exact-draw coalescing were preserved.

Candidate:
`9da33eb5146ea94dd0928c4632a7f91f0cda4b29`

JSMinSys Verify:
`36383046141` — success.

## Hosted evidence

Workflow:
`36383201513` — success.

Artifact:
`10953203421`

Digest:
`sha256:22ec88be617421c074fd00b67ee037b05408b380d044b0c9b5216234229bd0c6`

Topology:
- `availableParallelism() = 4`;
- worker 0 wide/root-frontier;
- workers 1..3 deep;
- no single-worker runs.

## Exact derived-long — 353335714

Eight balanced AB/BA blocks / 16 processes.
All samples exact with identical root WDL -1 / move 4.

Mean A, pure hash reuse:
- process cycles: 55.703 B;
- nodes: 4.52310 M;
- cycles/node: 12,314.98.

Mean B, mandatory hot helper:
- process cycles: 55.494 B;
- nodes: 4.52182 M;
- cycles/node: 12,272.44.

Paired B versus A:
- process cycles: **-0.371%**
  - 95% interval **[-1.096%, +0.355%]**;
- nodes: -0.028%
  - interval crosses zero;
- cycles/node: -0.342%
  - interval crosses zero.

Whole-process cycles remain the acceptance authority. The interval crosses zero,
so the specialization does not establish a completed-tree improvement.

## Official hard fixed window — 35333571

Both arms timed out at the unchanged 120000 ms ceiling.

A:
- 0.97235 T cycles;
- 109.824 M nodes;
- 15.113 M shared stores;
- 391,370 contention events;
- 8,853.69 cycles/node.

B:
- 1.12204 T cycles;
- 129.598 M nodes;
- 16.273 M shared stores;
- 533,673 contention events;
- 8,657.86 cycles/node.

B processed more of a different Lazy-SMP search path while using fewer
cycles/node. Because both samples are censored, no exact solve-speed ratio or
ranking is admissible.

## IsoGraph / DP disposition

The hypothesis was valid at the local operation level: the compatibility
selection can be removed from the hot helper. The experiment falsifies the
stronger assertion that this isolated local reduction is large enough to produce
a reliably measurable whole-solve improvement.

Under Minimum Sufficient Support / minimum-machinery discipline:
- do not carry the extra helper split into the preferred production path from
  this evidence;
- retain pure coalesced locator-hash reuse `f549dcf...`;
- target a larger transition class next.

The recurring hard-workload pressure remains shared probe/store traffic and
contention. The next experiment should measure admission/source economics before
adding another table or broad cache mechanism.

PR #84 remains draft/open; this result gives no merge authorization.
