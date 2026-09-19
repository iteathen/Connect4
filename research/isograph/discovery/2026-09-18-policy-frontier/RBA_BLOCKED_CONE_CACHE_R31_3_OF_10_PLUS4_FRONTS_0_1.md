# RBA blocked-cone cache checkpoint — rank31 3/10 + fourth support fronts

**Date:** 2026-09-19  
**Canonical branch:** `research/semantic-quotient`  
**Status:** crash-safe execution checkpoint  
**Authority effect:** none

## Third rank31 support closed

```text
support [4,3,4,2,6,6,6]
rank 31
residual shapes 28
transformed bits 56

Upper 4,431
Lower 19,652

Upper SHA-256
0d5a2d0c39a8ceb68c89761ce50cc29f9d025bbe6aff440f88f96fb9df85f2f3

Lower SHA-256
b6f9372c21238879a8bb91abf0be6ed26c29a2da1614e7e1aa364e135c8b64e1

support wall ~7.66 s
```

Its three Lower products all closed inside the ordinary staged runner; the largest final product was:

```text
16,018 x 2,703
raw 43,296,654
after absorption 4,781 x 2,703
local candidates 95,787
exact output 19,652
total ~3.80 s
```

## Fourth rank31 support in progress

```text
support [4,4,2,3,6,6,6]
rank 31
```

All fixed-action fronts and state Upper are persisted.

| column | Upper | Lower | Upper SHA-256 | Lower SHA-256 |
|---:|---:|---:|---|---|
| 0 | 4,718 | 7,673 | 7de9f0a07575c954e2b83ed4769140a1a4577b3d9c13e3bf3fe2e2d5e5b65336 | a5ccda05af212085bbef783b0f117c9e3479474fdd250bbfefb337cbbe0cb40a |
| 1 | 3,905 | 5,546 | ab139124c28f436757ed226299deb140a49253ab93a3e2639c34f77a27d0bc34 | d5b785e8ee0dbc028a39bf5e60938b66e3a9f46c8c6be550b104c63a4a7920b6 |
| 2 | 2,557 | 5,032 | 1a4ea95555fc6785683dd72a56817499792878a9598a9ce640af3f8761f560cf | 1c842e2cc116563fe44abc110b68ba2da13f8541a9f11bacbb089710ed42a90d |
| 3 | 1,644 | 3,017 | 45281b19fb0adf8357a8c5c5667a9e690bc7136717429f5303b484a487ac8105 | 819aa8e09a3d7a9bedc8df6c514eded056d34fc542eb7b3c9810b1b20dc83852 |

Normalized state Upper:

```text
11,066
SHA-256
354ceffa1513bc283cffc64df2e636fc6268c60e08fa81c1dd5b913d5c297848
```

The bounded continuation entered first Lower product:

```text
7,673 x 5,546
```

and ended before an exact P1 stream was persisted.

## Rank31 progress

Closed:

```text
1. [4,3,2,4,6,6,6]  U 6,714   L 34,844
2. [4,3,3,3,6,6,6]  U 11,097  L 67,483
3. [4,3,4,2,6,6,6]  U 4,431   L 19,652
```

Seven rank31 supports remain.

## Recovery archive

```text
rba-block-cache-through-r31-3of10-plus4actions.tar.gz
SHA-256
a998f2971a73369a99437ca043c03dee76cda35b9dde3b111ecfe226e664f3ca
size ~3.2 MiB
```

Next: isolate the fourth support's first product `7,673 x 5,546` at local/global phase boundaries. Persist P1 before resuming the support.
