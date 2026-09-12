# Connect4 frontier-native exact solver audit status

**Updated:** 2026-09-12
**Branch:** research/frontier-negamax-conformance
**Research direction / architecture:** Josh Oshiro
**Implementation / qualification:** OpenAI ChatGPT

Continuation checkpoint: [optimization handoff](docs/research/2026-09-12-frontier-optimization-handoff.md).
Verify the remote head and hosted checks before further mutation; local evidence
is recorded below. The push does not alter the full-root revision trigger.

Latest integration: [native local identity and attribution correction](docs/research/2026-09-12-native-key-integration.md).
The packed state owner is integrated with field consumers and stable readers.
Final paired depth-8 elapsed time is flat; measured CPU is 1969.5 → 1929.5 ms,
with identical counters and two MiB less state payload. This is a modest measured
CPU change, not a guaranteed speedup. 74 controls, six campaigns and ten provider
controls passed locally. No children remain; see the continuation checkpoint and the full root
remains unlaunched.

Latest representation experiment: [native two-word local identity](docs/research/2026-09-12-native-relational-key.md).
Exact 60/64-bit layouts fit the current depth-8/depth-21 reservations. Native
two-word lookup was 18.0% faster in an isolated corpus test; per-query repacking
was slower. Production is unchanged pending field-consumer integration and
end-to-end measurement. Width controls and all depth-8 counters matched.

Latest external measurement: [Pons W/D/L protocol batch](docs/research/2026-09-12-pons-protocol-benchmark.md).
One 60-second batch completed 137 positions across the six published sets;
137/137 matched external score signs. All sets are partial, and Begin-Hard's first
position remained unfinished. Fresh setup dominated easy-case batch cost.
No benchmark processes remain; the engine implementation was unchanged.

Latest [ranked hot-loop optimization](docs/research/2026-09-12-depth21-ranked-optimization.md):
depth-21 checkpoint calls 60.56M → 92.25M under identical 60-second bounds;
every run still timed out. Completed depth-8 mean 1.815 → 1.729 seconds with
identical search/proof/operation counters. 69 controls, six campaigns and ten
representation controls passed locally. No solver processes remain. Changes are
uncommitted; further TT/descriptor and support work remains.

Bounded-test [reservations now derive from board/depth and an explicit budget](docs/research/2026-09-12-board-depth-reservation.md).
Depth 21 reserves 2,097,152 states and coupled class/chunk/proof storage (about
1.21 GiB accounted within a 2 GiB budget). 62 controls and four campaigns passed.
The resized test timed out and was killed at 60 seconds. A separate profiler
worker preserved a 55.04-second window mapped to 810 source locations; the final
roughly five seconds are unprofiled. Depth 21 remains incomplete. No test remains
running; other production resource profiles and the full-root trigger are unchanged.

The requested [depth-21 CPU profile](docs/research/evidence/2026-09-12-depth21-line-cpu/line-cpu.md)
used the normal empty 7-column by 6-row board and a 60-second timeout. It stopped
after 2268.0779 ms (2453 CPU ms) on the existing 262,144-state reservation limit;
the depth-21 search did not complete. Source-mapped timing was preserved by an
evidence-only failure-reporting wrapper. Engine source/resources are unchanged.

The [changed-slot class fingerprint](docs/research/2026-09-12-changed-slot-class-hash.md)
now updates the parent's existing hash during residual construction, removing the
second whole-tuple traversal without added storage. All 842,426 recomputation
controls matched; 61 controls and four local campaigns passed, including forced
hash collisions. Normal depth-8 means were 1.940 seconds before and 1.865 seconds
after, with unchanged search/proof counters and memory. The observed 3.88% elapsed
reduction is a small local batch with baseline variation. Shared-TT status reads
and chunk bucket access lead the new CPU profile; full-root readiness is unchanged.

