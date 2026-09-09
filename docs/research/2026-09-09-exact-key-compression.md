# Exact shared-TT key compression: fixed-format integration experiment

Date: 2026-09-09. Status: research evidence, not maintained implementation.

## Outcome

The direct-mapped shared TT can encode its exact 49-bit position identity using one 32-bit stored word plus existing index bits, rather than two stored key words. The unchanged bound, writer diagnostic and publication-control fields bring the experimental entry size from 14 to 10 bytes: **28.57% less TT backing memory at the same entry capacity**.

This is exact reconstruction, not probabilistic tagging. The collision pattern, replacement rule, bound semantics, tactical/move ordering, and eldest-first two-lane YBWC search policy were held unchanged within each comparison. No dependency allocation, cleanup, move hints, or per-node scheduler code was introduced.

Timing is workload-dependent. The more demanding position showed promising reductions; the smaller position was effectively tied. These small sandbox batches do not establish universal speedups or production readiness.

## Actual starting state and provenance

Remote reads before local construction:

- Research branch: research/exact-solver-perf-checkpoint-2026-09-08 at 15b9ba5267ef497d218a0c476c98dcb1c51b796e.
- Main: de47d43f4f4133a68973d0876a402531ef5735da.
- Read global AGENTS.md, local AGENT_LOCAL.md, STATUS.md, the current invariant audit, and the preserved kernel, shell and independent cell-array probe.
- Kernel Git blob: 965c3806c92a7add544dce4777d965b3e12376d6.
- Original shell/harness Git blob: 828ea45ee3c3a8a0da419754d156026bd89ee6fa.
- Original cell-array invariant probe Git blob: 7f278b52e6703fe1c213aa8bde5ff8bf4eaaf0c2.

The two imported source files were materialized locally and checked against their Git blob hashes before use. The build scripts pin those inputs. New code was constructed in this owner-authorized session. No external implementation patch was imported. Maintained Connect4 source and all pre-existing prototypes were left unchanged.

The local directory is a repository-relative evidence overlay, **not a complete Git clone**. Direct Git access failed DNS resolution; the exposed GitHub actions were read-only, including after full discovery and plugin-directory lookup. **No remote commit or issue update is claimed.** The delivery contains the overlay, pinned inputs, raw evidence, generated sources and an additive patch.

## Question and two successive candidates

Candidate 1, compact, takes the unused high bits of the existing transformed low key and combines them with the 17 meaningful high key bits. The selected table index supplies the omitted low bits. Its stored encoding depends on descriptor width.

Candidate 2, compactFixed, improves the integration: always omit exactly the lowest 17 index bits. Every supported descriptor is at least 128K entries, so those bits are always present in the slot. This uses the same 32-bit stored word at every supported width and uses constant shifts in the hot kernel. Larger indices contain redundant bits, which cost no additional storage.

This second candidate is preferable architecturally because supported-size changes need not reinterpret key bytes. It was not uniformly faster than candidate 1, and no claim of universal superiority is made.

## Exactness argument

Write the canonical key as low word L and high word H, where 0 <= H < 2^17. Let all following low-word arithmetic be modulo 2^32:

    t = L XOR imul(H, 0x9e3779b1)
    x = imul(t XOR (t >>> 16), 0x85ebca6b)
    index = x AND (2^k - 1)

This is the pre-existing slot hash, not a newly chosen collision policy.

For a fixed H, XOR with imul(H, constant) is invertible. The xor-right-16 transform is its own inverse. The odd multiplier 0x85ebca6b is invertible modulo 2^32, with inverse 0xa5cb9243.

Candidate 1 stores:

    q = (H << (32-k)) OR (x >>> k)

Candidate 2 always stores:

    q = (H << 15) OR (x >>> 17)

For candidate 2, recover H = q >>> 15 and x = (q << 17) OR (index AND 0x1ffff). Invert the multiplication and the two XOR transforms to recover L. Therefore equal index and q imply the same full canonical key; collisions of this pair are impossible within the stated domain. Random testing is not the basis for the injectivity claim; the inverse is.

The constructors require 17..30 index bits. Numeric reconstruction was checked throughout that range; physical arenas were only exercised at 17..21. No huge-arena allocation guarantee is claimed. Descriptors smaller than 128K require another exact format or the existing full-key baseline. This does not authorize silently restricting a general allocator to these widths.

## Qualification performed

Original compact candidate:

