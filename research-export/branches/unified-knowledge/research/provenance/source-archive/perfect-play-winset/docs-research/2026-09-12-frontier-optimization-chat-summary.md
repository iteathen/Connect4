# Frontier optimization chat summary

This is a derivative continuity aid for the September 12 optimization discussion. It is not specification authority. Use the repository specs, actual source, CI, and current-state files as authority/evidence as appropriate.

## Core owner direction

The owner clarified the intended optimization philosophy for the hottest solver path:

- Stay in JavaScript/Node by default.
- Treat V8/JIT output as serious systems code; expose simple stable invariants so the runtime can emit the intended machine operations.
- A sub-percent total CPU gain can be worth pursuing on an extremely high-multiplicity hot loop.
- Use packed fixed-width representations aggressively when exactness permits; bit masks/shifts are cheap compared with repeated dependent loads, hashing, allocation, polymorphism, or object reconstruction.
- Native solutions should not become product-specific escape hatches. If a native/GPU/SIMD/runtime primitive is genuinely needed and materially better, implement it universally in the appropriate reusable CUDA-* library and consume it from Connect4 through a public Node-facing contract.

## Packed identity correction

An early discussion incorrectly described the current packed state as “ID plus hash.” The code inspection corrected this.

The current packed state owner encodes the exact ordinary local quotient state into packed `Uint32` words. Support/P0/P1 fields are recovered through masks/shifts. Local table bucket addressing is computed from the packed identity. Exact equality is packed-word comparison.

The important optimization question therefore became whether packing, extraction, equality, addressing entropy, and table geometry can be co-designed so the structure itself carries more of the work, rather than layering independent derived representations.

## Integral versus scope complexity

The owner introduced the useful distinction that the desired complexity is **integral** rather than broadening scope.

A deeply integrated representation can be more sophisticated internally while reducing total system complexity because it replaces multiple derived mechanisms. The goal is to make facts intrinsic to the structure rather than repeatedly compute/cache/repair them elsewhere.

The best case saves compute on both ends: construction and consumption both become cheaper because several operations are projections of the same invariant.

## Memory-for-compute

The owner explicitly reinforced that memory is an optimization resource. Preallocation exists to spend memory deliberately in exchange for less compute and more predictable execution.

The correct interpretation of the existing sealed-search design is:

```text
preallocate / reserve
  -> perform any setup-time growth/rehash before recursion
  -> seal
  -> recursive search with fixed backing stores and zero hot growth/rehash
```

The later reservation-size A/B compared two sealed/preallocated sizes, not preallocation versus dynamic growth. The larger reservation was faster despite much higher memory because it reduced bucket load/probe work.

## Re-reading negative results

With this doctrine, several previous “bad” results were reinterpreted:

- A memory-saving candidate may be bad if it increases collision chains/dependent reads.
- Removing a copy/hash/validation in isolation can fail because the surrounding representation still pays the original work elsewhere.
- Failed isolated candidates can still reveal a useful invariant that should be integrated into a larger representation.
- Successful changed-slot hashing, semantic state-hash reuse, and direct semantic-edge reuse are strong evidence for structural reuse and memory-for-compute.

## Regression discipline

The owner requires that performance regressions not remain stacked in the active path.

A meaningful slowdown or resource regression triggers:

1. stop stacking;
2. inspect exact diff;
3. trace upstream producer → changed boundary → downstream consumers;
4. include cache/table/JIT/locality/allocation effects;
5. reassess premise;
6. run paired/repeated comparison under comparable conditions;
7. retain only if non-regressing or justified by a higher-priority requirement;
8. otherwise record and remove/supersede the candidate before continuing.

## Proof-handle result

The unresolved one-line proof-handle validation removal was paired against its parent with symmetric warmup and ABBA/BAAB ordering.

Run `34736592492`, job `103669004238` showed identical semantic/work counters. Candidate elapsed mean was ~0.605% lower and CPU mean ~0.668% lower; median elapsed was essentially flat/slightly favorable. The candidate is therefore cleared as non-regressing. The earlier single slower sample was noise/misleading and should not drive a revert.

## New structural seam

The current residual owner contains canonical packed class content. The local semantic descriptor layer later materializes sorted term IDs into scratch and hashes them for semantic publication. This is duplicate work over information already present canonically.

The favored direction is to make canonical residual construction/transition carry a content-stable fingerprint so it can serve multiple consumers:

```text
canonical residual content
  -> carried fingerprint
      -> local class addressing
      -> semantic descriptor publication
      -> composed state fingerprint/shared TT addressing
```

The fingerprint remains an accelerator only; exact content remains equality authority.

## Experiment scaffolding status

Several temporary workflows were created to explore this seam. The first two integrated-hash attempts failed in the harness before candidate execution (malformed patch, then exact source-seam mismatch), so neither supports a performance conclusion. Later direct packed semantic-hash and canonical class-hash workflows were created and must be inspected from actual run state before adoption.

## Durable references

See:

- `docs/research/2026-09-12-universal-optimization-checkpoint.md`
- `docs/research/2026-09-12-frontier-optimization-handoff-v2.md`
- C4-0001 / C4-0006 / C4-0010
- `STATUS.md`
- `next_step.yaml`

