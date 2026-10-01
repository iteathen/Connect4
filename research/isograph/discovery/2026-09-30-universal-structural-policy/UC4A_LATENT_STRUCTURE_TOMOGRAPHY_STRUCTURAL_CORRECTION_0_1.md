# UC4A tomography structural-core correction 0.1

**Date:** 2026-10-01  
**Status:** pre-label structural-producer correctness correction  
**Branch:** `research/universal-structural-policy-20260930`

## Trigger

The first frozen atlas exposed an impossible value:

```text
4x4 Y_line = -1
```

The source was not a GF(2) incidence failure. It was a qualified-range error in a shortcut inherited from the earlier descriptive census:

```text
Y_line = kernelDimension - (W-1)
```

That subtraction assumes the pure-vertical-line parity map on `ker(B)` has full width-path rank `W-1`.

## Smallest witnesses

Mechanical restriction of the actual vertical-line-parity map gives:

```text
4x4: kernelDimension = 2, quotient rank = 2, Y_line = 0
4x5: kernelDimension = 4, quotient rank = 2, Y_line = 2
```

So the full-rank shortcut fails on exactly these two rows of the current 52-board cohort.

The standard 7x6 result is unchanged:

```text
kernelDimension = 34
vertical-line-parity quotient rank = 6
Y_line = 28
```

The corrected mechanical construction also reproduces the previously documented standard-board reflection checkpoint:

```text
left-right fixed:          Y_cell 14, Y_line 14
geometric top-bottom fixed:Y_cell 16, Y_line 14
180-degree fixed:          Y_cell 14, Y_line 14
```

## Correction

The tomography producer now:

1. constructs an explicit GF(2) basis for `im(B)`;
2. constructs an explicit GF(2) dependency basis for `ker(B)`;
3. computes the row-plus-column parity image rank on `im(B)`;
4. constructs `Y_cell` as the exact restricted kernel;
5. computes pure-vertical-line parity rank on the actual `ker(B)`;
6. constructs `Y_line` as the exact restricted kernel;
7. derives core reflection fixed-subspace dimensions directly.

No outcome label was loaded before or during this correction.

## Disposition

This is a structural-producer correctness defect, not a rejection of the standard 7x6 middle theorem and not evidence about W/D/L.

The first atlas hash `bfcc2e0c8fc2675070e281554ea5385b50f118e894cd6ce308de2975e09febed` is superseded and must not be used for tomography analysis.

Phase-B outcome overlay remains blocked until the corrected structural workflow regenerates and commits a new atlas.
