# Universal optimization checkpoint

**Date:** 2026-09-12
**Branch:** `research/frontier-negamax-conformance`
**Research direction / architecture:** Josh Oshiro
**Implementation / qualification:** OpenAI ChatGPT

## Purpose

Preserve the current optimization doctrine and the exact frontier-native solver seam before another context handoff. This is a durable research checkpoint, not specification authority. C4-0001/C4-0006/C4-0010 and the current repository state remain authoritative for solver semantics.

## Universal optimization doctrine distilled from the current work

The strongest optimization pattern is to maximize **synergy**: choose representations whose structure carries multiple useful invariants so the system avoids computing the same facts repeatedly at different boundaries.

The desired shape is not “spend more work at construction so reads are cheaper.” The better target is a representation that is simultaneously cheaper to create, cheaper to store, cheaper to compare, cheaper to address, and cheaper to decode because several operations become projections of the same underlying invariant.

This favors **integral complexity** over **scope complexity**. Integral complexity is sophistication embedded in a load-bearing representation because it collapses work globally. Scope complexity is extra caches, helpers, conversions, wrappers, repair paths, or duplicated metadata layered around a weaker representation. Integral complexity is acceptable when it remains exact, locally owned, reviewable, and reduces total work.

Optimization preference for extreme hot paths:

```text
make useful facts intrinsic to the representation
  -> reuse one invariant across producer and consumer boundaries
  -> eliminate redundant derivation/materialization/traversal
  -> trade bounded memory for fewer operations/probes/branches/dependent loads
  -> shape data for locality and compiler/runtime visibility
  -> micro-optimize the remaining instructions
```

Memory and compute are a joint budget. Preallocation is intentional when it buys fixed backing stores, zero recursive growth/rehash, lower load factors, shorter chains, predictable addresses, fewer lifecycle branches, or better JIT visibility. A memory reduction that increases compute or dependent memory traffic is not automatically an optimization.

For this solver, sub-percent CPU reductions are material when they sit on the deepest recursive/hot lookup path. A 0.5% total CPU improvement is worth pursuing if exactness is preserved and paired evidence supports it.

A regressing candidate blocks stacking. Audit not just the changed line but the causal neighborhood:

```text
upstream producer/invariants
  -> changed representation/boundary
  -> cache/address/probe/allocation/JIT behavior
  -> downstream consumers/repeated work
  -> memory/locality/concurrency consequences
```

Then run deliberate paired/repeated comparison. If it still loses and no higher-priority correctness/resource requirement justifies it, record and remove/supersede it before proceeding.

Consumer-neutral native/accelerated capabilities belong in reusable lower-layer libraries. Connect4 should not accumulate bespoke native solver escape hatches. If a capability genuinely cannot be achieved adequately in Node/V8 and native materially wins, promote the general primitive into the appropriate CUDA-* owner and consume it through a public Node-facing contract.

## Current machine-representation insight

The live packed state representation stores exact ordinary quotient identity in two `Uint32` words for the standard supported layout, with a wider fallback where required. Field consumers recover support/P0/P1 components via masks and shifts. Exact equality is packed-word equality. Local bucket addressing is derived separately.

The important design opportunity is therefore not merely “use a cheaper hash.” It is to co-design exact packing, extraction, equality, address entropy, table geometry, and preallocated capacity so one structure carries more of the lookup burden.

The residual-class owner similarly already holds canonical packed bitset/chunk content. The descriptor layer historically materializes term IDs and hashes them later for semantic publication. That is duplicated traversal over information already owned canonically. The current research direction is to move/carry content-stable semantic fingerprint work into the canonical residual owner without making the fingerprint exact equality authority.

## Performance-result reinterpretation

Earlier negative results were reclassified under the synergy doctrine:

- **Lazy mover/locality branch candidate:** genuine rejection of the branchy implementation. The locality idea was sound, but masks/branches/dependent reads/dirty machinery cost more than dense arithmetic. Keep the dense transform and make it carry more useful invariants instead.
- **Direct residual read:** not a strong rejection. It removed a copy but was measured only as an isolated change; reconsider only as part of a fused producer/consumer representation.
- **Compact chunk index:** optimized bytes in isolation. It saved memory but added collision links/dependent accesses and was timing-neutral/slightly negative. Given available memory, larger sparse fixed tables are often the better compute trade.
- **Old state-hash removal/hash-width experiments:** do not refute integrated identity/fingerprint design. They removed one filter while leaving separate addressing and exact comparison work intact.
- **Changed-slot class hashing:** strong positive evidence for synergy; reuse parent/changed-slot information instead of rewalking complete tuples.
- **State-hash reuse:** strong positive evidence that a small memory purchase can eliminate repeated computation.
- **Direct semantic edge reuse:** strongest example so far; memory bought removal of the vast majority of repeated transition work.
- **Reservation-size A/B:** both variants remained preallocated/sealed. Larger tables were faster despite higher memory because lower load reduced probe work. This supports memory-for-compute, not dynamic growth.

