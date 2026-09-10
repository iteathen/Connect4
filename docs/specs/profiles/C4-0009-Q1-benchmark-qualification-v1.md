# C4-0009-Q1 — CUDA-BSFP benchmark qualification and repository-evidence profile v1

**Status:** Working subordinate qualification profile on `feature/cuda-bsfp`.  
**Parent authority:** C4-0009 CUDA-BSFP execution profile v1.  
**Applies to:** all CUDA-BSFP execution/representation profiles that claim benchmark or native qualification evidence.

## Purpose

Define a crash-survivable, memory-safe, timeout-bounded CUDA-BSFP benchmark qualifier whose durable output is an immutable evidence bundle published back to the Connect4 repository.

Q1 separates solver/profile execution, qualification supervision/evidence capture, and repository publication. The solver under test must not publish its own evidence. An outer Node qualification runner launches it as a child process so a solver exception, timeout, CUDA failure or abnormal child exit can still produce a report.

## Invocation

```text
node tools/cuda-bsfp-qualifier.mjs --qualify-benchmark
npm run bench:bsfp:qualify
```

`--qualify-benchmark` is an explicit arming flag. Official qualification publishes by default. `--no-publish` and `--dry-run` create local non-official evidence only.

## Evidence ownership and destination

Every published run receives a unique immutable path `docs/evidence/cuda-bsfp/qualification/<run-id>/` and branch `evidence/cuda-bsfp-q1/<run-id>`. The runner opens a pull request to the selected report base and does not push generated evidence directly to protected `main`. Requalification always uses a new run ID.

## Repository authentication and source identity

Publication uses GitHub HTTPS APIs and requires `CUDA_BSFP_GITHUB_TOKEN`, `GITHUB_TOKEN`, or `GH_TOKEN` with suitable contents/pull-request permission. Tokens are never copied into solver-child environments or evidence files.

Official publication requires a clean Git source checkout with a discoverable source revision. A profile may additionally freeze exact dependency revisions. Current P1 requires CUDA-Algorithms `48ee0aec9acae7776950f03ab52ab1737e598b6e` and CUDA-JS `98e2ebc942c14d63acf4dd82e912dd548c363a05`.

If publication fails, completed local evidence remains preserved and a later qualifier invocation may retry pending/failed publication.

## Local crash-survival spool

Before any solver child launches, the outer runner creates `.cuda-bsfp-qualification/machine-id` and `.cuda-bsfp-qualification/runs/<run-id>/`. The spool is excluded from Git.

`events.jsonl` is append-only and fsync'd at event boundaries. Case identity, memory admission, step launch, timeout/safety abort, completion and finalization are journaled as they happen.

If a prior run remains `running` when the qualifier starts again, Q1 finalizes it as `aborted-prior-process-or-host` and preserves surviving journals/logs. Requested publication is retried. This covers qualifier-process crashes and host/driver failures severe enough to prevent same-process reporting.

## Privacy and machine identity

The runner records a locally generated persistent anonymous machine ID; OS platform/release/version/architecture; CPU model/logical cores; total RAM; Node/runtime component versions; source/dependency Git revisions; and selected GPU model, compute capability when available, total/free/used VRAM, and driver version.

It does not intentionally collect hostname, username, hardware serials, GPU UUID, PCI bus identity, MAC/network identifiers, or arbitrary environment variables. Published logs redact local home/repository paths and common GitHub token forms. Full local logs remain in the spool.

## GPU-memory admission: fail closed

A GPU case may launch only if the selected profile provides a conservative finite upper bound for simultaneously resident device memory and current free VRAM can be measured.

Default envelope:

```text
allowedMiB = min(
  floor(currentFreeMiB * 0.70),
  max(0, currentFreeMiB - 1024 MiB),
  12288 MiB
)
```

The profile upper bound must not exceed `allowedMiB`. Unknown profile memory growth or unavailable free-VRAM telemetry is a refusal, not an attempted allocation.

Default emergency runtime floor is 512 MiB free VRAM. While a child is active, Q1 samples selected-device memory; crossing the emergency floor terminates the child and records `memory-safety-abort`. Device-wide telemetry may include unrelated processes and is a safety signal, not exact per-process accounting.

## Time bounds

Defaults are 120000 ms per case and 900000 ms per run. Each solver step receives the smaller remaining budget. Timeout terminates the child process tree. Timeout is evidence, not convergence and not automatically a correctness failure.

By default timeout, emergency memory abort, runtime failure, or correctness failure prevents later solver launches while leaving their planned report entries as `skipped-after-boundary`. `--continue-after-boundary` is an explicit diagnostic override.

