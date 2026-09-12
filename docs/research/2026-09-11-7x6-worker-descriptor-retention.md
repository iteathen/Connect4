# Standard 7x6 worker descriptor-retention finding

**Date:** 2026-09-11  
**Branch:** `research/frontier-negamax-conformance`

Research direction / architecture: Josh Oshiro  
Implementation / adversarial analysis / qualification: OpenAI ChatGPT

## Scope

This note records the worker-local host-memory investigation that followed slot-owned shared-proof descriptor spans. It does not change the CPC/WSL/NDC structural model, exact q identity, proof identity, Branch Manager scheduling semantics, or frontier-event lifetime.

## Evidence before the worker-lifetime correction

Standard-7x6 workflow run `34673627048` at commit `e7ce723fd15c2672104d6c927200b98a3797abb1` repeated the host-memory failure after slot-owned shared-proof descriptor-span reuse had already removed the descriptor-arena limiter.

At the last complete sample, process RSS was about 14.94 GB. The three authoritative workers reported approximately:

| worker | local q states | residual classes | local typed bytes | state descriptor builds | class descriptor builds | cached descriptor term IDs | V8 heap used high-water |
|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | 16,896,772 | 4,461,913 | 1,062,452,999 | 16,896,772 | 4,461,913 | 43,208,767 | 4,260,873,360 |
| 1 | 17,394,035 | 4,362,596 | 1,062,452,999 | 17,394,035 | 4,362,596 | 41,995,667 | 4,128,761,840 |
| 2 | 18,026,811 | 4,505,097 | 1,062,461,191 | 18,026,811 | 4,505,097 | 42,928,245 | 4,311,241,592 |

The worker-local typed quotient kernel was therefore roughly 1.06 GB per worker while V8 heap high-water was roughly 4.1-4.3 GB per worker. High-water values are not simultaneous and must not be summed directly with process RSS, but the ratio was sufficient to localize the dominant retained lifetime.

`createLocalSemanticDescriptorCache()` retained every quotient state descriptor in an unbounded `stateCache` for the lifetime of the worker. State descriptors contain support plus references to exact residual descriptors but are not themselves required to remain object-stable: the shared semantic TT compares exact descriptor content and does not depend on the identity of a worker-local state descriptor object.

Residual class descriptors remain separately cached and contain exact term-ID sequences plus hashes. This note deliberately does not infer that their lifetime is also wrong.

## Correction

Commit `29c96d40dc766d5ceb2c107625db57d758599d44` removed only unbounded local **state descriptor** retention.

`stateDescriptor(stateId)` now constructs an ephemeral quotient descriptor from:

- exact support index in the local quotient kernel;
- exact cached P0 residual descriptor;
- exact cached P1 residual descriptor.

Exact residual class descriptors remain cached. No proof key, q identity, CPC/WSL/NDC fact, future-event reservoir, live-line frontier, worker scheduling rule, or proof-publication rule changed.

This is an execution/storage-lifetime correction, not frontier pruning.

## Bounded qualification

Two bounded workflows were wired to own `quotient-local-semantic-descriptor.mjs` before the standard-7x6 rerun.

- idle ExploreHint run `34673985296`: green;
- dependency-aware proof run `34673985304`: green.

The 4x5 dependency campaign preserved exact root/action WDL `[0,0,0,0]` throughout. Baseline work remained 11,303 expansions / 24,877 calls / 13,325 proof admissions. The best median point in this qualification was three workers at unresolved decision split depth 3:

- root resolved: about 23.125 ms;
- elapsed: about 23.132 ms;
- total expansions: 11,426 median;
- leaf tasks: 20;
- scout tasks: 18;
- re-searches: 1;
- exact actions: `[0,0,0,0]`.

Detached sibling behavior remained exercised at deeper split depth, and campaigns drained executor work before cleanup.

## Standard-7x6 measurement now running

Workflow commit `1b9bb83f72a318c188750b421f352504048fe314` added the local semantic descriptor owner to the standard-7x6 workflow path after bounded qualification. It did not change solver semantics.

Standard-7x6 run `34674060855` is the isolated measurement of the ephemeral-state-descriptor correction with:

- 3 authoritative search workers;
- unresolved-decision split depth 8;
- Branch Manager autonomous exploration disabled for storage isolation;
- 8,388,608-entry generation-safe shared proof table;
- 460,000,000 term-ID descriptor arena;
- slot-owned descriptor spans and proof replacement unchanged.

The run has already survived materially beyond the prior approximately 225-second host-kill horizon. Do not treat survival time alone as a solved root or as proof of the next limiter; use the final worker high-water series.

## Current hypothesis boundaries

Established:

- fixed proof-entry capacity is no longer the immediate failure once replacement is enabled;
- append-only semantic-incarnation descriptor storage was the wrong lifetime and was corrected by slot-owned spans;
- unbounded worker-local quotient **state descriptor object retention** was a major host-memory owner and has been removed without bounded correctness loss.

Not yet established:

- whether the standard-7x6 root closes under this correction;
- whether exact residual class descriptor retention is the next host-memory limiter;
- whether the local quotient kernel itself becomes the next limiter.

A residual class descriptor currently owns a materialized `Uint16Array` returned by `kernel.classes.termIds(classId)`. That is a plausible next duplication boundary, but it must not be changed merely because it is visible. Measure the active 7x6 run first.

## Rejected premature responses

Do not respond to the prior host-memory failure by defaulting to:

- another shared-TT replacement policy;
- larger descriptor-term capacity;
- worker cancellation polling;
- deleting CPC-dependent future events that appear WSL-irrelevant;
- generic history/killer or center-order heuristics;
- class-descriptor reclamation without evidence and an exact identity-preserving replacement.
