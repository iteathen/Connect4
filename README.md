# IsoMax — fresh JSMinSys execution rebuild

This branch implements a native standard-7x6 RBA solver with a shared TT,
retained worker and BranchManager. Worker-private four-front construction is
the native value path. There is no production search fallback.
It contains no inherited solver implementation and no BSFP implementation.
The retained gameplay specifications are under `docs/specs/`.

```sh
git submodule update --init
npm ci
npm test
node tools/check-hot-scope.mjs
node tools/check-hot-scope.mjs --native-rba
node tools/solve-isomax.mjs --moves 0,1,0,1,0,1,0 --workers 1
# Windows, cold measurement only; FFI is never used to execute solver logic:
node --experimental-ffi tools/bench-isomax-cycles.mjs
```

Use Node 26.7.0 for the recorded qualification. JSMinSys is pinned as a git
submodule to `64ba37a11522b533a1de87942a14921fe690ef86`.
The governing performance reference is NEES Draft 0.5 at
`7650bef0aecc0d2b226ecf253a1f8937ccf89d69`.

See [execution API](components/isometric/execution/README.md) and
[NEES scope and outstanding qualification](components/isometric/NEES_PROFILE.md).
Move columns are zero-based. The solve timeout is at most 120 seconds. The
default boundary horizon is two plies. Uncovered queries and construction budget
exhaustion return INCOMPLETE with no WDL; arena exhaustion fails explicitly.
General retained RBA refinement/closure is still missing. This is a bounded
RBA solver implementation, not a completed full-game solver.
Oracle qualification currently covers bounded legal positions and finite RBA
fibers; an empty-board solve or general performance superiority is not claimed.
The tests' separate ranked-DAG kernel remains execution infrastructure only.
