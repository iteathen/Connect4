# IsoMax shared-TT, affinity and L2 experiments — preparation

Status: PREPARED, NOT RUN. No solver/source/default changes authorized by results
that do not yet exist. Owner asked to prepare experiments after discussing16x
shared TT, per-P-core worker pinning, and private-cache sizing informed by L2.
This is the canonical design/experiment record; do not create a competing plan.

## Goal and fixed controls

Find lower completed-solve cost by separating retained search information from
cache locality. Preserve Lazy SMP,exact WDL/root move,one wide+three deep,full
sharing,private LOWER0/UPPER0,packed keys/tags/rows. No proof-mask stacking.
Selected solver:be7c2887defcefb37080fa61de7ce1dc38dc2990.
Runtime:27.0.0-nightly20260928b59840b593,installed and checksum-verified.
Windows11Pro10.0.26200,i5-12600K,6P+4E,16logical,about32GiB RAM.
Node26.7.0 remains installed; do not mix its samples with nightly comparisons.

Prior nightly compatibility:A174/174,B180/180 tests passed. Runtime-only8-run
screen had cycles-0.665%,95%[-2.570%,+1.240%]: no established nightly speedup.
Empty baseline on nightly:600.017s TIMEOUT,1478258352 visits,8158168537640cycles.
Candidate proof-mask attempt was owner-cancelled,not a solver failure.
[Durable prior report](https://github.com/iteathen/JSMinSys/tree/e69cabd/evidence/isomax-phase2-nightly-empty-20260928).
Completed official hard35333571 on26.7.0 took about125s; this is a better long
exact control than2.5s353335714. No guarantee the same time holds under new sizes.

## Representation-derived capacities

Read actual selected source,not historical profile byte estimates:
- private compact key8uint32 + packed epoch/value tag1uint32 =36bytes/entry;
- shared compact key8uint32 + sequence1uint32 + value1uint32 =40bytes/entry,
  plus12bytes statistics; geometry/runtime/storage overhead is additional.
- current shared4194304 entries =160MiB payload plus stats;
-16x shared67108864 entries =2560MiB(2.5GiB) payload plus stats;
- current private1048576 entries =36MiB per worker.

Intel P-core L2 is1.25MiB,shared between the core's two logical processors.
Four E-cores share2MiB. Cache bytes are not exclusive allocatable scratch RAM.
[Hardware source](https://edc.intel.com/content/www/us/en/design/ipla/software-development-platforms/client/platforms/alder-lake-desktop/12th-generation-intel-core-processors-datasheet-volume-1-of-2/007/ia-cores-level-1-and-level-2-caches/).

| Private entries/worker | Payload | Fraction of P-core L2 | Role |
|---:|---:|---:|---|
|1048576|36MiB|28.8x|existing retention control|
|16384|576KiB|45%|headroom for other hot state|
|32768|1152KiB|90%|near-capacity test,not presumed resident|
|65536|2304KiB|180%|above-L2 contrast|

Buffers are separate arrays; combined footprint does not prove set occupancy or
residency. Shared-TT traffic,stack,state,JIT/GC and other scheduled work compete.
Do not implement cache locking,reserved-L2 claims,or new table representation.

## Sequential experiments (no full Cartesian sweep)

1. **M16, owner-requested next run:** empty7x6,nightly,unpinned,67108864 shared,
   1048576 private each,4workers,600000ms. One run. Compare descriptively with
   preserved same-source/nightly4194304-shared baseline. This is not a paired
   exact speed ratio if either times out. Estimated table payload2704MiB total
   including four private tables; preflight available RAM and actual allocations.
2. **Shared-capacity confirmation:** same source/nightly,35333571,300000ms,
  4194304 versus67108864 shared,private1048576,unpinned. ABBAABBA(8processes).
   If the first pair is censored,stop this exact campaign and report scope rather
   than selecting by node throughput. Otherwise complete all8,no favorable stop.
   Freeze the shared winner only if whole-process-cycle interval establishes
   improvement and wall does not show a material regression; otherwise retain4M.
3. **Placement isolation:** fixed chosen shared/private1048576; affinity-off
   versus one worker on each of four distinct P-cores,one logical processor/core.
   Same affinity-capable source SHA for BOTH arms; default-off path must first
   compare against unmodified selected source to expose initialization/JIT costs.
   Same hard fixture,300000ms,ABBAABBA. Pinning is not presumed beneficial.
4. **Private-cache screen:** pinning held identical in every arm,shared fixed.
   Compare current1048576 private against16384,32768,65536,separately,one AB pair
   per candidate on35333571 with300000ms. A short correctness smoke precedes these,
   but no short censored test selects a memory winner. If a pair times out,retain
   censoring; do not force full repeated qualification of that comparison.
   No timing/node-based early termination within a sample.
5. **Confirm only the best plausible private candidate:** fresh ABBAABBA against
   current1048576 private on the same hard fixture. Screening is not promotion.
   Then one matched empty-board A/B pair,600000ms each,only for a survivor.

Budget boundaries: next authorized execution packet is one M16 run,up to10min.
Each completed-hard confirmation is at most40min; each private screen pair at
most10min. Execute/report stages separately,not a multi-hour unattended sweep.
No worker-count variation,no private16x increase,no all-deep topology.

## Pinning prerequisite and ownership

Current selected worker exposes no affinity. Stages3-5 are NOT runnable yet.
Implement optional cold worker placement in JSMinSys,the generic worker owner;
application provides prepared targets. Detect topology using Windows documented
GetLogicalProcessorInformationEx plus CPU-set/core efficiency data. Never infer
P-cores from guessed processor-number ranges. Use group-aware identifiers.

Worker calls OS affinity once BEFORE preparing private solver state; query back
and record accepted group/mask and physical-core/L2 mapping. Four targets must
map to distinct P-cores,not SMT siblings. Requested pinning fails closed if
unsupported or denied; affinity-off needs no per-node branch or native call.
No claim of exclusive cores,caches or immunity from OS/runtime competition.
Do not pin all workers via process-wide affinity and call that per-worker binding.
For this host,main/reporting placement is unchanged and recorded.

Owning existing seams: addons/branch-manager-host.mjs,
addons/rba-connect4-lazy-smp-host.mjs,canonical lazy-smp-worker.mjs;
generate behavior/frontier via tools/build-behavior-search.mjs and
 tools/build-root-frontier.mjs. Do not hand-edit generated worker mirrors.
Any implementation starts isolated from be7c2887 after re-fetch; proof-mask branch
is evidence provenance only. Read current JSMinSys/NEES authority before mutation.
Update every changed cold unit and generated source seal in cycle accounting;
OS/FFI/allocation costs are nonzero and may be symbolic/unbounded.

## Cross-hardware policy to test,not deploy

Candidate initial budget: fraction times actual L2 capacity divided by workers
sharing that L2 domain,minus measured/explicit headroom; floor to a supported
power-of-two entry count using actual36-byte profile. Test fractions,do not freeze
one universal ratio. If topology is unknown,retain a named fallback profile and
mark it uncalibrated. Never silently use aggregate chip L2 as per-worker capacity.
Reuse measured profiles only with matching solver/layout/runtime/topology.
Four workers on4distinct P-cores => no sibling division for this experiment.

## Correctness,measurement and falsifiers

- Run relevant cache/worker/geometry/full correctness tests before timing. Verify
  compact identity,private bound privacy,exact-only sharing,first-win/root witness.
- Pinning tests: duplicate physical cores,SMT siblings,E-core targets,invalid
  groups,denied calls and unavailable APIs fail requested profile cold. Verify
  actual OS mask after set and no affinity call/flag checks in recursive graph.
- Compare generated checks,audits,catalog,seals; no stale generated code.
- Fresh processes,clean fixed SHAs,recordCPU/OS/runtime+binary hash,power plan,
  placement,logical IDs,capacity,payload/RSS,cycle-counter mechanism and order.
- Whole-process cycles primary,wall secondary; nodes,winner/per-worker nodes,
  shared hits/stores/contention,peakRSS,start skew and all cleanup/errors retained.
- All exact samples agree on WDL and move. Shared-hit count cannot quantify
  eliminated proof work; lower cycles/node cannot choose a winner by itself.
- Four adjacent paired ratios and descriptive95% t(df3) interval for8samples;
  also report two ABBA block ratios and arithmetic means. No post-hoc best subset.
- L2 miss counters optional in SEPARATE diagnostic runs if a supported PMU tool
  is available. No frequency-to-cycle estimates and no simulated residency claim.
- Cancellation recorded separately from timeout or solver failure; partial output
  never fabricated. Raw records checkpoint immediately; no orphan processes.

Preparation deliverables: this plan plus TT_L2_MATRIX.json (declarative only).
No affinity provider,configurable sample runner,capacity experiment or performance
claim is implemented by this preparation. The next implementation work is the
cold capacity-configurable runner for M16,then optional affinity as its own unit.

Known accounting prerequisite: the proof-mask review found inherited interval-CPC
ledger undercounts in selectedbe7c2887. Correct them on a source-neutral accounting
checkpoint before claiming full NEES qualification; do not copy mask-specific
formulas into interval code. Record actual source/blob identities after this repair.
Physical QueryProcessCycleTime remains measured evidence,not mechanical-ledger proof.

Preparation validation2026-09-28: matrix JSON,power-of-two capacities,16x ratio,
byte arithmetic and timeout/topology invariants checked. Actual selected-source
private constructors at all four planned capacities matched the listed payload;
small shared-cache construction confirmed40bytes/entry plus12stats bytes.
No solve/performance run or2.5GiB allocation was performed during preparation.
