# Current state

Active rebuild branch: `work/isomax-jsminsys-rebuild`.

## Current IsoMax implementation

The public standard-7x6 solver now uses the merged JSMinSys shared-TT branch-manager execution path.

Pinned dependency:

`vendor/jsminsys` -> `iteathen/JSMinSys@d176330ebed2c29d8b71f290f95734b107817d3e`

Public execution:

```text
solve7x6 legal replay
  -> runtime-configured 7x6 RBA geometry
  -> canonical root q
  -> shared exact RBA TT
  -> Branch Manager thread
       -> dependency attachment / Bellman reconciliation / surplus exposure
  -> N evaluator workers
       -> direct q claim
       -> CPC-first structural evaluation
       -> one-ply RBA cofactor/canonicalization
       -> exact/scalar publication
       -> retained first unresolved child
       -> surplus children through shared ready queue
  -> P0-oriented W/D/L + caller-frame move
```

The TT owns q identity, exact/bound evidence, dependency topology, lifetime,
ready-queue membership and event membership. The Branch Manager has no separate
branch table and workers do not request work via per-branch messages.

The current shared ready queue is FIFO across q arrivals. Prepared action order
and CPC evidence determine local retained/surplus order. Global value-priority
queueing remains an unimplemented optimization.

Public execution supports 1..64 evaluator workers plus one manager thread.
Worker/core affinity is not fixed by the solver.

## Qualification

Connect4 CI run `35930426403` passed:

- Connect4: 57/57 tests;
- pinned JSMinSys: 125/125 tests;
- independent physical-oracle W/D/L and deterministic caller-frame move controls;
- exact agreement at 1/2/4 evaluator workers;
- reflection controls;
- shared branch-queue activity;
- managed cancellation/deadline cleanup.

This qualifies the maintained control set. It is not exhaustive proof over all
reachable standard positions.

## Benchmark state

The previously recorded Fhourstones run `35927770000` was produced by the
superseded one-worker private CPC alpha-beta wrapper. It solved 1/4 official
cases and is retained only as historical comparison evidence.

The current Branch Manager/shared-queue implementation has not yet inherited
that score. Re-run `tools/bench-fhourstones.mjs` before making a current
Fhourstones claim.

## Legacy code

The older pre-JSMinSys shared-TT / recursive Four-Front implementation remains
under `components/isometric/execution/**` and `components/isometric/rba/**`
for differential/component evidence. `components/isometric/solve.mjs` does
not import or execute it.

Recursive Four-Front is not in the current JSMinSys production evaluator.
The deleted `components/isometric/jsminsys/solver.mjs` private-alpha-beta
wrapper is no longer an active second implementation.

## Claims not yet made

- full empty-root completion;
- Branch Manager Fhourstones qualification;
- performance superiority over external solvers;
- global highest-value work-queue priority;
- exhaustive all-state implementation verification;
- NEES-EXTREME / JMS-SEALED conformance.
