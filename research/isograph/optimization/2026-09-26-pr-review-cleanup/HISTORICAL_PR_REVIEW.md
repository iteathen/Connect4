# Historical IsoMax PR disposition review

Reviewed 2026-09-26 in C:/r/isomax-isograph-019. No GitHub mutations, solver edits, tests or benchmark campaigns. This is a bounded architectural-disposition review, not full independent qualification of obsolete concurrent code.

## Recommendation

Close #161, #146, #134, then #113 as superseded, without merging. Preserve exact historical heads and useful qualification/negative evidence before deleting corresponding branches. Do not cherry-pick the old scheduler into the replacement or propagate the BSFP workflow edits in #113.

## Exact live identities and CI

Both gh pr view and final git ls-remote agree. All PRs remain OPEN and MERGEABLE.

| PR | Head | Base | Checks | Disposition |
|---|---|---|---|---|
| #113 | c906f83aa536d36b3e53bbc7f65678612f82c387 | solver/isometric@1f98d7b15eefdc5cf032f6f6bcb4bb71b51a02b1 | 9 success, 4 canceled; UNSTABLE | Superseded scheduler; preserve then close |
| #134 | 309009829a888e700dbccea1282cacfdd11e0925 | #113 exact head | 7 success; CLEAN | Superseded fixture/lifecycle repair; preserve then close |
| #146 | a26ef2254c850243f68505eeff1d849ad0f4f0c0 | #134 exact head | 7 success; CLEAN | Superseded conserved-delta runtime; preserve then close |
| #161 | 48d219edd527c92aa31349ac90fdc74688830d7c | #146 exact head | 8 success, 2 Windows failures; UNSTABLE | Research-only experiment; preserve then close |

PR URLs: https://github.com/iteathen/Connect4/pull/113 ; https://github.com/iteathen/Connect4/pull/134 ; https://github.com/iteathen/Connect4/pull/146 ; https://github.com/iteathen/Connect4/pull/161

Replacement: work/isomax-jsminsys-boundary-cleanup@2ed88683ba46fc4d99790414ad99a2e409acf400. None of the four old heads is its ancestor (merge-base --is-ancestor returned 1 for each). Do not say already merged.

## Authority and actual replacement

Read global authority and repository AGENT_LOCAL routing. Current replacement AGENT_LOCAL records the owner-authorized fresh rebuild on 2026-09-23, prohibits restoring earlier implementation paths, requires two or more workers, and forbids BSFP changes.

Current source is decisive: components/isometric/solve.mjs calls prepareConnect4RbaGeometry and runLazySmpConnect4Rba32 through public JSMinSys addons. The README explicitly says no supported Connect4 Surplus + Branch Manager composition exists. The current gitlink is JSMinSys@04d37498607ace16dae33c79462ddfe1503c8a0d. Current Isometric tree contains only NEES_PROFILE.md, jsminsys/README.md and solve.mjs; old solver.mjs/execution are absent. Commit 9a3ffe49 collapsed the runtime boundary into JSMinSys; acfb341d made Lazy SMP the sole path.

Routing discrepancy: STATUS and AGENT_LOCAL's fresh-rebuild paragraph still narrate the earlier 51bd9bc shared-TT restoration. Their topology/pin prose is stale relative to current source/README. This does not invalidate the prohibition on resurrecting pre-JSMinSys machinery.

## Actual diff findings

### #113

Correct PR diff is merge-base c11cf0838b8a5d8932c46e851e9c82677b025508..c906f83: 30 files, +4637/-835. Comparing two-dot against today's base incorrectly attributes base-only external-oracle evidence files to this PR.

Adds old shared TT, portable-q builder, shared events, manager worker, retained-pull worker and branchDistributor hook in the old recursive solver. Replaces task scheduling, updates execution/hot-loop tests, and introduces diagnostic/qualification/economics harnesses. Its design record docs/decisions/2026-09-20-isomax-surplus-opportunity-pull.md and components/isometric/NEES_SURPLUS_0_3.md retain realization rationale and limits.

