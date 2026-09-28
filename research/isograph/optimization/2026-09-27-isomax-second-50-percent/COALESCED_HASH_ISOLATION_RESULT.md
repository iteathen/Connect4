# Phase-2 result — isolate shared hash reuse from selective fallback

Date: 2026-09-27
Status: pure coalesced all-hot hash reuse is the preferred completed exact-control candidate.

## Hosted evidence

JSMinSys workflow:
- run `36381336035` — success
- artifact `10953330974`
- digest `sha256:db55f11805785d66a07bb6cc56a285b76887d7dd47ea8c44509b602a84f99140`

Hosted topology:
- `availableParallelism() = 4`
- worker 0 wide/root-frontier
- workers 1..3 deep
- no single-worker runs.

Fixed arms:
- A retained coalesced+shared-draw: `e449df20dc59cc6c1e5b2da78134751a2376f355`
- B pure coalesced known-hash reuse: `f549dcfdd7d4d0c5ed5cd01cb3141812f1d59862`
- C known-hash reuse + all-noncutoff fallback: `48c514e747cb2656666b951f97e0928dda501cf7`

B passed full JSMinSys Verify before timing (run `36381250343`).

## Exact derived-long — 353335714

Six balanced blocks / 18 processes. All exact, identical root WDL -1 / move 4.

B versus A:
- process cycles: **-1.432%**
- 95% interval: **[-2.679%, -0.186%]**
- nodes: -0.175%, interval crosses zero.

C versus A:
- process cycles: **-1.366%**
- 95% interval: **[-2.588%, -0.144%]**
- nodes: -0.518%, interval crosses zero.

Direct B versus C:
- process cycles: **-0.055%**
- 95% interval: **[-1.886%, +1.777%]**

B and C are statistically indistinguishable on completed exact whole-process
cycles. Selective fallback therefore has not demonstrated incremental exact
value once locator-hash reuse is present.

Under the minimum-machinery rule, carry B forward and reject selective
all-noncutoff fallback from the preferred path for now.

## Official hard fixed window — 35333571

All three arms timed out at 120000 ms.

Descriptive fixed-window values:
- A: 1.10055 T cycles / 126.690 M nodes
- B: 1.13734 T cycles / 133.107 M nodes
- C: 1.12808 T cycles / 131.981 M nodes

This censored block disagrees with other hard-window samples. It cannot support
an exact solve-speed ratio and reinforces that Lazy-SMP hard-window path/
scheduling variance is substantial.

## Structural result

The completed-tree improvement survives without adding a second shared probe
after non-cutoff weak-bound hits.

Useful change isolated:
- carry the already-computed q locator hash into existing shared exact
  probe/store operations;
- retain full q-key and sequence validation;
- retain exact-only shared semantics.

Next cheapest optimization:
specialize mandatory-known-hash hot helpers so the hot path no longer pays the
compatibility `knownHash === undefined` selection. Build that pass from B,
not from fallback-based C.

PR #84 remains draft/open; no merge authorization follows from this result.
