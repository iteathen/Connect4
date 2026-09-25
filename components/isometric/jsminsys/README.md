# IsoMax JSMinSys adapter

IsoMax is a thin Connect4 application adapter over JSMinSys.

Pinned library:

`vendor/jsminsys` -> `iteathen/JSMinSys@6a861d661c6a2bf04005fa20da54e5e588b51ad3`

## Ownership boundary

IsoMax owns only application-facing policy:

- the public standard 7x6 `solve7x6` API;
- standard-geometry selection;
- the 120-second application timeout ceiling;
- the two-worker minimum;
- the current default Lazy-SMP shared sampling mask;
- CLI, integration/oracle qualification, and benchmark reporting.

JSMinSys owns the reusable execution and Connect4 machinery:

- `ManagedThreadSession` lifecycle/cleanup support;
- Lazy-SMP host and worker composition;
- private CPC/Negamax search state and private exact caches per worker;
- the shared exact W/D/L cache;
- Connect4 RBA geometry, coordinates and cofactors;
- CPC and live-line evaluators;
- deterministic caller-frame result/witness handling;
- cancellation, timeout, cleanup and telemetry; and
- operation/cycle accounting for the active Lazy-SMP execution graph.

The active IsoMax solve path is:

```text
components/isometric/solve.mjs
  -> vendor/jsminsys/addons/prepareConnect4RbaGeometry
  -> vendor/jsminsys/addons/runLazySmpConnect4Rba32
  -> return the JSMinSys Lazy-SMP result directly
```

There is no supported Connect4 Surplus + Branch Manager composition and no
IsoMax-local worker, manager, TT, RBA kernel, result translator, or hot-loop
implementation. Historical implementations remain recoverable from Git history.

## Qualification

Connect4 keeps application-level oracle, reflection/witness, lifecycle,
multi-worker and Fhourstones qualification. JSMinSys keeps unit, structural and
cycle-ledger qualification for the machinery it owns. Single-worker execution
is not a valid qualification mode.
