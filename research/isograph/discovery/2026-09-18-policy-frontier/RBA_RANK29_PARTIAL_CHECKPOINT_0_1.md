# RBA rank-29 partial frontier checkpoint 0.1

**Date:** 2026-09-18
**Canonical branch:** `research/semantic-quotient`
**Recovered live head before this checkpoint:** `e8ecedf96dd2c1de5d6a953b79d8ae409fb90439`
**Status:** partial exact native recurrence result; root not yet closed
**Authority effect:** none
**Research direction:** Josh Oshiro

## Purpose

Preserve the exact continuation seam after widening the transformed q-state representation beyond one 64-bit word.

## 128-bit widening qualification

Coordinate residual-upset masks remain within one uint64 word. The transformed two-coordinate q-state mask is widened to `unsigned __int128`.

The widened engine independently reproduced the already-qualified controls:

- rank-33 `[5,5,2,3,6,6,6]`: exact Upper/Lower boundary match;
- difficult rank-32 `[4,5,2,3,6,6,6]`: exact Upper/Lower boundary match.

Therefore the representation widening is not the current semantic uncertainty.

## Rank-29 target

```text
support [3,5,2,1,6,6,6]
rank 29
residual shapes 33
transformed state bits 66
remaining cells 13
```

Its four rank-30 children were cached independently, including root-only composition of the two children that had not previously been persisted.

## Closed rank-29 prefix

The root recurrence closes exactly through:

```text
loss2:
    Upper 1
    Lower 4

loss4:
    Upper 6
    Lower 16

loss6:
    Upper 26
    Lower 160

loss8:
    Upper 223
    Lower 2,114

loss10:
    Upper 2,262
    Lower 16,787

loss12:
    Upper 18,399
    Lower 44,864
```

The `loss12` universal products include:

```text
7,978 x 14,260
    113,766,280 raw
    -> 156,703 local candidates
    -> 31,599 output

31,599 x 2,713
    85,728,087 raw
    -> 313,280 local candidates
    -> 44,258 output

44,258 x 13,831
    612,132,398 raw
    -> 927,575 local candidates
    -> 44,864 output
```

## Current draw13 seam

State Upper is already closed:

```text
Upper(draw13) = 47,472
```

The four exact fixed-action Lower frontiers are:

```text
30,430
31,397
8,821
41,133
```

First universal multiplication:

```text
30,430 x 31,397
    955,410,710 raw
    -> 664,276 local candidates
    -> 92,989 exact generators
```

Second multiplication:

```text
92,989 x 8,821
    820,255,969 raw opportunities
```

The serial local-skyline implementation was the first bounded-run wall.

The exact operands were isolated and a 5-core parallel streaming local-skyline pass closed it:

```text
820,255,969 raw
-> 1,537,353 local-skyline candidates
-> 1,300,443 distinct
-> 662,796 after same-mover absorption
-> 401,440 after same-opponent absorption
-> 131,121 exact generators

parallel local generation ~2.32 s
global absorption         ~4.04 s
total                     ~6.38 s
```

So the first rank-29 wall was serial throughput, not algebraic closure.

## Current exact next product

The remaining `draw13` multiplication is now:

```text
131,121 x 41,133
= 5,393,996,493 raw pair opportunities
```

Orientation sampling indicates:

```text
outer 131,121 / inner 41,133:
    estimated local candidates ~16.7M
    estimated serial local time ~317 s

outer 41,133 / inner 131,121:
    estimated local candidates ~6.8M
    estimated serial local time ~166 s
```

The second orientation is currently preferred. This product is the exact continuation seam.

## Current interpretation

The rank-29 frontier is now a genuine scaling test of sparse semiring multiplication, not a representation-width failure and not a missing Bellman law.

Do not restart from rank 30.

Do not rebuild descendants.

Resume from:

```text
draw13
current exact boundary = 131,121 generators
next action Lower       = 41,133 generators
product                 = 5.394B raw opportunities
preferred orientation   = 41,133 outer / 131,121 inner
```

Try parallel/output-sensitive local skyline first.

## Epistemic disposition

```text
128-bit widening semantics          QUALIFIED ON EXISTING CONTROLS
rank29 loss2..loss12                CLOSED
rank29 draw13 Upper                 CLOSED
draw13 first product                CLOSED
draw13 second product               CLOSED
draw13 final product                OPEN
empty root solved                   NO
authority 1.1 mutated               NO
typed relation promoted             NO
```
