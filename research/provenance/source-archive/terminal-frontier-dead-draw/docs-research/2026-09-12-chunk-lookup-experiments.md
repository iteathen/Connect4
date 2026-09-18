# Chunk transformation reuse and cheaper addressing

Research direction / architecture: Josh Oshiro  
Implementation / qualification: OpenAI ChatGPT

## Assess and research

Continues local HEAD `0317c1c95eeae2e6b3e60040eed57198f4f5f9eb` plus the preserved
working tree and composed semantic hash reuse. The prior bounded test issued
2,874,596 chunk intern requests but inserted only 160,743 unique chunks. This
suggested transformation reuse, not permission to treat hash equality as identity.
AGENT_LOCAL and C4-0006/0010 govern residual blocking, normalization, semantic
identity, proof separation and initialization-owned geometry/resources.

For one chunk dictionary, `(parent chunk ID, exact blocking mask)` determines the
result chunk and removed-term count. Equal per-cell masks can share an operation
ID. This invariant is valid for blocking; mover normalization still depends on
the full residual context. No board reconstruction or parity inference is involved.

## Execute, qualify, reassess: rejected structural cache

The first candidate compiled equal nonzero masks during initialization, reserved
4096 parent IDs per chunk dictionary, and used a numeric table containing a result
ID and removed-count/commit byte. It cached identity transformations too. This
added 6,492,630 bytes, or 6.19 MiB per kernel at the measured geometry.

60 controls passed, including variable geometries, prefix overflow fallback,
cached-versus-uncached exact term sequences, dictionary growth, and an injected
interning failure that could not commit an unfinished entry. Ordinary depth-8
search/proof counters matched baseline. The cache avoided 490,290 chunk-intern
calls (17.06%) but most cache hits were identity operations already cheaper to
recognize with two bitwise operations and comparison.

The revised candidate recognized identity directly before consulting the cache.
The changed storage controls passed. Both versions used sequential cold
baseline/candidate/candidate/baseline measurements from the empty 7-column by
6-row connect-4 board, depth 8, hard 60-second timeout:

| Candidate | Baseline mean | Candidate mean | Disposition |
|---|---:|---:|---|
| Cache including identity | 1879.92335 ms | 1945.64970 ms | Removed: 3.50% slower, extra memory |
| Cache only changed chunks | 1872.42720 ms | 1901.14465 ms | Removed: 1.53% slower, same extra memory |

Both exact patches and measurements remain as evidence:
[initial cache](evidence/2026-09-12-chunk-block-reuse/source-manifest.json),
[changed-only cache](evidence/2026-09-12-changed-chunk-reuse/source-manifest.json).
Their implementation, configuration option and tests were restored to the
pre-unit snapshot; no alternate active cache remains. This rejects these cache
layouts at these bounds, not the mathematical transformation invariant.

## Executed final change

The retained `hashWords2` address filter in `quotient-slot64-residual-pool-v2.mjs`
now folds the pair once before the existing avalanche mixer:

```js
return mix32(word0 ^ Math.imul(word1, 0x9e3779b1));
```

This uses three `Math.imul` operations versus eight previously. Exact comparison
of both canonical words remains in the probe loop. Empty chunks still bypass
hashing; known state edges and unchanged parent chunks retain their existing
direct reuse. The shared semantic/proof hash and class/state interning keys did
not change. No strings, parsing, copies, waits, per-call allocation or new retained
memory were introduced by the final change.

59 controls and four local campaigns passed: slot64 residual, semantic TT
replacement, ExploreHint and online dependency parallel. The new adversarial
test creates 400 distinct pairs whose candidate hash folds to zero, including
high-bit words, then verifies unique canonical IDs and reverse lookups after
dictionary rehash. This qualifies collision correctness, not worst-case collision
performance. Existing required workflow paths cover both changed source/test files.

## Final bounded evidence

[Four alternating cold runs](evidence/2026-09-12-cheap-chunk-hash/comparison.json):

| Mean | Baseline | Candidate |
|---|---:|---:|
| Elapsed | 1950.0365 ms | 1929.0560 ms |
| Process CPU | 2094 ms | 2078 ms |
| Kernel typed bytes | 91,823,879 | 91,823,879 |

The 1.08% elapsed and 0.76% CPU differences are within the observed run variation;
no reliable speedup is established. The retained result is fewer arithmetic
operations with identical search/proof/descriptor counters, unchanged memory,
zero search storage growth, and qualified exact collision handling. It does not
establish that the new hash has better probe distribution at all depths.

The [new source-line CPU report](evidence/2026-09-12-cheap-chunk-line-cpu/line-cpu.md)
completed in 1908.513 ms, 2063 CPU ms, with 324 mapped locations. Top estimated
line CPU costs are TT status 98.48 ms, chunk lookup 76.78 ms and singleton
intersection 70.10 ms. These are sampled estimates affected by JIT attribution,
not exact line durations or isolated performance effects.

## Review, cleanup and next owner

The [final unit patch and hashes](evidence/2026-09-12-cheap-chunk-hash/source-manifest.json)
contain only the chunk hash and adversarial storage test relative to the pre-unit
snapshot. `git diff --check` passed. All earlier working-tree changes and useful
evidence are preserved. Isolated baseline and rejected patches remain provenance
until integration. No test process remains, and no full-root trigger or remote
branch was changed.

Next: measure actual chunk probe distributions and memory access cost before
adding more lookup storage. The experiment shows that recognizing an existing
ID through another table can cost more than the work it replaces. Full-root
memory sizing, completion and repository integration remain unqualified.
