# Connect Four — IsoMax

**The current Connect4 solver is IsoMax 0.2.0-rc.2.** It replaces the older
IsoMax implementation and is packaged together with its launchers, configuration,
runtime, tests and evidence.

**[Open the solver package](https://github.com/iteathen/Connect4/tree/work/isomax-jsminsys-rebuild/isomax)**
· **[Download the archive](https://github.com/iteathen/Connect4/raw/refs/heads/work/isomax-jsminsys-rebuild/isomax/dist/iteathen-isomax-0.2.0-rc.2.tgz)**
· **[Setup guide](https://github.com/iteathen/Connect4/blob/work/isomax-jsminsys-rebuild/README.md)**

## Quick start

Install Node 26.7 or later, then:

```sh
git clone --branch work/isomax-jsminsys-rebuild https://github.com/iteathen/Connect4.git Connect4-IsoMax
cd Connect4-IsoMax/isomax
node verify.mjs
node run.mjs
```

No npm install or submodule checkout is needed. If using the archive, extract
the complete `package/` folder and run the two Node commands inside it.

The default operation starts at the actual **empty 7×6 board** and returns its
exact W/D/L outcome and an optimal move. This is one root solve, not a complete
self-play game. No opening book, supplied opening sequence, RLC or persisted
solved cache is used.

## Configuration and other boards

| Setting | Current default |
|---|---|
| Workers | Four deep workers, center/live/center/live |
| Shared TT | 4 GiB, native 32-byte entries |
| Private TT | 256 MiB per worker |
| Geometry | Prepared at initialization; compiled-transition or fallback path selected there |
| Root frontier | Disabled |
| Shared proof bounds | Enabled |
| Observed whole-process peak memory | About 6.44 GiB |

Workers, solver-owned tables and geometry plans are prepared before the readiness
barrier. Root construction and search begin afterward. The startup launcher applies
the retained JIT settings before initialization.

From the package folder:

```sh
node run.mjs --columns 7 --rows 5
node run.mjs --columns 1 --rows 4 --shared-entries 256 --local-entries 256
```

Winning length is four. Dimensions and native widths are selected during
initialization. Performance qualification is on 7×6; the second command is a
small installation check. The setup guide also covers the recorded Windows
i5-12600K runtime and worker affinity.

## Measurements and qualification

| Measurement | Empty-board primary time |
|---|---:|
| Retained candidate mean, two localhost trials | 53.83 s |
| Original extracted-package confirmation | 55.33 s |
| Connect4 transfer confirmation | 57.46 s |

Primary time includes actual empty-root construction and exact solving after all
workers are ready and cold tables initialized. Initialization and cleanup are
recorded separately. The confirmations are single checks, not new performance
comparisons. Portable unpinned runs have no timing qualification. **The ≤10 s
target remains unmet.**

The Connect4 transfer returned **WIN, column 4**, with four workers ready/exited
and clean termination. Qualification passed **13 integration tests, 46 package
tests and all 144 package-file identities**. The archive checksum is unchanged.

See the [replacement qualification and raw evidence](https://github.com/iteathen/Connect4/blob/work/isomax-jsminsys-rebuild/docs/qualification/20261006-isomax-package-replacement.md),
[configuration](https://github.com/iteathen/Connect4/blob/work/isomax-jsminsys-rebuild/isomax/profile.json)
and [archive checksums](https://github.com/iteathen/Connect4/blob/work/isomax-jsminsys-rebuild/isomax/dist/SHA256SUMS).

## Repository navigation

| Area | Location |
|---|---|
| Current IsoMax solver and package | `work/isomax-jsminsys-rebuild` |
| CUDA-BSFP solver | `solver/cuda-bsfp` |
| Future IsoMax/BSFP composition | `solver/sut` |
| Canonical research | `research/semantic-quotient` |
| Shared rules, oracle, benchmarks and routing | `main` |

Main links to the solver implementation; the solver package belongs to its
implementation branch. Research remains separate. The former `solver/isometric`
ref is preserved at `archive/lazy-smp-retirement-20260926/solver/isometric`.

For project authority and branch ownership, read [STATUS.md](STATUS.md),
[REPOSITORY_STRUCTURE.md](REPOSITORY_STRUCTURE.md), [next_step.yaml](next_step.yaml)
and the applicable [specifications](docs/specs/). The qualified incumbent on main
is a reference comparator; historical Minimax and Hybrid Confluence lineages
are not active implementation owners. No new solver family is created by this
package replacement.

## Historical external evidence

[EVIDENCE.md](EVIDENCE.md) and the [claim registry](evidence/claims.json) describe
the evidence classes and their limits. A previous IsoMax revision matched
**192/192** externally sourced Pons parent-position W/D/L cases; its
[archived evidence](https://github.com/iteathen/Connect4/blob/archive/lazy-smp-retirement-20260926/solver/isometric/evidence/external/README.md)
remains scoped to that original source and corpus.

That historical result does not automatically qualify this replacement package,
per-move score vectors, comparative performance or CUDA-BSFP. Current qualification
is not a universal proof or an external solver ranking.
