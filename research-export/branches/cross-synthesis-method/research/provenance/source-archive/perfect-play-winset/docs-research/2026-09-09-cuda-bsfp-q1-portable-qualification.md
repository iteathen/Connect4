# CUDA-BSFP Q1 portable qualification checkpoint

**Date:** 2026-09-09  
**Branch:** `feature/cuda-bsfp`  
**Qualified head:** `1acf6f29bfd824f925f4ec8ae8d1aaf33424957f`

## Result

The C4-0009-Q1 outer benchmark qualifier is implemented and portable-qualified on the exact head above.

Final GitHub Actions results:

```text
verify:             34440954933  success
bsfp-portable:      34440954891  success
strength-evidence:  34440954894  success
benchmark-evidence: 34440954921  success
```

`bsfp-portable` executes the existing ranked-activation CUDA-BSFP portable slice, the complete dense 4x3 W/D/L portable slice, and the real Q1 qualifier entry point in `--dry-run` mode. This validates Q1 orchestration/report finalization in the same repository checkout and exact CUDA-Algorithms/CUDA-JS dependency pair used by the first profile.

## Final supervisor hardening included in this head

- `git` and `nvidia-smi` metadata/telemetry subprocesses have a finite 5-second execution timeout;
- GitHub API publication requests have a finite 30-second timeout;
- official evidence PRs default to report base `main`, independently of the source feature branch, while the exact source revision remains recorded in the report;
- solver children do not receive GitHub publication tokens;
- GPU execution remains fail-closed when a profile memory upper bound or free-VRAM telemetry is unavailable;
- timeout, low-memory abort/refusal, crash/runtime failure, correctness failure, unsupported geometry and skipped-after-boundary remain explicit evidence outcomes;
- interrupted requested publications remain recoverable/idempotent through their unique run ID and evidence branch.

## Q1 ladder and current P1 limit

The default Q1 ladder is:

```text
4x3 c3
4x4 c4
5x4 c4
5x5 c4
6x5 c4
7x5 c4
7x6 c4
8x6 c4
8x7 c4
9x7 c4
```

Q1 itself is representation-independent and will execute every geometry supported by the selected registered CUDA-BSFP profile. Current C4-0009-P1 is intentionally executable only for 4x3 connect-3; its larger ladder entries are therefore recorded as `unsupported-profile`, not silently omitted or falsely attempted with the dense table. Later compact WSL/NDC/CPC/antichain profiles must register their actual geometry support and a conservative finite device-memory upper bound before Q1 may launch them.

## Native gate still open

No native NVIDIA correctness/performance claim follows from this checkpoint.

The next official run is:

```text
npm run bench:bsfp:qualify
```

on an authorized NVIDIA host with the exact required CUDA-Algorithms/CUDA-JS pair and repository publication credentials. A valid P1 native qualification must publish an immutable Q1 evidence PR and satisfy root Win, 4,631 checked nonterminal states, 11,818 legal edges, zero W/D/L mismatches, plus the ranked-activation predecessor/duplicate/capacity/rank-failure checks.
