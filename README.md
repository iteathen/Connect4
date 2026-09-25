# IsoMax — JSMinSys Lazy SMP Connect4

This branch uses JSMinSys Lazy SMP as the sole active Connect4 execution
composition. Each search worker owns a complete private CPC/Negamax search and
private exact cache. Workers share only exact W/D/L cache evidence. There is no
Connect4 Surplus queue and no Branch Manager execution role.

Single-worker execution is forbidden. The public API defaults to two workers;
performance qualification uses four workers where specified.

```sh
git submodule update --init
npm ci
npm test
node tools/solve-isomax.mjs --moves 0,1,0,1,0,1,0 --workers 2
# Windows, cold measurement only; FFI is never used to execute solver logic:
node --experimental-ffi tools/bench-fhourstones.mjs
```

Use Node 26.7.0 for the recorded qualification. JSMinSys is pinned as a git
submodule to `a46d1312f9f5a659c22f33f553d2dbe8bd1da303`. The governing performance reference is NEES Draft 0.5
at `7650bef0aecc0d2b226ecf253a1f8937ccf89d69`.

The active application path is
`components/isometric/solve.mjs -> runLazySmpConnect4Rba32()`.
The current default shared-cache sampling mask is 7 (one-eighth eligible shared
consultation/publication), based on the current Lazy-SMP density campaign.

The retained gameplay specifications are under `docs/specs/`. Historical
Surplus/Branch-Manager experiments remain available through Git history and
historical qualification documents, but they are not an active execution path.
