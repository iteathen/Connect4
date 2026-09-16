# Frontier-native quotient solver optimization handoff v2

This handoff continues the Connect4 frontier-native quotient solver / Branch Manager work from the compute-synergy checkpoint. It is intended to be sufficient for a new agent/session to resume without reconstructing the current reasoning from chat history.

## Repository / branch

Repository: `iteathen/Connect4`

Active research branch: `research/frontier-negamax-conformance`

Checkpoint head observed before this handoff was written: `cb76f496552d6e6d27cf58518a314831422e27c9`; the checkpoint note itself advances the branch, so **do not assume that SHA remains head**. Inspect the branch and preserve newer valid work.

## Governing cycle

For every meaningful unit use:

**assess → research → reassess → plan → execute → qualify → review → cleanup/document**

Treat prior-agent conclusions, comments, issues, PR descriptions, CI output, historical code, research notes, and this handoff as evidence, not authority. Read actual repository state and governing specs/contracts before mutation.

## Required authority

Read at minimum:

1. account-global `iteathen/.github/AGENTS.md` once the compute-synergy PR is integrated;
2. repository `AGENT_LOCAL.md`;
3. `docs/specs/C4-0001-domain-v1.md`;
4. `docs/specs/C4-0006-control-parity-and-winspace-v1.md`;
5. `docs/specs/C4-0010-quotient-native-negamax-v1.md`;
6. `STATUS.md`;
7. `next_step.yaml`;
8. `docs/research/2026-09-12-universal-optimization-checkpoint.md`.

If touching parity/Zugzwang control, blockers, strategic terminalization, race/deadline facts, event-frontier compression, or nested certificates, also read C4-0007 and the relevant research notes.

## Semantic constraints

Do not turn this into conventional minimax/alpha-beta with Connect Four heuristics. The forward solver is quotient-native exact Negamax over the Connect4 structural frontier and consumes C4-0006/C4-0007 structural meaning.

Ordinary exact forward quotient identity remains:

```text
supportIndex
+ normalized P0 residual antichain
+ normalized P1 residual antichain
```

`sideToMove` derives from support rank parity. Worker-local qIDs/class IDs, term IDs, hashes, packed support encodings, cache indices, and fingerprints are implementation representations, not semantic identity.

Shared proof equality remains exact semantic content. Hash/fingerprint values may accelerate addressing/rejection but are not equality authority unless injectivity is actually proved for the supported domain.

## Optimization doctrine now governing this lane

Maximize **synergy**. Prefer representations that carry multiple useful invariants so producer and consumer both become cheaper.

Distinguish:

- **integral complexity** — sophisticated load-bearing representation that removes wider work;
- **scope complexity** — extra helpers/caches/conversions/wrappers/repair machinery compensating for weaker structure.

Prefer integral complexity when it is exact, locally owned, reviewable, and reduces total work.

Optimization order:

```text
intrinsic invariant-bearing representation
  -> reuse invariant across boundaries
  -> eliminate redundant derivation/materialization/traversal
  -> spend bounded memory to reduce compute/dependent loads/probes/branches
  -> improve locality/JIT visibility
  -> micro-optimize remaining instructions
```

Memory and compute are jointly budgeted. Preallocation is intentional. Current bounded search is designed to allocate/reserve before recursion, seal tables, then run without hot growth or rehash. Do not interpret the historical preallocation result as “preallocation is slow.” A later reservation-size A/B showed the larger sealed tables were ~3% faster because sparse buckets reduced probe work despite much higher memory.

On this extreme hot path, ~0.5% total CPU is material when it survives paired evidence.

A regressing candidate blocks stacking. Audit the whole causal neighborhood, not only the edited line; paired/repeated retest; if it still loses, record and remove/supersede it before continuing.

Native policy: stay in Node/JS when the capability can be done adequately there. If a genuinely consumer-neutral primitive materially benefits from native/GPU/SIMD/runtime support and Node cannot deliver the result adequately, implement it universally in the proper CUDA-* library and consume it through a public Node-facing contract. Do not add Connect4-specific native escape code.

## Packed state / identity findings

Current packed ordinary state identity is stored in two `Uint32` words for the standard fitted layout, with wider fallback where required.

Field recovery is mask/shift based. Exact local packed equality is word equality. Local state table addressing is derived from the packed words rather than storing a second authoritative identity.

The useful question is not simply “can hash be cheaper?” The deeper target is co-design of:

- exact packed identity;
- field extraction;
- equality;
- address entropy;
- table geometry/load factor;
- memory locality;
- compiler/JIT visibility.

One representation should carry as much of that burden as exactness permits.

## Residual-class / descriptor seam

The slot64 residual owner stores canonical class content as fixed chunks/bitsets. It already owns class cardinality and other metadata.

The semantic descriptor cache historically performs a second traversal:

```text
canonical packed class content
  -> materialize sorted Uint16 term IDs
  -> hash term IDs
  -> cache class hash pair
  -> compose state semantic hash
```

This is a prime synergy seam. The canonical owner already has the exact content. The intended direction is:

```text
canonical class creation/transition
  -> carry content-stable semantic fingerprint
  -> local class addressing
  -> descriptor publication
  -> state semantic hash / shared TT
```

