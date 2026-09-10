# CUDA-BSFP Node compatibility probe — 2026-09-09

## Purpose

Determine compatibility from execution evidence rather than treating package `engines` metadata or the CUDA-JS maintenance Node as a runtime gate.

C4-0009-Q1 now records the Node version but does not admit/refuse qualification based on it.

## Exact probe

GitHub Actions workflow: `bsfp-portable`

Run: `34441693369`

Connect4 revision under test initially: `973b5f7c9aede966f835ef7823c16788363c2bd5`

Pinned lower revisions:

```text
CUDA-Algorithms: 48ee0aec9acae7776950f03ab52ab1737e598b6e
CUDA-JS:         98e2ebc942c14d63acf4dd82e912dd548c363a05
```

The compatibility probe disabled npm engine enforcement only for dependency installation so declared support floors could not pre-empt the runtime experiment. No package support metadata was changed by this probe.

## Matrix

| OS | Node | Result |
| --- | --- | --- |
| Ubuntu 24.04 | 24.15.0 | PASS |
| Ubuntu 24.04 | 26.7.0 | PASS |
| Windows Server 2025 | 24.15.0 | PASS |
| Windows Server 2025 | 26.7.0 | PASS |

Every lane completed all of these steps successfully:

1. exact Connect4/CUDA-Algorithms/CUDA-JS checkout;
2. CUDA-JS dependency installation with engine gating disabled for the probe;
3. public package-surface binding;
4. ranked-activation CUDA-BSFP portable slice;
5. dense 4x3 CUDA-BSFP W/D/L portable slice;
6. C4-0009-Q1 dry-run orchestration and report finalization.

## Conclusion

Node **24.15.0 is portable-compatible with the exercised CUDA-BSFP/CUDA-Algorithms/CUDA-JS path on both Windows and Linux**.

The existing `>=26.1.0` lower-package engine declarations therefore must not be interpreted as evidence that this path requires Node 26 at runtime. They remain current support-policy metadata until separately reconsidered.

This probe does **not** establish Node-24 native CUDA qualification. The next useful Node-24 evidence is the official Q1 hardware run on the owner's Windows NVIDIA host, with the exact Node version captured in the repository report.

## Policy consequence

Qualification tooling should discover compatible Node versions empirically:

- record exact `process.version` and component runtime versions;
- do not whitelist/reject by Node version in Q1;
- run compatibility matrices on candidate Node versions;
- distinguish portable compatibility from native CUDA compatibility;
- change package support floors only after evidence justifies the support claim.