Also changes .github/workflows/bsfp-portable.yml and bsfp-scaling.yml, including BSFP path filters and PR-smoke/full-dispatch restructuring: outside the current no-BSFP scope. Canceled exact-head jobs are qualify, verify, retained-pull-linux and retained-pull-windows. Green neighboring jobs do not qualify those canceled claims. Close; do not retry obsolete qualification merely to merge abandoned architecture.

### #134

Actual diff is 3 files, +51/-20. The fixture-only PR body is stale: six commits include the fixture repair AND lifecycle repairs. They reject startup on worker exit, settle manager completion on premature exit (including code 0), preserve the exit listener needed for termination settlement, race workersDone against session failure, and close the poisoned worker port after terminal failure.

Useful fixture: 33-ply forced block with expected {value:1, move:2}; test explicitly checks forced column 2, and computes/times other serial references before manager construction with a 2-second reference-cost assertion. Preserve those regression seams, but do not transplant old classes into the replacement. Seven exact-head checks passed, including Linux/Windows retained-pull and verify. This is historical evidence, not an architectural promotion reason.

### #146

Actual diff is 7 files, +687/-225. Conserved-delta module defines finite RUN/CLAIM encodings for <=256 workers, per-worker parity/bounded counters, per-worker exposure reservations and manager D/READY accounting. Root admission moves into manager reserve/commit/refund. Recovery harvests vectors, distinguishes claim parity, refunds dead reservations and restores availability. Tests are adapted to the new encoding.

Last commits also add awaitRootExposureGrant with Atomics.wait at the first root frontier. Preserve this material synchronization choice in provenance; this was more than passive accounting. No new independent performance/correctness qualification is asserted here. All seven checks passed, but the entire runtime owner is now superseded.

### #161

Actual diff is 4 files, +590/-186. The model test explicitly proves only a conservation/lifetime precondition; runtime machinery patches a disposable copy of the old tree by exact source-string substitution. The wrapper retains the original economics harness as retained-pull-comparison.prototype-base.mjs. The PR body is stale about source integration: experimental runtime integration is present at the reviewed head, though it establishes no production promotion.

Both Windows jobs in https://github.com/iteathen/Connect4/actions/runs/35770867992 fail BEFORE economics at: q-carry prototype patch missing manager carry flag declaration. The patch requires literal LF source text, consistent with a checkout newline portability defect. This is not an algorithmic falsification. No artifacts were returned by that run's artifacts endpoint; logs are still available. Green Linux jobs alone do not prove the stated performance falsifier passed.

## Evidence retention and safe cleanup conditions

No local tags contain #113's head. Search of canonical research/docs for the four abbreviated SHAs and q-activation/q-carry/conserved-delta/retained-pull terms found no matches. That does not prove no equivalent finding exists, but canonical retention was not demonstrated.

Before branch deletion, retain a recoverable immutable archive ref or bundle covering #161 and its ancestor chain, with a manifest naming all four exact heads, bases, PR URLs, check runs and superseding head. One archive at #161 covers the linear source history; retain separate identity/evidence boundaries for each PR. Do not rely solely on expiring Actions artifacts or unpushed local refs.

Preserve:
- #113 scheduler design/NEES record, exact harness semantics, canceled-versus-successful qualification disposition.
- #134 forced-block fixture and lifecycle failure/termination-settlement rationale, successful exact-head cross-platform checks.
- #146 accounting/parity-recovery model, bounded domains, manager root admission/root synchronization choice, exact-head checks and any separately recorded economics.
- #161 conservation-only model scope, exact runtime patch/harness, Windows pre-experiment patch failure, and Linux results with no unsupported performance conclusion.

Research conclusions belong to research/semantic-quotient. Historical implementation/qualification may remain in a named immutable archive; no live compatibility implementation should be introduced solely for retention.

Close leaf-to-root (#161 -> #146 -> #134 -> #113). Open-PR scan found only that stack targeting these four old branch names. Other refs descend from the old heads: external-calibration, parent-necessity, subtractive-cache-key experiments, measurement refs, and deficit-credit/exposure-latch work. Their deletion needs separate activity/evidence inspection; their existence is not proof of safe archival ownership.

Refresh expected heads/open dependents before subsequent mutations. Preserve current JSMinSys branch, durable solver/research owners and all BSFP work.
