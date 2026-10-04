# Fhourstones C: source and no-book preparation audit

Status: source reviewed; wrapper prepared, **not yet build-qualified or executed by this agent**. This record is not a timing result or an empty-board solution. Root owns compiler qualification, executable hashes, ready/smoke records, environment and external timing.

Contract: C4-0011 v1, `runtime-input-only`, standard 7x6, actual empty board, exact weak W/D/L of that fixed root. No supplied prefix, root advancement, root action requirement, opening book, persisted table or expected answer. This external solver is single threaded; the common declaration must explicitly record the owner-authorized external-reference worker-count scope rather than silently inherit the IsoMax two-worker rule.

## Frozen closure

Upstream: <https://github.com/qu1j0t3/fhourstones>, commit `bf0e70ed9fe8128eeea8539f17dd41826f2cc6b6`. The inspected checkout was clean. All line references below refer to this immutable revision. `preparation.json` records Git blob and SHA-256 identities of the complete three-file upstream source closure.

`wrapper.c` includes `SearchGame.c:13` → `TransGame.c:22` → `Game.c`. No upstream build script executes and no upstream implementation is vendored. Compile just the wrapper, using the staged source directory as an include path. System dependencies are the C runtime and, on Windows, Windows headers/Kernel32 process-time functions. The root build manifest must bind compiler/runtime/system dependencies as well as these sources.

`Makefile`, `nmake.mak`, `inputs`, all Java/Haskell implementations and README/license prose are not execution inputs. The renamed original `main` remains a compiled function but is never called. Its stdin loop at `SearchGame.c:199–207` is therefore unreachable from this adapter. The pinned C closure has no file-open/read, network, environment-based position input, book loader or serialized-cache loader. No source array encodes position answers. `moves[]`, colors, heights, history and TT are mutable current-run state, not static solved data.

## Runtime dependency review

| Source | Role and input boundary |
|---|---|
| `Game.c:34–64` | Board dimensions, bit shifts, bottom/top masks derived from gravity and board geometry. No solved labels. |
| `Game.c:66–85` | Colors/moves/heights; `reset()` sets zero ply/colors and native column offsets. `positioncode()` derives identity from live state. |
| `Game.c:96–141` | Legality, four-in-a-row shifts and reversible make/backmove. These are game-rule operations. |
| `TransGame.c:24–48` | `LOCKSIZE=26`, `TRANSIZE=8306069`, symmetry depth 10 and WDL/bound enums. These are algorithm/configuration constants, not an expected root answer. |
| `TransGame.c:57–87` | `calloc` initializes storage; `emptyTT()` resets every named key/work/score field and store counter. |
| `TransGame.c:89–108` | Position identity and horizontal reflection. Hash lock plus prime modulus implement the native identity scheme. |
| `TransGame.c:110–133` | Probe/store only current-run TT. A zero score means unknown, including any zero-lock coincidence. |
| `SearchGame.c:15–16` | `BOOKPLY=0` means extra full-width search depth; **it is not a stored opening book**. `REPORTPLY=2` controls native diagnostics. |
| `SearchGame.c:18–47` | Windows user-process CPU timer, or POSIX `getrusage`; not an input oracle. |
| `SearchGame.c:53–62` | Native geometric/history initializer. Its historical tuning lineage is not independently established. Disclose it as an upstream heuristic with unknown/potentially oracle-informed lineage; allowed only under this runtime-input-only declaration. |
| `SearchGame.c:64–159` | Native weak alpha-beta, immediate-threat reductions, forced moves, TT bounds/exact values, history ordering and current-run history updates. No book read or literal root-specific prefix. |
| `SearchGame.c:161–179` | `solve()` resets node counter, checks terminals, initializes history, sets native reporting/book-depth variables and calls `ab(LOSS,WIN)`. Unmodified by the wrapper. |

There are no known-answer assertions in the three-file C closure. Unrelated language versions and the `inputs` corpus are not included or read. Generic score constants and terminal checks must not be confused with a root-answer assertion. This source audit does not establish historically blind development or re-prove every native pruning theorem.

