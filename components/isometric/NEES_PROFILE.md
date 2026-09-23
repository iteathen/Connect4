# NEES Draft 0.5 — fresh execution components

NEES revision: `7650bef0aecc0d2b226ecf253a1f8937ccf89d69`.
JSMinSys revision: `64ba37a11522b533a1de87942a14921fe690ef86`.
Runtime: Node 26.7.0, V8 14.6.202.34-node.28, Windows x64, Intel i5-12600K.
Semantic owner: retained C4 gameplay specifications plus current execution API.

**Conformance status: partial qualification; no NEES-EXTREME/JMS-RESTRICTED or
JMS-SEALED claim.** The native binding has a closed structural call graph;
generic caller kernels remain open. A detector is not an engine/lowering proof.
No runtime lowering, assembly optimality or zero-GC claim is made.

## Scope and synchronization audit

E0/E1: native RBA coordinates, cofactors and fronts. No production search fallback. E2: all
hot functions and enclosing loops in shared-tt, worker and manager, including
transitive JSMinSys helpers. COLD: preparation,
module import, thread startup, reporting and host teardown. The governing
optimization unit is complete worker + shared TT + manager + admitted kernel.

All mutable TT metadata and queues have one synchronization protocol: a TT
transaction using JSMinSys CAS/store blocks. Initialization precedes thread
creation. Immutable key reads outside a transaction require execution ownership;
recycling cannot overlap those reads. STOP/ERROR/DONE/WAKE use Atomics when
observed across threads. Failure does not unlock a dead owner's transaction.
Host disposal occurs only after every thread exits. There are no nested locks.

## Rule dispositions

| Rules | Disposition and evidence |
|---|---|
| CORE-002/003, REP-001/003/004 | Component scope conforms: exact keys, independent generation/ownership, fixed WDL codes, explicit width failure |
| BOUND-001/003, ALLOC-001/003/004, FINITE-001 | Component scope conforms: cold preparation, numeric hot failure, fixed arrays, pinned scratch ownership |
| COMP-001/002/003 | Component scope conforms: chained exact probes; at most 7-edge reconciliation; incremental event queue, no whole-TT polling |
| CONC-001/002/004 | Component scope conforms: native work outside transactions, visibility distinct from execution, documented access/lifetime protocol |
| DIAG-001 | Component scope conforms: compact words/counters; host-only rich results |
| EVID-001/002/003/004/005/006/007 | Pins/mechanisms/limits explicit; fixture timings do not establish solver performance or an optimization win |
| COST-001..007 | Measured Windows process-cycle totals for declared hot batches and native full operations; analytical lowering terms remain symbolic. Zen 3 references are not Intel measurements |
| JIT-001..003, REP-002, CONC-003, CORE-001/004/005, XTRM-001..007 | UNVERIFIED at governing kernel-inclusive unit; cost candidates retained below, no performance promotion |
| FINITE-002, NATIVE-001 | Solver has no native addon, FFI, WASM or GPU escape. Cold qualification tool reads Windows cycle accounting through Node FFI; no game work crosses that measurement boundary |
| JMS data/operations | Listed scalar/typed/atomic vocabulary used. Size-specific hot functions explicitly named 7x6. Prepared record/view carriers remain an admission-review item |
| JMS transitive seal | Structural native binding traverses 43 functions with no open boundary; full runtime/type/lowering seal remains UNVERIFIED |

## Cost/disposition baseline

Every entry below is assessed at the complete execution operation. Mechanisms
are candidates, not assertions that a rewrite would improve elapsed time.

| Site / mechanism | Causal role | Disposition / falsifier / next evidence |
|---|---|---|
| Exact 8-word comparison | REQUIRED semantic equality | Hash-only replacement forbidden; support-local payload replaces global-width words |
| 8 mix steps, dependent bucket chain | COUPLED | UNVERIFIED-DEBT: locality/hash alternatives need native collision/load-factor workloads |
| New-key 8-word write | ENABLING | Required persistent content; direct reserved producer writes may remove scratch traffic but must preserve atomic ownership and fail-closed publication |
| TT-wide transaction | COUPLED | UNVERIFIED-DEBT: protects multi-row pin/topology transfers. Sharding is not admitted until complete-operation contention savings exceed extra ownership machinery |
| Event/ready links in q | ENABLING | Removes separate task/descriptor populations. Doubly-linked ready removal prevents reproduced capacity retention; no scan required |
| 7-edge manager reduction | COUPLED | Bounded scan avoids maintained parallel aggregates. Incremental alternatives remain unqualified |
| Root witness topology retention | REQUIRED | Earlier tied action must be resolved; eager detach changes observable move |
| Per-boundary notification and 1ms timed idle wait | COUPLED | UNVERIFIED-DEBT: wake/coherence/latency tradeoff needs useful native work. Wait cost is unbounded elapsed, not one ALU operation |
| Prepared object carriers | UNKNOWN | No hot instantiation; fixed property families. JMS full admission/lowering still needs review with kernel; do not call this sealed |
| One-worker local closure / ready target 2N | COUPLED | Avoids unconditional all-frontier work. Threshold is initial policy, not a proved optimum; in-flight exposure may overshoot |
| New threads per root | COUPLED, COLD/E3 | UNVERIFIED-DEBT for repeated roots: retained pool expected to amortize startup, but requires explicit cross-session lifetime/reset contract |
| SOA views / centralized control words | UNKNOWN | UNVERIFIED-DEBT: cache/coherence traffic and false sharing are unmeasured |
| Kernel dispatch, branch tests, scalar locals | UNKNOWN | No source-to-assembly claim; inspect generated code only with a representative native kernel |