The [relational address investigation](docs/research/2026-09-12-relational-address-investigation.md)
confirms slot/bit positions already encode term identity; known IDs and unchanged
chunks already bypass hashing. A normal depth-8 run with post-search inspection
matched every search/proof counter and memory value, with production source unchanged.
Observed content collisions rule out using a slot, low word or folded XOR alone
as an exact address. Two assessed hash-free radix layouts add storage/dependent
reads. Its changed-slot composition candidate is now qualified above; the original
investigation remains evidence for the identity/address distinction.

The [compact chunk index](docs/research/2026-09-12-compact-chunk-index.md) saves
5 MiB per worker at the current reservation while retaining stable IDs, exact
single-copy keys and full chunk capacity. It uses smaller bucket-head arrays
with private preallocated collision links. 60 controls and four campaigns passed.
Final depth-8 means were 1.919 seconds baseline versus 1.928 seconds candidate;
timing is effectively unchanged. This is a memory reduction, not a speedup claim.
Search/proof counters match and no storage grows. Shared TT probing remains a
performance target; full-root readiness is unchanged.

The latest [chunk probe diagnostic](docs/research/2026-09-12-chunk-probe-distribution.md)
found 94.75% one-slot lookups, average 1.060 slots and maximum 10 in normal depth-8
search. Collision scanning is not the dominant lookup mechanism at these bounds.
Engine dictionaries reserve 40 MiB; observed lookup reads touched 4.69 MiB of
distinct 64-byte address blocks. This is not a hardware cache-miss measurement.
An isolated instrumented copy matched all search/proof/descriptor counters;
production source is unchanged. Next: initial index/key access locality, with
capacity contracts preserved. Full-root readiness remains unchanged.

The latest [chunk lookup experiments](docs/research/2026-09-12-chunk-lookup-experiments.md)
rejected two transformation caches: both reduced interning but ran slower and
added 6.19 MiB. The retained chunk hash uses three multiplications instead of
eight and keeps exact two-word comparison. 59 controls and four campaigns passed.
Four-run elapsed means were 1.950 seconds baseline and 1.929 seconds candidate;
the difference is within run variation, so no reliable speedup is claimed.
Memory/search/proof counters match and no storage grows. Next: actual chunk probe
distribution and memory-access cost. Full-root readiness remains unchanged.

The latest [composed semantic hash reuse](docs/research/2026-09-12-state-hash-reuse.md)
eliminated 95.37% of repeated hash computations in depth-8 search. Four alternating
cold runs measured 2.032 seconds baseline versus 1.838 seconds candidate (9.54%
elapsed reduction), with unchanged search/proof work and zero storage growth.
It adds 2.03125 MiB of reserved metadata per worker at the measured capacity.
58 controls and six local campaigns/controls passed; resource qualification now
accounts for those arrays explicitly. A slower bound-writer candidate was removed.
The next target is nonempty chunk interning. Full-root readiness remains unchanged.

The latest [ranked probe/frontier refinement](docs/research/2026-09-12-ranked-probe-refinement.md)
removes hash-mismatch generation reads, empty-chunk hash probes, redundant
singleton conversions and the second frontier masking pass for disjoint frames.
57 controls and eight local campaigns/controls passed. Four alternating depth-8
runs measured 2.155 seconds baseline versus 2.081 seconds candidate; run variation
prevents a robust speedup claim. Search/proof counters and reserved typed memory
match, with no storage growth. The new source profile still ranks TT and chunk
lookups first. Descriptor/hash preparation is the next owner; full-root and
integration readiness are unchanged.

The active bounded runner, online workers and standard-root coordinator now enable
[direct semantic-edge reuse](docs/research/2026-09-12-direct-semantic-edge-reuse.md).
It bypassed residual/state hash lookups for 91.18% of depth-8 transitions. Four
alternating cold runs measured 8.40 seconds baseline versus 2.22 seconds candidate
(73.57% elapsed reduction), with identical search/proof work and zero storage
growth. It adds 7 MiB for this reservation. 54 controls and four bounded campaigns
pass. Full-root sizing/integration remain unresolved; its trigger is unchanged.

