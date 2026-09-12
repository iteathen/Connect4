# Frontier Negamax methods and local-host review

Date: 2026-09-12
Research direction / architecture: Josh Oshiro
Implementation / qualification: OpenAI ChatGPT

The maintained engine is exact frontier-native W/D/L Negamax with local closure.
It is not yet the full strategic closure engine envisioned by the shared
CPC/WSL/NDC research. Correctness qualification of the implemented path does not
establish that integration or a fast standard-board solve.

This review inspected canonical research head
bebc2fc59920d89595c3447a01dccf07dd38a2f6 and current forward source
9c778bcaf010372ca2a3a91a7cdcec8debf5518f. It preserves the existing solver and
ownership split. No kernel/configuration change or duplicate root solve was made.

## Methods: research evidence versus actual execution

| Method | Evidence and active disposition |
| --- | --- |
| Exact quotient identity and W/D/L | Active: support plus separate canonical P0/P1 residuals, exact descriptor comparison, one side-to-move proof orientation. No distance proof is requested. |
| Native fail-soft Negamax | Active in deep workers; ordinary exact window/sign transforms over unresolved decisions. No heuristic horizon or selective pruning. |
| Local frontier closure | Active: immediate singleton wins, forced response, multiple-threat loss, bilateral exhaustion and one-sided no-win bounds before branching. |
| Forced macro transitions | Active: forced chains advance in a loop, invert signs/windows and do not consume unresolved split depth. Intermediate transit proofs are not invented. |
| Frontier ordering | Active: dynamic player-relative live geometric-line counts; proof move hints only break equal-score ties. No history/killer authority. |
| TT reuse | Active: nonallocating probes, admission on publication, exact generation rebinding, bounded descriptor replacement and poisoned failure isolation. |
| PVS/scout dependencies | Shallow coordinator waits for preferred child, releases null-window siblings, consumes completions incrementally and detaches obsolete work. Deep worker loop remains fail-soft Negamax. |
| Root driver | Root asks win threshold [0,1], then draw threshold [-1,0] only if necessary. It does not run strong-distance MTD(f). |
| ETC / child witnesses | Disabled in the root. Early precompiled-DAG ETC wins were superseded by native costs; forcing children reduced 4x5 expansions 15,054 -> 10,530 but increased total time 18.539 -> 24.471 ms. Best-child witnesses were also conditional. |
| Parallel work supply | Three workers, split 3, priority depth 0, exploration disabled. These are fixed measurement settings, not hardware-adaptive capacity selection. Initial authoritative supply is one task; see direct diagnostic below. |
| Strategic U1/U2/NDC closure | Not implemented as a complete response/parity/blocker/race fixed point in this root. The current q projection does not authorize caching additional strategic certificates without all their premises. |
| BSFP boundary injection | Not active in this root. Earlier ideal-boundary gains excluded the cost of producing the boundary and cannot be called end-to-end speed. |

The native driver tournament favored full-window W/D/L on the largest 4x5
control (18.759 ms) over PVS (19.706), MTD(f) (19.282) and thresholds (19.111).
That is bounded evidence, not a universal driver winner or a standard-7x6 time.
The current win-first root driver must be assessed with its decisive-root and
online shared-proof costs; blindly switching to another named method is unwarranted.

The older search-only 4x5 results around 8 ms excluded approximately 7.11 seconds
of precompiled graph construction. Later native controls include transitions,
but remain small games. Neither is evidence for an extremely fast empty 7x6 proof.

## Local measurements and the initial dependency bottleneck

Read-only host inventory: Intel i5-12600K, 10 physical cores / 16 logical CPUs,
33,289,648 KiB visible memory; approximately 14,356,832 KiB free at sampling.
A local run is possible. The gated hosted profile was used for continuity with
prior qualification, not because local execution was unavailable. Hardware alone
cannot remove work or expose dependencies the current scheduler has not released.

The existing shallow profile was run locally on Node 26.7.0 with MAX_DEPTH=4,
PROBE_DEPTH=0 and PREFIX_CLASSES=4096. Timed shallow expansion after kernel initialization took **18.1714 ms**;
the zero-depth cost profile took **2.7252 ms**. Cumulative q counts were
1, 8, 57, 295, 1,415. No tactical exact closure or forced response occurred
through depth 4. This excludes process startup and kernel initialization and is one diagnostic
sample, not a repeated throughput claim.

A second bounded diagnostic ran the actual coordinator with a held executor
boundary. It stopped before executing any leaf proof and verified:

- one initial authoritative task, path [3,3,3], child window [-1,0], priority 1;
- three shallow expansions, zero scout tasks, zero parallel batches;
- four representative paths, rather than materializing the complete depth-3 frontier.

Thus 238 unique q states at depth 3 do not mean 238 dependency-ready tasks.
Until the preferred leaf supplies a bound, this cold start has one authoritative
worker task. With exploration disabled, spare workers have no exploration work.
This establishes an initial work-supply limitation, not the duration of that
phase in the hosted run or its eventual utilization. Final root logs must decide
whether it dominates the observed measurement.

The held task was explicitly rejected after capture and background work drained;
no leaf search or second full root was launched. Reproducer and raw outputs are
in [the evidence directory](evidence/2026-09-12-frontier-audit/).

## Reassessment and next owner

The correctness audit remains about the maintained implementation. It must not
be interpreted as a completed implementation of every research method. The
shared algebra explicitly retains unproved cheapness/universality questions,
including incompatible response-policy choices and full event/race premises.

The next performance owner is **dependency-aware work supply and task granularity**:
measure time to first preferred-leaf result, busy-worker distribution, proof
reuse and local transition/interner cost. A bounded comparison should preserve
preferred-child authority while measuring useful idle exploration or finer
proof dependencies. Do not replace it with static full-window frontier solving,
interrupt workers, blindly deepen the split, enable forcing ETC, or add a second
proof owner. Do not launch an unchanged local full root while the admitted hosted
measurement is active. Strategic closure integration is a separate mathematical
qualification task and cannot be filled with assumed parity implications.

## Source trail

- [C4-0010](../specs/C4-0010-quotient-native-negamax-v1.md): exact consumer, work supply and evidence limits.
- [Native driver tournament](../../research/semantic-quotient/state-identity-unification/QUOTIENT_NATIVE_DRIVER_RESULT.md).
- [Native kernel / ETC costs](../../research/semantic-quotient/state-identity-unification/QUOTIENT_NATIVE_NEGAMAX_RESULT.md).
- [Best-child witness study](../../research/semantic-quotient/state-identity-unification/QUOTIENT_BEST_CHILD_RESULT.md).
- [Search-method campaign](../../research/semantic-quotient/state-identity-unification/SEARCH_METHOD_CAMPAIGN_V1_RESULT.md).
- [Online dependency results](../../research/semantic-quotient/state-identity-unification/QUOTIENT_ONLINE_DEPENDENCY_PARALLEL_RESULT.md).
- [Standard shallow profile](../../research/semantic-quotient/state-identity-unification/QUOTIENT_STANDARD7X6_PRESEARCH_PROFILE_RESULT.md).
- [Hidden-assumption review](../../research/semantic-quotient/state-identity-unification/FRONTIER_NEGAMAX_HIDDEN_ASSUMPTION_AUDIT.md): historical defects must be reconciled with current repairs.
- [Universal strategic algebra](2026-09-09-universal-strategic-algebra.md) and [nested closure](2026-09-09-nested-strategic-dependency-closure.md): stronger closure model and unresolved cheapness premises.