Exact canonical term/tuple comparison remains authority. Do not replace equality with fingerprint equality.

## Reinterpretation of older performance results

Do not mechanically classify previous negative measurements as proof that their underlying structural idea is bad.

- Lazy mover: branchy implementation is rejected; dense arithmetic won. Preserve the locality insight but fuse more invariant production into the dense pass.
- Direct residual read: isolated copy removal was essentially noise; reconsider only as a fused producer/consumer design.
- Compact chunk index: saved memory but added dependent collision-link work and was timing-neutral/slightly negative. Given available memory, the opposite direction—larger sparse fixed tables—can be better.
- Old state-hash removal/hash-width results: tested isolated storage/filter choices, not an integrated packed identity/fingerprint representation.
- Changed-slot class hashing: successful evidence that parent + delta structure should carry work instead of rewalking complete tuples.
- State-hash reuse: successful evidence that ~2 MiB/worker can be an excellent purchase when it removes repeated semantic hash work.
- Direct semantic edge reuse: very strong evidence that memory can purchase major compute elimination.

## Proof-handle candidate is no longer unresolved

Candidate `7d1d2caf4d556d6e4033e30d69a419936dcf7cb0` removed the duplicate `assertStateId(stateId)` from `rememberHandle`.

Parent baseline: `58770f4171772c9326d7f6c0e1d5bc50d60540a5`.

Dedicated hosted paired A/B:

- workflow commit: `0c0e6f0eae896540cdfbc1991307d90d105606fd`
- run: `34736592492`
- job: `103669004238`
- Node: 26.7.0
- Ubuntu: 24.04
- symmetric warmup
- ABBA/BAAB measurement order
- all semantic/work invariants identical

Means:

- baseline elapsed `2934.2990795 ms`
- candidate elapsed `2916.5463380 ms`
- candidate ~0.605% lower elapsed mean
- baseline CPU `3225.8495 ms`
- candidate CPU `3204.2930 ms`
- candidate ~0.668% lower CPU mean
- median elapsed only ~0.116% lower

Disposition: **retain / cleared non-regressing**. The earlier one-off slower sample was misleading/noisy. Do not revert this candidate merely because that old sample exists.

## Integrated-hash experiment history at handoff

Temporary workflow scaffolding was created on the research branch after the proof-handle gate:

1. `frontier-integrated-content-hash-ab.yml` initial generated patch, commit `2d84e82b3f9a3f650ff9399d2b495a07e6466685` — failed before candidate execution because the patch text was malformed. No candidate conclusion.
2. Repaired exact-substitution version, commit `b7eaaafe243ab50b9c249f2f0f6146e5e98e4302` — failed before candidate execution because the guarded source seam did not match exact indentation. No candidate conclusion.
3. `frontier-direct-semantic-hash-ab.yml`, commit `c99dd2ef5598230df9a1f1f07a340912bec9b4f9` — narrow experiment to hash directly from canonical packed residual DWORDs while preserving the existing semantic hash values and exact identity. Review actual run before drawing conclusion.
4. `frontier-canonical-class-hash-ab.yml`, head observed `cb76f496552d6e6d27cf58518a314831422e27c9` — deeper experiment to make canonical class construction carry a content-stable fingerprint that can serve local class addressing and semantic publication. Review actual run/output before any production adoption.

These are experiment workflows, not retained production changes. Clean them after evidence is durably recorded.

## Immediate continuation

1. Inspect current branch head; preserve newer valid work.
2. Inspect the latest workflow runs for the direct packed semantic hash and canonical class hash experiments.
3. For each, separate harness failure from candidate failure. A generator/patch/seam error proves nothing about candidate performance.
4. If a candidate executed, verify exact semantic/work counters first.
5. Compare elapsed/CPU, kernel bytes, descriptor bytes, RSS, TT bucket scan, class builds, term writes/materialized IDs, and local class-table behavior.
6. Audit producer + consumer. A descriptor win that makes class construction worse may be net-negative.
7. If direct packed semantic hashing wins without hash-semantic changes, it is the lower-risk first production candidate.
8. Then test carried canonical class fingerprint ownership. Prefer one invariant generated while class content is already hot and reused by both local addressing and shared descriptor publication.
9. Co-design table geometry and fingerprint cost. Current deliberately large sealed tables mean the address function may not need a heavy avalanche if distribution under actual quotient states is already sufficient.
10. Exact tuple/term comparisons remain identity authority.
11. Do not stack over a measured regression.
12. Do not launch a new full root solely because a micro/representation optimization passes.
13. Do not modify `standard7x6-root-qualification-revision.txt` during this campaign.
14. Periodically persist retained/rejected findings to research docs so context resets do not erase them.
15. Reconcile `STATUS.md` and `next_step.yaml` once the experiment disposition is stable.
16. Clean temporary workflows/benchmark branches after evidence preservation.

## Expected handoff output from the next session

Report exact retained/rejected candidates, source SHAs, workflow run/job IDs, exact semantic counter equality, CPU/elapsed/memory changes, causal explanation, cleanup state, and the next structural seam. Avoid generic optimization advice; execute against actual repository state.