- 12,845,056 round trips: all 17-bit high words, six low-word boundaries and one sampled low word, for each index width 17..30.
- Independent cell-array exact oracle: 128 late-game cases, including 29 with no immediate current-player win; 522 valid bound-window checks across both variants. Those windows reused the exact-solve cache history.
- Public immediate-win guard, sequence 121212: score 18.
- Full exact-score solves for 663152175 (-4) and 41267575 (+3) at 256K, 512K, 1M and 2M entries. Every score, node/hit/write counter and occupied final TT entry agreed between baseline and compact after decoding. Final values, owner tags and control words were also compared.

Fixed-format candidate:

- 1,835,008 additional cross-width reconstruction checks.
- Independent cell-array oracle: 128 cases and 342 valid **cold-cache** null-window checks across baseline and fixed variants.
- The same eight full-solve/final-table equivalence cases passed.
- 13,048,653 retained-entry addressing checks across smaller aligned regions passed without copying or rewriting keys.

The retained-region check proves an addressing/encoding property only. It does not implement a dynamic allocator, prove live-holder safety, or purify a descriptor's resident dependency scope. Those remain separate obligations.

Early-position expected scores came from preserved owned evidence, not an independent early-position oracle. The cell oracle is independent of bitboard mechanics but intentionally small and late-game only. Multicore root agreement and counter observations do not prove the shared-memory publication protocol portable or free of every torn-hit execution.

## Failure preserved and corrected

The first qualification run stopped because Node strict assertion distinguishes +0 from -0. The independent recursive oracle produced -0 for a draw while the public solver normalizes to +0. This was a test expectation issue, not a numerical disagreement or a compressed-key failure.

The original failing source is qualify-v1-zero-sign.mjs; its full stdout, stderr and exit status are retained. The correction normalizes the oracle draw result at the comparison boundary, not the solver. The replacement then passed. Initial build/layout/benchmark sources are likewise kept as version-1 files; the original baseline and compact generated kernel hashes did not change when compactFixed was added.

## Performance protocol

Environment: Linux x64, Node v22.16.0, AMD EPYC 9V74 as reported by the sandbox, four available logical execution lanes. This is not Windows or the project's newer target Node runtime qualification.

Each configuration uses one fixed shared arena per candidate. Only one candidate searches at a time. Two or three warmed pools remain resident to alternate modes without recreating workers; their combined process RSS is not presented as a memory-saving measurement. TT arena bytes, mailbox bytes, active and initialized workers are recorded separately.

The retained YBWC prepare/pneg/solve functions are extracted unchanged from the hash-pinned owned shell. Split depth is four and speculative lane cap two. A common numeric SAB mailbox replaces the old object-message transport for every candidate; it never enters negamax. Thus compare candidates within this harness, not absolute timings against the old transport. The inherited coordinator still uses BigInt and allocates shallow search objects; this does not qualify a maintained end-to-end numeric shell.

Two whole-solve warmups per mode precede measurement. Every trial starts with a cold, pre-touched TT. Worker creation, TT clearing and evidence serialization are excluded; coarse scheduling and the complete exact-score solve are included. One-worker paired runs require identical scores, nodes, hits, writes and shell/task counters. Four-worker node counts can differ with interleaving.

Two-way batches alternate order. Three-way batches cycle all six permutations. No slow runs were discarded. The raw files retain warmups, timings, node/hit/write counters, per-worker nodes, environment and cgroup state. In total: **162 measured solves and 44 warmup solves**. Full-solve qualification runs are separate.

### Fixed-format comparison against full keys

Each row is its own interleaved three-way batch. Milliseconds are medians, not best runs. Percentages below are ratios of medians; raw summary also reports median paired ratios so that these are not conflated.

| Position | Workers | Entries | Full-key ms | Fixed-format ms | Median time reduction | Faster paired runs |
|---|---:|---:|---:|---:|---:|---:|
| 41267575 | 1 | 512K | 1312.16 | 1157.21 | 11.81% | 5/6 |
| 41267575 | 4 | 512K | 1148.62 | 1042.79 | 9.21% | 4/6 |
| 41267575 | 4 | 1024K | 1265.77 | 1098.13 | 13.24% | 5/6 |
| 663152175 | 4 | 256K | 110.98 | 110.48 | 0.46% | 6/12 |

