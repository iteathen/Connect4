# External comparison preparation

This is a bounded benchmark adapter exception to the JavaScript maintained-source
rule. Native code is confined to external solver wrappers. No maintained IsoMax
source or upstream search algorithm changes.

Christophe c4 is pinned to `fa27f186d2f1bf8e8fd61bfad63454c6e4b0431c`.
Pons is pinned to `d6ba50d8aaf2308c769d9bf2abd42d90f34baf41`.
`source-lock.json` freezes both original source files and the prior independently
audited staging files. Preparation verifies both sets before creating an output
directory. The original checkouts use Windows line endings: Git commit/blob
hashes are checked exactly, and worktree content permits only CRLF-to-LF
normalization against those exact blobs. Compiled staging files are checked as
raw bytes. The c4 cold table/worker accessors are retained. Only two existing
settings change: six threads and the largest odd prime table capacity fitting
12 GiB including the required extra entry. Book/table loads and writes, strong
solves, huge pages and upstream affinity stay disabled. Cutoff=27 and jitter=0.3
stay upstream. c4 has one shared table and per-thread search statistics.

The native table uses 8-byte entries. IsoMax's shared table uses 24-byte entries,
and IsoMax additionally owns 192 MiB of private TT per worker. The equal 12 GiB
shared-table budget therefore does not imply equal entry count or equal total
process memory. Report the actual c4 allocation from preparation/readiness and
process memory from each run. Source CRT uniqueness assertions remain active at
compile time.

The Pons serial control retains its upstream 24-bit table setting:
16,777,259 entries at 5 bytes = 83,886,295 bytes. It is a book-free reference/control,
not an equal-capacity or equal-thread competitor. Changing the Pons table exponent
would define another configuration; this adapter does not do so. `--position`
uses upstream `Position::play` and rejects terminal histories. A new process
initializes and checks the complete TT before each solve. The result provides
current-player `wdl` and parity-converted `wdl_first_player`. Its native score may
have magnitude greater than one for directly recognized wins; WDL is its sign.

Run these steps serially after all primary IsoMax timings. The paths below are
local shell variables supplied by the operator; public metadata contains hashes
and relative build arguments, not private filesystem locations.

```powershell
$evidence = 'docs/qualification/20261007-review-validation'
& $node "$evidence/comparison/prepare-external.mjs" $externalSources $auditedBuild $newNativeRoot
& "$evidence/comparison/build-native.ps1" -PreparedRoot $newNativeRoot -Vcvars64 $vcvars64 -Gxx $gxx
& "$evidence/comparison/run-native.ps1" -PreparedRoot $newNativeRoot -Solver christophe -PrepareOnly -ResultFile "$evidence/comparison/christophe-prepare.json"
& "$evidence/comparison/run-native.ps1" -PreparedRoot $newNativeRoot -Solver pons -PrepareOnly -ResultFile "$evidence/comparison/pons-prepare.json"
# Repeat one fresh process per trial, with no simultaneous solver/compile activity.
& "$evidence/comparison/run-native.ps1" -PreparedRoot $newNativeRoot -Solver christophe -ResultFile "$evidence/comparison/christophe-r1.json"
& "$evidence/comparison/run-native.ps1" -PreparedRoot $newNativeRoot -Solver pons -ResultFile "$evidence/comparison/pons-r1.json"
# Independent position control, using a previously selected legal nonterminal history.
& "$evidence/comparison/run-native.ps1" -PreparedRoot $newNativeRoot -Solver pons -History $history -ResultFile "$evidence/comparison/pons-position.json"
```

Build flags are frozen in `build-native.ps1`. c4 uses MSVC 19.50 /O2 /GL /LTCG,
C++20, static CRT and NDEBUG, with the original compiler/linker executable hashes.
Pons uses GCC 16.2 -O3 -march=native -static and C++17, with its original compiler
hash. Compiler diagnostics remain in the local prepared directory as private
logs. Neither build tool invokes a solver. `build.json` includes exact relative
arguments and executable hashes. No downloads or installers are used.

