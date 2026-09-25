# Lazy SMP DTS 0.1 — Protected CPC Route Candidate Checkpoint 0.1

**Date:** 2026-09-25  
**Status:** IMPLEMENTATION START  
**Authority effect:** none  
**Solver-method effect:** none

## Evidence basis

Route displacement census: `ROUTE_REPLACEMENT_MATRIX_RESULT_0_1.*`.

Candidate scope is intentionally narrow:

```text
existing shared row route in {6 all-lift, 8 long-range response}
incoming route in {3 immediate singleton, 4 multiple opponent threats, 5 stacked threat}
occupied-slot different-key replacement attempt
    ->
retain existing row; drop optional incoming shared store
```

Private exact publication remains unconditional. Shared cache remains acceleration only.

## Realization constraint

Do not add a separate shared route array.

Candidate implementation should pack the CPC exact route into unused high bits of the existing shared atomic value word:

```text
packedSharedValue = exactWdl | (route << 2)
probe return       = packedSharedValue & 3
```

This keeps q_r full-key identity unchanged and avoids an extra shared-memory stream.

The route is needed only when CPC returns exact; do not add a per-CPC-call reset if the route field is read only under `CPC_EXACT`.

## Qualification

- isolated JSMinSys experiment branch;
- operation-level cycle ledger updated with every source change;
- JSMinSys Verify green;
- unit test verifies retained high-route row and exact value decode;
- Connect4 four-worker same-runner B/C/C/B solved control;
- hard `13333111` and empty probes;
- preserve exact result/witness/cleanup;
- CPU/cycles are governing performance evidence.

Reject and record if the additional route tagging/probe masking costs more than the protected residency saves.
