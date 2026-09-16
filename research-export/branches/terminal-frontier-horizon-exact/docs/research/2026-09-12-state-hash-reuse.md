# Reuse composed semantic hashes

Research direction / architecture: Josh Oshiro  
Implementation / qualification: OpenAI ChatGPT

## Assessment, research and reassessment

Continues the ranked descriptor/hash target at local HEAD
`0317c1c95eeae2e6b3e60040eed57198f4f5f9eb` plus preserved working-tree changes.
The [previous profile](evidence/2026-09-12-ranked-probe-line-cpu/line-cpu.md)
attributed 49.75 estimated CPU ms to descriptor hash composition and 40.12 ms
to hash-output validation. These are sampled locations, not exact instruction times.
AGENT_LOCAL and C4-0010 require semantic content identity, separate proof generations,
and initialization-owned resources. Existing global guidance and C4-0001/0006
remain applicable; no domain, parity, terminal or eval semantics change.

An initialization-owned hash writer removed arbitrary-output validation using
a frozen borrowed view over private scalars. It passed 59 controls but the four-run
comparison measured 2203.24 ms versus 2043.47 ms baseline (7.82% slower elapsed).
The candidate was removed. Its [patch, hashes and results](evidence/2026-09-12-bound-semantic-hash/source-manifest.json)
remain evidence. Accessor/code-shape overhead is a hypothesis, not an isolated
causal measurement. No compatibility wrapper or alternate active hasher remains.

## Plan and executed invariant

The canonical local state pool assigns append-only IDs and does not reset/reuse
them during its kernel lifetime. Its support and normalized residual class IDs
therefore determine one immutable composed semantic hash. Shared TT slot replacement
changes proof handles, not that local content hash.

`quotient-local-semantic-descriptor.mjs` now reserves two Uint32 hash arrays and
one readiness bitmap within its existing metadata ownership. Prepared workers
size them from their initialized state capacity. Unprepared reference kernels
continue computing hashes without this cache; IDs beyond a reserved prefix also
compute normally. These arrays never grow in recursion. The readiness bit is
set only after both hash words have been stored successfully.

Repeated visits load the two hash words directly. Two redundant descriptor-length
assignments were removed. No new term arena, descriptor objects, proof arrays,
strings, parsing, async calls or waits were added to the fast path. Public input
validation, canonical lengths, class metadata, exact TT descriptor comparison,
generation checks and proof publication are preserved. The original hash arithmetic
and its external helper are unchanged. Hash equality alone never establishes identity.

## Qualification

58 contract controls passed. The new exhaustive bounded traversal checks composed
hashes against separately built descriptors, reverse/repeated visits, readiness
bits across word boundaries, invalid IDs, fixed metadata size, and shared-arena
reset/re-admission under a new proof generation with the same semantic hash.
Existing allocation traps, replacement, poisoned-slot and worker lifecycle controls pass.

Six local campaigns/controls passed: slot64 residual, semantic TT replacement,
ExploreHint, online dependency parallel, proof lifecycle and proof reuse.
The first replacement run failed its historical assertion that descriptor storage
contained class metadata only. This was a resource-contract assertion, not a W/D/L
failure. Executor telemetry now reports state-hash bytes/capacity; replacement and
lifecycle controls require exactly `8 * capacity + 4 * ceil(capacity / 32)` bytes
in addition to class metadata, while still rejecting duplicate terms/objects.
The [initial failure](evidence/2026-09-12-state-hash-reuse/qualification-old-memory-contract.log)
and successful rerun are retained. The nine worker controls passed again after
the telemetry change. Existing workflow filters cover each changed source/test.

## Same-bounds measurement

All measurements use the normal local empty 7-column by 6-row, connect-4 search,
depth 8, hard 60-second child timeout. Runs are sequential cold processes in
baseline/candidate/candidate/baseline order; no concurrent benchmark or full root.

| Mean | Baseline | Candidate |
|---|---:|---:|
| Elapsed | 2032.36945 ms | 1838.4439 ms |
| Process CPU | 2188 ms | 2023.5 ms |
| Descriptor metadata | 4,259,840 bytes | 6,389,760 bytes |

[Comparison](evidence/2026-09-12-state-hash-reuse/comparison.json): 9.54% lower elapsed,
7.52% lower CPU in this bounded comparison. Two runs per variant are limited evidence,
not a full-root performance prediction. The comparator excludes only newly added hash
telemetry and changed retained-byte accounting, plus its existing max-scan exception
(scan remains 5). Every previous search/proof/descriptor-use/class/term counter matches.

4,781,398 hot descriptor visits now perform 221,398 composed hashes and 4,560,000
direct reuses: 95.37% fewer hash computations. Metadata adds 2,129,920 bytes
(2.03125 MiB) per worker at capacity 262,144. This is separate from unchanged kernel
typed bytes; total memory is not claimed unchanged. No storage growth or hot-path
descriptor/term-array allocation occurred.

The [new frozen-source line profile](evidence/2026-09-12-state-hash-line-cpu/line-cpu.md)
completed in 1940.0028 ms, 2110 CPU ms, with 325 mapped locations. Top sampled lines
are now chunk lookup (105.75 estimated CPU ms), TT status (102.39), and singleton
intersection (77.22). Profile comparison includes the new hash counters exactly.

## Review, cleanup and next owner

The [unit patch and hashes](evidence/2026-09-12-state-hash-reuse/source-manifest.json)
preserve the five changed source/test files against the pre-unit snapshot.
`git diff --check` passed. Prior working-tree changes and evidence are preserved.
The slower writer candidate was restored from that snapshot, not from Git HEAD.
All test children exited. Full-root trigger and protected-main state were untouched.

Next target: nonempty chunk interning and its exact-key reuse opportunities, followed
by remaining shared TT probing. Larger state-hash reservations have proportional
memory cost and remain part of unresolved full-root sizing. This unit does not
claim the whole hot loop is string-free or fully optimized.