## Symbolic operation accounting

Owner requirement for the native rebuild: total-cycle accounting covers every
hot function/loop and its transitive helpers, composed over worker, TT, manager
and native kernel. Strict pinned JSMinSys vocabulary applies to that whole scope.
The analytical baseline below remains symbolic. Numeric complete-operation
measurements are separately produced by `tools/bench-isomax-cycles.mjs`; they
are totals for the measured scenarios, not universal source-op costs.
See `docs/design/rba-native-integration.md` for the checkpoint
contract. Keep NEES serial-ledger totals distinct from measured active CPU
cycles, total parallel CPU work, blocked time and critical-path elapsed time.
Unknowns cannot be zeroed to produce a numeric total. No per-node timing or
rich diagnostic work may be introduced to collect these measurements.

JSMinSys was repinned from round 096 to round 100 before native RBA work.
Round 098 support-first canonicalization applies to the new q design. Round
097 immutable grouped-word reuse is conditional on actual incidence runs.
Round 099's global singleton-prefix projection cannot be applied directly to
local upset bit positions; singleton indices require the prepared local basis.
Round 100 does not establish additional performance gains. Historical evidence
retains the revision it actually tested.

No source operator has been assigned a fabricated native instruction latency.
For an intern with P candidate rows and C compared words, key work is 8 mix
iterations, 8 input-word reads for hashing, C key comparisons (up to 8P),
and 8 word stores only on insertion, plus metadata accesses and control flow.
Each mix includes XOR/shift/imul in the pinned library; realized call/branch/
addressing/boxing costs remain `V8(profile, path)`, not zero.

Each successful transaction has a STOP atomic load, claim CAS and release
store. Publication adds WAKE RMW and notify. Failed claims, coherence latency,
memory locality, scheduler delay and JIT transitions remain scenario variables.
Manager work is O(processed events + visited incoming edges + 7*reconciliations),
plus exact bucket scans needed to unlink recyclable q. Idle wait is unbounded.

Native basis derivation visits 69 four-cell incidences, clears/scans 20 scratch
words and emits N<=69 local IDs. Cofactor loops visit N parent memberships per
player and N' child IDs for every surviving active image. Canonicalization
short-circuits on primary support; ties include two basis derivations and exact
secondary transport. Front construction counts every support expansion, cover
descent and skyline insertion/comparison against its bounded work allowance.
Its bound is a construction-work limit, not a cycle estimate. Value query visits
complete paired generators until membership is decided. Fallback counts entered
native states and transitions separately from algebraic closure. Loop control,
property/address loads, generated branches and JIT lowering remain included in
measured totals; no source-level count silently assigns them zero cycles.

Admission/falsifier: prepared numeric shared storage removes per-branch object
transport while preserving exact identity/lifetime. It loses economically if
transaction/wakeup/retention costs exceed useful parallel work. Requalify on
kernel, worker count, workload, runtime or CPU changes; include startup, late
roots, hard roots, contention, memory pressure and failure cleanup.

## Evidence

`npm test`: component, real-thread, randomized oracle and negative detector tests.
`node --test vendor/jsminsys/test/*.test.mjs`: pinned library tests.
`node tools/check-hot-scope.mjs`: no forbidden materialization/calls found in
the declared component traversal; the deliberate transitive allocation is caught.
`node tools/bench-execution.mjs`: cold ranked-DAG baseline, not a solver score.

Round-100 repin check (2026-09-23, runtime above): 26/26 executor tests and
75/75 pinned JSMinSys tests passed. The detector visited 23 functions with no
reported violations and still reported the open native `evaluate` boundary.
These results qualify the dependency update at the existing fixture scope;
they establish neither RBA performance nor closed total-cycle accounting.
