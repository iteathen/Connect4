# IsoMax JSMinSys adapter

IsoMax is now a thin Connect4 application adapter over JSMinSys.

Pinned library:

`vendor/jsminsys` -> `iteathen/JSMinSys@67ecf83c1e0789a230afe1261464c23d217e9757`

## Ownership boundary

IsoMax owns only application-facing policy:

- the public standard 7x6 `solve7x6` API;
- the standard-geometry selection;
- the 120-second application timeout ceiling;
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
- final managed Connect4 result construction, including exact-value to `rootWdl` conversion and witness to `move`;
- lifecycle, cancellation, cleanup and telemetry;
- complete operation/cycle accounting for the managed execution graph.

The active IsoMax solve path is:

```text
components/isometric/solve.mjs
  -> vendor/jsminsys/addons/prepareConnect4RbaGeometry
  -> vendor/jsminsys/addons/runManagedConnect4CpcRba32
  -> return the JSMinSys-managed result directly
```

There is intentionally no second IsoMax-local worker, manager, TT, RBA kernel,
result translator, or hot-loop implementation. Historical versions remain
recoverable from Git history.

## Qualification

Connect4 keeps application-level oracle and lifecycle tests. JSMinSys keeps the
unit/structural/cycle qualification for the machinery it owns. Connect4 CI runs
both suites against the pinned submodule revision.
