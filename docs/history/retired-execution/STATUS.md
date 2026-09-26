> HISTORICAL SNAPSHOT at Connect4 `7db9b5c3d31d86e7cfee84d02c551a96c892d0cb`.
> Retired execution design/evidence; not current implementation authority.
> See ../../decisions/2026-09-24-isomax-lazy-smp-only.md.

# Current state

Active IsoMax integration branch: `work/isomax-jsminsys-boundary-cleanup`.

## Current IsoMax implementation

Pinned dependency:

`vendor/jsminsys` -> `iteathen/JSMinSys@51bd9bc09b2c50b84619bc7efa953ad9c1e0302a`

Current public execution:

```text
worker:
  claim q
  -> CPC/RBA evaluate
  -> retain one continuation
  -> publish surplus directly to shared queue
  -> continue

Branch Manager, independently:
  inspect surplus
  -> dedupe equivalent branches
  -> merge duplicate/transposed q
  -> maintain/clean TT
  -> clean stale/redundant queue entries
  -> prioritize useful ready work
  -> reset redundant workers
```

Workers do not dedupe. The Branch Manager does not generate or consume surplus.
The manager is not required for a worker to continue its retained path.

The shared TT carries q identity/evidence/dependency topology. Duplicate rows may
exist transiently because worker publication is intentionally blind; only the
manager collapses them. Redirects pin their canonical q until pending ownership
has been transferred safely.

## Qualification

Current JSMinSys restoration PR #28 merged as `51bd9bc09b2c50b84619bc7efa953ad9c1e0302a` after 157/157 JSMinSys tests passed with schema and Node compatibility green.

The managed worker again follows the required distributed topology:

```text
claim q
  -> CPC/RBA evaluate q
  -> retain at most one continuation
  -> publish unresolved siblings as surplus to the shared ready queue
  -> continue retained q immediately
```

The Branch Manager remains independent and off the worker evaluation hot loop. Managed Connect4 requires at least two search workers, and per-worker claim/evaluation counters are returned so idle-worker regressions are observable.

Connect4 verification run `36089752607` passed on `340920833a4c8bc2d0e75eb006ac22469fde9efb`, including exact oracle/witness controls and dedicated 2/4-worker Surplus-participation checks.

The restored topology has also been exercised on the maintained Fhourstones workload. Workers now participate correctly; the current blocker is TT/frontier capacity rather than idle-worker serialization.

## Benchmark state

Current pinned dependency:

`vendor/jsminsys` -> `iteathen/JSMinSys@51bd9bc09b2c50b84619bc7efa953ad9c1e0302a`

Current restored multi-worker qualification:

- JSMinSys: `51bd9bc09b2c50b84619bc7efa953ad9c1e0302a`;
- two-worker Fhourstones run: `36089367414` on Connect4 `fb8d0d50d037f8d48b37be0541bcf27a6115307d`;
- same restored production code remains pinned at the current branch head; later commits only repaired benchmark/test authority;
- corrected 2/4-worker same-runner A/B: `36089466712`;
- current Connect4 verification: `36089752607` — success.

On official input `45461667`, the restored 2-worker topology produced:

- 73,427 total q claims;
- 73,329 shared branches;
- worker claims: **36,596 / 36,831**;
- worker evaluations: **36,596 / 36,831**;
- 200,743 cofactor transitions;
- only 2 idle polls total;
- clean worker/manager shutdown.

The run did not reach an oracle result because the shared TT reached its configured 65,536-row capacity after about 33 seconds, with 33,598 ready q still outstanding. The other three official inputs also reached TT capacity before completion, with similarly balanced worker participation. This is a capacity/frontier-pressure failure, not a return to single-worker execution.

The corrected 2/4-worker A/B independently confirmed the topology. At 4 workers the restored candidate distributed claims approximately evenly across all workers (for example 38,530 / 39,430 / 39,500 / 39,174 in one run) before reaching TT capacity. The pre-restoration baseline still showed `claims=1`, `branches=0`, proving the regression seam was removed.

**Current next bottleneck:** reduce live TT/frontier pressure while preserving the required worker invariant: retain at most one continuation and publish unresolved viable Surplus. Reverting to private root-only Negamax or single-worker qualification is forbidden.

Historical pre-restoration Fhourstones qualification (single-worker execution is no longer permitted):

- Connect4 commit: `fa6c8340e95c5da7f05641850bc9eb30c0f4b25b`;
- workflow run: `36086563243`;
- protocol: official four inputs, one worker, one fresh solver session per input, 120-second per-case ceiling;
- result: 1/4 completed EXACT with matching oracle; remaining three timed out cleanly; no oracle mismatch.

Completed first input `45461667`:

- EXACT P0 win, move 3;
- 806,844 alpha-beta nodes;
- 807,290 cofactors/transitions;
- 230,273 cutoffs;
- 351,277 exact-cache hits;
- 455,568 CPC calls;
- wall 1,193.1766 ms;
- CPU 1,391 ms;
- 3,655,632,937 process CPU cycles;
- approximately 4,530.78 process cycles / alpha-beta node.

The remaining official inputs `35333571`, `13333111`, and the empty board each reached the unchanged 120-second ceiling and exited TIMEOUT with cleanup=true. Timeout reporting still does not preserve completed worker search counters, so nodes/cycles-per-node are unavailable for those cases.

The workflow outcome is therefore `INCOMPLETE_OR_FAILED` only because the four-case qualification did not complete; it is not an oracle/correctness failure.


Two-worker comparison run `36087647926` used the same pinned JSMinSys and official four-input protocol with only `workers: 2` changed:

- `45461667`: EXACT +1, move 3, oracle matched, same 806,844-node tree;
- wall 1,651.8195 ms;
- CPU 2,094 ms;
- 4,897,937,681 process CPU cycles;
- approximately 6,070.49 cycles / alpha-beta node;
- remaining three official inputs again reached the 120-second ceiling with clean TIMEOUT exits.

That historical two-worker run was performed while the managed worker still serialized the entire tree inside one private Negamax call, so worker 2 had no surplus to claim. It is retained only as regression evidence. The maintained benchmark harness now requires two workers and will not be restored to one.

## Legacy code

The pre-JSMinSys execution/RBA implementation remains only for component and
differential evidence. It is not imported by the public solve path.

## Claims not yet made

- full empty-root completion;
- corrected Branch Manager Fhourstones qualification;
- performance superiority over external solvers;
- globally sorted work queue;
- exhaustive all-state implementation verification;
- NEES-EXTREME / JMS-SEALED conformance.
