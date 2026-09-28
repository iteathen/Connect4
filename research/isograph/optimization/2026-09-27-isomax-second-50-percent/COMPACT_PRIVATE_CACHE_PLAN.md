# IsoMax Phase-2 plan — compact private/local exact-bound cache

Date: 2026-09-28
Status: planned experiment from selected baseline `9594b6b88420d60f113cb5af560de2f128aec0da`.

## Trigger

The compact shared exact cache qualified decisively:
- pooled whole-process cycles -1.923%, 95% [-2.360%, -1.486%];
- cycles/node -1.382%;
- shared bytes -37.255%;
- RSS -27.373%.

The same search still keeps a private per-worker exact/bound cache at
1,048,576 rows. Standard 7x6 private rows still store and compare the full
14-word q identity.

A prior meta-only 14->13 private/shared experiment did not qualify. This is a
materially different reduction: use the already-qualified lossless 8-word exact
identity locally as well, removing six key words per private row.

## Exactness boundary

Keep unchanged:
- full private q representation;
- full 14-word locator hash;
- direct-map slot selection;
- exact values;
- private LOWER0/UPPER0;
- same-q bound coalescing;
- compact shared exact cache from `9594b6b...`.

Only the private cache row identity representation changes after the full-q
locator has selected a slot.

For the initialized standard 7x6 geometry:
- stored private identity: 14 -> 8 uint32 words;
- exact comparison uses the same lossless compact support/residual encoding as
  the qualified shared cache;
- nonmatching geometries retain the full-key private path.

The full-q hash remains the locator specifically to avoid paying compact packing
unconditionally at every node.

## Hot-path hypothesis

Private cache lookup occurs at every searched node. Once a row is occupied, the
current standard path may compare 14 local words. Stores copy 14 words.

The proposed path:
- preserves the first two raw support heights as cheap discriminators;
- packs support/tail only after the occupied-slot path is reached;
- compares/stores 8 local words;
- reduces each 1,048,576-row private key array by 24 MiB;
- across four workers, removes 96 MiB of private key storage.

This may improve cache locality and local row traffic enough to outweigh compact
packing. No claim is accepted from memory reduction alone.

## Required implementation discipline

Create an isolated JSMinSys branch from exactly `9594b6b...`.

The private-cache constructor must receive initialized geometry and choose a
guarded compact layout only at initialization. Arbitrary geometry fallback must
remain exact/full-key.

Do not weaken the runtime-geometry audit.

Mirror changes into all generated behavior/frontier search variants using the
repository build authorities; do not hand-diverge generated copies.

Every changed JSMinSys source path must update and reseal cycle accounting in
the same work.

## Correctness gates

- compact private exact hit;
- forced locator collision rejects different q;
- LOWER0/UPPER0 same-q coalescing remains exact draw;
- exact rows still outrank weak bounds;
- nonstandard geometry retains full-key behavior;
- Verify/schema/runtime-geometry/Node compatibility green;
- no single-worker execution.

## Benchmark

A = `9594b6b...` selected compact-shared baseline.

B = compact-shared + compact-private candidate.

Fixed:
- 4 workers = 1 wide + 3 deep;
- rootFrontier=true;
- shared cache 4,194,304;
- local cache 1,048,576 per worker;
- full sharing / sharedSampleMask=0;
- Node 26.7.0.

Primary fixture `353335714`: balanced completed exact A/B blocks.
Authority: whole-process cycles.

Secondary fixture `35333571`: 120000 ms application ceiling; censored if
either arm times out.

Reject if exact correctness fails or completed exact whole-process cycles do not
establish improvement.

PR #84 remains draft/open and is not authorized for merge by this work.