## Proof-handle candidate disposition

Candidate source: `7d1d2caf4d556d6e4033e30d69a419936dcf7cb0`
Parent baseline: `58770f4171772c9326d7f6c0e1d5bc50d60540a5`

A dedicated hosted paired A/B was added at commit `0c0e6f0eae896540cdfbc1991307d90d105606fd` and executed as run `34736592492`, job `103669004238` on Node 26.7.0 / Ubuntu 24.04.

Symmetric warmup and ABBA/BAAB ordering were used. Every semantic/work invariant matched across all eight measured runs.

Results:

- baseline elapsed mean: `2934.2990795 ms`
- candidate elapsed mean: `2916.5463380 ms`
- elapsed mean ratio: `0.9939499209` (~0.605% lower candidate)
- baseline elapsed median: `2920.3647315 ms`
- candidate elapsed median: `2916.9911210 ms`
- median ratio: `0.9988447982` (~0.116% lower candidate)
- baseline CPU mean: `3225.8495 ms`
- candidate CPU mean: `3204.2930 ms`
- CPU ratio: `0.9933175742` (~0.668% lower candidate)

The prior single slower sample was noise/misleading. The duplicate `rememberHandle` state-validation removal is cleared as non-regressing and slightly favorable under paired evidence. Do not revert it based on the earlier one-off timing.

## Integrated semantic hash experiments started after the proof-handle gate

Three temporary workflow experiments were created on the active research branch while exploring the canonical-content seam:

1. `frontier-integrated-content-hash-ab.yml` initial generated-patch attempt at commit `2d84e82b3f9a3f650ff9399d2b495a07e6466685` failed before candidate execution because the generated patch was malformed. No semantic/performance conclusion.
2. Repaired exact-substitution harness at `b7eaaafe243ab50b9c249f2f0f6146e5e98e4302` failed before candidate execution because the frozen seam text did not match indentation. Again, no semantic/performance conclusion.
3. `frontier-direct-semantic-hash-ab.yml` at `c99dd2ef5598230df9a1f1f07a340912bec9b4f9` was created to test the narrower candidate: derive the existing semantic hash directly from canonical packed residual DWORDs instead of materializing an intermediate `Uint16` term sequence first. This candidate intentionally preserves the existing hash function and exact identity semantics.
4. A follow-up canonical class-hash experiment workflow was later added at head `cb76f496552d6e6d27cf58518a314831422e27c9` to explore deeper ownership: class creation carries a content-stable fingerprint used by both local class addressing and semantic publication. Treat this as experimental evidence only until its run and exact candidate output are reviewed.

These workflows are experiment scaffolding, not production solver code. Their eventual cleanup/disposition remains part of the next session.

## Current active branch and protected state

Repository: `iteathen/Connect4`
Active branch: `research/frontier-negamax-conformance`
Observed branch head at this checkpoint: `cb76f496552d6e6d27cf58518a314831422e27c9`

This head contains experiment workflow additions after the earlier research-note checkpoint. Preserve newer valid work; do not reset to the older expected SHA.

Do not modify the standard full-root qualification trigger as part of optimization experiments. No new full-root solve is justified by these micro/representation changes alone.

## Next execution seam

1. Re-anchor branch and inspect any commits newer than `cb76f496...`.
2. Read results of the currently running/latest direct packed/canonical class hash workflows before changing production source.
3. Distinguish harness failure from candidate failure. The first two integrated-hash runs never executed candidate code and therefore carry no performance conclusion.
4. If the direct packed hash candidate preserves exact hash values and wins, prefer that narrow removal of term-ID materialization first.
5. Then test deeper ownership: generate/store semantic fingerprint during canonical class construction/transition so descriptor publication becomes a direct metadata read.
6. Co-design local class table addressing with that same carried fingerprint and the deliberately sparse preallocated table geometry. Exact tuple/term content remains equality authority.
7. Measure producer and consumer together. A candidate that makes descriptor lookup cheaper but class construction materially slower is not accepted without a net win.
8. Keep memory trade explicit. Spending several MiB to remove high-multiplicity traversal/probes is acceptable under the current solver budget if end-to-end CPU improves.
9. Preserve/reconcile research findings in `STATUS.md`, `next_step.yaml`, and research notes once a candidate is actually retained or rejected.
10. Remove or archive temporary benchmark workflows after their evidence is durably recorded.

## Universal guidance publication

The account-global `iteathen/.github/AGENTS.md` should receive the reusable doctrine above under a compute-synergistic optimization section. The protected `main` branch requires PR-based publication and the `Community quality` status check. Connect4 should contain only its local specialization rather than duplicating the universal doctrine.
