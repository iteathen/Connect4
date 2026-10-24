# IsoMax A/B/C — native TT comparison (JavaScript only)

Experimental source snapshots, 2026-10-23. These are *not* the production IsoMax distribution.

- **alpha.2**: A physical-bitboard TT, B original-K4 source-mask TT, C source-mask TT with guarded fork proof. This is the frozen full-root comparison build.
- **alpha.4**: the same three independent implementations, with experimental exact-key zero-bound merging and removal of redundant admitted-successor win scans. This build is not full-root performance-qualified.
- **Current production**: `/isomax` at v0.2.0-rc.6 remains unchanged.

Each alpha directory contains runnable A/B/C modules under `variants/`, its own full-root benchmark harness, independent physical-state correctness tests, and a Node-only `build-standalone.mjs` script to generate three separate standalone packages. Each candidate has its **own** `tt.mjs` and native key/record design; only rules, benchmark conditions and common interface are shared.

## Clone and run (PowerShell)

```powershell
git clone --branch experiment/isomax-abc-native-tt-20261023 --single-branch https://github.com/iteathen/Connect4.git
cd Connect4/experimental/isomax-abc-native-tt/alpha.2
node --test test/*.test.mjs
node run.mjs --variant A --columns 7 --rows 6 --tt-mib 2048 --node-limit 50000000000 --deadline-ms 0
node run.mjs --variant B --columns 7 --rows 6 --tt-mib 2048 --node-limit 50000000000 --deadline-ms 0
node run.mjs --variant C --columns 7 --rows 6 --tt-mib 2048 --node-limit 50000000000 --deadline-ms 0
```

For matched complete empty-board solves in fresh serial processes:

```powershell
node full-empty-benchmark.mjs --suite . --tt-mib 2048 --repeats 2 --deadline-ms 0 --node-limit 50000000000 --reset-output yes
```

The harness publishes no performance ranking unless **all three** return exact full-root values. Allow enough local RAM for the TT budget and process overhead. Node.js 26.7+ is the target; older Node 22 experiments are preliminary evidence only. No C++, Python, native addons, opening books or solved-game inputs are needed.

To generate separate candidate packages from a checked-out snapshot:

```powershell
node build-standalone.mjs
```

Then find `standalone/IsoMax-A-0.3.0-alpha.2`, `standalone/IsoMax-B-0.3.0-alpha.2`, and `standalone/IsoMax-C-0.3.0-alpha.2` (or alpha.4 in the other folder).

## Qualification scope

Locally rechecked on Node 22.16: alpha.2 **6/6** and alpha.4 **8/8** test groups pass. These bounded controls are not proof of a complete 7×6 solve or production acceptance. The prior local alpha.2 B full empty 7×6 solve was reported as P0 WIN / center in approximately 683.84 s on a one-worker 2 GiB Node22 setup; no complete matched A/B/C timing series is established here.

**Ownership:** temporary experimental branch only. No changes to the prior production `isomax/` package, stable main branch, BSFP, SUT, or canonical research authority.
