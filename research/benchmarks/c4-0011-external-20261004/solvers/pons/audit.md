# Pascal Pons: source and no-book preparation audit

Status: source reviewed; wrapper prepared, **not yet build-qualified or executed by this agent**. Root owns build qualification, executable identity, preparation/smoke evidence and timed runs. No default empty-board search has been launched by this agent.

Contract: C4-0011 v1, `runtime-input-only`, actual empty 7x6 position and exact weak root W/D/L. No precomputed prefix, action selection or remoteness target. The single-thread external-reference lane must be explicitly recorded by the common declaration rather than silently inherit IsoMax's two-worker requirement.

## Frozen closure and excluded launchers

Upstream: <https://github.com/PascalPons/connect4>, commit `d6ba50d8aaf2308c769d9bf2abd42d90f34baf41`; inspected checkout clean. Exact upstream paths/line numbers below refer to this revision. `preparation.json` records hashes of all six code files in the transitive include closure.

`wrapper.cpp` includes `Solver.cpp:19–21`, which includes `Solver.hpp`, `MoveSorter.hpp`; `Solver.hpp:22–26` includes `Position.hpp`, `TranspositionTable.hpp`, `OpeningBook.hpp`; their includes close within that six-file set plus standard C++ runtime headers. Build one translation unit, **not** a separately compiled second Solver.cpp. No upstream implementation is vendored and no upstream build script is run.

The upstream launcher is deliberately **excluded**: `main.cpp:40` chooses `7x6.book`, and `main.cpp:52` unconditionally calls `loadBook`. Passing a missing book or omitting `-b` is not this benchmark's no-book control. `generator.cpp:38–74` consumes scored positions and writes a book; it is likewise excluded. Neither main.cpp nor generator.cpp is included, linked or called. No book file is staged as runtime input. Upstream Makefile/README/test corpora are not runtime inputs.

## Source/data audit

| Source | Reachable behavior and no-book boundary |
|---|---|
| `Position.hpp:85–98` | Native 7x6 constants, 64-bit selected carrier, score-domain bounds and static shape checks. No root-specific answer. |
| `Position.hpp:107–113,215–241` | Default constructor creates zero colors/mask/moves; play and terminal checks use board state. Wrapper never calls sequence replay. |
| `Position.hpp:124–132` | Optional string replay exists in the library but is unreachable from this wrapper. No prefix is supplied. |
| `Position.hpp:144–175` | Move count and key from current bitboard. Book-only ternary-key route is blocked by empty-book depth. |
| `Position.hpp:187–209,266–360` | Immediate-threat/forced-response pruning, winning-cell move score, gravity masks and bit shifts are evaluated from current state. No table of solved positions. |
| `MoveSorter.hpp:41–78` | Bounded insertion sort of current-run move scores; no persistent ordering state. |
| `Solver.hpp:33–36` | TT template size 24, default empty book, node count and native column ordering. |
| `Solver.hpp:66–73` | `reset()` zeroes node counter/TT. `loadBook()` is a public forwarding method present in source but never called by this executable. |
| `TranspositionTable.hpp:30–77,93–149` | Prime-capacity/key-width derivation, newly allocated key/value arrays, reset with memset, modulo index, native probe/store. No persistence. Zero values mean absent even if a zero key matches. |
| `OpeningBook.hpp:74` | Default book: null `T`, depth `-1`; zero book allocation/capacity. |
| `OpeningBook.hpp:88–168` | File loading/saving code exists in the parsed header but has no call edge from wrapper, solver constructor, reset or solve. No file-open operation is executed on the benchmark path. |
| `OpeningBook.hpp:171–177` | `get()` is reached from search but returns zero because every legal position has `nbMoves() >= 0 > -1`; it never dereferences `T` or reads a book key. Destructor deletes null. |
| `Solver.cpp:39–105` | Native negamax, node count, tactical reductions, TT bounds, empty-book probe, move scoring/sort and current-run TT writes. |
| `Solver.cpp:107–126` | `solve(position,true)` uses the native weak min/max window and iterative null-window search. It does not load a book or replace the input root. |
| `Solver.cpp:144–149` | Constructor's native center-first ordering. Historical selection/tuning is not independently certified; declare it with unknown/potentially oracle-informed lineage in runtime-input-only, not lineage-clean. |

