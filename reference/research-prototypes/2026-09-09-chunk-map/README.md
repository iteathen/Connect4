# Chunk-map corrected architecture prototypes — 2026-09-09

These are **research prototypes only**, not maintained Connect4 source.

## Preserved positive seams

- `twoword_solver_chunkmap.mjs` — first corrected logical-ID -> chunkMap -> descriptor prototype. It keeps dependency tracking active throughout the subtree and is retained because that revealed a small avoidable overhead.
- `twoword_solver_chunkmap_tracked_flat.mjs` — optimized form: tracks only while an irreversible dependency cell remains unresolved, then permanently enters the flat serial negamax kernel for that subtree.
- `ybwc_chunkmap_worker.mjs` / `ybwc_chunkmap_tracked_flat_worker.mjs` — worker wrappers.
- `ybwc_chunkmap_forward_worker.mjs` — test-only coarse hold/release wrapper used to prove stale-holder forwarding semantics.
- `chunkmap_forwarding_test.mjs` — direct forwarding + RETIRING grace-period test.
- `chunkmap_cleanup_proof_test.mjs` — opposite-owner proof-only cleanup/recycle test.

Research notes/evidence:

- `docs/research/2026-09-09-chunk-map-indirection-smoke.md`
- `docs/research/2026-09-09-chunk-map-forwarding-grace-smoke.md`
- `docs/research/2026-09-09-chunk-map-proof-cleanup-smoke.md`
- `docs/research/evidence/2026-09-09-chunk-map-forwarding-repeat3.jsonl`
- `docs/research/evidence/2026-09-09-chunk-map-proof-cleanup-repeat3.jsonl`

## Correct ownership model

```text
canonical dependency facts
    -> stable logical chunk ID
    -> shared chunkMap[logical ID]
    -> physical descriptor ID
    -> physical slabs in fixed SAB arena
```

The dependency tree/lattice never owns physical addresses. The chunk map is the sole forwarding/placement authority. A worker resolves at a coarse task/dependency transition and may keep the resolved physical descriptor for the duration of that coarse work. A redirected loser remains valid in `RETIRING` state until stale holders drain, then becomes `FREE`.

No redirect chains, payload migration, path IDs, per-node reference counts, or forwarding polls are required by these smoke tests.

## Reproduction

From this directory:

```sh
node chunkmap_forwarding_test.mjs 4126757563 18
node chunkmap_cleanup_proof_test.mjs
```

The forwarding and proof-cleanup tests were each repeated three times in the saved evidence and preserved exact results.
