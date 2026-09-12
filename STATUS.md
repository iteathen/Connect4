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
slot64 lanes pass locally. Remote qualification of this follow-up is pending.

Next: extend qualified conditional response/deadline composition and measure
whether evicted proofs would close revisited obligations. The failed run's
completed-task expansion aggregate omits active work
and is not a total node count. See the
[search-volume reassessment](docs/research/2026-09-12-search-volume-structural-review.md).
Do not dispatch another root while this investigation is unresolved.

Global arena reset requires stopped submissions and quiescent workers. Finite
capacity exhaustion is an explicit failing resource outcome, never a proof.
State capacity tiers, retained hashes, growth peak memory, replacement pressure,
ETC and priority probing remain performance hypotheses. Historical revision-2
run 34676507073 ended without a proof near 15.7 GB RSS; this audit does not imply
that its performance problem has been solved. Complete cheap U1/U2/NDC forward
integration remains unestablished.

The [methods review](docs/research/2026-09-12-negamax-methods-local-review.md)
reconciles research with active settings. Local shallow construction through
depth 4 took 18.1714 ms. A bounded coordinator diagnostic shows only one initial
authoritative task at split 3; exploration is disabled. Task granularity and
dependency-aware work supply remain measured limitations. Structural closure
coverage and repeated proof work now take investigation priority. The complete
strategic U1/U2/NDC closure remains incomplete; the guarded response profile is
one qualified instance, not an empty-root solution. Asynchronous reporting and
write-side contention remain unfinished follow-up work.
