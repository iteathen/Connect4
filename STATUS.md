# Current state

Active IsoMax integration branch: `work/isomax-jsminsys-boundary-cleanup`.

## Current IsoMax implementation

Pinned dependency:

`vendor/jsminsys` -> `iteathen/JSMinSys@7f866a87d0fc0662529621590c02b9832f685c6c`

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

Connect4 CI run `35933307127` passed:

- Connect4 57/57;
- pinned JSMinSys 128/128;
- exact 1/2/4-worker oracle agreement;
- caller-frame reflection/witness controls;
- worker-published surplus / manager-only dedupe controls;
- manager worker-reset controls;
- redirect-lifetime concurrency regression;
- fail-closed deadline/cancellation cleanup.

## Benchmark state

Current pinned dependency:

`vendor/jsminsys` -> `iteathen/JSMinSys@7f866a87d0fc0662529621590c02b9832f685c6c`

Current official Fhourstones qualification:

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
