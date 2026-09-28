# Phase-2 follow-up — isolate hash reuse from selective fallback

Date: 2026-09-27
Status: experiment in progress.

## Why this arm is required

The completed four-arm shared-hash run established that the combined
all-noncutoff-fallback + all-hot-known-hash arm improved the completed
derived-long exact control by about 2.09% process cycles versus the retained
coalesced+shared-draw solver.

However, that experiment did not include the simplest decomposition:

- retained coalesced+shared-draw solver;
- all existing shared operations reuse the already-computed q hash;
- **no selective fallback probe is added**.

The selective fallback arm by itself was exact-control neutral and its hard
fixed-window behavior has varied strongly between runs. Therefore the simplest
hash-only arm must be measured before additional fallback machinery is retained.

## Supporting bound census

Successful diagnostic run:
- workflow `36379356516`
- artifact `10951644463`
- digest `sha256:21fa313f75cc5e4535099db4c669e5b8a07e4bd99ada1271516bea81c3f46097`

On the instrumented exact derived-long run, the observed bound-hit classes in
the instrumented worker were:
- immediate cutoff: 41,408 / 49,802 = 83.15%
- alpha/beta tighten: 387 / 49,802 = 0.78%
- no-op: 8,007 / 49,802 = 16.08%

Observed bound-store attempts in that worker:
- exact occupant protected: 39.11%
- opposite-bound exact-draw promotion: 4.55%
- fresh weak-bound publication: 56.34%
- same-bound suppression: 0 in this sample.

The census is diagnostic only; instrumentation changes interleaving/cost and
the hard-timeout sample did not return usable per-worker counters. Treat the
ratios as structural leads, not timing authority.

## Implementation arm

JSMinSys branch:
`experiment/isomax-phase2-shared-hash-coalesced-20260927`

Draft PR:
#97

Head at initial implementation checkpoint:
`d98eac5d284521cf8931c273c692f6022a2bf4fc`

Base:
retained coalesced+shared exact-draw winner
`e449df20dc59cc6c1e5b2da78134751a2376f355`.

Changes:
- shared exact helper accepts an optional already-computed full q locator hash;
- canonical coalesced solver passes the existing hash on ordinary shared probe,
  exact shared store, and coalesced-draw shared store;
- behavior/root-frontier mirrors match;
- NEES ledger charges the hash/default selection and removes locator mixing only
  for KH=1;
- directed test verifies a deliberately wrong full q is rejected even when the
  occupied row hash is supplied.

No selective weak-bound fallback is added.

## Gate

Do not time until PR #97 Verify is green.

If green, compare on one fresh 4-vCPU Windows runner:
A — retained coalesced winner `e449df20...`
B — pure coalesced all-hot hash reuse (verified PR #97 head)
C — prior all-hot hash reuse + all-noncutoff fallback `48c514e7...`

Primary authority:
whole-process cycles on completed exact `353335714`.

Secondary:
official hard `35333571` at the unchanged 120000 ms ceiling; timeout ratios
remain censored evidence only.

The 4-worker topology remains 1 wide + 3 deep. Single-worker qualification is
forbidden.
