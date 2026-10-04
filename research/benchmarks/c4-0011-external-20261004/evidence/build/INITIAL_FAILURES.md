# Initial build diagnostics (before any solve)

These failed preparation attempts produced no solver result. Final raw successful build output is alongside this file.

1. Portable GCC 16.2.0 with `-flto`: `cc1.exe: error: LTO support has not been enabled in this configuration`. Final C/Pons builds use `-O3 -DNDEBUG -march=native -static`; both compile solver and wrapper as one translation unit. LTO absence remains disclosed.
2. Christophe with MinGW POSIX threads: `os.cpp:128: invalid conversion from std::thread::native_handle_type ... to HANDLE` in dormant native-affinity code. Rather than permissive compilation or a solver/platform code patch, final build uses the existing native MSVC toolset, `/O2 /GL /LTCG`, static CRT, and the same frozen source/configuration.
3. Rust GNU linking against only the small portable GCC installation: `cannot find -lgcc_eh`. Added the SHA-verified official Rust 1.90.0 mingw component and `-C link-self-contained=yes`; no Rust solver source change.
4. Sanitized MSVC setup omitted PATHEXT, causing PowerShell native dispatch not to set LASTEXITCODE. The helper now launches cmd/cl through explicit ProcessStartInfo with ExitCode, supplies nonsecret Windows folder paths, and disables VS telemetry. A task-created Windows cache directory from the initial attempt is untracked and excluded from the packet/runtime closure.

Initial no-search execution diagnostics are separately preserved under `evidence/prepare/`: Node required a file URL for its Windows `--import` path; the .NET post-exit RSS property was unavailable. Final collector uses `pathToFileURL` and GetProcessMemoryInfo on the retained process handle. All subsequent cold checks and bounded path smokes captured valid CPU/RSS.
