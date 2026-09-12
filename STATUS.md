# Connect4 frontier-native exact solver audit status

**Updated:** 2026-09-12
**Branch:** research/frontier-negamax-conformance
**Research direction / architecture:** Josh Oshiro
**Implementation / qualification:** OpenAI ChatGPT

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
[original 2025 engine study](docs/research/2026-09-12-original-engine-structural-lessons.md).
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