The runner restricts and verifies the inherited Windows process affinity before
search. c4 mask=0x555 permits CPUs 0,2,4,6,8,10; Pons mask=0x1 permits CPU0. c4
threads may migrate among the six permitted CPUs. IsoMax individually pins its
six workers, so affinity mechanisms differ and must be disclosed.

c4 `search_ms` spans `solver.solve`, including the native pool's stop/wait/merge
of peers, excluding table construction and the full cold occupancy scan.
Pons `search_ms` spans `solve(position,true)`. Both construct the actual root after
READY; Pons also replays the supplied history there. `root_preparation_ms` records
that work, and `primary_ms` spans actual root construction through the exact
native result. Cold occupancy checks use a separate blank audit position.
The runner's `wallMs` includes
initialization, occupancy checks, search and destruction/process cleanup.
`processCpuMs` and `peakWorkingSetBytes` are whole-process measurements. Compare
with IsoMax primary and whole-operation boundaries separately. Native node counts
describe native negamax entries and are separate from elapsed clocks. External
timeout=750 seconds covers the 120-second init, 600-second search and cleanup
allowance; a deadline produces incomplete evidence, not WDL.

Each run retains stdout/stderr beside its JSON as `.json.stdout.txt` and
`.json.stderr.txt`. Only personal user-directory names and JSON process IDs are
redacted if present; these adapters do not emit either. Memory is sampled every
100 ms using Windows peak-working-set reporting. Runs shorter than the sampling
interval can report null memory; zero is never substituted for unavailable data.
The fresh prepared runtime directory contains only solver sources, wrappers,
compiler outputs and provenance. No book or persisted table data is copied;
c4 also compile-time asserts all three load/write flags are false. Pons never
calls `loadBook` and verifies the private book pointer remains null/depth=-1.

These files prepare a comparison. They establish no new solve time, speedup or
external exactness claim until the serialized commands run and their results are
reviewed. The external native algorithms, heuristics and TT replacement policies
differ from IsoMax; work counts are mechanism evidence rather than a common unit
of computational work.

## Frozen early position controls

`early-corpus.json` contains nine distinct deterministic nonterminal histories,
one at each rank8..16. `freeze-early-corpus.mjs` uses independent PRNG seeds and
only physical legality/first-win tests. No solved outcomes or expected actions
participated in selection. Commit the corpus, harnesses and the final package
metadata before launching this validation. The harness checks the exact committed
corpus/helper blobs (worktree CRLF-to-LF normalization only), checks every immutable package runtime module and its public
entry against `production-runtime-lock.json`, pins Node by executable hash and
records a pre-query freeze. Evidence outputs and version/provenance metadata may
change; their actual hashes are recorded before each series. The full requested
resource configuration is independently checked before solving.

```powershell
& $node "$evidence/comparison/run-early-validation.mjs" $productionPackage $newNativeRoot $newEarlyEvidenceDirectory
# Optional read-only preflight; validates freezes and never launches a solver.
& $node "$evidence/comparison/run-early-validation.mjs" $productionPackage $newNativeRoot $newEarlyEvidenceDirectory --preflight
```

Every case launches one fresh IsoMax process with six workers, the full12GiB
partial24 shared TT and192MiB private TT per worker. Its process exits with all
workers joined before the Pons root oracle starts. Fresh processes release TT
storage between roots, so retained geometry/table lifetimes and exposed GC are
unnecessary. Both solvers receive only the input history. Geometry preparation
remains cold and position-independent; actual input replay is inside the primary
solve boundary.

Pons weak native score is mover-relative; IsoMax rootWdl is player0-relative.
The harness converts Pons by parity, explicitly including odd-rank cases. It
physically checks the selected IsoMax move and first-win stopping. Terminal child
WDL follows game rules; other children receive a second fresh Pons query to verify
the witness preserves the root value. No oracle code/data enters the IsoMax child.

Each solver search has a120-second ceiling. IsoMax preparation also has120s;
the controller enforces250s per IsoMax process and150s per Pons controller,
terminating only its own process tree on timeout. Incomplete/timeouts retain raw
evidence and stop the series with an incomplete result. This is finite correctness
validation, not a performance series or exhaustive guarantee.
