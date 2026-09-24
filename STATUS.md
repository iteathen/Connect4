# Current state

Active rebuild branch: `work/isomax-jsminsys-rebuild`.

## Current IsoMax implementation

Pinned dependency:

`vendor/jsminsys` -> `iteathen/JSMinSys@3a8f8fa5d27ab7b28579aee460eed43eda1c0e48`

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

Two prior results are historical controls:

- private one-worker CPC alpha-beta: 1/4 Fhourstones cases, first case 2.72 s;
- incorrectly wired Branch Manager: all official cases hit 65,536 live TT rows
  within seconds because manager-side work exposure and missing cleanup caused
  capacity exhaustion.

The corrected ownership/cleanup implementation requires a fresh benchmark before
any current performance claim.

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