The smaller four-worker case is effectively tied, not a 0.46% established improvement. At 512K/four workers the candidate wins only four of six pairs, so the favorable median is provisional. At 1M/four workers it wins five of six pairs and searches about 0.17% more median nodes while completing faster. At 512K/one worker all three modes search exactly 5,854,083 nodes.

The initial size-dependent compact candidate was essentially tied/slightly slower at 512K/four workers in its first eight-pair batch. At 1M/one worker it won all eight pairs, with identical 5,155,878 nodes. Its larger-table four-worker batches showed about 8.3% and 7.6% lower medians at 1M and 2M respectively. These preliminary batches remain separate; they were not selectively pooled with the later three-way runs.

### Byte accounting

| Entries | Full-key TT | Either compact TT | Saving |
|---:|---:|---:|---:|
| 256K | 3.5 MiB | 2.5 MiB | 1 MiB |
| 512K | 7 MiB | 5 MiB | 2 MiB |
| 1M | 14 MiB | 10 MiB | 4 MiB |
| 2M | 28 MiB | 20 MiB | 8 MiB |

All entries retain the writer diagnostic byte and four-byte publication control. No instrumentation field was hidden to obtain this comparison. Equal entries are intentional: the first question is whether the same cache knowledge fits and runs better in fewer bytes. This is not a capacity selector or equal-byte capacity sweep.

## Review and limits

The compact comparison changes key arithmetic, first-stage rejection, and key memory traffic together. Its speed cannot be attributed uniquely to cache footprint. Removing the second key word also removes its validated load and its publication store; a complete quotient comparison can avoid some plausible first-word matches. Additional quotient arithmetic offsets part of that gain.

Hash placement and serial final-table equality give stronger causal isolation than a result that merely returns the same root score with a different search tree. Multicore evidence is necessarily noisier. Six-to-twelve-pair batches across two positions remain exploratory, not a universal performance contract.

The research publication scheme is inherited. Its ordinary shared data accesses, version validation, wrap and architecture portability need separate qualification; no new proof is claimed. The fixed key encoding solves an index-width integration issue, not publication, descriptor lifecycle or resident-scope ownership.

Move ordering, bound-retention policy, dependency identity, TT grouping, fixed arena capacity, physical reclamation and main remain unchanged by this unit. No remote publication or production promotion is claimed.

## Reproduction

From the repository-relative root of this bundle, or after applying the additive patch to a repository with the two pinned input files:

    node reference/research-prototypes/2026-09-09-exact-key/qualify.mjs
    node reference/research-prototypes/2026-09-09-exact-key/qualify-fixed.mjs
    node reference/research-prototypes/2026-09-09-exact-key/bench.mjs 41267575 20 4 6 baseline,compact,compactFixed
    node reference/research-prototypes/2026-09-09-exact-key/bench.mjs 663152175 18 4 12 baseline,compact,compactFixed
    node reference/research-prototypes/2026-09-09-exact-key/summarize.mjs

Run benchmarks sequentially, not concurrently. The generated files are reproducible from pinned sources and are included as the exact experimental kernels. The intentionally failing v1 qualification is not a passing test entry point.

## Disposition and next decision

Retain compactFixed as the stronger integration candidate, with baseline and compact as preserved controls. It demonstrates useful storage reduction without needing a dependency partition or a new hot-path cache policy. It has not earned maintained-source promotion.

The next useful comparison is a fresh active-capacity sweep using the smaller entry format, including the unchanged baseline: reducing per-entry bytes can shift the previous wall-time knee. Same-key bound retention and ready-task affinity remain independent experiments, not changes mixed into these results.

External research was consulted only for conceptual/reference checks: Pascal Pons's optimized-TT discussion and ECMA-262's Memory Model chapter. No external source code was imported. References: https://blog.gamesolver.org/solving-connect-four/11-optimized-transposition-table/ and https://tc39.es/ecma262/multipage/memory-model.html . The implemented reversible hash construction above is explicitly derived from the owned kernel rather than the external prime-modulus design.

## Final remote check

The research branch independently advanced by three commits to ed5f2eb2b0e021ba3336265696696da9262cd47a while this local experiment ran. The remote comparison added only docs/research/2026-09-09-rethink-sharing-placement-and-proof.md and docs/research/evidence/2026-09-09-rethink-root-entry-precondition.json. Neither pinned kernel/shell input changed, and none of this overlay's new paths collide with those additions. Those remote commits are not attributed to this execution. Main was re-read and remains de47d43f4f4133a68973d0876a402531ef5735da.
