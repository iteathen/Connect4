# IsoMax JSMinSys adapter

## Current packaged dependency

The adapter now imports `../../isomax/index.mjs` from its component location.
Connect4 distributes the0.2.0-rc.3 package under root `isomax/`;
producer source is `e6580e951c8318395446dd5916482efddc3d33fd`.
Its public initializer discovers physical performance cores and owns verified
Windows/Linux binding, or documented macOS scheduling hints, before worker setup.
The profile retains 4 GiB shared and256MiB private TT per
worker, 600s search ceiling, native layouts and compiled-transition admission.
Run `node isomax/verify.mjs` from the repository root to verify that dependency.

The producer owns support libraries and hot execution. Connect4 retains the
thin fixed7×6 application entry and independent qualification. Other dimensions
are available through the package's public initializer and standalone launcher.
No submodule is needed for current execution.

## Historical replaced gitlink

The remaining text records the old dependency and profile. It does not describe
current execution; reproduce it only at the original source revision.

IsoMax is a thin Connect4 application adapter over JSMinSys.

Pinned library:

`vendor/jsminsys` -> `iteathen/JSMinSys@a3cf7f9ca5c90e5025542c3b27ab0b735a610e9a`

## Ownership boundary

IsoMax owns only application-facing policy:

- the public standard 7x6 `solve7x6` API;
- standard-geometry selection;
- the 120-second application timeout ceiling;
- the two-worker minimum;
- consumption of the pinned six-deep/one-wide library profile (4M shared, 1M
  private entries per worker, full exact sharing);
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