Canonical recursive search now uses [reserved, sealed storage](docs/research/2026-09-12-preallocated-search-storage.md).
Initialization allocates state/residual dictionaries, descriptor metadata and TT
scratch; the selected standalone solver also reserves its local proofs. Capacity
exhaustion fails explicitly instead of growing inside search. 53 controls and
affected bounded campaigns pass. Depth-8 growth counters stay unchanged; the
four-run comparison measured 8.28 seconds versus 8.12 seconds before reservation,
with a larger reserved footprint. This is allocation removal, not a speedup claim.

Latest local [ranked hot-loop changes](docs/research/2026-09-12-ranked-hot-loop-optimization.md)
remove repeated chunk-key checks, empty TT tail scans and singleton-free terminal
column scans. Four alternating cold depth-8 runs measured 10.16 seconds baseline
versus 8.27 seconds candidate (18.6% reduction), with unchanged search/proof work
and retained memory. Forty controls and the bounded engine/terminal campaigns
passed. The remaining ranked operations are still under review; full-root and
repository integration claims remain unchanged.

Local tests now have a [CPU-to-source-line profiling entry point](docs/research/2026-09-12-line-cpu-profiling.md).
The depth-8 qualification produced 537 mapped locations with frozen source,
explicit sampled CPU estimates and unchanged search/proof counters. Search was
10.76 seconds, process CPU 10.69 seconds; this is a profiled measurement, not a
speedup claim.

Latest local cleanup removed the mover transition's whole-class input copy and
redundant private-cache input checks. The immutable canonical chunks now feed
both transition paths directly. [Qualification and evidence](docs/research/2026-09-12-direct-residual-read.md):
23 controls and four bounded campaigns passed. The same depth-8 test took
10.06 seconds with identical search/proof counters; no measurable speedup is
established against the earlier 10.04-second run. No full root was launched.

Earlier local working-tree measurement: normal Negamax with an explicit depth-8
horizon on the empty 7-column by 6-row board completed in 10.04 seconds. Its
[operation profile](docs/research/evidence/2026-09-12-normal-negamax-depth8-profile/operations.md)
completed in 10.86 seconds with every search/proof counter unchanged. Both had
a 60-second external timeout and left no test process. Pruning and live-line
ordering were active; depth-boundary outcomes remain unknown. These local
changes are uncommitted and full integration qualification remains pending.