The runtime closure contains generic terminal/score constants, not embedded solved-WDL/optimal-move data. `Position.hpp:97–98` static assertions check carrier dimensions, `Position.hpp:188` and `Solver.cpp:40–41` assert search preconditions. These are **not known-answer assertions**. The proposed optimized build defines `NDEBUG`, eliminating dynamic assertions; source-level review still includes them. No known-empty-result assertion exists in this pinned closure. Upstream CLI/generator and any external oracle/test material are not reachable. This audit establishes runtime-input boundaries, not historically blind discovery or a new independent proof of the solver's pruning mathematics.

## Cold validation and wrapper semantics

Only no arguments and `--prepare-only` are accepted. No stdin, file, environment or network supplies a position. Wrapper constructs a native `Solver` and default `Position`, explicitly calls `solver.reset()` after the constructor's reset, and scans every TT key/value. It verifies zero occupancy/nonzero keys/node count, null book table and depth `-1`, zero root key/move count, every initial column legal, and no immediate root winning move. These checks are structural—not an expected solved answer.

Private state is read via explicit-template pointer-to-member accessors. This does not replace `private` tokens, cast object layouts, modify source/class definitions, mutate TT/book or change search. The member-pointer types bind to the exact native TT member type; a changed upstream TT template will not silently pass the bridge. Compiler acceptance of this adapter must be established by the root build, not assumed from source inspection.

A flushed `ready` JSON record goes to stderr before any solve call. Prepare-only also emits ready on stdout and exits without search, releasing native objects. Default calls exactly `solver.solve(position,true)`, captures node count, checks unchanged input root, destroys the solver/TT, and emits the sign of the native return value as WDL. Native weak fail-soft scores may have magnitude above one; the wrapper does **not** mislabel them as exact remoteness scores. At the empty root, side-to-move and first-player WDL coincide.

## Resources and accounting

- `TABLE_SIZE=24` is an exponent, **not the entry count**. Actual capacity is `next_prime(1<<24)` (16,777,259), from `TranspositionTable.hpp:96`.
- At the frozen 49-bit board, the native key type is `uint_least32_t` and the value is `uint8_t`: normally 83,886,295 backing bytes. Ready reports the actual `sizeof`-based count. Keys and values occupy separate allocations; object/runtime overhead is separate.
- Book capacity/occupancy zero, no separate proof cache, persisted cache false. Mutable TT is fresh per process. A previously used Solver reset is not substituted for a fresh process in scored runs.
- Nodes are entries to `negamax` (`Solver.cpp:43`), accumulated across the current solve's null-window iterations. They exclude some top-level terminal checks and are not interchangeable with another solver's counts.
- Whole-process timing includes construction, both native clears, complete initial scan, validation, weak solve and destructors. Ready is a control boundary, not permission to exclude initialization from the primary time. Root records actual compiler, system runtime, affinity and executable identity.

## GCC build and portability

```text
g++ -std=c++11 -O3 -DNDEBUG -Wall -Wextra -I<STAGED_UPSTREAM> wrapper.cpp -o <OUTPUT_EXE>
<OUTPUT_EXE> --prepare-only
```

`Position.hpp:90` names GCC `__int128` in the unselected conditional alternative. MSVC cannot parse that name, even though the native 7x6 instantiation selects uint64. Root is preparing a portable GCC toolchain (w64devkit); the current wrapper therefore has **no type-token compatibility shim**. Compile-time assertions require the native 7x6/uint64 instantiation. `<type_traits>` is explicitly supplied by the wrapper instead of relying on transitive standard includes. If a compiler constexpr limit rejects the upstream prime calculation, record any limit-only flag adjustment in the build manifest; do not replace it with a hardcoded table/answer. No clock shim is required because timing is external. GCC/toolchain provenance and its extraction are owned by root; this audit did not execute downloaded tools or upstream scripts.

Do not compile upstream `main.cpp` or `generator.cpp`, run Makefile targets, call `loadBook`, or test a missing-file book fallback. Pending build gates: compiler acceptance, source/header and binary hash manifest, ready-only and invalid-argument controls, and externally capped smoke with ready visible. A killed smoke is not a completed solve. Upstream license is AGPL-3.0-or-later; retain notices when distributing its implementation.
