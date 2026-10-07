# Connect Four — IsoMax

**IsoMax 0.2.0-rc.6 is included directly on main in [isomax/](isomax/README.md).**
The launcher, runtime, configuration, tests and verification stay together there.
No installation or submodule checkout is needed.

## Quick start

Install Node 26.7 or later:

```sh
git clone https://github.com/iteathen/Connect4.git
cd Connect4
npm start
```

Or run `node isomax/run.mjs`. It solves the actual empty 7×6 board and returns
exact W/D/L and an optimal move. This is one root solve, with no opening book,
supplied opening, RLC, persisted proof cache or prior solved input.

For a fast installation check:

```sh
node isomax/verify.mjs
node isomax/run.mjs --columns 1 --rows 4 --shared-entries 256 --local-entries 256
```

[Download the standalone archive](isomax/dist/iteathen-isomax-0.2.0-rc.6.tgz).
Extract its complete `package/` folder, then run `node verify.mjs` and
`node run.mjs`. The repository's `dist/` holds the archive and checksum; it is
excluded from the archive itself. [SHA-256](isomax/dist/SHA256SUMS) verifies the download.

## Automatic setup

Initialization discovers physical performance cores and available memory.
Workers use distinct cores, excluding extra SMT threads. Windows/Linux bindings
are verified. **macOS provides scheduling hints, not hard CPU pinning.**
Hints cannot guarantee continuous P-core residency.

Standard 7×6 uses exact 24-byte partial-key TT records when complete support plans
fit. Full locator bits plus the remaining exact key identify a state; equality
is not probabilistic. Other dimensions or incomplete plans retain native/generic
storage. Dimensions 1..10 are chosen at initialization; full timing qualification
is on 7×6.

Shared budgets are 1, 2, 4, 8, 12, 16, 32, 64 and 128 GiB. Auto chooses the
largest fitting allocation and reports actual shared/private bytes, reserve and
banks. Equal allocations prefer the smaller profile budget. The 12 GiB partial24
allocation is measured with six local workers. Profiles 16–128 GiB remain
experimental and auto-selectable. Earlier 1–8 GiB timings used native32 storage;
results remain scoped to their layout, hardware and worker count.

```sh
node isomax/run.mjs --help
node isomax/run.mjs --list-memory-profiles
node isomax/run.mjs --memory-profile 12
node isomax/run.mjs --columns 7 --rows 5
```

Persistent workers, TTs, arenas and geometry plans precede READY. Actual root
construction and exact solving follow READY. Initialization and cleanup are
reported separately. [The package guide](isomax/README.md) covers options and API.

## Qualification

Five fresh matched localhost candidate runs averaged **33.560 seconds**, versus
33.803 for the prior control. They used the i5-12600K, six verified
P-core workers, 12 GiB shared TT, 192 MiB private per worker, recorded Node 27
nightly/V8 and flags, with the same reduced background load for both sources.
The observed 0.72% difference is smaller than candidate variability; the candidate
was slower in two pairs. This does not establish a dependable speedup. The earlier
two-per-arm 2.656% observation remains historical. The ≤10-second objective remains unmet.
[The current review record](docs/qualification/20261007-review-validation/README.md)
contains raw measurements and qualification scope.
[The promotion record](docs/qualification/20261006-nees-promotion/README.md)
records identities, correctness and the packaged public solve.

The final packaged default-path confirmation took **33.334 seconds**, with the
same automatic 12 GiB selection, six verified workers and clean exits. The
shipped source `8b81911` took **39.690 seconds** from launcher invocation through
completion. The primary time begins after READY and includes root construction;
the full external wall time also includes startup and cleanup.

## Repository navigation

| Area | Location |
|---|---|
| Current IsoMax distribution | [isomax/](isomax/README.md) on main |
| Producer kernels/support | iteathen/JSMinSys, pinned in provenance.json |
| CUDA-BSFP | `solver/cuda-bsfp` |
| Future composition | `solver/sut` |
| Canonical research | `research/semantic-quotient` |
| Reference comparator | `components/incumbent/` |

The historical `solver/isometric` and `work/isomax-jsminsys-rebuild` routes are
provenance, not the current setup path. The owner explicitly promoted this
distribution to main. Research, BSFP and the retained comparator are unchanged.
