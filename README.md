# IsoMax — fresh JSMinSys execution rebuild

This branch implements a new shared TT, retained worker and BranchManager.
It contains no inherited solver implementation and no BSFP implementation.
The retained gameplay specifications are under `docs/specs/`.

```sh
git submodule update --init
npm ci
npm test
node tools/check-hot-scope.mjs
```

Use Node 26.7.0 for the recorded qualification. JSMinSys is pinned as a git
submodule to `64ba37a11522b533a1de87942a14921fe690ef86`.
The governing performance reference is NEES Draft 0.5 at
`7650bef0aecc0d2b226ecf253a1f8937ccf89d69`.

See [execution API](components/isometric/execution/README.md) and
[NEES scope and outstanding qualification](components/isometric/NEES_PROFILE.md).
The native WSL game kernel is not built by this three-component change.
The tests' ranked-DAG kernel is test infrastructure, not a Connect Four solver.