## Default geometry ladder

```text
4x3 connect-3
4x4 connect-4
5x4 connect-4
5x5 connect-4
6x5 connect-4
7x5 connect-4
7x6 connect-4
8x6 connect-4
8x7 connect-4
9x7 connect-4
```

The ladder is broader than standard 7x5-scale testing and is an execution/admission target, not a claim that every current representation supports every geometry. Unsupported larger cases remain explicit in every report. Custom ladders use `--cases 4x3:c3,7x6:c4,8x7:c4`.

## Representation/profile registry

Each maintained CUDA-BSFP qualification profile registers a stable profile ID, governing execution spec, geometry support predicate, conservative device-memory upper bound, child execution steps, and exact expected result predicate where qualification is claimed. The qualifier must not infer memory safety from a previous successful allocation.

Future compact WSL/NDC/CPC/antichain representations join the same Q1 harness by registering a profile; report semantics do not change with the representation.

## Current P1 mapping

`c4-0009-p1` maps to C4-0009-P1 and executes only 4x3 connect-3. It runs ranked support activation through CUDA-Algorithms followed by complete dense BSFP W/D/L.

The dense child must report `outcome=native-exhaustive-wdl-pass`, `rootWdl=+1`, `checkedStates=4631`, and `legalEdges=11818`. P1 reports larger ladder entries as `unsupported-profile`; hypothetical dense-table growth may be recorded for scaling context but is not an executable memory bound.

## Result classifications

Per-case statuses include `passed`, `unsupported-profile`, `memory-safety-refusal`, `memory-safety-abort`, `timeout`, `correctness-failure`, `runtime-failure`, `skipped-after-boundary`, and `dry-run-admission-only`.

Whole-run outcomes include `qualified`, `complete-with-boundaries`, `failed`, `dry-run`, and recovered `aborted-prior-process-or-host`. A timeout, safe refusal, unsupported geometry or later-case skip may produce `complete-with-boundaries`; that is a captured benchmark boundary, not a solver qualification for the skipped case. Wrong exact results are correctness failures.

## Evidence bundle

The bundle contains `manifest.json`, system snapshots, `results.json`, `events.jsonl`, optional `failure.json`, `summary.md`, and per-case/step definitions, admission records, stdout/stderr logs and structured results.

`manifest.json` contains SHA-256 hashes plus source/published byte counts for every published payload file other than itself. Published logs have an 8 MiB per-file default cap using head+tail retention with explicit truncation, preserving the error/traceback tail. Full logs remain local.

## Crash and traceback evidence

Solver exceptions normally appear in child `stderr.log` with the Node stack. The outer runner also records exit code, signal, duration and GPU telemetry. Launch failure, nonzero exit, signal termination or unparseable solver result becomes runtime failure unless timeout/memory safety is more specific.

An outer-runner exception creates `failure.json` with message and stack when finalization remains possible. If the whole process/host dies first, the next invocation performs interrupted-run recovery.

## Repository publication transaction

Publication is: finalize local bundle → sanitize/cap logs → hash publishable payloads → create Git blobs/tree/commit based on the report base → create evidence branch → open evidence PR. The source checkout is not mutated to publish.

Publication is retry-safe: if an evidence branch/PR already exists for the run ID after a previous partial publication, Q1 resumes it rather than creating duplicate run history.

## Exit behavior

- `0` — safe run completed, including expected timeout/memory/unsupported boundaries;
- `2` — correctness/runtime failure captured;
- `3` — repository publication failed after local evidence finalization;
- `4` — qualifier itself failed outside normal finalization.

A zero exit does not mean every geometry solved; inspect structured results.

## Qualification gate

A CUDA-BSFP profile may claim Q1 native qualification for a geometry only when memory admission used a finite profile bound and measured free VRAM, all required child steps passed exact result predicates, no timeout/safety/capacity failure occurred, system/log/result evidence was finalized, and the official evidence bundle was successfully published to the Connect4 repository.

Performance interpretation is separate from correctness and must not overwrite prior evidence.

## Falsifiers

Rework Q1 if solver crashes can routinely destroy active-case evidence; unknown memory growth can reach allocation before refusal; timeout leaves uncontrolled process trees; solver children need repository credentials; report history can be overwritten; failed/timed-out/refused/unsupported cases disappear; personal host identifiers become necessary; representation details leak into the generic report schema; or benchmark completion can be mistaken for exact correctness without an explicit result predicate.
