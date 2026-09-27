# IsoMax — JSMinSys Lazy SMP Connect4

This branch uses JSMinSys Lazy SMP as the sole active Connect4 execution
composition. Each search worker owns a complete private CPC/Negamax search and
private exact cache. Workers share only exact W/D/L cache evidence. There is no
Connect4 Surplus queue and no Branch Manager execution role.

Single-worker execution is forbidden. The selected default is six deep workers
plus one iterative root-frontier worker, 4M shared TT entries, 1M private entries
per worker and full exact sharing. This operating profile was qualified on the
i5-12600K; other hardware has no implied performance optimum.

```sh
git submodule update --init
npm ci
npm test
node tools/solve-isomax.mjs --moves 0,1,0,1,0,1,0
# Windows, cold measurement only; FFI is never used to execute solver logic:
node --experimental-ffi tools/bench-fhourstones.mjs
```

Use Node 26.7.0 for the recorded qualification. JSMinSys is pinned as a git
submodule to `a3cf7f9ca5c90e5025542c3b27ab0b735a610e9a`. The governing performance reference is NEES Draft 0.5
at `7650bef0aecc0d2b226ecf253a1f8937ccf89d69`.

The active application path is
`components/isometric/solve.mjs -> runLazySmpConnect4Rba32()`.
The adapter and CLI consume the pinned library profile directly. Worker 0 starts
with two-ply root horizons and switches deep at one unresolved root action; the
other six workers start deep. The shared-cache sampling mask is 0 (full sharing).
See docs/qualification/20260927-selected-isomax.md for the promotion evidence.

The retained gameplay specifications are under `docs/specs/`. Historical
Surplus/Branch-Manager experiments remain available through Git history and
historical qualification documents, but they are not an active execution path.

Current IsoMax implementation branch: `work/isomax-jsminsys-rebuild`.
The retired `solver/isometric` lineage is preserved under
`archive/lazy-smp-retirement-20260926/solver/isometric`, not another active model.
