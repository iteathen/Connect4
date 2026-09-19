# RBA rank26 descent / hard restricted-image wall checkpoint 0.1

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** selected rank26 descent in progress; first missing rank27 child NOT CLOSED  
**Authority effect:** none  
**Research direction:** Josh Oshiro

## Purpose

Record the first genuinely repeated algorithmic wall encountered after the selected-rank27 staged evaluator was qualified and descent resumed toward selected rank26 support `[3,3,2,0,6,6,6]`.

This checkpoint deliberately stops factor-order/evaluator permutation at the point where the same local restricted-image operation remains the bottleneck under the already-qualified choices.

## Selected rank26 target

```text
support [3,3,2,0,6,6,6]
rank 26
target draw16
```

Required rank27 draw15 children:

```text
[4,3,2,0,6,6,6]   in progress
[3,4,2,0,6,6,6]   already closed
[3,3,3,0,6,6,6]   not started
[3,3,2,1,6,6,6]   not started
```

## Monotone cache progress inside first missing child

The resumable support cache is advancing rather than rebuilding prior work.

New exact descendant boundaries closed during this descent include:

### rank29 [5,3,2,1,6,6,6] draw13

```text
Upper 44,505
Lower 69,700
Upper SHA-256 e11b81a8b0729aa6f2a9b8c412eb1e022493872a7ac38691f30c41d1b6261cbd
Lower SHA-256 2bfcffe67c7300c4749140693916b53b5f8e5e9b64dee70d5635729bba60a0ae
```

### rank29 [4,3,3,1,6,6,6] draw13

```text
Upper 26,306
Lower 84,733
Upper SHA-256 4a9e148274d7b1e0deaae9237fec5db269d3291f00c009082cf129371c6e501a
Lower SHA-256 53f104b5449122b628385881c4923c7d66f376ba60df9597cf0d9d0d51aeba28
```

### rank30 [4,3,2,3,6,6,6] draw12

```text
Upper 132,496
Lower 116,924
Upper SHA-256 adc8bf11a7aae4a0e1e9d2724fa0a95974a68c4ac258af86f2e751d5cf99e418
Lower SHA-256 9833ec5700c9306322b8a49717a46dc61606f02da142f2afaafa1d7c9db36654
```

Lower self-normalizes exactly.

## Current blocked descendant

The first missing rank27 child reaches:

```text
support [4,3,2,2,6,6,6]
rank 29
threshold draw13
```

Its fixed-action Lower factors are:

```text
f0 = 110,523
f1 =  34,867
f2 =  24,148
f3 =  56,637
```

Upper is already exact:

```text
Upper = 117,781
SHA-256 7d5465d24c558d2c9e8484ca998558b0919985c725ac0ddeb6faa9e482ea7a27
```

The pair `f1 x f2` closes exactly:

```text
34,867 x 24,148
= 841,? million raw pair opportunities
after core absorption ~728.47M residual pairs
local candidates 2,820,023
combined candidates 2,824,632
exact output 208,183
wall ~22.99 s
SHA-256
73703d49cc5af2af10cf3862001d78abc9daa0bfdf2118f64c66f67b2c32e00e
```

The exact raw count is mechanically recorded in the JSON companion.

## Repeated local restricted-image wall

The following tested routes did not close inside their bounded runs:

- `f0 x f1`: after first core absorption, residual rectangle `62,179 x 29,512 = 1,835,029,? pairs`; projection-tree local evaluator exceeded 180 s.
- the same absorbed `f0 x f1` residual rectangle under a five-worker flat local-skyline evaluator exceeded 240 s.
- `(f1 x f2) x f3`: after absorption, residual rectangle `129,662 x 56,605`; indexed local phase exceeded 240 s.
- `(f1 x f2) x f0`: after absorption, residual rectangle `102,950 x 73,215`; indexed local phase exceeded 240 s.
- `f0 x f3`: after absorption, residual rectangle `60,097 x 53,185`; indexed local phase exceeded 240 s.

No semantic result is taken from a timed-out route.

Repeated core-relative absorption on the first residual rectangle reaches a fixed point immediately: no additional rows or columns become absorbable after the first exact reduction.

## Preflight evidence

For the absorbed `f0 x f1` residual factors:

```text
A = 62,179
B = 29,512
```

Projection-tree hash samples estimate roughly 137–145 seconds serial local work depending on orientation, but deterministic extreme probes expose large rare projections:

```text
A -> B width 13,954 on one near-envelope outer
B -> A width 54,847 / 62,179 on the nearest tested outer
```

Flat local-skyline samples likewise project hundreds of seconds of serial local work.

The bounded full runs demonstrate that these inexpensive estimates still understate the tail sufficiently to be unsafe as a completion forecast.

## Disposition

The descent has not returned to the old global-normalization or principal-cover-preimage walls.

The active operation is again:

```text
P_B(a) = Max({ a AND b | b in B })
```

for a static exact inner antichain B and many outer masks a.

Core-relative absorption, factor-order selection, projection-tree pruning, flat streaming, static global normalization and shared-target cofactor-cover DP are already being applied where qualified.

Continuing to permute factor order or swap the same local evaluators would now be circular.

The next research step must improve or reformulate local restricted-image evaluation itself while preserving exact stream identity.

The first missing rank27 child remains unresolved; rank26 draw16 is therefore not yet composable.

Frozen authority 1.1 is unchanged. The proof/value bridge remains a separate OPEN side seam.
