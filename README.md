# Connect4 IsoMax solver

The current solver is **IsoMax 0.2.0-rc.2**, packaged together under
[isomax/](isomax/README.md). It replaces this branch's older seven-worker adapter
default. Node 26.7 or later is supported; no npm install or submodule checkout
is needed for the current solver.

From the repository root:

```sh
cd isomax
node verify.mjs
node run.mjs
```

This performs one exact solve from the actual empty 7×6 board with four deep
center/live/center/live workers, 4 GiB shared TT and 256 MiB private TT per worker,
plus geometry plans. Observed peak RSS is about 6.44 GiB. All solver-owned tables,
geometry plans and workers are prepared before the all-ready barrier.

No RLC, supplied opening, solved table or prior-run proof cache is used. The
retained candidate mean is 53.828 s; standalone package confirmation was 55.326 s.
Primary timing includes empty-root construction and exact solving after readiness;
initialization and cleanup are separate. The ≤10 s goal remains unmet.

[Download the archive](isomax/dist/iteathen-isomax-0.2.0-rc.2.tgz),
[verify SHA-256](isomax/dist/SHA256SUMS), or read the
[setup and dimension guide](isomax/README.md).

Inside `isomax/`, `node run.mjs --columns 7 --rows 5` selects different dimensions
at initialization. For a fast installation check, use `--columns 1 --rows 4
--shared-entries 256 --local-entries 256`. Winning length is four. Performance
qualification is on 7×6; portable unpinned timing is unqualified.

For the measured Windows i5-12600K and recorded Node27 nightly, use PowerShell7:

```powershell
./run-i5.ps1 -NodePath 'C:/path/to/recorded-node27/node.exe'
```

That launcher verifies logical CPU targets 0/2/4/6 and sets process affinity85.
[profile.json](isomax/profile.json) owns the settings;
[provenance.json](isomax/provenance.json) locks the source and runtime closure.

The existing `components/isometric/solve.mjs` API now delegates to this package.
It accepts zero-based move histories, defaults to four workers and a600s ceiling,
and reports unavailable diagnostic counters as null. Pre-aborted preparation
rejects before worker/table allocation. For initialization before search, use
the package's `prepareLazySmpConnect4Rba32` API and call `solve()` after readiness.
The prepared session is one-shot; close idle sessions.

From the repository root, run `npm test` and `npm run test:package` for qualification.
The package runs and verifies without the producer checkout; its maintainer
generation tool belongs to JSMinSys. Canonical research and BSFP are unchanged.

Current solver implementation branch: `work/isomax-jsminsys-rebuild`.

## Historical replaced adapter

The following describes the previous source/profile. Its tools, gitlink and
qualification records remain for reproduction; they are not current defaults.

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
