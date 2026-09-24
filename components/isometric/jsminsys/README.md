# IsoMax JSMinSys adapter

IsoMax is now a thin Connect4 application adapter over JSMinSys.

Pinned library:

`vendor/jsminsys` -> `iteathen/JSMinSys@24ef9b4dff33be85af6b403d563294983662fb78`

## Ownership boundary

IsoMax owns only application-facing policy:

- the public standard 7x6 `solve7x6` API;
- the standard-geometry selection;
- the 120-second application timeout ceiling;
- input/result translation into `rootWdl` and caller-frame `move`;
- CLI, integration/oracle qualification, and benchmark reporting.

JSMinSys owns the reusable execution and Connect4 machinery:

- `Worker` and `RbaBranchWorker`;
- `BranchManager` and `RbaBranchManager`;
- `ManagedThreadSession`;
- managed worker/manager/host composition;
- shared RBA TT and work queues;
- Connect4 RBA geometry, coordinates, cofactors and fronts;
- CPC and live-line evaluators;
- CPC-first local Negamax/alpha-beta;
- lifecycle, cancellation, cleanup and telemetry;
- complete operation/cycle accounting for the managed execution graph.

The active IsoMax solve path is:

```text
components/isometric/solve.mjs
  -> vendor/jsminsys/addons/prepareConnect4RbaGeometry
  -> vendor/jsminsys/addons/runManagedConnect4CpcRba32
  -> translate absolute value/witness to IsoMax API result
```

There is intentionally no second IsoMax-local worker, manager, TT, RBA kernel, or
hot-loop implementation. Historical versions remain recoverable from Git history.

## Qualification

Connect4 keeps application-level oracle and lifecycle tests. JSMinSys keeps the
unit/structural/cycle qualification for the machinery it owns. Connect4 CI runs
both suites against the pinned submodule revision.