The active-path line-by-line correctness/compliance audit is complete for source
revision 9c778bcaf010372ca2a3a91a7cdcec8debf5518f. The single standard 7x6 integrated
measurement [34693275092](https://github.com/iteathen/Connect4/actions/runs/34693275092)
ended at the 30-minute job limit without a root result at revision
9e93018f06ca8a3f1fd2c012fb7ea4aa39b07775. Readiness was
committed before admission; no other root was active. Performance and standard-root
completion remain unproven.

The [audit ledger](docs/research/2026-09-12-full-engine-sanity-audit.md) records
findings, fixes, retained behavior and qualification. The
[coverage inventory](docs/research/2026-09-12-frontier-audit-coverage.json) records
44 source files / 10,780 lines and five workflows with exact Git blob identities.

C4-0001 owns domain truth, C4-0006 CPC/WSL meaning, C4-0007 strategic dependency
premises and C4-0010 the exact forward proof procedure. No new CPC/WSL/NDC
implication is claimed. Semantic/proof separation, adapter-owned generations,
canonical residual materialization and advisory-only proof hints are retained.

The continuation corrected packed value contracts and proof-lock release,
transactional TT/storage failure, arena domain binding, stale observations,
structural-bound contradictions, detached work ownership, worker protocol and
cleanup failures, qualification reference ownership and workflow dependency edges.
All 33 targeted controls pass locally. Replacement (34692987151), dependency
(34692987161), ExploreHint (34692987156) and slot64 (34692987155) CI succeeded
on the exact audited source revision.

The first guarded response-coverage profile is now integrated and locally
qualified. It compiles adjacent response resources into 80 bytes of requirement
coverage masks, uses the existing packed support bits for its guard, and returns
a side-to-move bound through the existing frontier interface. Eval policy remains
unchanged. See the [profile and evidence](docs/research/2026-09-12-incremental-response-closure.md).
All 40 contract controls and bounded replacement, dependency, ExploreHint and
slot64 lanes pass locally. All four remote bounded lanes passed on source commit
14772b33383597a86212cd1c2dd636e8036aeca4: dependency 34697348137, ExploreHint
34697348141, replacement 34697348155 and slot64 34697348163.

The [state-retention review](docs/research/2026-09-12-state-retention-review.md)
removed the derived per-state hash cache. Exact identity, node counts and state
placement match; bounded kernels save 4.0–9.9% typed storage. Isolated local
timings range from 1.9% faster to 2.4% slower: a memory reduction, not a proved
speedup or solve-space reduction. Eight storage and 33 other contract controls,
plus seven bounded campaigns, pass locally. No new full root was run.

The terminal projection now returns at the first playable mover singleton,
eliminating the remaining threat scan after an exact immediate win. All six
relevant local campaigns pass after this follow-up; independent terminal checks
cover 401,165 immediate-win positions with zero mismatches. No eval or strategic
parity policy changed, and no throughput improvement is claimed from census counts.

Next: identify further useful active-path reductions using the
new [relational duplication review](docs/research/2026-09-12-relational-duplication-review.md)
and the
[original 2025 engine study](docs/research/2026-09-12-original-engine-structural-lessons.md).
The active worker uses residual relations, not a coloured bitboard, but retains
physical distinctions between equivalent neutral-column capacities. A complete
bounded census merges 4,431 of 294,593 current 4x5 states, including 1,727 unresolved
states. No production identity change was made. Smaller TT capacity also causes
measurable repeated work; implemented pruning continues to pass bounded checks.
The [per-method CPU assessment](docs/research/2026-09-12-hot-method-cpu-assessment.md)
records current optimization status and 24 local sampled bounded solves. Exact
descriptor conversion, residual misses and repeated access are material costs;
the measured eval arithmetic is comparatively small. Concurrent writer wait and
full-root costs remain unmeasured by that single-thread profile.
Existing singleton masks reproduce the original parity flags: 13,724 flag and
65,328 slot-value comparisons passed across six board sizes. This is research
evidence, not a production policy change or demonstrated speedup. Complete parity
terminalization remains unresolved but does not block smaller structural CPU
and memory improvements. Dimensions remain variable. Investigate relation reuse
and transient-versus-retained state cost on matching bounded obligations.
The failed run's
completed-task expansion aggregate omits active work
and is not a total node count. See the
[search-volume reassessment](docs/research/2026-09-12-search-volume-structural-review.md).
Do not dispatch another root while this investigation is unresolved.

Global arena reset requires stopped submissions and quiescent workers. Finite
capacity exhaustion is an explicit failing resource outcome, never a proof.
State capacity tiers, growth peak memory, replacement pressure,
ETC and priority probing remain performance hypotheses. Historical revision-2
run 34676507073 ended without a proof near 15.7 GB RSS; this audit does not imply
that its performance problem has been solved. Complete cheap U1/U2/NDC forward
integration remains unestablished.

The [methods review](docs/research/2026-09-12-negamax-methods-local-review.md)
reconciles research with active settings. Local shallow construction through
depth 4 took 18.1714 ms. A bounded coordinator diagnostic shows only one initial
authoritative task at split 3; exploration is disabled. Task granularity and
dependency-aware work supply remain measured limitations.
The current root disables Branch Manager exploration and omits its executor
subscription/completion wiring. A fresh held-leaf diagnostic confirms one
initial proof task and zero scouts. Component qualification passes, but effective
proactive work supply in the root has not been demonstrated. Structural closure
coverage and repeated proof work now take investigation priority. The complete
strategic U1/U2/NDC closure remains incomplete; the guarded response profile is
one qualified instance, not an empty-root solution. Asynchronous reporting and
write-side contention remain unfinished follow-up work.