## Adapter and cold-state checks

Only two adapter modes exist: no arguments, or `--prepare-only`. Any other argument fails; stdin is never consumed. Initialization calls `trans_init()`, `reset()`, `emptyTT()` once each, then scans **all** TT fields and verifies zero store/node counters, both zero colors, zero ply, empty gravity heights and initially zero history. Occupancy is the number of nonzero scores across both slots per record. Named-field validation avoids treating ABI padding as semantic data. A fresh process is still mandatory for every invocation.

Before any `solve()` call, a flushed JSON `ready` record goes to stderr. `--prepare-only` also writes it to stdout, releases the TT and exits without search. Default execution calls native `solve()` exactly once, accepts only its exact LOSS/DRAW/WIN enumeration (rejects draw-bound enums), maps the result to mover-relative `-1/0/+1`, checks root restoration, releases the TT, and emits JSON `result`. At the empty root mover-relative and first-player-relative agree. No action or strong-score claim is made.

The wrapper renames upstream `main` and routes upstream `printf` diagnostics to stderr. It retains native search reporting, history, TT, pruning, node counting and native timer semantics. Neither `BOOKPLY` nor `REPORTPLY` is overridden. Diagnostic destination is the only output adaptation; it may have platform I/O cost and belongs in the disclosed wrapper identity. An upstream allocation failure exits without a ready/result pair; the runner must reject it even if upstream returns exit code zero.

## Resource and measurement conventions

- Native records: 8,306,069; two score/key slots per record, 16,612,138 score slots. Actual bytes are `TRANSIZE*sizeof(hashentry)` and must come from the ready record; bitfield ABI size is not assumed portable.
- Node metric: `nodes++` on each `ab` entry (`SearchGame.c:72`), including forced recursive calls; not directly comparable to another solver's node definition.
- `posed`: native TT store calls, not distinct occupancy (`TransGame.c:117`).
- Native `msecs` is user-process CPU milliseconds plus one, not wall time. The runner must separately time the whole fresh process, including allocation, resets, audit scans, history initialization, solve, diagnostic I/O and cleanup. Do not start the primary wall timer after ready.
- No separate proof cache. No loaded rule artifact; geometry is code-derived. The source closure and compiler build manifest provide the embedded-data audit boundary.

## Build recipe and pending qualification

With `STAGED_UPSTREAM` containing only the pinned upstream files and output paths owned by the common runner, the proposed Windows GCC recipe is:

```text
gcc -O3 -Wall -Wextra -DWIN32 -I<STAGED_UPSTREAM> wrapper.c -o <OUTPUT_EXE>
<OUTPUT_EXE> --prepare-only
```

Root is preparing portable GCC/w64devkit; invoke its exact executable path when absent from PATH. The Windows compiler defines `_WIN32`; `-DWIN32` explicitly selects the upstream timer's `WIN32` branch. Do not set `NOMINMAX`: the native Windows path uses Windows `min`/`max` macros. No clock shim or source edit is needed. Native unused-main `%lu` size warnings may be emitted on Win64 and must be recorded, not used to change search. MSVC is also viable with `cl /nologo /O2 /W4 /DWIN32 /TC /I<STAGED_UPSTREAM> wrapper.c /Fe:<OUTPUT_EXE> /Fo:<OUTPUT_OBJ>` in an x64 developer environment; that would be a separately recorded compiler profile. Upstream supplies an NMAKE file, but this task does not run it. Rust is not required.

Pending: compile/link, compiler include closure, executable digest, prepare-only JSON validation, invalid-argument controls and externally capped fresh-process smoke that observes stderr ready before killing an unfinished search. A capped smoke is **not** a completed solve or timing result. Do not run the default empty search without the root's external cap/campaign authorization. Do not use upstream `make run` or its input file.

License: upstream `LICENSE` and source notices prohibit sale for profit and require retention of notices/redistribution restrictions. Source remains staged externally; this adapter does not relicense it.
