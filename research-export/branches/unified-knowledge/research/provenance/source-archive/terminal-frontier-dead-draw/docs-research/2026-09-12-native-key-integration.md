# Native local identity integration and attribution correction

Research direction / architecture: Josh Oshiro  
Implementation / qualification: OpenAI ChatGPT

## Scope and governing contracts

Continued from the [isolated two-word experiment](2026-09-12-native-relational-key.md).
Actual local HEAD remained `0317c1c95eeae2e6b3e60040eed57198f4f5f9eb`.
All earlier uncommitted changes were captured in an independent baseline checkout
before this unit; they were not reset. C4-0006/0010 and AGENT_LOCAL govern exact
support/residual identity, semantic/proof separation, variable initialization-owned
geometry, resource ownership and qualification. No terminal/pruning/eval semantics
were changed.

The initial integration regressed. Attributing that result to field extraction or
the cost of AND was unjustified: it combined a new storage owner, access methods,
validation, field decoding and a changed bucket mixer. The owner challenged that
interpretation. The measurements below retain that failure and distinguish the
representation from the broader implementation.

## Implemented owner and consumers

`quotient-packed-state-pool.mjs` owns the active slot64 lane's state payload and
index. It stores one interleaved Uint32 payload, with no retained support/P0/P1
shadow arrays and no stored per-state hash. Two words carry exact local identity
when the initialization-derived capacities fit; three words preserve the wider
domain. Worker-local class IDs are not substituted for shared semantic content.

Before class capacity is sealed the pool uses the wide layout. Reservation
obtains the residual owner's actual sealed class capacity and selects the key
width. Repacking, table rebuilding and edge allocation happen during preparation;
published state IDs and cached transitions survive. Allocation failure preserves
the previous readable payload. Hot search does not grow or repack the store.
New successor identity still has to be assembled from its support and two new
class IDs during interning; known semantic edges bypass interning as before.

State fields are read through the owner. Combined reads reuse already allocated
consumer storage for descriptor materialization and tactical/frontier inspection.
The descriptor's existing transient object is filled directly. No new per-node
object is allocated. Repeated adapter validation was removed where a state-owner
read already validates the ID. Count and capacity are private in the packed owner.

The first version replaced reader functions during reservation. A function captured
before reservation could then apply the old stride to the new payload. This was
an implementation lifecycle defect, corrected before retaining the candidate:
public reader methods remain stable and dispatch to the current owner-selected
layout. A control captures all readers before sealing and verifies every result
afterward. This correction is required for correctness, independent of timing.

The support-layout substrate selects this owner for slot64. Retained alternate
representation experiments keep their own storage, with the same explicit field
read surface for common consumers. Forty-one source files changed, mostly mechanical
array-read migration in consumers/campaigns. The precise list and before/after
hashes are in [changed-source.json](evidence/2026-09-12-native-key-integration/changed-source.json);
changed-source snapshots are preserved alongside it. The prior frozen provider
control was promoted to `quotient-residual-provider-control.mjs` and adapted there;
its historical source/evidence was not overwritten.

## Controlled measurements

Every comparison used the normal empty 7-column, 6-row connect-4 depth-8 search,
the same two-GiB reservation budget, ETC disabled, fresh child processes and
identical result/search/operation counters. A comparison batch had a total
60-second deadline and completed in approximately 8–13 seconds. These are bounded
horizon searches, not exact empty-root solves. No standard-root trigger changed.

| Integrated candidate stage | Baseline elapsed ms | Candidate elapsed ms |
|---|---:|---:|
| Initial separate accessors | 1727.296 | 1839.278 |
| Specialized readers / descriptor fill | 1737.446 | 1880.643 |
| Combined tactical/frontier reads | 1763.419 | 1790.506 |
| Validation at owner | 1759.118 | 1790.356 |
| Stable reader lifecycle, final | 1786.365 | 1786.722 |

Final paired runs, baseline/candidate/candidate/baseline:

| Metric | Baseline mean | Final mean |
|---|---:|---:|
| Search elapsed ms | 1786.365 | 1786.722 |
| Process CPU ms | 1969.5 | 1929.5 |
| Reserved state payload bytes | 6,291,456 | 4,194,304 |
| Total retained kernel typed bytes | 241,770,247 | 239,673,095 |

Elapsed time is effectively unchanged. Measured process CPU is 2.0% lower, and
state payload is one-third smaller (two MiB saved at this reservation). All
4,777,115 calls, 672,690 expansions, 2,424 cutoffs and 221,398 local state IDs
remain identical. No hot storage growth occurred. This is a small measured CPU
change, not a statistically established speed guarantee or an 18% engine speedup.
CPU includes process work during search and may include JIT/GC activity.

The separate storage ablation uses the same revised owner/consumers, changing only
its layout selection to force wide storage. It measured 2,086 CPU ms for packed
and 2,117 for wide, with the original baseline at 2,062.5. Elapsed means were
1,915.073 / 1,907.826 / 1,885.338 ms respectively. Run-to-run drift limits causal
strength, but these results do not support blaming one bitwise AND for the original
regression. Packing also changes its bucket mixer and memory traffic; this is not
an instruction-isolation measurement.

The actual V8 inlining trace confirms packing helpers, hash helpers and several
readers were inlined. Function count in source is therefore not machine call count.
The earlier sampler artifact belongs to an intermediate candidate and is not
presented as exact line timing for the final revision. The trace has its own source
hash manifest. Initial comparison variants were not independently frozen as full
source trees; final changed-source snapshots and qualification hashes are durable.

## Qualification and review

Final qualification completed in 43.656 seconds within one 60-second batch:

- 74 value, storage, decision, shared arena, proof-store, worker, parity and reader
  lifecycle controls passed.
- Six bounded campaigns passed: slot64 residuals, semantic TT replacement,
  dependency-parallel Negamax, ExploreHint, terminal boundary and pruning.
- All ten retained residual-provider controls passed.
- Every final source hash was checked before and after qualification; all child
  processes exited.

New controls cover all bit-width regimes against an independent BigInt reference,
exact wide fallback, maximum fields, invalid IDs and reservation capacities,
all-zero hash collisions, full-store hit recovery, allocation failure, preserved
IDs/edges, absence of duplicate arrays and readers captured before sealing.
Two early tests depended on the old array layout: fault injection targeted a second
separate Uint32 allocation and online-storage validation required three arrays.
They were updated to test the new owner boundary and transactional edge allocation;
these failures were harness assumptions, not W/D/L regressions.

Five bounded workflow path filters now include the packed state owner and its
controls: slot64, support-layout, replacement, dependency-parallel and ExploreHint.
The slot64 workflow runs the new controls and maintained provider control. Hosted
CI was not run; local qualification is the evidence here.

## Decision and next owner

Retain this bounded-qualified integration as uncommitted work: exact results and
ownership are preserved, state storage is smaller, final elapsed time is flat and
the measured CPU change is modestly favorable. Do not claim the initial regression
proved packed identity unsuitable. Also do not assert that packing mathematically
guarantees lower total solve CPU.

Further performance work should isolate remaining candidate construction,
descriptor materialization and state-consumer access under a larger working set.
The stable-reader fix and necessary ownership validation must survive that work.
No full-root readiness claim is made, and no hash-only or worker-local-ID shared
proof identity was introduced. Protected refs, main and ongoing solver PRs were
not touched.

Raw comparisons, trace, source manifests and qualification logs:
[integration evidence](evidence/2026-09-12-native-key-integration/qualified/results.json).
